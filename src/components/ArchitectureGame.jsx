import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Confetti } from 'react-confetti';
import AzureArchitectureDisplay from './AzureArchitectureDisplay';
import { translateText } from '../services/TranslationService';
import LanguageSelector from './LanguageSelector';

// Default translations
const defaultTranslations = {
  backToHome: 'Back to Home',
  gameTitle: 'Azure Architecture Challenge',
  score: 'Score',
  newArchitecture: 'NEW ARCHITECTURE',
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED'
};

const ArchitectureGame = () => {
  // Add state to track game progress
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  const sounds = useRef({});

  // Add translation state
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState(defaultTranslations);

  // Handle language change
  const handleLanguageChange = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    
    if (newLanguage === 'en') {
      setTranslations(defaultTranslations);
      return;
    }
    
    try {
      // Translate all UI text
      const translationPromises = Object.entries(defaultTranslations).map(async ([key, value]) => {
        const translatedValue = await translateText(value, newLanguage);
        return [key, translatedValue];
      });
      
      const translatedEntries = await Promise.all(translationPromises);
      const newTranslations = Object.fromEntries(translatedEntries);
      
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Define sound files
  const soundFiles = {
    hover: `${process.env.REACT_APP_AZURE_BUCKET_URL}/games/sounds/hover.mp3`
  };

  // Play sound function
  const playSound = useCallback((soundName) => {
    if (!sounds.current[soundName] && soundFiles[soundName]) {
      sounds.current[soundName] = new Audio(soundFiles[soundName]);
    }

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

  // Game state management
  const [currentArchitecture, setCurrentArchitecture] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3); // Adjust based on your game
  const [currentDifficulty, setCurrentDifficulty] = useState('BEGINNER');
  const [showConfetti, setShowConfetti] = useState(false);
  const gameContainerRef = useRef(null);

  // Start new game with selected difficulty
  const startNewGame = (difficulty) => {
    setCurrentDifficulty(difficulty.toUpperCase());
    setGameInProgress(true);
    setGameCompleted(false);
    setQuestionIndex(0);
    // Load architecture data based on difficulty
    // ...
  };

  // Handle answering a question
  const handleAnswerQuestion = (selectedService) => {
    // Process answer logic here
    // ...

    // Move to next question or complete game
    const nextIndex = questionIndex + 1;
    if (nextIndex >= totalQuestions) {
      completeGame();
    } else {
      setQuestionIndex(nextIndex);
    }
  };

  // Complete the game
  const completeGame = () => {
    setGameInProgress(false);
    setGameCompleted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="architecture-game-container" ref={gameContainerRef}>
      {showConfetti && <Confetti />}

      {/* Back to Home button - always visible */}
      <Link 
        to="/" 
        className="back-to-home-button"
        style={{
          position: 'fixed',
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
          zIndex: 9999
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

      {/* Game Header */}
      <div className="game-header">
        <h1>{translations.gameTitle}</h1>
        <div className="game-info">
          <span>{translations.score}: {/* game score */}</span>
          {gameInProgress && (
            <span className="difficulty-badge">{translations[currentDifficulty.toLowerCase()]}</span>
          )}
        </div>
        {gameInProgress && !gameCompleted && (
          <button 
            onClick={() => {/* logic to get new architecture */}}
            className="new-architecture-button"
            style={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid #00ffff',
              borderRadius: '5px',
              color: '#00ffff',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            {translations.newArchitecture}
          </button>
        )}
      </div>
      
      {/* Architecture Display and Game */}
      {currentArchitecture && (
        <AzureArchitectureDisplay 
          architecture={currentArchitecture}
          currentLanguage={currentLanguage}
        />
      )}
      
      {/* Game Content - Questions, etc. */}
      {gameInProgress && (
        <div className="game-content">
          {/* Question display, service options, etc. */}
          {/* ... */}
        </div>
      )}
      
      {/* Difficulty buttons - only shown before game or after completion */}
      {(!gameInProgress || gameCompleted) && (
        <div className="difficulty-buttons-container" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          margin: '20px 0',
          position: 'fixed',
          bottom: '40px',
          left: '0',
          right: '0'
        }}>
          <button 
            className="difficulty-button beginner"
            onClick={() => startNewGame('beginner')}
            onMouseEnter={() => playSound('hover')}
            style={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid #00ffff',
              borderRadius: '5px',
              color: '#00ffff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              transition: 'all 0.3s ease'
            }}
          >
            {translations.beginner}
          </button>
          
          <button 
            className="difficulty-button intermediate"
            onClick={() => startNewGame('intermediate')}
            onMouseEnter={() => playSound('hover')}
            style={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid #00ffff',
              borderRadius: '5px',
              color: '#00ffff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              transition: 'all 0.3s ease'
            }}
          >
            {translations.intermediate}
          </button>
          
          <button 
            className="difficulty-button advanced"
            onClick={() => startNewGame('advanced')}
            onMouseEnter={() => playSound('hover')}
            style={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid #00ffff',
              borderRadius: '5px',
              color: '#00ffff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              transition: 'all 0.3s ease'
            }}
          >
            {translations.advanced}
          </button>
        </div>
      )}
      
      {/* Language selector */}
      <LanguageSelector 
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
};

export default ArchitectureGame; 