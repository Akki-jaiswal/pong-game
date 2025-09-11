// --- AUDIO IMPORTS ---
import {
    playSound,
    startBackgroundMusicRotation,
    stopBackgroundMusicRotation,
    paddleHitSound,
    wallHitSound,
    scoreSound,
    gameOverSound,
    playerWinSound,
    countdownBeepSound,
    backgroundMusicTracks
} from './audio.js';

// --- DOM SETUP ---
const canvas = document.getElementById('gameCanvas');
if (!canvas) throw new Error("Canvas element with ID 'gameCanvas' not found.");
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error("2D rendering context for canvas not available.");

// --- DOM Elements ---
const welcomeScreen = document.getElementById('welcomeScreen');
const startGameButton = document.getElementById('startGameButton');
const playerNameInput = document.getElementById('playerNameInput');
const pauseButton = document.getElementById('pauseButton');
const difficultySelect = document.getElementById('difficulty');
const playerScoreDisplay = document.getElementById('playerScore');
const aiScoreDisplay = document.getElementById('aiScore');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainButton = document.getElementById('playAgainButton');

// --- GAME STATES ---
const GAME_STATES = {
    WELCOME: 'WELCOME',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};
let gameState = GAME_STATES.WELCOME;

// --- GAME VARIABLES ---
let ballX, ballY, ballSpeedX = 0, ballSpeedY = 0;
const ballRadius = 10;
const paddleWidth = 10;
const paddleHeight = 100;
let playerPaddleY, aiPaddleY;
let playerScore = 0, aiScore = 0;
const minimumWinningScore = 3;
const scoreDifferenceToWin = 2;
let gamePaused = true;
let animationFrameId = null;
let countdownActive = false;
let countdownValue = 3;
let countdownIntervalId = null;
let playerName = "Player";

