/** Procedural facade fragment shader for three-custom-shader-material.
 *  Extends MeshStandardMaterial — keeps lighting/shadows.
 *  Uniforms:
 *    uFloors     – number of floors
 *    uWindowsPerFloor – windows per row
 *    uWallColor  – base wall RGB
 *    uLitFraction – 0 (day, windows dim) → 0.65 (night, most lit)
 *    uSeed       – per-building random seed
 */

export const facadeVertexShader = `
  varying vec2 vFacadeUv;
  void main() {
    vFacadeUv = uv;
  }
`

export const facadeFragmentShader = `
  uniform float uFloors;
  uniform float uWindowsPerFloor;
  uniform vec3 uWallColor;
  uniform float uLitFraction;
  uniform float uSeed;

  varying vec2 vFacadeUv;

  // Simple hash
  float hash(vec2 p) {
    return fract(sin(dot(p + uSeed, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vFacadeUv;

    // Floor bands
    float floorIndex = floor(uv.y * uFloors);
    float floorFrac = fract(uv.y * uFloors);

    // Window grid
    float winCol = floor(uv.x * uWindowsPerFloor);
    float winFracX = fract(uv.x * uWindowsPerFloor);
    float winFracY = floorFrac;

    // Window rectangle: inset from cell edges
    float winLeft = step(0.2, winFracX);
    float winRight = 1.0 - step(0.8, winFracX);
    float winBot = step(0.25, winFracY);
    float winTop = 1.0 - step(0.85, winFracY);
    float isWindow = winLeft * winRight * winBot * winTop;

    // Floor band line (thin dark line between floors)
    float bandLine = 1.0 - smoothstep(0.0, 0.04, floorFrac) + smoothstep(0.96, 1.0, floorFrac);
    bandLine *= 0.3;

    // Per-window random: is it lit?
    float winHash = hash(vec2(winCol, floorIndex));
    float isLit = step(1.0 - uLitFraction, winHash);

    // Window color
    vec3 warmLight = vec3(1.0, 0.843, 0.549);  // #ffd78c
    vec3 coolLight = vec3(0.706, 0.863, 1.0);   // #b4dcff
    float coolChance = step(0.75, hash(vec2(winCol + 10.0, floorIndex + 5.0)));
    vec3 litColor = mix(warmLight, coolLight, coolChance);
    vec3 dimWindow = uWallColor * 0.4; // dark glass reflection

    vec3 windowColor = mix(dimWindow, litColor, isLit);

    // Subtle wall noise
    float noise = hash(uv * 50.0) * 0.04 - 0.02;
    vec3 wall = uWallColor + noise;

    // Darken wall slightly with floor band
    wall -= bandLine;

    // Combine
    vec3 finalColor = mix(wall, windowColor, isWindow);

    // Ground floor shop band (bottom 15% of UV) — darker
    float shopBand = 1.0 - smoothstep(0.0, 0.15 / uFloors, uv.y);
    finalColor = mix(finalColor, uWallColor * 0.35, shopBand * 0.7);

    csm_DiffuseColor = vec4(finalColor, 1.0);
  }
`
