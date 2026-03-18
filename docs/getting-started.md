# Getting Started

## Install Location

Place this repository inside:

`ComfyUI/custom_nodes/LTX-2-3-LipSync`

Restart ComfyUI after copying or cloning the folder.

## Required Models

Make sure these files are available in your ComfyUI `models` folders:

- `models/checkpoints/ltx-2.3-22b-dev.safetensors`
- `models/loras/ltx-2.3-22b-distilled-lora-384.safetensors`
- `models/loras/ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors`
- `models/text_encoders/gemma_3_12B_it_fp4_mixed.safetensors`

If you prefer, run `install_ltx23_motion_models.bat` to place the files automatically.

## System Requirements

- A working ComfyUI install with LTX 2.3 support
- `ffmpeg` available on your system for segment merging workflows
- Enough VRAM and disk space for long segmented renders

## First Run Checklist

1. Open `geekatplay_studio_ltx_2_3_ia2v_audio_range_lipsync_reimport.json`.
2. Load a source image.
3. Load a short audio clip or select a short range from a longer clip.
4. Confirm the Gemma text encoder loads correctly.
5. Run a short render to validate that the pipeline works.

After that:

1. Move to a segmented audio workflow for long audio.
2. Move to a storyboard or waveform workflow if you want image rotation.
3. Move to a per-image prompt workflow only when prompt changes between segments are needed.

## Common Setup Mistakes

- Missing `ffmpeg`, which prevents final segment concatenation
- Missing Gemma text encoder file
- Using a long full-song workflow before validating a short test render
- Using per-image prompts without connecting the prompt selector to the segment index path

## Expected Log Message

This setup uses a separate text encoder, so a log similar to the following is expected:

`no CLIP/text encoder weights in checkpoint`

That message does not mean the workflow is broken if the Gemma text encoder is present.