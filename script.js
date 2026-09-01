const hero = document.querySelector('.hero');
const envelope = document.getElementById('envelope');
const envelopeRig = document.querySelector('.envelope-rig');
const openBack = document.querySelector('.envelope-open-back');
const envelopeBody = document.querySelector('.envelope-body');
const closedSnapshot = document.querySelector('.envelope-closed-snapshot');
const flapRig = document.querySelector('.flap-rig');
const flapShadow = document.querySelector('.flap-shadow');
const waxSeal = document.querySelector('.wax-seal');
const invitationCard = document.querySelector('.invitation-card');
const contactShadow = document.querySelector('.contact-shadow');
const openingPrompt = document.getElementById('openingPrompt');
const scrollCue = document.querySelector('.scroll-cue');
const bloomFlorals = document.querySelectorAll('.bloom-floral');
const cornerFlorals = document.querySelectorAll('.corner-floral');
const petalField = document.querySelector('.petal-field');
const afterOpen = document.querySelector('.after-open');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let isOpen = false;
let isAnimating = false;
let closeTimer;
let floatingPetals = [];
let petalTimelines = [];

function createPetals() {
  if (floatingPetals.length) return;

  const sources = [
    'assets/invitation/petals-1.png',
    'assets/invitation/petals-2.png'
  ];

  floatingPetals = Array.from({ length: 7 }, (_, index) => {
    const petal = document.createElement('img');
    petal.className = 'floating-petal';
    petal.src = sources[index % sources.length];
    petal.alt = '';
    petal.style.setProperty('--petal-size', `${20 + (index % 3) * 6}px`);
    petalField.appendChild(petal);
    return petal;
  });
}

function stopPetals() {
  petalTimelines.forEach((timeline) => timeline.kill());
  petalTimelines = [];
  if (floatingPetals.length) window.gsap.to(floatingPetals, { opacity: 0, duration: .28, overwrite: true });
}

function startPetals() {
  if (reduceMotion) return;
  createPetals();
  stopPetals();

  floatingPetals.forEach((petal, index) => {
    const startX = 40 + Math.random() * Math.max(120, window.innerWidth - 100);
    const drift = -80 + Math.random() * 160;
    const duration = 8.5 + Math.random() * 4;
    const rotation = 230 + Math.random() * 300;
    const timeline = window.gsap.timeline({ repeat: -1, delay: index * .52 + Math.random() * 1.2 });

    timeline
      .set(petal, { x: startX, y: -90, rotation: -35 + Math.random() * 70, opacity: 0 })
      .to(petal, { opacity: .62, duration: 1.15, ease: 'sine.out' })
      .to(petal, {
        x: startX + drift,
        y: window.innerHeight + 120,
        rotation,
        duration,
        ease: 'none'
      }, '<-.2')
      .to(petal, { opacity: 0, duration: 1.25, ease: 'sine.in' }, `-=${1.6}`);

    petalTimelines.push(timeline);
  });
}

function revealFollowingSections() {
  afterOpen.classList.add('is-visible');
  afterOpen.setAttribute('aria-hidden', 'false');
}

function hideFollowingSections() {
  afterOpen.classList.remove('is-visible');
  afterOpen.setAttribute('aria-hidden', 'true');
}

