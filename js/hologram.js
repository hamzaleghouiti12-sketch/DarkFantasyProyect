// El holograma de Aldric: acompaña al jugador flotando a su lado.
// Shader propio: borde luminoso (fresnel), líneas de escaneo y parpadeo.
import * as THREE from 'three';
import { ROOM } from './world.js';
import { Animador, ajustarAltura, ocultar } from './modelos.js';

// Admite mallas con esqueleto (skinning) para poder animar el modelo del mago.
const vertexShader = /* glsl */`
  #include <common>
  #include <skinning_pars_vertex>
  varying vec3 vN;
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    #include <beginnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <begin_vertex>
    #include <skinning_vertex>
    vec4 w = modelMatrix * vec4(transformed, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * objectNormal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uBoost;
  uniform vec3 uColor;
  uniform sampler2D uMap;
  uniform float uUseMap;
  varying vec3 vN;
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vec3 v = normalize(cameraPosition - vW);
    float fr = pow(1.0 - abs(dot(normalize(vN), v)), 2.0);
    float scan = 0.6 + 0.4 * sin(vW.y * 42.0 - uTime * 5.0);
    float sweep = smoothstep(0.92, 1.0, fract(vW.y * 0.3 - uTime * 0.35));
    float flick = 0.9 + 0.1 * sin(uTime * 37.0) * sin(uTime * 11.0);
    // el detalle de la textura (ropa, barba) se nota como luces y sombras del holograma
    float lum = mix(1.0, 0.35 + dot(texture2D(uMap, vUv).rgb, vec3(0.3, 0.59, 0.11)) * 1.3, uUseMap);
    float a = (0.07 + fr * 0.7 + sweep * 0.3) * scan * flick * uBoost;
    gl_FragColor = vec4(uColor * (0.3 * lum + fr * 1.1 + sweep * 0.6) * uBoost, a * mix(1.0, 0.6 + lum * 0.6, uUseMap));
  }
`;

export class Hologram {
  constructor(scene) {
    this.uniforms = {
      uTime: { value: 0 },
      uBoost: { value: 1 },
      uColor: { value: new THREE.Color(0.35, 0.9, 1.3) },
      uMap: { value: null },
      uUseMap: { value: 0 },
    };
    const mat = this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader, fragmentShader,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.group = new THREE.Group();
    this.figure = new THREE.Group();
    this.group.add(this.figure);
    scene.add(this.group);

    const m = (geo, x, y, z) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.figure.add(mesh);
      return mesh;
    };
    m(new THREE.ConeGeometry(0.5, 1.35, 20, 1, true), 0, 0.68, 0);
    m(new THREE.CylinderGeometry(0.2, 0.3, 0.5, 16), 0, 1.3, 0);
    m(new THREE.SphereGeometry(0.18, 18, 14), 0, 1.66, 0);
    const beard = m(new THREE.ConeGeometry(0.15, 0.5, 12), 0, 1.38, 0.1);
    beard.rotation.x = Math.PI + 0.25;
    m(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 24), 0, 1.8, 0);
    const hat = m(new THREE.ConeGeometry(0.26, 0.75, 16), 0.04, 2.15, -0.02);
    hat.rotation.z = -0.25;
    for (const sx of [-1, 1]) {
      const sleeve = m(new THREE.ConeGeometry(0.1, 0.55, 10, 1, true), sx * 0.3, 1.25, 0.05);
      sleeve.rotation.z = sx * 0.5;
    }
    m(new THREE.CylinderGeometry(0.025, 0.025, 2.0, 8), 0.5, 1.0, 0.1);
    this.orb = m(new THREE.SphereGeometry(0.1, 14, 10), 0.5, 2.05, 0.1);

    // proyector en el suelo y haz de luz
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.8, roughness: 0.35, emissive: 0x1a5570, emissiveIntensity: 1 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.07, 24), baseMat);
    base.position.y = 0.035;
    this.group.add(base);
    const beamMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    beamMat.color.setRGB(0.4, 1.0, 1.4);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.35, 24, 1, true), beamMat);
    beam.position.y = 0.22;
    this.group.add(beam);

    this.light = new THREE.PointLight(0x66e0ff, 4, 5, 1.8);
    this.light.position.y = 1.4;
    this.group.add(this.light);
    this.desired = new THREE.Vector3();
  }

  // Sustituye el mago de conos por el modelo animado de KayKit, con el mismo
  // material de holograma. Si la carga falla, se queda el de conos.
  usarModelo(gltf) {
    const modelo = gltf.scene;
    ocultar(modelo, ['Spellbook', 'Spellbook_open', '1H_Wand']);
    ajustarAltura(modelo, 2.0);
    let mapa = null;
    modelo.traverse((o) => {
      if (!o.isMesh) return;
      mapa = mapa || o.material.map;
      o.material = this.mat;
      o.castShadow = false;
    });
    this.uniforms.uMap.value = mapa;
    this.uniforms.uUseMap.value = mapa ? 1 : 0;
    for (const c of [...this.figure.children]) if (c !== this.orb) c.visible = false;
    this.orb.visible = false;
    this.figure.add(modelo);
    this.anim = new Animador(modelo, gltf.animations);
    this.anim.bucle('Idle');
  }

  celebrar() { this.anim?.unaVezSolo('Cheer'); }

  gesto() { this.anim?.unaVezSolo('Interact'); }

  update(dt, t, player, camera, speaking) {
    this.uniforms.uTime.value = t;
    // se desvanece si la cámara lo atraviesa, para no tapar la vista
    const camDist = camera.position.distanceTo(this.group.position);
    const near = Math.min(1, Math.max(0.15, (camDist - 1.5) / 2));
    const target = (speaking ? 1.25 : 1) * near;
    this.uniforms.uBoost.value += (target - this.uniforms.uBoost.value) * Math.min(1, dt * 4);

    // se coloca según la cámara: a la izquierda del jugador y algo más lejos
    // que él, para que nunca se interponga entre la cámara y el personaje
    let fx = player.pos.x - camera.position.x, fz = player.pos.z - camera.position.z;
    const len = Math.hypot(fx, fz) || 1;
    fx /= len;
    fz /= len;
    this.desired.set(player.pos.x + fz * 1.5 + fx * 0.9, 0, player.pos.z - fx * 1.5 + fz * 0.9);
    this.desired.x = Math.max(-ROOM.W + 0.8, Math.min(ROOM.W - 0.8, this.desired.x));
    this.desired.z = Math.min(ROOM.L - 0.8, this.desired.z);
    // cerca de la puerta y en la escalera va detrás del jugador, sin atravesar muros
    if (player.pos.z < -ROOM.L + 1.5) this.desired.set(player.pos.x * 0.4, 0, player.pos.z + 1.4);
    const z = this.group.position.z;
    this.group.position.y = ROOM.escalera !== null && z < ROOM.escalera ? Math.min(4, ROOM.escalera - z) : 0;
    const k = 1 - Math.exp(-dt * 2.5);
    this.group.position.x += (this.desired.x - this.group.position.x) * k;
    this.group.position.z += (this.desired.z - this.group.position.z) * k;
    this.figure.position.y = 0.18 + Math.sin(t * 1.6) * 0.07;
    this.group.rotation.y = Math.atan2(camera.position.x - this.group.position.x, camera.position.z - this.group.position.z);
    this.orb.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
    if (this.anim) {
      if (speaking && !this.wasSpeaking) this.gesto();
      this.anim.update(dt);
    }
    this.wasSpeaking = speaking;
    this.light.intensity = (speaking ? 7 : 4) * (0.9 + Math.sin(t * 23) * 0.1);
  }
}
