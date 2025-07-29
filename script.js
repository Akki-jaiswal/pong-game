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
    backgroundMusicTracks,
    welcomeMusic,
    currentBackgroundMusic,
    playWelcomeMusic,
    stopWelcomeMusic
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
let countdownTimeOutId = null; //to stop the countdown in welcome screen

let playerName = "Player";

// DOM elements
const welcomeScreen = document.getElementById('welcomeScreen');
const startGameButton = document.getElementById('startGameButton');
const playerNameInput = document.getElementById('playerNameInput');
const pauseButton = document.getElementById('pauseButton');
const difficultySelect = document.getElementById('difficulty');
const playerScoreDisplay = document.getElementById('playerScore');
const aiScoreDisplay = document.getElementById('aiScore');
const ball= document.getElementById("cursor-ball"); //for the ball animation
const input= document.getElementById("playerNameInput"); //for the name input
const gameExit= document.querySelector(".game-exit");
const exitButton= document.getElementById("exitButton"); //the exit button
const gameControls= document.querySelector(".game-controls");
const musicButton= document.getElementById('music-button');


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

//Game state global variables
const GAME_STATES = {
    WELCOME: 'WELCOME',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    EXITED: 'EXITED' //New state added
};
let gameState = GAME_STATES.WELCOME; // Initialize game state
console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);
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
    console.log("gameLoop called. gamePaused:", gamePaused, "gameState:", gameState); // ADD THIS
    console.log("gameLoop reads: gamePaused =", gamePaused, "gameState =", gameState, "animationFrameId =", animationFrameId);
    if (gamePaused || gameState !== GAME_STATES.PLAYING){
        console.log("gameLoop exiting due to pause or state."); // ADD THIS
        animationFrameId = null; // Ensure no lingering ID if paused
        return;
    }
    moveEverything();
    drawEverything();
    animationFrameId = requestAnimationFrame(gameLoop);
    console.log("requestAnimationFrame called."); // ADD THIS
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
    stopWelcomeMusic(); // Ensure welcome music is also stopped

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

    drawEverything();
}

//--Function to manage everything when returning to Welcome Screen
function returnToWelcomeScreen() {
    //Stopping any ongoing game loop or countdown
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if(countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }

    //Clearing the timeout that starts the game after countdown
    if (countdownTimeOutId) { // Add this check
        clearTimeout(countdownTimeOutId); // <--- Add this line!
        countdownTimeOutId = null; // Set to null after clearing
    }

    //Ensuring all relevant state variables are reset for the welcome screen
    gamePaused = true;       // The game should be considered paused/inactive
    countdownActive = false; // No countdown active
    gameState = GAME_STATES.WELCOME; // Set the game state
    console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);

    //Stopping all background music and reset its position
    stopBackgroundMusicRotation();
    playWelcomeMusic();

    if (musicButton) {
        musicButton.textContent = welcomeMusic.muted ? "Unmute Music" : "Mute Music";
    }

    //Stopping countdown beep sound
    if (countdownBeepSound) { // Check if the sound object exists
        countdownBeepSound.pause(); // Pause the sound
        countdownBeepSound.currentTime = 0; // Reset its playback position to the start
    }

    //Resetting game scores and positions
    resetGame(); // This resets scores, paddle positions, and calls drawEverything()

    //Managing UI visibility for the welcome screen
    welcomeScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none'; // Ensure game over is hidden
    
    //Hiding game elements that should not be visible
    canvas.style.display = 'block';
    gameControls.style.display = 'flex'; // This hides the game controls tab
    gameExit.style.display = 'none';     // This hides the exit button itself

    //Resetting player name input field
    playerNameInput.value = ""; 

    //Ensuring cursor ball is visible and 'gameStarted' flag is reset
    gameStarted = false; // Allow the cursor ball to be active again
    if (ball) {
        ball.style.display = "block";
    }
}


// --- Countdown Function ---
function startCountdown() {

    // Clear any existing countdown interval to prevent overlaps
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }

    //Clearing any existing countdown timeout to prevent overlaps
    if (countdownTimeOutId) {
        clearTimeout(countdownTimeOutId); // Clear any pending timeout
        countdownTimeOutId= null;
    }

    //Stopping animation during countdown
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    countdownActive = true;
    countdownValue = 3;
    gamePaused= true; //prevent movement during countdown

    playSound(countdownBeepSound);
    drawEverything(); // Draw initial 3

    
    // Assign interval ID to the global variable
    countdownIntervalId = setInterval(() => {
        countdownValue--;
        drawEverything(); //Redrawing the canvas with the correct countdown

        if (countdownValue < 0) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
    }, 1000);
    // This setTimeout runs after 3 seconds (for 3, 2, 1, GO! sequence)
        countdownTimeOutId= setTimeout(() => {
           if(countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
           } 
           countdownActive = false;
           gamePaused = false;
           pauseButton.textContent = "Pause";

           gameState= GAME_STATES.PLAYING;
           console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);

           //Music control
           stopWelcomeMusic(); // Stop the welcome music
           startBackgroundMusicRotation(); // Start the rotational gameplay music

            // Update music button to reflect gameplay music state
            if (musicButton) {
                musicButton.textContent = currentBackgroundMusic.muted ? "Unmute Music" : "Mute Music";
            }

            if (!animationFrameId) {
                gameLoop();
            }
        }, 3000);
}

// --- Initial Game Start Handler (from Welcome Screen) ---

