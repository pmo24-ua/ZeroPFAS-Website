/* bond-3d.js — Cinematic 3D C–F covalent bond render */
(function () {
  'use strict';

  var canvas = document.getElementById('bondCanvas');
  if (!canvas) return;
  var wrap = canvas.parentElement;

  function W() { return wrap.clientWidth || 400; }
  function H() { return wrap.clientHeight || 320; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x060a14, 1);
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();

  /* Camera — centered, medium close */
  var camera = new THREE.PerspectiveCamera(32, W() / H(), 0.1, 100);
  camera.position.set(0, 0.3, 8);
  camera.lookAt(0, 0, 0);

  /* ===== LIGHTING — studio quality ===== */
  /* Ambient fill */
  scene.add(new THREE.AmbientLight(0x1a2540, 0.5));

  /* Key light — warm-white from upper right */
  var keyLight = new THREE.DirectionalLight(0xdde8ff, 0.9);
  keyLight.position.set(5, 6, 4);
  scene.add(keyLight);

  /* Fill light — cool blue from left */
  var fillLight = new THREE.DirectionalLight(0x4466aa, 0.4);
  fillLight.position.set(-4, 2, 3);
  scene.add(fillLight);

  /* Rim light behind — highlights edges */
  var rimLight = new THREE.DirectionalLight(0x6688cc, 0.5);
  rimLight.position.set(0, -1, -5);
  scene.add(rimLight);

  /* Carbon blue point light */
  var cLight = new THREE.PointLight(0x2997ff, 1.2, 8);
  cLight.position.set(-1.8, 0.5, 2);
  scene.add(cLight);

  /* Fluorine teal point light */
  var fLight = new THREE.PointLight(0x30d5c8, 1.5, 8);
  fLight.position.set(1.8, 0.5, 2);
  scene.add(fLight);

  /* Warm accent from below for depth */
  var bottomLight = new THREE.PointLight(0x332244, 0.6, 10);
  bottomLight.position.set(0, -3, 1);
  scene.add(bottomLight);

  /* ===== CARBON ATOM — dense matte-black sphere ===== */
  var carbonRadius = 1.2;
  var carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e,
    metalness: 0.05,
    roughness: 0.75,
    emissive: 0x050508,
    emissiveIntensity: 0.1
  });
  var carbon = new THREE.Mesh(
    new THREE.SphereGeometry(carbonRadius, 32, 24),
    carbonMat
  );
  carbon.position.set(-1.8, 0, 0);
  scene.add(carbon);

  /* Carbon rim-light glow — cool blue halo */
  var cGlow = new THREE.Mesh(
    new THREE.SphereGeometry(carbonRadius * 1.08, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0x2997ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  cGlow.position.copy(carbon.position);
  scene.add(cGlow);

  /* Carbon atmosphere — soft outer blue glow */
  var cAtmo = new THREE.Mesh(
    new THREE.SphereGeometry(carbonRadius * 1.35, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0x2266bb,
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  cAtmo.position.copy(carbon.position);
  scene.add(cAtmo);

  /* ===== FLUORINE ATOM — luminous turquoise-green sphere ===== */
  var fluorineRadius = 1.05;
  var fluorineMat = new THREE.MeshStandardMaterial({
    color: 0x0e9e8e,
    metalness: 0.1,
    roughness: 0.35,
    emissive: 0x0a6e62,
    emissiveIntensity: 0.35
  });
  var fluorine = new THREE.Mesh(
    new THREE.SphereGeometry(fluorineRadius, 32, 24),
    fluorineMat
  );
  fluorine.position.set(1.8, 0, 0);
  scene.add(fluorine);

  /* Fluorine inner subsurface glow */
  var fInnerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(fluorineRadius * 0.85, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0x30d5c8,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  fInnerGlow.position.copy(fluorine.position);
  scene.add(fInnerGlow);

  /* Fluorine rim glow */
  var fGlow = new THREE.Mesh(
    new THREE.SphereGeometry(fluorineRadius * 1.1, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0x30d5c8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  fGlow.position.copy(fluorine.position);
  scene.add(fGlow);

  /* Fluorine atmosphere */
  var fAtmo = new THREE.Mesh(
    new THREE.SphereGeometry(fluorineRadius * 1.4, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0x22aa99,
      transparent: true,
      opacity: 0.035,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  fAtmo.position.copy(fluorine.position);
  scene.add(fAtmo);

  /* ===== COVALENT BOND — electron density bridge ===== */
  /* Central glowing tube representing sigma bond electron density */
  var bondLen = 3.6; /* distance between atom centers */
  var bondRadius = 0.18;

  /* Core electron density — bright central glow */
  var bondCoreMat = new THREE.MeshStandardMaterial({
    color: 0x55cccc,
    emissive: 0x44bbbb,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.6,
    metalness: 0.0,
    roughness: 0.2
  });
  var bondCore = new THREE.Mesh(
    new THREE.CylinderGeometry(bondRadius, bondRadius, bondLen * 0.55, 16),
    bondCoreMat
  );
  bondCore.rotation.z = Math.PI / 2;
  scene.add(bondCore);

  /* Wider diffuse electron cloud around the bond */
  var bondCloudMat = new THREE.MeshBasicMaterial({
    color: 0x44aaaa,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var bondCloud = new THREE.Mesh(
    new THREE.CylinderGeometry(bondRadius * 2.8, bondRadius * 2.8, bondLen * 0.5, 16),
    bondCloudMat
  );
  bondCloud.rotation.z = Math.PI / 2;
  scene.add(bondCloud);

  /* Outer haze — very soft glow envelope */
  var bondHaze = new THREE.Mesh(
    new THREE.CylinderGeometry(bondRadius * 5, bondRadius * 5, bondLen * 0.4, 12),
    new THREE.MeshBasicMaterial({
      color: 0x3399aa,
      transparent: true,
      opacity: 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  bondHaze.rotation.z = Math.PI / 2;
  scene.add(bondHaze);

  /* Electron density gradient — taper from C to F (electronegativity) */
  /* More density toward F side */
  var densityShift = new THREE.Mesh(
    new THREE.CylinderGeometry(bondRadius * 0.5, bondRadius * 1.8, bondLen * 0.48, 12),
    new THREE.MeshBasicMaterial({
      color: 0x30d5c8,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  densityShift.rotation.z = Math.PI / 2;
  densityShift.position.x = 0.15; /* slight shift toward F */
  scene.add(densityShift);

  /* Shared electron pair — two small bright orbs oscillating */
  var e1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(e1);

  var e2 = e1.clone();
  scene.add(e2);

  /* Electron glow halos */
  var eGlowMat = new THREE.MeshBasicMaterial({
    color: 0x88dddd,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var e1Glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), eGlowMat.clone());
  scene.add(e1Glow);
  var e2Glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), eGlowMat.clone());
  scene.add(e2Glow);

  /* ===== ATOM LABELS — "C 6" and "F 9" as 3D HTML overlays ===== */
  var labelC = document.createElement('div');
  labelC.innerHTML = '<div style="font-size:28px;font-weight:800;line-height:1;color:#fff;text-shadow:0 0 12px rgba(41,151,255,.4),0 2px 6px rgba(0,0,0,.6)">C</div><div style="font-size:11px;font-weight:500;color:rgba(255,255,255,.4);margin-top:2px;letter-spacing:.05em">6</div>';
  Object.assign(labelC.style, {
    position: 'absolute', pointerEvents: 'none',
    textAlign: 'center', transform: 'translate(-50%,-50%)',
    zIndex: '3', opacity: '0', transition: 'opacity .8s ease'
  });
  wrap.appendChild(labelC);

  var labelF = document.createElement('div');
  labelF.innerHTML = '<div style="font-size:28px;font-weight:800;line-height:1;color:#fff;text-shadow:0 0 12px rgba(48,213,200,.4),0 2px 6px rgba(0,0,0,.6)">F</div><div style="font-size:11px;font-weight:500;color:rgba(255,255,255,.4);margin-top:2px;letter-spacing:.05em">9</div>';
  Object.assign(labelF.style, {
    position: 'absolute', pointerEvents: 'none',
    textAlign: 'center', transform: 'translate(-50%,-50%)',
    zIndex: '3', opacity: '0', transition: 'opacity .8s ease'
  });
  wrap.appendChild(labelF);

  /* BDE energy label */
  var labelBDE = document.createElement('div');
  labelBDE.innerHTML = '<span style="font-weight:700;letter-spacing:.1em;font-size:11px">BDE</span> <span style="font-weight:800;font-size:13px;letter-spacing:.02em">485</span> <span style="font-weight:500;font-size:10px;opacity:.7">kJ/mol</span>';
  Object.assign(labelBDE.style, {
    position: 'absolute', pointerEvents: 'none',
    color: '#ff9500', textAlign: 'center',
    transform: 'translate(-50%,-50%)',
    fontFamily: 'Inter, system-ui, sans-serif',
    textShadow: '0 0 14px rgba(255,149,0,.35), 0 2px 4px rgba(0,0,0,.5)',
    zIndex: '3', opacity: '0', transition: 'opacity .8s ease'
  });
  wrap.appendChild(labelBDE);

  setTimeout(function () {
    labelC.style.opacity = '1';
    labelF.style.opacity = '1';
    labelBDE.style.opacity = '1';
  }, 400);

  /* Reuse vectors to avoid GC pressure */
  var _v3C = new THREE.Vector3();
  var _v3F = new THREE.Vector3();
  var _v3B = new THREE.Vector3(0, -1.2, 0);
  var cachedW = W(), cachedH = H();

  function updateLabels() {
    _v3C.copy(carbon.position).project(camera);
    labelC.style.left = (_v3C.x * 0.5 + 0.5) * cachedW + 'px';
    labelC.style.top = (-_v3C.y * 0.5 + 0.5) * cachedH + 'px';

    _v3F.copy(fluorine.position).project(camera);
    labelF.style.left = (_v3F.x * 0.5 + 0.5) * cachedW + 'px';
    labelF.style.top = (-_v3F.y * 0.5 + 0.5) * cachedH + 'px';

    _v3B.set(0, -1.2, 0).project(camera);
    labelBDE.style.left = (_v3B.x * 0.5 + 0.5) * cachedW + 'px';
    labelBDE.style.top = (-_v3B.y * 0.5 + 0.5) * cachedH + 'px';
  }

  /* ===== AMBIENT PARTICLES — atmospheric dust ===== */
  var DUST = 60;
  var dustGeo = new THREE.BufferGeometry();
  var dustPos = new Float32Array(DUST * 3);
  var dustVel = new Float32Array(DUST * 3);
  for (var di = 0; di < DUST; di++) {
    dustPos[di * 3] = (Math.random() - 0.5) * 12;
    dustPos[di * 3 + 1] = (Math.random() - 0.5) * 8;
    dustPos[di * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    dustVel[di * 3] = (Math.random() - 0.5) * 0.002;
    dustVel[di * 3 + 1] = (Math.random() - 0.5) * 0.002;
    dustVel[di * 3 + 2] = (Math.random() - 0.5) * 0.001;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.3, transparent: true, opacity: 0.1, color: 0x6688aa,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  /* ===== MOUSE INTERACTION — smooth parallax ===== */
  var targetMx = 0, targetMy = 0;
  var smoothMx = 0, smoothMy = 0;
  var cachedRect = null;
  function refreshRect() { cachedRect = wrap.getBoundingClientRect(); }
  refreshRect();
  wrap.addEventListener('mousemove', function (e) {
    if (!cachedRect) refreshRect();
    targetMx = ((e.clientX - cachedRect.left) / cachedRect.width - 0.5) * 2;
    targetMy = ((e.clientY - cachedRect.top) / cachedRect.height - 0.5) * 2;
  }, { passive: true });
  wrap.addEventListener('mouseleave', function () { targetMx = 0; targetMy = 0; }, { passive: true });

  /* ===== VISIBILITY GATING — only render when on screen ===== */
  var isVisible = false;
  var observer = new IntersectionObserver(function (entries) {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(wrap);

  /* ===== ANIMATION LOOP ===== */
  var clock = new THREE.Clock();
  var frameCount = 0;
  var LERP = 0.04; /* smoothing factor — lower = smoother */

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || window.__zeroPFAS_paused) return;
    var t = clock.getElapsedTime();
    frameCount++;

    /* Lerp mouse toward target for fluid parallax */
    smoothMx += (targetMx - smoothMx) * LERP;
    smoothMy += (targetMy - smoothMy) * LERP;

    /* Subtle camera sway + smooth mouse parallax */
    camera.position.x = smoothMx * 0.3 + Math.sin(t * 0.3) * 0.08;
    camera.position.y = 0.3 - smoothMy * 0.15 + Math.cos(t * 0.25) * 0.05;
    camera.lookAt(0, 0, 0);

    /* Atom breathing — very subtle scale pulse */
    var cBreath = 1.0 + Math.sin(t * 0.8) * 0.008;
    carbon.scale.setScalar(cBreath);
    cGlow.scale.setScalar(cBreath * 1.08);

    var fBreath = 1.0 + Math.sin(t * 0.8 + 1) * 0.01;
    fluorine.scale.setScalar(fBreath);
    fGlow.scale.setScalar(fBreath * 1.1);
    fInnerGlow.scale.setScalar(fBreath * 0.85);

    /* Fluorine subsurface glow pulse */
    fInnerGlow.material.opacity = 0.1 + Math.sin(t * 1.2) * 0.03;
    fluorineMat.emissiveIntensity = 0.3 + Math.sin(t * 1.0) * 0.08;

    /* Glow halos pulse */
    cGlow.material.opacity = 0.05 + Math.sin(t * 0.9) * 0.015;
    fGlow.material.opacity = 0.07 + Math.sin(t * 0.9 + 0.5) * 0.02;
    cAtmo.material.opacity = 0.025 + Math.sin(t * 0.6) * 0.008;
    fAtmo.material.opacity = 0.03 + Math.sin(t * 0.6 + 1) * 0.01;

    /* Bond glow pulse */
    bondCoreMat.opacity = 0.55 + Math.sin(t * 1.5) * 0.08;
    bondCoreMat.emissiveIntensity = 0.7 + Math.sin(t * 1.8) * 0.15;
    bondCloud.material.opacity = 0.07 + Math.sin(t * 1.2) * 0.02;
    bondHaze.material.opacity = 0.025 + Math.sin(t * 0.8) * 0.008;

    /* Shared electrons oscillating along bond axis */
    var eOsc = Math.sin(t * 2.0) * 0.25;
    e1.position.set(-0.15 + eOsc, Math.sin(t * 3.0) * 0.04, Math.cos(t * 2.5) * 0.04);
    e2.position.set(0.15 - eOsc, -Math.sin(t * 3.0 + 1) * 0.04, -Math.cos(t * 2.5 + 1) * 0.04);
    e1Glow.position.copy(e1.position);
    e2Glow.position.copy(e2.position);
    e1.material.opacity = 0.7 + Math.sin(t * 2.5) * 0.15;
    e2.material.opacity = 0.7 + Math.sin(t * 2.5 + Math.PI) * 0.15;
    e1Glow.material.opacity = 0.2 + Math.sin(t * 2.5) * 0.08;
    e2Glow.material.opacity = 0.2 + Math.sin(t * 2.5 + Math.PI) * 0.08;

    /* Light intensity breathing */
    cLight.intensity = 1.0 + Math.sin(t * 0.7) * 0.2;
    fLight.intensity = 1.3 + Math.sin(t * 0.7 + 1) * 0.25;

    /* Dust drift — update every 3rd frame */
    if (frameCount % 3 === 0) {
      var dP = dustGeo.attributes.position.array;
      for (var i = 0; i < DUST; i++) {
        dP[i * 3] += dustVel[i * 3] * 3;
        dP[i * 3 + 1] += dustVel[i * 3 + 1] * 3;
        dP[i * 3 + 2] += dustVel[i * 3 + 2] * 3;
        if (Math.abs(dP[i * 3]) > 6) dustVel[i * 3] *= -1;
        if (Math.abs(dP[i * 3 + 1]) > 4) dustVel[i * 3 + 1] *= -1;
        if (Math.abs(dP[i * 3 + 2]) > 4) dustVel[i * 3 + 2] *= -1;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    /* Labels — update every 2nd frame */
    if (frameCount % 2 === 0) updateLabels();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    cachedW = W(); cachedH = H();
    camera.aspect = cachedW / cachedH;
    camera.updateProjectionMatrix();
    renderer.setSize(cachedW, cachedH);
    refreshRect();
  });
})();
