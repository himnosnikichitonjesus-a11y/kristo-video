// Base de datos central: series y episodios (temática bíblica/cristiana)

export const series = [
    {
        id: "doctrina",
        title: "Doctrina",
        description: "Explora las profundidades de la fe, la gracia y la redención. Una serie que aborda las enseñanzas bíblicas con un enfoque contemporáneo.",
        thumbnail: "https://i.pinimg.com/1200x/83/5f/a0/835fa013e6c8bae78c7eb21ce296cdc1.jpg",
        backdrop: "https://i.pinimg.com/1200x/83/5f/a0/835fa013e6c8bae78c7eb21ce296cdc1.jpg",
        year: 2025,
        rating: "13+",
        seasons: 5,
        duration: "15-22 min",
        categories: ["Sermones", "Historia"]
    },
    {
        id: "historias-biblicas",
        title: "Grandes Historias de la Biblia",
        description: "Las historias más emblemáticas del Antiguo y Nuevo Testamento, narradas para toda la familia.",
        thumbnail: "https://video.nikichitonjesus.org/web/image/441-fb020957/8.webp",
        backdrop: "https://video.nikichitonjesus.org/web/image/434-677fb5d7/7.webp",
        year: 2024,
        rating: "7+",
        seasons: 2,
        duration: "10-15 min",
        categories: ["Infantil", "Historia"]
    }
];

