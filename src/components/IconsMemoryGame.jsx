import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/GameCanvas.css';
import { 
  initializeGameState, 
  formatTime, 
  isGameComplete,
  getServiceIconUrl
} from '../utils/memoryGameUtils';
import { Link } from 'react-router-dom';
import CosmosDBService from '../services/CosmosDBService';

// Confetti component for celebration effect
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

const IconsMemoryGame = () => {
  // Game state
  const [gameState, setGameState] = useState(() => initializeGameState());
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('Player');
  const gameType = 'MemoryGame';
  
  // Sound state
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sounds = useRef({});
  
  // Game container ref
  const gameContainerRef = useRef(null);

  // Define sound files - same approach as in GameCanvas
  const soundFiles = {
    select: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/flip-switch.mp3`,
    correct: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/correct_sound.mp3`,
    incorrect: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/incorrect_sound.mp3`,
    hover: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/hover.mp3`,
    achievement: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/levelup.mp3`
  };

  // Initialize or reset the game
  const initGame = useCallback(() => {
    const newGameState = initializeGameState();
    setGameState(newGameState);
    setTimeLeft(300); // Reset to 5 minutes
    setGameStarted(true);
    setGameOver(false);
    setShowConfetti(false);
  }, []);

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

  // Load all sounds - using the same approach as GameCanvas
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
  
  // Play sound function - same as in GameCanvas
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
  
  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Handle card click
  const handleCardClick = (index) => {
    // Don't allow clicks if the board is locked or the card is already flipped/matched
    if (
      gameState.isLocked || 
      gameState.flippedCards.length >= 2 || 
      gameState.cards[index].isFlipped || 
      gameState.cards[index].isMatched
    ) {
      return;
    }

    // Play select sound
    playSound('select');

    // Flip the card
    setGameState(prevState => {
      // Create a new cards array with the clicked card flipped
      const updatedCards = prevState.cards.map((card, i) => 
        i === index ? { ...card, isFlipped: true } : card
      );
      
      // Add the card to flippedCards
      const updatedFlippedCards = [...prevState.flippedCards, prevState.cards[index]];
      
      // Check if we now have 2 flipped cards
      const shouldCheckMatch = updatedFlippedCards.length === 2;
      
      return {
        ...prevState,
        cards: updatedCards,
        flippedCards: updatedFlippedCards,
        isLocked: shouldCheckMatch // Lock the board if we need to check for a match
      };
    });
  };

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (gameState.flippedCards.length === 2) {
      const [firstCard, secondCard] = gameState.flippedCards;
      
      // Check if the cards match (same service)
      const isMatch = firstCard.service === secondCard.service;
      
      if (isMatch) {
        // It's a match! Update the game state
        setTimeout(() => {
          // Play correct sound with a slight delay to ensure it's heard
          playSound('correct');
          
          setGameState(prevState => {
            // Mark the matched cards
            const updatedCards = prevState.cards.map(card => 
              card.service === firstCard.service ? { ...card, isMatched: true } : card
            );
            
            // Add the service to matched pairs
            const updatedMatchedPairs = [...prevState.matchedPairs, firstCard.service];
            
            // Check if the game is complete
            const complete = isGameComplete(updatedMatchedPairs, 12); // 12 pairs total
            
            if (complete) {
              // Play achievement sound when game is complete
              setTimeout(() => playSound('achievement'), 500);
              setGameOver(true);
              
              // Show confetti animation for winning before time is up
              setShowConfetti(true);
            }
            
            return {
              ...prevState,
              cards: updatedCards,
              flippedCards: [],
              matchedPairs: updatedMatchedPairs,
              isLocked: false
            };
          });
        }, 300);
      } else {
        // Not a match, flip the cards back after a delay
        setTimeout(() => {
          // Play incorrect sound
          playSound('incorrect');
          
          setGameState(prevState => {
            // Flip the cards back
            const updatedCards = prevState.cards.map(card => 
              card.index === firstCard.index || card.index === secondCard.index
                ? { ...card, isFlipped: false }
                : card
            );
            
            return {
              ...prevState,
              cards: updatedCards,
              flippedCards: [],
              isLocked: false
            };
          });
        }, 1000); // Shorter delay before flipping back
      }
    }
  }, [gameState.flippedCards, playSound]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Start the game when component mounts
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Auto-hide confetti after celebration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 7000); // Hide confetti after 7 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (gameStarted) {
      console.log('Game started, fetching leaderboard...');
      CosmosDBService.getLeaderboard(gameType).then(data => {
        console.log('Leaderboard data:', data);
      });
    }
  }, [gameStarted]);

  useEffect(() => {
    if (gameOver) {
      console.log('Game over, saving score...');
      CosmosDBService.saveGameScore(playerName, gameType, score).then(result => {
        console.log('Score save result:', result);
      });
    }
  }, [gameOver]);

  // Create a 5x5 grid with cards and reset button
  const renderGrid = () => {
    const grid = [];
    const totalCells = 25; // 5x5 grid
    
    for (let i = 0; i < totalCells; i++) {
      if (i === 12) { // Middle position (3rd row, 3rd column)
        grid.push(
          <div 
            key="reset" 
            className="memory-game-reset"
            onClick={() => {
              playSound('select');
              initGame();
            }}
          >
            Reset
          </div>
        );
      } else {
        const cardIndex = i > 12 ? i - 1 : i; // Adjust index for cards after reset button
        if (cardIndex < gameState.cards.length) {
          const card = gameState.cards[cardIndex];
          grid.push(
            <div
              key={card.id}
              className={`memory-game-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
              onClick={() => handleCardClick(cardIndex)}
              onMouseEnter={() => playSound('hover')}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="memory-card-content">
                  <img 
                    src={getServiceIconUrl(card.path)} 
                    alt={card.service} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${process.env.PUBLIC_URL}/azure-icons/default.svg`;
                    }}
                  />
                  <div className="memory-card-text">{card.service}</div>
                </div>
              ) : (
                <span>?</span>
              )}
            </div>
          );
        } else {
          // Add empty cells to complete the grid if needed
          grid.push(
            <div key={`empty-${i}`} className="memory-game-card empty"></div>
          );
        }
      }
    }
    
    return grid;
  };

  return (
    <div 
      className="gameCanvas-container" 
      ref={gameContainerRef}
    >
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
        zure Icons Memory
      </h1>
      
      <div className="gameCanvas-game-content">
        <div className="gameCanvas-canvas-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="memory-game-timer">
            TIMER: {formatTime(timeLeft)}
            {soundsLoaded && (
              <button 
                className="memory-game-sound-toggle top-right"
                onClick={toggleMute}
                aria-label="Toggle sound"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
          </div>
          
          <div className="memory-game-grid">
            {renderGrid()}
          </div>
          
          {gameOver && (
            <div className="gameCanvas-game-over">
              <h3>
                {gameState.matchedPairs.length === 12 ? 'Congratulations!' : 'Time\'s Up!'}
              </h3>
              <p>
                {gameState.matchedPairs.length === 12 
                  ? `You found all matches with ${formatTime(timeLeft)} remaining!` 
                  : `You found ${gameState.matchedPairs.length} out of 12 matches.`}
              </p>
              <button 
                onClick={() => {
                  playSound('select');
                  initGame();
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconsMemoryGame; 