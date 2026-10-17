import * as THREE from 'three'

/**
 * GLB 흉상이 없거나 로딩에 실패했을 때 쓰는 단순 마네킹 (머리 · 목 · 어깨 · 받침).
 * 넥밴드 위치(NECKBAND_FIT)가 GLB 흉상 기준이라 목 높이를 그에 맞춘다.
 */

/** 받침 (모서리 둥근 직육면체) — 바닥 y 0 */
export const createBaseGeometry = () => {
  const width = 1.7
  const depth = 1.15
  const cornerRadius = 0.22
  const height = 0.3
  const bevel = 0.08
  const left = -width / 2
  const bottom = -depth / 2

  const shape = new THREE.Shape()
  shape.moveTo(left + cornerRadius, bottom)
  shape.lineTo(left + width - cornerRadius, bottom)
  shape.quadraticCurveTo(left + width, bottom, left + width, bottom + cornerRadius)
  shape.lineTo(left + width, bottom + depth - cornerRadius)
  shape.quadraticCurveTo(left + width, bottom + depth, left + width - cornerRadius, bottom + depth)
  shape.lineTo(left + cornerRadius, bottom + depth)
  shape.quadraticCurveTo(left, bottom + depth, left, bottom + depth - cornerRadius)
  shape.lineTo(left, bottom + cornerRadius)
  shape.quadraticCurveTo(left, bottom, left + cornerRadius, bottom)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 16,
  })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, bevel, 0)
  return geometry
}

/** 받침에서 목까지 매끈하게 좁아지는 어깨 곡면 (lathe 후 가로로 늘려 어깨 폭 표현) */
export const createShoulderGeometry = () => {
  const profile = [
    new THREE.Vector2(0.56, 0.44),
    new THREE.Vector2(0.56, 0.6),
    new THREE.Vector2(0.54, 0.78),
    new THREE.Vector2(0.5, 0.96),
    new THREE.Vector2(0.44, 1.14),
    new THREE.Vector2(0.37, 1.3),
    new THREE.Vector2(0.31, 1.45),
    new THREE.Vector2(0.3, 1.56),
  ]
  const geometry = new THREE.LatheGeometry(profile, 72)
  geometry.scale(1.5, 1, 1)
  return geometry
}

export const NECK_PLACEMENT = {
  position: [0, 1.78, 0] as [number, number, number],
  radiusTop: 0.29,
  radiusBottom: 0.31,
  height: 0.5,
}

export const HEAD_PLACEMENT = {
  position: [0, 2.4, 0] as [number, number, number],
  radius: 0.5,
  scale: [0.95, 1.2, 1.02] as [number, number, number],
}
