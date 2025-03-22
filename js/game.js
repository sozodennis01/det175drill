class Game {
    constructor() {
        // Game Constants
        this.GRID_COLS = 13;
        this.GRID_ROWS = 10;
        this.CELL_SIZE = 40;
        this.CANVAS_WIDTH = 550;
        this.CANVAS_HEIGHT = 400;
        
        // Game state
        this.gameStarted = false;
        this.gameEnded = false;
        this.timerSeconds = 180; // 3 minutes in seconds
        this.lastDirection = null;
        this.moveSpeed = 20; // Higher number = slower movement
        this.isPaused = false;
        this.isPromptShowing = false;
        this.isRestartPrompt = false;
        this.targetPositionReached = false; // Track if position was reached
        
        // Formation state
        this.flightFormation = "none"; // Will be "line" or "column" after fallIn
        
        // Command state management
        this.currentCommand = "none";
        this.previousCommand = "none";
        this.commandHistory = [];
        this.commandFeedback = null; // For displaying feedback
        
        /**
         * Available commands:
         * - fallIn
         * - attention
         * - paradeRest
         * - rightFace
         * - leftFace
         * - aboutFace
         * - presentArms
         * - orderArms
         * - leftStep
         * - rightStep
         * - cover
         * - markTime
         * - halfStep
         * - forwardMarch
         * - columnLeft
         * - toTheRear
         * - rightFlank
         * - columnRight
         * - changeStep
         * - leftFlank
         * - halt
         */
        
        // Setup canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI elements
        this.messageBox = document.getElementById('message-box');
        this.messageText = document.getElementById('message-text');
        this.messageButton = document.getElementById('message-button');
        this.scoreDisplay = document.getElementById('score-display');
        this.scoreDisplay.textContent = this.formatTime(this.timerSeconds);
        this.commandDisplay = document.getElementById('command-display');
        if (!this.commandDisplay) {
            // Create the command display if it doesn't exist
            this.createCommandDisplay();
        }
        
        // Game entities
        this.commander = new Commander(6, 5, "right");
        this.evaluator = new Evaluator(0, 0);
        this.flightOfCadets = this.createCadetFormation();
        
        // Create target position (green circle)
        // Two spaces from left side of flight, one row from bottom of grid
        const leftmostFlightCol = this.GRID_COLS - 2; // Leftmost column of flight
        const targetX = leftmostFlightCol - 2; // Two spaces left of flight
        const targetY = this.GRID_ROWS - 2; // Two row from bottom
        this.targetPosition = new TargetPosition(targetX, targetY);
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.closeMessage = this.closeMessage.bind(this);
        
        // Initialize
        this.init();
    }
    
    // Create command display UI
    createCommandDisplay() {
        // Create a new element for command display
        this.commandDisplay = document.createElement('div');
        this.commandDisplay.id = 'command-display';
        this.commandDisplay.style.position = 'absolute';
        this.commandDisplay.style.top = '10px';
        this.commandDisplay.style.right = '10px';
        this.commandDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.commandDisplay.style.color = 'white';
        this.commandDisplay.style.padding = '10px';
        this.commandDisplay.style.borderRadius = '5px';
        this.commandDisplay.style.fontFamily = 'Arial, sans-serif';
        this.commandDisplay.style.zIndex = '1000';
        this.commandDisplay.style.minWidth = '200px';
        
        // Create sections for current and previous commands
        const currentCommandSection = document.createElement('div');
        currentCommandSection.id = 'current-command';
        currentCommandSection.innerHTML = '<strong>Current Command:</strong> None';
        
        const previousCommandSection = document.createElement('div');
        previousCommandSection.id = 'previous-command';
        previousCommandSection.innerHTML = '<strong>Previous Command:</strong> None';
        
        const formationSection = document.createElement('div');
        formationSection.id = 'formation-status';
        formationSection.innerHTML = '<strong>Formation:</strong> None';
        
        const feedbackSection = document.createElement('div');
        feedbackSection.id = 'command-feedback';
        feedbackSection.innerHTML = '';
        
        // Add sections to command display
        this.commandDisplay.appendChild(currentCommandSection);
        this.commandDisplay.appendChild(previousCommandSection);
        this.commandDisplay.appendChild(formationSection);
        this.commandDisplay.appendChild(feedbackSection);
        
        // Add command display to the document
        document.body.appendChild(this.commandDisplay);
    }
    
    // Update command display UI
    updateCommandDisplay() {
        if (!this.commandDisplay) return;
        
        // Format the command text nicely
        const formatCommand = (cmd) => {
            if (cmd === "none") return "None";
            
            // Convert camelCase to Title Case With Spaces
            return cmd
                .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
        };
        
        // Update current command
        const currentCommandElement = document.getElementById('current-command');
        if (currentCommandElement) {
            currentCommandElement.innerHTML = `<strong>Current Command:</strong> ${formatCommand(this.currentCommand)}`;
        }
        
        // Update previous command
        const previousCommandElement = document.getElementById('previous-command');
        if (previousCommandElement) {
            previousCommandElement.innerHTML = `<strong>Previous Command:</strong> ${formatCommand(this.previousCommand)}`;
        }
        
        // Update formation status
        const formationElement = document.getElementById('formation-status');
        if (formationElement) {
            const formationText = this.flightFormation === "none" ? "None" : 
                                 this.flightFormation === "line" ? "Line Formation" : "Column Formation";
            formationElement.innerHTML = `<strong>Formation:</strong> ${formationText}`;
        }
        
        // Update feedback if any
        const feedbackElement = document.getElementById('command-feedback');
        if (feedbackElement && this.commandFeedback) {
            feedbackElement.innerHTML = this.commandFeedback;
            
            // Clear feedback after 3 seconds
            setTimeout(() => {
                feedbackElement.innerHTML = '';
                this.commandFeedback = null;
            }, 3000);
        }
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    createCadetFormation() {
        const cadets = [];
        
        // Create 3x4 formation
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                cadets.push(new Cadet(
                    this.GRID_COLS - 2 + col,
                    this.GRID_ROWS - 4 + row,
                    false
                ));
            }
        }
        
        // Add guidon bearer
        cadets.push(new Cadet(
            this.GRID_COLS - 2,  // Aligned with leftmost column
            this.GRID_ROWS - 5,  // One row ahead of formation
            true                 // Is guidon bearer
        ));
        
        return cadets;
    }
    
    gameLoop() {
        if (this.gameEnded || this.isPaused) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        // Update timer if game has started
        if (this.gameStarted) {
            if (this.timerSeconds > 0) {
                if (this.frameCount % 60 === 0) { // Decrease timer every second (assuming 60 FPS)
                    this.timerSeconds--;
                    this.scoreDisplay.textContent = this.formatTime(this.timerSeconds);
                    
                    if (this.timerSeconds === 0) {
                        this.endDrill();
                    }
                }
                
                this.frameCount++;
            }
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `Time: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        // Draw grid
        this.drawGrid();
        
        // Draw game elements
        this.evaluator.draw(this.ctx, this.CELL_SIZE);
        
        // Draw cadets
        for (let cadet of this.flightOfCadets) {
            cadet.draw(this.ctx, this.CELL_SIZE);
        }
        
        // Draw target position (green circle) only if not yet reached or FALL IN not yet issued
        if (!(this.targetPositionReached && this.currentCommand === "fallIn")) {
            this.targetPosition.draw(this.ctx, this.CELL_SIZE);
        }
        
        // Draw commander last (on top)
        this.commander.draw(this.ctx, this.CELL_SIZE);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = "#ddd";
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.GRID_COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.GRID_ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.CANVAS_WIDTH, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    moveCommander() {
        // Store the current position
        const head = this.commander.segments[0];
        
        // Calculate new position
        let newX = head.x;
        let newY = head.y;
        
        switch (this.commander.direction) {
            case "up":
                newY--;
                break;
            case "down":
                newY++;
                break;
            case "left":
                newX--;
                break;
            case "right":
                newX++;
                break;
        }
        
        // Check for wall collisions if the game has started
        if (this.gameStarted) {
            if (newX < 0 || newX >= this.GRID_COLS || newY < 0 || newY >= this.GRID_ROWS) {
                this.handleWallCollision();
                return; // Don't move
            }
        } else {
            // Just enforce boundaries without stopping the game when not started
            if (newX < 0) newX = 0;
            if (newX >= this.GRID_COLS) newX = this.GRID_COLS - 1;
            if (newY < 0) newY = 0;
            if (newY >= this.GRID_ROWS) newY = this.GRID_ROWS - 1;
        }
        
        // Check for collision with evaluator
        if (newX === this.evaluator.x && newY === this.evaluator.y) {
            return; // Don't move
        }
        
        // Check for collision with cadets
        for (let cadet of this.flightOfCadets) {
            if (newX === cadet.x && newY === cadet.y) {
                return; // Don't move
            }
        }
        
        // Update commander position (maintaining just one segment)
        this.commander.segments = [{ x: newX, y: newY }];
        
        // Save this direction
        this.lastDirection = this.commander.direction;
        
        // Check if commander is at target position and give feedback if game has started
        if (this.gameStarted && newX === this.targetPosition.x && newY === this.targetPosition.y) {
            this.handleTargetPositionReached();
        }
    }
    
    handleWallCollision() {
        this.isPaused = true;
        this.isRestartPrompt = true;
        this.showMessage("You hit a boundary! Would you like to restart the drill? Press F or click Continue to restart, or ESC to end drill.");
    }
    
    handleTargetPositionReached() {
        // Only show message once when position is reached
        if (!this.targetPositionReached) {
            this.targetPositionReached = true;
            this.showMessage("You've reached the correct position! Now conduct your drill from here. Press 'Z' to issue the FALL IN command.");
        }
    }
    
    restartGame() {
        // Reset game state
        this.gameStarted = false;
        this.gameEnded = false;
        this.isPaused = false;
        this.isRestartPrompt = false;
        this.targetPositionReached = false; // Reset target position flag
        
        // Reset command state
        this.currentCommand = "none";
        this.previousCommand = "none";
        this.commandHistory = [];
        this.commandFeedback = null;
        
        // Reset formation state
        this.flightFormation = "none";
        
        this.timerSeconds = 180; // Reset timer to 3 minutes
        this.frameCount = 0;
        
        // Reset commander position
        this.commander = new Commander(6, 5, "right");
        
        // Reset cadet formation
        this.flightOfCadets = this.createCadetFormation();
        
        // Update display
        this.scoreDisplay.textContent = this.formatTime(this.timerSeconds);
        this.updateCommandDisplay();
        
        this.showMessage("Game restarted. Press F when adjacent to the evaluator to begin the drill.");
    }
    
    isAdjacentToEvaluator() {
        const head = this.commander.segments[0];
        
        // Check if commander is next to evaluator (including diagonals)
        const adjacentPositions = [
            { x: this.evaluator.x + 1, y: this.evaluator.y },     // Right
            { x: this.evaluator.x, y: this.evaluator.y + 1 },     // Down
            { x: this.evaluator.x + 1, y: this.evaluator.y + 1 }  // Bottom-right
        ];
        
        for (let pos of adjacentPositions) {
            if (head.x === pos.x && head.y === pos.y) {
                return true;
            }
        }
        
        return false;
    }
    
    interactWithEvaluator() {
        if (!this.isAdjacentToEvaluator()) {
            this.showMessage("You need to be adjacent to the evaluator to interact.");
            return;
        }
        
        if (!this.gameStarted) {
            // Start the drill
            this.gameStarted = true;
            this.frameCount = 0; // Initialize frame counter for timing
            
            const helpMessage = "Execute your drill freely. You have 3 minutes to complete the exercise. Move to the green circle to take your position, then conduct the drill.\n\n" +
                "FORMATION GUIDE:\n" +
                "- After 'FALL IN', your flight will be in LINE formation (side-by-side)\n" +
                "- After 'RIGHT FACE' or 'LEFT FACE', your flight will switch between LINE and COLUMN formation\n" +
                "- Use 'C' for Column Left and Shift+C for Column Right (maintains column formation)\n" +
                "- Use 'K' for Left Flank and Shift+K for Right Flank (maintains current formation)\n\n" +
                "Use arrow keys to move.";
            
            this.showMessage(helpMessage);
        } else if (!this.gameEnded) {
            // Still in progress
            //TODO end the drill evaluation if user confirms it
            this.showMessage(`Continue the drill. You have ${this.formatTime(this.timerSeconds)} remaining. Remember to move to the green circle position.`);
        }
    }
    
    endDrill() {
        this.gameEnded = true;
        this.showMessage("Time's up! Drill complete. Return to the evaluator for your assessment.");
    }
    
    showMessage(message) {
        this.messageText.textContent = message;
        this.messageBox.style.display = "block";
        this.isPromptShowing = true;
    }
    
    closeMessage() {
        this.messageBox.style.display = "none";
        this.isPromptShowing = false;
        
        // Handle restart if this was a restart prompt
        if (this.isRestartPrompt) {
            this.restartGame();
        }
    }
    
    // Issue a command to the flight
    issueCommand(command) {
        // Check if commander is at the target position for initial commands
        const head = this.commander.segments[0];
        const atTargetPosition = (head.x === this.targetPosition.x && head.y === this.targetPosition.y);
        
        // Validate command conditions
        if (!this.gameStarted) {
            this.showMessage("You must start the drill before issuing commands.");
            return false;
        }
        
        // For the first command (FALL IN), require being at target position
        if (this.currentCommand === "none" && command === "fallIn" && !atTargetPosition) {
            this.showMessage("You must be at the marked position (green circle) to issue the FALL IN command.");
            return false;
        }
        
        // For other commands, require FALL IN to be issued first
        if (this.currentCommand === "none" && command !== "fallIn") {
            this.showMessage("You must issue the FALL IN command before using other commands.");
            return false;
        }
        
        // Store the current command in history before changing it
        if (this.currentCommand !== "none") {
            this.previousCommand = this.currentCommand;
            this.commandHistory.push(this.currentCommand);
        }
        
        // Set the new command
        this.currentCommand = command;
        
        // Update formation state based on command
        this.updateFormationState(command);
        
        // Apply command to all cadets
        for (let cadet of this.flightOfCadets) {
            cadet.applyCommand(command);
        }
        
        // Set feedback message based on command
        this.setCommandFeedback(command);
        
        // Update the command display
        this.updateCommandDisplay();
        
        return true;
    }
    
    // Update formation state based on command
    updateFormationState(command) {
        // Initial formation state - FALL IN always creates a line formation
        if (command === "fallIn") {
            this.flightFormation = "line";
            return;
        }
        
        // Commands that change formation from line to column or vice versa
        if (this.flightFormation === "line") {
            // From line to column: right face or left face
            if (command === "rightFace" || command === "leftFace") {
                this.flightFormation = "column";
            }
        } else if (this.flightFormation === "column") {
            // From column to line: right face or left face (again)
            if (command === "rightFace" || command === "leftFace") {
                this.flightFormation = "line";
            }
        }
        
        // Column movements - these maintain column formation but change direction
        if (command === "columnLeft" || command === "columnRight") {
            // Ensure formation stays as column
            this.flightFormation = "column";
        }
        
        // Flank movements - these maintain formation but change direction
        if (command === "rightFlank" || command === "leftFlank") {
            // These commands don't change the formation type
        }
        
        // About face doesn't change formation type, just direction
    }
    
    // Set feedback for the current command
    setCommandFeedback(command) {
        let baseFeedback = "";
        
        switch (command) {
            case "fallIn":
                baseFeedback = "Flight, FALL IN!";
                break;
            case "attention":
                baseFeedback = "FLIGHT, ATTEN-HUT!";
                break;
            case "paradeRest":
                baseFeedback = "PARADE, REST!";
                break;
            case "rightFace":
                baseFeedback = "RIGHT, FACE!";
                break;
            case "leftFace":
                baseFeedback = "LEFT, FACE!";
                break;
            case "aboutFace":
                baseFeedback = "ABOUT, FACE!";
                break;
            case "forwardMarch":
                baseFeedback = "Forward, MARCH!";
                break;
            case "halt":
                baseFeedback = "Flight, HALT!";
                break;
            case "columnLeft":
                baseFeedback = "Column Left, MARCH!";
                break;
            case "columnRight":
                baseFeedback = "Column Right, MARCH!";
                break;
            case "rightFlank":
                baseFeedback = "Right Flank, MARCH!";
                break;
            case "leftFlank":
                baseFeedback = "Left Flank, MARCH!";
                break;
            // Add feedback for other commands
            default:
                baseFeedback = `Command: ${command} issued!`;
                break;
        }
        
        // Add formation information when appropriate
        if (command === "fallIn") {
            this.commandFeedback = `${baseFeedback} <span style="color:#99ccff">(Flight is now in Line Formation)</span>`;
        } else if (command === "rightFace" || command === "leftFace") {
            // Add information about the formation change
            const newFormation = this.flightFormation === "line" ? "Column" : "Line";
            this.commandFeedback = `${baseFeedback} <span style="color:#99ccff">(Flight is now in ${newFormation} Formation)</span>`;
        } else if (command === "columnLeft" || command === "columnRight") {
            this.commandFeedback = `${baseFeedback} <span style="color:#99ccff">(Maintaining Column Formation)</span>`;
        } else if (command === "rightFlank" || command === "leftFlank") {
            this.commandFeedback = `${baseFeedback} <span style="color:#99ccff">(Maintaining ${this.flightFormation === "line" ? "Line" : "Column"} Formation)</span>`;
        } else {
            this.commandFeedback = baseFeedback;
        }
    }
    
    handleKeyDown(e) {
        // If a prompt is showing, check for spacebar to continue
        if (this.isPromptShowing && (e.key === 'F' || e.key === 'f')) {
            this.closeMessage();
            return;
        }
        
        // If a prompt is showing and it's a restart prompt, check for ESC to end
        if (this.isPromptShowing && this.isRestartPrompt && e.key === 'Escape') {
            this.isRestartPrompt = false;
            this.closeMessage();
            this.endDrill();
            return;
        }
        
        // Don't process movement keys if game is paused
        if (this.isPaused) {
            return;
        }
        
        switch (e.key) {
            case 'ArrowUp':
                this.commander.direction = "up";
                this.moveCommander(); // Always move on arrow keys regardless of game state
                break;
            case 'ArrowDown':
                this.commander.direction = "down";
                this.moveCommander(); // Always move on arrow keys regardless of game state
                break;
            case 'ArrowLeft':
                this.commander.direction = "left";
                this.moveCommander(); // Always move on arrow keys regardless of game state
                break;
            case 'ArrowRight':
                this.commander.direction = "right";
                this.moveCommander(); // Always move on arrow keys regardless of game state
                break;
            case ' ': // Spacebar for about face
                this.performAboutFace();
                break;
            case 'f':
            case 'F':
                this.interactWithEvaluator();
                break;
                
            // Command keys
            case 'z':
            case 'Z':
                this.issueCommand("fallIn");
                break;
            case 'a':
            case 'A':
                this.issueCommand("attention");
                break;
            case 'p':
            case 'P':
                this.issueCommand("paradeRest");
                break;
            case 'r':
            case 'R':
                this.issueCommand("rightFace");
                break;
            case 'l':
            case 'L':
                this.issueCommand("leftFace");
                break;
            case 'b':
            case 'B':
                this.issueCommand("aboutFace");
                break;
            case 'm':
            case 'M':
                this.issueCommand("forwardMarch");
                break;
            case 'h':
            case 'H':
                this.issueCommand("halt");
                break;
            case 'c':
            case 'C':
                // Hold Shift for Column Right
                if (e.shiftKey) {
                    this.issueCommand("columnRight");
                } else {
                    this.issueCommand("columnLeft");
                }
                break;
            case 'k':
            case 'K':
                // Hold Shift for Right Flank
                if (e.shiftKey) {
                    this.issueCommand("rightFlank");
                } else {
                    this.issueCommand("leftFlank");
                }
                break;
            // Add more command keys as needed
        }
        
        // Redraw if game hasn't started
        if (!this.gameStarted) this.draw();
    }
    
    performAboutFace() {
        // Implement about face (turn around)
        switch (this.commander.direction) {
            case "up":
                this.commander.direction = "down";
                break;
            case "down":
                this.commander.direction = "up";
                break;
            case "left":
                this.commander.direction = "right";
                break;
            case "right":
                this.commander.direction = "left";
                break;
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Message box close button
        this.messageButton.addEventListener('click', this.closeMessage);
    }
}

// Start the game once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();
}); 