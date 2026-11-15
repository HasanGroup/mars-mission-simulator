// Offline script bundles preserve double-click launch without file:// fetches.
const fs=require('fs');
let utils=fs.readFileSync('js/BufferGeometryUtils.source.js','utf8').replace(/import\s*\{([\s\S]*?)\}\s*from 'three';/, 'const {$1}=THREE;').replace(/export\s*\{[\s\S]*?\};\s*$/, 'return {toTrianglesDrawMode};');
utils=utils.replace(/export function /g,'function ');
let loader=fs.readFileSync('js/GLTFLoader.source.js','utf8').replace(/import\s*\{([\s\S]*?)\}\s*from 'three';/, 'const {$1}=THREE;').replace("import { toTrianglesDrawMode } from '../utils/BufferGeometryUtils.js';",'const {toTrianglesDrawMode}=NASA_GEOMETRY;').replace('export { GLTFLoader };','return GLTFLoader;');
fs.writeFileSync('js/gltf-loader.vendor.js', '// Three.js r170 addons · MIT · see assets/THREE-LICENSE.txt\nconst NASA_GEOMETRY=(()=>{'+utils+'})();\nconst GLTFLoader=(()=>{'+loader+'})();\n');
for(const name of ['curiosity','atlas-v'])fs.writeFileSync('assets/models/'+name+'-data.js','globalThis.NASA_MODEL_DATA=globalThis.NASA_MODEL_DATA||{};\nNASA_MODEL_DATA['+JSON.stringify(name)+']="'+fs.readFileSync('assets/models/'+name+'.glb').toString('base64')+'";\n');

