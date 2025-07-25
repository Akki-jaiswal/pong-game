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
// No console.error for missing canvas - fail silently or assume existence after DOMContentLoaded
if (!canvas) {
    throw new Error("Canvas element with ID 'gameCanvas' not found.");
}
const ctx = canvas.getContext('2d');
// No console.error for missing context - fail silently or assume existence
if (!ctx) {
    throw new Error("2D rendering context for canvas not available.");
}

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

// Global variable to store the countdown interval ID
let countdownIntervalId = null;

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

// Helper function for rounded rectangles (fallback for older browsers)
function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
    } else {
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
}

function drawEverything() {
    // Clear the canvas - let CSS gradient show through
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles with enhanced styling and rounded corners
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;
    
    // Draw player paddle with rounded corners
    ctx.beginPath();
    drawRoundedRect(ctx, 0, playerPaddleY, paddleWidth, paddleHeight, 5);
    ctx.fill();
    
    // Draw AI paddle with rounded corners
    ctx.beginPath();
    drawRoundedRect(ctx, canvas.width - paddleWidth, aiPaddleY, paddleWidth, paddleHeight, 5);
    ctx.fill();

    // Draw ball with glow effect
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    
    // Reset shadow for text
    ctx.shadowBlur = 0;

    // Draw center line with modern styling
    ctx.setLineDash([5, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw countdown number ONLY if active
    if (countdownActive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '80px Segoe UI';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 10;
        // Display countdownValue, which will update from 3 down to 0 visually
        ctx.fillText(countdownValue === 0 ? "GO!" : countdownValue, canvas.width / 2, canvas.height / 2 + 30);
        ctx.shadowBlur = 0;
    }

    // Update score display with player name
    playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
    aiScoreDisplay.textContent = `AI: ${aiScore}`;
}

function moveEverything() {
    // Crucial check: Stop movement if game is paused or during countdown
    if (gamePaused || countdownActive) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision
    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
        playSound(wallHitSound);
    }

    // --- Scoring Logic ---
    // Check if ball goes off screen to the left (AI scores)
    if (ballX < 0) {
        aiScore++;
        updateScoreDisplay();
        playSound(scoreSound);
        // Check for AI win condition
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

    // Check if ball goes off screen to the right (Player scores)
    if (ballX > canvas.width) {
        playerScore++;
        updateScoreDisplay();
        playSound(scoreSound);
        // Check for Player win condition
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

    // --- Paddle Collision Logic ---
    // Player paddle collision
    if (ballX - ballRadius < paddleWidth && ballY > playerPaddleY && ballY < playerPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (playerPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        playSound(paddleHitSound);
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
            startBackgroundMusicRotation();
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
    }
});

difficultySelect.addEventListener('change', (event) => {
    difficultyLevel = event.target.value;
    resetGame();
    // If game was paused for difficulty change, restart countdown
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
        startCountdown();
    } else {
        drawEverything();
    }
});

// --- Initial Setup (Show Welcome Screen) ---
// Define GAME_STATES enum outside, or ensure it's accessible.
// For now, let's just make sure gameState is available.
const GAME_STATES = {
    WELCOME: 'WELCOME',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};
let gameState = GAME_STATES.WELCOME; // Initialize game state

document.addEventListener('DOMContentLoaded', () => {
    welcomeScreen.style.display = 'flex'; // Show the welcome screen
    gameOverScreen.style.display = 'none'; // Ensure game over screen is hidden initially

    // Update playerPaddleY and aiPaddleY only after canvas dimensions are known
    playerPaddleY = (canvas.height - paddleHeight) / 2;
    aiPaddleY = (canvas.height - paddleHeight) / 2;
    drawEverything(); // Draw initial state on canvas
});

// Minor adjustment in startGameButton to set gameState
startGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName === "") {
        playerName = "Player";
    }
    welcomeScreen.style.display = 'none';
    gameState = GAME_STATES.PLAYING; // Set game state to playing
    startBackgroundMusicRotation();
    resetGame();
    startCountdown();
});

