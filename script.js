// script.js
window.addEventListener("DOMContentLoaded", () => {
    // ---- DOM refs ----
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const welcomeScreen = document.getElementById("welcomeScreen");
    const startGameButton = document.getElementById("startGameButton");

    const gameOverScreen = document.getElementById("gameOverScreen");
    const gameOverMessage = document.getElementById("gameOverMessage");
    const playAgainButton = document.getElementById("playAgainButton");

    const pauseButton = document.getElementById("pauseButton");
    const restartButton = document.getElementById("restartButton");
    const difficultySelect = document.getElementById("difficulty");
    const fullscreenButton = document.getElementById("fullscreenButton");
    const themeSelector = document.getElementById("themeSelector");

    const playerScoreDisplay = document.getElementById("playerScore");
    const aiScoreDisplay = document.getElementById("aiScore");

    // How to Play modal
    const howToPlayButton = document.getElementById("howToPlayButton");
    const howToPlayModal = document.getElementById("howToPlayModal");
    const closeHowToPlay = document.getElementById("closeHowToPlay");
    const closeHowToPlayBtn = document.getElementById("closeHowToPlayBtn");

    // ---- Game state ----
    let gameRunning = false;
    let paused = false;
    let playerScore = 0;
    let aiScore = 0;
    let difficulty = "medium";
    let playerName = "";

    // ---- Objects ----
    const paddleWidth = 10;
    const paddleHeight = 80;

    const player = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 6 };
    const ai = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, dy: 5 };

    const ball = { x: canvas.width / 2, y: canvas.height / 2, r: 8, dx: 4, dy: 4 };

    const speeds = {
        easy: 3,
        medium: 5,
        hard: 7
    };

    // ---- Theme functionality ----
    themeSelector.addEventListener("change", (e) => {
        // Remove all theme classes
        document.body.classList.remove("neon-retro", "dark-mode", "ocean-blue");
        
        // Add the selected theme class
        if (e.target.value !== "default") {
            document.body.classList.add(e.target.value);
        }
    });

    // ---- Fullscreen functionality ----
    fullscreenButton.addEventListener("click", toggleFullscreen);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            fullscreenButton.textContent = "❐";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenButton.textContent = "⛶";
            }
        }
    }

    // ---- Helpers ----
    function updateScoreUI() {
        const displayName = playerName || "Player";
        playerScoreDisplay.textContent = `${displayName}: ${playerScore}`;
        aiScoreDisplay.textContent = `AI: ${aiScore}`;
    }

    // AI paddle collision
    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > aiPaddleY && ballY < aiPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (aiPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        playSound(paddleHitSound);
    }

    // AI Paddle Movement Logic
    const aiCenter = aiPaddleY + (paddleHeight / 2);
    const aiSpeed = difficultySettings[difficultyLevel].aiPaddleSpeed;

    if (aiCenter < ballY - 35) {
        aiPaddleY += aiSpeed;
    } else if (aiCenter > ballY + 35) {
        aiPaddleY -= aiSpeed;
    }

    // Keep AI paddle within canvas bounds
    if (aiPaddleY < 0) aiPaddleY = 0;
    if (aiPaddleY + paddleHeight > canvas.height) aiPaddleY = canvas.height - paddleHeight;

    keyboardPaddleControl();

}

function gameLoop() {
    moveEverything();
    drawEverything();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateScoreDisplay() {
    playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
    aiScoreDisplay.textContent = `AI: ${aiScore}`;
}

// Function to handle game over logic (now waits for permission to restart)
function endGame(message) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    gamePaused = true;
    stopBackgroundMusicRotation();

    gameOverMessage.textContent = message;
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    playerScore = 0;
    aiScore = 0;
    updateScoreDisplay();

    playerPaddleY = (canvas.height - paddleHeight) / 2;
    aiPaddleY = (canvas.height - paddleHeight) / 2;

    resetBall();

    gamePaused = true;
    pauseButton.textContent = "Resume";

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    drawEverything();
}

// --- Countdown Function ---
function startCountdown() {
    // Clear any existing countdown interval to prevent overlaps
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }

    countdownActive = true;
    countdownValue = 3;
    drawEverything(); // Draw initial 3

    playSound(countdownBeepSound);

    // Assign interval ID to the global variable
    countdownIntervalId = setInterval(() => {
        countdownValue--;
        drawEverything(); // Draw updated number
        if (countdownValue < 0) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
    }, 1000);

    // This setTimeout runs after 3 seconds (for 3, 2, 1, GO! sequence)
    setTimeout(() => {
        countdownActive = false;
        gamePaused = false;
        pauseButton.textContent = "Pause";
        if (!animationFrameId) {
            gameLoop();
        }
    }, 3000);
}

// --- Initial Game Start Handler (from Welcome Screen) ---
startGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName === "") {
        playerName = "Player";
    }
    welcomeScreen.style.display = 'none';

    startBackgroundMusicRotation();

    resetGame();
    startCountdown();
});

// --- Event Listener for Play Again Button ---
playAgainButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    resetGame();
    startBackgroundMusicRotation();
    startCountdown();
});

// --- Event Listeners for In-Game Controls ---

// Keep existing mousemove for desktop
canvas.addEventListener('mousemove', (evt) => {
    // Allow player paddle movement only if not paused AND not during countdown
    if (gamePaused || countdownActive) return;

    let rect = canvas.getBoundingClientRect();
    let mousePos = evt.clientY - rect.top;
    playerPaddleY = mousePos - (paddleHeight / 2);

    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
});

