import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameCanvas.css';
import { 
  getRandomServices, 
  getRandomDefinition, 
  isGameComplete,
  formatTime,
  calculateScore
} from '../utils/definitionMatchingUtils';
import { getServiceIconUrl } from '../utils/memoryGameUtils';
import { AZURE_ICON_CATEGORIES } from '../services/IconResolver';
import CosmosDBService from '../services/CosmosDBService';
import { translateText, translateBatch } from '../services/TranslationService';
import LanguageSelector from './LanguageSelector';

// Add default UI translations
const defaultTranslations = {
  title: 'Azure Definition Match',
  backToHome: 'Back to Home',
  player: 'PLAYER',
  score: 'Score',
  time: 'TIME',
  howToScore: 'HOW TO SCORE',
  correctMatch: 'Correct match: +20 points',
  wrongMatch: 'Wrong match: -5 points',
  tip: 'Tip: Match definitions as fast as possible!',
  progress: 'Progress',
  outOf: 'out of',
  highScores: 'HIGH SCORES',
  currentMission: 'CURRENT MISSION',
  missionText: 'Match the Azure service with its definition!',
  serviceDefinition: 'Service Definition:',
  congratulations: 'Congratulations!',
  timesUp: 'Time\'s Up!',
  matchedAll: 'You matched all definitions with {time} remaining!',
  matchedSome: 'You matched {matched} out of {total} definitions.',
  playAgain: 'Play Again',
  welcomeTitle: 'Welcome to Azure Definition Match!',
  welcomeText: 'Match Azure services with their definitions. Enter your name to start:',
  yourName: 'Your name',
  startGame: 'START GAME',
  loading: 'Loading Azure Service Definitions...',
  categoryBelongs: 'The Service "{service}" belongs to the {category} Category'
};

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

