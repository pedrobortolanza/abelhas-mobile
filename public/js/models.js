/* MODELS-START: modelos 3D (prontos em GLB e procedurais) renderizados como sprites, no estilo do Dragon City */
const M3 = (() => {
  if (!window.THREE) return null;
  const T = THREE;
  let R;
  try {
    const cv = document.createElement('canvas');
    R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
    if (!R.getContext()) return null;
  } catch (e) { return null; }
  R.setClearColor(0x000000, 0);
  R.shadowMap.enabled = true;
  R.shadowMap.type = T.PCFSoftShadowMap;
  const INK = 0x1b1230;
  const col = c => new T.Color(c);
  const mix = (a, b, f) => col(a).lerp(col(b), f);
  const matCache = new Map();
  function mat(c, o = {}) {
    const k = (typeof c === 'number' ? c : col(c).getHex()) + JSON.stringify(o);
    if (matCache.has(k)) return matCache.get(k);
    const m = new T.MeshStandardMaterial(Object.assign({ color: col(c), roughness: 0.55, metalness: 0 }, o));
    matCache.set(k, m);
    return m;
  }
  // ---------- Modelos prontos (GLB, CC0) ----------
  const G = {};
  let glbReady = false;
  const load = (async () => {
    if (typeof GLB_KEYS === 'undefined' || !T.GLTFLoader) return;
    const L = new T.GLTFLoader();
    const bins = GLB_KEYS.map(k => fetch('models/' + k + '.glb').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null));
    for (const [i, k] of GLB_KEYS.entries()) {
      try {
        const bin = await bins[i];
        if (!bin) continue;
        const g = await new Promise((res, rej) => L.parse(bin, '', res, rej));
        // o jogo usa saída linear (cores "como estão"); converte o modelo para combinar
        g.scene.traverse(n => {
          if (!n.isMesh) return;
          n.castShadow = n.receiveShadow = true;
          const ms = Array.isArray(n.material) ? n.material : [n.material];
          ms.forEach(m => { m.color && m.color.convertLinearToSRGB(); if (m.map) { m.map.encoding = T.LinearEncoding; m.map.needsUpdate = true; } m.metalness = 0; m.roughness = Math.max(0.6, m.roughness || 0); });
        });
        G[k] = g;
      } catch (e) { /* modelo opcional */ }
    }
    glbReady = true;
  })();
  // Instancia um modelo pronto, centralizado, apoiado no chão e com a maior medida horizontal = fit
  function glb(k, parent, p = [0, 0, 0], fit = 1, ry = 0) {
    if (!G[k]) return null;
    const o = G[k].scene.clone(true);
    o.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(o), sz = box.getSize(new T.Vector3());
    const s = fit / Math.max(sz.x, sz.z);
    o.scale.setScalar(s);
    o.position.set(-(box.min.x + box.max.x) / 2 * s, -box.min.y * s, -(box.min.z + box.max.z) / 2 * s);
    const g = new T.Group(); g.add(o); g.rotation.y = ry; g.position.set(...p);
    if (parent) parent.add(g);
    return g;
  }
  const outlines = new Map();
  function outlineMat(w) {
    if (outlines.has(w)) return outlines.get(w);
    const m = new T.ShaderMaterial({
      uniforms: { w: { value: w }, c: { value: col(INK) } },
      vertexShader: 'uniform float w; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); mv.xyz += n * w; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }',
      side: T.BackSide,
    });
    outlines.set(w, m);
    return m;
  }
  let OUT = 0.035;
  // Cria uma malha com contorno escuro (casca invertida), como nos desenhos do Dragon City
  function mesh(geo, m, parent, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0], line = true) {
    const g = new T.Group();
    const me = new T.Mesh(geo, m);
    me.castShadow = true; me.receiveShadow = true;
    g.add(me);
    if (line && OUT > 0) g.add(new T.Mesh(geo, outlineMat(OUT)));
    g.position.set(...p); g.scale.set(...s); g.rotation.set(...r);
    if (parent) parent.add(g);
    return g;
  }
  const SPH = new T.SphereGeometry(1, 28, 20);
  const SPH_LO = new T.SphereGeometry(1, 14, 10);
  const CONE = new T.ConeGeometry(1, 1, 16);
  const CYL = new T.CylinderGeometry(1, 1, 1, 20);
  const BOX = new T.BoxGeometry(1, 1, 1);
  const OCTA = new T.OctahedronGeometry(1, 0);
  const ICO = new T.IcosahedronGeometry(1, 0);
  // Tubo afinando ao longo de uma curva (cauda, chifres, ossos)
  function taper(points, r0, r1, radial = 12, segs = 24, cap = true) {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    const geo = new T.TubeGeometry(curve, segs, 1, radial, false);
    const pos = geo.attributes.position, v = new T.Vector3();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs, c = curve.getPointAt(u), r = r0 + (r1 - r0) * Math.pow(u, 0.9);
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(r).add(c);
        pos.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    geo.computeVertexNormals();
    return { geo, curve };
  }
  function shapeGeo(pts, depth = 0.06, bevel = 0.03) {
    const sh = new T.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (p.length === 4) sh.quadraticCurveTo(p[0], p[1], p[2], p[3]); else sh.lineTo(p[0], p[1]);
    }
    const geo = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }

  // ---------- Iluminação ----------
  function lights(scene, kind) {
    const iso = kind !== 'dragon';
    scene.add(new T.HemisphereLight(0xfff6e8, 0x5a4a6a, iso ? 0.6 : 0.85));
    const key = new T.DirectionalLight(0xffffff, iso ? 0.6 : 0.95);
    const rim = new T.DirectionalLight(0xbfe4ff, 0.55);
    if (kind === 'dragon') { key.position.set(3, 6, 6); rim.position.set(-6, 4, -4); }
    else {
      key.position.set(-4, 9, 3); rim.position.set(6, 3, -6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const c = key.shadow.camera; c.left = -4; c.right = 4; c.top = 4; c.bottom = -4; c.near = 0.5; c.far = 30;
      key.shadow.bias = -0.002; key.shadow.radius = 3;
    }
    scene.add(key, rim);
  }

  const ELC = k => EL[k].c;
  // ---------- Peças compartilhadas pelos modelos (materiais, olhos, enfeites de elemento) ----------
  function dMats(els, rar) {
    const e1 = els[0], e2 = els[1] || els[0], has = e => els.includes(e);
    const c1 = ELC(e1), c2 = ELC(e2), tier = { C: 0, R: 1, E: 2, L: 3 }[rar];
    const gold = mat('#ffcc33', { metalness: 0.35, roughness: 0.3, emissive: col('#5a3a00') });
    const iris = has('trevas') ? '#b06cff' : has('luz') ? '#ffc21a' : has('gelo') ? '#39b6ff' : has('fogo') ? '#ff7a00' : has('agua') ? '#1e90ff' : has('planta') ? '#43c04a' : has('eletrico') ? '#ffb000' : '#f2a01c';
    return {
      e1, e2, c1, c2, tier, has, gold,
      body: mat(c1, { roughness: 0.5 }),
      body2: mat(mix(c1, '#000000', 0.18), { roughness: 0.55 }),
      belly: mat(mix(c2, '#fff4dc', 0.55), { roughness: 0.6 }),
      plate: mat(mix(mix(c2, '#fff4dc', 0.55), '#7a5a30', 0.25), { roughness: 0.6 }),
      snout: mat(mix(c1, '#ffffff', 0.25), { roughness: 0.5 }),
      wing: mat(mix(c2, '#ffffff', 0.12), { roughness: 0.6, side: T.DoubleSide, emissive: col(c2).multiplyScalar(0.18) }),
      bone: mat(mix(c2, '#000000', 0.45)),
      spike: tier === 3 ? gold : mat(mix(c2, '#000000', 0.25)),
      horn: tier === 3 ? gold : mat(mix(c2, '#fff1d6', 0.7), { roughness: 0.45 }),
      white: mat('#ffffff', { roughness: 0.25 }),
      dark: mat('#1b1230', { roughness: 0.3 }),
      claw: mat('#fffaf0', { roughness: 0.4 }),
      iris: mat(iris, { roughness: 0.2, emissive: col(iris).multiplyScalar(has('trevas') || has('luz') ? 0.5 : 0.15) }),
      shine: mat('#ffffff', { emissive: col('#ffffff') }),
      cheek: mat('#ff8fa8', { transparent: true, opacity: 0.45 }),
    };
  }
  // Olho grande e brilhante; o grupo olha para "alvo" (coordenadas da cabeça)
  function cuteEye(head, p, alvo, s, M, brow = 1) {
    const g = new T.Group(); g.position.set(...p); head.add(g);
    g.lookAt(new T.Vector3(...alvo).add(head.position));
    mesh(SPH, M.white, g, [0, 0, 0], [0.24 * s, 0.3 * s, 0.2 * s]);
    mesh(SPH, M.iris, g, [0, -0.015 * s, 0.12 * s], [0.17 * s, 0.21 * s, 0.11 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.dark, g, [0, -0.015 * s, 0.2 * s], [0.08 * s, 0.16 * s, 0.05 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.shine, g, [0.06 * s, 0.1 * s, 0.23 * s], [0.055 * s, 0.055 * s, 0.03 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.shine, g, [-0.05 * s, -0.08 * s, 0.22 * s], [0.025 * s, 0.025 * s, 0.02 * s], [0, 0, 0], false);
    if (brow) mesh(CYL, M.dark, g, [0, 0.34 * s, 0.06 * s], [0.04 * s, 0.3 * s, 0.04 * s], [0, 0, Math.PI / 2 - 0.18 * brow], false);
    return g;
  }
  // Cabeça padrão (focinho, narinas, sorriso, olhos, chifres); escala s; dente = presas de fora
  function dragonHead(M, s, o = {}) {
    const head = new T.Group();
    mesh(SPH, M.body, head, [0, 0.05 * s, 0], [0.8 * s, 0.74 * s, 0.74 * s]);
    mesh(SPH, M.snout, head, [0.58 * s, -0.17 * s, 0], [(o.snout || 0.55) * s, 0.38 * s, 0.48 * s]);
    [1, -1].forEach(z => mesh(SPH_LO, M.dark, head, [(0.52 + (o.snout || 0.55)) * s, -0.04 * s, z * 0.16 * s], [0.05 * s, 0.035 * s, 0.05 * s], [0, 0, 0], false));
    mesh(new T.TorusGeometry(0.28 * s, 0.022 * s, 6, 16, 1.6), M.dark, head, [0.78 * s, -0.2 * s, 0], [1, 1, 1.4], [0, -0.35, -2.2], false);
    if (o.fangs) [1, -1].forEach(z => mesh(CONE, M.claw, head, [0.9 * s, -0.36 * s, z * 0.13 * s], [0.045 * s, 0.13 * s, 0.045 * s], [Math.PI, 0, 0], false));
    mesh(SPH_LO, M.cheek, head, [0.4 * s, -0.3 * s, 0.52 * s], [0.13 * s, 0.08 * s, 0.05 * s], [0, 0.5, 0], false);
    cuteEye(head, [0.32 * s, 0.17 * s, 0.47 * s], [2.4, 0.5, 1.5], s * (o.eye || 1), M, o.brow === undefined ? 1 : o.brow);
    cuteEye(head, [0.32 * s, 0.17 * s, -0.47 * s], [2.4, 0.5, -1.5], s * (o.eye || 1), M, o.brow === undefined ? -1 : -o.brow);
    // chifres
    const hornLen = o.horns || 1;
    [1, -1].forEach(z => {
      const h = o.ram
        ? taper([[0, 0, 0], [-0.25, 0.3, z * 0.15], [-0.55, 0.15, z * 0.35], [-0.5, -0.25, z * 0.45], [-0.2, -0.35, z * 0.45]].map(p => p.map(v => v * s * hornLen)), 0.17 * s, 0.03 * s, 10, 24)
        : taper([[0, 0, 0], [-0.15, 0.32, z * 0.08], [-0.45, 0.6, z * 0.15], [-0.8, 0.72, z * 0.2]].map(p => p.map(v => v * s * hornLen)), 0.13 * s, 0.02 * s, 10, 16);
      mesh(h.geo, M.horn, head, [-0.2 * s, 0.55 * s, z * 0.35 * s]);
    });
    // orelhas/barbatanas
    [1, -1].forEach(z => {
      const ear = M.has('agua') ? shapeGeo([[0, 0], [-0.55, 0.15, -0.6, 0.5], [-0.2, 0.3, 0, 0.2]], 0.03, 0.02) : shapeGeo([[0, 0], [-0.42, 0.28], [-0.05, 0.22]], 0.04, 0.02);
      mesh(ear, M.has('agua') ? mat('#7cc8ff') : M.wing, head, [-0.42 * s, 0.18 * s, z * 0.58 * s], [s, s, s], [0, z * 0.6, 0]);
    });
    if (o.crest) for (let i = 0; i < 3; i++) mesh(CONE, M.tier === 3 ? M.gold : M.wing, head, [(-0.55 - i * 0.12) * s, (0.45 - i * 0.22) * s, 0], [0.09 * s, 0.28 * s, 0.05 * s], [0, 0, 0.9 + i * 0.25]);
    return head;
  }
  // Asa de morcego com ossos; estilo 'bat' (normal) ou 'fin' (barbatana arredondada)
  function wingGeoOf(style) {
    if (style === 'fin') return shapeGeo([[0, 0], [0.3, 0.7, 0.1, 1.2], [-0.4, 1.0, -0.9, 0.7], [-0.6, 0.2, 0, 0]], 0.03, 0.02);
    return shapeGeo([[0, 0], [0.18, 0.6], [0.2, 1.5], [-0.15, 1.05, -0.45, 1.2], [-0.72, 1.48], [-0.82, 1.0, -1.1, 0.95], [-1.4, 1.02], [-1.0, 0.45, -0.6, 0.1], [-0.25, -0.05, 0, 0]], 0.03, 0.025);
  }
  function wingPair(root, M, p, ws, style = 'bat') {
    const geo = wingGeoOf(style);
    const mk = z => {
      const pivot = new T.Group(); pivot.position.set(p[0], p[1], z * p[2]); root.add(pivot);
      const w = new T.Group(); pivot.add(w);
      mesh(geo, M.wing, w, [0, 0, 0], [ws, ws, ws]);
      if (style === 'bat') {
        [[0.2, 1.5], [-0.72, 1.48], [-1.4, 1.02]].forEach(([x, y]) => {
          const b = taper([[0, 0, 0], [x * 0.5 * ws, y * 0.55 * ws, 0.03], [x * ws, y * ws, 0.0]], 0.07 * ws / 1.25, 0.025, 8, 10);
          mesh(b.geo, M.bone, w, [0, 0, z * 0.03], [1, 1, 1], [0, 0, 0], false);
        });
        mesh(CONE, M.claw, w, [0.2 * ws, 1.55 * ws, 0], [0.06, 0.18, 0.06], [0, 0, 0.2], false);
      }
      return pivot;
    };
    return [mk(1), mk(-1)];
  }
  // Ponta da cauda conforme o elemento
  function tailTip(tipG, M, parts, s = 1) {
    const has = M.has;
    if (has('fogo')) {
      mesh(CONE, mat('#ff7a1a', { emissive: col('#ff5a00'), emissiveIntensity: 0.7 }), tipG, [0, 0.32 * s, 0], [0.22 * s, 0.6 * s, 0.22 * s]);
      mesh(CONE, mat('#ffe066', { emissive: col('#ffcc00'), emissiveIntensity: 0.9 }), tipG, [0, 0.22 * s, 0.05 * s], [0.12 * s, 0.36 * s, 0.12 * s], [0, 0, 0], false);
      parts.flame = tipG;
    } else if (has('eletrico')) {
      mesh(shapeGeo([[0, 0], [0.22, 0.32], [0.08, 0.34], [0.3, 0.72], [-0.06, 0.3], [0.08, 0.28], [-0.1, 0]], 0.05, 0.02), mat('#ffe14d', { emissive: col('#ffb800'), emissiveIntensity: 0.6 }), tipG, [0, 0, 0], [1.1 * s, 1.1 * s, 1.1 * s]);
    } else if (has('planta')) {
      flowerOn(tipG, [0, 0.12 * s, 0], 1.3 * s);
    } else if (has('metal')) {
      mesh(SPH, mat('#9ad94a', { roughness: 0.15, emissive: col('#3a7a00'), emissiveIntensity: 0.5, transparent: true, opacity: 0.9 }), tipG, [0, 0.16 * s, 0], [0.13 * s, 0.2 * s, 0.13 * s]);
      mesh(CONE, mat('#9ad94a', { roughness: 0.15, emissive: col('#3a7a00'), emissiveIntensity: 0.5 }), tipG, [0, 0.04 * s, 0], [0.08 * s, 0.14 * s, 0.08 * s], [Math.PI, 0, 0], false);
    } else if (has('agua')) {
      mesh(shapeGeo([[0, 0], [0.42, 0.3, 0.38, 0.62], [0.1, 0.3, 0, 0.12], [-0.1, 0.3, -0.38, 0.62], [-0.42, 0.3, 0, 0]], 0.03, 0.02), mat('#7cc8ff', { roughness: 0.3 }), tipG, [0, 0, 0], [s, s, s], [0, Math.PI / 2, 0]);
    } else if (has('trevas')) {
      mesh(OCTA, mat('#6b3fd0', { emissive: col('#4a1fa0'), emissiveIntensity: 0.6 }), tipG, [0, 0.25 * s, 0], [0.16 * s, 0.34 * s, 0.16 * s]);
    } else {
      mesh(shapeGeo([[0, -0.05], [0.3, 0.15], [0, 0.55], [-0.3, 0.15]], 0.06, 0.03), M.spike, tipG, [0, 0, 0], [s, s, s], [0, Math.PI / 2, 0]);
    }
  }
  // Florzinha de cinco pétalas (enfeite das abelhas das Flores)
  function flowerOn(parent, p, s = 1, i = 0) {
    const g = new T.Group(); g.position.set(...p); g.rotation.set(0.3, i * 1.3, 0.2); parent.add(g);
    const pc = ['#ff7eb6', '#ffffff', '#c77dff'][i % 3];
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; mesh(SPH_LO, mat(pc, { roughness: 0.5 }), g, [Math.cos(a) * 0.1 * s, 0.03 * s, Math.sin(a) * 0.1 * s], [0.08 * s, 0.03 * s, 0.06 * s], [0, -a, 0]); }
    mesh(SPH_LO, mat('#ffc928', { roughness: 0.5 }), g, [0, 0.06 * s, 0], [0.06 * s, 0.04 * s, 0.06 * s], [0, 0, 0], false);
    return g;
  }
  // Enfeites de elemento nas costas (pontos em coordenadas do grupo pai)
  function backBits(parent, M, pts) {
    const has = M.has;
    pts.forEach(([x, y, z], i) => {
      if (has('terra')) mesh(ICO, mat('#9b7a55', { roughness: 0.9, flatShading: true }), parent, [x, y, z], [0.22, 0.17, 0.2], [i, i * 2, 0]);
      else if (has('gelo')) mesh(OCTA, mat('#e3f7ff', { transparent: true, opacity: 0.85, roughness: 0.05, metalness: 0.1 }), parent, [x, y + 0.08, z], [0.12, 0.34 - i * 0.05, 0.12], [0, 0, 0.3 - i * 0.2]);
      else if (has('planta')) flowerOn(parent, [x, y, z], 1, i);
      else if (has('eletrico')) mesh(shapeGeo([[0, 0], [0.12, 0.18], [0.04, 0.2], [0.16, 0.42], [-0.04, 0.18], [0.04, 0.16], [-0.06, 0]], 0.04, 0.015), mat('#ffe14d', { emissive: col('#ffb800'), emissiveIntensity: 0.5 }), parent, [x, y, z], [1.1, 1.1, 1.1]);
      else if (has('trevas')) mesh(OCTA, mat('#7b4fe0', { emissive: col('#4a1fa0'), emissiveIntensity: 0.5, flatShading: true }), parent, [x, y + 0.06, z], [0.13, 0.3, 0.13]);
      else if (has('metal')) [[0, 0, 0, 0.1], [0.12, 0.06, 0.06, 0.07], [-0.08, 0.1, -0.05, 0.055]].forEach(([dx, dy, dz, r]) => mesh(SPH_LO, mat('#9ad94a', { roughness: 0.15, emissive: col('#3a7a00'), emissiveIntensity: 0.5, transparent: true, opacity: 0.85 }), parent, [x + dx, y + dy + 0.06, z + dz], [r, r, r], [0, 0, 0], false));
      else mesh(CONE, M.spike, parent, [x, y + 0.08, z], [0.1, 0.24, 0.08], [0, 0, -0.3]);
    });
  }
  function crownOn(parent, M, p, s = 1) {
    const crown = new T.Group(); crown.position.set(...p); parent.add(crown);
    mesh(CYL, M.gold, crown, [0, 0, 0], [0.28 * s, 0.12 * s, 0.28 * s]);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(CONE, M.gold, crown, [Math.cos(a) * 0.24 * s, 0.17 * s, Math.sin(a) * 0.24 * s], [0.07 * s, 0.22 * s, 0.07 * s]); }
    mesh(OCTA, mat('#ff4d8d', { roughness: 0.1, emissive: col('#a0003a') }), crown, [0.27 * s, 0.02 * s, 0], [0.07 * s, 0.09 * s, 0.07 * s], [0, 0, 0], false);
    return crown;
  }
  function haloOn(root, M, p) {
    if (!M.has('luz')) return null;
    const halo = new T.Group(); halo.position.set(...p); root.add(halo);
    mesh(new T.TorusGeometry(0.42, 0.06, 10, 36), mat('#ffe680', { emissive: col('#ffc800'), emissiveIntensity: 0.8, metalness: 0.4 }), halo, [0, 0, 0], [1, 1, 1], [Math.PI / 2 - 0.25, 0, 0]);
    return halo;
  }
  function leg(parent, M, x, y, z, s, foot = 0.12) {
    mesh(SPH, M.body, parent, [x, y, z], [0.36 * s, 0.46 * s, 0.34 * s]);
    mesh(SPH, M.body, parent, [x + 0.08 * s, foot, z], [0.34 * s, 0.16, 0.3 * s]);
    for (let k = -1; k <= 1; k++) mesh(CONE, M.claw, parent, [x + 0.38 * s, foot - 0.02, z + k * 0.13 * s], [0.06, 0.16, 0.06], [0, 0, -Math.PI / 2], false);
  }
  function tailOf(root, M, parts, at, pts, r0, nSpikes = 3, tipS = 1) {
    const tail = new T.Group(); tail.position.set(...at); root.add(tail); parts.tail = tail;
    const tt = taper(pts, r0, 0.07, 14, 30);
    mesh(tt.geo, M.body, tail);
    const tip = tt.curve.getPointAt(1), tdir = tt.curve.getTangentAt(1);
    const tipG = new T.Group(); tipG.position.copy(tip); tipG.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), tdir); tail.add(tipG);
    tailTip(tipG, M, parts, tipS);
    for (let i = 1; i <= nSpikes; i++) {
      const u = i / (nSpikes + 1.2), p = tt.curve.getPointAt(u), tg = tt.curve.getTangentAt(u);
      const n = new T.Vector3(-tg.y, tg.x, 0).normalize();
      const r = r0 + (0.07 - r0) * u;
      const sg = new T.Group(); sg.position.copy(p).addScaledVector(n, r * 0.85); sg.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), n); tail.add(sg);
      mesh(CONE, M.spike, sg, [0, 0.07, 0], [0.08, 0.2 - u * 0.08, 0.06]);
    }
    return tail;
  }

  // ---------- Abelhas: quatro formatos de corpo feitos à mão (um por raridade) ----------
  // Comum = Operária (gordinha e redonda), Rara = Guardiã (mamangava peluda com escudo de favo),
  // Épica = Guerreira (cintura fina, elmo e ferrão de lança), Lendária = Soberana (coroa, gola e asas enormes).
  // A Vespa Rainha (chefe) tem um formato só dela.
  const STRIPE = '#2a1a12';
  // Abdômen listrado: um torno com cores por vértice (faixas da cor do elemento e marrom-escuro)
  function stripedGeo(len, rad, bands, c1, c2, o = {}) {
    const N = 26, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const r = rad * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.92 + 0.04)), 0.75) * (1 - (o.taper || 0.3) * t * t);
      pts.push(new T.Vector2(Math.max(0.001, r), -len / 2 + t * len));
    }
    const geo = new T.LatheGeometry(pts, 30);
    const pos = geo.attributes.position, cols = [], ca = col(c1), cb = col(c2);
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) + len / 2) / len;
      const band = Math.floor(t * bands);
      const c = t > 0.94 ? cb : band % 2 ? cb : ca;
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    geo.rotateZ(Math.PI / 2); // eixo do torno vira -x (ponta para trás)
    geo.computeVertexNormals();
    return geo;
  }
  function bMats(els, rar) {
    const M = dMats(els, rar);
    M.stripe = mat(STRIPE, { roughness: 0.6 });
    M.abd = mat('#ffffff', { vertexColors: true, roughness: 0.5 });
    M.fuzz = mat(mix(M.c2, '#fff1cf', 0.45), { roughness: 0.95 });
    M.face = mat(mix(M.c1, '#fff4dc', 0.3), { roughness: 0.5 });
    M.leg = mat(mix(STRIPE, M.c1, 0.15), { roughness: 0.6 });
    M.bwing = mat(mix(M.c2, '#ffffff', 0.7), { transparent: true, opacity: 0.62, roughness: 0.15, side: T.DoubleSide, emissive: col(M.c2).multiplyScalar(0.12), depthWrite: false });
    M.vein = mat(mix(M.c2, STRIPE, 0.35), { roughness: 0.4 });
    M.bwing = mat(mix(mix(M.c2, '#ffffff', 0.82), '#d8f0ff', 0.4), { transparent: true, opacity: 0.72, roughness: 0.15, side: T.DoubleSide, emissive: col('#9fd8ff').multiplyScalar(0.12), depthWrite: false });
    M.eyeD = mat('#2a150a', { roughness: 0.15 });
    M.irisB = mat(mix(M.iris.color.getHex(), '#5a2e12', 0.55), { roughness: 0.2 });
    M.mouth = mat('#5a1a14', { roughness: 0.5 });
    M.tongue = mat('#ff6f8a', { roughness: 0.5 });
    M.cheek = mat('#ff6f93', { transparent: true, opacity: 0.85, roughness: 0.6 });
    M.antTip = mat(mix(M.c1, '#2a1a10', 0.15), { roughness: 0.5 });
    return M;
  }
  // Olho de desenho fofo: quase todo escuro, com dois brilhos grandes e a cor do elemento embaixo
  function beeEye(head, p, alvo, s, M, brow = 0) {
    const g = new T.Group(); g.position.set(...p); head.add(g);
    g.lookAt(new T.Vector3(...alvo).add(head.position));
    mesh(SPH, M.eyeD, g, [0, 0, 0], [0.2 * s, 0.25 * s, 0.13 * s]);
    mesh(SPH, M.irisB, g, [0, -0.08 * s, 0.06 * s], [0.14 * s, 0.12 * s, 0.075 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.shine, g, [0.06 * s, 0.09 * s, 0.11 * s], [0.075 * s, 0.075 * s, 0.03 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.shine, g, [-0.07 * s, -0.04 * s, 0.115 * s], [0.035 * s, 0.035 * s, 0.02 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.shine, g, [0.0 * s, -0.13 * s, 0.1 * s], [0.02 * s, 0.02 * s, 0.015 * s], [0, 0, 0], false);
    if (brow) mesh(CYL, M.dark, g, [0, 0.31 * s, 0.05 * s], [0.035 * s, 0.26 * s, 0.035 * s], [0, 0, Math.PI / 2 - 0.2 * brow], false);
    return g;
  }
  // Cabeça grande e redonda (estilo chibi): olhos enormes de frente, bochechas rosadas, sorrisinho e antenas curtas
  function beeHead(M, s, o = {}) {
    const head = new T.Group();
    mesh(SPH, M.body, head, [0, 0, 0], [0.8 * s, 0.76 * s, 0.8 * s]);
    // sorriso aberto com linguinha
    const smile = new T.Group(); smile.position.set(0.74 * s, -0.24 * s, 0); smile.rotation.y = 0; head.add(smile);
    mesh(new T.SphereGeometry(1, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.mouth, smile, [0, 0.02 * s, 0], [0.05 * s, 0.09 * s, 0.13 * s], [0, 0, 0], false);
    mesh(SPH_LO, M.tongue, smile, [0.015 * s, -0.04 * s, 0], [0.04 * s, 0.03 * s, 0.07 * s], [0, 0, 0], false);
    if (o.fangs) [1, -1].forEach(z => mesh(CONE, M.claw, head, [0.76 * s, -0.3 * s, z * 0.07 * s], [0.035 * s, 0.09 * s, 0.035 * s], [Math.PI, 0, z * 0.25], false));
    [1, -1].forEach(z => mesh(SPH, M.cheek, head, [0.52 * s, -0.24 * s, z * 0.55 * s], [0.07 * s, 0.1 * s, 0.15 * s], [0, z * -0.85, 0], false));
    beeEye(head, [0.58 * s, 0.06 * s, 0.35 * s], [3, 0.2, 1.45], s * 1.22 * (o.eye || 1.05), M, o.brow || 0);
    beeEye(head, [0.58 * s, 0.06 * s, -0.35 * s], [3, 0.2, -1.45], s * 1.22 * (o.eye || 1.05), M, -(o.brow || 0));
    // topetinho de pelo
    [[0.1, 0.74, 0, 0.13], [-0.05, 0.72, 0.1, 0.1], [-0.02, 0.73, -0.1, 0.1]].forEach(([x, y, z, r]) => mesh(SPH_LO, M.body, head, [x * s, y * s, z * s], [r * s, r * 0.8 * s, r * s], [0, 0, 0], false));
    // antenas curtas e grossinhas, com bolinha na ponta
    const ants = [1, -1].map(z => {
      const a = new T.Group(); a.position.set(0.2 * s, 0.62 * s, z * 0.26 * s); head.add(a);
      const len = 0.72 * (o.ant || 1);
      const tb = taper([[0, 0, 0], [0.06, 0.3, z * 0.08], [0.22, 0.52, z * 0.16], [0.4, 0.58, z * 0.2]].map(p => p.map(v => v * s * len)), 0.045 * s, 0.03 * s, 8, 14);
      mesh(tb.geo, M.stripe, a, [0, 0, 0], [1, 1, 1], [0, 0, 0], false);
      mesh(SPH_LO, M.tier === 3 ? M.gold : M.has('luz') ? mat('#ffe680', { emissive: col('#ffc800'), emissiveIntensity: 0.8 }) : M.antTip, a, [0.4 * s * len, 0.58 * s * len, z * 0.2 * s * len], [0.12 * s, 0.12 * s, 0.12 * s]);
      return a;
    });
    head.userData.s = s;
    return { head, ants };
  }
  // Par de asas (anterior grande e posterior menor) de cada lado, presas ao tórax
  function beeWings(root, M, p, ws) {
    const fore = shapeGeo([[0, 0], [0.34, 0.42, 0.2, 1.0], [0.05, 1.36, -0.26, 1.05], [-0.34, 0.55, 0, 0]], 0.02, 0.012);
    const hind = shapeGeo([[0, 0], [0.24, 0.32, 0.12, 0.7], [0, 0.95, -0.2, 0.72], [-0.24, 0.36, 0, 0]], 0.02, 0.012);
    const mk = z => {
      const pivot = new T.Group(); pivot.position.set(p[0], p[1], z * p[2]); root.add(pivot);
      const w1 = new T.Group(); pivot.add(w1); w1.rotation.z = 0.55;
      mesh(fore, M.bwing, w1, [0, 0, 0], [ws, ws, ws]);
      const v = taper([[0, 0, 0], [0.05 * ws, 0.6 * ws, 0.012], [-0.08 * ws, 1.15 * ws, 0.012]], 0.022, 0.01, 6, 8);
      mesh(v.geo, M.vein, w1, [0, 0, z * 0.012], [1, 1, 1], [0, 0, 0], false);
      const w2 = new T.Group(); pivot.add(w2); w2.rotation.z = 1.2; w2.position.x = -0.12 * ws;
      mesh(hind, M.bwing, w2, [0, 0, 0], [ws, ws, ws]);
      return pivot;
    };
    return [mk(1), mk(-1)];
  }
  // Perninhas curtas e gordinhas sob o tórax
  function beeLegs(parent, M, x, y, s) {
    const legs = [];
    [-0.22, 0.04, 0.3].forEach((dx, k) => [1, -1].forEach(z => {
      const g = new T.Group(); g.position.set(x + dx * s, y + 0.12 * s, z * 0.26 * s); parent.add(g);
      const l = taper([[0, 0, 0], [0.04 * s, -0.16 * s, z * 0.08 * s], [(0.1 - k * 0.04) * s, -0.3 * s, z * 0.12 * s]], 0.07 * s, 0.055 * s, 8, 8);
      mesh(l.geo, M.leg, g, [0, 0, 0], [1, 1, 1], [0, 0, 0], false);
      mesh(SPH_LO, M.leg, g, [(0.12 - k * 0.04) * s, -0.32 * s, z * 0.12 * s], [0.085 * s, 0.06 * s, 0.085 * s], [0, 0, 0], false);
      legs.push(g);
    }));
    return legs;
  }
  // Abdômen com ferrão (ou a ponta do elemento) no fim
  function beeAbdomen(root, M, parts, at, len, rad, bands, o = {}) {
    const abd = new T.Group(); abd.position.set(...at); abd.rotation.z = o.tilt === undefined ? 0.28 : o.tilt; root.add(abd); parts.abd = abd;
    const geo = stripedGeo(len, rad, bands, o.c1 || M.c1, o.c2 || STRIPE, o);
    mesh(geo, M.abd, abd, [-len / 2 + 0.05, 0, 0]);
    const tipG = new T.Group(); tipG.position.set(-len + 0.08, 0, 0); tipG.rotation.z = Math.PI / 2; abd.add(tipG);
    const sl = o.sting || 1;
    mesh(CONE, o.stingMat || M.stripe, tipG, [0, 0.12 * sl, 0], [0.07 * sl, 0.32 * sl, 0.07 * sl]);
    if (!o.noTip && ['fogo', 'eletrico', 'planta', 'agua', 'trevas', 'metal'].some(M.has)) { const g2 = new T.Group(); g2.position.y = 0.3 * sl; tipG.add(g2); tailTip(g2, M, parts, 0.6); }
    return abd;
  }
  // Tórax peludo
  function thorax(parent, M, p, r) {
    mesh(SPH, M.fuzz, parent, p, [r, r * 0.95, r * 0.95]);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; mesh(SPH_LO, M.fuzz, parent, [p[0] + Math.cos(a) * r * 0.25, p[1] + r * 0.82, p[2] + Math.sin(a) * r * 0.55], [r * 0.24, r * 0.2, r * 0.24], [0, 0, 0], false); }
  }
  // Comum: Operária gordinha
  function buildOperaria(M) {
    const root = new T.Group(), parts = {};
    const body = new T.Group(); root.add(body); parts.body = body;
    thorax(body, M, [0.05, 1.75, 0], 0.58);
    beeAbdomen(body, M, parts, [-0.32, 1.72, 0], 1.45, 0.66, 5);
    parts.legs = beeLegs(body, M, 0.05, 1.32, 0.95);
    backBits(body, M, [[-0.05, 2.32, 0.15]]);
    const { head, ants } = beeHead(M, 1.42, { eye: 1.2 }); head.position.set(0.7, 2.08, 0); root.add(head); parts.head = head; parts.ants = ants;
    [parts.wingN, parts.wingF] = beeWings(root, M, [-0.15, 2.45, 0.32], 1.25);
    parts.halo = haloOn(root, M, [0.8, 3.0, 0]);
    return { root, parts, kind: 'operaria' };
  }
  // Rara: Guardiã, mamangava redonda com gola peluda e escudo de favo
  function buildGuardia(M) {
    const root = new T.Group(), parts = {};
    const body = new T.Group(); root.add(body); parts.body = body;
    thorax(body, M, [0.05, 1.8, 0], 0.72);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mesh(SPH_LO, M.fuzz, body, [0.45, 1.8 + Math.sin(a) * 0.5, Math.cos(a) * 0.5], [0.16, 0.16, 0.16], [0, 0, 0], false); }
    beeAbdomen(body, M, parts, [-0.45, 1.75, 0], 1.7, 0.86, 5, { taper: 0.2 });
    parts.legs = beeLegs(body, M, 0.08, 1.25, 1.1);
    // escudo hexagonal de favo, segurado pelas patas da frente
    const sh = new T.Group(); sh.position.set(0.55, 1.35, 0.62); sh.rotation.set(0, 0.55, 0); body.add(sh); parts.shield = sh;
    mesh(new T.CylinderGeometry(0.38, 0.38, 0.08, 6), M.tier === 3 ? M.gold : mat(mix(M.c2, '#ffcc66', 0.5), { roughness: 0.4 }), sh, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, Math.PI / 6]);
    mesh(new T.CylinderGeometry(0.2, 0.2, 0.1, 6), mat(mix(M.c2, '#fff4dc', 0.4), { roughness: 0.4 }), sh, [0, 0, 0.03], [1, 1, 1], [Math.PI / 2, 0, Math.PI / 6], false);
    backBits(body, M, [[-0.05, 2.5, 0.2], [-0.3, 2.4, -0.2]]);
    const { head, ants } = beeHead(M, 1.3, { eye: 1.15, ant: 0.9 }); head.position.set(0.88, 2.2, 0); root.add(head); parts.head = head; parts.ants = ants;
    [parts.wingN, parts.wingF] = beeWings(root, M, [-0.2, 2.6, 0.36], 1.3);
    parts.halo = haloOn(root, M, [0.95, 3.1, 0]);
    return { root, parts, kind: 'guardia' };
  }
  // Épica: Guerreira de cintura fina, elmo com crista e ferrão de lança
  function buildGuerreira(M) {
    const root = new T.Group(), parts = {};
    const body = new T.Group(); root.add(body); parts.body = body;
    thorax(body, M, [0.15, 1.95, 0], 0.5);
    mesh(SPH, M.stripe, body, [-0.32, 1.85, 0], [0.18, 0.16, 0.16], [0, 0, 0], false);
    beeAbdomen(body, M, parts, [-0.42, 1.82, 0], 2.0, 0.55, 7, { taper: 0.55, sting: 1.7, tilt: 0.38, stingMat: M.horn });
    parts.legs = beeLegs(body, M, 0.15, 1.55, 0.85);
    // bracinhos com lança
    parts.arms = [1].map(z => {
      const a = new T.Group(); a.position.set(0.4, 1.75, z * 0.42); body.add(a);
      mesh(CYL, M.leg, a, [0.1, -0.15, 0], [0.05, 0.4, 0.05], [0, 0, 0.6], false);
      mesh(CYL, mat('#8a5a2e'), a, [0.2, 0.2, 0.05], [0.035, 1.9, 0.035], [0, 0, -0.25], false);
      mesh(CONE, M.tier === 3 ? M.gold : M.horn, a, [0.44, 1.12, 0.05], [0.08, 0.28, 0.08], [0, 0, -0.25]);
      return a;
    });
    backBits(body, M, [[0.1, 2.48, 0.15]]);
    const { head, ants } = beeHead(M, 1.22, { eye: 1.05, fangs: true, brow: 1.0, ant: 1.1 }); head.position.set(0.88, 2.36, 0); root.add(head); parts.head = head; parts.ants = ants;
    // elmo com crista
    mesh(new T.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), M.tier === 3 ? M.gold : mat(mix(M.c2, '#c9d2e0', 0.5), { metalness: 0.35, roughness: 0.3 }), head, [-0.05, 0.08, 0], [0.74, 0.72, 0.76], [0, 0, 0.35]);
    for (let i = 0; i < 4; i++) mesh(CONE, M.wing, head, [(-0.1 - i * 0.16) * 0.95, (0.8 - i * 0.12) * 0.95, 0], [0.08, 0.3, 0.05], [0, 0, 0.7 + i * 0.25]);
    [parts.wingN, parts.wingF] = beeWings(root, M, [-0.05, 2.65, 0.3], 1.35);
    parts.halo = haloOn(root, M, [0.95, 3.3, 0]);
    return { root, parts, kind: 'guerreira' };
  }
  // Lendária: Soberana, abdômen longo, gola real, coroa e asas enormes
  function buildSoberana(M) {
    const root = new T.Group(), parts = {};
    const body = new T.Group(); root.add(body); parts.body = body;
    thorax(body, M, [0.1, 1.95, 0], 0.66);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mesh(SPH_LO, mat('#fff8ee', { roughness: 0.95 }), body, [0.5, 1.95 + Math.sin(a) * 0.55, Math.cos(a) * 0.55], [0.17, 0.17, 0.17], [0, 0, 0], false); }
    beeAbdomen(body, M, parts, [-0.45, 1.85, 0], 2.3, 0.78, 7, { taper: 0.4, sting: 1.2, stingMat: M.gold });
    // faixas douradas no abdômen
    [0.6, 1.25].forEach(x => mesh(new T.TorusGeometry(0.66, 0.035, 6, 30), M.gold, parts.abd, [-x, 0, 0], [1, 1, 1], [0, Math.PI / 2, 0], false));
    parts.legs = beeLegs(body, M, 0.12, 1.45, 1.0);
    backBits(body, M, [[0.0, 2.62, 0.2], [-0.25, 2.5, -0.2], [0.2, 2.55, -0.05]]);
    const { head, ants } = beeHead(M, 1.32, { eye: 1.12, ant: 1.15 }); head.position.set(0.92, 2.42, 0); root.add(head); parts.head = head; parts.ants = ants;
    parts.crown = crownOn(head, M, [0.0, 0.86, 0], 1.05);
    [parts.wingN, parts.wingF] = beeWings(root, M, [-0.1, 2.75, 0.36], 1.75);
    parts.halo = haloOn(root, M, [1.0, 3.55, 0]);
    return { root, parts, kind: 'soberana' };
  }
  // Chefe: Vespa Rainha, preta e laranja, olhos vermelhos, mandíbulas e coroa de espinhos
  function buildVespa() {
    const M = bMats(['trevas', 'fogo'], 'L');
    M.body = mat('#2b1a33', { roughness: 0.4 }); M.face = mat('#ff8a1f', { roughness: 0.45 });
    M.fuzz = mat('#3a2440', { roughness: 0.8 }); M.leg = mat('#1b1230');
    M.iris = mat('#ff2a2a', { emissive: col('#a00000'), emissiveIntensity: 0.6 });
    M.bwing = mat('#ffd9b0', { transparent: true, opacity: 0.55, roughness: 0.15, side: T.DoubleSide, emissive: col('#5a1a00'), depthWrite: false });
    M.vein = mat('#5a2a10'); M.has = () => false;
    const root = new T.Group(), parts = {};
    const body = new T.Group(); root.add(body); parts.body = body;
    thorax(body, M, [0.15, 2.0, 0], 0.6);
    mesh(SPH, M.stripe, body, [-0.38, 1.9, 0], [0.2, 0.17, 0.17], [0, 0, 0], false);
    beeAbdomen(body, M, parts, [-0.5, 1.85, 0], 2.4, 0.7, 8, { c1: '#ff8a1f', c2: '#1b1230', taper: 0.6, sting: 1.9, tilt: 0.42, stingMat: mat('#1b1230'), noTip: true });
    parts.legs = beeLegs(body, M, 0.15, 1.55, 1.0);
    const { head, ants } = beeHead(M, 1.3, { eye: 1.02, fangs: true, brow: 2.0, ant: 1.25 }); head.position.set(0.95, 2.42, 0); root.add(head); parts.head = head; parts.ants = ants;
    const crown = new T.Group(); crown.position.set(-0.05, 0.84, 0); head.add(crown);
    const cm = mat('#7a2a8a', { metalness: 0.3, roughness: 0.3, emissive: col('#3a0040') });
    mesh(CYL, cm, crown, [0, 0, 0], [0.3, 0.1, 0.3]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(CONE, cm, crown, [Math.cos(a) * 0.26, 0.2, Math.sin(a) * 0.26], [0.07, 0.34, 0.07], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]); }
    mesh(OCTA, mat('#ff3b3b', { emissive: col('#a00000') }), crown, [0.3, 0.02, 0], [0.08, 0.1, 0.08], [0, 0, 0], false);
    [parts.wingN, parts.wingF] = beeWings(root, M, [-0.05, 2.7, 0.3], 1.65);
    const b = { root, parts, kind: 'vespa', M };
    return b;
  }
  // Chefes do modo atos: vespas grandonas e malvadas (cabeça pequena e angulosa, olhos vermelhos puxados,
  // sobrancelha em V, mandíbulas curvas, cintura fina e ferrão enorme). Cada chefe tem sua armadura.
  const BOSS_OF = els => ({ 'fogo+metal': 'general', 'trevas+luz': 'imperatriz' })[els.join('+')] || 'rainha';
  function bossHead(M, s, eyeM) {
    const head = new T.Group();
    mesh(SPH, M.body, head, [0, 0, 0], [0.6 * s, 0.52 * s, 0.56 * s]);
    mesh(SPH, M.face, head, [0.22 * s, -0.1 * s, 0], [0.38 * s, 0.34 * s, 0.4 * s]);
    // olhos compostos grandes, puxados para cima e para fora
    [1, -1].forEach(z => {
      const e = new T.Group(); e.position.set(0.5 * s, 0.1 * s, z * 0.27 * s); e.rotation.set(z * -0.5, z * -0.35, -0.2); head.add(e);
      mesh(SPH, eyeM, e, [0, 0, 0], [0.16 * s, 0.13 * s, 0.2 * s]);
      mesh(SPH_LO, mat('#14060a', { roughness: 0.2 }), e, [0.15 * s, 0, 0], [0.04 * s, 0.03 * s, 0.11 * s], [0, 0, 0], false);
      mesh(SPH_LO, mat('#ffffff', { emissive: col('#ffffff'), emissiveIntensity: 0.4 }), e, [0.16 * s, 0.05 * s, z * -0.04 * s], [0.025 * s, 0.02 * s, 0.025 * s], [0, 0, 0], false);
      // sobrancelha grossa em V: a ponta de dentro desce
      mesh(BOX, M.dark, head, [0.6 * s, 0.27 * s, z * 0.2 * s], [0.12 * s, 0.08 * s, 0.36 * s], [z * 0.6, 0, -0.25]);
    });
    // mandíbulas curvas com dentes
    [1, -1].forEach(z => {
      const m = taper([[0.45 * s, -0.32 * s, z * 0.16 * s], [0.68 * s, -0.48 * s, z * 0.24 * s], [0.88 * s, -0.42 * s, z * 0.1 * s], [0.92 * s, -0.34 * s, z * 0.0 * s]], 0.08 * s, 0.015 * s, 8, 12);
      mesh(m.geo, M.claw, head, [0, 0, 0], [1, 1, 1], [0, 0, 0]);
      mesh(CONE, M.claw, head, [0.74 * s, -0.36 * s, z * 0.12 * s], [0.025 * s, 0.07 * s, 0.025 * s], [0, 0, Math.PI * 0.9], false);
    });
    // antenas com cotovelo, apontando para trás
    const ants = [1, -1].map(z => {
      const a = new T.Group(); a.position.set(0.3 * s, 0.38 * s, z * 0.14 * s); head.add(a);
      const tb = taper([[0, 0, 0], [0.12 * s, 0.4 * s, z * 0.08 * s], [-0.1 * s, 0.75 * s, z * 0.22 * s], [-0.45 * s, 0.85 * s, z * 0.3 * s]], 0.035 * s, 0.012 * s, 8, 16);
      mesh(tb.geo, M.dark, a, [0, 0, 0], [1, 1, 1], [0, 0, 0], false);
      return a;
    });
    head.userData.s = s;
    return { head, ants };
  }
  // v8.2: chefes refeitos no mesmo estilo chibi das abelhas do jogador, mas malvados: cabeça grande e redonda
  // com máscara escura de vespa, olhos vermelhos brilhando sob pálpebras bravas, sorriso de dentes,
  // mandíbulas, cintura fina, abdômen listrado com ferrão grande, braços com arma e armadura própria.
  function villainHead(M, s, C) {
    const head = new T.Group();
    mesh(SPH, M.face, head, [0, 0, 0], [0.82 * s, 0.78 * s, 0.82 * s]);
    // máscara escura no alto da cabeça, descendo em ponta entre os olhos
    mesh(new T.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2.3), M.body, head, [-0.02 * s, 0.03 * s, 0], [0.84 * s, 0.8 * s, 0.84 * s], [0, 0, 0.28], false);
    mesh(CONE, M.body, head, [0.7 * s, 0.12 * s, 0], [0.09 * s, 0.3 * s, 0.07 * s], [0, 0, Math.PI * 0.62], false);
    const eyeM = mat(C.eye, { roughness: 0.15, emissive: col(C.eye), emissiveIntensity: 1.1 });
    [1, -1].forEach(z => {
      const g = new T.Group(); g.position.set(0.6 * s, 0.02 * s, z * 0.34 * s); head.add(g);
      g.lookAt(new T.Vector3(3, 0.1, z * 1.5).add(head.position));
      mesh(SPH, M.eyeD, g, [0, 0, 0], [0.3 * s, 0.3 * s, 0.14 * s]);
      mesh(SPH, eyeM, g, [0, -0.06 * s, 0.07 * s], [0.19 * s, 0.16 * s, 0.08 * s], [0, 0, 0], false);
      mesh(SPH_LO, M.eyeD, g, [0, -0.06 * s, 0.13 * s], [0.045 * s, 0.1 * s, 0.03 * s], [0, 0, 0], false);
      mesh(SPH_LO, M.shine, g, [0.08 * s, 0.03 * s, 0.13 * s], [0.055 * s, 0.055 * s, 0.02 * s], [0, 0, 0], false);
      // pálpebra brava: tampa o alto do olho, inclinada para dentro
      const lid = new T.Group(); lid.position.set(0, 0.05 * s, 0.02 * s); lid.rotation.z = -z * 0.42; g.add(lid);
      mesh(new T.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.body, lid, [0, 0, 0], [0.33 * s, 0.26 * s, 0.17 * s], [0, 0, 0], false);
      mesh(BOX, M.dark, lid, [0, 0.17 * s, 0.05 * s], [0.44 * s, 0.08 * s, 0.09 * s], [0, 0, 0], false);
    });
    // sorriso malvado com dentes
    const grin = new T.Group(); grin.position.set(0.74 * s, -0.3 * s, 0); head.add(grin);
    mesh(new T.SphereGeometry(1, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.mouth, grin, [0, 0.03 * s, 0], [0.05 * s, 0.08 * s, 0.22 * s], [0, 0, 0], false);
    for (let i = 0; i < 6; i++) mesh(CONE, M.shine, grin, [0.03 * s, 0.0, (-0.17 + i * 0.068) * s], [0.026 * s, 0.06 * s, 0.026 * s], [Math.PI, 0, 0], false);
    // mandíbulas curvas dos lados da boca
    [1, -1].forEach(z => {
      const m = taper([[0.55 * s, -0.36 * s, z * 0.3 * s], [0.78 * s, -0.5 * s, z * 0.3 * s], [0.92 * s, -0.46 * s, z * 0.16 * s]], 0.07 * s, 0.02 * s, 8, 10);
      mesh(m.geo, M.claw, head, [0, 0, 0], [1, 1, 1], [0, 0, 0]);
    });
    // antenas em cotovelo, finas e pontudas
    const ants = [1, -1].map(z => {
      const a = new T.Group(); a.position.set(0.25 * s, 0.6 * s, z * 0.24 * s); head.add(a);
      const tb = taper([[0, 0, 0], [0.1 * s, 0.32 * s, z * 0.06 * s], [0.02 * s, 0.6 * s, z * 0.16 * s], [-0.22 * s, 0.74 * s, z * 0.26 * s]], 0.05 * s, 0.015 * s, 8, 14);
      mesh(tb.geo, M.dark, a, [0, 0, 0], [1, 1, 1], [0, 0, 0], false);
      return a;
    });
    head.userData.s = s;
    return { head, ants };
  }
  function buildBoss(els) {
    const kind = BOSS_OF(els);
    const C = {
      general:    { face: '#e89a1c', body: '#2a1a14', stripe: '#1a100c', eye: '#ff2a1a', wing: '#ffb07a', armor: '#4e5868' },
      rainha:     { face: '#e0741a', body: '#3a1f48', stripe: '#2a1236', eye: '#ff1a3a', wing: '#e0a0ff', armor: '#7a2a8a' },
      imperatriz: { face: '#cfc4ea', body: '#1c1030', stripe: '#120a20', eye: '#d04cff', wing: '#c99cff', armor: '#ffcc33' },
    }[kind];
    const M = bMats(kind === 'imperatriz' ? ['trevas', 'luz'] : ['trevas', 'fogo'], 'L');
    M.body = mat(C.body, { roughness: 0.4 }); M.face = mat(C.face, { roughness: 0.45 });
    M.fuzz = mat(mix(C.body, '#000000', 0.15), { roughness: 0.9 }); M.leg = mat(C.stripe, { roughness: 0.55 });
    M.claw = mat('#120608', { roughness: 0.3 }); M.dark = mat('#0e0608', { roughness: 0.5 }); M.stripe = M.dark;
    M.mouth = mat('#3a0610', { roughness: 0.5 });
    M.bwing = mat(C.wing, { transparent: true, opacity: 0.55, roughness: 0.15, side: T.DoubleSide, emissive: col(C.wing).multiplyScalar(0.25), depthWrite: false });
    M.vein = mat(mix(C.body, '#000000', 0.2)); M.has = () => false;
    const armor = mat(C.armor, { metalness: 0.45, roughness: 0.3, emissive: col(C.armor).multiplyScalar(0.12) });
    const gold = mat('#ffcc33', { metalness: 0.5, roughness: 0.25, emissive: col('#5a3a00'), emissiveIntensity: 0.35 });
    const root = new T.Group(), parts = {};
    const body = new T.Group(); root.add(body); parts.body = body;
    thorax(body, M, [0.2, 2.0, 0], 0.62);
    mesh(SPH, M.dark, body, [-0.3, 1.9, 0], [0.16, 0.14, 0.14], [0, 0, 0], false); // cintura fina
    beeAbdomen(body, M, parts, [-0.42, 1.86, 0], 2.4, 0.7, 7, { c1: C.face, c2: C.stripe, taper: 0.6, sting: 2.3, tilt: 0.42, stingMat: kind === 'general' ? armor : M.claw, noTip: true });
    parts.legs = beeLegs(body, M, 0.2, 1.5, 1.05);
    // bracinhos em garra
    parts.arms = [1, -1].map(z => {
      const a = new T.Group(); a.position.set(0.6, 1.85, z * 0.62); body.add(a);
      mesh(CYL, M.leg, a, [0.12, -0.12, 0], [0.08, 0.36, 0.08], [0, 0, 0.9], false);
      mesh(SPH_LO, M.leg, a, [0.28, -0.22, 0], [0.11, 0.11, 0.11], [0, 0, 0], false);
      return a;
    });
    const { head, ants } = villainHead(M, 1.3, C); head.position.set(1.05, 2.55, 0); root.add(head); parts.head = head; parts.ants = ants;
    if (kind === 'general') {
      // elmo de metal com crista vermelha, ombreiras e cicatriz
      mesh(new T.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.3), armor, head, [-0.06, 0.12, 0], [1.34, 1.28, 1.34], [0, 0, 0.32]);
      for (let i = 0; i < 6; i++) mesh(CONE, mat('#d8341c', { roughness: 0.4 }), head, [-0.05 - i * 0.2, 1.22 - i * 0.16, 0], [0.09, 0.36, 0.05], [0, 0, 0.55 + i * 0.22]);
      [1, -1].forEach(z => { mesh(SPH, armor, body, [0.3, 2.42, z * 0.55], [0.32, 0.18, 0.28], [z * 0.35, 0, 0]); mesh(CONE, armor, body, [0.3, 2.6, z * 0.62], [0.06, 0.2, 0.06], [z * 0.6, 0, 0]); });
      mesh(BOX, mat('#7a1010'), head, [1.0, 0.38, 0.46], [0.05, 0.42, 0.05], [0.3, 0.6, 0.45], false);
    } else if (kind === 'rainha') {
      // coroa de espinhos roxa com rubi e gola de espinhos
      const crown = new T.Group(); crown.position.set(-0.05, 1.12, 0); crown.scale.setScalar(1.55); head.add(crown);
      mesh(CYL, armor, crown, [0, 0, 0], [0.34, 0.12, 0.34]);
      for (let i = 0; i < 7; i++) { const ang = i / 7 * Math.PI * 2; mesh(CONE, armor, crown, [Math.cos(ang) * 0.3, 0.26, Math.sin(ang) * 0.3], [0.07, 0.44, 0.07], [Math.sin(ang) * 0.3, 0, -Math.cos(ang) * 0.3]); }
      mesh(OCTA, mat('#ff2a3a', { emissive: col('#a00010'), emissiveIntensity: 0.9 }), crown, [0.34, 0.05, 0], [0.1, 0.13, 0.1], [0, 0, 0], false);
      for (let i = 0; i < 9; i++) { const ang = i / 9 * Math.PI * 2; mesh(CONE, M.dark, body, [0.62, 2.1 + Math.sin(ang) * 0.5, Math.cos(ang) * 0.5], [0.06, 0.3, 0.06], [ang, 0, -Math.PI / 2]); }
    } else {
      // Imperatriz: coroa alta de ouro com joias, gola de espinhos e anéis de ouro no abdômen
      const crown = new T.Group(); crown.position.set(-0.05, 1.14, 0); crown.scale.setScalar(1.6); head.add(crown);
      mesh(CYL, gold, crown, [0, 0, 0], [0.36, 0.16, 0.36]);
      for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2, h = i % 2 ? 0.36 : 0.6; mesh(CONE, gold, crown, [Math.cos(ang) * 0.32, h / 2 + 0.06, Math.sin(ang) * 0.32], [0.08, h, 0.08]); }
      [0, 2, 4, 6].forEach(i => { const ang = i / 8 * Math.PI * 2; mesh(OCTA, mat('#c23cff', { emissive: col('#6a00a0'), emissiveIntensity: 0.9 }), crown, [Math.cos(ang) * 0.37, 0.06, Math.sin(ang) * 0.37], [0.07, 0.09, 0.07], [0, 0, 0], false); });
      for (let i = 0; i < 10; i++) { const ang = i / 10 * Math.PI * 2; mesh(CONE, M.dark, body, [0.62, 2.1 + Math.sin(ang) * 0.52, Math.cos(ang) * 0.52], [0.06, 0.34, 0.06], [ang, 0, -Math.PI / 2]); }
      [0.7, 1.4].forEach(x => mesh(new T.TorusGeometry(0.62, 0.04, 6, 30), gold, parts.abd, [-x, 0, 0], [1, 1, 1], [0, Math.PI / 2, 0], false));
    }
    [parts.wingN, parts.wingF] = beeWings(root, M, [-0.35, 2.85, 0.34], kind === 'imperatriz' ? 1.8 : 1.6);
    return { root, parts, kind: 'chefe', M, wingZ: -0.45 };
  }
  const BODY_OF = { C: buildOperaria, R: buildGuardia, E: buildGuerreira, L: buildSoberana };
  const isVespa = (els, rar) => rar === 'L' && els[0] === 'trevas' && els[1] === 'fogo';
  // BetMel: Soberana dourada com óculos escuros e uma moeda de mel na coroa (só sai na roleta)
  const isBetMel = (els, rar) => rar === 'L' && els[0] === 'eletrico' && els[1] === 'luz';
  function buildBetMel() {
    const M = bMats(['eletrico', 'luz'], 'L');
    M.body = mat('#ffc928', { metalness: 0.35, roughness: 0.3, emissive: col('#5a3a00'), emissiveIntensity: 0.25 });
    const b = buildSoberana(M); b.M = M;
    const h = b.parts.head, s = 1.32, dark = mat('#14101c', { roughness: 0.2, metalness: 0.4 });
    [1, -1].forEach(z => mesh(SPH, dark, h, [0.66 * s, 0.1 * s, z * 0.3 * s], [0.1 * s, 0.17 * s, 0.2 * s], [0, z * 0.5, 0]));
    mesh(BOX, dark, h, [0.76 * s, 0.14 * s, 0], [0.05 * s, 0.05 * s, 0.22 * s], [0, 0, 0], false);
    mesh(CYL, M.gold, h, [0.0, 1.15 * s, 0], [0.26 * s, 0.05 * s, 0.26 * s], [Math.PI / 2, 0, 0]);
    return b;
  }
  function buildBee(els, rar) {
    if (rar === 'B') return buildBoss(els);
    if (isVespa(els, rar)) return buildVespa();
    if (isBetMel(els, rar)) return buildBetMel();
    const M = bMats(els, rar);
    const b = BODY_OF[rar](M);
    b.M = M;
    return b;
  }
  // Pose do quadro t (0..1): asas zumbindo, corpo flutuando, abdômen e antenas balançando
  function poseBee(d, t) {
    const P = d.parts, s = Math.sin(t * Math.PI * 2), c = Math.cos(t * Math.PI * 2);
    const buzz = Math.abs(Math.sin(t * Math.PI * 4)); // duas batidas por ciclo
    const open = 0.15 + 0.85 * buzz;
    const wz = d.wingZ === undefined ? 0.15 : d.wingZ;
    P.wingN.rotation.set(-open, 0.35, wz);
    P.wingF.rotation.set(open, -0.35, wz);
    d.root.position.y = 0.12 * s;
    if (P.abd) P.abd.rotation.y = 0.12 * c;
    P.head.rotation.set(0.05 * c, 0, 0.05 * s);
    if (P.ants) P.ants.forEach((a, i) => a.rotation.set(0.15 * Math.sin(t * Math.PI * 2 + i), 0, 0.12 * Math.sin(t * Math.PI * 4 + i)));
    if (P.legs) P.legs.forEach((l, i) => { l.rotation.z = 0.12 * Math.sin(t * Math.PI * 2 + i * 0.8); });
    if (P.arms) P.arms.forEach((a, i) => a.rotation.set(0, 0, 0.08 * Math.sin(t * Math.PI * 2 + i)));
    if (P.shield) P.shield.rotation.z = 0.06 * s;
    if (P.halo) P.halo.position.y = P.head.position.y + 1.3 + 0.05 * s;
    if (P.flame) P.flame.scale.setScalar(1 + 0.12 * Math.sin(t * Math.PI * 8));
  }
  // Câmera fixa para todas as abelhas (mesma escala em todo o jogo)
  const FW = 240, FH = 200, NF = 8;
  const dcam = new T.OrthographicCamera(-3.1, 3.1, 2.58, -2.58, 0.1, 50);
  dcam.position.set(1.5, 3.4, 7.5); dcam.lookAt(0, 1.85, 0);
  const dScene = new T.Scene(); lights(dScene, 'dragon');
  const stripCanvas = document.createElement('canvas');
  stripCanvas.width = FW * NF; stripCanvas.height = FH;
  const sctx = stripCanvas.getContext('2d');
  // Visual comprado na loja: chapéu na cabeça e cor das asas
  function dressBee(d, skin) {
    if (!skin) return;
    const h = d.parts.head, s = (h.userData.s || 1), y = 0.6 * s;
    if (skin.hat) {
      if (d.parts.crown) d.parts.crown.visible = false;
      const g = new T.Group(); g.position.set(-0.05 * s, y, 0); g.rotation.z = 0.18; h.add(g);
      if (skin.hat === 'palha') {
        const m = mat('#f2cf7a', { roughness: 0.9 });
        mesh(CYL, m, g, [0, 0, 0], [0.62 * s, 0.04 * s, 0.62 * s]);
        mesh(CYL, m, g, [0, 0.14 * s, 0], [0.32 * s, 0.26 * s, 0.32 * s]);
        mesh(CYL, mat('#ff5f7e'), g, [0, 0.06 * s, 0], [0.335 * s, 0.07 * s, 0.335 * s], [0, 0, 0], false);
      } else if (skin.hat === 'cartola') {
        const m = mat('#1e1626', { roughness: 0.35 });
        mesh(CYL, m, g, [0, 0, 0], [0.5 * s, 0.04 * s, 0.5 * s]);
        mesh(CYL, m, g, [0, 0.3 * s, 0], [0.3 * s, 0.6 * s, 0.3 * s]);
        mesh(CYL, mat('#e0402e'), g, [0, 0.1 * s, 0], [0.31 * s, 0.09 * s, 0.31 * s], [0, 0, 0], false);
      } else if (skin.hat === 'bone') {
        const m = mat('#3aa0ff', { roughness: 0.6 });
        mesh(new T.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), m, g, [0, -0.04 * s, 0], [0.42 * s, 0.3 * s, 0.42 * s]);
        mesh(CYL, m, g, [0.4 * s, -0.03 * s, 0], [0.26 * s, 0.03 * s, 0.3 * s]);
        mesh(SPH_LO, mat('#ffffff'), g, [0, 0.27 * s, 0], [0.06 * s, 0.06 * s, 0.06 * s], [0, 0, 0], false);
      } else if (skin.hat === 'flores') {
        mesh(new T.TorusGeometry(0.4 * s, 0.05 * s, 6, 24), mat('#4f9a38'), g, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false);
        ['#ff5fa2', '#ffd23f', '#ffffff', '#c77dff', '#ff9a3c', '#ff5fa2', '#9be7ff'].forEach((c, i) => { const a = i / 7 * Math.PI * 2; mesh(SPH_LO, mat(c), g, [Math.cos(a) * 0.4 * s, 0.03 * s, Math.sin(a) * 0.4 * s], [0.11 * s, 0.07 * s, 0.11 * s]); });
      } else if (skin.hat === 'coroa') {
        crownOn(h, d.M || bMats(['luz'], 'L'), [0, 0.66 * s, 0], 0.95 * s);
      }
    }
    if (skin.wing) {
      const wc = { borboleta: ['#ff5fa2', 0.85, '#7a1a5a'], ouro: ['#ffd23f', 0.8, '#7a4a00'], fada: ['#9be7ff', 0.55, '#1a6a8a'] }[skin.wing];
      if (wc) {
        const wm = mat(wc[0], { transparent: true, opacity: wc[1], roughness: 0.2, side: T.DoubleSide, emissive: col(wc[2]), emissiveIntensity: 0.35, depthWrite: false });
        [d.parts.wingN, d.parts.wingF].forEach(w => w && w.traverse(n => { if (n.isMesh && n.material && n.material.transparent) n.material = wm; }));
      }
    }
  }
  // sombreado de desenho (4 tons suaves) para as abelhas
  const beeRamp = new T.DataTexture(new Uint8Array([100, 155, 210, 255]), 4, 1, T.RedFormat);
  beeRamp.minFilter = beeRamp.magFilter = T.NearestFilter; beeRamp.needsUpdate = true;
  const beeToon = new Map();
  function toonBee(root) {
    root.traverse(n => {
      if (!n.isMesh || !n.material || n.material.type !== 'MeshStandardMaterial') return;
      const m = n.material;
      if (!beeToon.has(m)) beeToon.set(m, new T.MeshToonMaterial({ color: m.color.clone(), map: m.map || null, gradientMap: beeRamp, emissive: m.emissive ? m.emissive.clone() : 0, emissiveIntensity: m.emissiveIntensity,
        transparent: m.transparent, opacity: m.opacity, side: m.side, vertexColors: m.vertexColors, depthWrite: m.depthWrite }));
      n.material = beeToon.get(m);
    });
  }
  function dragonStrip(els, rar, skin) {
    OUT = 0.045;
    const d = buildBee(els, rar);
    dressBee(d, skin);
    const sc = { operaria: 1.22, guardia: 1.1, guerreira: 1.05, soberana: 0.96, vespa: 0.98, chefe: 1.0 }[d.kind];
    d.root.scale.setScalar(sc);
    const holder = new T.Group(); holder.add(d.root); holder.rotation.y = -0.62;
    toonBee(holder);
    dScene.add(holder);
    R.setPixelRatio(1); R.setSize(FW, FH, false);
    sctx.clearRect(0, 0, stripCanvas.width, FH);
    for (let i = 0; i < NF; i++) {
      poseBee(d, i / NF);
      d.root.position.x = 0.45;
      d.root.position.y += -0.85;
      R.render(dScene, dcam);
      sctx.drawImage(R.domElement, i * FW, 0);
    }
    dScene.remove(holder);
    disposeTree(holder);
    return stripCanvas;
  }
  function disposeTree(o) { o.traverse(n => { if (n.isMesh && n.geometry && ![SPH, SPH_LO, CONE, CYL, BOX, OCTA, ICO].includes(n.geometry)) n.geometry.dispose(); }); }

  // ---------- Construções (câmera isométrica 2:1 igual à do mapa) ----------
  const PX = 32 / Math.SQRT1_2; // pixels por unidade do mundo (1 tile = 1 unidade)
  const SC = 2; // renderiza em 2x para ficar nítido
  const iScene = new T.Scene(); lights(iScene, 'iso');
  const icam = new T.OrthographicCamera(-1, 1, 1, -1, -50, 50);
  {
    const el = Math.atan(Math.SQRT1_2 * 0.70710678 / Math.SQRT1_2) // placeholder
    icam.position.set(10, 10 * Math.SQRT2 * Math.tan(Math.PI / 6), 10); icam.lookAt(0, 0, 0); icam.updateMatrixWorld();
  }
  function isoRender(group) {
    OUT = 0.022;
    iScene.add(group);
    group.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(group);
    if (box.isEmpty()) { iScene.remove(group); const cv = document.createElement('canvas'); cv.width = cv.height = 1; return { canvas: cv, w: 1, h: 1, ax: 0, ay: 0 }; }
    const v = new T.Vector3(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    icam.updateMatrixWorld(); const inv = icam.matrixWorldInverse;
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyMatrix4(inv);
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
    }
    const m = 0.08; x0 -= m; x1 += m; y0 -= m; y1 += m;
    // a escala do mapa: 1 unidade horizontal da câmera = PX pixels
    const kx = PX * Math.SQRT1_2 / Math.SQRT1_2; // projeção já usa unidades da câmera
    const w = Math.ceil((x1 - x0) * PX), h = Math.ceil((y1 - y0) * PX);
    icam.left = x0; icam.right = x0 + w / PX; icam.top = y1; icam.bottom = y1 - h / PX; icam.updateProjectionMatrix();
    R.setPixelRatio(1); R.setSize(w * SC, h * SC, false);
    R.render(iScene, icam);
    const o = new T.Vector3(0, 0, 0).applyMatrix4(inv);
    const cv = document.createElement('canvas'); cv.width = w * SC; cv.height = h * SC;
    cv.getContext('2d').drawImage(R.domElement, 0, 0);
    iScene.remove(group); disposeTree(group);
    return { canvas: cv, w, h, ax: (o.x - x0) * PX, ay: (y1 - o.y) * PX };
  }

  // Plataforma de lote
  // Plataforma hexagonal, como um alvéolo de favo, com borda de cera
  function platform(g, size, top, side, hgt = 0.22) {
    const r = size * 0.6;
    mesh(new T.CylinderGeometry(r, r, hgt, 6), mat(side, { roughness: 0.9 }), g, [0, hgt / 2 - hgt, 0], [1, 1, 1], [0, Math.PI / 12, 0]);
    mesh(new T.CylinderGeometry(r - 0.04, r - 0.04, 0.05, 6), mat(top, { roughness: 0.95 }), g, [0, 0.0, 0], [1, 1, 1], [0, Math.PI / 12, 0], false);
    mesh(new T.TorusGeometry(r - 0.03, 0.045, 6, 6), mat('#f0c060', { roughness: 0.6 }), g, [0, 0.03, 0], [1, 1, 1], [Math.PI / 2, 0, Math.PI / 12 + Math.PI / 6], false);
  }
  function cobble(g, size) {
    const m1 = mat('#d9c48f', { roughness: 0.9 }), m2 = mat('#c7ae73', { roughness: 0.9 });
    const n = 7, st = size / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (Math.abs(i - 3) + Math.abs(j - 3) > 4) continue;
      mesh(new T.BoxGeometry(st * 0.86, 0.05, st * 0.86), (i + j) % 2 ? m1 : m2, g, [(i - 3) * st, 0.04, (j - 3) * st], [1, 1, 1], [0, ((i * 7 + j * 3) % 5) * 0.03, 0], false);
    }
  }
  const B = {};
  B.arena = () => {
    const g = new T.Group();
    platform(g, 2.9, '#cbb489', '#8a7350', 0.28);
    const stone = mat('#e7dcc1', { roughness: 0.85 }), stoneD = mat('#b9a77f', { roughness: 0.9 });
    const wall = new T.CylinderGeometry(1.25, 1.32, 0.75, 40, 1, true);
    mesh(wall, mat('#e2d4b0', { roughness: 0.85, side: T.DoubleSide }), g, [0, 0.38, 0]);
    mesh(new T.TorusGeometry(1.28, 0.08, 8, 48), stone, g, [0, 0.76, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    mesh(new T.TorusGeometry(1.31, 0.06, 8, 48), stoneD, g, [0, 0.05, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    // arcos
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      mesh(new T.BoxGeometry(0.1, 0.42, 0.12), mat('#4a3424'), g, [Math.cos(a) * 1.3, 0.32, Math.sin(a) * 1.3], [1, 1, 1], [0, -a, 0], false);
      mesh(new T.BoxGeometry(0.1, 0.8, 0.16), stone, g, [Math.cos(a + 0.2) * 1.32, 0.4, Math.sin(a + 0.2) * 1.32], [1, 1, 1], [0, -a - 0.2, 0], false);
    }
    // arquibancadas e areia
    mesh(new T.CylinderGeometry(1.2, 1.0, 0.5, 40, 1, true), mat('#c8b48a', { side: T.DoubleSide }), g, [0, 0.5, 0], [1, 1, 1], [0, 0, 0], false);
    mesh(new T.CylinderGeometry(0.95, 0.95, 0.06, 40), mat('#e7c47d', { roughness: 1 }), g, [0, 0.25, 0], [1, 1, 1], [0, 0, 0], false);
    mesh(new T.TorusGeometry(0.55, 0.02, 6, 40), mat('#c99a4e'), g, [0, 0.29, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false);
    // torres com bandeiras
    [[1.25, 1.25, '#ff7a3d'], [-1.25, 1.25, '#62e3ff'], [1.25, -1.25, '#ffcc4d'], [-1.25, -1.25, '#c77dff']].forEach(([x, z, c]) => {
      mesh(new T.CylinderGeometry(0.2, 0.24, 1.05, 16), stone, g, [x, 0.52, z]);
      mesh(new T.ConeGeometry(0.27, 0.42, 16), mat('#c9473f'), g, [x, 1.25, z]);
      mesh(new T.CylinderGeometry(0.015, 0.015, 0.4, 6), mat('#3b2a1a'), g, [x, 1.6, z], [1, 1, 1], [0, 0, 0], false);
      mesh(shapeGeo([[0, 0], [0.32, -0.08], [0, -0.18]], 0.01, 0.005), mat(c, { side: T.DoubleSide }), g, [x, 1.78, z], [1, 1, 1], [0, Math.PI / 4, 0]);
    });
    return g;
  };
  B.cruzar = () => {
    const g = new T.Group();
    platform(g, 1.9, '#f6c768', '#a8641a');
    cobble(g, 1.6);
    const mm = mat('#c28cf0', { roughness: 0.7, flatShading: true }), md = mat('#9a62d6', { roughness: 0.7, flatShading: true });
    mesh(new T.ConeGeometry(0.6, 1.5, 7), mm, g, [-0.15, 0.75, -0.2], [1, 1, 0.9], [0, 0.3, 0]);
    mesh(new T.ConeGeometry(0.48, 1.1, 7), md, g, [0.4, 0.55, 0.25], [1, 1, 0.9], [0, 1, 0]);
    mesh(new T.ConeGeometry(0.2, 0.36, 7), mat('#ffffff', { flatShading: true }), g, [-0.15, 1.33, -0.2], [1.02, 1, 0.92], [0, 0.3, 0], false);
    mesh(new T.ConeGeometry(0.16, 0.28, 7), mat('#ffffff', { flatShading: true }), g, [0.4, 0.97, 0.25], [1.02, 1, 0.92], [0, 1, 0], false);
    const hs = new T.Shape(); hs.moveTo(0, -0.35); hs.bezierCurveTo(-0.5, 0, -0.35, 0.38, 0, 0.18); hs.bezierCurveTo(0.35, 0.38, 0.5, 0, 0, -0.35);
    const hg = new T.ExtrudeGeometry(hs, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 16 }); hg.translate(0, 0, -0.06);
    mesh(hg, mat('#ff4f86', { roughness: 0.3, emissive: col('#801030'), emissiveIntensity: 0.4 }), g, [0.05, 1.95, 0.05], [0.9, 0.9, 0.9], [0, Math.PI / 4, 0]);
    // pequenas flores rosas
    [[0.65, -0.55], [-0.6, 0.6], [0.7, 0.65]].forEach(([x, z]) => mesh(SPH_LO, mat('#ff8fbf'), g, [x, 0.1, z], [0.08, 0.08, 0.08]));
    return g;
  };
  B.chocadeira = () => {
    const g = new T.Group();
    platform(g, 1.9, '#f6c768', '#a8641a');
    cobble(g, 1.6);
    mesh(new T.CylinderGeometry(0.75, 0.82, 0.22, 32), mat('#8a6a3a', { roughness: 0.8 }), g, [0, 0.12, 0]);
    const egg = new T.LatheGeometry(Array.from({ length: 21 }, (_, i) => { const t = i / 20, a = t * Math.PI; return new T.Vector2(Math.sin(a) * 0.62 * (1 - 0.25 * t), -Math.cos(a) * 0.8); }), 40);
    mesh(egg, mat('#fff6e0', { roughness: 0.4 }), g, [0, 0.95, 0], [1, 1, 1]);
    [[0.32, 1.2, 0.45, '#ffb35c'], [-0.15, 0.85, 0.6, '#62e3ff'], [0.55, 0.75, 0.15, '#c77dff'], [0.1, 1.45, 0.3, '#7bd389']].forEach(([x, y, z, c]) => mesh(SPH_LO, mat(c), g, [x, y, z], [0.1, 0.1, 0.06], [0, Math.atan2(x, z), 0], false));
    // porta
    mesh(new T.CylinderGeometry(0.2, 0.2, 0.08, 20, 1, false, 0, Math.PI), mat('#5c4630'), g, [0.42, 0.55, 0.42], [1, 1.5, 1], [Math.PI / 2, 0, -Math.PI / 4 - Math.PI / 2]);
    // ovos ao redor
    [[-0.75, 0.5, '#ff7a3d'], [0.55, -0.72, '#62e3ff'], [-0.6, -0.65, '#ffd166']].forEach(([x, z, c]) => mesh(SPH, mat(c, { roughness: 0.35 }), g, [x, 0.17, z], [0.12, 0.16, 0.12]));
    return g;
  };
  B.loja = () => {
    const g = new T.Group();
    platform(g, 1.9, '#f6c768', '#a8641a');
    cobble(g, 1.6);
    const wood = mat('#b5793f', { roughness: 0.8 }), woodD = mat('#7a4d26', { roughness: 0.8 });
    mesh(new T.BoxGeometry(1.2, 0.5, 0.55), wood, g, [0, 0.26, 0.15]);
    mesh(new T.BoxGeometry(1.26, 0.06, 0.62), woodD, g, [0, 0.53, 0.15]);
    [[-0.58, -0.25], [0.58, -0.25], [-0.58, 0.4], [0.58, 0.4]].forEach(([x, z]) => mesh(new T.CylinderGeometry(0.04, 0.04, 1.2, 8), woodD, g, [x, 0.6, z]));
    // toldo listrado
    for (let i = 0; i < 6; i++) {
      const x = -0.6 + i * 0.24 + 0.12;
      mesh(new T.BoxGeometry(0.24, 0.04, 0.85), mat(i % 2 ? '#ffffff' : '#ff5a5a', { roughness: 0.7 }), g, [x, 1.28, 0.05], [1, 1, 1], [0.32, 0, 0], false);
      mesh(new T.CylinderGeometry(0.12, 0.12, 0.04, 16, 1, false, 0, Math.PI), mat(i % 2 ? '#ffffff' : '#ff5a5a'), g, [x, 1.13, 0.47], [1, 1, 1], [Math.PI / 2, 0, Math.PI], false);
    }
    // mercadorias: moedas, gemas, sacos
    [[-0.35, 0.62, 0.2], [-0.25, 0.65, 0.05]].forEach(p => mesh(new T.CylinderGeometry(0.1, 0.1, 0.035, 20), mat('#ffcc33', { metalness: 0.3, roughness: 0.25 }), g, p, [1, 1, 1], [0.3, 0, 0.2], false));
    mesh(OCTA, mat('#5ed0ff', { roughness: 0.05, metalness: 0.2, flatShading: true }), g, [0.1, 0.72, 0.15], [0.12, 0.16, 0.12]);
    mesh(OCTA, mat('#ff5d8f', { roughness: 0.05, flatShading: true }), g, [0.32, 0.68, 0.25], [0.09, 0.12, 0.09]);
    mesh(SPH, mat('#d9b27a', { roughness: 0.9 }), g, [0.75, 0.22, 0.55], [0.18, 0.22, 0.18]);
    mesh(SPH, mat('#c9a06a', { roughness: 0.9 }), g, [-0.75, 0.2, 0.6], [0.16, 0.2, 0.16]);
    mesh(new T.BoxGeometry(0.3, 0.26, 0.3), woodD, g, [0.7, 0.13, -0.55]);
    return g;
  };
  B.missoes = () => {
    const g = new T.Group();
    platform(g, 1.9, '#f6c768', '#a8641a');
    cobble(g, 1.6);
    const wood = mat('#b5793f', { roughness: 0.8 }), woodD = mat('#6b4423', { roughness: 0.8 });
    const board = new T.Group(); board.rotation.y = Math.PI / 4; g.add(board);
    [-0.6, 0.6].forEach(x => mesh(new T.BoxGeometry(0.1, 1.5, 0.1), woodD, board, [x, 0.75, 0]));
    mesh(new T.BoxGeometry(1.25, 0.8, 0.08), wood, board, [0, 0.95, 0]);
    mesh(new T.BoxGeometry(1.35, 0.08, 0.14), woodD, board, [0, 1.38, 0]);
    // telhado
    mesh(new T.BoxGeometry(1.5, 0.05, 0.42), mat('#d9473f'), board, [0, 1.52, 0.1], [1, 1, 1], [0.45, 0, 0]);
    mesh(new T.BoxGeometry(1.5, 0.05, 0.42), mat('#b8352e'), board, [0, 1.52, -0.1], [1, 1, 1], [-0.45, 0, 0]);
    [[-0.38, 1.0, -0.08], [0, 0.95, 0], [0.38, 1.02, 0.06]].forEach(([x, y, r]) => {
      mesh(new T.BoxGeometry(0.3, 0.42, 0.01), mat('#fff8e6', { roughness: 0.9 }), board, [x, y, 0.05], [1, 1, 1], [0, 0, r], false);
      mesh(SPH_LO, mat('#e04040'), board, [x, y + 0.17, 0.07], [0.03, 0.03, 0.02], [0, 0, 0], false);
    });
    mesh(new T.BoxGeometry(0.28, 0.2, 0.2), woodD, g, [0.6, 0.1, 0.55], [1, 1, 1], [0, 0.4, 0]);
    return g;
  };
  // Habitats com tema do elemento
  const HTOP = { fogo: '#5b4038', agua: '#8fd7a0', planta: '#7fd35a', terra: '#c79a63', eletrico: '#8a8fa8', gelo: '#e9f6ff', metal: '#a7b0bf', trevas: '#4a3a66', luz: '#fff0bf', none: '#e3a64e' };
  const HSIDE = { fogo: '#3a2522', agua: '#5b7d5a', planta: '#5b8a3a', terra: '#8a6a3f', eletrico: '#555a70', gelo: '#9cc8e6', metal: '#6c7480', trevas: '#2b2140', luz: '#c9a650', none: '#a8641a' };
  // visual das skins de colmeia: cores do cortiço e enfeite no topo
  const HSK = { real: ['#ffd23a', '#d99a10', 'coroa'], doce: ['#ffa8cf', '#fff1f6', 'coracao'], cristal: ['#a8ecff', '#5fb8e6', 'gema'], noite: ['#7a5fc0', '#3e2c70', 'lua'], abobora: ['#ff8a2a', '#c85a10', 'folha'] };
  B.habitat = th0 => {
    const [th, sk] = String(th0).split('/'), HS = HSK[sk];
    const g = new T.Group();
    platform(g, 1.9, HTOP[th], HSIDE[th], 0.28);
    // borda de pedras
    const rim = mat(th === 'gelo' ? '#cfeaff' : th === 'fogo' ? '#4a3330' : th === 'trevas' ? '#3a2d55' : '#cfc6b2', { roughness: 0.9, flatShading: true });
    for (let i = 0; i < 20; i++) {
      const s = i % 5, side = Math.floor(i / 5), t = -0.8 + s * 0.4;
      const [x, z] = [[t, -0.88], [0.88, t], [-t, 0.88], [-0.88, -t]][side];
      mesh(ICO, rim, g, [x, 0.06, z], [0.1, 0.07, 0.1], [i, i * 2, 0], false);
    }
    // colmeia de palha (cortiço) no fundo do lote
    const skep = new T.Group(); skep.position.set(-0.55, 0, -0.55); g.add(skep);
    const glow = sk === 'cristal' ? { emissive: col('#3aa8e0'), emissiveIntensity: 0.35, roughness: 0.25 } : sk === 'real' ? { metalness: 0.4, roughness: 0.35 } : { roughness: 0.85 };
    const straw = mat(HS ? HS[0] : '#e0a84a', glow), strawD = mat(HS ? HS[1] : '#c48a32', HS ? glow : { roughness: 0.9 });
    [[0.42, 0.1], [0.4, 0.26], [0.36, 0.42], [0.3, 0.56], [0.2, 0.68], [0.09, 0.76]].forEach(([r, y], k) => mesh(new T.TorusGeometry(r, 0.085, 8, 24), k % 2 ? strawD : straw, skep, [0, y, 0], [1, 1, 1], [Math.PI / 2, 0, 0], k < 3));
    mesh(SPH, straw, skep, [0, 0.42, 0], [0.4, 0.4, 0.4], [0, 0, 0], false);
    mesh(new T.CylinderGeometry(0.11, 0.11, 0.06, 18, 1, false, 0, Math.PI), mat('#3a2412'), skep, [0.28, 0.14, 0.28], [1, 1.2, 1], [Math.PI / 2, 0, -Math.PI / 4 - Math.PI / 2], false);
    mesh(SPH_LO, mat('#ffb000', { emissive: col('#a05a00'), emissiveIntensity: 0.4, roughness: 0.2 }), skep, [0.33, 0.04, 0.33], [0.1, 0.04, 0.1], [0, 0, 0], false);
    if (HS) {
      const top = new T.Group(); top.position.set(0, 0.86, 0); skep.add(top);
      if (HS[2] === 'coroa') { const gd = mat('#ffd23a', { metalness: 0.5, roughness: 0.3 }); mesh(new T.CylinderGeometry(0.14, 0.16, 0.08, 10), gd, top, [0, 0.02, 0]); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(CONE, gd, top, [Math.cos(a) * 0.12, 0.1, Math.sin(a) * 0.12], [0.04, 0.1, 0.04]); } mesh(SPH_LO, mat('#e0302a', { roughness: 0.2 }), top, [0, 0.08, 0.15], [0.04, 0.04, 0.04], [0, 0, 0], false); }
      else if (HS[2] === 'coracao') { const rd = mat('#ff4f8a', { roughness: 0.35 }); mesh(SPH, rd, top, [-0.06, 0.1, 0], [0.09, 0.09, 0.09]); mesh(SPH, rd, top, [0.06, 0.1, 0], [0.09, 0.09, 0.09]); mesh(CONE, rd, top, [0, 0.02, 0], [0.13, -0.14, 0.09]); }
      else if (HS[2] === 'gema') mesh(OCTA, mat('#c8f4ff', { emissive: col('#5fc8ff'), emissiveIntensity: 0.8, roughness: 0.1, flatShading: true }), top, [0, 0.14, 0], [0.12, 0.18, 0.12]);
      else if (HS[2] === 'lua') { mesh(new T.CylinderGeometry(0.02, 0.02, 0.2, 6), mat('#3a2a4a'), top, [0, 0.08, 0]); mesh(SPH, mat('#fff3b0', { emissive: col('#ffd860'), emissiveIntensity: 1 }), top, [0, 0.22, 0], [0.08, 0.08, 0.08]); }
      else if (HS[2] === 'folha') { mesh(new T.CylinderGeometry(0.03, 0.04, 0.14, 6), mat('#5a3a1a'), top, [0, 0.05, 0]); mesh(SPH, mat('#5cb84a', { roughness: 0.7 }), top, [0.09, 0.1, 0], [0.12, 0.03, 0.07], [0, 0, 0.4]); }
    }
    const lava = () => mat('#ff8a1f', { emissive: col('#ff5a00'), emissiveIntensity: 0.9, roughness: 0.4 });
    if (th === 'fogo') {
      mesh(new T.CylinderGeometry(0.42, 0.42, 0.04, 28), lava(), g, [-0.4, 0.04, 0.35], [1, 1, 0.8]);
      mesh(new T.ConeGeometry(0.32, 0.6, 7), mat('#3d2a26', { flatShading: true }), g, [0.5, 0.3, -0.5]);
      mesh(new T.CylinderGeometry(0.08, 0.08, 0.02, 12), lava(), g, [0.5, 0.6, -0.5], [1, 1, 1], [0, 0, 0], false);
      [[0.6, 0.55], [-0.6, -0.4]].forEach(([x, z]) => mesh(ICO, mat('#3d2a26', { flatShading: true }), g, [x, 0.1, z], [0.14, 0.12, 0.14]));
    } else if (th === 'agua') {
      mesh(new T.CylinderGeometry(0.55, 0.55, 0.04, 32), mat('#3fb2ec', { roughness: 0.1, metalness: 0.2 }), g, [-0.25, 0.04, 0.25], [1, 1, 0.85]);
      mesh(new T.TorusGeometry(0.55, 0.05, 8, 32), mat('#e9dcb0'), g, [-0.25, 0.04, 0.25], [1, 0.85, 1], [Math.PI / 2, 0, 0], false);
      [[-0.15, 0.2], [-0.45, 0.4]].forEach(([x, z]) => mesh(new T.CylinderGeometry(0.1, 0.1, 0.02, 16), mat('#4caf50'), g, [x, 0.07, z], [1, 1, 1], [0, 0, 0], false));
      mesh(new T.ConeGeometry(0.04, 0.4, 6), mat('#4b8a3a'), g, [0.55, 0.2, -0.5], [1, 1, 1], [0.1, 0, 0.1]);
      mesh(new T.ConeGeometry(0.04, 0.32, 6), mat('#4b8a3a'), g, [0.62, 0.16, -0.42], [1, 1, 1], [-0.1, 0, -0.1]);
    } else if (th === 'planta') {
      [[0.55, -0.5, 0.26], [-0.6, 0.45, 0.22], [0.6, 0.5, 0.18]].forEach(([x, z, r]) => mesh(SPH, mat('#4fb84a', { roughness: 0.8 }), g, [x, r * 0.8, z], [r, r * 0.85, r]));
      [[0.1, -0.6, '#ff7ab6'], [-0.5, -0.3, '#ffd23f'], [0.3, 0.65, '#ffffff'], [-0.2, 0.6, '#c77dff']].forEach(([x, z, c]) => { mesh(new T.CylinderGeometry(0.01, 0.01, 0.16, 5), mat('#2f7d38'), g, [x, 0.08, z], [1, 1, 1], [0, 0, 0], false); mesh(SPH_LO, mat(c), g, [x, 0.17, z], [0.05, 0.04, 0.05], [0, 0, 0], false); });
    } else if (th === 'terra') {
      [[0.5, 0.45, 0.4], [-0.1, 0.65, 0.3]].forEach(([x, z, r]) => mesh(SPH, mat('#ecc27a', { roughness: 1 }), g, [x, 0, z], [r, r * 0.35, r * 0.8]));
      const cac = mat('#5aa04a', { roughness: 0.7 });
      mesh(CYL, cac, g, [0.55, 0.32, -0.5], [0.09, 0.62, 0.09]); mesh(SPH_LO, cac, g, [0.55, 0.63, -0.5], [0.09, 0.07, 0.09], [0, 0, 0], false);
      mesh(CYL, cac, g, [0.68, 0.36, -0.5], [0.05, 0.2, 0.05], [0, 0, 0], false); mesh(CYL, cac, g, [0.62, 0.3, -0.5], [0.05, 0.14, 0.05], [0, 0, Math.PI / 2], false);
      mesh(ICO, mat('#b0845a', { roughness: 0.95, flatShading: true }), g, [-0.6, 0.1, 0.5], [0.14, 0.1, 0.13]);
    } else if (th === 'eletrico') {
      mesh(new T.CylinderGeometry(0.05, 0.08, 0.9, 10), mat('#6c7480', { metalness: 0.3, roughness: 0.3 }), g, [0.55, 0.45, -0.5]);
      [0.3, 0.45, 0.6].forEach(y => mesh(new T.TorusGeometry(0.11, 0.025, 6, 16), mat('#d98a2b', { metalness: 0.3, roughness: 0.3 }), g, [0.55, y, -0.5], [1, 1, 1], [Math.PI / 2, 0, 0], false));
      mesh(SPH, mat('#ffe14d', { emissive: col('#ffcc00'), emissiveIntensity: 1 }), g, [0.55, 0.95, -0.5], [0.12, 0.12, 0.12]);
      [[-0.6, 0.5], [0.6, 0.55]].forEach(([x, z]) => mesh(ICO, mat('#6a6f88', { flatShading: true }), g, [x, 0.1, z], [0.14, 0.12, 0.14]));
    } else if (th === 'gelo') {
      [[0.55, -0.5, 0.5], [0.35, -0.6, 0.32], [-0.6, 0.5, 0.4], [0.6, 0.45, 0.28]].forEach(([x, z, h], i) => mesh(OCTA, mat('#d8f2ff', { transparent: true, opacity: 0.9, roughness: 0.05, metalness: 0.1 }), g, [x, h * 0.5, z], [0.13, h, 0.13], [0, i, (i % 2 ? 0.2 : -0.2)]));
    } else if (th === 'metal') {
      mesh(new T.CylinderGeometry(0.42, 0.42, 0.04, 28), mat('#8fd14f', { emissive: col('#3a7a00'), emissiveIntensity: 0.5, roughness: 0.2 }), g, [0.35, 0.04, 0.4], [1, 1, 0.8]);
      [[0.55, -0.5, 0.3, '#9b5cff'], [0.3, -0.62, 0.2, '#8fd14f'], [-0.6, 0.5, 0.24, '#9b5cff']].forEach(([x, z, h, c]) => {
        mesh(CYL, mat('#f3ead2'), g, [x, h / 2, z], [0.05, h, 0.05], [0, 0, 0], false);
        mesh(new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(c, { roughness: 0.5 }), g, [x, h, z], [h * 0.65, h * 0.5, h * 0.65]);
      });
      [[0.2, 0.3], [0.5, 0.5]].forEach(([x, z]) => mesh(SPH_LO, mat('#c8ff7a', { emissive: col('#5aa000'), emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }), g, [x, 0.12, z], [0.05, 0.05, 0.05], [0, 0, 0], false));
    } else if (th === 'trevas') {
      [[0.55, -0.5, 0.55], [0.35, -0.65, 0.32], [-0.6, 0.5, 0.42]].forEach(([x, z, h], i) => mesh(OCTA, mat('#9b5cff', { emissive: col('#5a1fd0'), emissiveIntensity: 0.6, roughness: 0.2, flatShading: true }), g, [x, h * 0.5, z], [0.13, h, 0.13], [0, i, i % 2 ? 0.25 : -0.2]));
    } else if (th === 'luz') {
      [[0.6, -0.6], [-0.6, 0.6]].forEach(([x, z]) => {
        mesh(new T.CylinderGeometry(0.09, 0.11, 0.7, 12), mat('#fff3d0', { roughness: 0.4 }), g, [x, 0.35, z]);
        mesh(SPH, mat('#ffe680', { emissive: col('#ffc800'), emissiveIntensity: 0.9 }), g, [x, 0.8, z], [0.1, 0.1, 0.1]);
      });
    }
    return g;
  };
  B.tree = n => {
    const g = new T.Group();
    if (n % 2) {
      mesh(new T.CylinderGeometry(0.06, 0.08, 0.3, 8), mat('#6b4a2b'), g, [0, 0.15, 0]);
      [[0.42, 0.6, 0.45], [0.34, 0.5, 0.82], [0.24, 0.42, 1.12]].forEach(([r, h, y]) => mesh(new T.ConeGeometry(r, h, 9), mat('#2f9a52', { roughness: 0.8, flatShading: true }), g, [0, y, 0]));
    } else {
      mesh(new T.CylinderGeometry(0.06, 0.09, 0.55, 8), mat('#7a5230'), g, [0, 0.27, 0]);
      [[0, 0.75, 0, 0.36], [0.2, 0.6, 0.1, 0.26], [-0.18, 0.62, -0.05, 0.27], [0.02, 0.62, 0.22, 0.25]].forEach(([x, y, z, r]) => mesh(SPH, mat('#56c04a', { roughness: 0.8 }), g, [x, y, z], [r, r * 0.92, r]));
      [[0.18, 0.72, 0.25], [-0.12, 0.85, 0.28], [0.32, 0.55, 0.1]].forEach(p => mesh(SPH_LO, mat('#ff4d4d', { roughness: 0.3 }), g, p, [0.05, 0.05, 0.05], [0, 0, 0], false));
    }
    return g;
  };
  B.rock = () => { const g = new T.Group(); mesh(ICO, mat('#a3a3ad', { flatShading: true, roughness: 0.9 }), g, [0, 0.12, 0], [0.22, 0.17, 0.2], [0.4, 0.5, 0]); mesh(ICO, mat('#8f8f9a', { flatShading: true, roughness: 0.9 }), g, [0.2, 0.07, 0.12], [0.11, 0.09, 0.1], [1, 0, 0]); return g; };
  B.bush = () => { const g = new T.Group(); [[0, 0.15, 0, 0.2], [0.18, 0.12, 0.08, 0.15], [-0.16, 0.11, 0.06, 0.14]].forEach(([x, y, z, r]) => mesh(SPH, mat('#4fb84a', { roughness: 0.85 }), g, [x, y, z], [r, r * 0.85, r])); mesh(SPH_LO, mat('#ffd23f'), g, [0.05, 0.3, 0.12], [0.04, 0.04, 0.04], [0, 0, 0], false); return g; };
  B.farm = () => { const g = new T.Group(); platform(g, 0.92, '#7a5230', '#4a2f19', 0.12); for (let i = 0; i < 4; i++) mesh(new T.BoxGeometry(0.8, 0.06, 0.1), mat('#5e3d22', { roughness: 1 }), g, [0, 0.04, -0.3 + i * 0.2], [1, 1, 1], [0, 0, 0], false); return g; };

  // Construções com modelos prontos da KayKit (CC0); sem eles, ficam as versões procedurais acima
  const PB = { arena: B.arena, cruzar: B.cruzar, loja: B.loja, missoes: B.missoes, tree: B.tree, rock: B.rock, habitat: B.habitat, farm: B.farm, chocadeira: B.chocadeira };
  const honeyAtlasCache = new Map();
  function honeyAtlas(m) {
    if (honeyAtlasCache.has(m)) return honeyAtlasCache.get(m);
    let out = m;
    try {
      const img = m.map.image, w = img.width, h = img.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0); const d = cx.getImageData(0, 0, w, h), px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], gg = px[i + 1], b = px[i + 2];
        if (r > 90 && r > gg * 1.7 && r > b * 1.6) { const l = r / 255; px[i] = Math.min(255, 255 * (0.62 + l * 0.42)); px[i + 1] = Math.min(255, 255 * (0.36 + l * 0.42)); px[i + 2] = Math.min(255, 255 * (0.02 + l * 0.12)); }
      }
      cx.putImageData(d, 0, 0);
      const t = new T.CanvasTexture(cv); t.flipY = m.map.flipY; t.encoding = m.map.encoding; t.wrapS = m.map.wrapS; t.wrapT = m.map.wrapT; t.magFilter = m.map.magFilter; t.minFilter = m.map.minFilter;
      out = m.clone(); out.map = t;
    } catch (e) { /* sem tinta nova: fica o original */ }
    honeyAtlasCache.set(m, out); return out;
  }
  // Arena: castelo de pedra com telhados de colmeia dourada e mel escorrendo (como na imagem de referência)
  B.arena = () => { if (!G.castle) return PB.arena(); const g = new T.Group(); platform(g, 2.9, '#cbb489', '#8a7350', 0.28); cobble(g, 2.5); const c = glb('castle', g, [0, 0.03, 0], 2.0, Math.PI / 4);
    // a textura do KayKit é um atlas: repinta o vermelho dos telhados de mel dourado
    c.traverse(n => { if (n.isMesh && n.material && n.material.map) n.material = honeyAtlas(n.material); });
    const sk = B.deco('skep'); sk.scale.setScalar(0.9); sk.position.set(0.95, 0.03, 0.95); sk.rotation.y = Math.PI / 4; g.add(sk);
    [[1.15, -1.15, '#e0402e'], [-1.15, 1.15, '#ffc53a']].forEach(([x, z, cc]) => { const f = glb('flag', g, [x, 0.03, z], 0.35); if (f) f.traverse(n => { if (n.isMesh && n.material && n.material.color && n.material.color.r > 0.45 && n.material.color.g < 0.3) n.material = mat(cc); }); });
    glb('barrel', g, [1.2, 0.03, 0.55], 0.22); glb('crate', g, [0.55, 0.03, 1.2], 0.24); return g; };
  // Mercado: três barracas com toldos listrados, balcões com potes de mel, frutas e caixotes
  B.loja = () => { const g = new T.Group(); platform(g, 1.9, '#f6c768', '#a8641a'); cobble(g, 1.6);
    const wood = mat('#9a5a28', { roughness: 0.8 }), woodD = mat('#6a3a14', { roughness: 0.8 }), jar = mat('#f2a91e', { roughness: 0.2 }), lid = mat('#fff3c4', { roughness: 0.6 });
    const row = new T.Group(); row.rotation.y = Math.PI / 4; g.add(row);
    [[-0.62, 0.02, '#e0402e', '#fff4e0'], [0, -0.18, '#ffc53a', '#e0402e'], [0.62, 0.02, '#ff8a2a', '#fff4e0']].forEach(([x, z, c1, c2], k) => {
      const st = new T.Group(); st.position.set(x, 0.03, z); st.rotation.y = (k - 1) * -0.25; row.add(st);
      [[-0.26, -0.18], [0.26, -0.18], [-0.26, 0.18], [0.26, 0.18]].forEach(([px, pz]) => mesh(CYL, woodD, st, [px, 0.33, pz], [0.025, 0.66, 0.025]));
      mesh(BOX, wood, st, [0, 0.17, 0.12], [0.6, 0.3, 0.2]);
      mesh(BOX, woodD, st, [0, 0.33, 0.12], [0.64, 0.03, 0.24]);
      const a1 = mat(c1, { roughness: 0.6 }), a2 = mat(c2, { roughness: 0.6 });
      for (let i = 0; i < 6; i++) mesh(BOX, i % 2 ? a2 : a1, st, [-0.275 + i * 0.11, 0.7, 0.02], [0.11, 0.025, 0.56], [0.32, 0, 0], false);
      for (let i = 0; i < 6; i++) mesh(SPH_LO, i % 2 ? a2 : a1, st, [-0.275 + i * 0.11, 0.6, 0.3], [0.055, 0.05, 0.03], [0, 0, 0], false);
      // mercadorias: potes de mel na barraca do meio, frutas e flores nas outras
      if (k === 1) [-0.18, 0, 0.18].forEach(px => { mesh(new T.CylinderGeometry(0.055, 0.06, 0.11, 14), jar, st, [px, 0.4, 0.13]); mesh(new T.CylinderGeometry(0.062, 0.062, 0.025, 14), lid, st, [px, 0.47, 0.13], [1, 1, 1], [0, 0, 0], false); });
      else for (let i = 0; i < 7; i++) mesh(SPH_LO, mat(k ? ['#ff5fa2', '#ffd23f', '#ffffff'][i % 3] : ['#e0402e', '#ff9a2a', '#7ac24a'][i % 3], { roughness: 0.5 }), st, [-0.2 + (i % 4) * 0.13, 0.39 + Math.floor(i / 4) * 0.05, 0.08 + Math.floor(i / 4) * 0.08], [0.05, 0.05, 0.05], [0, 0, 0], false);
    });
    if (G.crate) { glb('crate', g, [0.72, 0.03, 0.55], 0.22); glb('crate', g, [0.78, 0.2, 0.5], 0.16, 0.5); }
    if (G.sack) glb('sack', g, [-0.55, 0.03, 0.75], 0.22);
    const pj = B.deco('potmel'); pj.scale.setScalar(0.7); pj.position.set(0.25, 0.03, 0.8); g.add(pj);
    return g; };
  // Mural de missões: quadro de madeira com bilhetes presos, favo no canto, moita atrás e mel escorrendo
  B.missoes = () => { const g = new T.Group(); platform(g, 1.9, '#f6c768', '#a8641a'); cobble(g, 1.6);
    const wood = mat('#9a5a28', { roughness: 0.8 }), woodD = mat('#5a3010', { roughness: 0.8 }), paper = mat('#fff1c8', { roughness: 0.9 }), cork = mat('#c98a4a', { roughness: 0.9 });
    const bush = B.deco('moita'); bush.scale.setScalar(1.7); bush.position.set(-0.45, 0.03, -0.45); g.add(bush);
    const bd = new T.Group(); bd.rotation.y = Math.PI / 4; bd.position.set(0.05, 0.03, 0.05); bd.scale.setScalar(1.2); g.add(bd);
    [-0.6, 0.6].forEach(x => mesh(BOX, woodD, bd, [x, 0.55, 0], [0.09, 1.1, 0.09]));
    mesh(BOX, wood, bd, [0, 0.72, 0], [1.25, 0.8, 0.07]);
    mesh(BOX, cork, bd, [0, 0.72, 0.04], [1.08, 0.64, 0.02], [0, 0, 0], false);
    mesh(BOX, woodD, bd, [0, 1.16, 0.02], [1.4, 0.07, 0.2], [0.2, 0, 0]);
    [[-0.3, 0.86, 0.06, 0.26, 0.2, '#ff5f7e'], [0.05, 0.9, -0.08, 0.22, 0.24, '#3aa0ff'], [0.33, 0.8, 0.05, 0.24, 0.3, '#7ac24a'], [-0.22, 0.56, -0.04, 0.3, 0.2, '#ffc53a'], [0.16, 0.55, 0.08, 0.24, 0.18, '#c77dff']]
      .forEach(([x, y, r, w, h, pin]) => { mesh(BOX, paper, bd, [x, y, 0.055], [w, h, 0.01], [0, 0, r], false); mesh(SPH_LO, mat(pin), bd, [x, y + h / 2 - 0.03, 0.065], [0.025, 0.025, 0.02], [0, 0, 0], false);
        [0.03, -0.02, -0.06].forEach(dy => mesh(BOX, woodD, bd, [x, y + dy, 0.062], [w * 0.7, 0.008, 0.004], [0, 0, r], false)); });
    const fv = B.deco('favo'); fv.scale.setScalar(0.9); fv.rotation.x = Math.PI / 2; fv.position.set(-0.5, 1.05, 0.08); bd.add(fv);
    const hm = mat('#f2a91e', { roughness: 0.2 });
    [[-0.45, 0.35], [-0.32, 0.22], [-0.56, 0.28]].forEach(([x, h]) => { mesh(CYL, hm, bd, [x, 1.0 - h / 2, 0.08], [0.025, h, 0.025], [0, 0, 0], false); mesh(SPH_LO, hm, bd, [x, 1.0 - h, 0.08], [0.035, 0.045, 0.035], [0, 0, 0], false); });
    if (G.barrel) glb('barrel', g, [0.7, 0.03, 0.55], 0.22);
    const fl = B.deco('flores'); fl.position.set(0.55, 0.03, 0.75); g.add(fl);
    return g; };
  B.cruzar = () => {
    // Laboratório: torre de pedra e cera com cúpula de vidro, frasco borbulhando e cristais roxos em volta
    const g = new T.Group(); platform(g, 1.9, '#f6c768', '#a8641a'); cobble(g, 1.5);
    const stone = mat('#9a8670', { roughness: 0.85 }), stoneD = mat('#6e5c4a', { roughness: 0.9 }), wax = mat('#f2b23a', { roughness: 0.4 }), wood = mat('#7a4a22', { roughness: 0.8 });
    const glass = new T.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.35, depthWrite: false });
    const goo = mat('#7dff9a', { roughness: 0.2, emissive: col('#2fd06a'), emissiveIntensity: 0.9 });
    const crys = mat('#b77dff', { roughness: 0.15, emissive: col('#6a2fd0'), emissiveIntensity: 0.7, flatShading: true });
    const crys2 = mat('#7fd4ff', { roughness: 0.15, emissive: col('#2a7ad0'), emissiveIntensity: 0.6, flatShading: true });
    // base e torre hexagonais
    mesh(new T.CylinderGeometry(0.62, 0.7, 0.3, 6), stoneD, g, [0, 0.17, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
    mesh(new T.CylinderGeometry(0.5, 0.56, 0.62, 6), stone, g, [0, 0.62, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
    mesh(new T.CylinderGeometry(0.57, 0.57, 0.07, 6), wax, g, [0, 0.95, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
    // porta e janelas redondas que brilham
    mesh(BOX, wood, g, [0.0, 0.47, 0.5], [0.22, 0.34, 0.04]);
    mesh(new T.CylinderGeometry(0.11, 0.11, 0.04, 16), wood, g, [0, 0.64, 0.5], [1, 1, 1], [Math.PI / 2, 0, 0]);
    [[-0.42, 0.25], [0.42, 0.25]].forEach(([x, z]) => mesh(new T.CylinderGeometry(0.075, 0.075, 0.03, 14), goo, g, [x, 0.7, z], [1, 1, 1], [Math.PI / 2, 0, x > 0 ? -1.05 : 1.05], false));
    // cúpula de vidro com o frasco gigante dentro
    const dome = new T.Mesh(new T.SphereGeometry(0.46, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), glass); dome.position.y = 0.98; dome.raycast = () => {}; g.add(dome);
    mesh(new T.TorusGeometry(0.46, 0.035, 8, 24), wax, g, [0, 0.99, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false);
    mesh(SPH, glass, g, [0, 1.2, 0], [0.22, 0.22, 0.22], [0, 0, 0], false);
    mesh(SPH, goo, g, [0, 1.15, 0], [0.18, 0.13, 0.18], [0, 0, 0], false);
    mesh(CYL, glass, g, [0, 1.46, 0], [0.07, 0.18, 0.07], [0, 0, 0], false);
    mesh(CYL, wood, g, [0, 1.57, 0], [0.085, 0.05, 0.085]);
    [[0.04, 1.62], [-0.05, 1.72], [0.03, 1.83]].forEach(([x, y], k) => mesh(SPH_LO, goo, g, [x, y, 0], [0.04 + k * 0.012, 0.04 + k * 0.012, 0.04 + k * 0.012], [0, 0, 0], false));
    // tubos de cobre ligando a torre aos frascos laterais
    const cu = mat('#d08a4a', { roughness: 0.35, metalness: 0.3 });
    [[-1, 0.62], [1, -0.62]].forEach(([sx, sz]) => {
      const x = sx * 0.72, z = sz * 0.72;
      mesh(CYL, stoneD, g, [x, 0.12, z], [0.16, 0.2, 0.16]);
      mesh(SPH, glass, g, [x, 0.38, z], [0.15, 0.15, 0.15], [0, 0, 0], false);
      mesh(SPH, sx > 0 ? crys2 : goo, g, [x, 0.34, z], [0.12, 0.09, 0.12], [0, 0, 0], false);
      const tube = taper([[x, 0.5, z], [x * 0.8, 0.95, z * 0.8], [x * 0.55, 0.85, z * 0.55]], 0.03, 0.03, 8, 12);
      mesh(tube.geo, cu, g, [0, 0, 0], [1, 1, 1], [0, 0, 0], false);
    });
    // cristais brotando do chão
    [[0.7, 0.55, 0.32, crys], [0.86, 0.3, 0.2, crys], [-0.62, -0.7, 0.28, crys2], [-0.82, -0.45, 0.18, crys], [0.25, -0.8, 0.16, crys2]].forEach(([x, z, h, m], k) => {
      mesh(OCTA, m, g, [x, h * 0.9, z], [h * 0.38, h, h * 0.38], [0.2 * (k % 2 ? 1 : -1), k, 0.15]);
    });
    return g;
  };
  B.torre = (fl = 0) => {
    // Torre da Ascensão: começa em ruínas e ganha um andar por peça entregue (Insígnia, Coroa e Troféu)
    fl = +fl || 0;
    const g = new T.Group(); platform(g, 1.9, '#b9a487', '#6e5c4a'); cobble(g, 1.5);
    const stone = mat('#a8977f', { roughness: 0.85 }), stoneD = mat('#6e5c4a', { roughness: 0.9 }), stoneL = mat('#cdbd9f', { roughness: 0.8 });
    const gold = mat('#ffcc33', { metalness: 0.45, roughness: 0.28 }), wood = mat('#7a4a22', { roughness: 0.8 });
    const rune = mat('#c9a2ff', { roughness: 0.2, emissive: col('#7a3dff'), emissiveIntensity: 0.9 });
    const glow = mat('#fff3b0', { roughness: 0.2, emissive: col('#ffb020'), emissiveIntensity: 1.1 });
    const crys = mat('#ffe37a', { roughness: 0.1, emissive: col('#ffae00'), emissiveIntensity: 1.2, flatShading: true });
    const banner = mat('#7a3dff', { roughness: 0.7 });
    // círculo de runas no chão (sempre lá: é ele que pede as peças)
    mesh(new T.TorusGeometry(0.66, 0.025, 6, 36), rune, g, [0, 0.25, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(BOX, rune, g, [Math.cos(a) * 0.66, 0.26, Math.sin(a) * 0.66], [0.07, 0.02, 0.07], [0, a, 0], false); }
    // base de pedra (inteira só a partir do 1º andar)
    mesh(new T.CylinderGeometry(0.6, 0.66, 0.22, 6), stoneD, g, [0, 0.33, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
    let top = 0.44;
    const tier = (r, h, band) => {
      mesh(new T.CylinderGeometry(r * 0.92, r, h, 6), stone, g, [0, top + h / 2, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; mesh(BOX, stoneL, g, [Math.cos(a) * r * 0.97, top + h * 0.5, Math.sin(a) * r * 0.97], [0.05, h * 0.96, 0.05], [0, -a, 0], false); }
      mesh(new T.CylinderGeometry(r + 0.04, r + 0.04, 0.06, 6), band, g, [0, top + h, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
      top += h + 0.03;
    };
    if (fl >= 1) {
      tier(0.54, 0.5, gold);
      mesh(BOX, wood, g, [0, 0.62, 0.5], [0.2, 0.3, 0.04]); mesh(new T.CylinderGeometry(0.1, 0.1, 0.04, 16), wood, g, [0, 0.77, 0.5], [1, 1, 1], [Math.PI / 2, 0, 0]);
      [-1, 1].forEach(sd => { mesh(BOX, banner, g, [sd * 0.3, 0.7, 0.47], [0.12, 0.3, 0.02], [0, 0, 0], false); mesh(BOX, gold, g, [sd * 0.3, 0.86, 0.47], [0.15, 0.025, 0.03], [0, 0, 0], false); });
    } else {
      // ruínas: blocos caídos e restos de parede
      [[0.38, 0.2, 0.32], [-0.4, 0.3, 0.22], [0.1, -0.45, 0.26], [-0.2, 0.42, 0.18]].forEach(([x, z, h], k) => mesh(BOX, k % 2 ? stone : stoneL, g, [x, 0.44 + h / 2, z], [0.18, h, 0.16], [0, k * 0.7, k % 2 ? 0.1 : -0.08]));
      [[0.55, -0.5], [-0.62, -0.25], [0.7, 0.35]].forEach(([x, z], k) => mesh(BOX, stoneD, g, [x, 0.3, z], [0.14, 0.1, 0.12], [0.3, k, 0.2]));
    }
    if (fl >= 2) {
      tier(0.42, 0.44, gold);
      [0, 1, 2].forEach(i => { const a = i / 3 * Math.PI * 2 + 0.5; mesh(new T.CylinderGeometry(0.06, 0.06, 0.03, 12), glow, g, [Math.cos(a) * 0.4, top - 0.24, Math.sin(a) * 0.4], [1, 1, 1], [Math.PI / 2, 0, -a + Math.PI / 2], false); });
    }
    if (fl >= 3) {
      tier(0.32, 0.38, gold);
      mesh(new T.ConeGeometry(0.36, 0.42, 6), gold, g, [0, top + 0.21, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
      const c = new T.Group(); c.position.y = top + 0.68; g.add(c);
      mesh(OCTA, crys, c, [0, 0, 0], [0.14, 0.22, 0.14], [0, 0.4, 0]);
      mesh(new T.TorusGeometry(0.22, 0.018, 6, 28), gold, c, [0, 0, 0], [1, 1, 1], [Math.PI / 2.4, 0, 0], false);
      [-1, 1].forEach(sd => mesh(SPH_LO, glow, c, [sd * 0.3, -0.05, 0], [0.04, 0.04, 0.04], [0, 0, 0], false));
    } else {
      // andaime de madeira em cima do último andar: falta peça
      const y0 = fl ? top : 0.44, r = fl === 2 ? 0.34 : fl === 1 ? 0.46 : 0.52;
      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([a, b]) => mesh(BOX, wood, g, [a * r * 0.7, y0 + 0.24, b * r * 0.7], [0.04, 0.48, 0.04], [0, 0, 0], false));
      [0.22, 0.44].forEach(h => { mesh(BOX, wood, g, [0, y0 + h, r * 0.7], [r * 1.5, 0.03, 0.03], [0, 0, 0], false); mesh(BOX, wood, g, [r * 0.7, y0 + h, 0], [0.03, 0.03, r * 1.5], [0, 0, 0], false); });
      const c = new T.Group(); c.position.y = y0 + 0.75; g.add(c);
      mesh(OCTA, rune, c, [0, 0, 0], [0.1, 0.16, 0.1], [0, 0.4, 0]);
    }
    return g;
  };
  B.tree = n => { const k = n % 2 ? 'treeB' : 'treeA'; if (!G[k]) return PB.tree(n); const g = new T.Group(); glb(k, g, [0, 0, 0], 0.75, n); return g; };
  B.rock = () => { if (!G.rockA) return PB.rock(); const g = new T.Group(); glb('rockA', g, [0, 0, 0], 0.45); return g; };
  B.chocadeira = () => { const g = PB.chocadeira(); if (G.sack) { glb('sack', g, [0.72, 0.03, 0.55], 0.25); glb('crate', g, [-0.72, 0.03, 0.62], 0.24); } return g; };
  // Canteiro: caixote de madeira com moldura dourada, terra fofa em leiras, tampinhas de favo nos cantos e tufos de grama
  B.farm = () => { const g = new T.Group();
    const wood = mat('#a8692e', { roughness: 0.8 }), woodD = mat('#6a3a14', { roughness: 0.8 }), gold = mat('#f2b23a', { roughness: 0.35 }), soil = mat('#5a3214', { roughness: 1 }), soilL = mat('#7a4a22', { roughness: 1 });
    mesh(BOX, woodD, g, [0, 0.07, 0], [0.92, 0.14, 0.92]);
    [[0, 0.46, 0.92, 0.06], [0, -0.46, 0.92, 0.06], [0.46, 0, 0.06, 0.92], [-0.46, 0, 0.06, 0.92]].forEach(([x, z, w, d]) => { mesh(BOX, wood, g, [x, 0.16, z], [w + 0.02, 0.08, d + 0.02]); mesh(BOX, gold, g, [x, 0.205, z], [w + 0.03, 0.015, d + 0.03], [0, 0, 0], false); });
    mesh(BOX, soil, g, [0, 0.15, 0], [0.86, 0.04, 0.86], [0, 0, 0], false);
    for (let i = 0; i < 4; i++) mesh(new T.CylinderGeometry(0.05, 0.05, 0.8, 8, 1, false, 0, Math.PI), soilL, g, [-0.3 + i * 0.2, 0.17, 0], [1, 1, 1], [Math.PI / 2, 0, Math.PI / 2], false);
    [[0.46, 0.46], [-0.46, 0.46], [0.46, -0.46], [-0.46, -0.46]].forEach(([x, z]) => { mesh(new T.CylinderGeometry(0.075, 0.075, 0.1, 6), gold, g, [x, 0.2, z]); mesh(new T.CylinderGeometry(0.045, 0.045, 0.02, 6), mat('#f6a51c', { roughness: 0.15 }), g, [x, 0.255, z], [1, 1, 1], [0, 0, 0], false); });
    const gm = mat('#5cb84a', { roughness: 0.8 });
    [[0.55, 0.2], [-0.2, 0.55], [0.3, 0.56]].forEach(([x, z], k) => { for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + k; mesh(CONE, gm, g, [x + Math.cos(a) * 0.03, 0.06, z + Math.sin(a) * 0.03], [0.025, 0.12, 0.025], [Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4], false); } });
    return g; };
  B.habitat = th => {
    const g = PB.habitat(th);
    if (!glbReady) return g;

    if (String(th).split('/')[0] === 'agua' && G.lily) { glb('lily', g, [-0.25, 0.04, 0.25], 0.5); }

    return g;
  };
  B.windmill = () => { const g = new T.Group(); if (G.windmill) glb('windmill', g, [0, 0, 0], 1.1, Math.PI / 4); return g; };
  B.well = () => { const g = new T.Group(); if (G.well) glb('well', g, [0, 0, 0], 0.7, Math.PI / 4); return g; };
  // Roleta do Enxame: barraca de parque com roda grande, luzes e letreiro
  B.roleta = () => {
    const g = new T.Group(); platform(g, 1.9, '#f6c768', '#a8641a'); cobble(g, 1.6);
    const woodD = mat('#6b4423', { roughness: 0.8 }), gold = mat('#ffcc33', { metalness: 0.35, roughness: 0.3 }), red = mat('#d8342c', { roughness: 0.5 });
    const bulb = mat('#fff6d0', { emissive: col('#ffcc66'), emissiveIntensity: 0.9 });
    mesh(new T.CylinderGeometry(0.8, 0.86, 0.16, 6), mat('#8a5a2c', { roughness: 0.85 }), g, [0, 0.1, 0], [1, 1, 1], [0, Math.PI / 12, 0]);
    mesh(new T.CylinderGeometry(0.74, 0.74, 0.04, 6), red, g, [0, 0.19, 0], [1, 1, 1], [0, Math.PI / 12, 0], false);
    const f = new T.Group(); f.rotation.y = Math.PI / 4; f.position.y = 0.2; g.add(f);
    [-1, 1].forEach(sd => mesh(new T.BoxGeometry(0.09, 1.3, 0.09), woodD, f, [sd * 0.34, 0.6, -0.16], [1, 1, 1], [0, 0, sd * 0.26]));
    mesh(new T.BoxGeometry(0.62, 0.08, 0.09), woodD, f, [0, 0.42, -0.16]);
    mesh(new T.CylinderGeometry(0.05, 0.05, 0.3, 10), woodD, f, [0, 1.2, -0.04], [1, 1, 1], [Math.PI / 2, 0, 0]);
    const W = new T.Group(); W.name = 'wheel'; W.position.set(0, 1.2, 0.08); W.rotation.z = 0.2; f.add(W);
    const R = 0.66, cols = ['#9aa7b4', '#4fb3ff', '#9aa7b4', '#c77dff', '#9aa7b4', '#4fb3ff', '#ffd23f', '#4fb3ff'];
    cols.forEach((c, i) => mesh(new T.CylinderGeometry(R, R, 0.09, 10, 1, false, i * Math.PI / 4, Math.PI / 4), mat(c, { roughness: 0.4, emissive: col(c), emissiveIntensity: 0.45 }), W, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false));
    for (let i = 0; i < 4; i++) mesh(new T.BoxGeometry(2 * R, 0.03, 0.11), mat('#5a3212'), W, [0, 0, 0], [1, 1, 1], [0, 0, i * Math.PI / 4], false);
    mesh(new T.TorusGeometry(R + 0.03, 0.06, 10, 48), gold, W, [0, 0, 0]);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; mesh(SPH_LO, bulb, W, [Math.cos(a) * (R + 0.03), Math.sin(a) * (R + 0.03), 0.06], [0.035, 0.035, 0.035], [0, 0, 0], false); }
    mesh(SPH, gold, W, [0, 0, 0.07], [0.12, 0.12, 0.08]);
    mesh(CONE, red, f, [0, 1.2 + R + 0.16, 0.12], [0.1, 0.22, 0.06], [Math.PI, 0, 0]);
    // letreiro em cima
    mesh(new T.BoxGeometry(1.0, 0.26, 0.07), red, f, [0, 2.12, -0.04]);
    mesh(new T.BoxGeometry(1.06, 0.05, 0.09), gold, f, [0, 2.27, -0.04]);
    mesh(new T.BoxGeometry(1.06, 0.05, 0.09), gold, f, [0, 1.97, -0.04]);
    for (let i = 0; i < 7; i++) mesh(SPH_LO, bulb, f, [-0.42 + i * 0.14, 2.12, 0.0], [0.035, 0.035, 0.035], [0, 0, 0], false);
    [-1, 1].forEach(sd => mesh(new T.BoxGeometry(0.06, 0.2, 0.06), woodD, f, [sd * 0.4, 1.9, -0.06]));
    mesh(OCTA, mat('#ffd23f', { emissive: col('#a06a00'), emissiveIntensity: 0.4, flatShading: true }), f, [0, 2.48, -0.04], [0.13, 0.17, 0.13]);
    // fichas e caixas
    [[0.55, 0.62, '#ffd23f'], [0.62, 0.48, '#ff5f7e'], [0.48, 0.5, '#4fb3ff']].forEach(([x, z, c], i) => mesh(new T.CylinderGeometry(0.08, 0.08, 0.03, 16), mat(c, { roughness: 0.4 }), g, [x, 0.24 + i * 0.035, z], [1, 1, 1], [0, 0, 0.1 * i], false));
    if (G.crate) glb('crate', g, [-0.7, 0.03, 0.6], 0.26);
    if (G.barrel) glb('barrel', g, [0.68, 0.03, -0.62], 0.22);
    return g;
  };
  // folhagem fofa: esfera com calombos (moitas e copas no estilo desenho)
  const BLOB = (() => { const g = new T.IcosahedronGeometry(1, 3), p = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const n = 1 + 0.09 * Math.sin(v.x * 7.1 + v.y * 3.3) * Math.cos(v.z * 6.7 - v.y * 2.1) + 0.05 * Math.sin(v.y * 11 + v.x * 5); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g; })();
  const LEAF = (() => { const sh = new T.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.6, 0.35, 0, 1); sh.quadraticCurveTo(-0.6, 0.35, 0, 0); return new T.ShapeGeometry(sh, 8); })();
  // Enfeites 3D da ilha
  B.deco = kind => {
    const g = new T.Group();
    const wax = mat('#ffd776', { roughness: 0.55 }), honey = mat('#f2a020', { roughness: 0.15 }), stem = mat('#4f9a38', { roughness: 0.7 });
    const drip = (par, x, y, z, h) => { mesh(CYL, honey, par, [x, y - h / 2, z], [0.035, h, 0.035], [0, 0, 0], false); mesh(SPH_LO, honey, par, [x, y - h, z], [0.045, 0.055, 0.045], [0, 0, 0], false); };
    const flower = (x, z, h, c, r = 0.09) => {
      mesh(CYL, stem, g, [x, h / 2, z], [0.022, h, 0.022], [0, 0, 0], false);
      mesh(SPH_LO, stem, g, [x + 0.05, h * 0.4, z], [0.07, 0.02, 0.035], [0, 0, -0.5], false);
      const pm = mat(c, { roughness: 0.45 });
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(SPH_LO, pm, g, [x + Math.cos(a) * r * 0.75, h, z + Math.sin(a) * r * 0.75], [r * 0.6, r * 0.25, r * 0.6], [0, -a, 0.25], false); }
      mesh(SPH_LO, mat('#ffd23f'), g, [x, h + 0.02, z], [r * 0.45, r * 0.35, r * 0.45], [0, 0, 0], false);
    };
    if (kind === 'potmel') {
      const prof = [[0, 0], [0.14, 0], [0.22, 0.07], [0.25, 0.18], [0.22, 0.29], [0.15, 0.34], [0.16, 0.38], [0.14, 0.39]].map(([x, y]) => new T.Vector2(x, y));
      const clay = mat('#c8692c', { roughness: 0.7 });
      mesh(new T.LatheGeometry(prof, 24), clay, g, [0, 0, 0]);
      mesh(new T.CylinderGeometry(0.14, 0.14, 0.03, 20), honey, g, [0, 0.38, 0], [1, 1, 1], [0, 0, 0], false);
      mesh(new T.TorusGeometry(0.235, 0.02, 6, 24), mat('#7a3a14'), g, [0, 0.2, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false);
      drip(g, 0.1, 0.36, 0.11, 0.14); drip(g, -0.04, 0.36, 0.15, 0.09);
      mesh(CYL, mat('#8a5a2c'), g, [0.03, 0.47, -0.02], [0.02, 0.32, 0.02], [0.3, 0, -0.35], false);
      mesh(SPH_LO, mat('#8a5a2c'), g, [0.09, 0.62, -0.06], [0.04, 0.05, 0.04], [0, 0, 0], false);
      mesh(new T.LatheGeometry(prof, 20), clay, g, [0.32, 0, 0.2], [0.55, 0.55, 0.55]);
      mesh(new T.CylinderGeometry(0.14, 0.14, 0.03, 16), honey, g, [0.32, 0.21, 0.2], [0.55, 1, 0.55], [0, 0, 0], false);
    } else if (kind === 'vela') {
      [[0, 0, 0.75, 0.1], [0.2, 0.12, 0.5, 0.085], [-0.14, 0.18, 0.36, 0.08]].forEach(([x, z, h, r]) => {
        mesh(new T.CylinderGeometry(r, r * 1.08, h, 16), wax, g, [x, h / 2, z]);
        mesh(new T.CylinderGeometry(r * 0.95, r * 0.95, 0.02, 16), mat('#ffe9b0'), g, [x, h, z], [1, 1, 1], [0, 0, 0], false);
        drip(g, x + r * 0.7, h, z + r * 0.7, h * 0.3);
        mesh(CYL, mat('#3a2410'), g, [x, h + 0.03, z], [0.008, 0.05, 0.008], [0, 0, 0], false);
        mesh(SPH_LO, mat('#ffb030', { emissive: col('#ff8a00'), emissiveIntensity: 1 }), g, [x, h + 0.09, z], [0.035, 0.06, 0.035], [0, 0, 0], false);
      });
    } else if (kind === 'polen' || kind === 'polen2') {
      const k = kind === 'polen2' ? 0.7 : 1;
      [[0, 0.1, 0, 0.12, '#ffd23f'], [0.16, 0.09, 0.06, 0.1, '#ff9a3c'], [-0.12, 0.08, 0.1, 0.09, '#ffb52e'], [0.04, 0.24, 0.03, 0.09, '#fff0a0'], [0.1, 0.07, -0.14, 0.08, '#ffd23f'], [-0.08, 0.2, -0.06, 0.07, '#ff9a3c']]
        .forEach(([x, y, z, r, c]) => mesh(SPH, mat(c, { roughness: 0.8 }), g, [x * k, y * k, z * k], [r * k, r * k, r * k]));
    } else if (kind === 'favo') {
      const cells = [[0, 0, 0.3], [0.18, 0.1, 0.22], [-0.18, 0.1, 0.18], [0, 0.2, 0.14], [0.18, -0.1, 0.26], [-0.18, -0.1, 0.24], [0, -0.2, 0.2]];
      cells.forEach(([x, z, h], i) => {
        mesh(new T.CylinderGeometry(0.1, 0.1, h, 6), mat(i % 2 ? '#f6c75a' : '#f0b845', { roughness: 0.5 }), g, [x, h / 2, z], [1, 1, 1], [0, Math.PI / 6, 0]);
        mesh(new T.CylinderGeometry(0.068, 0.068, 0.02, 6), i % 3 ? honey : mat('#ffe9b0'), g, [x, h + 0.005, z], [1, 1, 1], [0, Math.PI / 6, 0], false);
      });
      drip(g, 0.12, 0.26, 0.16, 0.1);
    } else if (kind === 'flores') {
      [[0, 0, 0.32, '#ff5fa2'], [0.16, 0.08, 0.24, '#ffffff'], [-0.14, 0.1, 0.27, '#c77dff'], [0.06, -0.16, 0.22, '#ff9a3c'], [-0.08, -0.08, 0.36, '#9be7ff'], [0.2, -0.12, 0.3, '#ff5f7e']]
        .forEach(([x, z, h, c]) => flower(x, z, h, c));
      [[0.05, 0.12], [-0.15, -0.15]].forEach(([x, z]) => mesh(SPH_LO, mat('#56b04a', { roughness: 0.8 }), g, [x, 0.05, z], [0.11, 0.06, 0.11]));
    } else if (kind === 'girassol') {
      const pet = mat('#ffc61a', { roughness: 0.5 }), pet2 = mat('#ff9f1a', { roughness: 0.5 }), leafM = mat('#3f9a34', { roughness: 0.7, side: T.DoubleSide });
      [[0, 0, 0.95, 1], [0.24, 0.16, 0.7, 0.8]].forEach(([x, z, h, k]) => {
        mesh(new T.CylinderGeometry(0.028, 0.04, h, 8), stem, g, [x, h / 2, z]);
        [[0.3, 0.5], [0.52, -0.6], [0.7, 0.4]].forEach(([t, rz], i) => { const l = new T.Mesh(LEAF, leafM); l.position.set(x, h * t, z); l.rotation.set(0.5, Math.PI / 4 + i * 2.1, rz); l.scale.setScalar(0.2 * k); g.add(l); });
        const hd = new T.Group(); hd.position.set(x, h, z); hd.rotation.set(-0.35, Math.PI / 4, 0); g.add(hd);
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; mesh(SPH_LO, pet, hd, [Math.cos(a) * 0.17 * k, Math.sin(a) * 0.17 * k, -0.005], [0.09 * k, 0.038 * k, 0.018], [0, 0, a], false); }
        for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2; mesh(SPH_LO, pet2, hd, [Math.cos(a) * 0.13 * k, Math.sin(a) * 0.13 * k, 0.008], [0.065 * k, 0.032 * k, 0.016], [0, 0, a], false); }
        mesh(new T.CylinderGeometry(0.105 * k, 0.11 * k, 0.05, 20), mat('#5a2e0e', { roughness: 0.9 }), hd, [0, 0, 0.025], [1, 1, 1], [Math.PI / 2, 0, 0]);
        mesh(SPH_LO, mat('#7a4416', { roughness: 0.9 }), hd, [0, 0, 0.05], [0.07 * k, 0.07 * k, 0.025], [0, 0, 0], false);
      });
    } else if (kind === 'skep') {
      mesh(new T.CylinderGeometry(0.3, 0.34, 0.14, 16), mat('#7a4a22', { roughness: 0.9 }), g, [0, 0.07, 0]);
      const prof = Array.from({ length: 16 }, (_, i) => { const t = i / 15; return new T.Vector2(Math.max(0.001, Math.pow(Math.cos(t * Math.PI / 2), 0.8) * 0.31), Math.sin(t * Math.PI / 2) * 0.52); });
      const straw = mat('#e8b648', { roughness: 0.9 }), coil = mat('#c08a2a', { roughness: 0.9 });
      mesh(new T.LatheGeometry(prof, 28), straw, g, [0, 0.14, 0]);
      for (let i = 1; i < 9; i++) { const t = i / 9, r = Math.pow(Math.cos(t * Math.PI / 2), 0.8) * 0.31; mesh(new T.TorusGeometry(r, 0.024 * (1 - t * 0.4), 8, 28), i % 2 ? coil : straw, g, [0, 0.14 + Math.sin(t * Math.PI / 2) * 0.52, 0], [1, 1, 1], [Math.PI / 2, 0, 0], false); }
      mesh(SPH_LO, straw, g, [0, 0.66, 0], [0.05, 0.04, 0.05], [0, 0, 0], false);
      const door = new T.Group(); door.position.set(0.2, 0.2, 0.2); door.rotation.y = Math.PI / 4; g.add(door);
      mesh(new T.CircleGeometry(0.075, 16, 0, Math.PI), mat('#1e0f04', { side: T.DoubleSide }), door, [0, 0, 0.02], [1, 1, 1], [0, 0, 0], false);
      mesh(new T.BoxGeometry(0.2, 0.02, 0.09), mat('#8a5a2c'), door, [0, -0.01, 0.06]);
      drip(g, -0.14, 0.44, 0.17, 0.13); drip(g, 0.2, 0.36, -0.08, 0.09);
    } else if (kind === 'lanterna') {
      const wd = mat('#5c3a1c', { roughness: 0.8 });
      mesh(CYL, wd, g, [0, 0.45, 0], [0.035, 0.9, 0.035]);
      mesh(new T.CylinderGeometry(0.1, 0.12, 0.06, 6), wd, g, [0, 0.03, 0]);
      mesh(new T.BoxGeometry(0.26, 0.03, 0.03), wd, g, [0.06, 0.88, 0.06], [1, 1, 1], [0, -Math.PI / 4, 0]);
      const lx = 0.13, lz = 0.13;
      mesh(new T.CylinderGeometry(0.07, 0.06, 0.15, 6), mat('#ffcc55', { emissive: col('#ff9a00'), emissiveIntensity: 0.9, roughness: 0.2 }), g, [lx, 0.76, lz]);
      mesh(new T.ConeGeometry(0.1, 0.07, 6), wd, g, [lx, 0.87, lz]);
      mesh(new T.CylinderGeometry(0.075, 0.075, 0.02, 6), wd, g, [lx, 0.68, lz], [1, 1, 1], [0, 0, 0], false);
    } else if (kind === 'fonte') {
      g.scale.setScalar(1.35); const stone = mat('#b08a5a', { roughness: 0.8 }), stone2 = mat('#8a6a44', { roughness: 0.85 });
      mesh(new T.CylinderGeometry(0.62, 0.68, 0.22, 6), stone2, g, [0, 0.11, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
      mesh(new T.CylinderGeometry(0.52, 0.52, 0.03, 6), honey, g, [0, 0.21, 0], [1, 1, 1], [0, Math.PI / 6, 0], false);
      mesh(new T.CylinderGeometry(0.1, 0.13, 0.5, 6), stone, g, [0, 0.42, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
      mesh(new T.CylinderGeometry(0.25, 0.1, 0.1, 6), stone, g, [0, 0.7, 0], [1, 1, 1], [0, Math.PI / 6, 0]);
      mesh(new T.CylinderGeometry(0.2, 0.2, 0.02, 6), honey, g, [0, 0.75, 0], [1, 1, 1], [0, Math.PI / 6, 0], false);
      mesh(SPH, honey, g, [0, 0.83, 0], [0.08, 0.1, 0.08]);
      [0, 2, 4].forEach(i => { const a = i / 6 * Math.PI * 2 + Math.PI / 6; drip(g, Math.cos(a) * 0.22, 0.73, Math.sin(a) * 0.22, 0.32); });
      [[0.3, 0.1], [-0.25, 0.25], [0.1, -0.32]].forEach(([x, z]) => mesh(SPH_LO, mat('#ffd36a', { roughness: 0.1 }), g, [x, 0.23, z], [0.04, 0.025, 0.04], [0, 0, 0], false));
    } else if (kind === 'arbusto') {
      [[0, 0.16, 0, 0.2], [0.18, 0.12, 0.08, 0.15], [-0.16, 0.11, 0.06, 0.14]].forEach(([x, y, z, r]) => mesh(SPH, mat('#4fb84a', { roughness: 0.85 }), g, [x, y, z], [r, r * 0.85, r]));
      [[0.05, 0.32, 0.1, '#ff5fa2'], [0.2, 0.24, 0.14, '#ffffff'], [-0.14, 0.24, 0.12, '#ffd23f'], [-0.02, 0.28, -0.1, '#c77dff']].forEach(([x, y, z, c]) => mesh(SPH_LO, mat(c), g, [x, y, z], [0.045, 0.045, 0.045], [0, 0, 0], false));
    } else if (kind === 'tufo' || kind === 'tufo2') {
      g.scale.setScalar(1.7);
      const gm = mat(kind === 'tufo' ? '#5cb84a' : '#7ac24a', { roughness: 0.8 });
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; mesh(CONE, gm, g, [Math.cos(a) * 0.06, 0.07, Math.sin(a) * 0.06], [0.03, 0.16 + (i % 3) * 0.04, 0.03], [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35], false); }
      flower(0.08, 0.04, 0.2, kind === 'tufo' ? '#ffffff' : '#ff5fa2', 0.05);
      if (kind === 'tufo2') flower(-0.06, 0.08, 0.16, '#ffd23f', 0.045);
    } else if (kind === 'gotas') {
      g.scale.setScalar(1.5);
      [[0, 0, 0.09], [0.13, 0.06, 0.06], [-0.08, 0.1, 0.05]].forEach(([x, z, r]) => mesh(SPH, honey, g, [x, r * 0.3, z], [r, r * 0.45, r]));
      mesh(ICO, mat('#9a8a70', { flatShading: true, roughness: 0.9 }), g, [-0.12, 0.03, -0.06], [0.05, 0.035, 0.045]);
    } else if (kind === 'moita') {
      const g1 = mat('#2f8a34', { roughness: 0.85 }), g2 = mat('#4fb043', { roughness: 0.85 }), g3 = mat('#7fd05a', { roughness: 0.85 });
      [[0, 0.22, 0, 0.27, g1], [0.25, 0.16, 0.1, 0.21, g2], [-0.23, 0.15, 0.09, 0.2, g2], [0.05, 0.36, -0.1, 0.2, g2], [-0.08, 0.13, 0.25, 0.17, g1], [0.16, 0.34, 0.14, 0.15, g3], [-0.14, 0.32, 0.06, 0.14, g3], [0.3, 0.1, -0.12, 0.13, g1]]
        .forEach(([x, y, z, r, m], i) => mesh(BLOB, m, g, [x, y, z], [r, r * 0.88, r], [i, i * 2, 0]));
      [[0.12, 0.47, 0.13, '#ff5fa2'], [0.33, 0.3, 0.2, '#ffffff'], [-0.22, 0.33, 0.2, '#ffd23f'], [-0.05, 0.47, -0.16, '#ffffff'], [0.24, 0.3, -0.13, '#ff5fa2'], [-0.28, 0.2, -0.05, '#ffffff']].forEach(([x, y, z, c]) => {
        const pm = mat(c, { roughness: 0.5 });
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; mesh(SPH_LO, pm, g, [x + Math.cos(a) * 0.028, y, z + Math.sin(a) * 0.028], [0.022, 0.012, 0.022], [0, 0, 0], false); }
        mesh(SPH_LO, mat('#ffcf2a'), g, [x, y + 0.006, z], [0.014, 0.012, 0.014], [0, 0, 0], false);
      });
    } else if (kind === 'ponte') {
      const wd = mat('#a8692e', { roughness: 0.85 }), wdD = mat('#6b4423', { roughness: 0.85 });
      for (let i = 0; i < 7; i++) { const t = i / 6; mesh(new T.BoxGeometry(0.62, 0.05, 0.16), i % 2 ? wd : wdD, g, [0, -t * 0.72 + 0.02, 0.1 + t * 1.15], [1, 1, 1], [0.55, (i % 3 - 1) * 0.04, 0]); }
      [-0.33, 0.33].forEach(x => { mesh(new T.BoxGeometry(0.05, 0.05, 1.4), wdD, g, [x, -0.32, 0.68], [1, 1, 1], [0.55, 0, 0]); [0, 1].forEach(k => mesh(new T.CylinderGeometry(0.035, 0.035, 0.32, 8), wdD, g, [x, 0.1 - k * 0.7, 0.12 + k * 1.1])); });
    } else if (kind === 'morro') {
      const rk = mat('#a8927a', { flatShading: true, roughness: 0.9 }), rk2 = mat('#86705c', { flatShading: true, roughness: 0.9 });
      // pedras só atrás e dos lados (para não tapar o castelo)
      for (let i = 0; i < 13; i++) {
        const an = Math.PI * 1.25 + (i / 12 - 0.5) * Math.PI * 1.15, rr = 1.7 + (i % 3) * 0.14, sz = 0.24 + ((i * 7) % 5) * 0.05;
        const back = Math.max(0, Math.cos(an - Math.PI * 1.25));
        const px = Math.cos(an) * rr, pz = Math.sin(an) * rr;
        if (G.rockA && G.rockC) { const r = glb(i % 2 ? 'rockA' : 'rockC', g, [px, 0, pz], sz * 2.4, i * 1.9); r.scale.y = 1 + back * 0.7; }
        else mesh(ICO, i % 2 ? rk : rk2, g, [px, sz * 0.45 + back * 0.25, pz], [sz, sz * (0.85 + back * 0.6), sz * 0.9], [i, i * 2, 0]);
      }
      [[-1.5, -0.6], [-0.7, -1.55], [-1.2, -1.2], [-1.75, 0.15], [0.15, -1.8]].forEach(([x, z], i) => { const h = 0.9 + (i % 2) * 0.4; mesh(new T.CylinderGeometry(0.07, 0.11, h, 8), honey, g, [x * 0.95, h / 2, z * 0.95], [1, 1, 0.6], [0, 0, 0], false); mesh(SPH_LO, honey, g, [x * 0.92, 0.04, z * 0.92], [0.2, 0.05, 0.16], [0, 0, 0], false); });
    } else if (kind === 'carga') {
      if (G.barrel) glb('barrel', g, [0, 0, 0], 0.3);
      if (G.sack) glb('sack', g, [0.28, 0, 0.12], 0.26);
      if (G.crate) glb('crate', g, [-0.08, 0, 0.3], 0.28);
    } else if (kind === 'pedras') {
      if (G.rockA) glb('rockA', g, [0, 0, 0], 0.42); else mesh(ICO, mat('#a3a3ad', { flatShading: true }), g, [0, 0.12, 0], [0.2, 0.15, 0.18]);
      if (G.plant) glb('plant', g, [0.24, 0, 0.12], 0.26);
    }
    return g;
  };

  // ---------- Ilha 3D em tempo real (mesma câmera isométrica do mapa) ----------
  function world(canvas, L) {
    let WR;
    try { WR = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); if (!WR.getContext()) return null; } catch (e) { return null; }
    WR.setClearColor(0x000000, 0);
    WR.shadowMap.enabled = true; WR.shadowMap.type = T.PCFSoftShadowMap;
    WR.shadowMap.autoUpdate = false; // a ilha é parada: a sombra só é refeita quando algo muda
    const scene = new T.Scene();
    const C = new T.Vector3(7, 0, 7);
    scene.add(new T.HemisphereLight(0xfff6e8, 0x6a4a3a, 0.68));
    const key = new T.DirectionalLight(0xfff4e0, 0.66);
    key.position.copy(C).add(new T.Vector3(-4, 9, 3).multiplyScalar(2.4)); key.target.position.copy(C);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 70 });
    key.shadow.bias = -0.0012; key.shadow.normalBias = 0.02; key.shadow.radius = 3;
    const rim = new T.DirectionalLight(0xbfe4ff, 0.55); rim.position.copy(C).add(new T.Vector3(6, 3, -6));
    scene.add(key, key.target, rim);
    const cam = new T.OrthographicCamera(-500 / PX, 500 / PX, 68 / PX, -532 / PX, -100, 100);
    cam.position.set(10, 10 * Math.SQRT2 * Math.tan(Math.PI / 6), 10); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
    const G2 = ([X, Y]) => { const a = (X - 500) / 32, b = (Y - 68) / 16; return [(a + b) / 2, (b - a) / 2]; };
    const shapeOf = pts => { const sh = new T.Shape(); pts.forEach(([x, z], i) => i ? sh.lineTo(x, z) : sh.moveTo(x, z)); sh.closePath(); return sh; };
    const flat = geo => { geo.rotateX(Math.PI / 2); return geo; };
    const holeOf = pts => { const h = new T.Path(); pts.forEach(([x, z], i) => i ? h.lineTo(x, z) : h.moveTo(x, z)); h.closePath(); return h; };
    const ring = (a, b) => { const sh = shapeOf(a); sh.holes.push(holeOf(b)); return sh; };
    const hex = L.hex.map(G2), grow = d => L.grow(d).map(G2);

    // ---- textura do chão, pintada de cima (1 unidade = 1 lote) ----
    const X0 = -6.5, SPAN = 27, TS = 2048, K = TS / SPAN;
    const cv = document.createElement('canvas'); cv.width = cv.height = TS;
    const g = cv.getContext('2d');
    const P = ([x, z]) => [(x - X0) * K, (z - X0) * K];
    const PP = q => P(G2(q));
    const poly = pts => { g.beginPath(); pts.forEach((q, i) => { const [a, b] = P(q); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); };
    const c = L.look;
    // mapa de brilho: claro = fosco, escuro = brilhante (mel)
    const rc = document.createElement('canvas'); rc.width = rc.height = 1024; const r2 = rc.getContext('2d'), RK = 1024 / TS;
    r2.fillStyle = '#c8c8c8'; r2.fillRect(0, 0, 1024, 1024);
    const [pcx, pcy] = PP(L.plaza);
    g.fillStyle = '#4a2608'; g.fillRect(0, 0, TS, TS);
    g.save(); poly(hex); g.clip();
    // favo: alvéolos dourados em relevo, alinhados com a tela
    const hr = 0.46 * K, hw = Math.sqrt(3) * hr;
    g.save(); g.translate(pcx, pcy); g.rotate(-Math.PI / 4);
    const cell = (x, y) => {
      const rr = hr * 0.86;
      const gr = g.createLinearGradient(x - rr, y - rr, x + rr, y + rr);
      gr.addColorStop(0, '#8a5420'); gr.addColorStop(0.5, '#5e3410'); gr.addColorStop(1, '#3a1d08');
      g.beginPath(); for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.98); } g.closePath();
      g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(28,10,0,.85)'; g.lineWidth = 5; g.stroke(); g.strokeStyle = 'rgba(236,168,62,.7)'; g.lineWidth = 2; g.stroke();
      g.beginPath(); for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; g.lineTo(x + Math.cos(an) * rr * 0.62, y + Math.sin(an) * rr * 0.6); } g.closePath();
      g.fillStyle = 'rgba(176,110,40,.28)'; g.fill();
    };
    const ext = TS * 0.8;
    for (let col = 0, xx = -ext; xx < ext; col++, xx += hr * 1.5) for (let yy = -ext + (col % 2) * hw / 2; yy < ext; yy += hw) cell(xx, yy);
    g.restore();
    // luz no centro e sombra perto da borda
    let gr = g.createRadialGradient(pcx, pcy, 0, pcx, pcy, 13 * K);
    gr.addColorStop(0, 'rgba(255,190,90,.06)'); gr.addColorStop(0.55, 'rgba(255,170,60,.03)'); gr.addColorStop(1, 'rgba(30,10,0,.3)');
    g.fillStyle = gr; g.fillRect(0, 0, TS, TS);
    g.filter = 'blur(22px)'; g.strokeStyle = 'rgba(40,16,0,.55)'; g.lineWidth = 1.1 * K; poly(hex); g.stroke(); g.filter = 'none';
    // gramado e musgo ao longo da borda (menos na frente, onde fica o canteiro)
    { const ins = grow(-12), fr0 = L.farmRect.map(G2); let sd = 7; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
      const nearFarm = ([x, z]) => x > Math.min(...fr0.map(q => q[0])) - 1.2 && x < Math.max(...fr0.map(q => q[0])) + 1.2 && z > Math.min(...fr0.map(q => q[1])) - 1.2 && z < Math.max(...fr0.map(q => q[1])) + 1.2;
      [['rgba(46,92,30,.85)', 0.5], ['rgba(74,128,40,.85)', 0.34], ['rgba(110,160,56,.75)', 0.2]].forEach(([c, sz], li) => {
        sd = 7 + li;
        for (let e = 0; e < 6; e++) { const A = ins[e], B2 = ins[(e + 1) % 6], len = Math.hypot(B2[0] - A[0], B2[1] - A[1]);
          for (let d = 0; d < len; d += 0.32) { if (rnd() < 0.3) continue; const t = d / len, q = [A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t]; if (nearFarm(q)) continue;
            const [x, y] = P(q), r = (sz + rnd() * sz * 0.8) * K, ox = (rnd() - 0.5) * 0.5 * K, oy = (rnd() - 0.5) * 0.5 * K;
            g.fillStyle = c; g.beginPath(); g.ellipse(x + ox, y + oy, r, r * (0.7 + rnd() * 0.3), rnd() * 3, 0, Math.PI * 2); g.fill(); } } });
      sd = 99; const fc = ['#ff6fae', '#ffffff', '#ffd23f', '#c77dff', '#ff9a3c'];
      for (let e = 0; e < 6; e++) { const A = ins[e], B2 = ins[(e + 1) % 6], len = Math.hypot(B2[0] - A[0], B2[1] - A[1]);
        for (let d = 0; d < len; d += 0.45) { const t = d / len, q = [A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t]; if (nearFarm(q)) continue;
          const [x, y] = P(q); g.fillStyle = fc[Math.floor(rnd() * 5)]; g.beginPath(); g.arc(x + (rnd() - 0.5) * 0.7 * K, y + (rnd() - 0.5) * 0.7 * K, 0.07 * K, 0, Math.PI * 2); g.fill(); } } }
    // rios de mel brilhante saindo da praça
    // caminho reto: da praça até [X, Y], ou de [X0, Y0] até [X1, Y1]
    const curve = w => { const A = w.length === 4 ? [w[0], w[1]] : L.plaza, B = w.length === 4 ? [w[2], w[3]] : w; return [PP(A), PP([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]), PP(B)]; };
    g.lineCap = 'round'; g.lineJoin = 'round';
    const road = (ctx, pp, w, k = 1) => { ctx.beginPath(); ctx.moveTo(pp[0][0] * k, pp[0][1] * k); ctx.quadraticCurveTo(pp[1][0] * k, pp[1][1] * k, pp[2][0] * k, pp[2][1] * k); ctx.lineWidth = w * k; ctx.stroke(); };
    const wid = i => (i < 6 ? 0.42 : 0.34) * K;
    const COB = [0, 1, 2, 5, 8, 9, 14, 15], riv = [];
    // caminhos de lajotas: sombra, leito de terra batida e pedras irregulares com relevo
    { const FY = L.farmRect[0][1];
      const pts = i => curve(i === 5 ? [L.ways[5][0], FY + 8] : L.ways[i]);
      const at = ([a, b, c2], t) => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c2[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c2[1]]; };
      const tan = ([a, b, c2], t) => { const dx = 2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c2[0] - b[0]), dy = 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c2[1] - b[1]), l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
      g.filter = 'blur(8px)'; g.strokeStyle = 'rgba(25,10,0,.55)'; COB.forEach(i => road(g, pts(i).map(([x, y]) => [x + 0.08 * K, y + 0.1 * K]), 1.12 * K)); g.filter = 'none';
      COB.forEach(i => { g.strokeStyle = '#5a3a1c'; road(g, pts(i), 1.0 * K); });
      COB.forEach(i => { g.strokeStyle = '#8a6a44'; road(g, pts(i), 0.88 * K); });
      let sd = 3; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
      const pal = [['#ead8b0', '#c9ad7c'], ['#e0c99c', '#b89a6a'], ['#d6c3a0', '#a98e66'], ['#efe0bc', '#cdb388']];
      const stone = (x, y, r, ang) => {
        const n = 6 + Math.floor(rnd() * 2), vs = [];
        for (let k = 0; k < n; k++) { const an = ang + k / n * Math.PI * 2, rr = r * (0.78 + rnd() * 0.3); vs.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.86]); }
        const shape = () => { g.beginPath(); vs.forEach(([a, b], k) => k ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); };
        g.save(); g.translate(0.03 * K, 0.045 * K); shape(); g.fillStyle = 'rgba(40,22,6,.55)'; g.fill(); g.restore();
        const [c1, c2] = pal[Math.floor(rnd() * pal.length)];
        const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
        shape(); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(80,52,24,.85)'; g.lineWidth = 2.2; g.stroke();
        g.save(); shape(); g.clip(); g.strokeStyle = 'rgba(255,248,225,.55)'; g.lineWidth = r * 0.22; g.beginPath(); g.arc(x + r * 0.2, y + r * 0.25, r * 0.95, Math.PI * 1.05, Math.PI * 1.6); g.stroke(); g.restore();
        if (rnd() < 0.18) { g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - r * 0.3, y - r * 0.1); g.lineTo(x + r * 0.1, y + r * 0.2); g.lineTo(x + r * 0.35, y + r * 0.05); g.stroke(); }
      };
      COB.forEach(i => { const c3 = pts(i), len = Math.hypot(c3[2][0] - c3[0][0], c3[2][1] - c3[0][1]), step = 0.27 * K / len;
        for (let t = 0.1, row = 0; t < 1.0; t += step, row++) { const [x, y] = at(c3, t), [tx, ty] = tan(c3, t), nx = -ty, ny = tx;
          const offs = row % 2 ? [-0.2, 0.2] : [-0.28, 0, 0.28];
          offs.forEach(o => { const r = (offs.length === 2 ? 0.17 : 0.125) * K * (0.9 + rnd() * 0.2); stone(x + nx * o * K + (rnd() - 0.5) * 0.04 * K, y + ny * o * K + (rnd() - 0.5) * 0.04 * K, r, rnd() * 3); }); }
        // musgo na beirada
        for (let t = 0.12; t < 1.0; t += step * 1.4) { const [x, y] = at(c3, t), [tx, ty] = tan(c3, t), sdn = rnd() < 0.5 ? -1 : 1;
          if (rnd() < 0.55) continue; const ox = -ty * sdn * 0.46 * K, oy = tx * sdn * 0.46 * K;
          g.fillStyle = rnd() < 0.5 ? 'rgba(92,150,52,.9)' : 'rgba(64,118,40,.9)'; g.beginPath(); g.ellipse(x + ox, y + oy, 0.08 * K, 0.055 * K, rnd() * 3, 0, Math.PI * 2); g.fill(); } }); }
    // rios de mel com brilho em volta
        riv.forEach(([w, i]) => { g.strokeStyle = 'rgba(120,50,0,.85)'; road(g, curve(w), wid(i) + 0.14 * K); });
    riv.forEach(([w, i]) => { g.strokeStyle = '#c87a0c'; road(g, curve(w), wid(i)); });
    riv.forEach(([w, i]) => { g.strokeStyle = '#e8a224'; road(g, curve(w), wid(i) * 0.6); });
    riv.forEach(([w, i]) => { g.strokeStyle = 'rgba(255,236,170,.45)'; const pp = curve(w).map(([x, y]) => [x - 0.06 * K, y - 0.06 * K]); road(g, pp, wid(i) * 0.14); });
    r2.lineCap = 'round'; r2.strokeStyle = '#1a1a1a';
    riv.forEach(([w, i]) => road(r2, curve(w), wid(i) + 0.1 * K, RK));
    // poças de mel nas pontas dos rios
    riv.filter(([, i]) => i < 6).map(([w]) => w).forEach(w => { const [x, y] = PP(w); const rg = g.createRadialGradient(x, y, 0, x, y, 0.55 * K); rg.addColorStop(0, '#ffd34a'); rg.addColorStop(0.7, '#f4a514'); rg.addColorStop(1, 'rgba(244,165,20,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 0.55 * K, 0, Math.PI * 2); g.fill(); });
    // praça creme com anel tracejado
    const pr = 1.75 * K;
    g.fillStyle = 'rgba(160,80,0,.7)'; g.beginPath(); g.arc(pcx, pcy, pr + 0.16 * K, 0, Math.PI * 2); g.fill();
    gr = g.createRadialGradient(pcx, pcy - pr * 0.2, 0, pcx, pcy, pr); gr.addColorStop(0, '#d9b97e'); gr.addColorStop(1, '#b88d52');
    g.fillStyle = gr; g.beginPath(); g.arc(pcx, pcy, pr, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(110,64,20,.45)'; g.lineWidth = 0.05 * K; g.beginPath(); g.arc(pcx, pcy, pr * 0.78, 0, Math.PI * 2); g.stroke();
    r2.fillStyle = '#707070'; r2.beginPath(); r2.arc(pcx * RK, pcy * RK, pr * RK, 0, Math.PI * 2); r2.fill();
    // canteiro do jardim: terra escura com moldura de cera
    const fr = L.farmRect.map(G2);
    g.strokeStyle = '#f2b23a'; g.lineWidth = 0.5 * K; poly(fr); g.stroke();
    g.lineWidth = 0.36 * K; g.strokeStyle = '#7a4a1e'; poly(fr); g.stroke();
    { const xs = fr.map(q => q[0]), zs = fr.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
      let sd = 21; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
      const gg2 = g.createLinearGradient(...P(fr[0]), ...P(fr[2])); gg2.addColorStop(0, '#5aa23c'); gg2.addColorStop(1, '#3f8a30'); g.fillStyle = gg2; poly(fr); g.fill();
      g.save(); poly(fr); g.clip();
      // faixas de gramado aparado, alternando claro e escuro
      const nb = 9; for (let k = 0; k < nb; k++) { if (k % 2) continue; const a = x0 + (x1 - x0) * k / nb, b = x0 + (x1 - x0) * (k + 1) / nb;
        g.fillStyle = 'rgba(160,220,100,.16)'; poly([[a, z0], [b, z0], [b, z1], [a, z1]]); g.fill(); }
      // manchas suaves para tirar o chapado
      for (let k = 0; k < 70; k++) { const [x, y] = P([x0 + rnd() * (x1 - x0), z0 + rnd() * (z1 - z0)]); const r = (0.25 + rnd() * 0.4) * K;
        const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, rnd() < 0.5 ? 'rgba(150,210,90,.22)' : 'rgba(30,80,25,.2)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
      // folhas de grama desenhadas uma a uma
      g.lineCap = 'round';
      const bl = ['#2f7428', '#3f8f32', '#5cae40', '#7cc650', '#9ad85e'];
      for (let k = 0; k < 2600; k++) { const [x, y] = P([x0 + rnd() * (x1 - x0), z0 + rnd() * (z1 - z0)]); const h = (0.07 + rnd() * 0.09) * K, lean = (rnd() - 0.5) * h * 0.7;
        g.strokeStyle = bl[Math.min(4, Math.floor(rnd() * rnd() * 6 + (k % 3)))]; g.lineWidth = 0.022 * K + rnd() * 0.012 * K;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * 0.3, y - h * 0.6, x + lean, y - h); g.stroke(); }
      // trevos e florzinhas
      const fc = ['#ff7ab8', '#ffffff', '#ffd23f', '#c99bff'];
      for (let k = 0; k < 26; k++) { const [x, y] = P([x0 + rnd() * (x1 - x0), z0 + rnd() * (z1 - z0)]); const r = 0.045 * K;
        g.fillStyle = fc[k % 4]; for (let q = 0; q < 5; q++) { const an = q / 5 * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(an) * r, y + Math.sin(an) * r, r * 0.75, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = '#ffb31a'; g.beginPath(); g.arc(x, y, r * 0.6, 0, Math.PI * 2); g.fill(); }
      // rio de mel serpenteando pela parte de cima do gramado
      { const [rx0, ry0] = L.farmRect[0], rx1 = L.farmRect[1][0], ry = ry0 + 17, RP = [];
        for (let X = rx0 - 30; X <= rx1 + 30; X += 6) RP.push(PP([X, ry + Math.sin((X - rx0) / 58) * 8 + Math.sin((X - rx0) / 21) * 2]));
        const line = (ctx, w, k = 1, dx = 0, dy = 0) => { ctx.beginPath(); RP.forEach(([x, y], n) => n ? ctx.lineTo((x + dx) * k, (y + dy) * k) : ctx.moveTo((x + dx) * k, (y + dy) * k)); ctx.lineWidth = w * k; ctx.stroke(); };
        g.lineCap = g.lineJoin = 'round';
        g.filter = 'blur(6px)'; g.strokeStyle = 'rgba(20,50,10,.45)'; line(g, 1.0 * K, 1, 0.04 * K, 0.06 * K); g.filter = 'none';
        g.strokeStyle = '#7a5a2a'; line(g, 0.9 * K);
        g.strokeStyle = '#b8720c'; line(g, 0.74 * K);
        g.strokeStyle = '#e09a18'; line(g, 0.58 * K);
        g.strokeStyle = '#f6c046'; line(g, 0.3 * K, 1, -0.03 * K, -0.03 * K);
        g.setLineDash([0.18 * K, 0.5 * K]); g.strokeStyle = 'rgba(255,248,215,.75)'; line(g, 0.05 * K, 1, -0.06 * K, -0.08 * K); g.setLineDash([]);
        r2.lineCap = 'round'; r2.strokeStyle = '#1a1a1a'; line(r2, 0.74 * K, RK);
        // pedrinhas e juncos nas margens
        RP.forEach(([x, y], n) => { if (n % 3) return; const sdn = rnd() < 0.5 ? -1 : 1, ox = sdn * 0.36 * K, oy = sdn * 0.36 * K;
          if (rnd() < 0.5) { g.fillStyle = rnd() < 0.5 ? '#cdb791' : '#a99270'; g.strokeStyle = 'rgba(70,45,20,.7)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x + ox, y + oy, 0.07 * K, 0.05 * K, rnd() * 3, 0, Math.PI * 2); g.fill(); g.stroke(); }
          else { g.strokeStyle = '#2f6a26'; g.lineWidth = 0.025 * K; for (let q = -1; q <= 1; q++) { g.beginPath(); g.moveTo(x + ox + q * 0.03 * K, y + oy); g.lineTo(x + ox + q * 0.05 * K, y + oy - 0.16 * K); g.stroke(); } } });
        { const bx = L.ways[5][0], by = ry + Math.sin((bx - rx0) / 58) * 8 + Math.sin((bx - rx0) / 21) * 2, [cx, cy] = PP([bx, by]);
          g.save(); g.translate(cx, cy); g.rotate(-Math.PI / 4);
          g.fillStyle = 'rgba(30,14,0,.45)'; g.fillRect(-0.42 * K + 0.05 * K, -0.62 * K + 0.06 * K, 0.84 * K, 1.24 * K);
          for (let q = 0; q < 6; q++) { const y0 = -0.62 * K + q * 0.207 * K; g.fillStyle = q % 2 ? '#a8743c' : '#b98448'; g.fillRect(-0.42 * K, y0, 0.84 * K, 0.18 * K); g.strokeStyle = '#5a3416'; g.lineWidth = 2; g.strokeRect(-0.42 * K, y0, 0.84 * K, 0.18 * K); }
          g.fillStyle = '#6a3e18'; [-0.46, 0.4].forEach(xq => g.fillRect(xq * K, -0.66 * K, 0.06 * K, 1.32 * K));
          g.restore(); }
      }
      // sombra por dentro da moldura
      g.lineWidth = 0.5 * K; g.strokeStyle = 'rgba(20,50,10,.35)'; g.filter = 'blur(10px)'; poly(fr); g.stroke(); g.filter = 'none';
      g.restore(); }
    g.restore();
    var rough = new T.CanvasTexture(rc); rough.flipY = false;
    rough.repeat.set(1 / SPAN, 1 / SPAN); rough.offset.set(-X0 / SPAN, -X0 / SPAN);
    const tex = new T.CanvasTexture(cv); tex.flipY = false; tex.anisotropy = 4;
    tex.repeat.set(1 / SPAN, 1 / SPAN); tex.offset.set(-X0 / SPAN, -X0 / SPAN);

    // ---- corpo da ilha: chão, paredão de favo e borda de cera ----
    const wc = document.createElement('canvas'); wc.width = 256; wc.height = 148; const w2 = wc.getContext('2d');
    w2.fillStyle = '#b8680e'; w2.fillRect(0, 0, 256, 148);
    { const r = 21, hw2 = Math.sqrt(3) * r;
      for (let row = -1; row < 6; row++) for (let i = -1; i < 8; i++) {
        const x = i * hw2 + (row % 2 ? hw2 / 2 : 0), y = row * r * 1.5 + 8;
        const hexp = k => { w2.beginPath(); for (let j = 0; j < 6; j++) { const an = Math.PI / 6 + j * Math.PI / 3; w2.lineTo(x + Math.cos(an) * r * k, y + Math.sin(an) * r * k); } w2.closePath(); };
        hexp(0.92); w2.fillStyle = '#ffcf55'; w2.fill();
        hexp(0.74); const gg = w2.createRadialGradient(x - 3, y - 4, 1, x, y, r * 0.8); gg.addColorStop(0, '#ffe68a'); gg.addColorStop(0.55, '#f6b22c'); gg.addColorStop(1, '#c4700e'); w2.fillStyle = gg; w2.fill();
      } }
    const wtex = new T.CanvasTexture(wc); wtex.wrapS = wtex.wrapT = T.RepeatWrapping; wtex.repeat.set(0.4, 0.42);
    const D = 1.15;
    const body = new T.ExtrudeGeometry(shapeOf(hex), { depth: D, bevelEnabled: false });
    flat(body);
    const top = new T.MeshStandardMaterial({ map: tex, roughnessMap: rough, roughness: 1, metalness: 0 });
    const side = new T.MeshStandardMaterial({ map: wtex, roughness: 0.3, metalness: 0 });
    const isl = new T.Mesh(body, [top, side]); isl.receiveShadow = true; isl.castShadow = false; scene.add(isl);
    // a face de cima do ExtrudeGeometry usa (x, z) como UV: a textura já está alinhada
    const lipS = ring(grow(10), grow(-4));
    const lip = new T.Mesh(flat(new T.ExtrudeGeometry(lipS, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 })), mat('#e7a94a', { roughness: 0.45 }));
    lip.position.y = 0.1; lip.castShadow = true; lip.receiveShadow = true; scene.add(lip);
    lip.material = new T.MeshStandardMaterial({ color: 0xe8920c, roughness: 0.14, metalness: 0, emissive: 0x5a2400, emissiveIntensity: 0.3 });
    // mel grosso por cima da borda, escorrendo pelo paredão
    { const hm = new T.MeshStandardMaterial({ color: 0xe8920c, roughness: 0.14, metalness: 0, emissive: 0x5a2400, emissiveIntensity: 0.3 });
      const ed = grow(9), lumpG = new T.SphereGeometry(1, 14, 10), dripG = new T.CylinderGeometry(1, 1, 1, 10); let sd = 11; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
      const L1 = [], L2 = [], L3 = [], M4 = new T.Matrix4(), Q = new T.Quaternion(), V = (x, y, z) => new T.Vector3(x, y, z);
      for (let e = 0; e < 6; e++) { const A = ed[e], B2 = ed[(e + 1) % 6], len = Math.hypot(B2[0] - A[0], B2[1] - A[1]);
        for (let d = 0; d < len; d += 0.19) { const t = d / len, x = A[0] + (B2[0] - A[0]) * t, z = A[1] + (B2[1] - A[1]) * t;
          L1.push(M4.clone().compose(V(x, 0.24, z), Q, V(0.26 + rnd() * 0.12, 0.1 + rnd() * 0.05, 0.26 + rnd() * 0.12)));
          if (rnd() < 0.42) { const h = 0.25 + Math.pow(rnd(), 1.5) * 0.9, r = 0.07 + rnd() * 0.06;
            L2.push(M4.clone().compose(V(x, 0.2 - h / 2, z), Q, V(r, h, r)));
            L3.push(M4.clone().compose(V(x, 0.2 - h, z), Q, V(r * 1.35, r * 1.7, r * 1.35))); } } }
      [[lumpG, L1], [dripG, L2], [lumpG, L3]].forEach(([geo, ms], k) => { const im = new T.InstancedMesh(geo, hm, ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = k === 0; scene.add(im); }); }
    // mar de mel animado
    const seaU = { t: { value: 0 } };
    const seaM = new T.ShaderMaterial({
      uniforms: seaU, transparent: true, side: T.DoubleSide, depthWrite: false,
      vertexShader: 'varying vec3 vw; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vw = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float t; varying vec3 vw;
        void main(){
          vec2 p = vw.xz;
          float w1 = sin(p.x * 1.1 + p.y * 0.6 + t * 0.9) * 0.5 + 0.5;
          float w2 = sin(p.x * -0.7 + p.y * 1.3 - t * 0.7) * 0.5 + 0.5;
          float w3 = sin((p.x + p.y) * 2.4 + t * 1.6) * 0.5 + 0.5;
          vec3 deep = vec3(0.66, 0.33, 0.05), light = vec3(0.96, 0.62, 0.17);
          vec3 col = mix(deep, light, 0.35 + 0.35 * w1 * w2);
          col += vec3(1.0, 0.9, 0.65) * pow(w3 * w1, 8.0) * 0.4;
          float d = length(p - vec2(7.0, 7.0));
          col *= 1.0 - smoothstep(12.0, 18.0, d) * 0.18;
          gl_FragColor = vec4(col, 1.0 - smoothstep(12.6, 14.2, d));
        }`,
    });
    const sea = new T.Mesh(flat(new T.ShapeGeometry(shapeOf(grow(150)))), seaM); sea.position.y = -0.78; scene.add(sea);
    const foamM = new T.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.35, depthWrite: false, side: T.DoubleSide });
    const foam = new T.Mesh(flat(new T.ShapeGeometry(ring(grow(22), grow(2)))), foamM);
    foam.position.y = -0.76; scene.add(foam);
    sea.visible = foam.visible = false; // a ilha flutua sobre a névoa dourada (fundo em CSS)

    // ---- construções e enfeites ----
    const objs = new Map();
    let wheel = null;
    // visual de desenho: sombra em 3 tons chapados + contorno escuro também nos modelos prontos
    const ramp = new T.DataTexture(new Uint8Array([88, 160, 225]), 3, 1, T.RedFormat);
    ramp.minFilter = ramp.magFilter = T.NearestFilter; ramp.needsUpdate = true;
    const toonCache = new Map();
    const toonOf = m => {
      if (!m || m.type !== 'MeshStandardMaterial') return m;
      if (toonCache.has(m)) return toonCache.get(m);
      const t = new T.MeshToonMaterial({ color: m.color.clone().offsetHSL(0, 0.08, -0.02).multiplyScalar(0.86), map: m.map || null, gradientMap: ramp,
        emissive: m.emissive ? m.emissive.clone() : 0, emissiveIntensity: m.emissiveIntensity, emissiveMap: m.emissiveMap || null,
        transparent: m.transparent, opacity: m.opacity, side: m.side, vertexColors: m.vertexColors, depthWrite: m.depthWrite });
      toonCache.set(m, t); return t;
    };
    const isLine = n => n.material && n.material.type === 'ShaderMaterial' && n.material.side === T.BackSide;
    function toonify(root) {
      const add = [];
      root.traverse(n => {
        if (!n.isMesh || isLine(n)) return;
        n.material = Array.isArray(n.material) ? n.material.map(toonOf) : toonOf(n.material);
        const sib = n.parent && n.parent.children.some(c => c !== n && c.isMesh && isLine(c) && c.geometry === n.geometry);
        const big = n.geometry.boundingSphere || (n.geometry.computeBoundingSphere(), n.geometry.boundingSphere);
        if (!sib && !n.isSkinnedMesh && !(n.material.transparent) && big && big.radius > 0.02) add.push(n);
      });
      add.forEach(n => { const o = new T.Mesh(n.geometry, outlineMat(0.02)); o.raycast = () => {}; n.add(o); });
    }
    function setLots(list) {
      OUT = 0.022;
      const want = new Set(list.map(o => o.id));
      for (const [id, o] of objs) if (!want.has(id)) { scene.remove(o); disposeTree(o); objs.delete(id); }
      list.forEach(o => {
        if (objs.has(o.id) || !B[o.k]) return;
        let m; try { m = o.a === undefined ? B[o.k]() : B[o.k](o.a); } catch (e) { return; }
        m.position.set(o.x, o.y || 0, o.z); if (o.ry) m.rotation.y = o.ry;
        m.traverse(n => { if (n.isMesh && n.material && n.material.type !== 'ShaderMaterial') { n.castShadow = true; n.receiveShadow = true; } });
        toonify(m);
        scene.add(m); objs.set(o.id, m);
        if (o.k === 'roleta') wheel = m.getObjectByName('wheel');
      });
      WR.shadowMap.needsUpdate = true;
    }
    const bees = [];
    { const body = mat('#ffc21a', { roughness: 0.4 }), blk = mat('#2a1a10', { roughness: 0.5 }), wingM = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: T.DoubleSide, depthWrite: false });
      for (let i = 0; i < 9; i++) {
        const b = new T.Group(), sc = 0.11 + (i % 3) * 0.015;
        mesh(SPH_LO, body, b, [0, 0, 0], [1, 0.8, 0.8], [0, 0, 0], false);
        [-0.3, 0.25].forEach(x => mesh(new T.TorusGeometry(0.78, 0.13, 6, 16), blk, b, [x, 0, 0], [1, 1, 1], [0, Math.PI / 2, 0], false));
        mesh(SPH_LO, blk, b, [0.95, 0.1, 0], [0.45, 0.45, 0.45], [0, 0, 0], false);
        const wings = [-1, 1].map(sd => { const w = new T.Mesh(new T.CircleGeometry(0.75, 12), wingM); w.position.set(0.05, 0.7, sd * 0.35); w.rotation.set(Math.PI / 2 + sd * 0.4, 0, 0); b.add(w); return w; });
        b.scale.setScalar(sc); toonify(b); scene.add(b);
        bees.push({ b, wings, ph: i * 1.7, r: 3 + (i % 4) * 1.6, sp: 0.18 + (i % 5) * 0.05, h: 1.1 + (i % 3) * 0.5, cx: 7 + ((i * 37) % 7) - 3, cz: 7 + ((i * 53) % 7) - 3 });
      } }
    let lastT = 0;
    function frame(t, o = {}) {
      const dt = Math.min(0.1, (t - lastT) / 1000 || 0); lastT = t;
      seaU.t.value = t / 1000;
      foamM.opacity = 0.26 + Math.sin(t / 900) * 0.1;
      if (wheel) wheel.rotation.z += o.spin ? dt * 9 : dt * 0.25;
      const ts = t / 1000;
      bees.forEach(e => {
        const a = ts * e.sp + e.ph, x = e.cx + Math.cos(a) * e.r, z = e.cz + Math.sin(a * 1.3) * e.r * 0.7, y = e.h + Math.sin(ts * 2 + e.ph) * 0.15;
        e.b.position.set(x, y, z);
        e.b.rotation.y = -Math.atan2(Math.cos(a * 1.3) * 1.3 * e.r * 0.7, -Math.sin(a) * e.r);
        const f = Math.sin(ts * 40 + e.ph) * 0.6; e.wings[0].rotation.x = Math.PI / 2 - 0.4 + f; e.wings[1].rotation.x = Math.PI / 2 + 0.4 - f;
      });
      WR.render(scene, cam);
    }
    // o SVG usa o viewBox L.vb com "meet": a câmera mostra exatamente a mesma área, sem esticar
    function setSize(w, h) {
      WR.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); WR.setSize(w, h, false); WR.shadowMap.needsUpdate = true;
      const [VX, VY, VW, VH] = L.vb || [0, 0, 1000, 600];
      const sc = Math.min(w / VW, h / VH), ox = (w - VW * sc) / 2, oy = (h - VH * sc) / 2;
      const mx0 = VX - ox / sc, mx1 = VX + (w - ox) / sc, my0 = VY - oy / sc, my1 = VY + (h - oy) / sc;
      Object.assign(cam, { left: (mx0 - 500) / PX, right: (mx1 - 500) / PX, top: -(my0 - 68) / PX, bottom: -(my1 - 68) / PX });
      cam.updateProjectionMatrix();
      return sc;
    }
    return { setLots, frame, setSize };
  }
  const isoCache = new Map();
  return {
    world,
    FW, FH, NF,
    load, get ready() { return glbReady; },
    dragonStrip,
    iso(key, ...args) {
      const k = key + args.join(',');
      if (!isoCache.has(k)) {
        const r = isoRender(B[key](...args));
        isoCache.set(k, r);
      }
      return isoCache.get(k);
    },
  };
})();
/* MODELS-END */
