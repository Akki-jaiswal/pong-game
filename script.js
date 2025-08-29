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

        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player paddle
        ctx.fillStyle = "white";
        ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);

<<<<<<< HEAD
// DOM elements
const welcomeScreen = document.getElementById('welcomeScreen');
const startGameButton = document.getElementById('startGameButton');
const playerNameInput = document.getElementById('playerNameInput');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const difficultySelect = document.getElementById('difficulty');
const playerScoreDisplay = document.getElementById('playerScore');
const aiScoreDisplay = document.getElementById('aiScore');
=======
        // AI paddle
        ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);
>>>>>>> 7547b8de8c0d6d577416bcd8d803f1ede4138497

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

    // --- Main loop ---
    function gameLoop() {
        if (gameRunning && !paused) {
            update();
            draw();
        }
<<<<<<< HEAD
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

// Restart button functionality
restartButton.addEventListener('click', () => {
    // Only allow restart if game has started (not on welcome screen)
    if (gameState !== GAME_STATES.WELCOME) {
        // Stop any ongoing countdown
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        
        // Reset the game
        resetGame();
        
        // Start a new countdown
        startCountdown();
        
        // Ensure background music is playing
        startBackgroundMusicRotation();
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
=======
        requestAnimationFrame(gameLoop);
>>>>>>> 7547b8de8c0d6d577416bcd8d803f1ede4138497
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
