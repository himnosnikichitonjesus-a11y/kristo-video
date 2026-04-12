// ==================== ENRUTADOR SPA ====================
// Maneja las rutas: / (feed), /serie/:id, y opcionalmente /mi-lista, /series, /peliculas

window.navigateTo = function(path) {
    history.pushState({}, '', path);
    handleRoute();
};

function handleRoute() {
    const path = window.location.pathname;
    const app = document.getElementById('app');
    
    if (path === '/' || path === '/index.html') {
        if (typeof window.renderFeed === 'function') {
            window.renderFeed();
        } else {
            app.innerHTML = '<div style="padding:40px;text-align:center;">Cargando feed...</div>';
            setTimeout(() => {
                if (typeof window.renderFeed === 'function') window.renderFeed();
            }, 50);
        }
    }
    else if (path.startsWith('/serie/')) {
        const serieId = path.split('/')[2];
        renderSeriesDetail(serieId);
    }
    else if (path === '/mi-lista') {
        renderMyList();
    }
    else if (path === '/series') {
        renderSeriesCatalog();
    }
    else if (path === '/peliculas') {
        renderMoviesCatalog();
    }
    else {
        app.innerHTML = '<div style="padding:40px;text-align:center;">Página no encontrada</div>';
    }
}

function renderSeriesDetail(serieId) {
    const serie = window.getSeriesById(serieId);
    if (!serie) {
        document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;">Serie no encontrada</div>';
        return;
    }
    const episodes = window.getEpisodesBySeriesId(serieId);
    const mainContainer = document.getElementById('app');
    const heroStyle = `--bg-image: url('${serie.backdrop || serie.thumbnail}')`;
    
    let episodesHTML = '';
    episodes.forEach(ep => {
        const progressData = window.getVideoProgress(ep.url);
        const percent = progressData ? (progressData.currentTime / progressData.duration) * 100 : 0;
        episodesHTML += `
            <div class="episode-card" data-episode-id="${ep.id}" data-url="${ep.url}">
                <div class="episode-thumb">
                    <img src="${ep.thumbnail}" alt="${ep.title}">
                    <div class="progress-indicator"><div class="progress-fill-ep" style="width: ${percent}%;"></div></div>
                    <div class="duration-overlay">${ep.duration || '--'}</div>
                </div>
                <div class="episode-info">
                    <div class="episode-meta"><span>Episodio ${ep.episodeNum}</span><span>${ep.duration || ''}</span></div>
                    <div class="episode-title-card">${ep.title}</div>
                    <div class="episode-desc-card">${ep.description.substring(0, 80)}…</div>
                </div>
            </div>
        `;
    });
    
    const isInMyList = window.isFavorite(serieId);
    const listButtonText = isInMyList ? '✓ En Mi lista' : '+ Mi lista';
    
    const html = `
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
                    <button class="btn-hero btn-secondary" id="add-to-list">${listButtonText}</button>
                    <div class="btn-icon" id="share-series">🔗</div>
                    <div class="btn-icon" id="more-series">⋮</div>
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
    mainContainer.innerHTML = html;
    
    // Recomendaciones aleatorias (excluyendo esta serie)
    const recs = window.getRandomRecommendations(5, episodes.map(e => e.id));
    const recRow = document.getElementById('recommendations-row');
    if (recRow) {
        recRow.innerHTML = recs.map(rec => `
            <div class="episode-card" data-id="${rec.id}" data-serie-id="${rec.serieId || ''}" data-url="${rec.url}">
                <div class="episode-thumb"><img src="${rec.thumbnail}" alt="${rec.title}"></div>
                <div class="episode-info"><div class="episode-title-card">${rec.title}</div></div>
            </div>
        `).join('');
        recRow.querySelectorAll('.episode-card').forEach(card => {
            card.addEventListener('click', () => {
                const serieIdAttr = card.dataset.serieId;
                if (serieIdAttr) window.navigateTo(`/serie/${serieIdAttr}`);
                else {
                    const ep = window.episodes.find(e => e.id === card.dataset.id);
                    if (ep) window.openVideoPlayer([ep]);
                }
            });
        });
    }
    
    // Eventos de los botones
    document.getElementById('play-series')?.addEventListener('click', () => {
        const firstUnwatched = episodes.find(ep => {
            const prog = window.getVideoProgress(ep.url);
            return !prog || prog.currentTime < prog.duration - 10;
        }) || episodes[0];
        if (firstUnwatched) {
            window.openVideoPlayer(episodes, episodes.indexOf(firstUnwatched));
        }
    });
    
    document.getElementById('add-to-list')?.addEventListener('click', () => {
        if (isInMyList) window.removeFromFavorites(serieId);
        else window.addToFavorites(serieId);
        renderSeriesDetail(serieId); // refrescar para actualizar texto
    });
    
    document.getElementById('share-series')?.addEventListener('click', () => {
        if (navigator.share) navigator.share({ title: serie.title, text: serie.description, url: location.href });
        else window.showToast('Copia el enlace manualmente');
    });
    
    // Menú contextual simple
    document.getElementById('more-series')?.addEventListener('click', (e) => {
        window.showToast('Opciones: agregar a favoritos, reportar...');
    });
    
    // Episodios click
    document.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const epUrl = card.dataset.url;
            const ep = episodes.find(e => e.url === epUrl);
            if (ep) window.openVideoPlayer(episodes, episodes.indexOf(ep));
        });
    });
}

function renderMyList() {
    const favoritesIds = window.getFavorites();
    const favEpisodes = window.episodes.filter(ep => favoritesIds.includes(ep.id) || favoritesIds.includes(ep.serieId));
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 30px 4%;">
            <h1>Mi lista</h1>
            <div class="results-grid" id="my-list-grid"></div>
        </div>
    `;
    const grid = document.getElementById('my-list-grid');
    if (favEpisodes.length === 0) {
        grid.innerHTML = '<p>No hay contenido en tu lista.</p>';
    } else {
        grid.innerHTML = favEpisodes.map(ep => `
            <div class="result-item" data-url="${ep.url}" data-id="${ep.id}" data-serie-id="${ep.serieId || ''}">
                <img src="${ep.thumbnail}" alt="${ep.title}">
                <div class="title">${ep.title}</div>
            </div>
        `).join('');
        grid.querySelectorAll('.result-item').forEach(el => {
            el.addEventListener('click', () => handleCardClick(el.dataset));
        });
    }
}

