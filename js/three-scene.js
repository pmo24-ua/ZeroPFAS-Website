/* three-scene.js — Scientific PFAS treatment pipeline visualization */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var wrap = canvas.parentElement;

  function W() { return wrap.clientWidth || window.innerWidth; }
  function H() { return wrap.clientHeight || 460; }

  /* -------- Renderer with tone mapping -------- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
  } catch (e) {
    console.error('WebGL init failed:', e);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x05050a, 1);
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050a, 0.007);

  var camera = new THREE.PerspectiveCamera(35, W() / H(), 0.1, 200);
  camera.position.set(0, 4, 36);
  camera.lookAt(0, 0, 0);

  /* -------- Lighting — multi-source for depth & realism -------- */
  scene.add(new THREE.AmbientLight(0x8090b0, 0.25));

  var dirLight = new THREE.DirectionalLight(0xddeeff, 0.6);
  dirLight.position.set(8, 12, 10);
  scene.add(dirLight);

  var fillLight = new THREE.DirectionalLight(0x6688cc, 0.2);
  fillLight.position.set(-6, 5, -8);
  scene.add(fillLight);

  // Colored point lights — one per module for "hero glow"
  var captureLight = new THREE.PointLight(0x2997ff, 1.8, 14);
  captureLight.position.set(-13, 2, 4);
  scene.add(captureLight);

  var membraneLight = new THREE.PointLight(0x30d5c8, 1.6, 14);
  membraneLight.position.set(-4.5, 2, 4);
  scene.add(membraneLight);

  var reactorLight = new THREE.PointLight(0xff9500, 2.5, 16);
  reactorLight.position.set(4.5, 2, 4);
  scene.add(reactorLight);

  var verifyLight = new THREE.PointLight(0x30d158, 1.4, 14);
  verifyLight.position.set(13, 2, 4);
  scene.add(verifyLight);

  // Subtle back-rim light
  var rimLight = new THREE.PointLight(0x4466aa, 1.0, 50);
  rimLight.position.set(0, 6, -12);
  scene.add(rimLight);

  /* -------- Layout -------- */
  var POS = { capture: -13, membrane: -4.5, reactor: 4.5, verify: 13 };
  var COL = {
    pfas: 0xff4444, water: 0x2997ff, teal: 0x30d5c8, orange: 0xff9500,
    hotCore: 0xffcc33, green: 0x30d158, steel: 0x8899aa, darkSteel: 0x445566,
    fluoride: 0x40e0d0
  };

  /* Ground reference grid — subtle */
  var gridMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(55, 28, 55, 28),
    new THREE.MeshBasicMaterial({ color: 0x1a1a3e, transparent: true, opacity: 0.1, wireframe: true, side: THREE.DoubleSide })
  );
  gridMesh.rotation.x = -Math.PI / 2;
  gridMesh.position.y = -5.5;
  scene.add(gridMesh);

  /* ================================================
     MODULE 1 — GAC ADSORPTION COLUMN (Captura)
     ================================================ */
  var captureG = new THREE.Group();
  captureG.position.set(POS.capture, 0, 0);

  // Column vessel — glass-like PBR material
  var vesselMat = new THREE.MeshPhysicalMaterial({
    color: 0x6688aa, metalness: 0.3, roughness: 0.15,
    transparent: true, opacity: 0.35, side: THREE.DoubleSide
  });
  captureG.add(new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 5, 32, 1, false), vesselMat
  ));

  // Very subtle wireframe accent
  var colWire = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.65, 5.1, 20, 6, false),
    new THREE.MeshBasicMaterial({ color: COL.water, transparent: true, opacity: 0.07, wireframe: true })
  );
  captureG.add(colWire);

  // Hemispherical caps — metallic
  var capGeo = new THREE.SphereGeometry(1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  var capMat = new THREE.MeshPhysicalMaterial({
    color: 0x7799bb, metalness: 0.45, roughness: 0.2,
    transparent: true, opacity: 0.4
  });
  var topCap = new THREE.Mesh(capGeo, capMat);
  topCap.position.y = 2.5;
  captureG.add(topCap);
  var botCap = new THREE.Mesh(capGeo, capMat.clone());
  botCap.rotation.x = Math.PI;
  botCap.position.y = -2.5;
  captureG.add(botCap);

  // Packed GAC bed
  var GAC = 200;
  var gacGeo = new THREE.BufferGeometry();
  var gacPos = new Float32Array(GAC * 3);
  for (var gi = 0; gi < GAC; gi++) {
    var ga = Math.random() * Math.PI * 2, gr = Math.random() * 1.2;
    gacPos[gi * 3] = Math.cos(ga) * gr;
    gacPos[gi * 3 + 1] = (Math.random() - 0.5) * 4;
    gacPos[gi * 3 + 2] = Math.sin(ga) * gr;
  }
  gacGeo.setAttribute('position', new THREE.BufferAttribute(gacPos, 3));
  var gacMat = new THREE.PointsMaterial({ size: 2.0, color: 0x99aabb, transparent: true, opacity: 0.5, sizeAttenuation: true, depthWrite: false });
  captureG.add(new THREE.Points(gacGeo, gacMat));

  // Inlet/outlet pipes
  [3.3, -3.3].forEach(function (y) {
    var pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: COL.darkSteel, metalness: 0.6, roughness: 0.3 })
    );
    pipe.position.set(0, y, 0);
    captureG.add(pipe);
  });

  // Adsorbed PFAS — red glow particles
  var ADS = 55;
  var adsGeo = new THREE.BufferGeometry();
  var adsArr = new Float32Array(ADS * 3);
  for (var ai = 0; ai < ADS; ai++) {
    var aa = Math.random() * Math.PI * 2, ar = Math.random() * 1.1;
    adsArr[ai * 3] = Math.cos(aa) * ar;
    adsArr[ai * 3 + 1] = (Math.random() - 0.5) * 3.5;
    adsArr[ai * 3 + 2] = Math.sin(aa) * ar;
  }
  adsGeo.setAttribute('position', new THREE.BufferAttribute(adsArr, 3));
  var adsMat = new THREE.PointsMaterial({ size: 1.8, color: COL.pfas, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  captureG.add(new THREE.Points(adsGeo, adsMat));

  scene.add(captureG);

  /* ================================================
     MODULE 2 — NANOFILTRATION MEMBRANE (Concentración)
     ================================================ */
  var memG = new THREE.Group();
  memG.position.set(POS.membrane, 0, 0);

  // Pressure housing — glass PBR
  var memHousingMat = new THREE.MeshPhysicalMaterial({
    color: 0x5599aa, metalness: 0.35, roughness: 0.15,
    transparent: true, opacity: 0.3, side: THREE.DoubleSide
  });
  var memHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.8, 4.5, 32, 1, false), memHousingMat
  );
  memHousing.rotation.z = Math.PI / 2;
  memG.add(memHousing);

  var memHWire = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 1.85, 4.6, 16, 8, false),
    new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.05, wireframe: true })
  );
  memHWire.rotation.z = Math.PI / 2;
  memG.add(memHWire);

  // Spiral-wound membrane layers
  var memLayers = [];
  for (var mi = 0; mi < 5; mi++) {
    var layer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5 - mi * 0.25, 1.5 - mi * 0.25, 3.8, 32, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: COL.teal, metalness: 0.1, roughness: 0.4,
        transparent: true, opacity: 0.08 + mi * 0.02,
        side: THREE.DoubleSide, wireframe: true
      })
    );
    layer.rotation.z = Math.PI / 2;
    memLayers.push(layer);
    memG.add(layer);
  }

  // Cross-section filter planes
  var memSheets = [];
  for (var si = 0; si < 4; si++) {
    var s = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 3.2, 10, 10),
      new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.05, wireframe: true, side: THREE.DoubleSide })
    );
    s.rotation.y = (si / 4) * Math.PI;
    memSheets.push(s);
    memG.add(s);
  }

  // Permeate collection tube — glowing center
  var permTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 4.2, 12),
    new THREE.MeshStandardMaterial({ color: COL.teal, metalness: 0.5, roughness: 0.2, emissive: COL.teal, emissiveIntensity: 0.35 })
  );
  permTube.rotation.z = Math.PI / 2;
  memG.add(permTube);

  // Reject concentrate stream
  var rejectPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: COL.pfas, metalness: 0.3, roughness: 0.4, emissive: COL.pfas, emissiveIntensity: 0.15 })
  );
  rejectPipe.position.y = 2.2;
  memG.add(rejectPipe);

  scene.add(memG);

  /* ================================================
     MODULE 3 — SCWO REACTOR (374 °C · 221 bar)
     ================================================ */
  var reactorG = new THREE.Group();
  reactorG.position.set(POS.reactor, 0, 0);

  // Vessel body — warm metallic
  var rVesselMat = new THREE.MeshPhysicalMaterial({
    color: 0xaa7744, metalness: 0.5, roughness: 0.2,
    transparent: true, opacity: 0.35, side: THREE.DoubleSide
  });
  var vesselBody = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 4, 32, 1, true), rVesselMat
  );
  vesselBody.rotation.z = Math.PI / 2;
  reactorG.add(vesselBody);

  var vesselWire = new THREE.Mesh(
    new THREE.CylinderGeometry(2.05, 2.05, 4.1, 18, 8, true),
    new THREE.MeshBasicMaterial({ color: COL.orange, transparent: true, opacity: 0.07, wireframe: true })
  );
  vesselWire.rotation.z = Math.PI / 2;
  reactorG.add(vesselWire);

  // Hemispherical end caps
  var rCapGeo = new THREE.SphereGeometry(2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  var rCapMat = new THREE.MeshPhysicalMaterial({
    color: 0xaa7744, metalness: 0.5, roughness: 0.2,
    transparent: true, opacity: 0.38
  });
  var rCapL = new THREE.Mesh(rCapGeo, rCapMat);
  rCapL.rotation.z = -Math.PI / 2;
  rCapL.position.x = -2;
  reactorG.add(rCapL);
  var rCapR = new THREE.Mesh(rCapGeo, rCapMat.clone());
  rCapR.rotation.z = Math.PI / 2;
  rCapR.position.x = 2;
  reactorG.add(rCapR);

  // Supercritical zone — emissive glow core
  var scZone = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 24, 24),
    new THREE.MeshStandardMaterial({
      color: COL.hotCore, emissive: COL.hotCore, emissiveIntensity: 1.5,
      transparent: true, opacity: 0.6, roughness: 0.8
    })
  );
  reactorG.add(scZone);

  var scGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 20, 20),
    new THREE.MeshStandardMaterial({
      color: COL.orange, emissive: COL.orange, emissiveIntensity: 0.5,
      transparent: true, opacity: 0.15, roughness: 1.0
    })
  );
  reactorG.add(scGlow);

  // Heat convection rings — emissive
  var heatRings = [];
  for (var hi = 0; hi < 3; hi++) {
    var hr = new THREE.Mesh(
      new THREE.TorusGeometry(1.5 + hi * 0.3, 0.04, 8, 64),
      new THREE.MeshStandardMaterial({
        color: COL.orange, emissive: COL.orange, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.3 - hi * 0.05
      })
    );
    hr.rotation.y = Math.PI / 2;
    hr.position.x = (hi - 1) * 0.8;
    heatRings.push(hr);
    reactorG.add(hr);
  }

  // Decomposition particles
  var DECOMP = 80;
  var decompGeo = new THREE.BufferGeometry();
  var decompPos = new Float32Array(DECOMP * 3);
  var decompVel = new Float32Array(DECOMP * 3);
  var decompLife = new Float32Array(DECOMP);
  function resetDecomp(i) {
    decompPos[i * 3] = (Math.random() - 0.5) * 0.4;
    decompPos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    decompPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    var sp = 0.012 + Math.random() * 0.025;
    decompVel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
    decompVel[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * sp;
    decompVel[i * 3 + 2] = Math.cos(ph) * sp;
    decompLife[i] = Math.random();
  }
  for (var di = 0; di < DECOMP; di++) resetDecomp(di);
  decompGeo.setAttribute('position', new THREE.BufferAttribute(decompPos, 3));
  var decompMat = new THREE.PointsMaterial({ size: 1.5, color: COL.hotCore, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  reactorG.add(new THREE.Points(decompGeo, decompMat));

  // Fluoride ions (F⁻)
  var FION = 35;
  var fIonGeo = new THREE.BufferGeometry();
  var fIonPos = new Float32Array(FION * 3);
  var fIonVel = new Float32Array(FION * 3);
  var fIonLife = new Float32Array(FION);
  function resetFIon(i) {
    fIonPos[i * 3] = 1.5 + Math.random() * 0.5;
    fIonPos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
    fIonPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    fIonVel[i * 3] = 0.01 + Math.random() * 0.02;
    fIonVel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
    fIonVel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    fIonLife[i] = Math.random();
  }
  for (var fi = 0; fi < FION; fi++) resetFIon(fi);
  fIonGeo.setAttribute('position', new THREE.BufferAttribute(fIonPos, 3));
  var fIonMat = new THREE.PointsMaterial({ size: 1.8, color: COL.fluoride, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  reactorG.add(new THREE.Points(fIonGeo, fIonMat));

  scene.add(reactorG);

  /* ================================================
     MODULE 4 — ANALYTICAL VERIFICATION (LC-MS/MS)
     ================================================ */
  var verifyG = new THREE.Group();
  verifyG.position.set(POS.verify, 0, 0);

  // Instrument housing — dark metallic
  verifyG.add(new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.8, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.3 })
  ));
  var detWire = new THREE.Mesh(
    new THREE.BoxGeometry(2.25, 2.85, 1.85),
    new THREE.MeshBasicMaterial({ color: COL.green, transparent: true, opacity: 0.06, wireframe: true })
  );
  verifyG.add(detWire);

  // Detector inlet lens — emissive
  var lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 0.3, 24),
    new THREE.MeshStandardMaterial({
      color: COL.green, metalness: 0.3, roughness: 0.2,
      emissive: COL.green, emissiveIntensity: 0.4,
      transparent: true, opacity: 0.7
    })
  );
  lens.position.set(-1.3, 0, 0);
  lens.rotation.z = Math.PI / 2;
  verifyG.add(lens);

  // Display screen background
  var screenBg = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.4),
    new THREE.MeshBasicMaterial({ color: 0x0a1a10, transparent: true, opacity: 0.9 })
  );
  screenBg.position.set(0, 0.1, 0.92);
  verifyG.add(screenBg);

  // Chromatogram peak
  var chromPts = [];
  for (var ci = 0; ci < 50; ci++) {
    var cx = (ci / 49 - 0.5) * 1.6;
    var peak1 = Math.exp(-(cx + 0.2) * (cx + 0.2) / 0.04) * 0.5;
    var peak2 = Math.exp(-(cx - 0.35) * (cx - 0.35) / 0.06) * 0.3;
    chromPts.push(new THREE.Vector3(cx, peak1 + peak2 + 0.2 - 0.4, 0.96));
  }
  var chromGeo = new THREE.BufferGeometry().setFromPoints(chromPts);
  var chromLine = new THREE.Line(chromGeo, new THREE.LineBasicMaterial({ color: COL.green, transparent: true, opacity: 0.9 }));
  verifyG.add(chromLine);

  // Baseline
  verifyG.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.8, -0.2, 0.96), new THREE.Vector3(0.8, -0.2, 0.96)]),
    new THREE.LineBasicMaterial({ color: COL.green, transparent: true, opacity: 0.2 })
  ));

  // Axis ticks
  for (var ti = 0; ti < 5; ti++) {
    var tx = -0.7 + ti * 0.35;
    verifyG.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(tx, -0.25, 0.96), new THREE.Vector3(tx, -0.2, 0.96)]),
      new THREE.LineBasicMaterial({ color: COL.green, transparent: true, opacity: 0.2 })
    ));
  }

  // F⁻ confirmation ring
  var fRing = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.55, 32),
    new THREE.MeshBasicMaterial({ color: COL.green, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  fRing.position.set(0, -0.9, 0.96);
  verifyG.add(fRing);

  // Confirmation pulses
  var confPulses = [];
  for (var pi = 0; pi < 2; pi++) {
    var cp = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.15, 24),
      new THREE.MeshBasicMaterial({ color: COL.green, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    cp.position.set(0, -0.9, 0.97);
    cp.userData = { phase: pi * Math.PI };
    confPulses.push(cp);
    verifyG.add(cp);
  }

  scene.add(verifyG);

  /* ================================================
     PROCESS PIPING between modules
     ================================================ */
  var pipeMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.6, roughness: 0.3 });
  var pipeSegs = [
    [POS.capture + 2, POS.membrane - 2.8],
    [POS.membrane + 2.8, POS.reactor - 2.8],
    [POS.reactor + 2.8, POS.verify - 1.8]
  ];
  pipeSegs.forEach(function (seg) {
    var path = new THREE.LineCurve3(new THREE.Vector3(seg[0], 0, 0), new THREE.Vector3(seg[1], 0, 0));
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(path, 12, 0.12, 8, false), pipeMat));
  });

  // Center flow-direction line
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(POS.capture - 4, 0, 0),
      new THREE.Vector3(POS.verify + 4, 0, 0)
    ]),
    new THREE.LineBasicMaterial({ color: COL.water, transparent: true, opacity: 0.08 })
  ));

  // Flow-direction arrows — emissive metallic
  [-8.5, 0, 8.5].forEach(function (x) {
    var arr = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: COL.water, emissive: COL.water, emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.4 })
    );
    arr.rotation.z = -Math.PI / 2;
    arr.position.set(x, 0, 0);
    scene.add(arr);
  });

  /* ================================================
     DUAL PARTICLE SYSTEM
     ================================================ */
  var FLOW_A = 160, FLOW_B = 80;
  var FLOW_T = FLOW_A + FLOW_B;
  var flowGeo = new THREE.BufferGeometry();
  var flowPos = new Float32Array(FLOW_T * 3);
  var flowCol = new Float32Array(FLOW_T * 3);
  var flowProg = new Float32Array(FLOW_T);
  var flowSpd = new Float32Array(FLOW_T);
  var flowLane = new Float32Array(FLOW_T * 2);
  var flowType = new Uint8Array(FLOW_T);

  var totalSpan = POS.verify - POS.capture;
  var contCols = [new THREE.Color(0xff4444), new THREE.Color(0xff6633), new THREE.Color(0xff9500), new THREE.Color(0x30d158)];
  var cleanCols = [new THREE.Color(0x2997ff), new THREE.Color(0x2997ff), new THREE.Color(0x30d5c8), new THREE.Color(0x30d158)];
  var sBounds = [0, 0.33, 0.66, 1];

  function streamCol(p, type) {
    var cs = type === 0 ? contCols : cleanCols;
    for (var i = 0; i < 3; i++) {
      if (p <= sBounds[i + 1]) {
        var t = (p - sBounds[i]) / (sBounds[i + 1] - sBounds[i]);
        return cs[i].clone().lerp(cs[i + 1], t);
      }
    }
    return cs[3];
  }

  for (var ii = 0; ii < FLOW_T; ii++) {
    flowType[ii] = ii < FLOW_A ? 0 : 1;
    flowProg[ii] = Math.random();
    flowSpd[ii] = 0.05 + Math.random() * 0.06;
    var spread = flowType[ii] === 0 ? 1.0 : 0.6;
    flowLane[ii * 2] = (Math.random() - 0.5) * spread;
    flowLane[ii * 2 + 1] = (Math.random() - 0.5) * spread;
    flowPos[ii * 3] = POS.capture + flowProg[ii] * totalSpan;
    flowPos[ii * 3 + 1] = flowLane[ii * 2];
    flowPos[ii * 3 + 2] = flowLane[ii * 2 + 1];
    var fc = streamCol(flowProg[ii], flowType[ii]);
    flowCol[ii * 3] = fc.r; flowCol[ii * 3 + 1] = fc.g; flowCol[ii * 3 + 2] = fc.b;
  }
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  flowGeo.setAttribute('color', new THREE.BufferAttribute(flowCol, 3));
  scene.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({
    size: 1.8, transparent: true, opacity: 0.65, vertexColors: true,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  /* Ambient particles */
  var AMB = 180;
  var ambGeo = new THREE.BufferGeometry();
  var ambPos = new Float32Array(AMB * 3);
  var ambVel = new Float32Array(AMB * 3);
  for (var aj = 0; aj < AMB; aj++) {
    ambPos[aj * 3] = (Math.random() - 0.5) * 50;
    ambPos[aj * 3 + 1] = (Math.random() - 0.5) * 22;
    ambPos[aj * 3 + 2] = (Math.random() - 0.5) * 14 - 5;
    ambVel[aj * 3] = (Math.random() - 0.5) * 0.0015;
    ambVel[aj * 3 + 1] = (Math.random() - 0.5) * 0.0015;
    ambVel[aj * 3 + 2] = (Math.random() - 0.5) * 0.0008;
  }
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  scene.add(new THREE.Points(ambGeo, new THREE.PointsMaterial({
    size: 0.5, transparent: true, opacity: 0.2, color: 0x6688aa,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  })));

  /* ================================================
     SCIENTIFIC LABELS
     ================================================ */
  var labelData = [
    { text: 'CAPTURA GAC/IX', sub: 'Adsorción · Carbón activado', pos: new THREE.Vector3(POS.capture, -4.8, 0), color: '#2997ff' },
    { text: 'CONCENTRACIÓN NF', sub: 'Nanofiltración · Factor ×100', pos: new THREE.Vector3(POS.membrane, -4.8, 0), color: '#30d5c8' },
    { text: 'SCWO', sub: '374 °C · 221 bar · \u03C4 = 60 s', pos: new THREE.Vector3(POS.reactor, -4.8, 0), color: '#ff9500' },
    { text: 'VERIFICACIÓN', sub: 'LC-MS/MS · IC · Balance F\u207B', pos: new THREE.Vector3(POS.verify, -4.8, 0), color: '#30d158' }
  ];

  var labelEls = labelData.map(function (d) {
    var el = document.createElement('div');
    el.innerHTML = '<div style="font-weight:700;letter-spacing:.1em;margin-bottom:2px;text-shadow:0 0 12px ' + d.color + '40">' + d.text + '</div><div style="font-size:7px;opacity:.5;letter-spacing:.04em">' + d.sub + '</div>';
    Object.assign(el.style, {
      position: 'absolute', pointerEvents: 'none',
      fontSize: '8px', fontFamily: 'Inter, sans-serif',
      color: d.color, opacity: '0', lineHeight: '1.4',
      whiteSpace: 'nowrap', textAlign: 'center',
      transform: 'translate(-50%, -50%)',
      padding: '6px 14px', borderRadius: '8px',
      background: 'rgba(4,4,9,.8)',
      border: '1px solid rgba(255,255,255,.05)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      transition: 'opacity .8s ease'
    });
    wrap.appendChild(el);
    return { el: el, pos: d.pos };
  });
  setTimeout(function () { labelEls.forEach(function (l) { l.el.style.opacity = '.9'; }); }, 600);

  function updateLabels() {
    labelEls.forEach(function (item) {
      var v = item.pos.clone().project(camera);
      item.el.style.left = Math.max(55, Math.min(W() - 55, (v.x * 0.5 + 0.5) * W())) + 'px';
      item.el.style.top = (-v.y * 0.5 + 0.5) * H() + 'px';
    });
  }

  /* Mouse interaction */
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
    var t = clock.getElapsedTime();
    drift += 0.001;

    /* Camera — smooth parallax */
    var camX = mx * 1.8 + Math.sin(drift) * 0.4;
    var camY = 4 - my * 1.0 + Math.cos(drift * 0.7) * 0.25;
    camera.position.x += (camX - camera.position.x) * 0.012;
    camera.position.y += (camY - camera.position.y) * 0.012;
    camera.lookAt(0, 0, 0);

    /* Pulsing point lights for atmosphere */
    captureLight.intensity = 1.8 + Math.sin(t * 0.8) * 0.3;
    reactorLight.intensity = 2.5 + Math.sin(t * 1.2) * 0.5;
    membraneLight.intensity = 1.6 + Math.sin(t * 0.9 + 1) * 0.25;
    verifyLight.intensity = 1.4 + Math.sin(t * 0.7 + 2) * 0.2;

    /* -- CAPTURE column -- */
    colWire.rotation.y = t * 0.03;
    gacMat.opacity = 0.45 + Math.sin(t * 1.2) * 0.05;
    adsMat.opacity = 0.55 + Math.sin(t * 1.8) * 0.08;

    /* -- MEMBRANE module -- */
    memLayers.forEach(function (layer, i) {
      layer.rotation.y = Math.PI / 2 + t * (0.015 + i * 0.005);
    });
    memSheets.forEach(function (s, i) {
      s.rotation.y = (i / 4) * Math.PI + Math.sin(t * 0.4) * 0.06;
      s.material.opacity = 0.04 + Math.sin(t * 1.0 + i * 0.8) * 0.015;
    });
    memHWire.rotation.y = Math.PI / 2 + t * 0.01;
    rejectPipe.material.emissiveIntensity = 0.12 + Math.sin(t * 1.8) * 0.06;
    rejectPipe.position.y = 2.2 + Math.sin(t * 1.2) * 0.08;

    /* -- SCWO REACTOR -- */
    var rB = 1 + Math.sin(t * 1.0) * 0.015;
    vesselWire.scale.set(rB, 1, rB);
    scZone.material.opacity = 0.55 + Math.sin(t * 1.8) * 0.1;
    scZone.material.emissiveIntensity = 1.2 + Math.sin(t * 2.0) * 0.4;
    var scS = 1 + Math.sin(t * 2.2) * 0.06;
    scZone.scale.set(scS, scS, scS);
    scGlow.material.opacity = 0.12 + Math.sin(t * 1.5) * 0.04;
    var gS = 1 + Math.sin(t * 1.3) * 0.04;
    scGlow.scale.set(gS, gS, gS);

    heatRings.forEach(function (hr, i) {
      hr.rotation.x = t * (0.25 + i * 0.08);
      hr.material.opacity = 0.25 + Math.sin(t * 1.5 + i) * 0.05;
      hr.material.emissiveIntensity = 0.5 + Math.sin(t * 2 + i * 0.5) * 0.2;
    });

    // Decomposition particles
    var dA = decompGeo.attributes.position.array;
    for (var i = 0; i < DECOMP; i++) {
      decompLife[i] += 0.006;
      if (decompLife[i] > 1) resetDecomp(i);
      dA[i * 3] += decompVel[i * 3];
      dA[i * 3 + 1] += decompVel[i * 3 + 1];
      dA[i * 3 + 2] += decompVel[i * 3 + 2];
    }
    decompGeo.attributes.position.needsUpdate = true;
    decompMat.opacity = 0.55 + Math.sin(t * 2.5) * 0.1;

    // F⁻ ions
    var fA = fIonGeo.attributes.position.array;
    for (var i = 0; i < FION; i++) {
      fIonLife[i] += 0.004;
      if (fIonLife[i] > 1) resetFIon(i);
      fA[i * 3] += fIonVel[i * 3];
      fA[i * 3 + 1] += fIonVel[i * 3 + 1];
      fA[i * 3 + 2] += fIonVel[i * 3 + 2];
    }
    fIonGeo.attributes.position.needsUpdate = true;
    fIonMat.opacity = 0.5 + Math.sin(t * 1.8) * 0.1;

    /* -- VERIFICATION -- */
    detWire.rotation.y = Math.sin(t * 0.25) * 0.03;
    lens.material.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.1;
    chromLine.material.opacity = 0.7 + Math.sin(t * 1.2) * 0.15;
    confPulses.forEach(function (cp) {
      var ph = (t * 0.5 + cp.userData.phase) % (Math.PI * 2);
      var p = ph / (Math.PI * 2);
      var s = 1 + p * 3.5;
      cp.scale.set(s, s, s);
      cp.material.opacity = (1 - p) * 0.35;
    });
    fRing.material.opacity = 0.3 + Math.sin(t * 1.2) * 0.08;

    /* -- Dual flow particles -- */
    var fP = flowGeo.attributes.position.array;
    var fC = flowGeo.attributes.color.array;
    for (var i = 0; i < FLOW_T; i++) {
      flowProg[i] += flowSpd[i] * 0.003;
      if (flowProg[i] > 1) {
        flowProg[i] = 0;
        var sp = flowType[i] === 0 ? 1.0 : 0.6;
        flowLane[i * 2] = (Math.random() - 0.5) * sp;
        flowLane[i * 2 + 1] = (Math.random() - 0.5) * sp;
      }
      var p = flowProg[i];
      var x = POS.capture + p * totalSpan;
      var comp = 1;
      if (flowType[i] === 0) {
        var dM = Math.abs(x - POS.membrane);
        if (dM < 4) comp *= 0.6 + dM / 10;
        var dR = Math.abs(x - POS.reactor);
        if (dR < 3) comp *= 1.3;
      }
      fP[i * 3] = x;
      fP[i * 3 + 1] = flowLane[i * 2] * comp + Math.sin(t * 0.6 + i * 0.15) * 0.03;
      fP[i * 3 + 2] = flowLane[i * 2 + 1] * comp + Math.cos(t * 0.6 + i * 0.15) * 0.03;
      var c = streamCol(p, flowType[i]);
      fC[i * 3] = c.r; fC[i * 3 + 1] = c.g; fC[i * 3 + 2] = c.b;
    }
    flowGeo.attributes.position.needsUpdate = true;
    flowGeo.attributes.color.needsUpdate = true;

    /* -- Ambient -- */
    var aP = ambGeo.attributes.position.array;
    for (var i = 0; i < AMB; i++) {
      aP[i * 3] += ambVel[i * 3];
      aP[i * 3 + 1] += ambVel[i * 3 + 1];
      aP[i * 3 + 2] += ambVel[i * 3 + 2];
      if (Math.abs(aP[i * 3]) > 25) ambVel[i * 3] *= -1;
      if (Math.abs(aP[i * 3 + 1]) > 11) ambVel[i * 3 + 1] *= -1;
      if (Math.abs(aP[i * 3 + 2]) > 10) ambVel[i * 3 + 2] *= -1;
    }
    ambGeo.attributes.position.needsUpdate = true;
    gridMesh.material.opacity = 0.07 + Math.sin(t * 0.25) * 0.015;

    updateLabels();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
})();
