import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameHome-h.css';
import IconsSelectCategoryFast from './IconsSelectCategoryFast';

const GameHome = () => {
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('userNickname') || '';
  });
  
  useEffect(() => {
    if (nickname) {
      localStorage.setItem('userNickname', nickname);
    }
  }, [nickname]);

  // This function will be used by the name input in the welcome modal
  // that appears when a game starts, not on the home page
  const handleSetNickname = (name) => {
    if (name.trim()) {
      setNickname(name.trim());
      localStorage.setItem('userNickname', name.trim());
    }
  };

  return (
    <div className="azure-game-home">
      <div className="game-home-wrapper-h">
        <div className="game-home-container-h">
          <h1 
            className="game-title-h" 
            style={{ '--azure-icon': `url(${process.env.PUBLIC_URL}/azure-icons/Microsoft_Azure_Cyan.svg)` }}
          >
            ZURE GAME HUB
          </h1>
          <div className="games-grid-h" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(3, auto)',
            gap: '20px',
            justifyContent: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* First row */}
            <div className="game-card-h hover-glow">
              <Link to="/cloud-shooter" className="game-link-h">
                <div className="game-icon-h">
                  <span className="icon-target">🎯</span>
                </div>
                <h2>Azure Cloud Shooter</h2>
                <h3>Rocket Blast Mode</h3>
                <p>Test your Azure knowledge in a fast-paced shooting icon game!</p>
              </Link>
            </div>

            <div className="game-card-h hover-glow">
              <Link to="/definition-match" className="game-link-h">
                <div className="game-icon-h">
                  <span className="icon-definition">📄</span>
                </div>
                <h2>Match Icons & Definitions</h2>
                <h3>Match Definition Mode</h3>
                <p>Match Azure services with their definitions!</p>
              </Link>
            </div>

            {/* Second row - Architecture Puzzle in the middle */}
            <div className="game-card-h hover-glow" style={{ 
              gridColumn: '1 / span 2', 
              justifySelf: 'center',
              maxWidth: '500px'
            }}>
              <Link to="/architecture-game" className="game-link-h">
                <div className="game-icon-h">
                  <span className="icon-puzzle">🧩</span>
                </div>
                <h2>Architecture Puzzle</h2>
                <h3>Architecture Builder Mode</h3>
                <p>Complete Azure architecture diagrams by finding the missing services!</p>
              </Link>
            </div>

            {/* Third row */}
            <div className="game-card-h hover-glow">
              <Link to="/icons-memory-game" className="game-link-h">
                <div className="game-icon-h">
                  <span className="icon-memory">🧠</span>
                </div>
                <h2>Icons Memory</h2>
                <h3>Memory Match Mode</h3>
                <p>Test your memory by matching pairs of Azure service icons!</p>
              </Link>
            </div>

            <div className="game-card-h hover-glow">
              <Link to="/category-challenge" className="game-link-h">
                <div className="game-icon-h">
                  <span className="icon-category">🗂️</span>
                </div>
                <h2>Azure Category Challenge</h2>
                <h3>Speed Classification Mode</h3>
                <p>Test your knowledge by selecting all icons belonging to specific Azure categories.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHome;