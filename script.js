// Import audio functions and elements from audio.js
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

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let ballX;
let ballY;
let ballSpeedX = 0;
let ballSpeedY = 0;
const ballRadius = 10;

const paddleWidth = 10;
const paddleHeight = 100;
let playerPaddleY;
let aiPaddleY;

let playerScore = 0;
let aiScore = 0;
const minimumWinningScore = 3;
const scoreDifferenceToWin = 2;

let gamePaused = true;
let animationFrameId = null;
let countdownActive = false;
let countdownValue = 3;

let playerName = "Player";

// DOM elements
const welcomeScreen = document.getElementById('welcomeScreen');
const startGameButton = document.getElementById('startGameButton');
const playerNameInput = document.getElementById('playerNameInput');
const pauseButton = document.getElementById('pauseButton');
const difficultySelect = document.getElementById('difficulty');
const playerScoreDisplay = document.getElementById('playerScore');
const aiScoreDisplay = document.getElementById('aiScore');

// DOM elements for Game Over Screen
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainButton = document.getElementById('playAgainButton');
const finalPlayerScoreDisplay = document.getElementById('finalPlayerScore');
const finalAiScoreDisplay = document.getElementById('finalAiScore');

// Difficulty level variable
let difficultyLevel = 'medium';

// --- Difficulty Settings ---
const difficultySettings = {
    easy: {
        ballInitialSpeed: 5,
        aiPaddleSpeed: 3
    },
    medium: {
        ballInitialSpeed: 6,
        aiPaddleSpeed: 5
    },
    hard: {
        ballInitialSpeed: 7,
        aiPaddleSpeed: 7
    }
};

// --- Game Functions ---
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    const currentSettings = difficultySettings[difficultyLevel];
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * currentSettings.ballInitialSpeed;
    ballSpeedY = (Math.random() * 2 - 1) * currentSettings.ballInitialSpeed;
}

function drawEverything() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.rect(0, playerPaddleY, paddleWidth, paddleHeight);
    ctx.fill();
    
    ctx.beginPath();
    ctx.rect(canvas.width - paddleWidth, aiPaddleY, paddleWidth, paddleHeight);
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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '80px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(countdownValue === 0 ? "GO!" : countdownValue, canvas.width / 2, canvas.height / 2 + 30);
    }

    playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
    aiScoreDisplay.textContent = `AI: ${aiScore}`;
}

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
        if (aiScore >= minimumWinningScore && (aiScore - playerScore >= scoreDifferenceToWin)) {
            gamePaused = true;
            playSound(gameOverSound);
            setTimeout(() => {
                endGame("AI Wins!");
            }, 500);
        } else {
            gamePaused = true;
            resetBall();
            startCountdown();
        }
    }

    if (ballX > canvas.width) {
        playerScore++;
        updateScoreDisplay();
        playSound(scoreSound);
        if (playerScore >= minimumWinningScore && (playerScore - aiScore >= scoreDifferenceToWin)) {
            gamePaused = true;
            playSound(playerWinSound);
            setTimeout(() => {
                endGame(`${playerName} Wins!`);
            }, 500);
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

    if (aiCenter < ballY - 35) {
        aiPaddleY += aiSpeed;
    } else if (aiCenter > ballY + 35) {
        aiPaddleY -= aiSpeed;
    }

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

function endGame(message) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    gamePaused = true;
    stopBackgroundMusicRotation();

    gameOverMessage.textContent = message;
    finalPlayerScoreDisplay.textContent = `Player Score: ${playerScore}`;
    finalAiScoreDisplay.textContent = `AI Score: ${aiScore}`;
    gameOverScreen.style.display = 'flex
