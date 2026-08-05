/* ============================================
   main.js
   ============================================ */

/* ── Footer year ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============================================
   SCROLL FADE-IN
   ============================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ============================================
   HERO MAP CANVAS
   Shenzhen (left) ←→ Philadelphia (right)
   ============================================ */
(function initMapCanvas() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const C = {
    grid:      'rgba(92,39,254,0.18)',
    major:     'rgba(92,39,254,0.45)',
    minor:     'rgba(92,39,254,0.22)',
    arterial:  'rgba(255,101,0,0.55)',
    water:     'rgba(0,180,216,0.28)',
    waterStr:  'rgba(0,180,216,0.7)',
    park:      'rgba(0,212,106,0.18)',
    parkStr:   'rgba(0,212,106,0.5)',
    label:     'rgba(92,39,254,0.6)',
    labelSZ:   'rgba(255,101,0,0.6)',
    dot:       'rgba(92,39,254,1)',
    dotRing:   'rgba(92,39,254,0.3)',
    scan:      'rgba(92,39,254,0.06)',
    contour:   'rgba(92,39,254,0.08)',
    block:     'rgba(92,39,254,0.06)',
  };

  function seededRng(seed) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function drawScene(t) {
    ctx.clearRect(0, 0, W, H);

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       LEFT HALF — SHENZHEN
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W * 0.56, H);
    ctx.clip();

    const rngSZ = seededRng(88);

    /* Shenzhen dense irregular grid (slightly skewed) */
    const szGX = 30, szGY = 26;
    ctx.lineWidth = 0.65;
    for (let x = 0; x < W * 0.56; x += szGX) {
      ctx.strokeStyle = `rgba(92,39,254,${0.18 + rngSZ() * 0.12})`;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(x, H * 0.1);
      ctx.lineTo(x + (rngSZ() - 0.5) * 10, H * 0.9);
      ctx.stroke();
    }
    for (let y = H * 0.1; y < H * 0.9; y += szGY) {
      ctx.strokeStyle = `rgba(92,39,254,${0.15 + rngSZ() * 0.1})`;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W * 0.52 + (rngSZ() - 0.5) * 12, y + (rngSZ() - 0.5) * 8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    /* Shenzhen ring roads (inner/outer ring characteristic of SZ) */
    const szCX = W * 0.24, szCY = H * 0.42;
    [[65, 0.28], [115, 0.22], [170, 0.18]].forEach(([r, alpha]) => {
      ctx.strokeStyle = `rgba(255,101,0,${alpha})`;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(szCX, szCY, r, Math.PI * 0.55, Math.PI * 2.45);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    /* Shennan Boulevard — main east-west arterial */
    ctx.strokeStyle = 'rgba(255,101,0,0.52)';
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.5);
    ctx.bezierCurveTo(W * 0.08, H * 0.49, W * 0.22, H * 0.47, W * 0.44, H * 0.50);
    ctx.stroke();

    /* North-south spine */
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(W * 0.20, H * 0.05);
    ctx.bezierCurveTo(W * 0.22, H * 0.3, W * 0.24, H * 0.55, W * 0.22, H * 0.72);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* Shenzhen Bay water body (bottom-left) */
    ctx.fillStyle = 'rgba(0,180,216,0.14)';
    ctx.strokeStyle = 'rgba(0,180,216,0.55)';
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.74);
    ctx.bezierCurveTo(W * 0.05, H * 0.70, W * 0.14, H * 0.68, W * 0.25, H * 0.72);
    ctx.bezierCurveTo(W * 0.33, H * 0.75, W * 0.37, H * 0.84, W * 0.32, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    /* Building blocks SZ */
    const rngSZ2 = seededRng(77);
    for (let bx = szGX; bx < W * 0.52; bx += szGX) {
      for (let by = H * 0.12; by < H * 0.68; by += szGY) {
        if (rngSZ2() > 0.42) {
          ctx.fillStyle = 'rgba(92,39,254,0.055)';
          ctx.fillRect(bx + rngSZ2() * 8, by + rngSZ2() * 6,
            12 + rngSZ2() * 14, 8 + rngSZ2() * 10);
        }
      }
    }

    /* SZ animated POIs (no labels) */
    const szPois = [
      { x: W * 0.12, y: H * 0.38 },
      { x: W * 0.26, y: H * 0.52 },
      { x: W * 0.38, y: H * 0.30 },
    ];
    szPois.forEach((p, i) => {
      const pulse = Math.sin(t * 0.0015 + i * 1.8 + 10) * 0.5 + 0.5;
      const ringR = 8 + pulse * 7;
      ctx.strokeStyle = 'rgba(255,101,0,0.35)';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = (1 - pulse) * 0.85;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,101,0,0.9)';
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.restore();

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RIGHT HALF — PHILADELPHIA
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    ctx.save();
    ctx.beginPath();
    ctx.rect(W * 0.44, 0, W * 0.56, H);
    ctx.clip();

    const rng = seededRng(99);

    /* Building blocks (city texture) */
    const gx = 64, gy = 56;
    for (let bx = gx; bx < W; bx += gx) {
      for (let by = gy; by < H - gy; by += gy) {
        if (rng() > 0.45) {
          ctx.fillStyle = C.block;
          ctx.fillRect(bx + rng() * 20, by + rng() * 16,
            18 + rng() * 22, 12 + rng() * 16);
        }
      }
    }

    /* Major orthogonal grid */
    ctx.lineWidth = 1.6;
    for (let x = W * 0.46; x < W; x += gx) {
      ctx.strokeStyle = C.major;
      ctx.globalAlpha = 0.4 + rng() * 0.6;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 8; y < H; y += gy) {
      ctx.strokeStyle = C.major;
      ctx.globalAlpha = 0.4 + rng() * 0.6;
      ctx.beginPath(); ctx.moveTo(W * 0.44, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* Minor streets */
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = C.minor;
    ctx.globalAlpha = 1;
    for (let x = W * 0.44 + gx / 2; x < W; x += gx) {
      if (rng() > 0.3) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
    }
    for (let y = 8 + gy / 2; y < H; y += gy) {
      if (rng() > 0.3) {
        ctx.beginPath(); ctx.moveTo(W * 0.44, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    /* Delaware River (right edge) */
    ctx.fillStyle   = C.water;
    ctx.strokeStyle = C.waterStr;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.92, 0);
    ctx.bezierCurveTo(W * 0.95, H * 0.22, W * 0.97, H * 0.5, W * 0.96, H);
    ctx.lineTo(W, H); ctx.lineTo(W, 0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    /* Schuylkill River stripe */
    ctx.strokeStyle = C.waterStr;
    ctx.lineWidth   = 5;
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.moveTo(W * 0.62, 0);
    ctx.bezierCurveTo(W * 0.60, H * 0.28, W * 0.58, H * 0.55, W * 0.62, H * 0.8);
    ctx.bezierCurveTo(W * 0.64, H * 0.92, W * 0.66, H * 0.97, W * 0.68, H);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* Fairmount Park */
    ctx.fillStyle   = C.park;
    ctx.strokeStyle = C.parkStr;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(W * 0.55, H * 0.08, 65, 42, 3);
    ctx.fill(); ctx.stroke();

    /* Arterial diagonal (Broad St / diagonal) */
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = C.arterial;
    ctx.lineWidth   = 2.2;
    ctx.beginPath();
    ctx.moveTo(W * 0.72, 0);
    ctx.bezierCurveTo(W * 0.73, H * 0.35, W * 0.74, H * 0.6, W * 0.74, H);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* Contour/topography lines */
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = C.contour;
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.ellipse(W * 0.74, H * 0.38, 44 + i * 30, 30 + i * 20, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Philly animated POIs (no labels) */
    const pois = [
      { x: W * 0.52, y: H * 0.36 },
      { x: W * 0.70, y: H * 0.56 },
      { x: W * 0.60, y: H * 0.20 },
      { x: W * 0.76, y: H * 0.42 },
    ];
    pois.forEach((p, i) => {
      const pulse = Math.sin(t * 0.0015 + i * 1.3) * 0.5 + 0.5;
      const ringR = 9 + pulse * 8;
      ctx.strokeStyle = C.dotRing;
      ctx.lineWidth   = 1.2;
      ctx.globalAlpha = (1 - pulse) * 0.9;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle   = C.dot; ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle   = '#fff'; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.restore();

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       CENTER GRADIENT BLEND
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const blendGrad = ctx.createLinearGradient(W * 0.40, 0, W * 0.60, 0);
    blendGrad.addColorStop(0,   'rgba(255,244,232,0)');
    blendGrad.addColorStop(0.3, 'rgba(255,244,232,0.38)');
    blendGrad.addColorStop(0.7, 'rgba(255,244,232,0.38)');
    blendGrad.addColorStop(1,   'rgba(255,244,232,0)');
    ctx.fillStyle = blendGrad;
    ctx.fillRect(W * 0.40, 0, W * 0.20, H);

    /* Center divider tick */
    ctx.strokeStyle = 'rgba(160,92,40,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(W * 0.50, H * 0.05);
    ctx.lineTo(W * 0.50, H * 0.95);
    ctx.stroke();
    ctx.setLineDash([]);

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ANIMATED SCAN LINE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const scanY = ((t * 0.022) % (H + 80)) - 40;
    const sg    = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
    sg.addColorStop(0,   'rgba(92,39,254,0)');
    sg.addColorStop(0.5, 'rgba(92,39,254,0.06)');
    sg.addColorStop(1,   'rgba(92,39,254,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 35, W, 70);

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       NORTH ARROW (no text labels)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const nx = W - 30, ny = H - 56;
    ctx.beginPath();
    ctx.moveTo(nx, ny); ctx.lineTo(nx - 4.5, ny + 13);
    ctx.lineTo(nx, ny + 9); ctx.lineTo(nx + 4.5, ny + 13);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(92,39,254,0.85)';
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    drawScene(t);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(loop);
})();

/* ============================================
   PROJECT CATEGORY FILTER
   ============================================ */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cats = (card.dataset.category || '').split(' ');
      const match = filter === 'all' || cats.includes(filter);
        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeUp 0.4s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ============================================
   PROJECT HOVER — BACKGROUND MAP
   ============================================ */
(function initProjectHoverMap() {
  const bgCanvas = document.getElementById('projects-map-canvas');
  if (!bgCanvas) return;
  const ctx = bgCanvas.getContext('2d');
  let W, H;

  function resize() {
    const section = bgCanvas.parentElement;
    const nw = section.offsetWidth;
    const nh = section.offsetHeight;
    if (nw === W && nh === H) return;
    W = nw; H = nh;
    bgCanvas.width  = W * devicePixelRatio;
    bgCanvas.height = H * devicePixelRatio;
    bgCanvas.style.width  = W + 'px';
    bgCanvas.style.height = H + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  /* ── Simplified boundary point sets (normalized 0–1 coords) ── */
  const BOUNDS = {
    philadelphia: [
      [0.30,0.04],[0.54,0.02],[0.74,0.08],[0.88,0.20],
      [0.91,0.42],[0.87,0.65],[0.80,0.84],[0.62,0.96],
      [0.38,0.96],[0.20,0.86],[0.10,0.68],[0.09,0.42],
      [0.16,0.20],[0.30,0.04],
    ],
    yunnan: [
      [0.42,0.03],[0.62,0.04],[0.78,0.10],[0.90,0.20],
      [0.94,0.34],[0.88,0.48],[0.82,0.60],[0.74,0.74],
      [0.62,0.88],[0.46,0.95],[0.30,0.90],[0.14,0.76],
      [0.07,0.60],[0.08,0.42],[0.15,0.26],[0.28,0.10],
      [0.42,0.03],
    ],
    // Beijing municipality — roughly boot-shaped, mountains to north/west
    beijing: [
      [0.32,0.05],[0.55,0.03],[0.76,0.08],[0.90,0.20],
      [0.93,0.38],[0.88,0.56],[0.78,0.72],[0.60,0.88],
      [0.40,0.92],[0.22,0.82],[0.10,0.64],[0.07,0.42],
      [0.12,0.22],[0.24,0.09],[0.32,0.05],
    ],
  };

  /* ── Single-location: giant watermark text only ── */
  function drawBoundary(label, [ri, gi, bi]) {
    ctx.clearRect(0, 0, W, H);
    ctx.font = `900 200px 'Cabinet Grotesk', sans-serif`;
    const fsize = Math.floor(200 * (W * 1.3) / ctx.measureText(label).width);
    ctx.font = `900 ${fsize}px 'Cabinet Grotesk', sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(${ri},${gi},${bi},0.18)`;
    ctx.fillText(label, W / 2, H / 2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  /* ── Dual-location: two watermark texts stacked top / bottom ── */
  function drawDualBoundary(labelL, colorL, labelR, colorR) {
    ctx.clearRect(0, 0, W, H);

    function drawLine(label, [ri, gi, bi], cy) {
      ctx.font = `900 200px 'Cabinet Grotesk', sans-serif`;
      const fsize = Math.floor(200 * (W * 1.3) / ctx.measureText(label).width);
      ctx.font = `900 ${fsize}px 'Cabinet Grotesk', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(${ri},${gi},${bi},0.18)`;
      ctx.fillText(label, W / 2, cy);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }

    drawLine(labelL, colorL, H * 0.32);
    drawLine(labelR, colorR, H * 0.68);
  }

  /* ── Map drawers wired to each project ── */
  const mapDrawers = {
    'philly-roads':   () => drawBoundary('PHILADELPHIA', [ 92,  39, 254]),
    'philly-blocks':  () => drawBoundary('PHILADELPHIA', [ 92,  39, 254]),
    'philly-transit': () => drawBoundary('PHILADELPHIA', [  0, 180, 216]),
    'philly-parcels': () => drawBoundary('PHILADELPHIA', [255, 101,   0]),
    'yunnan':         () => drawBoundary('YUNNAN',       [  0, 180, 100]),
    'satellite':      () => drawDualBoundary(
                              'BEIJING', [ 92,  39, 254],
                              'YUNNAN',  [  0, 180, 100]),
    'shenzhen-uav':   () => drawBoundary('SHENZHEN',    [255, 101,   0]),
    'podcast':        () => drawBoundary('PHILADELPHIA', [  0, 180, 216]),
  };

  /* ── Attach hover listeners ── */
  let hideTimer = null;

  document.querySelectorAll('.project-card[data-map-type]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);
      const type = card.dataset.mapType;
      const drawer = mapDrawers[type];
      if (!drawer) return;
      resize();
      drawer();
      bgCanvas.classList.add('visible');
    });

    card.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => {
        bgCanvas.classList.remove('visible');
      }, 200);
    });
  });

  window.addEventListener('resize', () => {
    if (bgCanvas.classList.contains('visible')) resize();
  });
})();

/* ============================================
   PROJECT MODAL
   ============================================ */
const projectData = {
  'road-safety': {
    type: 'MUSA Practicum · Jan–May 2026',
    title: 'Off-Peak Roadway Safety Analysis',
    description: 'Congestion may cause fender benders, but excess road capacity may be causing catastrophic crashes. Built for Philadelphia\'s OTIS Office of Multimodal Planning, this practicum models the percentage of vehicles exceeding the speed limit as a continuous proxy for KSI (killed or serious injury) risk using a Random Forest, then wraps the predictions in a JavaScript scenario tool that lets planners simulate the safety effect of street-level interventions on unobserved segments.',
    highlights: [
      'End-to-end GIS data pipeline: integrated roadway geometry, speed sensor records, crash history, road-design attributes, transit network layers, and Google Earth imagery into a standardized street-segment dataset covering 9,049 segment-period observations for citywide analysis.',
      'Dependent variable selection: raw crash counts are stochastic and difficult to forecast reliably at the segment level; the percentage of vehicles exceeding the speed limit is a continuous, well-distributed outcome strongly correlated with KSI risk and more amenable to predictive modeling.',
      'Random Forest via tidymodels with spatial cross-validation: captures non-linear and interaction effects (e.g. a wide road at 2am behaves differently than at 8am) without requiring those interactions to be specified in advance. Handles the full mix of continuous, categorical, and binary predictors across five feature groups — spatiotemporal dynamics, roadway geometry, built environment, enforcement controls, and safety baseline.',
      'Scenario tool: 24 roadway-intervention scenarios across four daily time periods translated into corridor maps and an interactive JavaScript dashboard, enabling OTIS planners to compare speeding-risk profiles and explore road-diet, bike-lane, and traffic-calming strategies on unobserved segments.'
    ],
    takeaway: 'The most consequential methodological choice was picking the right dependent variable. Crash counts looked like the obvious target, but their sparsity and randomness made them nearly unforecastable at the segment level. Switching to the percentage of vehicles exceeding the speed limit gave the model a continuous, stable signal to learn from, and a metric planners could actually act on.',
    stack: ['R', 'Random Forest', 'tidymodels', 'sf', 'OSM', 'JavaScript', 'Philadelphia OTIS'],
    github: 'https://github.com/upenn/otis_off_peak_roadway_safety',
    links: [
      { label: 'Final Report',   url: 'https://chihyunkim.github.io/otis_off_peak_roadway_safety/PROJECT_WRITEUP.html' },
      { label: 'Web App',        url: 'https://chihyunkim.github.io/otis_off_peak_roadway_safety/landing.html' },
      { label: 'Progress Deck',  url: 'https://drive.google.com/file/d/1RXxkJQnALEV9FeCRBkmLIBc5X1Oqe_zI/view?usp=drive_link' },
    ]
  },
  'housing-price': {
    type: 'Predictive Modeling · Oct 2025',
    title: 'Philadelphia Housing Sale Price Model',
    description: 'A regression model predicting 2023–2024 Philadelphia residential sale prices (R² = 0.84, RMSE $124K) using OPA parcel records, census demographics, and spatial amenity features. Two key methodological choices set this model apart: imputing non-market transactions rather than discarding them, and treating missingness itself as a predictive signal.',
    highlights: [
      'Imputing non-market prices via OLS: after removing outliers (intra-family transfers, near-zero sales), sale price and OPA assessed market value show a strong linear relationship among arm\'s-length transactions. A simple OLS model trained on clean data was used to predict a fair-market <code>sale_price_predicted</code> for each non-market record, converting otherwise unusable observations into valid training data.',
      'Turning missing values into a feature: rather than dropping rows with missing <code>central_air</code> data, a dummy variable <code>central_air_missing</code> was created (1 = missing, 0 = present). This lets the model capture whether missingness itself is systematically associated with price, without losing any observations.',
      'Top predictors: living area (0.74 price elasticity), zip code, central air (45.8% premium), and interior condition; spatial features include K-NN hospital distance and buffer-based crime density.',
      'Spatial residual mapping reveals systematic under-prediction in low-income neighborhoods, surfacing where assessed values diverge most from market reality.'
    ],
    takeaway: '<p>When facing large-scale outliers, deletion is not the only solution, and often not the best one either. Rather than simply filtering out "noisy" data, we can use logical inference to extract its latent value: a linear relationship found among clean transactions becomes the imputation engine that rescues the rest.</p><p>Complexity doesn\'t always equal quality. Even a foundational OLS regression can achieve high precision and deep interpretability through meticulous variable treatment: log transformations for skewed prices, squared terms for non-linear house age effects, and spatial weighting for geographic correlation.</p><p>What if we had simply deleted that 25% of non-market data (typically concentrated in low-income neighborhoods and family transfers)? The model would develop severe systemic bias, losing its grasp on the low-end housing market and causing the algorithm to fail precisely where it\'s needed most. Vulnerable populations would become invisible in data-driven policy and valuation.</p>',
    stack: ['R', 'OLS', 'Weighted Regression', 'Spatial Features', 'sf'],
    github: 'https://github.com/MUSA-5080-Fall-2025/portfolio-setup-demiyang12/tree/main/midterm',
    links: [
      { label: 'View Analysis',       url: 'https://demiyang12.github.io/Public-Policy-Analytics-Portfolio/midterm/appendix/Yuqing_Yang_appendix.html' },
      { label: 'Presentation Slides', url: 'https://demiyang12.github.io/Public-Policy-Analytics-Portfolio/midterm/slides/Yuqing_Yang_Presentation.html#/title-slide' },
    ]
  },
  'yunnan-odyssey': {
    type: 'Web Application · Aug–Dec 2025',
    title: 'Yunnan Odyssey — Travel Planning App',
    description: 'A multi-page travel planning app built in vanilla JavaScript. Three linked views share state through localStorage and Firebase: a Leaflet storymap with procedurally generated fractal paths along the Tea Horse Road; a GeoJSON-driven exploration dashboard with month-based seasonal filtering, category search, and Yunstagram (a Firestore-backed social feed that anchors every post to a specific POI); and an itinerary planner with SortableJS drag-and-drop ordering, real-time budget tracking, Chart.js elevation profiles, and turn-by-turn routes via the Mapbox Directions API.',
    highlights: [
      'Step 1: Inspiration. A Tea Horse Road storymap using Leaflet with fractal path generation to set the narrative tone and introduce key destinations.',
      'Step 2: Intelligence. An exploration dashboard with month-based seasonal highlighting, climate charts, category filters, and Yunstagram, a location-pinned social feed (Firebase) where every post belongs to a specific POI.',
      'Step 3: Action. A day-by-day itinerary planner with wishlist-driven POI selection, elevation profiles, budget tracking, and auto-generated per-day routes via Mapbox Directions API.',
      'POI dataset sourced from OpenStreetMap; Firebase Firestore powers wishlist sync and social post interactions (likes, comments, image upload).'
    ],
    takeaway: 'Designing Yunstagram, with every social post geographically anchored to a specific place, made me think hard about the relationship between emotional storytelling and spatial data. A place isn\'t just coordinates; it\'s the accumulation of experiences people associate with it.',
    stack: ['JavaScript', 'Leaflet', 'Mapbox API', 'Firebase', 'Chart.js', 'SortableJS'],
    github: 'https://github.com/demiyang12/JavaScript-Final-Project',
    links: [
      { label: 'Live App', url: 'https://demiyang12.github.io/JavaScript-Final-Project/' },
    ]
  },
  'transit-policy': {
    type: 'Policy Analytics · Aug–Dec 2025',
    title: 'Transportation Planning: Policy Analysis & Studio Project',
    description: 'This work spans two complementary strands: a series of evidence-based policy memos addressing systemic failures in how American cities measure and manage transportation, and a studio project developing a comprehensive multimodal transportation plan for a real planning context. Together they demonstrate both analytical rigor and the ability to translate research into actionable planning recommendations.',
    highlights: [
      '— PART I: Policy Analytics Suite —',
      'Four policy memos written for real planning audiences, each tackling a distinct failure mode in transportation planning. The through-line: conventional metrics like ITE trip generation rates and LOS grades are not neutral technical tools — they embed car-centric assumptions that distort planning decisions.',
      'ITE Trip Generation critique (Upper Darby, PA): ITE rates derived from isolated suburban sites overestimate vehicle trips by 25%+ in transit-rich urban contexts, feeding a "predict and provide" cycle that forces excess parking and road widening. Proposed alternatives include smart-growth regression adjustments and VMT/mode-share reporting in place of LOS grades.',
      'Transit job accessibility framework (Camden, NJ): designed a Segmented Cumulative Opportunity measure counting low-to-moderate wage jobs reachable within a 45-minute transit threshold, using GTFS isochrones and reverse-isochrone analysis.',
      'Post-COVID traffic safety memo (PennDOT): Pennsylvania recorded 1,230 roadway deaths in 2021. Proposed four pillars: automated speed enforcement, Complete Streets re-engineering, replacing LOS with safety metrics, and LBS/LEHD-based predictive risk modeling.',
      'License-plate restriction analysis (Philadelphia): recommended against the proposed ban. Evidence from Mexico City\'s Hoy No Circula shows households buy older secondary vehicles, increasing emissions and VMT. Recommended congestion pricing and transit investment instead.',
      '— PART II: Transportation Studio Project —',
      'A comprehensive multimodal transportation plan developed as a studio project, combining land use analysis, network design, and equity evaluation. The project culminated in a full planning report and a public presentation pitch, demonstrating how analytical findings translate into a coherent, stakeholder-ready planning proposal.'
    ],
    takeaway: 'The through-line across both strands is that technical standards are not politically neutral. ITE rates, LOS grades, and license-plate bans all appear objective but embed choices about whose time and mobility get prioritized. And translating that critique into a real planning proposal — one that must be presented and defended — closes the loop between analysis and action.',
    stack: ['R', 'GTFS', 'Isochrone Analysis', 'Policy Memo', 'Equity Analysis', 'Studio Planning'],
    github: 'https://github.com/demiyang12/Introduction-to-Transportation-Planning',
    links: [
      { label: 'Policy Analysis Report', url: 'https://drive.google.com/file/d/16WAZ61vm6j9rePrbghKaL7owvWjdC5LE/view?usp=drive_link' },
      { label: 'Studio Project Deck',    url: 'https://drive.google.com/file/d/11aNNh2XbjLn3kf12n6GbtT20WLDCipWv/view?usp=drive_link' },
    ]
  },
  'cloud-removal': {
    type: 'Remote Sensing Research · Apr–May 2026',
    title: 'Evaluating Generative Models for Cloud Removal in Satellite Imagery',
    description: 'Optical remote sensing in southern China is severely limited by persistent cloud cover—annual cloud frequency exceeds 80% in some areas, creating "data islands" that make time-series monitoring of crop growth, illegal logging, and disaster response impossible. This project (MUSA 650, with Chuan Zou and Christine Cui) benchmarks three approaches for reconstructing cloud-obscured Sentinel-2 imagery: a multi-temporal compositing baseline, a GAN-based model, and a diffusion-based inpainting model. Rather than asking whether complete images can be generated, the study focuses on performance boundaries—quantifying how reconstruction reliability decays as cloud coverage rises from 5% to 70%, and identifying the thresholds at which each method begins to produce physically implausible results.',
    highlights: [
      'Dataset: 2,000 cloud-free Sentinel-2 images (10m resolution) from low-cloud northern China (Beijing area) used as ground truth, with synthetic cloud masks applied at five coverage levels: 5%, 10%, 30%, 50%, and 70%.',
      'Baseline: multi-temporal compositing—reconstructing missing pixels by selecting cloud-free observations across time, without any deep learning. Effective when cloud-free frames exist, but fails under persistent cover.',
      'Model A (GAN): learns a conditional mapping from cloudy to cloud-free images using a generator–discriminator adversarial framework, capturing spatial texture features (farmland geometry, urban grid, vegetation continuity).',
      'Model B (Diffusion): DDPM-based inpainting with mask-guided sampling (RePaint, Lugmayr et al. 2022), progressively reconstructing occluded regions conditioned on visible context—better leveraging spatial dependencies under heavy cloud cover.',
      'Evaluation: PSNR and SSIM for pixel-level accuracy and structural similarity; NDVI error as a domain-specific metric for vegetation area reliability. Results plotted as cloud coverage–error curves to reveal each method\'s performance degradation profile.',
      'Key failure modes examined: hallucination under high coverage (visually plausible but physically inconsistent outputs) and inability to predict post-sudden-event states such as flooding.'
    ],
    takeaway: 'The core insight is that generative models for cloud removal should not be judged on whether they produce realistic-looking images—they almost always do. The harder question is at what cloud coverage threshold the model begins hallucinating: synthesizing structure that never existed on the ground. Making that boundary legible is what makes a model safe to use in decisions about crop subsidies or disaster response.',
    stack: ['Python', 'PyTorch', 'Sentinel-2', 'GAN', 'Diffusion Models (DDPM)', 'PSNR / SSIM / NDVI'],
    links: [
      { label: 'View Notebook', url: 'https://github.com/chuanzou/Geo-Evaluate/blob/main/assignments/final_project.ipynb' },
    ]
  },
  'property-tax': {
    type: 'Cloud Infrastructure · Apr–May 2026',
    title: 'Philadelphia CAMA Pipeline',
    description: 'A cloud-native Computer-Assisted Mass Appraisal (CAMA) system for Philadelphia, built as a multi-team class project at Weitzman MUSA. The pipeline ingests public parcel and assessment data from OpenDataPhilly, runs a predictive valuation model, and serves outputs to an interactive assessment review dashboard, all orchestrated on Google Cloud.',
    highlights: [
      'End-to-end data pipeline on Google Cloud: raw data lands in Cloud Storage, passes through extract/prepare/load Cloud Functions into three BigQuery datasets (source, core, derived), and prediction jobs run on Cloud Run. Cloud Workflows ties the stages together; Cloud Scheduler automates recurring runs.',
      'Predictive valuation model trained on Philadelphia Properties and Assessment History records, producing per-parcel assessed value predictions stored as derived BigQuery tables alongside current and historical assessment bins.',
      'Vector map tile generation on Cloud Run feeds an interactive assessment review dashboard, allowing planners to inspect predicted vs. assessed values, flag anomalies, and visualize spatial patterns across neighborhoods.',
      'Standardized naming conventions and IAM service account configuration across multiple teams, enabling parallel development of pipeline components without schema conflicts.'
    ],
    takeaway: 'Building a mass appraisal pipeline taught me that the hardest problems are rarely modeling ones. Getting raw public data into a consistent, queryable schema across multiple contributors took longer than training the model, and the infrastructure decisions made early constrained every downstream choice.',
    stack: ['Python', 'SQL', 'BigQuery', 'Google Cloud', 'Cloud Functions', 'JavaScript'],
    github: 'https://github.com/Weitzman-MUSA-GeoCloud/s26-team4-cama',
    links: [
      { label: 'View Project', url: 'https://weitzman-musa-geocloud.github.io/s26-team4-cama/' },
    ]
  },
  'spatial-quo': {
    type: 'Podcast · Urban Planning Media',
    title: 'The Spatial Quo — Space is Never Neutral',
    description: 'A podcast episode I co-produced and hosted exploring how space is never truly neutral. From shopping malls and public parks to snowy sidewalks, transit data, and the home, we examine how everyday spaces are often designed around a hidden "default user." Through conversations with Christine and Isabelle, the episode asks what it really means to belong in a space — is it enough to be allowed to enter, or does true belonging mean being able to stay, move, rest, and exist without needing to justify yourself?',
    highlights: [
      'Space is never neutral — it is often designed around a "default user." The episode opens by tracing this idea from urban planning theory to the lived experience of navigating everyday spaces.',
      'Demi (00:01:28): malls, parks, and the difference between being welcomed as a consumer and belonging as a person. A space that welcomes women as consumers is not the same as a space that welcomes women as people.',
      'Christine (00:05:57): snow-clearing priorities, sidewalks, and how the "default user" appears in routine urban planning decisions. Trip-chaining, care work, and the data gaps that systematically erase gendered mobility patterns from city design.',
      'Isabelle (00:09:51): the home as another space shaped by hidden assumptions — who gets privacy, who keeps moving, and who has "a room of one\'s own." Domestic space and the unequal distribution of interruption.',
      'Closing reflection (00:14:05): from streets to homes, the episode asks who these spaces were really designed for, and why noticing invisible patterns is the first step toward changing them.',
      'A truly equal public space is not one where women are finally allowed to enter — it is one where they can stay, be alone, take up space, and exist without having to justify that existence.'
    ],
    takeaway: 'Making this episode changed how I walk through cities. I\'d spent years analyzing street networks as graphs and crash data as points — but the podcast forced me to think about the same streets as social spaces: who feels watched, who reroutes to avoid discomfort, who was simply never counted in the trip data. That gap between what the data captures and what the space feels like is exactly where planning needs to do better work.',
    stack: ['Podcast Production', 'Urban Space', 'Gender & Planning', 'Public Space', 'Transit Data'],
    links: [
      { label: 'Listen to Episode', url: 'assets/podcast.mp3' },
    ]
  },
  'wupen-uav': {
    type: 'Urban Sustainability Research · Sept 2023 – Aug 2024',
    title: 'UAV Last-Mile Delivery: Take-Off & Landing Suitability Analysis',
    description: 'A spatial suitability study evaluating candidate locations for UAV take-off and landing points in Shenzhen\'s real-time delivery network, conducted at Shenzhen University in collaboration with Meituan Academy of Robotics. The project built a multi-criteria weighted overlay model to identify optimal UAV hub locations that balance delivery efficiency, airspace safety, and urban land-use constraints — and evaluated the sustainability implications for urban mobility. Received a Nomination Award at the 2024 WUPENiCity International Competition on Urban Sustainability Reports.',
    highlights: [
      'Multi-criteria suitability evaluation: constructed a weighted overlay model combining land-use compatibility (zoning and FAR constraints), pedestrian density, building-height obstruction buffers, commercial POI proximity, and Civil Aviation Administration airspace regulation zones to produce a continuous per-hex suitability score across the study area.',
      'Collaboration with Meituan Academy of Robotics: real delivery demand data and operational flight-path constraints from Meituan\'s drone delivery program informed the service-radius parameters, weight limits, and no-fly zone assumptions used throughout the analysis.',
      'Urban sustainability framing: evaluated UAV delivery\'s potential to reduce vehicle-miles traveled and last-mile carbon emissions in dense urban areas; assessed equity implications of service-area coverage relative to commercial district and residential population distribution.',
      'Recognized at the 2024 WUPENiCity International Competition on Urban Sustainability Reports — a global competition co-organized by WUPENiCity evaluating urban sustainability research — with a Nomination Award for the study\'s methodological rigor and policy relevance.'
    ],
    takeaway: 'The hardest constraint wasn\'t the algorithm — it was reconciling data from completely different domains: airspace regulations, retail delivery demand, residential density, and building geometry. Each layer came with its own spatial resolution, temporal coverage, and institutional owner. Getting them to speak the same language before any analysis could begin was the real work.',
    stack: ['ArcGIS Pro', 'Spatial Suitability Modeling', 'Multi-Criteria Evaluation', 'Weighted Overlay', 'Urban Sustainability'],
    links: [
      { label: 'View Competition Entry', url: 'http://wupen.org/competitions/115?type=work&entry=17362' },
    ]
  },

  'rural-planning': {
    type: 'Rural Planning & Design · Aug 2023 – Jan 2024',
    title: 'Skills to the Field — Learning Village Design',
    description: 'A comprehensive rural planning and design project for Xiaohaochong Village, an industrial-edge settlement in the Pearl River Delta. Facing demographic hollowing, weakened local industries, and eroding cultural identity, the project proposes transforming the village into a "Learning Village" — a place that uses vocational and craft education as the engine of rural revitalization. The framework operates across four systems: talent attraction and cultivation, cultural programming, industrial integration, and community governance.',
    highlights: [
      'Diagnosis: Gongbian sits at the seam between factory zones and farmland, creating a dual-identity settlement where transient industrial workers and aging residents coexist without shared economic or social infrastructure.',
      'Core concept: "Skills to the Field, Craft to a Livelihood" — the village becomes a hub where proximity to light industry is reframed as an asset, channeling industrial know-how back into craft-based, locally owned small enterprises.',
      'Four-system framework: Human (talent pipelines from nearby colleges and technical schools), Culture (seasonal festivals, folk-craft workshops, and community memory archives), Production (upgraded agricultural supply chains and maker-space units integrated into existing courtyard fabric), and Governance (a village operations cooperative linking residents, entrepreneurs, and government).',
      'Land use planning: land reclassified to support three distinct zones — ecological buffer, a revitalized residential and commercial core, and a light industrial-craft belt — with a phased seasonal activity calendar calibrated to annual labor flows.',
      'Three key node designs developed at site scale: a civic square and folk-craft exhibition hall, a farmland experience trail with shared facilities, and an industrial technology workshop complex. Each node uses modular spatial units that adapt to the existing building grain.',
      'Received the Excellent Award at the National College Student Rural Planning Scheme Competition (Aug 2023 – Jan 2024), developed in collaboration with Doumen Town Government, Zhuhai.'
    ],
    takeaway: 'Rural revitalization is not about importing urban forms into the countryside. The strongest design moves here worked with what the village already had — its proximity to industry, its seasonal labor rhythms, its courtyard typology — rather than against it.',
    stack: ['ArcGIS', 'AutoCAD', 'SketchUp', 'Rhino', 'InDesign', 'Photoshop', 'Illustrator'],
    links: [
      { label: 'View Full Design Drawings', url: 'assets/rural planning.pdf' }
    ]
  },

  'undergrad-capstone': {
    type: 'Undergraduate Capstone · Urban Design · 2025',
    title: 'Urban–Rural Food Chain & Carbon Circular Renewal — Luohu Border District Urban Design',
    description: 'An urban design proposal for the Luohu port border zone between Shenzhen and Hong Kong, addressing the systemic carbon cost embedded in cross-border food supply chains. The project — argues that the Shenzhen–Hong Kong border is not merely a transit node but a site of structural ecological vulnerability: Hong Kong imports over 90% of its food, while Shenzhen\'s self-sufficiency rate falls below 30%. A single orange travels 18,000 km from Egypt to a Shenzhen supermarket shelf. The design proposes a three-phase, 30-year transformation of the border-adjacent land into a distributed urban–rural production and carbon exchange system.',
    highlights: [
      'Problem framing: cross-border food supply chains generate "hidden pollution" through long-haul cold-chain logistics, while existing border land use prioritizes trade and transit over food security or ecological function.',
      'Three production systems designed in parallel: a fishery and aquaculture circular loop (reclaiming and retrofitting existing fish ponds), an agricultural production and processing belt (field-to-table cold chain compressed within walking distance), and a shared mobility ring connecting all zones without private vehicles.',
      'Carbon exchange mechanism: a community carbon-credit system where residents earn points for low-carbon behavior (green transit, rooftop farming, clothing recycling) and redeem them for facility access and goods — connecting individual action to city-scale carbon accounting.',
      'Phased construction plan: Phase 1 (10 years) — agricultural exhibition hall, fish pond restoration, coarse-processing facilities; Phase 2 (20 years) — shared mobility ring, residential infill; Phase 3 (30 years) — logistics corridor extension and regional carbon trading hub.',
      'Spatial strategy organizes the site along three axes: a riverfront landscape spine, a public-space circulation loop, and an agricultural production gradient from intensive urban farming to open wetland. Key nodes include the Shenzhen–Hong Kong Modern Agriculture Exhibition Hall, a riverside dialogue stage, and a children\'s agri-park.',
      'Awarded Outstanding Graduation Design by Shenzhen University (2025), recognizing the project\'s interdisciplinary ambition — bridging food systems, carbon policy, urban design, and cross-border governance in a single spatial proposal.'
    ],
    takeaway: 'The most interesting design constraint was the border itself — a line that creates two completely different regulatory environments 50 meters apart. Every system we designed had to work across that seam: the carbon credits, the food chain, the shared transport. The border stopped being an obstacle and became the conceptual engine of the project.',
    stack: ['AutoCAD', 'Rhino', 'SketchUp', 'ArcGIS', 'InDesign', 'Photoshop', 'Illustrator'],
    links: [
      { label: 'View Full Design Drawings', url: 'assets/undergrad capstone.pdf' }
    ]
  },

  'data-graphs': {
    type: 'Exploratory Work · 2024–2026',
    title: 'Data Visualization Gallery',
    description: 'Charts, maps, and visual essays made outside of coursework — exploring transit demand, urban commuting, school access, great-circle routes, and climate patterns across Philadelphia, Boston, New York, the UK, and beyond. Each piece treats projection, color, and annotation as arguments, not decoration.',
    highlights: [
      'Philadelphia: Severe Speeding Spikes During Off-Peak Hours — off-peak windows see the highest proportions of vehicles exceeding 16–20+ mph over the speed limit (DVRPC data, 2022–2025)',
      'Bike Share Demand Is Highly Predictable — Philadelphia Indego trip volume 24 hours ago strongly predicts current demand, confirming temporal autocorrelation as a forecasting signal',
      'MBTA Passenger Miles 2015–2024 — pandemic collapse and still-incomplete recovery visualized across heavy rail, light rail, commuter rail, and bus',
      'The Commuting Kingdoms of Philadelphia — census tracts colored by the most common commute mode, revealing drive-alone dominance outside the transit core',
      'School-Access Priority Mapping — child density surfaces (ACS 2022) to identify underserved areas in North and Lower Northeast Philadelphia',
      'North Polar View: Transpolar Routes Become Legible — polar azimuthal projection reveals Arctic shortcuts that disappear on standard maps (North Pole Neumayer Expedition comparison)',
      'Web Mercator: The Same Routes Look Like Northern Detours — great-circle routes HKG–JFK, LHR–NRT, and ORD–FRA shown against the Mercator illusion',
      'UK Bivariate Climate Map — temperature × precipitation encoded as a 3×3 color matrix, exposing the warm-dry southeast vs. cool-wet northwest gradient',
      'New York City: Language and Immigration Demographics — English speakers vs. foreign-born population by census tract, highlighting linguistically diverse corridors'
    ],
    takeaway: 'These pieces share a conviction that how you show data is itself a claim about the world. Projection choice, color encoding, and annotation placement are not neutral.',
    stack: ['R', 'ggplot2', 'sf', 'tmap', 'Python', 'Matplotlib', 'QGIS'],
    links: [],
    gallery: [
      'assets/other graphs/1.png',
      'assets/other graphs/2.png',
      'assets/other graphs/3.png',
      'assets/other graphs/4.png',
      'assets/other graphs/5.png',
      'assets/other graphs/6.png',
      'assets/other graphs/7.png',
      'assets/other graphs/8.png',
      'assets/other graphs/9.png',
    ]
  }
};

/* ── Modal open/close ── */
const modalOverlay = document.getElementById('project-modal');
const modalClose   = document.getElementById('modal-close');

function openModal(id, cardEl) {
  const data = projectData[id];
  if (!data) return;

  const thumbSrc  = cardEl.querySelector('.project-thumb');
  const thumbDest = document.getElementById('modal-thumb');
  thumbDest.innerHTML = '';
  if (thumbSrc) thumbDest.appendChild(thumbSrc.cloneNode(true));

  document.getElementById('modal-type').textContent  = data.type;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-desc').textContent  = data.description;

  /* Wrap HH:MM:SS timestamps as clickable seek buttons */
  function wrapTimestamps(text) {
    return text.replace(/\b(\d{2}:\d{2}:\d{2})\b/g, (ts) => {
      const [h, m, s] = ts.split(':').map(Number);
      const secs = h * 3600 + m * 60 + s;
      return `<button class="ts-btn" onclick="window._seekPodcast(${secs})" title="Jump to ${ts}">${ts}</button>`;
    });
  }

  const hl = document.getElementById('modal-highlights');
  hl.innerHTML = data.highlights.map(h => `<li><span>${wrapTimestamps(h)}</span></li>`).join('');

  document.getElementById('modal-takeaway').innerHTML = data.takeaway;

  const stack = document.getElementById('modal-stack');
  stack.innerHTML = data.stack.map(s => `<span class="tag">${s}</span>`).join('');

  const linksEl = document.getElementById('modal-links');
  linksEl.innerHTML = data.links.map(({ label, url }) => {
    if (url.endsWith('.mp3')) {
      return `
        <div class="modal-podcast-player" id="modal-podcast-player">
          <audio id="modal-audio" src="${url}" preload="none"></audio>
          <button class="podcast-play-btn" id="podcast-play-btn" onclick="window._togglePodcast()">▶ &nbsp;Play Episode</button>
          <input type="range" class="podcast-scrubber" id="podcast-scrubber" value="0" min="0" step="0.5">
        </div>`;
    }
    const isReal = url !== '#';
    return `<a href="${url}" class="btn ${isReal ? 'btn-primary' : 'btn-ghost btn-disabled'}"${isReal ? ' target="_blank" rel="noopener"' : ''} ${isReal ? '' : 'tabindex="-1" aria-disabled="true"'}>${label} →</a>`;
  }).join('');

  /* Wire up podcast scrubber & sync after DOM insertion */
  requestAnimationFrame(() => {
    const audio    = document.getElementById('modal-audio');
    const scrubber = document.getElementById('podcast-scrubber');
    if (!audio || !scrubber) return;
    audio.addEventListener('loadedmetadata', () => { scrubber.max = audio.duration; });
    audio.addEventListener('timeupdate', () => { scrubber.value = audio.currentTime; });
    scrubber.addEventListener('input', () => { audio.currentTime = scrubber.value; });
  });

  /* Gallery images (for data-graphs and similar) */
  const existingGallery = document.getElementById('modal-gallery-section');
  if (existingGallery) existingGallery.remove();

  if (data.gallery && data.gallery.length) {
    const gallerySection = document.createElement('div');
    gallerySection.id = 'modal-gallery-section';
    gallerySection.className = 'modal-gallery-section';
    gallerySection.innerHTML = `
      <div class="modal-gallery-label">All Works (${data.gallery.length})</div>
      <div class="modal-gallery-grid">
        ${data.gallery.map((src, i) => `<img src="${src}" alt="Visualization ${i+1}" loading="lazy" onclick="window._openLightbox('${src}')">`).join('')}
      </div>`;
    document.getElementById('modal-takeaway').insertAdjacentElement('afterend', gallerySection);
  }

  const ghBtn = document.getElementById('modal-github');
  if (data.github) {
    ghBtn.href = data.github;
    ghBtn.style.display = 'inline-flex';
  } else {
    ghBtn.style.display = 'none';
  }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const audio = document.getElementById('modal-audio');
  if (audio) { audio.pause(); audio.currentTime = 0; }
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Lightbox ── */
(function () {
  const lb = document.createElement('div');
  lb.className = 'lightbox-overlay';
  lb.innerHTML = '<img id="lightbox-img" src="" alt="">';
  document.body.appendChild(lb);
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
})();

window._openLightbox = function (src) {
  const lb  = document.querySelector('.lightbox-overlay');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  lb.classList.add('open');
};

/* Podcast player controls (global so onclick= works) */
window._togglePodcast = function () {
  const audio = document.getElementById('modal-audio');
  const btn   = document.getElementById('podcast-play-btn');
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    btn.innerHTML = '⏸ &nbsp;Pause';
  } else {
    audio.pause();
    btn.innerHTML = '▶ &nbsp;Play Episode';
  }
};

window._seekPodcast = function (secs) {
  const audio = document.getElementById('modal-audio');
  const btn   = document.getElementById('podcast-play-btn');
  if (!audio) return;
  audio.currentTime = secs;
  audio.play();
  if (btn) btn.innerHTML = '⏸ &nbsp;Pause';
};

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => openModal(card.dataset.projectId, card));
});

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  scrollProgress.style.width = Math.min(pct, 100) + '%';
}, { passive: true });

/* ============================================
   CUSTOM CURSOR
   ============================================ */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX  = -100, ringY = -100;

  dot.style.transform  = 'translate(-120px,-120px)';
  ring.style.transform = 'translate(-120px,-120px)';

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  (function lerpRing() {
    dot.style.transform  = `translate(${mouseX}px,${mouseY}px)`;
    ringX += (mouseX - ringX) * 0.11;
    ringY += (mouseY - ringY) * 0.11;
    ring.style.transform = `translate(${ringX}px,${ringY}px)`;
    requestAnimationFrame(lerpRing);
  })();

  document.addEventListener('mousedown', () => dot.classList.add('cursor-click'), { passive: true });
  document.addEventListener('mouseup',   () => dot.classList.remove('cursor-click'), { passive: true });

  const hoverEls = document.querySelectorAll(
    'a, button, .project-card, .skill-card, .nav-logo, .filter-btn'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    });
  });
}

