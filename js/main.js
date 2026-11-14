/* =========================================================
   OUR STORY — main.js
   Etapa 1: utilidades del sistema de diseño
   ========================================================= */

/* PRNG determinista (mulberry32) a partir de una semilla string */
function crearSemilla(texto) {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const PALETA_FONDOS_RANSOM = [
  'var(--crema)', 'var(--papel-viejo)', 'var(--azul-petroleo)',
  'var(--terracota)', 'var(--mostaza)', 'var(--rosa-empolvado)', '#FBF6EC'
];

function colorTextoContraste(fondoVar) {
  const oscuros = ['var(--azul-petroleo)', 'var(--terracota)'];
  if (oscuros.includes(fondoVar)) return 'var(--hueso)';
  return 'var(--tinta)';
}

/**
 * Convierte una palabra en un bloque de "letras recortadas" (ransom note).
 * semilla: string fijo para que el resultado sea igual en cada carga.
 */
function crearPalabraRecortada(palabra, semilla) {
  const rand = crearSemilla(semilla + '::' + palabra);
  const contenedor = document.createElement('span');
  contenedor.className = 'ransom-word';

  palabra.split(' ').forEach((sub) => {
    const chunk = document.createElement('span');
    chunk.className = 'ransom-word-chunk';

    [...sub].forEach((letra) => {
      const fondo = PALETA_FONDOS_RANSOM[Math.floor(rand() * PALETA_FONDOS_RANSOM.length)];
      const fuenteIdx = Math.floor(rand() * 5);
      const rotacion = (rand() * 12 - 6).toFixed(2);
      const offsetY = (rand() * 10 - 5).toFixed(1);
      const escala = (0.92 + rand() * 0.22).toFixed(2);

      const el = document.createElement('span');
      el.className = `ransom-letter rn-font-${fuenteIdx}`;
      el.textContent = letra;
      el.style.background = fondo;
      el.style.color = colorTextoContraste(fondo);
      el.style.fontSize = `calc(1em * ${escala})`;
      el.style.transform = `rotate(${rotacion}deg) translateY(${offsetY}px)`;
      chunk.appendChild(el);
    });

    contenedor.appendChild(chunk);
  });

  return contenedor;
}

function pintarPalabrasRecortadas() {
  document.querySelectorAll('[data-ransom]').forEach((nodo) => {
    const palabra = nodo.getAttribute('data-ransom');
    const semilla = nodo.getAttribute('data-seed') || 'our-story-2026';
    nodo.innerHTML = '';
    nodo.appendChild(crearPalabraRecortada(palabra, semilla));
  });
}

function crearMotasDoradas(contenedorSel, cantidad) {
  const contenedor = document.querySelector(contenedorSel);
  if (!contenedor) return;
  const rand = crearSemilla('motas-doradas');
  for (let i = 0; i < cantidad; i++) {
    const mota = document.createElement('div');
    mota.className = 'mota';
    mota.style.left = `${(rand() * 100).toFixed(1)}%`;
    mota.style.top = `${(rand() * 100).toFixed(1)}%`;
    mota.style.animationDelay = `${(rand() * 9).toFixed(1)}s`;
    mota.style.animationDuration = `${(7 + rand() * 6).toFixed(1)}s`;
    contenedor.appendChild(mota);
  }
}

/* =========================================================
   Etapa 3: apertura del libro (Escena 1)
   ========================================================= */

function prefiereMovimientoReducido() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* =========================================================
   Sonido opcional (si los archivos no existen, no pasa nada)
   ========================================================= */
const audioPagina = document.getElementById('audio-pagina');
const audioMusica = document.getElementById('audio-musica');
let audioListo = false;

function activarAudioTrasPrimerToque() {
  if (audioListo) return;
  audioListo = true;
  if (audioMusica) {
    audioMusica.volume = 0.32;
    audioMusica.play().catch(() => {});
  }
}

function reproducirSonidoPagina() {
  if (!audioPagina) return;
  try {
    audioPagina.currentTime = 0;
    audioPagina.play().catch(() => {});
  } catch (e) { /* sin archivo de audio: la invitación sigue igual */ }
}

function inicializarBotonSilencio() {
  const boton = document.getElementById('boton-silencio');
  if (!boton) return;
  boton.addEventListener('click', () => {
    const silenciado = boton.classList.toggle('silenciado');
    if (audioMusica) audioMusica.muted = silenciado;
    if (audioPagina) audioPagina.muted = silenciado;
  });
}

function crearParticulasDoradas(contenedorSel, cantidad) {
  const contenedor = document.querySelector(contenedorSel);
  if (!contenedor || typeof gsap === 'undefined') return;
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('div');
    p.className = 'mota';
    p.style.left = '50%';
    p.style.top = '50%';
    p.style.animation = 'none';
    contenedor.appendChild(p);

    const angulo = Math.random() * Math.PI * 2;
    const distancia = 60 + Math.random() * 90;
    gsap.fromTo(p,
      { opacity: 0, x: 0, y: 0, scale: 0.5 },
      {
        opacity: 0.9,
        x: Math.cos(angulo) * distancia,
        y: Math.sin(angulo) * distancia - 30,
        scale: 1.2,
        duration: 1.4 + Math.random() * 0.6,
        ease: 'power1.out',
        onComplete: () => {
          gsap.to(p, { opacity: 0, duration: 0.5, onComplete: () => p.remove() });
        }
      }
    );
  }
}

