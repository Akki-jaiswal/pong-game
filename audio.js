// audio.js - Updated with Volume Control

// Volume state management
let currentVolume = 0.7; // 70%
let isMuted = false;
let previousVolume = 0.7;

// Audio elements
export const paddleHitSound = new Audio("sounds/paddle_hit.mp3");
export const wallHitSound = new Audio("sounds/wall_hit.mp3");
export const scoreSound = new Audio("sounds/score.mp3");
export const gameOverSound = new Audio("sounds/game_over.mp3");
export const playerWinSound = new Audio("sounds/player_win.mp3");
export const countdownBeepSound = new Audio("sounds/countdown_beep.mp3");

// Background Music Tracks
export const backgroundMusicTracks = [
  new Audio("sounds/bg_music_1.mp3"),
  new Audio("sounds/bg_music_2.mp3"),
  new Audio("sounds/bg_music_3.mp3"),
];

let currentTrackIndex = 0;
let currentBackgroundMusic = null;

// Initialize all audio volumes
function initializeAudioVolumes() {
  paddleHitSound.volume = currentVolume;
  wallHitSound.volume = currentVolume;
  scoreSound.volume = currentVolume;
  gameOverSound.volume = currentVolume;
  playerWinSound.volume = currentVolume;
  countdownBeepSound.volume = currentVolume;

  backgroundMusicTracks.forEach((track) => {
    track.volume = currentVolume;
  });
}

// Initialize volumes on load
initializeAudioVolumes();

// Volume control functions
export function setGlobalVolume(volumePercent) {
  currentVolume = volumePercent / 100;

  if (!isMuted) {
    updateAllAudioVolumes();
  }
}

export function toggleMute() {
  isMuted = !isMuted;

  if (isMuted) {
    previousVolume = currentVolume;
    updateAllAudioVolumes(0);
  } else {
    currentVolume = previousVolume;
    updateAllAudioVolumes();
  }

  return isMuted;
}

export function getCurrentVolume() {
  return Math.round(currentVolume * 100);
}

export function isMutedState() {
  return isMuted;
}

function updateAllAudioVolumes(volume = null) {
  const vol = volume !== null ? volume : currentVolume;

  // Update sound effects
  paddleHitSound.volume = vol;
  wallHitSound.volume = vol;
  scoreSound.volume = vol;
  gameOverSound.volume = vol;
  playerWinSound.volume = vol;
  countdownBeepSound.volume = vol;

  // Update background music tracks
  backgroundMusicTracks.forEach((track) => {
    track.volume = vol;
  });

  // Update currently playing background music
  if (currentBackgroundMusic) {
    currentBackgroundMusic.volume = vol;
  }
}

// Function to play a sound effect
export function playSound(audioElement) {
  if (isMuted || currentVolume === 0) return;

  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch((e) => {});
  }
}

// Function to start the background music rotation
export function startBackgroundMusicRotation() {
  if (isMuted || currentVolume === 0) return;

  if (currentBackgroundMusic && !currentBackgroundMusic.paused) {
    return;
  }

  if (currentBackgroundMusic) {
    currentBackgroundMusic.pause();
    currentBackgroundMusic.currentTime = 0;
  }

  currentBackgroundMusic = backgroundMusicTracks[currentTrackIndex];
  currentBackgroundMusic.loop = true;
  currentBackgroundMusic.volume = currentVolume; // Ensure correct volume

  currentBackgroundMusic
    .play()
    .then(() => {})
    .catch((e) => {});

  currentTrackIndex = (currentTrackIndex + 1) % backgroundMusicTracks.length;
}

// Function to stop background music
export function stopBackgroundMusicRotation() {
  if (currentBackgroundMusic) {
    currentBackgroundMusic.pause();
    currentBackgroundMusic.currentTime = 0;
  }
}

// Volume Control UI Setup
export function initializeVolumeControls() {
  const volumeSlider = document.getElementById("volumeSlider");
  const muteButton = document.getElementById("muteButton");
  const volumeLabel = document.getElementById("volumeLabel");

  if (!volumeSlider || !muteButton || !volumeLabel) {
    console.warn("Volume control elements not found in DOM");
    return;
  }

  // Set initial values
  volumeSlider.value = getCurrentVolume();
  volumeLabel.textContent = getCurrentVolume();
  updateMuteButtonDisplay(muteButton, isMuted);

  // Volume slider event listener
  volumeSlider.addEventListener("input", (e) => {
    const volume = parseInt(e.target.value);
    setGlobalVolume(volume);
    volumeLabel.textContent = volume;

    // Update mute state based on volume
    if (volume === 0 && !isMuted) {
      isMuted = true;
      updateMuteButtonDisplay(muteButton, true);
    } else if (volume > 0 && isMuted) {
      isMuted = false;
      updateMuteButtonDisplay(muteButton, false);
    }
  });

  // Mute button event listener
  muteButton.addEventListener("click", () => {
    const nowMuted = toggleMute();
    updateMuteButtonDisplay(muteButton, nowMuted);

    // Update slider and label
    if (nowMuted) {
      volumeSlider.value = 0;
      volumeLabel.textContent = "0";
    } else {
      const volume = getCurrentVolume();
      volumeSlider.value = volume;
      volumeLabel.textContent = volume;
    }
  });
}

function updateMuteButtonDisplay(button, muted) {
  if (muted) {
    button.textContent = "🔇";
    button.classList.add("muted");
    button.title = "Unmute";
  } else {
    button.textContent = "🔊";
    button.classList.remove("muted");
    button.title = "Mute";
  }
}
