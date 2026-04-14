/**
 * Unified city facade fragment shader for three-custom-shader-material.
 * Extends MeshStandardMaterial — keeps lighting/shadows.
 *
 * Uniforms:
 *   uBaseColor        – wall RGB
 *   uWindowDensityX   – windows per row
 *   uWindowDensityY   – number of floor rows
 *   uBandSpacing      – horizontal band line thickness (0 = none)
 *   uLitFraction      – 0 (day) → 0.7 (night, most windows lit)
 *   uSeed             – per-building random seed
 *   uBracingType      – 0: none, 1: X-brace per tier, 2: full-height X, 3: diagonal
 *   uBracingColor     – RGB of bracing lines
 *   uBracingWidth     – thickness of bracing lines in UV space
 *   uTiers            – number of X-brace tier sections (for type 1)
 *   uWindowTint       – RGB tint for glass panels (for glass towers)
 *   uPanelAlternate   – 0 or 1, alternate light/dark panels between tiers
 */

export const cityFacadeVertex = `
  varying vec2 vFacadeUv;
  void main() {
    vFacadeUv = uv;
  }
`

export const cityFacadeFragment = `
  uniform vec3 uBaseColor;
  uniform float uWindowDensityX;
  uniform float uWindowDensityY;
  uniform float uBandSpacing;
  uniform float uLitFraction;
  uniform float uSeed;
  uniform float uBracingType;
  uniform vec3 uBracingColor;
  uniform float uBracingWidth;
  uniform float uTiers;
  uniform vec3 uWindowTint;
  uniform float uPanelAlternate;

  varying vec2 vFacadeUv;

  float hash(vec2 p) {
    return fract(sin(dot(p + uSeed, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Distance from point to line segment
  float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
  }

  float xBracePattern(vec2 uv, float tiers, float width) {
    // Divide into tiers vertically
    float tierH = 1.0 / tiers;
    float tierIdx = floor(uv.y / tierH);
    float localY = fract(uv.y / tierH);

    // X pattern within each tier
    float d1 = distToSegment(vec2(uv.x, localY), vec2(0.0, 0.0), vec2(1.0, 1.0));
    float d2 = distToSegment(vec2(uv.x, localY), vec2(0.0, 1.0), vec2(1.0, 0.0));
    float d = min(d1, d2);
    return 1.0 - smoothstep(width * 0.5, width, d);
  }

  float fullHeightX(vec2 uv, float width) {
    // Single X across entire facade
    float d1 = distToSegment(uv, vec2(0.0, 0.0), vec2(1.0, 1.0));
    float d2 = distToSegment(uv, vec2(0.0, 1.0), vec2(1.0, 0.0));
    float d = min(d1, d2);
    return 1.0 - smoothstep(width * 0.5, width, d);
  }

  float diagonalBrace(vec2 uv, float width) {
    float tierH = 1.0 / uTiers;
    float tierIdx = floor(uv.y / tierH);
    float localY = fract(uv.y / tierH);
    // Alternating diagonal direction per tier
    float d;
    if (mod(tierIdx, 2.0) < 0.5) {
      d = distToSegment(vec2(uv.x, localY), vec2(0.0, 0.0), vec2(1.0, 1.0));
    } else {
      d = distToSegment(vec2(uv.x, localY), vec2(0.0, 1.0), vec2(1.0, 0.0));
    }
    return 1.0 - smoothstep(width * 0.5, width, d);
  }

  void main() {
    vec2 uv = vFacadeUv;

    // Floor grid
    float floorIdx = floor(uv.y * uWindowDensityY);
    float floorFrac = fract(uv.y * uWindowDensityY);
    float colIdx = floor(uv.x * uWindowDensityX);
    float colFrac = fract(uv.x * uWindowDensityX);

    // Window rectangle
    float winL = step(0.15, colFrac);
    float winR = 1.0 - step(0.85, colFrac);
    float winB = step(0.2, floorFrac);
    float winT = 1.0 - step(0.88, floorFrac);
    float isWindow = winL * winR * winB * winT;

    // Per-window lit status
    float wHash = hash(vec2(colIdx, floorIdx));
    float isLit = step(1.0 - uLitFraction, wHash);

    // Window color
    vec3 warmLight = vec3(1.0, 0.843, 0.549);
    vec3 coolLight = vec3(0.706, 0.863, 1.0);
    float coolChance = step(0.75, hash(vec2(colIdx + 10.0, floorIdx + 5.0)));
    vec3 litColor = mix(warmLight, coolLight, coolChance);

    // Glass tint for unlit windows
    vec3 glassTint = uWindowTint;
    vec3 dimWindow = mix(uBaseColor * 0.4, glassTint, 0.5);

    vec3 windowColor = mix(dimWindow, litColor, isLit);

    // Panel alternation (for BoC-style light/dark sections)
    float panelDarken = 1.0;
    if (uPanelAlternate > 0.5) {
      float tierH = 1.0 / max(uTiers, 1.0);
      float tierIdx = floor(uv.y / tierH);
      panelDarken = mix(1.0, 0.8, mod(tierIdx, 2.0));
    }

    // Wall noise
    float noise = hash(uv * 50.0) * 0.03 - 0.015;
    vec3 wall = uBaseColor * panelDarken + noise;

    // Horizontal band lines
    float band = 0.0;
    if (uBandSpacing > 0.01) {
      band = smoothstep(0.0, 0.008, floorFrac) - smoothstep(uBandSpacing, uBandSpacing + 0.008, floorFrac);
      band = 1.0 - band;
      // Also add at floor division
      float floorLine = 1.0 - smoothstep(0.0, 0.015, floorFrac) + smoothstep(0.985, 1.0, floorFrac);
      band = max(band, floorLine * 0.4);
    } else {
      // Default thin floor lines
      float floorLine = 1.0 - smoothstep(0.0, 0.02, floorFrac) + smoothstep(0.98, 1.0, floorFrac);
      band = floorLine * 0.25;
    }

    // Combine wall + windows
    vec3 color = mix(wall - band * 0.15, windowColor, isWindow);

    // Bracing overlay
    float bracing = 0.0;
    if (uBracingType > 0.5 && uBracingType < 1.5) {
      bracing = xBracePattern(uv, uTiers, uBracingWidth);
    } else if (uBracingType > 1.5 && uBracingType < 2.5) {
      bracing = fullHeightX(uv, uBracingWidth);
    } else if (uBracingType > 2.5) {
      bracing = diagonalBrace(uv, uBracingWidth);
    }

    if (bracing > 0.01) {
      // Bracing drawn over everything — mix of structural color + emissive at night
      vec3 bracingVis = uBracingColor;
      // At night, bracing gets brighter (will also catch bloom)
      bracingVis += uBracingColor * uLitFraction * 0.8;
      color = mix(color, bracingVis, bracing);
    }

    csm_DiffuseColor = vec4(color, 1.0);
  }
`