/* ============================================
   HERO NAME — LETTER-BY-LETTER ANIMATION
   ============================================ */
function splitLetters(el, baseDelay, stagger) {
  const text = el.textContent;
  el.textContent = '';
  text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'letter-char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.animationDelay = (baseDelay + i * stagger).toFixed(3) + 's';
    el.appendChild(span);
  });
  return text.length;
}

const nameFirst = document.querySelector('.hero-name .name-first');
const nameLast  = document.querySelector('.hero-name .name-last');
if (nameFirst && nameLast) {
  const stagger  = 0.048;
  const firstLen = nameFirst.textContent.length;
  splitLetters(nameFirst, 0.1,  stagger);
  splitLetters(nameLast,  0.1 + firstLen * stagger + 0.07, stagger);
}

/* ============================================
   PROJECT CARD — 3D TILT
   ============================================ */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)  / r.width  - 0.5;
    const y = (e.clientY - r.top)   / r.height - 0.5;
    card.style.transition = 'border-color 0.25s, box-shadow 0.25s';
    card.style.transform  =
      `perspective(900px) rotateY(${x * 11}deg) rotateX(${-y * 9}deg) translateY(-6px) scale(1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition =
      'border-color 0.25s, box-shadow 0.25s, transform 0.55s cubic-bezier(0.23,1,0.32,1)';
    card.style.transform = '';
  });
});
