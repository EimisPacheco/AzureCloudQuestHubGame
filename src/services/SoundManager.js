class SoundManager {
  constructor() {
    // Use environment variable for bucket URL if available
    const AZURE_BUCKET_URL = process.env.REACT_APP_AZURE_BUCKET_URL || '';
    
    this.sounds = {
      correct: new Audio(`${AZURE_BUCKET_URL}/games/sounds/correct_sound.mp3`),
      incorrect: new Audio(`${AZURE_BUCKET_URL}/games/sounds/incorrect_sound.mp3`),
      hover: new Audio(`${AZURE_BUCKET_URL}/games/sounds/hover.mp3`),
      select: new Audio(`${AZURE_BUCKET_URL}/games/sounds/pistol_sound.mp3`),
      achievement: new Audio(`${AZURE_BUCKET_URL}/games/sounds/levelup.mp3`)
    };
    
    this.enabled = true;
  }

  play(soundName) {
    if (this.enabled && this.sounds[soundName]) {
      try {
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].volume = 0.3; // Set volume like in GameCanvas
        this.sounds[soundName].play().catch(err => {
          console.warn(`Error playing sound ${soundName}:`, err);
        });
      } catch (err) {
        console.warn(`Error with sound ${soundName}:`, err);
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}

export const soundManager = new SoundManager(); 