import { app } from "../../scripts/app.js";

const TARGET_CLASS = "LTXMotionStoryboardPromptSelector";
const PROMPT_PREFIX = "prompt_";
const MIN_PROMPT_COUNT = 1;
const MAX_PROMPT_COUNT = 32;
const MIN_NODE_WIDTH = 700;
const MIN_ROW_HEIGHT = 108;
const DEFAULT_WIDGET_HEIGHT = 24;
const NODE_VERTICAL_PADDING = 96;
const SCHEDULER_TYPES = new Set([
    "LTXMotionStoryboardSegmentSelector",
    "LTXMotionStoryboardPairSelector",
    "LTXMotionStoryboardSegmentPromptSelector",
    "LTXMotionWaveformStoryboardSelector",
    "LTXMotionWaveformStoryboardPairSelector",
]);

const PAIR_SCHEDULER_TYPES = new Set([
    "LTXMotionStoryboardPairSelector",
    "LTXMotionWaveformStoryboardPairSelector",
]);

function getGraphLink(graph, linkId) {
    if (!graph || linkId == null) {
        return null;
    }
    if (graph.links && typeof graph.links === "object") {
        return graph.links[linkId] ?? null;
    }
    return null;
}

function getNodeById(graph, nodeId) {
    if (!graph || nodeId == null) {
        return null;
    }
    if (typeof graph.getNodeById === "function") {
        return graph.getNodeById(nodeId);
    }
    return graph._nodes_by_id?.[nodeId] ?? null;
}

function getPromptIndex(name) {
    return Number.parseInt(String(name).slice(PROMPT_PREFIX.length), 10);
}

function getWidget(node, name) {
    return (node.widgets || []).find((widget) => widget?.name === name);
}

function getPromptWidgets(node) {
    return (node.widgets || [])
        .filter((widget) => widget?.name?.startsWith(PROMPT_PREFIX))
        .sort((left, right) => getPromptIndex(left.name) - getPromptIndex(right.name));
}

function getPromptCountWidget(node) {
    return getWidget(node, "prompt_count");
}

function clampPromptCount(value) {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric)) {
        return MIN_PROMPT_COUNT;
    }
    return Math.min(MAX_PROMPT_COUNT, Math.max(MIN_PROMPT_COUNT, numeric));
}

function readSchedulerPromptCount(originNode) {
    if (!originNode) {
        return null;
    }
    if (!SCHEDULER_TYPES.has(originNode.type)) {
        return null;
    }

    const liveWidgetValue = getWidget(originNode, "image_count")?.value;
    const widgetValues = Array.isArray(originNode.widgets_values) ? originNode.widgets_values : [];
    let storedWidgetValue = null;
    if (originNode.type === "LTXMotionWaveformStoryboardSelector") {
        storedWidgetValue = widgetValues[1];
    } else {
        storedWidgetValue = widgetValues[0];
    }

    const value = liveWidgetValue ?? storedWidgetValue;
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric)) {
        return null;
    }
    const promptCount = PAIR_SCHEDULER_TYPES.has(originNode.type)
        ? Math.max(MIN_PROMPT_COUNT, numeric - 1)
        : numeric;
    return clampPromptCount(promptCount);
}

function getSynchronizedPromptCount(node) {
    const currentSegmentInput = (node.inputs || []).find((input) => input?.name === "current_segment");
    const currentSegmentLink = getGraphLink(app.graph, currentSegmentInput?.link);
    const originNode = getNodeById(app.graph, currentSegmentLink?.origin_id);
    const schedulerCount = readSchedulerPromptCount(originNode);
    if (schedulerCount != null) {
        return schedulerCount;
    }

    const segmentCountInput = (node.inputs || []).find((input) => input?.name === "segment_count");
    const segmentCountLink = getGraphLink(app.graph, segmentCountInput?.link);
    const segmentOriginNode = getNodeById(app.graph, segmentCountLink?.origin_id);
    return readSchedulerPromptCount(segmentOriginNode);
}

function getHideTargets(widget, collapseGrandparent = false) {
    const element = widget?.inputEl || widget?.element || widget?.el;
    if (!element) {
        return [];
    }

    const targets = [element, element.parentElement];
    if (collapseGrandparent) {
        targets.push(element.parentElement?.parentElement);
    }
    return targets.filter((target, index, array) => target && array.indexOf(target) === index);
}

function hideWidget(widget, options = {}) {
    if (!widget || widget.__ltxPromptHidden) {
        return;
    }

    widget.__ltxPromptOriginalType = widget.type;
    widget.__ltxPromptOriginalHidden = widget.hidden;
    widget.__ltxPromptOriginalDisabled = widget.disabled;
    widget.__ltxPromptOriginalComputeSize = widget.computeSize;
    widget.__ltxPromptOriginalSerializeValue = widget.serializeValue;

    const hideTargets = getHideTargets(widget, options.collapseGrandparent === true);
    if (hideTargets.length) {
        widget.__ltxPromptHideTargets = hideTargets.map((target) => ({
            target,
            cssText: target?.style?.cssText ?? "",
        }));
        for (const { target } of widget.__ltxPromptHideTargets) {
            if (!target?.style) {
                continue;
            }
            target.style.display = "none";
            target.style.visibility = "hidden";
            target.style.height = "0";
            target.style.minHeight = "0";
            target.style.maxHeight = "0";
            target.style.margin = "0";
            target.style.padding = "0";
            target.style.border = "0";
            target.style.overflow = "hidden";
            target.style.pointerEvents = "none";
        }
    }

    widget.type = "hidden";
    widget.hidden = true;
    widget.disabled = true;
    widget.computeSize = () => [0, 0];
    widget.serializeValue = () => widget.value;
    widget.__ltxPromptHidden = true;
}

