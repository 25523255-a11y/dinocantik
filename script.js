(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Background: hearts, bubbles, sparkles ================= */
  const bg = $('#bg');
  const heartChars = ['♥', '❤', '♡', '💗'];

  for (let i = 0; i < 16; i++) {
    const el = document.createElement('span');
    const isBubble = i % 4 === 0;
    el.className = 'float' + (isBubble ? ' bubble' : '');
    if (isBubble) {
      const s = rand(18, 40);
      el.style.width = el.style.height = s + 'px';
    } else {
      el.textContent = heartChars[i % heartChars.length];
      el.style.fontSize = rand(14, 30) + 'px';
    }
    el.style.left = rand(2, 96) + '%';
    el.style.setProperty('--sway', rand(-40, 40) + 'px');
    el.style.animationDuration = rand(14, 26) + 's';
    el.style.animationDelay = -rand(0, 24) + 's';
    bg.appendChild(el);
  }
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.className = 'sparkle';
    el.textContent = i % 2 ? '✦' : '✧';
    el.style.left = rand(3, 95) + '%';
    el.style.top = rand(4, 92) + '%';
    el.style.fontSize = rand(12, 22) + 'px';
    el.style.animationDuration = rand(3, 6) + 's';
    el.style.animationDelay = -rand(0, 6) + 's';
    bg.appendChild(el);
  }

  /* ================= Confetti / heart burst ================= */
  const fx = $('#fx');
  const confettiChars = ['💖', '💗', '💕', '♥', '✨', '🌸', '♡', '💞'];

  function burst(x, y, count = 26) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'confetti';
      p.textContent = confettiChars[Math.floor(Math.random() * confettiChars.length)];
      p.style.fontSize = rand(14, 28) + 'px';
      fx.appendChild(p);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(70, 220);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - rand(30, 90);
      const rot = rand(-120, 120);
      const anim = p.animate([
        { transform: `translate(${x}px, ${y}px) scale(.4) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + dy}px) scale(1.1) rotate(${rot}deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${x + dx * 1.1}px, ${y + dy + 120}px) scale(.8) rotate(${rot * 1.5}deg)`, opacity: 0 }
      ], { duration: rand(1100, 1800), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      anim.onfinish = () => p.remove();
    }
  }

  function rain(duration = 2600) {
    if (reduceMotion) return;
    const end = Date.now() + duration;
    const timer = setInterval(() => {
      if (Date.now() > end) return clearInterval(timer);
      burst(rand(40, window.innerWidth - 40), rand(40, window.innerHeight * 0.45), 4);
    }, 260);
  }

  /* ================= Section navigation ================= */
  const sections = $$('.section');
  let current = $('#s1');
  let busy = false;

  function show(id) {
    if (busy) return;
    const next = document.getElementById(id);
    if (!next || next === current) return;
    busy = true;
    current.classList.remove('show');
    setTimeout(() => {
      current.classList.remove('active');
      if (current.id === 's2') resetNo();
      next.classList.add('active');
      void next.offsetWidth; // reflow so the fade-in transitions
      next.classList.add('show');
      current = next;
      window.scrollTo(0, 0);
      if (id === 's2') initNo();
      if (id === 's3') {
        burst(window.innerWidth / 2, window.innerHeight / 2.4, 30);
        rain();
      }
      busy = false;
    }, reduceMotion ? 50 : 420);
  }

  $$('[data-next]').forEach(btn =>
    btn.addEventListener('click', () => show(btn.dataset.next))
  );

  /* ================= Section 2: YES / runaway NO ================= */
  const yesBtn = $('#yesBtn');
  const noBtn = $('#noBtn');
  const funny = $('#funny');
  const messages = [
    'ehh kok mau pilih NO sih 😭',
    'jangan yang itu donggg 🥺',
    'NO-nya kabur hehe ♡',
    'hayoo mau kemana tanganmu 🙈',
    'pencet YES aja yaa cantik ♡',
    'NO-nya malu ketemu kamu 😳'
  ];
  let msgIndex = 0;
  let lastFlee = 0;

  function say() {
    funny.textContent = messages[msgIndex++ % messages.length];
  }

  function flee(px, py) {
    const now = Date.now();
    if (now - lastFlee < 160) return; // avoid jitter
    lastFlee = now;

    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;
    const pad = 10;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad, window.innerHeight - h - pad);

    if (!noBtn.classList.contains('running')) {
      const r = noBtn.getBoundingClientRect();
      noBtn.style.left = r.left + 'px';
      noBtn.style.top = r.top + 'px';
      noBtn.classList.add('running');
      void noBtn.offsetWidth;
    }

    const yes = yesBtn.getBoundingClientRect();
    let best = null;
    for (let i = 0; i < 40; i++) {
      const x = rand(pad, maxX);
      const y = rand(pad, maxY);
      const cx = x + w / 2, cy = y + h / 2;
      const farFromPointer = Math.hypot(cx - px, cy - py) > 160;
      const overlapsYes = x < yes.right + 12 && x + w > yes.left - 12 &&
                          y < yes.bottom + 12 && y + h > yes.top - 12;
      if (farFromPointer && !overlapsYes) { best = { x, y }; break; }
      if (!best && !overlapsYes) best = { x, y };
    }
    if (!best) best = { x: rand(pad, maxX), y: rand(pad, maxY) };

    noBtn.style.left = best.x + 'px';
    noBtn.style.top = best.y + 'px';
    say();
  }

  function onPointerNear(e) {
    if (current.id !== 's2') return;
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < 110) flee(e.clientX, e.clientY);
  }

  function block(e) {
    e.preventDefault();
    e.stopPropagation();
    flee(e.clientX ?? window.innerWidth / 2, e.clientY ?? window.innerHeight / 2);
  }

  let noReady = false;
  function initNo() {
    funny.innerHTML = '&nbsp;';
    msgIndex = 0;
    if (noReady) return;
    noReady = true;
    document.addEventListener('pointermove', onPointerNear);
    document.addEventListener('pointerdown', onPointerNear);
    ['pointerdown', 'mousedown', 'click', 'dblclick'].forEach(t => noBtn.addEventListener(t, block));
    noBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      flee(t.clientX, t.clientY);
    }, { passive: false });
    noBtn.addEventListener('focus', () => { noBtn.blur(); flee(window.innerWidth / 2, window.innerHeight / 2); });
    window.addEventListener('resize', () => {
      if (!noBtn.classList.contains('running')) return;
      const x = Math.min(parseFloat(noBtn.style.left), Math.max(10, window.innerWidth - noBtn.offsetWidth - 10));
      const y = Math.min(parseFloat(noBtn.style.top), Math.max(10, window.innerHeight - noBtn.offsetHeight - 10));
      noBtn.style.left = x + 'px';
      noBtn.style.top = y + 'px';
    });
  }

  function resetNo() {
    noBtn.classList.remove('running');
    noBtn.style.left = '';
    noBtn.style.top = '';
    funny.innerHTML = '&nbsp;';
  }

  yesBtn.addEventListener('click', () => {
    const r = yesBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 34);
    funny.textContent = 'yeayyy aku juga sayang kamu ♡';
    setTimeout(() => show('s3'), reduceMotion ? 100 : 900);
  });

  /* ================= Start ================= */
  requestAnimationFrame(() => $('#s1').classList.add('show'));
})();
