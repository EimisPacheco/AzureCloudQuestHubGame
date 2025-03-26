import React, { useState } from 'react';
import { translateText } from '../services/TranslationService';

const TranslationTest = () => {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testText = "Welcome to Azure Cloud Shooter! Can you match all the services?";
  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' }
  ];

  const handleTranslate = async (langCode) => {
    setIsLoading(true);
    try {
      const translated = await translateText(testText, langCode);
      setTranslatedText(translated);
    } catch (error) {
      setTranslatedText(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="translation-test" style={{ 
      padding: '20px',
      background: 'rgba(13, 25, 35, 0.95)',
      border: '2px solid #007FFF',
      borderRadius: '10px',
      width: '300px',
      position: 'fixed',
      top: '100px',
      right: '20px',
      zIndex: 9999
    }}>
      <h3 style={{ color: '#007FFF', marginBottom: '15px' }}>Translation Test</h3>
      
      <div style={{ marginBottom: '15px', color: '#007FFF' }}>
        <strong>Original Text:</strong><br/> 
        {testText}
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleTranslate(lang.code)}
            style={{
              padding: '8px 16px',
              background: 'rgba(0, 127, 255, 0.1)',
              border: '2px solid #007FFF',
              borderRadius: '8px',
              color: '#007FFF',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(0, 127, 255, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(0, 127, 255, 0.1)'}
          >
            Translate to {lang.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: '#007FFF' }}>Translating...</div>
      ) : (
        translatedText && (
          <div style={{ 
            padding: '15px',
            border: '2px solid #007FFF',
            borderRadius: '8px',
            background: 'rgba(0, 127, 255, 0.1)',
            color: '#007FFF'
          }}>
            <strong>Translated Text:</strong><br/>
            {translatedText}
          </div>
        )
      )}
    </div>
  );
};

export default TranslationTest; 