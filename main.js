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
   Animated procedural city map — vivid palette
   ============================================ */
(function initMapCanvas() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  /* Vivid palette matching CSS vars */
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
    const rng = seededRng(99);

    /* -- Building blocks (city texture) -- */
    const gx = 64, gy = 56;
    for (let bx = gx; bx < W - gx; bx += gx) {
      for (let by = gy; by < H - gy; by += gy) {
        if (rng() > 0.45) {
          const bw = 18 + rng() * 22;
          const bh = 12 + rng() * 16;
          ctx.fillStyle = C.block;
          ctx.fillRect(bx + rng() * 20, by + rng() * 16, bw, bh);
        }
      }
    }

    /* -- Major orthogonal grid -- */
    ctx.lineWidth = 1.6;
    for (let x = 8; x < W; x += gx) {
      ctx.strokeStyle = C.major;
      ctx.globalAlpha = 0.4 + rng() * 0.6;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 8; y < H; y += gy) {
      ctx.strokeStyle = C.major;
      ctx.globalAlpha = 0.4 + rng() * 0.6;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* -- Minor streets -- */
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = C.minor;
    ctx.globalAlpha = 1;
    for (let x = 8 + gx/2; x < W; x += gx) {
      if (rng() > 0.3) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
    }
    for (let y = 8 + gy/2; y < H; y += gy) {
      if (rng() > 0.3) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    /* -- Water body (right side) -- */
    ctx.fillStyle   = C.water;
    ctx.strokeStyle = C.waterStr;
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.8, 0);
    ctx.bezierCurveTo(W*0.84, H*0.22, W*0.9, H*0.4, W*0.93, H*0.58);
    ctx.bezierCurveTo(W*0.97, H*0.76, W*0.99, H*0.9, W*1.02, H);
    ctx.lineTo(W * 1.1, H); ctx.lineTo(W * 1.1, 0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    /* Schuylkill-style river stripe */
    ctx.strokeStyle = C.waterStr;
    ctx.lineWidth   = 5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(W * 0.55, 0);
    ctx.bezierCurveTo(W*0.52, H*0.28, W*0.50, H*0.55, W*0.54, H*0.8);
    ctx.bezierCurveTo(W*0.56, H*0.92, W*0.58, H*0.97, W*0.60, H);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* -- Parks -- */
    const parks = [
      { x: W*0.30, y: H*0.10, w: 70, h: 44 },
      { x: W*0.58, y: H*0.58, w: 52, h: 36 },
      { x: W*0.14, y: H*0.70, w: 44, h: 30 },
    ];
    parks.forEach(p => {
      ctx.fillStyle   = C.park;
      ctx.strokeStyle = C.parkStr;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 3);
      ctx.fill(); ctx.stroke();
    });

    /* -- Arterial diagonals (orange) -- */
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = C.arterial;
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.moveTo(W*0.22, 0);
    ctx.bezierCurveTo(W*0.32, H*0.28, W*0.46, H*0.5, W*0.58, H*0.72);
    ctx.bezierCurveTo(W*0.63, H*0.84, W*0.66, H*0.92, W*0.68, H);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, H*0.42);
    ctx.bezierCurveTo(W*0.18, H*0.38, W*0.35, H*0.44, W*0.52, H*0.32);
    ctx.bezierCurveTo(W*0.62, H*0.24, W*0.68, H*0.12, W*0.72, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* -- Contour/topography lines -- */
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = C.contour;
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.ellipse(W*0.65, H*0.38, 50 + i*34, 34 + i*22, 0.25, 0, Math.PI*2);
      ctx.stroke();
    }

    /* -- District labels -- */
    ctx.font          = `300 9.5px 'DM Mono', monospace`;
    ctx.fillStyle     = C.label;
    ctx.globalAlpha   = 0.8;
    ctx.letterSpacing = '0.09em';
    const labels = [
      { text: 'OLD CITY',        x: W*0.12, y: H*0.20 },
      { text: 'CENTER CITY',     x: W*0.28, y: H*0.48 },
      { text: 'UNIVERSITY CITY', x: W*0.44, y: H*0.24 },
      { text: 'SOUTH PHILLY',    x: W*0.14, y: H*0.78 },
      { text: 'FISHTOWN',        x: W*0.60, y: H*0.14 },
    ];
    labels.forEach(l => ctx.fillText(l.text, l.x, l.y));
    ctx.globalAlpha = 1;

    /* -- Animated POI dots -- */
    const pois = [
      { x: W*0.18, y: H*0.35, label: 'Penn' },
      { x: W*0.42, y: H*0.58, label: 'City Hall' },
      { x: W*0.32, y: H*0.18, label: 'Temple U' },
      { x: W*0.55, y: H*0.42, label: 'OTIS' },
      { x: W*0.22, y: H*0.65, label: 'PHL' },
    ];

    pois.forEach((p, i) => {
      const pulse = Math.sin(t * 0.0015 + i * 1.3) * 0.5 + 0.5;
      const ringR = 9 + pulse * 8;

      ctx.strokeStyle = C.dotRing;
      ctx.lineWidth   = 1.2;
      ctx.globalAlpha = (1 - pulse) * 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle   = C.dot;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle   = '#fff';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font        = `300 8.5px 'DM Mono', monospace`;
      ctx.fillStyle   = C.label;
      ctx.globalAlpha = 0.9;
      ctx.fillText(p.label, p.x + 7, p.y + 3);
    });

    ctx.globalAlpha = 1;

    /* -- Animated scan line (violet tint) -- */
    const scanY = ((t * 0.022) % (H + 80)) - 40;
    const sg    = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
    sg.addColorStop(0,   'rgba(92,39,254,0)');
    sg.addColorStop(0.5, C.scan);
    sg.addColorStop(1,   'rgba(92,39,254,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 35, W, 70);

    /* -- Scale bar -- */
    const sbX = W - 115, sbY = H - 24, sbW = 72;
    ctx.strokeStyle = C.label;
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(sbX, sbY); ctx.lineTo(sbX + sbW, sbY);
    ctx.moveTo(sbX, sbY - 5); ctx.lineTo(sbX, sbY + 3);
    ctx.moveTo(sbX + sbW, sbY - 5); ctx.lineTo(sbX + sbW, sbY + 3);
    ctx.stroke();
    ctx.font        = '8.5px DM Mono, monospace';
    ctx.fillStyle   = C.label;
    ctx.textAlign   = 'center';
    ctx.fillText('500 m', sbX + sbW / 2, sbY - 7);
    ctx.textAlign   = 'left';

    /* -- North arrow -- */
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
   PROJECT MODAL
   ============================================ */
const projectData = {
  'road-safety': {
    type: 'MUSA Practicum · Ongoing 2026',
    title: 'Off-Peak Roadway Safety Analysis',
    description: 'Quantifying the correlation between arterial road capacity and severe off-peak accidents in Philadelphia using R (sf, tidymodels), directly supporting the City\'s OTIS Vision Zero strategies. Built a web-based decision support system for planners to simulate "Road Diet" interventions in real time.',
    highlights: [
      'Analyzed multi-year crash data from the City of Philadelphia to identify arterial corridors with disproportionate off-peak severity rates.',
      'Developed a tidymodels pipeline with spatial cross-validation to predict crash likelihood based on road geometry, lane count, and land-use context.',
      'Built an interactive JavaScript decision-support tool allowing planners to simulate "Road Diet" scenarios and visualize projected safety improvements.',
      'Collaborated with Philadelphia OTIS staff to align model outputs with the Vision Zero 2030 action plan and real-world implementation constraints.'
    ],
    takeaway: 'Working directly with city planners taught me that the most technically elegant model is only as valuable as its legibility to decision-makers — designing for communication is as important as designing for accuracy.',
    stack: ['R', 'sf', 'tidymodels', 'JavaScript', 'City of Philadelphia'],
    link: '#'
  },
  'housing-price': {
    type: 'Predictive Modeling · Oct 2025',
    title: 'Philadelphia Housing Sale Price Model',
    description: 'Predicted Philadelphia housing sale prices using multi-source data integrated across parcel records, neighborhood demographics, and amenity proximity. A key innovation was applying linear regression to impute fair-market prices for non-arm\'s-length transactions, retaining 25% of data that would otherwise have been discarded.',
    highlights: [
      'Engineered spatial lag features and amenity-distance metrics to capture neighborhood externalities beyond parcel-level attributes.',
      'Implemented 10-fold cross-validation with spatial partitioning to prevent data leakage and produce honest out-of-sample error estimates.',
      'Designed a price-imputation pipeline for non-market transactions (estate sales, foreclosures) to dramatically expand usable training data.',
      'Produced choropleth maps of predicted prices and residuals to identify systematic model bias by neighborhood and property type.'
    ],
    takeaway: 'Discovering that 25% of transactions were non-market sales was a pivotal moment — it reinforced how critical careful data auditing is before any modeling work begins. The "data cleaning" phase often holds the most analytical leverage.',
    stack: ['R', 'OLS', 'Cross-validation', 'Feature Engineering', 'sf'],
    link: '#'
  },
  'yunnan-odyssey': {
    type: 'Web Application · Aug–Dec 2025',
    title: 'Yunnan Odyssey — Travel Planning App',
    description: 'A full-stack web application for planning and sharing travel itineraries across Yunnan Province, China. Combines story-map narrative, dynamic Mapbox routing, drag-and-drop itinerary planning, and a social feed tied to geographic points of interest. Built with Firebase for real-time user data management.',
    highlights: [
      'Designed a story-map architecture that sequences narrative content with map viewport transitions to guide users through regional geography.',
      'Integrated Mapbox Directions API for dynamic multi-stop route optimization with mode-of-transport switching.',
      'Implemented drag-and-drop itinerary builder with Firebase Realtime Database sync, enabling collaborative trip planning.',
      'Built a social feed where posts are pinned to geographic coordinates, creating a location-aware community layer.'
    ],
    takeaway: 'Building a complete full-stack application from scratch — from database schema to UI animation — gave me a new appreciation for the invisible complexity behind every smooth user interaction. Every feature hides a dozen edge cases.',
    stack: ['JavaScript', 'Leaflet', 'Mapbox API', 'Firebase', 'Chart.js', 'HTML/CSS'],
    link: '#'
  },
  'transit-policy': {
    type: 'Policy Analytics · Aug–Dec 2025',
    title: 'Transportation Policy Analytics Suite',
    description: 'A four-part policy analysis series covering ITE Trip Generation reform, GTFS-based transit job accessibility, post-COVID traffic safety under Vision Zero, and congestion management evaluated through VMT and equity lenses. Each module produces a standalone report with interactive visualizations.',
    highlights: [
      'Critiqued ITE Trip Generation rates using local data to demonstrate their systematic overestimation of vehicle traffic for urban infill projects.',
      'Built GTFS-based isochrone maps to quantify job accessibility by transit, identifying service gaps in low-income corridors.',
      'Analyzed post-COVID crash severity trends using regression discontinuity to isolate the effect of reduced enforcement on Vision Zero outcomes.',
      'Evaluated HOT lane and congestion pricing scenarios using VMT modeling with distributional equity analysis across income quartiles.'
    ],
    takeaway: 'The most surprising finding was how widely ITE trip generation standards overshoot reality for urban contexts — it crystallized for me how outdated technical standards can quietly perpetuate car-centric development patterns even when planners want to do otherwise.',
    stack: ['R', 'GTFS', 'Isochrone Analysis', 'VMT Modeling', 'Equity Analysis'],
    link: '#'
  },
  'cloud-removal': {
    type: 'Remote Sensing Research · 2025',
    title: 'Evaluating Generative Models for Cloud Removal in Satellite Imagery',
    description: '[Placeholder] This project evaluates the performance of generative deep learning models — including GANs and diffusion-based approaches — for reconstructing cloud-obscured pixels in multispectral satellite imagery. The study compares models across multiple cloud coverage thresholds and biome types, with particular focus on tropical regions where persistent cloud cover limits temporal data availability.',
    highlights: [
      '[Placeholder] Benchmarked GAN, U-Net, and diffusion model architectures on paired cloudy/cloud-free Sentinel-2 image datasets.',
      '[Placeholder] Evaluated reconstruction quality using SSIM, PSNR, and spectral fidelity metrics across RGB and near-infrared bands.',
      '[Placeholder] Analyzed model performance degradation as a function of cloud coverage percentage and spatial distribution.',
      '[Placeholder] Developed a reproducible evaluation pipeline using Google Earth Engine and Python (PyTorch, GDAL, Rasterio).'
    ],
    takeaway: '[Placeholder] Working at the intersection of computer vision and remote sensing revealed the fundamental tension between pixel-level reconstruction accuracy and semantic coherence — a model can look right while being physically implausible.',
    stack: ['Python', 'PyTorch', 'Google Earth Engine', 'GDAL', 'Rasterio', 'Sentinel-2'],
    link: '#'
  },
  'property-tax': {
    type: 'Policy Platform · 2025–2026',
    title: 'Philadelphia City Property Tax Platform',
    description: '[Placeholder] An interactive data platform for exploring Philadelphia\'s property tax system, designed to make assessment disparities and tax burden distributions legible to residents and policymakers. Integrates OPA assessment records, sales data, and demographic layers to surface equity patterns across neighborhoods.',
    highlights: [
      '[Placeholder] Built an interactive choropleth dashboard visualizing effective tax rates and assessment accuracy ratios (sale price / assessed value) at the parcel level.',
      '[Placeholder] Developed a neighborhood-level equity analysis quantifying assessment regressivity — the tendency for lower-value homes to be assessed at higher fractions of market value.',
      '[Placeholder] Designed a "what-if" scenario tool allowing users to simulate the impact of reassessment policies on household tax burden by income decile.',
      '[Placeholder] Integrated with Philadelphia\'s open data portal via automated ETL pipeline to keep assessments and sales records current.'
    ],
    takeaway: '[Placeholder] Discovering the degree of assessment regressivity in Philadelphia\'s tax system — where the least affluent homeowners often pay the highest effective rates — underscored how data transparency tools can be a form of civic advocacy.',
    stack: ['JavaScript', 'Python', 'PostgreSQL', 'PostGIS', 'Leaflet', 'D3.js'],
    link: '#'
  }
};

/* ── Modal open/close ── */
const modalOverlay = document.getElementById('project-modal');
const modalClose   = document.getElementById('modal-close');

function openModal(id, cardEl) {
  const data = projectData[id];
  if (!data) return;

  /* Clone thumbnail from card */
  const thumbSrc  = cardEl.querySelector('.project-thumb');
  const thumbDest = document.getElementById('modal-thumb');
  thumbDest.innerHTML = '';
  if (thumbSrc) thumbDest.appendChild(thumbSrc.cloneNode(true));

  document.getElementById('modal-type').textContent  = data.type;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-desc').textContent  = data.description;

  const hl = document.getElementById('modal-highlights');
  hl.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');

  document.getElementById('modal-takeaway').textContent = data.takeaway;

  const stack = document.getElementById('modal-stack');
  stack.innerHTML = data.stack.map(s => `<span class="tag">${s}</span>`).join('');

  const link = document.getElementById('modal-link');
  link.href = data.link;
  link.textContent = data.link === '#' ? 'Link Coming Soon' : 'View Project →';

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

/* ── Attach click listeners to all project cards ── */
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

  /* Start off-screen */
  dot.style.transform  = 'translate(-120px,-120px)';
  ring.style.transform = 'translate(-120px,-120px)';

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px,${mouseY}px)`;
  });

  (function lerpRing() {
    ringX += (mouseX - ringX) * 0.11;
    ringY += (mouseY - ringY) * 0.11;
    ring.style.transform = `translate(${ringX}px,${ringY}px)`;
    requestAnimationFrame(lerpRing);
  })();

  document.addEventListener('mousedown', () => dot.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => dot.classList.remove('cursor-click'));

  const hoverEls = document.querySelectorAll(
    'a, button, .project-card, .skill-card, .nav-logo'
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
  const stagger   = 0.048;
  const firstLen  = nameFirst.textContent.length;
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
