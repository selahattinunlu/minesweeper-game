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