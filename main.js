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

    /* SZ district labels */
    ctx.font = `300 9px 'DM Mono', monospace`;
    ctx.fillStyle = C.labelSZ;
    ctx.globalAlpha = 0.75;
    [
      { text: 'FUTIAN',  x: W * 0.06, y: H * 0.32 },
      { text: 'NANSHAN', x: W * 0.03, y: H * 0.55 },
      { text: 'SZ BAY',  x: W * 0.04, y: H * 0.80 },
      { text: 'LONGHUA', x: W * 0.18, y: H * 0.16 },
      { text: 'LUOHU',   x: W * 0.36, y: H * 0.26 },
    ].forEach(l => ctx.fillText(l.text, l.x, l.y));
    ctx.globalAlpha = 1;

    /* SZ animated POIs */
    const szPois = [
      { x: W * 0.12, y: H * 0.38, label: 'Civic Ctr' },
      { x: W * 0.26, y: H * 0.52, label: 'Futian CBD' },
      { x: W * 0.38, y: H * 0.30, label: 'SZU' },
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
      ctx.font = `300 8px 'DM Mono', monospace`;
      ctx.fillStyle = C.labelSZ; ctx.globalAlpha = 0.85;
      ctx.fillText(p.label, p.x + 6, p.y + 3);
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

    /* Philly district labels */
    ctx.font        = `300 9.5px 'DM Mono', monospace`;
    ctx.fillStyle   = C.label;
    ctx.globalAlpha = 0.8;
    [
      { text: 'OLD CITY',        x: W * 0.82, y: H * 0.22 },
      { text: 'CENTER CITY',     x: W * 0.64, y: H * 0.50 },
      { text: 'UNIVERSITY CITY', x: W * 0.50, y: H * 0.26 },
      { text: 'SOUTH PHILLY',    x: W * 0.64, y: H * 0.76 },
      { text: 'FISHTOWN',        x: W * 0.84, y: H * 0.14 },
    ].forEach(l => ctx.fillText(l.text, l.x, l.y));
    ctx.globalAlpha = 1;

    /* Philly animated POIs */
    const pois = [
      { x: W * 0.52, y: H * 0.36, label: 'Penn' },
      { x: W * 0.70, y: H * 0.56, label: 'City Hall' },
      { x: W * 0.60, y: H * 0.20, label: 'Temple U' },
      { x: W * 0.76, y: H * 0.42, label: 'OTIS' },
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
      ctx.font        = `300 8.5px 'DM Mono', monospace`;
      ctx.fillStyle   = C.label; ctx.globalAlpha = 0.9;
      ctx.fillText(p.label, p.x + 7, p.y + 3);
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
       SCALE BAR & NORTH ARROW
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const sbX = W - 115, sbY = H - 24, sbW = 72;
    ctx.strokeStyle = C.label;
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(sbX, sbY); ctx.lineTo(sbX + sbW, sbY);
    ctx.moveTo(sbX, sbY - 5); ctx.lineTo(sbX, sbY + 3);
    ctx.moveTo(sbX + sbW, sbY - 5); ctx.lineTo(sbX + sbW, sbY + 3);
    ctx.stroke();
    ctx.font      = '8.5px DM Mono, monospace';
    ctx.fillStyle = C.label;
    ctx.textAlign = 'center';
    ctx.fillText('500 m', sbX + sbW / 2, sbY - 7);
    ctx.textAlign = 'left';

    const nx = W - 30, ny = H - 56;
    ctx.font      = '9px DM Mono, monospace';
    ctx.fillStyle = C.label;
    ctx.globalAlpha = 0.55;
    ctx.textAlign = 'center';
    ctx.fillText('N', nx, ny - 7);
    ctx.beginPath();
    ctx.moveTo(nx, ny); ctx.lineTo(nx - 4.5, ny + 13);
    ctx.lineTo(nx, ny + 9); ctx.lineTo(nx + 4.5, ny + 13);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(92,39,254,0.85)';
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.textAlign   = 'left';
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
        const match = filter === 'all' || card.dataset.category === filter;
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
    type: 'MUSA Practicum · Ongoing 2026',
    title: 'Off-Peak Roadway Safety Analysis',
    description: 'Congestion may cause fender benders, but excess road capacity may be causing catastrophic crashes. Built for Philadelphia\'s OTIS Office of Multimodal Planning, this practicum models the percentage of vehicles exceeding the speed limit as a continuous proxy for KSI (killed or serious injury) risk using a Random Forest, then wraps the predictions in a JavaScript scenario tool that lets planners simulate the safety effect of street-level interventions on unobserved segments.',
    highlights: [
      'Dependent variable selection: raw crash counts are stochastic and difficult to forecast reliably; the percentage of vehicles exceeding the speed limit is a continuous, well-distributed outcome strongly correlated with KSI risk and more amenable to predictive modeling.',
      'Feature engineering across five conceptual groups: spatiotemporal and traffic dynamics capture when and under what flow conditions speeding is most likely; roadway geometry and spine assess how physical road dimensions encourage or restrict speed; built environment and right-of-way measure how street complexity and visual friction slow drivers; controls and enforcement identify actionable deterrents; and a safety baseline links predicted speeding rates to historical crash outcomes. Each group required a different data source and spatial join strategy to assemble.',
      'Random Forest via tidymodels with spatial cross-validation. RF is well-suited here because the relationships between road characteristics and speeding behavior are unlikely to be linear or additive: a wide road matters differently at 2am than at 8am, and the effect of a bike lane depends on whether there is also on-street parking. RF captures these interactions without requiring them to be specified in advance, and handles the mix of continuous, categorical, and binary predictors naturally.',
      'Scenario app: a JavaScript dashboard lets OTIS planners select any street segment, toggle street-level interventions such as adding traffic calming, changing lane configuration, or adjusting signal controls, and see the model\'s estimated change in high-speed driving frequency in real time.'
    ],
    takeaway: 'The most consequential methodological choice was picking the right dependent variable. Crash counts looked like the obvious target, but their sparsity and randomness made them nearly unforecastable at the segment level. Switching to the percentage of vehicles exceeding the speed limit gave the model a continuous, stable signal to learn from, and a metric planners could actually act on.',
    stack: ['R', 'Random Forest', 'tidymodels', 'sf', 'OSM', 'JavaScript', 'Philadelphia OTIS'],
    github: 'https://github.com/upenn/otis_off_peak_roadway_safety',
    links: [
      { label: 'Progress Deck',  url: 'https://drive.google.com/file/d/19jhZjauJeGWOSpwnBjltguL49ZT3ycLd/view?usp=sharing' },
      { label: 'Final Report',   url: '#' },
      { label: 'Web App',        url: '#' },
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
    title: 'Transportation Policy Analytics Suite',
    description: 'Four policy memos written for real planning audiences, each tackling a distinct failure mode in how American cities measure and manage transportation. The suite argues a consistent thread: conventional metrics like ITE trip generation rates and Level of Service grades are not neutral technical tools; they embed car-centric assumptions that actively shape, and often distort, planning decisions.',
    highlights: [
      'ITE Trip Generation critique (Upper Darby, PA): ITE rates derived from isolated suburban sites systematically overestimate vehicle trips by 25%+ in transit-rich urban contexts, feeding a "predict and provide" cycle that forces excess parking and road widening. Proposed alternatives include smart-growth regression adjustments, accessibility-based analysis measuring jobs reachable by all modes, and VMT/mode-share impact reporting in place of LOS grades.',
      'Transit job accessibility framework (Camden, NJ): designed a Segmented Cumulative Opportunity measure counting low-to-moderate wage jobs reachable within a 45-minute transit threshold. Distinguishes "origin accessibility" for new housing from "destination accessibility" for new commercial sites using GTFS isochrones and reverse-isochrone analysis to test whether developments serve Camden\'s transit-dependent workforce or only highway commuters.',
      'Post-COVID traffic safety memo (PennDOT): Pennsylvania recorded 1,230 roadway deaths in 2021, a five-year high, driven by excess-capacity road design enabling high-speed driving on emptier roads. Proposed four pillars: automated speed enforcement (citing Roosevelt Blvd pilot\'s 95% speeding reduction), Complete Streets re-engineering, replacing LOS with safety and accessibility metrics, and using LBS and LEHD data for real-time predictive risk modeling.',
      'License-plate driving restriction analysis (Philadelphia): recommended against the proposed one-day-per-week ban. Evidence from Mexico City\'s Hoy No Circula shows households respond by buying older secondary vehicles, increasing total emissions and VMT. The policy is also regressive, disproportionately burdening low-income workers who cannot afford compliant vehicles or transit alternatives. Recommended congestion pricing and transit frequency investment instead.'
    ],
    takeaway: 'The through-line across all four memos is that technical standards are not politically neutral. ITE rates, LOS grades, and license-plate bans all appear objective but embed choices about whose time and mobility get prioritized. Recognizing that was more important than any single analytical finding.',
    stack: ['R', 'GTFS', 'Isochrone Analysis', 'Policy Memo', 'Equity Analysis'],
    github: 'https://github.com/demiyang12/Introduction-to-Transportation-Planning',
    links: [
      { label: 'View Report', url: 'https://drive.google.com/file/d/1dKWOMMt9kv2yv2wmRIxU5VdXSMyAorJn/view?usp=sharing' },
    ]
  },
  'cloud-removal': {
    type: 'Remote Sensing Research · Ongoing 2026',
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
      { label: 'View Report', url: '#' },
    ]
  },
  'property-tax': {
    type: 'Cloud Infrastructure · Ongoing 2026',
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
      { label: 'View Project', url: '#' },
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

  const hl = document.getElementById('modal-highlights');
  hl.innerHTML = data.highlights.map(h => `<li><span>${h}</span></li>`).join('');

  document.getElementById('modal-takeaway').innerHTML = data.takeaway;

  const stack = document.getElementById('modal-stack');
  stack.innerHTML = data.stack.map(s => `<span class="tag">${s}</span>`).join('');

  const linksEl = document.getElementById('modal-links');
  linksEl.innerHTML = data.links.map(({ label, url }) => {
    const isReal = url !== '#';
    return `<a href="${url}" class="btn ${isReal ? 'btn-primary' : 'btn-ghost btn-disabled'}"${isReal ? ' target="_blank" rel="noopener"' : ''} ${isReal ? '' : 'tabindex="-1" aria-disabled="true"'}>${label} →</a>`;
  }).join('');

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
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

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
