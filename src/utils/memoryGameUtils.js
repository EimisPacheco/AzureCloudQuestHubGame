/**
 * Utility functions for the Azure Icons Memory Game
 */

import { SERVICE_MAPPINGS } from '../services/IconResolver';

// Get a random selection of unique Azure services from SERVICE_MAPPINGS
export const getRandomAzureServices = (count = 12) => {
  // Get all service names (keys) from SERVICE_MAPPINGS
  const serviceNames = Object.keys(SERVICE_MAPPINGS);
  
  // Shuffle the array of service names
  const shuffled = [...serviceNames].sort(() => 0.5 - Math.random());
  
  // Take only the number of services we need
  return shuffled.slice(0, count);
};

// Create a deck of cards with pairs of Azure services
export const createCardDeck = (services) => {
  // Create pairs of each service
  const pairs = services.flatMap(service => [
    { id: `${service}-1`, service, path: SERVICE_MAPPINGS[service] },
    { id: `${service}-2`, service, path: SERVICE_MAPPINGS[service] }
  ]);
  
  // Shuffle the deck
  return pairs.sort(() => 0.5 - Math.random());
};

// Initialize a new game state
export const initializeGameState = (pairCount = 12) => {
  // Get random Azure services
  const selectedServices = getRandomAzureServices(pairCount);
  
  // Create and shuffle the card deck
  const deck = createCardDeck(selectedServices);
  
  // Create the initial game state
  return {
    cards: deck.map((card, index) => ({
      ...card,
      index,
      isFlipped: false,
      isMatched: false
    })),
    flippedCards: [],
    matchedPairs: [],
    isLocked: false,
    gameOver: false,
    timeLeft: 120 // 2 minutes in seconds
  };
};

// Format time as MM:SS
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Check if the game is over (all pairs found)
export const isGameComplete = (matchedPairs, totalPairs) => {
  return matchedPairs.length === totalPairs;
};

// Get the full icon URL for a service
export const getServiceIconUrl = (servicePath) => {
  const S3_BUCKET_URL = process.env.REACT_APP_AZURE_BUCKET_URL || '';
  const ICONS_BASE_PATH = process.env.REACT_APP_ICONS_BASE_PATH || '';
  
  return `${S3_BUCKET_URL}${ICONS_BASE_PATH}${servicePath}`;
};