# Geekatplay Studio LTX 2.3 Lip Sync

ComfyUI custom nodes and production workflows for LTX 2.3 image-to-video lip sync, storyboard scheduling, segmented audio rendering, and waveform-driven timing.

This repository is designed to be placed inside `ComfyUI/custom_nodes/`.

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

## Custom Nodes

The main nodes added by this package are:

- `LTX Motion Storyboard Segment Selector`
- `LTX Motion Waveform Storyboard Selector`
- `LTX Motion Storyboard Prompt Selector`
- `LTX Motion Audio Segment Loop`
- Audio range and segmented-audio helper nodes

These nodes are built to work with the included workflows but can also be reused in custom ComfyUI graphs.

## Notes

- Waveform storyboard segments follow the exact interval between keyframes.
- Storyboard and waveform workflows require `ffmpeg` for final segment merging.
- The installer can also merge Gemma shard files when needed.

## License

This project is released under the MIT License. See `LICENSE`.