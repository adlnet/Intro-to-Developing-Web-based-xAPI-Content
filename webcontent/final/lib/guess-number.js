(function () {
    "use strict";
    
    var root = this,
        previous_game = root.game,
        game = function () {};
    
    game.noConflict = function () {
        root.game = previous_game;
        return game;
    };
    
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = game;
        }
        exports.game = game;
    } else {
        root.game = game;
    }
    
    game.prototype.start = function (min, max) {
        if (!this.ended && this.stats)
            this.stats.endedAt = this.stats.endedAt || new Date();
        this.previous_stats = this.stats;
        this.ended = false;
        min = min || 1;
        max = max || 100;
        this.stats = {
            min: min,
            max: max,
            guesses: [],
            number: Math.floor(Math.random() * (max - min + 1) + min),
            startedAt: new Date(),
            endedAt: null
        };
        this.range = this.stats.min + " - " + this.stats.max;
    };
    
    game.prototype.evalGuess = function (num) {
        if (this.ended) throw new Error("game already over");
        this.stats.guesses.push(num);
        if (num == this.stats.number) return 0;
        return (num > this.stats.number) ? 1 : -1;
    };
    
    game.prototype.end = function () {
        this.stats.endedAt = new Date();
        this.ended = true;
    }
}).call(this);