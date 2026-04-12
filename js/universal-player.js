import { recordPlayback, setVideoProgress, getVideoProgress, showToast } from './memoria.js';

let currentEpisodes = [];
let currentIndex = 0;
let saveInterval = null;

export function openVideoPlayer(episodesList, startIndex = 0) {
    if (!episodesList || episodesList.length === 0) return;
    currentEpisodes = episodesList;
    currentIndex = Math.min(startIndex, episodesList.length - 1);
    renderPlayer();
    loadEpisode(currentIndex);
    document.getElementById('universal-player').style.display = 'flex';
}

export function openPlayer(videoUrl, episodesList = null) {
    if (episodesList) {
        openVideoPlayer(episodesList, episodesList.findIndex(ep => ep.url === videoUrl));
    } else {
        // Buscar episodio por url en la base global (se inyecta desde main)
        if (window.__episodes__) {
            const ep = window.__episodes__.find(e => e.url === videoUrl);
            if (ep) openVideoPlayer([ep], 0);
        }
    }
}

function renderPlayer() {
    const container = document.getElementById('universal-player');
    const ep = currentEpisodes[currentIndex];
    container.innerHTML = `
        <div class="player-container">
            <div class="player-header">
                <div class="player-title">${escapeHtml(ep.title)}</div>
                <button id="close-player">✕</button>
            </div>
            <video id="player-video" controls></video>
            <div class="player-episodes-list" id="player-episodes-list"></div>
        </div>
    `;
    if (currentEpisodes.length > 1) {
        const listDiv = document.getElementById('player-episodes-list');
        listDiv.innerHTML = currentEpisodes.map((ep, idx) => `
            <div class="player-episode-item" data-index="${idx}">
                <img src="${ep.thumbnail}" alt="${ep.title}">
                <div>${ep.title}</div>
            </div>
        `).join('');
        listDiv.querySelectorAll('.player-episode-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index);
                if (idx !== currentIndex) {
                    currentIndex = idx;
                    loadEpisode(currentIndex);
                }
            });
        });
    }
    document.getElementById('close-player').addEventListener('click', () => {
        if (saveInterval) clearInterval(saveInterval);
        document.getElementById('universal-player').style.display = 'none';
        const video = document.getElementById('player-video');
        if (video) video.pause();
    });
}

function loadEpisode(index) {
    const ep = currentEpisodes[index];
    const video = document.getElementById('player-video');
    if (!video) return;
    // Actualizar título
    document.querySelector('.player-title').textContent = ep.title;
    video.src = ep.url;
    video.load();
    const progress = getVideoProgress(ep.url);
    let startTime = 0;
    if (progress && progress.currentTime && progress.currentTime < progress.duration - 10) {
        startTime = progress.currentTime;
        showToast(`Reanudando desde ${formatTime(progress.currentTime)}`);
    }
    video.addEventListener('loadedmetadata', function onLoad() {
        video.currentTime = startTime;
        video.play();
        video.removeEventListener('loadedmetadata', onLoad);
    });
    if (saveInterval) clearInterval(saveInterval);
    const saveProgress = () => {
        if (video.duration && !isNaN(video.duration) && video.currentTime) {
            setVideoProgress(ep.url, video.currentTime, video.duration);
            recordPlayback(ep, video.currentTime, video.duration);
        }
    };
    video.addEventListener('play', () => {
        saveInterval = setInterval(saveProgress, 5000);
    });
    video.addEventListener('pause', saveProgress);
    video.addEventListener('ended', () => {
        saveProgress();
        clearInterval(saveInterval);
        recordPlayback(ep, video.duration, video.duration, true);
        if (index + 1 < currentEpisodes.length) {
            showToast('Siguiente episodio...');
            currentIndex = index + 1;
            loadEpisode(currentIndex);
        } else {
            showToast('Contenido completado');
        }
    });
    // Saltos opcionales
    if (ep.skipIntro) {
        video.addEventListener('timeupdate', function onTime() {
            const [start, end] = [parseTime(ep.skipIntro.start), parseTime(ep.skipIntro.end)];
            if (video.currentTime >= start && video.currentTime < end) {
                video.currentTime = end;
                video.removeEventListener('timeupdate', onTime);
                showToast('Saltando introducción');
            }
        });
    }
}

function parseTime(timeStr) {
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

// Exponer globalmente para uso desde otros módulos
window.openVideoPlayer = openVideoPlayer;
window.openPlayer = openPlayer;
