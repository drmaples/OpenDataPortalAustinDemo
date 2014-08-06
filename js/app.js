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

        this.map.locate();

        this.map.on('locationfound', function(e) {
            if (!this.latlng) {
                this.latlng = [30.267153, -97.743061];
            }
            this.latlng = e.latlng;

            L.circleMarker(this.latlng).addTo(this.map)
                .bindPopup('u r here?')
                .openPopup();
        }.bind(this));

        this.$min = document.getElementById('min');
        this.$minDisp = document.getElementById('min-disp');
        this.$maxDisp = document.getElementById('max-disp');
        this.$limit = document.getElementById('limit');
        this.$limitDisp = document.getElementById('limit-disp');
        this.minScore = this.$minDisp.innerHTML = this.$min.value;
        this.maxScore = this.$maxDisp.innerHTML = parseInt(this.minScore) + 5;
        this.limit = this.$limitDisp.innerHTML = this.$limit.value;

        this.$min.onchange = function() {
            this.minScore = this.$minDisp.innerHTML = this.$min.value;
            this.maxScore = this.$maxDisp.innerHTML = parseInt(this.minScore) + 5;
            this.resetRestarantData();
        }.bind(this);
        this.$limit.onchange = function() {
            this.limit = this.$limitDisp.innerHTML = this.$limit.value;
            this.resetRestarantData();
        }.bind(this);

        var self = this;

        stops.forEach(function(s) {
            var options = {
                color: 'white',
                opacity: 1,
                weight: 3,
                fillColor: 'red',
                fill: true,
                fillOpacity: 1,
                radius: 12,
                zIndexOffset: 1
            };

            var marker = L.circleMarker([s.stop_lat, s.stop_lon], options);

            var restaurantDataGetter = this.restaurantData.bind(this),
                drawRestaurant = this.drawRestaurant.bind(this);

            marker.on('click', function() {
                var lat = this._latlng.lat;
                var lng = this._latlng.lng;

                restaurantDataGetter().then(function(data) {
                    var coordsData = data.map(function(n) {
                        n.latitude = n.address.latitude;
                        n.longitude = n.address.longitude;

                        return n;
                    });

                    var closest = geolib.findNearest({latitude: lat, longitude: lng}, coordsData, 0, self.limit);

                    closest.forEach(function(c) {
                        var inspectionData = data[Number(c.key)];
                        drawRestaurant(inspectionData, c);
                    });
                });

            });

            marker.addTo(this.map);
        }.bind(this));
    },
    resetRestarantData: function() {
        this._restaurantData = null;
    },
    clearExistingMarkers: function() {
        this.currentMarkers.forEach(function (m) {
            this.map.removeLayer(m);
        }.bind(this));
    },
    restaurantData: function() {
        var deferred = when.defer(),
            promise = deferred.promise;

        this.clearExistingMarkers();
        if (!this._restaurantData) {
            this.loadRestaurantData(this.minScore, this.maxScore)
                .then(function(data) {
                    this._restaurantData = data;
                    if (this._restaurantData.length === 0) {
                        var msg = 'Zero restaurants with score between ' + this.minScore + ' and ' + this.maxScore;
                        throw Error(msg);
                    }

                    deferred.resolve(this._restaurantData);
                }.bind(this))
                .catch(function(e) {
                    console.error(e);
                    alert(e);
                    deferred.reject(e);
                });
        }
        else {
            deferred.resolve(this._restaurantData);
        }

        return promise;
    },
    loadRestaurantData: function(minScore, maxScore) {
        var deferred = when.defer();
        var r = new XMLHttpRequest();
        var data = null;
        var query = '$where=score > ' + minScore + ' AND score < ' + maxScore;

        r.open('GET', 'http://data.austintexas.gov/resource/ecmv-9xxi.json?' + query, true);

        r.onload = function() {
            if (r.status >= 200 && r.status < 400) {
                var data = JSON.parse(r.responseText);
                deferred.resolve(data);
            }
            else {
                console.error(r.status, r.responseText);
                deferred.reject();
            }
        };

        r.onerror = function(e) {
            console.error(e);
            deferred.reject();
        };

        r.send();

        return deferred.promise;
    },
    drawRestaurant: function(inspectionData, geoData) {
        var options = {
            color: 'white',
            opacity: 1,
            weight: 3,
            fillColor: 'blue',
            fill: true,
            fillOpacity: 1,
            radius: 12,
            zIndexOffset: 1
        };
        var marker = L.circleMarker([geoData.latitude, geoData.longitude], options);

        marker.addTo(this.map)
            .bindPopup(inspectionData.score + ' -- ' + inspectionData.restaurant_name)
            .openPopup();

        this.currentMarkers.push(marker);
    }
};

module.exports = App;
