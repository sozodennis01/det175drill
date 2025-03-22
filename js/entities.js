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
    constructor(x, y, isGuidon = false, game = null) {
        this.x = x;
        this.y = y;
        this.isGuidon = isGuidon;
        this.direction = "left"; // All cadets initially face left
        this.currentCommand = "none"; // Default state
        this.commandHistory = []; // Track command history
        this.visualIndicator = null; // For storing color for command
        this.formationType = "none"; // "none", "line", or "column"
        this.game = game; // Reference to game for state information
        this.stanceOffset = 0; // For visualization of stance (attention vs rest)
        this.animationFrame = 0; // For marching animations
    }

    // Apply a command to the cadet
    applyCommand(command) {
        // Store previous command in history
        if (this.currentCommand !== "none") {
            this.commandHistory.push(this.currentCommand);
        }

        // Set new command
        this.currentCommand = command;

        // Update visual indicator for command feedback
        this.updateVisualIndicator();

        // Reset stance offset for new command
        this.resetStanceOffset(command);

        // Handle command-specific logic
        switch (command) {
            case "fallIn":
                // Logic for FALL IN command
                this.formationType = "line"; // FALL IN command puts flight in line formation
                break;
            case "attention":
                this.direction = "left"; // Face forward
                break;
            case "rightFace":
                // Rotate right 90 degrees
                switch (this.direction) {
                    case "left": this.direction = "up"; break;
                    case "up": this.direction = "right"; break;
                    case "right": this.direction = "down"; break;
                    case "down": this.direction = "left"; break;
                }

                // Update formation type after right face
                this.formationType = this.formationType === "line" ? "column" : "line";
                break;
            case "leftFace":
                // Rotate left 90 degrees
                switch (this.direction) {
                    case "left": this.direction = "down"; break;
                    case "down": this.direction = "right"; break;
                    case "right": this.direction = "up"; break;
                    case "up": this.direction = "left"; break;
                }

                // Update formation type after left face
                this.formationType = this.formationType === "line" ? "column" : "line";
                break;
            case "aboutFace":
                // Rotate 180 degrees
                switch (this.direction) {
                    case "left": this.direction = "right"; break;
                    case "right": this.direction = "left"; break;
                    case "up": this.direction = "down"; break;
                    case "down": this.direction = "up"; break;
                }
                // About face doesn't change formation type
                break;
            case "columnLeft":
                // Rotate left 90 degrees but maintain column formation
                switch (this.direction) {
                    case "left": this.direction = "down"; break;
                    case "down": this.direction = "right"; break;
                    case "right": this.direction = "up"; break;
                    case "up": this.direction = "left"; break;
                }
                this.formationType = "column"; // Ensure column formation
                break;
            case "columnRight":
                // Rotate right 90 degrees but maintain column formation
                switch (this.direction) {
                    case "left": this.direction = "up"; break;
                    case "up": this.direction = "right"; break;
                    case "right": this.direction = "down"; break;
                    case "down": this.direction = "left"; break;
                }
                this.formationType = "column"; // Ensure column formation
                break;
            case "rightFlank":
                // Rotate right 90 degrees without changing formation type
                switch (this.direction) {
                    case "left": this.direction = "up"; break;
                    case "up": this.direction = "right"; break;
                    case "right": this.direction = "down"; break;
                    case "down": this.direction = "left"; break;
                }
                // Formation type stays the same
                break;
            case "leftFlank":
                // Rotate left 90 degrees without changing formation type
                switch (this.direction) {
                    case "left": this.direction = "down"; break;
                    case "down": this.direction = "right"; break;
                    case "right": this.direction = "up"; break;
                    case "up": this.direction = "left"; break;
                }
                // Formation type stays the same
                break;
            // Add more commands as needed
        }
    }

    // Reset stance offset based on command
    resetStanceOffset(command) {
        switch (command) {
            case "attention":
                this.stanceOffset = 0; // At attention
                break;
            case "paradeRest":
                this.stanceOffset = 5; // Feet wider at parade rest
                break;
            case "forwardMarch":
                this.animationFrame = 0; // Reset animation frame for marching
                break;
            // Add other commands that affect stance
        }
    }

    // Update visual indicator based on current command
    updateVisualIndicator() {
        switch (this.currentCommand) {
            case "none":
                this.visualIndicator = null;
                break;
            case "fallIn":
                this.visualIndicator = "#00cc66"; // Green
                break;
            case "attention":
                this.visualIndicator = "#00cc66"; // Green
                break;
            case "rightFace":
                this.visualIndicator = "#00cc66"; // Green
                break;
            case "leftFace":
                this.visualIndicator = "#00cc66"; // Green
                break;
            case "aboutFace":
                this.visualIndicator = "#00cc66"; // Green
                break;
            case "paradeRest":
                this.visualIndicator = "#99ccff"; // Light blue
                break;
            case "forwardMarch":
                this.visualIndicator = "#66ff66"; // Bright green
                break;
            case "halt":
                this.visualIndicator = "#ff3333"; // Bright red
                break;
            case "columnLeft":
                this.visualIndicator = "#ffaa00"; // Orange
                break;
            case "columnRight":
                this.visualIndicator = "#ffaa00"; // Orange
                break;
            case "rightFlank":
                this.visualIndicator = "#ff00ff"; // Magenta
                break;
            case "leftFlank":
                this.visualIndicator = "#ff00ff"; // Magenta
                break;
            // Add more commands with visual indicators
        }
    }

    // Get previous command
    getPreviousCommand() {
        if (this.commandHistory.length > 0) {
            return this.commandHistory[this.commandHistory.length - 1];
        }
        return "none";
    }

    draw(ctx, cellSize) {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;

        // Set color based on cadet type and command state
        let baseColor;

        // Special case for FALL IN to maintain existing behavior
        if (this.currentCommand === "fallIn") {
            // Green color when filled in after FALL IN command
            baseColor = this.isGuidon ? "#006633" : "#00cc66"; // Darker green for guidon bearer
        } else if (this.visualIndicator) {
            // Use the visual indicator color based on current command
            baseColor = this.isGuidon ? this.darkenColor(this.visualIndicator) : this.visualIndicator;
        } else {
            // Original blue color
            baseColor = this.isGuidon ? "#003366" : "#005599"; // Darker blue for guidon bearer
        }

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

        // Apply state-specific visualizations if game reference exists
        if (this.game) {
            this.applyStateVisualization(ctx, cellSize);
        }

        // Draw cadet
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(0, -cellSize / 2 + 8); // Point
        ctx.lineTo(cellSize / 3 - 4, cellSize / 4 - 4); // Right corner
        ctx.lineTo(0, cellSize / 8); // Inset
        ctx.lineTo(-cellSize / 3 + 4, cellSize / 4 - 4); // Left corner
        ctx.closePath();
        ctx.fill();

        // Add formation indicator (outline based on formation type)
        if (this.formationType !== "none") {
            ctx.lineWidth = 2;

            // Line formation: Yellow dashed outline
            if (this.formationType === "line") {
                ctx.strokeStyle = "#FFCC00";
                ctx.setLineDash([3, 2]);
            }
            // Column formation: White solid outline
            else if (this.formationType === "column") {
                ctx.strokeStyle = "#FFFFFF";
                ctx.setLineDash([]);
            }

            // Draw the outline to indicate formation
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash pattern
        }

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
            if (this.currentCommand === "fallIn") {
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

            // Add small formation indicator on flag
            if (this.formationType === "line") {
                // Horizontal lines for line formation
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#FFFF00";
                ctx.beginPath();
                ctx.moveTo(2, -cellSize / 2 + 11);
                ctx.lineTo(10, -cellSize / 2 + 11);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(2, -cellSize / 2 + 14);
                ctx.lineTo(10, -cellSize / 2 + 14);
                ctx.stroke();
            } else if (this.formationType === "column") {
                // Vertical lines for column formation
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#FFFFFF";
                ctx.beginPath();
                ctx.moveTo(4, -cellSize / 2 + 8);
                ctx.lineTo(4, -cellSize / 2 + 16);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(8, -cellSize / 2 + 8);
                ctx.lineTo(8, -cellSize / 2 + 16);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Apply state-specific visualizations
    applyStateVisualization(ctx, cellSize) {
        if (!this.game) return;

        const state = this.game.flightState;

        switch (state) {
            case "Halted_At_Rest":
                // Visualize parade rest or at ease - wider stance
                this.stanceOffset = 5;
                break;
            case "Halted_At_Attention":
                // Regular stance for attention
                this.stanceOffset = 0;
                break;
            case "Marching_Forward":
                // Animate marching movement
                this.animationFrame = (this.animationFrame + 0.1) % 4;
                // Apply oscillating offset for marching animation
                const marchOffset = Math.sin(this.animationFrame * Math.PI / 2) * 3;
                ctx.translate(0, marchOffset);
                break;
            case "Facing":
                // Could add rotation animation here
                break;
            case "Column_Movement":
                // Visualize column movement - add slight offset
                ctx.translate(2, 0);
                break;
            case "Flanking":
                // Visualize flanking - add slight rotation
                ctx.rotate(Math.PI / 30); // Small rotation to indicate flanking movement
                break;
            // Add more states as needed
        }
    }

    // Helper method to darken color for guidon bearer
    darkenColor(hexColor) {
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);

        // Darken by reducing RGB values
        r = Math.floor(r * 0.7);
        g = Math.floor(g * 0.7);
        b = Math.floor(b * 0.7);

        // Convert back to hex
        return "#" +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');
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