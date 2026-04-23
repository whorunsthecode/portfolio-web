// src/worlds/Chungking/ChungkingLighting.tsx
// Consolidated light budget. All positions are in local space
// (parent group is at world x=−100, so local z=−14 → world z=−14).
export function ChungkingLighting() {
  return (
    <>
      {/* Shared arcade neon fills — replace the 8 per-stall pointLights */}
      <pointLight position={[-1.5, 2.2, 0]} color="#ff2850" intensity={0.65} distance={9} decay={2} />
      <pointLight position={[ 1.5, 2.2, 0]} color="#48d3ff" intensity={0.65} distance={9} decay={2} />
      <pointLight position={[ 0,   2.5,-1.5]} color="#ffd84a" intensity={0.5}  distance={7} decay={2} />
      {/* Corridor warm pools */}
      <pointLight position={[0, 2.1, -14]} color="#ffb038" intensity={0.55} distance={7} decay={2} />
      <pointLight position={[0, 2.1, -24]} color="#ffb038" intensity={0.55} distance={7} decay={2} />
    </>
  )
}
