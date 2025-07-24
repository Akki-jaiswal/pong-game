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
        } else {
            gamePaused = true;
            resetBall();
            startCountdown();
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
