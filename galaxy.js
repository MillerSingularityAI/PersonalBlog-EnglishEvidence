/* ═══════════════════════════════════════════════════════════
   GALAXY ANIMATION (THREE.JS)
   ═══════════════════════════════════════════════════════════ */

function initGalaxy() {
  const container = document.getElementById('heroAvatar');
  if (!container) return;

  // Clear any existing content
  container.innerHTML = '';

  // Setup Canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // Ensure we keep the circular constraint tightly around it
  canvas.style.borderRadius = '50%';
  container.appendChild(canvas);

  // Scene
  const scene = new THREE.Scene();

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  const width = container.clientWidth || 108;
  const height = container.clientHeight || 108;
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Camera - positioning high up to see the spiral shape
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 3, 4);
  camera.lookAt(0, 0, 0);

  let geometry = null;
  let material = null;
  let points = null;

  function getCSSVar(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  const generateGalaxy = () => {
    // Destroy old galaxy before generating a new one
    if (points !== null) {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    }

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    
    // Fallback colors if CSS vars aren't read properly
    const colorStr1 = getCSSVar('--accent') || (isLight ? '#005fcc' : '#00f5ff');
    const colorStr2 = getCSSVar('--accent2') || (isLight ? '#7700bb' : '#b400ff');

    const parameters = {
      count: 6000,
      size: isLight ? 0.035 : 0.025, // slightly larger particles in light mode
      radius: 3.5,
      branches: 3,
      spin: 1.5,
      randomness: 0.35,
      randomnessPower: 3,
      insideColor: colorStr1,
      outsideColor: colorStr2
    };

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // Calculate base angle for the branches and the spin factor
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      // Add clustering (more particles near the center/curve)
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color interpolation from center to outside
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      // Additive blending looks good on dark, but we need Normal mode on light background
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      opacity: isLight ? 0.9 : 0.8
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
  };

  // Give a small delay initially so CSS variables are correctly parsed if the browser hasn't yet
  setTimeout(generateGalaxy, 50);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth || 108;
    const h = container.clientHeight || 108;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  });

  // Theme observer
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      // Rebuild galaxy with updated CSS variables
      setTimeout(generateGalaxy, 50);
    });
  }

  // Render loop
  const clock = new THREE.Clock();
  
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    if (points) {
      points.rotation.y = elapsedTime * 0.5; // faster orbit rotation
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
}

// Load checking
if (typeof THREE !== 'undefined') {
  initGalaxy();
} else {
  let intervalCount = 0;
  const interval = setInterval(() => {
    if (typeof THREE !== 'undefined') {
      clearInterval(interval);
      initGalaxy();
    }
    if (++intervalCount > 50) clearInterval(interval); // give up after 5s
  }, 100);
}
