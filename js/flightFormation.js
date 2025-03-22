// flightFormation.js - Handles flight formation and movement logic

class FlightFormation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Grid configuration (1 unit = 24 inches)
        this.gridSize = 16; // pixels per grid unit
        this.fieldWidth = canvas.width / this.gridSize;
        this.fieldHeight = canvas.height / this.gridSize;
        
        // Flight formation properties
        this.cadets = [];
        this.formed = false;
        this.position = { x: 10, y: 10 }; // Starting position
        this.direction = 0; // 0:up, 1:right, 2:down, 3:left (in degrees: 0, 90, 180, 270)
        
        // Formation dimensions
        this.rankSpacing = 40 / 24; // 40 inches in grid units
        this.fileSpacing = 40 / 24; // 40 inches in grid units
        
        // Movement properties
        this.speed = 2 / 60; // Units per frame at 60fps (2 units/second = 48 inches/second)
        this.isMoving = false;
        
        // Initialize cadets (4 ranks x 3 files = 12 cadets)
        this.reset();
    }
    
    reset() {
        this.cadets = [];
        this.formed = false;
        this.position = { x: 10, y: 10 };
        this.direction = 0;
        this.rankSpacing = 40 / 24;
        this.fileSpacing = 40 / 24;
        this.isMoving = false;
    }
    
    // Form cadets into a flight formation
    fallIn() {
        this.cadets = [];
        this.formed = true;
        
        // Create 4 ranks with 3 cadets in each
        for (let rank = 0; rank < 4; rank++) {
            for (let file = 0; file < 3; file++) {
                this.cadets.push({
                    rank,
                    file,
                    x: this.position.x + file * this.fileSpacing,
                    y: this.position.y + rank * this.rankSpacing,
                    color: rank === 0 && file === 1 ? '#ff0000' : '#002d72', // Flight commander in red
                    size: 0.5 // Size in grid units
                });
            }
        }
    }
    
    // Open ranks
    openRanks() {
        this.rankSpacing = 64 / 24; // 64 inches in grid units
        this.updateFormation();
    }
    
    // Close ranks
    closeRanks() {
        this.rankSpacing = 40 / 24; // 40 inches in grid units
        this.updateFormation();
    }
    
    // Turn 90 degrees left
    leftFace() {
        this.direction = (this.direction + 3) % 4;
        this.updateFormation();
    }
    
    // Turn 180 degrees
    aboutFace() {
        this.direction = (this.direction + 2) % 4;
        this.updateFormation();
    }
    
    // Begin moving forward
    forward() {
        this.isMoving = true;
    }
    
    // Right flank while marching
    rightFlank() {
        this.direction = (this.direction + 1) % 4;
    }
    
    // Left flank while marching
    leftFlank() {
        this.direction = (this.direction + 3) % 4;
    }
    
    // Column right movement
    columnRight() {
        // This is a complex movement that requires gradual adjustment of the formation
        this.direction = (this.direction + 1) % 4;
        // In a real implementation, you'd animate each cadet making the column right turn
    }
    
    // To the rear movement
    toTheRear() {
        this.direction = (this.direction + 2) % 4;
    }
    
    // Eyes right (visual only)
    eyesRight() {
        // Visual effect would be shown here
    }
    
    // Ready front (visual only)
    readyFront() {
        // Visual effect would be shown here
    }
    
    // Change step (visual only)
    changeStep() {
        // Visual effect would be shown here
    }
    
    // Stop marching
    halt() {
        this.isMoving = false;
    }
    
    // Right step march
    rightStep() {
        this.isMoving = true;
        // Store original direction to restore after right step
        this.originalDirection = this.direction;
        this.direction = (this.direction + 1) % 4; // Turn right
        this.rightStepCount = 0;
        this.maxRightSteps = 5; // Number of right steps to take
    }
    
    // Update the formation based on current position, direction, and spacing
    updateFormation() {
        if (!this.formed) return;
        
        this.cadets.forEach(cadet => {
            // Calculate position based on current direction
            switch (this.direction) {
                case 0: // Facing up
                    cadet.x = this.position.x + cadet.file * this.fileSpacing;
                    cadet.y = this.position.y + cadet.rank * this.rankSpacing;
                    break;
                case 1: // Facing right
                    cadet.x = this.position.x + cadet.rank * this.rankSpacing;
                    cadet.y = this.position.y + (2 - cadet.file) * this.fileSpacing;
                    break;
                case 2: // Facing down
                    cadet.x = this.position.x + (2 - cadet.file) * this.fileSpacing;
                    cadet.y = this.position.y + (3 - cadet.rank) * this.rankSpacing;
                    break;
                case 3: // Facing left
                    cadet.x = this.position.x + (3 - cadet.rank) * this.rankSpacing;
                    cadet.y = this.position.y + cadet.file * this.fileSpacing;
                    break;
            }
        });
    }
    
    // Update flight position based on movement
    update() {
        if (!this.formed) return;
        
        if (this.isMoving) {
            // Handle right step special case
            if (this.rightStepCount !== undefined) {
                this.rightStepCount++;
                if (this.rightStepCount >= this.maxRightSteps) {
                    this.isMoving = false;
                    this.direction = this.originalDirection;
                    this.rightStepCount = undefined;
                }
            }
            
            // Move in the current direction
            switch (this.direction) {
                case 0: // Up
                    this.position.y -= this.speed;
                    break;
                case 1: // Right
                    this.position.x += this.speed;
                    break;
                case 2: // Down
                    this.position.y += this.speed;
                    break;
                case 3: // Left
                    this.position.x -= this.speed;
                    break;
            }
            
            this.updateFormation();
        }
    }
    
    // Draw the flight formation on the canvas
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (for reference)
        this.drawGrid();
        
        // Draw path markers and checkpoints
        this.drawPathMarkers();
        
        // Draw cadets
        if (this.formed) {
            this.cadets.forEach(cadet => {
                this.ctx.beginPath();
                this.ctx.arc(
                    cadet.x * this.gridSize, 
                    cadet.y * this.gridSize, 
                    cadet.size * this.gridSize, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fillStyle = cadet.color;
                this.ctx.fill();
                this.ctx.closePath();
            });
        }
    }
    
    // Draw reference grid
    drawGrid() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= this.fieldWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.fieldHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    // Draw path markers and checkpoints
    drawPathMarkers() {
        // Draw starting position
        this.ctx.beginPath();
        this.ctx.arc(10 * this.gridSize, 10 * this.gridSize, 0.8 * this.gridSize, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#00aa00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Draw first crossover checkpoint
        this.ctx.beginPath();
        this.ctx.arc(20 * this.gridSize, 20 * this.gridSize, 0.8 * this.gridSize, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#aa0000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Draw second crossover checkpoint
        this.ctx.beginPath();
        this.ctx.arc(40 * this.gridSize, 40 * this.gridSize, 0.8 * this.gridSize, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#aa0000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Draw final position
        this.ctx.beginPath();
        this.ctx.arc(40 * this.gridSize, 45 * this.gridSize, 0.8 * this.gridSize, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#0000aa';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    // Check if flight has reached a checkpoint
    checkCheckpoint(checkpointX, checkpointY, tolerance = 1) {
        // Use the flight commander (first rank, second file) as reference
        const commander = this.cadets.find(c => c.rank === 0 && c.file === 1);
        if (!commander) return false;
        
        const distance = Math.sqrt(
            Math.pow(commander.x - checkpointX, 2) + 
            Math.pow(commander.y - checkpointY, 2)
        );
        
        return distance <= tolerance;
    }
    
    // Check if flight is in final position
    isInFinalPosition() {
        return this.checkCheckpoint(40, 45);
    }
}