if (!window.gsap) {
  envelope.addEventListener('click', () => {
    isOpen = !isOpen;
    hero.classList.toggle('is-open', isOpen);
    envelope.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) revealFollowingSections();
    else hideFollowingSections();
  });
} else {
  const { gsap } = window;

  gsap.set(envelopeRig, { transformOrigin: '50% 55%' });
  gsap.set(invitationCard, {
    xPercent: -50,
    y: 330,
    z: 0,
    rotationX: 24,
    rotationZ: -.28,
    scale: .95,
    opacity: 0,
    transformPerspective: 900,
    transformOrigin: '50% 100%'
  });
  gsap.set(waxSeal, { xPercent: -50, transformOrigin: '50% 55%' });
  // preserve-3d trên flapRig để flap-3d con (hai mặt) hoạt động đúng
  gsap.set(flapRig, { rotationX: 0, transformOrigin: '50% 0%', transformPerspective: 1500, transformStyle: 'preserve-3d', zIndex: 5 });
  gsap.set(bloomFlorals[0], { x: -28, y: 22, scale: .72, rotation: -8, opacity: 0 });
  gsap.set(bloomFlorals[1], { x: 25, y: 18, scale: .74, rotation: 7, opacity: 0 });

  const invitationTimeline = gsap.timeline({
    paused: true,
    defaults: { overwrite: 'auto' },
    onStart: () => { isAnimating = true; },
    onComplete: () => {
      isAnimating = false;
      revealFollowingSections();
    },
    onReverseComplete: () => {
      isAnimating = false;
      hero.classList.remove('is-open', 'is-closing');
      hideFollowingSections();
    }
  });

  invitationTimeline
    .addLabel('contact', 0)
    .to(envelopeRig, { scale: .985, y: 2, duration: .11, ease: 'power2.out' }, 'contact')
    .to(envelopeRig, { scale: 1, y: 0, duration: .22, ease: 'power2.out' }, .11)
    .to(openingPrompt, { opacity: 0, y: 10, duration: .42, ease: 'power2.out' }, .06)
    .to(waxSeal, { scale: .94, rotation: -1.6, duration: .18, ease: 'power2.out' }, .08)
    .to(waxSeal, { y: 17, scale: .97, rotation: 2.2, opacity: 0, duration: .27, ease: 'power2.in' }, .22)
    .to(closedSnapshot, { opacity: 0, duration: .32, ease: 'power1.inOut' }, .36)
    .to(flapRig, { rotationX: -178, duration: 1.02, ease: 'power2.inOut' }, .34)
    .to(flapShadow, {
      keyframes: [
        { opacity: .38, y: -30, scaleY: .82, filter: 'blur(9px)', duration: .48 },
        { opacity: 0, y: -73, scaleY: 1.05, filter: 'blur(17px)', duration: .54 }
      ],
      ease: 'sine.inOut'
    }, .34)
    .to(openBack, { opacity: 1, duration: .5, ease: 'power1.inOut' }, .66)
    .to(envelopeBody, { opacity: 0, duration: .34, ease: 'power1.out' }, .8)
    .set(flapRig, { zIndex: 2 }, .86)
    .to(invitationCard, { opacity: 1, duration: .38, ease: 'power2.out' }, .58)
    .to(invitationCard, {
      y: -14,
      z: 20,
      rotationX: 0,
      rotationZ: 0,
      scale: 1,
      filter: 'drop-shadow(0 18px 22px rgba(63, 46, 29, .16))',
      duration: 1.28,
      ease: 'power3.out'
    }, .72)
    .to(flapRig, { opacity: 0, duration: .3, ease: 'power1.out' }, 1.08)
    .to(contactShadow, { opacity: .64, scaleX: 1.1, scaleY: .58, filter: 'blur(23px)', duration: .8, ease: 'sine.inOut' }, .72)
    .to(bloomFlorals[0], { x: 0, y: 0, scale: 1, rotation: -1.5, opacity: .78, duration: 1.02, ease: 'power3.out' }, 1.12)
    .to(bloomFlorals[1], { x: 0, y: 0, scale: 1, rotation: 1.2, opacity: .72, duration: .96, ease: 'power3.out' }, 1.27)
    .to(cornerFlorals[0], { opacity: .62, scale: 1.025, duration: 1.15, ease: 'sine.out' }, 1.05)
    .to(cornerFlorals[1], { opacity: .5, scale: 1.02, duration: 1.05, ease: 'sine.out' }, 1.18)
    .to(invitationCard, { y: -20, duration: .12, ease: 'power1.out' }, 2.01)
    .to(invitationCard, { y: -14, duration: .2, ease: 'sine.inOut' }, 2.13)
    .call(() => { if (isOpen) startPetals(); }, null, 1.46)
    .to(scrollCue, { opacity: 1, y: 0, pointerEvents: 'auto', duration: .72, ease: 'power2.out' }, 1.72);

  window.__invitationTimeline = invitationTimeline;

  function setInvitationState(open) {
    if (isAnimating || open === isOpen) return;
    window.clearTimeout(closeTimer);
    isOpen = open;
    isAnimating = true;
    envelope.setAttribute('aria-expanded', String(isOpen));
    envelope.setAttribute('aria-label', isOpen ? 'Chạm để đóng thư mời' : 'Chạm để mở thư mời');

    if (reduceMotion) {
      invitationTimeline.progress(isOpen ? 1 : 0).pause();
      hero.classList.toggle('is-open', isOpen);
      if (isOpen) revealFollowingSections();
      else hideFollowingSections();
      isAnimating = false;
      return;
    }

    if (isOpen) {
      hero.classList.remove('is-closing');
      hero.classList.add('is-open');
      invitationTimeline.timeScale(1).play();
    } else {
      hero.classList.remove('is-open');
      hero.classList.add('is-closing');
      stopPetals();
      closeTimer = window.setTimeout(hideFollowingSections, 1050);
      invitationTimeline.timeScale(1.06).reverse();
    }
  }

  envelope.addEventListener('click', () => setInvitationState(!isOpen));

  const params = new URLSearchParams(window.location.search);
  if (params.get('open') === '1') {
    isOpen = true;
    hero.classList.add('is-open');
    envelope.setAttribute('aria-expanded', 'true');
    envelope.setAttribute('aria-label', 'Chạm để đóng thư mời');
    invitationTimeline.progress(1).pause();
    revealFollowingSections();

    const requestedSection = params.get('section');
    if (requestedSection) {
      document.documentElement.style.scrollBehavior = 'auto';
      window.setTimeout(() => document.getElementById(requestedSection)?.scrollIntoView({ block: 'start' }), 80);
    }
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: .16 });

document.querySelectorAll('.section-reveal').forEach((section) => observer.observe(section));
