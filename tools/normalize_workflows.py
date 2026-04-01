from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _split_types(value):
    if not value:
        return set()
    return {part.strip() for part in str(value).split(",") if part.strip()}


def _types_compatible(source_type, input_type):
    source_parts = _split_types(source_type)
    input_parts = _split_types(input_type)
    if not source_parts or not input_parts:
        return True
    return not source_parts.isdisjoint(input_parts)


def _dedupe_preserve_order(values):
    seen = set()
    result = []
    for value in values or []:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _workflow_paths():
    paths = [ROOT / "LTX-2.3_Image_To_Video_Motion_Transfer.json"]
    for folder in ("workflows", "workflows-new"):
        workflow_dir = ROOT / folder
        if workflow_dir.is_dir():
            paths.extend(sorted(workflow_dir.glob("*.json")))
    return paths


def _valid_slot(node, slot_index, kind):
    items = node.get(kind) or []
    return isinstance(slot_index, int) and 0 <= slot_index < len(items)


def normalize_workflow(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    nodes = data.get("nodes", [])
    node_by_id = {node.get("id"): node for node in nodes if "id" in node}

    max_link_id = 0
    for link in data.get("links", []):
        if isinstance(link, list) and link and isinstance(link[0], int):
            max_link_id = max(max_link_id, link[0])

    original_output_order = {}
    sources_by_link = defaultdict(list)

    for node in nodes:
        for output_index, output in enumerate(node.get("outputs") or []):
            deduped_links = _dedupe_preserve_order(output.get("links") or [])
            output["links"] = deduped_links
            original_output_order[(node["id"], output_index)] = list(deduped_links)
            for link_id in deduped_links:
                max_link_id = max(max_link_id, int(link_id))
                sources_by_link[link_id].append(
                    {
                        "src_node": node["id"],
                        "src_slot": output_index,
                        "src_type": output.get("type"),
                    }
                )

    top_links_by_dest = defaultdict(list)
    for link in data.get("links", []):
        if not isinstance(link, list) or len(link) < 6:
            continue
        link_id, src_node, src_slot, dst_node, dst_slot, link_type = link[:6]
        if not isinstance(link_id, int):
            continue
        max_link_id = max(max_link_id, link_id)
        source_node = node_by_id.get(src_node)
        target_node = node_by_id.get(dst_node)
        if source_node is None or target_node is None:
            continue
        if not _valid_slot(source_node, src_slot, "outputs"):
            continue
        if not _valid_slot(target_node, dst_slot, "inputs"):
            continue
        top_links_by_dest[(dst_node, dst_slot)].append(
            {
                "id": link_id,
                "src_node": src_node,
                "src_slot": src_slot,
                "link_type": link_type,
            }
        )

    pending_connections = []
    unresolved_inputs = []
    exact_match_count = 0
    inferred_match_count = 0

    for node in nodes:
        for input_index, input_def in enumerate(node.get("inputs") or []):
            current_link_id = input_def.get("link")
            if current_link_id is None:
                continue

            if not isinstance(current_link_id, int):
                unresolved_inputs.append((node["id"], input_index))
                input_def["link"] = None
                continue

            max_link_id = max(max_link_id, current_link_id)
            input_type = input_def.get("type")

            source_candidates = []
            seen_sources = set()
            for candidate in sources_by_link.get(current_link_id, []):
                source_key = (candidate["src_node"], candidate["src_slot"])
                if source_key in seen_sources:
                    continue
                seen_sources.add(source_key)
                source_candidates.append(candidate)

            if len(source_candidates) > 1:
                compatible_sources = [
                    candidate
                    for candidate in source_candidates
                    if _types_compatible(candidate.get("src_type"), input_type)
                ]
                if compatible_sources:
                    source_candidates = compatible_sources

            chosen_source = None
            if len(source_candidates) == 1:
                chosen_source = source_candidates[0]
                exact_match_count += 1
            else:
                top_candidates = list(top_links_by_dest.get((node["id"], input_index), []))
                if len(top_candidates) > 1:
                    matching_id = [
                        candidate for candidate in top_candidates if candidate["id"] == current_link_id
                    ]
                    compatible_candidates = [
                        candidate
                        for candidate in top_candidates
                        if _types_compatible(candidate.get("link_type"), input_type)
                    ]
                    if matching_id:
                        top_candidates = matching_id
                    elif compatible_candidates:
                        top_candidates = compatible_candidates
                if top_candidates:
                    chosen_source = {
                        "src_node": top_candidates[0]["src_node"],
                        "src_slot": top_candidates[0]["src_slot"],
                        "src_type": node_by_id[top_candidates[0]["src_node"]]["outputs"][top_candidates[0]["src_slot"]].get(
                            "type"
                        ),
                    }
                    inferred_match_count += 1

            if chosen_source is None:
                unresolved_inputs.append((node["id"], input_index))
                input_def["link"] = None
                continue

            exact_top_match_ids = [
                candidate["id"]
                for candidate in top_links_by_dest.get((node["id"], input_index), [])
                if candidate["src_node"] == chosen_source["src_node"]
                and candidate["src_slot"] == chosen_source["src_slot"]
            ]

            pending_connections.append(
                {
                    "dst_node": node["id"],
                    "dst_slot": input_index,
                    "src_node": chosen_source["src_node"],
                    "src_slot": chosen_source["src_slot"],
                    "link_type": chosen_source.get("src_type") or input_type,
                    "current_link_id": current_link_id,
                    "preferred_top_ids": _dedupe_preserve_order(exact_top_match_ids),
                }
            )

    pending_connections.sort(
        key=lambda item: (
            0 if item["preferred_top_ids"] else 1,
            item["dst_node"],
            item["dst_slot"],
        )
    )

    used_link_ids = set()
    new_links = []
    connections_by_source = defaultdict(list)

    for connection in pending_connections:
        preferred_ids = []
        current_link_id = connection["current_link_id"]
        if current_link_id is not None:
            preferred_ids.append(current_link_id)
        for candidate_id in connection["preferred_top_ids"]:
            if candidate_id not in preferred_ids:
                preferred_ids.append(candidate_id)

        assigned_link_id = None
        for candidate_id in preferred_ids:
            if candidate_id in used_link_ids:
                continue
            assigned_link_id = candidate_id
            break
        if assigned_link_id is None:
            max_link_id += 1
            assigned_link_id = max_link_id

        used_link_ids.add(assigned_link_id)
        node_by_id[connection["dst_node"]]["inputs"][connection["dst_slot"]]["link"] = assigned_link_id
        connections_by_source[(connection["src_node"], connection["src_slot"])].append(assigned_link_id)
        new_links.append(
            [
                assigned_link_id,
                connection["src_node"],
                connection["src_slot"],
                connection["dst_node"],
                connection["dst_slot"],
                connection["link_type"],
            ]
        )

    for node in nodes:
        for input_def in node.get("inputs") or []:
            link_id = input_def.get("link")
            if link_id is not None and link_id not in used_link_ids:
                input_def["link"] = None

    for node in nodes:
        for output_index, output in enumerate(node.get("outputs") or []):
            source_key = (node["id"], output_index)
            output_links = connections_by_source.get(source_key, [])
            original_order = original_output_order.get(source_key, [])
            order_index = {link_id: index for index, link_id in enumerate(original_order)}
            output["links"] = sorted(
                output_links,
                key=lambda link_id: (order_index.get(link_id, len(order_index)), link_id),
            )

    data["links"] = sorted(new_links, key=lambda item: item[0])
    data["last_node_id"] = max((node["id"] for node in nodes), default=0)
    data["last_link_id"] = max((link[0] for link in data["links"]), default=0)

    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    return {
        "connections": len(new_links),
        "unresolved_inputs": unresolved_inputs,
        "exact_match_count": exact_match_count,
        "inferred_match_count": inferred_match_count,
    }


def main():
    for workflow_path in _workflow_paths():
        result = normalize_workflow(workflow_path)
        unresolved = len(result["unresolved_inputs"])
        print(
            f"{workflow_path.relative_to(ROOT)}: connections={result['connections']} "
            f"exact={result['exact_match_count']} inferred={result['inferred_match_count']} "
            f"unresolved={unresolved}"
        )
        for node_id, input_index in result["unresolved_inputs"][:10]:
            print(f"  unresolved input node={node_id} slot={input_index}")
        if unresolved > 10:
            print(f"  ... {unresolved - 10} more unresolved inputs")


if __name__ == "__main__":
    main()
