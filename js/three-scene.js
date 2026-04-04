/* three-scene.js — PFAS treatment pipeline — self-explanatory visualization */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var wrap = canvas.parentElement;

  function W() { return wrap.clientWidth || window.innerWidth; }
  function H() { return wrap.clientHeight || 460; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x05050a, 1);
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050a, 0.006);

  var camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 200);
  camera.position.set(0, 3, 28);
  camera.lookAt(0, 0, 0);

  /* Responsive: widen FOV and push camera back on narrow screens */
  var isMobile = W() < 768;
  function adaptCamera() {
    isMobile = W() < 768;
    if (isMobile) {
      camera.fov = 62;
      camera.position.z = 32;
      camera.position.y = 4;
    } else {
      camera.fov = 40;
    }
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  }
  adaptCamera();

  /* -------- Lighting -------- */
  scene.add(new THREE.AmbientLight(0x8090b0, 0.45));
  var dirLight = new THREE.DirectionalLight(0xddeeff, 0.9);
  dirLight.position.set(8, 12, 10);
  scene.add(dirLight);
  scene.add(function () {
    var f = new THREE.DirectionalLight(0x6688cc, 0.3);
    f.position.set(-6, 5, -8);
    return f;
  }());

  var POS = { capture: -10.5, membrane: -3.5, reactor: 3.5, verify: 10.5 };
  var COL = {
    pfas: 0xff4444, water: 0x2997ff, teal: 0x30d5c8, orange: 0xff9500,
    hotCore: 0xffcc33, green: 0x30d158, steel: 0x8899aa, darkSteel: 0x556677,
    fluoride: 0x40e0d0
  };

  /* Module lighting — strong colored glows */
  var captureLight = new THREE.PointLight(0x4488cc, 2.5, 16);
  captureLight.position.set(POS.capture, 3, 5);
  scene.add(captureLight);
  var membraneLight = new THREE.PointLight(0x30d5c8, 2.2, 16);
  membraneLight.position.set(POS.membrane, 2, 5);
  scene.add(membraneLight);
  var reactorLight = new THREE.PointLight(0xff8800, 3.5, 20);
  reactorLight.position.set(POS.reactor, 2, 5);
  scene.add(reactorLight);
  var verifyLight = new THREE.PointLight(0x30d158, 2.0, 16);
  verifyLight.position.set(POS.verify, 2, 5);
  scene.add(verifyLight);
  scene.add(function () {
    var r = new THREE.PointLight(0x4466aa, 0.8, 50);
    r.position.set(0, 6, -12);
    return r;
  }());

  /* Ground grid */
  var gridMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(45, 22, 45, 22),
    new THREE.MeshBasicMaterial({ color: 0x1a1a3e, transparent: true, opacity: 0.06, wireframe: true, side: THREE.DoubleSide })
  );
  gridMesh.rotation.x = -Math.PI / 2;
  gridMesh.position.y = -5.5;
  scene.add(gridMesh);

  /* Shared materials */
  var steelMat = new THREE.MeshStandardMaterial({ color: 0x7788aa, metalness: 0.65, roughness: 0.2 });

  /* ================================================
     MODULE 1 — FILTRO DE CARBÓN (Captura)
     Simple iconic shape: transparent cylinder with
     dark granules inside and red particles being caught.
     Like a water filter you can understand at a glance.
     ================================================ */
  var captureG = new THREE.Group();
  captureG.position.set(POS.capture, 0, 0);

  /* Transparent outer shell — so you can see inside */
  var filterShell = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 7, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x6688aa, metalness: 0.3, roughness: 0.15,
      transparent: true, opacity: 0.18, side: THREE.DoubleSide
    })
  );
  captureG.add(filterShell);

  /* Solid top cap */
  var filterTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.3, 32),
    new THREE.MeshStandardMaterial({ color: 0x556688, metalness: 0.6, roughness: 0.2 })
  );
  filterTop.position.y = 3.65;
  captureG.add(filterTop);

  /* Solid bottom cap */
  var filterBot = filterTop.clone();
  filterBot.position.y = -3.65;
  captureG.add(filterBot);

  /* Visible dark CARBON GRANULES inside — the "filter media" */
  var GAC = 200;
  var gacGeo = new THREE.BufferGeometry();
  var gacPos = new Float32Array(GAC * 3);
  for (var gi = 0; gi < GAC; gi++) {
    var ga = Math.random() * Math.PI * 2, gr = Math.random() * 1.3;
    gacPos[gi * 3] = Math.cos(ga) * gr;
    gacPos[gi * 3 + 1] = (Math.random() - 0.5) * 6.2;
    gacPos[gi * 3 + 2] = Math.sin(ga) * gr;
  }
  gacGeo.setAttribute('position', new THREE.BufferAttribute(gacPos, 3));
  var gacMat = new THREE.PointsMaterial({ size: 2.5, color: 0x2a2a3a, transparent: true, opacity: 0.55, sizeAttenuation: true, depthWrite: false });
  captureG.add(new THREE.Points(gacGeo, gacMat));

  /* RED PFAS particles being caught — very visible */
  var ADS = 50;
  var adsGeo = new THREE.BufferGeometry();
  var adsArr = new Float32Array(ADS * 3);
  for (var ai = 0; ai < ADS; ai++) {
    var aa = Math.random() * Math.PI * 2, ar = Math.random() * 1.1;
    adsArr[ai * 3] = Math.cos(aa) * ar;
    adsArr[ai * 3 + 1] = (Math.random() - 0.5) * 5.8;
    adsArr[ai * 3 + 2] = Math.sin(aa) * ar;
  }
  adsGeo.setAttribute('position', new THREE.BufferAttribute(adsArr, 3));
  var adsMat = new THREE.PointsMaterial({ size: 3.5, color: COL.pfas, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  captureG.add(new THREE.Points(adsGeo, adsMat));

  /* Blue glow ring at top = water inlet */
  var inletRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.12, 8, 32),
    new THREE.MeshBasicMaterial({ color: COL.water, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  inletRing.rotation.x = Math.PI / 2;
  inletRing.position.y = 3.65;
  captureG.add(inletRing);

  /* Green glow ring at bottom = filtered water outlet */
  var outletRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.12, 8, 32),
    new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  outletRing.rotation.x = Math.PI / 2;
  outletRing.position.y = -3.65;
  captureG.add(outletRing);

  /* Pipe going in (top) */
  var inPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 1.5, 12),
    steelMat
  );
  inPipe.position.y = 4.55;
  captureG.add(inPipe);

  /* Pipe going out (bottom) */
  var outPipe = inPipe.clone();
  outPipe.position.y = -4.55;
  captureG.add(outPipe);

  scene.add(captureG);

  /* ================================================
     MODULE 2 — MEMBRANAS (Concentración)
     3 parallel horizontal tubes in a frame,
     water enters wide, exits concentrated.
     ================================================ */
  var memG = new THREE.Group();
  memG.position.set(POS.membrane, 0, 0);

  /* Steel frame holding the tubes */
  var frameMat = new THREE.MeshStandardMaterial({ color: 0x4a5a6a, metalness: 0.6, roughness: 0.28 });
  /* 4 vertical posts */
  [[-2.2, -1.2], [-2.2, 1.2], [2.2, -1.2], [2.2, 1.2]].forEach(function (p) {
    var leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 6.5, 0.15), frameMat);
    leg.position.set(p[0], 0, p[1]);
    memG.add(leg);
  });
  /* Horizontal beams */
  [-3.0, 0, 3.0].forEach(function (y) {
    [-1.2, 1.2].forEach(function (z) {
      var beam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 0.1), frameMat);
      beam.position.set(0, y, z);
      memG.add(beam);
    });
  });

  /* 3 white membrane tubes — clearly visible */
  var membraneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.1, roughness: 0.4 });
  var memTubes = [];
  var memYPositions = [1.6, 0, -1.6];
  memYPositions.forEach(function (yp) {
    var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 4.0, 20), membraneMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.y = yp;
    memG.add(tube);
    memTubes.push(tube);

    /* Blue cap on left end */
    var blueCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x2266cc, metalness: 0.3, roughness: 0.35 })
    );
    blueCap.rotation.z = Math.PI / 2;
    blueCap.position.set(-2.0, yp, 0);
    memG.add(blueCap);

    /* Red cap on right end */
    var redCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xcc3333, metalness: 0.3, roughness: 0.35 })
    );
    redCap.rotation.z = -Math.PI / 2;
    redCap.position.set(2.0, yp, 0);
    memG.add(redCap);
  });

  /* Inner membrane glow — shows filtration happening */
  var memGlowMat = new THREE.MeshBasicMaterial({
    color: COL.teal, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  var memGlows = [];
  memYPositions.forEach(function (yp) {
    var mg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.6, 16), memGlowMat.clone());
    mg.rotation.z = Math.PI / 2;
    mg.position.y = yp;
    memG.add(mg);
    memGlows.push(mg);
  });

  /* Feed pipe left (blue) */
  var feedPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 5.0, 12),
    new THREE.MeshStandardMaterial({ color: 0x3366aa, metalness: 0.45, roughness: 0.3 })
  );
  feedPipe.position.set(-2.6, 0, 0);
  memG.add(feedPipe);

  /* Permeate pipe right */
  var permPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 5.0, 12),
    new THREE.MeshStandardMaterial({ color: 0x2288aa, metalness: 0.45, roughness: 0.3 })
  );
  permPipe.position.set(2.6, 0, 0);
  memG.add(permPipe);

  /* Base plate */
  var memBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.25, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x505860, metalness: 0.3, roughness: 0.6 })
  );
  memBase.position.y = -3.5;
  memG.add(memBase);

  scene.add(memG);

  /* ================================================
     MODULE 3 — REACTOR SCWO (Destrucción)
     Horizontal glowing chamber — dramatic orange glow
     makes it obviously a "hot reactor" at first glance
     ================================================ */
  var reactorG = new THREE.Group();
  reactorG.position.set(POS.reactor, 0, 0);

  /* Outer shell — dark thick cylinder */
  var reactorBodyMat = new THREE.MeshStandardMaterial({ color: 0x5a5a60, metalness: 0.7, roughness: 0.18 });
  var reactorBody = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.0, 5.0, 32),
    reactorBodyMat
  );
  reactorBody.rotation.z = Math.PI / 2;
  reactorG.add(reactorBody);

  /* Flanges at both ends */
  [-2.6, 2.6].forEach(function (ex) {
    var fDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 0.25, 32),
      new THREE.MeshStandardMaterial({ color: 0x6a6a70, metalness: 0.7, roughness: 0.15 })
    );
    fDisc.rotation.z = Math.PI / 2;
    fDisc.position.x = ex;
    reactorG.add(fDisc);
  });

  /* DRAMATIC INNER GLOW — this is what makes it obviously a "hot reactor" */
  var scZone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 4.5, 16),
    new THREE.MeshStandardMaterial({
      color: COL.hotCore, emissive: COL.orange, emissiveIntensity: 1.8,
      transparent: true, opacity: 0.5
    })
  );
  scZone.rotation.z = Math.PI / 2;
  reactorG.add(scZone);

  /* Outer heat glow — large visible orange aura */
  var scGlow = new THREE.Mesh(
    new THREE.SphereGeometry(3.0, 20, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  reactorG.add(scGlow);

  /* Heat rings orbiting the vessel */
  var heatRings = [];
  for (var hri = 0; hri < 3; hri++) {
    var hr = new THREE.Mesh(
      new THREE.TorusGeometry(2.5 + hri * 0.35, 0.06, 6, 24),
      new THREE.MeshStandardMaterial({
        color: COL.orange, emissive: COL.orange, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.3
      })
    );
    hr.rotation.set(hri * 1.0, hri * 0.5, 0);
    reactorG.add(hr);
    heatRings.push(hr);
  }

  /* Support saddles */
  [-1.5, 1.5].forEach(function (cx) {
    var saddle = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.18, 8, 20, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x4a5060, metalness: 0.6, roughness: 0.25 })
    );
    saddle.rotation.y = Math.PI / 2;
    saddle.rotation.x = Math.PI;
    saddle.position.set(cx, -2.0, 0);
    reactorG.add(saddle);
    var plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.5, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x4a5060, metalness: 0.55, roughness: 0.3 })
    );
    plate.position.set(cx, -2.8, 0);
    reactorG.add(plate);
  });

  /* Base pad */
  var rBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.3, 3.5),
    new THREE.MeshStandardMaterial({ color: 0x505860, metalness: 0.3, roughness: 0.6 })
  );
  rBase.position.y = -3.6;
  reactorG.add(rBase);

  /* Decomposition particles inside — visible glow specks */
  var DECOMP = 60;
  var decompGeo = new THREE.BufferGeometry();
  var decompPos = new Float32Array(DECOMP * 3);
  var decompVel = new Float32Array(DECOMP * 3);
  var decompLife = new Float32Array(DECOMP);
  function resetDecomp(i) {
    var a = Math.random() * Math.PI * 2;
    decompPos[i * 3] = POS.reactor + (Math.random() - 0.5) * 3;
    decompPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    decompPos[i * 3 + 2] = Math.sin(a) * 0.8;
    decompVel[i * 3] = (Math.random() - 0.5) * 0.015;
    decompVel[i * 3 + 1] = Math.random() * 0.02;
    decompVel[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    decompLife[i] = 0;
  }
  for (var di = 0; di < DECOMP; di++) { resetDecomp(di); decompLife[di] = Math.random(); }
  decompGeo.setAttribute('position', new THREE.BufferAttribute(decompPos, 3));
  var decompMat = new THREE.PointsMaterial({
    size: 3.0, color: COL.hotCore, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  scene.add(new THREE.Points(decompGeo, decompMat));

  scene.add(reactorG);

  /* ================================================
     MODULE 4 — ANÁLISIS (Verificación)
     Monitor with graph + green checkmark.
     Anyone can understand "data screen = verification"
     ================================================ */
  var verifyG = new THREE.Group();
  verifyG.position.set(POS.verify, 0, 0);

  /* Main instrument body */
  var instrMat = new THREE.MeshStandardMaterial({ color: 0xd0ccc4, metalness: 0.15, roughness: 0.45 });
  var mainBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.5, 2.4), instrMat);
  mainBody.position.y = -1.0;
  verifyG.add(mainBody);

  /* LARGE MONITOR — prominent and clearly a "screen" */
  var monitorG = new THREE.Group();
  monitorG.position.set(0, 1.8, 0);
  monitorG.rotation.x = -0.15;

  /* Screen bezel — black */
  var bezel = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 2.2, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.3 })
  );
  monitorG.add(bezel);

  /* Screen face — dark with green glow (clearly a display) */
  var screenMat = new THREE.MeshStandardMaterial({
    color: 0x0a1a0a, emissive: COL.green, emissiveIntensity: 0.3,
    metalness: 0.1, roughness: 0.15
  });
  var screenFace = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), screenMat);
  screenFace.position.z = 0.07;
  monitorG.add(screenFace);

  verifyG.add(monitorG);

  /* Chromatogram on screen — visible line graph */
  var chromPoints = [];
  for (var ci = 0; ci < 24; ci++) {
    var cxp = -1.15 + (ci / 23) * 2.3;
    var cyp = 1.8 + Math.sin(ci * 0.7) * 0.2 +
              (ci > 10 && ci < 16 ? Math.exp(-Math.pow(ci - 13, 2) / 4) * 0.55 : 0);
    chromPoints.push(new THREE.Vector3(cxp, cyp, 0.1));
  }
  var chromLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(chromPoints),
    new THREE.LineBasicMaterial({ color: COL.green, transparent: true, opacity: 0.9, linewidth: 2 })
  );
  verifyG.add(chromLine);

  /* GREEN CHECKMARK — 3D lines forming a ✓ */
  var checkPts1 = [new THREE.Vector3(-0.4, 1.5, 0.15), new THREE.Vector3(-0.1, 1.15, 0.15)];
  var checkPts2 = [new THREE.Vector3(-0.1, 1.15, 0.15), new THREE.Vector3(0.5, 2.15, 0.15)];
  var checkMat = new THREE.LineBasicMaterial({ color: COL.green, linewidth: 3 });
  verifyG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(checkPts1), checkMat));
  verifyG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(checkPts2), checkMat));

  /* Green confirmation ring around monitor */
  var fRing = new THREE.Mesh(
    new THREE.RingGeometry(1.6, 1.8, 24),
    new THREE.MeshBasicMaterial({
      color: COL.green, transparent: true, opacity: 0.2,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  fRing.position.set(0, 1.8, 0.05);
  fRing.rotation.x = -0.15;
  verifyG.add(fRing);

  /* Confirmation pulses expanding from monitor */
  var confPulses = [];
  for (var cpi = 0; cpi < 3; cpi++) {
    var cpMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.2, 20),
      new THREE.MeshBasicMaterial({
        color: COL.green, transparent: true, opacity: 0.15,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    cpMesh.position.set(0, 1.8, 0.1);
    cpMesh.rotation.x = -0.15;
    cpMesh.userData.phase = (cpi / 3) * Math.PI * 2;
    verifyG.add(cpMesh);
    confPulses.push(cpMesh);
  }

  /* Status LEDs */
  var ledColors = [0x30d158, 0x30d158, 0x30d158, 0xffcc00, 0x4488ff];
  ledColors.forEach(function (c, i) {
    var led = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 })
    );
    led.position.set(-1.2 + i * 0.3, -0.2, 1.22);
    verifyG.add(led);
  });

  /* Base */
  var vBase = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.2, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x4a4a50, metalness: 0.35, roughness: 0.4 })
  );
  vBase.position.y = -2.4;
  verifyG.add(vBase);

  scene.add(verifyG);

  /* ================================================
     CONNECTING PIPES — transparent glass so water is visible inside
     ================================================ */
  var pipeSegs = [
    [POS.capture + 2.0, POS.membrane - 2.8],
    [POS.membrane + 2.8, POS.reactor - 3.0],
    [POS.reactor + 3.0, POS.verify - 2.5]
  ];
  /* Glass outer pipe — transparent so you see water inside */
  var glassPipeMat = new THREE.MeshStandardMaterial({
    color: 0x99bbdd, metalness: 0.3, roughness: 0.05,
    transparent: true, opacity: 0.15, side: THREE.DoubleSide
  });
  pipeSegs.forEach(function (seg) {
    var len = seg[1] - seg[0];
    var mx = (seg[0] + seg[1]) / 2;
    var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, len, 16, 1, true), glassPipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(mx, 0, 0);
    scene.add(pipe);
  });

  /* Steel flanges/joints at each pipe connection point */
  var flangeMat = new THREE.MeshStandardMaterial({ color: 0x7788aa, metalness: 0.65, roughness: 0.2 });
  pipeSegs.forEach(function (seg) {
    [seg[0], seg[1]].forEach(function (x) {
      var fl = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 8, 20), flangeMat);
      fl.rotation.y = Math.PI / 2;
      fl.position.set(x, 0, 0);
      scene.add(fl);
    });
  });

  /* WATER STREAM INSIDE PIPES — animated cylinders that move and change color */
  var WATER_SEGS = 24; /* segments of water per pipe */
  var waterMeshes = [];
  var waterSegData = []; /* {mesh, seg, segIdx, progress} */
  var pipeColors = [
    [new THREE.Color(0xcc4422), new THREE.Color(0x2288cc)], /* pipe 1: brownish-red → blue */
    [new THREE.Color(0x2288cc), new THREE.Color(0x22bbaa)], /* pipe 2: blue → teal */
    [new THREE.Color(0x22bbaa), new THREE.Color(0x33dd66)]  /* pipe 3: teal → green */
  ];
  pipeSegs.forEach(function (seg, si) {
    var len = seg[1] - seg[0];
    var segLen = len / WATER_SEGS;
    for (var wi = 0; wi < WATER_SEGS; wi++) {
      var wMat = new THREE.MeshStandardMaterial({
        color: 0x2299ff, emissive: 0x1166aa, emissiveIntensity: 0.2,
        transparent: true, opacity: 0.55, metalness: 0.1, roughness: 0.3
      });
      var wMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, segLen * 0.8, 8),
        wMat
      );
      wMesh.rotation.z = Math.PI / 2;
      var xPos = seg[0] + (wi + 0.5) * segLen;
      wMesh.position.set(xPos, 0, 0);
      scene.add(wMesh);
      waterMeshes.push(wMesh);
      waterSegData.push({ mesh: wMesh, pipeIdx: si, localT: wi / WATER_SEGS });
    }
  });

  /* Small directional arrows between modules */
  var arrowMat = new THREE.MeshStandardMaterial({
    color: COL.water, emissive: COL.water, emissiveIntensity: 0.3,
    metalness: 0.3, roughness: 0.4, transparent: true, opacity: 0.7
  });
  pipeSegs.forEach(function (seg) {
    var ax = (seg[0] + seg[1]) / 2;
    var arr = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), arrowMat);
    arr.rotation.z = -Math.PI / 2;
    arr.position.set(ax, 0, 0);
    scene.add(arr);
  });

  /* ================================================
     3D WATER DROP — ENTRY (red, contaminated)
     Large animated drop on the far left
     ================================================ */
  var entryDropG = new THREE.Group();
  entryDropG.position.set(POS.capture - 4.5, 1.5, 0);

  /* Drop body (sphere + cone to make tear shape) */
  var dropRedMat = new THREE.MeshStandardMaterial({
    color: 0xff3333, emissive: 0xff2222, emissiveIntensity: 0.3,
    metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.85
  });
  entryDropG.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), dropRedMat));
  var dropTip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.0, 12), dropRedMat);
  dropTip.position.y = 0.9;
  entryDropG.add(dropTip);

  /* Red glow aura */
  entryDropG.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xff4444, transparent: true, opacity: 0.1,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  ));

  /* Small "PFAS" toxic particles around it */
  var toxGeo = new THREE.BufferGeometry();
  var toxArr = new Float32Array(20 * 3);
  for (var ti = 0; ti < 20; ti++) {
    toxArr[ti * 3] = (Math.random() - 0.5) * 2.5;
    toxArr[ti * 3 + 1] = (Math.random() - 0.5) * 3;
    toxArr[ti * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  toxGeo.setAttribute('position', new THREE.BufferAttribute(toxArr, 3));
  entryDropG.add(new THREE.Points(toxGeo, new THREE.PointsMaterial({
    size: 3.0, color: 0xff6644, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  scene.add(entryDropG);

  /* ================================================
     3D WATER DROP — EXIT (green/blue, clean)
     Large animated drop on the far right
     ================================================ */
  var exitDropG = new THREE.Group();
  exitDropG.position.set(POS.verify + 4.5, 1.5, 0);

  var dropGreenMat = new THREE.MeshStandardMaterial({
    color: 0x22dd66, emissive: 0x22cc55, emissiveIntensity: 0.35,
    metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.85
  });
  exitDropG.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), dropGreenMat));
  var exitTip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.0, 12), dropGreenMat);
  exitTip.position.y = 0.9;
  exitDropG.add(exitTip);

  /* Green glow aura */
  exitDropG.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0x33ee77, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  ));

  /* Clean sparkle particles around it */
  var sparkGeo = new THREE.BufferGeometry();
  var sparkArr = new Float32Array(15 * 3);
  for (var si = 0; si < 15; si++) {
    sparkArr[si * 3] = (Math.random() - 0.5) * 2.5;
    sparkArr[si * 3 + 1] = (Math.random() - 0.5) * 3;
    sparkArr[si * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3));
  exitDropG.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 2.5, color: 0x66ffaa, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  scene.add(exitDropG);

  /* ================================================
     WATER DROPLET PARTICLES — confined INSIDE the pipes
     Small bubbles that flow left→right through pipes
     ================================================ */
  var DROPS = 60;
  var dropGeo = new THREE.BufferGeometry();
  var dropPos = new Float32Array(DROPS * 3);
  var dropCol = new Float32Array(DROPS * 3);
  var dropProg = new Float32Array(DROPS);
  var dropSpd = new Float32Array(DROPS);
  var dropPipe = new Uint8Array(DROPS); /* which pipe segment 0,1,2 */
  var dropOff = new Float32Array(DROPS * 2); /* y,z offset within pipe radius */
  var totalSpan = POS.verify - POS.capture;

  for (var di = 0; di < DROPS; di++) {
    dropPipe[di] = Math.floor(Math.random() * 3);
    dropProg[di] = Math.random();
    dropSpd[di] = 0.15 + Math.random() * 0.12;
    var ang = Math.random() * Math.PI * 2;
    var rad = Math.random() * 0.12;
    dropOff[di * 2] = Math.cos(ang) * rad;
    dropOff[di * 2 + 1] = Math.sin(ang) * rad;
    var seg = pipeSegs[dropPipe[di]];
    dropPos[di * 3] = seg[0] + dropProg[di] * (seg[1] - seg[0]);
    dropPos[di * 3 + 1] = dropOff[di * 2];
    dropPos[di * 3 + 2] = dropOff[di * 2 + 1];
    var pc = pipeColors[dropPipe[di]];
    var c = pc[0].clone().lerp(pc[1], dropProg[di]);
    dropCol[di * 3] = c.r; dropCol[di * 3 + 1] = c.g; dropCol[di * 3 + 2] = c.b;
  }
  dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
  dropGeo.setAttribute('color', new THREE.BufferAttribute(dropCol, 3));
  scene.add(new THREE.Points(dropGeo, new THREE.PointsMaterial({
    size: 2.8, transparent: true, opacity: 0.7, vertexColors: true,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  /* Ambient particles */
  var AMB = 80;
  var ambGeo = new THREE.BufferGeometry();
  var ambPos = new Float32Array(AMB * 3);
  var ambVel = new Float32Array(AMB * 3);
  for (var aj = 0; aj < AMB; aj++) {
    ambPos[aj * 3] = (Math.random() - 0.5) * 42;
    ambPos[aj * 3 + 1] = (Math.random() - 0.5) * 18;
    ambPos[aj * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
    ambVel[aj * 3] = (Math.random() - 0.5) * 0.001;
    ambVel[aj * 3 + 1] = (Math.random() - 0.5) * 0.001;
    ambVel[aj * 3 + 2] = (Math.random() - 0.5) * 0.0005;
  }
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  scene.add(new THREE.Points(ambGeo, new THREE.PointsMaterial({
    size: 0.4, transparent: true, opacity: 0.12, color: 0x6688aa,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  /* ================================================
     HTML LABELS — LARGE AND DESCRIPTIVE
     The key to understanding: clear text that explains
     what each stage DOES, not just a technical name
     ================================================ */
  var labelData = [
    {
      text: 'AGUA CONTAMINADA',
      sub: 'Contiene PFAS \u00b7 T\u00f3xico',
      pos: new THREE.Vector3(POS.capture - 4.5, -1.5, 0),
      color: '#ff4444',
      icon: '\ud83d\udea8'
    },
    {
      text: '\u2460 FILTRO DE CARB\u00d3N',
      sub: 'Atrapa los contaminantes PFAS',
      pos: new THREE.Vector3(POS.capture, -5.5, 0),
      color: '#5599cc',
      icon: ''
    },
    {
      text: '\u2461 MEMBRANAS',
      sub: 'Concentran PFAS \u00d7100',
      pos: new THREE.Vector3(POS.membrane, -5.0, 0),
      color: '#30d5c8',
      icon: ''
    },
    {
      text: '\u2462 REACTOR 374\u00b0C',
      sub: 'Destruye los PFAS por completo',
      pos: new THREE.Vector3(POS.reactor, -5.5, 0),
      color: '#ff9500',
      icon: ''
    },
    {
      text: '\u2463 AN\u00c1LISIS',
      sub: 'Se verifica: PFAS = 0',
      pos: new THREE.Vector3(POS.verify, -4.0, 0),
      color: '#30d158',
      icon: ''
    },
    {
      text: 'AGUA PURA \u2713',
      sub: 'PFAS eliminados \u00b7 Certificado',
      pos: new THREE.Vector3(POS.verify + 4.5, -1.5, 0),
      color: '#33dd66',
      icon: '\u2705'
    }
  ];

  var labelEls = labelData.map(function (d) {
    var isEntryExit = d.text === 'AGUA CONTAMINADA' || d.text.indexOf('AGUA PURA') === 0;
    var mainFontSize = isEntryExit ? '10px' : '9px';
    var padding = isEntryExit ? '5px 10px' : '4px 8px';

    var el = document.createElement('div');
    el.className = 'pipeline-label';
    el.innerHTML =
      '<div class="pipeline-label__title" style="font-weight:700;letter-spacing:.06em;text-shadow:0 0 10px ' + d.color + '40;font-size:' + mainFontSize + '">' + d.text + '</div>' +
      '<div class="pipeline-label__sub" style="font-size:8px;opacity:.6;letter-spacing:.03em;font-weight:400;margin-top:1px">' + d.sub + '</div>';
    Object.assign(el.style, {
      position: 'absolute', pointerEvents: 'none',
      fontFamily: 'Inter, sans-serif',
      color: d.color, opacity: '0', lineHeight: '1.3',
      whiteSpace: 'nowrap', textAlign: 'center',
      transform: 'translate(-50%, -50%)',
      padding: padding, borderRadius: '6px',
      background: 'rgba(4,4,9,.8)',
      border: '1px solid ' + d.color + '30',
      boxShadow: '0 0 10px ' + d.color + '15',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      transition: 'opacity .8s ease',
      zIndex: '10'
    });
    /* Mobile: smaller labels, hide subtitles on entry/exit */
    if (isMobile) {
      el.querySelector('.pipeline-label__title').style.fontSize = isEntryExit ? '8px' : '7px';
      el.querySelector('.pipeline-label__sub').style.display = 'none';
      el.style.padding = '3px 6px';
    }
    wrap.appendChild(el);
    return { el: el, pos: d.pos };
  });
  setTimeout(function () { labelEls.forEach(function (l) { l.el.style.opacity = '.95'; }); }, 600);

  /* ================================================
     LARGE DIRECTIONAL ARROW LABEL — "→" overlay
     between entry and exit, to make flow direction obvious
     ================================================ */
  var arrowLabel = document.createElement('div');
  if (!isMobile) {
    arrowLabel.innerHTML = '<span style="font-size:12px;letter-spacing:5px;color:rgba(100,160,220,.25);font-weight:300">\u25B8 \u25B8 \u25B8 \u25B8 \u25B8 \u25B8 \u25B8</span>';
  }
  Object.assign(arrowLabel.style, {
    position: 'absolute', pointerEvents: 'none',
    left: '50%', top: '55%',
    transform: 'translate(-50%, -50%)',
    opacity: '0',
    transition: 'opacity 1.5s ease',
    zIndex: '5'
  });
  wrap.appendChild(arrowLabel);
  if (!isMobile) {
    setTimeout(function () { arrowLabel.style.opacity = '1'; }, 1200);
  }

  function updateLabels() {
    var pad = isMobile ? 30 : 70;
    labelEls.forEach(function (item) {
      var v = item.pos.clone().project(camera);
      item.el.style.left = Math.max(pad, Math.min(W() - pad, (v.x * 0.5 + 0.5) * W())) + 'px';
      item.el.style.top = (-v.y * 0.5 + 0.5) * H() + 'px';
    });
  }

  /* Mouse */
  var mx = 0, my = 0;
  wrap.addEventListener('mousemove', function (e) {
    var r = wrap.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });
  wrap.addEventListener('mouseleave', function () { mx = 0; my = 0; }, { passive: true });

  /* ================================================
     ANIMATION LOOP
     ================================================ */
  var clock = new THREE.Clock();
  var drift = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (window.__zeroPFAS_paused) return;
    var t = clock.getElapsedTime();
    drift += 0.001;

    /* Camera — gentle drift */
    var camX = mx * 1.2 + Math.sin(drift * 0.8) * 0.3;
    var camY = 3.0 - my * 0.5 + Math.cos(drift * 0.6) * 0.2;
    var camZ = 28 + Math.sin(drift * 0.35) * 0.3;
    camera.position.x += (camX - camera.position.x) * 0.010;
    camera.position.y += (camY - camera.position.y) * 0.010;
    camera.position.z += (camZ - camera.position.z) * 0.010;
    camera.lookAt(Math.sin(drift * 0.15) * 0.15, Math.cos(drift * 0.12) * 0.1, 0);

    /* Light pulses */
    captureLight.intensity = 2.5 + Math.sin(t * 0.8) * 0.4;
    reactorLight.intensity = 3.5 + Math.sin(t * 1.2) * 0.8;
    membraneLight.intensity = 2.2 + Math.sin(t * 0.9 + 1) * 0.3;
    verifyLight.intensity = 2.0 + Math.sin(t * 0.7 + 2) * 0.25;

    /* -- CAPTURE animated -- */
    filterShell.rotation.y = t * 0.03;
    gacMat.opacity = 0.5 + Math.sin(t * 1.2) * 0.05;
    adsMat.opacity = 0.7 + Math.sin(t * 1.8) * 0.1;
    inletRing.material.opacity = 0.25 + Math.sin(t * 1.5) * 0.1;
    outletRing.material.opacity = 0.2 + Math.sin(t * 1.5 + 1) * 0.08;

    /* ENTRY drop bobbing */
    entryDropG.position.y = 1.5 + Math.sin(t * 0.8) * 0.3;
    entryDropG.rotation.z = Math.sin(t * 0.4) * 0.05;

    /* EXIT drop bobbing */
    exitDropG.position.y = 1.5 + Math.sin(t * 0.8 + Math.PI) * 0.3;
    exitDropG.rotation.z = Math.sin(t * 0.4 + 1) * 0.05;

    /* -- MEMBRANE animated -- */
    memGlows.forEach(function (mg, i) {
      mg.material.opacity = 0.06 + Math.sin(t * 1.2 + i * 0.8) * 0.04;
    });

    /* -- REACTOR animated -- */
    scZone.material.opacity = 0.45 + Math.sin(t * 1.8) * 0.1;
    scZone.material.emissiveIntensity = 1.5 + Math.sin(t * 2.0) * 0.5;
    var scS = 1 + Math.sin(t * 2.2) * 0.04;
    scZone.scale.set(scS, scS, scS);
    scGlow.material.opacity = 0.07 + Math.sin(t * 1.5) * 0.04;
    var gS = 1 + Math.sin(t * 1.3) * 0.04;
    scGlow.scale.set(gS, gS, gS);
    heatRings.forEach(function (hr, i) {
      hr.rotation.x = t * (0.15 + i * 0.05);
      hr.material.opacity = 0.25 + Math.sin(t * 1.5 + i) * 0.08;
      hr.material.emissiveIntensity = 0.5 + Math.sin(t * 2 + i * 0.5) * 0.25;
    });

    var dA = decompGeo.attributes.position.array;
    for (var i = 0; i < DECOMP; i++) {
      decompLife[i] += 0.006;
      if (decompLife[i] > 1) resetDecomp(i);
      dA[i * 3] += decompVel[i * 3];
      dA[i * 3 + 1] += decompVel[i * 3 + 1];
      dA[i * 3 + 2] += decompVel[i * 3 + 2];
    }
    decompGeo.attributes.position.needsUpdate = true;
    decompMat.opacity = 0.55 + Math.sin(t * 2.5) * 0.12;

    /* -- VERIFICATION animated -- */
    screenMat.emissiveIntensity = 0.25 + Math.sin(t * 1.2) * 0.1;
    chromLine.material.opacity = 0.8 + Math.sin(t * 1.0) * 0.15;
    confPulses.forEach(function (cp) {
      var ph = (t * 0.5 + cp.userData.phase) % (Math.PI * 2);
      var p = ph / (Math.PI * 2);
      var s = 1 + p * 3;
      cp.scale.set(s, s, s);
      cp.material.opacity = (1 - p) * 0.25;
    });
    fRing.material.opacity = 0.18 + Math.sin(t * 1.2) * 0.06;

    /* -- Water stream segments — pulse opacity for flow effect -- */
    waterSegData.forEach(function (wd) {
      var wave = Math.sin(t * 3.0 - wd.localT * 12.0 - wd.pipeIdx * 4.0);
      wd.mesh.material.opacity = 0.35 + wave * 0.2;
      wd.mesh.material.emissiveIntensity = 0.15 + wave * 0.1;
      var pc = pipeColors[wd.pipeIdx];
      var col = pc[0].clone().lerp(pc[1], wd.localT);
      wd.mesh.material.color.copy(col);
      wd.mesh.material.emissive.copy(col);
    });

    /* -- Water droplet particles INSIDE pipes -- */
    var dP = dropGeo.attributes.position.array;
    var dC = dropGeo.attributes.color.array;
    for (var i = 0; i < DROPS; i++) {
      dropProg[i] += dropSpd[i] * 0.002;
      if (dropProg[i] > 1) {
        dropProg[i] = 0;
        dropPipe[i] = Math.floor(Math.random() * 3);
        var ang = Math.random() * Math.PI * 2;
        var rad = Math.random() * 0.12;
        dropOff[i * 2] = Math.cos(ang) * rad;
        dropOff[i * 2 + 1] = Math.sin(ang) * rad;
      }
      var seg = pipeSegs[dropPipe[i]];
      dP[i * 3] = seg[0] + dropProg[i] * (seg[1] - seg[0]);
      dP[i * 3 + 1] = dropOff[i * 2];
      dP[i * 3 + 2] = dropOff[i * 2 + 1];
      var pc = pipeColors[dropPipe[i]];
      var c = pc[0].clone().lerp(pc[1], dropProg[i]);
      dC[i * 3] = c.r; dC[i * 3 + 1] = c.g; dC[i * 3 + 2] = c.b;
    }
    dropGeo.attributes.position.needsUpdate = true;
    dropGeo.attributes.color.needsUpdate = true;

    /* Ambient */
    var aP = ambGeo.attributes.position.array;
    for (var i = 0; i < AMB; i++) {
      aP[i * 3] += ambVel[i * 3];
      aP[i * 3 + 1] += ambVel[i * 3 + 1];
      aP[i * 3 + 2] += ambVel[i * 3 + 2];
      if (Math.abs(aP[i * 3]) > 21) ambVel[i * 3] *= -1;
      if (Math.abs(aP[i * 3 + 1]) > 9) ambVel[i * 3 + 1] *= -1;
      if (Math.abs(aP[i * 3 + 2]) > 8) ambVel[i * 3 + 2] *= -1;
    }
    ambGeo.attributes.position.needsUpdate = true;
    gridMesh.material.opacity = 0.05 + Math.sin(t * 0.25) * 0.01;



    updateLabels();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    adaptCamera();
    renderer.setSize(W(), H());
  });
})();
