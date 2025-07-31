// Import audio...
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
} from "./audio.js";

const canvas = document.getElementById("gameCanvas");
if (!canvas) throw new Error("Canvas element with ID 'gameCanvas' not found.");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("2D rendering context not available.");

let ballX,
  ballY,
  ballSpeedX = 0,
  ballSpeedY = 0;
const ballRadius = 10;

const paddleWidth = 10;
const paddleHeight = 100;
let currentPaddleHeight = paddleHeight;

let playerPaddleY, aiPaddleY;
let playerScore = 0,
  aiScore = 0;
const minimumWinningScore = 3,
  scoreDifferenceToWin = 2;

let gamePaused = true,
  animationFrameId = null;
let countdownActive = false,
  countdownValue = 3,
  countdownIntervalId = null;
let playerName = "Player";

const welcomeScreen = document.getElementById("welcomeScreen");
const startGameButton = document.getElementById("startGameButton");
const playerNameInput = document.getElementById("playerNameInput");
const pauseButton = document.getElementById("pauseButton");
const difficultySelect = document.getElementById("difficulty");
const playerScoreDisplay = document.getElementById("playerScore");
const aiScoreDisplay = document.getElementById("aiScore");

const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverMessage = document.getElementById("gameOverMessage");
const playAgainButton = document.getElementById("playAgainButton");

let difficultyLevel = "medium";
const difficultySettings = {
  easy: { ballInitialSpeed: 5, aiPaddleSpeed: 3 },
  medium: { ballInitialSpeed: 6, aiPaddleSpeed: 5 },
  hard: { ballInitialSpeed: 7, aiPaddleSpeed: 7 },
};

const GAME_STATES = {
  WELCOME: "WELCOME",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
};
let gameState = GAME_STATES.WELCOME;

const powerUps = [];
const activePowerUps = [];
const extraBalls = [];
const powerUpTypes = ["biggerPaddle", "fasterBall", "multiBall"];
const powerUpDuration = 5000;

// ------------ Core Functions ------------

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  const settings = difficultySettings[difficultyLevel];
  ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * settings.ballInitialSpeed;
  ballSpeedY = (Math.random() * 2 - 1) * settings.ballInitialSpeed;
}

function updateScoreDisplay() {
  playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
  aiScoreDisplay.textContent = `AI: ${aiScore}`;
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  updateScoreDisplay();
  extraBalls.length = 0;
  currentPaddleHeight = paddleHeight;
  playerPaddleY = (canvas.height - currentPaddleHeight) / 2;
  aiPaddleY = (canvas.height - currentPaddleHeight) / 2;
  resetBall();
  gamePaused = true;
  pauseButton.textContent = "Resume";
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  drawEverything();
}

// ------------ Power-Up System ------------

function spawnPowerUp() {
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  const x = Math.random() * (canvas.width * 0.6) + canvas.width * 0.2;
  const y = Math.random() * (canvas.height - 30) + 15;
  powerUps.push({ x, y, type });
}
setInterval(spawnPowerUp, 10000);

function drawPowerUps() {
  powerUps.forEach((pu) => {
    ctx.beginPath();
    ctx.arc(pu.x, pu.y, 12, 0, 2 * Math.PI);
    if (pu.type === "biggerPaddle") ctx.fillStyle = "#2ecc71";
    else if (pu.type === "fasterBall") ctx.fillStyle = "#f1c40f";
    else ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.closePath();
  });
}

function applyPowerUp(type) {
  if (activePowerUps.includes(type)) return;
  activePowerUps.push(type);

  if (type === "biggerPaddle") currentPaddleHeight *= 1.5;
  else if (type === "fasterBall") {
    ballSpeedX *= 1.3;
    ballSpeedY *= 1.3;
  } else if (type === "multiBall") {
    for (let i = 0; i < 2; i++) {
      extraBalls.push({
        x: ballX,
        y: ballY,
        vx: (Math.random() > 0.5 ? 1 : -1) * ballSpeedX,
        vy: (Math.random() - 0.5) * 5,
      });
    }
  }

  setTimeout(() => {
    if (type === "biggerPaddle") currentPaddleHeight = paddleHeight;
    if (type === "fasterBall") {
      ballSpeedX /= 1.3;
      ballSpeedY /= 1.3;
    }
    activePowerUps.splice(activePowerUps.indexOf(type), 1);
  }, powerUpDuration);
}

function checkPowerUpCollision() {
  powerUps.forEach((pu, i) => {
    const dx = ballX - pu.x,
      dy = ballY - pu.y;
    if (Math.hypot(dx, dy) < ballRadius + 12) {
      applyPowerUp(pu.type);
      powerUps.splice(i, 1);
    }
  });
}

function updateExtraBalls() {
  extraBalls.forEach((b, idx) => {
    b.x += b.vx;
    b.y += b.vy;
    if (b.y < 0 || b.y > canvas.height) b.vy *= -1;
    if (b.x < 0 || b.x > canvas.width) extraBalls.splice(idx, 1);
  });
}

// ------------ Drawing & Loop ------------

