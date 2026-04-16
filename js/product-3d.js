/* product-3d.js — Realistic under-sink multi-stage water treatment system for ZeroPFAS */
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
  renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(36, W() / H(), 0.1, 100);
  camera.position.set(5, 4, 12);
  camera.lookAt(-0.5, 0.5, 0);

  /* -------- Lighting — Studio setup -------- */
  scene.add(new THREE.AmbientLight(0x8899bb, 0.4));

  var keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
  keyLight.position.set(6, 10, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.bias = -0.002;
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0x8899cc, 0.3);
  fillLight.position.set(-5, 4, -4);
  scene.add(fillLight);

  var rimLight = new THREE.PointLight(0x4488cc, 1.0, 22);
  rimLight.position.set(-3, 7, -8);
  scene.add(rimLight);

  var accentLight = new THREE.PointLight(0x30d5c8, 0.6, 14);
  accentLight.position.set(3, -1, 5);
  scene.add(accentLight);

  /* -------- Materials -------- */
  var matWhite = new THREE.MeshStandardMaterial({
    color: 0xeaeaef, roughness: 0.32, metalness: 0.04
  });
  var matAluminum = new THREE.MeshStandardMaterial({
    color: 0xb0b8c4, roughness: 0.18, metalness: 0.88
  });
  var matDarkMetal = new THREE.MeshStandardMaterial({
    color: 0x2a2a35, roughness: 0.28, metalness: 0.72
  });
  var matTeal = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, roughness: 0.35, metalness: 0.3,
    emissive: 0x30d5c8, emissiveIntensity: 0.12
  });
  var matBlue = new THREE.MeshStandardMaterial({
    color: 0x2997ff, roughness: 0.4, metalness: 0.2,
    emissive: 0x2997ff, emissiveIntensity: 0.08
  });
  var matOrange = new THREE.MeshStandardMaterial({
    color: 0xff9500, roughness: 0.38, metalness: 0.2,
    emissive: 0xff9500, emissiveIntensity: 0.12
  });
  var matGlass = new THREE.MeshStandardMaterial({
    color: 0x99ccee, roughness: 0.08, metalness: 0.08,
    transparent: true, opacity: 0.18
  });
  var matInner = new THREE.MeshStandardMaterial({
    color: 0x1a1a24, roughness: 0.5, metalness: 0.4
  });
  var matGreen = new THREE.MeshStandardMaterial({
    color: 0x30d158, roughness: 0.38, metalness: 0.3,
    emissive: 0x30d158, emissiveIntensity: 0.08
  });
  var matSediment = new THREE.MeshStandardMaterial({
    color: 0x9a8a6a, roughness: 0.55, metalness: 0.1
  });
  var matCarbon = new THREE.MeshStandardMaterial({
    color: 0x333340, roughness: 0.45, metalness: 0.2
  });
  var matResin = new THREE.MeshStandardMaterial({
    color: 0xcc5522, roughness: 0.4, metalness: 0.15,
    emissive: 0xff6600, emissiveIntensity: 0.06
  });
  var matPipe = new THREE.MeshStandardMaterial({
    color: 0xc0c8d0, roughness: 0.22, metalness: 0.8
  });

  /* -------- Device Group -------- */
  var device = new THREE.Group();
  scene.add(device);

  /* ========================================================
     MOUNTING BRACKET — horizontal base plate (under-sink style)
     ======================================================== */
  var bracketGeo = new THREE.BoxGeometry(9.5, 0.12, 2.8);
  var bracket = new THREE.Mesh(bracketGeo, matAluminum);
  bracket.position.set(0, -1.8, 0);
  bracket.castShadow = true;
  bracket.receiveShadow = true;
  device.add(bracket);

  // Bracket mounting holes (decorative)
  for (var bh = 0; bh < 4; bh++) {
    var holeGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
    var hole = new THREE.Mesh(holeGeo, matDarkMetal);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(-3.6 + bh * 2.4, -1.73, 1.2);
    device.add(hole);
  }

  // Back-rail (upright support behind canisters)
  var railGeo = new THREE.BoxGeometry(9.5, 0.12, 0.18);
  var rail = new THREE.Mesh(railGeo, matAluminum);
  rail.position.set(0, -0.3, -1.55);
  rail.castShadow = true;
  device.add(rail);

  // Canister support clamps on bracket
  var clampXs = [-3.6, -1.8, 1.0, 3.8];
  for (var ci = 0; ci < clampXs.length; ci++) {
    var clampGeo = new THREE.TorusGeometry(0.58, 0.04, 6, 24, Math.PI);
    var clamp = new THREE.Mesh(clampGeo, matDarkMetal);
    clamp.rotation.y = Math.PI / 2;
    clamp.rotation.z = Math.PI;
    clamp.position.set(clampXs[ci], -1.3, 0);
    device.add(clamp);
  }

  // Pressure gauge on inlet manifold
  var gaugeBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20),
    matAluminum
  );
  gaugeBody.rotation.x = Math.PI / 2;
  gaugeBody.position.set(-4.2, 2.1, 0.15);
  device.add(gaugeBody);
  var gaugeFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 20),
    new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.3, metalness: 0.2 })
  );
  gaugeFace.position.set(-4.2, 2.1, 0.2);
  device.add(gaugeFace);

  /* ========================================================
     Helper: build a vertical cartridge canister (filter housing)
     Refined with O-ring seals, grip grooves, and thicker caps
     ======================================================== */
  function buildCanister(r, h, pos, bodyMat, showCutaway, innerMat, innerR) {
    var g = new THREE.Group();
    g.position.copy(pos);

    // Main body
    var bodyGeo = new THREE.CylinderGeometry(r, r, h, 40);
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // Top cap — thicker, beveled
    var capGeo = new THREE.CylinderGeometry(r + 0.05, r + 0.03, 0.14, 40);
    var topCap = new THREE.Mesh(capGeo, matAluminum);
    topCap.position.y = h / 2 + 0.07;
    topCap.castShadow = true;
    g.add(topCap);

    // Bottom cap
    var botCap = new THREE.Mesh(capGeo.clone(), matAluminum);
    botCap.position.y = -h / 2 - 0.07;
    botCap.castShadow = true;
    g.add(botCap);

    // O-ring seals at cap junctions
    var oRingGeo = new THREE.TorusGeometry(r + 0.01, 0.018, 8, 32);
    var oRingMat = new THREE.MeshStandardMaterial({
      color: 0x222228, roughness: 0.7, metalness: 0.1
    });
    var oRingTop = new THREE.Mesh(oRingGeo, oRingMat);
    oRingTop.rotation.x = Math.PI / 2;
    oRingTop.position.y = h / 2;
    g.add(oRingTop);
    var oRingBot = new THREE.Mesh(oRingGeo.clone(), oRingMat);
    oRingBot.rotation.x = Math.PI / 2;
    oRingBot.position.y = -h / 2;
    g.add(oRingBot);

    // Neck fitting on top (push-connect)
    var neckGeo = new THREE.CylinderGeometry(r * 0.3, r * 0.35, 0.28, 20);
    var neck = new THREE.Mesh(neckGeo, matPipe);
    neck.position.y = h / 2 + 0.28;
    g.add(neck);

    // Bottom drain fitting
    var drainGeo = new THREE.CylinderGeometry(r * 0.22, r * 0.25, 0.15, 16);
    var drain = new THREE.Mesh(drainGeo, matPipe);
    drain.position.y = -h / 2 - 0.21;
    g.add(drain);

    // Grip grooves — three subtle rings on lower body
    for (var gi = 0; gi < 3; gi++) {
      var grooveGeo = new THREE.TorusGeometry(r + 0.005, 0.01, 6, 32);
      var groove = new THREE.Mesh(grooveGeo, matDarkMetal);
      groove.rotation.x = Math.PI / 2;
      groove.position.y = -h * 0.2 + gi * 0.18;
      g.add(groove);
    }

    // Cutaway section — partial transparency shell + inner fill
    if (showCutaway && innerMat) {
      var cutArc = Math.PI * 1.55;
      var shellGeo = new THREE.CylinderGeometry(r + 0.01, r + 0.01, h * 0.85, 40, 1, true, 0, cutArc);
      var shell = new THREE.Mesh(shellGeo, matGlass);
      shell.rotation.y = Math.PI * 0.35;
      g.add(shell);

      var iR = innerR || r * 0.72;
      var innerGeo = new THREE.CylinderGeometry(iR, iR, h * 0.75, 28);
      var inner = new THREE.Mesh(innerGeo, innerMat);
      g.add(inner);
    }

    device.add(g);
    return g;
  }

  /* ========================================================
     Helper: push-fit pipe connector detail
     ======================================================== */
  function addFitting(pos, rotZ) {
    var fGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 14);
    var f = new THREE.Mesh(fGeo, matAluminum);
    f.position.copy(pos);
    if (rotZ) f.rotation.z = rotZ;
    device.add(f);
    // Collet ring
    var cGeo = new THREE.TorusGeometry(0.1, 0.015, 8, 20);
    var c = new THREE.Mesh(cGeo, matDarkMetal);
    c.position.copy(pos);
    c.rotation.x = Math.PI / 2;
    if (rotZ) c.rotation.z = rotZ;
    device.add(c);
  }

  /* ========================================================
     STAGE 1: Water inlet manifold (top-left)
     ======================================================== */
  var inletPipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 16);
  var inletPipe = new THREE.Mesh(inletPipeGeo, matPipe);
  inletPipe.rotation.z = Math.PI / 2;
  inletPipe.position.set(-4.8, 1.8, 0);
  inletPipe.castShadow = true;
  device.add(inletPipe);

  // Inlet ball valve
  var valveGeo = new THREE.SphereGeometry(0.2, 20, 16);
  var valve = new THREE.Mesh(valveGeo, matAluminum);
  valve.position.set(-5.5, 1.8, 0);
  valve.castShadow = true;
  device.add(valve);

  // Valve handle (quarter-turn lever)
  var handleGeo = new THREE.BoxGeometry(0.06, 0.38, 0.06);
  var valveHandle = new THREE.Mesh(handleGeo, matBlue);
  valveHandle.position.set(-5.5, 2.0, 0.15);
  valveHandle.rotation.z = 0.15;
  device.add(valveHandle);

  // Inlet ring
  var inletRingGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 24);
  var inletRing = new THREE.Mesh(inletRingGeo, matBlue);
  inletRing.rotation.y = Math.PI / 2;
  inletRing.position.set(-5.7, 1.8, 0);
  device.add(inletRing);

  // Inlet fitting detail
  addFitting(new THREE.Vector3(-3.9, 1.8, 0), Math.PI / 2);

  // Down-pipe from inlet to first canister
  var downPipe1Geo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 12);
  var downPipe1 = new THREE.Mesh(downPipe1Geo, matPipe);
  downPipe1.position.set(-3.6, 0.9, 0);
  device.add(downPipe1);

  /* ========================================================
     STAGE 2: Sediment pre-filter — SLIM TRANSLUCENT BOWL
     Narrow see-through housing with visible pleated element
     ======================================================== */
  (function () {
    var sx = -3.6, sy = -0.2;

    // Translucent outer bowl (narrower than carbon)
    var matBowl = new THREE.MeshStandardMaterial({
      color: 0xaaccdd, roughness: 0.08, metalness: 0.05,
      transparent: true, opacity: 0.22
    });
    var bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 2.6, 32), matBowl
    );
    bowl.position.set(sx, sy, 0);
    bowl.castShadow = true;
    device.add(bowl);

    // Heavy aluminum head (top — wider than bowl = sump-filter look)
    var headGeo = new THREE.CylinderGeometry(0.48, 0.44, 0.35, 32);
    var head = new THREE.Mesh(headGeo, matAluminum);
    head.position.set(sx, sy + 1.45, 0);
    head.castShadow = true;
    device.add(head);

    // Bottom dome cap (rounded)
    var domeGeo = new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    var dome = new THREE.Mesh(domeGeo, matBowl);
    dome.position.set(sx, sy - 1.3, 0);
    device.add(dome);

    // Inner pleated cartridge (visible through bowl)
    var pleatedMat = new THREE.MeshStandardMaterial({
      color: 0xc8b888, roughness: 0.6, metalness: 0.05
    });
    var pleated = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 2.0, 20), pleatedMat
    );
    pleated.position.set(sx, sy, 0);
    device.add(pleated);

    // Pleat rings (horizontal ridges on cartridge)
    for (var pr = 0; pr < 7; pr++) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.012, 6, 24), pleatedMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(sx, sy - 0.8 + pr * 0.28, 0);
      device.add(ring);
    }

    // Sediment deposit at bottom (darker fill)
    var sedFill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.40, 0.5, 20), matSediment
    );
    sedFill.position.set(sx, sy - 1.05, 0);
    device.add(sedFill);

    // Neck fitting on head
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.2, 16), matPipe
    );
    neck.position.set(sx, sy + 1.7, 0);
    device.add(neck);

    // Label band — blue
    var band = new THREE.Mesh(
      new THREE.TorusGeometry(0.49, 0.025, 8, 32), matBlue
    );
    band.rotation.x = Math.PI / 2;
    band.position.set(sx, sy + 1.3, 0);
    device.add(band);
  })();

  /* ========================================================
     STAGE 3: Activated Carbon block — OPAQUE DARK GRAPHITE
     Dense, solid black canister — clearly adsorption, not filtration
     ======================================================== */
  (function () {
    var cx = -1.8, cy = -0.2;

    // Dense opaque body — dark graphite color, wider than sediment
    var matGraphite = new THREE.MeshStandardMaterial({
      color: 0x1e1e28, roughness: 0.45, metalness: 0.25
    });
    var body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 3.0, 32), matGraphite
    );
    body.position.set(cx, cy, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    device.add(body);

    // Top cap — brushed metal, flat industrial
    var capGeo = new THREE.CylinderGeometry(0.58, 0.56, 0.14, 32);
    var topCap = new THREE.Mesh(capGeo, matDarkMetal);
    topCap.position.set(cx, cy + 1.57, 0);
    topCap.castShadow = true;
    device.add(topCap);

    // Bottom cap
    var botCap = new THREE.Mesh(capGeo.clone(), matDarkMetal);
    botCap.position.set(cx, cy - 1.57, 0);
    device.add(botCap);

    // Textured grip ridges — five dark ribs around lower body
    for (var gi = 0; gi < 5; gi++) {
      var rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.56, 0.015, 6, 32), matDarkMetal
      );
      rib.rotation.x = Math.PI / 2;
      rib.position.set(cx, cy - 0.6 + gi * 0.3, 0);
      device.add(rib);
    }

    // Carbon micro-texture band (lighter stripe showing GAC label zone)
    var matCarbonBand = new THREE.MeshStandardMaterial({
      color: 0x3a3a48, roughness: 0.35, metalness: 0.3
    });
    var bandGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.25, 32);
    var cBand = new THREE.Mesh(bandGeo, matCarbonBand);
    cBand.position.set(cx, cy + 0.9, 0);
    device.add(cBand);

    // Teal label ring
    var labelRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.57, 0.025, 8, 32), matTeal
    );
    labelRing.rotation.x = Math.PI / 2;
    labelRing.position.set(cx, cy + 1.05, 0);
    device.add(labelRing);

    // Neck fitting
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.22, 16), matPipe
    );
    neck.position.set(cx, cy + 1.78, 0);
    device.add(neck);

    // Bottom drain
    var drain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.12, 14), matPipe
    );
    drain.position.set(cx, cy - 1.72, 0);
    device.add(drain);
  })();

  // Inter-canister pipe: sediment → carbon
  var pipeGeoBetween = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 10);
  var pipe12 = new THREE.Mesh(pipeGeoBetween, matPipe);
  pipe12.rotation.z = Math.PI / 2;
  pipe12.position.set(-2.7, 1.5, 0);
  device.add(pipe12);

  /* ========================================================
     STAGE 4: RO/NF Membrane — horizontal pressure vessel
     Enhanced with distinct port fittings (feed, permeate, concentrate)
     ======================================================== */
  var membraneBodyGeo = new THREE.CylinderGeometry(0.48, 0.48, 3.2, 36);
  var membraneBody = new THREE.Mesh(membraneBodyGeo, matWhite);
  membraneBody.rotation.z = Math.PI / 2;
  membraneBody.position.set(0.4, 2.2, 0);
  membraneBody.castShadow = true;
  device.add(membraneBody);

  // Membrane end caps — thicker, industrial
  var mCapGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.12, 36);
  var mCapL = new THREE.Mesh(mCapGeo, matAluminum);
  mCapL.rotation.z = Math.PI / 2;
  mCapL.position.set(-1.2, 2.2, 0);
  device.add(mCapL);
  var mCapR = new THREE.Mesh(mCapGeo.clone(), matAluminum);
  mCapR.rotation.z = Math.PI / 2;
  mCapR.position.set(2.0, 2.2, 0);
  device.add(mCapR);

  // Feed port (left end — blue ring identifies feed)
  var feedPort = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.18, 14), matPipe
  );
  feedPort.rotation.z = Math.PI / 2;
  feedPort.position.set(-1.35, 2.2, 0);
  device.add(feedPort);
  var feedRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.02, 8, 20), matBlue
  );
  feedRing.rotation.y = Math.PI / 2;
  feedRing.position.set(-1.45, 2.2, 0);
  device.add(feedRing);

  // Permeate port (right end — teal, treated water output)
  var permPort = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12), matPipe
  );
  permPort.rotation.z = Math.PI / 2;
  permPort.position.set(2.15, 2.2, 0);
  device.add(permPort);
  var permRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.02, 8, 18), matTeal
  );
  permRing.rotation.y = Math.PI / 2;
  permRing.position.set(2.25, 2.2, 0);
  device.add(permRing);

  // Concentrate port (top of right end — orange, reject output)
  var concPort = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.22, 10), matPipe
  );
  concPort.position.set(1.8, 2.55, 0);
  device.add(concPort);
  var concRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.018, 8, 16), matOrange
  );
  concRing.rotation.x = Math.PI / 2;
  concRing.position.set(1.8, 2.68, 0);
  device.add(concRing);

  // Cutaway shell — partial arc showing spiral
  var mCutGeo = new THREE.CylinderGeometry(0.49, 0.49, 2.8, 36, 1, true, 0, Math.PI * 1.5);
  var mCut = new THREE.Mesh(mCutGeo, matGlass);
  mCut.rotation.z = Math.PI / 2;
  mCut.rotation.y = Math.PI * 0.2;
  mCut.position.set(0.4, 2.2, 0);
  device.add(mCut);

  // Inner spiral membrane roll
  var spiralGeo = new THREE.TorusGeometry(0.28, 0.03, 8, 48, Math.PI * 6);
  var spiral = new THREE.Mesh(spiralGeo, matTeal);
  spiral.rotation.z = Math.PI / 2;
  spiral.rotation.y = Math.PI / 2;
  spiral.position.set(0.4, 2.2, 0);
  device.add(spiral);

  // Inner permeate tube
  var permGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 12);
  var permTube = new THREE.Mesh(permGeo, matBlue);
  permTube.rotation.z = Math.PI / 2;
  permTube.position.set(0.4, 2.2, 0);
  device.add(permTube);

  // Pipe from carbon up to membrane
  var pipe23v = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 1.1, 10),
    matPipe
  );
  pipe23v.position.set(-0.9, 1.55, 0);
  device.add(pipe23v);

  /* ========================================================
     STAGE 5: Reject/concentrate line — FLOW LINE, not a module
     Thin angled pipe with orange accents, drain arrow appearance
     ======================================================== */
  // Vertical segment from concentrate port up
  var rejectPipeV = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.6, 10), matPipe
  );
  rejectPipeV.position.set(2.0, 2.72, 0);
  device.add(rejectPipeV);

  // Elbow: small orange sphere at bend
  var rejectElbow = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 10), matOrange
  );
  rejectElbow.position.set(2.0, 3.05, 0);
  device.add(rejectElbow);

  // Horizontal drain pipe segment going right
  var rejectPipeH = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.6, 10), matPipe
  );
  rejectPipeH.rotation.z = Math.PI / 2;
  rejectPipeH.position.set(2.35, 3.05, 0);
  device.add(rejectPipeH);

  // Drain arrow (orange cone tip)
  var drainArrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.15, 8), matOrange
  );
  drainArrow.rotation.z = -Math.PI / 2;
  drainArrow.position.set(2.72, 3.05, 0);
  device.add(drainArrow);

  // Orange accent rings along reject line
  for (var ri = 0; ri < 2; ri++) {
    var rr = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 14), matOrange
    );
    rr.rotation.x = Math.PI / 2;
    rr.position.set(2.0, 2.5 + ri * 0.3, 0);
    device.add(rr);
  }

  /* ========================================================
     STAGE 6: PFAS selective capture — FACETED OCTAGONAL HOUSING
     Distinct from cylindrical canisters: flat-sided, amber window,
     visible resin inside, specialized industrial identity
     ======================================================== */
  var matPFASBody = new THREE.MeshStandardMaterial({
    color: 0xd4a050, roughness: 0.32, metalness: 0.12, transparent: true, opacity: 0.85
  });
  (function () {
    var px = 1.0, py = -0.2;

    // Octagonal main body (8-sided prism via LatheGeometry)
    var pts = [];
    var octR = 0.52;
    for (var i = 0; i <= 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      pts.push(new THREE.Vector2(
        Math.cos(a) * octR, Math.sin(a) * octR
      ));
    }
    // Use 8-segment cylinder for octagonal look
    var octGeo = new THREE.CylinderGeometry(0.52, 0.52, 3.0, 8);
    var octBody = new THREE.Mesh(octGeo, matPFASBody);
    octBody.position.set(px, py, 0);
    octBody.castShadow = true;
    octBody.receiveShadow = true;
    device.add(octBody);

    // Amber window panel (flat face showing resin inside)
    var windowMat = new THREE.MeshStandardMaterial({
      color: 0xe8a830, roughness: 0.06, metalness: 0.05,
      transparent: true, opacity: 0.35,
      emissive: 0xff9500, emissiveIntensity: 0.08
    });
    var windowGeo = new THREE.PlaneGeometry(0.42, 1.8);
    var windowPanel = new THREE.Mesh(windowGeo, windowMat);
    windowPanel.position.set(px, py, 0.52);
    device.add(windowPanel);

    // Visible resin beads inside (cluster of small spheres)
    var resinCluster = new THREE.Group();
    var beadGeo = new THREE.SphereGeometry(0.06, 8, 6);
    for (var bx = -2; bx <= 2; bx++) {
      for (var by = -4; by <= 4; by++) {
        var bead = new THREE.Mesh(beadGeo, matResin);
        bead.position.set(
          bx * 0.1 + (by % 2) * 0.05,
          by * 0.12,
          0
        );
        resinCluster.add(bead);
      }
    }
    resinCluster.position.set(px, py, 0.3);
    device.add(resinCluster);

    // Heavy hex caps (top/bottom)
    var hexCapGeo = new THREE.CylinderGeometry(0.56, 0.54, 0.16, 8);
    var hexCapT = new THREE.Mesh(hexCapGeo, matAluminum);
    hexCapT.position.set(px, py + 1.58, 0);
    hexCapT.castShadow = true;
    device.add(hexCapT);
    var hexCapB = new THREE.Mesh(hexCapGeo.clone(), matAluminum);
    hexCapB.position.set(px, py - 1.58, 0);
    device.add(hexCapB);

    // O-ring seals at cap junctions
    var oRingGeo = new THREE.TorusGeometry(0.53, 0.018, 8, 32);
    var oRingMat = new THREE.MeshStandardMaterial({
      color: 0x222228, roughness: 0.7, metalness: 0.1
    });
    var oT = new THREE.Mesh(oRingGeo, oRingMat);
    oT.rotation.x = Math.PI / 2;
    oT.position.set(px, py + 1.5, 0);
    device.add(oT);
    var oB = new THREE.Mesh(oRingGeo.clone(), oRingMat);
    oB.rotation.x = Math.PI / 2;
    oB.position.set(px, py - 1.5, 0);
    device.add(oB);

    // Double orange identification bands
    var pfasLabelGeo = new THREE.TorusGeometry(0.54, 0.03, 8, 32);
    var pfasLabel = new THREE.Mesh(pfasLabelGeo, matOrange);
    pfasLabel.rotation.x = Math.PI / 2;
    pfasLabel.position.set(px, py + 0.7, 0);
    device.add(pfasLabel);
    var pfasLabel2 = new THREE.Mesh(pfasLabelGeo.clone(), matOrange);
    pfasLabel2.rotation.x = Math.PI / 2;
    pfasLabel2.position.set(px, py + 0.5, 0);
    device.add(pfasLabel2);

    // Neck fitting
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12), matPipe
    );
    neck.position.set(px, py + 1.78, 0);
    device.add(neck);
  })();

  // NFC chip — on the PFAS cartridge
  var nfcGeo = new THREE.BoxGeometry(0.25, 0.25, 0.02);
  var nfcMat = new THREE.MeshStandardMaterial({
    color: 0x2997ff, emissive: 0x2997ff, emissiveIntensity: 0.25,
    roughness: 0.3, metalness: 0.4
  });
  var nfcChip = new THREE.Mesh(nfcGeo, nfcMat);
  nfcChip.position.set(1.0, -0.5, 0.56);
  device.add(nfcChip);

  // Pipe from membrane down to PFAS cartridge
  var pipe45v = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 1.3, 10),
    matPipe
  );
  pipe45v.position.set(1.6, 1.45, 0);
  device.add(pipe45v);

  /* ========================================================
     STAGE 7: Purified water outlet — GREEN FLOW LINE with glow
     ======================================================== */
  var outletPipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 14);
  var outletPipe = new THREE.Mesh(outletPipeGeo, matPipe);
  outletPipe.rotation.z = Math.PI / 2;
  outletPipe.position.set(3.0, -0.2, 0);
  outletPipe.castShadow = true;
  device.add(outletPipe);

  // Outlet faucet end ring — bright green
  var outletRingGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 20);
  var outletRing = new THREE.Mesh(outletRingGeo, matGreen);
  outletRing.rotation.y = Math.PI / 2;
  outletRing.position.set(3.6, -0.2, 0);
  device.add(outletRing);

  // Green flow-check indicator light
  var matFlowGlow = new THREE.MeshStandardMaterial({
    color: 0x30d158, emissive: 0x30d158, emissiveIntensity: 0.4,
    roughness: 0.2, metalness: 0.3
  });
  var flowDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 8), matFlowGlow
  );
  flowDot.position.set(3.2, -0.05, 0.12);
  device.add(flowDot);

  // Second green ring at mid-pipe
  var midRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.02, 8, 18), matGreen
  );
  midRing.rotation.y = Math.PI / 2;
  midRing.position.set(2.8, -0.2, 0);
  device.add(midRing);

  // Pipe from PFAS cartridge to outlet
  var pipe67h = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 1.2, 10),
    matPipe
  );
  pipe67h.rotation.z = Math.PI / 2;
  pipe67h.position.set(2.0, -0.2, 0);
  device.add(pipe67h);

  // Fitting at key pipe junctions
  addFitting(new THREE.Vector3(-2.7, 1.5, 0), Math.PI / 2);
  addFitting(new THREE.Vector3(1.6, 0.8, 0));
  addFitting(new THREE.Vector3(2.6, -0.2, 0), Math.PI / 2);

  /* -------- Elbow connectors at pipe direction changes -------- */
  var elbowGeo = new THREE.SphereGeometry(0.09, 14, 10);

  var elbowInlet = new THREE.Mesh(elbowGeo, matAluminum);
  elbowInlet.position.set(-3.6, 1.7, 0);
  elbowInlet.castShadow = true;
  device.add(elbowInlet);

  var elbowCM = new THREE.Mesh(elbowGeo, matAluminum);
  elbowCM.position.set(-0.9, 2.15, 0);
  elbowCM.castShadow = true;
  device.add(elbowCM);

  var elbowMP = new THREE.Mesh(elbowGeo, matAluminum);
  elbowMP.position.set(1.6, 2.15, 0);
  elbowMP.castShadow = true;
  device.add(elbowMP);

  var elbowPF = new THREE.Mesh(elbowGeo, matAluminum);
  elbowPF.position.set(1.3, 0.8, 0);
  elbowPF.castShadow = true;
  device.add(elbowPF);

  /* -------- Bridge pipes closing routing gaps -------- */
  var bridgeCM = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.50, 10), matPipe
  );
  bridgeCM.rotation.z = Math.PI / 2;
  bridgeCM.position.set(-1.12, 2.18, 0);
  device.add(bridgeCM);

  var bridgeMP = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.55, 10), matPipe
  );
  bridgeMP.rotation.z = Math.PI / 2;
  bridgeMP.position.set(1.88, 2.18, 0);
  device.add(bridgeMP);

  /* -------- Carbon → Membrane routing bridge -------- */
  // Vertical segment: from inter-canister level (y=1.5) down to y=1.0
  var bridgeCMv = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10), matPipe
  );
  bridgeCMv.position.set(-0.9, 1.25, 0);
  device.add(bridgeCMv);

  // Horizontal bridge from carbon (x=-1.8) to pipe23v base (x=-0.9) at y=1.0
  var bridgeCMh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.9, 10), matPipe
  );
  bridgeCMh.rotation.z = Math.PI / 2;
  bridgeCMh.position.set(-1.35, 1.0, 0);
  device.add(bridgeCMh);

  // Elbows at L-turn points
  var elbowCMbot = new THREE.Mesh(elbowGeo, matAluminum);
  elbowCMbot.position.set(-0.9, 1.0, 0);
  elbowCMbot.castShadow = true;
  device.add(elbowCMbot);

  var elbowCMcbn = new THREE.Mesh(elbowGeo, matAluminum);
  elbowCMcbn.position.set(-1.8, 1.0, 0);
  elbowCMcbn.castShadow = true;
  device.add(elbowCMcbn);

  // Fitting at carbon head exit
  addFitting(new THREE.Vector3(-1.8, 1.5, 0));

  // Vertical segment from inter-canister pipe level down at carbon side
  var bridgeCMv2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10), matPipe
  );
  bridgeCMv2.position.set(-1.8, 1.25, 0);
  device.add(bridgeCMv2);

  /* -------- Pipe45v → PFAS cartridge entry -------- */
  // Horizontal branch from pipe45v (x=1.6) into PFAS neck (x=1.0) at cap height
  var bridgePFh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.6, 10), matPipe
  );
  bridgePFh.rotation.z = Math.PI / 2;
  bridgePFh.position.set(1.3, 1.58, 0);
  device.add(bridgePFh);

  // Elbow where pipe45v turns into PFAS
  var elbowPFentry = new THREE.Mesh(elbowGeo, matAluminum);
  elbowPFentry.position.set(1.6, 1.58, 0);
  elbowPFentry.castShadow = true;
  device.add(elbowPFentry);

  // Fitting at PFAS cap entry
  addFitting(new THREE.Vector3(1.0, 1.7, 0));

  /* ========================================================
     STAGE 8: Returnable cartridge module — HERO element
     Visually offset, larger, with extraction handle, NFC
     antenna ring, quick-release mechanism, and green glow.
     ======================================================== */
  var retGroup = new THREE.Group();
  retGroup.position.set(3.8, 0.0, 0.35); // offset forward + right = extractable feel
  device.add(retGroup);

  // Main cartridge body — taller, green-tinted translucent
  var matRetBody = new THREE.MeshStandardMaterial({
    color: 0x28b84a, roughness: 0.28, metalness: 0.18,
    transparent: true, opacity: 0.82,
    emissive: 0x30d158, emissiveIntensity: 0.06
  });
  var retGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 32);
  var retBody = new THREE.Mesh(retGeo, matRetBody);
  retBody.position.y = -0.2;
  retBody.castShadow = true;
  retGroup.add(retBody);

  // Top cap with quick-release collar
  var retCapGeo = new THREE.CylinderGeometry(0.54, 0.52, 0.14, 32);
  var retCapT = new THREE.Mesh(retCapGeo, matAluminum);
  retCapT.position.y = 0.87;
  retGroup.add(retCapT);

  // Quick-release twist ring
  var twistRingGeo = new THREE.TorusGeometry(0.53, 0.03, 8, 32);
  var twistRing = new THREE.Mesh(twistRingGeo, matTeal);
  twistRing.rotation.x = Math.PI / 2;
  twistRing.position.y = 0.78;
  retGroup.add(twistRing);

  // Extraction handle on top — T-grip
  var handleStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12),
    matAluminum
  );
  handleStem.position.y = 1.22;
  retGroup.add(handleStem);
  var handleBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.55, 12),
    matAluminum
  );
  handleBar.rotation.z = Math.PI / 2;
  handleBar.position.y = 1.5;
  retGroup.add(handleBar);
  // Handle grip pads (dark rubber)
  var gripMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.8, metalness: 0.05 });
  var gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 10), gripMat);
  gripL.rotation.z = Math.PI / 2;
  gripL.position.set(-0.22, 1.5, 0);
  retGroup.add(gripL);
  var gripR = gripL.clone();
  gripR.position.set(0.22, 1.5, 0);
  retGroup.add(gripR);

  // Bottom cap
  var retCapB = new THREE.Mesh(retCapGeo.clone(), matAluminum);
  retCapB.position.y = -1.27;
  retGroup.add(retCapB);

  // O-ring seals
  var retORing = new THREE.Mesh(
    new THREE.TorusGeometry(0.51, 0.02, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.7, metalness: 0.1 })
  );
  retORing.rotation.x = Math.PI / 2;
  retORing.position.y = 0.8;
  retGroup.add(retORing);
  var retORingB = retORing.clone();
  retORingB.position.y = -1.2;
  retGroup.add(retORingB);

  // NFC chip — larger, on front face with antenna ring
  var nfcRetGeo = new THREE.BoxGeometry(0.3, 0.3, 0.025);
  var nfcRetMat = new THREE.MeshStandardMaterial({
    color: 0x2997ff, emissive: 0x2997ff, emissiveIntensity: 0.3,
    roughness: 0.25, metalness: 0.45
  });
  var nfcRetChip = new THREE.Mesh(nfcRetGeo, nfcRetMat);
  nfcRetChip.position.set(0, -0.45, 0.52);
  retGroup.add(nfcRetChip);
  // NFC antenna coil ring
  var nfcAntennaGeo = new THREE.TorusGeometry(0.26, 0.012, 6, 32);
  var nfcAntenna = new THREE.Mesh(nfcAntennaGeo, new THREE.MeshStandardMaterial({
    color: 0x4488cc, roughness: 0.3, metalness: 0.6
  }));
  nfcAntenna.position.set(0, -0.45, 0.535);
  retGroup.add(nfcAntenna);

  // Circular-return symbol (torus arc)
  var retSymGeo = new THREE.TorusGeometry(0.22, 0.022, 8, 24, Math.PI * 1.6);
  var retSym = new THREE.Mesh(retSymGeo, matTeal);
  retSym.position.set(0, 0.2, 0.52);
  retGroup.add(retSym);

  // Separation gap indicator — subtle dashed ring showing removability
  var gapRingGeo = new THREE.TorusGeometry(0.56, 0.008, 6, 48);
  var gapRingMat = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, emissive: 0x30d5c8, emissiveIntensity: 0.4,
    roughness: 0.3, metalness: 0.3
  });
  var gapRing = new THREE.Mesh(gapRingGeo, gapRingMat);
  gapRing.rotation.x = Math.PI / 2;
  gapRing.position.y = 0.72;
  retGroup.add(gapRing);

  // Color band labels on body
  for (var rb = 0; rb < 2; rb++) {
    var bandGeo = new THREE.TorusGeometry(0.51, 0.02, 6, 32);
    var band = new THREE.Mesh(bandGeo, matGreen);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.1 - rb * 0.65;
    retGroup.add(band);
  }

  /* ========================================================
     ADDITIONAL INFRASTRUCTURE — membrane brackets & returnable link
     ======================================================== */

  /* Membrane support brackets (L-shape from back rail to membrane) */
  var mBracketXs = [-0.3, 1.2];
  for (var mbi = 0; mbi < mBracketXs.length; mbi++) {
    var mbx = mBracketXs[mbi];
    // Vertical arm from rail to membrane height
    var mbV = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 2.5, 0.07), matAluminum
    );
    mbV.position.set(mbx, 0.95, -1.25);
    mbV.castShadow = true;
    device.add(mbV);
    // Horizontal arm reaching membrane
    var mbH = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.07, 1.25), matAluminum
    );
    mbH.position.set(mbx, 2.2, -0.63);
    device.add(mbH);
    // U-clamp around membrane body
    var mbC = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.025, 6, 20, Math.PI), matDarkMetal
    );
    mbC.rotation.y = Math.PI / 2;
    mbC.position.set(mbx, 2.2, 0);
    device.add(mbC);
    // Diagonal gusset 
    var mbG = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.45, 0.45), matAluminum
    );
    mbG.position.set(mbx, 1.97, -0.95);
    mbG.rotation.x = -Math.PI / 4;
    device.add(mbG);
  }

  /* Outlet → Returnable connection pipe */
  // Elbow at outlet terminus
  var elbowOutRet = new THREE.Mesh(elbowGeo, matAluminum);
  elbowOutRet.position.set(3.6, -0.2, 0);
  elbowOutRet.castShadow = true;
  device.add(elbowOutRet);

  // Pipe angling forward toward returnable z-offset
  var pipeRetZ = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.42, 10), matPipe
  );
  pipeRetZ.position.set(3.7, -0.2, 0.175);
  pipeRetZ.rotation.x = Math.PI / 2;
  device.add(pipeRetZ);

  // Elbow at z=0.35 plane
  var elbowRetZ = new THREE.Mesh(elbowGeo, matAluminum);
  elbowRetZ.position.set(3.8, -0.2, 0.35);
  elbowRetZ.castShadow = true;
  device.add(elbowRetZ);

  // Vertical pipe down to returnable bottom
  var pipeRetV = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.95, 10), matPipe
  );
  pipeRetV.position.set(3.8, -0.68, 0.35);
  device.add(pipeRetV);

  // Fitting at returnable docking port
  addFitting(new THREE.Vector3(3.8, -1.15, 0.35));

  // Returnable support bracket (connects to back rail)
  var retSupportH = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 1.75), matAluminum
  );
  retSupportH.position.set(3.8, -0.3, -0.5);
  device.add(retSupportH);

  var retSupportV = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.38, 0.06), matAluminum
  );
  retSupportV.position.set(3.8, -1.05, -1.4);
  device.add(retSupportV);

  // Returnable base clamp
  var retBaseClamp = new THREE.Mesh(
    new THREE.TorusGeometry(0.54, 0.03, 6, 20, Math.PI), matDarkMetal
  );
  retBaseClamp.rotation.y = Math.PI / 2;
  retBaseClamp.rotation.z = Math.PI;
  retBaseClamp.position.set(3.8, -1.0, 0.35);
  device.add(retBaseClamp);

  /* ========================================================
     LED status strip — along mounting bracket
     ======================================================== */
  var ledStripGeo = new THREE.BoxGeometry(8.5, 0.03, 0.08);
  var ledMat = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, emissive: 0x30d5c8, emissiveIntensity: 0.5,
    roughness: 0.3, metalness: 0.5
  });
  var ledStrip = new THREE.Mesh(ledStripGeo, ledMat);
  ledStrip.position.set(0, -1.72, 1.4);
  device.add(ledStrip);

  /* ========================================================
     Brand label on bracket
     ======================================================== */
  var labelGeo = new THREE.BoxGeometry(1.0, 0.06, 0.3);
  var labelMat2 = new THREE.MeshStandardMaterial({
    color: 0x2997ff, emissive: 0x2997ff, emissiveIntensity: 0.2,
    roughness: 0.4, metalness: 0.3
  });
  var brandLabel = new THREE.Mesh(labelGeo, labelMat2);
  brandLabel.position.set(0, -1.72, -1.2);
  device.add(brandLabel);

  /* -------- Shadow receiver -------- */
  var floorGeo = new THREE.PlaneGeometry(16, 12);
  var floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.95;
  floor.receiveShadow = true;
  scene.add(floor);

  /* -------- Ambient particles -------- */
  var particleCount = 45;
  var pGeo = new THREE.BufferGeometry();
  var pPositions = new Float32Array(particleCount * 3);
  for (var i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 12;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  var pMat = new THREE.PointsMaterial({
    color: 0x30d5c8, size: 0.035, transparent: true, opacity: 0.25
  });
  var particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ========================================================
     WATER FLOW PARTICLE SYSTEM
     Animated spheres trace the complete treatment path from
     inlet to outlet. Reject branch shown in orange.
     All parameters editable at the top of this block.
     ======================================================== */
  var FLOW_SPEED        = 0.055;   // main path cycle rate
  var REJECT_SPEED      = 0.07;    // reject path cycle rate
  var MAIN_PARTICLE_N   = 24;      // particles on main path
  var REJECT_PARTICLE_N = 6;       // particles on reject branch
  var FLOW_PARTICLE_R   = 0.032;   // sphere radius
  var FLOW_GLOW         = 0.55;    // base emissive intensity
  var PULSE_COUNT       = 6;       // glow rings travelling main path
  var PULSE_SPEED       = 0.04;    // ring cycle rate

  /* -- Path waypoints (follow exterior pipe routing) -- */
  var FLOW_PATH = [
    new THREE.Vector3(-5.70,  1.80, 0),   // inlet entry
    new THREE.Vector3(-3.90,  1.80, 0),   // after valve / fitting
    new THREE.Vector3(-3.60,  1.70, 0),   // elbow — turn down
    new THREE.Vector3(-3.60,  1.50, 0),   // sediment head level
    new THREE.Vector3(-1.80,  1.50, 0),   // inter-canister pipe end at carbon
    new THREE.Vector3(-1.80,  1.00, 0),   // carbon down to L-turn
    new THREE.Vector3(-0.90,  1.00, 0),   // bridge horizontal to pipe23v base
    new THREE.Vector3(-0.90,  2.15, 0),   // pipe23v top / elbow
    new THREE.Vector3(-1.35,  2.20, 0),   // membrane feed port
    new THREE.Vector3( 2.15,  2.20, 0),   // membrane permeate out
    new THREE.Vector3( 1.60,  2.15, 0),   // bridgeMP elbow — turn down
    new THREE.Vector3( 1.60,  1.58, 0),   // pipe45v to PFAS entry height
    new THREE.Vector3( 1.00,  1.58, 0),   // horizontal branch into PFAS neck
    new THREE.Vector3( 1.00, -0.20, 0),   // through PFAS cartridge body
    new THREE.Vector3( 1.40, -0.20, 0),   // PFAS exit
    new THREE.Vector3( 2.60, -0.20, 0),   // outlet pipe mid
    new THREE.Vector3( 3.60, -0.20, 0)    // outlet end
  ];

  var REJECT_PATH = [
    new THREE.Vector3( 1.80, 2.55, 0),    // concentrate port
    new THREE.Vector3( 2.00, 2.72, 0),    // reject pipe mid
    new THREE.Vector3( 2.00, 3.05, 0),    // elbow
    new THREE.Vector3( 2.35, 3.05, 0),    // horizontal drain pipe
    new THREE.Vector3( 2.72, 3.05, 0)     // drain tip
  ];

  /* -- Precompute cumulative distances for constant-speed sampling -- */
  function buildPathLUT(path) {
    var d = [0];
    for (var i = 1; i < path.length; i++) {
      d.push(d[i - 1] + path[i - 1].distanceTo(path[i]));
    }
    return { d: d, total: d[d.length - 1] };
  }
  var mainLUT   = buildPathLUT(FLOW_PATH);
  var rejectLUT = buildPathLUT(REJECT_PATH);

  /* Returns a point on the path at normalised position t (0-1, wraps) */
  function samplePath(path, lut, t) {
    t = ((t % 1) + 1) % 1;
    var dist = t * lut.total;
    for (var i = 0; i < lut.d.length - 1; i++) {
      if (dist <= lut.d[i + 1]) {
        var seg = lut.d[i + 1] - lut.d[i];
        var frac = seg > 0 ? (dist - lut.d[i]) / seg : 0;
        return new THREE.Vector3().lerpVectors(path[i], path[i + 1], frac);
      }
    }
    return path[path.length - 1].clone();
  }

  /* -- Particle pools -- */
  var flowSphGeo = new THREE.SphereGeometry(FLOW_PARTICLE_R, 8, 6);

  var flowMatBlue = new THREE.MeshStandardMaterial({
    color: 0x2997ff, emissive: 0x2997ff, emissiveIntensity: FLOW_GLOW,
    roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.85
  });
  var flowMatTeal = new THREE.MeshStandardMaterial({
    color: 0x30d5c8, emissive: 0x30d5c8, emissiveIntensity: FLOW_GLOW,
    roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.85
  });
  var flowMatGreen = new THREE.MeshStandardMaterial({
    color: 0x30d158, emissive: 0x30d158, emissiveIntensity: FLOW_GLOW,
    roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.85
  });
  var flowMatReject = new THREE.MeshStandardMaterial({
    color: 0xff9500, emissive: 0xff9500, emissiveIntensity: FLOW_GLOW,
    roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.80
  });

  var mainFlowPool = [];
  for (var mfi = 0; mfi < MAIN_PARTICLE_N; mfi++) {
    var fpm = new THREE.Mesh(flowSphGeo, flowMatTeal); // default teal; swapped in loop
    fpm._off = mfi / MAIN_PARTICLE_N;
    device.add(fpm);
    mainFlowPool.push(fpm);
  }

  var rejectFlowPool = [];
  for (var rfi = 0; rfi < REJECT_PARTICLE_N; rfi++) {
    var fpr = new THREE.Mesh(flowSphGeo, flowMatReject);
    fpr._off = rfi / REJECT_PARTICLE_N;
    device.add(fpr);
    rejectFlowPool.push(fpr);
  }

  /* -- Pulse glow rings (larger, semi-transparent, travelling on main path) -- */
  var pulseRingGeo = new THREE.TorusGeometry(0.09, 0.014, 6, 18);
  var pulseRings   = [];
  for (var pli = 0; pli < PULSE_COUNT; pli++) {
    var plMat = new THREE.MeshStandardMaterial({
      color: 0x30d5c8, emissive: 0x30d5c8, emissiveIntensity: 0.30,
      roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.35
    });
    var plr = new THREE.Mesh(pulseRingGeo, plMat);
    plr._off = pli / PULSE_COUNT;
    plr._mat = plMat;
    device.add(plr);
    pulseRings.push(plr);
  }

  /* Reusable helpers for ring orientation (avoid GC pressure) */
  var _flowUp  = new THREE.Vector3(0, 1, 0);
  var _flowQ   = new THREE.Quaternion();

  /* -------- Mouse parallax -------- */
  var mouseX = 0, mouseY = 0;
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
        }, 300 + i * 140);
      });
    }
  }
  window.addEventListener('scroll', revealCallouts, { passive: true });
  revealCallouts();

  /* -------- Animation loop -------- */
  var clock = new THREE.Clock();
  var baseRotY = Math.PI * -0.15;

  function animate() {
    requestAnimationFrame(animate);
    if (window.__zeroPFAS_paused) return;
    var t = clock.getElapsedTime();

    /* Auto-orbit — Lissajous idle drift, fades when mouse is active */
    var idleFactor = 1 - Math.min(Math.abs(mouseX) * 2 + Math.abs(mouseY) * 2, 1);
    var orbitY = Math.sin(t * 0.08) * 0.12 + Math.sin(t * 0.037) * 0.05;
    var orbitX = Math.sin(t * 0.053) * 0.035;
    var targetRotY = baseRotY + mouseX * 0.3 + orbitY * idleFactor;
    var targetRotX = mouseY * 0.1 + orbitX * idleFactor;
    device.rotation.y += (targetRotY - device.rotation.y) * 0.03;
    device.rotation.x += (targetRotX - device.rotation.x) * 0.03;

    /* Subtle camera dolly + elevation breathe */
    camera.position.z += (12 + Math.sin(t * 0.12) * 0.3 * idleFactor - camera.position.z) * 0.02;
    camera.position.y += (4 + Math.cos(t * 0.09) * 0.15 * idleFactor - camera.position.y) * 0.02;

    /* Multi-frequency organic float */
    device.position.y = Math.sin(t * 0.5) * 0.04
                      + Math.sin(t * 0.31) * 0.02
                      + Math.cos(t * 0.71) * 0.012;

    // LED strip pulse
    ledMat.emissiveIntensity = 0.35 + Math.sin(t * 2.0) * 0.2;

    // NFC chip pulse
    nfcMat.emissiveIntensity = 0.15 + Math.sin(t * 2.5) * 0.12;
    nfcRetMat.emissiveIntensity = 0.2 + Math.sin(t * 2.5 + 0.5) * 0.15;

    // Returnable cartridge body glow pulse
    matRetBody.emissiveIntensity = 0.04 + Math.sin(t * 1.2) * 0.04;

    // Gap ring pulse on returnable
    gapRingMat.emissiveIntensity = 0.25 + Math.sin(t * 2.0) * 0.2;

    // Membrane spiral slow rotation
    spiral.rotation.x = t * 0.3;

    // Reject valve glow
    matOrange.emissiveIntensity = 0.08 + Math.sin(t * 1.5) * 0.06;

    // Outlet flow glow
    matFlowGlow.emissiveIntensity = 0.3 + Math.sin(t * 2.2) * 0.2;

    // Resin inner subtle shift
    matResin.emissiveIntensity = 0.04 + Math.sin(t * 1.8) * 0.04;

    // Particles drift
    particles.rotation.y = t * 0.015;
    particles.rotation.x = t * 0.008;

    /* ---- Water flow particles — main treatment path ---- */
    var flowT = t * FLOW_SPEED;
    for (var fi = 0; fi < mainFlowPool.length; fi++) {
      var pathT = ((flowT + mainFlowPool[fi]._off) % 1 + 1) % 1;
      var pt = samplePath(FLOW_PATH, mainLUT, pathT);
      mainFlowPool[fi].position.copy(pt);
      // Subtle size breathe
      mainFlowPool[fi].scale.setScalar(0.8 + Math.sin(t * 3.0 + fi * 0.7) * 0.3);
      // Color zone: blue (inlet) → teal (treatment) → green (outlet)
      if (pathT < 0.30) {
        mainFlowPool[fi].material = flowMatBlue;
      } else if (pathT < 0.70) {
        mainFlowPool[fi].material = flowMatTeal;
      } else {
        mainFlowPool[fi].material = flowMatGreen;
      }
    }

    /* ---- Water flow particles — reject branch ---- */
    var rejT = t * REJECT_SPEED;
    for (var rj = 0; rj < rejectFlowPool.length; rj++) {
      var rpt = samplePath(REJECT_PATH, rejectLUT, rejT + rejectFlowPool[rj]._off);
      rejectFlowPool[rj].position.copy(rpt);
      rejectFlowPool[rj].scale.setScalar(0.7 + Math.sin(t * 3.5 + rj * 0.9) * 0.3);
    }

    /* ---- Pulse rings — oriented perpendicular to pipe direction ---- */
    var pulseT = t * PULSE_SPEED;
    for (var pk = 0; pk < pulseRings.length; pk++) {
      var prng  = pulseRings[pk];
      var pT    = pulseT + prng._off;
      var p1    = samplePath(FLOW_PATH, mainLUT, pT);
      var p2    = samplePath(FLOW_PATH, mainLUT, pT + 0.005);
      prng.position.copy(p1);
      var dir = p2.sub(p1);
      if (dir.lengthSq() > 0.0001) {
        dir.normalize();
        if (dir.y < -0.999) {
          _flowQ.setFromAxisAngle(_flowUp.set(1, 0, 0), Math.PI);
        } else {
          _flowUp.set(0, 1, 0);
          _flowQ.setFromUnitVectors(_flowUp, dir);
        }
        prng.quaternion.copy(_flowQ);
      }
      var wave = Math.sin(pT * Math.PI * 6);
      prng._mat.opacity = 0.20 + wave * 0.20;
      prng._mat.emissiveIntensity = 0.20 + wave * 0.18;
    }

    // Flow material glow micro-pulse
    flowMatBlue.emissiveIntensity  = FLOW_GLOW + Math.sin(t * 2.0) * 0.12;
    flowMatTeal.emissiveIntensity  = FLOW_GLOW + Math.sin(t * 2.0 + 0.5) * 0.12;
    flowMatGreen.emissiveIntensity = FLOW_GLOW + Math.sin(t * 2.0 + 1.0) * 0.12;

    // Accent light animation
    accentLight.intensity = 0.5 + Math.sin(t * 1.0) * 0.15;

    // Rim light subtle breathing
    rimLight.intensity = 0.8 + Math.sin(t * 0.4) * 0.2;

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
