// game.js - Core game logic and state management

class DrillSimulator {
    constructor() {
        // Game elements
        this.canvas = document.getElementById('drill-field');
        this.flightFormation = new FlightFormation(this.canvas);
        this.scoring = new ScoringSystem();
        
        // Game state
        this.state = {
            isActive: false,
            isPracticeMode: true,
            isMarching: false,
            currentCommandId: 0,
            reportedIn: false,
            reportedOut: false,
            gameOver: false,
            timerId: null,
            elapsedSeconds: 0,
            cadenceTimer: 0,
            isOnCadence: false,
            checkpointsPassed: {
                14: false,
                26: false
            }
        };
        
        // Initialize command list
        populateCommandList();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Animation frame
        this.lastFrameTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // Initialize and reset the game
    init() {
        this.flightFormation.reset();
        this.scoring.reset();
        
        this.state = {
            isActive: true,
            isPracticeMode: document.getElementById('practice-mode').classList.contains('active'),
            isMarching: false,
            currentCommandId: 0,
            reportedIn: false,
            reportedOut: false,
            gameOver: false,
            timerId: null,
            elapsedSeconds: 0,
            cadenceTimer: 0,
            isOnCadence: false,
            checkpointsPassed: {
                14: false,
                26: false
            }
        };
        
        // Update UI
        this.updateCommandListHighlight();
        this.updateTimerDisplay();
        this.updateScoreDisplay();
        document.getElementById('feedback-area').textContent = this.state.isPracticeMode ? 
            "Practice Mode: Press Enter to Report In and start the drill." : 
            "Evaluation Mode: Press Enter to Report In and start the drill.";
            
        // Hide modals
        document.getElementById('start-modal').classList.add('hidden');
        document.getElementById('end-modal').classList.add('hidden');
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Mode toggle buttons
        document.getElementById('practice-mode').addEventListener('click', () => {
            document.getElementById('practice-mode').classList.add('active');
            document.getElementById('evaluation-mode').classList.remove('active');
            this.state.isPracticeMode = true;
        });
        
        document.getElementById('evaluation-mode').addEventListener('click', () => {
            document.getElementById('practice-mode').classList.remove('active');
            document.getElementById('evaluation-mode').classList.add('active');
            this.state.isPracticeMode = false;
        });
        
        // Key press events
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Modal buttons
        document.getElementById('start-button').addEventListener('click', () => {
            document.getElementById('start-modal').classList.add('hidden');
            this.init();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            document.getElementById('end-modal').classList.add('hidden');
            this.init();
        });
    }
    
    // Handle key press events
    handleKeyPress(event) {
        // If game is not active, only respond to start/restart
        if (!this.state.isActive) {
            if (event.key === 'Enter') {
                this.init();
            }
            return;
        }
        
        // Handle Enter for Report In/Out
        if (event.key === 'Enter') {
            if (!this.state.reportedIn) {
                this.reportIn();
                return;
            } else if (this.state.currentCommandId === COMMANDS.length && !this.state.reportedOut) {
                this.reportOut();
                return;
            }
        }
        
        // If not yet reported in, ignore other commands
        if (!this.state.reportedIn) return;
        
        // If game is over, ignore commands
        if (this.state.gameOver) return;
        
        // Get current expected command
        const expectedCommand = COMMANDS[this.state.currentCommandId];
        if (!expectedCommand) return;
        
        // Check if the key press matches the expected command
        const isCorrectKey = expectedCommand.key === event.key || 
                           (event.key === 'ArrowUp' && expectedCommand.key === 'ArrowUp') ||
                           (event.key === 'ArrowDown' && expectedCommand.key === 'ArrowDown') ||
                           (event.key === 'ArrowLeft' && expectedCommand.key === 'ArrowLeft') ||
                           (event.key === 'ArrowRight' && expectedCommand.key === 'ArrowRight');
                           
        // Check if command state is valid (e.g., halt commands only while halted)
        const isValidState = (expectedCommand.isHaltCommand && !this.state.isMarching) || 
                            (!expectedCommand.isHaltCommand && this.state.isMarching);
        
        if (isCorrectKey && isValidState) {
            // Check timing accuracy for marching commands
            const isPerfectTiming = this.state.isMarching ? this.state.isOnCadence : true;
            
            // Execute the command
            const success = executeCommand(this.state.currentCommandId, this.flightFormation, this.state);
            
            if (success) {
                // Record the command execution
                this.scoring.recordCommand(this.state.currentCommandId, true, isPerfectTiming);
                
                // Check for checkpoints
                if (COMMAND_CHECKPOINTS[this.state.currentCommandId]) {
                    const checkpoint = COMMAND_CHECKPOINTS[this.state.currentCommandId];
                    if (this.flightFormation.checkCheckpoint(checkpoint.x, checkpoint.y)) {
                        this.state.checkpointsPassed[this.state.currentCommandId] = true;
                    }
                }
                
                // Provide feedback in practice mode
                if (this.state.isPracticeMode) {
                    document.getElementById('feedback-area').textContent = 
                        `Command "${expectedCommand.name}" executed successfully!` + 
                        (isPerfectTiming ? " Perfect timing!" : "");
                }
                
                // Move to next command
                this.state.currentCommandId++;
                this.updateCommandListHighlight();
                this.updateScoreDisplay();
                
                // Check if game is complete
                if (this.state.currentCommandId >= COMMANDS.length) {
                    // Check final positioning
                    const isInFinalPosition = this.flightFormation.isInFinalPosition();
                    this.scoring.recordFinalPosition(isInFinalPosition);
                    
                    if (this.state.isPracticeMode) {
                        document.getElementById('feedback-area').textContent = 
                            `Drill sequence complete! ` + 
                            (isInFinalPosition ? "Good final positioning." : "Final position not accurate.");
                    }
                }
            }
        } else if (this.state.isPracticeMode) {
            // Provide feedback for incorrect commands in practice mode
            if (!isCorrectKey) {
                document.getElementById('feedback-area').textContent = 
                    `Incorrect command key. Expected "${expectedCommand.name}" (${expectedCommand.key}).`;
            } else if (!isValidState) {
                document.getElementById('feedback-area').textContent = 
                    `Invalid command state. The flight must be ${expectedCommand.isHaltCommand ? 'halted' : 'marching'} for "${expectedCommand.name}".`;
            }
        }
    }
    
    // Report In procedure
    reportIn() {
        this.state.reportedIn = true;
        this.scoring.recordReportIn();
        this.startTimer();
        
        document.getElementById('feedback-area').textContent = 
            "Reported In! Begin the drill sequence with 'Fall In' (F key).";
    }
    
    // Report Out procedure
    reportOut() {
        this.state.reportedOut = true;
        this.scoring.recordReportOut();
        this.stopTimer();
        this.endGame();
    }
    
    // Start the timer
    startTimer() {
        if (this.state.timerId) return;
        
        const startTime = Date.now();
        this.state.timerId = setInterval(() => {
            this.state.elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            this.updateTimerDisplay();
            
            // Auto-end if time exceeds 5 minutes (safety)
            if (this.state.elapsedSeconds > 300) {
                this.stopTimer();
                this.endGame();
            }
        }, 1000);
    }
    
    // Stop the timer
    stopTimer() {
        if (this.state.timerId) {
            clearInterval(this.state.timerId);
            this.state.timerId = null;
        }
    }
    
    // End the game and show results
    endGame() {
        this.state.gameOver = true;
        this.stopTimer();
        
        // Calculate final score
        const scoreBreakdown = this.scoring.getScoreBreakdown();
        
        // Update score display
        document.getElementById('score').textContent = scoreBreakdown.total;
        
        // Show end modal with score breakdown
        const scoreBreakdownElement = document.getElementById('score-breakdown');
        scoreBreakdownElement.innerHTML = `
            <h3>Score: ${scoreBreakdown.total}/${scoreBreakdown.maxPossible}</h3>
            <p>Part I (Leadership): ${scoreBreakdown.partI.total}/${scoreBreakdown.partI.maxPossible}</p>
            <p>Part II (Commands): ${scoreBreakdown.partII.total}/${scoreBreakdown.partII.maxPossible}</p>
            <p>Time: ${formatTime(scoreBreakdown.overtime.timeSeconds)}</p>
            ${scoreBreakdown.overtime.penalty > 0 ? 
                `<p class="penalty">Overtime Penalty: -${scoreBreakdown.overtime.penalty}</p>` : ''}
        `;
        
        document.getElementById('end-modal').classList.remove('hidden');
    }
    
    // Update timer display
    updateTimerDisplay() {
        document.getElementById('timer').textContent = formatTime(this.state.elapsedSeconds);
    }
    
    // Update score display
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.scoring.calculateTotalScore();
    }
    
    // Update command list highlight
    updateCommandListHighlight() {
        const commandItems = document.querySelectorAll('#command-list li');
        
        commandItems.forEach((item, index) => {
            item.classList.remove('active', 'completed');
            
            if (index === this.state.currentCommandId) {
                item.classList.add('active');
            } else if (index < this.state.currentCommandId) {
                item.classList.add('completed');
            }
        });
    }
    
    // Game loop
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update cadence timer
        if (this.state.isMarching) {
            // 120 steps per minute = 2 steps per second = 500ms per step
            this.state.cadenceTimer = (this.state.cadenceTimer + deltaTime) % 500;
            // On cadence when within a small window of step timing
            this.state.isOnCadence = this.state.cadenceTimer < 100 || this.state.cadenceTimer > 400;
            
            // Update cadence indicator
            const cadenceIndicator = document.getElementById('cadence-indicator');
            if (this.state.isOnCadence) {
                cadenceIndicator.classList.add('on-beat');
            } else {
                cadenceIndicator.classList.remove('on-beat');
            }
        }
        
        // Update flight formation
        this.flightFormation.update();
        
        // Draw game state
        this.flightFormation.draw();
        
        // Continue game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}