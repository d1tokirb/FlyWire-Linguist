// 3D Master Drosophila Linguist World & Acoustic Rig
// Integrates Anatomical 3D Fruit Fly with articulated proboscis mouthparts,
// acoustic Johnston's organ, vibrating wings, miniature laboratory headphones,
// studio condenser microphone, and 3D holographic soundwave frequency ribbon.

import * as THREE from 'three';

export class FlyLinguist3D {
  constructor(scene, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    this.currentView = 'LINGUIST_RIG'; // 'LINGUIST_RIG', 'MACRO_FACE', 'CONNECTOME_3D', 'ACOUSTIC_CHAMBER'

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Animation clocks and timers
    this.animTime = 0;
    this.isSpeaking = false;
    this.isListening = false;
    this.listeningTimer = 0;
    this.wingBeatFreq = 195;

    // Mouse Orbit Tracking state to prevent fighting
    this.isUserOrbiting = false;
    this.userHasCustomOrbit = false;

    if (this.controls) {
      this.controls.addEventListener('start', () => {
        this.isUserOrbiting = true;
        this.userHasCustomOrbit = true;
      });
      this.controls.addEventListener('end', () => {
        this.isUserOrbiting = false;
      });
    }

    this.initMaterials();
    this.initChamberEnvironment();
    this.initTrackballPodium();
    this.initMicrophoneRig();
    this.initAnatomicalFly();
    this.initHeadphones();
    this.initHolographicSoundwaveRibbon();
    this.initStudioLighting();

    this.setView('LINGUIST_RIG');
  }

