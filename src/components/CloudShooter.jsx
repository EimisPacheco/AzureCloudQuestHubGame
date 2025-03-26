import React, { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { Link } from 'react-router-dom';
import CosmosDBService from '../services/CosmosDBService';

const CloudShooter = () => {
  // Add state for player and leaderboard
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const gameType = 'CloudShooter';

  // Add a state to track if game is initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch leaderboard only once on initial mount
  useEffect(() => {
    if (!isInitialized) {
      fetchLeaderboard();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Add score saving function
  const saveScore = async () => {
    console.log('🎯 Attempting to save score:', {
      playerName,
      gameType,
      score
    });

    if (!playerName || score === 0) {
      console.warn('❌ Score save prevented:', {
        playerName,
        score
      });
      return;
    }

    try {
      const result = await CosmosDBService.saveGameScore(playerName, gameType, score);
      console.log('✅ Score saved successfully:', result);
    } catch (error) {
      console.error('❌ Error saving score:', error);
    }
  };

  // Add leaderboard fetching function
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

  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  const sounds = useRef({});

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

  return (
    <div id="azure-cloud-shooter">
      <GameCanvas 
        onScoreUpdate={setScore}
        onPlayerNameChange={setPlayerName}
        onGameOver={saveScore}
        leaderboard={leaderboard}
        fetchLeaderboard={fetchLeaderboard}
      />
      <h1 className="gameCanvas-game-title">AZURE CLOUD SHOOTER</h1>

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
    </div>
  );
};

export default CloudShooter;