// audio.js

// Sound state management
let soundEnabled = true;

export const paddleHitSound = new Audio('sounds/paddle_hit.mp3');
export const wallHitSound = new Audio('sounds/wall_hit.mp3');
export const scoreSound = new Audio('sounds/score.mp3');
export const gameOverSound = new Audio('sounds/game_over.mp3');
export const playerWinSound = new Audio('sounds/player_win.mp3');
export const countdownBeepSound = new Audio('sounds/countdown_beep.mp3');

// Background Music Tracks - ensure paths are correct
export const backgroundMusicTracks = [
    new Audio('sounds/bg_music_1.mp3'),
    new Audio('sounds/bg_music_2.mp3'),
    new Audio('sounds/bg_music_3.mp3')
];

let currentTrackIndex = 0;
let currentBackgroundMusic = null;

// Function to play a sound effect
export function playSound(audioElement) {
    if (audioElement && soundEnabled) {
        audioElement.currentTime = 0; // Rewind to start
        audioElement.play().catch(e => { /* Silently fail or handle errors without console.warn */ });
    }
}

// Function to toggle sound on/off
export function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

// Function to get current sound state
export function isSoundEnabled() {
    return soundEnabled;
}

// Function to set sound state
export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
}

// Function to start the background music rotation
export function startBackgroundMusicRotation() {
    // If sound is disabled, don't start music
    if (!soundEnabled) {
        return;
    }
    
    // If music is already playing or about to play, do nothing
    if (currentBackgroundMusic && !currentBackgroundMusic.paused) {
        return;
    }

    // Stop any previously playing track before starting a new one
    if (currentBackgroundMusic) {
        currentBackgroundMusic.pause();
        currentBackgroundMusic.currentTime = 0; // Rewind for next play
    }

    currentBackgroundMusic = backgroundMusicTracks[currentTrackIndex];
    currentBackgroundMusic.loop = true; // Loop the current track

    currentBackgroundMusic.play()
        .then(() => {
            // No console.log
        })
        .catch(e => {
            // Silently fail or handle errors without console.warn
        });

    currentTrackIndex = (currentTrackIndex + 1) % backgroundMusicTracks.length; // Move to next track for next time
}

// Function to stop background music
export function stopBackgroundMusicRotation() {
    if (currentBackgroundMusic) {
        currentBackgroundMusic.pause();
        currentBackgroundMusic.currentTime = 0; // Reset for next play
        // No console.log
    }
}