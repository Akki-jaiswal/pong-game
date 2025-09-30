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

    const howToPlayButton = document.getElementById("howToPlayButton");
    const howToPlayModal = document.getElementById("howToPlayModal");
    const closeHowToPlay = document.getElementById("closeHowToPlay");
    const closeHowToPlayBtn = document.getElementById("closeHowToPlayBtn");

    // Pause overlay
    const pauseOverlay = document.createElement("div");
    pauseOverlay.id = "pauseOverlay";
    pauseOverlay.style.cssText = `
        display:none;
        position:absolute;
        top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.5);
        color:white;
        font-size:48px;
        text-align:center;
        line-height:100vh;
    `;
    pauseOverlay.textContent = "PAUSED";
    document.body.appendChild(pauseOverlay);

    // ---- Game state ----
    let gameRunning = false;
    let paused = false;
    let playerScore = 0;
    let aiScore = 0;
    let difficulty = "medium";
    let playerName = "";

    let gameLoopId; // For requestAnimationFrame

    // ---- Objects ----
    const paddleWidth = 10;
    const paddleHeight = 80;

    const player = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 6 };
    const ai = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, dy: 5 };

    const ball = { x: canvas.width / 2, y: canvas.height / 2, r: 8, dx: 4, dy: 4 };

    const speeds = { easy: 3, medium: 5, hard: 7 };

    // ---- Theme functionality ----
    themeSelector.addEventListener("change", (e) => {
        document.body.classList.remove("neon-retro", "dark-mode", "ocean-blue");
        if (e.target.value !== "default") document.body.classList.add(e.target.value);
    });

    // ---- Fullscreen functionality ----
    fullscreenButton.addEventListener("click", toggleFullscreen);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error enabling fullscreen: ${err.message}`);
            });
            fullscreenButton.textContent = "❐";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenButton.textContent = "⛶";
            }
        }
    }

    // Pause/resume functions
    function pauseGame() {
        if (!paused) {
            paused = true;
            cancelAnimationFrame(gameLoopId);
            pauseOverlay.style.display = "block";
            pauseButton.textContent = "Resume";
            console.log("Game paused");
        }
    }

    function resumeGame() {
        if (paused) {
            paused = false;
            gameLoopId = requestAnimationFrame(loop);
            pauseOverlay.style.display = "none";
            pauseButton.textContent = "Pause";
            console.log("Game resumed");
        }
    }

    // ---- Fullscreen change listener ----
    document.addEventListener('fullscreenchange', () => {
        pauseGame(); // Pause automatically on enter/exit fullscreen
    });

    // ---- Helpers ----
    function updateScoreUI() {
        const displayName = playerName || "Player";
        playerScoreDisplay.textContent = `${displayName}: ${playerScore}`;
        aiScoreDisplay.textContent = `AI: ${aiScore}`;
        document.getElementById('scorePlayerName').textContent = displayName;
        document.getElementById('scorePlayerAvatar').textContent = window.selectedAvatar || "😎";
        document.getElementById('playerScore').textContent = playerScore;
        document.getElementById('aiScore').textContent = aiScore;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
        ball.dy = (Math.random() * 2 - 1) * 4;
    }

    function centerPaddles() {
        player.y = canvas.height / 2 - paddleHeight / 2;
        ai.y = canvas.height / 2 - paddleHeight / 2;
    }

    // ---- Draw ----
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        // Scores
        ctx.font = "16px Arial";
        ctx.fillStyle = "#4cc9f0";
        const displayName = playerName || "Player";
        ctx.fillText(`${displayName}: ${playerScore}`, 50, 30);
        ctx.fillStyle = "#f72585";
        ctx.fillText(`AI: ${aiScore}`, canvas.width - 150, 30);
    }

    // ---- Update ----
    function update() {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dy *= -1;

        if (
            ball.x - ball.r <= player.x + paddleWidth &&
            ball.y >= player.y &&
            ball.y <= player.y + paddleHeight &&
            ball.dx < 0
        ) {
            ball.dx *= -1;
            const collidePoint = ball.y - (player.y + paddleHeight / 2);
            ball.dy = collidePoint * 0.15;
        }

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

        // Score
        if (ball.x + ball.r < 0) { aiScore++; updateScoreUI(); resetBall(); }
        else if (ball.x - ball.r > canvas.width) { playerScore++; updateScoreUI(); resetBall(); }

        // AI movement
        const aiCenter = ai.y + paddleHeight / 2;
        if (ball.y < aiCenter) ai.y -= speeds[difficulty];
        else if (ball.y > aiCenter) ai.y += speeds[difficulty];

        player.y = Math.max(0, Math.min(canvas.height - paddleHeight, player.y));
        ai.y = Math.max(0, Math.min(canvas.height - paddleHeight, ai.y));

        // Game over
        if ((playerScore >= 3 || aiScore >= 3) && Math.abs(playerScore - aiScore) >= 2) endGame();
    }

    // ---- Loop ----
    function loop() {
        if (gameRunning && !paused) {
            update();
            draw();
        }
        gameLoopId = requestAnimationFrame(loop);
    }
    gameLoopId = requestAnimationFrame(loop);

    // ---- Controls ----
    const keys = { up: false, down: false };
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") keys.up = true;
        if (e.key === "ArrowDown") keys.down = true;
        if (e.key === " " && gameRunning) paused ? resumeGame() : pauseGame();
    });
    document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowUp") keys.up = false;
        if (e.key === "ArrowDown") keys.down = false;
    });

    (function applyKeyboardMotion() {
        if (gameRunning && !paused) {
            if (keys.up) player.y -= player.dy;
            if (keys.down) player.y += player.dy;
        }
        requestAnimationFrame(applyKeyboardMotion);
    })();

    canvas.addEventListener("mousemove", (evt) => {
        const rect = canvas.getBoundingClientRect();
        const mouseY = evt.clientY - rect.top;
        player.y = mouseY - paddleHeight / 2;
    });

    canvas.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touchY = evt.touches[0].clientY - rect.top;
        player.y = touchY - paddleHeight / 2;
    }, { passive: false });

    canvas.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touchY = evt.touches[0].clientY - rect.top;
        player.y = touchY - paddleHeight / 2;
    }, { passive: false });

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
        document.getElementById('profilePreview').classList.add('hidden');
    }

    function endGame() {
        gameRunning = false;
        const displayName = playerName || "Player";
        if (playerScore > aiScore) {
            gameOverMessage.textContent = `🎉 ${displayName} Wins!`;
            gameOverScreen.classList.add("winner");
            gameOverScreen.classList.remove("loser");
        } else {
            gameOverMessage.textContent = "😢 AI Wins!";
            gameOverScreen.classList.add("loser");
            gameOverScreen.classList.remove("winner");
        }
        gameOverScreen.style.display = "flex";
    }

    startGameButton.addEventListener("click", startGame);
    playAgainButton.addEventListener("click", startGame);

    pauseButton.addEventListener("click", () => {
        if (!gameRunning) return;
        paused ? resumeGame() : pauseGame();
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

    // ---- How to Play Modal ----
    function openHowTo() {
        howToPlayModal.classList.remove("hidden");
        howToPlayModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
    
    function closeHowTo() {
        howToPlayModal.classList.remove("active");
        setTimeout(() => howToPlayModal.classList.add("hidden"), 300);
        document.body.style.overflow = "";
    }

    if (howToPlayButton && howToPlayModal && closeHowToPlay && closeHowToPlayBtn) {
        howToPlayButton.addEventListener("click", openHowTo);
        closeHowToPlay.addEventListener("click", closeHowTo);
        closeHowToPlayBtn.addEventListener("click", closeHowTo);
        howToPlayModal.addEventListener("click", (e) => { if (e.target === howToPlayModal) closeHowTo(); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape" && howToPlayModal.classList.contains("active")) closeHowTo(); });
    }

    // --- Avatar selection and profile preview ---
    window.selectedAvatar = document.querySelector('.avatar-option.selected')?.getAttribute('data-avatar') || "😎";
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            window.selectedAvatar = this.getAttribute('data-avatar');
            updateProfilePreview();
            updateScoreUI();
        });
    });

    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        playerNameInput.addEventListener('input', () => { updateProfilePreview(); updateScoreUI(); });
    }

    function updateProfilePreview() {
        const name = playerNameInput.value.trim();
        const avatar = window.selectedAvatar || document.querySelector('.avatar-option.selected').getAttribute('data-avatar');
        const preview = document.getElementById('profilePreview');
        document.getElementById('profileAvatar').textContent = avatar;
        document.getElementById('profileName').textContent = name ? name : '';
        preview.classList.toggle('hidden', !name);
    }

    updateProfilePreview();
});
