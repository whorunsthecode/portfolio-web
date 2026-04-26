// Consolidated light budget for the Chungking world.
// All positions are in local space (parent group at world x=−100).
export function ChungkingLighting() {
  return (
    <>
      {/* Shared arcade neon fills — vivid sign spill, not horror tint */}
      <pointLight position={[-1.5, 2.2, 0]}   color="#ff3a60" intensity={1.4} distance={10} decay={2} />
      <pointLight position={[ 1.5, 2.2, 0]}   color="#5ae0ff" intensity={1.4} distance={10} decay={2} />
      <pointLight position={[ 0,   2.5, -1.5]} color="#ffe066" intensity={1.2} distance={8}  decay={2} />
      {/* Corridor warm pools */}
      <pointLight position={[0, 2.1, -14]} color="#ffc060" intensity={0.85} distance={8} decay={2} />
      <pointLight position={[0, 2.1, -24]} color="#ffc060" intensity={0.85} distance={8} decay={2} />
    </>
  )
}
