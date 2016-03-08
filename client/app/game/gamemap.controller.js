'use strict';

(function() {

class GameMapController {

  constructor($http, $scope, Auth) {
    const user = Auth.getCurrentUser();
    this.mapFocus=  user.gameData.restaurants[0].location;
    this.mapSize = [800, 800];

    this.$http = $http;
    this.awesomeThings = [];

    // this.mapData = 44;
    this.lab = 'asda';

    // var canvasEl = document.getElementById('map-canvas');
    let canvas = new fabric.Canvas('map-canvas');
    this.drawMap(this.mapSize, this.mapFocus, canvas);
    // this.canvasListen(canvasEl);
    console.log(canvas);
    $scope.$on('$destroy', function() {
      // socket.unsyncUpdates('thing');
    });
  }

// Canvas is actually 2x bigger than displayed
// By default it has an offset of 25%
// Map should first scroll around the offset
// After the offset is 0% or close it should start scrolling
  canvasListen(canvas) {
    let offset = [-200, -200];
    let dragging = false;
    let original;
    canvas.addEventListener('mousedown', function(ev) {
      dragging = true;
      original = [ev.offsetX, ev.offsetY];
    });
    canvas.addEventListener('mouseup', function(ev) {
      dragging = false;
    });
    canvas.addEventListener('mousemove', function(ev) {
      if(dragging) {
        let drag = [original[0] - ev.offsetX, original[1] - ev.offsetY];
        console.log(original);
        canvas.style.transform = 'translate(' + (offset[0] - drag[0]) + 'px, ' + (offset[1] - drag[1]) + 'px)';
        console.log((original[0] - drag[0]), (original[1] - drag[1]) + 'px)');
        console.log('translate(' + (original[0] - drag[0]) + 'px, ' + (original[1] - drag[1]) + 'px)');
        // canvas.
      }
    });
  }

  drawMap(size, focus, canvas) {
    let rowSize = 10;
    let fieldSize = [size[0]/rowSize, size[1]/rowSize];
    // console.log('draw', fieldSize);
    let images = {};
    fabric.Image.fromURL('/assets/grass.png', function(img) {
      images.grass = img;
      fabric.Image.fromURL('/assets/restaurant.png', function(img) {
        images.restaurant = img;
        let grass = Array(rowSize*rowSize).fill(images.grass);
          canvas.add.apply(...grass);
          console.log(canvas);
        for(var i = 0; i < rowSize*rowSize; i++) {
          // images.grass.left = 200;
          // images.grass.top = 200;
          // ctx.fillStyle = i%3 === 0 ? 'red' : 'blue';
          // ctx.strokeStyle = 'black';
          // ctx.strokeRect(Math.floor(i%rowSize)*fieldSize[0], Math.floor(i/rowSize)*fieldSize[1], fieldSize[0], fieldSize[1]);
          // ctx.fillRect(Math.floor(i%rowSize)*fieldSize[0], Math.floor(i/rowSize)*fieldSize[1], fieldSize[0], fieldSize[1]);
        }
      });
    }, {
      width: fieldSize[0],
      height: fieldSize[1]
    });


  }
}

angular.module('faster')
  .controller('GameMapController', GameMapController);

})();