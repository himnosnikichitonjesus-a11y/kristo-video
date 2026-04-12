// ==================== VISTA PRINCIPAL (FEED) ====================
// Renderiza carruseles, búsqueda, filtros y maneja interacciones.

let currentActiveFilter = 'todos';

function renderFeed() {
    const mainContainer = document.getElementById('app');
    if (!mainContainer) return;
    
    // Generar secciones según configuración
    const sections = generateSections();
    const searchFilterBar = `
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
    mainContainer.innerHTML = searchFilterBar;
    
    const feedContainer = document.getElementById('main-feed');
    feedContainer.innerHTML = sections.map(section => section.html).join('');
    
    // Generar filtros
    generateFilters();
    
    // Configurar eventos de búsqueda y filtros
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', filterContent);
    
    // Inicializar efectos hover y clics
    setupHoverEffects();
    attachCardClickEvents();
    
    // Flechas de carrusel
    document.querySelectorAll('.arrow.left').forEach(arrow => {
        const sectionId = arrow.closest('.section').id.replace('section-', '');
        arrow.onclick = () => scrollCarousel(sectionId, -1);
    });
    document.querySelectorAll('.arrow.right').forEach(arrow => {
        const sectionId = arrow.closest('.section').id.replace('section-', '');
        arrow.onclick = () => scrollCarousel(sectionId, 1);
    });
    
    // Títulos de sección clickeables (filtro rápido)
    document.querySelectorAll('.section h2').forEach(h2 => {
        const category = h2.dataset.category;
        if (category) {
            h2.addEventListener('click', () => {
                const btn = Array.from(document.querySelectorAll('.filter-btn')).find(b => b.dataset.filter === category);
                if (btn) btn.click();
            });
        }
    });
}

function generateSections() {
    // Obtener datos actualizados (continuar viendo desde memoria)
    const continueWatching = window.getContinueWatching();
    const allEpisodes = window.episodes.filter(ep => !ep.isFeatured);
    const featured = window.episodes.filter(ep => ep.isFeatured);
    const recent = [...allEpisodes].sort((a,b) => (b.year || 0) - (a.year || 0)).slice(0, 10);
    const top10 = [...window.episodes].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    const sectionsConfig = [
        { id: 'recientes', title: 'Recientes', format: 'standard', items: recent },
        { id: 'continuar', title: 'Continuar viendo', format: 'standard continue', items: continueWatching.map(cw => window.getEpisodeByUrl(cw.url)).filter(e => e) },
        { id: 'top10', title: 'Top 10 en tu país hoy', format: 'top10', items: top10 },
        { id: 'destacados', title: 'Destacados', format: 'short', items: featured },
        { id: 'historia', title: 'Historia', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Historia')).slice(0, 10) },
        { id: 'sermones', title: 'Sermones', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Sermones')).slice(0, 10) },
        { id: 'infantil', title: 'Infantil', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Infantil')).slice(0, 10) },
        { id: 'musica', title: 'Música', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Música')).slice(0, 10) },
        { id: 'conferencias', title: 'Conferencias', format: 'standard', items: allEpisodes.filter(ep => ep.categories.includes('Ciencia') || ep.categories.includes('Conferencias')).slice(0, 10) }
    ];
    
    return sectionsConfig.map(section => {
        let itemsHTML = '';
        if (section.format === 'top10') {
            itemsHTML = section.items.map((ep, idx) => `
                <div class="top10-item">
                    <span class="top10-number">${idx+1}</span>
                    <div class="item top10" data-url="${ep.url}" data-title="${ep.title}" data-img="${ep.thumbnail}" data-img2="${ep.thumbnail2}" data-desc="${ep.description}" data-id="${ep.id}">
                        <img src="${ep.thumbnail}" alt="${ep.title}" data-original="${ep.thumbnail}">
                    </div>
                </div>
            `).join('');
        } else {
            itemsHTML = section.items.map(ep => {
                let extraClasses = section.format;
                let extraHTML = '';
                if (section.id === 'continuar') {
                    const progress = window.getVideoProgress(ep.url);
                    const percent = progress ? (progress.currentTime / progress.duration) * 100 : 0;
                    extraHTML = `
                        <div class="title">${ep.title}</div>
                        <div class="progress"><div class="progress-bar" style="width: ${percent}%"></div></div>
                        <button class="play-btn">▶</button>
                    `;
                }
                if (section.format.includes('short')) {
                    extraHTML += `
                        <div class="expanded-info">
                            <div class="expanded-title">${ep.title}</div>
                            <div class="expanded-controls">
                                <button class="expanded-btn play">▶</button>
                                <button class="expanded-btn">+</button>
                                <button class="expanded-btn">ℹ</button>
                            </div>
                        </div>
                    `;
                }
                return `
                    <div class="item ${extraClasses}" data-url="${ep.url}" data-title="${ep.title}" data-img="${ep.thumbnail}" data-img2="${ep.thumbnail2}" data-desc="${ep.description}" data-id="${ep.id}" data-serie-id="${ep.serieId || ''}">
                        <img src="${ep.thumbnail}" alt="${ep.title}" data-original="${ep.thumbnail}">
                        ${extraHTML}
                    </div>
                `;
            }).join('');
        }
        return {
            id: section.id,
            html: `
                <div class="section" id="section-${section.id}">
                    <div class="section-header">
                        <h2 data-category="${section.title.toLowerCase()}">${section.title}</h2>
                        <div class="arrow-container">
                            <button class="arrow left">❮</button>
                            <button class="arrow right">❯</button>
                        </div>
                    </div>
                    <div class="carousel" id="carousel-${section.id}">
                        <div class="items">
                            ${itemsHTML}
                        </div>
                    </div>
                </div>
            `
        };
    });
}

function generateFilters() {
    const container = document.getElementById('filtersContainer');
    if (!container) return;
    const allCats = ['Todos', ...new Set(window.episodes.flatMap(ep => ep.categories))];
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

function filterContent() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const resultsContainer = document.getElementById('search-results');
    const mainFeed = document.getElementById('main-feed');
    const resultsGrid = resultsContainer?.querySelector('.results-grid');
    if (!resultsGrid) return;
    
    let filtered = window.episodes.filter(ep => !ep.isFeatured);
    if (query) {
        filtered = filtered.filter(ep => ep.title.toLowerCase().includes(query));
    }
    if (currentActiveFilter !== 'todos') {
        filtered = filtered.filter(ep => ep.categories.some(c => c.toLowerCase() === currentActiveFilter));
    }
    
    if (query !== '' || currentActiveFilter !== 'todos') {
        resultsGrid.innerHTML = filtered.map(ep => `
            <div class="result-item" data-url="${ep.url}" data-id="${ep.id}" data-serie-id="${ep.serieId || ''}">
                <img src="${ep.thumbnail}" alt="${ep.title}">
                <div class="title">${ep.title}</div>
            </div>
        `).join('');
        resultsContainer.style.display = 'block';
        if (mainFeed) mainFeed.style.display = 'none';
        // Adjuntar eventos a resultados
        document.querySelectorAll('.result-item').forEach(el => {
            el.addEventListener('click', () => handleCardClick(el.dataset));
        });
    } else {
        resultsContainer.style.display = 'none';
        if (mainFeed) mainFeed.style.display = 'block';
    }
}

function scrollCarousel(sectionId, direction) {
    const carousel = document.getElementById(`carousel-${sectionId}`);
    if (carousel) {
        const scrollAmount = carousel.clientWidth * 0.7;
        carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    }
}

function setupHoverEffects() {
    // Limpiar anteriores
    const popout = document.getElementById('hover-popout');
    let hoverTimer;
    let isHoveringPopout = false;
    let currentCard = null;
    
    document.querySelectorAll('.item.standard:not(.short)').forEach(card => {
        card.removeEventListener('mouseenter', card._mouseEnter);
        card.removeEventListener('mouseleave', card._mouseLeave);
        
        card._mouseEnter = (e) => {
            if (window.innerWidth <= 768) return;
            currentCard = card;
            clearTimeout(hoverTimer);
            const img = card.querySelector('img');
            const img2 = card.dataset.img2;
            if (img2 && img2 !== img.src) img.src = img2;
            hoverTimer = setTimeout(() => {
                const rect = card.getBoundingClientRect();
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
                document.getElementById('popout-img').src = card.dataset.img2 || card.dataset.img;
                document.getElementById('popout-title').textContent = card.dataset.title;
                document.getElementById('popout-desc').textContent = card.dataset.desc || '';
                document.getElementById('popout-play').href = card.dataset.url;
                popout.classList.add('active');
            }, 400);
        };
        card._mouseLeave = () => {
            const img = card.querySelector('img');
            img.src = img.dataset.original;
            clearTimeout(hoverTimer);
            setTimeout(() => {
                if (!isHoveringPopout) popout.classList.remove('active');
            }, 100);
        };
        card.addEventListener('mouseenter', card._mouseEnter);
        card.addEventListener('mouseleave', card._mouseLeave);
    });
    
    popout.addEventListener('mouseenter', () => { isHoveringPopout = true; });
    popout.addEventListener('mouseleave', () => { isHoveringPopout = false; popout.classList.remove('active'); });
}

function attachCardClickEvents() {
    document.querySelectorAll('.item').forEach(card => {
        card.removeEventListener('click', card._clickHandler);
        card._clickHandler = () => {
            const data = card.dataset;
            handleCardClick(data);
        };
        card.addEventListener('click', card._clickHandler);
    });
}

function handleCardClick(data) {
    if (data.serieId && data.serieId !== '') {
        // Navegar a la vista de serie
        window.navigateTo(`/serie/${data.serieId}`);
    } else {
        // Reproducir episodio/película suelta
        const episode = window.episodes.find(ep => ep.id === data.id || ep.url === data.url);
        if (episode) {
            window.openVideoPlayer([episode], 0);
        }
    }
}

// Exponer funciones globales para el enrutador
window.renderFeed = renderFeed;
window.scrollCarousel = scrollCarousel;