function showWidget(widget) {
    if (!widget || !widget.__ltxPromptHidden) {
        return;
    }

    widget.type = widget.__ltxPromptOriginalType;
    widget.hidden = widget.__ltxPromptOriginalHidden ?? false;
    widget.disabled = widget.__ltxPromptOriginalDisabled ?? false;
    widget.computeSize = widget.__ltxPromptOriginalComputeSize;
    widget.serializeValue = widget.__ltxPromptOriginalSerializeValue;

    if (Array.isArray(widget.__ltxPromptHideTargets)) {
        for (const { target, cssText } of widget.__ltxPromptHideTargets) {
            if (!target?.style) {
                continue;
            }
            target.style.cssText = cssText ?? "";
        }
    }

    widget.__ltxPromptHidden = false;
}

function getVisibleWidgetHeight(node) {
    const width = Math.max(MIN_NODE_WIDTH, Array.isArray(node.size) ? node.size[0] : MIN_NODE_WIDTH) - 20;
    return (node.widgets || []).reduce((total, widget) => {
        if (!widget || widget.type === "hidden" || widget.__ltxPromptHidden) {
            return total;
        }

        const computed = widget.computeSize?.(width);
        const height = Math.max(0, computed?.[1] ?? DEFAULT_WIDGET_HEIGHT);
        return total + height + 4;
    }, 0);
}

function resizeNode(node, promptCount) {
    const computedSize = node.computeSize?.();
    const width = Math.max(MIN_NODE_WIDTH, computedSize?.[0] ?? 0, Array.isArray(node.size) ? node.size[0] : 0);
    const editorHeight = 120 + (promptCount * MIN_ROW_HEIGHT);
    const visibleWidgetHeight = getVisibleWidgetHeight(node) + NODE_VERTICAL_PADDING;
    const height = Math.max(editorHeight, visibleWidgetHeight, computedSize?.[1] ?? 0);
    if (typeof node.setSize === "function") {
        node.setSize([width, height]);
    } else {
        node.size = [width, height];
    }
    node.setDirtyCanvas?.(true, true);
    app.graph.setDirtyCanvas(true, true);
}

function buildEditor(node) {
    if (node.__ltxPromptEditor) {
        return node.__ltxPromptEditor;
    }
    const editor = {
        useDomEditor: false,
    };

    node.__ltxPromptEditor = editor;
    return editor;
}

function syncEditor(node, force = false) {
    const editor = buildEditor(node);
    const currentSegmentWidget = getWidget(node, "current_segment");
    const segmentCountWidget = getWidget(node, "segment_count");
    const promptCountWidget = getPromptCountWidget(node);
    const synchronizedPromptCount = getSynchronizedPromptCount(node);
    const promptCount = synchronizedPromptCount ?? clampPromptCount(promptCountWidget?.value ?? MIN_PROMPT_COUNT);
    const stateKey = `${promptCount}:${synchronizedPromptCount != null ? "synced" : "manual"}`;

    if (!force && node.__ltxPromptStateKey === stateKey) {
        return;
    }
    node.__ltxPromptStateKey = stateKey;
    node.__ltxPromptVisibleCount = promptCount;

    hideWidget(currentSegmentWidget, { collapseGrandparent: true });
    hideWidget(segmentCountWidget, { collapseGrandparent: true });

    const promptWidgets = getPromptWidgets(node);
    if (synchronizedPromptCount != null) {
        hideWidget(promptCountWidget, { collapseGrandparent: true });
    } else {
        showWidget(promptCountWidget);
    }
    if (promptCountWidget?.inputEl) {
        promptCountWidget.inputEl.disabled = false;
        promptCountWidget.inputEl.title = synchronizedPromptCount != null
            ? "Prompt count is synced from the connected storyboard or waveform scheduler"
            : "Manual prompt count";
    }
    for (const widget of promptWidgets) {
        const index = getPromptIndex(widget.name);
        if (index <= promptCount) {
            showWidget(widget);
        } else {
            hideWidget(widget);
        }
    }

    if (promptCountWidget) {
        promptCountWidget.value = promptCount;
    }

    resizeNode(node, promptCount);
}

app.registerExtension({
    name: "LTX23Motion.StoryboardPromptSelector",
    async beforeRegisterNodeDef(nodeType) {
        if (nodeType.comfyClass !== TARGET_CLASS) {
            return;
        }

        const originalOnConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const result = originalOnConfigure?.apply(this, arguments);
            syncEditor(this, true);
            return result;
        };

        const originalOnConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function () {
            const result = originalOnConnectionsChange?.apply(this, arguments);
            syncEditor(this, true);
            return result;
        };

        const originalOnDrawForeground = nodeType.prototype.onDrawForeground;
        nodeType.prototype.onDrawForeground = function () {
            const result = originalOnDrawForeground?.apply(this, arguments);
            syncEditor(this, false);
            return result;
        };
    },
    async nodeCreated(node) {
        if (node.comfyClass !== TARGET_CLASS) {
            return;
        }
        syncEditor(node, true);
    },
});