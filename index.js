import * as THREE from 'three'
import {
  AmbientLight,
  Clock,
  CylinderGeometry,
  DirectionalLight,
  FontLoader,
  Geometry,
  Group,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  TextGeometry,
  Vector3,
  WebGLRenderer
} from 'three'

// import font from 'three/examples/fonts/helvetiker_bold.typeface.json'
import font from './font.json'
import Shake from 'shake.js'

import CameraControls from 'camera-controls'

new Shake({
  threshold: 8
}).start()

CameraControls.install({THREE})
// const stats = new Stats()
// document.body.append(stats.domElement)

const tree = (materials, width, height, segments = 3) => {
  const geometry = new Geometry()
  const radius = width / 2

  const coneHeight = height * .8
  const logHeight = height * .2
  const ratio = radius / coneHeight

  const segmentHeight = coneHeight / segments
  const segmentWidth = segment => segmentHeight * (segment + 1) * ratio

  Array.from(Array(segments), (_, idx) => {
    const radius = segmentWidth(idx)
    const base = idx > 0 ? radius / (segments + 1) * idx : 0

    const segment = new CylinderGeometry(base, radius, segmentHeight, 160)

    segment.translate(0, -segmentHeight * idx, 0)
    geometry.merge(segment)
  })

  const cone = new Mesh(geometry, materials.cone)
  cone.position.set(0, segmentHeight * (segments - .5) + logHeight, 0)

  const logGeometry = new CylinderGeometry(width / 6, width / 6, logHeight, 160)
  const log = new Mesh(logGeometry, materials.log)
  log.position.set(0, logHeight / 2, 0)

  cone.geometry.computeBoundingBox()
  cone.geometry.computeFaceNormals()

  log.geometry.computeBoundingBox()
  log.geometry.computeFaceNormals()

  // const shapeGeometry = new CylinderGeometry(0, radius, height, 160)
  // const wrapperMaterial = new MeshPhongMaterial({ color: 'white', transparent: true, opacity: 0.5})
  // const wrapper = new Mesh(shapeGeometry, wrapperMaterial)
  // wrapper.position.set(0, segmentHeight * (segments/2), 0)

  const group = new THREE.Group()
  // group.add(wrapper)
  receiveShadow(cone)
  receiveShadow(log)

  group.add(cone)
  group.add(log)

  return group
}

const rand = (min = 0, max = 500) => Math.round(Math.random() * (max - min) + min)

const castShadow = light => {
  // return
  light.castShadow = true
//   light.shadow.camera.near = 0.5
//   light.shadow.camera.far = 1000
//   light.shadow.mapSize.width = 2048
//   light.shadow.mapSize.height = 2048
}

const halfRand = () => Math.random() - .5

const getPoint = (range) => {
  const u = Math.random()
  let x1 = halfRand()
  let x2 = halfRand()
  let x3 = halfRand()

  const mag = Math.sqrt(x1 ** 2 + x2 ** 2 + x3 ** 2)
  x1 /= mag
  x2 /= mag
  x3 /= mag

  const c = Math.cbrt(u) * range

  return {
    x: x1 * c, y: x2 * c, z: x3 * c
  }
}

const decode = k => {
  try {
    return JSON.parse(atob(decodeURIComponent(k)))
  } catch {
    return null
  }
}

const hints = {
  c: 'Agita o toca',
  v: 'Sacsa o toca',
  e: 'Shake or touch',
}

const texts = {
  c: 'Feliz año 2022',
  v: 'Bon any 2022',
  e: 'Happy 2022',
}

const receiveShadow = element => {
  element.receiveShadow = true
  element.castShadow = true
}

const addText = (text, color, hidden) => {
  const loader = new FontLoader()
  const loadedFont = loader.parse(font)
  const geometry = new TextGeometry(text, {
    font: loadedFont,
    size: 40,
    height: 4,
    bevelEnabled: true,
    bevelSize: 1,
    bevelThickness: 2,
    bevelSegments: 5
  })

  return new Mesh(geometry, new MeshPhongMaterial({
    color,
    opacity: hidden ? 0 : 1,
    transparent: !!hidden
  }))
}

