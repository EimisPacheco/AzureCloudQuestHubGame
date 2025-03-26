import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/GameCanvas.css';
import { AZURE_ICON_CATEGORIES, SERVICE_MAPPINGS } from '../services/IconResolver';
import CosmosDBService from '../services/CosmosDBService';
import PropTypes from 'prop-types';

// Add these constants from IconResolver.js
const AZURE_BUCKET_URL = process.env.REACT_APP_AZURE_BUCKET_URL;
const ICONS_BASE_PATH = process.env.REACT_APP_ICONS_BASE_PATH;
const AZURE_ROCKET_PATH = `${AZURE_BUCKET_URL}/games/rocket`;
const DEFAULT_ROCKET = `${AZURE_ROCKET_PATH}/rocket1.png`;
const FIREBALL_PATH = `${AZURE_BUCKET_URL}/games/bullet/fireball.png`;

// Add this at the top to log environment variables
console.log("Environment Variables:", {
  AZURE_BUCKET_URL,
  ICONS_BASE_PATH
});

const GameCanvas = ({ onScoreUpdate, onPlayerNameChange, onGameOver, leaderboard, fetchLeaderboard }) => {
  // First, declare all state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [selectedRocket, setSelectedRocket] = useState(() => {
    const savedRocket = localStorage.getItem('selectedRocket');
    return savedRocket || null;
  });
  const [showNameModal, setShowNameModal] = useState(true);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [playerName, setPlayerName] = useState(() => {
    const savedName = localStorage.getItem('playerName');
    return savedName || '';
  });
  const [rocketPosition, setRocketPosition] = useState({ x: 375, y: 550 });

  // Modify the instructions state initialization
  const [instructions] = useState(() => {
    const getRandomCategories = () => {
      const categories = Object.keys(AZURE_ICON_CATEGORIES);
      const shuffled = [...categories].sort(() => 0.5 - Math.random());
      // Get all categories instead of just one
      return shuffled.map(category => {
        const displayName = category.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        return {
          text: `Shoot the ${displayName} icons!`,
          category: AZURE_ICON_CATEGORIES[category],
          displayName: displayName
        };
      });
    };

    return getRandomCategories();
  });

  // Generate iconTypes based on the selected categories
  const [iconTypes] = useState(() => {
    return instructions.reduce((acc, instruction) => {
      const categoryServices = Object.entries(SERVICE_MAPPINGS)
        .filter(([_, path]) => path.includes(instruction.category))
        .map(([name, path]) => ({
          path: `${AZURE_BUCKET_URL}${ICONS_BASE_PATH}${path}`,
          name: name
        }));

      acc[instruction.category] = categoryServices;
      return acc;
    }, {});
  });

  // Then declare refs
  const gameLoopRef = useRef(null);
  const canvasRef = useRef(null);
  const iconsRef = useRef([]);
  const bulletsRef = useRef([]);
  const feedbacksRef = useRef([]);
  const rocketImage = useRef(new Image());
  const gameStateRef = useRef({
    iconsCount: 0,
    bulletsCount: 0,
    timeLeft: 60,
    score: 0,
    changingCategory: false
  });
  const fireballImage = new Image();
  fireballImage.src = FIREBALL_PATH;

  // Gun info
  const gunRef = useRef({
    x: 400 - 25,
    y: 900 - 100,
    width: 120,
    height: 120,
  });

  // Load rocket image
  useEffect(() => {
    if (selectedRocket) {
      rocketImage.current = new Image();
      rocketImage.current.onload = () => {
        console.log("Rocket image loaded successfully");
      };
      rocketImage.current.onerror = (e) => {
        console.error("Error loading rocket image:", e);
      };
      rocketImage.current.src = selectedRocket;
    }
  }, [selectedRocket]);

  // Function to get random X
  const getRandomX = () => {
    const canvas = canvasRef.current;
    return Math.floor(Math.random() * (canvas.width - 50));
  };

  // Add this state at the top with other states
  const [currentMission, setCurrentMission] = useState({
    category: '',
    displayName: '',
    targetIcons: [],
    text: ''
  });

  // Add a state for empty icons
  const [iconsEmpty, setIconsEmpty] = useState(false);

  // Single function to handle mission updates
  const updateGameMission = (isInitial = false) => {
    const categories = Object.keys(AZURE_ICON_CATEGORIES);
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    const selectedCategory = shuffled[0];
    const displayName = selectedCategory.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const newMission = {
      category: AZURE_ICON_CATEGORIES[selectedCategory],
      displayName: displayName,
      targetIcons: [],
      text: `Shoot the ${displayName} icons!`
    };

    // Play level up sound when changing category (except initial load)
    if (!isInitial) {
      playSound('achievement');
    }

    // Add logging here to see what we're looking for
    console.log('🔍 Looking for icons in category:', newMission.category);
    console.log('📂 Full SERVICE_MAPPINGS paths:', Object.entries(SERVICE_MAPPINGS)
      .filter(([_, path]) => path.includes(newMission.category))
      .map(([name, path]) => ({
        name,
        fullPath: `${AZURE_BUCKET_URL}${ICONS_BASE_PATH}${path}`,
        relativePath: path
      }))
    );

    const categoryIcons = Object.entries(SERVICE_MAPPINGS)
      .filter(([_, path]) => path.includes(newMission.category))
      .map(([name]) => name);
    
    if (categoryIcons.length === 0) {
      console.error('❌ No icons found for category:', newMission.category);
      console.error('🔍 Searched in SERVICE_MAPPINGS:', SERVICE_MAPPINGS);
      console.error('🎯 Looking for category path:', newMission.category);
      return;
    }

    while (newMission.targetIcons.length < 4) {
      const availableIcons = categoryIcons.filter(icon => 
        newMission.targetIcons.filter(target => target === icon).length < 2
      );
      
      if (availableIcons.length === 0) {
        newMission.targetIcons.push(newMission.targetIcons[0]);
      } else {
        const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];
        newMission.targetIcons.push(randomIcon);
      }
    }

    setCurrentMission(newMission);
    console.log(`\n${isInitial ? '🎮 INITIAL' : '🔄 CHANGING'} MISSION`);
    console.log(`Selected Category: ${newMission.displayName}`);
    console.log('Selected Target Icons:', newMission.targetIcons);
    
    generateNewIcons(newMission.category, newMission.targetIcons);
    if (!isInitial) {
      setIconsEmpty(false);
    }
  };

  // Add to rocket options to log rocket paths
  const rocketOptions = [
    { id: `${AZURE_ROCKET_PATH}/rocket1.png`, name: 'Modern Rocket' },
    { id: `${AZURE_ROCKET_PATH}/rocket2.png`, name: 'Power Rocket' },
    { id: `${AZURE_ROCKET_PATH}/rocket3.png`, name: 'Stealth Rocket' },
    { id: `${AZURE_ROCKET_PATH}/rocket4.png`, name: 'Classic Rocket' },
  ];

  // Log rocket paths when component loads
  useEffect(() => {
    console.log("Rocket paths:", rocketOptions.map(rocket => rocket.id));
    console.log("AZURE_ROCKET_PATH:", AZURE_ROCKET_PATH);
  }, []);

  // Modify handleRocketSelect to add better logging
  const handleRocketSelect = (rocketId) => {
    console.log("🚀 Rocket selected:", rocketId);
    setSelectedRocket(rocketId);
    localStorage.setItem('selectedRocket', rocketId);
    
    console.log("Setting rocket image source to:", rocketId);
    rocketImage.current.src = rocketId;
    
    // Debug any errors with image loading
    rocketImage.current.onerror = (e) => {
      console.error("❌ ERROR LOADING ROCKET IMAGE:", e);
      console.error("Failed URL:", rocketId);
    };
    
    setShowRocketModal(false);
    setGameStarted(true);
    setGameInitialized(true);
    
    console.log("Starting game mission...");
    try {
      updateGameMission(true);
    } catch (error) {
      console.error("❌ ERROR STARTING MISSION:", error);
    }
  };

  // Use effect for when icons reach bottom
  useEffect(() => {
    if (!iconsEmpty || !gameStarted || !timeLeft) return;
    updateGameMission(false);
  }, [iconsEmpty, gameStarted, timeLeft]);

  // Separate useEffect for game loop
  useEffect(() => {
    if (!gameInitialized || !canvasRef.current) return;

    console.log("Starting game loop");
    const gameLoopId = requestAnimationFrame(gameLoop);

    return () => {
      console.log("Cleaning up game loop");
      cancelAnimationFrame(gameLoopId);
    };
  }, [gameInitialized]);

  // Separate useEffect for initial mission
  useEffect(() => {
    if (!gameInitialized || !currentMission.category) return;

    console.log("Setting up initial mission");
    generateNewIcons(currentMission.category, currentMission.targetIcons);
  }, [gameInitialized, currentMission.category]);

  // Show feedback
  const showFeedback = (x, y, isCorrect, points, iconName) => {
    feedbacksRef.current.push({
      x,
      y,
      isCorrect,
      points,
      name: iconName,
      time: Date.now(),
    });
  };

  // Check collisions and update score
  const checkCollisions = () => {
    const bullets = bulletsRef.current;
    const icons = iconsRef.current;
    const canvas = canvasRef.current;

    icons.forEach((icon, iconIndex) => {
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        if (
          bullet.x > icon.x &&
          bullet.x < icon.x + 50 &&
          bullet.y > icon.y &&
          bullet.y < icon.y + 50
        ) {
          icon.hit = true;

          // Check if this is a target icon
          const isCorrectIcon = icon.isTarget;

          if (isCorrectIcon) {
            const heightPercentage = 1 - (icon.y / canvas.height);
            const heightBonus = Math.floor(heightPercentage * 20);
            const points = 5 + heightBonus;
            
            setScore((prev) => {
              if (prev + points > Math.max(...leaderboard.map(s => s.score))) {
                showCheerleaderMessage('highScore');
              } else if (heightBonus > 15) {
                showCheerleaderMessage('goodShot');
              }
              return prev + points;
            });
            showFeedback(icon.x, icon.y, true, points, icon.name);
            playSound('correct');
            createExplosion(icon.x + 25, icon.y + 25, '#4CAF50');
          } else {
            setScore((prev) => prev - 5);
            showFeedback(icon.x, icon.y, false, -5, icon.name);
            playSound('incorrect');
          }

          icons.splice(iconIndex, 1);
          return false;
        }
        return true;
      });
    });
  };

  // The main game loop
  const gameLoop = () => {
    if (!gameStarted || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state ref silently
    gameStateRef.current = {
      iconsCount: iconsRef.current.length,
      bulletsCount: bulletsRef.current.length,
      timeLeft: timeLeft,
      score: score
    };

    if (gameStarted) {
      // Draw the rocket (gun)
      const { x: gunX, y: gunY, width, height } = gunRef.current;
      ctx.drawImage(rocketImage.current, gunX, gunY, width, height);

      // Draw icons
      iconsRef.current.forEach((icon) => {
        if (!icon.hit) {
          ctx.save();
          const radius = 10;
          const x = icon.x;
          const y = icon.y;
          const width = 50;
          const height = 50;
          
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
          ctx.clip();
          
          ctx.drawImage(icon.image, x, y, width, height);
          ctx.restore();
          
          icon.y += 0.7; 
        }
      });

      // Filter icons off-screen
      iconsRef.current = iconsRef.current.filter(icon => icon.y < canvas.height);

      // Check for empty icons and generate new category
      if (iconsRef.current.length === 0 && !iconsEmpty) {
        setIconsEmpty(true);
      }

      // Draw bullets
      bulletsRef.current.forEach((bullet) => {
        ctx.drawImage(fireballImage, bullet.x, bullet.y, 20, 20);
        bullet.y -= 5;
      });
      bulletsRef.current = bulletsRef.current.filter((b) => b.y > 0);

      // Draw feedback
      const now = Date.now();
      feedbacksRef.current = feedbacksRef.current.filter((feedback) => {
        const elapsed = now - feedback.time;
        if (elapsed < 3000) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = feedback.isCorrect ? '#4CAF50' : '#F44336';
          ctx.font = 'bold 28px Arial';

          // Points text
          const pointsText = feedback.points > 0 ? `+${feedback.points}` : `${feedback.points}`;
          ctx.fillText(pointsText, feedback.x + 10, feedback.y - 20);

          // Icon name
          ctx.font = '16px Arial';
          ctx.fillText(feedback.name, feedback.x + 60, feedback.y + 25);

          // Checkmark or X
          ctx.font = 'bold 55px Arial';
          ctx.fillText(feedback.isCorrect ? '✔' : '✘', feedback.x + 10, feedback.y + 30);

          ctx.shadowBlur = 0;
          return true;
        }
        return false;
      });

      checkCollisions();

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        if (particle.lifetime > 0 && particle.size > 0) {
          particle.update();
          particle.draw(ctx);
          return true;
        }
        return false;
      });
    }

    // Only request next frame if game is still running
    if (gameStarted && !gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  // Sounds
  const sounds = useRef({});
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Ensure sound files are defined correctly using AZURE_BUCKET_URL
  const soundFiles = {
    shoot: `${AZURE_BUCKET_URL}/games/sounds/pistol_sound.mp3`,
    correct: `${AZURE_BUCKET_URL}/games/sounds/correct_sound.mp3`,
    incorrect: `${AZURE_BUCKET_URL}/games/sounds/incorrect_sound.mp3`,
    hover: `${AZURE_BUCKET_URL}/games/sounds/hover.mp3`,
    achievement: `${AZURE_BUCKET_URL}/games/sounds/levelup.mp3`
  };

  const createSafeAudio = async (path) => {
    const audio = new Audio();
    return new Promise((resolve) => {
      audio.addEventListener('error', () => {
        console.warn(`Sound file not found: ${path}`);
        resolve(null);
      });
      audio.addEventListener('canplaythrough', () => {
        resolve(audio);
      });
      setTimeout(() => resolve(null), 2000);
      audio.src = path;
    });
  };

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      const soundPromises = Object.entries(soundFiles).map(async ([name, path]) => {
        try {
          const audio = await createSafeAudio(path);
          return [name, audio];
        } catch (error) {
          console.error(`Failed to load sound ${name}:`, error);
          return [name, null];
        }
      });

      try {
        const loadedSounds = await Promise.all(soundPromises);
        const soundsMap = Object.fromEntries(loadedSounds);
        sounds.current = soundsMap;
        
        const hasLoadedSounds = Object.values(soundsMap).some(sound => sound !== null);
        setSoundsLoaded(hasLoadedSounds);
        
        if (hasLoadedSounds) {
          console.log('🔊 Sounds loaded successfully');
        } else {
          console.warn('⚠️ No sounds could be loaded');
        }
      } catch (error) {
        console.error('Failed to load sounds:', error);
      }
    };

    loadSounds();
  }, [createSafeAudio]);

  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => {
    setIsMuted(!isMuted);
    Object.values(sounds.current).forEach(sound => {
      if (sound) {
        sound.muted = !sound.muted;
      }
    });
  };

  // Ensure playSound function is working
  const playSound = useCallback((soundName) => {
    const sound = sounds.current[soundName];
    if (sound && !isMuted) {
      try {
        sound.currentTime = 0;
        sound.volume = 0.3;
        sound.play().catch(err => {
          console.warn(`Error playing sound ${soundName}:`, err);
        });
      } catch (err) {
        console.warn(`Error with sound ${soundName}:`, err);
      }
    }
  }, [isMuted]);

  // Particles and timer
  const [gameOver, setGameOver] = useState(false);
  const particlesRef = useRef([]);
  const [gameOverHandled, setGameOverHandled] = useState(false);

  useEffect(() => {
    return () => {
      setGameStarted(false);
      setShowRocketModal(true);
    };
  }, []);

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = Math.random() * 3 + 2;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * 6 - 3;
      this.lifetime = 1;
      this.initialSize = this.size;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.lifetime -= 0.02;
      this.size = Math.max(0, this.initialSize * this.lifetime);
    }
    draw(ctx) {
      if (this.size <= 0) return;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.lifetime;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const createExplosion = (x, y, color) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push(new Particle(x, y, color));
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1 && !gameOverHandled) {
            clearInterval(timer);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, gameOver, gameStarted, gameOverHandled]);

  const handleGameOver = async () => {
    if (gameOverHandled) return;
    
    setGameOver(true);
    setGameOverHandled(true);

    // Clear the game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    // Only save score if we have a valid player name and score
    if (playerName && score > 0 && onGameOver) {
      try {
        await onGameOver(); // Let parent handle score saving
        // Fetch updated leaderboard after saving score
        if (fetchLeaderboard) {
          await fetchLeaderboard();
        }
      } catch (error) {
        console.error('Failed to save score:', error);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      let newX = e.clientX - rect.left - (gunRef.current.width / 2);
      newX = Math.max(-30, Math.min(newX, canvas.width - gunRef.current.width + 30));
      gunRef.current.x = newX;
    };

    const handleCanvasClick = () => {
      if (gameStarted && timeLeft > 0 && !gameOver) {
        playSound('shoot');
        bulletsRef.current.push({
          x: gunRef.current.x + gunRef.current.width / 2 - 10,
          y: gunRef.current.y - 20,
        });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gameStarted, timeLeft, gameOver, playSound]);

  useEffect(() => {
    localStorage.removeItem('playerName');
    localStorage.removeItem('selectedRocket');
  }, []);

  const [showRocketModal, setShowRocketModal] = useState(true);

  const cheerleaderMessages = {
    goodShot: [
      "Great shot! You're an Azure Pro! 🌟",
      "Amazing cloud skills! Keep it up! 🎯",
      "You're on fire in the cloud! 🔥",
      "That's how Azure experts do it! 👏",
    ],
    combo: [
      "Cloud combo! 🎮",
      "You're scaling infinitely! ⚡",
      "What an Azure streak! 🌈",
    ],
    timeWarning: [
      "30 seconds left - you're highly available! ⏰",
      "Time for the final deployment! 💪",
      "Make every compute unit count! ⭐",
    ],
    encouragement: [
      "You've got this, cloud warrior! 🚀",
      "Keep going! You're Azure certified material! ",
      "I believe in your cloud powers! 💫",
      "Show them your Azure expertise! 💪",
    ],
    highScore: [
      "New high score! You're going serverless! 🏆",
      "You're breaking cloud records! 🎖️",
      "Legendary Azure performance! 👑",
    ]
  };

  const [cheerMessage, setCheerMessage] = useState('');
  const [showCheerMessage, setShowCheerMessage] = useState(false);

  const showCheerleaderMessage = (category) => {
    if (!cheerleaderMessages[category]) {
      console.warn('Invalid cheerleader message category:', category);
      return;
    }
    
    const messages = cheerleaderMessages[category];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    console.log('Showing cheerleader message:', randomMessage); // Debug log
    setCheerMessage(randomMessage);
    setShowCheerMessage(true);
    
    // Clear the message after delay
    setTimeout(() => {
      setShowCheerMessage(false);
      setCheerMessage('');
    }, 3000);
  };

  useEffect(() => {
    const encouragementInterval = setInterval(() => {
      if (timeLeft > 0 && Math.random() < 0.3) {
        showCheerleaderMessage('encouragement');
      }
    }, 10000);
    return () => clearInterval(encouragementInterval);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 30) {
      showCheerleaderMessage('timeWarning');
    }
  }, [timeLeft]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (tempPlayerName.trim().length < 2) {
      setNameError('Name must be at least 2 characters long');
      return;
    }
    if (tempPlayerName.trim().length > 15) {
      setNameError('Name must be less than 15 characters');
      return;
    }
    const name = tempPlayerName.trim();
    setPlayerName(name);
    if (onPlayerNameChange) {
      onPlayerNameChange(name);
    }
    setShowNameModal(false);
    setShowRocketModal(true);
  };

  // Ensure generateNewIcons handles missing icons gracefully
  const generateNewIcons = (category, targetIcons) => {
    console.log('\n==== GENERATING NEW ICONS ====');
    console.log('Current Category:', category);
    console.log('Target Icons:', targetIcons);
    
    if (!targetIcons || targetIcons.length !== 4) {
      console.error('❌ Invalid target icons count:', targetIcons?.length);
      return;
    }
    
    iconsRef.current = [];
    const positions = [];
    
    // Get ALL possible distractor icons
    const otherIcons = Object.entries(SERVICE_MAPPINGS)
      .filter(([name, path]) => {
        const isCurrentCategory = path.includes(category);
        const isTargetIcon = targetIcons.includes(name);
        return !isCurrentCategory && !isTargetIcon;
      })
      .map(([name, path]) => ({
        path: `${AZURE_BUCKET_URL}${ICONS_BASE_PATH}${path}`,
        name: name,
        category: path.split('/')[1]
      }));

    // Always select exactly 6 distractor icons
    const selectedOtherIcons = [...otherIcons]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    if (selectedOtherIcons.length < 6) {
      console.error('❌ Not enough distractor icons:', selectedOtherIcons.length);
      selectedOtherIcons.forEach(icon => console.log('Missing Icon URL:', icon.path));
      return;
    }

    // Combine all icons (4 targets + 6 distractors = 10 total)
    const gameIcons = [
      ...targetIcons.map(name => ({
        path: `${AZURE_BUCKET_URL}${ICONS_BASE_PATH}${SERVICE_MAPPINGS[name]}`,
        name: name,
        category: category,
        isTarget: true
      })),
      ...selectedOtherIcons.map(icon => ({
        ...icon,
        isTarget: false
      }))
    ];

    console.log('\nAdding Icons to Game:');
    console.log('Total Icons:', gameIcons.length);
    console.log('Target Icons:', gameIcons.filter(icon => icon.isTarget).map(icon => icon.name));
    console.log('Distractor Icons:', gameIcons.filter(icon => !icon.isTarget).map(icon => icon.name));

    // Add all icons to the game
    gameIcons.forEach((iconInfo) => {
      let x = getRandomX();
      while (positions.some((pos) => Math.abs(pos - x) < 50)) {
        x = getRandomX();
      }
      positions.push(x);

      const iconImage = new Image();
      iconImage.src = iconInfo.path;

      iconsRef.current.push({
        x,
        y: -50,
        type: iconInfo.category,
        name: iconInfo.name,
        image: iconImage,
        hit: false,
        isTarget: iconInfo.isTarget
      });
    });

    console.log('\nIcons Generated Successfully');
    console.log('============================\n');

    // Add this near the top of the function
    console.log("Icon path example:", 
      `${AZURE_BUCKET_URL}${ICONS_BASE_PATH}${Object.values(SERVICE_MAPPINGS)[0]}`);
  };

  // Mission Display component with null check
  const MissionDisplay = () => {
    if (!currentMission.text) return null;
    
    return (
      <div className="gameCanvas-mission-container">
        <h3 className="gameCanvas-mission-title">
          Current Mission
        </h3>
        <div className="gameCanvas-mission-text">
          {currentMission.text}
        </div>
      </div>
    );
  };

  // Add console logs to track state changes
  useEffect(() => {
    console.log('Mission Updated:', currentMission);
  }, [currentMission]);

  useEffect(() => {
    console.log('Game Started:', gameStarted);
  }, [gameStarted]);

  // Add this after the canvas ref declaration
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 1200;  // Match the CSS width
      canvasRef.current.height = 900;  // Match the CSS height
    }
  }, []);

  // Add this function to retrieve the nickname
  const getNickname = () => {
    return localStorage.getItem('userNickname') || playerName || 'Anonymous';
  };

  // Update handleStartGame function
  const handleStartGame = () => {
    setShowWelcome(false);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    if (onPlayerNameChange) {
      onPlayerNameChange(playerName);
    }
    // Fetch leaderboard only when game starts
    if (fetchLeaderboard) {
      fetchLeaderboard();
    }
    startGame();
  };

  // Update score display section to use CosmosDB leaderboard
  const renderHighScores = () => (
    <div className="gameCanvas-high-scores">
      <h3>HIGH SCORES</h3>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={index}>
            <span>{entry.nickname}:</span>
            <span>{entry.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // Update score tracking to ensure parent component has current score
  useEffect(() => {
    if (onScoreUpdate && score > 0) {
      onScoreUpdate(score);
    }
  }, [score, onScoreUpdate]);

  // Update the game loop initialization
  const startGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    
    // Start the game loop
    gameLoopRef.current = setInterval(() => {
      updateGame();
      drawGame();
    }, 1000 / 60); // 60 FPS
  };

  // Add cleanup for game loop
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, []);

  // Ensure drawImage is called only if the image is loaded
  const drawGame = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Check if the rocket image is loaded before drawing
    if (rocketImage.current.complete && rocketImage.current.naturalHeight !== 0) {
      ctx.drawImage(rocketImage.current, rocketPosition.x, rocketPosition.y);
    } else {
      console.warn("Rocket image not loaded, skipping drawImage");
    }

    // Rest of your drawing logic...
  };

  return (
    <div className="gameCanvas-container">
      <h1 
        className="gameCanvas-game-title"
        style={{ '--azure-icon': `url(${process.env.PUBLIC_URL}/azure-icons/Microsoft_Azure_Cyan.svg)` }}
      >
        ZURE CLOUD SHOOTER
      </h1>
      <div className="gameCanvas-game-content">
        <div className="gameCanvas-canvas-wrapper">
          <canvas ref={canvasRef} className="gameCanvas-game-canvas" />
        </div>
        <div className="gameCanvas-instruction-panel">
          <div className="gameCanvas-player-box">
            <div className="gameCanvas-player-name">
              PLAYER: {playerName}
            </div>
          </div>

          <div className="gameCanvas-score-box">
            <div className="gameCanvas-score-display">
              <span role="img" aria-label="alien">👾</span> Score: {score} <span role="img" aria-label="joystick">🕹️</span>
              {soundsLoaded && (
                <button 
                  className="gameCanvas-sound-toggle"
                  onClick={toggleMute}
                  aria-label="Toggle sound"
                  style={{ marginLeft: '8px', display: 'inline-block' }}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              )}
            </div>
          </div>

          <div className="gameCanvas-timer-box">
            <div className="gameCanvas-timer-display">
              TIME: {timeLeft}s
            </div>
          </div>

          <div className="gameCanvas-score-explanation">
            <h4>How to Score:</h4>
            <ul>
              <li>• Hit correct icon: +5 points</li>
              <li>• Height bonus: up to +20</li>
              <li>• Wrong hit: -5 points</li>
              <li>• Tip: Shoot icons as high as possible!</li>
            </ul>
          </div>

          {renderHighScores()}

          {currentMission.text && (
            <div className="gameCanvas-mission-container">
              <h3 className="gameCanvas-mission-title">
                Current Mission
              </h3>
              <div className="gameCanvas-mission-text">
                {currentMission.text}
              </div>
            </div>
          )}
        </div>
      </div>

      {showRocketModal && (
        <div className="gameCanvas-modal-overlay">
          <div className="gameCanvas-rocket-selection-modal">
            <h2>Choose Your Rocket</h2>
            <div className="gameCanvas-rocket-grid">
              {rocketOptions.map((rocket) => (
                <div 
                  key={rocket.id} 
                  className={`gameCanvas-rocket-option ${selectedRocket === rocket.id ? 'selected' : ''}`}
                  onClick={() => handleRocketSelect(rocket.id)}
                >
                  <img 
                    src={rocket.id} 
                    alt={rocket.name}
                  />
                  <p>{rocket.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="gameCanvas-game-over">
          <h3>Time's Up!</h3>
          <button onClick={() => window.location.reload()}>
            Play Again
          </button>
        </div>
      )}

      {showCheerMessage && cheerMessage && (
        <div className="gameCanvas-cheerleader-container">
          <div className="gameCanvas-cheerleader-character">
            <img 
              src={`${process.env.REACT_APP_AZURE_BUCKET_URL}/games/utilities/cheerleader.png`} 
              alt="Cheerleader" 
            />
          </div>
          <div className="gameCanvas-cheer-message" style={{
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid #00ffff',
            borderRadius: '10px',
            padding: '15px',
            color: '#00ffff',
            fontSize: '1.2em',
            textAlign: 'center',
            minWidth: '200px',
            maxWidth: '400px',
            margin: '10px',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
            zIndex: 1000
          }}>
            {cheerMessage}
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="gameCanvas-modal-overlay">
          <div className="gameCanvas-modal">
            <h2>Welcome to Azure Cloud Shooter!</h2>
            <p>Enter your name to start the game:</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={tempPlayerName}
                onChange={(e) => {
                  setTempPlayerName(e.target.value);
                  setNameError('');
                }}
                placeholder="Your name"
                className="gameCanvas-name-input"
                autoFocus
              />
              {nameError && <div className="gameCanvas-name-error">{nameError}</div>}
              <button type="submit" className="gameCanvas-start-button">
                Start Game
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Add prop types
GameCanvas.propTypes = {
  onScoreUpdate: PropTypes.func,
  onPlayerNameChange: PropTypes.func,
  onGameOver: PropTypes.func,
  leaderboard: PropTypes.array,
  fetchLeaderboard: PropTypes.func
};

export default GameCanvas;