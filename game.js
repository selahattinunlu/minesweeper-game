var Game = function(level, els) {
   var els = els || {};

   this.levels = {
      beginner: {
         dimension: 9,
         mineCount: 10
      },
      intermediate: {
         dimension: 16,
         mineCount: 40
      },
      advanced: {
         dimension: 21,
         mineCount: 80
      }
   }

   var elBoard = els.screen || '.game-board';
   var elTimer = els.timer || '.game-time';
   var elMine = els.mine || '.game-mines-count';
   var elRestartButton = els.restartButton || '.game-restart-button';
   var elLevel = els.level || '.game-level';

   this.els = {}
   this.els.board = document.querySelector(elBoard);
   this.els.time = document.querySelector(elTimer);
   this.els.mine = document.querySelector(elMine);
   this.els.restartButton = document.querySelector(elRestartButton);
   this.els.level = document.querySelector(elLevel);

   this.dimension = 0;
   this.mineCount = 0;
   this.timer = null;

   this.setLevel(level);

   this.isGameOver = false;
   this.initialize = false;
   this.time = 0;
   this.leftMineCount = this.mineCount;
   this.board = new Board(this.els.board);

   this.init();
}

Game.prototype.setLevel = function(level) {
   var option;

   this.dimension = this.levels[level].dimension;
   this.mineCount = this.levels[level].mineCount

   option = this.els.level.querySelector('option[value="'+ level +'"]');
   option.selected = true;
}

Game.prototype.startTimer = function() {
   this.timer = setInterval(function() {
      ++this.time;
      this.els.time.textContent = this.time;
   }.bind(this), 1000);
}

Game.prototype.stopTimer = function() {
   clearInterval(this.timer);
}

Game.prototype.init = function() {
   this.isGameOver = false;
   this.time = 0;
   this.els.time.textContent = 0;
   this.els.mine.textContent = this.mineCount;
   this.leftMineCount = this.mineCount;

   this.stopTimer();
   this.board.init(this.dimension, this.mineCount);
   
   if (! this.initialize) {
      this.listen();
   }

   this.initialize = true;
}

Game.prototype.isWin = function() {
   return this.board.getNotReleavedZones().length <= this.mineCount;
}

Game.prototype.gameover = function(isWin) {
   var win = isWin || false;

   this.stopTimer();
   this.isGameOver = true;
   this.board.reveal();

   if (win) {
      alert('You win!');
   }
}

Game.prototype.listen = function() {
   this.els.restartButton.addEventListener('click', this.restartClickHandler.bind(this));
   this.els.level.addEventListener('change', this.levelChangeHandler.bind(this));
   this.board.element.addEventListener('click', this.leftClickHandler.bind(this));
   this.board.element.addEventListener('contextmenu', this.rightClickHandler.bind(this));
}

Game.prototype.restartClickHandler = function() {
   this.init();
}

Game.prototype.levelChangeHandler = function(event) {
   this.setLevel(event.target.value);
   this.init();
}

Game.prototype.leftClickHandler = function(event) {
   if (this.isGameOver || ! event.target.classList.contains('zone')) {
      return;
   }

   var zone = this.findZoneByEvent(event);

   if (this.time == 0) {
      this.startTimer();
   }

   if (zone.isFlagged) {
      return;
   }

   if (zone.isMine) {
      zone.element.classList.add('is-clicked');
      return this.gameover();
   }

   zone.reveal();

   if (zone.isEmpty) {
      this.board.revealZoneNeighbors(zone);
   }

   if (this.isWin()) {
      return this.gameover(true);
   }
}

Game.prototype.rightClickHandler = function(event) {
   event.preventDefault();

   if (this.isGameOver || ! event.target.classList.contains('zone')) {
      return;
   }

   var zone = this.findZoneByEvent(event);

   if (zone.isFlagged) {
      this.increaseLeftMineCount();
      zone.setUnflagged();
   } else {
      this.decreaseLeftMineCount();
      zone.setFlagged();
   }
}

Game.prototype.findZoneByEvent = function(event) {
   var x = event.target.getAttribute('x');
   var y = event.target.getAttribute('y');
   return this.board.zones[y][x];
}

Game.prototype.decreaseLeftMineCount = function() {
   this.leftMineCount--;
   this.els.mine.textContent = this.leftMineCount;
}

Game.prototype.increaseLeftMineCount = function() {
   this.leftMineCount++;
   this.els.mine.textContent = this.leftMineCount;
}

