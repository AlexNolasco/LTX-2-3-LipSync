# Workflow Guide

## Choose A Workflow

Use this quick guide to decide which workflow to open.

## Audio Range Lip Sync

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_audio_range_lipsync_reimport.json`

Use it when:
- You want to test lip sync on a short slice before rendering a full track
- You only need one selected time range from a longer song or voice recording

Best for:
- Fast iteration
- Prompt testing
- Reference image testing

## Segmented Audio Loop

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_segmented_audio_reimport.json`

Use it when:
- One image should drive a long render
- You want the system to split long audio and continue rendering automatically

Best for:
- Long dialogue
- Full-song lip sync with one main visual

## Segmented Audio First/Last

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_segmented_audio_first_last_reimport.json`

Use it when:
- You want stronger control over the opening and ending look of each segment
- You want first-frame and last-frame guidance in the segmented pipeline

Best for:
- More controlled visual continuity
- Structured shots with defined start and end poses

## Storyboard Song Looper

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_storyboard_song_looper_reimport.json`

Use it when:
- You want to rotate through several images across a full track
- Each image should stay on screen for a fixed duration

Best for:
- Slideshows
- Character changes by scene
- Duration-driven visuals

## Storyboard Song Looper With Per-Image Prompts

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_storyboard_song_looper_per_image_prompts_reimport.json`

Use it when:
- Each storyboard image needs its own prompt
- Prompt changes should follow image changes automatically

Best for:
- Scene-by-scene prompt variation
- Character or environment changes across segments

## Waveform Storyboard Song Looper

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_waveform_storyboard_song_looper_reimport.json`

Use it when:
- Image changes should align to beat markers, phrasing, or spoken timing
- You want to place segment boundaries directly on the waveform

Best for:
- Music timing
- Beat edits
- Voice-driven scene changes

## Waveform Storyboard With Per-Image Prompts

File:
`workflows/geekatplay_studio_ltx_2_3_ia2v_waveform_storyboard_song_looper_per_image_prompts_reimport.json`

Use it when:
- You need both waveform timing and unique prompts per segment

Best for:
- Music videos
- Multi-scene storytelling
- Beat-synced prompt changes

## First/Last Frame Workflows

Files:
- `workflows/geekatplay_studio_ltx_2_3_first_last_simple_reimport.json`
- `workflows/geekatplay_studio_ltx_2_3_first_last_motion_track_reimport.json`

Use them when:
- You are building silent motion-controlled shots
- You need strong start-frame and end-frame guidance

Best for:
- Motion experiments
- Controlled transitions
- First/last-frame look development

## Practical Advice

- Start with audio range lip sync for testing.
- Move to segmented audio when the full track is stable.
- Move to storyboard or waveform workflows only after the base render settings are working.
- Use waveform workflows when timing matters more than fixed durations.
- Use per-image prompt workflows only when you actually need prompt changes between images.