import { AZURE_ICON_CATEGORIES, SERVICE_MAPPINGS } from '../services/IconResolver';

// Constants
const AZURE_BUCKET_URL = process.env.REACT_APP_AZURE_BUCKET_URL;
const ICONS_BASE_PATH = process.env.REACT_APP_ICONS_BASE_PATH;

/**
 * Get a random category and its icons
 * @returns {Object} Object containing category name, display name, and icons
 */
export const getRandomCategory = () => {
  // Get all categories
  const categories = Object.keys(AZURE_ICON_CATEGORIES);
  
  // Keep trying until we find a category with enough icons
  let attempts = 0;
  let categoryIcons = [];
  let randomCategory = '';
  let categoryPath = '';
  
  // Try to find a category with at least 5 icons (3 attempts max)
  while (categoryIcons.length < 5 && attempts < 3) {
    randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Format display name
    const displayName = randomCategory.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Get the category path
    categoryPath = AZURE_ICON_CATEGORIES[randomCategory];
    
    // Get all icons for this category
    categoryIcons = getCategoryIcons(categoryPath);
    attempts++;
  }
  
  // If we couldn't find a good category, use the last one tried anyway
  
  // Get some random icons from other categories as distractors
  const distractorIcons = getDistractorIcons(categoryPath, 25 - categoryIcons.length);
  
  // Combine and shuffle all icons
  const allIcons = [...categoryIcons, ...distractorIcons].sort(() => 0.5 - Math.random());
  
  // Get the display name
  const displayName = randomCategory.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  console.log(`Selected category: ${displayName} with ${categoryIcons.length} icons`);
  console.log(`Target icons:`, categoryIcons.map(icon => icon.name));
  
  return {
    category: categoryPath,
    displayName: displayName,
    icons: allIcons,
    targetIcons: categoryIcons.map(icon => icon.name)
  };
};

/**
 * Get all icons for a specific category
 * @param {String} categoryPath The category path
 * @returns {Array} Array of icon objects
 */
export const getCategoryIcons = (categoryPath) => {
  return Object.entries(SERVICE_MAPPINGS)
    .filter(([_, path]) => path.includes(categoryPath))
    .slice(0, 10) // Get up to 10 icons from the category
    .map(([name, path]) => ({
      name: name,
      path: path,
      isTarget: true
    }));
};

/**
 * Get random icons from other categories as distractors
 * @param {String} excludeCategoryPath The category path to exclude
 * @param {Number} count Number of distractor icons to get
 * @returns {Array} Array of icon objects
 */
export const getDistractorIcons = (excludeCategoryPath, count) => {
  // Get icons from other categories
  const otherIcons = Object.entries(SERVICE_MAPPINGS)
    .filter(([_, path]) => !path.includes(excludeCategoryPath))
    .map(([name, path]) => ({
      name: name,
      path: path,
      isTarget: false
    }));
  
  // Shuffle and take the requested number
  return otherIcons
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
};

/**
 * Check if the selected icons match the target icons
 * @param {Array} selectedIcons Array of selected icon names
 * @param {Array} targetIcons Array of target icon names
 * @returns {Boolean} True if selections match targets
 */
export const checkSelectionComplete = (selectedIcons, targetIcons) => {
  // Check if all target icons are selected (and no extras)
  return (
    targetIcons.every(icon => selectedIcons.includes(icon)) && 
    selectedIcons.every(icon => targetIcons.includes(icon))
  );
};

// Ensure the scoring logic is consistent with our UI
// Add this function if it doesn't exist, or update it if it does
export const calculateScore = (isCorrect) => {
  return isCorrect ? 20 : -5; // Correct: +20, Wrong: -5
};

// If there is a calculateBonus function, remove it or replace it with:
export const calculateBonus = () => {
  return 20; // Fixed bonus for completing a category
}; 