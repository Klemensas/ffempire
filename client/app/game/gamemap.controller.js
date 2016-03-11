'use strict';

(function() {

    class GameMapController {

        constructor($http, $scope, Auth) {
            const user = Auth.getCurrentUser();
            this.restaurants = [];

            this.mapCenter = user.gameData.restaurants[0].location;
            this.mapSize = 800;
            this.rowSize = 7;
            this.yAxis = [];
            this.xAxis = [];
            Math.seedrandom(window.location.host);

            $http.get('/api/restaurant/map').then(response => {
                this.restaurants = response.data.map((el) => el.location.join());
                this.drawMap();
            });

            $scope.$on('$destroy', function() {
                // socket.unsyncUpdates('thing');
            });
        }

        createField(res, field) {
            let restaurant = res ? '<div class="restaurant"></div>' : '';
            console.log(field);
            return '<div data-field="' + field + '" class="map-field">' + restaurant + '</div>';
        }

        drawMap() {
            let fieldTypes = 7;
            let start = [this.mapCenter[0] - Math.floor(this.rowSize / 2), this.mapCenter[1] - Math.floor(this.rowSize / 2)];
            this.xAxis = _.range(start[0], start[0] + this.rowSize);
            this.yAxis = _.range(start[1], start[1] + this.rowSize);
            let fields = '';
            for (let i = 0; i < this.rowSize * this.rowSize; i++) {
                let x = start[0] + i % this.rowSize;
                let y = start[1] + Math.floor(i / this.rowSize);
                let pos = [x, y];
                let res = false;
                let field = Math.floor(Math.random() * fieldTypes + 1);
                if (this.restaurants.indexOf(pos.join()) > -1) {
                    res = true;
                    field = 1;
                }
                fields += this.createField(res, field);
            }
            // Add attributes of size to container
            let mapEl = document.getElementById('map-container');
            mapEl.innerHTML = fields;
            mapEl.parentNode.setAttribute('data-row-size', this.rowSize);
            mapEl.parentNode.setAttribute('data-column-size', this.rowSize);
            mapEl.setAttribute('class', 'active');
        }

        mapScroll(position) {
            let values = {
                up: [-1, 1],
                down: [1, 1],
                left: [-1, 0],
                right: [1, 0]
            };
            this.mapCenter[values[position][1]] += values[position][0] * this.rowSize;
            console.log(this.mapCenter);
            this.drawMap();
        }
    }

    angular.module('faster')
        .controller('GameMapController', GameMapController);

})();
