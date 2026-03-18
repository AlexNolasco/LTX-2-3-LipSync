# Release Notes v1.0.0

## Geekatplay Studio LTX 2.3 Lip Sync

Initial public release of the Geekatplay Studio LTX 2.3 Lip Sync workflow pack for ComfyUI.

## Included

- Custom nodes for segmented audio rendering
- Storyboard scheduling for rotating images
- Waveform-based storyboard timing
- Per-image prompt selection
- Loop-based segment rendering for longer audio
- Windows installer for required LTX 2.3 model files
- Gemma safetensors merge utility

## Workflow Set

- Audio range lip sync workflow
- Segmented audio lip sync workflows
- Storyboard song looper workflows
- Waveform storyboard workflows
- First/last-frame control workflows

## Highlights

- Public-facing repository cleanup for release
- MIT license added
- README rewritten for end users
- Workflow note text simplified and branded for Geekatplay Studio
- Waveform storyboard timing updated so segments follow the actual interval between keyframes

## Notes

- A separate Gemma text encoder is required
- `ffmpeg` is required for final segment concatenation in loop-based workflows
- The `no CLIP/text encoder weights in checkpoint` log line is expected for this model layout

## Suggested Release Title

`v1.0.0 - Initial Public Release`

## Suggested GitHub Release Summary

Production-ready ComfyUI workflows and custom nodes for LTX 2.3 lip sync, segmented audio rendering, storyboard scheduling, waveform timing, and per-image prompt control.