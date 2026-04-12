(function() {
    // ==================== PLANTILLA HTML ====================
    const playerHTML = `
    <div id="universal-video-player" style="display: none;" role="region" aria-label="Reproductor de video universal">
        <style>
            #universal-video-player {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: #000;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }
            #universal-video-player video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    to bottom,
                    rgba(0,0,0,0.95) 0%,
                    rgba(0,0,0,0.35) 12%,
                    rgba(0,0,0,0.3) 20%,
                    rgba(0,0,0,0.3) 80%,
                    rgba(0,0,0,0.35) 88%,
                    rgba(0,0,0,0.95) 100%
                );
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 9;
            }
            #universal-video-player.controls-visible .backdrop {
                opacity: 1;
            }
            #video-title-container {
                position: absolute;
                top: 10px;
                left: 10px;
                color: white;
                z-index: 1001;
                opacity: 1;
                transition: opacity 0.3s;
                cursor: pointer;
            }
            #video-title {
                font-size: 20px;
                font-weight: bold;
                margin: 0;
            }
            #center-controls {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                gap: 20px;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.3s;
            }
            #center-controls button {
                background: radial-gradient(ellipse, rgba(0,0,0,0.5) 30%, transparent 70%);
                border: none;
                cursor: pointer;
                padding: 10px;
                border-radius: 50%;
                transition: transform 0.2s, opacity 0.2s;
            }
            #center-controls img {
                width: 40px;
                height: 40px;
            }
            @media (max-width: 640px) {
                #center-controls img {
                    width: 30px;
                    height: 30px;
                }
            }
            #video-controls {
                position: absolute;
                bottom: 0;
                width: 100%;
                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 100;
            }
            #progress-bar {
                width: 95vw;
                height: 3px;
                background: #ccc;
                position: relative;
                cursor: pointer;
            }
            #progress {
                height: 100%;
                background: red;
                width: 0;
                position: relative;
            }
            #progress-handle {
                position: absolute;
                right: -8px;
                top: 50%;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                background: red;
                border-radius: 50%;
                cursor: grab;
                touch-action: none;
            }
            #progress-handle.dragging {
                cursor: grabbing;
            }
            #progress-time-tooltip {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                display: none;
                pointer-events: none;
                z-index: 101;
            }
            #bottom-controls {
                width: 95vw;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 5px;
            }
            #nav-controls, #right-controls {
                display: flex;
                align-items: center;
                gap: 0;
            }
            #nav-controls {
                justify-content: flex-start;
            }
            #right-controls {
                justify-content: flex-end;
            }
            #nav-controls button, #right-controls button {
                background: none;
                border: none;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s;
                padding: 5px;
            }
            #nav-controls img, #right-controls img {
                width: 24px;
                height: 24px;
            }
            @media (max-width: 640px) {
                #nav-controls img, #right-controls img {
                    width: 20px;
                    height: 20px;
                }
                #fullscreen-btn {
                    display: none;
                }
            }
            #time-display {
                color: white;
                font-size: 14px;
                padding: 5px 10px;
                border-radius: 15px;
            }
            @media (max-width: 640px) {
                #time-display {
                    font-size: 12px;
                }
            }
            #video-info {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                color: white;
                display: none;
                z-index: 1002;
                touch-action: manipulation;
            }
            #video-info-content {
                position: absolute;
                top: 50%;
                left: 60px;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                width: 50%;
            }
            #video-info-content.expanded {
                width: 90%;
            }
            #video-info h1 {
                font-size: 32px;
                margin: 0;
            }
            #video-info p {
                font-size: 15px;
                margin: 5px 0;
            }
            #video-info #info-description {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
            }
            #video-info #info-description:not(.expanded) {
                -webkit-line-clamp: 3;
            }
            #video-info #info-description::after {
                content: 'más...';
                display: none;
                color: #1e90ff;
            }
            #video-info #info-description:not(.expanded):not(:empty) {
                max-height: 4.5em;
            }
            #video-info #info-description:not(.expanded):not(:empty)::after {
                display: inline;
            }
            #video-info button {
                background: #007bff;
                color: white;
                border: none;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 5px;
                transition: background 0.2s, transform 0.2s, opacity 0.2s;
                margin: 5px 0;
            }
            #video-info button:hover {
                background: #0056b3;
            }
            #next-episode-info-btn {
                background: #28a745;
            }
            #next-episode-info-btn:hover {
                background: #218838;
            }
            #hide-video-info-btn {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: none;
                color: white;
                border: none;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 16px;
                cursor: pointer;
                z-index: 1003;
            }
            #hide-video-info-btn img {
                width: 24px;
                height: 24px;
            }
            @media (max-width: 640px) {
                #video-info h1 {
                    font-size: 24px;
                }
                #video-info p {
                    font-size: 14px;
                }
                #video-info-content {
                    left: 30px;
                }
                #hide-video-info-btn {
                    right: 10px;
                }
            }
            #time-indicator {
                position: absolute;
                background: radial-gradient(ellipse, rgba(0,0,0,0.5) 30%, transparent 70%);
                padding: 5px 10px;
                border-radius: 10px;
                z-index: 9;
                display: none;
                color: white;
                font-size: 18px;
                line-height: 1;
            }
            #time-indicator img {
                width: 40px;
                height: 40px;
                vertical-align: middle;
            }
            @media (max-width: 640px) {
                #time-indicator {
                    font-size: 14px;
                }
                #time-indicator img {
                    width: 30px;
                    height: 30px;
                }
            }
            #time-indicator.seek-back {
                animation: slideLeft 0.3s forwards;
            }
            #time-indicator.seek-forward {
                animation: slideRight 0.3s forwards;
            }
            @keyframes slideLeft {
                from { transform: translateX(0); }
                to { transform: translateX(calc(-2 * var(--vw, 1vw))); }
            }
            @keyframes slideRight {
                from { transform: translateX(0); }
                to { transform: translateX(calc(2 * var(--vw, 1vw))); }
            }
            .skip-buttons-container {
                position: absolute;
                bottom: 60px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 100;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .credits-buttons-container {
                position: absolute;
                bottom: 60px;
                right: 20px;
                display: none;
                flex-direction: column;
                gap: 10px;
                z-index: 100;
                align-items: flex-end;
            }
            .credits-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: flex-end;
            }
            .skip-button {
                position: relative;
                background: linear-gradient(135deg, #1e90ff, #00b7eb);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s, opacity 0.2s;
            }
            .skip-button:hover {
                transform: scale(1.05);
            }
            .next-episode-preview {
                position: relative;
                width: 200px;
                height: 112px;
                background-size: cover;
                background-position: center;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .next-episode-preview .play-button {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, rgba(255,255,255,0.8) 50%, transparent 70%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .next-episode-preview .play-button img {
                width: 30px;
                height: 30px;
            }
            .next-episode-preview .progress-circle {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: conic-gradient(#28a745 0% 0%, transparent 0% 100%);
                z-index: -1;
            }
            .next-episode-preview .progress-circle.active {
                animation: progressCircle 10s linear forwards;
            }
            @keyframes progressCircle {
                from { background: conic-gradient(#28a745 0% 0%, transparent 0% 100%); }
                to { background: conic-gradient(#28a745 0% 100%, transparent 100% 100%); }
            }
            #cancel-skip-credits {
                background: #ff4500;
            }
            #cancel-skip-credits:hover {
                background: #cc3700;
            }
            @media (max-width: 640px) {
                .next-episode-preview {
                    width: 150px;
                    height: 84px;
                }
                .next-episode-preview .play-button {
                    width: 40px;
                    height: 40px;
                }
                .next-episode-preview .play-button img {
                    width: 24px;
                    height: 24px;
                }
                .next-episode-preview .progress-circle {
                    width: 48px;
                    height: 48px;
                }
            }
            .initial-skip-indicator {
                position: absolute;
                bottom: 60px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: radial-gradient(ellipse, rgba(0,0,0,0.7) 30%, transparent 70%);
                padding: 20px;
                border-radius: 10px;
                z-index: 1001;
                opacity: 1;
                transition: opacity 0.3s;
            }
            .initial-skip-indicator .skip-button {
                background: linear-gradient(135deg, #ff4500, #ff6347);
            }
            .slider-container {
                position: relative;
            }
            .slider-popup {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(10px);
                background: rgba(0,0,0,0.7);
                padding: 5px;
                border-radius: 5px;
                display: none;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                z-index: 101;
                opacity: 0;
                transition: transform 0.3s, opacity 0.3s;
            }
            .slider-popup.show {
                display: flex;
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            .slider-popup input[type="range"] {
                width: 100px;
                accent-color: #1e90ff;
                cursor: pointer;
            }
            .slider-popup span {
                color: white;
                font-size: 12px;
            }
            @media (max-width: 640px) {
                .slider-popup input[type="range"] {
                    width: 80px;
                }
            }
            #close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: radial-gradient(ellipse, rgba(0,0,0,0.5) 30%, transparent 70%);
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                z-index: 1004;
                opacity: 0;
                transition: opacity 0.3s, transform 0.2s;
            }
            #close-btn img {
                width: 24px;
                height: 24px;
            }
            #episode-list {
                position: fixed;
                top: 20%;
                right: 0;
                width: 40%;
                height: 60%;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 20px;
                transform: translateX(100%);
                transition: transform 0.3s;
                z-index: 1002;
                overflow-y: auto;
                box-sizing: border-box;
            }
            #episode-list.show {
                transform: translateX(0);
            }
            #episode-list h3 {
                margin: 0 0 15px;
                font-size: 18px;
                position: sticky;
                top: 20px;
                background: rgba(0,0,0,0.9);
                z-index: 1003;
            }
            #episode-list .episode-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                margin-bottom: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.2);
                cursor: pointer;
                transition: background 0.2s, transform 0.2s;
                background: transparent;
            }
            #episode-list .episode-item:last-child {
                border-bottom: none;
            }
            #episode-list .episode-item:hover {
                background: rgba(255,255,255,0.05);
            }
            #episode-list .episode-item.active {
                background: rgba(50,50,50,0.9);
                border-left: 4px solid #1e90ff;
                transform: scale(1.02);
                box-shadow: 0 2px 6px rgba(30, 144, 255, 0.5);
            }
            #episode-list .episode-item p {
                margin: 0;
                font-weight: bold;
                font-size: 14px;
                color: white;
            }
            #episode-list .episode-thumbnail {
                width: 100px;
                height: 56px;
                background-size: cover;
                background-position: center;
                border-radius: 4px;
                flex-shrink: 0;
            }
            @media (max-width: 640px) {
                #episode-list {
                    width: 80%;
                }
                #episode-list .episode-item p {
                    font-size: 12px;
                }
                #episode-list .episode-thumbnail {
                    width: 80px;
                    height: 45px;
                }
            }
            #close-list-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: radial-gradient(ellipse, rgba(0,0,0,0.5) 30%, transparent 70%);
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                position: sticky;
                top: 10px;
                z-index: 1004;
                transition: transform 0.2s, opacity 0.2s;
            }
            #close-list-btn img {
                width: 24px;
                height: 24px;
            }
            #history-playlist {
                position: fixed;
                top: 20%;
                right: 0;
                width: 40%;
                height: 60%;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 20px;
                transform: translateX(100%);
                transition: transform 0.3s;
                z-index: 1002;
                overflow-y: auto;
                box-sizing: border-box;
            }
            #history-playlist.show {
                transform: translateX(0);
            }
            #history-playlist h3 {
                margin: 0 0 15px;
                font-size: 18px;
                position: sticky;
                top: 20px;
                background: rgba(0,0,0,0.9);
                z-index: 1003;
            }
            #history-playlist h4 {
                font-size: 16px;
                margin: 20px 0 10px;
            }
            #history-list, #playlist-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .history-item, .playlist-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.2);
                cursor: pointer;
                transition: background 0.2s;
            }
            .history-item:hover, .playlist-item:hover {
                background: rgba(255,255,255,0.05);
            }
            .history-item p, .playlist-item p {
                margin: 0;
                font-size: 14px;
            }
            .history-item .episode-thumbnail, .playlist-item .episode-thumbnail {
                width: 100px;
                height: 56px;
                background-size: cover;
                background-position: center;
                border-radius: 4px;
                flex-shrink: 0;
            }
            #close-history-playlist-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: radial-gradient(ellipse, rgba(0,0,0,0.5) 30%, transparent 70%);
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                position: sticky;
                top: 10px;
                z-index: 1004;
            }
            #close-history-playlist-btn img {
                width: 24px;
                height: 24px;
            }
            .button-clicked {
                transform: scale(0.9) !important;
                opacity: 0.8 !important;
            }
            #error-message {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 8px;
                z-index: 1001;
                display: none;
                text-align: center;
                max-width: 80%;
            }
            /* LOADING INDICATOR ESTILOS */
            #loading-indicator {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: none;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 2000;
                color: white;
                font-family: Arial, sans-serif;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255,255,255,0.3);
                border-top: 5px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 15px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .percentage {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .thumbnail {
                width: 200px;
                height: 112px;
                background-size: cover;
                background-position: center;
                border-radius: 8px;
                margin-top: 10px;
            }
            @media (max-width: 640px) {
                .spinner {
                    width: 40px;
                    height: 40px;
                }
                .percentage {
                    font-size: 14px;
                }
                .thumbnail {
                    width: 150px;
                    height: 84px;
                }
            }
            .settings-popup {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(10px);
                background: rgba(0,0,0,0.7);
                padding: 10px;
                border-radius: 5px;
                display: none;
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
                z-index: 101;
                opacity: 0;
                transition: transform 0.3s, opacity 0.3s;
            }
            .settings-popup.show {
                display: flex;
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            .settings-popup button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
            }
            .settings-popup button img {
                width: 20px;
                height: 20px;
            }
        </style>
        <div class="backdrop" role="button" aria-label="Interactuar con el video"></div>
        <div id="video-title-container">
            <div id="video-title" role="heading" aria-level="1"></div>
        </div>
        <button id="close-btn" aria-label="Cerrar reproductor"><img src="https://nikichitonjesus.odoo.com/web/image/560-69997e09/cerrar.png" alt=""></button>
        <video id="player-video" poster=""></video>
        <div id="center-controls">
            <button id="seek-back-btn" aria-label="Retroceder 10 segundos"><img src="https://www.nikichitonjesus.com/web/image/438-deea748f/-10.webp" alt=""></button>
            <button id="play-pause-btn" aria-label="Reproducir o pausar"><img src="https://nikichitonjesus.odoo.com/web/image/715-d5d403f0/playvid.png" alt=""></button>
            <button id="seek-forward-btn" aria-label="Avanzar 10 segundos"><img src="https://www.nikichitonjesus.com/web/image/439-9448d521/%2B10.webp" alt=""></button>
        </div>
        <div id="video-controls">
            <div id="progress-bar" role="slider" aria-label="Barra de progreso del video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div id="progress">
                    <div id="progress-handle" role="slider" aria-label="Control de progreso"></div>
                    <div id="progress-time-tooltip"></div>
                </div>
            </div>
            <div id="bottom-controls">
                <div id="nav-controls">
                    <button id="prev-episode-btn" aria-label="Episodio anterior"><img src="https://www.nikichitonjesus.com/web/image/437-b1fd1bf4/anterior.webp" alt=""></button>
                    <button id="next-episode-btn-ui" aria-label="Siguiente episodio"><img src="https://www.nikichitonjesus.com/web/image/443-aa8bad56/otro.webp" alt=""></button>
                    <span id="time-display" aria-live="polite">0:00 / 0:00</span>
                </div>
                <div id="right-controls">
                    <div class="slider-container">
                        <button id="speed-btn" aria-label="Ajustar velocidad de reproducción"><img src="https://nikichitonjesus.odoo.com/web/image/637-65e36988/speed.png" alt=""></button>
                        <div class="slider-popup" id="speed-popup">
                            <input type="range" id="speed-slider" min="0.25" max="2" step="0.25" value="1" aria-label="Control de velocidad de reproducción">
                            <span id="speed-indicator">Normal</span>
                        </div>
                    </div>
                    <div class="slider-container">
                        <button id="volume-btn" aria-label="Ajustar volumen"><img src="https://nikichitonjesus.odoo.com/web/image/587-e4437449/volumen.png" alt=""></button>
                        <div class="slider-popup" id="volume-popup">
                            <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="1" aria-label="Control de volumen">
                            <span id="volume-indicator">100%</span>
                        </div>
                    </div>
                    <button id="episodes-btn" aria-label="Mostrar lista de episodios"><img src="https://www.nikichitonjesus.com/web/image/445-ad116cfc/episodios.webp" alt=""></button>
                    <div class="slider-container">
                        <button id="settings-btn" aria-label="Ajustes"><img src="https://nikichitonjesus1.odoo.com/web/image/467-70279418/configuration.webp" alt=""></button>
                        <div class="settings-popup" id="settings-popup">
                            <button id="history-playlist-btn" aria-label="Mostrar historial y lista de reproducción"><img src="https://www.nikichitonjesus.com/web/image/624-c6583305/registro.webp" alt="">Historial</button>
                            <button id="pip-settings-btn" aria-label="Ver en miniatura"><img src="https://www.nikichitonjesus.com/web/image/622-10442ee4/pip.webp" alt=""> Ver en Miniatura</button>
                        </div>
                    </div>
                    <button id="fullscreen-btn" aria-label="Activar o desactivar pantalla completa"><img src="https://nikichitonjesus.odoo.com/web/image/622-49c31be4/full.png" alt=""></button>
                </div>
            </div>
        </div>
        <div id="time-indicator" aria-live="assertive"></div>
        <div class="skip-buttons-container">
            <button id="skip-intro-btn" class="skip-button" style="display: none;" aria-label="Omitir introducción">Omitir Intro</button>
            <button id="skip-recap-btn" class="skip-button" style="display: none;" aria-label="Omitir resumen">Omitir Resumen</button>
        </div>
        <div class="credits-buttons-container" style="display: none;">
            <div class="credits-buttons">
                <button id="cancel-skip-credits" class="skip-button" aria-label="Cancelar omisión de créditos">Cancelar</button>
                <div id="next-episode-preview" class="next-episode-preview" role="button" aria-label="Reproducir siguiente episodio">
                    <div class="play-button">
                        <img src="https://nikichitonjesus.odoo.com/web/image/715-d5d403f0/playvid.png" alt="Reproducir">
                    </div>
                    <div class="progress-circle"></div>
                </div>
            </div>
        </div>
        <div class="initial-skip-indicator" id="initial-skip-indicator" style="display: none;"></div>
        <div id="video-info" role="dialog" aria-label="Información del video">
            <div id="video-info-content">
                <h1 id="info-title"></h1>
                <p id="info-season"></p>
                <p id="info-description"></p>
                <button id="replay-btn" aria-label="Iniciar de nuevo">Iniciar de nuevo</button>
                <button id="resume-btn" aria-label="Seguir viendo">Seguir viendo</button>
                <button id="next-episode-info-btn" aria-label="Ver siguiente episodio" style="display: none;">Ver siguiente episodio</button>
            </div>
            <button id="hide-video-info-btn" aria-label="Ocultar información del video"><img src="https://nikichitonjesus.odoo.com/web/image/627-0eb88906/minimizar.png" alt=""> | Pausa</button>
        </div>
        <div id="episode-list" role="dialog" aria-label="Lista de episodios">
            <h3>Lista de Episodios</h3>
            <button id="close-list-btn" aria-label="Cerrar lista de episodios"><img src="https://nikichitonjesus.odoo.com/web/image/560-69997e09/cerrar.png" alt=""></button>
            <div id="list-content"></div>
        </div>
        <div id="history-playlist" style="display: none;" role="dialog" aria-label="Historial y lista de reproducción">
            <h3>Historial y Lista de Reproducción</h3>
            <button id="close-history-playlist-btn" aria-label="Cerrar historial y lista de reproducción"><img src="https://nikichitonjesus.odoo.com/web/image/560-69997e09/cerrar.png" alt=""></button>
            <div id="history-content">
                <h4>Historial de reproducción</h4>
                <div id="history-list"></div>
            </div>
            <div id="playlist-content">
                <h4>Lista de reproducción</h4>
                <div id="playlist-list"></div>
            </div>
        </div>
        <div id="loading-indicator" aria-live="polite">
            <div class="spinner"></div>
            <div class="percentage" id="loading-percentage">0%</div>
            <div class="thumbnail" id="loading-thumbnail"></div>
        </div>
        <div id="error-message" role="alert"></div>
    </div>
    `;

    // ==================== LÓGICA DEL REPRODUCTOR ====================
    let player, video, controls, centerControls, playPauseBtn, titleContainer, titleDiv, closeBtn, indicator, progress, progressBar, progressHandle, progressTimeTooltip, timeDisplay;
    let skipIntroBtn, skipRecapBtn, cancelSkipCreditsBtn, nextEpisodePreview, progressCircle, videoInfo, videoInfoContent, infoTitle, infoSeason, infoDescription, replayBtn, resumeBtn, hideVideoInfoBtn, episodeListEl, listContent, closeListBtn;
    let loadingIndicator, loadingPercentage, loadingThumbnail, speedBtn, volumeBtn, speedSlider, volumeSlider, speedPopup, volumePopup, speedIndicator, volumeIndicator, skipButtonsContainer, creditsButtonsContainer, initialSkipIndicator, seekBackBtn, seekForwardBtn;
    let historyPlaylistEl, historyList, playlistList, backdrop, errorMessage, settingsBtn, settingsPopup;
    let controlsTimeout = null, sliderTimeout = null, isPlaying = false, playbackSpeed = 1, infoTimeout = null;
    let episodeData = null, currentEpisodeIndex = 0, skipTimerActive = false, shownRanges = { skipIntro: null, skipRecap: null };
    let isMobile = false, randomEpisodeOrder = [], lastTouchTime = 0, touchTimeout = null, isDragging = false;

    // Funciones auxiliares
    function parseTime(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
        if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        return 0;
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            setTimeout(() => { if (errorMessage) errorMessage.style.display = 'none'; }, 5000);
        } else {
            console.error(message);
        }
    }

    function hideError() {
        if (errorMessage) errorMessage.style.display = 'none';
    }

    function saveProgress() {
        if (video && video.src && episodeData) {
            localStorage.setItem(`videoProgress_${video.src}`, video.currentTime);
            const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
            const episode = episodeData.episodes[currentEpisodeIndex];
            if (!episode) return;
            const isCompleted = video.currentTime >= video.duration * 0.95;
            const episodeInfo = {
                url: episode.url,
                title: episode.title,
                season: episode.season,
                description: episode.description,
                thumbnail: episode.thumbnail || 'https://via.placeholder.com/120x67.png',
                timestamp: new Date().toISOString(),
                completed: isCompleted
            };
            const existingIndex = watchedHistory.findIndex(item => item.url === episode.url);
            if (existingIndex >= 0) watchedHistory[existingIndex] = episodeInfo;
            else watchedHistory.push(episodeInfo);
            localStorage.setItem('watchedHistory', JSON.stringify(watchedHistory));
        }
    }

    function showControls() {
        if (!player) return;
        player.classList.add('controls-visible');
        controls.style.opacity = '1';
        centerControls.style.opacity = '1';
        titleContainer.style.opacity = '1';
        closeBtn.style.opacity = '1';
        if (skipButtonsContainer) skipButtonsContainer.style.opacity = '1';
        clearTimeout(controlsTimeout);
        if (isPlaying && !speedPopup?.classList.contains('show') && !volumePopup?.classList.contains('show') && !isDragging) {
            controlsTimeout = setTimeout(hideControls, 3000);
        }
    }

    function hideControls() {
        if (!player) return;
        if (!speedPopup?.classList.contains('show') && !volumePopup?.classList.contains('show') && !isDragging) {
            player.classList.remove('controls-visible');
            controls.style.opacity = '0';
            centerControls.style.opacity = '0';
            titleContainer.style.opacity = '0';
            closeBtn.style.opacity = '0';
            if (skipButtonsContainer) skipButtonsContainer.style.opacity = '0';
            if (skipIntroBtn) skipIntroBtn.style.display = 'none';
            if (skipRecapBtn) skipRecapBtn.style.display = 'none';
        }
    }

    function showLoading() {
        if (loadingIndicator && episodeData) {
            const episode = episodeData.episodes[currentEpisodeIndex];
            if (episode && loadingThumbnail) loadingThumbnail.style.backgroundImage = `url('${episode.thumbnail || 'https://via.placeholder.com/120x67.png'}')`;
            loadingIndicator.style.display = 'flex';
            if (loadingPercentage) loadingPercentage.textContent = '0%';
        }
    }

    function updateLoadingPercentage() {
        if (video && video.buffered.length > 0 && loadingPercentage) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const percent = (bufferedEnd / video.duration) * 100;
            loadingPercentage.textContent = `${Math.round(percent)}%`;
        }
    }

    function hideLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }

    function handleVideoError(err) {
        console.error('Video error:', err);
        showError('Error al reproducir el video. Por favor, intenta de nuevo.');
    }

    function togglePlay() {
        if (isPlaying) {
            video.pause();
            playPauseBtn.querySelector('img').src = 'https://nikichitonjesus.odoo.com/web/image/715-d5d403f0/playvid.png';
            playPauseBtn.setAttribute('aria-label', 'Reproducir');
            isPlaying = false;
            // Indicador de pausa visual
            if (indicator) {
                indicator.innerHTML = '<img src="https://nikichitonjesus.odoo.com/web/image/716-c7a68f34/pausevid.png" alt="Pausar">';
                indicator.style.display = 'block';
                setTimeout(() => { if (indicator) indicator.style.display = 'none'; }, 500);
            }
            clearTimeout(infoTimeout);
            infoTimeout = setTimeout(() => { if (!isPlaying && videoInfo) showVideoInfo(); }, 6000);
        } else {
            video.play().catch(handleVideoError);
            playPauseBtn.querySelector('img').src = 'https://nikichitonjesus.odoo.com/web/image/716-c7a68f34/pausevid.png';
            playPauseBtn.setAttribute('aria-label', 'Pausar');
            isPlaying = true;
            if (indicator) {
                indicator.innerHTML = '<img src="https://nikichitonjesus.odoo.com/web/image/715-d5d403f0/playvid.png" alt="Reproducir">';
                indicator.style.display = 'block';
                setTimeout(() => { if (indicator) indicator.style.display = 'none'; }, 500);
            }
            if (videoInfo && videoInfo.style.display === 'flex') hideVideoInfo();
        }
        showControls();
    }

    function seek(seconds) {
        if (!video) return;
        video.currentTime += seconds;
        const indicatorText = seconds > 0 ? '+10s' : '-10s';
        if (indicator) {
            indicator.innerHTML = indicatorText;
            indicator.classList.remove('seek-back', 'seek-forward');
            indicator.classList.add(seconds > 0 ? 'seek-forward' : 'seek-back');
            indicator.style.display = 'block';
            setTimeout(() => { if (indicator) indicator.style.display = 'none'; }, 500);
        }
        showControls();
    }

    function updateProgress() {
        if (!video || !video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (progress) progress.style.width = percent + '%';
        if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(percent));
        const currentTime = formatTime(video.currentTime);
        const duration = formatTime(video.duration);
        if (timeDisplay) timeDisplay.textContent = `${currentTime} / ${duration}`;
        if (episodeData && episodeData.episodes[currentEpisodeIndex]) {
            const episode = episodeData.episodes[currentEpisodeIndex];
            const current = video.currentTime;
            if (skipButtonsContainer && skipButtonsContainer.style.opacity === '1') {
                if (episode.skipIntro && current >= parseTime(episode.skipIntro.start) && current <= parseTime(episode.skipIntro.end)) {
                    if (skipIntroBtn) skipIntroBtn.style.display = 'block';
                } else if (skipIntroBtn) skipIntroBtn.style.display = 'none';
                if (episode.skipRecap && current >= parseTime(episode.skipRecap.start) && current <= parseTime(episode.skipRecap.end)) {
                    if (skipRecapBtn) skipRecapBtn.style.display = 'block';
                } else if (skipRecapBtn) skipRecapBtn.style.display = 'none';
            }
            // Mostrar botones iniciales de omisión
            if (!skipTimerActive && episode && (episode.skipIntro || episode.skipRecap)) {
                if (initialSkipIndicator) {
                    initialSkipIndicator.innerHTML = '';
                    let has = false;
                    if (episode.skipIntro && current >= parseTime(episode.skipIntro.start) && current <= parseTime(episode.skipIntro.end) && !shownRanges.skipIntro) {
                        const btn = document.createElement('button');
                        btn.className = 'skip-button';
                        btn.textContent = 'Omitir Intro';
                        btn.addEventListener('click', skipIntro);
                        initialSkipIndicator.appendChild(btn);
                        shownRanges.skipIntro = true;
                        has = true;
                    }
                    if (episode.skipRecap && current >= parseTime(episode.skipRecap.start) && current <= parseTime(episode.skipRecap.end) && !shownRanges.skipRecap) {
                        const btn = document.createElement('button');
                        btn.className = 'skip-button';
                        btn.textContent = 'Omitir Resumen';
                        btn.addEventListener('click', skipRecap);
                        initialSkipIndicator.appendChild(btn);
                        shownRanges.skipRecap = true;
                        has = true;
                    }
                    if (has) {
                        skipTimerActive = true;
                        initialSkipIndicator.style.display = 'flex';
                        setTimeout(() => {
                            if (initialSkipIndicator) initialSkipIndicator.style.display = 'none';
                            skipTimerActive = false;
                        }, 3000);
                    }
                }
            }
            // Créditos
            if (episode.skipCredits && current >= parseTime(episode.skipCredits.start) && current <= parseTime(episode.skipCredits.end)) {
                if (creditsButtonsContainer) {
                    creditsButtonsContainer.style.display = 'flex';
                    showSkipCreditsButton();
                }
            } else if (creditsButtonsContainer) {
                creditsButtonsContainer.style.display = 'none';
                if (progressCircle) progressCircle.style.animation = 'none';
            }
        }
    }

    function skipIntro() {
        if (episodeData && episodeData.episodes[currentEpisodeIndex] && episodeData.episodes[currentEpisodeIndex].skipIntro) {
            video.currentTime = parseTime(episodeData.episodes[currentEpisodeIndex].skipIntro.end);
            if (skipIntroBtn) skipIntroBtn.style.display = 'none';
            if (initialSkipIndicator) initialSkipIndicator.style.display = 'none';
            skipTimerActive = false;
        }
        showControls();
    }

    function skipRecap() {
        if (episodeData && episodeData.episodes[currentEpisodeIndex] && episodeData.episodes[currentEpisodeIndex].skipRecap) {
            video.currentTime = parseTime(episodeData.episodes[currentEpisodeIndex].skipRecap.end);
            if (skipRecapBtn) skipRecapBtn.style.display = 'none';
            if (initialSkipIndicator) initialSkipIndicator.style.display = 'none';
            skipTimerActive = false;
        }
        showControls();
    }

    function showSkipCreditsButton() {
        if (!creditsButtonsContainer || !nextEpisodePreview || !progressCircle) return;
        const nextIndex = randomEpisodeOrder.length > 0 && currentEpisodeIndex < randomEpisodeOrder.length - 1
            ? randomEpisodeOrder[currentEpisodeIndex + 1]
            : currentEpisodeIndex < episodeData.episodes.length - 1 ? currentEpisodeIndex + 1 : null;
        if (nextIndex !== null) {
            const nextEpisode = episodeData.episodes[nextIndex];
            nextEpisodePreview.style.backgroundImage = `url('${nextEpisode.thumbnail || 'https://via.placeholder.com/120x67.png'}')`;
        } else {
            nextEpisodePreview.style.backgroundImage = 'url("https://via.placeholder.com/120x67.png")';
        }
        progressCircle.style.animation = 'none';
        void progressCircle.offsetWidth;
        progressCircle.style.animation = 'progressCircle 10s linear forwards';
        progressCircle.classList.add('active');
        progressCircle.addEventListener('animationend', playNextEpisode, { once: true });
        showControls();
    }

    function cancelSkipCredits() {
        if (progressCircle) {
            progressCircle.style.animation = 'none';
            progressCircle.classList.remove('active');
            progressCircle.removeEventListener('animationend', playNextEpisode);
        }
        if (creditsButtonsContainer) creditsButtonsContainer.style.display = 'none';
        showControls();
        clearTimeout(infoTimeout);
        infoTimeout = setTimeout(() => { if (!isPlaying && videoInfo) showVideoInfo(); }, 6000);
    }

    function playEpisode(episode, reset = false) {
        if (!video) return;
        video.src = episode.url;
        video.poster = episode.thumbnail || 'https://via.placeholder.com/120x67.png';
        if (titleDiv) titleDiv.textContent = episode.title || 'Playing';
        const savedTime = localStorage.getItem(`videoProgress_${episode.url}`);
        if (savedTime && !reset) video.currentTime = parseFloat(savedTime);
        else video.currentTime = 0;
        video.play().catch(handleVideoError);
        isPlaying = true;
        showControls();
        if (playPauseBtn) {
            playPauseBtn.querySelector('img').src = 'https://nikichitonjesus.odoo.com/web/image/716-c7a68f34/pausevid.png';
            playPauseBtn.setAttribute('aria-label', 'Pausar');
        }
        saveProgress();
        shownRanges = { skipIntro: null, skipRecap: null };
        if (videoInfo) hideVideoInfo();
    }

    function playNextEpisode() {
        if (!episodeData) return;
        if (randomEpisodeOrder.length > 0 && currentEpisodeIndex < randomEpisodeOrder.length - 1) {
            currentEpisodeIndex++;
            const episode = episodeData.episodes[randomEpisodeOrder[currentEpisodeIndex]];
            const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
            const history = watchedHistory.find(item => item.url === episode.url);
            playEpisode(episode, !history);
            if (typeof populatePlayerEpisodeList === 'function') populatePlayerEpisodeList(episodeData.episodes);
        } else if (currentEpisodeIndex < episodeData.episodes.length - 1) {
            currentEpisodeIndex++;
            const episode = episodeData.episodes[currentEpisodeIndex];
            const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
            const history = watchedHistory.find(item => item.url === episode.url);
            playEpisode(episode, !history);
            if (typeof populatePlayerEpisodeList === 'function') populatePlayerEpisodeList(episodeData.episodes);
        } else {
            video.pause();
            isPlaying = false;
            if (playPauseBtn) {
                playPauseBtn.querySelector('img').src = 'https://nikichitonjesus.odoo.com/web/image/715-d5d403f0/playvid.png';
                playPauseBtn.setAttribute('aria-label', 'Reproducir');
            }
            showVideoInfo();
        }
        if (progressCircle) progressCircle.style.animation = 'none';
        if (creditsButtonsContainer) creditsButtonsContainer.style.display = 'none';
        showControls();
    }

    function playPreviousEpisode() {
        if (!episodeData) return;
        if (randomEpisodeOrder.length > 0 && currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            const episode = episodeData.episodes[randomEpisodeOrder[currentEpisodeIndex]];
            const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
            const history = watchedHistory.find(item => item.url === episode.url);
            playEpisode(episode, !history);
            if (typeof populatePlayerEpisodeList === 'function') populatePlayerEpisodeList(episodeData.episodes);
        } else if (currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            const episode = episodeData.episodes[currentEpisodeIndex];
            const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
            const history = watchedHistory.find(item => item.url === episode.url);
            playEpisode(episode, !history);
            if (typeof populatePlayerEpisodeList === 'function') populatePlayerEpisodeList(episodeData.episodes);
        }
        showControls();
    }

    function showVideoInfo() {
        if (!episodeData || !videoInfo) return;
        const episode = episodeData.episodes[currentEpisodeIndex];
        const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
        const history = watchedHistory.find(item => item.url === episode.url);
        if (infoTitle) infoTitle.textContent = episode.title || 'Playing';
        if (infoSeason) infoSeason.textContent = episode.season || 'Unknown Season';
        if (infoDescription) infoDescription.textContent = episode.description || 'No description available.';
        if (replayBtn) replayBtn.style.display = history && history.completed ? 'block' : 'none';
        if (resumeBtn) resumeBtn.style.display = history && !history.completed ? 'block' : 'none';
        const nextEpisodeBtn = document.getElementById('next-episode-info-btn');
        if (nextEpisodeBtn) nextEpisodeBtn.style.display = (history && history.completed && currentEpisodeIndex < episodeData.episodes.length - 1) ? 'block' : 'none';
        videoInfo.style.display = 'flex';
        showControls();
    }

    function hideVideoInfo() {
        if (videoInfo) {
            videoInfo.style.display = 'none';
            if (videoInfoContent) videoInfoContent.classList.remove('expanded');
            if (infoDescription) infoDescription.classList.remove('expanded');
        }
        clearTimeout(infoTimeout);
    }

    function populatePlayerEpisodeList(episodes) {
        if (!listContent) return;
        listContent.innerHTML = '';
        if (episodes && episodes.length) {
            episodes.forEach((episode, index) => {
                const episodeItem = document.createElement('div');
                episodeItem.className = `episode-item${index === currentEpisodeIndex ? ' active' : ''}`;
                episodeItem.setAttribute('role', 'button');
                episodeItem.setAttribute('aria-label', `Reproducir episodio: ${episode.title}`);
                episodeItem.innerHTML = `
                    <div class="episode-thumbnail" style="background-image: url('${episode.thumbnail || 'https://via.placeholder.com/120x67.png'}');"></div>
                    <p>${episode.title}</p>
                `;
                episodeItem.addEventListener('click', () => {
                    currentEpisodeIndex = index;
                    const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
                    const history = watchedHistory.find(item => item.url === episode.url);
                    playEpisode(episode, history && history.completed ? true : !history);
                    if (episodeListEl) episodeListEl.classList.remove('show');
                    populatePlayerEpisodeList(episodes);
                });
                listContent.appendChild(episodeItem);
            });
        } else {
            listContent.innerHTML = '<p role="alert">No hay episodios disponibles</p>';
        }
    }

    function toggleEpisodeList() {
        if (episodeListEl) {
            episodeListEl.classList.toggle('show');
            if (episodeListEl.classList.contains('show') && typeof scrollToCurrentEpisode === 'function') scrollToCurrentEpisode();
        }
        showControls();
    }

    function scrollToCurrentEpisode() {
        if (listContent) {
            const activeItem = listContent.querySelector('.episode-item.active');
            if (activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function toggleHistoryPlaylist() {
        if (historyPlaylistEl) {
            historyPlaylistEl.classList.toggle('show');
            if (historyPlaylistEl.classList.contains('show')) populateHistoryPlaylist();
        }
        showControls();
    }

    function populateHistoryPlaylist() {
        if (!historyList || !playlistList) return;
        const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
        const playlist = JSON.parse(localStorage.getItem('playlist') || '[]');
        historyList.innerHTML = '<h4>Historial de reproducción</h4>';
        if (watchedHistory.length === 0) historyList.innerHTML += '<p role="alert">No hay historial de reproducción</p>';
        else {
            watchedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="episode-thumbnail" style="background-image: url('${item.thumbnail || 'https://via.placeholder.com/120x67.png'}');"></div>
                    <p>${item.title} ${item.completed ? '(Visto)' : ''}<br>${item.season || ''} | ${new Date(item.timestamp).toLocaleString()}</p>
                `;
                historyItem.addEventListener('click', () => {
                    if (episodeData) {
                        const episodeIndex = episodeData.episodes.findIndex(ep => ep.url === item.url);
                        if (episodeIndex >= 0) {
                            currentEpisodeIndex = episodeIndex;
                            playEpisode(episodeData.episodes[episodeIndex], item.completed ? true : false);
                            if (historyPlaylistEl) historyPlaylistEl.classList.remove('show');
                        }
                    }
                });
                historyList.appendChild(historyItem);
            });
        }
        playlistList.innerHTML = '<h4>Lista de reproducción</h4>';
        if (playlist.length === 0) playlistList.innerHTML += '<p role="alert">No hay episodios en la lista de reproducción</p>';
        else {
            playlist.forEach(item => {
                const playlistItem = document.createElement('div');
                playlistItem.className = 'playlist-item';
                playlistItem.innerHTML = `
                    <div class="episode-thumbnail" style="background-image: url('${item.thumbnail || 'https://via.placeholder.com/120x67.png'}');"></div>
                    <p>${item.title}</p>
                `;
                playlistItem.addEventListener('click', () => {
                    if (episodeData) {
                        const episodeIndex = episodeData.episodes.findIndex(ep => ep.url === item.url);
                        if (episodeIndex >= 0) {
                            currentEpisodeIndex = episodeIndex;
                            playEpisode(episodeData.episodes[episodeIndex], true);
                            if (historyPlaylistEl) historyPlaylistEl.classList.remove('show');
                        }
                    }
                });
                playlistList.appendChild(playlistItem);
            });
        }
    }

    function toggleFullscreen() {
        if (!isMobile && player) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                const fsBtn = document.querySelector('#fullscreen-btn img');
                if (fsBtn) fsBtn.src = 'https://nikichitonjesus.odoo.com/web/image/622-49c31be4/full.png';
            } else {
                player.requestFullscreen().catch(err => showError('Error al activar pantalla completa: ' + err.message));
                const fsBtn = document.querySelector('#fullscreen-btn img');
                if (fsBtn) fsBtn.src = 'https://nikichitonjesus.odoo.com/web/image/623-e47eb360/Exitfull.png';
            }
            showControls();
        }
    }

    function togglePictureInPicture() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(err => showError('Error al salir de Picture-in-Picture: ' + err.message));
        } else if (video && video.readyState >= 2) {
            video.requestPictureInPicture().catch(err => showError('Error al activar Picture-in-Picture: ' + err.message));
        } else {
            showError('El video no está listo para Picture-in-Picture');
        }
        showControls();
    }

    function updateSpeed() {
        if (!video) return;
        playbackSpeed = parseFloat(speedSlider.value);
        video.playbackRate = playbackSpeed;
        if (speedIndicator) speedIndicator.textContent = `${playbackSpeed}x`;
        clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => { if (speedPopup) speedPopup.classList.remove('show'); }, 3000);
        showControls();
    }

    function updateVolume() {
        if (!video) return;
        video.volume = parseFloat(volumeSlider.value);
        const isMuted = video.volume === 0;
        const volumeImg = document.querySelector('#volume-btn img');
        if (volumeImg) volumeImg.src = isMuted ? 'https://www.nikichitonjesus.org/web/image/584-d2f5c35f/mute.png' : 'https://nikichitonjesus.odoo.com/web/image/587-e4437449/volumen.png';
        if (volumeIndicator) volumeIndicator.textContent = `${Math.round(video.volume * 100)}%`;
        clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => { if (volumePopup) volumePopup.classList.remove('show'); }, 3000);
        showControls();
    }

    function handleKeyPress(e) {
        if (player && player.style.display === 'block') {
            if (e.key === ' ') { e.preventDefault(); togglePlay(); }
            else if (e.key === 'ArrowLeft') { seek(-10); }
            else if (e.key === 'ArrowRight') { seek(10); }
            else if (e.key === 'Escape') { closePlayer(); }
            else if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); }
            else if (e.key === 'p' || e.key === 'P') { togglePictureInPicture(); }
            showControls();
        }
    }

    function handleVisibilityChange() {
        isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 640;
        if (isMobile && document.hidden && isPlaying && !document.pictureInPictureElement && video && video.readyState >= 2) {
            video.requestPictureInPicture().catch(err => console.warn('PiP falló:', err));
        } else if (isMobile && !document.hidden && document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(err => console.warn('Exit PiP falló:', err));
        }
    }

    function closePlayer() {
        if (document.fullscreenElement) document.exitFullscreen();
        if (document.pictureInPictureElement) document.exitPictureInPicture();
        if (video) video.pause();
        saveProgress();
        isPlaying = false;
        if (player) player.style.display = 'none';
        if (progressCircle) progressCircle.style.animation = 'none';
        if (creditsButtonsContainer) creditsButtonsContainer.style.display = 'none';
        hideVideoInfo();
        hideError();
    }

    function resizePlayer() {
        isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 640;
        if (player && !document.fullscreenElement) {
            player.style.height = '100vh';
            if (isMobile && window.innerWidth < window.innerHeight) {
                player.style.transform = 'rotate(90deg)';
                player.style.width = '100vh';
                player.style.height = '100vw';
                player.style.top = 'calc((100vw - 100vh) / 2)';
                player.style.left = 'calc((100vh - 100vw) / 2)';
            } else {
                player.style.transform = 'rotate(0deg)';
                player.style.width = '100%';
                player.style.height = '100%';
                player.style.top = '0';
                player.style.left = '0';
            }
        }
    }

    function lockOrientation() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => console.error('Orientation lock failed:', err));
        }
    }

    function handleVideoClick(e) {
        if (!isMobile) togglePlay();
    }

    function handleDoubleClick(e) {
        if (!isMobile && videoInfo && videoInfo.style.display !== 'flex' && episodeListEl && !episodeListEl.classList.contains('show') && historyPlaylistEl && !historyPlaylistEl.classList.contains('show')) {
            toggleFullscreen();
        }
    }

    function handleTouchStart(e) {
        if (isMobile && (e.target === backdrop || e.target === video)) {
            e.preventDefault();
            const currentTime = Date.now();
            const timeDiff = currentTime - lastTouchTime;
            if (timeDiff < 300 && timeDiff > 0) {
                clearTimeout(touchTimeout);
                const rect = video.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                if (touchX > rect.width / 2) seek(10);
                else seek(-10);
                showControls();
            } else {
                touchTimeout = setTimeout(() => {
                    if (controls && controls.style.opacity === '1') hideControls();
                    else showControls();
                }, 300);
            }
            lastTouchTime = currentTime;
        }
    }

    function handleTouchEnd(e) {
        if (isMobile && (e.target === backdrop || e.target === video)) e.preventDefault();
    }

    function seekFromProgress(e) {
        if (isDragging) return;
        e.preventDefault();
        const rect = progressBar.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clickX = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        if (video.duration) {
            video.currentTime = percent * video.duration;
            if (progressTimeTooltip) {
                progressTimeTooltip.textContent = formatTime(video.currentTime);
                progressTimeTooltip.style.display = 'block';
                progressTimeTooltip.style.left = `${clickX}px`;
            }
        }
        showControls();
    }

    function showProgressTooltip(e) {
        if (isDragging || !video.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clientX / rect.width));
        const time = percent * video.duration;
        if (progressTimeTooltip) {
            progressTimeTooltip.textContent = formatTime(time);
            progressTimeTooltip.style.display = 'block';
            progressTimeTooltip.style.left = `${clientX}px`;
        }
    }

    function hideProgressTooltip() {
        if (!isDragging && progressTimeTooltip) progressTimeTooltip.style.display = 'none';
    }

    function startDragging(e) {
        e.preventDefault();
        isDragging = true;
        if (progressHandle) progressHandle.classList.add('dragging');
        showControls();
        if (progressTimeTooltip) progressTimeTooltip.style.display = 'block';
        if (isPlaying) video.pause();
    }

    function handleDragging(e) {
        if (!isDragging || !video.duration) return;
        e.preventDefault();
        const rect = progressBar.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const percent = clickX / rect.width;
        video.currentTime = percent * video.duration;
        if (progress) progress.style.width = `${percent * 100}%`;
        if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(percent * 100));
        if (timeDisplay) timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        if (progressTimeTooltip) {
            progressTimeTooltip.textContent = formatTime(video.currentTime);
            progressTimeTooltip.style.left = `${clickX}px`;
        }
        showControls();
    }

    function stopDragging() {
        if (isDragging) {
            isDragging = false;
            if (progressHandle) progressHandle.classList.remove('dragging');
            if (progressTimeTooltip) progressTimeTooltip.style.display = 'none';
            if (playPauseBtn && playPauseBtn.querySelector('img').src.includes('pausevid')) video.play().catch(handleVideoError);
            showControls();
        }
    }

    function toggleSpeedSlider() {
        if (!speedPopup || !volumePopup) return;
        const isVisible = speedPopup.classList.contains('show');
        speedPopup.classList.toggle('show', !isVisible);
        volumePopup.classList.remove('show');
        if (settingsPopup) settingsPopup.classList.remove('show');
        clearTimeout(sliderTimeout);
        if (speedPopup.classList.contains('show')) sliderTimeout = setTimeout(() => speedPopup.classList.remove('show'), 3000);
        showControls();
    }

    function toggleVolumeSlider() {
        if (!volumePopup || !speedPopup) return;
        const isVisible = volumePopup.classList.contains('show');
        volumePopup.classList.toggle('show', !isVisible);
        speedPopup.classList.remove('show');
        if (settingsPopup) settingsPopup.classList.remove('show');
        clearTimeout(sliderTimeout);
        if (volumePopup.classList.contains('show')) sliderTimeout = setTimeout(() => volumePopup.classList.remove('show'), 3000);
        showControls();
    }

    function toggleSettingsPopup() {
        if (!settingsPopup || !speedPopup || !volumePopup) return;
        const isVisible = settingsPopup.classList.contains('show');
        settingsPopup.classList.toggle('show', !isVisible);
        speedPopup.classList.remove('show');
        volumePopup.classList.remove('show');
        clearTimeout(sliderTimeout);
        if (settingsPopup.classList.contains('show')) sliderTimeout = setTimeout(() => settingsPopup.classList.remove('show'), 3000);
        showControls();
    }

    function replayEpisode() {
        if (episodeData) {
            const episode = episodeData.episodes[currentEpisodeIndex];
            playEpisode(episode, true);
            hideVideoInfo();
            showControls();
        }
    }

    function resumeEpisodes() {
        if (episodeData) {
            const episode = episodeData.episodes[currentEpisodeIndex];
            playEpisode(episode);
            hideVideoInfo();
            showControls();
        }
    }

    function toggleDescription() {
        if (videoInfoContent) videoInfoContent.classList.toggle('expanded');
        if (infoDescription) infoDescription.classList.toggle('expanded');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function handleVideoEnd() {
        saveProgress();
        if (episodeData) {
            if (randomEpisodeOrder.length > 0 && currentEpisodeIndex < randomEpisodeOrder.length - 1) playNextEpisode();
            else if (currentEpisodeIndex < episodeData.episodes.length - 1) playNextEpisode();
            else showVideoInfo();
        }
    }

    // Inicialización de eventos y referencias después de inyectar el DOM
    function initPlayer() {
        player = document.getElementById('universal-video-player');
        if (!player) return;
        video = player.querySelector('#player-video');
        controls = player.querySelector('#video-controls');
        centerControls = player.querySelector('#center-controls');
        playPauseBtn = player.querySelector('#play-pause-btn');
        titleContainer = player.querySelector('#video-title-container');
        titleDiv = player.querySelector('#video-title');
        closeBtn = player.querySelector('#close-btn');
        indicator = player.querySelector('#time-indicator');
        progress = player.querySelector('#progress');
        progressBar = player.querySelector('#progress-bar');
        progressHandle = player.querySelector('#progress-handle');
        progressTimeTooltip = player.querySelector('#progress-time-tooltip');
        timeDisplay = player.querySelector('#time-display');
        skipIntroBtn = player.querySelector('#skip-intro-btn');
        skipRecapBtn = player.querySelector('#skip-recap-btn');
        cancelSkipCreditsBtn = player.querySelector('#cancel-skip-credits');
        nextEpisodePreview = player.querySelector('#next-episode-preview');
        progressCircle = player.querySelector('#next-episode-preview .progress-circle');
        videoInfo = player.querySelector('#video-info');
        videoInfoContent = player.querySelector('#video-info-content');
        infoTitle = player.querySelector('#info-title');
        infoSeason = player.querySelector('#info-season');
        infoDescription = player.querySelector('#info-description');
        replayBtn = player.querySelector('#replay-btn');
        resumeBtn = player.querySelector('#resume-btn');
        hideVideoInfoBtn = player.querySelector('#hide-video-info-btn');
        episodeListEl = player.querySelector('#episode-list');
        listContent = player.querySelector('#list-content');
        closeListBtn = player.querySelector('#close-list-btn');
        loadingIndicator = player.querySelector('#loading-indicator');
        loadingPercentage = player.querySelector('#loading-percentage');
        loadingThumbnail = player.querySelector('#loading-thumbnail');
        speedBtn = player.querySelector('#speed-btn');
        volumeBtn = player.querySelector('#volume-btn');
        speedSlider = player.querySelector('#speed-slider');
        volumeSlider = player.querySelector('#volume-slider');
        speedPopup = player.querySelector('#speed-popup');
        volumePopup = player.querySelector('#volume-popup');
        speedIndicator = player.querySelector('#speed-indicator');
        volumeIndicator = player.querySelector('#volume-indicator');
        skipButtonsContainer = player.querySelector('.skip-buttons-container');
        creditsButtonsContainer = player.querySelector('.credits-buttons-container');
        initialSkipIndicator = player.querySelector('#initial-skip-indicator');
        seekBackBtn = player.querySelector('#seek-back-btn');
        seekForwardBtn = player.querySelector('#seek-forward-btn');
        historyPlaylistEl = player.querySelector('#history-playlist');
        historyList = player.querySelector('#history-list');
        playlistList = player.querySelector('#playlist-list');
        backdrop = player.querySelector('.backdrop');
        errorMessage = player.querySelector('#error-message');
        settingsBtn = player.querySelector('#settings-btn');
        settingsPopup = player.querySelector('#settings-popup');

        // Eventos
        const allButtons = player.querySelectorAll('button');
        allButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('button-clicked');
                setTimeout(() => button.classList.remove('button-clicked'), 200);
            });
        });
        document.addEventListener('keydown', handleKeyPress);
        window.addEventListener('resize', resizePlayer);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        if (video) {
            video.addEventListener('click', handleVideoClick);
            video.addEventListener('dblclick', handleDoubleClick);
            video.addEventListener('touchstart', handleTouchStart);
            video.addEventListener('touchend', handleTouchEnd);
            video.addEventListener('timeupdate', updateProgress);
            video.addEventListener('ended', handleVideoEnd);
            video.addEventListener('waiting', showLoading);
            video.addEventListener('playing', hideLoading);
            video.addEventListener('progress', updateLoadingPercentage);
            video.addEventListener('pause', saveProgress);
            video.addEventListener('error', handleVideoError);
        }
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
        if (seekBackBtn) seekBackBtn.addEventListener('click', () => seek(-10));
        if (seekForwardBtn) seekForwardBtn.addEventListener('click', () => seek(10));
        const prevBtn = player.querySelector('#prev-episode-btn');
        const nextBtn = player.querySelector('#next-episode-btn-ui');
        if (prevBtn) prevBtn.addEventListener('click', playPreviousEpisode);
        if (nextBtn) nextBtn.addEventListener('click', playNextEpisode);
        if (speedBtn) speedBtn.addEventListener('click', toggleSpeedSlider);
        if (volumeBtn) volumeBtn.addEventListener('click', toggleVolumeSlider);
        const historyPlaylistBtn = player.querySelector('#history-playlist-btn');
        if (historyPlaylistBtn) historyPlaylistBtn.addEventListener('click', toggleHistoryPlaylist);
        const fullscreenBtn = player.querySelector('#fullscreen-btn');
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
        if (closeBtn) closeBtn.addEventListener('click', closePlayer);
        if (closeListBtn) closeListBtn.addEventListener('click', toggleEpisodeList);
        const closeHistoryPlaylistBtn = player.querySelector('#close-history-playlist-btn');
        if (closeHistoryPlaylistBtn) closeHistoryPlaylistBtn.addEventListener('click', toggleHistoryPlaylist);
        if (cancelSkipCreditsBtn) cancelSkipCreditsBtn.addEventListener('click', cancelSkipCredits);
        if (resumeBtn) resumeBtn.addEventListener('click', resumeEpisodes);
        if (replayBtn) replayBtn.addEventListener('click', replayEpisode);
        if (skipIntroBtn) skipIntroBtn.addEventListener('click', skipIntro);
        if (skipRecapBtn) skipRecapBtn.addEventListener('click', skipRecap);
        if (nextEpisodePreview) nextEpisodePreview.addEventListener('click', () => {
            if (progressCircle) progressCircle.style.animation = 'none';
            playNextEpisode();
        });
        if (videoInfo) videoInfo.addEventListener('click', (e) => { if (e.target === videoInfo) hideVideoInfo(); });
        if (progressBar) {
            progressBar.addEventListener('click', seekFromProgress);
            progressBar.addEventListener('mousemove', showProgressTooltip);
            progressBar.addEventListener('mouseleave', hideProgressTooltip);
            progressBar.addEventListener('touchstart', seekFromProgress);
            progressBar.addEventListener('touchmove', seekFromProgress);
        }
        if (progressHandle) {
            progressHandle.addEventListener('mousedown', startDragging);
            progressHandle.addEventListener('touchstart', startDragging);
        }
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('touchmove', handleDragging);
        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('touchend', stopDragging);
        if (player) {
            player.addEventListener('mousemove', showControls);
            player.addEventListener('mouseleave', () => {
                if (isPlaying && speedPopup && !speedPopup.classList.contains('show') && volumePopup && !volumePopup.classList.contains('show') && !isDragging) hideControls();
            });
        }
        if (backdrop) backdrop.addEventListener('touchstart', handleTouchStart);
        if (speedSlider) speedSlider.addEventListener('input', updateSpeed);
        if (volumeSlider) volumeSlider.addEventListener('input', updateVolume);
        if (infoDescription) infoDescription.addEventListener('click', toggleDescription);
        document.addEventListener('fullscreenchange', () => {
            if (!isMobile) {
                const fsImg = document.querySelector('#fullscreen-btn img');
                if (fsImg) fsImg.src = document.fullscreenElement ? 'https://nikichitonjesus.odoo.com/web/image/623-e47eb360/Exitfull.png' : 'https://nikichitonjesus.odoo.com/web/image/622-49c31be4/full.png';
            }
            if (!document.fullscreenElement && isMobile) closePlayer();
        });
        if (hideVideoInfoBtn) hideVideoInfoBtn.addEventListener('click', hideVideoInfo);
        if (settingsBtn) settingsBtn.addEventListener('click', toggleSettingsPopup);
        const episodesBtn = player.querySelector('#episodes-btn');
        if (episodesBtn) episodesBtn.addEventListener('click', () => { toggleEpisodeList(); if (settingsPopup) settingsPopup.classList.remove('show'); });
        const pipSettingsBtn = player.querySelector('#pip-settings-btn');
        if (pipSettingsBtn) pipSettingsBtn.addEventListener('click', () => { togglePictureInPicture(); if (settingsPopup) settingsPopup.classList.remove('show'); });
        // Título clicable para abrir info
        if (titleDiv && titleContainer) {
            titleContainer.style.cursor = 'pointer';
            titleContainer.addEventListener('click', () => {
                if (videoInfo && episodeData) showVideoInfo();
            });
        }
        // Inicialmente oculto
        if (player) player.style.display = 'none';
    }

    // Función para inyectar el reproductor en el body
    function injectPlayer() {
        if (document.getElementById('universal-video-player')) return;
        const div = document.createElement('div');
        div.innerHTML = playerHTML.trim();
        document.body.appendChild(div.firstChild);
        initPlayer();
    }

    // Exponer funciones globales
    window.openVideoPlayer = function(data, forceIndex = null) {
        if (!data || !data.episodes) {
            showError('Datos de episodio inválidos');
            return;
        }
        if (!document.getElementById('universal-video-player')) injectPlayer();
        episodeData = data;
        randomEpisodeOrder = [];
        const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
        let latestEpisode = null, latestTimestamp = null;
        if (forceIndex !== null && forceIndex >= 0 && forceIndex < episodeData.episodes.length) {
            currentEpisodeIndex = forceIndex;
        } else {
            watchedHistory.forEach(history => {
                if (!latestTimestamp || new Date(history.timestamp) > new Date(latestTimestamp)) {
                    latestTimestamp = history.timestamp;
                    latestEpisode = history;
                }
            });
            if (latestEpisode) {
                const episodeIndex = episodeData.episodes.findIndex(ep => ep.url === latestEpisode.url);
                if (episodeIndex >= 0) {
                    currentEpisodeIndex = episodeIndex;
                    if (latestEpisode.completed && episodeIndex < episodeData.episodes.length - 1) currentEpisodeIndex = episodeIndex + 1;
                } else currentEpisodeIndex = 0;
            } else currentEpisodeIndex = 0;
        }
        if (player) player.style.display = 'block';
        const episode = episodeData.episodes[currentEpisodeIndex];
        const history = watchedHistory.find(item => item.url === episode.url);
        playEpisode(episode, history && history.completed ? true : !history);
        populatePlayerEpisodeList(episodeData.episodes);
        isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 640;
        if (isMobile) {
            if (!document.fullscreenElement) player.requestFullscreen().catch(err => showError('Error al activar pantalla completa: ' + err.message));
            lockOrientation();
        }
        resizePlayer();
    };

    window.openPlayer = function(videoUrl) {
        if (!episodeData || !episodeData.episodes) {
            showError('No hay datos de episodios disponibles');
            return;
        }
        const episodeIndex = episodeData.episodes.findIndex(ep => ep.url === videoUrl);
        if (episodeIndex === -1) {
            showError('Episodio no encontrado');
            return;
        }
        currentEpisodeIndex = episodeIndex;
        randomEpisodeOrder = [];
        const availableIndices = episodeData.episodes.map((_, idx) => idx).filter(idx => idx !== episodeIndex);
        randomEpisodeOrder = shuffleArray([...availableIndices]);
        randomEpisodeOrder.unshift(episodeIndex);
        const episode = episodeData.episodes[currentEpisodeIndex];
        const watchedHistory = JSON.parse(localStorage.getItem('watchedHistory') || '[]');
        const history = watchedHistory.find(item => item.url === episode.url);
        if (player) player.style.display = 'block';
        playEpisode(episode, history && history.completed ? true : !history);
        populatePlayerEpisodeList(episodeData.episodes);
        isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 640;
        if (isMobile) {
            if (!document.fullscreenElement) player.requestFullscreen().catch(err => showError('Error al activar pantalla completa: ' + err.message));
            lockOrientation();
        }
        resizePlayer();
        showControls();
    };

    // Inyectar automáticamente al cargar el script
    injectPlayer();
})();
