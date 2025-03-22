// app.js - Main entry point for the application

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the drill simulator
    const drillSimulator = new DrillSimulator();
    
    // Show start modal
    document.getElementById('start-modal').classList.remove('hidden');
    
    // Initialize controls info display
    initializeControlsDisplay();
});

// Populate the controls info display with all available commands
function initializeControlsDisplay() {
    const controlsInfo = document.querySelector('.key-controls');
    
    // Clear existing controls
    controlsInfo.innerHTML = '';
    
    // Map of special keys to their display names
    const keyDisplay = {
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'Enter': 'Enter'
    };
    
    // Add Report In/Out controls
    const reportKeyGroup = document.createElement('div');
    reportKeyGroup.className = 'key-group';
    reportKeyGroup.innerHTML = `
        <div class="key">${keyDisplay['Enter']}</div>
        <span>Report In/Out</span>
    `;
    controlsInfo.appendChild(reportKeyGroup);
    
    // Add all command controls
    COMMANDS.forEach(command => {
        const keyGroup = document.createElement('div');
        keyGroup.className = 'key-group';
        
        const displayKey = keyDisplay[command.key] || command.key;
        
        keyGroup.innerHTML = `
            <div class="key">${displayKey}</div>
            <span>${command.name}</span>
        `;
        
        controlsInfo.appendChild(keyGroup);
    });
}