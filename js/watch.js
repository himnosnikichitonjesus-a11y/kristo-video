import { episodes, getAllEpisodes, getSeriesById } from './media.js';
import { getContinueWatching, getVideoProgress } from './memoria.js';
import { openVideoPlayer } from './universal-player.js';

let currentActiveFilter = 'todos';
let currentSearchQuery = '';

export function renderFeed() {
    const container = document.getElementById('app');
    if (!container) return;
    // Inyectar barra de búsqueda y filtros
    container.innerHTML = `
        <div class="header-bar">
            <div class="search-container">
                <svg class="search-icon" width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
                </svg>
                <input type="text" class="search-input" placeholder="Buscar episodios..." id="searchInput">
            </div>
            <div class="filters-container" id="filtersContainer"></div>
        </div>
        <div id="search-results" class="search-results">
            <div class="results-grid"></div>
        </div>
        <div class="feed-container" id="main-feed"></div>
    `;
    generateFilters();
    generateFeeds();
    attachSearchAndFilterEvents();
    attachHoverEffects();
    attachCardClickEvents();
}

function generateFilters() {
    const container = document.getElementById('filtersContainer');
    if (!container) return;
    const allCats = ['Todos', ...new Set(episodes.flatMap(ep => ep.categories))];
    container.innerHTML = allCats.map(cat => `<button class="filter-btn" data-filter="${cat.toLowerCase()}">${cat}</button>`).join('');
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === 'todos') btn.classList.add('active');
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentActiveFilter = btn.dataset.filter;
            filterContent();
        });
    });
}

function generateFeeds() {
    const feedContainer = document.getElementById('main-feed');
    const continueWatching = getContinueWatching().map(cw => {
        return episodes.find(ep => ep.id === cw.id);
    }).filter(e => e);
    const allEpisodes = getAllEpisodes();
    const recent = [...allEpisodes.filter(ep => !ep.isFeatured)].sort((a,b) => (b.year || 0) - (a.year || 0)).slice(0, 10);
    const featured = allEpisodes.filter(ep => ep.isFeatured);
    const top10 = [...allEpisodes].sort(() => 0.5 - Math.random()).slice(0, 10);
    const sections = [
        { id: 'recientes', title: 'Recientes', format: 'standard', items: recent },
        { id: 'continuar', title: 'Continuar viendo', format: 'standard continue', items: continueWatching },
        { id: 'top10', title: 'Top 10 en tu país hoy', format: 'top10', items: top10 },
        { id: 'destacados', title: 'Destacados', format: 'short', items: featured },
        { id: 'historia', title: 'Historia', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Historia')).slice(0, 10) },
        { id: 'sermones', title: 'Sermones', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Sermones')).slice(0, 10) },
        { id: 'infantil', title: 'Infantil', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Infantil')).slice(0, 10) },
        { id: 'musica', title: 'Música', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Música')).slice(0, 10) }
    ];
    feedContainer.innerHTML = sections.map(section => {
        let itemsHTML = '';
        if (section.format === 'top10') {
            itemsHTML = section.items.map((ep, idx) => `
                <div class="top10-item">
                    <span class="top10-number">${idx+1}</span>
                    <div class="item top10" data-id="${ep.id}" data-type="episode" data-serie-id="${ep.serieId || ''}">
                        <img src="${ep.thumbnail}" alt="${ep.title}" data-original="${ep.thumbnail}" data-img2="${ep.thumbnail2 || ep.thumbnail}">
                    </div>
                </div>
            `).join('');
        } else {
            itemsHTML = section.items.map(ep => {
                let extra = '';
                if (section.id === 'continuar') {
                    const prog = getVideoProgress(ep.url);
                    const percent = prog ? (prog.currentTime / prog.duration) * 100 : 0;
                    extra = `
                        <div class="title">${ep.title}</div>
                        <div class="progress"><div class="progress-bar" style="width: ${percent}%"></div></div>
                        <button class="play-btn" data-play>▶</button>
                    `;
                }
                if (section.format.includes('short')) {
                    extra += `
                        <div class="expanded-info">
                            <div class="expanded-title">${ep.title}</div>
                            <div class="expanded-controls">
                                <button class="expanded-btn play" data-play>▶</button>
                                <button class="expanded-btn" data-add>+</button>
                            </div>
                        </div>
                    `;
                }
                return `
                    <div class="item ${section.format}" data-id="${ep.id}" data-type="episode" data-serie-id="${ep.serieId || ''}" data-url="${ep.url}">
                        <img src="${ep.thumbnail}" alt="${ep.title}" data-original="${ep.thumbnail}" data-img2="${ep.thumbnail2 || ep.thumbnail}">
                        ${extra}
                    </div>
                `;
            }).join('');
        }
        return `
            <div class="section" id="section-${section.id}">
                <div class="section-header">
                    <h2 data-category="${section.title.toLowerCase()}">${section.title}</h2>
                    <div class="arrow-container">
                        <button class="arrow left" data-carousel="${section.id}">❮</button>
                        <button class="arrow right" data-carousel="${section.id}">❯</button>
                    </div>
                </div>
                <div class="carousel" id="carousel-${section.id}">
                    <div class="items">${itemsHTML}</div>
                </div>
            </div>
        `;
    }).join('');
    // Flechas
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            const carouselId = arrow.dataset.carousel;
            const carousel = document.getElementById(`carousel-${carouselId}`);
            if (carousel) {
                const scrollAmount = carousel.clientWidth * 0.7;
                carousel.scrollBy({ left: scrollAmount * (arrow.classList.contains('left') ? -1 : 1), behavior: 'smooth' });
            }
        });
    });
}

function attachSearchAndFilterEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.trim().toLowerCase();
            filterContent();
        });
    }
}

function filterContent() {
    const resultsContainer = document.getElementById('search-results');
    const mainFeed = document.getElementById('main-feed');
    const resultsGrid = resultsContainer?.querySelector('.results-grid');
    if (!resultsGrid) return;
    let filtered = getAllEpisodes().filter(ep => !ep.isFeatured);
    if (currentSearchQuery) {
        filtered = filtered.filter(ep => ep.title.toLowerCase().includes(currentSearchQuery));
    }
    if (currentActiveFilter !== 'todos') {
        filtered = filtered.filter(ep => ep.categories.some(c => c.toLowerCase() === currentActiveFilter));
    }
    if (currentSearchQuery !== '' || currentActiveFilter !== 'todos') {
        resultsGrid.innerHTML = filtered.map(ep => `
            <div class="result-item" data-id="${ep.id}" data-type="episode" data-serie-id="${ep.serieId || ''}">
                <img src="${ep.thumbnail}" alt="${ep.title}">
                <div class="title">${ep.title}</div>
            </div>
        `).join('');
        resultsContainer.style.display = 'block';
        mainFeed.style.display = 'none';
        // Añadir eventos a resultados
        document.querySelectorAll('.result-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = el.dataset.id;
                const serieId = el.dataset.serieId;
                if (serieId) navigateTo(`/serie/${serieId}`);
                else navigateTo(`/episodio/${id}`);
            });
        });
    } else {
        resultsContainer.style.display = 'none';
        mainFeed.style.display = 'block';
    }
}

function attachHoverEffects() {
    const popout = document.getElementById('hover-popout');
    let hoverTimer;
    let isHoveringPopout = false;
    document.querySelectorAll('.item.standard:not(.short)').forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            if (window.innerWidth <= 768) return;
            clearTimeout(hoverTimer);
            const img = card.querySelector('img');
            const img2 = img.dataset.img2;
            if (img2 && img2 !== img.src) img.src = img2;
            hoverTimer = setTimeout(() => {
                const rect = card.getBoundingClientRect();
                const epId = card.dataset.id;
                const episode = episodes.find(ep => ep.id === epId);
                if (!episode) return;
                const popoutWidth = 320;
                const cardWidth = rect.width;
                const offsetX = (popoutWidth - cardWidth) / 2;
                let leftPos = rect.left + window.scrollX - offsetX;
                let topPos = rect.top + window.scrollY;
                if (leftPos < 10) leftPos = 10;
                if (leftPos + popoutWidth > window.innerWidth - 10) leftPos = window.innerWidth - popoutWidth - 10;
                if (topPos < 10) topPos = 10;
                popout.style.top = `${topPos}px`;
                popout.style.left = `${leftPos}px`;
                document.getElementById('popout-img').src = episode.thumbnail2 || episode.thumbnail;
                document.getElementById('popout-title').textContent = episode.title;
                document.getElementById('popout-desc').textContent = episode.description;
                document.getElementById('popout-play').href = '#';
                document.getElementById('popout-play').onclick = (e) => {
                    e.preventDefault();
                    openVideoPlayer([episode], 0);
                    popout.classList.remove('active');
                };
                popout.classList.add('active');
            }, 400);
        });
        card.addEventListener('mouseleave', () => {
            const img = card.querySelector('img');
            img.src = img.dataset.original;
            clearTimeout(hoverTimer);
            setTimeout(() => {
                if (!isHoveringPopout) popout.classList.remove('active');
            }, 100);
        });
    });
    popout.addEventListener('mouseenter', () => { isHoveringPopout = true; });
    popout.addEventListener('mouseleave', () => { isHoveringPopout = false; popout.classList.remove('active'); });
}

function attachCardClickEvents() {
    document.querySelectorAll('.item').forEach(card => {
        card.addEventListener('click', (e) => {
            // Si el clic fue en un botón de play (data-play), reproducir directamente
            if (e.target.closest('[data-play]')) {
                e.stopPropagation();
                const epId = card.dataset.id;
                const episode = episodes.find(ep => ep.id === epId);
                if (episode) openVideoPlayer([episode], 0);
                return;
            }
            // Si el clic fue en botón de agregar (+), manejar favoritos (simplificado)
            if (e.target.closest('[data-add]')) {
                e.stopPropagation();
                const epId = card.dataset.id;
                import('./memoria.js').then(({ addToFavorites, isFavorite, removeFromFavorites }) => {
                    if (isFavorite(epId)) removeFromFavorites(epId);
                    else addToFavorites(epId);
                });
                return;
            }
            // Navegación normal: si tiene serieId -> serie, si no -> episodio
            const serieId = card.dataset.serieId;
            const epId = card.dataset.id;
            if (serieId) {
                navigateTo(`/serie/${serieId}`);
            } else if (epId) {
                navigateTo(`/episodio/${epId}`);
            }
        });
    });
}

// Función de navegación global (definida en main, pero la usamos aquí)
function navigateTo(path) {
    if (typeof window.navigateTo === 'function') window.navigateTo(path);
    else window.location.hash = path;
}
