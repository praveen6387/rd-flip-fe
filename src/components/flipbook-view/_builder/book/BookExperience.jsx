"use client";

import Book from "./Book";
import BookRotator from "./BookRotator";
import { BOOK_SCALE, PAGE_HEIGHT } from "./pageGeometry";

export default function BookExperience({
  bookPages,
  dragRef,
  bookRotationRef,
  scale = BOOK_SCALE,
  lite = false,
}) {
  const groundY = (PAGE_HEIGHT * scale) / 2 + 0.1;

  return (
    <>
      <group scale={scale}>
        <BookRotator bookRotationRef={bookRotationRef} dragRef={dragRef}>
          <Book bookPages={bookPages} lite={lite} />
        </BookRotator>
      </group>
      <ambientLight intensity={lite ? 0.95 : 0.78} />
      <directionalLight
        position={[2, 5, 4]}
        intensity={lite ? 1.45 : 2.05}
        castShadow={!lite}
        shadow-mapSize-width={lite ? 512 : 1024}
        shadow-mapSize-height={lite ? 512 : 1024}
        shadow-bias={-0.0001}
      />
      {lite ? null : (
        <>
          <directionalLight position={[-3, 3, 2]} intensity={0.5} />
          <directionalLight position={[0, 2, -4]} intensity={0.3} />
          <mesh position-y={-groundY} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.1} />
          </mesh>
        </>
      )}
    </>
  );
}
