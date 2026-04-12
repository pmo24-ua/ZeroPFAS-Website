/* explorer-3d.js — Interactive step-by-step system explorer for ZeroPFAS */
(function () {
  'use strict';

  var canvas = document.getElementById('explorerCanvas');
  if (!canvas) return;
  var wrap = document.getElementById('explorerCanvasWrap');
  if (!wrap) return;

  /* ====== Step data (static, safe) ====== */
  var CATEGORIES = {
    entrada:        { label: 'Entrada',        color: '#2997ff' },
    pretratamiento: { label: 'Pretratamiento', color: '#2997ff' },
    separacion:     { label: 'Separación',     color: '#30d5c8' },
    captura:        { label: 'Captura',        color: '#ff9500' },
    salida:         { label: 'Salida',         color: '#30d158' },
    retorno:        { label: 'Retorno',        color: '#30d158' }
  };

  var STEPS = [
    {
      name: 'Entrada',
      cat: 'entrada',
      type: 'Válvula + manifold',
      what: 'Punto de entrada del agua al sistema.',
      does: 'Introduce el caudal al circuito de tratamiento.',
      flow: 'Entra agua de red y se dirige al pretratamiento.',
      why:  'Es el inicio del recorrido hidráulico.'
    },
    {
      name: 'Prefiltro 5 \u03bcm',
      cat: 'pretratamiento',
      type: 'Housing translúcido + cartucho plisado',
      what: 'Etapa de prefiltración mecánica.',
      does: 'Retiene partículas y sedimentos.',
      flow: 'Recibe agua de entrada y la envía acondicionada a la siguiente etapa.',
      why:  'Protege los módulos posteriores y mejora la estabilidad operativa.'
    },
    {
      name: 'Carbón activo',
      cat: 'pretratamiento',
      type: 'Bloque de carbón activado (GAC)',
      what: 'Etapa de acondicionamiento adicional.',
      does: 'Reduce compuestos que pueden interferir con etapas posteriores.',
      flow: 'Recibe agua prefiltrada y la envía hacia la membrana.',
      why:  'Mejora el rendimiento global del sistema.'
    },
    {
      name: 'Membrana NF',
      cat: 'separacion',
      type: 'Vaso de presión horizontal',
      what: 'Módulo de nanofiltración.',
      does: 'Concentra contaminantes y separa corrientes.',
      flow: 'Entra agua acondicionada; salen una corriente tratada y una corriente concentrada.',
      why:  'Es una de las etapas clave del sistema porque reduce volumen y organiza el tratamiento posterior.'
    },
    {
      name: 'Concentrado a drenaje',
      cat: 'separacion',
      type: 'Línea de flujo + drenaje',
      what: 'Corriente concentrada separada por la membrana.',
      does: 'Deriva la fracción concentrada fuera de la línea principal.',
      flow: 'Recibe el concentrado generado en la membrana.',
      why:  'Hace visible la separación funcional del sistema.'
    },
    {
      name: 'Captura PFAS',
      cat: 'captura',
      type: 'Housing octagonal + resina selectiva',
      what: 'Etapa de captura selectiva mediante resina o medio funcional.',
      does: 'Retiene PFAS de forma específica.',
      flow: 'Recibe la corriente correspondiente y fija los compuestos objetivo.',
      why:  'Es la etapa de captura selectiva, no una filtración genérica.'
    },
    {
      name: 'Agua tratada',
      cat: 'salida',
      type: 'Línea de salida',
      what: 'Salida de agua tratada del sistema.',
      does: 'Entrega el agua procesada.',
      flow: 'Recibe el flujo tratado y lo conduce a la salida.',
      why:  'Es el resultado funcional del sistema en punto de uso.'
    },
    {
      name: 'Cartucho retornable NFC',
      cat: 'retorno',
      type: 'Módulo extraíble trazable',
      what: 'Módulo retornable con trazabilidad.',
      does: 'Permite retirada controlada, seguimiento y reintegración del medio saturado en un circuito de retorno.',
      flow: 'Representa la gestión del material capturado dentro de una lógica trazable, no desechable.',
      why:  'Es uno de los diferenciales del sistema porque conecta la captura local con un esquema de retorno y tratamiento posterior verificable.'
    }
  ];

  /* ====== Per-step camera framing & visual parameters ====== */
  var STEP_CAMERAS = [
    /* Each entry: camera position, lookAt target, device Y-rotation for best presentation */
    { cam: [2.0, 4.0, 11.5],  look: [-4.0, 1.5, 0],    devRotY: -0.06 },  // 0 Inlet
    { cam: [2.5, 3.0, 10.5],  look: [-3.0, 0.0, 0],     devRotY: -0.10 },  // 1 Sediment
    { cam: [3.0, 3.0, 10.5],  look: [-1.5, 0.0, 0],     devRotY: -0.14 },  // 2 Carbon
    { cam: [3.5, 4.2, 11.0],  look: [ 0.5, 2.0, 0],     devRotY: -0.10 },  // 3 Membrane
    { cam: [4.5, 4.5, 10.5],  look: [ 2.0, 2.8, 0],     devRotY: -0.06 },  // 4 Reject
    { cam: [4.0, 2.8, 10.0],  look: [ 1.0, 0.0, 0],     devRotY: -0.18 },  // 5 PFAS
    { cam: [5.0, 3.0, 10.0],  look: [ 3.0,-0.1, 0],     devRotY: -0.14 },  // 6 Outlet
    { cam: [5.5, 3.2,  9.5],  look: [ 3.5, 0.0, 0.3],   devRotY: -0.22 }   // 7 Returnable
  ];

  /* Adjacency map: connected stages get partial opacity for spatial context */
  var CONNECTIONS = [
    [1],        // 0: Inlet → Sediment
    [0, 2],     // 1: Sediment ↔ Inlet, Carbon
    [1, 3],     // 2: Carbon ↔ Sediment, Membrane
    [2, 4, 5],  // 3: Membrane ↔ Carbon, Reject, PFAS
    [3],        // 4: Reject → Membrane
    [3, 6],     // 5: PFAS ↔ Membrane, Outlet
    [5, 7],     // 6: Outlet ↔ PFAS, Returnable
    [6]         // 7: Returnable → Outlet
  ];

  /* --- Editable visual tiers --- */
  var OP_ACTIVE    = 1.0;   // full visibility for focused stage
  var OP_CONNECTED = 0.28;  // partial for adjacent stages (spatial context)
  var OP_DISTANT   = 0.05;  // nearly invisible for unrelated stages
  var OP_BRACKET   = 0.22;  // base structure always faintly visible
  var OP_LED       = 0.45;  // LED strip stays moderately visible

  var EM_ACTIVE_BASE  = 0.22;  // emissive floor for active stage
  var EM_ACTIVE_PULSE = 0.10;  // sine amplitude on top
  var EM_CONNECTED    = 0.04;  // faint glow on connected stages
  var EM_DISTANT      = 0.0;   // no glow on distant stages

  /* --- Camera transition timing (seconds) --- */
  var CAM_DURATION = 1.1;

  /* Cubic ease-in-out — cinematic acceleration / deceleration */
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /* ====== Dimensions ====== */
  function W() { return wrap.clientWidth || 600; }
  function H() { return wrap.clientHeight || 400; }

  /* ====== Renderer ====== */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, W() / H(), 0.1, 100);
  camera.position.set(4, 3.5, 11);
  camera.lookAt(-0.5, 0.3, 0);

  /* ====== Lighting ====== */
  scene.add(new THREE.AmbientLight(0x8899bb, 0.5));
  var kl = new THREE.DirectionalLight(0xffffff, 0.7);
  kl.position.set(5, 8, 6);
  scene.add(kl);
  var fl = new THREE.DirectionalLight(0x8899cc, 0.25);
  fl.position.set(-4, 3, -3);
  scene.add(fl);
  var acl = new THREE.PointLight(0x30d5c8, 0.4, 14);
  acl.position.set(2, -1, 4);
  scene.add(acl);

  /* ====== Focused accent light — tracks active stage ====== */
  var focusLight = new THREE.PointLight(0xffffff, 0.0, 10);
  focusLight.position.set(0, 4, 6);
  scene.add(focusLight);

  /* ====== Device group ====== */
  var device = new THREE.Group();
  scene.add(device);

  /* ====== Materials per stage (unique, individually controllable) ====== */
  var stageGroups = [];
  var stageMaterials = []; // each entry: array of materials for that stage

  function mkMat(color, emCol) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.35,
      metalness: 0.2,
      emissive: emCol || color,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 1.0
    });
  }

  /* Base bracket (always visible, slightly dims) */
  var matBracket = new THREE.MeshStandardMaterial({
    color: 0xb0b8c4, roughness: 0.18, metalness: 0.88,
    transparent: true, opacity: 1.0
  });
  var bracket = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 0.12, 2.8), matBracket
  );
  bracket.position.set(0, -1.8, 0);
  device.add(bracket);

  /* LED strip (always visible) */
  var matLed = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, emissive: 0x30d5c8, emissiveIntensity: 0.3,
    transparent: true, opacity: 1.0
  });
  device.add(
    (function () {
      var m = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.03, 0.08), matLed);
      m.position.set(0, -1.72, 1.4);
      return m;
    })()
  );

  /* ---------- Stage 0: Inlet ---------- */
  (function () {
    var g = new THREE.Group();
    var mPipe = mkMat(0xb0b8c4, 0x666666);
    var mBlue = mkMat(0x2997ff);
    var mats = [mPipe, mBlue];

    var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 14), mPipe);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-4.8, 1.8, 0);
    g.add(pipe);

    var valve = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), mPipe);
    valve.position.set(-5.5, 1.8, 0);
    g.add(valve);

    var handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.06), mBlue);
    handle.position.set(-5.5, 2.0, 0.15);
    g.add(handle);

    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 20), mBlue);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-5.7, 1.8, 0);
    g.add(ring);

    var dp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 10), mPipe);
    dp.position.set(-3.6, 0.9, 0);
    g.add(dp);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 1: Sediment — SLIM TRANSLUCENT BOWL ---------- */
  (function () {
    var g = new THREE.Group();
    var sx = -3.6, sy = -0.2;

    // Translucent bowl
    var mBowl = mkMat(0xaaccdd, 0x667788);
    mBowl.opacity = 0.25;
    // Pleated inner
    var mPleated = mkMat(0xc8b888);
    // Sediment fill
    var mSed = mkMat(0x9a8a6a);
    // Head
    var mCap = mkMat(0xb0b8c4, 0x666666);
    // Band
    var mBand = mkMat(0x2997ff);
    var mats = [mBowl, mPleated, mSed, mCap, mBand];

    // Translucent outer bowl (narrower, tapered)
    var bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 2.6, 24), mBowl);
    bowl.position.set(sx, sy, 0);
    g.add(bowl);

    // Heavy aluminum head
    var head = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.44, 0.35, 24), mCap);
    head.position.set(sx, sy + 1.45, 0);
    g.add(head);

    // Bottom dome
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 18, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
      mBowl
    );
    dome.position.set(sx, sy - 1.3, 0);
    g.add(dome);

    // Inner pleated element
    var pleated = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.0, 16), mPleated);
    pleated.position.set(sx, sy, 0);
    g.add(pleated);

    // Pleat rings
    for (var pr = 0; pr < 5; pr++) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.012, 6, 20), mPleated);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(sx, sy - 0.6 + pr * 0.3, 0);
      g.add(ring);
    }

    // Sediment at bottom
    var sedFill = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.4, 16), mSed);
    sedFill.position.set(sx, sy - 1.0, 0);
    g.add(sedFill);

    // Blue label band
    var band = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.025, 6, 24), mBand);
    band.rotation.x = Math.PI / 2;
    band.position.set(sx, sy + 1.3, 0);
    g.add(band);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 2: Carbon — OPAQUE DARK GRAPHITE ---------- */
  (function () {
    var g = new THREE.Group();
    var cx = -1.8, cy = -0.2;

    // Dense dark graphite body
    var mGraphite = mkMat(0x1e1e28, 0x111118);
    // Dark metal caps
    var mDarkCap = mkMat(0x2a2a35, 0x191920);
    // Label band (lighter stripe)
    var mCarbonBand = mkMat(0x3a3a48, 0x222230);
    // Teal ring
    var mTealR = mkMat(0x30d5c8);
    // Pipe
    var mPipe = mkMat(0xc0c8d0, 0x666666);
    var mats = [mGraphite, mDarkCap, mCarbonBand, mTealR, mPipe];

    // Opaque body
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.0, 24), mGraphite);
    body.position.set(cx, cy, 0);
    g.add(body);

    // Top cap — dark metal
    var topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.56, 0.14, 24), mDarkCap);
    topCap.position.set(cx, cy + 1.57, 0);
    g.add(topCap);

    // Bottom cap
    var botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.56, 0.14, 24), mDarkCap);
    botCap.position.set(cx, cy - 1.57, 0);
    g.add(botCap);

    // Grip ridges
    for (var gi = 0; gi < 4; gi++) {
      var rib = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.012, 6, 24), mDarkCap);
      rib.rotation.x = Math.PI / 2;
      rib.position.set(cx, cy - 0.5 + gi * 0.3, 0);
      g.add(rib);
    }

    // Carbon label zone band
    var cBand = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.25, 24), mCarbonBand);
    cBand.position.set(cx, cy + 0.9, 0);
    g.add(cBand);

    // Teal label ring
    var tealRing = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.025, 6, 24), mTealR);
    tealRing.rotation.x = Math.PI / 2;
    tealRing.position.set(cx, cy + 1.05, 0);
    g.add(tealRing);

    // Inter-canister pipe
    var p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), mPipe);
    p.rotation.z = Math.PI / 2;
    p.position.set(-2.7, 1.45, 0);
    g.add(p);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 3: Membrane NF — pressure vessel with ports ---------- */
  (function () {
    var g = new THREE.Group();
    var mBody = mkMat(0xeaeaef, 0x888888);
    var mTeal = mkMat(0x30d5c8);
    var mBlue = mkMat(0x2997ff);
    var mCap = mkMat(0xb0b8c4, 0x666666);
    var mPipe = mkMat(0xc0c8d0, 0x666666);
    var mOrange = mkMat(0xff9500);
    var mats = [mBody, mTeal, mBlue, mCap, mPipe, mOrange];

    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 3.2, 24), mBody);
    body.rotation.z = Math.PI / 2;
    body.position.set(0.4, 2.2, 0);
    g.add(body);

    var cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.12, 24), mCap);
    cap1.rotation.z = Math.PI / 2;
    cap1.position.set(-1.2, 2.2, 0);
    g.add(cap1);
    var cap2 = cap1.clone();
    cap2.position.set(2.0, 2.2, 0);
    g.add(cap2);

    // Feed port (left, blue ring)
    var feedPort = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 10), mPipe);
    feedPort.rotation.z = Math.PI / 2;
    feedPort.position.set(-1.32, 2.2, 0);
    g.add(feedPort);
    var feedRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 16), mBlue);
    feedRing.rotation.y = Math.PI / 2;
    feedRing.position.set(-1.42, 2.2, 0);
    g.add(feedRing);

    // Permeate port (right, teal ring)
    var permPort = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 10), mPipe);
    permPort.rotation.z = Math.PI / 2;
    permPort.position.set(2.12, 2.2, 0);
    g.add(permPort);
    var permRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 14), mTeal);
    permRing.rotation.y = Math.PI / 2;
    permRing.position.set(2.22, 2.2, 0);
    g.add(permRing);

    // Concentrate port (top-right, orange)
    var concPort = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), mPipe);
    concPort.position.set(1.8, 2.52, 0);
    g.add(concPort);
    var concRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12), mOrange);
    concRing.rotation.x = Math.PI / 2;
    concRing.position.set(1.8, 2.63, 0);
    g.add(concRing);

    var spiral = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 8, 32, Math.PI * 6), mTeal
    );
    spiral.rotation.z = Math.PI / 2;
    spiral.rotation.y = Math.PI / 2;
    spiral.position.set(0.4, 2.2, 0);
    g.add(spiral);

    var pt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10), mBlue);
    pt.rotation.z = Math.PI / 2;
    pt.position.set(0.4, 2.2, 0);
    g.add(pt);

    // Up-pipe from carbon
    var up = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), mPipe);
    up.position.set(-1.2, 1.6, 0);
    g.add(up);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 4: Reject — FLOW LINE with drain arrow ---------- */
  (function () {
    var g = new THREE.Group();
    var mOrange = mkMat(0xff9500);
    var mPipe = mkMat(0xc0c8d0, 0x666666);
    var mats = [mOrange, mPipe];

    // Vertical segment aligned with concentrate port (x=1.8)
    var pipeV = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), mPipe);
    pipeV.position.set(1.8, 2.835, 0);
    g.add(pipeV);

    // Elbow bend (orange sphere)
    var elbow = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mOrange);
    elbow.position.set(1.8, 3.11, 0);
    g.add(elbow);

    // Horizontal drain segment
    var pipeH = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), mPipe);
    pipeH.rotation.z = Math.PI / 2;
    pipeH.position.set(2.25, 3.11, 0);
    g.add(pipeH);

    // Drain arrow tip (orange cone)
    var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 8), mOrange);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.set(2.65, 3.11, 0);
    g.add(arrow);

    // Orange accent ring at concentrate port
    var r1 = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 6, 12), mOrange);
    r1.rotation.x = Math.PI / 2;
    r1.position.set(1.8, 2.55, 0);
    g.add(r1);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 5: PFAS Capture — OCTAGONAL HOUSING ---------- */
  (function () {
    var g = new THREE.Group();
    var px = 1.0, py = -0.2;

    // Amber octagonal body (8-sided prism)
    var mBody = mkMat(0xd4a050);
    mBody.opacity = 0.85;
    // Resin inner
    var mResin = mkMat(0xcc5522);
    // Window
    var mWindow = mkMat(0xe8a830, 0xff9500);
    mWindow.opacity = 0.35;
    // Orange bands
    var mBand = mkMat(0xff9500);
    // NFC
    var mNFC = mkMat(0x2997ff);
    // Cap
    var mCap = mkMat(0xb0b8c4, 0x666666);
    // Pipe
    var mPipe = mkMat(0xc0c8d0, 0x666666);
    var mats = [mBody, mResin, mWindow, mBand, mNFC, mCap, mPipe];

    // 8-sided prism body
    var octBody = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 3.0, 8), mBody);
    octBody.position.set(px, py, 0);
    g.add(octBody);

    // Amber window panel (front face)
    var windowGeo = new THREE.PlaneGeometry(0.38, 1.6);
    var windowPanel = new THREE.Mesh(windowGeo, mWindow);
    windowPanel.position.set(px, py, 0.52);
    g.add(windowPanel);

    // Visible resin beads inside
    var beadGeo = new THREE.SphereGeometry(0.05, 6, 5);
    for (var bx = -2; bx <= 2; bx++) {
      for (var by = -3; by <= 3; by++) {
        var bead = new THREE.Mesh(beadGeo, mResin);
        bead.position.set(
          px + bx * 0.09 + (by % 2) * 0.04,
          py + by * 0.13,
          0.28
        );
        g.add(bead);
      }
    }

    // Hex caps
    var hexCapT = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.54, 0.14, 8), mCap);
    hexCapT.position.set(px, py + 1.57, 0);
    g.add(hexCapT);
    var hexCapB = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.54, 0.14, 8), mCap);
    hexCapB.position.set(px, py - 1.57, 0);
    g.add(hexCapB);

    // Double orange bands
    var b1 = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.028, 6, 24), mBand);
    b1.rotation.x = Math.PI / 2;
    b1.position.set(px, py + 0.7, 0);
    g.add(b1);
    var b2 = b1.clone();
    b2.position.set(px, py + 0.5, 0);
    g.add(b2);

    // NFC chip
    var nfc = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.02), mNFC);
    nfc.position.set(px, py - 0.5, 0.54);
    g.add(nfc);

    // Down-pipe from membrane
    var dp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.45, 8), mPipe);
    dp.position.set(1.65, 1.6, 0);
    g.add(dp);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 6: Outlet — GREEN FLOW LINE with glow ---------- */
  (function () {
    var g = new THREE.Group();
    var mGreen = mkMat(0x30d158);
    var mPipe = mkMat(0xc0c8d0, 0x666666);
    var mGlow = mkMat(0x30d158);
    var mats = [mGreen, mPipe, mGlow];

    var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 12), mPipe);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(3.0, -0.2, 0);
    g.add(pipe);

    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16), mGreen);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(3.6, -0.2, 0);
    g.add(ring);

    // Mid-pipe green ring
    var midRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 16), mGreen);
    midRing.rotation.y = Math.PI / 2;
    midRing.position.set(2.8, -0.2, 0);
    g.add(midRing);

    // Green flow-check dot
    var flowDot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), mGlow);
    flowDot.position.set(3.2, -0.05, 0.12);
    g.add(flowDot);

    // Connecting pipe from PFAS
    var cp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), mPipe);
    cp.rotation.z = Math.PI / 2;
    cp.position.set(2.05, -0.2, 0);
    g.add(cp);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ---------- Stage 7: Returnable cartridge ---------- */
  (function () {
    var g = new THREE.Group();
    g.position.set(3.8, 0.0, 0.35);
    var mBody = mkMat(0x28b84a);
    var mCap = mkMat(0xb0b8c4, 0x666666);
    var mTeal = mkMat(0x30d5c8);
    var mNFC = mkMat(0x2997ff);
    var mats = [mBody, mCap, mTeal, mNFC];

    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.0, 24), mBody);
    body.position.y = -0.2;
    g.add(body);

    var capT = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.52, 0.14, 24), mCap);
    capT.position.y = 0.87;
    g.add(capT);
    var capB = capT.clone();
    capB.position.y = -1.27;
    g.add(capB);

    // Handle
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10), mCap);
    stem.position.y = 1.22;
    g.add(stem);
    var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 10), mCap);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 1.5;
    g.add(bar);

    // Twist ring
    var twist = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.03, 6, 24), mTeal);
    twist.rotation.x = Math.PI / 2;
    twist.position.y = 0.78;
    g.add(twist);

    // NFC chip
    var nfc = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.025), mNFC);
    nfc.position.set(0, -0.45, 0.52);
    g.add(nfc);

    // Return symbol
    var sym = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.02, 6, 20, Math.PI * 1.6), mTeal
    );
    sym.position.set(0, 0.2, 0.52);
    g.add(sym);

    device.add(g);
    stageGroups.push(g);
    stageMaterials.push(mats);
  })();

  /* ====== Shadow catcher ====== */
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.ShadowMaterial({ opacity: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.95;
  scene.add(floor);

  /* ====== Raycasting — click on 3D objects ====== */
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  function getClickedStage(event) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    for (var s = 0; s < 8; s++) {
      var hits = raycaster.intersectObjects(stageGroups[s].children, true);
      if (hits.length > 0) return s;
    }
    return -1;
  }

  canvas.addEventListener('click', function (e) {
    var idx = getClickedStage(e);
    if (idx >= 0) setStep(idx);
  });

  canvas.addEventListener('mousemove', function (e) {
    var idx = getClickedStage(e);
    canvas.style.cursor = (idx >= 0) ? 'pointer' : 'default';
  });

  /* ====== Highlight + camera transition state ====== */
  var currentStep = 0;
  var targetOpacities = [];
  var targetEmissives = [];
  for (var i = 0; i < 8; i++) {
    targetOpacities.push(1.0);
    targetEmissives.push(EM_ACTIVE_BASE);
  }

  /* Camera transition tracking */
  var camProgress = 1;
  var camFrom = { px: 4, py: 3.5, pz: 11, lx: -0.5, ly: 0.3, lz: 0, ry: Math.PI * -0.12 };
  var camTo   = { px: 4, py: 3.5, pz: 11, lx: -0.5, ly: 0.3, lz: 0, ry: Math.PI * -0.12 };
  var camCur  = { px: 4, py: 3.5, pz: 11, lx: -0.5, ly: 0.3, lz: 0, ry: Math.PI * -0.12 };

  /* Focus light target positions per step (elevated, forward of geometry) */
  var FOCUS_POS = [
    [-4.5, 3.5, 4], [-3.6, 2.0, 4], [-1.8, 2.0, 4], [0.4, 4.0, 4],
    [2.0, 4.5, 4],  [1.0, 2.0, 4],  [3.0, 2.0, 4],  [3.8, 2.0, 4]
  ];

  function setStep(idx) {
    if (idx < 0 || idx > 7) return;
    currentStep = idx;

    /* Compute opacity/emissive per stage based on adjacency */
    var connSet = {};
    CONNECTIONS[idx].forEach(function (c) { connSet[c] = true; });
    for (var s = 0; s < 8; s++) {
      if (s === idx) {
        targetOpacities[s] = OP_ACTIVE;
        targetEmissives[s] = EM_ACTIVE_BASE;
      } else if (connSet[s]) {
        targetOpacities[s] = OP_CONNECTED;
        targetEmissives[s] = EM_CONNECTED;
      } else {
        targetOpacities[s] = OP_DISTANT;
        targetEmissives[s] = EM_DISTANT;
      }
    }

    /* Initiate camera transition from current position to step target */
    camFrom.px = camCur.px; camFrom.py = camCur.py; camFrom.pz = camCur.pz;
    camFrom.lx = camCur.lx; camFrom.ly = camCur.ly; camFrom.lz = camCur.lz;
    camFrom.ry = camCur.ry;

    var sc = STEP_CAMERAS[idx];
    camTo.px = sc.cam[0];  camTo.py = sc.cam[1];  camTo.pz = sc.cam[2];
    camTo.lx = sc.look[0]; camTo.ly = sc.look[1]; camTo.lz = sc.look[2];
    camTo.ry = sc.devRotY;
    camProgress = 0;

    updateUI(idx);
  }

  /* ====== Animation loop ====== */
  var clock = new THREE.Clock();
  var lastTime = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (window.__zeroPFAS_paused) return;
    var t = clock.getElapsedTime();
    var dt = Math.min(t - lastTime, 0.05); // capped to avoid jumps on tab-switch
    lastTime = t;

    /* ---- Camera transition (cubic ease-in-out) ---- */
    if (camProgress < 1) {
      camProgress = Math.min(1, camProgress + dt / CAM_DURATION);
      var e = easeInOutCubic(camProgress);
      camCur.px = camFrom.px + (camTo.px - camFrom.px) * e;
      camCur.py = camFrom.py + (camTo.py - camFrom.py) * e;
      camCur.pz = camFrom.pz + (camTo.pz - camFrom.pz) * e;
      camCur.lx = camFrom.lx + (camTo.lx - camFrom.lx) * e;
      camCur.ly = camFrom.ly + (camTo.ly - camFrom.ly) * e;
      camCur.lz = camFrom.lz + (camTo.lz - camFrom.lz) * e;
      camCur.ry = camFrom.ry + (camTo.ry - camFrom.ry) * e;
    }

    /* Apply camera with subtle organic drift overlay */
    var driftX = Math.sin(t * 0.12) * 0.12;
    var driftY = Math.cos(t * 0.09) * 0.06;
    camera.position.set(camCur.px + driftX, camCur.py + driftY, camCur.pz);
    camera.lookAt(camCur.lx, camCur.ly, camCur.lz);

    /* Device rotation — follows per-step target with gentle breathing */
    device.rotation.y = camCur.ry + Math.sin(t * 0.15) * 0.025;
    device.position.y = Math.sin(t * 0.4) * 0.02;

    /* ---- Stage material transitions ---- */
    for (var s = 0; s < 8; s++) {
      var mats = stageMaterials[s];
      var tOp = targetOpacities[s];
      var tEm = targetEmissives[s];
      var isActive = (s === currentStep);
      var lerpRate = isActive ? 0.09 : 0.06;

      for (var m = 0; m < mats.length; m++) {
        mats[m].opacity += (tOp - mats[m].opacity) * lerpRate;
        var emTarget = isActive
          ? tEm + Math.sin(t * 1.8) * EM_ACTIVE_PULSE
          : tEm;
        mats[m].emissiveIntensity += (emTarget - mats[m].emissiveIntensity) * 0.08;
      }

      /* Subtle scale pulse on active stage — alive without being distracting */
      var sTarget = isActive ? 1.0 + Math.sin(t * 2.0) * 0.005 : 1.0;
      var grp = stageGroups[s];
      grp.scale.x += (sTarget - grp.scale.x) * 0.06;
      grp.scale.y += (sTarget - grp.scale.y) * 0.06;
      grp.scale.z += (sTarget - grp.scale.z) * 0.06;
    }

    /* Bracket + LED — dimmed but structurally present */
    matBracket.opacity += (OP_BRACKET - matBracket.opacity) * 0.05;
    matLed.opacity += (OP_LED - matLed.opacity) * 0.05;
    matLed.emissiveIntensity = 0.15 + Math.sin(t * 1.5) * 0.08;

    /* Focused accent light — tracks active step position */
    var fp = FOCUS_POS[currentStep];
    focusLight.position.x += (fp[0] - focusLight.position.x) * 0.05;
    focusLight.position.y += (fp[1] - focusLight.position.y) * 0.05;
    focusLight.position.z += (fp[2] - focusLight.position.z) * 0.05;
    focusLight.intensity += (0.55 + Math.sin(t * 1.2) * 0.12 - focusLight.intensity) * 0.06;

    renderer.render(scene, camera);
  }

  /* ====== UI interaction ====== */
  var detailEl = document.getElementById('explorerDetail');
  var navEl = document.getElementById('explorerNav');
  var progressEl = document.getElementById('explorerProgress');
  var prevBtn = document.getElementById('explorerPrev');
  var nextBtn = document.getElementById('explorerNext');

  function updateUI(idx) {
    var step = STEPS[idx];
    var num = String(idx + 1).padStart(2, '0');
    var cat = CATEGORIES[step.cat];

    // Build detail panel (all content is static/hardcoded — no user input)
    detailEl.innerHTML =
      '<div class="explorer__detail-header">' +
        '<span class="explorer__detail-num">' + num + '</span>' +
        '<h3 class="explorer__detail-title">' + step.name + '</h3>' +
        '<span class="explorer__detail-badge explorer__detail-badge--' + step.cat + '">' + cat.label + '</span>' +
      '</div>' +
      '<div class="explorer__detail-type">' + step.type + '</div>' +
      '<div class="explorer__detail-grid">' +
        '<div class="explorer__detail-item">' +
          '<span class="explorer__detail-label">Qué es</span>' +
          '<p>' + step.what + '</p>' +
        '</div>' +
        '<div class="explorer__detail-item">' +
          '<span class="explorer__detail-label">Qué hace</span>' +
          '<p>' + step.does + '</p>' +
        '</div>' +
        '<div class="explorer__detail-item">' +
          '<span class="explorer__detail-label">Qué entra / qué sale</span>' +
          '<p>' + step.flow + '</p>' +
        '</div>' +
        '<div class="explorer__detail-item">' +
          '<span class="explorer__detail-label">Por qué importa</span>' +
          '<p>' + step.why + '</p>' +
        '</div>' +
      '</div>';

    // Nav highlight
    var btns = navEl.querySelectorAll('.explorer__step');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('is-active', i === idx);
    }

    // Progress bar
    progressEl.style.width = ((idx + 1) / 8 * 100) + '%';

    // Prev/Next state
    prevBtn.disabled = (idx === 0);
    nextBtn.disabled = (idx === 7);
  }

  // Nav click delegation
  navEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.explorer__step');
    if (!btn) return;
    var idx = parseInt(btn.getAttribute('data-step'), 10);
    if (!isNaN(idx)) setStep(idx);
  });

  // Prev / Next
  prevBtn.addEventListener('click', function () {
    if (currentStep > 0) setStep(currentStep - 1);
  });
  nextBtn.addEventListener('click', function () {
    if (currentStep < 7) setStep(currentStep + 1);
  });

  // Keyboard navigation (when section is visible)
  document.addEventListener('keydown', function (e) {
    var sec = document.getElementById('explorer');
    if (!sec) return;
    var rect = sec.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentStep < 7) setStep(currentStep + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentStep > 0) setStep(currentStep - 1);
    }
  });

  /* ====== Resize ====== */
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    }, 150);
  });

  /* ====== Init ====== */
  setStep(0);
  animate();

})();
