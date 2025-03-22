# AFROTC Drill Simulator

A web-based simulation game that replicates AFROTC drill exercises. Players control a commander who leads a formation of cadets through drill commands, completing objectives within a time limit.

## Game Mechanics

- **Movement Controls**: Arrow keys to move the commander
- **Interaction**: Press F to interact with the evaluator (blue square with 'E')
- **Commander Controls**: 
  - SPACEBAR to perform an about-face (turn around)
  - Various letter keys to issue drill commands (see Commands section)
- **Objective**: Take position at the green circle, issue commands correctly, and complete the drill within the 3-minute time limit

## Commands System

The game implements a variety of AFROTC drill commands:
- **Z** - Fall In (required first command to form the flight)
- **A** - Attention
- **P** - Parade Rest
- **R** - Right Face
- **L** - Left Face
- **B** - About Face
- **M** - Forward March
- **H** - Halt

Commands follow proper state transitions, ensuring realistic drill procedures.

## Complete Project Structure

```
├── index.html          # Main HTML file with game container and instructions
├── README.md           # This documentation file
├── css/
│   └── styles.css      # CSS styling for game elements and UI
├── js/
│   ├── entities.js     # Entity classes (Commander, Evaluator, Cadet, TargetPosition)
│   └── game.js         # Main Game class and game logic
├── assets/             # Directory for potential future assets (images, sounds)
└── .git/               # Git repository data
```

## Detailed Code Organization

### HTML Structure (`index.html`)
- Main game container with canvas element
- Message box for in-game prompts
- Command list and instructions panel
- Script loading for JavaScript files

### CSS Styling (`css/styles.css`)
- Main layout and styling for the game interface
- Message box and UI component styling
- Command display formatting
- Responsive design considerations

### Entity Classes (`js/entities.js`)
- **Commander**: Player-controlled character
  - Movement and direction handling
  - Visual representation with arrow indicating direction
  
- **Evaluator**: NPC that interacts with the player
  - Interaction logic
  - Visual representation
  
- **Cadet**: Members of the formation
  - Individual state tracking (attention, parade rest, etc.)
  - Command response behavior
  - Special handling for the guidon bearer
  - Visual indicators for different states
  
- **TargetPosition**: Indicator for player positioning
  - Visual representation as a green circle

### Game Logic (`js/game.js`)
- **Game Class**: Central controller for all game elements
  - Game initialization and main loop
  - Canvas setup and rendering
  - Input handling and event listeners
  
- **State Management**:
  - Formation state tracking (line, column)
  - Flight state machine with valid transitions
  - Command validation and feedback
  
- **UI Management**:
  - Command display and feedback
  - Message system for instructions and evaluations
  - Timer and score tracking
  
- **Game Mechanics**:
  - Collision detection with walls and entities
  - Command issuance and propagation to cadets
  - Position tracking and validation
  - About-face and direction changes

## State System

The game implements a state machine for the flight formation:
- States include: none, Forming, Halted_In_Formation, Halted_At_Rest, etc.
- Commands trigger state transitions according to military drill rules
- Invalid command sequences are rejected with feedback

## How to Play

1. Open `index.html` in your web browser
2. Interact with the evaluator (blue square) to start the drill
3. Move to the green circle when instructed
4. Issue the "Fall In" command (Z key) to form your flight
5. Issue appropriate commands to direct your flight
6. Complete all objectives within the 3-minute time limit

## Browser Compatibility

The game uses standard HTML5 Canvas and JavaScript, compatible with modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Future Development Opportunities

Potential enhancements for future refactoring:
- **Code Architecture**:
  - Implement module bundling system (Webpack, Rollup)
  - Convert to TypeScript for better type safety
  - Add unit tests for game logic
  
- **Features**:
  - Additional drill commands and more complex formations
  - Multiple difficulty levels
  - Sound effects and voice commands
  - Animated transitions between states
  - Performance metrics and scoring system
  
- **UI/UX**:
  - Mobile-responsive design
  - Touch controls for mobile devices
  - Settings panel for customization
  - Tutorial mode for beginners

## Development

The codebase is structured for maintainability with separate concerns:
- Entity logic is isolated from game mechanics
- State transitions are clearly defined
- Canvas rendering is separated from game logic

A major refactoring could focus on:
1. Implementing ES6 modules for better code organization
2. Adding a proper asset loading system
3. Improving the state management architecture
4. Enhancing the command feedback system 