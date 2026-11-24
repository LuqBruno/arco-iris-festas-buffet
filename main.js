import { animate, scroll } from 'motion';
import EmblaCarousel from 'embla-carousel';

const cleanups = [];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 760px)');
const journey = document.querySelector('.hero-journey');
const heroPhoto = document.querySelector('.hero-photo');
const copy = document.querySelector('.hero-copy');
const immersive = document.querySelector('.immersive-copy');
const shade = document.querySelector('.photo-shade');
const note = document.querySelector('.photo-note');
const cue = document.querySelector('.scroll-cue');
const clamp = (n) => Math.min(1, Math.max(0, n));
let stopHero;
function setupHero() {
  stopHero?.();
  document.documentElement.classList.toggle('motion-ready', !reduced.matches);
  [heroPhoto, copy, immersive, shade, note, cue].forEach(el => el.removeAttribute('style'));
  if (reduced.matches) return;
  const compact = mobile.matches;
  stopHero = scroll(p => {
    const t = clamp(p / .78);
    const ease = t * t * (3 - 2 * t);
    heroPhoto.style.clipPath = `inset(${(compact ? 56 : 46) * (1 - ease)}% ${(compact ? 4 : 5) * (1 - ease)}% ${3 * (1 - ease)}% round ${36 * (1 - ease)}px)`;
    copy.style.transform = `translateY(${-60 * ease}px)`;
    copy.style.opacity = 1 - clamp(p / .38);
    copy.style.visibility = p > .4 ? 'hidden' : 'visible';
    const reveal = clamp((p - .52) / .25);
    immersive.style.opacity = reveal;
    immersive.style.visibility = reveal > .02 ? 'visible' : 'hidden';
    immersive.style.transform = `translateY(${24 * (1 - reveal)}px)`;
    shade.style.opacity = .18 + .82 * ease;
    note.style.opacity = 1 - clamp(p / .32);
    cue.style.opacity = 1 - clamp(p / .2);
  }, { target: journey, offset: ['start start', 'end end'] });
}
setupHero();
reduced.addEventListener('change', setupHero);
mobile.addEventListener('change', setupHero);
cleanups.push(() => { stopHero?.(); reduced.removeEventListener('change', setupHero); mobile.removeEventListener('change', setupHero); });
if (!reduced.matches) {
  const photo = document.querySelector('.experience-picture img');
  cleanups.push(scroll(animate(photo, { y: ['-3%', '3%'] }, { ease: 'linear' }), { target: photo.parentElement, offset: ['start end', 'end start'] }));
}

const viewport = document.querySelector('.carousel');
const embla = EmblaCarousel(viewport, { align: 'start', loop: false, containScroll: 'trimSnaps', duration: reduced.matches ? 0 : 30 });
viewport.classList.add('is-ready');
const previous = document.querySelector('.previous');
const next = document.querySelector('.next');
function updateCarousel() {
  const index = embla.selectedScrollSnap();
  const total = embla.scrollSnapList().length;
  document.querySelector('#position').textContent = `${index + 1} / ${total}`;
  document.querySelector('.gallery-progress span').style.width = `${(index + 1) / total * 100}%`;
  previous.disabled = !embla.canScrollPrev(); next.disabled = !embla.canScrollNext();
}
previous.addEventListener('click', () => embla.scrollPrev());
next.addEventListener('click', () => embla.scrollNext());
viewport.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  if (e.key === 'ArrowLeft') embla.scrollPrev(true);
  if (e.key === 'ArrowRight') embla.scrollNext(true);
  if (e.key === 'Home') embla.scrollTo(0, true);
  if (e.key === 'End') embla.scrollTo(embla.scrollSnapList().length - 1, true);
});
embla.on('select', updateCarousel).on('reInit', updateCarousel); updateCarousel();
cleanups.push(() => embla.destroy());

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
function closeMenu(restore = false) {
  menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu');
  if (restore) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
document.addEventListener('focusin', e => { if (!e.target.closest('.header')) closeMenu(); });

document.querySelector('.briefing').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const date = data.get('data');
  const lines = [`Olá, equipe do Arco-Íris! Meu nome é ${data.get('nome').trim()}. Gostaria de conversar sobre uma festa.`];
  if (date) lines.push(`Data desejada: ${date.split('-').reverse().join('/')}.`);
  if (data.get('convidados')) lines.push(`Estimativa de convidados: ${data.get('convidados')}.`);
  if (data.get('tema').trim()) lines.push(`Tema ou ideia: ${data.get('tema').trim()}.`);
  const url = `https://wa.me/5548996278305?text=${encodeURIComponent(lines.join('\n'))}`;
  const opened = window.open(url, '_blank', 'noopener');
  const status = document.querySelector('.form-status');
  status.replaceChildren(document.createTextNode('Mensagem preparada. '));
  const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Abrir no WhatsApp'; status.append(link);
});
window.addEventListener('pagehide', () => cleanups.forEach(fn => fn()), { once: true });
