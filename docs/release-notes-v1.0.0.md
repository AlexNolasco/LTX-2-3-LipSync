# Release Notes v1.0.0

## GAP LTX 2.3 Motion

Initial public release of the GAP LTX 2.3 Motion workflow pack for ComfyUI.

## Included

- Custom nodes for segmented audio rendering
- Storyboard scheduling for rotating images
- Waveform-based storyboard timing
- Per-image prompt selection
- Loop-based segment rendering for longer audio
- Silent time-window rendering through `use_loaded_audio = false`
- Windows installer for required LTX 2.3 model files
- Gemma safetensors merge utility

## Workflow Set

- Audio range lip sync workflow
- Segmented audio lip sync workflows
- Storyboard song looper workflows
- First/last-frame control workflows
- Motion-track looper workflow
- Cleaner FLF2V storyboard first/last looper

## Highlights

- Public-facing repository cleanup for release
- MIT license added
- README rewritten for end users
- Workflow note text simplified and branded for GAP
- Storyboard first/last prompt routing repaired so prompt selector output now feeds the positive `CLIPTextEncode` nodes
- FLF2V storyboard looper export naming cleaned to the GAP workflow naming style inside the graph output paths
- Waveform storyboard timing updated so segments follow the actual interval between keyframes

## Notes

- A separate Gemma text encoder is required
- `ffmpeg` is required for final segment concatenation in loop-based workflows
- The `no CLIP/text encoder weights in checkpoint` log line is expected for this model layout

## Suggested Release Title

`v1.0.0 - Initial Public Release`

## Suggested GitHub Release Summary

Production-ready ComfyUI workflows and custom nodes for LTX 2.3 lip sync, segmented audio rendering, storyboard scheduling, waveform timing, and per-image prompt control.