const MatchDefinitionWithIconGame = () => {
  // Game state
  const [services, setServices] = useState([]);
  const [currentDefinition, setCurrentDefinition] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [matchedServices, setMatchedServices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const gameType = 'DefinitionMatching';
  
  // Sound state
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sounds = useRef({});
  
  // Game container ref
  const gameContainerRef = useRef(null);
  
  // High scores
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

  // First, add a new state for the current category
  const [currentCategory, setCurrentCategory] = useState('');

  // Add new state for showing category
  const [showCategory, setShowCategory] = useState(false);

  // Add loading state
  const [loading, setLoading] = useState(true);

  // Add translations state
  const [translations, setTranslations] = useState(defaultTranslations);
  const [translatedDefinition, setTranslatedDefinition] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Add new state for all questions answered
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

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
  
  // Play sound function
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

  // Update initGame to handle async data
  const initGame = useCallback(async () => {
    setLoading(true);
    try {
      const newServices = await getRandomServices(20); // Get 20 random services
      setServices(newServices);
      
      // Select a random definition to start with
      const randomIndex = Math.floor(Math.random() * newServices.length);
      setCurrentDefinition({
        name: newServices[randomIndex].name,
        definition: newServices[randomIndex].definition,
        path: newServices[randomIndex].path // Add path for category detection
      });
      
      setSelectedService(null);
      setMatchedServices([]);
      setTimeLeft(300);
      setScore(0);
      setGameStarted(true);
      setGameOver(false);
      setShowConfetti(false);
      setCurrentCategory(''); // Reset category
    } catch (error) {
      console.error('Error initializing game:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update the handleCardClick function
  const handleCardClick = useCallback((service, index) => {
    if (gameOver || matchedServices.includes(service.name)) {
      return;
    }

    setSelectedService(service);

    if (service.name === currentDefinition.name) {
      // Correct match
      playSound('correct');
      
      // Get the category of the service
      let serviceCategory = 'Other';
      const servicePath = service.path.toLowerCase();
      
      // Try to find the category
      for (const [category, path] of Object.entries(AZURE_ICON_CATEGORIES)) {
        const normalizedPath = path.toLowerCase();
        if (servicePath.includes(normalizedPath)) {
          serviceCategory = category;
          break;
        }
      }
      
      // Format the category name for display
      const formattedCategory = serviceCategory
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setCurrentCategory(formattedCategory);
      setShowCategory(true); // Show category message
      
      // Add to matched services
      const newMatchedServices = [...matchedServices, service.name];
      setMatchedServices(newMatchedServices);
      
      // Calculate score bonus based on time
      const timeBonus = Math.floor((timeLeft / 300) * 50);
      const points = calculateScore(true);
      setScore(prevScore => prevScore + points);

      // Check if all services are matched
      if (newMatchedServices.length === services.length) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
        playSound('achievement');
        setGameOver(true);
        
        // Update high scores
        const newScore = score + 20 + timeBonus;
        updateHighScores(newScore);
      } else {
        // Get next random definition from remaining services
        const remainingServices = services.filter(s => !newMatchedServices.includes(s.name));
        const randomIndex = Math.floor(Math.random() * remainingServices.length);
        setCurrentDefinition({
          name: remainingServices[randomIndex].name,
          definition: remainingServices[randomIndex].definition,
          path: remainingServices[randomIndex].path // Add path for category detection
        });
      }

      console.log('Service path:', service.path);
      console.log('Available categories:', AZURE_ICON_CATEGORIES);
      console.log('Found category:', serviceCategory);
    } else {
      // Wrong match
      playSound('incorrect');
      const points = calculateScore(false);
      setScore(prevScore => Math.max(0, prevScore + points));
      
      // Visual feedback for wrong match
      setTimeout(() => {
        setSelectedService(null);
      }, 1000);
    }
  }, [gameOver, matchedServices, currentDefinition, timeLeft, score, services, playSound]);

  // Update the useEffect for game completion check
  useEffect(() => {
    if (gameStarted && !showWelcome && isGameComplete(matchedServices, services.length) && timeLeft > 0) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      setGameOver(true);
      playSound('achievement');
    }
  }, [matchedServices, services.length, timeLeft, playSound, gameStarted, showWelcome]);

  // Update high scores
  const updateHighScores = (newScore) => {
    const newHighScores = [...highScores];
    
    // Add the new score
    newHighScores.push({
      name: playerName,
      score: newScore,
      date: new Date().toISOString()
    });
    
    // Sort by score (highest first)
    newHighScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 5
    const topScores = newHighScores.slice(0, 5);
    
    // Update state and localStorage
    setHighScores(topScores);
    localStorage.setItem('highScores', JSON.stringify(topScores));
  };

  // Timer countdown
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            setGameOver(true);
            console.log("Time's up!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);

  // Start the game when component mounts
  useEffect(() => {
    if (!showWelcome) {
      initGame();
    }
  }, [initGame, showWelcome]);

  // Auto-hide confetti after celebration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 7000); // Hide confetti after 7 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Update the handleNameSubmit function
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
    setShowWelcome(false);
    handleStartGame(); // Start the game after name is set
  };

  // Add this to retrieve the nickname
  const getNickname = () => {
    return localStorage.getItem('userNickname') || 'Anonymous';
  };

  // Modify the game over function to save score
  const handleGameOver = async () => {
    // ... existing game over code ...
    
    // Calculate final score based on your game's logic
    const finalScore = score; // Modify this according to your scoring system
    
    try {
      // Save score to CosmosDB
      await CosmosDBService.saveGameScore(
        getNickname(),
        gameType, 
        finalScore,
        {
          questionsAnswered: totalQuestions,
          correctAnswers: correctAnswers,
          incorrectAnswers: incorrectAnswers,
          // Add any other game-specific metadata
        }
      );
      console.log('Score saved successfully!');
    } catch (error) {
      console.error('Failed to save score:', error);
    }
    
    // Continue with existing game over logic...
  };

  // Update the language handling function to translate all UI elements
  const handleLanguageChange = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    
    if (newLanguage === 'en') {
      setTranslations(defaultTranslations);
      if (currentDefinition) {
        setTranslatedDefinition(currentDefinition.definition);
      }
      return;
    }
    
    try {
      // Use batch translation for UI elements
      const keys = Object.keys(defaultTranslations);
      const values = Object.values(defaultTranslations);
      
      const translatedValues = await translateBatch(values, newLanguage);
      
      const newTranslations = {};
      keys.forEach((key, index) => {
        newTranslations[key] = translatedValues[index];
      });
      
      setTranslations(newTranslations);
      
      // Translate current definition if it exists
      if (currentDefinition) {
        const translated = await translateText(currentDefinition.definition, newLanguage);
        setTranslatedDefinition(translated);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Translate definition whenever it changes
  useEffect(() => {
    if (currentDefinition && currentLanguage !== 'en') {
      handleLanguageChange(currentLanguage);
    } else if (currentDefinition) {
      // Use original definition for English
      setTranslatedDefinition(currentDefinition.definition);
    }
  }, [currentDefinition, currentLanguage]);

  // When a correct answer is selected, update the score
  const handleCorrectAnswer = () => {
    const points = calculateScore(true);
    setScore(prevScore => prevScore + points);
  };

  // When a wrong answer is selected, update the score
  const handleWrongAnswer = () => {
    const points = calculateScore(false);
    setScore(prevScore => Math.max(0, prevScore + points));
  };

  // Add new useEffect for all questions answered
  useEffect(() => {
    if (allQuestionsAnswered) {
      setGameOver(true);
      console.log("All questions answered!");
      saveScore();
    }
  }, [allQuestionsAnswered]);

  // Single place to handle game over and score saving
  useEffect(() => {
    if (gameOver && gameStarted && !showWelcome && score !== 0) {
      const reason = timeLeft <= 0 ? "Time's up!" : "All questions answered!";
      console.log(`Game over (${reason}), saving score...`);
      saveScore();
    }
  }, [gameOver, gameStarted, showWelcome, timeLeft, score]);

  const handleStartGame = () => {
    setShowWelcome(false);  // Hide welcome screen
    setGameStarted(true);
    setGameOver(false);     // Ensure game over state is false when starting
    setScore(0);           // Reset score when starting
    console.log('Game started, fetching leaderboard...');
    fetchLeaderboard();
  };

  const fetchLeaderboard = () => {
    CosmosDBService.getLeaderboard(gameType).then(data => {
      console.log('Leaderboard data:', data);
      setLeaderboard(data);
    });
  };

  // Format time for display - ensure it never shows negative values
  const formatTime = (seconds) => {
    const timeToShow = Math.max(0, seconds); // Prevent negative values
    const min = Math.floor(timeToShow / 60);
    const sec = timeToShow % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Update score display
  useEffect(() => {
    if (gameOver) {
      console.log('Final score:', score);
    }
  }, [gameOver, score]);

  // Update the saveScore function to be more strict about when it can save
  const saveScore = () => {
    if (!gameStarted || !playerName || !gameOver || score === 0) {
      console.warn('Score save prevented:', {
        gameStarted,
        playerName,
        gameOver,
        score
      });
      return;
    }
    
    console.log('Saving score:', {
      playerName,
      gameType,
      score
    });
    
    CosmosDBService.saveGameScore(playerName, gameType, score).then(result => {
      console.log('Score save result:', result);
    });
  };

  // Check if all definitions are matched and update gameOver state
  useEffect(() => {
    if (matchedServices.length === services.length && gameStarted) {
      setGameOver(true);
      setShowConfetti(true);
      playSound('achievement');
    }
  }, [matchedServices, services, gameStarted, playSound]);

  return (
    <div className="gameCanvas-container" ref={gameContainerRef}>
      {loading && !showWelcome && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>{translations.loading}</p>
        </div>
      )}
      
      {/* Only show confetti when game is started and not in welcome screen */}
      {!showWelcome && gameStarted && <Confetti active={showConfetti} />}

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
        {translations.backToHome}
      </Link>

      <h1 
        className="gameCanvas-game-title"
        style={{ '--azure-icon': `url(${process.env.PUBLIC_URL}/azure-icons/Microsoft_Azure_Cyan.svg)` }}
      >
        zure {translations.title.replace('Azure', '')}
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
          {/* Add LanguageSelector here with absolute positioning */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100
          }}>
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Service icons grid */}
          <div 
            className="memory-game-grid" 
            style={{ 
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '15px',
              maxWidth: '800px',
              marginTop: '40px'
            }}
          >
            {services.map((service, index) => (
              <div
                key={`${service.name}-${index}`}
                className={`memory-game-card ${
                  selectedService && selectedService.name === service.name 
                    ? (service.name === currentDefinition.name ? 'correct' : 'wrong') 
                    : matchedServices.includes(service.name) ? 'correct' : ''
                }`}
                onClick={() => handleCardClick(service, index)}
                onMouseEnter={() => {
                  playSound('hover');
                  setSelectedService(service);
                  
                  // Get the category
                  let serviceCategory = 'Other';
                  const servicePath = service.path.toLowerCase();
                  
                  // Find the category
                  for (const [category, path] of Object.entries(AZURE_ICON_CATEGORIES)) {
                    const normalizedPath = path.toLowerCase();
                    if (servicePath.includes(normalizedPath)) {
                      serviceCategory = category;
                      break;
                    }
                  }
                  
                  // Format the category
                  const formattedCategory = serviceCategory
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                  
                  setCurrentCategory(formattedCategory);
                  
                  // Only show the category if the service is already matched
                  if (matchedServices.includes(service.name)) {
                    setShowCategory(true);
                  }
                }}
                onMouseLeave={() => {
                  setShowCategory(false);
                }}
                style={{
                  cursor: matchedServices.includes(service.name) ? 'default' : 'pointer',
                  opacity: matchedServices.includes(service.name) ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  direction: 'ltr',
                  transform: 'none'
                }}
              >
                <div className="memory-card-content" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  direction: 'ltr',
                  transform: 'none'
                }}>
                  <img 
                    src={getServiceIconUrl(service.path)} 
                    alt={service.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      marginBottom: '8px',
                      transform: 'none'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${process.env.PUBLIC_URL}/azure-icons/default.svg`;
                    }}
                  />
                  <div className="memory-card-text" style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    direction: 'ltr',
                    unicodeBidi: 'normal',
                    transform: 'none'
                  }}>
                    {service.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category display with translations */}
          {currentCategory && showCategory && selectedService && (
            <div style={{
              textAlign: 'center',
              color: '#00ffff',
              fontSize: '16px',
              margin: '20px auto',
              padding: '10px',
              fontFamily: 'Orbitron, sans-serif',
              position: 'absolute',
              width: '100%',
              left: '0',
              top: '580px',
              zIndex: 2
            }}>
              {translations.categoryBelongs
                .replace('{service}', selectedService.name || 'Unknown')
                .replace('{category}', currentCategory)}
            </div>
          )}

          {/* Definition card with translations */}
          <div className="definition-card" style={{
            backgroundColor: 'rgba(0, 40, 56, 0.9)',
            padding: '20px',
            margin: '40px auto',
            border: '2px solid #00ffff',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 255, 255, 0.3)',
            width: '90%',
            maxWidth: '800px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'normal',
            color: '#ffffff',
            lineHeight: '1.5',
            position: 'relative',
            zIndex: 1,
            marginTop: '40px'
          }}>
            <div style={{
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#00ffff'
            }}>
              {translations.serviceDefinition}
            </div>
            <div style={{
              fontSize: '16px',
              padding: '10px',
              backgroundColor: 'rgba(0, 40, 56, 0.8)',
              borderRadius: '5px'
            }}>
              {translatedDefinition || (currentDefinition && currentDefinition.definition)}
            </div>
          </div>

          {/* Game over message with translations */}
          {gameOver && !showWelcome && (
            <div className="gameCanvas-game-over">
              <h3>
                {matchedServices.length === services.length ? translations.congratulations : translations.timesUp}
              </h3>
              <p>
                {matchedServices.length === services.length 
                  ? translations.matchedAll.replace('{time}', formatTime(timeLeft)) 
                  : translations.matchedSome.replace('{matched}', matchedServices.length).replace('{total}', services.length)}
              </p>
              <button 
                onClick={() => {
                  playSound('select');
                  initGame();
                }}
              >
                {translations.playAgain}
              </button>
            </div>
          )}
        </div>

        {/* Right side panel with translations */}
        <div className="gameCanvas-instruction-panel">
          {/* Player info box */}
          <div className="gameCanvas-player-box">
            <div className="gameCanvas-player-name">
              {translations.player}: {playerName}
            </div>
          </div>

          {/* Score box */}
          <div className="gameCanvas-score-box">
            <div className="gameCanvas-score-display">
              <span role="img" aria-label="alien">👾</span> {translations.score}: {score} <span role="img" aria-label="joystick">🕹️</span>
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
            <div 
              className="gameCanvas-timer-display"
              data-label={translations.time ? `${translations.time}:` : "TIME:"}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* How to score box */}
          <div className="gameCanvas-score-explanation">
            <h4>{translations.howToScore}:</h4>
            <ul>
              <li>• {translations.correctMatch}</li>
              <li>• {translations.wrongMatch}</li>
              <li>• {translations.tip}</li>
            </ul>
          </div>

          {/* Progress display */}
          <div className="gameCanvas-progress-display">
            {translations.progress}: {matchedServices.length} {translations.outOf} {services.length}
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
              {translations.highScores}
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
              {translations.currentMission}
            </h3>
            <div className="gameCanvas-mission-text">
              {translations.missionText}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome modal with translations */}
      {showWelcome && (
        <div className="gameCanvas-modal-overlay">
          <div className="gameCanvas-modal">
            <h2>{translations.welcomeTitle}</h2>
            <p>{translations.welcomeText}</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={tempPlayerName}
                onChange={(e) => {
                  setTempPlayerName(e.target.value);
                  setNameError('');
                }}
                placeholder={translations.yourName}
                className="gameCanvas-name-input"
                autoFocus
              />
              {nameError && <div className="gameCanvas-name-error">{nameError}</div>}
              <button type="submit" className="gameCanvas-start-button">
                {translations.startGame}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDefinitionWithIconGame; 