function iniciarAperturaLibro() {
  if (typeof gsap === 'undefined') {
    mostrarEscenaFinalDirecta();
    return;
  }

  const escenaPortada = document.getElementById('escena-portada');
  const camara = document.getElementById('camara-libro');
  const tapa = document.getElementById('pagina-tapa');
  const escenaPopup = document.getElementById('escena-popup');
  const resplandor = escenaPortada.querySelector('.resplandor-apertura');
  const flip1 = escenaPortada.querySelector('.pagina-flip-1');
  const flip2 = escenaPortada.querySelector('.pagina-flip-2');
  const tocaAbrir = escenaPortada.querySelector('.toca-abrir');

  escenaPortada.style.cursor = 'default';
  escenaPortada.removeEventListener('click', iniciarAperturaLibro);
  gsap.to(tocaAbrir, { opacity: 0, duration: 0.4 });
  document.getElementById('libro-cerrado').style.animation = 'none';

  activarAudioTrasPrimerToque();
  reproducirSonidoPagina();

  const tl = gsap.timeline();

  tl.to(camara, { scale: 1.15, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(tapa, { rotateY: -180, duration: 1.2, ease: 'power3.inOut' }, 0.1)
    .to(resplandor, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.5)
    .call(() => crearParticulasDoradas('.escena-portada', 14), null, 0.7)
    .to(flip1, { rotateY: -165, duration: 0.22, ease: 'power1.inOut' }, 1.0)
    .to(flip2, { rotateY: -165, duration: 0.22, ease: 'power1.inOut' }, 1.15)
    .to(resplandor, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 1.3)
    .to(escenaPortada, {
      opacity: 0,
      duration: 0.5,
      ease: 'power1.in',
      onComplete: () => { escenaPortada.classList.add('oculta'); }
    }, 1.55)
    .call(() => { escenaPopup.classList.remove('oculta'); }, null, 2.0)
    .fromTo(escenaPopup, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power1.out' }, 2.0)
    .call(() => iniciarEscenaPopup(), null, 2.1);
}

function iniciarEscenaPopup() {
  const popups = gsap.utils.toArray('.popup');
  gsap.to(popups, {
    rotateX: 0,
    duration: 0.7,
    ease: 'back.out(1.5)',
    stagger: 0.14
  });

  gsap.delayedCall(popups.length * 0.14 + 1.6, () => cruzarEscenas('escena-popup', 'escena-mensaje', iniciarEscenaMensaje));
}

function cruzarEscenas(idOrigen, idDestino, alLlegar) {
  const origen = document.getElementById(idOrigen);
  const destino = document.getElementById(idDestino);
  const tl = gsap.timeline();
  tl.to(origen, {
    opacity: 0,
    duration: 0.6,
    ease: 'power1.in',
    onComplete: () => origen.classList.add('oculta')
  })
  .call(() => destino.classList.remove('oculta'))
  .fromTo(destino, { opacity: 0 }, {
    opacity: 1,
    duration: 0.7,
    ease: 'power1.out',
    onComplete: () => { if (typeof alLlegar === 'function') alLlegar(); }
  });
  return tl;
}

function iniciarEscenaMensaje() {
  const contenedor = document.getElementById('escena-mensaje');
  const coberturas = contenedor.querySelectorAll('.cubierta-reveal');
  const estrellas = contenedor.querySelectorAll('.mensaje-estrella');
  const flores = contenedor.querySelectorAll('.mensaje-flor');
  const ondulada = contenedor.querySelector('.mensaje-linea-ondulada');
  const subrayado = contenedor.querySelector('.subrayado-dorado');

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to(coberturas, { scaleX: 0, duration: 1.0, ease: 'power2.out', stagger: 0.55 })
    .to(ondulada, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.4)
    .to(estrellas, {
      opacity: 1,
      scale: 1.3,
      duration: 0.3,
      ease: 'power1.out',
      stagger: 0.2,
      yoyo: true,
      repeat: 1
    }, 0.9)
    .to(subrayado, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 1.8)
    .to(flores, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.6)',
      stagger: 0.2
    }, 1.6);

  gsap.delayedCall(4.6, () => cruzarEscenas('escena-mensaje', 'escena-final'));
}

function mostrarEscenaFinalDirecta() {
  const escenaPortada = document.getElementById('escena-portada');
  const escenaPopup = document.getElementById('escena-popup');
  const escenaMensaje = document.getElementById('escena-mensaje');
  const escenaFinal = document.getElementById('escena-final');
  if (escenaPortada) escenaPortada.classList.add('oculta');
  if (escenaPopup) escenaPopup.classList.add('oculta');
  if (escenaMensaje) escenaMensaje.classList.add('oculta');
  if (escenaFinal) escenaFinal.classList.remove('oculta');
}

function inicializarSecuencia() {
  const escenaPortada = document.getElementById('escena-portada');
  if (!escenaPortada) return;

  if (prefiereMovimientoReducido()) {
    mostrarEscenaFinalDirecta();
    return;
  }

  escenaPortada.addEventListener('click', iniciarAperturaLibro, { once: true });
}

function reiniciarSecuencia() {
  const escenaPortada = document.getElementById('escena-portada');
  const escenaPopup = document.getElementById('escena-popup');
  const escenaMensaje = document.getElementById('escena-mensaje');
  const escenaFinal = document.getElementById('escena-final');
  const camara = document.getElementById('camara-libro');
  const tapa = document.getElementById('pagina-tapa');
  const libroCerrado = document.getElementById('libro-cerrado');
  const resplandor = escenaPortada.querySelector('.resplandor-apertura');
  const flip1 = escenaPortada.querySelector('.pagina-flip-1');
  const flip2 = escenaPortada.querySelector('.pagina-flip-2');
  const tocaAbrir = escenaPortada.querySelector('.toca-abrir');

  gsap.killTweensOf('*');

  // volver todo a su estado inicial
  gsap.set([camara, tapa, flip1, flip2, resplandor, tocaAbrir], { clearProps: 'all' });
  gsap.set('.popup', { clearProps: 'transform' });
  gsap.set(escenaMensaje.querySelectorAll('.cubierta-reveal'), { clearProps: 'all' });
  gsap.set(escenaMensaje.querySelectorAll('.mensaje-estrella, .mensaje-flor'), { clearProps: 'all' });
  gsap.set(escenaMensaje.querySelector('.subrayado-dorado'), { clearProps: 'all' });
  gsap.set([escenaPortada, escenaPopup, escenaMensaje, escenaFinal], { clearProps: 'opacity' });

  libroCerrado.style.animation = '';

  escenaFinal.classList.add('oculta');
  escenaMensaje.classList.add('oculta');
  escenaPopup.classList.add('oculta');
  escenaPortada.classList.remove('oculta');

  escenaPortada.style.cursor = 'pointer';
  escenaPortada.addEventListener('click', iniciarAperturaLibro, { once: true });
}

function inicializarBotonReinicio() {
  const boton = document.getElementById('boton-reiniciar');
  if (boton) boton.addEventListener('click', reiniciarSecuencia);
}

document.addEventListener('DOMContentLoaded', () => {
  pintarPalabrasRecortadas();
  crearMotasDoradas('.motas-doradas', 28);
  inicializarSecuencia();
  inicializarBotonSilencio();
  inicializarBotonReinicio();
});