const setup = () => {
  const container = document.querySelector('body')

  // const center = new Vector3(0, 1, 0)
  const scene = new Scene()
  // scene.fog = new THREE.Fog(0x406754, 1800, 2000)
  // scene.fog = new THREE.FogExp2( 0x4be097, 0.000675 )

  const renderer = new WebGLRenderer()
  container.append(renderer.domElement)

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const camera = new PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 10000)
  camera.position.set(900, 400, 400)

  const clock = new Clock()
  const cameraControls = new CameraControls(camera, renderer.domElement)

  const ambientLight = new AmbientLight('white', .5)
  const hemisphereLight = new THREE.HemisphereLight(0x999999, 0x081620, 1)

  const directionalLight = new DirectionalLight(0xffffff, 0.3)
  // const directionalHelper = new THREE.DirectionalLightHelper(directionalLight)
  directionalLight.position.set(100, 100, 200)
  castShadow(directionalLight)

  // const firstLight = new PointLight(0xffffff, 0.3)
  // const mainHelper = new THREE.PointLightHelper(firstLight)
  // firstLight.position.set(100, 100, 200)
  // castShadow(firstLight)

  // const secondLight = new PointLight(0xffffaa, 0.5)
  // const secondHelper = new THREE.PointLightHelper(secondLight)
  // secondLight.position.set(-300, 300, 500)
  // castShadow(secondLight)

  const gridSize = 300
  const base = gridSize * 1.5
  const distance = 200

  // h^2 + a^2 = 2rh
  // a^2 = 2rh - h^2
  // a sqrt(2rh - h^2)
  //
  // const radius = Math.sqrt(2 * base * (base - distance) - (base - distance) ** 2)
  // console.log({gridSize, base, distance, radius})

  const planeGeometry = new CylinderGeometry(base, base, 3, 60)
  const planeMaterial = new MeshPhongMaterial({
    color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  // plane.lookAt(center)
  receiveShadow(plane)

  // const sphereGeometry = new THREE.SphereGeometry(base, 120, 120)
  // const sphere = new THREE.Mesh(sphereGeometry, planeMaterial)
  // sphere.position.setY(distance)
  // scene.add(sphere)

  const materials = {
    cone: new MeshPhongMaterial({color: '#f1bc5f'}), log: new MeshPhongMaterial({color: '#4d1e00'})
  }

  const trees = new Group()

  Array.from(Array(30), (_, idx) => {
    const height = rand(50, 200)
    const aTree = tree(materials, height / rand(2, 4), height, rand(2, 6))
    aTree.position.set(rand(-gridSize + 10, gridSize - 10), 0, rand(-gridSize + 10, gridSize - 10))
    trees.add(aTree)
  })
  scene.add(trees)

  scene.add(ambientLight)
  scene.add(hemisphereLight)
  scene.add(directionalLight)
  // scene.add(directionalHelper)
  scene.add(plane)

  const points = []
  const colors = []

  const amount = 1000
  for (let i = 0; i < amount; i++) {
    let coords = {...getPoint(base), y: -distance}

    points.push(...Object.values(coords))
    for (let j = 0; j < 3; j++) {
      colors.push(Math.random())
    }
  }

  const flakesGeometry = new THREE.BufferGeometry()

  flakesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3))
  flakesGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

  const flakeMaterial = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    // side: THREE.DoubleSide
    // color: 'grey',
    // blending: THREE.AdditiveBlending,
    // depthTest: false,
    // transparent: true,
    // opacity: 0.5
  })

  const snowFlakes = new THREE.Points(flakesGeometry, flakeMaterial)
  Object.assign(window, {
    snowFlakes,
    trees,
    camera,
    THREE,
    colors
  })

  snowFlakes.position.setY(distance)
  scene.add(snowFlakes)

  const params = new URLSearchParams(location.search.slice(1))
  let n = params.has('n') ? params.get('n') : ''
  let l = params.has('l') ? params.get('l') : 'v'

  const config = params.has('k') ? decode(params.get('k')) : null
  if (config) {
    ({n = "", l = "v"} = config)
  }

  const hint = addText(`${hints[l]}`, 'white', false)
  hint.position.setY(distance * 1.5)
  hint.geometry.computeBoundingBox()
  const hintBox = hint.geometry.boundingBox
  const hintWidth = hintBox.max.x - hintBox.min.x
  hint.geometry.translate(-hintWidth / 2, 0, 0)
  scene.add(hint)

  const text = addText(`${texts[l]}`, 'maroon', true)
  text.position.setY(distance * 1.8)
  text.geometry.computeBoundingBox()
  const textBox = text.geometry.boundingBox
  const textWidth = textBox.max.x - textBox.min.x
  text.geometry.translate(-textWidth / 2, 0, 0)
  scene.add(text)

  const name = addText(n, 'maroon', true)
  name.position.setY(distance * 1.5)
  name.geometry.computeBoundingBox()
  const nameBox = name.geometry.boundingBox
  const nameWidth = nameBox.max.x - nameBox.min.x
  name.geometry.translate(-nameWidth / 2, -50, 0)
  scene.add(name)


  // const rotatingLights = new Group()
  // rotatingLights.add(firstLight)
  // rotatingLights.add(secondLight)

  // scene.add(mainHelper)
  // scene.add(secondHelper)

  // scene.add(rotatingLights)
  // const text = scene
  const animate = () => {
    cameraControls.update(clock.getDelta())
    renderer.render(scene, camera)
    // rotatingLights.rotation.y += 0.01
    // stats.update()
    fall(3)
    text.lookAt(camera.position)
    hint.lookAt(camera.position)
    name.lookAt(camera.position)
    scene.rotation.y += 0.01

    // cube.rotation.x += .01
    // cube.rotation.y += .01
    // cube.rotation.z += .01
  }

  renderer.setAnimationLoop(animate)

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  window.addEventListener('shake', () => {
    shake()
  })

  document.body.addEventListener('touchstart', () => {
    shake()
  })

  document.body.addEventListener('click', () => {
    shake()
  })

  const fall = (amount) => {
    const position = snowFlakes.geometry.getAttribute('position')
    for (let i = 0; i < position.count; i++) {
      const current = {
        x: position.getX(i),
        y: position.getY(i),
        z: position.getZ(i),
      }
      const target = {...current, y: -300}

      const rc = new Raycaster()
      rc.set(
        new Vector3(...Object.values({
          ...current,
          y: current.y + 200
        })),
        new Vector3(...Object.values(target))
      )

      const hit = [trees, text].some(object => {
        const result = rc.intersectObject(trees, true)
        if (result.length) {
          if (result.some(r => r.distance < 2)) {
            return true
          }
        }
      })

      if (hit) {
        continue
      }

      if (current.y > -200) {
        position.setY(i, current.y - amount)
        position.setX(i, current.x - halfRand() * 3)
        position.setZ(i, current.z - halfRand() * 3)
      }
    }

    position.needsUpdate = true
    snowFlakes.geometry.computeBoundingSphere()
    snowFlakes.geometry.computeBoundingBox()
  }

  const shuffle = () => {
    text.material.opacity = 1
    text.material.transparent = false

    name.material.opacity = 1
    name.material.transparent = false

    hint.material.opacity = 0
    hint.material.transparent = true

    const position = snowFlakes.geometry.getAttribute('position')
    for (let x = 0; x < position.count; x++) {
      const coords = getPoint(base)

      if (coords.y < -200) continue

      position.setXYZ(x, ...Object.values(coords))
    }

    position.needsUpdate = true
    snowFlakes.geometry.computeBoundingSphere()
    snowFlakes.geometry.computeBoundingBox()
  }

  const shake = (n = 50) => {
    for (let i = 0; i < n; i++) setTimeout(shuffle, 50 * i)
  }

  Object.assign(window, {
    fall, shake, shuffle, text
  })
}

document.addEventListener('DOMContentLoaded', setup)
