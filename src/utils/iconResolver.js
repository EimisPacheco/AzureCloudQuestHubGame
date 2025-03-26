/**
 * Utility function to get Azure icon URLs
 * This resolves Azure service names to their corresponding icon paths
 */

export const getAzureIcon = (serviceName) => {
  // Convert service name to lowercase and replace spaces with hyphens for consistency
  const formattedName = serviceName.toLowerCase().replace(/\s+/g, '-');
  
  // Return the path to the icon in the public folder
  return `${process.env.PUBLIC_URL}/azure-icons/${formattedName}.svg`;
}; 