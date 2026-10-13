// Número de WhatsApp que recibe las solicitudes de cita (formato internacional sin "+")
const WHATSAPP_NUMBER = '34629776731';

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('main-nav');

// Cabecera con fondo al hacer scroll
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Menú hamburguesa
function setMenu(open) {
  header.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Enlace activo del menú según la sección visible
const navLinks = [...nav.querySelectorAll('ul a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
}

// Pestañas de servicios (accesibles con teclado)
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Animación suave al aparecer
const revealTargets = document.querySelectorAll('.section-head, .team-head, .pillar, .team-card, .service-grid, .review, .about-grid');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// Formulario de reserva → WhatsApp
const form = document.getElementById('booking-form');
const errorBox = document.getElementById('form-error');
const dateInput = document.getElementById('b-date');
dateInput.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = [...form.querySelectorAll('[required]')];
  const invalid = required.filter((el) => (el.type === 'checkbox' ? !el.checked : !el.value.trim()));
  required.forEach((el) => el.classList.toggle('invalid', invalid.includes(el)));

  if (invalid.length) {
    errorBox.textContent = 'Revisa los campos marcados: nombre, teléfono, servicio, día y la casilla de privacidad.';
    errorBox.hidden = false;
    invalid[0].focus();
    return;
  }
  errorBox.hidden = true;

  const d = new FormData(form);
  const date = new Date(d.get('date') + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const lines = [
    '¡Hola! Me gustaría reservar cita.',
    `• Nombre: ${d.get('name')}`,
    `• Teléfono: ${d.get('phone')}`,
    `• Servicio: ${d.get('service')}`,
    `• Día: ${date} (${d.get('time').toLowerCase()})`,
  ];
  if (d.get('who') !== 'Me da igual') lines.push(`• Con: ${d.get('who')}`);
  if (d.get('notes').trim()) lines.push(`• Comentarios: ${d.get('notes').trim()}`);

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});

document.getElementById('year').textContent = new Date().getFullYear();
