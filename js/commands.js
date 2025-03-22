// Commands.js - Defines all drill commands and their implementations

const COMMANDS = [
    { id: 0, name: "Fall In", key: "f", description: "Form line formation", isHaltCommand: true },
    { id: 1, name: "Open Ranks, March", key: "o", description: "Spread ranks to 64-inch spacing", isHaltCommand: true },
    { id: 2, name: "Ready, Front", key: "r", description: "Return to front position", isHaltCommand: true },
    { id: 3, name: "Close Ranks, March", key: "c", description: "Return ranks to 40-inch spacing", isHaltCommand: true },
    { id: 4, name: "Present Arms", key: "p", description: "Present arms salute", isHaltCommand: true },
    { id: 5, name: "Order Arms", key: "a", description: "Return to order arms", isHaltCommand: true },
    { id: 6, name: "Parade Rest", key: "d", description: "Move to parade rest position", isHaltCommand: true },
    { id: 7, name: "Attention", key: "t", description: "Return to attention", isHaltCommand: true },
    { id: 8, name: "Left Face", key: "l", description: "Turn 90° left", isHaltCommand: true },
    { id: 9, name: "About Face", key: "b", description: "Turn 180° in place", isHaltCommand: true },
    { id: 10, name: "Forward, March", key: "ArrowUp", description: "Begin marching forward", isHaltCommand: true, initiatesMovement: true },
    { id: 11, name: "Right Flank, March", key: "ArrowRight", description: "Pivot 90° right while moving", isHaltCommand: false },
    { id: 12, name: "Left Flank, March", key: "ArrowLeft", description: "Pivot 90° left while moving", isHaltCommand: false },
    { id: 13, name: "Column Right, March", key: "j", description: "Execute column right movement", isHaltCommand: false },
    { id: 14, name: "Forward, March", key: "ArrowUp", description: "Continue marching forward", isHaltCommand: false },
    { id: 15, name: "To the Rear, March", key: "k", description: "Turn 180° while moving", isHaltCommand: false },
    { id: 16, name: "To the Rear, March", key: "k", description: "Turn 180° while moving", isHaltCommand: false },
    { id: 17, name: "Column Right, March", key: "j", description: "Execute column right movement", isHaltCommand: false },
    { id: 18, name: "Forward, March", key: "ArrowUp", description: "Continue marching forward", isHaltCommand: false },
    { id: 19, name: "Eyes Right", key: "e", description: "Turn heads to the right", isHaltCommand: false },
    { id: 20, name: "Ready Front", key: "y", description: "Return heads to front", isHaltCommand: false },
    { id: 21, name: "Column Right, March", key: "j", description: "Execute column right movement", isHaltCommand: false },
    { id: 22, name: "Forward, March", key: "ArrowUp", description: "Continue marching forward", isHaltCommand: false },
    { id: 23, name: "Change Step, March", key: "u", description: "Change marching step", isHaltCommand: false },
    { id: 24, name: "Column Right, March", key: "j", description: "Execute column right movement", isHaltCommand: false },
    { id: 25, name: "Forward, March", key: "ArrowUp", description: "Continue marching forward", isHaltCommand: false },
    { id: 26, name: "Flight, Halt", key: "ArrowDown", description: "Stop marching", isHaltCommand: false, stopsMovement: true },
    { id: 27, name: "Left Face", key: "l", description: "Turn 90° left", isHaltCommand: true },
    { id: 28, name: "Right Step, March", key: "z", description: "Step right 12 inches per step", isHaltCommand: true, initiatesMovement: true },
    { id: 29, name: "Flight, Halt", key: "ArrowDown", description: "Stop marching", isHaltCommand: false, stopsMovement: true }
];

// Map keys to their respective command indices for easy lookup
const KEY_TO_COMMAND = {};
COMMANDS.forEach(cmd => {
    if (!KEY_TO_COMMAND[cmd.key]) {
        KEY_TO_COMMAND[cmd.key] = [];
    }
    KEY_TO_COMMAND[cmd.key].push(cmd.id);
});

// Define checkpoints for specific commands
const COMMAND_CHECKPOINTS = {
    14: { x: 20, y: 20, name: "First Crossover" },
    26: { x: 40, y: 40, name: "Second Crossover" }
};

// Command execution functions
const executeCommand = (commandId, flightFormation, gameState) => {
    const command = COMMANDS[commandId];
    
    switch(commandId) {
        case 0: // Fall In
            flightFormation.fallIn();
            gameState.startTimer();
            return true;
            
        case 1: // Open Ranks, March
            flightFormation.openRanks();
            return true;
            
        case 2: // Ready, Front
            flightFormation.readyFront();
            return true;
            
        case 3: // Close Ranks, March
            flightFormation.closeRanks();
            return true;
            
        case 4: // Present Arms
        case 5: // Order Arms
        case 6: // Parade Rest
        case 7: // Attention
            // Visual effect only, no change to formation
            return true;
            
        case 8: // Left Face
            flightFormation.leftFace();
            return true;
            
        case 9: // About Face
            flightFormation.aboutFace();
            return true;
            
        case 10: // Forward, March
        case 14: // Forward, March (continuation)
        case 18: // Forward, March (continuation)
        case 22: // Forward, March (continuation)
        case 25: // Forward, March (continuation)
            flightFormation.forward();
            gameState.isMarching = true;
            return true;
            
        case 11: // Right Flank, March
            flightFormation.rightFlank();
            return true;
            
        case 12: // Left Flank, March
            flightFormation.leftFlank();
            return true;
            
        case 13: // Column Right, March
        case 17: // Column Right, March
        case 21: // Column Right, March
        case 24: // Column Right, March
            flightFormation.columnRight();
            return true;
            
        case 15: // To the Rear, March
        case 16: // To the Rear, March
            flightFormation.toTheRear();
            return true;
            
        case 19: // Eyes Right
            flightFormation.eyesRight();
            return true;
            
        case 20: // Ready Front
            flightFormation.readyFront();
            return true;
            
        case 23: // Change Step, March
            flightFormation.changeStep();
            return true;
            
        case 26: // Flight, Halt
        case 29: // Flight, Halt (final)
            flightFormation.halt();
            gameState.isMarching = false;
            if (commandId === 29) {
                gameState.stopTimer();
            }
            return true;
            
        case 27: // Left Face (after halt)
            flightFormation.leftFace();
            return true;
            
        case 28: // Right Step, March
            flightFormation.rightStep();
            gameState.isMarching = true;
            return true;
            
        default:
            return false;
    }
};

// Populate the command list in the sidebar
const populateCommandList = () => {
    const commandList = document.getElementById('command-list');
    commandList.innerHTML = '';
    
    COMMANDS.forEach(command => {
        const li = document.createElement('li');
        li.setAttribute('data-command-id', command.id);
        li.textContent = `${command.id + 1}. ${command.name}`;
        commandList.appendChild(li);
    });
};
