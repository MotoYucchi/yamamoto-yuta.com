document.addEventListener('DOMContentLoaded', () => {
  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .content').forEach(el => {
    observer.observe(el);
  });

  // Dynamic Background Canvas (Happy Pop Theme)
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  const colors = [
    'rgba(255, 0, 127, 0.6)',   // Magenta
    'rgba(0, 210, 255, 0.6)',   // Cyan
    'rgba(255, 222, 0, 0.6)',   // Yellow
    'rgba(255, 255, 255, 0.8)'  // White
  ];

  function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    // More particles for a lively feel
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 6 + 2, // Slightly larger particles
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulsePhase += 0.05;

      // Wrap around screen instead of bounce for continuous flow
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      // Pulsing effect
      const currentRadius = p.radius + Math.sin(p.pulsePhase) * 1.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, currentRadius), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Connect near particles with bright lines
      for (let j = index + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - dist/400})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', initCanvas);
  initCanvas();
  draw();

  // Language Switcher Logic
  const btnJa = document.getElementById('lang-btn-ja');
  const btnEn = document.getElementById('lang-btn-en');
  
  if (btnJa && btnEn) {
    btnJa.addEventListener('click', () => {
      document.body.classList.remove('lang-state-en');
      document.body.classList.add('lang-state-ja');
      btnJa.classList.add('active');
      btnEn.classList.remove('active');
    });

    btnEn.addEventListener('click', () => {
      document.body.classList.remove('lang-state-ja');
      document.body.classList.add('lang-state-en');
      btnEn.classList.add('active');
      btnJa.classList.remove('active');
    });
  }
});