function renderSeriesCatalog() {
    const seriesArray = window.seriesList;
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 30px 4%;">
            <h1>Series</h1>
            <div class="results-grid" id="series-grid"></div>
        </div>
    `;
    const grid = document.getElementById('series-grid');
    grid.innerHTML = seriesArray.map(serie => `
        <div class="result-item" data-serie-id="${serie.id}">
            <img src="${serie.thumbnail}" alt="${serie.title}">
            <div class="title">${serie.title}</div>
        </div>
    `).join('');
    grid.querySelectorAll('.result-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.serieId;
            if (id) window.navigateTo(`/serie/${id}`);
        });
    });
}

function renderMoviesCatalog() {
    const movies = window.episodes.filter(ep => !ep.serieId);
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 30px 4%;">
            <h1>Películas</h1>
            <div class="results-grid" id="movies-grid"></div>
        </div>
    `;
    const grid = document.getElementById('movies-grid');
    grid.innerHTML = movies.map(movie => `
        <div class="result-item" data-url="${movie.url}" data-id="${movie.id}">
            <img src="${movie.thumbnail}" alt="${movie.title}">
            <div class="title">${movie.title}</div>
        </div>
    `).join('');
    grid.querySelectorAll('.result-item').forEach(el => {
        el.addEventListener('click', () => {
            const movie = movies.find(m => m.id === el.dataset.id);
            if (movie) window.openVideoPlayer([movie]);
        });
    });
}

// Función auxiliar para clics en tarjetas (reutilizada)
function handleCardClick(data) {
    if (data.serieId && data.serieId !== '') {
        window.navigateTo(`/serie/${data.serieId}`);
    } else {
        const episode = window.episodes.find(ep => ep.id === data.id || ep.url === data.url);
        if (episode) window.openVideoPlayer([episode], 0);
    }
}

// Escuchar navegación con botones atrás/adelante
window.addEventListener('popstate', handleRoute);

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    handleRoute();
    // Vincular clics en la barra de navegación
    document.querySelectorAll('[data-link]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const path = el.getAttribute('data-link');
            if (path) window.navigateTo(path);
        });
    });
    // Búsqueda móvil
    const mobileToggle = document.getElementById('mobile-search-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.focus();
        });
    }
});
