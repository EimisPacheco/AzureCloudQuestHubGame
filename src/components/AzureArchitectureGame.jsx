import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableService from './DraggableService';
import { getServiceIcon } from '../services/IconResolver';
import '../styles/DifficultyButtons.css';
import '../styles/AzureArchitectureGame.css';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import AzureArchitectureDisplay from './AzureArchitectureDisplay';
import { translateText } from '../services/TranslationService';
import LanguageSelector from './LanguageSelector';

// Default translations
const defaultTranslations = {
  gameTitle: 'Azure Architecture Challenge',
  score: 'Score',
  loading: 'Loading...',
  newArchitecture: 'New Architecture',
  question: 'Question',
  optimizationFocus: 'Optimization Focus',
  correctPoints: 'Correct! +{points} points',
  perfectChoice: 'Perfect choice! This is the optimal solution.',
  notOptimal: 'This answer is correct but not the best option according to the Optimization Focus.',
  optimalAnswer: 'The optimal answer is:',
  notCorrect: 'Not quite right',
  nextService: 'Next Service ({current} of {total})',
  learnAndHaveFun: 'Learn and have fun!',
  service: 'Service {current} of {total}',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};

const API_URL = process.env.REACT_APP_FUNCTION_URL;
const FUNCTION_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

const isValidArchitecture = (data) => {
  if (!data || !Array.isArray(data.services) || !Array.isArray(data.connections)) {
    console.warn("⚠️ Invalid JSON structure: Missing 'services' or 'connections'. Retrying...");
    return false;
  }

  const requiredMissingServices = ['missing_1', 'missing_2', 'missing_3'];

  const serviceNames = data.services.map(service => 
    typeof service === 'string' ? service : service?.name
  );

  if (!requiredMissingServices.every(ms => serviceNames.includes(ms))) {
    console.warn(`⚠️ JSON is invalid: One or more missing services (${requiredMissingServices.join(', ')}) are missing.`);
    return false;
  }

  const connectionNodes = new Set();
  data.connections.forEach(conn => {
    connectionNodes.add(conn.from);
    connectionNodes.add(conn.to);
  });

  if (!requiredMissingServices.every(ms => connectionNodes.has(ms))) {
    console.warn(`⚠️ JSON is invalid: One or more missing services (${requiredMissingServices.join(', ')}) are missing from the connections.`);
    return false;
  }

  return true;
};

const validateJSONStructure = (json, difficulty) => {
  let requiredMissingServices = ['missing_1', 'missing_2', 'missing_3'];

  if (difficulty === 'INTERMEDIATE') {
    requiredMissingServices = ['missing_1', 'missing_2', 'missing_3', 'missing_4', 'missing_5'];
  } else if (difficulty === 'ADVANCED') {
    requiredMissingServices = ['missing_1', 'missing_2', 'missing_3', 'missing_4', 'missing_5', 'missing_6', 'missing_7'];
  }

  return requiredMissingServices.every(service => json.missingServices.includes(service));
};

const getMaxPossibleScore = (difficulty) => {
  switch(difficulty) {
    case 'INTERMEDIATE':
      return 25; // 5 questions * 5 points
    case 'ADVANCED':
      return 35; // 7 questions * 5 points
    default: // BEGINNER
      return 15; // 3 questions * 5 points
  }
};

