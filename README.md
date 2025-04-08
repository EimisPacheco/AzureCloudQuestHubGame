# AzureCloudQuestHubGame

# Inspiration  
I wanted to create a fun and engaging way for people to learn **Azure cloud concepts** by making the learning process interactive and enjoyable. I mixed my love for learning new skills with my passion for **Cloud architecture** to build a game that helps players practice real-world cloud skills in a playful and memorable way.

See video: https://vimeo.com/manage/videos/1070416234

# What it does  
**Azure CloudQuest Game** has 5 exciting modes:

### 🎯Azure Cloud Shooter - SkyStrike Mode  
This is a browser-based shooting game where players blast **Azure service icons**. The goal is to help players recognize Azure services and associate them with their categories through quick thinking and fast reactions.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/Rocket_options.png)

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/shooter1.png)

**Key Components:**
- Canvas-based game rendering  
- Player controls (mouse movement and clicking)  
- Scoring system  
- Sound effects and visual feedback  
- High score tracking  

**Gameplay Logic:**
- Gets all icons for the current service category (like Compute, Storage, AI, etc.)
- Gets icons from other categories  
- Randomly selects 4 unique icons from the current category (or all if fewer than 4)
- Randomly selects 6 unique icons from other categories  
- Uses a helper function to guarantee unique icon selection  

**Hit logic:**
- If the icon hit matches the target category:  
  - Player earns points (5 + height bonus)  
  - Shows positive feedback  
  - Plays correct sound  
  - Green explosion animation  
- If it doesn’t match:  
  - Player loses 5 points  
  - Shows negative feedback  
  - Plays error sound  

Includes multiple game states: name entry, spaceship selection, gameplay, and game over.

---
### 📄 Match Icons & Definitions - Match Definition Mode
Where players have to match Azure services with their definitions! The game creates 20 service names and their corresponding definitions using Azure OpenAI.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/definition-match1.png)


### 🧠 Icons Memory - Memory Match Mode
Test your memory by matching pairs of Azure service icons!

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/icon-memory.png)

---
### 🗂️ Azure Category Challenge - Speed Classification Mode
Test your knowledge by selecting all icons belonging to specific Azure categories.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/azure-category1.png)

---

### 🧩Architecture Puzzle - Architecture Builder Mode  
Players complete **Azure cloud architecture diagrams** by dragging the correct Azure service into a missing slot. The goal is to help users understand how services like **Azure Functions**, **Cosmos DB**, or **Blob Storage** fit into real-world scenarios.

- Players choose from Beginner, Intermediate, or Advanced difficulty.
- The architecture scenarios are **generated dynamically by an AI model** (powered by Azure OpenAI).

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/architecture-game2.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/architecture-game3.png)



# How I built it  
I built the game using:

- **Azure OpenAI** for the architecture generation (json file) and the 20 service names and definitions key pair (json file).

- **Azure AI services | Translator** to translate the text in Architecture Puzzle and Match Icons & Definitions games.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/translator1.png)

- **Azure Blob Storage** to host all game assets, icons, rocket images, sounds, etc.  

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/azure-icons.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/game-resources.png)

- **Azure Functions** to handle backend logic and process user actions. These also call the AI model.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/azure-functions.png)

- **Cosmos DB** to track player progress and stats, which are displayed on the leaderboards.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/CosmosDB.png)

- **GitHub Copilot and GitHub Copilot Azure** to help with writing dynamic game logic and speeding up development (especially helpful since I’m mainly a Python developer, not a React/JS expert) and other useful vs code extensions.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension1.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension2.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension3.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension4.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension5.png)

- **Azure App Service** to host the website.

# Challenges I ran into  
One challenge was keeping **low latency** between API Management and Azure Functions, especially for fast-paced gameplay. Another was fine-tuning difficulty levels so beginners don’t feel overwhelmed, but advanced users still feel challenged.

---

# Accomplishments I am proud of  
I’m really proud of integrating multiple **Azure services** into a smooth, interactive experience. The architecture builder mode came out great with personalized service options from the AI model. Plus, the **serverless architecture** kept everything lightweight and affordable.


# What I learned  
I learned a ton about optimizing Azure Functions and API Management for performance. I also learned how to personalize game experiences using intelligent service recommendations with **Github Copilot** and **Azure Copilot**.


# What's next for Azure CloudQuest  
Here’s what’s coming soon:

- Adding new games
