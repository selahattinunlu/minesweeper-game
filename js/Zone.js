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