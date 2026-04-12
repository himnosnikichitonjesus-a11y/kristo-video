import { getAllEpisodes, getAllSeries, getSeriesById, getEpisodeById, getRandomRecommendations } from './media.js';
import { getFavorites, addToFavorites, removeFromFavorites, isFavorite, getContinueWatching, getVideoProgress, showToast } from './memoria.js';
import { openVideoPlayer } from './universal-player.js';
import { renderFeed } from './watch.js';

// Exponer datos globalmente para otros módulos
window.__episodes__ = getAllEpisodes();
window.__series__ = getAllSeries();

// Función de navegación SPA
window.navigateTo = function(path) {
    history.pushState(null, '', path);
    handleRoute();
};

async function handleRoute() {
    const path = window.location.pathname;
    const container = document.getElementById('app');
    
    if (path === '/' || path === '/index.html') {
        renderFeed();
    }
    else if (path.startsWith('/serie/')) {
        const serieId = path.split('/')[2];
        renderSeriesDetail(serieId);
    }
    else if (path.startsWith('/episodio/')) {
        const epId = path.split('/')[2];
        renderEpisodeDetail(epId);
    }
    else if (path === '/biblioteca') {
        renderBiblioteca();
    }
    else if (path === '/explorar') {
        renderExplorar();
    }
    else if (path === '/buscar') {
        renderBuscar();
    }
    else if (path === '/mi-lista') {
        renderMiLista();
    }
    else {
        render404();
    }
}

function renderSeriesDetail(serieId) {
    const serie = getSeriesById(serieId);
    if (!serie) { render404(); return; }
    const episodes = getEpisodesBySeriesId(serieId);
    const container = document.getElementById('app');
    const heroStyle = `--bg-image: url('${serie.backdrop || serie.thumbnail}')`;
    let episodesHTML = episodes.map(ep => {
        const progress = getVideoProgress(ep.url);
        const percent = progress ? (progress.currentTime / progress.duration) * 100 : 0;
        return `
            <div class="episode-card" data-id="${ep.id}" data-type="episode">
                <div class="episode-thumb">
                    <img src="${ep.thumbnail}" alt="${ep.title}">
                    <div class="progress-indicator"><div class="progress-fill-ep" style="width: ${percent}%;"></div></div>
                    <div class="duration-overlay">${ep.duration || '--'}</div>
                </div>
                <div class="episode-info">
                    <div class="episode-meta-inline"><span>Episodio ${ep.episodeNum || 1}</span><span>${ep.duration || ''}</span></div>
                    <div class="episode-title-card">${ep.title}</div>
                    <div class="episode-desc-card">${ep.description.substring(0, 80)}…</div>
                </div>
            </div>
        `;
    }).join('');
    const isInList = isFavorite(serieId);
    container.innerHTML = `
        <div class="series-hero" style="${heroStyle}">
            <div class="hero-content">
                <h1 class="series-title">${serie.title}</h1>
                <div class="series-meta">
                    <span class="match-score">98% coincidencia</span>
                    <span>${serie.year}</span>
                    <span class="badge-hd">HD</span>
                    <span>${serie.seasons} temporadas</span>
                    <span>⏱ ${serie.duration}</span>
                </div>
                <p class="series-description">${serie.description}</p>
                <div class="hero-actions">
                    <button class="btn-hero btn-play" id="play-series">▶ Reproducir</button>
                    <button class="btn-hero btn-secondary" id="toggle-fav">${isInList ? '✓ En Mi lista' : '+ Mi lista'}</button>
                    <div class="btn-icon" id="share-series">🔗</div>
                </div>
            </div>
        </div>
        <div class="main-content">
            <div class="section-header"><h2 class="section-title">Episodios</h2></div>
            <div class="episodes-row" id="episodes-container">${episodesHTML}</div>
            <div class="section-header" style="margin-top:40px;"><h2 class="section-title">Más como esto</h2></div>
            <div class="episodes-row" id="recommendations-row"></div>
        </div>
    `;
    // Recomendaciones
    const recs = getRandomRecommendations(5, episodes.map(e => e.id));
    const recRow = document.getElementById('recommendations-row');
    recRow.innerHTML = recs.map(rec => `
        <div class="episode-card" data-id="${rec.id}" data-type="episode">
            <div class="episode-thumb"><img src="${rec.thumbnail}" alt="${rec.title}"></div>
            <div class="episode-info"><div class="episode-title-card">${rec.title}</div></div>
        </div>
    `).join('');
    document.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = card.dataset.id;
            const episode = getEpisodeById(id);
            if (episode) navigateTo(`/episodio/${id}`);
        });
    });
    document.getElementById('play-series').addEventListener('click', () => {
        const firstUnwatched = episodes.find(ep => {
            const prog = getVideoProgress(ep.url);
            return !prog || prog.currentTime < prog.duration - 10;
        }) || episodes[0];
        if (firstUnwatched) openVideoPlayer(episodes, episodes.indexOf(firstUnwatched));
    });
    document.getElementById('toggle-fav').addEventListener('click', () => {
        if (isFavorite(serieId)) removeFromFavorites(serieId);
        else addToFavorites(serieId);
        renderSeriesDetail(serieId);
    });
    document.getElementById('share-series').addEventListener('click', () => {
        if (navigator.share) navigator.share({ title: serie.title, url: location.href });
        else showToast('Copia el enlace');
    });
}

