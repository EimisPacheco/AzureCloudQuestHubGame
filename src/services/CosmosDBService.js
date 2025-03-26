// No need to import CosmosClient anymore
class CosmosDBService {
    constructor() {
        // Define the function URLs - update with your actual URLs
        this.saveScoreUrl = process.env.REACT_APP_FUNCTION_SAVE_SCORE_URL;
        this.getLeaderboardUrl = process.env.REACT_APP_FUNCTION_LEADERBOARD_URL;
        
        // Use localStorage in development
        this.useLocalStorage = process.env.NODE_ENV === 'development' && 
                               (!this.saveScoreUrl || !this.getLeaderboardUrl);
        
        if (this.useLocalStorage) {
            console.warn("Using localStorage for score storage during development");
        } else if (!this.saveScoreUrl || !this.getLeaderboardUrl) {
            console.warn("Azure Functions URLs not configured - using mock data");
        } else {
            console.log("Azure Functions API initialized successfully");
        }
    }

    async saveGameScore(nickname, gameType, score, metadata = {}) {
        // Use localStorage in development
        if (this.useLocalStorage) {
            console.log(`[LocalStorage] Saving score: ${nickname}, ${gameType}, ${score}`);
            const timestamp = new Date().toISOString();
            const scoreData = {
                id: `${nickname}_${gameType}_${timestamp}`,
                nickname,
                gameType,
                score,
                timestamp,
                ...metadata
            };
            
            const existingScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
            existingScores.push(scoreData);
            localStorage.setItem('gameScores', JSON.stringify(existingScores));
            
            console.log("Score saved to localStorage:", scoreData);
            return scoreData;
        }
        
        // Use function API in production
        if (!this.saveScoreUrl) {
            console.log(`[Mock API] Would save score: ${nickname}, ${gameType}, ${score}`);
            return { id: "mock-id", success: false, message: "Function API not configured" };
        }
        
        try {
            const timestamp = new Date().toISOString();
            const scoreData = {
                nickname,
                gameType,
                score,
                timestamp,
                metadata
            };
            
            const response = await fetch(this.saveScoreUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scoreData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`Successfully saved score for ${nickname} in ${gameType}:`, result);
            return result;
        } catch (error) {
            console.error("Error saving score to Function API:", error);
            return { id: "error-id", success: false, error: error.message };
        }
    }

    async getLeaderboard(gameType, limit = 5) {
        // Use localStorage in development
        if (this.useLocalStorage) {
            console.log(`[LocalStorage] Getting leaderboard for: ${gameType}`);
            const allScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
            const leaderboard = allScores
                .filter(score => score.gameType === gameType)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
            
            console.log("Leaderboard from localStorage:", leaderboard);
            return leaderboard;
        }
        
        // Use function API in production
        if (!this.getLeaderboardUrl) {
            console.log(`[Mock API] Would get leaderboard for: ${gameType}`);
            return [{ nickname: "Example", score: 100, timestamp: new Date().toISOString() }];
        }
        
        try {
            const url = `${this.getLeaderboardUrl}&gameType=${encodeURIComponent(gameType)}&limit=${limit}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Leaderboard retrieved for ${gameType}:`, data);
            return data;
        } catch (error) {
            console.error("Error retrieving leaderboard from Function API:", error);
            return [];
        }
    }
}

export default new CosmosDBService(); 