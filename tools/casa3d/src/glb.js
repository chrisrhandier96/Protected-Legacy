/* A small reader for the site's own glTF binaries (work order Nov 4, 2026), for the homepage hero and domains map.
   The models come from ue-renders/export_casa_glb.py and `gltf-transform meshopt`: triangle meshes with a quantized
   POSITION and indices (KHR_mesh_quantization, EXT_meshopt_compression), node translation, rotation and scale,
   flat PBR colours (with KHR_materials_emissive_strength) and the export's extras (groups, cameras, tide level).
   That is all this reads; three's GLTFLoader (used by the guides) reads everything, at about 22 KiB more gzip.
   Normals are not stored: materials use flat shading, which suits the blockout architecture. */
import { BufferGeometry, BufferAttribute, Mesh, Group, MeshStandardMaterial } from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const TA = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

export async function loadGlb(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('glb ' + r.status);
  const ab = await r.arrayBuffer(), dv = new DataView(ab);
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('not a glb');
  const jl = dv.getUint32(12, true);
  const j = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, 20, jl)));
  const bin = new Uint8Array(ab, 28 + jl, dv.getUint32(20 + jl, true));
  await MeshoptDecoder.ready;
  const views = j.bufferViews.map(function (bv) {
    const ext = bv.extensions && bv.extensions.EXT_meshopt_compression;
    if (!ext) return new Uint8Array(bin.buffer, bin.byteOffset + (bv.byteOffset || 0), bv.byteLength);
    const out = new Uint8Array(ext.count * ext.byteStride);
    MeshoptDecoder.decodeGltfBuffer(out, ext.count, ext.byteStride, new Uint8Array(bin.buffer, bin.byteOffset + (ext.byteOffset || 0), ext.byteLength), ext.mode, ext.filter);
    return out;
  });
  function accessor(i) {
    const a = j.accessors[i], v = views[a.bufferView], T = TA[a.componentType], n = N[a.type], es = T.BYTES_PER_ELEMENT;
    const stride = j.bufferViews[a.bufferView].byteStride || n * es, at = v.byteOffset + (a.byteOffset || 0), out = new T(a.count * n);
    if (stride === n * es) out.set(new T(v.buffer.slice(at, at + a.count * n * es)));
    else for (let k = 0; k < a.count; k++) { const e = new T(v.buffer, at + k * stride, n); for (let c = 0; c < n; c++) out[k * n + c] = e[c]; }
    return new BufferAttribute(out, n, !!a.normalized);
  }
  const mats = (j.materials || []).map(function (m) {
    const p = m.pbrMetallicRoughness || {}, f = p.baseColorFactor || [1, 1, 1, 1], e = m.emissiveFactor || [0, 0, 0];
    const k = (m.extensions && m.extensions.KHR_materials_emissive_strength && m.extensions.KHR_materials_emissive_strength.emissiveStrength) || 1;
    const mat = new MeshStandardMaterial({ roughness: p.roughnessFactor != null ? p.roughnessFactor : 1, metalness: p.metallicFactor != null ? p.metallicFactor : 1, flatShading: true });
    mat.name = m.name || ''; mat.color.setRGB(f[0], f[1], f[2]); mat.emissive.setRGB(e[0] * k, e[1] * k, e[2] * k);   // glTF factors are linear, as is three's working space
    return mat;
  });
  const root = new Group();
  (j.nodes || []).forEach(function (nd) {
    if (nd.mesh == null) return;
    j.meshes[nd.mesh].primitives.forEach(function (pr) {
      if (pr.mode != null && pr.mode !== 4) return;
      const g = new BufferGeometry();
      g.setAttribute('position', accessor(pr.attributes.POSITION));
      if (pr.indices != null) g.setIndex(accessor(pr.indices));
      const m = new Mesh(g, pr.material != null ? mats[pr.material] : new MeshStandardMaterial({ flatShading: true }));
      if (nd.translation) m.position.fromArray(nd.translation);
      if (nd.rotation) m.quaternion.fromArray(nd.rotation);
      if (nd.scale) m.scale.fromArray(nd.scale);
      m.name = nd.name || ''; m.userData = Object.assign({}, nd.extras || {});
      root.add(m);
    });
  });
  return { scene: root, extras: (j.scenes && j.scenes[0] && j.scenes[0].extras) || {} };
}
