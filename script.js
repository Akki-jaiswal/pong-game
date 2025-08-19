window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // --- Game variables ---
    let gameRunning = false;
    let paused = false;
    let playerScore = 0;
    let aiScore = 0;
    let difficulty = "medium";

    // --- Paddle settings ---
    const paddleHeight = 80;
    const paddleWidth = 10;
    const player = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 6 };
    const ai = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, dy: 5 };

    // --- Ball settings ---
    const ball = { x: canvas.width / 2, y: canvas.height / 2, r: 8, dx: 4, dy: 4 };

    // --- Difficulty mapping ---
    const speeds = {
        easy: 3,
        medium: 5,
        hard: 7
    };

    // --- Draw everything ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
const welcomeScreen = document.getElementById("welcomeScreen");
const startGameButton = document.getElementById("startGameButton");
const playerNameInput = document.getElementById("playerNameInput");
const pauseButton = document.getElementById("pauseButton");
const difficultySelect = document.getElementById("difficulty");
const playerScoreDisplay = document.getElementById("playerScore");
const aiScoreDisplay = document.getElementById("aiScore");
const highScoreDisplay = document.getElementById("highScore");
const resetScoreButton = document.getElementById("resetScoreButton");
const fullscreenButton = document.getElementById("fullscreenButton");

const howToPlayButton = document.getElementById('howToPlayButton');
const howToPlayModal = document.getElementById('howToPlayModal');
const closeHowToPlay = document.getElementById('closeHowToPlay');


// Game Over Screen elements
const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverMessage = document.getElementById("gameOverMessage");
const playAgainButton = document.getElementById("playAgainButton");

const SCORE_STORAGE_KEY = "pong_scores";
const HIGH_SCORE_KEY = "pong_high_score";
const HIGH_SCORE_LOG_KEY = "pong_high_score_log";

// Load scores from localStorage
let highScore = 0;

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

        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player paddle
        ctx.fillStyle = "white";
        ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);

        // AI paddle
        ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);

        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        // Net
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.fillRect(canvas.width / 2 - 1, i, 2, 10);
        }

        // Score
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Player: ${playerScore}`, 50, 30);
        ctx.fillText(`AI: ${aiScore}`, canvas.width - 150, 30);
    }

    // --- Reset ball ---
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1; // change direction
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
        saveScores();
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
        saveScores();
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
    // --- Update game state ---
    function update() {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Bounce top/bottom
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
            ball.dy *= -1;
        }

        // Player collision
        if (
            ball.x - ball.r < player.x + paddleWidth &&
            ball.y > player.y &&
            ball.y < player.y + paddleHeight
        ) {
            ball.dx *= -1;
        }

        // AI collision
        if (
            ball.x + ball.r > ai.x &&
            ball.y > ai.y &&
            ball.y < ai.y + paddleHeight
        ) {
            ball.dx *= -1;
        }

        // Scoring
        if (ball.x - ball.r < 0) {
            aiScore++;
            resetBall();
        } else if (ball.x + ball.r > canvas.width) {
            playerScore++;
            resetBall();
        }

        // AI movement
        let aiCenter = ai.y + paddleHeight / 2;
        if (ball.y < aiCenter) ai.y -= speeds[difficulty];
        else if (ball.y > aiCenter) ai.y += speeds[difficulty];

        // Boundaries
        player.y = Math.max(Math.min(player.y, canvas.height - paddleHeight), 0);
        ai.y = Math.max(Math.min(ai.y, canvas.height - paddleHeight), 0);

        // Check Game Over
        if ((playerScore >= 3 || aiScore >= 3) && Math.abs(playerScore - aiScore) >= 2) {
            endGame();
        }
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
    highScoreDisplay.textContent = `🏆 High Score: ${
        highScore > 0 ? highScore : "0"
    }`;
}

function endGame(message) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    gamePaused = true;
    stopBackgroundMusicRotation();

  gameOverMessage.textContent = message;
  const log = JSON.parse(localStorage.getItem(HIGH_SCORE_LOG_KEY)) || [];
  const logHTML = log
    .map((entry) => {
      const [date, time] = entry.time.split(", ");
      return `
      <div class="log-entry">
        🏅 <strong>Score:</strong> ${entry.score} |
        📅 ${date}
        🕒 ${time}
      </div>
    `;
    })
    .slice(0, 5)
    .join("");

  const logContainer = document.getElementById("gameOverLog");
  logContainer.innerHTML = log.length
    ? `<strong>📜 Recent High Scores:</strong><br>${logHTML}`
    : "<i>No recent scores yet.</i>";
  console.log("logContainer innerHTML", logContainer.innerHTML);
  gameOverScreen.style.display = "flex";
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
    // --- Main loop ---
    function gameLoop() {
        if (gameRunning && !paused) {
            update();
            draw();
        }
        requestAnimationFrame(gameLoop);
    }

    // --- Start Game ---
    function startGame() {
        gameRunning = true;
        paused = false;
        playerScore = 0;
        aiScore = 0;
        resetBall();
        document.getElementById("welcomeScreen").style.display = "none";
        document.getElementById("gameOverScreen").style.display = "none";
    }

    // --- End Game ---
    function endGame() {
        gameRunning = false;
        document.getElementById("gameOverMessage").textContent =
            playerScore > aiScore ? "🎉 You Win!" : "😢 AI Wins!";
        document.getElementById("gameOverScreen").style.display = "block";
    }

    // --- Controls ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") player.y -= player.dy;
        if (e.key === "ArrowDown") player.y += player.dy;
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        paused = !paused;
        document.getElementById("pauseButton").textContent = paused ? "Resume" : "Pause";
    });

    document.getElementById("difficulty").addEventListener("change", (e) => {
        difficulty = e.target.value;
    });

    document.getElementById("startGameButton").addEventListener("click", startGame);
    document.getElementById("playAgainButton").addEventListener("click", startGame);

    // --- Kick off loop ---
    requestAnimationFrame(gameLoop);
});

resetScoreButton.addEventListener("click", () => {
  if (
    confirm("Are you sure you want to reset all scores including high score?")
  ) {
    resetScores();
  }
});
// Save name
localStorage.setItem("pong_player_name", playerName);

// On load
const savedName = localStorage.getItem("pong_player_name");
if (savedName) {
  playerName = savedName;
  playerNameInput.value = savedName;
}
function loadScores() {
  const saved = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY));
  if (saved) {
    playerScore = saved.playerScore || 0;
    aiScore = saved.aiScore || 0;
  }
  highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
}

function saveScores() {
  localStorage.setItem(
    SCORE_STORAGE_KEY,
    JSON.stringify({
      playerScore,
      aiScore
    })
  );

  if (playerScore > highScore) {
    highScore = playerScore;
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
  }

  // Log every score regardless of high score
  const log = JSON.parse(localStorage.getItem(HIGH_SCORE_LOG_KEY)) || [];
  const timestamp = new Date().toLocaleString();
  log.unshift({ score: playerScore, time: timestamp });
  if (log.length > 10) log.pop();
  localStorage.setItem(HIGH_SCORE_LOG_KEY, JSON.stringify(log));
  updateScoreDisplay();
}

function resetScores() {
  playerScore = 0;
  aiScore = 0;
  highScore = 0;
  localStorage.removeItem(SCORE_STORAGE_KEY);
  localStorage.removeItem(HIGH_SCORE_KEY);
  localStorage.removeItem("pong_high_score_log"); // Clear high score log
  updateScoreDisplay();
}

resetScoreButton.addEventListener("click", () => {
  if (confirm("Reset all scores and high score?")) {
    resetScores();
  }
});

