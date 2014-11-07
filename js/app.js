var L = require('leaflet');
var when = require('when');
var geolib = require('geolib');
var stops = require('./stops_801_1');

function App() {
    this.map = null;
    this.latlng = null;
    this._restaurantData = null;
    this.minScore = null;
    this.maxScore = null;
    this.limit = null;
    this.$min = null;
    this.$max = null;
    this.$limit = null;
    this.currentMarkers = [];
}

App.prototype = {
    start: function() {
        this.map = L.map('map').setView([30.267153, -97.743061], 12);

        L.Icon.Default.imagePath = 'http://api.tiles.mapbox.com/mapbox.js/v1.0.0beta0.0/images';

        L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
            attribution: '<a href="http://www.mapquest.com/">Tiles</a> | <a href="http://openstreetmap.org">Map data</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">contributors</a>',
            subdomains: '1234'
        }).addTo(this.map);

        this.loadRestaurantData()
            .then(this.drawRestaurant.bind(this));

    },
    loadRestaurantData: function(minScore, maxScore) {
        var deferred = when.defer();

            window.Keen.configure({
                projectId: "5421803333e406113085ef70",
                readKey: "34ff00b8e5cb7a485899b2c8edcc494f3dde2cb0f14c526a94aa5113c7678577210432d216e53f9b083fef49ff0e7e20cdacf6cc6ae62faaa96989a9190711aa02157f0d8d854c24039cee080622d3652337b68c4ba3e1793bf6ce2a6a851f9e859ca0c5664c4dacabe0eb3fd4d8fa53"
            });

        window.Keen.onChartsReady(function() {

            var unique = new window.Keen.Metric("TripSelected", {
                analysisType: "select_unique",
                targetProperty: "coordinates"
            });

            unique.getResponse(function(response) {
                console.log(response);
                response.result = response.result.filter(function(c) {
                    return !!c && !!c.length && !!c[0] && !!c[1];
                });
                console.table(response.result);

                deferred.resolve(response.result);
            });
        });

        return deferred.promise;
    },
    drawRestaurant: function(coords) {
        coords.forEach(function(coord) {
            var options = {
                color: 'white',
                opacity: 1,
                weight: 3,
                fillColor: 'blue',
                fill: true,
                fillOpacity: 0.3,
                radius: 12,
                zIndexOffset: 1
            };
            var marker = L.circleMarker([coord[0], coord[1]], options);

            marker.addTo(this.map);
        }.bind(this));
    }
};

module.exports = App;
