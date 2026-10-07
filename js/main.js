/* Notas de Bodega — comportamiento de la web.
   Todo va en bloques try/catch: si algo falla, el contenido sigue visible. */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function urlSegura(u) {
    u = String(u || "").trim();
    return /^(https?:\/\/|mailto:|tel:|\/)/i.test(u) ? u : "";
  }
  function fechaLocal(iso) {
    var p = String(iso).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  /* Año del pie */
  try { var a = $("#anio"); if (a) a.textContent = new Date().getFullYear(); } catch (e) {}

  /* Menú móvil */
  try {
    var boton = $("#hamburguesa"), menu = $("#menu");
    if (boton && menu) {
      var cerrar = function () { menu.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); boton.setAttribute("aria-label", "Abrir menú"); };
      boton.addEventListener("click", function () {
        var abierto = menu.classList.toggle("abierto");
        boton.setAttribute("aria-expanded", abierto ? "true" : "false");
        boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
      });
      $$("a", menu).forEach(function (l) { l.addEventListener("click", cerrar); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
    }
  } catch (e) {}

  /* Sombra de la barra al hacer scroll */
  try {
    var nav = $("#nav");
    if (nav) {
      var alScroll = function () { nav.classList.toggle("con-sombra", window.scrollY > 10); };
      window.addEventListener("scroll", alScroll, { passive: true }); alScroll();
    }
  } catch (e) {}

  /* Apariciones y enlace activo del menú */
  function observarReveal(raiz) {
    try {
      var els = $$(".reveal:not(.visible)", raiz);
      if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("visible"); }); return; }
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      els.forEach(function (el) { io.observe(el); });
    } catch (e) { $$(".reveal").forEach(function (el) { el.classList.add("visible"); }); }
  }
  observarReveal(document);

  try {
    if ("IntersectionObserver" in window) {
      var enlaces = $$("#menu a");
      var secciones = enlaces.map(function (l) { return $(l.getAttribute("href")); }).filter(Boolean);
      var io2 = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) {
            enlaces.forEach(function (l) { l.setAttribute("aria-current", l.getAttribute("href") === "#" + en.target.id ? "true" : "false"); });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      secciones.forEach(function (s) { io2.observe(s); });
    }
  } catch (e) {}

  /* ===== Eventos y artistas desde data/eventos.json ===== */
  function tarjetaArtista(ar) {
    var foto = ar.foto
      ? '<img src="' + esc(ar.foto) + '-600.webp" srcset="' + esc(ar.foto) + '-600.webp 600w, ' + esc(ar.foto) + '-1000.webp 1000w" sizes="(max-width: 600px) 100vw, 440px" width="600" height="750" loading="lazy" decoding="async" alt="Foto de ' + esc(ar.nombre) + '">'
      : "";
    return '<article class="artista reveal">' + foto +
      '<div class="artista-texto">' + (ar.rol ? '<span class="etiqueta">' + esc(ar.rol) + "</span>" : "") +
      "<h3>" + esc(ar.nombre) + "</h3>" + (ar.estilos ? "<p>" + esc(ar.estilos) + "</p>" : "") + "</div></article>";
  }

  function tarjetaProximo(ev) {
    var d = fechaLocal(ev.fecha);
    var mapa = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((ev.lugar || "") + " " + (ev.zona || "") + " Gran Canaria");
    var reserva = urlSegura(ev.reserva);
    var cartel = ev.cartel
      ? '<figure class="evento-cartel"><img src="' + esc(ev.cartel) + '-400.webp" srcset="' + esc(ev.cartel) + '-400.webp 400w, ' + esc(ev.cartel) + '-800.webp 800w" sizes="(max-width: 600px) 100vw, 380px" width="400" height="566" loading="lazy" decoding="async" alt="Cartel de Notas de Bodega del ' + d.getDate() + " de " + MESES_LARGO[d.getMonth()] + " en " + esc(ev.lugar) + '"></figure>'
      : "";
    return '<article class="evento reveal">' +
      '<div class="evento-fecha"><span class="dia">' + d.getDate() + '</span><span class="mes">' + MESES[d.getMonth()] + '</span><span class="semana">' + DIAS[d.getDay()] + "</span></div>" +
      '<div class="evento-info"><h3>' + esc(ev.lugar || "Notas de Bodega") + "</h3>" +
      (ev.artista ? "<p><strong>" + esc(ev.artista) + "</strong></p>" : "") +
      '<p class="hora">' + esc(ev.hora || "") + " h</p>" +
      (ev.zona ? "<p>" + esc(ev.zona) + "</p>" : "") +
      '<a href="' + mapa + '" target="_blank" rel="noopener">Cómo llegar <span class="visualmente-oculto">(se abre en otra pestaña)</span></a>' +
      (reserva ? ' · <a href="' + esc(reserva) + '" target="_blank" rel="noopener">Reservar <span class="visualmente-oculto">(se abre en otra pestaña)</span></a>' : "") +
      "</div>" + cartel + "</article>";
  }

  /* Hora de Canarias: +01:00 entre el último domingo de marzo y el último de octubre, +00:00 el resto */
  function ultimoDomingo(anio, mes) { var d = new Date(anio, mes + 1, 0); d.setDate(d.getDate() - d.getDay()); return d; }
  function desfaseCanarias(iso) {
    var d = fechaLocal(iso), y = d.getFullYear();
    return (d >= ultimoDomingo(y, 2) && d < ultimoDomingo(y, 9)) ? "+01:00" : "+00:00";
  }

  function datosEstructurados(proximos) {
    try {
      var lista = proximos.map(function (ev) {
        var obj = {
          "@context": "https://schema.org",
          "@type": "MusicEvent",
          "name": "Notas de Bodega" + (ev.artista ? " · " + ev.artista : ""),
          "startDate": ev.fecha + (ev.hora ? "T" + ev.hora + ":00" + desfaseCanarias(ev.fecha) : ""),
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": { "@type": "Place", "name": ev.lugar, "address": (ev.zona || "") + ", Gran Canaria, España" },
          "organizer": { "@type": "Organization", "name": "Dislate Producciones SL", "url": "https://notasdebodega.es/" }
        };
        if (ev.cartel) obj.image = "https://notasdebodega.es" + ev.cartel + "-800.webp";
        if (ev.artista) obj.performer = { "@type": "Person", "name": ev.artista };
        return obj;
      });
      if (!lista.length) return;
      var s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(lista);
      document.head.appendChild(s);
    } catch (e) {}
  }

  function pintar(datos) {
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var eventos = (datos.eventos || []).filter(function (ev) { return /^\d{4}-\d{2}-\d{2}$/.test(ev.fecha || ""); })
      .sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    var proximos = eventos.filter(function (ev) { return fechaLocal(ev.fecha) >= hoy; });
    var pasados = eventos.filter(function (ev) { return fechaLocal(ev.fecha) < hoy; });

    /* Artistas */
    var la = $("#lista-artistas");
    if (la && datos.artistas && datos.artistas.length) {
      la.innerHTML = datos.artistas.map(tarjetaArtista).join("");
    }

    /* Próximos */
    var cp = $("#proximos");
    if (cp && proximos.length) {
      cp.innerHTML = proximos.map(tarjetaProximo).join("");
      datosEstructurados(proximos);
    }

    /* Ediciones anteriores, agrupadas por año y sin repetir cartel */
    var ca = $("#anteriores"), la2 = $("#lista-anteriores");
    if (ca && la2 && pasados.length) {
      var porAnio = {};
      pasados.forEach(function (ev) { var y = ev.fecha.slice(0, 4); (porAnio[y] = porAnio[y] || []).push(ev); });
      var anios = Object.keys(porAnio).sort().reverse();
      la2.innerHTML = anios.map(function (y) {
        var vistos = {}, carteles = [];
        porAnio[y].forEach(function (ev) {
          var clave = ev.cartel || ev.fecha;
          if (vistos[clave]) { vistos[clave].fechas.push(ev.fecha); return; }
          vistos[clave] = { ev: ev, fechas: [ev.fecha] }; carteles.push(vistos[clave]);
        });
        var info = (datos.ediciones && datos.ediciones[y]) || {};
        var html = '<p class="anio-edicion">Edición ' + esc(y) + "</p>" + (info.texto ? '<p class="lugar-edicion">' + esc(info.texto) + "</p>" : "");
        html += '<div class="carteles">' + carteles.map(function (c) {
          var dias = c.fechas.map(function (f) { return fechaLocal(f).getDate(); });
          var mes = MESES_LARGO[fechaLocal(c.fechas[0]).getMonth()];
          var pie = (dias.length > 1 ? dias.slice(0, -1).join(", ") + " y " + dias[dias.length - 1] : dias[0]) + " de " + mes;
          if (!c.ev.cartel) return '<figure><figcaption>' + esc(pie) + " · " + esc(c.ev.lugar) + "</figcaption></figure>";
          return '<figure><a href="' + esc(c.ev.cartel) + '-800.webp" target="_blank" rel="noopener"><img src="' + esc(c.ev.cartel) + '-400.webp" width="400" height="566" loading="lazy" decoding="async" alt="Cartel del ' + esc(pie) + " en " + esc(c.ev.lugar) + '"><figcaption>' + esc(pie) + "</figcaption></a></figure>";
        }).join("") + "</div>";
        return html;
      }).join("");
      ca.hidden = false;
    }
    observarReveal(document);
  }

  try {
    fetch("/data/eventos.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { try { pintar(d); } catch (e) {} })
      .catch(function () {});
  } catch (e) {}

})();
