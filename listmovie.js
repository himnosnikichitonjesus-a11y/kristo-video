/* listmovie.js
 * Base de datos única de películas y series.
 * Estructura:
 *  - Películas: objetos con type: "pelicula"
 *  - Series:    objetos con type: "serie" y un array "temporadas"
 *               cada temporada tiene "numero" y "episodios" (type: "episodio")
 *
 * Para agregar contenido, edita SOLO este archivo.
 */
window.LISTMOVIE = [
  /* ---------------- PELÍCULAS ---------------- */
  {
    id: "001-terror",
    titulo: "Terror en la ciudad",
    urls: {
      HD:  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      SD:  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      LOW: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    trailer: "",
    portada:       "https://picsum.photos/seed/terror1/800/450",
    portadaVista:  "https://picsum.photos/seed/terror1w/1280/500",
    portadaShort:  "https://picsum.photos/seed/terror1v/400/600",
    subtitulos: "",
    fecha: "2026/07/11",
    type: "pelicula",
    saga: "terror",       // usado para elegir "similares" (ej: parte 1, 2, 3)
    numeroSaga: 1,
    skipIntro:   { start: 0,   end: 8   },
    skipRecap:   null,
    skipCredits: { start: 540 },
    urlPage: "/terror-en-la-ciudad"
  },
  {
    id: "002-terror2",
    titulo: "Terror en la ciudad 2",
    urls: {
      HD:  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      SD:  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    portada:      "https://picsum.photos/seed/terror2/800/450",
    portadaVista: "https://picsum.photos/seed/terror2w/1280/500",
    portadaShort: "https://picsum.photos/seed/terror2v/400/600",
    fecha: "2026/08/01",
    type: "pelicula",
    saga: "terror",
    numeroSaga: 2,
    skipIntro:   { start: 0, end: 10 },
    skipCredits: { start: 620 },
    urlPage: "/terror-en-la-ciudad-2"
  },
  {
    id: "003-aventura",
    titulo: "La gran aventura",
    urls: {
      HD: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    portada:      "https://picsum.photos/seed/adv1/800/450",
    portadaVista: "https://picsum.photos/seed/adv1w/1280/500",
    portadaShort: "https://picsum.photos/seed/adv1v/400/600",
    fecha: "2026/05/20",
    type: "pelicula",
    saga: "aventura",
    numeroSaga: 1,
    skipIntro:   { start: 0, end: 5 },
    skipCredits: { start: 12 },
    urlPage: "/la-gran-aventura"
  },

  /* ---------------- SERIES ---------------- */
  {
    id: "S01-misterio",
    titulo: "Sombras del misterio",
    trailer: "",
    portada:      "https://picsum.photos/seed/serie1/800/450",
    portadaVista: "https://picsum.photos/seed/serie1w/1280/500",
    portadaShort: "https://picsum.photos/seed/serie1v/400/600",
    fecha: "2026/03/01",
    type: "serie",
    saga: "misterio",
    urlPage: "/sombras-del-misterio",
    temporadas: [
      {
        numero: 1,
        episodios: [
          {
            id: "S01-T1-E1",
            titulo: "El inicio",
            urls: {
              HD: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              SD: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
            },
            portada:      "https://picsum.photos/seed/s1t1e1/800/450",
            portadaVista: "https://picsum.photos/seed/s1t1e1w/1280/500",
            portadaShort: "https://picsum.photos/seed/s1t1e1v/400/600",
            serieId: "S01-misterio",
            temporada: 1,
            episodio: 1,
            fecha: "2026/03/01",
            type: "episodio",
            skipIntro:   { start: 0, end: 8 },
            skipRecap:   null,
            skipCredits: { start: 12 },
            urlPage: "/sombras/t1/e1"
          },
          {
            id: "S01-T1-E2",
            titulo: "Rastros",
            urls: {
              HD: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
            },
            portada:      "https://picsum.photos/seed/s1t1e2/800/450",
            portadaVista: "https://picsum.photos/seed/s1t1e2w/1280/500",
            portadaShort: "https://picsum.photos/seed/s1t1e2v/400/600",
            serieId: "S01-misterio",
            temporada: 1,
            episodio: 2,
            fecha: "2026/03/08",
            type: "episodio",
            skipIntro:   { start: 0, end: 6 },
            skipCredits: { start: 55 },
            urlPage: "/sombras/t1/e2"
          }
        ]
      },
      {
        numero: 2,
        episodios: [
          {
            id: "S01-T2-E1",
            titulo: "Nuevo horizonte",
            urls: {
              HD: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
            },
            portada:      "https://picsum.photos/seed/s1t2e1/800/450",
            portadaVista: "https://picsum.photos/seed/s1t2e1w/1280/500",
            portadaShort: "https://picsum.photos/seed/s1t2e1v/400/600",
            serieId: "S01-misterio",
            temporada: 2,
            episodio: 1,
            fecha: "2026/06/01",
            type: "episodio",
            skipIntro:   { start: 0, end: 7 },
            skipCredits: { start: 14 },
            urlPage: "/sombras/t2/e1"
          }
        ]
      }
    ]
  }
];

/* ---------- Helpers globales sobre la base de datos ---------- */
window.LISTMOVIE_API = (function () {
  const db = window.LISTMOVIE;

  function allMovies() {
    return db.filter(x => x.type === "pelicula");
  }
  function allSeries() {
    return db.filter(x => x.type === "serie");
  }
  /** Devuelve TODOS los episodios (planos) de todas las series, ordenados por serie/temporada/episodio */
  function allEpisodes() {
    const out = [];
    allSeries().forEach(s => {
      const temps = [...s.temporadas].sort((a, b) => a.numero - b.numero);
      temps.forEach(t => {
        const eps = [...t.episodios].sort((a, b) =>
          (a.episodio - b.episodio) || (new Date(a.fecha) - new Date(b.fecha))
        );
        eps.forEach(e => out.push(e));
      });
    });
    return out;
  }
  /** Todos los items reproducibles: películas + episodios sueltos */
  function allPlayables() {
    return [...allMovies(), ...allEpisodes()];
  }
  function findById(id) {
    // buscar en peliculas
    const p = db.find(x => x.id === id);
    if (p) return p;
    // buscar en episodios
    for (const s of allSeries()) {
      for (const t of s.temporadas) {
        const e = t.episodios.find(e => e.id === id);
        if (e) return e;
      }
    }
    return null;
  }
  function findSerieById(serieId) {
    return db.find(x => x.type === "serie" && x.id === serieId) || null;
  }
  function episodiosDeSerie(serieId) {
    const s = findSerieById(serieId);
    if (!s) return [];
    const out = [];
    [...s.temporadas].sort((a, b) => a.numero - b.numero).forEach(t => {
      [...t.episodios]
        .sort((a, b) => (a.episodio - b.episodio) || (new Date(a.fecha) - new Date(b.fecha)))
        .forEach(e => out.push(e));
    });
    return out;
  }
  /** Escoge un "siguiente" aleatorio priorizando la misma saga (numeroSaga+1 si existe) */
  function pickRandomNext(currentItem) {
    const pool = allPlayables().filter(x => x.id !== (currentItem && currentItem.id));
    if (!pool.length) return null;
    if (currentItem && currentItem.saga) {
      const sameSaga = pool.filter(x => x.saga === currentItem.saga);
      // preferir el número siguiente
      if (currentItem.numeroSaga) {
        const next = sameSaga.find(x => x.numeroSaga === currentItem.numeroSaga + 1);
        if (next) return next;
        const prev = sameSaga.find(x => x.numeroSaga === 1 && x.id !== currentItem.id);
        if (prev) return prev;
      }
      if (sameSaga.length) return sameSaga[Math.floor(Math.random() * sameSaga.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return {
    allMovies, allSeries, allEpisodes, allPlayables,
    findById, findSerieById, episodiosDeSerie, pickRandomNext
  };
})();
