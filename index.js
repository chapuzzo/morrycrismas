import {
  AmbientLight,
  Clock,
  CylinderGeometry,
  DirectionalLight,
  Geometry,
  Group,
  MeshPhongMaterial,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer
} from 'three'
import * as THREE from 'three'
import Stats from 'three/examples/js/libs/stats.min'

import CameraControls from 'camera-controls'

CameraControls.install({ THREE })
const stats = new Stats()
document.body.append(stats.domElement)

const tree  = (materials, width, height, segments = 3) => {
  const geometry = new Geometry()
  const radius = width / 2

  const coneHeight = height * .8
  const logHeight = height * .2
  const ratio = radius / coneHeight

  const segmentHeight = coneHeight / segments
  const segmentWidth = segment => segmentHeight * (segment + 1) * ratio

  Array(segments).fill().forEach((_,idx) => {
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
  // light.shadow.mapSize.width = 2048
  // light.shadow.mapSize.height = 2048
}

const receiveShadow = element => {
  element.receiveShadow = true
  element.castShadow = true
}

const setup = () => {
  const container = document.querySelector('body')

	const scene = new Scene()
  const center = new Vector3(0, 1, 0)

  const renderer = new WebGLRenderer()
  container.append(renderer.domElement)

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PFCShadowMap

  const camera = new PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 10000)
  camera.position.set(400, 400, 400)

  const clock = new Clock()
  const cameraControls = new CameraControls(camera, renderer.domElement)

  const ambientLight = new AmbientLight('white', .5)
  const hemisphereLight = new THREE.HemisphereLight(0x999999, 0x081620, 1)

  const directionalLight = new DirectionalLight(0xffffff, 0.3)
  const directionalHelper = new THREE.DirectionalLightHelper(directionalLight)
  directionalLight.position.set(100, 100, 200)
  castShadow(directionalLight)

  const firstLight = new PointLight(0xffffff, 0.3)
  const mainHelper = new THREE.PointLightHelper(firstLight)
  firstLight.position.set(100, 100, 200)
  castShadow(firstLight)

  const secondLight = new PointLight(0xffffaa, 0.5)
  const secondHelper = new THREE.PointLightHelper(secondLight)
  secondLight.position.set(-300, 300, 500)
  castShadow(secondLight)

  const gridSize = 300

  const planeGeometry = new THREE.PlaneGeometry(gridSize * 2.5, gridSize * 2.5)
  const planeMaterial = new MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.lookAt(center)
  receiveShadow(plane)

  const materials = {
    cone: new MeshPhongMaterial({ color: 'green' }),
    log: new MeshPhongMaterial({ color: 'maroon' })
  }

  Array(30).fill().forEach((_, idx) => {
    const height = rand(50, 200)
    const cube = tree(materials, height / rand(2,4), height, rand(2, 6))
    cube.position.set(rand(-gridSize, gridSize), 0, rand(-gridSize, gridSize))

    scene.add(cube)
  })

  scene.add(ambientLight)
  scene.add(hemisphereLight)
  scene.add(directionalLight)
  scene.add(directionalHelper)
  scene.add(plane)

  const rotatingLights = new Group()

  rotatingLights.add(firstLight)
  rotatingLights.add(secondLight)

  scene.add(mainHelper)
  scene.add(secondHelper)

  scene.add(rotatingLights)

  const animate = () => {
    cameraControls.update(clock.getDelta())
    renderer.render(scene, camera)
    rotatingLights.rotation.y += 0.01
    stats.update()

    // cube.rotation.x += .01
    // cube.rotation.y += .01
    // cube.rotation.z += .01
    requestAnimationFrame(animate)
  }
  animate()

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize( container.clientWidth, container.clientHeight )
  })
}

document.addEventListener('DOMContentLoaded', setup)