function renderEpisodeDetail(epId) {
    const episode = getEpisodeById(epId);
    if (!episode) { render404(); return; }
    const container = document.getElementById('app');
    const heroStyle = `--bg-image: url('${episode.thumbnail2 || episode.thumbnail}')`;
    const isInList = isFavorite(epId);
    container.innerHTML = `
        <div class="episode-hero" style="${heroStyle}">
            <div class="hero-content">
                <h1 class="episode-title">${episode.title}</h1>
                <div class="episode-meta">
                    <span>${episode.year || '2024'}</span>
                    <span>${episode.duration || '--'}</span>
                    <span class="age-rating">${episode.rating || '13+'}</span>
                </div>
                <p class="episode-description">${episode.description}</p>
                <div class="hero-actions">
                    <button class="btn-hero btn-play" id="play-now">▶ Reproducir</button>
                    <button class="btn-hero btn-secondary" id="toggle-fav">${isInList ? '✓ En Mi lista' : '+ Mi lista'}</button>
                    <div class="btn-icon" id="share-ep">🔗</div>
                </div>
            </div>
        </div>
        <div class="main-content">
            <div class="section-header"><h2 class="section-title">Recomendaciones</h2></div>
            <div class="episodes-row" id="recs-row"></div>
        </div>
    `;
    const recs = getRandomRecommendations(5, [epId]);
    const recRow = document.getElementById('recs-row');
    recRow.innerHTML = recs.map(rec => `
        <div class="episode-card" data-id="${rec.id}" data-type="episode">
            <div class="episode-thumb"><img src="${rec.thumbnail}" alt="${rec.title}"></div>
            <div class="episode-info"><div class="episode-title-card">${rec.title}</div></div>
        </div>
    `).join('');
    document.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            navigateTo(`/episodio/${id}`);
        });
    });
    document.getElementById('play-now').addEventListener('click', () => {
        openVideoPlayer([episode], 0);
    });
    document.getElementById('toggle-fav').addEventListener('click', () => {
        if (isFavorite(epId)) removeFromFavorites(epId);
        else addToFavorites(epId);
        renderEpisodeDetail(epId);
    });
    document.getElementById('share-ep').addEventListener('click', () => {
        if (navigator.share) navigator.share({ title: episode.title, url: location.href });
        else showToast('Enlace copiado');
    });
}

function renderBiblioteca() {
    const favIds = getFavorites();
    const favItems = [...getAllEpisodes().filter(ep => favIds.includes(ep.id)), ...getAllSeries().filter(s => favIds.includes(s.id))];
    const container = document.getElementById('app');
    container.innerHTML = `
        <div style="padding: 30px 4%;">
            <h1>Mi Biblioteca</h1>
            <div class="results-grid" id="biblioteca-grid"></div>
        </div>
    `;
    const grid = document.getElementById('biblioteca-grid');
    if (favItems.length === 0) {
        grid.innerHTML = '<p>No hay contenido guardado.</p>';
    } else {
        grid.innerHTML = favItems.map(item => {
            const isSerie = item.seasons !== undefined;
            const link = isSerie ? `/serie/${item.id}` : `/episodio/${item.id}`;
            return `
                <div class="result-item" data-link="${link}">
                    <img src="${item.thumbnail}" alt="${item.title}">
                    <div class="title">${item.title}</div>
                </div>
            `;
        }).join('');
        document.querySelectorAll('.result-item').forEach(el => {
            el.addEventListener('click', () => navigateTo(el.dataset.link));
        });
    }
}

function renderExplorar() {
    const allSeries = getAllSeries();
    const container = document.getElementById('app');
    container.innerHTML = `
        <div style="padding: 30px 4%;">
            <h1>Explorar Series</h1>
            <div class="results-grid" id="explorar-grid"></div>
        </div>
    `;
    const grid = document.getElementById('explorar-grid');
    grid.innerHTML = allSeries.map(serie => `
        <div class="result-item" data-link="/serie/${serie.id}">
            <img src="${serie.thumbnail}" alt="${serie.title}">
            <div class="title">${serie.title}</div>
        </div>
    `).join('');
    document.querySelectorAll('.result-item').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.dataset.link));
    });
}

function renderBuscar() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const container = document.getElementById('app');
    container.innerHTML = `
        <div style="padding: 30px 4%;">
            <h1>Buscar</h1>
            <input type="text" id="search-input-page" placeholder="Título..." value="${escapeHtml(query)}" style="width:100%; padding:12px; margin:20px 0; background:#1a1a1a; border:1px solid #333; color:white; border-radius:8px;">
            <div class="results-grid" id="buscar-grid"></div>
        </div>
    `;
    const searchInput = document.getElementById('search-input-page');
    const grid = document.getElementById('buscar-grid');
    function performSearch() {
        const term = searchInput.value.trim().toLowerCase();
        const results = getAllEpisodes().filter(ep => ep.title.toLowerCase().includes(term));
        grid.innerHTML = results.map(ep => `
            <div class="result-item" data-link="/episodio/${ep.id}">
                <img src="${ep.thumbnail}" alt="${ep.title}">
                <div class="title">${ep.title}</div>
            </div>
        `).join('');
        document.querySelectorAll('.result-item').forEach(el => {
            el.addEventListener('click', () => navigateTo(el.dataset.link));
        });
    }
    searchInput.addEventListener('input', () => {
        const url = new URL(window.location);
        url.searchParams.set('q', searchInput.value);
        history.pushState(null, '', url);
        performSearch();
    });
    performSearch();
}

function render404() {
    document.getElementById('app').innerHTML = `
        <div style="padding: 60px 4%; text-align:center;">
            <h1>404 - Página no encontrada</h1>
            <button onclick="window.navigateTo('/')" class="btn-hero btn-play" style="margin-top:20px;">Volver al inicio</button>
        </div>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Eventos de navegación
document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault();
        const href = link.getAttribute('data-link');
        if (href) navigateTo(href);
    }
});
window.addEventListener('popstate', handleRoute);

// Iniciar
handleRoute();
