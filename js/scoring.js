// scoring.js - Handles scoring logic based on evaluation criteria

class ScoringSystem {
    constructor() {
        this.reset();
    }
    
    reset() {
        // Part I: Leadership (14 points)
        this.commandVoice = 0; // Max 2 points
        this.callingCadence = 0; // Max 2 points
        this.militaryBearing = 0; // Max 2 points
        this.positionOnFlight = 1; // Assumed correct (1 point)
        this.finalPositioning = 0; // Max 2 points
        this.reportIn = 0; // Max 2 points
        this.reportOut = 0; // Max 2 points
        
        // Part II: Order of Commands (32 points)
        this.correctCommands = []; // 1 point each, max 30
        this.crossovers = 0; // Max 2 points (1 for each crossover)
        
        // Timing data
        this.perfectTimingCount = 0; // For command timing bonus
        this.commandTimes = []; // Record time of each command execution
        this.startTime = 0;
        this.endTime = 0;
        this.timeLimit = 180; // 3 minutes in seconds
    }
    
    // Record command execution
    recordCommand(commandId, isCorrect, isPerfectTiming) {
        this.correctCommands[commandId] = isCorrect ? 1 : 0;
        
        // Record timing for bonus points
        if (isCorrect && isPerfectTiming) {
            this.perfectTimingCount++;
        }
        
        this.commandTimes[commandId] = Date.now();
        
        // Update crossover achievements
        if (commandId === 14 && isCorrect) {
            this.crossovers += 1;
        } else if (commandId === 26 && isCorrect) {
            this.crossovers += 1;
        }
    }
    
    // Record report in/out
    recordReportIn() {
        this.reportIn = 2;
        this.startTime = Date.now();
    }
    
    recordReportOut() {
        this.reportOut = 2;
        this.endTime = Date.now();
    }
    
    // Record final positioning
    recordFinalPosition(isWithinTolerance) {
        this.finalPositioning = isWithinTolerance ? 2 : 0;
    }
    
    // Calculate Part I score (Leadership)
    calculatePartI() {
        // Timing accuracy affects command voice, calling cadence, and military bearing
        // Max 6 points for these combined based on perfect timing count
        const timingScore = Math.min(6, this.perfectTimingCount * 0.5);
        
        this.commandVoice = Math.round(timingScore / 3);
        this.callingCadence = Math.round(timingScore / 3);
        this.militaryBearing = Math.round(timingScore / 3);
        
        // Sum all Part I scores
        return this.commandVoice + this.callingCadence + this.militaryBearing + 
               this.positionOnFlight + this.finalPositioning + this.reportIn + this.reportOut;
    }
    
    // Calculate Part II score (Order of Commands)
    calculatePartII() {
        // 1 point for each correct command
        const commandsScore = this.correctCommands.reduce((acc, val) => acc + val, 0);
        
        // Add crossover points (max 2)
        return commandsScore + this.crossovers;
    }
    
    // Calculate overtime penalty
    calculateOvertimePenalty() {
        if (!this.startTime || !this.endTime) return 0;
        
        const totalTimeSeconds = (this.endTime - this.startTime) / 1000;
        const overtimeSeconds = Math.max(0, totalTimeSeconds - this.timeLimit);
        
        // -1 point per 10 seconds over the time limit
        return Math.floor(overtimeSeconds / 10);
    }
    
    // Calculate total score
    calculateTotalScore() {
        const partIScore = this.calculatePartI();
        const partIIScore = this.calculatePartII();
        const overtimePenalty = this.calculateOvertimePenalty();
        
        return Math.max(0, partIScore + partIIScore - overtimePenalty);
    }
    
    // Get detailed score breakdown
    getScoreBreakdown() {
        const partIScore = this.calculatePartI();
        const partIIScore = this.calculatePartII();
        const overtimePenalty = this.calculateOvertimePenalty();
        const totalScore = this.calculateTotalScore();
        
        return {
            partI: {
                total: partIScore,
                maxPossible: 14,
                details: {
                    commandVoice: this.commandVoice,
                    callingCadence: this.callingCadence,
                    militaryBearing: this.militaryBearing,
                    positionOnFlight: this.positionOnFlight,
                    finalPositioning: this.finalPositioning,
                    reportIn: this.reportIn,
                    reportOut: this.reportOut
                }
            },
            partII: {
                total: partIIScore,
                maxPossible: 32,
                details: {
                    commands: this.correctCommands.reduce((acc, val) => acc + val, 0),
                    crossovers: this.crossovers
                }
            },
            overtime: {
                penalty: overtimePenalty,
                timeSeconds: this.endTime ? (this.endTime - this.startTime) / 1000 : 0
            },
            total: totalScore,
            maxPossible: 46
        };
    }
}