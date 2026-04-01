

# Replace Shader Background with Cosmic Cloud Shader

Keep the current `AnimatedShaderHero` component structure (accepts `children`, auth form overlays on top) but swap the fragment shader to the dark cosmic cloud shader by Matthias Hurrle that you shared.

## What changes

### `src/components/ui/animated-shader-hero.tsx`
- Replace the `FRAG` shader source with the cosmic cloud shader (the `defaultShaderSource` from your paste — uses `resolution`, `time` uniforms, dark swirling clouds with light points)
- Update the vertex shader to match (uses `position` instead of `a_position`)
- Update uniform names from `u_time`/`u_resolution`/`u_pointer` to `time`/`resolution` (matching the new shader)
- Add `move`, `touch`, `pointerCount`, `pointers` uniforms for pointer interaction support
- Upgrade the WebGL setup to use the full `WebGLRenderer` + `PointerHandler` classes from your paste for proper multi-touch and pointer tracking
- Keep the same exported API: `AnimatedShaderHero` with `children` prop — Landing.tsx stays untouched

### No changes to
- `Landing.tsx` — same auth card overlay, same import
- Auth flow, routing, or any other files

The result: same auth form, but the background becomes the dark animated cosmic cloud shader with interactive pointer tracking.

