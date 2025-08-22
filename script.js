window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // --- Game variables ---
    let gameRunning = false;
    let paused = false;
    let playerScore = 0;
    let aiScore = 0;
    let difficulty = "medium";
    let playerName = "Player";

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
        ctx.fillText(`${playerName}: ${playerScore}`, 50, 30);
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
        requestAnimationFrame(gameLoop);
    }

    // --- Start Game ---
    function startGame() {
        playerName = document.getElementById("playerNameInput").value.trim() || "Player";
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
        const gameOverScreen = document.getElementById("gameOverScreen");
        const gameOverMessage = document.getElementById("gameOverMessage");
        const finalPlayerScore = document.getElementById("finalPlayerScore");
        const finalAiScore = document.getElementById("finalAiScore");
        const isPlayerWin = playerScore > aiScore;
        gameOverMessage.textContent = isPlayerWin ? `🎉 ${playerName} Wins!` : "😢 AI Wins!";
        finalPlayerScore.textContent = `${playerName}: ${playerScore}`;
        finalAiScore.textContent = aiScore;
        gameOverScreen.style.display = "flex"; // Changed to flex for centering
        if (isPlayerWin) {
            launchConfetti();
        }
    }

    // --- Confetti for player win ---
    function launchConfetti() {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff']; // Theme-able colors
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
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