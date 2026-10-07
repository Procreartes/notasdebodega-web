# Notas de Bodega — web

Web estática de **notasdebodega.com**. Proyecto de Dislate Producciones SL.
Se publica en Cloudflare (Workers con recursos estáticos) conectada a este repositorio: cada cambio en `main` se publica solo.

## Añadir o cambiar fechas

Todo está en **`data/eventos.json`**. No hay que tocar el HTML.

1. En GitHub, abre `data/eventos.json` y pulsa el lápiz (Edit).
2. Copia un bloque de `eventos` y cambia los datos:

```json
{
  "fecha": "2026-12-03",
  "hora": "20:00",
  "lugar": "Restaurante Savia",
  "zona": "Monte Lentiscal, Santa Brígida",
  "artista": "Nombre del artista",
  "cartel": "/img/carteles/2026-12-03",
  "reserva": ""
}
```

3. Pulsa **Commit changes**. En un minuto está publicado.

- Las fechas pasadas se mueven solas a **Ediciones anteriores**, agrupadas por año.
- Si dos fechas comparten cartel, pon la misma ruta en `cartel` y solo se muestra una vez en el archivo.
- `reserva` es opcional: un enlace a web, WhatsApp (`https://wa.me/34...`), etc.
- Para el texto de cada edición, añade el año en `ediciones`.

## Subir un cartel o una foto

Las imágenes van en WebP y en dos tamaños:

- Carteles: `img/carteles/NOMBRE-400.webp` y `NOMBRE-800.webp`
- Fotos de artistas: `img/fotos/NOMBRE-600.webp` y `NOMBRE-1000.webp`

En `eventos.json` o en `artistas` se pone la ruta **sin** el `-400.webp` final.

## Formulario de contacto

El formulario solo aparece cuando tiene adónde enviar. En `index.html`, en la etiqueta `<form id="formulario">`:

- `data-endpoint`: URL del webhook de n8n (empieza por `https://`).
- `data-turnstile-sitekey`: clave pública de Cloudflare Turnstile.

El webhook de n8n debe **verificar el token de Turnstile** (`cf-turnstile-response`) contra
`https://challenges.cloudflare.com/turnstile/v0/siteverify` con la clave secreta antes de enviar el correo.
Recibe JSON con: `nombre`, `apellidos`, `email`, `asunto`, `mensaje`, `privacidad`, `cf-turnstile-response`, `origen`.

## Qué incluye

Aviso legal, privacidad y cookies · favicon e iconos · `sitemap.xml` y `robots.txt` · página 404 ·
imagen para compartir en redes (`og:image`) · textos ALT · imágenes WebP con carga diferida ·
tipografías alojadas en la propia web (sin llamadas a Google) · cabeceras de seguridad en `_headers` ·
datos estructurados de eventos para Google · formulario validado con antispam.

Analítica: activar **Cloudflare Web Analytics** desde el panel (no usa cookies, no necesita banner).
