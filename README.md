# AFROTC Drill Simulator

A simple web-based game that simulates AFROTC drill exercises. The player controls a commander who leads a formation of cadets through a drill, collecting points and interacting with an evaluator.

## Game Mechanics

- Use arrow keys to move the commander
- Press F to interact with the evaluator (blue square with 'E')
- Press SPACEBAR to perform an about-face (turn around)
- Collect all 10 yellow points and return to the evaluator to complete the drill
- The commander's "tail" grows as points are collected

## Project Structure

The project has been refactored for better maintainability and organization:

```
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styles for the game
└── js/
    ├── entities.js     # Entity classes (Commander, Evaluator, Cadet)
    └── game.js         # Main Game class that controls game flow
```

### Code Organization

- **index.html**: Minimal HTML structure that loads the necessary CSS and JavaScript files
- **styles.css**: All styles moved from inline to a separate CSS file
- **entities.js**: Contains classes for game entities:
  - `Commander`: Player character with arrow head and segments
  - `Evaluator`: Blue square that interacts with the player
  - `Cadet`: Members of the formation, including guidon bearer
- **game.js**: Contains the main `Game` class that manages:
  - Game initialization and loop
  - Collision detection
  - User input handling
  - Game state management
  - Rendering

## How to Play

1. Open `index.html` in your web browser
2. Use arrow keys to navigate to the evaluator (blue square)
3. Press F to start the drill
4. Collect all 10 yellow points using the arrow keys
5. Return to the evaluator and press F to complete the drill

## Future Improvements

Possible enhancements for the game:

- Add more complex drill commands
- Implement a time limit or scoring system
- Add sound effects and animations
- Create multiple levels with different formations
- Add obstacles or specific drill patterns to follow 