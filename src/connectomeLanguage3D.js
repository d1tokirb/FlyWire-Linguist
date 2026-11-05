// 3D Drosophila Connectome Language Circuit Visualization
// Displays 3D neural clusters of the fly brain responsible for language acquisition:
// Antennal Lobe (acoustic sensation), Mushroom Body (Hebbian associative memory),
// Central Complex (motor speech articulation), and PAM Dopamine reward centers.

import * as THREE from 'three';

export class ConnectomeLanguage3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(0, 14.5, 0); // Floats above the fly
    this.scene.add(this.group);

    this.neurons = [];
    this.synapses = [];
    this.particles = [];
    this.animTime = 0;

    this.initClusters();
    this.initKenyonCellField();
    this.initSynapticTracts();
    this.initActionPotentialParticles();

    this.group.visible = true;
  }

  initKenyonCellField() {
    // 2,597 Kenyon Cells distributed across FlyWire Mushroom Body Calyx and Lobes
    // Authenticated FlyWire FAFB v783 right hemibrain connectome
    this.numKCs = 2597;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.numKCs * 3);
    const colors = new Float32Array(this.numKCs * 3);

    for (let i = 0; i < this.numKCs; i++) {
      // Group into bilateral MB lobes
      const hemisphere = i % 2 === 0 ? -1 : 1;
      const subtype = i < 650 ? 2 : (i < 1950 ? 0 : 1); // gamma, a/b, a'/b'

      let x, y, z;
      if (subtype === 0) {
        // alpha/beta lobes (vertical and medial stalks)
        x = hemisphere * (2.2 + Math.random() * 1.2);
        y = 1.2 + Math.random() * 2.5;
        z = -1.0 + Math.random() * 1.5;
      } else if (subtype === 1) {
        // alpha'/beta' lobes
        x = hemisphere * (1.8 + Math.random() * 1.0);
        y = 1.0 + Math.random() * 2.2;
        z = -1.4 + Math.random() * 1.2;
      } else {
        // gamma lobe (horizontal medial lobe)
        x = hemisphere * (1.2 + Math.random() * 2.4);
        y = 0.5 + Math.random() * 1.2;
        z = -0.5 + Math.random() * 1.8;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Initial dim purple/cyan resting state
      colors[i * 3] = 0.45;
      colors[i * 3 + 1] = 0.25;
      colors[i * 3 + 2] = 0.75;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.kcPoints = new THREE.Points(geometry, material);
    this.group.add(this.kcPoints);
  }

  initClusters() {
    this.clusters = [
      // 1. Antennal Lobe (Acoustic sensory transduction - Cyan)
      { id: 'ALN', name: 'Antennal Acoustic Lobe', pos: new THREE.Vector3(0, 0, -3.5), count: 24, color: 0x32ade6 },
      // 2. Mushroom Body Calyx (Associative vocabulary acquisition - Purple)
      { id: 'MB_CALYX', name: 'Mushroom Body Calyx', pos: new THREE.Vector3(-2.8, 1.8, -1.2), count: 32, color: 0xbf5af2 },
      { id: 'MB_LOBES', name: 'Mushroom Body Lobes', pos: new THREE.Vector3(2.8, 1.8, -1.2), count: 32, color: 0xaf52de },
      // 3. Central Complex (Speech Motor Planning - Blue)
      { id: 'CX', name: 'Central Complex (Fan-Shaped Body)', pos: new THREE.Vector3(0, 1.5, 1.0), count: 28, color: 0x0a84ff },
      // 4. PAM Dopaminergic Cluster (Sucrose Reward - Radiant Green)
      { id: 'PAM', name: 'PAM Dopamine Cluster (Reward)', pos: new THREE.Vector3(0, -1.2, 2.5), count: 20, color: 0x30d158 },
      // 5. PPL1 Aversive / Confusion Cluster (Red)
      { id: 'PPL1', name: 'PPL1 Looming / Error Cluster', pos: new THREE.Vector3(0, -1.8, -0.5), count: 16, color: 0xff453a }
    ];

    const neuronGeom = new THREE.SphereGeometry(0.28, 12, 12);

    this.clusters.forEach(c => {
      c.nodes = [];
      const mat = new THREE.MeshStandardMaterial({
        color: c.color,
        emissive: c.color,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });

      for (let i = 0; i < c.count; i++) {
        const mesh = new THREE.Mesh(neuronGeom, mat.clone());
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 2.0
        );
        mesh.position.copy(c.pos).add(offset);
        this.group.add(mesh);

        const node = {
          mesh,
          basePos: mesh.position.clone(),
          cluster: c.id,
          color: c.color,
          pulsePhase: Math.random() * Math.PI * 2
        };
        this.neurons.push(node);
        c.nodes.push(node);
      }
    });
  }

  initSynapticTracts() {
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x5e7292,
      transparent: true,
      opacity: 0.35
    });

    // Connect ALN -> MB (Auditory word tokens to associative memory)
    this.connectClusters('ALN', 'MB_CALYX', lineMat, 18);
    this.connectClusters('ALN', 'MB_LOBES', lineMat, 18);

    // Connect MB -> CX (Associative language to motor articulation)
    this.connectClusters('MB_CALYX', 'CX', lineMat, 22);
    this.connectClusters('MB_LOBES', 'CX', lineMat, 22);

    // Connect PAM Dopamine -> MB (Reinforcement learning & Hebbian weight updates)
    const pamLineMat = new THREE.LineBasicMaterial({
      color: 0x30d158,
      transparent: true,
      opacity: 0.45
    });
    this.connectClusters('PAM', 'MB_CALYX', pamLineMat, 20);
    this.connectClusters('PAM', 'MB_LOBES', pamLineMat, 20);
  }

  connectClusters(cIdA, cIdB, material, count) {
    const clusterA = this.clusters.find(c => c.id === cIdA);
    const clusterB = this.clusters.find(c => c.id === cIdB);
    if (!clusterA || !clusterB) return;

    for (let i = 0; i < count; i++) {
      const nA = clusterA.nodes[Math.floor(Math.random() * clusterA.nodes.length)];
      const nB = clusterB.nodes[Math.floor(Math.random() * clusterB.nodes.length)];

      const points = [nA.basePos, nB.basePos];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, material);
      this.group.add(line);

      this.synapses.push({ line, nA, nB, type: cIdA === 'PAM' ? 'DOPAMINE' : 'STANDARD' });
    }
  }

  initActionPotentialParticles() {
    this.particleCount = 36;
    const pGeom = new THREE.SphereGeometry(0.12, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < this.particleCount; i++) {
      const pMesh = new THREE.Mesh(pGeom, pMat.clone());
      this.group.add(pMesh);
      const syn = this.synapses[i % this.synapses.length];
      this.particles.push({
        mesh: pMesh,
        synapse: syn,
        t: Math.random(),
        speed: 0.6 + Math.random() * 0.8
      });
    }
  }

  triggerDopamineSurge() {
    // Flash PAM dopaminergic neurons bright green
    this.neurons.forEach(n => {
      if (n.cluster === 'PAM') {
        n.mesh.material.emissiveIntensity = 3.0;
        n.mesh.scale.set(1.8, 1.8, 1.8);
      }
    });
  }

  triggerAversionSpike() {
    // Flash PPL1 confusion neurons red
    this.neurons.forEach(n => {
      if (n.cluster === 'PPL1') {
        n.mesh.material.emissiveIntensity = 3.0;
        n.mesh.scale.set(1.8, 1.8, 1.8);
      }
    });
  }

  update(dt, isSpeaking, isListening, languageEngine) {
    this.animTime += dt;

    // Gentle slow connectome rotation
    this.group.rotation.y += dt * 0.15;

    // Pulse neurons
    const dopamine = languageEngine ? languageEngine.pamDopamine : 40;
    const isHighDopamine = dopamine > 60;

    this.neurons.forEach(n => {
      // Natural decay of flash surges
      if (n.mesh.scale.x > 1.0) {
        n.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), dt * 4.0);
      }

      if (n.cluster === 'PAM') {
        const pamIntensity = (dopamine / 100.0) * 1.8 + Math.sin(this.animTime * 6.0) * 0.3;
        n.mesh.material.emissiveIntensity = THREE.MathUtils.lerp(n.mesh.material.emissiveIntensity, pamIntensity, dt * 5);
      } else if (n.cluster === 'ALN' && isListening) {
        n.mesh.material.emissiveIntensity = 2.0 + Math.sin(this.animTime * 30.0) * 0.8;
      } else if ((n.cluster === 'MB_CALYX' || n.cluster === 'CX') && isSpeaking) {
        n.mesh.material.emissiveIntensity = 2.2 + Math.sin(this.animTime * 20.0 + n.pulsePhase) * 0.6;
      } else {
        n.mesh.material.emissiveIntensity = 0.5 + Math.sin(this.animTime * 3.0 + n.pulsePhase) * 0.2;
      }
    });

    // Update Kenyon Cell 2,000 Sparse Point Cloud Activity
    if (this.kcPoints && languageEngine && languageEngine.mb) {
      const kcAct = languageEngine.mb.kcActivity;
      const colors = this.kcPoints.geometry.attributes.color.array;

      for (let i = 0; i < this.numKCs; i++) {
        const act = kcAct[i];
        if (act > 0) {
          // Sparse Active Kenyon Cell firing!
          colors[i * 3] = isHighDopamine ? 0.2 : 0.2;
          colors[i * 3 + 1] = isHighDopamine ? 0.95 : 0.85;
          colors[i * 3 + 2] = isHighDopamine ? 0.35 : 1.0;
        } else {
          // Resting baseline Kenyon Cell
          colors[i * 3] = THREE.MathUtils.lerp(colors[i * 3], 0.35, dt * 2.0);
          colors[i * 3 + 1] = THREE.MathUtils.lerp(colors[i * 3 + 1], 0.18, dt * 2.0);
          colors[i * 3 + 2] = THREE.MathUtils.lerp(colors[i * 3 + 2], 0.65, dt * 2.0);
        }
      }
      this.kcPoints.geometry.attributes.color.needsUpdate = true;
    }

    // Advance Action Potential particles along synaptic tracts
    this.particles.forEach(p => {
      p.t += dt * p.speed * (isSpeaking || isListening ? 2.5 : 1.0);
      if (p.t > 1.0) {
        p.t = 0.0;
        p.synapse = this.synapses[Math.floor(Math.random() * this.synapses.length)];
      }

      if (p.synapse) {
        p.mesh.position.lerpVectors(p.synapse.nA.mesh.position, p.synapse.nB.mesh.position, p.t);
        if (p.synapse.type === 'DOPAMINE' && isHighDopamine) {
          p.mesh.material.color.setHex(0x30d158);
        } else if (isSpeaking) {
          p.mesh.material.color.setHex(0x64d2ff);
        } else {
          p.mesh.material.color.setHex(0xffffff);
        }
      }
    });
  }
}
