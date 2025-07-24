# 🎾 Classic Pong Game with Modern Touches 🚀

Relive the nostalgia of a retro classic! This project is a straightforward yet engaging implementation of the iconic Pong game, built using core web technologies: HTML, CSS, and JavaScript. It features an AI opponent, adjustable difficulty, interactive elements, full responsiveness, and touch controls to provide a fun and familiar experience for all players.

## ✨ Key Features

| Feature                             | Description                                                                                   |
|-------------------------------------|-----------------------------------------------------------------------------------------------|
| **Player vs. AI**                  | Challenge a computer-controlled opponent that adapts to different skill levels.              |
| **Adjustable Difficulty**          | Choose between `Easy`, `Medium`, or `Hard` modes to control AI responsiveness and ball speed.|
| **Interactive Screens**            | Welcome screen for player name and a "Play Again" game over screen.                         |
| **Pause & Resume**                 | Pause/resume gameplay anytime easily.                                                        |
| **Score Tracking**                 | Real-time score tracking for both player and AI.                                             |
| **Countdown System**               | A "3-2-1-GO!" countdown before each round.                                                    |
| **Sound & Music**                  | Distinct sound effects and background music for an immersive experience.                     |
| **Fully Responsive**               | Optimized for desktops and mobile devices.                                                    |
| **Touch Controls**                 | Touch-and-drag controls for smooth mobile gameplay.                                           |
| **Browser-Based**                  | No installation required — play directly in your web browser.                                |


## 🕹️ How to Play


1.  **Start Your Game:**
    * (Optional) Enter your name on the welcome screen.
    * Click the "Play Game" button to begin your match.

2.  **Control Your Paddle:**
    * **Desktop:** Move your **mouse cursor** up and down to control your paddle.
    * **Mobile:** **Tap and drag** anywhere on the canvas (game area) to move your paddle.

3.  **Pause & Resume:**
    * Click the "Pause" button (which will change to "Resume") to take a break or continue.

4.  **Change Difficulty:**
    * Select your preferred difficulty from the dropdown menu (`Easy`, `Medium`, `Hard`) at any time.

5.  **Play Again:**
    * After a game concludes, click "Play Again" on the game over screen to start a new match.
  

## 🚀 Live Demo

Ready to play? Click the link below to launch the game directly in your browser:

[**Play Classic Pong Game Here!**](https://Akki-jaiswal.github.io/pong-game/)


### 🛠️ Technologies Used

| Technology          | Description                                                                                      |
|---------------------|--------------------------------------------------------------------------------------------------|
| **HTML5** | Provides the foundational structure for the game and content.                                    |
| **CSS3** | Styles the game elements, user interface, and ensures responsiveness across devices.              |
| **JavaScript (ES6+)** | Implements all the game logic, animations, AI behavior, audio handling, and dynamic UI updates. |


## ⚙️ Local Setup and Development

To run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone git clone https://github.com/Akki-jaiswal/pong-game.git

    ```
2.  **Navigate to the project directory:**
    ```bash
    cd pong-game
    ```
3.  **Serve with a local web server (Recommended):**
    To ensure all features (especially module imports for JS and sound playback) work correctly, use a local web server like `http-server` or VS Code's Live Server extension.
    * **Using `http-server`:**
        ```bash
        npm install -g http-server # If you don't have it installed
        http-server # Run this command from within your 'pong-game' directory
        ```
    * Then open your browser to `http://localhost:8080` (or the address provided by `http-server`).


  ### 📁 Project Structure
```
PONG-GAME/
├── .vscode/
├── sounds/
│   ├── bg_music_1.mp3
│   ├── bg_music_2.mp3
│   ├── bg_music_3.mp3
│   ├── combo_hit.mp3
│   ├── countdown_beep.mp3
│   ├── game_over.mp3
│   ├── multiball.mp3
│   ├── music.mp3
│   ├── paddle_hit.mp3
│   ├── player_win.mp3
│   ├── powerup_activate.mp3
│   ├── powerup_collect.mp3
│   ├── score.mp3
│   └── wall_hit.mp3
├── audio.js
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── README.md
├── script.js
└── style.css

```
## 🤝 How to Contribute (GSSoC'25 Participants & Others!)

We welcome contributions from everyone! If you're participating in **GSSoC'25** or just want to help improve the game, here's how to get started:

* **Read our Contribution Guidelines:** For detailed steps on setting up, finding issues, and submitting Pull Requests, please see our [`CONTRIBUTING.md`](CONTRIBUTING.md) file.
* **Join our Community:** If you have questions, need help, or want to discuss ideas, join our Discord channel:
    ➡️ **[Join our Discord Server!](https://discord.gg/4m6JuQ8S)**


## 📜 License

This project is open-source and available under the MIT License. See the `LICENSE` file for more details.

## 🙏 Acknowledgements

* Inspired by the original Pong game for endless classic fun.
* Sound effects sourced from FreeSound.org, mixit.com. 