// --- HIGH SCORE TRACKING ---
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
function updateHighScoreDisplay() {
    if (highScoreDisplay) {
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
}
function checkAndUpdateHighScore() {
    if (playerScore > highScore) {
        highScore = playerScore;
        localStorage.setItem('highScore', highScore);
        updateHighScoreDisplay();
    }
}

// --- DIFFICULTY SETTINGS ---
let difficultyLevel = 'medium';
const difficultySettings = {
    easy: { ballInitialSpeed: 5, aiPaddleSpeed: 3 },
    medium: { ballInitialSpeed: 6, aiPaddleSpeed: 5 },
    hard: { ballInitialSpeed: 7, aiPaddleSpeed: 7 }
};

// --- INIT BALL ---
function resetBall() {
    const settings = difficultySettings[difficultyLevel];
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * settings.ballInitialSpeed;
    ballSpeedY = (Math.random() * 2 - 1) * settings.ballInitialSpeed;
}

// --- DRAW FUNCTIONS ---
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawEverything() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    drawRoundedRect(ctx, 0, playerPaddleY, paddleWidth, paddleHeight, 5);
    ctx.fill();

    ctx.beginPath();
    drawRoundedRect(ctx, canvas.width - paddleWidth, aiPaddleY, paddleWidth, paddleHeight, 5);
    ctx.fill();

    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.setLineDash([5, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    if (countdownActive) {
        ctx.fillStyle = 'rgba(232, 3, 3, 0.9)';
        ctx.font = '80px Segoe UI';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(countdownValue === 0 ? "GO!" : countdownValue, canvas.width / 2, canvas.height / 2 + 30);
        ctx.shadowBlur = 0;
    }

    updateScoreDisplay();
}

function updateScoreDisplay() {
    playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
    aiScoreDisplay.textContent = `AI: ${aiScore}`;
    updateHighScoreDisplay();
}

// --- MOVEMENT LOGIC ---
function moveEverything() {
    if (gamePaused || countdownActive) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
        playSound(wallHitSound);
    }

    if (ballX < 0) {
        aiScore++;
        updateScoreDisplay();
        playSound(scoreSound);
        if (aiScore >= minimumWinningScore && aiScore - playerScore >= scoreDifferenceToWin) {
            gamePaused = true;
            playSound(gameOverSound);
            setTimeout(() => endGame("AI Wins!"), 500);
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

    if (ballX > canvas.width) {
        playerScore++;
        updateScoreDisplay();
        checkAndUpdateHighScore(); // ✅ Update high score
        playSound(scoreSound);
        if (playerScore >= minimumWinningScore && playerScore - aiScore >= scoreDifferenceToWin) {
            gamePaused = true;
            playSound(playerWinSound);
            setTimeout(() => endGame(`${playerName} Wins!`), 500);
        } else {
            gamePaused = true;
            resetBall();
            startCountdown();
        }
    }

    if (ballX - ballRadius < paddleWidth && ballY > playerPaddleY && ballY < playerPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (playerPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        playSound(paddleHitSound);
    }

    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > aiPaddleY && ballY < aiPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (aiPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        playSound(paddleHitSound);
    }

    const aiCenter = aiPaddleY + (paddleHeight / 2);
    const aiSpeed = difficultySettings[difficultyLevel].aiPaddleSpeed;
    if (aiCenter < ballY - 35) aiPaddleY += aiSpeed;
    else if (aiCenter > ballY + 35) aiPaddleY -= aiSpeed;
    if (aiPaddleY < 0) aiPaddleY = 0;
    if (aiPaddleY + paddleHeight > canvas.height) aiPaddleY = canvas.height - paddleHeight;

    keyboardPaddleControl();
}

// --- MAIN GAME LOOP ---
function gameLoop() {
    moveEverything();
    drawEverything();
    animationFrameId = requestAnimationFrame(gameLoop);
}

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
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    drawEverything();
}

// --- COUNTDOWN ---
function startCountdown() {
    if (countdownIntervalId) clearInterval(countdownIntervalId);

    countdownActive = true;
    countdownValue = 3;
    drawEverything();
    playSound(countdownBeepSound);

    countdownIntervalId = setInterval(() => {
        countdownValue--;
        drawEverything();
        if (countdownValue < 0) {
            clearInterval(countdownIntervalId);
            countdownActive = false;
            gamePaused = false;
            pauseButton.textContent = "Pause";
            if (!animationFrameId) gameLoop();
        }
    }, 1000);
}

// --- KEYBOARD CONTROL ---
let upArrowPressed = false;
let downArrowPressed = false;
const paddleMoveSpeed = 8;

document.addEventListener('keydown', (e) => {
    if (gameState === GAME_STATES.PLAYING && !countdownActive) {
        if (e.key === "ArrowUp") upArrowPressed = true;
        if (e.key === "ArrowDown") downArrowPressed = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === "ArrowUp") upArrowPressed = false;
    if (e.key === "ArrowDown") downArrowPressed = false;
});

function keyboardPaddleControl() {
    if (upArrowPressed) playerPaddleY -= paddleMoveSpeed;
    if (downArrowPressed) playerPaddleY += paddleMoveSpeed;
    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
}

// --- INPUT CONTROLS ---
canvas.addEventListener('mousemove', (evt) => {
    if (gameState === GAME_STATES.PLAYING && !countdownActive) {
        let rect = canvas.getBoundingClientRect();
        let mousePos = evt.clientY - rect.top;
        playerPaddleY = mousePos - (paddleHeight / 2);
        if (playerPaddleY < 0) playerPaddleY = 0;
        if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
    }
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    let touchY = event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();
    playerPaddleY = touchY - rect.top - paddleHeight / 2;
    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
}, { passive: false });

// --- BUTTON EVENTS ---
startGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim() || "Player";
    welcomeScreen.style.display = 'none';
    gameState = GAME_STATES.PLAYING;
    startBackgroundMusicRotation();
    resetGame();
    startCountdown();
});

playAgainButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameState = GAME_STATES.PLAYING;
    startBackgroundMusicRotation();
    resetGame();
    startCountdown();
});

pauseButton.addEventListener('click', () => {
    if (!countdownActive) {
        if (gameState === GAME_STATES.PLAYING) {
            gamePaused = true;
            gameState = GAME_STATES.PAUSED;
            pauseButton.textContent = "Resume";
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            stopBackgroundMusicRotation();
        } else if (gameState === GAME_STATES.PAUSED) {
            gamePaused = false;
            gameState = GAME_STATES.PLAYING;
            pauseButton.textContent = "Pause";
            startBackgroundMusicRotation();
            gameLoop();
        }
    }
});

