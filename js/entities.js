/**
 * Entity class for the Commander (player character)
 */
class Commander {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.segments = [{ x, y }]; // Single position
    }
    
    draw(ctx, cellSize) {
        const segment = this.segments[0];
        
        // Draw head as an arrow
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        
        ctx.fillStyle = "#0066cc";
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Rotate based on direction
        switch (this.direction) {
            case "up":
                ctx.rotate(0);
                break;
            case "right":
                ctx.rotate(Math.PI / 2);
                break;
            case "down":
                ctx.rotate(Math.PI);
                break;
            case "left":
                ctx.rotate(-Math.PI / 2);
                break;
        }
        
        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(0, -cellSize / 2 + 8); // Point
        ctx.lineTo(cellSize / 3 - 4, cellSize / 4 - 4); // Right corner
        ctx.lineTo(0, cellSize / 8); // Inset
        ctx.lineTo(-cellSize / 3 + 4, cellSize / 4 - 4); // Left corner
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * Entity class for the Evaluator (blue square that interacts with player)
 */
class Evaluator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    draw(ctx, cellSize) {
        // Draw evaluator (blue square)
        ctx.fillStyle = "#0099ff";
        ctx.fillRect(
            this.x * cellSize + 4, 
            this.y * cellSize + 4, 
            cellSize - 8, 
            cellSize - 8
        );
        
        // Draw "E" letter on evaluator
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            "E", 
            this.x * cellSize + cellSize / 2, 
            this.y * cellSize + cellSize / 2
        );
    }
}

/**
 * Entity class for the Cadets (the formation)
 */
class Cadet {
    constructor(x, y, isGuidon = false) {
        this.x = x;
        this.y = y;
        this.isGuidon = isGuidon;
    }
    
    draw(ctx, cellSize) {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        
        if (this.isGuidon) {
            // Draw guidon bearer with flag
            ctx.fillStyle = "#003366"; // Darker blue for guidon bearer
            ctx.fillRect(
                x + 8, 
                y + 8, 
                cellSize - 16, 
                cellSize - 16
            );
            
            // Draw guidon (flag)
            ctx.fillStyle = "#FF0000"; // Red for guidon
            
            // Flag pole
            ctx.fillRect(
                centerX - 1,
                y + 5,
                2,
                cellSize - 10
            );
            
            // Flag
            ctx.beginPath();
            ctx.moveTo(centerX, y + 5);
            ctx.lineTo(centerX + 10, y + 8);
            ctx.lineTo(centerX + 10, y + 16);
            ctx.lineTo(centerX, y + 18);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw regular cadet as a small square
            ctx.fillStyle = "#005599"; // Regular blue for cadets
            ctx.fillRect(
                x + 10, 
                y + 10, 
                cellSize - 20, 
                cellSize - 20
            );
        }
    }
}

/**
 * Entity class for the Target Position (green circle indicating destination)
 */
class TargetPosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    draw(ctx, cellSize) {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        const radius = cellSize / 3;
        
        // Draw green circle
        ctx.fillStyle = "rgba(0, 200, 0, 0.5)"; // Semi-transparent green
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = "#00AA00";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
} 