"use client";

import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  ClampToEdgeWrapping,
  Color,
  MathUtils,
  MeshStandardMaterial,
  RepeatWrapping,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { faceToTextureUrl } from "./buildBookPages";
import { useBookInteraction } from "./interaction";
import {
  PAGE_DEPTH,
  PAGE_HEIGHT,
  PAGE_SEGMENTS,
  PAGE_WIDTH,
  pageGeometry,
  SEGMENT_WIDTH,
} from "./pageGeometry";
import { pageAtom } from "./state";

const easingFactor = 0.55;
const easingFactorFold = 0.32;
const restInsideCurve = 0.15;
const turnInsideCurve = 0.2;
const restOutsideCurve = 0.008;
const turnOutsideCurve = 0.03;
const turningCurveStrength = 0.08;
const openExtra = degToRad(7);

const whiteColor = new Color("white");
const emissiveColor = new Color("#f59e0b");

const edgeMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: "#1a1a1a" }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
];

function configureTexture(texture, crop, anisotropy) {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;

  if (crop) {
    texture.wrapS = RepeatWrapping;
    texture.repeat.set(0.5, 1);
    texture.offset.set(crop === "left" ? 0 : 0.5, 0);
  } else {
    texture.wrapS = ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
  }

  texture.needsUpdate = true;
  return texture;
}

function Page({
  number,
  frontFace,
  backFace,
  page,
  opened,
  bookClosed,
}) {
  const frontUrl = faceToTextureUrl(frontFace);
  const backUrl = faceToTextureUrl(backFace);
  const [frontTexture, backTexture] = useTexture([frontUrl, backUrl]);
  const { gl } = useThree();

  useLayoutEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    configureTexture(frontTexture, frontFace?.crop, anisotropy);
    configureTexture(backTexture, backFace?.crop, anisotropy);
  }, [frontTexture, backTexture, frontFace?.crop, backFace?.crop, gl]);

  const group = useRef(null);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef(null);
  const [highlighted, setHighlighted] = useState(false);
  const [, setPage] = useAtom(pageAtom);
  const interaction = useBookInteraction();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let index = 0; index <= PAGE_SEGMENTS; index += 1) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.x = index === 0 ? 0 : SEGMENT_WIDTH;
      if (index > 0) {
        bones[index - 1].add(bone);
      }
    }

    const skeleton = new Skeleton(bones);
    const materials = [
      ...edgeMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: frontFace?.kind === "blank" ? null : frontTexture,
        roughness: 0.12,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: backFace?.kind === "blank" ? null : backTexture,
        roughness: 0.12,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [frontTexture, backTexture, frontFace?.kind, backFace?.kind]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    const emissiveIntensity = highlighted ? 0.18 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }

    let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;

    if (!bookClosed && opened) {
      targetRotation = -Math.PI / 2 - openExtra;
    } else if (!bookClosed && !opened) {
      targetRotation = Math.PI / 2 + openExtra;
    }

    const insideCurveStrength =
      restInsideCurve + (turnInsideCurve - restInsideCurve) * turningTime;
    const outsideCurveStrength =
      restOutsideCurve + (turnOutsideCurve - restOutsideCurve) * turningTime;

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let index = 0; index < bones.length; index += 1) {
      const target = index === 0 ? group.current : bones[index];

      const insideCurveIntensity =
        index < 8 ? Math.sin(index * 0.2 + 0.25) : 0;
      const outsideCurveIntensity =
        index >= 8 ? Math.cos(index * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(index * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (index === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }

      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        index > 8
          ? Math.sin(index * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;

      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHighlighted(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHighlighted(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (interaction?.dragRef?.current?.moved) return;
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={
          -number * PAGE_DEPTH +
          page * PAGE_DEPTH +
          (!bookClosed && !opened ? 0.005 : 0) +
          (!bookClosed && opened ? 0.003 : 0)
        }
      />
    </group>
  );
}

export default function Book({ bookPages }) {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const totalPages = bookPages.length;

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((current) => {
        if (page === current) return current;

        timeout = window.setTimeout(
          goToPage,
          Math.abs(page - current) > 2 ? 50 : 150
        );

        if (page > current) return current + 1;
        if (page < current) return current - 1;
        return current;
      });
    };

    goToPage();
    return () => window.clearTimeout(timeout);
  }, [page]);

  return (
    <group>
      {bookPages.map((pageData, index) => (
        <Page
          key={pageData.id}
          number={index}
          page={delayedPage}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === totalPages}
          frontFace={pageData.front}
          backFace={pageData.back}
        />
      ))}
    </group>
  );
}

export { PAGE_HEIGHT, PAGE_WIDTH };
