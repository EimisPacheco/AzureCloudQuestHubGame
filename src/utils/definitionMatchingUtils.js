import { SERVICE_MAPPINGS } from '../services/IconResolver';

// Use environment variables for the Azure function URL and key
const SERVICES_FUNCTION_URL = process.env.REACT_APP_SERVICES_FUNCTION_URL;
const FUNCTION_KEY = process.env.REACT_APP_SERVICES_AZURE_FUNCTION_KEY;

// Replace the hardcoded SERVICE_DEFINITIONS with a function to fetch from Azure Function
let cachedDefinitions = null;

// Helper function to find the best matching icon for a service
const findBestMatchingIcon = (serviceName) => {
  // Direct match - check if the exact service name exists in mappings
  if (SERVICE_MAPPINGS[serviceName]) {
    return SERVICE_MAPPINGS[serviceName];
  }
  
  // Normalize the service name for better matching
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  
  // Find closest match by comparing normalized names
  const closestMatch = Object.keys(SERVICE_MAPPINGS).find(key => {
    return key.toLowerCase().replace(/\s+/g, '') === normalizedName;
  });
  
  if (closestMatch) {
    return SERVICE_MAPPINGS[closestMatch];
  }
  
  // If no match found, use a generic path based on service name
  return `/azure-icons/services/${serviceName.toLowerCase().replace(/\s+/g, '-')}.svg`;
};

export const getServiceDefinitions = async () => {
  console.log('🔄 Fetching service definitions...');
  
  // Use cached data if available to prevent unnecessary API calls
  if (cachedDefinitions) {
    console.log('📋 Using cached definitions:', cachedDefinitions.length, 'items');
    return cachedDefinitions;
  }

  try {
    if (!SERVICES_FUNCTION_URL || !FUNCTION_KEY) {
      throw new Error('Azure Function URL or key is not configured');
    }

    console.log('🌐 Calling Azure Function:', SERVICES_FUNCTION_URL);
    const response = await fetch(SERVICES_FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_KEY
      },
      body: JSON.stringify({ /* Add any necessary payload here */ })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📊 Raw Azure Function response:', data);
    console.log('📊 Response type:', typeof data);
    console.log('📊 Response is array:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      console.log('📊 First few items:', data.slice(0, 3));
    }
    
    // Format the data to match your expected structure
    const formattedData = data.map(item => {
      const iconPath = findBestMatchingIcon(item.service);
      console.log(`Service: ${item.service} -> Path: ${iconPath}`);
      
      return {
        name: item.service,
        definition: item.description,
        path: iconPath
      };
    });
    
    console.log('🔄 Formatted data examples:', formattedData.slice(0, 3));
    console.log('✅ Total service definitions:', formattedData.length);
    
    // Cache the data
    cachedDefinitions = formattedData;
    return formattedData;
  } catch (error) {
    console.error('❌ Error fetching service definitions:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      request: error.request ? 'Request was made but no response received' : 'No request was made'
    });
    
    // Fallback to hardcoded data in case of error
    console.log('⚠️ Using fallback data instead');
    return [
      {
        name: "Kubernetes Services",
        definition: "Simplifies deploying, managing, and scaling containerized applications",
        path: SERVICE_MAPPINGS["Kubernetes Services"] || "/azure-icons/services/kubernetes-services.svg"
      },
      {
        name: "Cognitive Services",
        definition: "Adds AI capabilities to applications through pre-built APIs",
        path: SERVICE_MAPPINGS["Cognitive Services"] || "/azure-icons/services/cognitive-services.svg"
      },
      {
        name: "Azure Functions",
        definition: "Event-driven, serverless compute service",
        path: SERVICE_MAPPINGS["Azure Functions"] || "/azure-icons/services/azure-functions.svg"
      }
    ];
  }
};

// Update the getRandomServices function to work with async data
export const getRandomServices = async (count = 10) => {
  const allServices = await getServiceDefinitions();
  const shuffled = [...allServices].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Update other functions that use SERVICE_DEFINITIONS
export const getRandomDefinition = async () => {
  const services = await getServiceDefinitions();
  const randomIndex = Math.floor(Math.random() * services.length);
  return {
    name: services[randomIndex].name,
    definition: services[randomIndex].definition
  };
};

// Check if the game is complete (all definitions matched)
export const isGameComplete = (matchedServices, totalServices) => {
  return matchedServices.length === totalServices;
};

// Format time as MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Calculate score based on correctness
export const calculateScore = (isCorrect) => {
  return isCorrect ? 20 : -5; // Correct: +20, Wrong: -5
}; 