/* play.js
 * Reproductor de video full-screen (estilos + lógica + estructura).
 * Uso:
 *   Player.open(item, { mode: 'pelicula' | 'serie' | 'libre' });
 *   Player.close();
 * Requiere: listmovie.js (window.LISTMOVIE_API) cargado antes.
 *
 * Modos:
 *  - pelicula : al terminar, elige aleatorio (LISTMOVIE_API.pickRandomNext)
 *  - serie    : respeta orden de episodios de la serie; al agotarse, aleatorio
 *  - libre    : arranca en el episodio seleccionado; continúa con el siguiente
 *               de la misma serie; si se acaba la serie, aleatorio
 */
(function () {
  "use strict";

  /* ============================================================
     ESTILOS
     ============================================================ */
  const CSS = `
  #lv-player, #lv-player * { box-sizing: border-box; }
  #lv-player {
    position: fixed; inset: 0; z-index: 99999;
    background: #000; color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    user-select: none; -webkit-user-select: none;
    display: none;
  }
  #lv-player.open { display: block; }
  #lv-player .lv-stage {
    position: absolute; inset: 0; display: flex; align-items: stretch;
    transition: transform .35s ease, width .35s ease;
  }
  #lv-player .lv-video-wrap {
    position: relative; flex: 1 1 auto; min-width: 0; background: #000;
    transition: flex-basis .35s ease;
  }
  #lv-player.list-open .lv-video-wrap { flex: 0 0 68%; }
  #lv-player video { width: 100%; height: 100%; object-fit: contain; background:#000; display:block; }

  /* Degradados + zona de controles */
  #lv-player .lv-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to bottom, rgba(0,0,0,.75) 0%, rgba(0,0,0,.15) 22%, rgba(0,0,0,0) 45%,
                                 rgba(0,0,0,0) 55%, rgba(0,0,0,.25) 78%, rgba(0,0,0,.85) 100%);
    opacity: 0; transition: opacity .25s ease;
  }
  #lv-player.controls-on .lv-overlay { opacity: 1; }
  #lv-player.controls-on { cursor: default; }
  #lv-player.controls-off { cursor: none; }

  /* Barras superior e inferior */
  #lv-player .lv-topbar, #lv-player .lv-bottombar {
    position: absolute; left: 0; right: 0; padding: 18px 22px;
    display: flex; align-items: center; gap: 14px;
    opacity: 0; transform: translateY(-6px); transition: opacity .25s, transform .25s;
    pointer-events: none;
  }
  #lv-player .lv-bottombar { bottom: 0; top: auto; transform: translateY(6px); flex-direction: column; align-items: stretch; gap: 8px; }
  #lv-player .lv-topbar { top: 0; }
  #lv-player.controls-on .lv-topbar,
  #lv-player.controls-on .lv-bottombar { opacity: 1; transform: translateY(0); pointer-events: auto; }

  #lv-player .lv-title {
    flex: 1 1 auto; text-align: center; min-width: 0;
  }
  #lv-player .lv-title .t1 { font-size: 18px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #lv-player .lv-title .t2 { font-size: 13px; opacity: .8; margin-top: 2px; }

  #lv-player button.lv-btn {
    background: rgba(255,255,255,.08); color: #fff; border: 1px solid rgba(255,255,255,.12);
    width: 40px; height: 40px; border-radius: 999px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .15s, transform .1s;
    padding: 0;
  }
  #lv-player button.lv-btn:hover { background: rgba(255,255,255,.18); }
  #lv-player button.lv-btn:active { transform: scale(.94); }
  #lv-player button.lv-btn svg { width: 20px; height: 20px; fill: currentColor; }

  #lv-player .lv-top-right { display: flex; gap: 8px; }
  #lv-player .lv-top-left  { display: flex; gap: 8px; }

  /* Progress */
  #lv-player .lv-progress {
    position: relative; height: 6px; background: #3a3a3a; border-radius: 999px; cursor: pointer;
    transition: height .15s;
  }
  #lv-player .lv-progress:hover { height: 10px; }
  #lv-player .lv-buffer, #lv-player .lv-played {
    position: absolute; top: 0; bottom: 0; left: 0; border-radius: 999px; pointer-events: none;
  }
  #lv-player .lv-buffer { background: #bfbfbf; width: 0%; }
  #lv-player .lv-played { background: #fff; width: 0%; }
  #lv-player .lv-thumb {
    position: absolute; top: 50%; transform: translate(-50%, -50%);
    width: 14px; height: 14px; background: #fff; border-radius: 50%; pointer-events: none;
    box-shadow: 0 0 0 4px rgba(255,255,255,.15);
    opacity: 0; transition: opacity .15s;
  }
  #lv-player .lv-progress:hover .lv-thumb { opacity: 1; }

  /* Barra de controles inferiores */
  #lv-player .lv-controls { display: flex; align-items: center; gap: 10px; }
  #lv-player .lv-controls .lv-spacer { flex: 1 1 auto; }
  #lv-player .lv-time { font-variant-numeric: tabular-nums; font-size: 13px; opacity: .9; margin: 0 6px; }

  /* Volumen */
  #lv-player .lv-vol { display: flex; align-items: center; gap: 6px; }
  #lv-player .lv-vol input[type=range] {
    -webkit-appearance: none; appearance: none; width: 90px; height: 4px; background: #555; border-radius: 999px; outline: none;
  }
  #lv-player .lv-vol input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; cursor: pointer;
  }

  /* Menús popover */
  #lv-player .lv-menu {
    position: absolute; bottom: 96px; right: 22px;
    background: rgba(18,18,18,.96); border: 1px solid rgba(255,255,255,.08);
    border-radius: 10px; min-width: 180px; padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,.5);
    display: none; z-index: 5;
  }
  #lv-player .lv-menu.show { display: block; }
  #lv-player .lv-menu .item {
    padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; justify-content: space-between; gap: 12px;
  }
  #lv-player .lv-menu .item:hover { background: rgba(255,255,255,.08); }
  #lv-player .lv-menu .item.active::after { content: "✓"; opacity: .9; }
  #lv-player .lv-menu .head { padding: 6px 12px; font-size: 12px; opacity: .6; text-transform: uppercase; letter-spacing: .06em; }

  /* Indicadores */
  #lv-player .lv-indicator {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 90px; height: 90px; border-radius: 50%;
    background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: opacity .35s, transform .35s;
  }
  #lv-player .lv-indicator svg { width: 44px; height: 44px; fill: #fff; }
  #lv-player .lv-indicator.show { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
  #lv-player .lv-indicator.left  { left: 18%; }
  #lv-player .lv-indicator.right { left: 82%; }

  /* Botones skip */
  #lv-player .lv-skips {
    position: absolute; right: 22px; bottom: 130px; display: flex; gap: 10px; z-index: 4;
  }
  #lv-player .lv-skip-btn {
    background: rgba(255,255,255,.92); color: #111; border: none; padding: 10px 16px;
    border-radius: 8px; font-weight: 700; cursor: pointer; letter-spacing: .02em;
    box-shadow: 0 6px 18px rgba(0,0,0,.4);
  }
  #lv-player .lv-skip-btn.ghost { background: rgba(0,0,0,.55); color: #fff; border: 1px solid rgba(255,255,255,.35); }
  #lv-player .lv-skip-btn small { display:block; font-size:11px; opacity:.7; font-weight:500; }

  /* Info panel */
  #lv-player .lv-info {
    position: absolute; inset: 0; z-index: 8;
    background: linear-gradient(180deg, rgba(0,0,0,.85), rgba(20,20,20,.7));
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    display: none; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 40px;
  }
  #lv-player .lv-info.show { display: flex; }
  #lv-player .lv-info .info-close {
    position: absolute; top: 18px; right: 18px;
  }
  #lv-player .lv-info h1 { font-size: clamp(28px, 5vw, 56px); font-weight: 800; margin: 0 0 12px; }
  #lv-player .lv-info .sub { font-size: 16px; opacity: .8; margin-bottom: 28px; }
  #lv-player .lv-info .info-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  #lv-player .lv-info .info-actions button {
    background: #fff; color: #111; border: none; padding: 12px 22px; border-radius: 8px;
    font-weight: 700; cursor: pointer; font-size: 15px;
  }
  #lv-player .lv-info .info-actions button.secondary { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3); }

  /* Lista lateral */
  #lv-player .lv-list {
    flex: 0 0 32%; background: #0d0d0d; border-left: 1px solid rgba(255,255,255,.06);
    display: none; flex-direction: column; overflow: hidden;
  }
  #lv-player.list-open .lv-list { display: flex; }
  #lv-player .lv-list header {
    padding: 16px 18px; display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }
  #lv-player .lv-list header h3 { margin:0; font-size: 16px; flex: 1; }
  #lv-player .lv-list .list-body { flex: 1; overflow-y: auto; padding: 8px; }
  #lv-player .lv-list .season { padding: 12px 10px 4px; font-size: 12px; opacity: .6; text-transform: uppercase; letter-spacing: .08em; }
  #lv-player .lv-list .li-item {
    display: flex; gap: 10px; padding: 8px; border-radius: 8px; cursor: pointer; align-items: center;
  }
  #lv-player .lv-list .li-item:hover { background: rgba(255,255,255,.06); }
  #lv-player .lv-list .li-item.playing { background: rgba(255,255,255,.1); outline: 1px solid rgba(255,255,255,.15); }
  #lv-player .lv-list .li-item img { width: 110px; height: 62px; object-fit: cover; border-radius: 6px; background: #222; flex: 0 0 auto; }
  #lv-player .lv-list .li-item .meta { flex:1; min-width:0; }
  #lv-player .lv-list .li-item .meta .n { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #lv-player .lv-list .li-item .meta .d { font-size: 12px; opacity: .6; }

  /* Loader */
  #lv-player .lv-loader {
    position: absolute; inset: 0; display: none; align-items: center; justify-content: center; pointer-events: none;
  }
  #lv-player.loading .lv-loader { display: flex; }
  #lv-player .lv-loader .spin {
    width: 54px; height: 54px; border: 4px solid rgba(255,255,255,.2);
    border-top-color: #fff; border-radius: 50%; animation: lv-spin 1s linear infinite;
  }
  @keyframes lv-spin { to { transform: rotate(360deg); } }

  @media (max-width: 700px) {
    #lv-player.list-open .lv-video-wrap { flex: 0 0 55%; }
    #lv-player .lv-list { flex: 0 0 45%; }
    #lv-player .lv-vol input[type=range] { width: 60px; }
    #lv-player button.lv-btn { width: 36px; height: 36px; }
  }
  `;

  /* ============================================================
     ICONOS SVG
     ============================================================ */
  const ICO = {
    close: '<svg viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.3 6.3-1.41-1.42L9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z"/></svg>',
    play:  '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    back10:'<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/><text x="12" y="15" font-size="7" text-anchor="middle" fill="#fff" font-weight="700">10</text></svg>',
    fwd10: '<svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a5 5 0 1 0 5 5h2a7 7 0 1 1-7-7z"/><text x="12" y="15" font-size="7" text-anchor="middle" fill="#fff" font-weight="700">10</text></svg>',
    vol:   '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.74 2.5-2.25 2.5-4.02z"/></svg>',
    mute:  '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1-3.29-2.5-4.03V10l2.47 2.47c.02-.16.03-.31.03-.47zM19 12c0 .94-.2 1.83-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.17v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>',
    prev:  '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z"/></svg>',
    next:  '<svg viewBox="0 0 24 24"><path d="M6 6l8.5 6L6 18zM16 6h2v12h-2z"/></svg>',
    list:  '<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z"/></svg>',
    speed: '<svg viewBox="0 0 24 24"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.6 1.53c.56-1.24.9-2.62.9-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05C5.94 2.55 2 6.81 2 12c0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/></svg>',
    gear:  '<svg viewBox="0 0 24 24"><path d="M19.14 12.94a7.99 7.99 0 0 0 .05-1.88l2.03-1.58a.5.5 0 0 0 .11-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.94 2h-3.84a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.72 8.48a.5.5 0 0 0 .11.63l2.03 1.58a7.99 7.99 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.11.63l1.92 3.32c.14.24.42.34.6.22l2.39-.96c.5.39 1.03.7 1.62.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.19.08.46-.02.6-.22l1.92-3.32a.5.5 0 0 0-.11-.63l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>',
    fs:    '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zM5 10h2V7h3V5H5v5zM17 17h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    fsx:   '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
    quality:'<svg viewBox="0 0 24 24"><path d="M12 2 2 7l10 5 10-5-10-5zm0 8L2 15l10 5 10-5-10-5z"/></svg>',
    subs:  '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM4 12h4v2H4zm10 6H4v-2h10zm6 0h-4v-2h4zm0-4H10v-2h10z"/></svg>',
    pip:   '<svg viewBox="0 0 24 24"><path d="M19 11h-8v6h8v-6zm4 8V4.98A2 2 0 0 0 20.99 3H3A2 2 0 0 0 1 5v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M18 16.08a2.99 2.99 0 0 0-2.02.8l-7.05-4.11c.05-.25.07-.5.07-.77s-.02-.52-.07-.77l6.98-4.07c.54.5 1.25.79 2.04.79a3 3 0 1 0-3-3c0 .27.02.52.07.77L8.04 9.79A3 3 0 1 0 8.04 14.21l7.05 4.11c-.05.25-.07.51-.07.77a2.92 2.92 0 1 0 2.98-3z"/></svg>'
  };

  /* ============================================================
     ESTADO
     ============================================================ */
  const state = {
    root: null,
    video: null,
    current: null,          // item actual
    mode: "pelicula",       // pelicula | serie | libre
    serieId: null,          // en modo serie/libre
    playlist: [],           // episodios ordenados (modo serie/libre)
    index: -1,              // índice dentro de playlist
    quality: "auto",
    availableQualities: [],
    speed: 1,
    hideTimer: null,
    pauseInfoTimer: null,
    skipShown: { intro: false, recap: false, credits: false },
    creditsTimer: null,
    creditsCancelled: false,
    userInteracting: false,
    lastClickTs: 0,
    subtitlesUrl: null,
    subtitlesOn: false
  };

  /* ============================================================
     PROGRESO en localStorage
     ============================================================ */
  const PROGRESS_KEY = "lv_player_progress_v1";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveProgress(id, time, duration) {
    if (!id || !duration) return;
    const data = loadProgress();
    if (time > 3 && time < duration - 5) {
      data[id] = { t: time, d: duration, at: Date.now() };
    } else {
      delete data[id];
    }
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function getProgress(id) {
    const d = loadProgress()[id];
    return d ? d.t : 0;
  }

  /* ============================================================
     DETECCIÓN DE CALIDAD SEGÚN CONEXIÓN
     ============================================================ */
  function autoQuality(urls) {
    const keys = Object.keys(urls || {});
    if (!keys.length) return null;
    let pref = "SD";
    const c = navigator.connection;
    if (c && c.effectiveType) {
      if (c.effectiveType.includes("4g")) pref = "HD";
      else if (c.effectiveType.includes("3g")) pref = "SD";
      else pref = "LOW";
    } else {
      pref = "HD";
    }
    if (urls[pref]) return pref;
    // Fallback: primer disponible en orden HD > SD > LOW
    return ["HD", "SD", "LOW"].find(k => urls[k]) || keys[0];
  }

  /* ============================================================
     RENDER: crear el DOM del reproductor
     ============================================================ */
  function ensureRoot() {
    if (state.root) return;
    const style = document.createElement("style");
    style.id = "lv-player-style";
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = document.createElement("div");
    root.id = "lv-player";
    root.innerHTML = `
      <div class="lv-stage">
        <div class="lv-video-wrap">
          <video playsinline preload="metadata"></video>
          <div class="lv-overlay"></div>

          <div class="lv-loader"><div class="spin"></div></div>

          <div class="lv-indicator" data-ind="center"></div>
          <div class="lv-indicator left"  data-ind="left"></div>
          <div class="lv-indicator right" data-ind="right"></div>

          <div class="lv-topbar">
            <div class="lv-top-left">
              <button class="lv-btn" data-act="close" title="Cerrar">${ICO.close}</button>
            </div>
            <div class="lv-title">
              <div class="t1"></div>
              <div class="t2"></div>
            </div>
            <div class="lv-top-right">
              <button class="lv-btn" data-act="quality"  title="Calidad">${ICO.quality}</button>
              <button class="lv-btn" data-act="subs"     title="Subtítulos">${ICO.subs}</button>
              <button class="lv-btn" data-act="pip"      title="Picture in Picture">${ICO.pip}</button>
            </div>
          </div>

          <div class="lv-skips"></div>

          <div class="lv-bottombar">
            <div class="lv-progress">
              <div class="lv-buffer"></div>
              <div class="lv-played"></div>
              <div class="lv-thumb"></div>
            </div>
            <div class="lv-controls">
              <button class="lv-btn" data-act="playpause" title="Play/Pausa">${ICO.play}</button>
              <button class="lv-btn" data-act="back10"    title="-10s">${ICO.back10}</button>
              <button class="lv-btn" data-act="fwd10"     title="+10s">${ICO.fwd10}</button>
              <div class="lv-vol">
                <button class="lv-btn" data-act="mute" title="Silenciar">${ICO.vol}</button>
                <input type="range" min="0" max="1" step="0.01" value="1">
              </div>
              <div class="lv-time"><span class="cur">0:00</span> / <span class="dur">0:00</span></div>
              <div class="lv-spacer"></div>
              <button class="lv-btn" data-act="prev"   title="Anterior">${ICO.prev}</button>
              <button class="lv-btn" data-act="next"   title="Siguiente">${ICO.next}</button>
              <button class="lv-btn" data-act="list"   title="Lista">${ICO.list}</button>
              <button class="lv-btn" data-act="speed"  title="Velocidad">${ICO.speed}</button>
              <button class="lv-btn" data-act="config" title="Configuración">${ICO.gear}</button>
              <button class="lv-btn" data-act="fs"     title="Pantalla completa">${ICO.fs}</button>
            </div>
          </div>

          <div class="lv-menu" data-menu="quality"></div>
          <div class="lv-menu" data-menu="subs"></div>
          <div class="lv-menu" data-menu="speed"></div>
          <div class="lv-menu" data-menu="config"></div>

          <div class="lv-info">
            <button class="lv-btn info-close" data-act="info-close" title="Cerrar">${ICO.close}</button>
            <h1></h1>
            <div class="sub"></div>
            <div class="info-actions"></div>
          </div>
        </div>

        <aside class="lv-list">
          <header>
            <h3></h3>
            <button class="lv-btn" data-act="list-close" title="Cerrar lista">${ICO.close}</button>
          </header>
          <div class="list-body"></div>
        </aside>
      </div>
    `;
    document.body.appendChild(root);
    state.root  = root;
    state.video = root.querySelector("video");

    bindEvents();
  }

  /* ============================================================
     EVENTOS
     ============================================================ */
  function bindEvents() {
    const root = state.root, v = state.video;

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (btn) { handleAction(btn.dataset.act, btn); return; }
      // click sobre video area?
      const inVideo = e.target.closest(".lv-video-wrap") && !e.target.closest(".lv-topbar,.lv-bottombar,.lv-menu,.lv-info,.lv-skips");
      if (!inVideo) return;
      const now = Date.now();
      if (now - state.lastClickTs < 280) {
        state.lastClickTs = 0;
        toggleFullscreen();
      } else {
        state.lastClickTs = now;
        setTimeout(() => {
          if (state.lastClickTs && Date.now() - state.lastClickTs >= 260) {
            state.lastClickTs = 0;
            togglePlay();
          }
        }, 280);
      }
    });

    root.addEventListener("mousemove", showControls);
    root.addEventListener("mouseleave", () => scheduleHide(400));

    // Video events
    v.addEventListener("loadedmetadata", () => { updateTime(); });
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("progress", updateBuffer);
    v.addEventListener("play",  () => { updatePlayBtn(); flashIndicator("center", ICO.play); clearPauseInfoTimer(); });
    v.addEventListener("pause", () => { updatePlayBtn(); if (!v.ended) { flashIndicator("center", ICO.pause); armPauseInfoTimer(); } });
    v.addEventListener("ended", onEnded);
    v.addEventListener("waiting", () => root.classList.add("loading"));
    v.addEventListener("canplay", () => root.classList.remove("loading"));
    v.addEventListener("volumechange", () => {
      root.querySelector(".lv-vol input").value = v.muted ? 0 : v.volume;
      root.querySelector('[data-act="mute"]').innerHTML = (v.muted || v.volume === 0) ? ICO.mute : ICO.vol;
    });

    // Progress bar
    const prog = root.querySelector(".lv-progress");
    prog.addEventListener("click", (e) => {
      const r = prog.getBoundingClientRect();
      const p = (e.clientX - r.left) / r.width;
      if (isFinite(v.duration)) v.currentTime = Math.max(0, Math.min(1, p)) * v.duration;
    });
    prog.addEventListener("mousemove", (e) => {
      const r = prog.getBoundingClientRect();
      const p = (e.clientX - r.left) / r.width;
      root.querySelector(".lv-thumb").style.left = (p * 100) + "%";
    });

    // Volume slider
    root.querySelector(".lv-vol input").addEventListener("input", (e) => {
      v.volume = parseFloat(e.target.value);
      v.muted = v.volume === 0;
    });

    // Teclado
    document.addEventListener("keydown", onKey);

    // fullscreen change
    document.addEventListener("fullscreenchange", () => {
      const btn = root.querySelector('[data-act="fs"]');
      if (btn) btn.innerHTML = document.fullscreenElement ? ICO.fsx : ICO.fs;
    });
  }

  function onKey(e) {
    if (!state.root.classList.contains("open")) return;
    if (["INPUT","TEXTAREA"].includes((e.target && e.target.tagName) || "")) return;
    switch (e.key) {
      case " ": case "k": e.preventDefault(); togglePlay(); break;
      case "ArrowLeft":  seek(-10); break;
      case "ArrowRight": seek(+10); break;
      case "ArrowUp":   state.video.volume = Math.min(1, state.video.volume + .1); break;
      case "ArrowDown": state.video.volume = Math.max(0, state.video.volume - .1); break;
      case "f": toggleFullscreen(); break;
      case "m": state.video.muted = !state.video.muted; break;
      case "Escape":
        if (document.fullscreenElement) { /* let browser exit */ }
        else if (state.root.querySelector(".lv-info.show")) hideInfo();
        else close();
        break;
    }
    showControls();
  }

  function handleAction(act, btn) {
    switch (act) {
      case "close":      close(); break;
      case "playpause":  togglePlay(); break;
      case "back10":     seek(-10); flashIndicator("left",  ICO.back10); break;
      case "fwd10":      seek(+10); flashIndicator("right", ICO.fwd10); break;
      case "mute":       state.video.muted = !state.video.muted; break;
      case "prev":       prev(); break;
      case "next":       next("user"); break;
      case "list":       toggleList(); break;
      case "list-close": state.root.classList.remove("list-open"); break;
      case "fs":         toggleFullscreen(); break;
      case "pip":        togglePip(); break;
      case "quality":    toggleMenu("quality", btn); break;
      case "subs":       toggleMenu("subs", btn); break;
      case "speed":      toggleMenu("speed", btn); break;
      case "config":     toggleMenu("config", btn); break;
      case "info-close": hideInfo(); break;
    }
  }

  /* ============================================================
     CONTROLES: mostrar/ocultar
     ============================================================ */
  function showControls() {
    state.root.classList.add("controls-on");
    state.root.classList.remove("controls-off");
    scheduleHide();
  }
  function scheduleHide(ms = 2800) {
    clearTimeout(state.hideTimer);
    state.hideTimer = setTimeout(() => {
      if (state.root.querySelector(".lv-menu.show")) return; // no ocultes con menú abierto
      if (state.video.paused) return;                        // pausado: mantener controles
      state.root.classList.remove("controls-on");
      state.root.classList.add("controls-off");
      closeAllMenus();
    }, ms);
  }

  /* ============================================================
     PLAY / PAUSE / SEEK / FULLSCREEN
     ============================================================ */
  function togglePlay() {
    if (state.video.paused) state.video.play().catch(()=>{});
    else state.video.pause();
  }
  function seek(delta) {
    if (!isFinite(state.video.duration)) return;
    state.video.currentTime = Math.max(0, Math.min(state.video.duration, state.video.currentTime + delta));
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else state.root.requestFullscreen().catch(()=>{});
  }
  function togglePip() {
    const v = state.video;
    try {
      if (document.pictureInPictureElement) document.exitPictureInPicture();
      else if (v.requestPictureInPicture) v.requestPictureInPicture();
    } catch (e) {}
  }

  function updatePlayBtn() {
    state.root.querySelector('[data-act="playpause"]').innerHTML =
      state.video.paused ? ICO.play : ICO.pause;
  }

  /* ============================================================
     INDICADORES
     ============================================================ */
  function flashIndicator(where, svg) {
    const el = state.root.querySelector(`.lv-indicator[data-ind="${where}"]`);
    if (!el) return;
    el.innerHTML = svg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 450);
  }

  /* ============================================================
     TIEMPO / PROGRESO / SKIPS
     ============================================================ */
  function fmt(t) {
    if (!isFinite(t)) return "0:00";
    t = Math.max(0, Math.floor(t));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }
  function updateTime() {
    state.root.querySelector(".lv-time .cur").textContent = fmt(state.video.currentTime);
    state.root.querySelector(".lv-time .dur").textContent = fmt(state.video.duration);
    const p = state.video.duration ? (state.video.currentTime / state.video.duration) * 100 : 0;
    state.root.querySelector(".lv-played").style.width = p + "%";
  }
  function updateBuffer() {
    try {
      const v = state.video;
      if (!v.buffered.length || !v.duration) return;
      const end = v.buffered.end(v.buffered.length - 1);
      state.root.querySelector(".lv-buffer").style.width = ((end / v.duration) * 100) + "%";
    } catch (e) {}
  }
  function onTimeUpdate() {
    updateTime();
    saveProgress(state.current && state.current.id, state.video.currentTime, state.video.duration);
    checkSkips();
  }

  function checkSkips() {
    const it = state.current; if (!it) return;
    const t = state.video.currentTime;
    const skips = state.root.querySelector(".lv-skips");

    // Intro
    if (it.skipIntro && t >= it.skipIntro.start && t < it.skipIntro.end && !state.skipShown.intro) {
      state.skipShown.intro = true;
      showSkip("Omitir intro", () => { state.video.currentTime = it.skipIntro.end; });
    } else if (it.skipIntro && (t < it.skipIntro.start || t >= it.skipIntro.end) && state.skipShown.intro) {
      state.skipShown.intro = false; removeSkipBtn("intro");
    }
    // Recap
    if (it.skipRecap && t >= it.skipRecap.start && t < it.skipRecap.end && !state.skipShown.recap) {
      state.skipShown.recap = true;
      showSkip("Omitir resumen", () => { state.video.currentTime = it.skipRecap.end; });
    } else if (it.skipRecap && (t < it.skipRecap.start || t >= it.skipRecap.end) && state.skipShown.recap) {
      state.skipShown.recap = false; removeSkipBtn("recap");
    }
    // Créditos: aparece + timer 10s -> next
    if (it.skipCredits && t >= it.skipCredits.start && !state.skipShown.credits && !state.creditsCancelled) {
      state.skipShown.credits = true;
      showCreditsSkip();
    }
  }
  function showSkip(label, onClick) {
    const skips = state.root.querySelector(".lv-skips");
    const btn = document.createElement("button");
    btn.className = "lv-skip-btn";
    btn.textContent = label;
    btn.onclick = () => { onClick(); btn.remove(); };
    btn.dataset.kind = label.toLowerCase().includes("intro") ? "intro" : "recap";
    skips.appendChild(btn);
  }
  function removeSkipBtn(kind) {
    state.root.querySelectorAll(`.lv-skips [data-kind="${kind}"]`).forEach(b => b.remove());
  }
  function showCreditsSkip() {
    const skips = state.root.querySelector(".lv-skips");
    const wrap = document.createElement("div");
    wrap.style.display = "flex"; wrap.style.gap = "8px"; wrap.dataset.kind = "credits";
    const skip = document.createElement("button");
    skip.className = "lv-skip-btn";
    skip.innerHTML = `Omitir créditos <small>Auto en <span class="cnt">10</span>s</small>`;
    const cancel = document.createElement("button");
    cancel.className = "lv-skip-btn ghost";
    cancel.textContent = "Cancelar";
    wrap.appendChild(skip); wrap.appendChild(cancel);
    skips.appendChild(wrap);

    let left = 10;
    state.creditsTimer = setInterval(() => {
      left--;
      const c = wrap.querySelector(".cnt"); if (c) c.textContent = left;
      if (left <= 0) { clearInterval(state.creditsTimer); state.creditsTimer = null; wrap.remove(); next("credits"); }
    }, 1000);

    skip.onclick = () => { clearInterval(state.creditsTimer); state.creditsTimer = null; wrap.remove(); next("credits"); };
    cancel.onclick = () => {
      clearInterval(state.creditsTimer); state.creditsTimer = null;
      wrap.remove(); state.creditsCancelled = true;
    };
  }

  /* ============================================================
     MENÚS (calidad, subtítulos, velocidad, config)
     ============================================================ */
  function closeAllMenus() {
    state.root.querySelectorAll(".lv-menu").forEach(m => m.classList.remove("show"));
  }
  function toggleMenu(kind, anchorBtn) {
    const menu = state.root.querySelector(`.lv-menu[data-menu="${kind}"]`);
    const alreadyOpen = menu.classList.contains("show");
    closeAllMenus();
    if (alreadyOpen) return;
    buildMenu(kind, menu);
    // posicionar cerca del botón (por defecto abajo-derecha)
    if (anchorBtn) {
      const r = anchorBtn.getBoundingClientRect();
      const rp = state.root.getBoundingClientRect();
      menu.style.right = (rp.right - r.right) + "px";
      menu.style.bottom = "auto";
      menu.style.top = (r.bottom - rp.top + 8) + "px";
    }
    menu.classList.add("show");
  }
  function buildMenu(kind, menu) {
    menu.innerHTML = "";
    if (kind === "quality") {
      const head = document.createElement("div"); head.className = "head"; head.textContent = "Calidad";
      menu.appendChild(head);
      const opts = ["auto", ...state.availableQualities];
      opts.forEach(q => {
        const it = document.createElement("div"); it.className = "item"; it.textContent = q.toUpperCase();
        if (state.quality === q) it.classList.add("active");
        it.onclick = () => { setQuality(q); closeAllMenus(); };
        menu.appendChild(it);
      });
    } else if (kind === "speed") {
      const head = document.createElement("div"); head.className = "head"; head.textContent = "Velocidad";
      menu.appendChild(head);
      [0.5, 0.75, 1, 1.25, 1.5, 2].forEach(sp => {
        const it = document.createElement("div"); it.className = "item"; it.textContent = sp + "x";
        if (state.speed === sp) it.classList.add("active");
        it.onclick = () => { state.speed = sp; state.video.playbackRate = sp; closeAllMenus(); };
        menu.appendChild(it);
      });
    } else if (kind === "subs") {
      const head = document.createElement("div"); head.className = "head"; head.textContent = "Subtítulos";
      menu.appendChild(head);
      const off = document.createElement("div"); off.className = "item"; off.textContent = "Desactivados";
      if (!state.subtitlesOn) off.classList.add("active");
      off.onclick = () => { toggleSubs(false); closeAllMenus(); };
      menu.appendChild(off);
      if (state.subtitlesUrl) {
        const on = document.createElement("div"); on.className = "item"; on.textContent = "Activados";
        if (state.subtitlesOn) on.classList.add("active");
        on.onclick = () => { toggleSubs(true); closeAllMenus(); };
        menu.appendChild(on);
      } else {
        const na = document.createElement("div"); na.className = "item"; na.style.opacity = ".5";
        na.textContent = "No disponibles"; menu.appendChild(na);
      }
    } else if (kind === "config") {
      const items = [
        { label: "Modo actual",  value: state.mode },
        { label: "Loop",         value: state.video.loop ? "on" : "off", onClick: () => { state.video.loop = !state.video.loop; } },
        { label: "Reiniciar",    onClick: () => { state.video.currentTime = 0; } }
      ];
      items.forEach(o => {
        const it = document.createElement("div"); it.className = "item";
        it.innerHTML = `<span>${o.label}</span><span>${o.value || ""}</span>`;
        if (o.onClick) it.onclick = () => { o.onClick(); closeAllMenus(); };
        menu.appendChild(it);
      });
    }
  }

  function setQuality(q) {
    state.quality = q;
    const urls = state.current.urls || {};
    const t = state.video.currentTime;
    const paused = state.video.paused;
    const useKey = q === "auto" ? autoQuality(urls) : (urls[q] ? q : autoQuality(urls));
    if (!useKey) return;
    state.video.src = urls[useKey];
    state.video.addEventListener("loadedmetadata", function once() {
      state.video.removeEventListener("loadedmetadata", once);
      state.video.currentTime = t;
      if (!paused) state.video.play().catch(()=>{});
    });
  }

  function toggleSubs(on) {
    state.subtitlesOn = !!on && !!state.subtitlesUrl;
    // limpiar tracks previos
    Array.from(state.video.querySelectorAll("track")).forEach(t => t.remove());
    if (state.subtitlesOn) {
      const tr = document.createElement("track");
      tr.kind = "subtitles";
      tr.src = state.subtitlesUrl;
      tr.default = true;
      tr.srclang = "es";
      state.video.appendChild(tr);
      // forzar visibilidad
      setTimeout(() => {
        const tt = state.video.textTracks && state.video.textTracks[0];
        if (tt) tt.mode = "showing";
      }, 50);
    }
  }

  /* ============================================================
     INFO panel
     ============================================================ */
  function clearPauseInfoTimer() { clearTimeout(state.pauseInfoTimer); state.pauseInfoTimer = null; }
  function armPauseInfoTimer() {
    clearPauseInfoTimer();
    state.pauseInfoTimer = setTimeout(() => {
      if (state.video.paused && !state.video.ended) {
        showInfo({
          kind: "pause",
          buttons: [
            { label: "Compartir", onClick: shareCurrent, secondary: true },
            { label: "Reanudar",  onClick: () => { hideInfo(); state.video.play().catch(()=>{}); } }
          ]
        });
      }
    }, 10000);
  }
  function shareCurrent() {
    const it = state.current; if (!it) return;
    const url = location.origin + (it.urlPage || ("/?play=" + it.id));
    if (navigator.share) navigator.share({ title: it.titulo, url }).catch(()=>{});
    else { navigator.clipboard && navigator.clipboard.writeText(url); alert("Enlace copiado:\n" + url); }
  }

  function showInfo(opts) {
    const info = state.root.querySelector(".lv-info");
    const h1 = info.querySelector("h1");
    const sub = info.querySelector(".sub");
    const acts = info.querySelector(".info-actions");
    const it = state.current;
    h1.textContent = it ? it.titulo : "";
    if (it && it.type === "episodio") {
      const s = window.LISTMOVIE_API.findSerieById(it.serieId);
      sub.textContent = (s ? s.titulo : "") + " · Temporada " + it.temporada + " · Episodio " + it.episodio;
    } else {
      sub.textContent = it && it.saga ? ("Saga: " + it.saga) : "";
    }
    acts.innerHTML = "";
    (opts.buttons || []).forEach(b => {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      if (b.secondary) btn.className = "secondary";
      btn.onclick = b.onClick;
      acts.appendChild(btn);
    });
    info.classList.add("show");
  }
  function hideInfo() { state.root.querySelector(".lv-info").classList.remove("show"); }

  /* ============================================================
     LISTA lateral
     ============================================================ */
  function toggleList() {
    if (state.root.classList.contains("list-open")) {
      state.root.classList.remove("list-open");
    } else {
      buildList();
      state.root.classList.add("list-open");
    }
  }
  function buildList() {
    const aside = state.root.querySelector(".lv-list");
    const header = aside.querySelector("header h3");
    const body = aside.querySelector(".list-body");
    body.innerHTML = "";
    if (state.mode === "pelicula") {
      header.textContent = "Siguiente";
      // películas + episodios sueltos aleatorios
      const pool = window.LISTMOVIE_API.allPlayables().filter(x => x.id !== (state.current && state.current.id));
      shuffle(pool).slice(0, 20).forEach(x => body.appendChild(renderListItem(x)));
    } else {
      const s = window.LISTMOVIE_API.findSerieById(state.serieId);
      header.textContent = s ? s.titulo : "Episodios";
      if (s) {
        [...s.temporadas].sort((a,b)=>a.numero-b.numero).forEach(t => {
          const h = document.createElement("div"); h.className = "season"; h.textContent = "Temporada " + t.numero;
          body.appendChild(h);
          [...t.episodios].sort((a,b)=>(a.episodio-b.episodio)||(new Date(a.fecha)-new Date(b.fecha))).forEach(e => {
            body.appendChild(renderListItem(e));
          });
        });
      }
    }
  }
  function renderListItem(x) {
    const el = document.createElement("div");
    el.className = "li-item" + ((state.current && state.current.id === x.id) ? " playing" : "");
    const img = x.portada || x.portadaVista || "";
    const sub = x.type === "episodio"
      ? ("T" + x.temporada + " · E" + x.episodio)
      : (x.type === "pelicula" ? "Película" : "");
    el.innerHTML = `
      <img src="${img}" alt="">
      <div class="meta"><div class="n">${x.titulo || ""}</div><div class="d">${sub}</div></div>
    `;
    el.onclick = () => {
      // clic libre: reproduce el elegido; ajusta modo
      if (x.type === "episodio") {
        openInternal(x, { mode: "libre" });
      } else {
        openInternal(x, { mode: "pelicula" });
      }
    };
    return el;
  }
  function shuffle(arr) { arr = arr.slice(); for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

  /* ============================================================
     PLAYLIST / NAV
     ============================================================ */
  function buildPlaylistFor(item, mode) {
    if (mode === "serie") {
      const list = window.LISTMOVIE_API.episodiosDeSerie(item.id);
      state.serieId = item.id;
      state.playlist = list;
      state.index = 0;
      return list[0] || null;
    } else if (mode === "libre" && item.type === "episodio") {
      const list = window.LISTMOVIE_API.episodiosDeSerie(item.serieId);
      state.serieId = item.serieId;
      state.playlist = list;
      state.index = Math.max(0, list.findIndex(e => e.id === item.id));
      return list[state.index] || item;
    } else {
      state.playlist = []; state.index = -1; state.serieId = null;
      return item;
    }
  }
  function prev() {
    if ((state.mode === "serie" || state.mode === "libre") && state.index > 0) {
      state.index--;
      openInternal(state.playlist[state.index], { mode: state.mode, serieId: state.serieId, keepPlaylist: true });
    } else {
      // en película, "anterior" reinicia
      state.video.currentTime = 0;
    }
  }
  function next(reason) {
    // reason: user | credits | ended
    if ((state.mode === "serie" || state.mode === "libre") && state.playlist.length && state.index < state.playlist.length - 1) {
      state.index++;
      openInternal(state.playlist[state.index], { mode: state.mode, serieId: state.serieId, keepPlaylist: true });
    } else {
      // saga terminada o pelicula: aleatorio similar
      const nxt = window.LISTMOVIE_API.pickRandomNext(state.current);
      if (nxt) {
        const m = nxt.type === "episodio" ? "libre" : "pelicula";
        openInternal(nxt, { mode: m });
      }
    }
  }

  function onEnded() {
    const it = state.current; if (!it) return;
    const isSerie = state.mode === "serie" || state.mode === "libre";
    const hasNext = isSerie && state.index < state.playlist.length - 1;
    const buttons = [
      { label: "Volver a ver", onClick: () => { hideInfo(); state.video.currentTime = 0; state.video.play().catch(()=>{}); }, secondary: true }
    ];
    if (hasNext) {
      buttons.push({ label: "Siguiente episodio", onClick: () => { hideInfo(); next("ended"); } });
    } else {
      buttons.push({ label: "Ver siguiente", onClick: () => { hideInfo(); next("ended"); } });
    }
    showInfo({ kind: "ended", buttons });
  }

  /* ============================================================
     APERTURA
     ============================================================ */
  function openInternal(item, opts) {
    ensureRoot();
    opts = opts || {};
    const mode = opts.mode || "pelicula";
    state.mode = mode;
    state.current = item;
    state.skipShown = { intro: false, recap: false, credits: false };
    state.creditsCancelled = false;
    if (state.creditsTimer) { clearInterval(state.creditsTimer); state.creditsTimer = null; }
    state.root.querySelector(".lv-skips").innerHTML = "";
    hideInfo();

    if (!opts.keepPlaylist) {
      const first = buildPlaylistFor(item, mode);
      if (first) state.current = first;
    }

    // Título superior
    const it = state.current;
    const t1 = state.root.querySelector(".lv-title .t1");
    const t2 = state.root.querySelector(".lv-title .t2");
    if (it.type === "episodio") {
      const s = window.LISTMOVIE_API.findSerieById(it.serieId);
      t1.textContent = it.titulo;
      t2.textContent = (s ? s.titulo : "") + " · T" + it.temporada + " · E" + it.episodio;
    } else {
      t1.textContent = it.titulo || "";
      t2.textContent = "";
    }

    // Calidades disponibles
    state.availableQualities = ["HD","SD","LOW"].filter(k => it.urls && it.urls[k]);
    const qKey = autoQuality(it.urls);
    if (!qKey) return;
    state.quality = "auto";
    state.video.src = it.urls[qKey];
    state.video.playbackRate = state.speed;

    // Subtítulos
    state.subtitlesUrl = it.subtitulos || null;
    Array.from(state.video.querySelectorAll("track")).forEach(t => t.remove());

    // FS Root visible
    state.root.classList.add("open");

    // Progreso previo
    const savedT = getProgress(it.id);

    const doPlay = (from) => {
      const start = () => {
        try { state.video.currentTime = from || 0; } catch (e) {}
        state.video.play().catch(()=>{});
      };
      if (state.video.readyState >= 1) start();
      else state.video.addEventListener("loadedmetadata", start, { once: true });
    };

    if (savedT > 5) {
      const isSerie = mode === "serie" || mode === "libre";
      const hasNext = isSerie && state.index < state.playlist.length - 1;
      showInfo({
        kind: "resume",
        buttons: [
          { label: "Empezar",   onClick: () => { hideInfo(); doPlay(0); }, secondary: true },
          { label: "Reanudar",  onClick: () => { hideInfo(); doPlay(savedT); } },
          { label: hasNext ? "Siguiente episodio" : "Siguiente", onClick: () => { hideInfo(); next("user"); } }
        ]
      });
    } else {
      doPlay(0);
    }
    updatePlayBtn();
    showControls();
  }

  /* ============================================================
     API PÚBLICA
     ============================================================ */
  const Player = {
    open(item, opts) {
      if (!item) return;
      if (typeof item === "string") item = window.LISTMOVIE_API.findById(item);
      if (!item) return;
      openInternal(item, opts || {});
    },
    close: close
  };
  function close() {
    if (!state.root) return;
    try { state.video.pause(); } catch (e) {}
    state.video.removeAttribute("src");
    state.video.load();
    state.root.classList.remove("open", "list-open");
    hideInfo();
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  }

  window.Player = Player;
})();
