// ==================== REPRODUCTOR UNIVERSAL ====================
// Se abre con openVideoPlayer(episodios, indexInicial)
// episodios puede ser un array o un objeto con propiedad 'episodes'.
// También acepta una URL directa con openPlayer(url)

window.openVideoPlayer = function(data, startIndex = 0) {
    let episodesList = [];
    if (Array.isArray(data)) {
        episodesList = data;
    } else if (data.episodes) {
        episodesList = data.episodes;
    } else if (typeof data === 'string') {
        // Es una URL única
        const ep = window.getEpisodeByUrl(data);
        if (ep) episodesList = [ep];
        else return;
    } else {
        console.error('Formato no soportado para reproductor');
        return;
    }
    if (episodesList.length === 0) return;
    
    // Asegurar que cada episodio tenga los campos mínimos
    episodesList = episodesList.map(ep => ({
        ...ep,
        url: ep.url,
        title: ep.title,
        thumbnail: ep.thumbnail,
        description: ep.description,
        skipIntro: ep.skipIntro || null,
        skipRecap: ep.skipRecap || null,
        skipCredits: ep.skipCredits || null
    }));
    
    window._currentPlayerEpisodes = episodesList;
    window._currentPlayerIndex = Math.min(startIndex, episodesList.length - 1);
    
    renderPlayer();
    loadEpisode(window._currentPlayerIndex);
    document.getElementById('universal-player').style.display = 'flex';
};

window.openPlayer = function(videoUrl) {
    window.openVideoPlayer(videoUrl);
};

function renderPlayer() {
    const container = document.getElementById('universal-player');
    if (!container) return;
    const episodes = window._currentPlayerEpisodes;
    const current = episodes[window._currentPlayerIndex];
    
    const playerHTML = `
        <div class="player-container">
            <div class="player-header">
                <div class="player-title">${escapeHtml(current.title)}</div>
                <button id="close-player">✕</button>
            </div>
            <video id="player-video" controls></video>
            <div class="player-episodes-list" id="player-episodes-list"></div>
        </div>
    `;
    container.innerHTML = playerHTML;
    
    // Cargar lista de episodios
    const listContainer = document.getElementById('player-episodes-list');
    if (listContainer && episodes.length > 1) {
        listContainer.innerHTML = episodes.map((ep, idx) => `
            <div class="player-episode-item" data-index="${idx}">
                <img src="${ep.thumbnail}" alt="${ep.title}" loading="lazy">
                <div>${ep.title}</div>
            </div>
        `).join('');
        listContainer.querySelectorAll('.player-episode-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index);
                if (!isNaN(idx) && idx !== window._currentPlayerIndex) {
                    window._currentPlayerIndex = idx;
                    loadEpisode(idx);
                }
            });
        });
    }
    
    document.getElementById('close-player').addEventListener('click', () => {
        document.getElementById('universal-player').style.display = 'none';
        const video = document.getElementById('player-video');
        if (video) video.pause();
    });
}

function loadEpisode(index) {
    const episodes = window._currentPlayerEpisodes;
    const ep = episodes[index];
    if (!ep) return;
    
    const video = document.getElementById('player-video');
    if (!video) return;
    
    // Actualizar título
    const titleDiv = document.querySelector('.player-title');
    if (titleDiv) titleDiv.textContent = ep.title;
    
    video.src = ep.url;
    video.load();
    
    // Recuperar progreso guardado
    const progress = window.getVideoProgress(ep.url);
    let startTime = 0;
    if (progress && progress.currentTime && progress.currentTime < progress.duration - 10) {
        startTime = progress.currentTime;
        window.showToast(`Reanudando desde ${formatTime(progress.currentTime)}`, 'info');
    }
    
    video.addEventListener('loadedmetadata', function onLoad() {
        video.currentTime = startTime;
        video.play();
        video.removeEventListener('loadedmetadata', onLoad);
    });
    
    // Guardar progreso cada 5 segundos y al pausar
    let saveInterval;
    const saveProgress = () => {
        if (video.duration && !isNaN(video.duration) && video.currentTime) {
            window.setVideoProgress(ep.url, video.currentTime, video.duration);
            // También actualizar historial general
            window.recordPlayback(ep, video.currentTime, video.duration);
        }
    };
    video.addEventListener('play', () => {
        saveInterval = setInterval(saveProgress, 5000);
    });
    video.addEventListener('pause', saveProgress);
    video.addEventListener('ended', () => {
        saveProgress();
        clearInterval(saveInterval);
        window.recordPlayback(ep, video.duration, video.duration, true);
        // Pasar al siguiente episodio automáticamente si existe
        if (index + 1 < episodes.length) {
            window.showToast('Siguiente episodio...');
            window._currentPlayerIndex = index + 1;
            loadEpisode(window._currentPlayerIndex);
        } else {
            window.showToast('Serie completada');
        }
    });
    
    // Manejo de saltos (intro, recap, créditos)
    if (ep.skipIntro) {
        video.addEventListener('timeupdate', function onTime() {
            if (video.currentTime >= parseTime(ep.skipIntro.start) && video.currentTime < parseTime(ep.skipIntro.end)) {
                video.currentTime = parseTime(ep.skipIntro.end);
                video.removeEventListener('timeupdate', onTime);
                window.showToast('Saltando introducción');
            }
        });
    }
    if (ep.skipRecap) {
        video.addEventListener('timeupdate', function onTime() {
            if (video.currentTime >= parseTime(ep.skipRecap.start) && video.currentTime < parseTime(ep.skipRecap.end)) {
                video.currentTime = parseTime(ep.skipRecap.end);
                video.removeEventListener('timeupdate', onTime);
                window.showToast('Saltando resumen');
            }
        });
    }
}

function parseTime(timeStr) {
    // Formato "HH:MM:SS" o "MM:SS"
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    if (parts.length === 2) return parts[0]*60 + parts[1];
    return 0;
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    return `${mins}:${secs.toString().padStart(2,'0')}`;
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