const AzureArchitectureGame = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [architecture, setArchitecture] = useState(null);
    const [architectureInfo, setArchitectureInfo] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [difficulty, setDifficulty] = useState('BEGINNER');
    const [score, setScore] = useState(0); 
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState({ isCorrect: false, message: '', points: 0 });
    const [currentMissingServiceIndex, setCurrentMissingServiceIndex] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [showSadFace, setShowSadFace] = useState(false);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
    
    // Add translation state
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [translations, setTranslations] = useState(defaultTranslations);

    // Add state for translated dynamic content
    const [translatedQuestion, setTranslatedQuestion] = useState('');
    const [translatedOptimizationFocus, setTranslatedOptimizationFocus] = useState('');
    const [translatedDescription, setTranslatedDescription] = useState('');

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
      useSensor(TouchSensor)
    );
    
    // Handle language change
    const handleLanguageChange = async (newLanguage) => {
      setCurrentLanguage(newLanguage);
      
      if (newLanguage === 'en') {
        setTranslations(defaultTranslations);
        // Reset to original content for English
        setTranslatedQuestion(currentQuestion?.text || '');
        setTranslatedOptimizationFocus(currentQuestion?.optimizationFocus || '');
        setTranslatedDescription(architectureInfo?.description || '');
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
        
        // Also translate dynamic content
        if (currentQuestion?.text) {
          const translatedText = await translateText(currentQuestion.text, newLanguage);
          setTranslatedQuestion(translatedText);
        }
        
        if (currentQuestion?.optimizationFocus) {
          const translatedFocus = await translateText(currentQuestion.optimizationFocus, newLanguage);
          setTranslatedOptimizationFocus(translatedFocus);
        }
        
        if (architectureInfo?.description) {
          const translatedDesc = await translateText(architectureInfo.description, newLanguage);
          setTranslatedDescription(translatedDesc);
        }
      } catch (error) {
        console.error('Translation error:', error);
      }
    };

    const loadNextArchitecture = useCallback(async () => {
      if (!FUNCTION_KEY) {
        setError("Azure Function key is not configured");
        setIsLoading(false);
        return;
      }
      
      setScore(0); // Reset score when loading new architecture
      if (isLoading) return;
      setIsLoading(true);
      setError(null);

      let attempt = 0;
      let isValid = false;
      let data = null;
      let maxAttempts = 7;

      while (!isValid && attempt < maxAttempts) {
        try {
          console.log(`🔄 Attempt ${attempt + 1}: Fetching architecture data...`);
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-functions-key': FUNCTION_KEY
            },
            body: JSON.stringify({ difficulty })
          });

          if (response.status === 503) {
            console.warn("⚠️ Received 503 error. Retrying in 3 seconds...");
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

          data = await response.json();
          console.log('Raw AI Response:', JSON.stringify(data, null, 2));
          console.log("📥 Received AI Response:", JSON.stringify(data, null, 2));

          isValid = isValidArchitecture(data);

          if (!isValid) {
            console.warn(`⛔ Invalid JSON structure. Retrying in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            console.log("✅ Valid architecture received, updating state...");
            break;
          }
        } catch (error) {
          console.error("❌ Failed to load architecture:", error);
          if (attempt >= maxAttempts - 1) {
            setError(error.message);
            setIsLoading(false);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retrying
        }

        attempt++;
      }

      if (!isValid) {
        console.error("❌ Maximum retries reached. Unable to get valid JSON.");
        setError("Failed to fetch a valid architecture after multiple attempts.");
        setIsLoading(false);
        return;
      }

      const transformedServices = data.services.map(serviceName => ({
        id: serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: serviceName,
        icon: getServiceIcon(serviceName)
      }));

      setArchitecture({
        services: transformedServices,
        connections: data.connections
      });

      if (data.missingServices?.length > 0) {
        const currentMissingService = data.missingServices[0];
        setCurrentQuestion({
          text: currentMissingService.question,
          optimizationFocus: currentMissingService.optimizationFocus,
          options: currentMissingService.options.map(opt => ({
            id: opt.service.toLowerCase().replace(/\s+/g, '-'),
            name: opt.service,
            isCorrect: opt.isCorrect,
            isOptimal: opt.isOptimal,
            explanation: opt.explanation,
            rating: opt.rating,
            icon: getServiceIcon(opt.service)
          }))
        });
      }

      setArchitectureInfo({
        name: data.architecture.name,
        description: data.architecture.description,
        missingServices: data.missingServices
      });

      setCurrentMissingServiceIndex(0);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
      setElapsedTime(0);
      setIsLoading(false);
    }, [difficulty]);

    const handleServiceSelection = (selectedService) => {
      if (!architectureInfo?.missingServices) return;
      
      const currentMissingService = architectureInfo.missingServices[currentMissingServiceIndex];
      const selectedOption = currentMissingService.options.find(opt => opt.service === selectedService);
      const correctOption = currentMissingService.options.find(opt => opt.isCorrect);
      const optimalOption = currentMissingService.options.find(opt => opt.isOptimal);

      if (selectedOption) {
        setShowFeedback(true);
        if (selectedOption.isCorrect) {
          // Calculate points based on whether it's optimal or just correct
          const points = selectedOption.isOptimal ? 5 : 2;
          
          setScore(prevScore => {
            const newScore = prevScore + points;
            // Check if we've reached the maximum possible score for current difficulty
            if (newScore === getMaxPossibleScore(difficulty)) {
              setShowFireworks(true);
              setTimeout(() => setShowFireworks(false), 5000);
            }
            return newScore;
          });
          
          if (selectedOption.isOptimal) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }

          setFeedback({
            isCorrect: true,
            message: selectedOption.explanation,
            points: points,
            isOptimal: selectedOption.isOptimal,
            optimalSolution: !selectedOption.isOptimal ? optimalOption.service : null,
            optimalExplanation: !selectedOption.isOptimal ? optimalOption.explanation : null
          });
        } else {
          setShowSadFace(true);
          setTimeout(() => setShowSadFace(false), 4000);

          setFeedback({
            isCorrect: false,
            message: `<div class="feedback-explanation">
              <p>${selectedOption.explanation}</p>
              <div class="correct-answer-wrapper">
                <p class="correct-answer-section">
                  <span style="color: lime; font-weight: bold;">The correct answer was: </span>
                  <strong>${correctOption.service}</strong>. ${correctOption.explanation}
                </p>
              </div>
            </div>`,
            points: 0,
            correctAnswer: correctOption.service
          });
        }
      }
    };

    const handleNext = () => {
      if (!architectureInfo?.missingServices) return;
      
      setShowFeedback(false);
      if (currentMissingServiceIndex < architectureInfo.missingServices.length - 1) {
        const nextIndex = currentMissingServiceIndex + 1;
        setCurrentMissingServiceIndex(nextIndex);
        
        const nextMissingService = architectureInfo.missingServices[nextIndex];
        setCurrentQuestion({
          text: nextMissingService.question,
          optimizationFocus: nextMissingService.optimizationFocus,
          options: nextMissingService.options.map(opt => ({
            id: opt.service.toLowerCase().replace(/\s+/g, '-'),
            name: opt.service,
            isCorrect: opt.isCorrect,
            isOptimal: opt.isOptimal,
            explanation: opt.explanation,
            rating: opt.rating,
            icon: getServiceIcon(opt.service)
          }))
        });
        setQuestionStartTime(Date.now());
        setElapsedTime(0);
      }
    };

    const handleDifficultyChange = (level) => {
      setDifficulty(level);
    };

    useEffect(() => {
      if (currentQuestion && !questionStartTime) {
        setQuestionStartTime(Date.now());
      }

      const timer = setInterval(() => {
        if (questionStartTime && !showFeedback) {
          const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [currentQuestion, questionStartTime, showFeedback]);

    // Add useEffect to translate dynamic content when it changes
    useEffect(() => {
      if (currentLanguage !== 'en') {
        // Translate question when it changes
        if (currentQuestion?.text) {
          translateText(currentQuestion.text, currentLanguage)
            .then(translated => setTranslatedQuestion(translated))
            .catch(error => console.error('Translation error:', error));
        }
        
        // Translate optimization focus when it changes
        if (currentQuestion?.optimizationFocus) {
          translateText(currentQuestion.optimizationFocus, currentLanguage)
            .then(translated => setTranslatedOptimizationFocus(translated))
            .catch(error => console.error('Translation error:', error));
        }
        
        // Translate architecture description when it changes
        if (architectureInfo?.description) {
          translateText(architectureInfo.description, currentLanguage)
            .then(translated => setTranslatedDescription(translated))
            .catch(error => console.error('Translation error:', error));
        }
      } else {
        // For English, use original text
        setTranslatedQuestion(currentQuestion?.text || '');
        setTranslatedOptimizationFocus(currentQuestion?.optimizationFocus || '');
        setTranslatedDescription(architectureInfo?.description || '');
      }
    }, [currentQuestion, architectureInfo, currentLanguage]);

    return (
      <DndProvider backend={HTML5Backend}>
        <DndContext sensors={sensors}>
          <div className="game-container">
            <div className="game-header">
              <h2 className="game-title">{translations.gameTitle}</h2>
              <div className="game-stats">
                <div className="score">{translations.score}: {score}</div>
                <div className="complexity">
                  <span className="complexity-icon">🎯</span>
                  {translations[difficulty.toLowerCase()]}
                </div>
                {currentQuestion && !showFeedback && (
                  <div className={`timer ${
                    elapsedTime > 60 ? 'danger' : 
                    elapsedTime > 30 ? 'warning' : ''
                  }`}>
                    <span className="timer-icon">⏱️</span>
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              <button 
                className="new-architecture-button"
                onClick={loadNextArchitecture}
                disabled={isLoading}
              >
                {isLoading ? translations.loading : translations.newArchitecture}
              </button>
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                style={{
                  marginLeft: '10px',
                  color: '#00ffff',
                  border: '1px solid #00ffff',
                  borderRadius: '5px',
                  padding: '5px',
                  backgroundColor: 'rgba(0, 40, 56, 0.8)',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer',
                  '& select': {
                    color: '#00ffff',
                    backgroundColor: 'transparent'
                  },
                  '& option': {
                    backgroundColor: 'rgba(0, 40, 56, 0.8)',
                    color: '#00ffff'
                  }
                }}
              />
            </div>
            
            {architectureInfo && <p className="architecture-description">
              {currentLanguage === 'en' ? architectureInfo.description : translatedDescription}
            </p>}
            
            {error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <AzureArchitectureDisplay 
                  architecture={architecture}
                  currentQuestion={currentQuestion}
                  currentLanguage={currentLanguage}
                />
                
                {currentQuestion && (
                  <div className="question-container">
                    <h3 className="question-label">
                      <span className="highlight">{translations.question}:  </span> 
                      {currentLanguage === 'en' ? currentQuestion.text : translatedQuestion}
                    </h3>
                    <p className="optimization-focus-label">
                      <span className="highlight">{translations.optimizationFocus}:  </span> 
                      {currentLanguage === 'en' ? currentQuestion.optimizationFocus : translatedOptimizationFocus}
                    </p>
                    
                    {showFeedback ? (
                      <div className={`feedback-modal ${feedback.isCorrect ? 'correct' : 'incorrect'} ${feedback.isOptimal ? 'optimal' : ''}`}>
                        {showSadFace && (
                          <div className="sad-face-overlay">
                            <span role="img" aria-label="sad face" className="sad-face">😢</span>
                          </div>
                        )}
                        <div className="feedback-content">
                          {feedback.isCorrect ? (
                            <>
                              <h3>🎉 {translations.correctPoints.replace('{points}', feedback.points)}</h3>
                              {feedback.isOptimal ? (
                                <p>🌟 {translations.perfectChoice}</p>
                              ) : (
                                <>
                                  <p>⚠️ {translations.notOptimal}</p>
                                  <p><span style={{ color: 'green' }}>{translations.optimalAnswer}</span> {feedback.optimalSolution}.</p>
                                </>
                              )}
                            </>
                          ) : (
                            <h3>❌ {translations.notCorrect}</h3>
                          )}
                          <p dangerouslySetInnerHTML={{ __html: feedback.message }}></p>
                          
                          {currentMissingServiceIndex < (architectureInfo?.missingServices?.length - 1) && (
                            <button 
                              className="next-button"
                              onClick={handleNext}
                            >
                              {translations.nextService
                                .replace('{current}', currentMissingServiceIndex + 2)
                                .replace('{total}', architectureInfo?.missingServices?.length)}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="service-options">
                        {currentQuestion.options.map((option, index) => (
                          <DraggableService
                            key={`${option.id}-${index}`}
                            service={option}
                            onClick={() => handleServiceSelection(option.name)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            <div className="game-status">
              <div className="progress">
                {architectureInfo?.missingServices ? 
                  translations.service
                    .replace('{current}', currentMissingServiceIndex + 1)
                    .replace('{total}', architectureInfo.missingServices.length) :
                  translations.learnAndHaveFun
                }
              </div>
            </div>

            {(!architecture?.services || 
             (currentMissingServiceIndex === architectureInfo?.missingServices?.length - 1 && showFeedback)) && (
              <div className="difficulty-selection">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
                  <button
                    key={level}
                    className={`difficulty-button ${difficulty === level ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange(level)}
                  >
                    {translations[level.toLowerCase()]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <br></br>
          <center>
            <img 
              src="https://azurehackthonsep2025.blob.core.windows.net/azure-cloud-hub-games-ep/azure_futuristic_icon.png"
              alt="Loading..." 
              style={{ 
                width: '1200px',
                height: '900px',
                verticalAlign: 'middle',
                display: 'inline-block',
                borderRadius: '50px'
              }} 
            />
          </center>
          {showConfetti && (
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 'var(--z-index-confetti)'
              }} 
            />
          )}
          {showFireworks && (
            <ReactConfetti
              width={width}
              height={height}
              recycle={true}
              numberOfPieces={500}
              colors={['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF']}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 'var(--z-index-confetti)'
              }}
            />
          )}
        </DndContext>
      </DndProvider>
    );
};

export default AzureArchitectureGame;