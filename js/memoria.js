// Favoritos (Mi lista), historial y progreso

export function getFavorites() {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
}

export function addToFavorites(itemId, type = 'episode') {
    let favs = getFavorites();
    if (!favs.includes(itemId)) {
        favs.push(itemId);
        localStorage.setItem('favorites', JSON.stringify(favs));
        showToast('✓ Agregado a Mi lista');
        return true;
    }
    showToast('Ya está en tu lista', 'warning');
    return false;
}

export function removeFromFavorites(itemId) {
    let favs = getFavorites();
    favs = favs.filter(id => id !== itemId);
    localStorage.setItem('favorites', JSON.stringify(favs));
    showToast('✗ Eliminado de Mi lista');
}

export function isFavorite(itemId) {
    return getFavorites().includes(itemId);
}

// Historial de reproducción
export function getWatchedHistory() {
    const history = localStorage.getItem('watchedHistory');
    return history ? JSON.parse(history) : [];
}

export function saveWatchedHistory(history) {
    localStorage.setItem('watchedHistory', JSON.stringify(history));
}

export function recordPlayback(episode, currentTime, duration, completed = false) {
    let history = getWatchedHistory();
    const existingIndex = history.findIndex(h => h.id === episode.id);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const entry = {
        id: episode.id,
        title: episode.title,
        thumbnail: episode.thumbnail,
        completed: completed || progress >= 90,
        progress: progress,
        lastWatched: new Date().toISOString(),
        url: episode.url
    };
    if (existingIndex !== -1) {
        history[existingIndex] = entry;
    } else {
        history.push(entry);
    }
    saveWatchedHistory(history);
    return entry;
}

export function getContinueWatching() {
    let history = getWatchedHistory();
    return history.filter(h => !h.completed).sort((a,b) => new Date(b.lastWatched) - new Date(a.lastWatched));
}

// Progreso individual por video
export function getVideoProgress(videoUrl) {
    const key = `videoProgress_${videoUrl}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) { return null; }
    }
    return null;
}

export function setVideoProgress(videoUrl, currentTime, duration) {
    const key = `videoProgress_${videoUrl}`;
    localStorage.setItem(key, JSON.stringify({ currentTime, duration, timestamp: Date.now() }));
}

export function clearVideoProgress(videoUrl) {
    localStorage.removeItem(`videoProgress_${videoUrl}`);
}

// Toast notification
export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