// Board
var Board = function(element) {
   this.element = element;
   this.dimension = 0;
   this.mineCount = 0;
   this.zones = [];

   this.init = function(dimension, mineCount) {
      this.dimension = dimension;
      this.mineCount = mineCount;

      this.draw();
      this.plantMines();
      this.calculate();
   }

   this.traverse = function(zone) {
      var zones = [];

      // up
      if (zone.y != 0) {
         zones.push(this.zones[zone.y - 1][zone.x]);
      }

      // down
      if (zone.y != this.dimension - 1) {
         zones.push(this.zones[zone.y + 1][zone.x]);
      }

      // left
      if (zone.x != 0) {
         zones.push(this.zones[zone.y][zone.x - 1]);
      }

      // right
      if (zone.x != this.dimension - 1) {
         zones.push(this.zones[zone.y][zone.x + 1]);
      }

      // upper left
      if (zone.y != 0 && zone.x != 0) {
         zones.push(this.zones[zone.y - 1][zone.x - 1]);
      }

      // upper right
      if (zone.y != 0 && zone.x != this.dimension - 1) {
         zones.push(this.zones[zone.y - 1][zone.x + 1]);
      }

      // lower left
      if (zone.y != this.dimension - 1 && zone.x != 0) {
         zones.push(this.zones[zone.y + 1][zone.x - 1]);
      }

      // lower right
      if (zone.y != this.dimension - 1 && zone.x != this.dimension - 1) {
         zones.push(this.zones[zone.y + 1][zone.x + 1]);
      }

      return zones;
   }

   this.reveal = function() {
      for (var y = 0; y < this.dimension; y++) {
         Array.prototype.forEach.call(this.zones[y], function(zone) {
            zone.reveal();
         });
      }
   }

   this.revealZoneNeighbors = function(zone) {
      var x,
      neighborZone,
      neighbors = this.traverse(zone);

      for (x = 0; x < neighbors.length; x++) {
         neighborZone = neighbors[x];

         if (neighborZone.isRevealed || neighborZone.isFlagged || neighborZone.isMine) {
            continue;
         }

         neighborZone.reveal();

         if (neighborZone.isEmpty) {
            this.revealZoneNeighbors(neighborZone);
         }
      }
   }

   this.getRandomNumber = function(max) {
      return Math.floor(Math.random() * (max - 1)) + 1;
   }

   this.draw = function() {
      this.element.innerHTML = "";
      var zone, br;

      for (var y = 0; y < this.dimension; y++) {
         this.zones[y] = [];

         for (var x = 0; x < this.dimension; x++) {
            zone = document.createElement('span');
            zone.className = 'zone';
            zone.setAttribute('x', x);
            zone.setAttribute('y', y);
            this.element.appendChild(zone);
            this.zones[y][x] = new Zone(zone, x, y);
         }

         this.appendClearfixElement();
      }

      this.appendClearfixElement();
   }

   this.appendClearfixElement = function() {
      var element = document.createElement('div');
      element.classList.add('clearfix');
      this.element.appendChild(element);
   }

   this.plantMines = function() {
      var plantedMines = 0;
      var x,y,zone;

      while (plantedMines < this.mineCount) {
         x = this.getRandomNumber(this.dimension);
         y = this.getRandomNumber(this.dimension);
         zone = this.zones[y][x];

         if (! zone.isMine) {
            zone.setMine();
            plantedMines++;
         }
      }
   }

   this.calculate = function() {
      var x, y, zone, mineCount;

      for (y = 0; y < this.dimension; y++) {
         for (x = 0; x < this.dimension; x++) {
            zone = this.zones[y][x];
            var zones = this.traverse(zone);
            mineCount = 0;

            if (! zone.isMine) {
               Array.prototype.forEach.call(zones, function(zoneVal) {
                  if (zoneVal.isMine) {
                     mineCount++
                  }
               }.bind(this));

               (mineCount == 0) ? zone.setEmpty() : zone.setMineCount(mineCount);
            }
         }
      }
   }

   this.getFlattenZones = function() {
      return this.zones.reduce(function(a, b) {
         return a.concat(b);
      });
   }

   this.getNotReleavedZones = function() {
      return this.getFlattenZones().filter(function(zone) {
         return ! zone.isRevealed;
      });
   }
}

// Zone
var Zone = function(element, x, y) {
   this.element = element;
   this.x = x;
   this.y = y;
   this.isMine = false;
   this.isRevealed = false;
   this.isFlagged = false;
   this.isEmpty = false;
   this.mineCount = 0;

   this.setMine = function() {
      this.isMine = true;
   }

   this.setRevealed = function() {
      this.isRevealed = true;
      this.element.classList.add('is-revealed');
   }

   this.reveal = function() {
      var className;

      this.setRevealed();

      if (this.isMine) {
         return this.element.classList.add('is-mine');
      }

      if (this.isEmpty) {
         return this.element.classList.add('is-empty');
      }

      this.element.textContent = this.mineCount;

      if (this.mineCount == 1) {
         className = 'is-low';
      } else if (this.mineCount < 3) {
         className = 'is-medium';
      } else if (this.mineCount >= 3) {
         className = 'is-high';
      }

      this.element.classList.add(className);
   }

   this.setFlagged = function() {
      this.isFlagged = true;
      this.element.classList.add('is-flagged');
   }

   this.setUnflagged = function() {
      this.isFlagged = false;
      this.element.classList.remove('is-flagged');
   }

   this.setEmpty = function() {
      this.isEmpty = true;
   }

   this.setMineCount = function(number) {
      this.mineCount = number;
   }
}