export const episodes = [
    // Serie Doctrina
    {
        id: "doctrina-gracia",
        title: "La gracia de Dios",
        url: "https://archive.org/download/xhaal/gracia001.mp4",
        thumbnail: "https://i.pinimg.com/1200x/83/5f/a0/835fa013e6c8bae78c7eb21ce296cdc1.jpg",
        thumbnail2: "https://i.pinimg.com/1200x/83/5f/a0/835fa013e6c8bae78c7eb21ce296cdc1.jpg",
        description: "Conociendo la gracia de Dios: Los humanos son los seres más corruptos... Pero no todo está perdido.",
        categories: ["Sermones", "Historia"],
        serieId: "doctrina",
        season: 5,
        episodeNum: 1,
        duration: "15:47",
        year: 2025,
        rating: "13+",
        skipIntro: { start: "00:00:10", end: "00:00:25" }
    },
    {
        id: "doctrina-fe-obras",
        title: "Fe y obras",
        url: "https://archive.org/download/sample-video-2/sample2.mp4",
        thumbnail: "https://i.pinimg.com/736x/8e/1d/2f/8e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5.jpg",
        thumbnail2: "https://i.pinimg.com/736x/8e/1d/2f/8e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5.jpg",
        description: "La relación entre la fe y las obras en la vida del creyente.",
        categories: ["Sermones"],
        serieId: "doctrina",
        season: 5,
        episodeNum: 2,
        duration: "18:22",
        year: 2025,
        rating: "13+"
    },
    // Películas / episodios sueltos
    {
        id: "jacob-promesa",
        title: "Jacob y su promesa a Dios",
        url: "https://archive.org/download/sample-video-4/sample4.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/433-ebb8fcfb/5.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/438-44d31586/6.webp",
        description: "La increíble historia bíblica de Jacob y la promesa divina que cambió su destino.",
        categories: ["Historia", "Sermones"],
        duration: "28:00",
        year: 2023,
        rating: "7+"
    },
    {
        id: "creacion",
        title: "La creación",
        url: "https://archive.org/download/sample-video-1/sample1.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/441-fb020957/8.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/434-677fb5d7/7.webp",
        description: "En el principio, Dios creó los cielos y la tierra.",
        categories: ["Historia", "Infantil"],
        duration: "12:30",
        year: 2024,
        rating: "0+"
    },
    {
        id: "job",
        title: "Job: Un hombre fiel",
        url: "https://archive.org/download/sample-video-2/sample2.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/480-af818254/Job%20Un%20hombre%20fiel%20a%20Dios.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/439-6b2939e0/10.webp",
        description: "La fe inquebrantable de Job ante la adversidad.",
        categories: ["Historia", "Documental"],
        duration: "32:15",
        year: 2022,
        rating: "13+"
    },
    {
        id: "vida-jesus",
        title: "La vida de Jesucristo en la tierra",
        url: "https://archive.org/download/sample-video-3/sample3.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/432-b68317fc/1.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/435-87046e7e/2.webp",
        description: "Un recorrido histórico por la vida de Jesús.",
        categories: ["Historia", "Documental"],
        duration: "45:00",
        year: 2025,
        rating: "13+",
        isFeatured: true
    },
    {
        id: "navidad",
        title: "La historia del nacimiento de Jesucristo",
        url: "https://archive.org/download/sample-video-4/sample4.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/506-592ed3e3/navidad001.webp",
        thumbnail2: "https://i.pinimg.com/736x/80/c3/2d/80c32dea2e940ddc4de74810277638c0.jpg",
        description: "La noche más especial de la historia.",
        categories: ["Historia", "Infantil", "Destacados"],
        duration: "18:45",
        year: 2024,
        rating: "0+",
        isFeatured: true
    },
    {
        id: "halloween",
        title: "El origen de Halloween",
        url: "https://archive.org/download/sample-video-1/sample1.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/437-5c9e773b/3.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/436-e2dc6de4/4.webp",
        description: "Un análisis profundo de esta celebración.",
        categories: ["Historia", "Documental", "Ciencia"],
        duration: "25:00",
        year: 2024,
        rating: "16+"
    },
    {
        id: "oriente-medio",
        title: "La historia del Oriente Medio",
        url: "https://archive.org/download/sample-video-2/sample2.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/440-b9ee12a1/9.webp",
        thumbnail2: "https://thumbs.odycdn.com/f43db839ef229d85df6b9f82963e2476.webp",
        description: "Civilizaciones antiguas y su impacto.",
        categories: ["Historia", "Documental"],
        duration: "52:00",
        year: 2023,
        rating: "13+"
    },
    {
        id: "gracia-parte1",
        title: "¿Qué es la gracia? Parte 1",
        url: "https://archive.org/download/sample-video-3/sample3.mp4",
        thumbnail: "https://i.pinimg.com/1200x/83/5f/a0/835fa013e6c8bae78c7eb21ce296cdc1.jpg",
        thumbnail2: "https://i.pinimg.com/1200x/83/5f/a0/835fa013e6c8bae78c7eb21ce296cdc1.jpg",
        description: "El regalo inmerecido de Dios.",
        categories: ["Sermones", "Infantil"],
        duration: "38:00",
        year: 2024,
        rating: "7+"
    },
    {
        id: "lutero",
        title: "La vida de Lutero y la Reforma",
        url: "https://archive.org/download/sample-video-4/sample4.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/501-b774a418/Luterocov.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/501-b774a418/Luterocov.webp",
        description: "El monje que desafió al imperio.",
        categories: ["Documental", "Historia", "Destacados"],
        duration: "55:00",
        year: 2023,
        rating: "13+",
        isFeatured: true
    },
    {
        id: "musica-gvd",
        title: "Música: Generación Valientes de David",
        url: "https://archive.org/download/sample-video-1/sample1.mp4",
        thumbnail: "https://video.nikichitonjesus.org/web/image/508-4f31256f/covers.webp",
        thumbnail2: "https://video.nikichitonjesus.org/web/image/508-4f31256f/covers.webp",
        description: "Alabanzas y adoración.",
        categories: ["Música"],
        duration: "4:30",
        year: 2024,
        rating: "0+"
    }
];

// Funciones auxiliares
export function getSeriesById(id) {
    return series.find(s => s.id === id);
}

export function getEpisodesBySeriesId(serieId) {
    return episodes.filter(ep => ep.serieId === serieId).sort((a,b) => (a.season - b.season) || (a.episodeNum - b.episodeNum));
}

export function getEpisodeById(id) {
    return episodes.find(ep => ep.id === id);
}

export function getRandomRecommendations(limit = 5, excludeIds = []) {
    const candidates = episodes.filter(ep => !excludeIds.includes(ep.id));
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
}

export function getAllEpisodes() {
    return episodes;
}

export function getAllSeries() {
    return series;
}
