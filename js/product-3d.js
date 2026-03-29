/* product-3d.js — Hyperrealistic 3D product device for ZeroPFAS */
(function () {
  'use strict';

  var canvas = document.getElementById('productCanvas');
  if (!canvas) return;
  var wrap = document.getElementById('productCanvasWrap');
  if (!wrap) return;

  function W() { return wrap.clientWidth || 400; }
  function H() { return wrap.clientHeight || 540; }

  /* -------- Renderer -------- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    console.error('Product 3D: WebGL init failed', e);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, W() / H(), 0.1, 100);
  camera.position.set(4, 2, 8);
  camera.lookAt(0, 0, 0);

  /* -------- Lighting — Studio setup -------- */
  scene.add(new THREE.AmbientLight(0x8899bb, 0.35));

  // Key light (top-right)
  var keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(5, 8, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.bias = -0.002;
  scene.add(keyLight);

  // Fill light (left, cooler)
  var fillLight = new THREE.DirectionalLight(0x8899cc, 0.35);
  fillLight.position.set(-4, 4, -3);
  scene.add(fillLight);

  // Rim light (back, subtle blue)
  var rimLight = new THREE.PointLight(0x4488cc, 1.2, 20);
  rimLight.position.set(-2, 6, -6);
  scene.add(rimLight);

  // Accent glow for teal/blue branding
  var accentLight = new THREE.PointLight(0x30d5c8, 0.8, 12);
  accentLight.position.set(2, -1, 4);
  scene.add(accentLight);

  /* -------- Materials -------- */
  var matWhite = new THREE.MeshStandardMaterial({
    color: 0xe8e8ec, roughness: 0.35, metalness: 0.05
  });
  var matAluminum = new THREE.MeshStandardMaterial({
    color: 0xb0b8c4, roughness: 0.2, metalness: 0.85
  });
  var matDarkMetal = new THREE.MeshStandardMaterial({
    color: 0x2a2a35, roughness: 0.3, metalness: 0.7
  });
  var matTeal = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, roughness: 0.4, metalness: 0.3, emissive: 0x30d5c8, emissiveIntensity: 0.15
  });
  var matBlue = new THREE.MeshStandardMaterial({
    color: 0x2997ff, roughness: 0.45, metalness: 0.2, emissive: 0x2997ff, emissiveIntensity: 0.1
  });
  var matOrange = new THREE.MeshStandardMaterial({
    color: 0xff9500, roughness: 0.4, metalness: 0.2, emissive: 0xff9500, emissiveIntensity: 0.15
  });
  var matGlass = new THREE.MeshStandardMaterial({
    color: 0x88bbdd, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.25
  });
  var matInner = new THREE.MeshStandardMaterial({
    color: 0x1a1a24, roughness: 0.5, metalness: 0.4
  });
  var matCartridge = new THREE.MeshStandardMaterial({
    color: 0x30d158, roughness: 0.4, metalness: 0.3, emissive: 0x30d158, emissiveIntensity: 0.1
  });

  /* -------- Device Group -------- */
  var device = new THREE.Group();
  scene.add(device);

  /* Main cylindrical body */
  var bodyGeo = new THREE.CylinderGeometry(1.1, 1.1, 5.5, 48, 1, false);
  var bodyMesh = new THREE.Mesh(bodyGeo, matWhite);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  device.add(bodyMesh);

  /* Top cap — aluminum */
  var topCapGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.2, 48);
  var topCap = new THREE.Mesh(topCapGeo, matAluminum);
  topCap.position.y = 2.85;
  topCap.castShadow = true;
  device.add(topCap);

  /* Bottom cap — aluminum */
  var botCapGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.2, 48);
  var botCap = new THREE.Mesh(botCapGeo, matAluminum);
  botCap.position.y = -2.85;
  botCap.castShadow = true;
  device.add(botCap);

  /* Inlet port (top) */
  var inletGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24);
  var inlet = new THREE.Mesh(inletGeo, matAluminum);
  inlet.position.set(0, 3.2, 0);
  inlet.castShadow = true;
  device.add(inlet);

  var inletRingGeo = new THREE.TorusGeometry(0.22, 0.04, 12, 32);
  var inletRing = new THREE.Mesh(inletRingGeo, matTeal);
  inletRing.rotation.x = Math.PI / 2;
  inletRing.position.set(0, 3.45, 0);
  device.add(inletRing);

  /* Outlet port (bottom) */
  var outletGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24);
  var outlet = new THREE.Mesh(outletGeo, matAluminum);
  outlet.position.set(0, -3.2, 0);
  outlet.castShadow = true;
  device.add(outlet);

  var outletRingGeo = new THREE.TorusGeometry(0.22, 0.04, 12, 32);
  var outletRing = new THREE.Mesh(outletRingGeo, matCartridge);
  outletRing.rotation.x = Math.PI / 2;
  outletRing.position.set(0, -3.45, 0);
  device.add(outletRing);

  /* -------- Cutaway section — show internal stages -------- */
  /* We create a partial (270°) shell to reveal internals on one side */

  // Cutaway outer shell (shows a slice removed)
  var cutAngle = Math.PI * 1.5; // 270 degrees = quarter removed
  var shellGeo = new THREE.CylinderGeometry(1.12, 1.12, 5.3, 48, 1, true, 0, cutAngle);
  var shellMesh = new THREE.Mesh(shellGeo, matGlass);
  shellMesh.position.y = 0;
  shellMesh.rotation.y = Math.PI * 0.25; // orient cutaway towards camera
  device.add(shellMesh);

  /* Internal stages — stacked discs/cylinders visible through cutaway */

  // Stage 1: Pre-filter (GAC) — top
  var prefilterGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.9, 32);
  var prefilter = new THREE.Mesh(prefilterGeo, matDarkMetal);
  prefilter.position.y = 1.8;
  device.add(prefilter);

  // GAC ring detail
  var gacRingGeo = new THREE.TorusGeometry(0.7, 0.06, 8, 32);
  var gacRing = new THREE.Mesh(gacRingGeo, matBlue);
  gacRing.rotation.x = Math.PI / 2;
  gacRing.position.y = 1.8;
  device.add(gacRing);

  // Stage divider
  var divider1Geo = new THREE.CylinderGeometry(0.95, 0.95, 0.06, 48);
  var divider1 = new THREE.Mesh(divider1Geo, matAluminum);
  divider1.position.y = 1.25;
  device.add(divider1);

  // Stage 2: Advanced Membrane — mid-upper
  var membraneGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.9, 32);
  var membrane = new THREE.Mesh(membraneGeo, matInner);
  membrane.position.y = 0.7;
  device.add(membrane);

  // Membrane spiral detail
  var spiralGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 48, Math.PI * 4);
  var spiral = new THREE.Mesh(spiralGeo, matTeal);
  spiral.rotation.x = Math.PI / 2;
  spiral.position.y = 0.7;
  device.add(spiral);

  // Stage divider 2
  var divider2 = new THREE.Mesh(divider1Geo.clone(), matAluminum);
  divider2.position.y = 0.15;
  device.add(divider2);

  // Stage 3: PFAS Selective Capture — center
  var captureGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.9, 32);
  var capture = new THREE.Mesh(captureGeo, matInner);
  capture.position.y = -0.4;
  device.add(capture);

  // Capture core — glowing orange
  var coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.7, 24);
  var core = new THREE.Mesh(coreGeo, matOrange);
  core.position.y = -0.4;
  device.add(core);

  // Stage divider 3
  var divider3 = new THREE.Mesh(divider1Geo.clone(), matAluminum);
  divider3.position.y = -0.95;
  device.add(divider3);

  // Stage 4: Returnable cartridge — lower
  var cartridgeGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.9, 32);
  var cartridge = new THREE.Mesh(cartridgeGeo, matCartridge);
  cartridge.position.y = -1.5;
  cartridge.castShadow = true;
  device.add(cartridge);

  // Cartridge band
  var bandGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.12, 32);
  var band = new THREE.Mesh(bandGeo, matAluminum);
  band.position.y = -1.5;
  device.add(band);

  // Stage divider 4
  var divider4 = new THREE.Mesh(divider1Geo.clone(), matAluminum);
  divider4.position.y = -2.05;
  device.add(divider4);

  // Stage 5: Outlet chamber — bottom
  var outletChamberGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.5, 32);
  var outletChamber = new THREE.Mesh(outletChamberGeo, matInner);
  outletChamber.position.y = -2.4;
  device.add(outletChamber);

  /* -------- LED indicator ring -------- */
  var ledRingGeo = new THREE.TorusGeometry(1.14, 0.03, 8, 64);
  var ledMat = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, emissive: 0x30d5c8, emissiveIntensity: 0.6,
    roughness: 0.3, metalness: 0.5
  });
  var ledRing = new THREE.Mesh(ledRingGeo, ledMat);
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.y = 2.1;
  device.add(ledRing);

  /* Second LED ring at bottom */
  var ledRing2 = new THREE.Mesh(ledRingGeo.clone(), ledMat);
  ledRing2.rotation.x = Math.PI / 2;
  ledRing2.position.y = -2.1;
  device.add(ledRing2);

  /* -------- Brand label groove -------- */
  var labelGeo = new THREE.BoxGeometry(0.8, 0.15, 0.02);
  var labelMat = new THREE.MeshStandardMaterial({
    color: 0x2997ff, emissive: 0x2997ff, emissiveIntensity: 0.3,
    roughness: 0.4, metalness: 0.3
  });
  var label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, 2.45, 1.12);
  device.add(label);

  /* -------- Shadow receiver plane -------- */
  var floorGeo = new THREE.PlaneGeometry(12, 12);
  var floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.6;
  floor.receiveShadow = true;
  scene.add(floor);

  /* -------- Ambient particles -------- */
  var particleCount = 60;
  var pGeo = new THREE.BufferGeometry();
  var pPositions = new Float32Array(particleCount * 3);
  for (var i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 10;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  var pMat = new THREE.PointsMaterial({
    color: 0x30d5c8, size: 0.04, transparent: true, opacity: 0.35
  });
  var particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* -------- Mouse parallax -------- */
  var mouseX = 0, mouseY = 0;
  var targetRotY = 0, targetRotX = 0;

  wrap.addEventListener('mousemove', function (e) {
    var rect = wrap.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  wrap.addEventListener('mouseleave', function () {
    mouseX = 0;
    mouseY = 0;
  });

  /* -------- Callout reveal on scroll -------- */
  var callouts = document.querySelectorAll('.ph-callout');
  var calloutsRevealed = false;

  function revealCallouts() {
    if (calloutsRevealed) return;
    var rect = wrap.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
      calloutsRevealed = true;
      callouts.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add('is-visible');
        }, 200 + i * 120);
      });
    }
  }
  window.addEventListener('scroll', revealCallouts, { passive: true });
  revealCallouts();

  /* -------- Animation loop -------- */
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    // Gentle auto-rotation
    targetRotY = Math.PI * -0.12 + mouseX * 0.4;
    targetRotX = mouseY * 0.15;
    device.rotation.y += (targetRotY - device.rotation.y) * 0.04;
    device.rotation.x += (targetRotX - device.rotation.x) * 0.04;

    // Subtle float
    device.position.y = Math.sin(t * 0.6) * 0.08;

    // LED pulse
    var pulse = 0.4 + Math.sin(t * 2.5) * 0.3;
    ledMat.emissiveIntensity = pulse;

    // Spiral rotation
    spiral.rotation.z = t * 0.5;

    // Orange core subtle glow
    matOrange.emissiveIntensity = 0.1 + Math.sin(t * 1.8) * 0.08;

    // Particles drift
    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;

    // Accent light subtle animation
    accentLight.intensity = 0.6 + Math.sin(t * 1.2) * 0.2;

    renderer.render(scene, camera);
  }

  /* -------- Resize -------- */
  function onResize() {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 150);
  });

  /* -------- Start -------- */
  animate();

})();
