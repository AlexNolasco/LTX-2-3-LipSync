# Geekatplay Studio LTX 2.3 Lip Sync

ComfyUI custom nodes and production workflows for LTX 2.3 image-to-video lip sync, storyboard scheduling, segmented audio rendering, and waveform-driven timing.

This repository is designed to be placed inside `ComfyUI/custom_nodes/`.

## What This Pack Does

This pack extends LTX 2.3 with tools for longer-form audio-driven rendering.

- Split long songs or dialogue into renderable chunks
- Reuse one image or rotate storyboard images across the full track
- Time image changes by duration or by waveform keyframes
- Pair prompts to storyboard segments
- Save and requeue segments automatically until the full sequence is finished

If you want a quick starting point, begin with the storyboard or waveform workflows in the `workflows/` folder.

## Quick Start

1. Install this folder into `ComfyUI/custom_nodes/`.
2. Restart ComfyUI.
3. Run `install_ltx23_motion_models.bat` or place the required models manually.
4. Open one of the shipped workflows from `workflows/`.
5. Load your audio, source image, and optional storyboard images.
6. Render a short test first, then run the full loop workflow.

## Included

- Custom nodes for audio slicing, storyboard scheduling, waveform timing, prompt rotation, and render looping
- Windows installer for required LTX 2.3 model files
- Safetensors shard merge utility for Gemma recovery
- Ready-to-use Geekatplay Studio workflows for lip-sync, storyboard, and first/last-frame setups

## Repository Layout

- `__init__.py`: ComfyUI package entry point
- `ltx_motion_audio_segments.py`: custom node implementations
- `js/`: frontend extensions for dynamic storyboard and waveform nodes
- `workflows/`: workflow JSON files
- `install_ltx23_motion_models.bat`: Windows model installer
- `merge_safetensors_shards.py`: safetensors merge helper
- `LTX-2.3_Image_To_Video_Motion_Transfer.json`: motion-transfer base workflow

## Installation

1. Clone or copy this folder into `ComfyUI/custom_nodes/LTX-2-3-LipSync`.
2. Restart ComfyUI.
3. Run `install_ltx23_motion_models.bat` if you want the required checkpoint, LoRAs, and Gemma text encoder downloaded into the correct folders.
4. Ensure `ffmpeg` is available if you plan to use segmented-audio or storyboard loop workflows.

## Required Models

Place these files in your ComfyUI models directories:

- `models/checkpoints/ltx-2.3-22b-dev.safetensors`
- `models/loras/ltx-2.3-22b-distilled-lora-384.safetensors`
- `models/loras/ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors`
- `models/text_encoders/gemma_3_12B_it_fp4_mixed.safetensors`

The workflows use a separate Gemma text encoder. A log such as `no CLIP/text encoder weights in checkpoint` is expected with this setup.

## Workflows

- `workflows/geekatplay_studio_ltx_2_3_ia2v_audio_range_lipsync_reimport.json`: render from a selected audio range
- `workflows/geekatplay_studio_ltx_2_3_ia2v_segmented_audio_reimport.json`: segmented audio lip-sync loop for long audio
- `workflows/geekatplay_studio_ltx_2_3_ia2v_segmented_audio_first_last_reimport.json`: segmented audio with first-frame and last-frame control
- `workflows/geekatplay_studio_ltx_2_3_ia2v_storyboard_song_looper_reimport.json`: duration-based storyboard song looper
- `workflows/geekatplay_studio_ltx_2_3_ia2v_storyboard_song_looper_per_image_prompts_reimport.json`: storyboard looper with per-image prompts
- `workflows/geekatplay_studio_ltx_2_3_ia2v_waveform_storyboard_song_looper_reimport.json`: waveform-timed storyboard looper
- `workflows/geekatplay_studio_ltx_2_3_ia2v_waveform_storyboard_song_looper_per_image_prompts_reimport.json`: waveform storyboard with per-image prompts
- `workflows/geekatplay_studio_ltx_2_3_first_last_simple_reimport.json`: simple first-frame and last-frame guide setup
- `workflows/geekatplay_studio_ltx_2_3_first_last_motion_track_reimport.json`: motion-track plus first/last guide setup

Workflow selection help is in `docs/workflow-guide.md`.

## Recommended Starting Points

- Use `geekatplay_studio_ltx_2_3_ia2v_audio_range_lipsync_reimport.json` for fast lip-sync testing on a short audio range.
- Use `geekatplay_studio_ltx_2_3_ia2v_segmented_audio_reimport.json` when one image should drive a long full-song or long-dialogue render.
- Use `geekatplay_studio_ltx_2_3_ia2v_storyboard_song_looper_reimport.json` when each image should run for a fixed duration.
- Use `geekatplay_studio_ltx_2_3_ia2v_waveform_storyboard_song_looper_reimport.json` when image changes should align to musical beats or spoken timing.
- Use the `per_image_prompts` variants when each storyboard image needs its own text prompt.

## Custom Nodes

The main nodes added by this package are:

- `LTX Motion Storyboard Segment Selector`
- `LTX Motion Waveform Storyboard Selector`
- `LTX Motion Storyboard Prompt Selector`
- `LTX Motion Audio Segment Loop`
- Audio range and segmented-audio helper nodes

These nodes are built to work with the included workflows but can also be reused in custom ComfyUI graphs.

## Runtime Notes

- The workflows use a separate Gemma text encoder, so `no CLIP/text encoder weights in checkpoint` is expected.
- Storyboard and waveform workflows require `ffmpeg` for final segment concatenation.
- Waveform storyboard segments follow the actual interval between keyframes.
- Final output length still depends on your LTX frame count and per-segment render settings.

## Troubleshooting

- If your workflow stops after one segment, verify that the loop node is enabled and that `ffmpeg` is available.
- If prompts do not change with images, use a `per_image_prompts` workflow and confirm the prompt selector is connected to `current_segment`.
- If the waveform editor loads but the song does not preview, verify that the selected audio file exists in ComfyUI input storage and that ComfyUI can read it.
- If model loading warns about missing CLIP weights in the checkpoint, keep the separate Gemma text encoder in place. That warning is normal for this setup.

## Release Notes

Prepared release notes for the current public version are in `docs/release-notes-v1.0.0.md`.

## Notes

- Waveform storyboard segments follow the exact interval between keyframes.
- Storyboard and waveform workflows require `ffmpeg` for final segment merging.
- The installer can also merge Gemma shard files when needed.

## License

This project is released under the MIT License. See `LICENSE`.