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
        this.moveTimer = 0;
        this.moveSpeed = 20; // Higher number = slower movement
        this.isPaused = false;
        this.isPromptShowing = false;
        this.isRestartPrompt = false;
        this.targetPositionReached = false; // Track if position was reached
        
        // Setup canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI elements
        this.messageBox = document.getElementById('message-box');
        this.messageText = document.getElementById('message-text');
        this.messageButton = document.getElementById('message-button');
        this.scoreDisplay = document.getElementById('score-display');
        this.scoreDisplay.textContent = this.formatTime(this.timerSeconds);
        
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

            // Control movement speed with timer
            this.moveTimer++;
            if (this.moveTimer >= this.moveSpeed) {
                // Removed automatic movement when game is started
                this.moveTimer = 0;
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
        
        // Draw target position (green circle)
        this.targetPosition.draw(this.ctx, this.CELL_SIZE);
        
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
        this.showMessage("You hit a boundary! Would you like to restart the drill? Press SPACE or click Continue to restart, or ESC to end drill.");
    }
    
    handleTargetPositionReached() {
        // Only show message once when position is reached
        if (!this.targetPositionReached) {
            this.targetPositionReached = true;
            this.showMessage("You've reached the correct position! Now conduct your drill from here.");
        }
    }
    
    restartGame() {
        // Reset game state
        this.gameStarted = false;
        this.gameEnded = false;
        this.isPaused = false;
        this.isRestartPrompt = false;
        this.targetPositionReached = false; // Reset target position flag
        this.timerSeconds = 180; // Reset timer to 3 minutes
        this.frameCount = 0;
        this.moveTimer = 0;
        
        // Reset commander position
        this.commander = new Commander(6, 5, "right");
        
        // Update display
        this.scoreDisplay.textContent = this.formatTime(this.timerSeconds);
        
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
            this.showMessage("Execute your drill freely. You have 3 minutes to complete the exercise. Move to the green circle to take your position, then conduct the drill. Use arrow keys to move.");
        } else if (!this.gameEnded) {
            // Still in progress
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
    
    handleKeyDown(e) {
        // If a prompt is showing, check for spacebar to continue
        if (this.isPromptShowing && e.key === ' ') {
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