// Minor adjustment in playAgainButton to set gameState
playAgainButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameState = GAME_STATES.PLAYING; // Set game state to playing
    resetGame();
    startBackgroundMusicRotation();
    startCountdown();
});

// Minor adjustment in pauseButton to use gameState
pauseButton.addEventListener('click', () => {
    if (!countdownActive) {
        if (gameState === GAME_STATES.PLAYING) {
            gamePaused = true;
            gameState = GAME_STATES.PAUSED; // Set game state to paused
            pauseButton.textContent = "Resume";
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            stopBackgroundMusicRotation();
        } else if (gameState === GAME_STATES.PAUSED) {
            gamePaused = false;
            gameState = GAME_STATES.PLAYING; // Set game state to playing
            pauseButton.textContent = "Pause";
            startBackgroundMusicRotation();
            if (!countdownActive) {
                 startCountdown();
            } else {
                 gameLoop();
            }
        }
    }
});

// Adjust difficultySelect event listener to use gameState
difficultySelect.addEventListener('change', (event) => {
    difficultyLevel = event.target.value;
    resetGame();
    // Only start countdown if the game was actively playing or paused (not on welcome/game over)
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
        startCountdown();
    } else {
        drawEverything();
    }
});

// Adjust mousemove listener to use gameState
canvas.addEventListener('mousemove', (evt) => {
    if (gameState === GAME_STATES.PLAYING && !countdownActive) {
        let rect = canvas.getBoundingClientRect();
        let mousePos = evt.clientY - rect.top;
        playerPaddleY = mousePos - (paddleHeight / 2);

        if (playerPaddleY < 0) playerPaddleY = 0;
        if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
    }
});

// --- Keyboard Paddle Controls for Up/Down Arrow Keys (add at end of script.js) ---
let upArrowPressed = false;
let downArrowPressed = false;
const paddleMoveSpeed = 8; // we can change this number for faster/slower paddle movement

document.addEventListener('keydown', function(e) {
    if (typeof gameState !== "undefined" && gameState === "PLAYING" && !countdownActive) {
        if (e.key === "ArrowUp") upArrowPressed = true;
        if (e.key === "ArrowDown") downArrowPressed = true;
    }
});
document.addEventListener('keyup', function(e) {
    if (e.key === "ArrowUp") upArrowPressed = false;
    if (e.key === "ArrowDown") downArrowPressed = false;
});

// This function will move the paddle when up/down keys are pressed
function keyboardPaddleControl() {
    if (upArrowPressed) playerPaddleY -= paddleMoveSpeed;
    if (downArrowPressed) playerPaddleY += paddleMoveSpeed;
    // Do not let paddle go outside the screen:
    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
}
// Place this at the very end of script.js

document.addEventListener("DOMContentLoaded", () => {
    const howToPlayButton = document.getElementById('howToPlayButton');
    const howToPlayModal = document.getElementById('howToPlayModal');
    const closeHowToPlay = document.getElementById('closeHowToPlay');

    if (howToPlayButton && howToPlayModal && closeHowToPlay) {
        howToPlayButton.addEventListener('click', () => {
            howToPlayModal.classList.remove('hidden');
        });

        closeHowToPlay.addEventListener('click', () => {
            howToPlayModal.classList.add('hidden');
        });

        howToPlayModal.addEventListener('click', (e) => {
            if (e.target === howToPlayModal) {
                howToPlayModal.classList.add('hidden');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                howToPlayModal.classList.add('hidden');
            }
        });
    }

    // ✅ Add your existing Play Game button logic here as well
    const startGameButton = document.getElementById("startGameButton");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const gameCanvas = document.getElementById("gameCanvas");

    if (startGameButton && welcomeScreen && gameCanvas) {
        startGameButton.addEventListener("click", () => {
            welcomeScreen.style.display = "none";
            gameCanvas.style.display = "block";
            // Start game here...
        });
    }
});
howToPlayButton.addEventListener('click', () => {
    console.log("Clicked How to Play!");
    howToPlayModal.classList.remove('hidden');
});