  initMaterials() {
    // Amber Chitin Body Material
    this.chitinMat = new THREE.MeshStandardMaterial({
      color: 0xc4802c,
      roughness: 0.35,
      metalness: 0.25,
      bumpScale: 0.05
    });

    // Darker Chitin Thoracic / Abdominal Banding
    this.darkChitinMat = new THREE.MeshStandardMaterial({
      color: 0x5a3412,
      roughness: 0.45,
      metalness: 0.2
    });

    // Ruby Compound Eye Ommatidia Material
    this.eyeMat = new THREE.MeshStandardMaterial({
      color: 0xd91828,
      emissive: 0x660812,
      roughness: 0.15,
      metalness: 0.4
    });

    // Articulated Mouthparts / Proboscis Material
    this.proboscisMat = new THREE.MeshStandardMaterial({
      color: 0x9e6022,
      roughness: 0.5,
      metalness: 0.1
    });

    // Translucent Veined Wing Material
    this.wingMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 0.75,
      transparent: true,
      roughness: 0.12,
      ior: 1.52,
      side: THREE.DoubleSide
    });

    // Studio Metallic Hardware (Microphone & Stand)
    this.chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd0d8e2,
      metalness: 0.9,
      roughness: 0.2
    });

    this.darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.85,
      roughness: 0.35
    });

    // Glowing Cyan Laboratory Neon
    this.cyanNeonMat = new THREE.MeshStandardMaterial({
      color: 0x32ade6,
      emissive: 0x0088cc,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });

    // Holographic Audio Soundwave Material
    this.waveMat = new THREE.MeshBasicMaterial({
      color: 0x30d158,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
  }

  initChamberEnvironment() {
    this.envGroup = new THREE.Group();
    this.group.add(this.envGroup);

    // Acoustic Soundproofing Foam Floor
    const floorGeom = new THREE.PlaneGeometry(160, 160);
    floorGeom.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d1017,
      roughness: 0.85,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.y = -12;
    this.envGroup.add(floor);

    // Studio Grid Floor Rings
    const grid = new THREE.GridHelper(160, 40, 0x32ade6, 0x1f2838);
    grid.position.y = -11.95;
    this.envGroup.add(grid);

    // Circular Illuminated Pedestal Ring
    const ringGeom = new THREE.RingGeometry(18, 19.5, 64);
    ringGeom.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeom, this.cyanNeonMat);
    ring.position.y = -11.85;
    this.envGroup.add(ring);
  }

  initTrackballPodium() {
    this.podiumGroup = new THREE.Group();
    this.group.add(this.podiumGroup);

    // Cylindrical Base Stand
    const standGeom = new THREE.CylinderGeometry(8, 11, 8, 32);
    const stand = new THREE.Mesh(standGeom, this.darkMetalMat);
    stand.position.y = -8;
    this.podiumGroup.add(stand);

    // Floating Air-Cushioned Trackball Sphere
    const ballGeom = new THREE.SphereGeometry(7.2, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      roughness: 0.35,
      metalness: 0.15
    });
    this.trackballMesh = new THREE.Mesh(ballGeom, ballMat);
    this.trackballMesh.position.y = 1.0;
    this.podiumGroup.add(this.trackballMesh);

    // Optical Grid Lines on Trackball
    const ballGrid = new THREE.WireframeGeometry(ballGeom);
    const ballLines = new THREE.LineSegments(ballGrid, new THREE.LineBasicMaterial({
      color: 0x8a99ad,
      transparent: true,
      opacity: 0.3
    }));
    this.trackballMesh.add(ballLines);
  }

  initMicrophoneRig() {
    this.micGroup = new THREE.Group();
    this.micGroup.position.set(0, 7.5, -9.5); // Positioned right in front of the fly's mouth
    this.group.add(this.micGroup);

    // Articulated Boom Arm
    const baseStand = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 14, 16), this.darkMetalMat);
    baseStand.position.set(0, -6, 0);
    this.micGroup.add(baseStand);

    // Shock Mount Ring
    const shockRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.15, 12, 32), this.chromeMat);
    shockRing.position.set(0, 1.2, 0);
    shockRing.rotation.y = Math.PI / 2;
    this.micGroup.add(shockRing);

    // Condenser Capsule Body
    const capsuleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.8, 24), this.darkMetalMat);
    capsuleBody.position.set(0, 1.2, 0);
    this.micGroup.add(capsuleBody);

    // Wire Mesh Grille
    const grilleGeom = new THREE.CylinderGeometry(0.92, 0.92, 1.6, 24);
    const grilleMat = new THREE.MeshStandardMaterial({
      color: 0x909cb0,
      metalness: 0.95,
      roughness: 0.25,
      wireframe: true
    });
    const grille = new THREE.Mesh(grilleGeom, grilleMat);
    grille.position.set(0, 2.4, 0);
    this.micGroup.add(grille);

    // Pop Filter Screen
    const popFilterRing = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.08, 8, 32), this.darkMetalMat);
    popFilterRing.position.set(0, 2.4, 1.8);
    this.micGroup.add(popFilterRing);

    // Live On-Air Mic LED
    const ledGeom = new THREE.SphereGeometry(0.2, 12, 12);
    this.micLedMat = new THREE.MeshBasicMaterial({ color: 0x32ade6 });
    const led = new THREE.Mesh(ledGeom, this.micLedMat);
    led.position.set(0, 0.2, 0.95);
    this.micGroup.add(led);
  }

  initAnatomicalFly() {
    this.flyGroup = new THREE.Group();
    this.flyGroup.position.set(0, 8.2, 0);
    this.group.add(this.flyGroup);

    // 1. Thorax (Center segment)
    const thoraxGeom = new THREE.SphereGeometry(3.2, 24, 24);
    thoraxGeom.scale(1.0, 0.9, 1.35);
    this.thorax = new THREE.Mesh(thoraxGeom, this.chitinMat);
    this.flyGroup.add(this.thorax);

    // 2. Abdomen (Elongated posterior with chitinous stripes)
    this.abdomenGroup = new THREE.Group();
    this.abdomenGroup.position.set(0, -0.4, 4.2);
    this.flyGroup.add(this.abdomenGroup);

    const abdoGeom = new THREE.SphereGeometry(3.0, 24, 24);
    abdoGeom.scale(0.95, 0.85, 1.9);
    const abdoMesh = new THREE.Mesh(abdoGeom, this.chitinMat);
    this.abdomenGroup.add(abdoMesh);

    // Dark Abdominal Tergite Stripes
    for (let i = 0; i < 4; i++) {
      const stripeGeom = new THREE.TorusGeometry(2.3 - i * 0.35, 0.22, 8, 32);
      stripeGeom.rotateX(Math.PI / 2);
      const stripe = new THREE.Mesh(stripeGeom, this.darkChitinMat);
      stripe.position.set(0, 0, -1.8 + i * 1.5);
      this.abdomenGroup.add(stripe);
    }

    // 3. Head & Articulated Speech Complex
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.6, -4.0);
    this.flyGroup.add(this.headGroup);

    const headGeom = new THREE.SphereGeometry(2.4, 24, 24);
    headGeom.scale(1.1, 0.95, 0.85);
    const headMesh = new THREE.Mesh(headGeom, this.chitinMat);
    this.headGroup.add(headMesh);

    // 4. Ruby Compound Eyes (Ommatidia)
    for (let side of [-1, 1]) {
      const eyeGeom = new THREE.SphereGeometry(1.6, 24, 24);
      eyeGeom.scale(0.85, 1.25, 1.1);
      const eye = new THREE.Mesh(eyeGeom, this.eyeMat);
      eye.position.set(side * 1.7, 0.2, -0.7);
      eye.rotation.y = side * 0.4;
      eye.rotation.z = -side * 0.2;
      this.headGroup.add(eye);
    }

    // 5. Antennal Johnston's Organ (Auditory Mechanoreceptors) & Aristae
    this.antennaGroup = new THREE.Group();
    this.antennaGroup.position.set(0, 0.8, -2.1);
    this.headGroup.add(this.antennaGroup);

    for (let side of [-1, 1]) {
      const scape = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8), this.chitinMat);
      scape.position.set(side * 0.5, 0, 0);
      scape.rotation.x = -0.5;
      this.antennaGroup.add(scape);

      // Feathery Arista
      const arista = new THREE.Mesh(new THREE.ConeGeometry(0.08, 2.0, 6), this.darkChitinMat);
      arista.position.set(side * 0.65, 0.8, -0.4);
      arista.rotation.x = -0.8;
      arista.rotation.z = side * 0.4;
      this.antennaGroup.add(arista);
    }

    // 6. Articulated Proboscis (Mouthparts - Pulses, extends, and articulates during speech!)
    this.proboscisGroup = new THREE.Group();
    this.proboscisGroup.position.set(0, -1.2, -1.2);
    this.headGroup.add(this.proboscisGroup);

    // Rostrum (Basal tube)
    const rostrumGeom = new THREE.CylinderGeometry(0.5, 0.65, 1.8, 12);
    rostrumGeom.rotateX(0.4);
    const rostrum = new THREE.Mesh(rostrumGeom, this.proboscisMat);
    rostrum.position.set(0, -0.6, 0.2);
    this.proboscisGroup.add(rostrum);

    // Haustellum & Labella (Expandable speech fleshy pad)
    this.labellaMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), this.proboscisMat);
    this.labellaMesh.scale.set(1.4, 0.7, 1.0);
    this.labellaMesh.position.set(0, -1.6, -0.3);
    this.proboscisGroup.add(this.labellaMesh);

    // 7. Vibrating Wings (Flutter with audio speech envelope)
    this.leftWingGroup = new THREE.Group();
    this.leftWingGroup.position.set(-1.8, 1.8, 0.2);
    this.flyGroup.add(this.leftWingGroup);

    this.rightWingGroup = new THREE.Group();
    this.rightWingGroup.position.set(1.8, 1.8, 0.2);
    this.flyGroup.add(this.rightWingGroup);

    for (let side of [-1, 1]) {
      const parent = side === -1 ? this.leftWingGroup : this.rightWingGroup;
      const wingShapeGeom = new THREE.BoxGeometry(3.6, 0.04, 9.5);
      wingShapeGeom.translate(side * 1.8, 0, 4.2);
      const wingMesh = new THREE.Mesh(wingShapeGeom, this.wingMat);
      wingMesh.rotation.y = -side * 0.25;
      parent.add(wingMesh);
    }

    // 8. Chitinous Legs (6 articulated limbs resting on trackball)
    this.legs = [];
    const legPositions = [
      { side: -1, pos: [-2.2, -0.5, -1.8], rotY: -0.5 },
      { side: 1, pos: [2.2, -0.5, -1.8], rotY: 0.5 },
      { side: -1, pos: [-2.6, -0.5, 0.2], rotY: -0.1 },
      { side: 1, pos: [2.6, -0.5, 0.2], rotY: 0.1 },
      { side: -1, pos: [-2.3, -0.5, 2.2], rotY: 0.5 },
      { side: 1, pos: [2.3, -0.5, 2.2], rotY: -0.5 }
    ];

    legPositions.forEach(cfg => {
      const legGroup = new THREE.Group();
      legGroup.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      legGroup.rotation.y = cfg.rotY;

      // Femur
      const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 4.2, 8), this.chitinMat);
      femur.position.set(cfg.side * 1.5, -0.8, 0);
      femur.rotation.z = -cfg.side * 0.9;
      legGroup.add(femur);

      // Tibia & Tarsus
      const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 4.8, 8), this.darkChitinMat);
      tibia.position.set(cfg.side * 3.2, -3.2, 0);
      tibia.rotation.z = cfg.side * 0.45;
      legGroup.add(tibia);

      this.flyGroup.add(legGroup);
      this.legs.push(legGroup);
    });
  }

  initHeadphones() {
    this.headphoneGroup = new THREE.Group();
    this.headGroup.add(this.headphoneGroup);

    // Cyan Neon Over-Ear Headband
    const bandGeom = new THREE.TorusGeometry(2.3, 0.15, 8, 32, Math.PI);
    const band = new THREE.Mesh(bandGeom, this.darkMetalMat);
    band.position.set(0, 1.4, -0.5);
    band.rotation.x = -Math.PI / 2;
    band.rotation.z = -Math.PI / 2;
    this.headphoneGroup.add(band);

    // Left and Right High-Tech Glowing Ear Cups
    for (let side of [-1, 1]) {
      const cupGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 16);
      cupGeom.rotateZ(Math.PI / 2);
      const cup = new THREE.Mesh(cupGeom, this.darkMetalMat);
      cup.position.set(side * 2.5, 0.4, -0.6);
      this.headphoneGroup.add(cup);

      // Glowing Cyan LED Ring on Cup
      const ledRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.65, 16), this.cyanNeonMat);
      ledRing.position.set(side * 2.8, 0.4, -0.6);
      ledRing.rotation.y = side * Math.PI / 2;
      this.headphoneGroup.add(ledRing);
    }
  }

  initHolographicSoundwaveRibbon() {
    this.waveGroup = new THREE.Group();
    this.waveGroup.position.set(0, 11.2, -6.5);
    this.group.add(this.waveGroup);

    // Parametric Soundwave Mesh (32 segments)
    this.waveSegmentCount = 48;
    this.waveGeometry = new THREE.PlaneGeometry(16, 3.5, this.waveSegmentCount - 1, 4);
    this.waveMesh = new THREE.Mesh(this.waveGeometry, this.waveMat);
    this.waveMesh.position.y = 0;
    this.waveGroup.add(this.waveMesh);
  }

  initStudioLighting() {
    // Soft Blue Ambient Light
    const amb = new THREE.AmbientLight(0x182030, 2.2);
    this.group.add(amb);

    // Warm Key Spotlight onto Fly & Microphone
    const keySpot = new THREE.SpotLight(0xfffaed, 3.5, 80, Math.PI / 4, 0.4);
    keySpot.position.set(14, 28, 18);
    keySpot.target.position.set(0, 8, 0);
    this.group.add(keySpot);
    this.group.add(keySpot.target);

    // Cool Cyan Rim Light (Backlight Chitin & Wings)
    const rimLight = new THREE.DirectionalLight(0x32ade6, 2.0);
    rimLight.position.set(-16, 20, -22);
    this.group.add(rimLight);

    // Microphone Proximity Glow Light (Pulsates when speaking)
    this.micGlowLight = new THREE.PointLight(0x30d158, 0, 15);
    this.micGlowLight.position.set(0, 10, -9);
    this.group.add(this.micGlowLight);
  }

  setView(viewName) {
    this.currentView = viewName;
    this.userHasCustomOrbit = false;

    if (!this.camera || !this.controls) return;

    if (viewName === 'LINGUIST_RIG') {
      // Cinematic 3/4 Studio View framed in viewport
      this.camera.position.set(13, 14, 20);
      this.controls.target.set(-4.2, 8, -2);
    } else if (viewName === 'MACRO_FACE') {
      // Extreme Macro Face & Proboscis framed cleanly
      this.camera.position.set(3.2, 9.2, -9.8);
      this.controls.target.set(-2.2, 8.5, -4.5);
    } else if (viewName === 'CONNECTOME_3D') {
      // High Angle Connectome & Language Centers
      this.camera.position.set(10, 20, -9);
      this.controls.target.set(-3.8, 14, 0);
    } else if (viewName === 'ACOUSTIC_CHAMBER') {
      // Wide Laboratory View
      this.camera.position.set(24, 20, 28);
      this.controls.target.set(-4.5, 5, 0);
    }

    this.controls.update();
  }

  recenterCamera() {
    this.setView(this.currentView);
  }

  setSpeechState(isSpeaking) {
    this.isSpeaking = isSpeaking;
    if (this.micLedMat) {
      this.micLedMat.color.setHex(isSpeaking ? 0x30d158 : 0x32ade6); // Green on-air when speaking
    }
    if (this.micGlowLight) {
      this.micGlowLight.intensity = isSpeaking ? 3.0 : 0.0;
      this.micGlowLight.color.setHex(0x30d158);
    }
  }

  triggerListeningPulse() {
    this.isListening = true;
    this.listeningTimer = 1.2;
    if (this.micLedMat) {
      this.micLedMat.color.setHex(0xff9f0a); // Orange when listening to user keystrokes
    }
  }

  update(dt, speechSynth, languageEngine) {
    this.animTime += dt;

    if (this.listeningTimer > 0) {
      this.listeningTimer -= dt;
      if (this.listeningTimer <= 0) {
        this.isListening = false;
        if (!this.isSpeaking && this.micLedMat) {
          this.micLedMat.color.setHex(0x32ade6);
        }
      }
    }

    // 1. Proboscis & Mouthpart Speech Articulation Animation
    if (this.proboscisGroup) {
      if (this.isSpeaking) {
        // High-frequency bobbing and extension during speech
        const speechOsc = Math.sin(this.animTime * 28.0) * 0.35;
        this.proboscisGroup.position.y = -1.2 + speechOsc * 0.5;
        this.proboscisGroup.position.z = -1.2 - Math.abs(speechOsc) * 0.8;
        if (this.labellaMesh) {
          const swell = 1.0 + Math.sin(this.animTime * 24.0) * 0.3;
          this.labellaMesh.scale.set(1.4 * swell, 0.7 * swell, 1.0 * swell);
        }
      } else {
        // Idle breathing pulsation
        this.proboscisGroup.position.y = -1.2 + Math.sin(this.animTime * 2.0) * 0.08;
        this.proboscisGroup.position.z = -1.2;
        if (this.labellaMesh) {
          this.labellaMesh.scale.set(1.4, 0.7, 1.0);
        }
      }
    }

    // 2. Antennal Johnston's Organ Twitch (Vibrates when hearing user text)
    if (this.antennaGroup) {
      if (this.isListening) {
        this.antennaGroup.rotation.x = Math.sin(this.animTime * 45.0) * 0.25;
        this.antennaGroup.rotation.y = Math.sin(this.animTime * 30.0) * 0.15;
      } else {
        this.antennaGroup.rotation.x = Math.sin(this.animTime * 3.0) * 0.05;
        this.antennaGroup.rotation.y = 0;
      }
    }

    // 3. Wing Vibrations (Antiphase Wingbeat)
    if (this.leftWingGroup && this.rightWingGroup) {
      if (this.isSpeaking) {
        const wingFlutter = Math.sin(this.animTime * 65.0) * 0.65;
        this.leftWingGroup.rotation.z = wingFlutter;
        this.rightWingGroup.rotation.z = -wingFlutter;
      } else {
        const gentleBreathe = Math.sin(this.animTime * 2.5) * 0.05;
        this.leftWingGroup.rotation.z = gentleBreathe;
        this.rightWingGroup.rotation.z = -gentleBreathe;
      }
    }

    // 4. Abdomen Respiratory Pumping
    if (this.abdomenGroup) {
      const pump = Math.sin(this.animTime * 3.5) * 0.06;
      this.abdomenGroup.scale.set(1.0 + pump, 1.0 + pump * 0.8, 1.0 + pump * 1.2);
    }

    // 5. Trackball Micro-Stepping
    if (this.trackballMesh) {
      if (this.isSpeaking || this.isListening) {
        this.trackballMesh.rotation.x += dt * 0.4;
        this.trackballMesh.rotation.y += dt * 0.25;
      }
    }

    // 6. Holographic Soundwave Ribbon Dynamic Undulation (Audio FFT / Time-Domain driven)
    if (this.waveGeometry && this.waveMesh) {
      const timeData = speechSynth ? speechSynth.getTimeDomainData() : null;
      const posAttr = this.waveGeometry.attributes.position;

      for (let i = 0; i < this.waveSegmentCount; i++) {
        let amp = 0;
        if (this.isSpeaking && timeData && timeData.length > 0) {
          const sample = timeData[i % timeData.length];
          amp = ((sample - 128) / 128) * 1.8;
        } else if (this.isListening) {
          amp = Math.sin(this.animTime * 18.0 + i * 0.5) * 0.4;
        } else {
          amp = Math.sin(this.animTime * 4.0 + i * 0.3) * 0.08;
        }

        // Apply amplitude to top and bottom ribbon vertices
        for (let row = 0; row < 5; row++) {
          const vertIdx = i + row * this.waveSegmentCount;
          const factor = (row - 2) / 2.0;
          posAttr.setY(vertIdx, factor * (1.2 + Math.abs(amp) * 1.5) + amp * 0.5);
        }
      }
      posAttr.needsUpdate = true;

      // Color shifts based on Dopamine PAM state
      const pam = languageEngine ? languageEngine.pamDopamine : 40;
      if (this.waveMat) {
        if (pam > 65) {
          this.waveMat.color.setHex(0x30d158); // Lime green dopamine
        } else if (this.isSpeaking) {
          this.waveMat.color.setHex(0x64d2ff); // Cyan speech
        } else {
          this.waveMat.color.setHex(0xff9f0a); // Amber idle
        }
      }
    }

    // 7. Decoupled Camera Orbiting: If user dragged mouse, camera stays at custom orbit angle
    if (this.controls && !this.userHasCustomOrbit) {
      // Gentle subtle breathing motion
      // OrbitControls damping handles standard movement
    }
  }
}
