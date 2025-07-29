// audio.js
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
    //new Audio('sounds/bg_music_3.mp3'),
];

//The background music for the welcome screen is chosen as the bg_music_3.mp3
export const welcomeMusic = new Audio('sounds/bg_music_3.mp3');

let currentTrackIndex = 0; // This will now only cycle through backgroundMusicTracks (0 and 1)
export let currentBackgroundMusic = null;  //stores the current playing track

//Setting all tracks to muted by default
backgroundMusicTracks.forEach(track => {
    track.muted = true; // <--- ADD THIS LINE
});
welcomeMusic.muted= true;

// Function to play a sound effect
export function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0; // Rewind to start
        audioElement.play().catch(e => { /* Silently fail or handle errors without console.warn */ });
    }
}

// Function to start the background music rotation
export function startBackgroundMusicRotation() {
    // If music is already playing or about to play, do nothing
    if (currentBackgroundMusic && !currentBackgroundMusic.paused) {
        return;
    }

    //Stop welcome Music if it is playing
    stopWelcomeMusic();

    currentBackgroundMusic = backgroundMusicTracks[currentTrackIndex];
    currentBackgroundMusic.loop = true; // Loop the current track
    currentBackgroundMusic.muted = false; // Ensure it's unmuted for playing

    currentBackgroundMusic.play()
        .then(() => {
            // Music is playing muted
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
        currentBackgroundMusic.muted = true; // Ensuring it's muted when stopped
        currentBackgroundMusic = null; // Clearing the reference
        // No console.log
    }
}

//--Dedicated welcome Music Controls /---
export function playWelcomeMusic() {
    // Stop any other background music that might be playing (gameplay music)
    stopBackgroundMusicRotation();

    if (welcomeMusic) {
        welcomeMusic.loop = true;
        welcomeMusic.currentTime = 0;
        welcomeMusic.muted = false; // Unmute to play
        welcomeMusic.play().catch(e => {
            console.warn("Welcome music autoplay failed:", e);
            welcomeMusic.muted = true; // Keep muted if autoplay fails
        });
    }
}

export function stopWelcomeMusic() {
    if (welcomeMusic && !welcomeMusic.paused) {
        welcomeMusic.pause();
        welcomeMusic.currentTime = 0; // Rewind to start
        welcomeMusic.muted = true; // Mute it when paused
    }
}