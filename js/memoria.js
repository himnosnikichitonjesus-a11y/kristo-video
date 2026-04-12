// ==================== ALMACENAMIENTO LOCAL Y ESTADO ====================
// Gestiona favoritos (Mi lista), historial de visualización y progreso.

// ---------- FAVORITOS / MI LISTA ----------
window.getFavorites = function() {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
};

window.addToFavorites = function(episodeId) {
    let favs = window.getFavorites();
    if (!favs.includes(episodeId)) {
        favs.push(episodeId);
        localStorage.setItem('favorites', JSON.stringify(favs));
        window.showToast('✓ Agregado a Mi lista');
        return true;
    }
    window.showToast('Ya está en tu lista', 'warning');
    return false;
};

window.removeFromFavorites = function(episodeId) {
    let favs = window.getFavorites();
    favs = favs.filter(id => id !== episodeId);
    localStorage.setItem('favorites', JSON.stringify(favs));
    window.showToast('✗ Eliminado de Mi lista');
};

window.isFavorite = function(episodeId) {
    return window.getFavorites().includes(episodeId);
};

// ---------- HISTORIAL DE REPRODUCCIÓN (para "Continuar viendo") ----------
// Estructura: { url, completed, progress, lastWatched, title, thumbnail }
window.getWatchedHistory = function() {
    const history = localStorage.getItem('watchedHistory');
    return history ? JSON.parse(history) : [];
};

window.saveWatchedHistory = function(history) {
    localStorage.setItem('watchedHistory', JSON.stringify(history));
};

window.recordPlayback = function(episode, currentTime, duration, completed = false) {
    let history = window.getWatchedHistory();
    const existingIndex = history.findIndex(h => h.url === episode.url);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const entry = {
        url: episode.url,
        title: episode.title,
        thumbnail: episode.thumbnail,
        completed: completed || progress >= 90,
        progress: progress,
        lastWatched: new Date().toISOString()
    };
    if (existingIndex !== -1) {
        history[existingIndex] = entry;
    } else {
        history.push(entry);
    }
    window.saveWatchedHistory(history);
    return entry;
};

window.getContinueWatching = function() {
    let history = window.getWatchedHistory();
    return history.filter(h => !h.completed).sort((a,b) => new Date(b.lastWatched) - new Date(a.lastWatched));
};

// ---------- PROGRESO POR VIDEO (para reanudar exactamente) ----------
window.getVideoProgress = function(videoUrl) {
    const key = `videoProgress_${videoUrl}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) { return null; }
    }
    return null;
};

window.setVideoProgress = function(videoUrl, currentTime, duration) {
    const key = `videoProgress_${videoUrl}`;
    localStorage.setItem(key, JSON.stringify({ currentTime, duration, timestamp: Date.now() }));
};

window.clearVideoProgress = function(videoUrl) {
    localStorage.removeItem(`videoProgress_${videoUrl}`);
};

// ---------- UTILIDAD: OBTENER EPISODIO POR URL ----------
window.getEpisodeByUrl = function(url) {
    return window.episodes.find(ep => ep.url === url);
};

// ---------- NOTIFICACIÓN TOAST ----------
window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};
