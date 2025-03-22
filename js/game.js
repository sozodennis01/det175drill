class Game {
    constructor() {
        // Game Constants
        this.GRID_COLS = 13;
        this.GRID_ROWS = 10;
        this.CELL_SIZE = 40;
        this.CANVAS_WIDTH = 550;
        this.CANVAS_HEIGHT = 400;
        
        // Game state
        this.score = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.returnToEvaluator = false;
        this.lastDirection = null;
        this.moveTimer = 0;
        this.moveSpeed = 10; // Higher number = slower movement
        
        // Setup canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI elements
        this.messageBox = document.getElementById('message-box');
        this.messageText = document.getElementById('message-text');
        this.messageButton = document.getElementById('message-button');
        this.scoreDisplay = document.getElementById('score-display');
        
        // Game entities
        this.commander = new Commander(6, 5, "right");
        this.evaluator = new Evaluator(10, 2);
        this.flightOfCadets = this.createCadetFormation();
        this.point = null;
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.closeMessage = this.closeMessage.bind(this);
        
        // Initialize
        this.init();
    }
    
    init() {
        this.spawnPoint();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    createCadetFormation() {
        const cadets = [];
        
        // Create 3x4 formation
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                cadets.push(new Cadet(
                    this.GRID_COLS - 4 + col,
                    this.GRID_ROWS - 5 + row,
                    false
                ));
            }
        }
        
        // Add guidon bearer
        cadets.push(new Cadet(
            this.GRID_COLS - 4,  // Aligned with leftmost column
            this.GRID_ROWS - 6,  // One row ahead of formation
            true                 // Is guidon bearer
        ));
        
        return cadets;
    }
    
    spawnPoint() {
        let validPosition = false;
        let newX, newY;
        
        while (!validPosition) {
            newX = Math.floor(Math.random() * this.GRID_COLS);
            newY = Math.floor(Math.random() * this.GRID_ROWS);
            
            // Check if position is free
            validPosition = true;
            
            // Not on commander
            for (let segment of this.commander.segments) {
                if (segment.x === newX && segment.y === newY) {
                    validPosition = false;
                    break;
                }
            }
            
            // Not on evaluator
            if (newX === this.evaluator.x && newY === this.evaluator.y) {
                validPosition = false;
            }
            
            // Not on flight of cadets
            for (let cadet of this.flightOfCadets) {
                if (newX === cadet.x && newY === cadet.y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        this.point = { x: newX, y: newY };
    }
    
    gameLoop() {
        if (!this.gameStarted || this.gameEnded) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        // Control movement speed with timer
        this.moveTimer++;
        if (this.moveTimer >= this.moveSpeed) {
            this.moveCommander();
            this.moveTimer = 0;
            this.checkCollisions();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
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
        
        // Draw point
        if (this.point && !this.gameEnded) {
            this.drawPoint();
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
    
    drawPoint() {
        this.ctx.fillStyle = "#ffcc00";
        this.ctx.fillRect(
            this.point.x * this.CELL_SIZE + 8, 
            this.point.y * this.CELL_SIZE + 8, 
            this.CELL_SIZE - 16, 
            this.CELL_SIZE - 16
        );
    }
    
    moveCommander() {
        // Store the current head position
        const head = this.commander.segments[0];
        
        // Calculate new head position
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
        
        // Enforce boundaries
        if (newX < 0) newX = 0;
        if (newX >= this.GRID_COLS) newX = this.GRID_COLS - 1;
        if (newY < 0) newY = 0;
        if (newY >= this.GRID_ROWS) newY = this.GRID_ROWS - 1;
        
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
        
        // Add new head position
        this.commander.segments.unshift({ x: newX, y: newY });
        
        // Remove tail if we're not growing
        if (this.commander.segments.length > this.score + 1) {
            this.commander.segments.pop();
        }
        
        // Save this direction
        this.lastDirection = this.commander.direction;
    }
    
    checkCollisions() {
        const head = this.commander.segments[0];
        
        // Check for point collision
        if (this.point && head.x === this.point.x && head.y === this.point.y) {
            this.score++;
            this.scoreDisplay.textContent = `Score: ${this.score}/10`;
            
            if (this.score === 10) {
                this.returnToEvaluator = true;
                this.showMessage("You've collected all 10 points! Return to the evaluator to complete the drill.");
            } else {
                this.spawnPoint();
            }
        }
        
        // Check for self-collision
        for (let i = 1; i < this.commander.segments.length; i++) {
            if (head.x === this.commander.segments[i].x && head.y === this.commander.segments[i].y) {
                this.showMessage("Watch out! You're colliding with your formation.");
                break;
            }
        }
    }
    
    isAdjacentToEvaluator() {
        const head = this.commander.segments[0];
        
        // Check if commander is next to evaluator (including diagonals)
        const adjacentPositions = [
            { x: this.evaluator.x - 1, y: this.evaluator.y },     // Left
            { x: this.evaluator.x + 1, y: this.evaluator.y },     // Right
            { x: this.evaluator.x, y: this.evaluator.y - 1 },     // Up
            { x: this.evaluator.x, y: this.evaluator.y + 1 },     // Down
            { x: this.evaluator.x - 1, y: this.evaluator.y - 1 }, // Top-left
            { x: this.evaluator.x + 1, y: this.evaluator.y - 1 }, // Top-right
            { x: this.evaluator.x - 1, y: this.evaluator.y + 1 }, // Bottom-left
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
            this.showMessage("Execute your drill freely. Collect 10 yellow points, then return to me. Use arrow keys to move.");
        } else if (this.returnToEvaluator) {
            // End the game
            this.gameEnded = true;
            let finalMessage = `Drill complete! Your score: ${this.score}/10.`;
            
            if (this.score === 10) {
                finalMessage += " Perfect performance!";
            }
            
            this.showMessage(finalMessage);
        } else {
            // Still in progress
            this.showMessage(`Continue the drill. Collect all 10 points first. Current score: ${this.score}/10`);
        }
    }
    
    showMessage(message) {
        this.messageText.textContent = message;
        this.messageBox.style.display = "block";
    }
    
    closeMessage() {
        this.messageBox.style.display = "none";
    }
    
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
                this.commander.direction = "up";
                if (!this.gameStarted) this.moveCommander();
                break;
            case 'ArrowDown':
                this.commander.direction = "down";
                if (!this.gameStarted) this.moveCommander();
                break;
            case 'ArrowLeft':
                this.commander.direction = "left";
                if (!this.gameStarted) this.moveCommander();
                break;
            case 'ArrowRight':
                this.commander.direction = "right";
                if (!this.gameStarted) this.moveCommander();
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