import React from 'react';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  return (
    <select
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
      style={{
        color: '#00ffff',
        backgroundColor: 'rgba(0, 40, 56, 0.8)',
        border: '1px solid #00ffff',
        borderRadius: '5px',
        padding: '5px 10px',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '14px',
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      <option value="en" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>English</option>
      <option value="es" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Spanish</option>
      <option value="fr" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>French</option>
      <option value="de" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>German</option>
      <option value="it" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Italian</option>
      <option value="pt" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Portuguese</option>
      <option value="nl" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Dutch</option>
      <option value="pl" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Polish</option>
      <option value="ru" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Russian</option>
      <option value="ja" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Japanese</option>
      <option value="ko" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Korean</option>
      <option value="zh" style={{ backgroundColor: 'rgba(0, 40, 56, 0.9)', color: '#00ffff' }}>Chinese</option>
    </select>
  );
};

export default LanguageSelector; 