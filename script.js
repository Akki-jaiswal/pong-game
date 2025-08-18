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

// Import theme manager
import themeManager from './theme.js';

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    throw new Error("Canvas element with ID 'gameCanvas' not found.");
}
const ctx = canvas.getContext('2d');
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
const fullscreenButton = document.getElementById("fullscreenButton");

const howToPlayButton = document.getElementById('howToPlayButton');
const howToPlayModal = document.getElementById('howToPlayModal');
const closeHowToPlay = document.getElementById('closeHowToPlay');


// Game Over Screen elements
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Difficulty level variable
let difficultyLevel = 'medium';

// Difficulty Settings
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

// Keyboard state
let upArrowPressed = false;
let downArrowPressed = false;
const paddleMoveSpeed = 8;

// --- Game Functions ---

function updateBackgroundBasedOnScore() {
    const body = document.body;
    // Remove all score-related classes first
    for (let i = 1; i <= 10; i++) {
        body.classList.remove(`score-${i}`);
    }
    
    // Calculate total score and cycle through 10 different colors
    const totalScore = playerScore + aiScore;
    const scoreClass = `score-${(totalScore % 10) + 1}`;
    body.classList.add(scoreClass);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    const currentSettings = difficultySettings[difficultyLevel];
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * currentSettings.ballInitialSpeed;
    ballSpeedY = (Math.random() * 2 - 1) * currentSettings.ballInitialSpeed;
}

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
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current theme colors for dynamic rendering
    const currentTheme = themeManager.getCurrentTheme();
    const computedStyles = getComputedStyle(document.documentElement);
    
    // Dynamic paddle color based on theme
    const paddleColor = computedStyles.getPropertyValue('--paddle-color').trim() || 'rgba(255, 255, 255, 0.9)';
    const paddleGlow = computedStyles.getPropertyValue('--paddle-glow').trim() || 'rgba(255, 255, 255, 0.5)';
    const ballColor = computedStyles.getPropertyValue('--ball-color').trim() || 'rgba(255, 255, 255, 0.95)';
    const ballGlow = computedStyles.getPropertyValue('--ball-glow').trim() || 'rgba(255, 255, 255, 0.8)';
    const centerLineColor = computedStyles.getPropertyValue('--center-line-color').trim() || 'rgba(255, 255, 255, 0.3)';

    // Draw paddles with enhanced styling and rounded corners
    ctx.fillStyle = paddleColor;
    ctx.shadowColor = paddleGlow;

    ctx.shadowBlur = 10;
    
    // Player paddle
    ctx.beginPath();
    drawRoundedRect(ctx, 0, playerPaddleY, paddleWidth, paddleHeight, 5);
    ctx.fill();
    
    // AI paddle
    ctx.beginPath();
    drawRoundedRect(ctx, canvas.width - paddleWidth, aiPaddleY, paddleWidth, paddleHeight, 5);
    ctx.fill();

    // Draw ball with glow effect
    ctx.shadowColor = ballGlow;

    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw center line
    ctx.setLineDash([5, 10]);
    ctx.strokeStyle = centerLineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw countdown if active
    if (countdownActive) {
        ctx.fillStyle = ballColor;
        ctx.font = '80px Segoe UI';
        ctx.textAlign = 'center';
        ctx.shadowColor = ballGlow;
        ctx.shadowBlur = 10;
        ctx.fillText(countdownValue === 0 ? "GO!" : countdownValue, canvas.width / 2, canvas.height / 2 + 30);
        ctx.shadowBlur = 0;
    }

    // Update score displays
    playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
    aiScoreDisplay.textContent = `AI: ${aiScore}`;
}

