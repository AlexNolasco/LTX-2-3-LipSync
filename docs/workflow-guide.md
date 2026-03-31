# Workflow Guide

## Choose A Workflow

This pack ships a small set of base workflows plus loop-capable GAP workflows for songs, dialogue, storyboard timing, first/last transitions, and sparse motion tracks.

## Shared Building Blocks

- `LoadAudio`: loads the source song or dialogue clip.
- `Song Range Selector`: limits the active render window. `start_time` and `end_time` pick the window. `use_loaded_audio` keeps the selected source audio. Turn it off for silent time-only rendering.
- `Storyboard Scheduler Dynamic`: rotates one storyboard image at a time across fixed durations.
- `Storyboard First/Last Scheduler`: rotates overlapping image pairs across fixed durations. With connected images `1, 2, 3`, the pair loop is `1->2`, then `2->3`, then `3->1`.
- `Storyboard Prompts`: selects the positive prompt text for the current segment. Only raise the prompt count when prompts should change between segments.
- `Segment Frame Count`: converts duration and FPS into a valid latent length for LTX.
- `LTXMotionAudioSegmentLoop`: saves each segment, increments the current segment index, and requeues the next pass until the selected window is complete.

## Short Test Workflow

File:
`workflows/gap_ltx23_lipsync_range_stop.json`

How it works:
- Renders one selected audio slice instead of a full song.
- Good for validating prompt, lip sync, image choice, and model loading.

What to change:
- Set the source image.
- Set the audio range.
- Keep the range short until the look is stable.

## Long Audio Single Image

File:
`workflows/gap_ltx23_lipsync_long_audio.json`

How it works:
- Splits a long clip into renderable segments.
- Reuses one image across the full track.

What to change:
- Replace the source image.
- Adjust FPS and frame count conservatively.

## Long Audio First/Last

File:
`workflows/gap_ltx23_lipsync_long_audio_first_last.json`

How it works:
- Keeps the segmented long-audio loop.
- Adds first-frame and last-frame guidance to each segment.

What to change:
- Load the first and last frame images.
- Tune only one control at a time if motion becomes unstable.

## Long Audio Storyboard

File:
`workflows/gap_ltx23_lipsync_long_audio_storyboard.json`

How it works:
- Uses the long-audio loop path.
- Rotates one storyboard image per segment instead of reusing a single image.

What to change:
- Connect the storyboard images you want to use.
- Set image timing through the scheduler durations.

## Storyboard Lip Sync

File:
`workflows/gap_ltx23_storyboard_lipsync.json`

How it works:
- Uses `Storyboard Scheduler Dynamic` to hold one image per timed slot.
- Final audio is model-decoded from the latent path.

What to change:
- Set `image_count` and connect that many storyboard images.
- Adjust per-slot durations to control how long each image stays active.

## Storyboard Lip Sync With Original Music

File:
`workflows/gap_ltx23_storyboard_lipsync_music.json`

How it works:
- Same image timing as the plain storyboard workflow.
- Final video keeps the selected source music instead of the decoded latent audio.

What to change:
- Use this variant when timing is right but the soundtrack must stay unchanged.

## Storyboard First/Last

File:
`workflows/gap_ltx23_storyboard_first_last.json`

How it works:
- Uses `Storyboard First/Last Scheduler` to animate overlapping image pairs.
- `Storyboard Prompts` feeds the active positive prompt text into `CLIPTextEncode` for each segment.
- Final audio is model-decoded from the latent path.

What to change:
- Connect two or more storyboard images.
- Set `image_count` and durations.
- Add one prompt per segment if the scene description should change across the loop.

## Storyboard First/Last With Original Music

File:
`workflows/gap_ltx23_storyboard_first_last_music.json`

How it works:
- Same overlapping first/last pair motion as the plain version.
- Keeps the selected source song in the saved file.

What to change:
- Use when the motion works but the final soundtrack must match the original audio exactly.

## Storyboard First/Last Range Stop

File:
`workflows/gap_ltx23_storyboard_first_last_lipsync_range_stop.json`

How it works:
- Same pair-based storyboard motion as the standard first/last workflow.
- Restricts the render to a selected `start_time` and `end_time` window.

What to change:
- Use short ranges for testing.
- Once stable, move to the full-range first/last workflow.

## Motion Track Looper

File:
`workflows/gap_ltx23_first_last_motion_track_looper.json`

How it works:
- Extends the motion-track first/last workflow with the same audio-range and segment-loop automation.
- `Storyboard First/Last Scheduler` swaps the active start and end images between segments.
- Sparse motion path editing still happens in `LTXVSparseTrackEditor`.

What to change:
- Edit the sparse paths first.
- Use two connected images for alternating `1->2`, `2->1` loops, or add more images for a longer cycle.
- Turn off `use_loaded_audio` when you want motion-track looping by time only.

## Cleaner FLF2V Storyboard Looper

File:
`workflows/gap_ltx23_flf2v_storyboard_first_last_looper.json`

How it works:
- Built from the cleaner `video_ltx2_3_flf2v.json` render path.
- Uses `Song Range Selector`, `Storyboard First/Last Scheduler`, `Storyboard Prompts`, and `LTXMotionAudioSegmentLoop` together.
- Best choice when you want the cleaner FLF2V render path plus storyboard first/last looping.

What to change:
- Set the render window in `Song Range Selector`.
- Connect the storyboard images you want to cycle.
- Fill `Storyboard Prompts` if the prompt should change by segment.

## Base Reference Graphs

Files:
- `workflows/gap_ltx23_first_last_base.json`
- `workflows/gap_ltx23_first_last_only_simple.json`
- `workflows/gap_ltx23_first_last_only_motion_track.json`
- `workflows/video_ltx2_3_flf2v.json`

Use them when:
- You want a clean reference before adding loop automation.
- You are comparing output quality against the looped variants.

## Practical Advice

- Start with `gap_ltx23_lipsync_range_stop.json`.
- Move to a long-audio or storyboard workflow only after your prompt and model setup are stable.
- Use a `*_music.json` workflow when the final soundtrack must stay identical to the source file.
- Use the motion-track looper only after the sparse paths are already behaving well in the non-loop base graph.