difficultySelect.addEventListener('change', (e) => {
    difficultyLevel = e.target.value;
    resetGame();
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
        startCountdown();
    } else {
        drawEverything();
    }
});

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    welcomeScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    playerPaddleY = (canvas.height - paddleHeight) / 2;
    aiPaddleY = (canvas.height - paddleHeight) / 2;
    updateHighScoreDisplay();
    drawEverything();
});
    // ---- Helpers ----
    function updateScoreUI() {
        const displayName = playerName || "Player";
        playerScoreDisplay.textContent = `${displayName}: ${playerScore}`;
        aiScoreDisplay.textContent = `AI: ${aiScore}`;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1; // send it toward the scorer
        ball.dy = (Math.random() * 2 - 1) * 4; // small random vertical
    }

    function centerPaddles() {
        player.y = canvas.height / 2 - paddleHeight / 2;
        ai.y = canvas.height / 2 - paddleHeight / 2;
    }

    // ---- Draw ----
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Net
        ctx.fillStyle = "#4cc9f0";
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.fillRect(canvas.width / 2 - 1, i, 2, 10);
        }

        // Paddles
        ctx.fillStyle = "#4cc9f0";
        ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
        
        ctx.fillStyle = "#f72585";
        ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);

        // Ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        // Canvas score (optional—DOM already shows the score)
        ctx.font = "16px Arial";
        ctx.fillStyle = "#4cc9f0";
        const displayName = playerName || "Player";
        ctx.fillText(`${displayName}: ${playerScore}`, 50, 30);
        
        ctx.fillStyle = "#f72585";
        ctx.fillText(`AI: ${aiScore}`, canvas.width - 150, 30);
    }

    // ---- Update ----
    function update() {
        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Bounce top/bottom
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
            ball.dy *= -1;
        }

        // Player collision
        if (
            ball.x - ball.r <= player.x + paddleWidth &&
            ball.y >= player.y &&
            ball.y <= player.y + paddleHeight &&
            ball.dx < 0
        ) {
            ball.dx *= -1;
            // add a little "spin" based on hit position
            const collidePoint = ball.y - (player.y + paddleHeight / 2);
            ball.dy = collidePoint * 0.15;
        }

        // AI collision
        if (
            ball.x + ball.r >= ai.x &&
            ball.y >= ai.y &&
            ball.y <= ai.y + paddleHeight &&
            ball.dx > 0
        ) {
            ball.dx *= -1;
            const collidePoint = ball.y - (ai.y + paddleHeight / 2);
            ball.dy = collidePoint * 0.15;
        }

        // Score (ball passes left/right)
        if (ball.x + ball.r < 0) {
            aiScore++;
            updateScoreUI();
            resetBall();
        } else if (ball.x - ball.r > canvas.width) {
            playerScore++;
            updateScoreUI();
            resetBall();
        }

        // Simple AI: follow ball at difficulty speed
        const aiCenter = ai.y + paddleHeight / 2;
        if (ball.y < aiCenter) ai.y -= speeds[difficulty];
        else if (ball.y > aiCenter) ai.y += speeds[difficulty];

        // Bound paddles
        player.y = Math.max(0, Math.min(canvas.height - paddleHeight, player.y));
        ai.y = Math.max(0, Math.min(canvas.height - paddleHeight, ai.y));

        // Game over: first to 3, lead by 2
        if ((playerScore >= 3 || aiScore >= 3) && Math.abs(playerScore - aiScore) >= 2) {
            endGame();
        }
    }

    // ---- Loop ----
    function loop() {
        if (gameRunning && !paused) {
            update();
            draw();
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // ---- Controls ----
    // Keyboard (hold to move)
    const keys = { up: false, down: false };
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") keys.up = true;
        if (e.key === "ArrowDown") keys.down = true;
        
        // Pause with spacebar
        if (e.key === " " && gameRunning) {
            paused = !paused;
            pauseButton.textContent = paused ? "Resume" : "Pause";
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
