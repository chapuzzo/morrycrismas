import {
  AmbientLight,
  Clock,
  CylinderGeometry,
  DirectionalLight,
  Geometry,
  MeshPhongMaterial,
  Mesh,
  PerspectiveCamera,
  Scene,
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
  group.add(cone)
  group.add(log)

  return group
}

const rand = (min = 0, max = 500) => Math.round(Math.random() * (max - min) + min)

const setup = () => {
  const container = document.querySelector('body')

	const scene = new Scene()

  const renderer = new WebGLRenderer()
  container.append(renderer.domElement)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const ambientLight = new AmbientLight('white', 0.5)

  const camera = new PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 10000)
  camera.position.set( 400, 400, 400)

  const clock = new Clock()
  const cameraControls = new CameraControls(camera, renderer.domElement)

  const materials = {
    cone: new MeshPhongMaterial({ color: 'green' }),
    log: new MeshPhongMaterial({ color: 'maroon' })
  }
  const gridSize = 300
  Array(30).fill().forEach((_, idx) => {
    const height = rand(50, 200)
    const cube = tree(materials, height / rand(2,4), height, rand(2, 6))
    cube.position.set(rand(-gridSize, gridSize), 0, rand(-gridSize, gridSize))

    scene.add(cube)
  })

  const hemisphereLight = new THREE.HemisphereLight( 0xff11bb, 0x08ff20, 1 )

  const directionalLight = new DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(600, 200, 200)

  var planeGeometry = new THREE.PlaneGeometry( gridSize * 2.5, gridSize * 2.5 )
  var planeMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5} )
  var plane = new THREE.Mesh( planeGeometry, planeMaterial )
  plane.lookAt(0, 1, 0)

  scene.add( plane )
  scene.add( ambientLight )
  scene.add( directionalLight )
  scene.add( hemisphereLight )

  const animate = () => {
    cameraControls.update(clock.getDelta())
    renderer.render(scene, camera)
    stats.update()

    // cube.rotation.x += .01
    // cube.rotation.y += .01
    // cube.rotation.z += .01
    requestAnimationFrame(animate)
  }
  animate()
}

document.addEventListener('DOMContentLoaded', setup)
