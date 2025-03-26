import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/GameCanvas.css';
import { getCategoryIcons, getRandomCategory } from '../utils/categorySelectionUtils';
import { getServiceIconUrl } from '../utils/memoryGameUtils';
import { Link } from 'react-router-dom';
import CosmosDBService from '../services/CosmosDBService';

const IconsSelectCategoryFast = () => {
  // Game state with proper initialization
  const [currentCategory, setCurrentCategory] = useState('');
  const [displayCategory, setDisplayCategory] = useState('');
  const [icons, setIcons] = useState([]);
  const [selectedIcons, setSelectedIcons] = useState([]);
  const [correctSelections, setCorrectSelections] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [roundComplete, setRoundComplete] = useState(false);
  
  const TIME_LIMIT = 60;
  const gameType = 'CategoryFast';
  const timerRef = useRef(null);

  // Initialize game state
  useEffect(() => {
    // Reset everything on mount
    const resetGame = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setGameStarted(false);
      setGameOver(false);
      setShowWelcome(true);
      setTimeElapsed(0);
      setScore(0);
      setPlayerName('');
      setSelectedIcons([]);
      setCorrectSelections(0);
      setRoundComplete(false);
    };

    resetGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Handle name submission and game start
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
    setPlayerName(tempPlayerName.trim());
    startNewGame();
  };

  // Separate game initialization from name submission
  const startNewGame = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset game state
    setShowWelcome(false);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeElapsed(0);
    setSelectedIcons([]);
    setCorrectSelections(0);
    setCurrentCategory('');
    setDisplayCategory('');
    setIcons([]);
    setRoundComplete(false);
    
    // Fetch leaderboard and start new round
    fetchLeaderboard();
    startNewRound();
  };

  // Timer management
  useEffect(() => {
    // Only start timer when game is actually ready to begin
    const shouldStartTimer = 
      gameStarted && 
      !gameOver && 
      !showWelcome && 
      playerName && 
      currentCategory; // Make sure category is loaded

    if (shouldStartTimer && !timerRef.current) {
      console.log('Starting timer...', { gameStarted, gameOver, showWelcome, playerName });
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= TIME_LIMIT - 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            handleGameOver();
            return TIME_LIMIT;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        console.log('Cleaning up timer...');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStarted, gameOver, showWelcome, playerName, currentCategory]);

  // Handle game over
  const handleGameOver = async () => {
    // Clear timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameOver(true);
    setRoundComplete(true);
    
    try {
      // Save current score before resetting
      await saveScore();
      console.log('Score saved successfully');
      await fetchLeaderboard();
      
      // Reset all game state for next category
      setTimeElapsed(0);
      setSelectedIcons([]);
      setCorrectSelections(0);
      setRoundComplete(false);
      setScore(0); // Reset score here
      
      // Start new round with clean state
      startNewRound();
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  // Sound state
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sounds = useRef({});
  
  // Game container ref
  const gameContainerRef = useRef(null);
  const categoryIconsRef = useRef([]);

  // Player state
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('highScores');
    return saved ? JSON.parse(saved) : [];
  });

  // Define sound files
  const soundFiles = {
    select: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/flip-switch.mp3`,
    correct: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/correct_sound.mp3`,
    incorrect: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/incorrect_sound.mp3`,
    hover: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/hover.mp3`,
    achievement: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/levelup.mp3`
  };

  // Helper function to safely create audio objects with timeout
  const createSafeAudio = useCallback((path) => {
    const audio = new Audio();
    return new Promise((resolve) => {
      audio.addEventListener('error', () => {
        console.warn(`Sound file not found: ${path}`);
        resolve(null);
      });
      audio.addEventListener('canplaythrough', () => {
        resolve(audio);
      });
      // Timeout fallback in case sound loading takes too long
      setTimeout(() => {
        if (audio.readyState < 3) {
          console.warn(`Sound loading timeout: ${path}`);
          resolve(null);
        }
      }, 3000);
      audio.src = path;
    });
  }, []);

  // Load all sounds
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
        
        // Check if at least some sounds loaded successfully
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
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Play a sound effect
  const playSound = useCallback(
    (soundName) => {
      if (isMuted || !sounds.current[soundName]) return;
      const sound = sounds.current[soundName];
      sound.currentTime = 0;
      sound.play().catch(err => console.warn('Error playing sound:', err));
    },
    [isMuted]
  );

  // First, define the initGame function without any dependencies to other functions
  const initGame = useCallback(() => {
    const { category, displayName, icons: allIcons, targetIcons } = getRandomCategory();
    
    setCurrentCategory(category);
    setDisplayCategory(displayName);
    setIcons(allIcons);
    categoryIconsRef.current = targetIcons;
    setSelectedIcons([]);
    setCorrectSelections(0);
    setTimeElapsed(0);
    setRoundComplete(false);
    setGameOver(false);
    setGameStarted(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const newTime = Math.floor((Date.now() - startTime) / 1000);
      setTimeElapsed(newTime);
      
      // Check if time has run out
      if (newTime >= TIME_LIMIT) {
        // Handle timer expiry directly in the interval callback
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        if (!roundComplete) {
          setGameOver(true);
          playSound('incorrect');
        }
      }
    }, 1000);
    
    console.log(`Starting new round with category: ${displayName}`);
    console.log(`Target icons:`, targetIcons);
  }, []);

  // Next, define nextCategory with only initGame dependency
  const nextCategory = useCallback(() => {
    // Stop any confetti
    setShowConfetti(false);
    
    // Reset game state for next round
    setGameOver(false);
    initGame();
    
    // Play sound effect
    playSound('levelup');
  }, [initGame, playSound]);

  // Then, define handleRoundComplete
  const handleRoundComplete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setRoundComplete(true);
    setShowConfetti(true);
    playSound('achievement');
    
    // Remove time/height bonus, just give a fixed completion bonus
    setScore(prev => prev + 20); // Completion bonus
  }, [playSound]);

  // Use an effect for auto-advancing to next category
  useEffect(() => {
    let timer;
    
    if (roundComplete || gameOver) {
      timer = setTimeout(() => {
        nextCategory();
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [roundComplete, gameOver, nextCategory]);

  // Handle card click
  const handleCardClick = (iconName) => {
    if (selectedIcons.includes(iconName)) {
      return; // Already selected
    }
    
    setSelectedIcons(prev => [...prev, iconName]);
    playSound('select');
    
    if (categoryIconsRef.current.includes(iconName)) {
      // Correct selection - award 20 points (instead of 5)
      setScore(prev => prev + 20);
      setCorrectSelections(prev => prev + 1);
      playSound('correct');
      
      // Check if all icons in the category are selected
      if (correctSelections + 1 === categoryIconsRef.current.length) {
        handleRoundComplete();
      }
    } else {
      // Wrong selection - deduct 5 points
      setScore(prev => Math.max(0, prev - 5));
      playSound('incorrect');
    }
  };

  // Start the game when component mounts
  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initGame]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Confetti component
  const Confetti = ({ active }) => {
    if (!active) return null;
    
    const confettiCount = 150;
    const confetti = [];
    
    for (let i = 0; i < confettiCount; i++) {
      const left = `${Math.random() * 100}%`;
      const animationDelay = `${Math.random() * 5}s`;
      const initialOpacity = Math.random();
      const size = `${Math.random() * 10 + 5}px`;
      const rotation = `${Math.random() * 360}deg`;
      const color = [
        '#00ffff', // Cyan (Azure color)
        '#0078d4', // Blue (Azure color)
        '#ffb900', // Gold
        '#e74c3c', // Red
        '#2ecc71', // Green
        '#9b59b6', // Purple
        '#3498db', // Light blue
      ][Math.floor(Math.random() * 7)];
      
      confetti.push(
        <div 
          key={i}
          className="memory-confetti-particle"
          style={{
            left,
            top: '-10px',
            width: size,
            height: size,
            backgroundColor: color,
            transform: `rotate(${rotation})`,
            opacity: initialOpacity,
            animationDelay,
          }}
        />
      );
    }
    
    return <div className="memory-confetti-container">{confetti}</div>;
  };

  const handleStartGame = () => {
    setShowWelcome(false);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeElapsed(0);
    setSelectedIcons([]);
    setCorrectSelections(0);
    setCurrentCategory('');
    setDisplayCategory('');
    setIcons([]);
    clearInterval(timerRef.current);
    fetchLeaderboard();
    startNewRound();
  };

  useEffect(() => {
    if (gameStarted) {
      console.log('Game started, fetching leaderboard...');
      fetchLeaderboard();
    }
  }, [gameStarted]);

  useEffect(() => {
    if (gameOver) {
      console.log('Game over, saving score...');
      handleGameOver();
    }
  }, [gameOver]);

  const fetchLeaderboard = async () => {
    console.log('🏆 Fetching leaderboard for:', gameType);
    try {
      const data = await CosmosDBService.getLeaderboard(gameType);
      console.log('✅ Leaderboard fetched:', data);
      setLeaderboard(data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      return [];
    }
  };

  const saveScore = async () => {
    console.log('�� Attempting to save score:', {
      playerName,
      gameType,
      score,
      timeElapsed,
      correctSelections
    });

    if (!gameStarted || !playerName || score === 0) {
      console.warn('❌ Score save prevented:', {
        gameStarted,
        playerName,
        score
      });
      return;
    }

    try {
      const result = await CosmosDBService.saveGameScore(playerName, gameType, score, {
        timeSpent: timeElapsed,
        correctSelections,
        incorrectSelections: selectedIcons.length - correctSelections,
      });
      console.log('✅ Score saved successfully:', result);
    } catch (error) {
      console.error('❌ Error saving score:', error);
    }
  };

  // Add startNewRound function
  const startNewRound = () => {
    // Get a random category and its icons
    const categoryData = getRandomCategory();
    
    // Reset game state for new category
    setScore(0); // Ensure score is reset
    setCurrentCategory(categoryData.category);
    setDisplayCategory(categoryData.displayName);
    setIcons(categoryData.icons);
    categoryIconsRef.current = categoryData.targetIcons;
    
    // Reset round-specific state
    setSelectedIcons([]);
    setCorrectSelections(0);
    setRoundComplete(false);
    setTimeElapsed(0); // Reset timer
    
    // Fetch updated leaderboard when starting new round
    fetchLeaderboard();
    
    console.log('Starting new round with category:', categoryData.displayName, 'Score reset to 0');
  };

  // Add icon selection handler
  const handleIconClick = (icon) => {
    if (gameOver || !gameStarted) return;

    playSound('select');
    
    // Toggle icon selection
    setSelectedIcons(prev => {
      const isSelected = prev.includes(icon.name);
      if (isSelected) {
        return prev.filter(name => name !== icon.name);
      } else {
        return [...prev, icon.name];
      }
    });

    // Check if the icon is a target icon
    if (categoryIconsRef.current.includes(icon.name)) {
      setCorrectSelections(prev => prev + 1);
      setScore(prev => prev + 20); // Add points for correct selection
      playSound('correct');
    } else {
      setScore(prev => Math.max(0, prev - 5)); // Subtract points for incorrect selection
      playSound('incorrect');
    }
  };

  return (
    <div className="gameCanvas-container" ref={gameContainerRef}>
      <Confetti active={showConfetti} />

      {/* Back to Home button */}
      <Link 
        to="/" 
        className="back-to-home-button"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid #00ffff',
          borderRadius: '5px',
          color: '#00ffff',
          textDecoration: 'none',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          zIndex: 100
        }}
        onMouseEnter={() => playSound('hover')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          style={{
            width: '20px',
            height: '20px',
            marginRight: '8px'
          }}
        >
          <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/>
        </svg>
        Back to Home
      </Link>

      <h1 
        className="gameCanvas-game-title"
        style={{ '--azure-icon': `url(${process.env.PUBLIC_URL}/azure-icons/Microsoft_Azure_Cyan.svg)` }}
      >
        zure Category Challenge
      </h1>
      
      <div className="gameCanvas-game-content">
        {/* Main game area with centered grid */}
        <div className="gameCanvas-canvas-wrapper" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start',
          position: 'relative',
          paddingTop: '80px'
        }}>
          <div className="category-selection-header" style={{
            marginBottom: '40px'
          }}>
            <h2 className="category-selection-instruction">
              Select all the cards which belong to the category: <span className="category-highlight">{displayCategory}</span>
            </h2>
          </div>

          {/* Center the grid in the available space */}
          <div className="category-selection-grid" style={{ 
            margin: '0 auto',
            marginTop: '-20px'
          }}>
            {icons.map((icon, index) => (
              <div
                key={`${icon.name}-${index}`}
                className={`category-selection-card ${selectedIcons.includes(icon.name) ? 
                  (categoryIconsRef.current.includes(icon.name) ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleCardClick(icon.name)}
                onMouseEnter={() => playSound('hover')}
              >
                <img 
                  src={getServiceIconUrl(icon.path)} 
                  alt={icon.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.PUBLIC_URL}/azure-icons/default.svg`;
                  }}
                />
                <div className="category-selection-card-text">{icon.name}</div>
              </div>
            ))}
          </div>
          
          {/* Move the game completion messages to appear within the canvas */}
          {roundComplete && (
            <div className="category-selection-success" style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: 'rgba(46, 204, 113, 0.9)', 
              color: 'white',
              padding: '12px',
              textAlign: 'center',
              zIndex: 1000
            }}>
              <h3>Great job! You found all {categoryIconsRef.current.length} icons in {timeElapsed} seconds.</h3>
              <p>You earned {Math.max(100 - timeElapsed * 2, 10)} points!</p>
            </div>
          )}
          
          {gameOver && !roundComplete && (
            <div className="category-selection-failure-banner" style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: 'rgba(231, 76, 60, 0.9)', 
              color: 'white',
              padding: '12px',
              textAlign: 'center',
              zIndex: 1000
            }}>
              <h3>Time's up!</h3>
              <p>You found {correctSelections} out of {categoryIconsRef.current.length} icons.</p>
              <p>Looking for: {categoryIconsRef.current.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Right side panel - EXACTLY matching GameCanvas.jsx */}
        <div className="gameCanvas-instruction-panel">
          {/* Player info box */}
          <div className="gameCanvas-player-box">
            <div className="gameCanvas-player-name">
              PLAYER: {playerName}
            </div>
          </div>

          {/* Score box */}
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

          {/* Timer box */}
          <div className="gameCanvas-timer-box">
            <div className="gameCanvas-timer-display">
              {formatTime(timeElapsed)}
            </div>
          </div>

          {/* How to score box */}
          <div className="gameCanvas-score-explanation">
            <h4>HOW TO SCORE:</h4>
            <ul>
              <li>• Hit correct icon: +20 points</li>
              <li>• Wrong hit: -5 points</li>
              <li>• Tip: Select icons as fast as possible!</li>
            </ul>
          </div>

          {/* Progress display */}
          <div className="gameCanvas-progress-display">
            Progress: {correctSelections} out of {categoryIconsRef.current.length}
          </div>

          {/* High scores section */}
          <div className="gameCanvas-high-scores" style={{
            backgroundColor: 'rgba(0, 40, 56, 0.8)',
            border: '1px solid #00ffff',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '10px'
          }}>
            <h4 style={{ 
              color: '#00ffff',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              HIGH SCORES
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {leaderboard.map((entry, index) => (
                <li key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '4px 0'
                }}>
                  <span className="gameCanvas-high-score-name">{entry.nickname}:</span>
                  <span>{entry.score}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current mission box */}
          <div className="gameCanvas-mission-container">
            <h3 className="gameCanvas-mission-title">
              CURRENT MISSION
            </h3>
            <div className="gameCanvas-mission-text">
              Select the {displayCategory} icons!
            </div>
          </div>
        </div>
      </div>

      {/* Welcome modal */}
      {showWelcome && (
        <div className="gameCanvas-modal-overlay">
          <div className="gameCanvas-modal">
            <h2>Welcome to Azure Category Challenge!</h2>
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
                START GAME
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconsSelectCategoryFast; 