function drawEverything() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowColor = "rgba(255,255,255,0.5)";
  ctx.shadowBlur = 10;
  drawRoundedRect(ctx, 0, playerPaddleY, paddleWidth, currentPaddleHeight, 5);
  drawRoundedRect(
    ctx,
    canvas.width - paddleWidth,
    aiPaddleY,
    paddleWidth,
    currentPaddleHeight,
    5
  );
  ctx.shadowColor = "rgba(255,255,255,0.8)";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
  ctx.fill();
  extraBalls.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, ballRadius, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  ctx.setLineDash([5, 10]);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  if (countdownActive) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "80px Segoe UI";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255,255,255,0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText(
      countdownValue === 0 ? "GO!" : countdownValue,
      canvas.width / 2,
      canvas.height / 2 + 30
    );
    ctx.shadowBlur = 0;
  }

  playerScoreDisplay.textContent = `${playerName}: ${playerScore}`;
  aiScoreDisplay.textContent = `AI: ${aiScore}`;

  drawPowerUps();
  activePowerUps.forEach((ap, i) => {
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText(ap, 10, 20 + i * 20);
  });
}

function moveEverything() {
  if (gamePaused || countdownActive) return;
  ballX += ballSpeedX;
  ballY += ballSpeedY;
  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    ballSpeedY *= -1;
    playSound(wallHitSound);
  }

  // Player paddle
  if (
    ballX - ballRadius < paddleWidth &&
    ballY > playerPaddleY &&
    ballY < playerPaddleY + currentPaddleHeight
  ) {
    ballSpeedX *= -1;
    ballSpeedY = (ballY - (playerPaddleY + currentPaddleHeight / 2)) * 0.35;
    playSound(paddleHitSound);
  }
  // AI paddle
  if (
    ballX + ballRadius > canvas.width - paddleWidth &&
    ballY > aiPaddleY &&
    ballY < aiPaddleY + currentPaddleHeight
  ) {
    ballSpeedX *= -1;
    ballSpeedY = (ballY - (aiPaddleY + currentPaddleHeight / 2)) * 0.35;
    playSound(paddleHitSound);
  }

  const aiCenter = aiPaddleY + currentPaddleHeight / 2;
  const aiSpeed = difficultySettings[difficultyLevel].aiPaddleSpeed;
  if (aiCenter < ballY - 35) aiPaddleY += aiSpeed;
  else if (aiCenter > ballY + 35) aiPaddleY -= aiSpeed;
  aiPaddleY = Math.max(
    0,
    Math.min(canvas.height - currentPaddleHeight, aiPaddleY)
  );

  keyboardPaddleControl();
  checkPowerUpCollision();
  updateExtraBalls();
}

function gameLoop() {
  moveEverything();
  drawEverything();
  animationFrameId = requestAnimationFrame(gameLoop);
}

// ------------ Countdown, Controls & Initialization ------------

function startCountdown() {
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  countdownActive = true;
  countdownValue = 3;
  drawEverything();
  playSound(countdownBeepSound);
  countdownIntervalId = setInterval(() => {
    countdownValue--;
    drawEverything();
    if (countdownValue < 0) clearInterval(countdownIntervalId);
  }, 1000);
  setTimeout(() => {
    countdownActive = false;
    gamePaused = false;
    pauseButton.textContent = "Pause";
    if (!animationFrameId) gameLoop();
  }, 3000);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

startGameButton.addEventListener("click", () => {
  playerName = playerNameInput.value.trim() || "Player";
  welcomeScreen.style.display = "none";
  gameState = GAME_STATES.PLAYING;
  startBackgroundMusicRotation();
  resetGame();
  startCountdown();
});
playAgainButton.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  gameState = GAME_STATES.PLAYING;
  startBackgroundMusicRotation();
  resetGame();
  startCountdown();
});
pauseButton.addEventListener("click", () => {
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
      if (!countdownActive) startCountdown();
      else gameLoop();
    }
  }
});
difficultySelect.addEventListener("change", (e) => {
  difficultyLevel = e.target.value;
  resetGame();
  if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED)
    startCountdown();
});
canvas.addEventListener("mousemove", (e) => {
  if (gameState === GAME_STATES.PLAYING && !countdownActive) {
    let rect = canvas.getBoundingClientRect();
    let y = e.clientY - rect.top - currentPaddleHeight / 2;
    playerPaddleY = Math.max(
      0,
      Math.min(canvas.height - currentPaddleHeight, y)
    );
  }
});
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    handleTouch(e);
  },
  { passive: false }
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    handleTouch(e);
  },
  { passive: false }
);
function handleTouch(e) {
  let rect = canvas.getBoundingClientRect();
  let ty = e.touches[0].clientY - rect.top - currentPaddleHeight / 2;
  playerPaddleY = Math.max(
    0,
    Math.min(canvas.height - currentPaddleHeight, ty)
  );
}
let up = false,
  down = false;
document.addEventListener("keydown", (e) => {
  if (gameState === GAME_STATES.PLAYING && !countdownActive) {
    if (e.key === "ArrowUp") up = true;
    if (e.key === "ArrowDown") down = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") up = false;
  if (e.key === "ArrowDown") down = false;
});
const paddleMoveSpeed = 8;
function keyboardPaddleControl() {
  if (up) playerPaddleY -= paddleMoveSpeed;
  if (down) playerPaddleY += paddleMoveSpeed;
  playerPaddleY = Math.max(
    0,
    Math.min(canvas.height - currentPaddleHeight, playerPaddleY)
  );
}

// Initial draw
document.addEventListener("DOMContentLoaded", () => {
  welcomeScreen.style.display = "flex";
  gameOverScreen.style.display = "none";
  playerPaddleY = aiPaddleY = (canvas.height - currentPaddleHeight) / 2;
  drawEverything();
});
