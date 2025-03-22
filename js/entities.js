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
        this.direction = "left"; // All cadets initially face left
        this.falledIn = false; // Track if cadet has filled in after FALL IN command
    }
    
    draw(ctx, cellSize) {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        
        // Set color based on cadet type and filled in status
        if (this.falledIn) {
            // Green color when filled in after FALL IN command
            ctx.fillStyle = this.isGuidon ? "#006633" : "#00cc66"; // Darker green for guidon bearer
        } else {
            // Original blue color
            ctx.fillStyle = this.isGuidon ? "#003366" : "#005599"; // Darker blue for guidon bearer
        }
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // All cadets initially face left
        ctx.rotate(-Math.PI / 2);
        
        // Draw arrow (same as commander)
        ctx.beginPath();
        ctx.moveTo(0, -cellSize / 2 + 8); // Point
        ctx.lineTo(cellSize / 3 - 4, cellSize / 4 - 4); // Right corner
        ctx.lineTo(0, cellSize / 8); // Inset
        ctx.lineTo(-cellSize / 3 + 4, cellSize / 4 - 4); // Left corner
        ctx.closePath();
        ctx.fill();
        
        // If this is the guidon bearer, add the flag on top
        if (this.isGuidon) {
            // Draw guidon (flag) with higher contrast
            
            // Flag pole
            ctx.fillStyle = "#333333"; // Dark gray pole
            ctx.fillRect(
                -1,
                -cellSize / 2 + 5,
                2,
                cellSize - 10
            );
            
            // Flag background with outline
            ctx.beginPath();
            ctx.moveTo(0, -cellSize / 2 + 5);
            ctx.lineTo(12, -cellSize / 2 + 8);
            ctx.lineTo(12, -cellSize / 2 + 16);
            ctx.lineTo(0, -cellSize / 2 + 18);
            ctx.closePath();
            
            // Fill with slightly more saturated colors
            if (this.falledIn) {
                ctx.fillStyle = "#0055FF"; // Brighter blue when filled in
            } else {
                ctx.fillStyle = "#FF0000"; // Standard red
            }
            ctx.fill();
            
            // Add contrasting outline
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#FFFFFF"; // White outline for contrast
            ctx.stroke();
            
            // Add second outline in black for extra contrast
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = "#000000";
            ctx.stroke();
        }
        
        ctx.restore();
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