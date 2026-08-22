import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Shared instance -- loaders keep an internal cache, so one is better than many.
const gltfLoader = new GLTFLoader()

// If the model is ever Draco-compressed, decode support plugs in here:
//   import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
//   const draco = new DRACOLoader()
//   draco.setDecoderPath('/draco/')      // copy three/examples/jsm/libs/draco into public/
//   gltfLoader.setDRACOLoader(draco)

export const loadGLTF = (url) =>
  new Promise((resolve, reject) => gltfLoader.load(url, resolve, undefined, reject))