function moveEverything() {
    if (gamePaused || countdownActive) return;

    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom walls
    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
        playSound(wallHitSound);
    }

    // Ball out of bounds - left side (AI scores)
    if (ballX < 0) {
        aiScore++;
        updateScoreDisplay();
        updateBackgroundBasedOnScore();
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

    // Ball out of bounds - right side (Player scores)
    if (ballX > canvas.width) {
        playerScore++;
        updateScoreDisplay();
        updateBackgroundBasedOnScore();
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

    // Ball collision with player paddle
    if (ballX - ballRadius < paddleWidth && ballY > playerPaddleY && ballY < playerPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (playerPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        playSound(paddleHitSound);
    }

    // Ball collision with AI paddle
    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > aiPaddleY && ballY < aiPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (aiPaddleY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        playSound(paddleHitSound);
    }

    // AI paddle movement
    const aiCenter = aiPaddleY + (paddleHeight / 2);
    const aiSpeed = difficultySettings[difficultyLevel].aiPaddleSpeed;

    if (aiCenter < ballY - 35) {
        aiPaddleY += aiSpeed;
    } else if (aiCenter > ballY + 35) {
        aiPaddleY -= aiSpeed;
    }

    // Keep AI paddle in bounds
    if (aiPaddleY < 0) aiPaddleY = 0;
    if (aiPaddleY + paddleHeight > canvas.height) aiPaddleY = canvas.height - paddleHeight;

    // Handle keyboard controls
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
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    playerScore = 0;
    aiScore = 0;
    updateScoreDisplay();
    updateBackgroundBasedOnScore();

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

// --- Fullscreen Functionality ---
fullscreenButton.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error enabling fullscreen: ${err.message}`);
    });
    fullscreenButton.textContent = "⛷";
  } else {
    document.exitFullscreen();
    fullscreenButton.textContent = "⛶";
  }
});

// --- Fullscreen Functions ---
function resizeCanvas() {
  const newWidth = document.fullscreenElement ? 1400 : 800;
  const newHeight = document.fullscreenElement ? 600 : 400;

  // Preserve positions as percentages
  const ballXPercent = ballX / canvas.width;
  const ballYPercent = ballY / canvas.height;
  const playerPaddleYPercent = playerPaddleY / canvas.height;
  const aiPaddleYPercent = aiPaddleY / canvas.height;

  // Resize canvas
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Restore positions
  ballX = ballXPercent * canvas.width;
  ballY = ballYPercent * canvas.height;
  playerPaddleY = playerPaddleYPercent * canvas.height;
  aiPaddleY = aiPaddleYPercent * canvas.height;

  drawEverything();
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenButton.textContent = "⛷";
  } else {
    fullscreenButton.textContent = "⛶";
  }
  // Resize canvas when fullscreen state changes
  resizeCanvas();
});

// Listen for window resize events (useful when in fullscreen)
window.addEventListener('resize', () => {
  if (document.fullscreenElement) {
    resizeCanvas();
  }
});

// --- Countdown Function ---

function startCountdown() {
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }

    countdownActive = true;
    countdownValue = 3;
    drawEverything();

    playSound(countdownBeepSound);

    countdownIntervalId = setInterval(() => {
        countdownValue--;
        drawEverything();
        if (countdownValue < 0) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
    }, 1000);

    setTimeout(() => {
        countdownActive = false;
        gamePaused = false;
        pauseButton.textContent = "Pause";
        if (!animationFrameId) {
            gameLoop();
        }
    }, 3000);
}

function keyboardPaddleControl() {
    if (upArrowPressed) playerPaddleY -= paddleMoveSpeed;
    if (downArrowPressed) playerPaddleY += paddleMoveSpeed;
    
    // Keep player paddle in bounds
    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
}

function handleTouchMove(event) {
    let touchY = event.touches[0].clientY;
    let canvasRect = canvas.getBoundingClientRect();
    let relativeTouchY = touchY - canvasRect.top;

    playerPaddleY = relativeTouchY - paddleHeight / 2;

    // Keep paddle in bounds
    if (playerPaddleY < 0) {
        playerPaddleY = 0;
    } else if (playerPaddleY + paddleHeight > canvas.height) {
        playerPaddleY = canvas.height - paddleHeight;
    }
}

// --- Event Listeners ---

// Start game button
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

// Play again button
playAgainButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    resetGame();
    startBackgroundMusicRotation();
    startCountdown();
});

// Mouse movement for paddle control
canvas.addEventListener('mousemove', (evt) => {
    if (gamePaused || countdownActive) return;

    let rect = canvas.getBoundingClientRect();
    let mousePos = evt.clientY - rect.top;
    playerPaddleY = mousePos - (paddleHeight / 2);

    // Keep paddle in bounds
    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY + paddleHeight > canvas.height) playerPaddleY = canvas.height - paddleHeight;
});

// Touch controls for mobile
canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    handleTouchMove(event);
}, { passive: false });

canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
    handleTouchMove(event);
}, { passive: false });

// Pause button
pauseButton.addEventListener('click', () => {
    if (!countdownActive) {
        if (gamePaused) {
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

// Listen for theme changes to update canvas rendering
document.addEventListener('themeChanged', (event) => {
    // Redraw canvas with new theme colors
    drawEverything();
});

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
            pauseButton.textContent = "Resume";
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            stopBackgroundMusicRotation();
        }
    }
});

// Difficulty selection
difficultySelect.addEventListener('change', (event) => {
    difficultyLevel = event.target.value;
    event.target.blur(); // Remove focus from select
    resetGame();
});

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (!gamePaused && !countdownActive) {
        if (e.key === "ArrowUp") upArrowPressed = true;
        if (e.key === "ArrowDown") downArrowPressed = true;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === "ArrowUp") upArrowPressed = false;
    if (e.key === "ArrowDown") downArrowPressed = false;
});

// How to Play modal
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
        if (e.key === 'Escape' && !howToPlayModal.classList.contains('hidden')) {
            howToPlayModal.classList.add('hidden');
        }
    });
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    welcomeScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    updateBackgroundBasedOnScore();

    playerPaddleY = (canvas.height - paddleHeight) / 2;
    aiPaddleY = (canvas.height - paddleHeight) / 2;
    drawEverything();
});