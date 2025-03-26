import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameHome from './components/GameHome';
import AzureArchitectureGame from './components/AzureArchitectureGame';
import CloudShooter from './components/CloudShooter';
import IconsMemoryGame from './components/IconsMemoryGame';
import IconsSelectCategoryFast from './components/IconsSelectCategoryFast';
import MatchDefinitionWithIconGame from './components/MatchDefinitionWithIconGame';
import './styles/AzureArchitecture.css';
import { EffectsProvider } from './context/EffectsContext';

function App() {
  return (
    <EffectsProvider>
      <Router>
        <div className="app-container" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto'
        }}>
          <Routes>
            <Route path="/" element={<GameHome />} />
            <Route 
              path="/cloud-shooter" 
              element={
                <div className="game-route">
                  <CloudShooter />
                </div>
              } 
            />
            <Route 
              path="/architecture-game" 
              element={
                <div className="game-route">
                  <AzureArchitectureGame />
                </div>
              } 
            />
            <Route path="/icons-memory-game" element={<IconsMemoryGame />} />
            <Route path="/category-challenge" element={<IconsSelectCategoryFast />} />
            <Route path="/definition-match" element={<MatchDefinitionWithIconGame />} />
          </Routes>
        </div>
      </Router>
    </EffectsProvider>
  );
}

export default App; 