startGameButton.addEventListener("click", () => {

  console.log("--- startGameButton clicked ---");
  //Resetting and start the game
  playerName = playerNameInput.value.trim() || "Player";

  //For the cursor ball visibility
  gameStarted = true;
  ball.style.display = "none";

  //Hiding the welcome screen
  welcomeScreen.style.display = "none";

  //Showing game elements
  canvas.style.display = "block";
  gameControls.style.display = "flex";
  gameExit.style.display = "block";

  //Music control
  stopWelcomeMusic();

  resetGame();
//   startBackgroundMusicRotation();
  gamePaused = true;
  gameState = GAME_STATES.PAUSED;
  console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);
  startCountdown();
});


// --- Event Listener for Play Again Button ---
playAgainButton.addEventListener('click', () => {
    console.log("--- playAgainButton clicked ---");
    gameOverScreen.style.display = 'none';

    canvas.style.display = 'block';
    gameControls.style.display = 'flex';
    gameExit.style.display = "block";

    resetGame();
    // Stop any current music (like game over sound) before starting countdown for gameplay music
    stopBackgroundMusicRotation();
    stopWelcomeMusic(); 

    //Stop the player win sound
    if (playerWinSound) {
        playerWinSound.pause();
        playerWinSound.currentTime = 0; // Rewind to start for next potential play
    }

    gamePaused = true;
    gameState = GAME_STATES.PLAYING;
    console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);
    startCountdown();
});


// --- Event Listeners for In-Game Controls ---

//Music button listener
if (musicButton) {
    musicButton.addEventListener('click', () => {
        if (gameState === GAME_STATES.WELCOME) { 
            //Toggle welcome music
            if (welcomeMusic.muted) {
                playWelcomeMusic();
                musicButton.textContent = "Mute Music";
            } else {
                stopWelcomeMusic();
                musicButton.textContent = "Unmute Music";
            }
        } else if(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED){
            // If music is not currently playing for the welcome, attempt to start it (unmuted)
            if (currentBackgroundMusic && !currentBackgroundMusic.muted && !currentBackgroundMusic.paused) {
                stopBackgroundMusicRotation();
                musicButton.textContent = "Unmute Music";
            } else { // If not playing or muted, start it
                startBackgroundMusicRotation();
                musicButton.textContent = "Mute Music";
            }
            }
            // backgroundMusicTracks.forEach(track => {
            //     track.muted = false; // Ensure it starts unmuted
            // });
            // musicButton.textContent = "Mute Music";
    });
}

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
    /** ERROR CHECKING CODE */
    if (countdownActive) {
        console.log("Cannot pause/resume during active countdown.");
        return; // Exit if countdown is active
    }
    /*OVER*/
        if (gameState === GAME_STATES.PLAYING) { 
            gamePaused = true;
            gameState= GAME_STATES.PAUSED;
            console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);
            pauseButton.textContent = "Resume";

            //Stopping ongoing animation frame request
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                console.log("Game paused. Animation frame cancelled.");
            }
            stopBackgroundMusicRotation(); // Stop gameplay music when paused
            if (musicButton) musicButton.textContent = "Unmute Music";
            console.log("Game State: PAUSED");
        }
        else if (gameState === GAME_STATES.PAUSED) {
            gamePaused = false;
            gameState = GAME_STATES.PLAYING;
            console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);
            pauseButton.textContent = "Pause";
    
            // Do NOT play background music here. It should remain stopped during gameplay.
            if (!animationFrameId) { // If game was truly paused and not just in countdown
                gameLoop();
                console.log("Game resumed. Game loop restarted.");
            }

            startBackgroundMusicRotation(); // Resume gameplay music
            if (musicButton) musicButton.textContent = "Mute Music"; // Update music button
            console.log("Game State: PLAYING");
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


document.addEventListener('DOMContentLoaded', () => {
    welcomeScreen.style.display = 'flex'; // Show the welcome screen
    gameOverScreen.style.display = 'none'; // Ensure game over screen is hidden initially

    // Update playerPaddleY and aiPaddleY only after canvas dimensions are known
    playerPaddleY = (canvas.height - paddleHeight) / 2;
    aiPaddleY = (canvas.height - paddleHeight) / 2;
    drawEverything(); // Draw initial state on canvas

    //Music Control
    playWelcomeMusic();
    if (musicButton) {
        musicButton.textContent = backgroundMusicTracks[0].muted ? "Unmute Music" : "Mute Music";
    }
});

// Minor adjustment in playAgainButton to set gameState
playAgainButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';

    // Showing game elements (if they were hidden by gameOverScreen being 'flex')
    canvas.style.display = 'block';
    gameControls.style.display = 'flex';
    gameExit.style.display = 'block';

    resetGame(); //Reset scores
    stopBackgroundMusicRotation();
    stopWelcomeMusic(); // Ensure welcome music is off

    gamePaused = true; //initially for countdown
    gameState = GAME_STATES.PLAYING; // Set game state to playing
    console.log(`DEBUG: gameState changed to ${gameState} from ${new Error().stack.split('\n')[2]}`);
    
    startCountdown();
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

//Function for a ball object to move with the cursor
let gameStarted= false; //to track the transition to the game window

//Ball follows cursor only when inside the welcome screen
window.addEventListener("mousemove", (e) => {
  if (gameStarted) return;
  ball.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
});

// Hide ball when hovering over input or start button
[input, startGameButton].forEach((el) => {
  el.addEventListener("mouseenter", () => {
    if (!gameStarted) ball.style.display = "none";
  });
  el.addEventListener("mouseleave", () => {
    if (!gameStarted) ball.style.display = "block";
  });
});


//Functionality of exit button
exitButton.addEventListener("click", ()=>{
   returnToWelcomeScreen();
});