// --- NEW: Touch Event Listeners for Mobile ---
canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    handleTouchMove(event);
}, { passive: false });

canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
    handleTouchMove(event);
}, { passive: false });

function handleTouchMove(event) {
    // Corrected: Use paddleHeight instead of playerPaddle.height
    let touchY = event.touches[0].clientY;

    // Get canvas position to calculate relative Y
    let canvasRect = canvas.getBoundingClientRect();
    let relativeTouchY = touchY - canvasRect.top;

    // Update player paddle's Y position
    // Center paddle on the touch point
    playerPaddleY = relativeTouchY - paddleHeight / 2;

    // Clamp paddle position to stay within canvas bounds
    if (playerPaddleY < 0) {
        playerPaddleY = 0;
    } else if (playerPaddleY + paddleHeight > canvas.height) {
        playerPaddleY = canvas.height - paddleHeight;
    }
}

// The pause button now only toggles Pause/Resume for an *already started* game
pauseButton.addEventListener('click', () => {
    if (!countdownActive) { // Only allow pause/resume when not in active countdown
        if (gamePaused) { // If currently paused, user wants to resume
            // Only start background music if sound is enabled
            if (isSoundEnabled()) {
                startBackgroundMusicRotation();
            }
            gamePaused = false;
            pauseButton.textContent = "Pause";
            if (!animationFrameId) {
                gameLoop();
            }
        } else { // If currently playing, user wants to pause
            gamePaused = true;
            pauseButton.textContent = "Resume";
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            stopBackgroundMusicRotation();
        }
    });
    document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowUp") keys.up = false;
        if (e.key === "ArrowDown") keys.down = false;
    });

    // Apply keyboard movement each frame by piggybacking on the RAF loop
    (function applyKeyboardMotion() {
        if (gameRunning && !paused) {
            if (keys.up) player.y -= player.dy;
            if (keys.down) player.y += player.dy;
        }
        requestAnimationFrame(applyKeyboardMotion);
    })();

    // Mouse / Touch move (center paddle on pointer)
    canvas.addEventListener("mousemove", (evt) => {
        const rect = canvas.getBoundingClientRect();
        const mouseY = evt.clientY - rect.top;
        player.y = mouseY - paddleHeight / 2;
    });

    canvas.addEventListener(
        "touchstart",
        (evt) => {
            evt.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touchY = evt.touches[0].clientY - rect.top;
            player.y = touchY - paddleHeight / 2;
        },
        { passive: false }
    );

    canvas.addEventListener(
        "touchmove",
        (evt) => {
            evt.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touchY = evt.touches[0].clientY - rect.top;
            player.y = touchY - paddleHeight / 2;
        },
        { passive: false }
    );

    // ---- Buttons / UI ----
    function startGame() {
        playerName = document.getElementById("playerNameInput").value.trim();
        gameRunning = true;
        paused = false;
        pauseButton.textContent = "Pause";
        playerScore = 0;
        aiScore = 0;
        updateScoreUI();
        centerPaddles();
        resetBall();
        if (welcomeScreen) welcomeScreen.style.display = "none";
        if (gameOverScreen) gameOverScreen.style.display = "none";
    }

    function endGame() {
        gameRunning = false;
        const displayName = playerName || "Player";
        gameOverMessage.textContent = playerScore > aiScore ? `🎉 ${displayName} Wins!` : "😢 AI Wins!";
        gameOverScreen.style.display = "flex";
    }

    startGameButton.addEventListener("click", startGame);
    playAgainButton.addEventListener("click", startGame);

    pauseButton.addEventListener("click", () => {
        if (!gameRunning) return;
        paused = !paused;
        pauseButton.textContent = paused ? "Resume" : "Pause";
    });

    restartButton.addEventListener("click", () => {
        if (!gameRunning) gameRunning = true;
        paused = false;
        pauseButton.textContent = "Pause";
        playerScore = 0;
        aiScore = 0;
        updateScoreUI();
        centerPaddles();
        resetBall();
        gameOverScreen.style.display = "none";
    });

    difficultySelect.addEventListener("change", (e) => {
        difficulty = e.target.value;
    });

    // ---- Enhanced How to Play Modal ----
    function openHowTo() {
        if (howToPlayModal) {
            howToPlayModal.classList.remove("hidden");
            howToPlayModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
        }
    }
    
    function closeHowTo() {
        if (howToPlayModal) {
            howToPlayModal.classList.remove("active");
            setTimeout(() => {
                howToPlayModal.classList.add("hidden");
            }, 300); // Match the transition duration
            document.body.style.overflow = ""; // Re-enable scrolling
        }
    }

    if (howToPlayButton && howToPlayModal && closeHowToPlay && closeHowToPlayBtn) {
        // open on button
        howToPlayButton.addEventListener("click", openHowTo);

        // close on "Close" button
        closeHowToPlay.addEventListener("click", closeHowTo);
        closeHowToPlayBtn.addEventListener("click", closeHowTo);

        // close on overlay click
        howToPlayModal.addEventListener("click", (e) => {
            if (e.target === howToPlayModal) closeHowTo();
        });

        // close on Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && howToPlayModal.classList.contains("active")) {
                closeHowTo();
            }
        });
    }

    // Show welcome by default
    if (welcomeScreen) welcomeScreen.style.display = "flex";
    if (gameOverScreen) gameOverScreen.style.display = "none";
    if (howToPlayModal) howToPlayModal.classList.add("hidden");
});