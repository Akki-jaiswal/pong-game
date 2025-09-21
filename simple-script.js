// Simple working Pong Game
window.addEventListener("DOMContentLoaded", () => {
    // DOM refs
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const backgroundCanvas = document.getElementById("backgroundCanvas");
    const bgCtx = backgroundCanvas.getContext("2d");
    const effectsCanvas = document.getElementById("effectsCanvas");
    const effectsCtx = effectsCanvas.getContext("2d");

    const welcomeScreen = document.getElementById("welcomeScreen");
    const startGameButton = document.getElementById("startGameButton");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const gameOverMessage = document.getElementById("gameOverMessage");
    const playAgainButton = document.getElementById("playAgainButton");
    const exitButton = document.getElementById("exitButton");

    const pauseButton = document.getElementById("pauseButton");
    const restartButton = document.getElementById("restartButton");
    const difficultySelect = document.getElementById("difficulty");
    const gameModeSelect = document.getElementById("gameModeWelcome");
    const ballSkinSelect = document.getElementById("ballSkinWelcome");
    const themeSelector = document.getElementById("themeSelector");

    // Game state
    let gameRunning = false;
    let paused = false;
    let playerScore = 0;
    let aiScore = 0;
    let difficulty = "medium";
    let gameMode = "single";
    let ballSkin = "classic";
    let playerName = "";
    let player2Name = "Player 2";
    let survivalTime = 0;

    // Objects
    const paddleWidth = 10;
    const paddleHeight = 80;

    const player = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 6, width: paddleWidth, height: paddleHeight };
    const player2 = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, dy: 6, width: paddleWidth, height: paddleHeight };
    const ai = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, dy: 5, width: paddleWidth, height: paddleHeight };

    const ball = { x: canvas.width / 2, y: canvas.height / 2, r: 8, dx: 4, dy: 4, trail: [], skin: "classic" };
    const balls = [ball];

    const powerUps = [];
    const particles = [];
    let backgroundOffset = 0;

    const speeds = { easy: 3, medium: 5, hard: 7 };

    // Power-up System
    class PowerUp {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.width = 20;
            this.height = 20;
        }

        draw() {
            ctx.fillStyle = this.getColor();
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.getSymbol(), this.x + this.width/2, this.y + this.height/2 + 4);
        }

        getColor() {
            switch(this.type) {
                case "speed": return "#ff4444";
                case "size": return "#44ff44";
                case "multiball": return "#4444ff";
                case "slowmo": return "#ffff44";
                default: return "#ffffff";
            }
        }

        getSymbol() {
            switch(this.type) {
                case "speed": return "⚡";
                case "size": return "📏";
                case "multiball": return "⚪";
                case "slowmo": return "🐌";
                default: return "?";
            }
        }

        checkCollision(ball) {
            return ball.x + ball.r > this.x && 
                   ball.x - ball.r < this.x + this.width &&
                   ball.y + ball.r > this.y && 
                   ball.y - ball.r < this.y + this.height;
        }
    }

    // Particle System
    class Particle {
        constructor(x, y, vx, vy, color, life) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.size = Math.random() * 3 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            this.vx *= 0.98;
            this.vy *= 0.98;
        }

        draw() {
            const alpha = this.life / this.maxLife;
            effectsCtx.save();
            effectsCtx.globalAlpha = alpha;
            effectsCtx.fillStyle = this.color;
            effectsCtx.beginPath();
            effectsCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            effectsCtx.fill();
            effectsCtx.restore();
        }

        isDead() {
            return this.life <= 0;
        }
    }

    // Ball Skins
    function drawBall(ball) {
        ctx.save();
        
        switch(ball.skin) {
            case "neon":
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 20;
                ctx.fillStyle = "#00ffff";
                break;
            case "fire":
                ctx.shadowColor = "#ff4400";
                ctx.shadowBlur = 15;
                ctx.fillStyle = "#ff4400";
                break;
            case "ice":
                ctx.shadowColor = "#aaffff";
                ctx.shadowBlur = 10;
                ctx.fillStyle = "#aaffff";
                break;
            default:
                ctx.fillStyle = "white";
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw trail
        if (ball.trail.length > 1) {
            ctx.save();
            ctx.strokeStyle = ball.skin === "fire" ? "#ff4400" : ball.skin === "ice" ? "#aaffff" : "#ffffff";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
            for (let i = 1; i < ball.trail.length; i++) {
                ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    // Background Animation
    function drawBackground() {
        bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        backgroundOffset += 0.5;
        
        bgCtx.strokeStyle = "rgba(76, 201, 240, 0.1)";
        bgCtx.lineWidth = 1;
        
        for (let i = 0; i < 10; i++) {
            const y = (i * 50 + backgroundOffset) % backgroundCanvas.height;
            bgCtx.beginPath();
            bgCtx.moveTo(0, y);
            bgCtx.lineTo(backgroundCanvas.width, y);
            bgCtx.stroke();
        }
    }

    // Screen Shake
    function screenShake() {
        document.querySelector('.game-area').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.game-area').classList.remove('shake');
        }, 300);
    }

    // Power-up Functions
    function spawnPowerUp() {
        if (Math.random() < 0.003 && powerUps.length < 2) {
            const types = ["speed", "size", "multiball", "slowmo"];
            const type = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * (canvas.width - 40) + 20;
            const y = Math.random() * (canvas.height - 40) + 20;
            powerUps.push(new PowerUp(x, y, type));
        }
    }

    function activatePowerUp(type) {
        switch(type) {
            case "speed":
                balls.forEach(ball => {
                    ball.dx *= 1.5;
                    ball.dy *= 1.5;
                });
                setTimeout(() => {
                    balls.forEach(ball => {
                        ball.dx /= 1.5;
                        ball.dy /= 1.5;
                    });
                }, 5000);
                break;
            case "size":
                player.height *= 1.5;
                setTimeout(() => player.height = paddleHeight, 5000);
                break;
            case "multiball":
                for (let i = 0; i < 2; i++) {
                    const newBall = {
                        x: canvas.width / 2,
                        y: canvas.height / 2,
                        r: 8,
                        dx: (Math.random() - 0.5) * 8,
                        dy: (Math.random() - 0.5) * 8,
                        trail: [],
                        skin: ballSkin
                    };
                    balls.push(newBall);
                }
                break;
            case "slowmo":
                balls.forEach(ball => {
                    ball.dx *= 0.5;
                    ball.dy *= 0.5;
                });
                setTimeout(() => {
                    balls.forEach(ball => {
                        ball.dx *= 2;
                        ball.dy *= 2;
                    });
                }, 3000);
                break;
        }
    }

    // Particle Effects
    function createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const vx = (Math.random() - 0.5) * 10;
            const vy = (Math.random() - 0.5) * 10;
            particles.push(new Particle(x, y, vx, vy, color, 30));
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }
    }

    function drawParticles() {
        particles.forEach(particle => particle.draw());
    }

    // Theme functionality
    function applyTheme(themeName) {
        document.body.classList.remove("theme-neon-retro", "theme-dark-mode", "theme-ocean-blue");
        if (themeName !== "default") {
            document.body.classList.add(`theme-${themeName}`);
        }
    }
    
    if (themeSelector) {
        themeSelector.addEventListener("change", (e) => {
            applyTheme(e.target.value);
        });
        applyTheme(themeSelector.value);
    }

    // Helpers
    function updateScoreUI() {
        const displayName = playerName || "Player";
        const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
        const displayName2 = is2PlayerMode ? player2Name : "AI";
        
        document.getElementById('scorePlayerName').textContent = displayName;
        document.getElementById('scorePlayerAvatar').textContent = window.selectedAvatar || "😎";
        document.getElementById('playerScore').textContent = playerScore;
        
        const aiNameElement = document.getElementById('scoreAIName');
        const aiAvatarElement = document.getElementById('scoreAIAvatar');
        if (aiNameElement) aiNameElement.textContent = displayName2;
        if (aiAvatarElement) {
            aiAvatarElement.textContent = is2PlayerMode ? (window.selectedAvatar2 || "🤖") : "🤖";
        }
        document.getElementById('aiScore').textContent = aiScore;
        
        if (gameMode.includes("survival")) {
            document.getElementById('scorePlayerName').textContent = `${displayName} (${Math.floor(survivalTime/60)}s)`;
        }
    }

    function resetBall(ball) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
        ball.dy = (Math.random() * 2 - 1) * 4;
        ball.trail = [];
    }

    function centerPaddles() {
        player.y = canvas.height / 2 - player.height / 2;
        const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
        if (is2PlayerMode) {
            player2.y = canvas.height / 2 - player2.height / 2;
        } else {
            ai.y = canvas.height / 2 - ai.height / 2;
        }
    }

    // Draw
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

        drawBackground();

        // Net
        ctx.fillStyle = "#4cc9f0";
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.fillRect(canvas.width / 2 - 1, i, 2, 10);
        }

        // Paddles
        ctx.fillStyle = "#4cc9f0";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
        if (is2PlayerMode) {
            ctx.fillStyle = "#f72585";
            ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
        } else {
            ctx.fillStyle = "#f72585";
            ctx.fillRect(ai.x, ai.y, ai.width, ai.height);
        }

        // Balls with trails
        balls.forEach(ball => {
            ball.trail.push({x: ball.x, y: ball.y});
            if (ball.trail.length > 10) ball.trail.shift();
            drawBall(ball);
        });

        // Power-ups
        powerUps.forEach(powerUp => powerUp.draw());

        // Particles
        drawParticles();

        // Canvas score
        ctx.font = "16px Arial";
        ctx.fillStyle = "#4cc9f0";
        const displayName = playerName || "Player";
        ctx.fillText(`${displayName}: ${playerScore}`, 50, 30);
        
        ctx.fillStyle = "#f72585";
        const opponent = is2PlayerMode ? player2Name : "AI";
        ctx.fillText(`${opponent}: ${aiScore}`, canvas.width - 150, 30);

        if (gameMode.includes("survival")) {
            ctx.fillStyle = "#ffff00";
            ctx.fillText(`Time: ${Math.floor(survivalTime/60)}s`, canvas.width/2 - 30, 30);
        }
    }

    // Update
    function update() {
        if (gameMode.includes("survival")) {
            survivalTime++;
        }

        spawnPowerUp();
        updateParticles();

        balls.forEach((ball, ballIndex) => {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Bounce top/bottom
            if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
                ball.dy *= -1;
                createExplosion(ball.x, ball.y, "#ffffff");
            }

            // Player collision
            if (ball.x - ball.r <= player.x + player.width &&
                ball.y >= player.y &&
                ball.y <= player.y + player.height &&
                ball.dx < 0) {
                ball.dx *= -1;
                const collidePoint = ball.y - (player.y + player.height / 2);
                ball.dy = collidePoint * 0.15;
                createExplosion(ball.x, ball.y, "#4cc9f0");
                screenShake();
            }

            // AI/Player2 collision
            const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
            const opponent = is2PlayerMode ? player2 : ai;
            if (ball.x + ball.r >= opponent.x &&
                ball.y >= opponent.y &&
                ball.y <= opponent.y + opponent.height &&
                ball.dx > 0) {
                ball.dx *= -1;
                const collidePoint = ball.y - (opponent.y + opponent.height / 2);
                ball.dy = collidePoint * 0.15;
                createExplosion(ball.x, ball.y, "#f72585");
                screenShake();
            }

            // Check power-up collisions
            powerUps.forEach((powerUp, index) => {
                if (powerUp.checkCollision(ball)) {
                    activatePowerUp(powerUp.type);
                    powerUps.splice(index, 1);
                    createExplosion(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.getColor());
                }
            });

            // Score
            if (ball.x + ball.r < 0) {
                if (gameMode.includes("survival")) {
                    endGame();
                    return;
                }
                aiScore++;
                updateScoreUI();
                resetBall(ball);
                createExplosion(50, canvas.height/2, "#f72585");
            } else if (ball.x - ball.r > canvas.width) {
                playerScore++;
                updateScoreUI();
                resetBall(ball);
                createExplosion(canvas.width - 50, canvas.height/2, "#4cc9f0");
            }
        });

        // AI movement
        const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
        if (!is2PlayerMode) {
            const aiCenter = ai.y + ai.height / 2;
            const targetBall = balls[0];
            if (targetBall.y < aiCenter) ai.y -= speeds[difficulty];
            else if (targetBall.y > aiCenter) ai.y += speeds[difficulty];
        }

        // Bound paddles
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        if (is2PlayerMode) {
            player2.y = Math.max(0, Math.min(canvas.height - player2.height, player2.y));
        } else {
            ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
        }

        // Game over conditions
        if (!gameMode.includes("survival") && (playerScore >= 3 || aiScore >= 3) && Math.abs(playerScore - aiScore) >= 2) {
            endGame();
        }
    }

    // Loop
    function loop() {
        if (gameRunning && !paused) {
            update();
            draw();
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Controls
    const keys = { up: false, down: false, w: false, s: false };
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") keys.up = true;
        if (e.key === "ArrowDown") keys.down = true;
        if (e.key === "w" || e.key === "W") keys.w = true;
        if (e.key === "s" || e.key === "S") keys.s = true;
        
        if (e.key === " " && gameRunning) {
            paused = !paused;
            if (pauseButton) pauseButton.textContent = paused ? "Resume" : "Pause";
        }
    });
    
    document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowUp") keys.up = false;
        if (e.key === "ArrowDown") keys.down = false;
        if (e.key === "w" || e.key === "W") keys.w = false;
        if (e.key === "s" || e.key === "S") keys.s = false;
    });

    (function applyKeyboardMotion() {
        if (gameRunning && !paused) {
            if (keys.up) player.y -= player.dy;
            if (keys.down) player.y += player.dy;
            
            const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
            if (is2PlayerMode) {
                if (keys.w) player2.y -= player2.dy;
                if (keys.s) player2.y += player2.dy;
            }
        }
        requestAnimationFrame(applyKeyboardMotion);
    })();

    // Mouse controls
    if (canvas) {
        canvas.addEventListener("mousemove", (evt) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = evt.clientY - rect.top;
            player.y = mouseY - player.height / 2;
        });
    }

    // UI Event Handlers
    function startGame() {
        gameMode = gameModeSelect ? gameModeSelect.value : "single";
        const is2PlayerMode = gameMode === "local2p" || gameMode === "tournament-2p" || gameMode === "survival-2p";
        
        playerName = document.getElementById("playerNameInput").value.trim();
        if (!playerName) {
            alert("Please enter Player 1 name");
            return;
        }
        
        if (is2PlayerMode) {
            player2Name = document.getElementById("player2NameInput").value.trim();
            if (!player2Name) {
                alert("Please enter Player 2 name");
                return;
            }
        }
        
        ballSkin = ballSkinSelect ? ballSkinSelect.value : "classic";
        balls.forEach(ball => ball.skin = ballSkin);
        
        gameRunning = true;
        paused = false;
        if (pauseButton) pauseButton.textContent = "Pause";
        playerScore = 0;
        aiScore = 0;
        survivalTime = 0;
        
        updateScoreUI();
        centerPaddles();
        
        if (welcomeScreen) welcomeScreen.style.display = "none";
        if (gameOverScreen) gameOverScreen.style.display = "none";
        const preview = document.getElementById('profilePreview');
        if (preview) preview.classList.add('hidden');
    }

    function endGame() {
        gameRunning = false;
        
        const displayName = playerName || "Player";
        let message = "";
        
        if (gameMode.includes("survival")) {
            message = `🏆 ${displayName} survived ${Math.floor(survivalTime/60)} seconds!`;
        } else {
            message = playerScore > aiScore ? `🎉 ${displayName} Wins!` : "😢 AI Wins!";
        }
        
        if (gameOverMessage) gameOverMessage.textContent = message;
        if (gameOverScreen) gameOverScreen.style.display = "flex";
    }

    // Event listeners
    if (startGameButton) {
        startGameButton.addEventListener("click", startGame);
    }
    
    if (playAgainButton) {
        playAgainButton.addEventListener("click", () => {
            if (gameOverScreen) gameOverScreen.style.display = "none";
            if (welcomeScreen) welcomeScreen.style.display = "flex";
        });
    }
    
    if (exitButton) {
        exitButton.addEventListener("click", () => {
            if (gameOverScreen) gameOverScreen.style.display = "none";
            if (welcomeScreen) welcomeScreen.style.display = "flex";
        });
    }

    if (pauseButton) {
        pauseButton.addEventListener("click", () => {
            if (!gameRunning) return;
            paused = !paused;
            pauseButton.textContent = paused ? "Resume" : "Pause";
        });
    }

    if (restartButton) {
        restartButton.addEventListener("click", () => {
            gameRunning = true;
            paused = false;
            if (pauseButton) pauseButton.textContent = "Pause";
            playerScore = 0;
            aiScore = 0;
            updateScoreUI();
            centerPaddles();
            if (gameOverScreen) gameOverScreen.style.display = "none";
        });
    }

    if (difficultySelect) {
        difficultySelect.addEventListener("change", (e) => {
            difficulty = e.target.value;
        });
    }

    // Game mode change handler
    if (gameModeSelect) {
        gameModeSelect.addEventListener('change', function() {
            const player2Setup = document.getElementById('player2Setup');
            const is2Player = this.value === 'local2p' || this.value === 'tournament-2p' || this.value === 'survival-2p';
            
            if (is2Player) {
                if (player2Setup) player2Setup.classList.remove('hidden');
            } else {
                if (player2Setup) player2Setup.classList.add('hidden');
            }
        });
    }

    // Avatar selection
    window.selectedAvatar = "😎";
    window.selectedAvatar2 = "🤖";
    
    const avatarOptions = document.querySelectorAll('.avatar-option');
    if (avatarOptions.length > 0) {
        avatarOptions.forEach(option => {
            option.addEventListener('click', function() {
                const player = this.getAttribute('data-player');
                const playerOptions = document.querySelectorAll(`[data-player="${player}"]`);
                
                playerOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                
                if (player === '1') {
                    window.selectedAvatar = this.getAttribute('data-avatar');
                } else {
                    window.selectedAvatar2 = this.getAttribute('data-avatar');
                }
                updateScoreUI();
            });
        });
    }

    // How to Play Modal
    const howToPlayButton = document.getElementById("howToPlayButton");
    const howToPlayModal = document.getElementById("howToPlayModal");
    const closeHowToPlayBtn = document.getElementById("closeHowToPlayBtn");

    function openHowTo() {
        if (howToPlayModal) {
            howToPlayModal.classList.remove("hidden");
            howToPlayModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    }
    
    function closeHowTo() {
        if (howToPlayModal) {
            howToPlayModal.classList.remove("active");
            setTimeout(() => {
                howToPlayModal.classList.add("hidden");
            }, 300);
            document.body.style.overflow = "";
        }
    }

    if (howToPlayButton) {
        howToPlayButton.addEventListener("click", openHowTo);
    }
    
    if (closeHowToPlayBtn) {
        closeHowToPlayBtn.addEventListener("click", closeHowTo);
    }
    
    if (howToPlayModal) {
        howToPlayModal.addEventListener("click", (e) => {
            if (e.target === howToPlayModal) closeHowTo();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && howToPlayModal && howToPlayModal.classList.contains("active")) {
            closeHowTo();
        }
    });
});