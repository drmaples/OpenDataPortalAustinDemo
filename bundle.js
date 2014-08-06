(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var App = require('./app');

var app = window.app = new App();
document.addEventListener('DOMContentLoaded', function(){
    app.start();
});

},{"./app":2}],2:[function(require,module,exports){
var L = require('leaflet');
var when = require('when');
var request = require('then-request');
var geolib = require('geolib');
var stops = require('./stops_801_1');

function App() {
    this.map = null;
    this.latlng = null;
    this._restaurantData = null;
    this.minScore = 30;
    this.maxScore = 60;
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

                    var closest = geolib.findNearest({latitude: lat, longitude: lng}, coordsData, 0, 3);


                    closest.forEach(function(c) {
                        var inspectionData = data[Number(c.key)];
                        drawRestaurant(inspectionData, c);
                    });
                });

            });

            marker.addTo(this.map);
        }.bind(this));
    },
    restaurantData: function() {
        var deferred = when.defer(),
            promise = deferred.promise;

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
        console.log("drawRestaurant: inspectionData", inspectionData);
        console.log("drawRestaurant: geoData", geoData);
        var marker = L.circleMarker([geoData.latitude, geoData.longitude], options);

        marker.addTo(this.map)
            .bindPopup(inspectionData.score + ' -- ' + inspectionData.restaurant_name)
            .openPopup();
    }
};

module.exports = App;

},{"./stops_801_1":3,"geolib":5,"leaflet":6,"then-request":7,"when":30}],3:[function(require,module,exports){
var stops = [{"stop_lat": 30.162951, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5873", "direction_id": 0, "stop_lon": -97.790488, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5873.html", "stop_sequence": 1, "stop_id": "5873", "stop_desc": "Northeast corner of TURK and CULLEN - Mid-Block", "stop_name": "SOUTHPARK MEADOWS STATION", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.194185, "stop_timezone": null, "wheelchair_boarding": 1, "stop_code": "4382", "direction_id": 0, "stop_lon": -97.778261, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/4382.html", "stop_sequence": 2, "stop_id": "4382", "stop_desc": "Northeast corner of CONGRESS and WILLIAM CANNON - Mid-Block", "stop_name": "PLEASANT HILL STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.202125, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "559", "direction_id": 0, "stop_lon": -97.775516, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/559.html", "stop_sequence": 3, "stop_id": "559", "stop_desc": "Southeast corner of CONGRESS and LITTLE TEXAS - Nearside", "stop_name": "LITTLE TEXAS STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.222941, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5552", "direction_id": 0, "stop_lon": -97.76628, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5552.html", "stop_sequence": 4, "stop_id": "5552", "stop_desc": "Northwest corner of BEN WHITE and CONGRESS - Mid-Block", "stop_name": "SOUTH CONGRESS STATION BAY J", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.230549, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5869", "direction_id": 0, "stop_lon": -97.759523, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5869.html", "stop_sequence": 5, "stop_id": "5869", "stop_desc": "Northeast corner of CONGRESS and WOODWARD - Mid-Block", "stop_name": "ST EDWARDS STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.239554, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "4039", "direction_id": 0, "stop_lon": -97.75284, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/4039.html", "stop_sequence": 6, "stop_id": "4039", "stop_desc": "Northeast corner of CONGRESS and OLTORF - Mid-Block", "stop_name": "OLTORF STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.24875, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "4026", "direction_id": 0, "stop_lon": -97.74982, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/4026.html", "stop_sequence": 7, "stop_id": "4026", "stop_desc": "Southeast corner of CONGRESS and ELIZABETH - Nearside", "stop_name": "SOCO STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.258306, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5942", "direction_id": 0, "stop_lon": -97.747938, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5942.html", "stop_sequence": 8, "stop_id": "5942", "stop_desc": "Northeast corner of RIVERSIDE and BARTON SPRINGS - Mid-Block", "stop_name": "210 RIVERSIDE/BARTON SPRINGS", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.266218, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5868", "direction_id": 0, "stop_lon": -97.746056, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5868.html", "stop_sequence": 9, "stop_id": "5868", "stop_desc": "Northeast corner of LAVACA and 3RD - Farside", "stop_name": "REPUBLIC SQUARE STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.27042, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "2606", "direction_id": 0, "stop_lon": -97.74444, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/2606.html", "stop_sequence": 10, "stop_id": "2606", "stop_desc": "Southeast corner of LAVACA and 8TH - Nearside", "stop_name": "WOOLDRIDGE SQUARE STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.275587, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "591", "direction_id": 0, "stop_lon": -97.742558, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/591.html", "stop_sequence": 11, "stop_id": "591", "stop_desc": "Southeast corner of LAVACA and 13TH - Nearside", "stop_name": "CAPITOL STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.2793, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "4657", "direction_id": 0, "stop_lon": -97.74119, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/4657.html", "stop_sequence": 12, "stop_id": "4657", "stop_desc": "Southeast corner of LAVACA and 17TH - Nearside", "stop_name": "MUSEUM STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.286129, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5865", "direction_id": 0, "stop_lon": -97.741596, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5865.html", "stop_sequence": 13, "stop_id": "5865", "stop_desc": "Northeast corner of GUADALUPE and WEST MALL UT - Farside", "stop_name": "UT WEST MALL STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.289298, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5864", "direction_id": 0, "stop_lon": -97.741363, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5864.html", "stop_sequence": 14, "stop_id": "5864", "stop_desc": "Southeast corner of GUADALUPE and DEAN KEETON - Mid-Block", "stop_name": "UT DEAN KEETON STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.304429, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "606", "direction_id": 0, "stop_lon": -97.736954, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/606.html", "stop_sequence": 15, "stop_id": "606", "stop_desc": "Northeast corner of GUADALUPE and 39TH - Farside", "stop_name": "HYDE PARK STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.314907, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "610", "direction_id": 0, "stop_lon": -97.732257, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/610.html", "stop_sequence": 16, "stop_id": "610", "stop_desc": "Northeast corner of GUADALUPE and 46TH - Mid-Block", "stop_name": "TRIANGLE STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.326497, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5862", "direction_id": 0, "stop_lon": -97.725801, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5862.html", "stop_sequence": 17, "stop_id": "5862", "stop_desc": "Northeast corner of LAMAR and KOENIG - Farside", "stop_name": "KOENIG STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.336928, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5860", "direction_id": 0, "stop_lon": -97.71927, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5860.html", "stop_sequence": 18, "stop_id": "5860", "stop_desc": "Northeast corner of LAMAR and JUSTIN - Farside", "stop_name": "CRESTVIEW STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.349326, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5859", "direction_id": 0, "stop_lon": -97.711685, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5859.html", "stop_sequence": 19, "stop_id": "5859", "stop_desc": "Northwest corner of LAMAR and RESEARCH - Nearside", "stop_name": "NORTH LAMAR STATION", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.362623, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "2821", "direction_id": 0, "stop_lon": -97.69717, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/2821.html", "stop_sequence": 20, "stop_id": "2821", "stop_desc": "Southeast corner of LAMAR and RUNDBERG - Nearside", "stop_name": "RUNDBERG STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.371752, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "4543", "direction_id": 0, "stop_lon": -97.691998, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/4543.html", "stop_sequence": 21, "stop_id": "4543", "stop_desc": "Northeast corner of LAMAR and MASTERSON - Farside", "stop_name": "MASTERSON STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.379449, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "4548", "direction_id": 0, "stop_lon": -97.687638, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/4548.html", "stop_sequence": 22, "stop_id": "4548", "stop_desc": "Southeast corner of LAMAR and KRAMER - Nearside", "stop_name": "CHINATOWN STATION (NB)", "location_type": null, "platform_code": null, "zone_id": null}, {"stop_lat": 30.418199, "stop_timezone": null, "wheelchair_boarding": 0, "stop_code": "5304", "direction_id": 0, "stop_lon": -97.668243, "parent_station": null, "route_id": "801", "stop_url": "http://www.capmetro.org/gismaps/stops/5304.html", "stop_sequence": 23, "stop_id": "5304", "stop_desc": "Northwest corner of CENTER RIDGE and CENTER LINE - Mid-Block", "stop_name": "TECH RIDGE BAY I", "location_type": null, "platform_code": null, "zone_id": null}]

module.exports = stops;

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
/*! geolib 2.0.14 by Manuel Bieh
* Library to provide geo functions like distance calculation,
* conversion of decimal coordinates to sexagesimal and vice versa, etc.
* WGS 84 (World Geodetic System 1984)
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.14
* @license MIT 
**/;(function(global, undefined) {

	"use strict";

	function Geolib() {}

	// Setting readonly defaults
	var geolib = Object.create(Geolib.prototype, {
		version: {
			value: "2.0.14"
		},
		radius: {
			value: 6378137
		},
		minLat: {
			value: -90
		},
		maxLat: {
			value: 90
		},
		minLon: {
			value: -180
		},
		maxLon: {
			value: 180
		},
		sexagesimalPattern: {
			value: /^([0-9]{1,3})°\s*([0-9]{1,3}(?:\.(?:[0-9]{1,2}))?)'\s*(([0-9]{1,3}(\.([0-9]{1,2}))?)"\s*)?([NEOSW]?)$/
		},
		measures: {
			value: Object.create(Object.prototype, {
				"m" : {value: 1},
				"km": {value: 0.001},
				"cm": {value: 100},
				"mm": {value: 1000},
				"mi": {value: (1 / 1609.344)},
				"sm": {value: (1 / 1852.216)},
				"ft": {value: (100 / 30.48)},
				"in": {value: (100 / 2.54)},
				"yd": {value: (1 / 0.9144)}
			})
		},
		prototype: {
			value: Geolib.prototype
		},
		extend: {
			value: function(methods, overwrite) {
				for(var prop in methods) {
					if(typeof geolib.prototype[prop] === 'undefined' || overwrite === true) {
						geolib.prototype[prop] = methods[prop];
					}
				}
			}
		}
	});

	if (typeof(Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function() {
			return this * Math.PI / 180;
		};
	}

	if (typeof(Number.prototype.toDeg) === "undefined") {
		Number.prototype.toDeg = function() {
			return this * 180 / Math.PI;
		};
	}

	// Here comes the magic
	geolib.extend({

		decimal: {},

		sexagesimal: {},

		distance: null,

		getKeys: function(point) {

			// GeoJSON Array [longitude, latitude(, elevation)]
			if(Object.prototype.toString.call(point) == '[object Array]') {

				return {
					longitude: point.length >= 1 ? 0 : undefined,
					latitude: point.length >= 2 ? 1 : undefined,
					elevation: point.length >= 3 ? 2 : undefined
				};

			}

			var getKey = function(possibleValues) {

				var key;

				possibleValues.every(function(val) {
					// TODO: check if point is an object
					if(typeof point != 'object') {
						return true;
					}
					return point.hasOwnProperty(val) ? (function() { key = val; return false; }()) : true;
				});

				return key;

			};

			var longitude = getKey(['lng', 'lon', 'longitude']);
			var latitude = getKey(['lat', 'latitude']);
			var elevation = getKey(['alt', 'altitude', 'elevation', 'elev']);

			// return undefined if not at least one valid property was found
			if(typeof latitude == 'undefined' && 
				typeof longitude == 'undefined' && 
				typeof elevation == 'undefined') {
				return undefined;
			}

			return {
				latitude: latitude,
				longitude: longitude,
				elevation: elevation
			};

		},

		// returns latitude of a given point, converted to decimal
		// set raw to true to avoid conversion
		getLat: function(point, raw) {
			return raw === true ? point[this.getKeys(point).latitude] : this.useDecimal(point[this.getKeys(point).latitude]);
		},

		// Alias for getLat
		latitude: function(point) {
			return this.getLat.call(this, point);
		},

		// returns longitude of a given point, converted to decimal
		// set raw to true to avoid conversion
		getLon: function(point, raw) {
			return raw === true ? point[this.getKeys(point).longitude] : this.useDecimal(point[this.getKeys(point).longitude]);
		},

		// Alias for getLon
		longitude: function(point) {
			return this.getLon.call(this, point);
		},

		getElev: function(point) {
			return point[this.getKeys(point).elevation];
		},

		// Alias for getElev
		elevation: function(point) {
			return this.getElev.call(this, point);
		},

		coords: function(point, raw) {

			var retval = {
				latitude: raw === true ? point[this.getKeys(point).latitude] : this.useDecimal(point[this.getKeys(point).latitude]),
				longitude: raw === true ? point[this.getKeys(point).longitude] : this.useDecimal(point[this.getKeys(point).longitude])
			};

			var elev = point[this.getKeys(point).elevation];

			if(typeof elev !== 'undefined') {
				retval['elevation'] = elev;
			}

			return retval;

		},

		// checks if a variable contains a valid latlong object
		validate: function(point) {

			var keys = this.getKeys(point);

			if(typeof keys === 'undefined' || typeof keys.latitude === 'undefined' || keys.longitude === 'undefined') {
				return false;
			}

			var lat = point[keys.latitude];
			var lng = point[keys.longitude];

			if(typeof lat === 'undefined' || !this.isDecimal(lat) && !this.isSexagesimal(lat)) {
				return false;
			}

			if(typeof lng === 'undefined' || !this.isDecimal(lng) && !this.isSexagesimal(lng)) {
				return false;
			}

			lat = this.useDecimal(lat);
			lng = this.useDecimal(lng);

			if(lat < this.minLat || lat > this.maxLat || lng < this.minLon || lng > this.maxLon) {
				return false;
			}

			return true;

		},

		/**
		* Calculates geodetic distance between two points specified by latitude/longitude using 
		* Vincenty inverse formula for ellipsoids
		* Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010
		* (Licensed under CC BY 3.0)
		*
		* @param    object    Start position {latitude: 123, longitude: 123}
		* @param    object    End position {latitude: 123, longitude: 123}
		* @param    integer   Accuracy (in meters)
		* @return   integer   Distance (in meters)
		*/
		getDistance: function(start, end, accuracy) {

			accuracy = Math.floor(accuracy) || 1;

			var s = this.coords(start);
			var e = this.coords(end);

			var a = 6378137, b = 6356752.314245,  f = 1/298.257223563;  // WGS-84 ellipsoid params
			var L = (e['longitude']-s['longitude']).toRad();

			var cosSigma, sigma, sinAlpha, cosSqAlpha, cos2SigmaM, sinSigma;

			var U1 = Math.atan((1-f) * Math.tan(parseFloat(s['latitude']).toRad()));
			var U2 = Math.atan((1-f) * Math.tan(parseFloat(e['latitude']).toRad()));
			var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
			var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

			var lambda = L, lambdaP, iterLimit = 100;
			do {
				var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
				sinSigma = (
					Math.sqrt(
						(
							cosU2 * sinLambda
						) * (
							cosU2 * sinLambda
						) + (
							cosU1 * sinU2 - sinU1 * cosU2 * cosLambda
						) * (
							cosU1 * sinU2 - sinU1 * cosU2 * cosLambda
						)
					)
				);
				if (sinSigma === 0) {
					return geolib.distance = 0;  // co-incident points
				}

				cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
				sigma = Math.atan2(sinSigma, cosSigma);
				sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
				cosSqAlpha = 1 - sinAlpha * sinAlpha;
				cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

				if (isNaN(cos2SigmaM)) {
					cos2SigmaM = 0;  // equatorial line: cosSqAlpha=0 (§6)
				}
				var C = (
					f / 16 * cosSqAlpha * (
						4 + f * (
							4 - 3 * cosSqAlpha
						)
					)
				);
				lambdaP = lambda;
				lambda = (
					L + (
						1 - C
					) * f * sinAlpha * (
						sigma + C * sinSigma * (
							cos2SigmaM + C * cosSigma * (
								-1 + 2 * cos2SigmaM * cos2SigmaM
							)
						)
					)
				);

			} while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);

			if (iterLimit === 0) {
				return NaN;  // formula failed to converge
			}

			var uSq = (
				cosSqAlpha * (
					a * a - b * b
				) / (
					b*b
				)
			);

			var A = (
				1 + uSq / 16384 * (
					4096 + uSq * (
						-768 + uSq * (
							320 - 175 * uSq
						)
					)
				)
			);

			var B = (
				uSq / 1024 * (
					256 + uSq * (
						-128 + uSq * (
							74-47 * uSq
						)
					)
				)
			);

			var deltaSigma = (
				B * sinSigma * (
					cos2SigmaM + B / 4 * (
						cosSigma * (
							-1 + 2 * cos2SigmaM * cos2SigmaM
						) -B / 6 * cos2SigmaM * (
							-3 + 4 * sinSigma * sinSigma
						) * (
							-3 + 4 * cos2SigmaM * cos2SigmaM
						)
					)
				)
			);

			var distance = b * A * (sigma - deltaSigma);

			distance = distance.toFixed(3); // round to 1mm precision

			//if (start.hasOwnProperty(elevation) && end.hasOwnProperty(elevation)) {
			if (typeof this.elevation(start) !== 'undefined' && typeof this.elevation(end) !== 'undefined') {
				var climb = Math.abs(this.elevation(start) - this.elevation(end));
				distance = Math.sqrt(distance * distance + climb * climb);
			}

			return this.distance = Math.floor(
				Math.round(distance / accuracy) * accuracy
			);

			/*
			// note: to return initial/final bearings in addition to distance, use something like:
			var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
			var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);

			return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
			*/

		},


		/**
		* Calculates the distance between two spots. 
		* This method is more simple but also far more inaccurate
		*
		* @param    object    Start position {latitude: 123, longitude: 123}
		* @param    object    End position {latitude: 123, longitude: 123}
		* @param    integer   Accuracy (in meters)
		* @return   integer   Distance (in meters)
		*/
		getDistanceSimple: function(start, end, accuracy) {

			accuracy = Math.floor(accuracy) || 1;

			var distance = 
				Math.round(
					Math.acos(
						Math.sin(
							this.latitude(end).toRad()
						) * 
						Math.sin(
							this.latitude(start).toRad()
						) + 
						Math.cos(
							this.latitude(end).toRad()
						) * 
						Math.cos(
							this.latitude(start).toRad()
						) * 
						Math.cos(
							this.longitude(start).toRad() - this.longitude(end).toRad()
						) 
					) * this.radius
				);

			return geolib.distance = Math.floor(Math.round(distance/accuracy)*accuracy);

		},


		/**
		* Calculates the center of a collection of geo coordinates
		*
		* @param		array		Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
		* @return		object		{latitude: centerLat, longitude: centerLng, distance: diagonalDistance}
		*/
		getCenter: function(coords) {

			if (!coords.length) {
				return false;
			}

			var max = function( array ){
				return Math.max.apply( Math, array );
			};

			var min = function( array ){
				return Math.min.apply( Math, array );
			};

			var	latitude;
			var longitude;
			var splitCoords = {latitude: [], longitude: []};

			for(var coord in coords) {

				splitCoords.latitude.push(
					this.latitude(coords[coord])
				);

				splitCoords.longitude.push(
					this.longitude(coords[coord])
				);

			}

			var minLat = min(splitCoords.latitude);
			var minLon = min(splitCoords.longitude);
			var maxLat = max(splitCoords.latitude);
			var maxLon = max(splitCoords.longitude);

			latitude = ((minLat + maxLat)/2).toFixed(6);
			longitude = ((minLon + maxLon)/2).toFixed(6);

			// distance from the deepest left to the highest right point (diagonal distance)
			var distance = this.convertUnit('km', this.getDistance({latitude: minLat, longitude: minLon}, {latitude: maxLat, longitude: maxLon}));

			return {
				latitude: latitude, 
				longitude: longitude, 
				distance: distance
			};

		},



		/**
		* Gets the max and min, latitude, longitude, and elevation (if provided).
		* @param		array		array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return	object		{maxLat: maxLat,
		*                     minLat: minLat		
		*                     maxLng: maxLng,
		*                     minLng: minLng,
		*                     maxElev: maxElev,
		*                     minElev: minElev}
		*/
		getBounds: function(coords) {

			if (!coords.length) {
				return false;
			}

			var useElevation = this.elevation(coords[0]);

			var stats = {
				maxLat: -Infinity,
				minLat: Infinity,
				maxLng: -Infinity,
				minLng: Infinity
			};

			if (typeof useElevation != 'undefined') {
				stats.maxElev = 0;
				stats.minElev = Infinity;
			}

			for (var i = 0, l = coords.length; i < l; ++i) {

				stats.maxLat = Math.max(this.latitude(coords[i]), stats.maxLat);
				stats.minLat = Math.min(this.latitude(coords[i]), stats.minLat);
				stats.maxLng = Math.max(this.longitude(coords[i]), stats.maxLng);
				stats.minLng = Math.min(this.longitude(coords[i]), stats.minLng);

				if (useElevation) {
					stats.maxElev = Math.max(this.elevation(coords[i]), stats.maxElev);
					stats.minElev = Math.min(this.elevation(coords[i]), stats.minElev);
				}

			}

			return stats;

		},


		/**
		* Computes the bounding coordinates of all points on the surface
		* of the earth less than or equal to the specified great circle
		* distance.
		*
		* @param object Point position {latitude: 123, longitude: 123}
		* @param number Distance (in meters).
		* @return array Collection of two points defining the SW and NE corners.
		*/
		getBoundsOfDistance: function(point, distance) {

			var latitude = this.latitude(point);
			var longitude = this.longitude(point);

			var radLat = latitude.toRad();
			var radLon = longitude.toRad();

			var radDist = distance / this.radius;
			var minLat = radLat - radDist;
			var maxLat = radLat + radDist;

			var MAX_LAT_RAD = this.maxLat.toRad();
			var MIN_LAT_RAD = this.minLat.toRad();
			var MAX_LON_RAD = this.maxLon.toRad();
			var MIN_LON_RAD = this.minLon.toRad();

			var minLon;
			var maxLon;

			if (minLat > MIN_LAT_RAD && maxLat < MAX_LAT_RAD) {

				var deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
				minLon = radLon - deltaLon;

				if (minLon < MIN_LON_RAD) {
					minLon += 2 * Math.PI;
				}

				maxLon = radLon + deltaLon;

				if (maxLon > MAX_LON_RAD) {
					maxLon -= 2 * Math.PI;
				}

			} else {
				// A pole is within the distance.
				minLat = Math.max(minLat, MIN_LAT_RAD);
				maxLat = Math.min(maxLat, MAX_LAT_RAD);
				minLon = MIN_LON_RAD;
				maxLon = MAX_LON_RAD;
			}

			return [
				// Southwest
				{
					latitude: minLat.toDeg(), 
					longitude: minLon.toDeg()
				},
				// Northeast
				{
					latitude: maxLat.toDeg(), 
					longitude: maxLon.toDeg()
				}
			];

		},


		/**
		* Checks whether a point is inside of a polygon or not.
		* Note that the polygon coords must be in correct order!
		*
		* @param		object		coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
		* @param		array		array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		bool		true if the coordinate is inside the given polygon
		*/
		isPointInside: function(latlng, coords) {

			for(var c = false, i = -1, l = coords.length, j = l - 1; ++i < l; j = i) {

				if(
					(
						(this.longitude(coords[i]) <= this.longitude(latlng) && this.longitude(latlng) < this.longitude(coords[j])) ||
						(this.longitude(coords[j]) <= this.longitude(latlng) && this.longitude(latlng) < this.longitude(coords[i]))
					) && 
					(
						this.latitude(latlng) < (this.latitude(coords[j]) - this.latitude(coords[i])) * 
						(this.longitude(latlng) - this.longitude(coords[i])) / 
						(this.longitude(coords[j]) - this.longitude(coords[i])) + 
						this.latitude(coords[i])
					)
				) {
					c = !c;
				}

			}

			return c;

		},


		/**
		* Shortcut for geolib.isPointInside()
		*/
		isInside: function() {
			return this.isPointInside.apply(this, arguments);
		},


		/**
		* Checks whether a point is inside of a circle or not.
		*
		* @param		object		coordinate to check (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		coordinate of the circle's center (e.g. {latitude: 51.4812, longitude: 7.4025})
		* @param		integer		maximum radius in meters 
		* @return		bool		true if the coordinate is within the given radius
		*/
		isPointInCircle: function(latlng, center, radius) {
			return this.getDistance(latlng, center) < radius;
		},


		/**
		* Shortcut for geolib.isPointInCircle()
		*/
		withinRadius: function() {
			return this.isPointInCircle.apply(this, arguments);
		},


		/**
		* Gets rhumb line bearing of two points. Find out about the difference between rhumb line and 
		* great circle bearing on Wikipedia. It's quite complicated. Rhumb line should be fine in most cases:
		*
		* http://en.wikipedia.org/wiki/Rhumb_line#General_and_mathematical_description
		* 
		* Function heavily based on Doug Vanderweide's great PHP version (licensed under GPL 3.0)
		* http://www.dougv.com/2009/07/13/calculating-the-bearing-and-compass-rose-direction-between-two-latitude-longitude-coordinates-in-php/
		*
		* @param		object		origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		destination coordinate
		* @return		integer		calculated bearing
		*/
		getRhumbLineBearing: function(originLL, destLL) {

			// difference of longitude coords
			var diffLon = this.longitude(destLL).toRad() - this.longitude(originLL).toRad();

			// difference latitude coords phi
			var diffPhi = Math.log(
				Math.tan(
					this.latitude(destLL).toRad() / 2 + Math.PI / 4
				) / 
				Math.tan(
					this.latitude(originLL).toRad() / 2 + Math.PI / 4
				)
			);

			// recalculate diffLon if it is greater than pi
			if(Math.abs(diffLon) > Math.PI) {
				if(diffLon > 0) {
					diffLon = (2 * Math.PI - diffLon) * -1;
				}
				else {
					diffLon = 2 * Math.PI + diffLon;
				}
			}

			//return the angle, normalized
			return (Math.atan2(diffLon, diffPhi).toDeg() + 360) % 360;

		},


		/**
		* Gets great circle bearing of two points. See description of getRhumbLineBearing for more information
		*
		* @param		object		origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		destination coordinate
		* @return		integer		calculated bearing
		*/
		getBearing: function(originLL, destLL) {

			destLL['latitude'] = this.latitude(destLL);
			destLL['longitude'] = this.longitude(destLL);
			originLL['latitude'] = this.latitude(originLL);
			originLL['longitude'] = this.longitude(originLL);

			var bearing = (
				(
					Math.atan2(
						Math.sin(
							destLL['longitude'].toRad() - 
							originLL['longitude'].toRad()
						) * 
						Math.cos(
							destLL['latitude'].toRad()
						), 
						Math.cos(
							originLL['latitude'].toRad()
						) * 
						Math.sin(
							destLL['latitude'].toRad()
						) - 
						Math.sin(
							originLL['latitude'].toRad()
						) * 
						Math.cos(
							destLL['latitude'].toRad()
						) * 
						Math.cos(
							destLL['longitude'].toRad() - originLL['longitude'].toRad()
						)
					)
				).toDeg() + 360
			) % 360;

			return bearing;

		},


		/**
		* Gets the compass direction from an origin coordinate to a destination coordinate.
		*
		* @param		object		origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		destination coordinate
		* @param		string		Bearing mode. Can be either circle or rhumbline
		* @return		object		Returns an object with a rough (NESW) and an exact direction (NNE, NE, ENE, E, ESE, etc).
		*/
		getCompassDirection: function(originLL, destLL, bearingMode) {

			var direction;
			var bearing;

			if(bearingMode == 'circle') { 
				// use great circle bearing
				bearing = this.getBearing(originLL, destLL);
			} else { 
				// default is rhumb line bearing
				bearing = this.getRhumbLineBearing(originLL, destLL);
			}

			switch(Math.round(bearing/22.5)) {
				case 1:
					direction = {exact: "NNE", rough: "N"};
					break;
				case 2:
					direction = {exact: "NE", rough: "N"};
					break;
				case 3:
					direction = {exact: "ENE", rough: "E"};
					break;
				case 4:
					direction = {exact: "E", rough: "E"};
					break;
				case 5:
					direction = {exact: "ESE", rough: "E"};
					break;
				case 6:
					direction = {exact: "SE", rough: "E"};
					break;
				case 7:
					direction = {exact: "SSE", rough: "S"};
					break;
				case 8:
					direction = {exact: "S", rough: "S"};
					break;
				case 9:
					direction = {exact: "SSW", rough: "S"};
					break;
				case 10:
					direction = {exact: "SW", rough: "S"};
					break;
				case 11:
					direction = {exact: "WSW", rough: "W"};
					break;
				case 12:
					direction = {exact: "W", rough: "W"};
					break;
				case 13:
					direction = {exact: "WNW", rough: "W"};
					break;
				case 14:
					direction = {exact: "NW", rough: "W"};
					break;
				case 15:
					direction = {exact: "NNW", rough: "N"}; 
					break;
				default:
					direction = {exact: "N", rough: "N"};
			}

			direction['bearing'] = bearing;
			return direction;

		},


		/**
		* Shortcut for getCompassDirection
		*/
		getDirection: function(originLL, destLL, bearingMode) {
			return this.getCompassDirection.apply(this, arguments);
		},


		/**
		* Sorts an array of coords by distance from a reference coordinate
		*
		* @param		object		reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
		* @param		mixed		array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		array		ordered array
		*/
		orderByDistance: function(latlng, coords) {

			var coordsArray = [];

			for(var coord in coords) {

				var d = this.getDistance(latlng, coords[coord]);

				coordsArray.push({
					key: coord, 
					latitude: this.latitude(coords[coord]), 
					longitude: this.longitude(coords[coord]), 
					distance: d
				});

			}

			return coordsArray.sort(function(a, b) { return a.distance - b.distance; });

		},


		/**
		* Finds the nearest coordinate to a reference coordinate
		*
		* @param		object		reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
		* @param		mixed		array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		array		ordered array
		*/
		findNearest: function(latlng, coords, offset, limit) {

			offset = offset || 0;
			limit = limit || 1;
			var ordered = this.orderByDistance(latlng, coords);

			if(limit === 1) {
				return ordered[offset];
			} else {
				return ordered.splice(offset, limit);
			}

		},


		/**
		* Calculates the length of a given path
		*
		* @param		mixed		array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		integer		length of the path (in meters)
		*/
		getPathLength: function(coords) {

			var dist = 0;
			var last;

			for (var i = 0, l = coords.length; i < l; ++i) {
				if(last) {
					//console.log(coords[i], last, this.getDistance(coords[i], last));
					dist += this.getDistance(this.coords(coords[i]), last);
				}
				last = this.coords(coords[i]);
			}

			return dist;

		},


		/**
		* Calculates the speed between to points within a given time span.
		*
		* @param		object		coords with javascript timestamp {latitude: 51.5143, longitude: 7.4138, time: 1360231200880}
		* @param		object		coords with javascript timestamp {latitude: 51.5502, longitude: 7.4323, time: 1360245600460}
		* @param		object		options (currently "unit" is the only option. Default: km(h));
		* @return		float		speed in unit per hour
		*/
		getSpeed: function(start, end, options) {

			var unit = options && options.unit || 'km';

			if(unit == 'mph') {
				unit = 'mi';
			} else if(unit == 'kmh') {
				unit = 'km';
			}

			var distance = geolib.getDistance(start, end);
			var time = ((end.time*1)/1000) - ((start.time*1)/1000);
			var mPerHr = (distance/time)*3600;
			var speed = Math.round(mPerHr * this.measures[unit] * 10000)/10000;
			return speed;

		},


		/**
		* Converts a distance from meters to km, mm, cm, mi, ft, in or yd
		*
		* @param		string		Format to be converted in
		* @param		float		Distance in meters
		* @param		float		Decimal places for rounding (default: 4)
		* @return		float		Converted distance
		*/
		convertUnit: function(unit, distance, round) {

			if(distance === 0 || typeof distance === 'undefined') {

				if(this.distance === 0) {
					// throw 'No distance given.';
					return 0;
				} else {
					distance = this.distance;
				}

			}

			unit = unit || 'm';
			round = (null == round ? 4 : round);

			if(typeof this.measures[unit] !== 'undefined') {
				return this.round(distance * this.measures[unit], round);
			} else {
				throw new Error('Unknown unit for conversion.');
			}

		},


		/**
		* Checks if a value is in decimal format or, if neccessary, converts to decimal
		*
		* @param		mixed		Value(s) to be checked/converted (array of latlng objects, latlng object, sexagesimal string, float)
		* @return		float		Input data in decimal format
		*/
		useDecimal: function(value) {

			if(Object.prototype.toString.call(value) === '[object Array]') {

				var geolib = this;

				value = value.map(function(val) {

					//if(!isNaN(parseFloat(val))) {
					if(geolib.isDecimal(val)) {

						return geolib.useDecimal(val);

					} else if(typeof val == 'object') {

						if(geolib.validate(val)) {

							return geolib.coords(val);

						} else {

							for(var prop in val) {
								val[prop] = geolib.useDecimal(val[prop]);
							}

							return val;

						}

					} else if(geolib.isSexagesimal(val)) {

						return geolib.sexagesimal2decimal(val);

					} else {

						return val;

					}

				});

				return value;

			} else if(typeof value === 'object' && this.validate(value)) {

				return this.coords(value);

			} else if(typeof value === 'object') {

				for(var prop in value) {
					value[prop] = this.useDecimal(value[prop]);
				}

				return value;

			}


			if (this.isDecimal(value)) {

				return parseFloat(value);

			} else if(this.isSexagesimal(value) === true) {

				return parseFloat(this.sexagesimal2decimal(value));

			}

			throw new Error('Unknown format.');

		},

		/**
		* Converts a decimal coordinate value to sexagesimal format
		*
		* @param		float		decimal
		* @return		string		Sexagesimal value (XX° YY' ZZ")
		*/
		decimal2sexagesimal: function(dec) {

			if (dec in this.sexagesimal) {
				return this.sexagesimal[dec];
			}

			var tmp = dec.toString().split('.');

			var deg = Math.abs(tmp[0]);
			var min = ('0.' + tmp[1])*60;
			var sec = min.toString().split('.');

			min = Math.floor(min);
			sec = (('0.' + sec[1]) * 60).toFixed(2);

			this.sexagesimal[dec] = (deg + '° ' + min + "' " + sec + '"');

			return this.sexagesimal[dec];

		},


		/**
		* Converts a sexagesimal coordinate to decimal format
		*
		* @param		float		Sexagesimal coordinate
		* @return		string		Decimal value (XX.XXXXXXXX)
		*/
		sexagesimal2decimal: function(sexagesimal) {

			if (sexagesimal in this.decimal) {
				return this.decimal[sexagesimal];
			}

			var	regEx = new RegExp(this.sexagesimalPattern);
			var	data = regEx.exec(sexagesimal);
			var min = 0, sec = 0;

			if(data) {
				min = parseFloat(data[2]/60);
				sec = parseFloat(data[4]/3600) || 0;
			}

			var	dec = ((parseFloat(data[1]) + min + sec)).toFixed(8);
			//var	dec = ((parseFloat(data[1]) + min + sec));

				// South and West are negative decimals
				dec = (data[7] == 'S' || data[7] == 'W') ? parseFloat(-dec) : parseFloat(dec);
				//dec = (data[7] == 'S' || data[7] == 'W') ? -dec : dec;

			this.decimal[sexagesimal] = dec;

			return dec;

		},


		/**
		* Checks if a value is in decimal format
		*
		* @param		string		Value to be checked
		* @return		bool		True if in sexagesimal format
		*/
		isDecimal: function(value) {

			value = value.toString().replace(/\s*/, '');

			// looks silly but works as expected
			// checks if value is in decimal format
			return (!isNaN(parseFloat(value)) && parseFloat(value) == value);

		},


		/**
		* Checks if a value is in sexagesimal format
		*
		* @param		string		Value to be checked
		* @return		bool		True if in sexagesimal format
		*/
		isSexagesimal: function(value) {

			value = value.toString().replace(/\s*/, '');

			return this.sexagesimalPattern.test(value);

		},

		round: function(value, n) {
			var decPlace = Math.pow(10, n);
			return Math.round(value * decPlace)/decPlace;
		}

	});

	// Node module
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {

		global.geolib = module.exports = geolib;

	// AMD module
	} else if (typeof define === "function" && define.amd) {

		define("geolib", [], function () {
			return geolib; 
		});

	// we're in a browser
	} else {

		global.geolib = geolib;

	}

}(this));
},{}],6:[function(require,module,exports){
/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade
*/
(function (window, document, undefined) {
var oldL = window.L,
    L = {};

L.version = '0.7.2';

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = L;

// define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
	define(L);
}

// define Leaflet as a global L variable, saving the original L to restore later if needed

L.noConflict = function () {
	window.L = oldL;
	return this;
};

window.L = L;


/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

L.Util = {
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0,
		    key = '_leaflet_id';
		return function (obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),

	invokeEach: function (obj, method, context) {
		var i, args;

		if (typeof obj === 'object') {
			args = Array.prototype.slice.call(arguments, 3);

			for (i in obj) {
				method.apply(context, [i, obj[i]].concat(args));
			}
			return true;
		}

		return false;
	},

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	falseFn: function () {
		return false;
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	splitWords: function (str) {
		return L.Util.trim(str).split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = L.extend({}, obj.options, options);
		return obj.options;
	},

	getParamString: function (obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	},
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},

	isArray: Array.isArray || function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	},

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

	// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	function getPrefixed(name) {
		var i, fn,
		    prefixes = ['webkit', 'moz', 'o', 'ms'];

		for (i = 0; i < prefixes.length && !fn; i++) {
			fn = window[prefixes[i] + name];
		}

		return fn;
	}

	var lastTime = 0;

	function timeoutDefer(fn) {
		var time = +new Date(),
		    timeToCall = Math.max(0, 16 - (time - lastTime));

		lastTime = time + timeToCall;
		return window.setTimeout(fn, timeToCall);
	}

	var requestFn = window.requestAnimationFrame ||
	        getPrefixed('RequestAnimationFrame') || timeoutDefer;

	var cancelFn = window.cancelAnimationFrame ||
	        getPrefixed('CancelAnimationFrame') ||
	        getPrefixed('CancelRequestAnimationFrame') ||
	        function (id) { window.clearTimeout(id); };


	L.Util.requestAnimFrame = function (fn, context, immediate, element) {
		fn = L.bind(fn, context);

		if (immediate && requestFn === timeoutDefer) {
			fn();
		} else {
			return requestFn.call(window, fn, element);
		}
	};

	L.Util.cancelAnimFrame = function (id) {
		if (id) {
			cancelFn.call(window, id);
		}
	};

}());

// shortcuts for most used utility functions
L.extend = L.Util.extend;
L.bind = L.Util.bind;
L.stamp = L.Util.stamp;
L.setOptions = L.Util.setOptions;


/*
 * L.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

L.Class = function () {};

L.Class.extend = function (props) {

	// extended class with the new prototype
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		L.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		L.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = L.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	L.extend(proto, props);

	proto._initHooks = [];

	var parent = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// method for adding properties to prototype
L.Class.include = function (props) {
	L.extend(this.prototype, props);
};

// merge new default options to the Class
L.Class.mergeOptions = function (options) {
	L.extend(this.prototype.options, options);
};

// add a constructor hook
L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};


/*
 * L.Mixin.Events is used to add custom events functionality to Leaflet classes.
 */

var eventsKey = '_leaflet_events';

L.Mixin = {};

L.Mixin.Events = {

	addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey] = this[eventsKey] || {},
		    contextId = context && context !== this && L.stamp(context),
		    i, len, event, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			event = {
				action: fn,
				context: context || this
			};
			type = types[i];

			if (contextId) {
				// store listeners of a particular context in a separate hash (if it has an id)
				// gives a major performance boost when removing thousands of map layers

				indexKey = type + '_idx';
				indexLenKey = indexKey + '_len';

				typeIndex = events[indexKey] = events[indexKey] || {};

				if (!typeIndex[contextId]) {
					typeIndex[contextId] = [];

					// keep track of the number of keys in the index to quickly check if it's empty
					events[indexLenKey] = (events[indexLenKey] || 0) + 1;
				}

				typeIndex[contextId].push(event);


			} else {
				events[type] = events[type] || [];
				events[type].push(event);
			}
		}

		return this;
	},

	hasEventListeners: function (type) { // (String) -> Boolean
		var events = this[eventsKey];
		return !!events && ((type in events && events[type].length > 0) ||
		                    (type + '_idx' in events && events[type + '_idx_len'] > 0));
	},

	removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

		if (!this[eventsKey]) {
			return this;
		}

		if (!types) {
			return this.clearAllEventListeners();
		}

		if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey],
		    contextId = context && context !== this && L.stamp(context),
		    i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_idx';
			indexLenKey = indexKey + '_len';

			typeIndex = events[indexKey];

			if (!fn) {
				// clear all listeners for a type if function isn't specified
				delete events[type];
				delete events[indexKey];
				delete events[indexLenKey];

			} else {
				listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

				if (listeners) {
					for (j = listeners.length - 1; j >= 0; j--) {
						if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
							removed = listeners.splice(j, 1);
							// set the old action to a no-op, because it is possible
							// that the listener is being iterated over as part of a dispatch
							removed[0].action = L.Util.falseFn;
						}
					}

					if (context && typeIndex && (listeners.length === 0)) {
						delete typeIndex[contextId];
						events[indexLenKey]--;
					}
				}
			}
		}

		return this;
	},

	clearAllEventListeners: function () {
		delete this[eventsKey];
		return this;
	},

	fireEvent: function (type, data) { // (String[, Object])
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = L.Util.extend({}, data, { type: type, target: this });

		var events = this[eventsKey],
		    listeners, i, len, typeIndex, contextId;

		if (events[type]) {
			// make sure adding/removing listeners inside other listeners won't cause infinite loop
			listeners = events[type].slice();

			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].action.call(listeners[i].context, event);
			}
		}

		// fire event for the context-indexed listeners as well
		typeIndex = events[type + '_idx'];

		for (contextId in typeIndex) {
			listeners = typeIndex[contextId].slice();

			if (listeners) {
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].action.call(listeners[i].context, event);
				}
			}
		}

		return this;
	},

	addOneTimeEventListener: function (types, fn, context) {

		if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

		var handler = L.bind(function () {
			this
			    .removeEventListener(types, fn, context)
			    .removeEventListener(types, handler, context);
		}, this);

		return this
		    .addEventListener(types, fn, context)
		    .addEventListener(types, handler, context);
	}
};

L.Mixin.Events.on = L.Mixin.Events.addEventListener;
L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
L.Mixin.Events.fire = L.Mixin.Events.fireEvent;


/*
 * L.Browser handles different browser and feature detections for internal Leaflet use.
 */

(function () {

	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !document.addEventListener,

	    // terrible browser detection to work around Safari / iOS / Android browser bugs
	    ua = navigator.userAgent.toLowerCase(),
	    webkit = ua.indexOf('webkit') !== -1,
	    chrome = ua.indexOf('chrome') !== -1,
	    phantomjs = ua.indexOf('phantom') !== -1,
	    android = ua.indexOf('android') !== -1,
	    android23 = ua.search('android [23]') !== -1,
		gecko = ua.indexOf('gecko') !== -1,

	    mobile = typeof orientation !== undefined + '',
	    msPointer = window.navigator && window.navigator.msPointerEnabled &&
	              window.navigator.msMaxTouchPoints && !window.PointerEvent,
		pointer = (window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints) ||
				  msPointer,
	    retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
	             ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
	              window.matchMedia('(min-resolution:144dpi)').matches),

	    doc = document.documentElement,
	    ie3d = ie && ('transition' in doc.style),
	    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
	    gecko3d = 'MozPerspective' in doc.style,
	    opera3d = 'OTransition' in doc.style,
	    any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;


	// PhantomJS has 'ontouchstart' in document.documentElement, but doesn't actually support touch.
	// https://github.com/Leaflet/Leaflet/pull/1434#issuecomment-13843151

	var touch = !window.L_NO_TOUCH && !phantomjs && (function () {

		var startName = 'ontouchstart';

		// IE10+ (We simulate these into touch* events in L.DomEvent and L.DomEvent.Pointer) or WebKit, etc.
		if (pointer || (startName in doc)) {
			return true;
		}

		// Firefox/Gecko
		var div = document.createElement('div'),
		    supported = false;

		if (!div.setAttribute) {
			return false;
		}
		div.setAttribute(startName, 'return;');

		if (typeof div[startName] === 'function') {
			supported = true;
		}

		div.removeAttribute(startName);
		div = null;

		return supported;
	}());


	L.Browser = {
		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

		android: android,
		android23: android23,

		chrome: chrome,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

		retina: retina
	};

}());


/*
 * L.Point represents a point with x and y coordinates.
 */

L.Point = function (/*Number*/ x, /*Number*/ y, /*Boolean*/ round) {
	this.x = (round ? Math.round(x) : x);
	this.y = (round ? Math.round(y) : y);
};

L.Point.prototype = {

	clone: function () {
		return new L.Point(this.x, this.y);
	},

	// non-destructive, returns a new point
	add: function (point) {
		return this.clone()._add(L.point(point));
	},

	// destructive, used directly for performance in situations where it's safe to modify existing point
	_add: function (point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	subtract: function (point) {
		return this.clone()._subtract(L.point(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	distanceTo: function (point) {
		point = L.point(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	equals: function (point) {
		point = L.point(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	contains: function (point) {
		point = L.point(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	toString: function () {
		return 'Point(' +
		        L.Util.formatNum(this.x) + ', ' +
		        L.Util.formatNum(this.y) + ')';
	}
};

L.point = function (x, y, round) {
	if (x instanceof L.Point) {
		return x;
	}
	if (L.Util.isArray(x)) {
		return new L.Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	return new L.Point(x, y, round);
};


/*
 * L.Bounds represents a rectangular area on the screen in pixel coordinates.
 */

L.Bounds = function (a, b) { //(Point, Point) or Point[]
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
};

L.Bounds.prototype = {
	// extend the bounds to contain the given point
	extend: function (point) { // (Point)
		point = L.point(point);

		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	getCenter: function (round) { // (Boolean) -> Point
		return new L.Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	getBottomLeft: function () { // -> Point
		return new L.Point(this.min.x, this.max.y);
	},

	getTopRight: function () { // -> Point
		return new L.Point(this.max.x, this.min.y);
	},

	getSize: function () {
		return this.max.subtract(this.min);
	},

	contains: function (obj) { // (Bounds) or (Point) -> Boolean
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof L.Point) {
			obj = L.point(obj);
		} else {
			obj = L.bounds(obj);
		}

		if (obj instanceof L.Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = L.bounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};

L.bounds = function (a, b) { // (Bounds) or (Point, Point) or (Point[])
	if (!a || a instanceof L.Bounds) {
		return a;
	}
	return new L.Bounds(a, b);
};


/*
 * L.Transformation is an utility class to perform simple point transformations through a 2d-matrix.
 */

L.Transformation = function (a, b, c, d) {
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
};

L.Transformation.prototype = {
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	untransform: function (point, scale) {
		scale = scale || 1;
		return new L.Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};


/*
 * L.DomUtil contains various utility functions for working with DOM.
 */

L.DomUtil = {
	get: function (id) {
		return (typeof id === 'string' ? document.getElementById(id) : id);
	},

	getStyle: function (el, style) {

		var value = el.style[style];

		if (!value && el.currentStyle) {
			value = el.currentStyle[style];
		}

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}

		return value === 'auto' ? null : value;
	},

	getViewportOffset: function (element) {

		var top = 0,
		    left = 0,
		    el = element,
		    docBody = document.body,
		    docEl = document.documentElement,
		    pos;

		do {
			top  += el.offsetTop  || 0;
			left += el.offsetLeft || 0;

			//add borders
			top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
			left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;

			pos = L.DomUtil.getStyle(el, 'position');

			if (el.offsetParent === docBody && pos === 'absolute') { break; }

			if (pos === 'fixed') {
				top  += docBody.scrollTop  || docEl.scrollTop  || 0;
				left += docBody.scrollLeft || docEl.scrollLeft || 0;
				break;
			}

			if (pos === 'relative' && !el.offsetLeft) {
				var width = L.DomUtil.getStyle(el, 'width'),
				    maxWidth = L.DomUtil.getStyle(el, 'max-width'),
				    r = el.getBoundingClientRect();

				if (width !== 'none' || maxWidth !== 'none') {
					left += r.left + el.clientLeft;
				}

				//calculate full y offset since we're breaking out of the loop
				top += r.top + (docBody.scrollTop  || docEl.scrollTop  || 0);

				break;
			}

			el = el.offsetParent;

		} while (el);

		el = element;

		do {
			if (el === docBody) { break; }

			top  -= el.scrollTop  || 0;
			left -= el.scrollLeft || 0;

			el = el.parentNode;
		} while (el);

		return new L.Point(left, top);
	},

	documentIsLtr: function () {
		if (!L.DomUtil._docIsLtrCached) {
			L.DomUtil._docIsLtrCached = true;
			L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
		}
		return L.DomUtil._docIsLtr;
	},

	create: function (tagName, className, container) {

		var el = document.createElement(tagName);
		el.className = className;

		if (container) {
			container.appendChild(el);
		}

		return el;
	},

	hasClass: function (el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = L.DomUtil._getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	},

	addClass: function (el, name) {
		if (el.classList !== undefined) {
			var classes = L.Util.splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!L.DomUtil.hasClass(el, name)) {
			var className = L.DomUtil._getClass(el);
			L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
		}
	},

	removeClass: function (el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	},

	_setClass: function (el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	},

	_getClass: function (el) {
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	},

	setOpacity: function (el, value) {

		if ('opacity' in el.style) {
			el.style.opacity = value;

		} else if ('filter' in el.style) {

			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';

			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}

			value = Math.round(value * 100);

			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		}
	},

	testProp: function (props) {

		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	},

	getTranslateString: function (point) {
		// on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
		// makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
		// (same speed either way), Opera 12 doesn't support translate3d

		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	},

	getScaleString: function (scale, origin) {

		var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
		    scaleStr = ' scale(' + scale + ') ';

		return preTranslateStr + scaleStr;
	},

	setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] =  L.DomUtil.getTranslateString(point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	},

	getPosition: function (el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		// jshint camelcase: false
		return el._leaflet_pos;
	}
};


// prefix style property names

L.DomUtil.TRANSFORM = L.DomUtil.testProp(
        ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

L.DomUtil.TRANSITION = L.DomUtil.testProp(
        ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

L.DomUtil.TRANSITION_END =
        L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ?
        L.DomUtil.TRANSITION + 'End' : 'transitionend';

(function () {
    if ('onselectstart' in document) {
        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
            },

            enableTextSelection: function () {
                L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
            }
        });
    } else {
        var userSelectProperty = L.DomUtil.testProp(
            ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                if (userSelectProperty) {
                    var style = document.documentElement.style;
                    this._userSelect = style[userSelectProperty];
                    style[userSelectProperty] = 'none';
                }
            },

            enableTextSelection: function () {
                if (userSelectProperty) {
                    document.documentElement.style[userSelectProperty] = this._userSelect;
                    delete this._userSelect;
                }
            }
        });
    }

	L.extend(L.DomUtil, {
		disableImageDrag: function () {
			L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
		},

		enableImageDrag: function () {
			L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
		}
	});
})();


/*
 * L.LatLng represents a geographical point with latitude and longitude coordinates.
 */

L.LatLng = function (lat, lng, alt) { // (Number, Number, Number)
	lat = parseFloat(lat);
	lng = parseFloat(lng);

	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	this.lat = lat;
	this.lng = lng;

	if (alt !== undefined) {
		this.alt = parseFloat(alt);
	}
};

L.extend(L.LatLng, {
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

L.LatLng.prototype = {
	equals: function (obj) { // (LatLng) -> Boolean
		if (!obj) { return false; }

		obj = L.latLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= L.LatLng.MAX_MARGIN;
	},

	toString: function (precision) { // (Number) -> String
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ')';
	},

	// Haversine distance formula, see http://en.wikipedia.org/wiki/Haversine_formula
	// TODO move to projection code, LatLng shouldn't know about Earth
	distanceTo: function (other) { // (LatLng) -> Number
		other = L.latLng(other);

		var R = 6378137, // earth radius in meters
		    d2r = L.LatLng.DEG_TO_RAD,
		    dLat = (other.lat - this.lat) * d2r,
		    dLon = (other.lng - this.lng) * d2r,
		    lat1 = this.lat * d2r,
		    lat2 = other.lat * d2r,
		    sin1 = Math.sin(dLat / 2),
		    sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	},

	wrap: function (a, b) { // (Number, Number) -> LatLng
		var lng = this.lng;

		a = a || -180;
		b = b ||  180;

		lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);

		return new L.LatLng(this.lat, lng);
	}
};

L.latLng = function (a, b) { // (LatLng) or ([Number, Number]) or (Number, Number)
	if (a instanceof L.LatLng) {
		return a;
	}
	if (L.Util.isArray(a)) {
		if (typeof a[0] === 'number' || typeof a[0] === 'string') {
			return new L.LatLng(a[0], a[1], a[2]);
		} else {
			return null;
		}
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
	}
	if (b === undefined) {
		return null;
	}
	return new L.LatLng(a, b);
};



/*
 * L.LatLngBounds represents a rectangular area on the map in geographical coordinates.
 */

L.LatLngBounds = function (southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
	if (!southWest) { return; }

	var latlngs = northEast ? [southWest, northEast] : southWest;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
};

L.LatLngBounds.prototype = {
	// extend the bounds to contain the given point or bounds
	extend: function (obj) { // (LatLng) or (LatLngBounds)
		if (!obj) { return this; }

		var latLng = L.latLng(obj);
		if (latLng !== null) {
			obj = latLng;
		} else {
			obj = L.latLngBounds(obj);
		}

		if (obj instanceof L.LatLng) {
			if (!this._southWest && !this._northEast) {
				this._southWest = new L.LatLng(obj.lat, obj.lng);
				this._northEast = new L.LatLng(obj.lat, obj.lng);
			} else {
				this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
				this._southWest.lng = Math.min(obj.lng, this._southWest.lng);

				this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
				this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
			}
		} else if (obj instanceof L.LatLngBounds) {
			this.extend(obj._southWest);
			this.extend(obj._northEast);
		}
		return this;
	},

	// extend the bounds by a percentage
	pad: function (bufferRatio) { // (Number) -> LatLngBounds
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new L.LatLngBounds(
		        new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	getCenter: function () { // -> LatLng
		return new L.LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	getSouthWest: function () {
		return this._southWest;
	},

	getNorthEast: function () {
		return this._northEast;
	},

	getNorthWest: function () {
		return new L.LatLng(this.getNorth(), this.getWest());
	},

	getSouthEast: function () {
		return new L.LatLng(this.getSouth(), this.getEast());
	},

	getWest: function () {
		return this._southWest.lng;
	},

	getSouth: function () {
		return this._southWest.lat;
	},

	getEast: function () {
		return this._northEast.lng;
	},

	getNorth: function () {
		return this._northEast.lat;
	},

	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
			obj = L.latLng(obj);
		} else {
			obj = L.latLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof L.LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	intersects: function (bounds) { // (LatLngBounds)
		bounds = L.latLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	equals: function (bounds) { // (LatLngBounds)
		if (!bounds) { return false; }

		bounds = L.latLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest()) &&
		       this._northEast.equals(bounds.getNorthEast());
	},

	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

//TODO International date line?

L.latLngBounds = function (a, b) { // (LatLngBounds) or (LatLng, LatLng)
	if (!a || a instanceof L.LatLngBounds) {
		return a;
	}
	return new L.LatLngBounds(a, b);
};


/*
 * L.Projection contains various geographical projections used by CRS classes.
 */

L.Projection = {};


/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

L.Projection.SphericalMercator = {
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    x = latlng.lng * d,
		    y = lat * d;

		y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    lng = point.x * d,
		    lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

		return new L.LatLng(lat, lng);
	}
};


/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

L.Projection.LonLat = {
	project: function (latlng) {
		return new L.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new L.LatLng(point.y, point.x);
	}
};


/*
 * L.CRS is a base object for all defined CRS (Coordinate Reference Systems) in Leaflet.
 */

L.CRS = {
	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	project: function (latlng) {
		return this.projection.project(latlng);
	},

	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	getSize: function (zoom) {
		var s = this.scale(zoom);
		return L.point(s, s);
	}
};


/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */

L.CRS.Simple = L.extend({}, L.CRS, {
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	}
});


/*
 * L.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping
 * and is used by Leaflet by default.
 */

L.CRS.EPSG3857 = L.extend({}, L.CRS, {
	code: 'EPSG:3857',

	projection: L.Projection.SphericalMercator,
	transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

	project: function (latlng) { // (LatLng) -> Point
		var projectedPoint = this.projection.project(latlng),
		    earthRadius = 6378137;
		return projectedPoint.multiplyBy(earthRadius);
	}
});

L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {
	code: 'EPSG:900913'
});


/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

L.CRS.EPSG4326 = L.extend({}, L.CRS, {
	code: 'EPSG:4326',

	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
});


/*
 * L.Map is the central class of the API - it is used to create a map.
 */

L.Map = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		crs: L.CRS.EPSG3857,

		/*
		center: LatLng,
		zoom: Number,
		layers: Array,
		*/

		fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
		trackResize: true,
		markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = L.setOptions(this, options);


		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = L.bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(L.latLng(options.center), options.zoom, {reset: true});
		}

		this._handlers = [];

		this._layers = {};
		this._zoomBoundLayers = {};
		this._tileLayersNum = 0;

		this.callInitHooks();

		this._addLayers(options.layers);
	},


	// public methods that modify map state

	// replaced by animation-powered implementation in Map.PanAnimation.js
	setView: function (center, zoom) {
		zoom = zoom === undefined ? this.getZoom() : zoom;
		this._resetView(L.latLng(center), this._limitZoom(zoom));
		return this;
	},

	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = this._limitZoom(zoom);
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	zoomIn: function (delta, options) {
		return this.setZoom(this._zoom + (delta || 1), options);
	},

	zoomOut: function (delta, options) {
		return this.setZoom(this._zoom - (delta || 1), options);
	},

	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	fitBounds: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

		var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR)),
		    paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		zoom = options && options.maxZoom ? Math.min(options.maxZoom, zoom) : zoom;

		return this.setView(center, zoom, options);
	},

	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	panBy: function (offset) { // (Point)
		// replaced with animated panBy in Map.PanAnimation.js
		this.fire('movestart');

		this._rawPanBy(L.point(offset));

		this.fire('move');
		return this.fire('moveend');
	},

	setMaxBounds: function (bounds) {
		bounds = L.latLngBounds(bounds);

		this.options.maxBounds = bounds;

		if (!bounds) {
			return this.off('moveend', this._panInsideMaxBounds, this);
		}

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds, this);
	},

	panInsideBounds: function (bounds, options) {
		var center = this.getCenter(),
			newCenter = this._limitCenter(center, this._zoom, bounds);

		if (center.equals(newCenter)) { return this; }

		return this.panTo(newCenter, options);
	},

	addLayer: function (layer) {
		// TODO method is too big, refactor

		var id = L.stamp(layer);

		if (this._layers[id]) { return this; }

		this._layers[id] = layer;

		// TODO getMaxZoom, getMinZoom in ILayer (instead of options)
		if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
			this._zoomBoundLayers[id] = layer;
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor!!!
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum++;
			this._tileLayersToLoad++;
			layer.on('load', this._onTileLayerLoad, this);
		}

		if (this._loaded) {
			this._layerAdd(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
		}

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum--;
			this._tileLayersToLoad--;
			layer.off('load', this._onTileLayerLoad, this);
		}

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (L.stamp(layer) in this._layers);
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = L.extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._initialCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// TODO handler.addTo
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	remove: function () {
		if (this._loaded) {
			this.fire('unload');
		}

		this._initEvents('off');

		try {
			// throws error in IE6-8
			delete this._container._leaflet;
		} catch (e) {
			this._container._leaflet = undefined;
		}

		this._clearPanes();
		if (this._clearControlPos) {
			this._clearControlPos();
		}

		this._clearHandlers();

		return this;
	},


	// public methods for getting map state

	getCenter: function () { // (Boolean) -> LatLng
		this._checkIfLoaded();

		if (this._initialCenter && !this._moved()) {
			return this._initialCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	getZoom: function () {
		return this._zoom;
	},

	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new L.LatLngBounds(sw, ne);
	},

	getMinZoom: function () {
		return this.options.minZoom === undefined ?
			(this._layersMinZoom === undefined ? 0 : this._layersMinZoom) :
			this.options.minZoom;
	},

	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = L.latLngBounds(bounds);

		var zoom = this.getMinZoom() - (inside ? 1 : 0),
		    maxZoom = this.getMaxZoom(),
		    size = this.getSize(),

		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),

		    zoomNotFound = true,
		    boundsSize;

		padding = L.point(padding || [0, 0]);

		do {
			zoom++;
			boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
			zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;

		} while (zoomNotFound && zoom <= maxZoom);

		if (zoomNotFound && inside) {
			return null;
		}

		return inside ? zoom : zoom - 1;
	},

	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new L.Point(
				this._container.clientWidth,
				this._container.clientHeight);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	getPixelBounds: function () {
		var topLeftPoint = this._getTopLeftPoint();
		return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._initialTopLeftPoint;
	},

	getPanes: function () {
		return this._panes;
	},

	getContainer: function () {
		return this._container;
	},


	// TODO replace with universal implementation after refactoring projections

	getZoomScale: function (toZoom) {
		var crs = this.options.crs;
		return crs.scale(toZoom) / crs.scale(this._zoom);
	},

	getScaleZoom: function (scale) {
		return this._zoom + (Math.log(scale) / Math.LN2);
	},


	// conversion methods

	project: function (latlng, zoom) { // (LatLng[, Number]) -> Point
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
	},

	unproject: function (point, zoom) { // (Point[, Number]) -> LatLng
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(L.point(point), zoom);
	},

	layerPointToLatLng: function (point) { // (Point)
		var projectedPoint = L.point(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	latLngToLayerPoint: function (latlng) { // (LatLng)
		var projectedPoint = this.project(L.latLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	containerPointToLayerPoint: function (point) { // (Point)
		return L.point(point).subtract(this._getMapPanePos());
	},

	layerPointToContainerPoint: function (point) { // (Point)
		return L.point(point).add(this._getMapPanePos());
	},

	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(L.point(point));
		return this.layerPointToLatLng(layerPoint);
	},

	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
	},

	mouseEventToContainerPoint: function (e) { // (MouseEvent)
		return L.DomEvent.getMousePosition(e, this._container);
	},

	mouseEventToLayerPoint: function (e) { // (MouseEvent)
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = L.DomUtil.get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet) {
			throw new Error('Map container is already initialized.');
		}

		container._leaflet = true;
	},

	_initLayout: function () {
		var container = this._container;

		L.DomUtil.addClass(container, 'leaflet-container' +
			(L.Browser.touch ? ' leaflet-touch' : '') +
			(L.Browser.retina ? ' leaflet-retina' : '') +
			(L.Browser.ielt9 ? ' leaflet-oldie' : '') +
			(this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));

		var position = L.DomUtil.getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};

		this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

		this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
		panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
		panes.shadowPane = this._createPane('leaflet-shadow-pane');
		panes.overlayPane = this._createPane('leaflet-overlay-pane');
		panes.markerPane = this._createPane('leaflet-marker-pane');
		panes.popupPane = this._createPane('leaflet-popup-pane');

		var zoomHide = ' leaflet-zoom-hide';

		if (!this.options.markerZoomAnimation) {
			L.DomUtil.addClass(panes.markerPane, zoomHide);
			L.DomUtil.addClass(panes.shadowPane, zoomHide);
			L.DomUtil.addClass(panes.popupPane, zoomHide);
		}
	},

	_createPane: function (className, container) {
		return L.DomUtil.create('div', className, container || this._panes.objectsPane);
	},

	_clearPanes: function () {
		this._container.removeChild(this._mapPane);
	},

	_addLayers: function (layers) {
		layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},


	// private methods that modify map state

	_resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {

		var zoomChanged = (this._zoom !== zoom);

		if (!afterZoomAnim) {
			this.fire('movestart');

			if (zoomChanged) {
				this.fire('zoomstart');
			}
		}

		this._zoom = zoom;
		this._initialCenter = center;

		this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

		if (!preserveMapOffset) {
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
		} else {
			this._initialTopLeftPoint._add(this._getMapPanePos());
		}

		this._tileLayersToLoad = this._tileLayersNum;

		var loading = !this._loaded;
		this._loaded = true;

		this.fire('viewreset', {hard: !preserveMapOffset});

		if (loading) {
			this.fire('load');
			this.eachLayer(this._layerAdd, this);
		}

		this.fire('move');

		if (zoomChanged || afterZoomAnim) {
			this.fire('zoomend');
		}

		this.fire('moveend', {hard: !preserveMapOffset});
	},

	_rawPanBy: function (offset) {
		L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_updateZoomLevels: function () {
		var i,
			minZoom = Infinity,
			maxZoom = -Infinity,
			oldZoomSpan = this._getZoomSpan();

		for (i in this._zoomBoundLayers) {
			var layer = this._zoomBoundLayers[i];
			if (!isNaN(layer.options.minZoom)) {
				minZoom = Math.min(minZoom, layer.options.minZoom);
			}
			if (!isNaN(layer.options.maxZoom)) {
				maxZoom = Math.max(maxZoom, layer.options.maxZoom);
			}
		}

		if (i === undefined) { // we have no tilelayers
			this._layersMaxZoom = this._layersMinZoom = undefined;
		} else {
			this._layersMaxZoom = maxZoom;
			this._layersMinZoom = minZoom;
		}

		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}
	},

	_panInsideMaxBounds: function () {
		this.panInsideBounds(this.options.maxBounds);
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// map events

	_initEvents: function (onOff) {
		if (!L.DomEvent) { return; }

		onOff = onOff || 'on';

		L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);

		var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter',
		              'mouseleave', 'mousemove', 'contextmenu'],
		    i, len;

		for (i = 0, len = events.length; i < len; i++) {
			L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
		}

		if (this.options.trackResize) {
			L.DomEvent[onOff](window, 'resize', this._onResize, this);
		}
	},

	_onResize: function () {
		L.Util.cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = L.Util.requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this, false, this._container);
	},

	_onMouseClick: function (e) {
		if (!this._loaded || (!e._simulated &&
		        ((this.dragging && this.dragging.moved()) ||
		         (this.boxZoom  && this.boxZoom.moved()))) ||
		            L.DomEvent._skipped(e)) { return; }

		this.fire('preclick');
		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this._loaded || L.DomEvent._skipped(e)) { return; }

		var type = e.type;

		type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

		if (!this.hasEventListeners(type)) { return; }

		if (type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}

		var containerPoint = this.mouseEventToContainerPoint(e),
		    layerPoint = this.containerPointToLayerPoint(containerPoint),
		    latlng = this.layerPointToLatLng(layerPoint);

		this.fire(type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});
	},

	_onTileLayerLoad: function () {
		this._tileLayersToLoad--;
		if (this._tileLayersNum && !this._tileLayersToLoad) {
			this.fire('tilelayersload');
		}
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, this);
		} else {
			this.on('load', callback, context);
		}
		return this;
	},

	_layerAdd: function (layer) {
		layer.onAdd(this);
		this.fire('layeradd', {layer: layer});
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return L.DomUtil.getPosition(this._mapPane);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function () {
		return this.getPixelOrigin().subtract(this._getMapPanePos());
	},

	_getNewTopLeftPoint: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		// TODO round on display, not calculation to increase precision?
		return this.project(center, zoom)._subtract(viewHalf)._round();
	},

	_latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
		var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
		return this.project(latlng, newZoom)._subtract(topLeft);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
		    seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),

		    dx = this._rebound(nwOffset.x, -seOffset.x),
		    dy = this._rebound(nwOffset.y, -seOffset.y);

		return new L.Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom();

		return Math.max(min, Math.min(max, zoom));
	}
});

L.map = function (id, options) {
	return new L.Map(id, options);
};


/*
 * Mercator projection that takes into account that the Earth is not a perfect sphere.
 * Less popular than spherical mercator; used by projections like EPSG:3395.
 */

L.Projection.Mercator = {
	MAX_LATITUDE: 85.0840591556,

	R_MINOR: 6356752.314245179,
	R_MAJOR: 6378137,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    x = latlng.lng * d * r,
		    y = lat * d,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1.0 - tmp * tmp),
		    con = eccent * Math.sin(y);

		con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

		var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
		y = -r * Math.log(ts);

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    lng = point.x * d / r,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1 - (tmp * tmp)),
		    ts = Math.exp(- point.y / r),
		    phi = (Math.PI / 2) - 2 * Math.atan(ts),
		    numIter = 15,
		    tol = 1e-7,
		    i = numIter,
		    dphi = 0.1,
		    con;

		while ((Math.abs(dphi) > tol) && (--i > 0)) {
			con = eccent * Math.sin(phi);
			dphi = (Math.PI / 2) - 2 * Math.atan(ts *
			            Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
			phi += dphi;
		}

		return new L.LatLng(phi * d, lng);
	}
};



L.CRS.EPSG3395 = L.extend({}, L.CRS, {
	code: 'EPSG:3395',

	projection: L.Projection.Mercator,

	transformation: (function () {
		var m = L.Projection.Mercator,
		    r = m.R_MAJOR,
		    scale = 0.5 / (Math.PI * r);

		return new L.Transformation(scale, 0.5, -scale, 0.5);
	}())
});


/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

L.TileLayer = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		zoomOffset: 0,
		opacity: 1,
		/*
		maxNativeZoom: null,
		zIndex: null,
		tms: false,
		continuousWorld: false,
		noWrap: false,
		zoomReverse: false,
		detectRetina: false,
		reuseTiles: false,
		bounds: false,
		*/
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		if (options.bounds) {
			options.bounds = L.latLngBounds(options.bounds);
		}

		this._url = url;

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
	},

	onAdd: function (map) {
		this._map = map;
		this._animated = map._zoomAnimated;

		// create a container div for tiles
		this._initContainer();

		// set up events
		map.on({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.on({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
			map.on('move', this._limitedUpdate, this);
		}

		this._reset();
		this._update();
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		this._container.parentNode.removeChild(this._container);

		map.off({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.off({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			map.off('move', this._limitedUpdate, this);
		}

		this._container = null;
		this._map = null;
	},

	bringToFront: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.appendChild(this._container);
			this._setAutoZIndex(pane, Math.max);
		}

		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.insertBefore(this._container, pane.firstChild);
			this._setAutoZIndex(pane, Math.min);
		}

		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getContainer: function () {
		return this._container;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	setUrl: function (url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}
		return this;
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (pane, compare) {

		var layers = pane.children,
		    edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
		    zIndex, i, len;

		for (i = 0, len = layers.length; i < len; i++) {

			if (layers[i] !== this._container) {
				zIndex = parseInt(layers[i].style.zIndex, 10);

				if (!isNaN(zIndex)) {
					edgeZIndex = compare(edgeZIndex, zIndex);
				}
			}
		}

		this.options.zIndex = this._container.style.zIndex =
		        (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
	},

	_updateOpacity: function () {
		var i,
		    tiles = this._tiles;

		if (L.Browser.ielt9) {
			for (i in tiles) {
				L.DomUtil.setOpacity(tiles[i], this.options.opacity);
			}
		} else {
			L.DomUtil.setOpacity(this._container, this.options.opacity);
		}
	},

	_initContainer: function () {
		var tilePane = this._map._panes.tilePane;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-layer');

			this._updateZIndex();

			if (this._animated) {
				var className = 'leaflet-tile-container';

				this._bgBuffer = L.DomUtil.create('div', className, this._container);
				this._tileContainer = L.DomUtil.create('div', className, this._container);

			} else {
				this._tileContainer = this._container;
			}

			tilePane.appendChild(this._container);

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}
	},

	_reset: function (e) {
		for (var key in this._tiles) {
			this.fire('tileunload', {tile: this._tiles[key]});
		}

		this._tiles = {};
		this._tilesToLoad = 0;

		if (this.options.reuseTiles) {
			this._unusedTiles = [];
		}

		this._tileContainer.innerHTML = '';

		if (this._animated && e && e.hard) {
			this._clearBgBuffer();
		}

		this._initContainer();
	},

	_getTileSize: function () {
		var map = this._map,
		    zoom = map.getZoom() + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom,
		    tileSize = this.options.tileSize;

		if (zoomN && zoom > zoomN) {
			tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
		}

		return tileSize;
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_addTilesFromCenterOut: function (bounds) {
		var queue = [],
		    center = bounds.getCenter();

		var j, i, point;

		for (j = bounds.min.y; j <= bounds.max.y; j++) {
			for (i = bounds.min.x; i <= bounds.max.x; i++) {
				point = new L.Point(i, j);

				if (this._tileShouldBeLoaded(point)) {
					queue.push(point);
				}
			}
		}

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		// load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(center) - b.distanceTo(center);
		});

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._tilesToLoad) {
			this.fire('loading');
		}

		this._tilesToLoad += tilesToLoad;

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		this._tileContainer.appendChild(fragment);
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
		}

		if (options.bounds) {
			var tileSize = options.tileSize,
			    nwPoint = tilePoint.multiplyBy(tileSize),
			    sePoint = nwPoint.add([tileSize, tileSize]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},

	_removeOtherTiles: function (bounds) {
		var kArr, x, y, key;

		for (key in this._tiles) {
			kArr = key.split(':');
			x = parseInt(kArr[0], 10);
			y = parseInt(kArr[1], 10);

			// remove tile if it's out of bounds
			if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
				this._removeTile(key);
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];

		this.fire('tileunload', {tile: tile, url: tile.src});

		if (this.options.reuseTiles) {
			L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
			this._unusedTiles.push(tile);

		} else if (tile.parentNode === this._tileContainer) {
			this._tileContainer.removeChild(tile);
		}

		// for https://github.com/CloudMade/Leaflet/issues/137
		if (!L.Browser.android) {
			tile.onload = null;
			tile.src = L.Util.emptyImageUrl;
		}

		delete this._tiles[key];
	},

	_addTile: function (tilePoint, container) {
		var tilePos = this._getTilePos(tilePoint);

		// get unused tile - or create a new tile
		var tile = this._getTile();

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint);

		if (tile.parentNode !== this._tileContainer) {
			container.appendChild(tile);
		}
	},

	_getZoomForUrl: function () {

		var options = this.options,
		    zoom = this._map.getZoom();

		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom;
		}

		zoom += options.zoomOffset;

		return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
	},

	_getTilePos: function (tilePoint) {
		var origin = this._map.getPixelOrigin(),
		    tileSize = this._getTileSize();

		return tilePoint.multiplyBy(tileSize).subtract(origin);
	},

	// image-specific code (override to implement e.g. Canvas or SVG tile layer)

	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
	},

	_getWrapTileNum: function () {
		var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_adjustTilePoint: function (tilePoint) {

		var limit = this._getWrapTileNum();

		// wrap tile coordinates
		if (!this.options.continuousWorld && !this.options.noWrap) {
			tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
		}

		if (this.options.tms) {
			tilePoint.y = limit.y - tilePoint.y - 1;
		}

		tilePoint.z = this._getZoomForUrl();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getTile: function () {
		if (this.options.reuseTiles && this._unusedTiles.length > 0) {
			var tile = this._unusedTiles.pop();
			this._resetTile(tile);
			return tile;
		}
		return this._createTile();
	},

	// Override if data stored on a tile needs to be cleaned up before reuse
	_resetTile: function (/*tile*/) {},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		tile.style.width = tile.style.height = this._getTileSize() + 'px';
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		this._adjustTilePoint(tilePoint);
		tile.src     = this.getTileUrl(tilePoint);

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	},

	_tileLoaded: function () {
		this._tilesToLoad--;

		if (this._animated) {
			L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
		}

		if (!this._tilesToLoad) {
			this.fire('load');

			if (this._animated) {
				// clear scaled tiles after all new tiles are loaded (for performance)
				clearTimeout(this._clearBgBufferTimer);
				this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
			}
		}
	},

	_tileOnLoad: function () {
		var layer = this._layer;

		//Only if we are loading an actual image
		if (this.src !== L.Util.emptyImageUrl) {
			L.DomUtil.addClass(this, 'leaflet-tile-loaded');

			layer.fire('tileload', {
				tile: this,
				url: this.src
			});
		}

		layer._tileLoaded();
	},

	_tileOnError: function () {
		var layer = this._layer;

		layer.fire('tileerror', {
			tile: this,
			url: this.src
		});

		var newUrl = layer.options.errorTileUrl;
		if (newUrl) {
			this.src = newUrl;
		}

		layer._tileLoaded();
	}
});

L.tileLayer = function (url, options) {
	return new L.TileLayer(url, options);
};


/*
 * L.TileLayer.WMS is used for putting WMS tile layers on the map.
 */

L.TileLayer.WMS = L.TileLayer.extend({

	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/jpeg',
		transparent: false
	},

	initialize: function (url, options) { // (String, Object)

		this._url = url;

		var wmsParams = L.extend({}, this.defaultWmsParams),
		    tileSize = options.tileSize || this.options.tileSize;

		if (options.detectRetina && L.Browser.retina) {
			wmsParams.width = wmsParams.height = tileSize * 2;
		} else {
			wmsParams.width = wmsParams.height = tileSize;
		}

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i) && i !== 'crs') {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.setOptions(this, options);
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;

		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		L.TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (tilePoint) { // (Point, Number) -> String

		var map = this._map,
		    tileSize = this.options.tileSize,

		    nwPoint = tilePoint.multiplyBy(tileSize),
		    sePoint = nwPoint.add([tileSize, tileSize]),

		    nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
		    se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
		    bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
		        [se.y, nw.x, nw.y, se.x].join(',') :
		        [nw.x, se.y, se.x, nw.y].join(','),

		    url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

		return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
	},

	setParams: function (params, noRedraw) {

		L.extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});

L.tileLayer.wms = function (url, options) {
	return new L.TileLayer.WMS(url, options);
};


/*
 * L.TileLayer.Canvas is a class that you can use as a base for creating
 * dynamically drawn Canvas-based tile layers.
 */

L.TileLayer.Canvas = L.TileLayer.extend({
	options: {
		async: false
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}

		for (var i in this._tiles) {
			this._redrawTile(this._tiles[i]);
		}
		return this;
	},

	_redrawTile: function (tile) {
		this.drawTile(tile, tile._tilePoint, this._map._zoom);
	},

	_createTile: function () {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		tile.width = tile.height = this.options.tileSize;
		tile.onselectstart = tile.onmousemove = L.Util.falseFn;
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer = this;
		tile._tilePoint = tilePoint;

		this._redrawTile(tile);

		if (!this.options.async) {
			this.tileDrawn(tile);
		}
	},

	drawTile: function (/*tile, tilePoint*/) {
		// override with rendering code
	},

	tileDrawn: function (tile) {
		this._tileOnLoad.call(tile);
	}
});


L.tileLayer.canvas = function (options) {
	return new L.TileLayer.Canvas(options);
};


/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.ImageOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._image) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._image);

		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._image) {
			this._map._panes.overlayPane.appendChild(this._image);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._image) {
			pane.insertBefore(this._image, pane.firstChild);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this._image.src = this._url;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	_initImage: function () {
		this._image = L.DomUtil.create('img', 'leaflet-image-layer');

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._image, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			src: this._url
		});
	},

	_animateZoom: function (e) {
		var map = this._map,
		    image = this._image,
		    scale = map.getZoomScale(e.zoom),
		    nw = this._bounds.getNorthWest(),
		    se = this._bounds.getSouthEast(),

		    topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
		    size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
		    origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

		image.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
	},

	_reset: function () {
		var image   = this._image,
		    topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		    size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

		L.DomUtil.setPosition(image, topLeft);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_onImageLoad: function () {
		this.fire('load');
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});

L.imageOverlay = function (url, bounds, options) {
	return new L.ImageOverlay(url, bounds, options);
};


/*
 * L.Icon is an image-based icon class that you can use with L.Marker for custom markers.
 */

L.Icon = L.Class.extend({
	options: {
		/*
		iconUrl: (String) (required)
		iconRetinaUrl: (String) (optional, used for retina devices if detected)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (String) (no shadow by default)
		shadowRetinaUrl: (String) (optional, used for retina devices if detected)
		shadowSize: (Point)
		shadowAnchor: (Point)
		*/
		className: ''
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img;
		if (!oldIcon || oldIcon.tagName !== 'IMG') {
			img = this._createImg(src);
		} else {
			img = this._createImg(src, oldIcon);
		}
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options,
		    size = L.point(options[name + 'Size']),
		    anchor;

		if (name === 'shadow') {
			anchor = L.point(options.shadowAnchor || options.iconAnchor);
		} else {
			anchor = L.point(options.iconAnchor);
		}

		if (!anchor && size) {
			anchor = size.divideBy(2, true);
		}

		img.className = 'leaflet-marker-' + name + ' ' + options.className;

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
			return this.options[name + 'RetinaUrl'];
		}
		return this.options[name + 'Url'];
	}
});

L.icon = function (options) {
	return new L.Icon(options);
};


/*
 * L.Icon.Default is the blue marker icon used by default in Leaflet.
 */

L.Icon.Default = L.Icon.extend({

	options: {
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],

		shadowSize: [41, 41]
	},

	_getIconUrl: function (name) {
		var key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		if (L.Browser.retina && name === 'icon') {
			name += '-2x';
		}

		var path = L.Icon.Default.imagePath;

		if (!path) {
			throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
		}

		return path + '/marker-' + name + '.png';
	}
});

L.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, matches, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src;
		matches = src.match(leafletRe);

		if (matches) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());


/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		icon: new L.Icon.Default(),
		title: '',
		alt: '',
		clickable: true,
		draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		riseOnHover: false,
		riseOffset: 250
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	onAdd: function (map) {
		this._map = map;

		map.on('viewreset', this.update, this);

		this._initIcon();
		this.update();
		this.fire('add');

		if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
			map.on('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		if (this.dragging) {
			this.dragging.disable();
		}

		this._removeIcon();
		this._removeShadow();

		this.fire('remove');

		map.off({
			'viewreset': this.update,
			'zoomanim': this._animateZoom
		}, this);

		this._map = null;
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);

		this.update();

		return this.fire('move', { latlng: this._latlng });
	},

	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		this.update();

		return this;
	},

	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup);
		}

		return this;
	},

	update: function () {
		if (this._icon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    map = this._map,
		    animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
		    classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

		var icon = options.icon.createIcon(this._icon),
			addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}
			
			if (options.alt) {
				icon.alt = options.alt;
			}
		}

		L.DomUtil.addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		this._initInteraction();

		if (options.riseOnHover) {
			L.DomEvent
				.on(icon, 'mouseover', this._bringToFront, this)
				.on(icon, 'mouseout', this._resetZIndex, this);
		}

		var newShadow = options.icon.createShadow(this._shadow),
			addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			L.DomUtil.addClass(newShadow, classToAdd);
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		var panes = this._map._panes;

		if (addIcon) {
			panes.markerPane.appendChild(this._icon);
		}

		if (newShadow && addShadow) {
			panes.shadowPane.appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			L.DomEvent
			    .off(this._icon, 'mouseover', this._bringToFront)
			    .off(this._icon, 'mouseout', this._resetZIndex);
		}

		this._map._panes.markerPane.removeChild(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			this._map._panes.shadowPane.removeChild(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		L.DomUtil.setPosition(this._icon, pos);

		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.clickable) { return; }

		// TODO refactor into something shared with Map/Path/etc. to DRY it up

		var icon = this._icon,
		    events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(icon, 'leaflet-clickable');
		L.DomEvent.on(icon, 'click', this._onMouseClick, this);
		L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
		}

		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},

	_onMouseClick: function (e) {
		var wasDragged = this.dragging && this.dragging.moved();

		if (this.hasEventListeners(e.type) || wasDragged) {
			L.DomEvent.stopPropagation(e);
		}

		if (wasDragged) { return; }

		if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});
	},

	_onKeyPress: function (e) {
		if (e.keyCode === 13) {
			this.fire('click', {
				originalEvent: e,
				latlng: this._latlng
			});
		}
	},

	_fireMouseEvent: function (e) {

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._icon, this.options.opacity);
		if (this._shadow) {
			L.DomUtil.setOpacity(this._shadow, this.options.opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	}
});

L.marker = function (latlng, options) {
	return new L.Marker(latlng, options);
};


/*
 * L.DivIcon is a lightweight HTML-based icon class (as opposed to the image-based L.Icon)
 * to use with L.Marker.
 */

L.DivIcon = L.Icon.extend({
	options: {
		iconSize: [12, 12], // also can be set through CSS
		/*
		iconAnchor: (Point)
		popupAnchor: (Point)
		html: (String)
		bgPos: (Point)
		*/
		className: 'leaflet-div-icon',
		html: false
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		if (options.html !== false) {
			div.innerHTML = options.html;
		} else {
			div.innerHTML = '';
		}

		if (options.bgPos) {
			div.style.backgroundPosition =
			        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}

		this._setIconStyles(div, 'icon');
		return div;
	},

	createShadow: function () {
		return null;
	}
});

L.divIcon = function (options) {
	return new L.DivIcon(options);
};


/*
 * L.Popup is used for displaying popups on the map.
 */

L.Map.mergeOptions({
	closePopupOnClick: true
});

L.Popup = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minWidth: 50,
		maxWidth: 300,
		// maxHeight: null,
		autoPan: true,
		closeButton: true,
		offset: [0, 7],
		autoPanPadding: [5, 5],
		// autoPanPaddingTopLeft: null,
		// autoPanPaddingBottomRight: null,
		keepInView: false,
		className: '',
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initLayout();
		}

		var animFade = map.options.fadeAnimation;

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 0);
		}
		map._panes.popupPane.appendChild(this._container);

		map.on(this._getEvents(), this);

		this.update();

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 1);
		}

		this.fire('open');

		map.fire('popupopen', {popup: this});

		if (this._source) {
			this._source.fire('popupopen', {popup: this});
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onRemove: function (map) {
		map._panes.popupPane.removeChild(this._container);

		L.Util.falseFn(this._container.offsetWidth); // force reflow

		map.off(this._getEvents(), this);

		if (map.options.fadeAnimation) {
			L.DomUtil.setOpacity(this._container, 0);
		}

		this._map = null;

		this.fire('close');

		map.fire('popupclose', {popup: this});

		if (this._source) {
			this._source.fire('popupclose', {popup: this});
		}
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	_getEvents: function () {
		var events = {
			viewreset: this._updatePosition
		};

		if (this._animated) {
			events.zoomanim = this._zoomAnimation;
		}
		if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}
		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
			containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' +
			        (this._animated ? 'animated' : 'hide'),
			container = this._container = L.DomUtil.create('div', containerClass),
			closeButton;

		if (this.options.closeButton) {
			closeButton = this._closeButton =
			        L.DomUtil.create('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';
			L.DomEvent.disableClickPropagation(closeButton);

			L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
		}

		var wrapper = this._wrapper =
		        L.DomUtil.create('div', prefix + '-content-wrapper', container);
		L.DomEvent.disableClickPropagation(wrapper);

		this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

		L.DomEvent.disableScrollPropagation(this._contentNode);
		L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

		this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
		this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
	},

	_updateContent: function () {
		if (!this._content) { return; }

		if (typeof this._content === 'string') {
			this._contentNode.innerHTML = this._content;
		} else {
			while (this._contentNode.hasChildNodes()) {
				this._contentNode.removeChild(this._contentNode.firstChild);
			}
			this._contentNode.appendChild(this._content);
		}
		this.fire('contentupdate');
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			L.DomUtil.addClass(container, scrolledClass);
		} else {
			L.DomUtil.removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    animated = this._animated,
		    offset = L.point(this.options.offset);

		if (animated) {
			L.DomUtil.setPosition(this._container, pos);
		}

		this._containerBottom = -offset.y - (animated ? 0 : pos.y);
		this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = this._containerBottom + 'px';
		this._container.style.left = this._containerLeft + 'px';
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);

		L.DomUtil.setPosition(this._container, pos);
	},

	_adjustPan: function () {
		if (!this.options.autoPan) { return; }

		var map = this._map,
		    containerHeight = this._container.offsetHeight,
		    containerWidth = this._containerWidth,

		    layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

		if (this._animated) {
			layerPos._add(L.DomUtil.getPosition(this._container));
		}

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = L.point(this.options.autoPanPadding),
		    paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		L.DomEvent.stop(e);
	}
});

L.popup = function (options, source) {
	return new L.Popup(options, source);
};


L.Map.include({
	openPopup: function (popup, latlng, options) { // (Popup) or (String || HTMLElement, LatLng[, Object])
		this.closePopup();

		if (!(popup instanceof L.Popup)) {
			var content = popup;

			popup = new L.Popup(options)
			    .setLatLng(latlng)
			    .setContent(content);
		}
		popup._isOpen = true;

		this._popup = popup;
		return this.addLayer(popup);
	},

	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
			popup._isOpen = false;
		}
		return this;
	}
});


/*
 * Popup extension to L.Marker, adding popup-related methods.
 */

L.Marker.include({
	openPopup: function () {
		if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
			this._popup.setLatLng(this._latlng);
			this._map.openPopup(this._popup);
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	togglePopup: function () {
		if (this._popup) {
			if (this._popup._isOpen) {
				this.closePopup();
			} else {
				this.openPopup();
			}
		}
		return this;
	},

	bindPopup: function (content, options) {
		var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

		anchor = anchor.add(L.Popup.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.extend({offset: anchor}, options);

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this.togglePopup, this)
			    .on('remove', this.closePopup, this)
			    .on('move', this._movePopup, this);
			this._popupHandlersAdded = true;
		}

		if (content instanceof L.Popup) {
			L.setOptions(content, options);
			this._popup = content;
		} else {
			this._popup = new L.Popup(options, this)
				.setContent(content);
		}

		return this;
	},

	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this.togglePopup, this)
			    .off('remove', this.closePopup, this)
			    .off('move', this._movePopup, this);
			this._popupHandlersAdded = false;
		}
		return this;
	},

	getPopup: function () {
		return this._popup;
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	}
});


/*
 * L.LayerGroup is a class to combine several layers into one so that
 * you can manipulate the group (e.g. add/remove it) as one layer.
 */

L.LayerGroup = L.Class.extend({
	initialize: function (layers) {
		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	clearLayers: function () {
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this._map = map;
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
		this._map = null;
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	getLayer: function (id) {
		return this._layers[id];
	},

	getLayers: function () {
		var layers = [];

		for (var i in this._layers) {
			layers.push(this._layers[i]);
		}
		return layers;
	},

	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	getLayerId: function (layer) {
		return L.stamp(layer);
	}
});

L.layerGroup = function (layers) {
	return new L.LayerGroup(layers);
};


/*
 * L.FeatureGroup extends L.LayerGroup by introducing mouse events and additional methods
 * shared between a group of interactive layers (like vectors or markers).
 */

L.FeatureGroup = L.LayerGroup.extend({
	includes: L.Mixin.Events,

	statics: {
		EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'
	},

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		if ('on' in layer) {
			layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
		}

		L.LayerGroup.prototype.addLayer.call(this, layer);

		if (this._popupContent && layer.bindPopup) {
			layer.bindPopup(this._popupContent, this._popupOptions);
		}

		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);

		L.LayerGroup.prototype.removeLayer.call(this, layer);

		if (this._popupContent) {
			this.invoke('unbindPopup');
		}

		return this.fire('layerremove', {layer: layer});
	},

	bindPopup: function (content, options) {
		this._popupContent = content;
		this._popupOptions = options;
		return this.invoke('bindPopup', content, options);
	},

	openPopup: function (latlng) {
		// open popup on the first layer
		for (var id in this._layers) {
			this._layers[id].openPopup(latlng);
			break;
		}
		return this;
	},

	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	getBounds: function () {
		var bounds = new L.LatLngBounds();

		this.eachLayer(function (layer) {
			bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
		});

		return bounds;
	},

	_propagateEvent: function (e) {
		e = L.extend({
			layer: e.target,
			target: this
		}, e);
		this.fire(e.type, e);
	}
});

L.featureGroup = function (layers) {
	return new L.FeatureGroup(layers);
};


/*
 * L.Path is a base class for rendering vector paths on a map. Inherited by Polyline, Circle, etc.
 */

L.Path = L.Class.extend({
	includes: [L.Mixin.Events],

	statics: {
		// how much to extend the clip area around the map view
		// (relative to its size, e.g. 0.5 is half the screen in each direction)
		// set it so that SVG element doesn't exceed 1280px (vectors flicker on dragend if it is)
		CLIP_PADDING: (function () {
			var max = L.Browser.mobile ? 1280 : 2000,
			    target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
			return Math.max(0, Math.min(0.5, target));
		})()
	},

	options: {
		stroke: true,
		color: '#0033ff',
		dashArray: null,
		lineCap: null,
		lineJoin: null,
		weight: 5,
		opacity: 0.5,

		fill: false,
		fillColor: null, //same as color by default
		fillOpacity: 0.2,

		clickable: true
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initElements();
			this._initEvents();
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		map._pathRoot.removeChild(this._container);

		// Need to fire remove event before we set _map to null as the event hooks might need the object
		this.fire('remove');
		this._map = null;

		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}

		map.off({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	projectLatlngs: function () {
		// do all projection stuff here
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._updatePath();
		}
		return this;
	}
});

L.Map.include({
	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this.getSize(),
		    panePos = L.DomUtil.getPosition(this._mapPane),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	}
});


/*
 * Extends L.Path with SVG-specific rendering code.
 */

L.Path.SVG_NS = 'http://www.w3.org/2000/svg';

L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);

L.Path = L.Path.extend({
	statics: {
		SVG: L.Browser.svg
	},

	bringToFront: function () {
		var root = this._map._pathRoot,
		    path = this._container;

		if (path && root.lastChild !== path) {
			root.appendChild(path);
		}
		return this;
	},

	bringToBack: function () {
		var root = this._map._pathRoot,
		    path = this._container,
		    first = root.firstChild;

		if (path && first !== path) {
			root.insertBefore(path, first);
		}
		return this;
	},

	getPathString: function () {
		// form path string here
	},

	_createElement: function (name) {
		return document.createElementNS(L.Path.SVG_NS, name);
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	_initPath: function () {
		this._container = this._createElement('g');

		this._path = this._createElement('path');

		if (this.options.className) {
			L.DomUtil.addClass(this._path, this.options.className);
		}

		this._container.appendChild(this._path);
	},

	_initStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke-linejoin', 'round');
			this._path.setAttribute('stroke-linecap', 'round');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill-rule', 'evenodd');
		}
		if (this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', this.options.pointerEvents);
		}
		if (!this.options.clickable && !this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', 'none');
		}
		this._updateStyle();
	},

	_updateStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke', this.options.color);
			this._path.setAttribute('stroke-opacity', this.options.opacity);
			this._path.setAttribute('stroke-width', this.options.weight);
			if (this.options.dashArray) {
				this._path.setAttribute('stroke-dasharray', this.options.dashArray);
			} else {
				this._path.removeAttribute('stroke-dasharray');
			}
			if (this.options.lineCap) {
				this._path.setAttribute('stroke-linecap', this.options.lineCap);
			}
			if (this.options.lineJoin) {
				this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
			}
		} else {
			this._path.setAttribute('stroke', 'none');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill', this.options.fillColor || this.options.color);
			this._path.setAttribute('fill-opacity', this.options.fillOpacity);
		} else {
			this._path.setAttribute('fill', 'none');
		}
	},

	_updatePath: function () {
		var str = this.getPathString();
		if (!str) {
			// fix webkit empty string parsing bug
			str = 'M0 0';
		}
		this._path.setAttribute('d', str);
	},

	// TODO remove duplication with L.Map
	_initEvents: function () {
		if (this.options.clickable) {
			if (L.Browser.svg || !L.Browser.vml) {
				L.DomUtil.addClass(this._path, 'leaflet-clickable');
			}

			L.DomEvent.on(this._container, 'click', this._onMouseClick, this);

			var events = ['dblclick', 'mousedown', 'mouseover',
			              'mouseout', 'mousemove', 'contextmenu'];
			for (var i = 0; i < events.length; i++) {
				L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
			}
		}
	},

	_onMouseClick: function (e) {
		if (this._map.dragging && this._map.dragging.moved()) { return; }

		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this.hasEventListeners(e.type)) { return; }

		var map = this._map,
		    containerPoint = map.mouseEventToContainerPoint(e),
		    layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this.fire(e.type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});

		if (e.type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousemove') {
			L.DomEvent.stopPropagation(e);
		}
	}
});

L.Map.include({
	_initPathRoot: function () {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._panes.overlayPane.appendChild(this._pathRoot);

			if (this.options.zoomAnimation && L.Browser.any3d) {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');

				this.on({
					'zoomanim': this._animatePathZoom,
					'zoomend': this._endPathZoom
				});
			} else {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
			}

			this.on('moveend', this._updateSvgViewport);
			this._updateSvgViewport();
		}
	},

	_animatePathZoom: function (e) {
		var scale = this.getZoomScale(e.zoom),
		    offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

		this._pathRoot.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';

		this._pathZooming = true;
	},

	_endPathZoom: function () {
		this._pathZooming = false;
	},

	_updateSvgViewport: function () {

		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._pathRoot,
		    pane = this._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(root);
		}

		L.DomUtil.setPosition(root, min);
		root.setAttribute('width', width);
		root.setAttribute('height', height);
		root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(root);
		}
	}
});


/*
 * Popup extension to L.Path (polylines, polygons, circles), adding popup-related methods.
 */

L.Path.include({

	bindPopup: function (content, options) {

		if (content instanceof L.Popup) {
			this._popup = content;
		} else {
			if (!this._popup || options) {
				this._popup = new L.Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this._openPopup, this)
			    .on('remove', this.closePopup, this);

			this._popupHandlersAdded = true;
		}

		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this._openPopup)
			    .off('remove', this.closePopup);

			this._popupHandlersAdded = false;
		}
		return this;
	},

	openPopup: function (latlng) {

		if (this._popup) {
			// open the popup from one of the path's points if not specified
			latlng = latlng || this._latlng ||
			         this._latlngs[Math.floor(this._latlngs.length / 2)];

			this._openPopup({latlng: latlng});
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	_openPopup: function (e) {
		this._popup.setLatLng(e.latlng);
		this._map.openPopup(this._popup);
	}
});


/*
 * Vector rendering for IE6-8 through VML.
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */

L.Browser.vml = !L.Browser.svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());

L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
	statics: {
		VML: true,
		CLIP_PADDING: 0.02
	},

	_createElement: (function () {
		try {
			document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
			return function (name) {
				return document.createElement('<lvml:' + name + ' class="lvml">');
			};
		} catch (e) {
			return function (name) {
				return document.createElement(
				        '<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
			};
		}
	}()),

	_initPath: function () {
		var container = this._container = this._createElement('shape');

		L.DomUtil.addClass(container, 'leaflet-vml-shape' +
			(this.options.className ? ' ' + this.options.className : ''));

		if (this.options.clickable) {
			L.DomUtil.addClass(container, 'leaflet-clickable');
		}

		container.coordsize = '1 1';

		this._path = this._createElement('path');
		container.appendChild(this._path);

		this._map._pathRoot.appendChild(container);
	},

	_initStyle: function () {
		this._updateStyle();
	},

	_updateStyle: function () {
		var stroke = this._stroke,
		    fill = this._fill,
		    options = this.options,
		    container = this._container;

		container.stroked = options.stroke;
		container.filled = options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = this._stroke = this._createElement('stroke');
				stroke.endcap = 'round';
				container.appendChild(stroke);
			}
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = L.Util.isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			if (options.lineCap) {
				stroke.endcap = options.lineCap.replace('butt', 'flat');
			}
			if (options.lineJoin) {
				stroke.joinstyle = options.lineJoin;
			}

		} else if (stroke) {
			container.removeChild(stroke);
			this._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = this._fill = this._createElement('fill');
				container.appendChild(fill);
			}
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			this._fill = null;
		}
	},

	_updatePath: function () {
		var style = this._container.style;

		style.display = 'none';
		this._path.v = this.getPathString() + ' '; // the space fixes IE empty path string bug
		style.display = '';
	}
});

L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {
	_initPathRoot: function () {
		if (this._pathRoot) { return; }

		var root = this._pathRoot = document.createElement('div');
		root.className = 'leaflet-vml-container';
		this._panes.overlayPane.appendChild(root);

		this.on('moveend', this._updatePathViewport);
		this._updatePathViewport();
	}
});


/*
 * Vector rendering for all browsers that support canvas.
 */

L.Browser.canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
	statics: {
		//CLIP_PADDING: 0.02, // not sure if there's a need to set it to a small value
		CANVAS: true,
		SVG: false
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._requestUpdate();
		}
		return this;
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._map) {
			this._updateStyle();
			this._requestUpdate();
		}
		return this;
	},

	onRemove: function (map) {
		map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

		if (this.options.clickable) {
			this._map.off('click', this._onClick, this);
			this._map.off('mousemove', this._onMouseMove, this);
		}

		this._requestUpdate();
		
		this.fire('remove');
		this._map = null;
	},

	_requestUpdate: function () {
		if (this._map && !L.Path._updateRequest) {
			L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
		}
	},

	_fireMapMoveEnd: function () {
		L.Path._updateRequest = null;
		this.fire('moveend');
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._ctx = this._map._canvasCtx;
	},

	_updateStyle: function () {
		var options = this.options;

		if (options.stroke) {
			this._ctx.lineWidth = options.weight;
			this._ctx.strokeStyle = options.color;
		}
		if (options.fill) {
			this._ctx.fillStyle = options.fillColor || options.color;
		}
	},

	_drawPath: function () {
		var i, j, len, len2, point, drawMethod;

		this._ctx.beginPath();

		for (i = 0, len = this._parts.length; i < len; i++) {
			for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
				point = this._parts[i][j];
				drawMethod = (j === 0 ? 'move' : 'line') + 'To';

				this._ctx[drawMethod](point.x, point.y);
			}
			// TODO refactor ugly hack
			if (this instanceof L.Polygon) {
				this._ctx.closePath();
			}
		}
	},

	_checkIfEmpty: function () {
		return !this._parts.length;
	},

	_updatePath: function () {
		if (this._checkIfEmpty()) { return; }

		var ctx = this._ctx,
		    options = this.options;

		this._drawPath();
		ctx.save();
		this._updateStyle();

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fill();
		}

		if (options.stroke) {
			ctx.globalAlpha = options.opacity;
			ctx.stroke();
		}

		ctx.restore();

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_initEvents: function () {
		if (this.options.clickable) {
			// TODO dblclick
			this._map.on('mousemove', this._onMouseMove, this);
			this._map.on('click', this._onClick, this);
		}
	},

	_onClick: function (e) {
		if (this._containsPoint(e.layerPoint)) {
			this.fire('click', e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map._animatingZoom) { return; }

		// TODO don't do on each move
		if (this._containsPoint(e.layerPoint)) {
			this._ctx.canvas.style.cursor = 'pointer';
			this._mouseInside = true;
			this.fire('mouseover', e);

		} else if (this._mouseInside) {
			this._ctx.canvas.style.cursor = '';
			this._mouseInside = false;
			this.fire('mouseout', e);
		}
	}
});

L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
	_initPathRoot: function () {
		var root = this._pathRoot,
		    ctx;

		if (!root) {
			root = this._pathRoot = document.createElement('canvas');
			root.style.position = 'absolute';
			ctx = this._canvasCtx = root.getContext('2d');

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			this._panes.overlayPane.appendChild(root);

			if (this.options.zoomAnimation) {
				this._pathRoot.className = 'leaflet-zoom-animated';
				this.on('zoomanim', this._animatePathZoom);
				this.on('zoomend', this._endPathZoom);
			}
			this.on('moveend', this._updateCanvasViewport);
			this._updateCanvasViewport();
		}
	},

	_updateCanvasViewport: function () {
		// don't redraw while zooming. See _updateSvgViewport for more details
		if (this._pathZooming) { return; }
		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    size = vp.max.subtract(min),
		    root = this._pathRoot;

		//TODO check if this works properly on mobile webkit
		L.DomUtil.setPosition(root, min);
		root.width = size.x;
		root.height = size.y;
		root.getContext('2d').translate(-min.x, -min.y);
	}
});


/*
 * L.LineUtil contains different utility functions for line segments
 * and polylines (clipping, simplification, distances, etc.)
 */

/*jshint bitwise:false */ // allow bitwise operations for this file

L.LineUtil = {

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	simplify: function (/*Point[]*/ points, /*Number*/ tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		// stage 1: vertex reduction
		points = this._reducePoints(points, sqTolerance);

		// stage 2: Douglas-Peucker simplification
		points = this._simplifyDP(points, sqTolerance);

		return points;
	},

	// distance from a point to a segment between two points
	pointToSegmentDistance:  function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
	},

	closestPointOnSegment: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return this._sqClosestPointOnSegment(p, p1, p2);
	},

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	_simplifyDP: function (points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len);

		markers[0] = markers[len - 1] = 1;

		this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
		    newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	},

	_simplifyDPStep: function (points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		    index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			this._simplifyDPStep(points, markers, sqTolerance, first, index);
			this._simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	},

	// reduce points that are too close to each other to a single point
	_reducePoints: function (points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	},

	// Cohen-Sutherland line clipping algorithm.
	// Used to avoid rendering parts of a polyline that are not currently visible.

	clipSegment: function (a, b, bounds, useLastCode) {
		var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
		    codeB = this._getBitCode(b, bounds),

		    codeOut, p, newCode;

		// save 2nd code to avoid calculating it on the next segment
		this._lastCode = codeB;

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) {
				return [a, b];
			// if a,b is outside the clip window (trivial reject)
			} else if (codeA & codeB) {
				return false;
			// other cases
			} else {
				codeOut = codeA || codeB;
				p = this._getEdgeIntersection(a, b, codeOut, bounds);
				newCode = this._getBitCode(p, bounds);

				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		}
	},

	_getEdgeIntersection: function (a, b, code, bounds) {
		var dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max;

		if (code & 8) { // top
			return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
		} else if (code & 4) { // bottom
			return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
		} else if (code & 2) { // right
			return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
		} else if (code & 1) { // left
			return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
		}
	},

	_getBitCode: function (/*Point*/ p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}
		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	},

	// square distance (to avoid unnecessary Math.sqrt calls)
	_sqDist: function (p1, p2) {
		var dx = p2.x - p1.x,
		    dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	},

	// return closest point on segment or distance to that point
	_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
		var x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
	}
};


/*
 * L.Polyline is used to display polylines on a map.
 */

L.Polyline = L.Path.extend({
	initialize: function (latlngs, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlngs = this._convertLatLngs(latlngs);
	},

	options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0,
		noClip: false
	},

	projectLatlngs: function () {
		this._originalPoints = [];

		for (var i = 0, len = this._latlngs.length; i < len; i++) {
			this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
		}
	},

	getPathString: function () {
		for (var i = 0, len = this._parts.length, str = ''; i < len; i++) {
			str += this._getPathPartStr(this._parts[i]);
		}
		return str;
	},

	getLatLngs: function () {
		return this._latlngs;
	},

	setLatLngs: function (latlngs) {
		this._latlngs = this._convertLatLngs(latlngs);
		return this.redraw();
	},

	addLatLng: function (latlng) {
		this._latlngs.push(L.latLng(latlng));
		return this.redraw();
	},

	spliceLatLngs: function () { // (Number index, Number howMany)
		var removed = [].splice.apply(this._latlngs, arguments);
		this._convertLatLngs(this._latlngs, true);
		this.redraw();
		return removed;
	},

	closestLayerPoint: function (p) {
		var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

		for (var j = 0, jLen = parts.length; j < jLen; j++) {
			var points = parts[j];
			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];
				var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	getBounds: function () {
		return new L.LatLngBounds(this.getLatLngs());
	},

	_convertLatLngs: function (latlngs, overwrite) {
		var i, len, target = overwrite ? latlngs : [];

		for (i = 0, len = latlngs.length; i < len; i++) {
			if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
				return;
			}
			target[i] = L.latLng(latlngs[i]);
		}
		return target;
	},

	_initEvents: function () {
		L.Path.prototype._initEvents.call(this);
	},

	_getPathPartStr: function (points) {
		var round = L.Path.VML;

		for (var j = 0, len2 = points.length, str = '', p; j < len2; j++) {
			p = points[j];
			if (round) {
				p._round();
			}
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}
		return str;
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._map._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},

	// simplify each clipped part of the polyline
	_simplifyPoints: function () {
		var parts = this._parts,
		    lu = L.LineUtil;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
		}
	},

	_updatePath: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();

		L.Path.prototype._updatePath.call(this);
	}
});

L.polyline = function (latlngs, options) {
	return new L.Polyline(latlngs, options);
};


/*
 * L.PolyUtil contains utility functions for polygons (clipping, etc.).
 */

/*jshint bitwise:false */ // allow bitwise operations here

L.PolyUtil = {};

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
L.PolyUtil.clipPolygon = function (points, bounds) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p,
	    lu = L.LineUtil;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = lu._getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = lu._getEdgeIntersection(b, a, edge, bounds);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = lu._getEdgeIntersection(b, a, edge, bounds);
				p._code = lu._getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
};


/*
 * L.Polygon is used to display polygons on a map.
 */

L.Polygon = L.Polyline.extend({
	options: {
		fill: true
	},

	initialize: function (latlngs, options) {
		L.Polyline.prototype.initialize.call(this, latlngs, options);
		this._initWithHoles(latlngs);
	},

	_initWithHoles: function (latlngs) {
		var i, len, hole;
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._latlngs = this._convertLatLngs(latlngs[0]);
			this._holes = latlngs.slice(1);

			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
				if (hole[0].equals(hole[hole.length - 1])) {
					hole.pop();
				}
			}
		}

		// filter out last point if its equal to the first one
		latlngs = this._latlngs;

		if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
			latlngs.pop();
		}
	},

	projectLatlngs: function () {
		L.Polyline.prototype.projectLatlngs.call(this);

		// project polygon holes points
		// TODO move this logic to Polyline to get rid of duplication
		this._holePoints = [];

		if (!this._holes) { return; }

		var i, j, len, len2;

		for (i = 0, len = this._holes.length; i < len; i++) {
			this._holePoints[i] = [];

			for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
				this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
			}
		}
	},

	setLatLngs: function (latlngs) {
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._initWithHoles(latlngs);
			return this.redraw();
		} else {
			return L.Polyline.prototype.setLatLngs.call(this, latlngs);
		}
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    newParts = [];

		this._parts = [points].concat(this._holePoints);

		if (this.options.noClip) { return; }

		for (var i = 0, len = this._parts.length; i < len; i++) {
			var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
			if (clipped.length) {
				newParts.push(clipped);
			}
		}

		this._parts = newParts;
	},

	_getPathPartStr: function (points) {
		var str = L.Polyline.prototype._getPathPartStr.call(this, points);
		return str + (L.Browser.svg ? 'z' : 'x');
	}
});

L.polygon = function (latlngs, options) {
	return new L.Polygon(latlngs, options);
};


/*
 * Contains L.MultiPolyline and L.MultiPolygon layers.
 */

(function () {
	function createMulti(Klass) {

		return L.FeatureGroup.extend({

			initialize: function (latlngs, options) {
				this._layers = {};
				this._options = options;
				this.setLatLngs(latlngs);
			},

			setLatLngs: function (latlngs) {
				var i = 0,
				    len = latlngs.length;

				this.eachLayer(function (layer) {
					if (i < len) {
						layer.setLatLngs(latlngs[i++]);
					} else {
						this.removeLayer(layer);
					}
				}, this);

				while (i < len) {
					this.addLayer(new Klass(latlngs[i++], this._options));
				}

				return this;
			},

			getLatLngs: function () {
				var latlngs = [];

				this.eachLayer(function (layer) {
					latlngs.push(layer.getLatLngs());
				});

				return latlngs;
			}
		});
	}

	L.MultiPolyline = createMulti(L.Polyline);
	L.MultiPolygon = createMulti(L.Polygon);

	L.multiPolyline = function (latlngs, options) {
		return new L.MultiPolyline(latlngs, options);
	};

	L.multiPolygon = function (latlngs, options) {
		return new L.MultiPolygon(latlngs, options);
	};
}());


/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

L.Rectangle = L.Polygon.extend({
	initialize: function (latLngBounds, options) {
		L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = L.latLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});

L.rectangle = function (latLngBounds, options) {
	return new L.Rectangle(latLngBounds, options);
};


/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 */

L.Circle = L.Path.extend({
	initialize: function (latlng, radius, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlng = L.latLng(latlng);
		this._mRadius = radius;
	},

	options: {
		fill: true
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		return this.redraw();
	},

	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	projectLatlngs: function () {
		var lngRadius = this._getLngRadius(),
		    latlng = this._latlng,
		    pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);

		this._point = this._map.latLngToLayerPoint(latlng);
		this._radius = Math.max(this._point.x - pointLeft.x, 1);
	},

	getBounds: function () {
		var lngRadius = this._getLngRadius(),
		    latRadius = (this._mRadius / 40075017) * 360,
		    latlng = this._latlng;

		return new L.LatLngBounds(
		        [latlng.lat - latRadius, latlng.lng - lngRadius],
		        [latlng.lat + latRadius, latlng.lng + lngRadius]);
	},

	getLatLng: function () {
		return this._latlng;
	},

	getPathString: function () {
		var p = this._point,
		    r = this._radius;

		if (this._checkIfEmpty()) {
			return '';
		}

		if (L.Browser.svg) {
			return 'M' + p.x + ',' + (p.y - r) +
			       'A' + r + ',' + r + ',0,1,1,' +
			       (p.x - 0.1) + ',' + (p.y - r) + ' z';
		} else {
			p._round();
			r = Math.round(r);
			return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
		}
	},

	getRadius: function () {
		return this._mRadius;
	},

	// TODO Earth hardcoded, move into projection code!

	_getLatRadius: function () {
		return (this._mRadius / 40075017) * 360;
	},

	_getLngRadius: function () {
		return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
	},

	_checkIfEmpty: function () {
		if (!this._map) {
			return false;
		}
		var vp = this._map._pathViewport,
		    r = this._radius,
		    p = this._point;

		return p.x - r > vp.max.x || p.y - r > vp.max.y ||
		       p.x + r < vp.min.x || p.y + r < vp.min.y;
	}
});

L.circle = function (latlng, radius, options) {
	return new L.Circle(latlng, radius, options);
};


/*
 * L.CircleMarker is a circle overlay with a permanent pixel radius.
 */

L.CircleMarker = L.Circle.extend({
	options: {
		radius: 10,
		weight: 2
	},

	initialize: function (latlng, options) {
		L.Circle.prototype.initialize.call(this, latlng, null, options);
		this._radius = this.options.radius;
	},

	projectLatlngs: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
	},

	_updateStyle : function () {
		L.Circle.prototype._updateStyle.call(this);
		this.setRadius(this.options.radius);
	},

	setLatLng: function (latlng) {
		L.Circle.prototype.setLatLng.call(this, latlng);
		if (this._popup && this._popup._isOpen) {
			this._popup.setLatLng(latlng);
		}
		return this;
	},

	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	getRadius: function () {
		return this._radius;
	}
});

L.circleMarker = function (latlng, options) {
	return new L.CircleMarker(latlng, options);
};


/*
 * Extends L.Polyline to be able to manually detect clicks on Canvas-rendered polylines.
 */

L.Polyline.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, dist, part,
		    w = this.options.weight / 2;

		if (L.Browser.touch) {
			w += 10; // polyline click tolerance on touch devices
		}

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) {
					continue;
				}

				dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);

				if (dist <= w) {
					return true;
				}
			}
		}
		return false;
	}
});


/*
 * Extends L.Polygon to be able to manually detect clicks on Canvas-rendered polygons.
 */

L.Polygon.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2,
		    i, j, k,
		    len, len2;

		// TODO optimization: check if within bounds first

		if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
			// click on polygon border
			return true;
		}

		// ray casting algorithm for detecting if point is in polygon

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) &&
						(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		return inside;
	}
});


/*
 * Extends L.Circle with Canvas-specific code.
 */

L.Circle.include(!L.Path.CANVAS ? {} : {
	_drawPath: function () {
		var p = this._point;
		this._ctx.beginPath();
		this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
	},

	_containsPoint: function (p) {
		var center = this._point,
		    w2 = this.options.stroke ? this.options.weight / 2 : 0;

		return (p.distanceTo(center) <= this._radius + w2);
	}
});


/*
 * CircleMarker canvas specific drawing parts.
 */

L.CircleMarker.include(!L.Path.CANVAS ? {} : {
	_updateStyle: function () {
		L.Path.prototype._updateStyle.call(this);
	}
});


/*
 * L.GeoJSON turns any GeoJSON data into a Leaflet layer.
 */

L.GeoJSON = L.FeatureGroup.extend({

	initialize: function (geojson, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	addData: function (geojson) {
		var features = L.Util.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// Only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(features[i]);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return; }

		var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = L.GeoJSON.asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	resetStyle: function (layer) {
		var style = this.options.style;
		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			this._setLayerStyle(layer, style);
		}
	},

	setStyle: function (style) {
		this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

L.extend(L.GeoJSON, {
	geometryToLayer: function (geojson, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry.coordinates,
		    layers = [],
		    latlng, latlngs, i, len;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords);
			return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i]);
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
			}
			return new L.FeatureGroup(layers);

		case 'LineString':
			latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'Polygon':
			if (coords.length === 2 && !coords[1].length) {
				throw new Error('Invalid GeoJSON object.');
			}
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);

		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {

				layers.push(this.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, pointToLayer, coordsToLatLng, vectorOptions));
			}
			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	},

	coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
		return new L.LatLng(coords[1], coords[0], coords[2]);
	},

	coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
		var latlng, i, len,
		    latlngs = [];

		for (i = 0, len = coords.length; i < len; i++) {
			latlng = levelsDeep ?
			        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || this.coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	},

	latLngToCoords: function (latlng) {
		var coords = [latlng.lng, latlng.lat];

		if (latlng.alt !== undefined) {
			coords.push(latlng.alt);
		}
		return coords;
	},

	latLngsToCoords: function (latLngs) {
		var coords = [];

		for (var i = 0, len = latLngs.length; i < len; i++) {
			coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
		}

		return coords;
	},

	getFeature: function (layer, newGeometry) {
		return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
	},

	asFeature: function (geoJSON) {
		if (geoJSON.type === 'Feature') {
			return geoJSON;
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geoJSON
		};
	}
});

var PointToGeoJSON = {
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
		});
	}
};

L.Marker.include(PointToGeoJSON);
L.Circle.include(PointToGeoJSON);
L.CircleMarker.include(PointToGeoJSON);

L.Polyline.include({
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'LineString',
			coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
		});
	}
});

L.Polygon.include({
	toGeoJSON: function () {
		var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
		    i, len, hole;

		coords[0].push(coords[0][0]);

		if (this._holes) {
			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
				hole.push(hole[0]);
				coords.push(hole);
			}
		}

		return L.GeoJSON.getFeature(this, {
			type: 'Polygon',
			coordinates: coords
		});
	}
});

(function () {
	function multiToGeoJSON(type) {
		return function () {
			var coords = [];

			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON().geometry.coordinates);
			});

			return L.GeoJSON.getFeature(this, {
				type: type,
				coordinates: coords
			});
		};
	}

	L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
	L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});

	L.LayerGroup.include({
		toGeoJSON: function () {

			var geometry = this.feature && this.feature.geometry,
				jsons = [],
				json;

			if (geometry && geometry.type === 'MultiPoint') {
				return multiToGeoJSON('MultiPoint').call(this);
			}

			var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					json = layer.toGeoJSON();
					jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
				}
			});

			if (isGeometryCollection) {
				return L.GeoJSON.getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}

			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});
}());

L.geoJson = function (geojson, options) {
	return new L.GeoJSON(geojson, options);
};


/*
 * L.DomEvent contains functions for working with DOM events.
 */

L.DomEvent = {
	/* inspired by John Resig, Dean Edwards and YUI addEvent implementations */
	addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler, originalHandler, newType;

		if (obj[key]) { return this; }

		handler = function (e) {
			return fn.call(context || obj, e || L.DomEvent._getEvent());
		};

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			return this.addPointerListener(obj, type, handler, id);
		}
		if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id);
		}

		if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('DOMMouseScroll', handler, false);
				obj.addEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {

				originalHandler = handler;
				newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

				handler = function (e) {
					if (!L.DomEvent._checkMouse(obj, e)) { return; }
					return originalHandler(e);
				};

				obj.addEventListener(newType, handler, false);

			} else if (type === 'click' && L.Browser.android) {
				originalHandler = handler;
				handler = function (e) {
					return L.DomEvent._filterClick(e, originalHandler);
				};

				obj.addEventListener(type, handler, false);
			} else {
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[key] = handler;

		return this;
	},

	removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler = obj[key];

		if (!handler) { return this; }

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id);
		} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
			} else {
				obj.removeEventListener(type, handler, false);
			}
		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[key] = null;

		return this;
	},

	stopPropagation: function (e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		L.DomEvent._skipped(e);

		return this;
	},

	disableScrollPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		return L.DomEvent
			.on(el, 'mousewheel', stop)
			.on(el, 'MozMousePixelScroll', stop);
	},

	disableClickPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(el, L.Draggable.START[i], stop);
		}

		return L.DomEvent
			.on(el, 'click', L.DomEvent._fakeStop)
			.on(el, 'dblclick', stop);
	},

	preventDefault: function (e) {

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	},

	stop: function (e) {
		return L.DomEvent
			.preventDefault(e)
			.stopPropagation(e);
	},

	getMousePosition: function (e, container) {
		if (!container) {
			return new L.Point(e.clientX, e.clientY);
		}

		var rect = container.getBoundingClientRect();

		return new L.Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop);
	},

	getWheelDelta: function (e) {

		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	},

	_skipEvents: {},

	_fakeStop: function (e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
		L.DomEvent._skipEvents[e.type] = true;
	},

	_skipped: function (e) {
		var skipped = this._skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false;
		return skipped;
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_checkMouse: function (el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	},

	_getEvent: function () { // evil magic for IE
		/*jshint noarg:false */
		var e = window.event;
		if (!e) {
			var caller = arguments.callee.caller;
			while (caller) {
				e = caller['arguments'][0];
				if (e && window.Event === e.constructor) {
					break;
				}
				caller = caller.caller;
			}
		}
		return e;
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function (e, handler) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			L.DomEvent.stop(e);
			return;
		}
		L.DomEvent._lastClick = timeStamp;

		return handler(e);
	}
};

L.DomEvent.on = L.DomEvent.addListener;
L.DomEvent.off = L.DomEvent.removeListener;


/*
 * L.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

L.Draggable = L.Class.extend({
	includes: L.Mixin.Events,

	statics: {
		START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	},

	initialize: function (element, dragStartTarget) {
		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
	},

	enable: function () {
		if (this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = true;
	},

	disable: function () {
		if (!this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		this._moved = false;

		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

		L.DomEvent.stopPropagation(e);

		if (L.Draggable._disabled) { return; }

		L.DomUtil.disableImageDrag();
		L.DomUtil.disableTextSelection();

		if (this._moving) { return; }

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new L.Point(first.clientX, first.clientY);
		this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

		L.DomEvent
		    .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, L.Draggable.END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new L.Point(first.clientX, first.clientY),
		    offset = newPoint.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (L.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

		L.DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);

			L.DomUtil.addClass(document.body, 'leaflet-dragging');
			this._lastTarget = e.target || e.srcElement;
			L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
	},

	_updatePosition: function () {
		this.fire('predrag');
		L.DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag');
	},

	_onUp: function () {
		L.DomUtil.removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in L.Draggable.MOVE) {
			L.DomEvent
			    .off(document, L.Draggable.MOVE[i], this._onMove)
			    .off(document, L.Draggable.END[i], this._onUp);
		}

		L.DomUtil.enableImageDrag();
		L.DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			L.Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
	}
});


/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

L.Handler = L.Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	enable: function () {
		if (this._enabled) { return; }

		this._enabled = true;
		this.addHooks();
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._enabled = false;
		this.removeHooks();
	},

	enabled: function () {
		return !!this._enabled;
	}
});


/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

L.Map.mergeOptions({
	dragging: true,

	inertia: !L.Browser.android23,
	inertiaDeceleration: 3400, // px/s^2
	inertiaMaxSpeed: Infinity, // px/s
	inertiaThreshold: L.Browser.touch ? 32 : 18, // ms
	easeLinearity: 0.25,

	// TODO refactor, move to CRS
	worldCopyJump: false
});

L.Map.Drag = L.Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new L.Draggable(map._mapPane, map._container);

			this._draggable.on({
				'dragstart': this._onDragStart,
				'drag': this._onDrag,
				'dragend': this._onDragEnd
			}, this);

			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDrag, this);
				map.on('viewreset', this._onViewReset, this);

				map.whenReady(this._onViewReset, this);
			}
		}
		this._draggable.enable();
	},

	removeHooks: function () {
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		var map = this._map;

		if (map._panAnim) {
			map._panAnim.stop();
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function () {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			if (time - this._times[0] > 200) {
				this._positions.shift();
				this._times.shift();
			}
		}

		this._map
		    .fire('move')
		    .fire('drag');
	},

	_onViewReset: function () {
		// TODO fix hardcoded Earth values
		var pxCenter = this._map.getSize()._divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.project([0, 180]).x;
	},

	_onPreDrag: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,
		    delay = +new Date() - this._lastTime,

		    noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime + delay - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x || !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				L.Util.requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true
					});
				});
			}
		}
	}
});

L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);


/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

L.Map.mergeOptions({
	doubleClickZoom: true
});

L.Map.DoubleClickZoom = L.Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);


/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

L.Map.mergeOptions({
	scrollWheelZoom: true
});

L.Map.ScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
		L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
		L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
	},

	_onWheelScroll: function (e) {
		var delta = L.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.preventDefault(e);
		L.DomEvent.stopPropagation(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);


/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

L.extend(L.DomEvent, {

	_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
	_touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',

	// inspired by Zepto touch code by Thomas Fuchs
	addDoubleTapListener: function (obj, handler, id) {
		var last,
		    doubleTap = false,
		    delay = 250,
		    touch,
		    pre = '_leaflet_',
		    touchstart = this._touchstart,
		    touchend = this._touchend,
		    trackedTouches = [];

		function onTouchStart(e) {
			var count;

			if (L.Browser.pointer) {
				trackedTouches.push(e.pointerId);
				count = trackedTouches.length;
			} else {
				count = e.touches.length;
			}
			if (count > 1) {
				return;
			}

			var now = Date.now(),
				delta = now - (last || now);

			touch = e.touches ? e.touches[0] : e;
			doubleTap = (delta > 0 && delta <= delay);
			last = now;
		}

		function onTouchEnd(e) {
			if (L.Browser.pointer) {
				var idx = trackedTouches.indexOf(e.pointerId);
				if (idx === -1) {
					return;
				}
				trackedTouches.splice(idx, 1);
			}

			if (doubleTap) {
				if (L.Browser.pointer) {
					// work around .type being readonly with MSPointer* events
					var newTouch = { },
						prop;

					// jshint forin:false
					for (var i in touch) {
						prop = touch[i];
						if (typeof prop === 'function') {
							newTouch[i] = prop.bind(touch);
						} else {
							newTouch[i] = prop;
						}
					}
					touch = newTouch;
				}
				touch.type = 'dblclick';
				handler(touch);
				last = null;
			}
		}
		obj[pre + touchstart + id] = onTouchStart;
		obj[pre + touchend + id] = onTouchEnd;

		// on pointer we need to listen on the document, otherwise a drag starting on the map and moving off screen
		// will not come through to us, so we will lose track of how many touches are ongoing
		var endElement = L.Browser.pointer ? document.documentElement : obj;

		obj.addEventListener(touchstart, onTouchStart, false);
		endElement.addEventListener(touchend, onTouchEnd, false);

		if (L.Browser.pointer) {
			endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
		}

		return this;
	},

	removeDoubleTapListener: function (obj, id) {
		var pre = '_leaflet_';

		obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
		(L.Browser.pointer ? document.documentElement : obj).removeEventListener(
		        this._touchend, obj[pre + this._touchend + id], false);

		if (L.Browser.pointer) {
			document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id],
				false);
		}

		return this;
	}
});


/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */

L.extend(L.DomEvent, {

	//static
	POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
	POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
	POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
	POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',

	_pointers: [],
	_pointerDocumentListener: false,

	// Provides a touch events wrapper for (ms)pointer events.
	// Based on changes by veproza https://github.com/CloudMade/Leaflet/pull/1019
	//ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	addPointerListener: function (obj, type, handler, id) {

		switch (type) {
		case 'touchstart':
			return this.addPointerListenerStart(obj, type, handler, id);
		case 'touchend':
			return this.addPointerListenerEnd(obj, type, handler, id);
		case 'touchmove':
			return this.addPointerListenerMove(obj, type, handler, id);
		default:
			throw 'Unknown touch event type';
		}
	},

	addPointerListenerStart: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    pointers = this._pointers;

		var cb = function (e) {

			L.DomEvent.preventDefault(e);

			var alreadyInArray = false;
			for (var i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId === e.pointerId) {
					alreadyInArray = true;
					break;
				}
			}
			if (!alreadyInArray) {
				pointers.push(e);
			}

			e.touches = pointers.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchstart' + id] = cb;
		obj.addEventListener(this.POINTER_DOWN, cb, false);

		// need to also listen for end events to keep the _pointers list accurate
		// this needs to be on the body and never go away
		if (!this._pointerDocumentListener) {
			var internalCb = function (e) {
				for (var i = 0; i < pointers.length; i++) {
					if (pointers[i].pointerId === e.pointerId) {
						pointers.splice(i, 1);
						break;
					}
				}
			};
			//We listen on the documentElement as any drags that end by moving the touch off the screen get fired there
			document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
			document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);

			this._pointerDocumentListener = true;
		}

		return this;
	},

	addPointerListenerMove: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		function cb(e) {

			// don't fire touch moves when mouse isn't down
			if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches[i] = e;
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		}

		obj[pre + 'touchmove' + id] = cb;
		obj.addEventListener(this.POINTER_MOVE, cb, false);

		return this;
	},

	addPointerListenerEnd: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		var cb = function (e) {
			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches.splice(i, 1);
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchend' + id] = cb;
		obj.addEventListener(this.POINTER_UP, cb, false);
		obj.addEventListener(this.POINTER_CANCEL, cb, false);

		return this;
	},

	removePointerListener: function (obj, type, id) {
		var pre = '_leaflet_',
		    cb = obj[pre + type + id];

		switch (type) {
		case 'touchstart':
			obj.removeEventListener(this.POINTER_DOWN, cb, false);
			break;
		case 'touchmove':
			obj.removeEventListener(this.POINTER_MOVE, cb, false);
			break;
		case 'touchend':
			obj.removeEventListener(this.POINTER_UP, cb, false);
			obj.removeEventListener(this.POINTER_CANCEL, cb, false);
			break;
		}

		return this;
	}
});


/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

L.Map.mergeOptions({
	touchZoom: L.Browser.touch && !L.Browser.android23,
	bounceAtZoomLimits: true
});

L.Map.TouchZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]),
		    viewCenter = map._getCenterLayerPoint();

		this._startCenter = p1.add(p2)._divideBy(2);
		this._startDist = p1.distanceTo(p2);

		this._moved = false;
		this._zooming = true;

		this._centerOffset = viewCenter.subtract(this._startCenter);

		if (map._panAnim) {
			map._panAnim.stop();
		}

		L.DomEvent
		    .on(document, 'touchmove', this._onTouchMove, this)
		    .on(document, 'touchend', this._onTouchEnd, this);

		L.DomEvent.preventDefault(e);
	},

	_onTouchMove: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]);

		this._scale = p1.distanceTo(p2) / this._startDist;
		this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);

		if (this._scale === 1) { return; }

		if (!map.options.bounceAtZoomLimits) {
			if ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
			    (map.getZoom() === map.getMaxZoom() && this._scale > 1)) { return; }
		}

		if (!this._moved) {
			L.DomUtil.addClass(map._mapPane, 'leaflet-touching');

			map
			    .fire('movestart')
			    .fire('zoomstart');

			this._moved = true;
		}

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(
		        this._updateOnMove, this, true, this._map._container);

		L.DomEvent.preventDefault(e);
	},

	_updateOnMove: function () {
		var map = this._map,
		    origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),
		    zoom = map.getScaleZoom(this._scale);

		map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		var map = this._map;

		this._zooming = false;
		L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
		L.Util.cancelAnimFrame(this._animRequest);

		L.DomEvent
		    .off(document, 'touchmove', this._onTouchMove)
		    .off(document, 'touchend', this._onTouchEnd);

		var origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),

		    oldZoom = map.getZoom(),
		    floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
		    roundZoomDelta = (floatZoomDelta > 0 ?
		            Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),

		    zoom = map._limitZoom(oldZoom + roundZoomDelta),
		    scale = map.getZoomScale(zoom) / this._scale;

		map._animateZoom(center, zoom, origin, scale);
	},

	_getScaleOrigin: function () {
		var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
		return this._startCenter.add(centerOffset);
	}
});

L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);


/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

L.Map.mergeOptions({
	tap: true,
	tapTolerance: 15
});

L.Map.Tap = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		L.DomEvent.preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			L.DomUtil.addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(L.bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		L.DomEvent
			.on(document, 'touchmove', this._onMove, this)
			.on(document, 'touchend', this._onUp, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		L.DomEvent
			.off(document, 'touchmove', this._onMove, this)
			.off(document, 'touchend', this._onUp, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				L.DomUtil.removeClass(el, 'leaflet-active');
			}

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new L.Point(first.clientX, first.clientY);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

if (L.Browser.touch && !L.Browser.pointer) {
	L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
}


/*
 * L.Handler.ShiftDragZoom is used to add shift-drag zoom interaction to the map
  * (zoom to a selected bounding box), enabled by default.
 */

L.Map.mergeOptions({
	boxZoom: true
});

L.Map.BoxZoom = L.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._moved = false;
	},

	addHooks: function () {
		L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
		this._moved = false;
	},

	moved: function () {
		return this._moved;
	},

	_onMouseDown: function (e) {
		this._moved = false;

		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		L.DomUtil.disableTextSelection();
		L.DomUtil.disableImageDrag();

		this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

		L.DomEvent
		    .on(document, 'mousemove', this._onMouseMove, this)
		    .on(document, 'mouseup', this._onMouseUp, this)
		    .on(document, 'keydown', this._onKeyDown, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
			L.DomUtil.setPosition(this._box, this._startLayerPoint);

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';
			this._map.fire('boxzoomstart');
		}

		var startPoint = this._startLayerPoint,
		    box = this._box,

		    layerPoint = this._map.mouseEventToLayerPoint(e),
		    offset = layerPoint.subtract(startPoint),

		    newPos = new L.Point(
		        Math.min(layerPoint.x, startPoint.x),
		        Math.min(layerPoint.y, startPoint.y));

		L.DomUtil.setPosition(box, newPos);

		this._moved = true;

		// TODO refactor: remove hardcoded 4 pixels
		box.style.width  = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
		box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
	},

	_finish: function () {
		if (this._moved) {
			this._pane.removeChild(this._box);
			this._container.style.cursor = '';
		}

		L.DomUtil.enableTextSelection();
		L.DomUtil.enableImageDrag();

		L.DomEvent
		    .off(document, 'mousemove', this._onMouseMove)
		    .off(document, 'mouseup', this._onMouseUp)
		    .off(document, 'keydown', this._onKeyDown);
	},

	_onMouseUp: function (e) {

		this._finish();

		var map = this._map,
		    layerPoint = map.mouseEventToLayerPoint(e);

		if (this._startLayerPoint.equals(layerPoint)) { return; }

		var bounds = new L.LatLngBounds(
		        map.layerPointToLatLng(this._startLayerPoint),
		        map.layerPointToLatLng(layerPoint));

		map.fitBounds(bounds);

		map.fire('boxzoomend', {
			boxZoomBounds: bounds
		});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);


/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

L.Map.mergeOptions({
	keyboard: true,
	keyboardPanOffset: 80,
	keyboardZoomOffset: 1
});

L.Map.Keyboard = L.Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanOffset(map.options.keyboardPanOffset);
		this._setZoomOffset(map.options.keyboardZoomOffset);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex === -1) {
			container.tabIndex = '0';
		}

		L.DomEvent
		    .on(container, 'focus', this._onFocus, this)
		    .on(container, 'blur', this._onBlur, this)
		    .on(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .on('focus', this._addHooks, this)
		    .on('blur', this._removeHooks, this);
	},

	removeHooks: function () {
		this._removeHooks();

		var container = this._map._container;

		L.DomEvent
		    .off(container, 'focus', this._onFocus, this)
		    .off(container, 'blur', this._onBlur, this)
		    .off(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .off('focus', this._addHooks, this)
		    .off('blur', this._removeHooks, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanOffset: function (pan) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * pan, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [pan, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, pan];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * pan];
		}
	},

	_setZoomOffset: function (zoom) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoom;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoom;
		}
	},

	_addHooks: function () {
		L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		var key = e.keyCode,
		    map = this._map;

		if (key in this._panKeys) {

			if (map._panAnim && map._panAnim._inProgress) { return; }

			map.panBy(this._panKeys[key]);

			if (map.options.maxBounds) {
				map.panInsideBounds(map.options.maxBounds);
			}

		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + this._zoomKeys[key]);

		} else {
			return;
		}

		L.DomEvent.stop(e);
	}
});

L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);


/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;
		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon);
		}

		this._draggable
			.on('dragstart', this._onDragStart, this)
			.on('drag', this._onDrag, this)
			.on('dragend', this._onDragEnd, this);
		this._draggable.enable();
		L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable
			.off('dragstart', this._onDragStart, this)
			.off('drag', this._onDrag, this)
			.off('dragend', this._onDragEnd, this);

		this._draggable.disable();
		L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onDrag: function () {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			L.DomUtil.setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;

		marker
		    .fire('move', {latlng: latlng})
		    .fire('drag');
	},

	_onDragEnd: function (e) {
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});


/*
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

L.Control = L.Class.extend({
	options: {
		position: 'topright'
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	getPosition: function () {
		return this.options.position;
	},

	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	getContainer: function () {
		return this._container;
	},

	addTo: function (map) {
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		L.DomUtil.addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		return this;
	},

	removeFrom: function (map) {
		var pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		corner.removeChild(this._container);
		this._map = null;

		if (this.onRemove) {
			this.onRemove(map);
		}

		return this;
	},

	_refocusOnMap: function () {
		if (this._map) {
			this._map.getContainer().focus();
		}
	}
});

L.control = function (options) {
	return new L.Control(options);
};


// adds control-related methods to L.Map

L.Map.include({
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	removeControl: function (control) {
		control.removeFrom(this);
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            L.DomUtil.create('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = L.DomUtil.create('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		this._container.removeChild(this._controlContainer);
	}
});


/*
 * L.Control.Zoom is used for the default zoom buttons on the map.
 */

L.Control.Zoom = L.Control.extend({
	options: {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

		this._map = map;

		this._zoomInButton  = this._createButton(
		        this.options.zoomInText, this.options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn,  this);
		this._zoomOutButton = this._createButton(
		        this.options.zoomOutText, this.options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut, this);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context)
		    .on(link, 'click', this._refocusOnMap, context);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'leaflet-disabled';

		L.DomUtil.removeClass(this._zoomInButton, className);
		L.DomUtil.removeClass(this._zoomOutButton, className);

		if (map._zoom === map.getMinZoom()) {
			L.DomUtil.addClass(this._zoomOutButton, className);
		}
		if (map._zoom === map.getMaxZoom()) {
			L.DomUtil.addClass(this._zoomInButton, className);
		}
	}
});

L.Map.mergeOptions({
	zoomControl: true
});

L.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new L.Control.Zoom();
		this.addControl(this.zoomControl);
	}
});

L.control.zoom = function (options) {
	return new L.Control.Zoom(options);
};



/*
 * L.Control.Attribution is used for displaying attribution on the map (added by default).
 */

L.Control.Attribution = L.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
		L.DomEvent.disableClickPropagation(this._container);

		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}
		
		map
		    .on('layeradd', this._onLayerAdd, this)
		    .on('layerremove', this._onLayerRemove, this);

		this._update();

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerAdd)
		    .off('layerremove', this._onLayerRemove);

	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	},

	_onLayerAdd: function (e) {
		if (e.layer.getAttribution) {
			this.addAttribution(e.layer.getAttribution());
		}
	},

	_onLayerRemove: function (e) {
		if (e.layer.getAttribution) {
			this.removeAttribution(e.layer.getAttribution());
		}
	}
});

L.Map.mergeOptions({
	attributionControl: true
});

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new L.Control.Attribution()).addTo(this);
	}
});

L.control.attribution = function (options) {
	return new L.Control.Attribution(options);
};


/*
 * L.Control.Scale is used for displaying metric/imperial scale on the map.
 */

L.Control.Scale = L.Control.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 100,
		metric: true,
		imperial: true,
		updateWhenIdle: false
	},

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

		this._addScales(options, className, container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
	},

	_update: function () {
		var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,

		    size = this._map.getSize(),
		    options = this.options,
		    maxMeters = 0;

		if (size.x > 0) {
			maxMeters = dist * (options.maxWidth / size.x);
		}

		this._updateScales(options, maxMeters);
	},

	_updateScales: function (options, maxMeters) {
		if (options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}

		if (options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters);

		this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
		this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);

			scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
			scale.innerHTML = miles + ' mi';

		} else {
			feet = this._getRoundNum(maxFeet);

			scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
			scale.innerHTML = feet + ' ft';
		}
	},

	_getScaleWidth: function (ratio) {
		return Math.round(this.options.maxWidth * ratio) - 10;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});

L.control.scale = function (options) {
	return new L.Control.Scale(options);
};


/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

L.Control.Layers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange, this)
		    .off('layerremove', this._onLayerChange, this);
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		this._update();
		return this;
	},

	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		this._update();
		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);
		delete this._layers[id];
		this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}
			//Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay) {
		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_onLayerChange: function (e) {
		var obj = this._layers[L.stamp(e.layer)];

		if (!obj) { return; }

		if (!this._handlingClick) {
			this._update();
		}

		var type = obj.overlay ?
			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'layeradd' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});

L.control.layers = function (baseLayers, overlays, options) {
	return new L.Control.Layers(baseLayers, overlays, options);
};


/*
 * L.PosAnimation is used by Leaflet internally for pan animations.
 */

L.PosAnimation = L.Class.extend({
	includes: L.Mixin.Events,

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._newPos = newPos;

		this.fire('start');

		el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) +
		        's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';

		L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
		L.DomUtil.setPosition(el, newPos);

		// toggle reflow, Chrome flickers for some reason if you don't do this
		L.Util.falseFn(el.offsetWidth);

		// there's no native way to track value updates of transitioned properties, so we imitate this
		this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
	},

	stop: function () {
		if (!this._inProgress) { return; }

		// if we just removed the transition property, the element would jump to its final position,
		// so we need to make it stay at the current position

		L.DomUtil.setPosition(this._el, this._getPos());
		this._onTransitionEnd();
		L.Util.falseFn(this._el.offsetWidth); // force reflow in case we are about to start a new animation
	},

	_onStep: function () {
		var stepPos = this._getPos();
		if (!stepPos) {
			this._onTransitionEnd();
			return;
		}
		// jshint camelcase: false
		// make L.DomUtil.getPosition return intermediate position value during animation
		this._el._leaflet_pos = stepPos;

		this.fire('step');
	},

	// you can't easily get intermediate values of properties animated with CSS3 Transitions,
	// we need to parse computed style (in case of transform it returns matrix string)

	_transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,

	_getPos: function () {
		var left, top, matches,
		    el = this._el,
		    style = window.getComputedStyle(el);

		if (L.Browser.any3d) {
			matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
			if (!matches) { return; }
			left = parseFloat(matches[1]);
			top  = parseFloat(matches[2]);
		} else {
			left = parseFloat(style.left);
			top  = parseFloat(style.top);
		}

		return new L.Point(left, top, true);
	},

	_onTransitionEnd: function () {
		L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);

		if (!this._inProgress) { return; }
		this._inProgress = false;

		this._el.style[L.DomUtil.TRANSITION] = '';

		// jshint camelcase: false
		// make sure L.DomUtil.getPosition returns the final position value after animation
		this._el._leaflet_pos = this._newPos;

		clearInterval(this._stepTimer);

		this.fire('step').fire('end');
	}

});


/*
 * Extends L.Map to handle panning animations.
 */

L.Map.include({

	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
		options = options || {};

		if (this._panAnim) {
			this._panAnim.stop();
		}

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = L.extend({animate: options.animate}, options.zoom);
				options.pan = L.extend({animate: options.animate}, options.pan);
			}

			// try animating pan or zoom
			var animated = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (animated) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	panBy: function (offset, options) {
		offset = L.point(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new L.PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset);
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._floor();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	}
});


/*
 * L.PosAnimation fallback implementation that powers Leaflet pan animations
 * in browsers that don't support CSS3 Transitions.
 */

L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = L.DomUtil.getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		this.fire('start');

		this._animate();
	},

	stop: function () {
		if (!this._inProgress) { return; }

		this._step();
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = L.Util.requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function () {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration));
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		L.DomUtil.setPosition(this._el, pos);

		this.fire('step');
	},

	_complete: function () {
		L.Util.cancelAnimFrame(this._animId);

		this._inProgress = false;
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});


/*
 * Extends L.Map to handle zoom animations.
 */

L.Map.mergeOptions({
	zoomAnimation: true,
	zoomAnimationThreshold: 4
});

if (L.DomUtil.TRANSITION) {

	L.Map.addInitHook(function () {
		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION &&
				L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
		}
	});
}

L.Map.include(!L.DomUtil.TRANSITION ? {} : {

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
			origin = this._getCenterLayerPoint()._add(offset);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		this
		    .fire('movestart')
		    .fire('zoomstart');

		this._animateZoom(center, zoom, origin, scale, null, true);

		return true;
	},

	_animateZoom: function (center, zoom, origin, scale, delta, backwards, forTouchZoom) {

		if (!forTouchZoom) {
			this._animatingZoom = true;
		}

		// put transform transition on all layers with leaflet-zoom-animated class
		L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');

		// remember what center/zoom to set after animation
		this._animateToCenter = center;
		this._animateToZoom = zoom;

		// disable any dragging during animation
		if (L.Draggable) {
			L.Draggable._disabled = true;
		}

		L.Util.requestAnimFrame(function () {
			this.fire('zoomanim', {
				center: center,
				zoom: zoom,
				origin: origin,
				scale: scale,
				delta: delta,
				backwards: backwards
			});
		}, this);
	},

	_onZoomTransitionEnd: function () {

		this._animatingZoom = false;

		L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');

		this._resetView(this._animateToCenter, this._animateToZoom, true, true);

		if (L.Draggable) {
			L.Draggable._disabled = false;
		}
	}
});


/*
	Zoom animation logic for L.TileLayer.
*/

L.TileLayer.include({
	_animateZoom: function (e) {
		if (!this._animating) {
			this._animating = true;
			this._prepareBgBuffer();
		}

		var bg = this._bgBuffer,
		    transform = L.DomUtil.TRANSFORM,
		    initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
		    scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);

		bg.style[transform] = e.backwards ?
				scaleStr + ' ' + initialTransform :
				initialTransform + ' ' + scaleStr;
	},

	_endZoomAnim: function () {
		var front = this._tileContainer,
		    bg = this._bgBuffer;

		front.style.visibility = '';
		front.parentNode.appendChild(front); // Bring to fore

		// force reflow
		L.Util.falseFn(bg.offsetWidth);

		this._animating = false;
	},

	_clearBgBuffer: function () {
		var map = this._map;

		if (map && !map._animatingZoom && !map.touchZoom._zooming) {
			this._bgBuffer.innerHTML = '';
			this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
		}
	},

	_prepareBgBuffer: function () {

		var front = this._tileContainer,
		    bg = this._bgBuffer;

		// if foreground layer doesn't have many tiles but bg layer does,
		// keep the existing bg layer and just zoom it some more

		var bgLoaded = this._getLoadedTilesPercentage(bg),
		    frontLoaded = this._getLoadedTilesPercentage(front);

		if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {

			front.style.visibility = 'hidden';
			this._stopLoadingImages(front);
			return;
		}

		// prepare the buffer to become the front tile pane
		bg.style.visibility = 'hidden';
		bg.style[L.DomUtil.TRANSFORM] = '';

		// switch out the current layer to be the new bg layer (and vice-versa)
		this._tileContainer = bg;
		bg = this._bgBuffer = front;

		this._stopLoadingImages(bg);

		//prevent bg buffer from clearing right after zoom
		clearTimeout(this._clearBgBufferTimer);
	},

	_getLoadedTilesPercentage: function (container) {
		var tiles = container.getElementsByTagName('img'),
		    i, len, count = 0;

		for (i = 0, len = tiles.length; i < len; i++) {
			if (tiles[i].complete) {
				count++;
			}
		}
		return count / len;
	},

	// stops loading all tiles in the background layer
	_stopLoadingImages: function (container) {
		var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
		    i, len, tile;

		for (i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];

			if (!tile.complete) {
				tile.onload = L.Util.falseFn;
				tile.onerror = L.Util.falseFn;
				tile.src = L.Util.emptyImageUrl;

				tile.parentNode.removeChild(tile);
			}
		}
	}
});


/*
 * Provides L.Map with convenient shortcuts for using browser geolocation features.
 */

L.Map.include({
	_defaultLocateOptions: {
		watch: false,
		setView: false,
		maxZoom: Infinity,
		timeout: 10000,
		maximumAge: 0,
		enableHighAccuracy: false
	},

	locate: function (/*Object*/ options) {

		options = this._locateOptions = L.extend(this._defaultLocateOptions, options);

		if (!navigator.geolocation) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = L.bind(this._handleGeolocationResponse, this),
			onError = L.bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	stopLocate: function () {
		if (navigator.geolocation) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new L.LatLng(lat, lng),

		    latAccuracy = 180 * pos.coords.accuracy / 40075017,
		    lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

		    bounds = L.latLngBounds(
		            [lat - latAccuracy, lng - lngAccuracy],
		            [lat + latAccuracy, lng + lngAccuracy]),

		    options = this._locateOptions;

		if (options.setView) {
			var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
			this.setView(latlng, zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		this.fire('locationfound', data);
	}
});


}(window, document));
},{}],7:[function(require,module,exports){
'use strict';

var Promise = require('promise');
var Response = require('http-response-object');
var handleQs = require('./lib/handle-qs.js');

module.exports = doRequest;
function doRequest(method, url, options, callback) {
  var result = new Promise(function (resolve, reject) {
    var xhr = new window.XMLHttpRequest();

    // check types of arguments

    if (typeof method !== 'string') {
      throw new TypeError('The method must be a string.');
    }
    if (typeof url !== 'string') {
      throw new TypeError('The URL/path must be a string.');
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (options === null || options === undefined) {
      options = {};
    }
    if (typeof options !== 'object') {
      throw new TypeError('Options must be an object (or null).');
    }
    if (typeof callback !== 'function') {
      callback = undefined;
    }

    method = method.toUpperCase();
    options.headers = options.headers || {};

    // handle cross domain

    var match;
    var crossDomain = !!((match = /^([\w-]+:)?\/\/([^\/]+)/.exec(options.uri)) && (match[2] != window.location.host));
    if (!crossDomain) options.headers['X-Requested-With'] = 'XMLHttpRequest';

    // handle query string
    if (options.qs) {
      url = handleQs(url, options.qs);
    }

    // handle json body
    if (options.json) {
      options.body = JSON.stringify(options.json);
      options.headers['content-type'] = 'application/json';
    }


    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var headers = {};
        xhr.getAllResponseHeaders().split('\r\n').forEach(function (header) {
          var h = header.split(':');
          if (h.length > 1) {
            headers[h[0].toLowerCase()] = h.slice(1).join(':').trim();
          }
        });
        resolve(new Response(xhr.status, headers, xhr.responseText));
      }
    };

    // method, url, async
    xhr.open(method, url, true);

    for (var name in options.headers) {
      xhr.setRequestHeader(name.toLowerCase(), options.headers[name]);
    }

    // avoid sending empty string (#319)
    xhr.send(options.body ? options.body : null);
  });
  result.getBody = function () {
    return result.then(function (res) { return res.getBody(); });
  };
  return result.nodeify(callback);
}

},{"./lib/handle-qs.js":8,"http-response-object":9,"promise":11}],8:[function(require,module,exports){
'use strict';

var parse = require('qs').parse;
var stringify = require('qs').stringify;

module.exports = handleQs;
function handleQs(url, query) {
  url = url.split('?');
  var start = url[0];
  var qs = (url[1] || '').split('#')[0];
  var end = url[1] && url[1].split('#').length > 1 ? '#' + url[1].split('#')[1] : '';

  var baseQs = parse(qs);
  for (var i in query) {
    baseQs[i] = query[i];
  }
  qs = stringify(baseQs);
  if (qs !== '') {
    qs = '?' + qs;
  }
  return start + qs + end;
}

},{"qs":13}],9:[function(require,module,exports){
'use strict';

module.exports = Response;

/**
 * A response from a web request
 *
 * @param {Number} statusCode
 * @param {Object} headers
 * @param {Buffer} body
 */
function Response(statusCode, headers, body) {
  if (typeof statusCode !== 'number') {
    throw new TypeError('statusCode must be a number but was ' + (typeof statusCode));
  }
  if (headers === null) {
    throw new TypeError('headers cannot be null');
  }
  if (typeof headers !== 'object') {
    throw new TypeError('headers must be an object but was ' + (typeof headers));
  }
  this.statusCode = statusCode;
  this.headers = {};
  for (var key in headers) {
    this.headers[key.toLowerCase()] = headers[key];
  }
  this.body = body;
}

Response.prototype.getBody = function (encoding) {
  if (this.statusCode >= 300) {
    var err = new Error('Server responded with status code '
                    + this.statusCode + ':\n' + this.body.toString());
    err.statusCode = this.statusCode;
    err.headers = this.headers;
    err.body = this.body;
    throw err;
  }
  return encoding ? this.body.toString(encoding) : this.body;
};

},{}],10:[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":12}],11:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions to the core promise API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.from = Promise.cast = function (value) {
  var err = new Error('Promise.from and Promise.cast are deprecated, use Promise.resolve instead')
  err.name = 'Warning'
  console.warn(err.stack)
  return Promise.resolve(value)
}

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var calledWithArray = arguments.length === 1 && Array.isArray(arguments[0])
  var args = Array.prototype.slice.call(calledWithArray ? arguments[0] : arguments)

  if (!calledWithArray) {
    var err = new Error('Promise.all should be called with a single array, calling it with multiple arguments is deprecated')
    err.name = 'Warning'
    console.warn(err.stack)
  }

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}

Promise.prototype.nodeify = function (callback) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback(null, value)
    })
  }, function (err) {
    asap(function () {
      callback(err)
    })
  })
}

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":10,"asap":12}],12:[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))
},{"_process":4}],13:[function(require,module,exports){
/**
 * Object#toString() ref for stringify().
 */

var toString = Object.prototype.toString;

/**
 * Object#hasOwnProperty ref
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Array#indexOf shim.
 */

var indexOf = typeof Array.prototype.indexOf === 'function'
  ? function(arr, el) { return arr.indexOf(el); }
  : function(arr, el) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === el) return i;
      }
      return -1;
    };

/**
 * Array.isArray shim.
 */

var isArray = Array.isArray || function(arr) {
  return toString.call(arr) == '[object Array]';
};

/**
 * Object.keys shim.
 */

var objectKeys = Object.keys || function(obj) {
  var ret = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret.push(key);
    }
  }
  return ret;
};

/**
 * Array#forEach shim.
 */

var forEach = typeof Array.prototype.forEach === 'function'
  ? function(arr, fn) { return arr.forEach(fn); }
  : function(arr, fn) {
      for (var i = 0; i < arr.length; i++) fn(arr[i]);
    };

/**
 * Array#reduce shim.
 */

var reduce = function(arr, fn, initial) {
  if (typeof arr.reduce === 'function') return arr.reduce(fn, initial);
  var res = initial;
  for (var i = 0; i < arr.length; i++) res = fn(res, arr[i]);
  return res;
};

/**
 * Cache non-integer test regexp.
 */

var isint = /^[0-9]+$/;

function promote(parent, key) {
  if (parent[key].length == 0) return parent[key] = {}
  var t = {};
  for (var i in parent[key]) {
    if (hasOwnProperty.call(parent[key], i)) {
      t[i] = parent[key][i];
    }
  }
  parent[key] = t;
  return t;
}

function parse(parts, parent, key, val) {
  var part = parts.shift();
  
  // illegal
  if (Object.getOwnPropertyDescriptor(Object.prototype, key)) return;
  
  // end
  if (!part) {
    if (isArray(parent[key])) {
      parent[key].push(val);
    } else if ('object' == typeof parent[key]) {
      parent[key] = val;
    } else if ('undefined' == typeof parent[key]) {
      parent[key] = val;
    } else {
      parent[key] = [parent[key], val];
    }
    // array
  } else {
    var obj = parent[key] = parent[key] || [];
    if (']' == part) {
      if (isArray(obj)) {
        if ('' != val) obj.push(val);
      } else if ('object' == typeof obj) {
        obj[objectKeys(obj).length] = val;
      } else {
        obj = parent[key] = [parent[key], val];
      }
      // prop
    } else if (~indexOf(part, ']')) {
      part = part.substr(0, part.length - 1);
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
      // key
    } else {
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
    }
  }
}

/**
 * Merge parent key/val pair.
 */

function merge(parent, key, val){
  if (~indexOf(key, ']')) {
    var parts = key.split('[')
      , len = parts.length
      , last = len - 1;
    parse(parts, parent, 'base', val);
    // optimize
  } else {
    if (!isint.test(key) && isArray(parent.base)) {
      var t = {};
      for (var k in parent.base) t[k] = parent.base[k];
      parent.base = t;
    }
    set(parent.base, key, val);
  }

  return parent;
}

/**
 * Compact sparse arrays.
 */

function compact(obj) {
  if ('object' != typeof obj) return obj;

  if (isArray(obj)) {
    var ret = [];

    for (var i in obj) {
      if (hasOwnProperty.call(obj, i)) {
        ret.push(obj[i]);
      }
    }

    return ret;
  }

  for (var key in obj) {
    obj[key] = compact(obj[key]);
  }

  return obj;
}

/**
 * Parse the given obj.
 */

function parseObject(obj){
  var ret = { base: {} };

  forEach(objectKeys(obj), function(name){
    merge(ret, name, obj[name]);
  });

  return compact(ret.base);
}

/**
 * Parse the given str.
 */

function parseString(str){
  var ret = reduce(String(str).split('&'), function(ret, pair){
    var eql = indexOf(pair, '=')
      , brace = lastBraceInKey(pair)
      , key = pair.substr(0, brace || eql)
      , val = pair.substr(brace || eql, pair.length)
      , val = val.substr(indexOf(val, '=') + 1, val.length);

    // ?foo
    if ('' == key) key = pair, val = '';
    if ('' == key) return ret;

    return merge(ret, decode(key), decode(val));
  }, { base: {} }).base;

  return compact(ret);
}

/**
 * Parse the given query `str` or `obj`, returning an object.
 *
 * @param {String} str | {Object} obj
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str);
};

/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

var stringify = exports.stringify = function(obj, prefix) {
  if (isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix + '=' + encodeURIComponent(String(obj));
  }
};

/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}

/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[' + i + ']'));
  }
  return ret.join('&');
}

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyObject(obj, prefix) {
  var ret = []
    , keys = objectKeys(obj)
    , key;

  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    if ('' == key) continue;
    if (null == obj[key]) {
      ret.push(encodeURIComponent(key) + '=');
    } else {
      ret.push(stringify(obj[key], prefix
        ? prefix + '[' + encodeURIComponent(key) + ']'
        : encodeURIComponent(key)));
    }
  }

  return ret.join('&');
}

/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */

function set(obj, key, val) {
  var v = obj[key];
  if (Object.getOwnPropertyDescriptor(Object.prototype, key)) return;
  if (undefined === v) {
    obj[key] = val;
  } else if (isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}

/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}

/**
 * Decode `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function decode(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (err) {
    return str;
  }
}

},{}],14:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./Scheduler');
	var async = require('./async');

	return makePromise({
		scheduler: new Scheduler(async)
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./Scheduler":16,"./async":18,"./makePromise":28}],15:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {
	/**
	 * Circular queue
	 * @param {number} capacityPow2 power of 2 to which this queue's capacity
	 *  will be set initially. eg when capacityPow2 == 3, queue capacity
	 *  will be 8.
	 * @constructor
	 */
	function Queue(capacityPow2) {
		this.head = this.tail = this.length = 0;
		this.buffer = new Array(1 << capacityPow2);
	}

	Queue.prototype.push = function(x) {
		if(this.length === this.buffer.length) {
			this._ensureCapacity(this.length * 2);
		}

		this.buffer[this.tail] = x;
		this.tail = (this.tail + 1) & (this.buffer.length - 1);
		++this.length;
		return this.length;
	};

	Queue.prototype.shift = function() {
		var x = this.buffer[this.head];
		this.buffer[this.head] = void 0;
		this.head = (this.head + 1) & (this.buffer.length - 1);
		--this.length;
		return x;
	};

	Queue.prototype._ensureCapacity = function(capacity) {
		var head = this.head;
		var buffer = this.buffer;
		var newBuffer = new Array(capacity);
		var i = 0;
		var len;

		if(head === 0) {
			len = this.length;
			for(; i<len; ++i) {
				newBuffer[i] = buffer[i];
			}
		} else {
			capacity = buffer.length;
			len = this.tail;
			for(; head<capacity; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}

			for(head=0; head<len; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}
		}

		this.buffer = newBuffer;
		this.head = 0;
		this.tail = this.length;
	};

	return Queue;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],16:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var Queue = require('./Queue');

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	/**
	 * Async task scheduler
	 * @param {function} async function to schedule a single async function
	 * @constructor
	 */
	function Scheduler(async) {
		this._async = async;
		this._queue = new Queue(15);
		this._afterQueue = new Queue(5);
		this._running = false;

		var self = this;
		this.drain = function() {
			self._drain();
		};
	}

	/**
	 * Enqueue a task
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		this._add(this._queue, task);
	};

	/**
	 * Enqueue a task to run after the main task queue
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.afterQueue = function(task) {
		this._add(this._afterQueue, task);
	};

	/**
	 * Drain the handler queue entirely, and then the after queue
	 */
	Scheduler.prototype._drain = function() {
		runQueue(this._queue);
		this._running = false;
		runQueue(this._afterQueue);
	};

	/**
	 * Add a task to the q, and schedule drain if not already scheduled
	 * @param {Queue} queue
	 * @param {{run:function}} task
	 * @private
	 */
	Scheduler.prototype._add = function(queue, task) {
		queue.push(task);
		if(!this._running) {
			this._running = true;
			this._async(this.drain);
		}
	};

	/**
	 * Run all the tasks in the q
	 * @param queue
	 */
	function runQueue(queue) {
		while(queue.length > 0) {
			queue.shift().run();
		}
	}

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"./Queue":15}],17:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	/**
	 * Custom error type for promises rejected by promise.timeout
	 * @param {string} message
	 * @constructor
	 */
	function TimeoutError (message) {
		Error.call(this);
		this.message = message;
		this.name = TimeoutError.name;
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, TimeoutError);
		}
	}

	TimeoutError.prototype = Object.create(Error.prototype);
	TimeoutError.prototype.constructor = TimeoutError;

	return TimeoutError;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
},{}],18:[function(require,module,exports){
(function (process){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// vertx and finally fall back to setTimeout

	/*jshint maxcomplexity:6*/
	/*global process,document,setTimeout,MutationObserver,WebKitMutationObserver*/
	var nextTick, MutationObs;

	if (typeof process !== 'undefined' && process !== null &&
		typeof process.nextTick === 'function') {
		nextTick = function(f) {
			process.nextTick(f);
		};

	} else if (MutationObs =
		(typeof MutationObserver === 'function' && MutationObserver) ||
		(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver)) {
		nextTick = (function (document, MutationObserver) {
			var scheduled;
			var el = document.createElement('div');
			var o = new MutationObserver(run);
			o.observe(el, { attributes: true });

			function run() {
				var f = scheduled;
				scheduled = void 0;
				f();
			}

			return function (f) {
				scheduled = f;
				el.setAttribute('class', 'x');
			};
		}(document, MutationObs));

	} else {
		nextTick = (function(cjsRequire) {
			try {
				// vert.x 1.x || 2.x
				return cjsRequire('vertx').runOnLoop || cjsRequire('vertx').runOnContext;
			} catch (ignore) {}

			// capture setTimeout to avoid being caught by fake timers
			// used in time based tests
			var capturedSetTimeout = setTimeout;
			return function (t) {
				capturedSetTimeout(t, 0);
			};
		}(require));
	}

	return nextTick;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

}).call(this,require('_process'))
},{"_process":4}],19:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function array(Promise) {

		var arrayReduce = Array.prototype.reduce;
		var arrayReduceRight = Array.prototype.reduceRight;

		var toPromise = Promise.resolve;
		var all = Promise.all;

		// Additional array combinators

		Promise.any = any;
		Promise.some = some;
		Promise.settle = settle;

		Promise.map = map;
		Promise.filter = filter;
		Promise.reduce = reduce;
		Promise.reduceRight = reduceRight;

		/**
		 * When this promise fulfills with an array, do
		 * onFulfilled.apply(void 0, array)
		 * @param {function} onFulfilled function to apply
		 * @returns {Promise} promise for the result of applying onFulfilled
		 */
		Promise.prototype.spread = function(onFulfilled) {
			return this.then(all).then(function(array) {
				return onFulfilled.apply(void 0, array);
			});
		};

		return Promise;

		/**
		 * One-winner competitive race.
		 * Return a promise that will fulfill when one of the promises
		 * in the input array fulfills, or will reject when all promises
		 * have rejected.
		 * @param {array} promises
		 * @returns {Promise} promise for the first fulfilled value
		 */
		function any(promises) {
			return new Promise(function(resolve, reject) {
				var errors = [];
				var pending = initRace(promises, resolve, handleReject);

				if(pending === 0) {
					reject(new RangeError('any() input must not be empty'));
				}

				function handleReject(e) {
					errors.push(e);
					if(--pending === 0) {
						reject(errors);
					}
				}
			});
		}

		/**
		 * N-winner competitive race
		 * Return a promise that will fulfill when n input promises have
		 * fulfilled, or will reject when it becomes impossible for n
		 * input promises to fulfill (ie when promises.length - n + 1
		 * have rejected)
		 * @param {array} promises
		 * @param {number} n
		 * @returns {Promise} promise for the earliest n fulfillment values
		 *
		 * @deprecated
		 */
		function some(promises, n) {
			return new Promise(function(resolve, reject, notify) {
				var results = [];
				var errors = [];
				var nReject;
				var nFulfill = initRace(promises, handleResolve, handleReject, notify);

				n = Math.max(n, 0);
				nReject = (nFulfill - n + 1);
				nFulfill = Math.min(n, nFulfill);

				if(n > nFulfill) {
					reject(new RangeError('some() input must contain at least '
						+ n + ' element(s), but had ' + nFulfill));
				} else if(nFulfill === 0) {
					resolve(results);
				}

				function handleResolve(x) {
					if(nFulfill > 0) {
						--nFulfill;
						results.push(x);

						if(nFulfill === 0) {
							resolve(results);
						}
					}
				}

				function handleReject(e) {
					if(nReject > 0) {
						--nReject;
						errors.push(e);

						if(nReject === 0) {
							reject(errors);
						}
					}
				}
			});
		}

		/**
		 * Initialize a race observing each promise in the input promises
		 * @param {Array} promises
		 * @param {function} resolve
		 * @param {function} reject
		 * @param {?function=} notify
		 * @returns {Number} actual count of items being raced
		 */
		function initRace(promises, resolve, reject, notify) {
			return arrayReduce.call(promises, function(pending, p) {
				toPromise(p).then(resolve, reject, notify);
				return pending + 1;
			}, 0);
		}

		/**
		 * Apply f to the value of each promise in a list of promises
		 * and return a new list containing the results.
		 * @param {array} promises
		 * @param {function(x:*, index:Number):*} f mapping function
		 * @returns {Promise}
		 */
		function map(promises, f) {
			if(typeof promises !== 'object') {
				return toPromise([]);
			}

			return all(mapArray(function(x, i) {
				return toPromise(x).fold(mapWithIndex, i);
			}, promises));

			function mapWithIndex(k, x) {
				return f(x, k);
			}
		}

		/**
		 * Filter the provided array of promises using the provided predicate.  Input may
		 * contain promises and values
		 * @param {Array} promises array of promises and values
		 * @param {function(x:*, index:Number):boolean} predicate filtering predicate.
		 *  Must return truthy (or promise for truthy) for items to retain.
		 * @returns {Promise} promise that will fulfill with an array containing all items
		 *  for which predicate returned truthy.
		 */
		function filter(promises, predicate) {
			return all(promises).then(function(values) {
				return all(mapArray(predicate, values)).then(function(results) {
					var len = results.length;
					var filtered = new Array(len);
					for(var i=0, j= 0, x; i<len; ++i) {
						x = results[i];
						if(x === void 0 && !(i in results)) {
							continue;
						}
						if(results[i]) {
							filtered[j++] = values[i];
						}
					}
					filtered.length = j;
					return filtered;
				});
			});
		}

		/**
		 * Return a promise that will always fulfill with an array containing
		 * the outcome states of all input promises.  The returned promise
		 * will never reject.
		 * @param {array} promises
		 * @returns {Promise} promise for array of settled state descriptors
		 */
		function settle(promises) {
			return all(mapArray(function(p) {
				p = toPromise(p);
				return p.then(inspect, inspect);

				function inspect() {
					return p.inspect();
				}
			}, promises));
		}

		/**
		 * Reduce an array of promises and values
		 * @param {Array} promises
		 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
		 * @returns {Promise} promise for reduced value
		 */
		function reduce(promises, f) {
			var reducer = makeReducer(f);
			return arguments.length > 2
				? arrayReduce.call(promises, reducer, arguments[2])
				: arrayReduce.call(promises, reducer);
		}

		/**
		 * Reduce an array of promises and values from the right
		 * @param {Array} promises
		 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
		 * @returns {Promise} promise for reduced value
		 */
		function reduceRight(promises, f) {
			var reducer = makeReducer(f);
			return arguments.length > 2
				? arrayReduceRight.call(promises, reducer, arguments[2])
				: arrayReduceRight.call(promises, reducer);
		}

		function makeReducer(f) {
			return function reducer(result, x, i) {
				return toPromise(result).then(function(r) {
					return toPromise(x).then(function(x) {
						return f(r, x, i);
					});
				});
			};
		}

		function mapArray(f, a) {
			var l = a.length;
			var b = new Array(l);
			for(var i=0, x; i<l; ++i) {
				x = a[i];
				if(x === void 0 && !(i in a)) {
					continue;
				}
				b[i] = f(a[i], i);
			}
			return b;
		}
	};



});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],20:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function flow(Promise) {

		var reject = Promise.reject;
		var origCatch = Promise.prototype['catch'];

		/**
		 * Handle the ultimate fulfillment value or rejection reason, and assume
		 * responsibility for all errors.  If an error propagates out of result
		 * or handleFatalError, it will be rethrown to the host, resulting in a
		 * loud stack track on most platforms and a crash on some.
		 * @param {function?} onResult
		 * @param {function?} onError
		 * @returns {undefined}
		 */
		Promise.prototype.done = function(onResult, onError) {
			this._handler.visit(this._handler.receiver, onResult, onError);
		};

		/**
		 * Add Error-type and predicate matching to catch.  Examples:
		 * promise.catch(TypeError, handleTypeError)
		 *   .catch(predicate, handleMatchedErrors)
		 *   .catch(handleRemainingErrors)
		 * @param onRejected
		 * @returns {*}
		 */
		Promise.prototype['catch'] = Promise.prototype.otherwise = function(onRejected) {
			if (arguments.length < 2) {
				return origCatch.call(this, onRejected);
			} else {
				if(typeof onRejected !== 'function') {
					return this.ensure(rejectInvalidPredicate);
				}

				return origCatch.call(this, createCatchFilter(arguments[1], onRejected));
			}
		};

		/**
		 * Wraps the provided catch handler, so that it will only be called
		 * if the predicate evaluates truthy
		 * @param {?function} handler
		 * @param {function} predicate
		 * @returns {function} conditional catch handler
		 */
		function createCatchFilter(handler, predicate) {
			return function(e) {
				return evaluatePredicate(e, predicate)
					? handler.call(this, e)
					: reject(e);
			};
		}

		/**
		 * Ensures that onFulfilledOrRejected will be called regardless of whether
		 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
		 * receive the promises' value or reason.  Any returned value will be disregarded.
		 * onFulfilledOrRejected may throw or return a rejected promise to signal
		 * an additional error.
		 * @param {function} handler handler to be called regardless of
		 *  fulfillment or rejection
		 * @returns {Promise}
		 */
		Promise.prototype['finally'] = Promise.prototype.ensure = function(handler) {
			if(typeof handler !== 'function') {
				return this;
			}

			var isolated = isolate(handler);
			return this.then(isolated, isolated)['yield'](this);
		};

		/**
		 * Recover from a failure by returning a defaultValue.  If defaultValue
		 * is a promise, it's fulfillment value will be used.  If defaultValue is
		 * a promise that rejects, the returned promise will reject with the
		 * same reason.
		 * @param {*} defaultValue
		 * @returns {Promise} new promise
		 */
		Promise.prototype['else'] = Promise.prototype.orElse = function(defaultValue) {
			return this.then(void 0, function() {
				return defaultValue;
			});
		};

		/**
		 * Shortcut for .then(function() { return value; })
		 * @param  {*} value
		 * @return {Promise} a promise that:
		 *  - is fulfilled if value is not a promise, or
		 *  - if value is a promise, will fulfill with its value, or reject
		 *    with its reason.
		 */
		Promise.prototype['yield'] = function(value) {
			return this.then(function() {
				return value;
			});
		};

		/**
		 * Runs a side effect when this promise fulfills, without changing the
		 * fulfillment value.
		 * @param {function} onFulfilledSideEffect
		 * @returns {Promise}
		 */
		Promise.prototype.tap = function(onFulfilledSideEffect) {
			return this.then(onFulfilledSideEffect)['yield'](this);
		};

		return Promise;
	};

	function rejectInvalidPredicate() {
		throw new TypeError('catch predicate must be a function');
	}

	function evaluatePredicate(e, predicate) {
		return isError(predicate) ? e instanceof predicate : predicate(e);
	}

	function isError(predicate) {
		return predicate === Error
			|| (predicate != null && predicate.prototype instanceof Error);
	}

	function isolate(f) {
		return function() {
			return f.call(this);
		};
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],21:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @author Jeff Escalante */

(function(define) { 'use strict';
define(function() {

	return function fold(Promise) {

		Promise.prototype.fold = function(f, z) {
			var promise = this._beget();

			this._handler.fold(function(z, x, to) {
				Promise._handler(z).fold(function(x, z, to) {
					to.resolve(f.call(this, z, x));
				}, x, this, to);
			}, z, promise._handler.receiver, promise._handler);

			return promise;
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],22:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function inspection(Promise) {

		Promise.prototype.inspect = function() {
			return inspect(Promise._handler(this));
		};

		function inspect(handler) {
			var state = handler.state();

			if(state === 0) {
				return { state: 'pending' };
			}

			if(state > 0) {
				return { state: 'fulfilled', value: handler.value };
			}

			return { state: 'rejected', reason: handler.value };
		}

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],23:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function generate(Promise) {

		var resolve = Promise.resolve;

		Promise.iterate = iterate;
		Promise.unfold = unfold;

		return Promise;

		/**
		 * Generate a (potentially infinite) stream of promised values:
		 * x, f(x), f(f(x)), etc. until condition(x) returns true
		 * @param {function} f function to generate a new x from the previous x
		 * @param {function} condition function that, given the current x, returns
		 *  truthy when the iterate should stop
		 * @param {function} handler function to handle the value produced by f
		 * @param {*|Promise} x starting value, may be a promise
		 * @return {Promise} the result of the last call to f before
		 *  condition returns true
		 */
		function iterate(f, condition, handler, x) {
			return unfold(function(x) {
				return [x, f(x)];
			}, condition, handler, x);
		}

		/**
		 * Generate a (potentially infinite) stream of promised values
		 * by applying handler(generator(seed)) iteratively until
		 * condition(seed) returns true.
		 * @param {function} unspool function that generates a [value, newSeed]
		 *  given a seed.
		 * @param {function} condition function that, given the current seed, returns
		 *  truthy when the unfold should stop
		 * @param {function} handler function to handle the value produced by unspool
		 * @param x {*|Promise} starting value, may be a promise
		 * @return {Promise} the result of the last value produced by unspool before
		 *  condition returns true
		 */
		function unfold(unspool, condition, handler, x) {
			return resolve(x).then(function(seed) {
				return resolve(condition(seed)).then(function(done) {
					return done ? seed : resolve(unspool(seed)).spread(next);
				});
			});

			function next(item, newSeed) {
				return resolve(handler(item)).then(function() {
					return unfold(unspool, condition, handler, newSeed);
				});
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],24:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function progress(Promise) {

		/**
		 * Register a progress handler for this promise
		 * @param {function} onProgress
		 * @returns {Promise}
		 */
		Promise.prototype.progress = function(onProgress) {
			return this.then(void 0, void 0, onProgress);
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],25:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var timer = require('../timer');
	var TimeoutError = require('../TimeoutError');

	function setTimeout(f, ms, x, y) {
		return timer.set(function() {
			f(x, y, ms);
		}, ms);
	}

	return function timed(Promise) {
		/**
		 * Return a new promise whose fulfillment value is revealed only
		 * after ms milliseconds
		 * @param {number} ms milliseconds
		 * @returns {Promise}
		 */
		Promise.prototype.delay = function(ms) {
			var p = this._beget();
			this._handler.fold(handleDelay, ms, void 0, p._handler);
			return p;
		};

		function handleDelay(ms, x, h) {
			setTimeout(resolveDelay, ms, x, h);
		}

		function resolveDelay(x, h) {
			h.resolve(x);
		}

		/**
		 * Return a new promise that rejects after ms milliseconds unless
		 * this promise fulfills earlier, in which case the returned promise
		 * fulfills with the same value.
		 * @param {number} ms milliseconds
		 * @param {Error|*=} reason optional rejection reason to use, defaults
		 *   to a TimeoutError if not provided
		 * @returns {Promise}
		 */
		Promise.prototype.timeout = function(ms, reason) {
			var p = this._beget();
			var h = p._handler;

			var t = setTimeout(onTimeout, ms, reason, p._handler);

			this._handler.visit(h,
				function onFulfill(x) {
					timer.clear(t);
					this.resolve(x); // this = h
				},
				function onReject(x) {
					timer.clear(t);
					this.reject(x); // this = h
				},
				h.notify);

			return p;
		};

		function onTimeout(reason, h, ms) {
			var e = typeof reason === 'undefined'
				? new TimeoutError('timed out after ' + ms + 'ms')
				: reason;
			h.reject(e);
		}

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../TimeoutError":17,"../timer":29}],26:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var timer = require('../timer');

	return function unhandledRejection(Promise) {
		var logError = noop;
		var logInfo = noop;

		if(typeof console !== 'undefined') {
			logError = typeof console.error !== 'undefined'
				? function (e) { console.error(e); }
				: function (e) { console.log(e); };

			logInfo = typeof console.info !== 'undefined'
				? function (e) { console.info(e); }
				: function (e) { console.log(e); };
		}

		Promise.onPotentiallyUnhandledRejection = function(rejection) {
			enqueue(report, rejection);
		};

		Promise.onPotentiallyUnhandledRejectionHandled = function(rejection) {
			enqueue(unreport, rejection);
		};

		Promise.onFatalRejection = function(rejection) {
			enqueue(throwit, rejection.value);
		};

		var tasks = [];
		var reported = [];
		var running = false;

		function report(r) {
			if(!r.handled) {
				reported.push(r);
				logError('Potentially unhandled rejection [' + r.id + '] ' + formatError(r.value));
			}
		}

		function unreport(r) {
			var i = reported.indexOf(r);
			if(i >= 0) {
				reported.splice(i, 1);
				logInfo('Handled previous rejection [' + r.id + '] ' + formatObject(r.value));
			}
		}

		function enqueue(f, x) {
			tasks.push(f, x);
			if(!running) {
				running = true;
				running = timer.set(flush, 0);
			}
		}

		function flush() {
			running = false;
			while(tasks.length > 0) {
				tasks.shift()(tasks.shift());
			}
		}

		return Promise;
	};

	function formatError(e) {
		var s = typeof e === 'object' && e.stack ? e.stack : formatObject(e);
		return e instanceof Error ? s : s + ' (WARNING: non-Error used)';
	}

	function formatObject(o) {
		var s = String(o);
		if(s === '[object Object]' && typeof JSON !== 'undefined') {
			s = tryStringify(o, s);
		}
		return s;
	}

	function tryStringify(e, defaultValue) {
		try {
			return JSON.stringify(e);
		} catch(e) {
			// Ignore. Cannot JSON.stringify e, stick with String(e)
			return defaultValue;
		}
	}

	function throwit(e) {
		throw e;
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../timer":29}],27:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function addWith(Promise) {
		/**
		 * Returns a promise whose handlers will be called with `this` set to
		 * the supplied receiver.  Subsequent promises derived from the
		 * returned promise will also have their handlers called with receiver
		 * as `this`. Calling `with` with undefined or no arguments will return
		 * a promise whose handlers will again be called in the usual Promises/A+
		 * way (no `this`) thus safely undoing any previous `with` in the
		 * promise chain.
		 *
		 * WARNING: Promises returned from `with`/`withThis` are NOT Promises/A+
		 * compliant, specifically violating 2.2.5 (http://promisesaplus.com/#point-41)
		 *
		 * @param {object} receiver `this` value for all handlers attached to
		 *  the returned promise.
		 * @returns {Promise}
		 */
		Promise.prototype['with'] = Promise.prototype.withThis = function(receiver) {
			var p = this._beget();
			var child = p._handler;
			child.receiver = receiver;
			this._handler.chain(child, receiver);
			return p;
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));


},{}],28:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver, handler) {
			this._handler = resolver === Handler ? handler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {Pending}
		 */
		function init(resolver) {
			var handler = new Pending();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;
		Promise._handler = getHandler;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return isPromise(x) ? x
				: new Promise(Handler, new Async(getHandler(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return new Promise(Handler, new Async(new Rejected(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {Promise}
		 */
		function defer() {
			return new Promise(Handler, new Pending());
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param {function=} onFulfilled fulfillment handler
		 * @param {function=} onRejected rejection handler
		 * @deprecated @param {function=} onProgress progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected) {
			var parent = this._handler;

			if (typeof onFulfilled !== 'function' && parent.join().state() > 0) {
				// Short circuit: value will not change, simply share handler
				return new Promise(Handler, parent);
			}

			var p = this._beget();
			var child = p._handler;

			parent.chain(child, parent.receiver, onFulfilled, onRejected,
					arguments.length > 2 ? arguments[2] : void 0);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			var parent = this._handler;
			var child = new Pending(parent.receiver, parent.join().context);
			return new this.constructor(Handler, child);
		};

		// Array combinators

		Promise.all = all;
		Promise.race = race;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			/*jshint maxcomplexity:8*/
			var resolver = new Pending();
			var pending = promises.length >>> 0;
			var results = new Array(pending);

			var i, h, x, s;
			for (i = 0; i < promises.length; ++i) {
				x = promises[i];

				if (x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				if (maybeThenable(x)) {
					h = isPromise(x)
						? x._handler.join()
						: getHandlerUntrusted(x);

					s = h.state();
					if (s === 0) {
						h.fold(settleAt, i, results, resolver);
					} else if (s > 0) {
						results[i] = h.value;
						--pending;
					} else {
						resolver.become(h);
						break;
					}

				} else {
					results[i] = x;
					--pending;
				}
			}

			if(pending === 0) {
				resolver.become(new Fulfilled(results));
			}

			return new Promise(Handler, resolver);

			function settleAt(i, x, resolver) {
				/*jshint validthis:true*/
				this[i] = x;
				if(--pending === 0) {
					resolver.become(new Fulfilled(this));
				}
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			if(Object(promises) === promises && promises.length === 0) {
				return never();
			}

			var h = new Pending();
			var i, x;
			for(i=0; i<promises.length; ++i) {
				x = promises[i];
				if (x !== void 0 && i in promises) {
					getHandler(x).visit(h, h.resolve, h.reject);
				}
			}
			return new Promise(Handler, h);
		}

		// Promise internals
		// Below this, everything is @private

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandler(x) {
			if(isPromise(x)) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new Thenable(untrustedThen, x)
					: new Fulfilled(x);
			} catch(e) {
				return new Rejected(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @constructor
		 */
		function Handler() {}

		Handler.prototype.when
			= Handler.prototype.become
			= Handler.prototype.notify
			= Handler.prototype.fail
			= Handler.prototype._unreport
			= Handler.prototype._report
			= noop;

		Handler.prototype._state = 0;

		Handler.prototype.state = function() {
			return this._state;
		};

		/**
		 * Recursively collapse handler chain to find the handler
		 * nearest to the fully resolved value.
		 * @returns {object} handler nearest the fully resolved value
		 */
		Handler.prototype.join = function() {
			var h = this;
			while(h.handler !== void 0) {
				h = h.handler;
			}
			return h;
		};

		Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
			this.when({
				resolver: to,
				receiver: receiver,
				fulfilled: fulfilled,
				rejected: rejected,
				progress: progress
			});
		};

		Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
			this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
		};

		Handler.prototype.fold = function(f, z, c, to) {
			this.visit(to, function(x) {
				f.call(c, z, x, this);
			}, to.reject, to.notify);
		};

		/**
		 * Handler that invokes fail() on any handler it becomes
		 * @constructor
		 */
		function FailIfRejected() {}

		inherit(Handler, FailIfRejected);

		FailIfRejected.prototype.become = function(h) {
			h.fail();
		};

		var failIfRejected = new FailIfRejected();

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @constructor
		 */
		function Pending(receiver, inheritedContext) {
			Promise.createContext(this, inheritedContext);

			this.consumers = void 0;
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
		}

		inherit(Handler, Pending);

		Pending.prototype._state = 0;

		Pending.prototype.resolve = function(x) {
			this.become(getHandler(x));
		};

		Pending.prototype.reject = function(x) {
			if(this.resolved) {
				return;
			}

			this.become(new Rejected(x));
		};

		Pending.prototype.join = function() {
			if (!this.resolved) {
				return this;
			}

			var h = this;

			while (h.handler !== void 0) {
				h = h.handler;
				if (h === this) {
					return this.handler = cycle();
				}
			}

			return h;
		};

		Pending.prototype.run = function() {
			var q = this.consumers;
			var handler = this.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; ++i) {
				handler.when(q[i]);
			}
		};

		Pending.prototype.become = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			if(this.consumers !== void 0) {
				tasks.enqueue(this);
			}

			if(this.context !== void 0) {
				handler._report(this.context);
			}
		};

		Pending.prototype.when = function(continuation) {
			if(this.resolved) {
				tasks.enqueue(new ContinuationTask(continuation, this.handler));
			} else {
				if(this.consumers === void 0) {
					this.consumers = [continuation];
				} else {
					this.consumers.push(continuation);
				}
			}
		};

		Pending.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(x, this));
			}
		};

		Pending.prototype.fail = function(context) {
			var c = typeof context === 'undefined' ? this.context : context;
			this.resolved && this.handler.join().fail(c);
		};

		Pending.prototype._report = function(context) {
			this.resolved && this.handler.join()._report(context);
		};

		Pending.prototype._unreport = function() {
			this.resolved && this.handler.join()._unreport();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @param {object} handler
		 * @constructor
		 */
		function Async(handler) {
			this.handler = handler;
		}

		inherit(Handler, Async);

		Async.prototype.when = function(continuation) {
			tasks.enqueue(new ContinuationTask(continuation, this));
		};

		Async.prototype._report = function(context) {
			this.join()._report(context);
		};

		Async.prototype._unreport = function() {
			this.join()._unreport();
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function Thenable(then, thenable) {
			Pending.call(this);
			tasks.enqueue(new AssimilateTask(then, thenable, this));
		}

		inherit(Pending, Thenable);

		/**
		 * Handler for a fulfilled promise
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function Fulfilled(x) {
			Promise.createContext(this);
			this.value = x;
		}

		inherit(Handler, Fulfilled);

		Fulfilled.prototype._state = 1;

		Fulfilled.prototype.fold = function(f, z, c, to) {
			runContinuation3(f, z, this, c, to);
		};

		Fulfilled.prototype.when = function(cont) {
			runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
		};

		var errorId = 0;

		/**
		 * Handler for a rejected promise
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function Rejected(x) {
			Promise.createContext(this);

			this.id = ++errorId;
			this.value = x;
			this.handled = false;
			this.reported = false;

			this._report();
		}

		inherit(Handler, Rejected);

		Rejected.prototype._state = -1;

		Rejected.prototype.fold = function(f, z, c, to) {
			to.become(this);
		};

		Rejected.prototype.when = function(cont) {
			if(typeof cont.rejected === 'function') {
				this._unreport();
			}
			runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
		};

		Rejected.prototype._report = function(context) {
			tasks.afterQueue(new ReportTask(this, context));
		};

		Rejected.prototype._unreport = function() {
			this.handled = true;
			tasks.afterQueue(new UnreportTask(this));
		};

		Rejected.prototype.fail = function(context) {
			Promise.onFatalRejection(this, context === void 0 ? this.context : context);
		};

		function ReportTask(rejection, context) {
			this.rejection = rejection;
			this.context = context;
		}

		ReportTask.prototype.run = function() {
			if(!this.rejection.handled) {
				this.rejection.reported = true;
				Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
			}
		};

		function UnreportTask(rejection) {
			this.rejection = rejection;
		}

		UnreportTask.prototype.run = function() {
			if(this.rejection.reported) {
				Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
			}
		};

		// Unhandled rejection hooks
		// By default, everything is a noop

		// TODO: Better names: "annotate"?
		Promise.createContext
			= Promise.enterContext
			= Promise.exitContext
			= Promise.onPotentiallyUnhandledRejection
			= Promise.onPotentiallyUnhandledRejectionHandled
			= Promise.onFatalRejection
			= noop;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

		function cycle() {
			return new Rejected(new TypeError('Promise cycle'));
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @constructor
		 */
		function ContinuationTask(continuation, handler) {
			this.continuation = continuation;
			this.handler = handler;
		}

		ContinuationTask.prototype.run = function() {
			this.handler.join().when(this.continuation);
		};

		/**
		 * Run a queue of progress handlers
		 * @constructor
		 */
		function ProgressTask(value, handler) {
			this.handler = handler;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.handler.consumers;
			if(q === void 0) {
				return;
			}

			for (var c, i = 0; i < q.length; ++i) {
				c = q[i];
				runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
			}
		};

		/**
		 * Assimilate a thenable, sending it's value to resolver
		 * @param {function} then
		 * @param {object|function} thenable
		 * @param {object} resolver
		 * @constructor
		 */
		function AssimilateTask(then, thenable, resolver) {
			this._then = then;
			this.thenable = thenable;
			this.resolver = resolver;
		}

		AssimilateTask.prototype.run = function() {
			var h = this.resolver;
			tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		function tryAssimilate(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		}

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} true iff x is a trusted Promise
		 */
		function isPromise(x) {
			return x instanceof Promise;
		}

		/**
		 * Test just enough to rule out primitives, in order to take faster
		 * paths in some code
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function runContinuation1(f, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject(f, h.value, receiver, next);
			Promise.exitContext();
		}

		function runContinuation3(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject3(f, x, h.value, receiver, next);
			Promise.exitContext();
		}

		function runNotify(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.notify(x);
			}

			Promise.enterContext(h);
			tryCatchReturn(f, x, receiver, next);
			Promise.exitContext();
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 */
		function tryCatchReject(f, x, thisArg, next) {
			try {
				next.become(getHandler(f.call(thisArg, x)));
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Same as above, but includes the extra argument parameter.
		 */
		function tryCatchReject3(f, x, y, thisArg, next) {
			try {
				f.call(thisArg, x, y, next);
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 */
		function tryCatchReturn(f, x, thisArg, next) {
			try {
				next.notify(f.call(thisArg, x));
			} catch(e) {
				next.notify(e);
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function noop() {}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],29:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {
	/*global setTimeout,clearTimeout*/
	var cjsRequire, vertx, setTimer, clearTimer;

	cjsRequire = require;

	try {
		vertx = cjsRequire('vertx');
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		clearTimer = vertx.cancelTimer;
	} catch (e) {
		setTimer = function(f, ms) { return setTimeout(f, ms); };
		clearTimer = function(t) { return clearTimeout(t); };
	}

	return {
		set: setTimer,
		clear: clearTimer
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{}],30:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */

/**
 * Promises/A+ and when() implementation
 * when is part of the cujoJS family of libraries (http://cujojs.com/)
 * @author Brian Cavalier
 * @author John Hann
 * @version 3.4.3
 */
(function(define) { 'use strict';
define(function (require) {

	var timed = require('./lib/decorators/timed');
	var array = require('./lib/decorators/array');
	var flow = require('./lib/decorators/flow');
	var fold = require('./lib/decorators/fold');
	var inspect = require('./lib/decorators/inspect');
	var generate = require('./lib/decorators/iterate');
	var progress = require('./lib/decorators/progress');
	var withThis = require('./lib/decorators/with');
	var unhandledRejection = require('./lib/decorators/unhandledRejection');
	var TimeoutError = require('./lib/TimeoutError');

	var Promise = [array, flow, fold, generate, progress,
		inspect, withThis, timed, unhandledRejection]
		.reduce(function(Promise, feature) {
			return feature(Promise);
		}, require('./lib/Promise'));

	var slice = Array.prototype.slice;

	// Public API

	when.promise     = promise;              // Create a pending promise
	when.resolve     = Promise.resolve;      // Create a resolved promise
	when.reject      = Promise.reject;       // Create a rejected promise

	when.lift        = lift;                 // lift a function to return promises
	when['try']      = attempt;              // call a function and return a promise
	when.attempt     = attempt;              // alias for when.try

	when.iterate     = Promise.iterate;      // Generate a stream of promises
	when.unfold      = Promise.unfold;       // Generate a stream of promises

	when.join        = join;                 // Join 2 or more promises

	when.all         = all;                  // Resolve a list of promises
	when.settle      = settle;               // Settle a list of promises

	when.any         = lift(Promise.any);    // One-winner race
	when.some        = lift(Promise.some);   // Multi-winner race
	when.race        = lift(Promise.race);   // First-to-settle race

	when.map         = map;                  // Array.map() for promises
	when.filter      = filter;               // Array.filter() for promises
	when.reduce      = reduce;               // Array.reduce() for promises
	when.reduceRight = reduceRight;          // Array.reduceRight() for promises

	when.isPromiseLike = isPromiseLike;      // Is something promise-like, aka thenable

	when.Promise     = Promise;              // Promise constructor
	when.defer       = defer;                // Create a {promise, resolve, reject} tuple

	// Error types

	when.TimeoutError = TimeoutError;

	/**
	 * Get a trusted promise for x, or by transforming x with onFulfilled
	 *
	 * @param {*} x
	 * @param {function?} onFulfilled callback to be called when x is
	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {function?} onRejected callback to be called when x is
	 *   rejected.
	 * @param {function?} onProgress callback to be called when progress updates
	 *   are issued for x. @deprecated
	 * @returns {Promise} a new promise that will fulfill with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(x, onFulfilled, onRejected) {
		var p = Promise.resolve(x);
		if(arguments.length < 2) {
			return p;
		}

		return arguments.length > 3
			? p.then(onFulfilled, onRejected, arguments[3])
			: p.then(onFulfilled, onRejected);
	}

	/**
	 * Creates a new promise whose fate is determined by resolver.
	 * @param {function} resolver function(resolve, reject, notify)
	 * @returns {Promise} promise whose fate is determine by resolver
	 */
	function promise(resolver) {
		return new Promise(resolver);
	}

	/**
	 * Lift the supplied function, creating a version of f that returns
	 * promises, and accepts promises as arguments.
	 * @param {function} f
	 * @returns {Function} version of f that returns promises
	 */
	function lift(f) {
		return function() {
			return _apply(f, this, slice.call(arguments));
		};
	}

	/**
	 * Call f in a future turn, with the supplied args, and return a promise
	 * for the result.
	 * @param {function} f
	 * @returns {Promise}
	 */
	function attempt(f /*, args... */) {
		/*jshint validthis:true */
		return _apply(f, this, slice.call(arguments, 1));
	}

	/**
	 * try/lift helper that allows specifying thisArg
	 * @private
	 */
	function _apply(f, thisArg, args) {
		return Promise.all(args).then(function(args) {
			return f.apply(thisArg, args);
		});
	}

	/**
	 * Creates a {promise, resolver} pair, either or both of which
	 * may be given out safely to consumers.
	 * @return {{promise: Promise, resolve: function, reject: function, notify: function}}
	 */
	function defer() {
		return new Deferred();
	}

	function Deferred() {
		var p = Promise._defer();

		function resolve(x) { p._handler.resolve(x); }
		function reject(x) { p._handler.reject(x); }
		function notify(x) { p._handler.notify(x); }

		this.promise = p;
		this.resolve = resolve;
		this.reject = reject;
		this.notify = notify;
		this.resolver = { resolve: resolve, reject: reject, notify: notify };
	}

	/**
	 * Determines if x is promise-like, i.e. a thenable object
	 * NOTE: Will return true for *any thenable object*, and isn't truly
	 * safe, since it may attempt to access the `then` property of x (i.e.
	 *  clever/malicious getters may do weird things)
	 * @param {*} x anything
	 * @returns {boolean} true if x is promise-like
	 */
	function isPromiseLike(x) {
		return x && typeof x.then === 'function';
	}

	/**
	 * Return a promise that will resolve only once all the supplied arguments
	 * have resolved. The resolution value of the returned promise will be an array
	 * containing the resolution values of each of the arguments.
	 * @param {...*} arguments may be a mix of promises and values
	 * @returns {Promise}
	 */
	function join(/* ...promises */) {
		return Promise.all(arguments);
	}

	/**
	 * Return a promise that will fulfill once all input promises have
	 * fulfilled, or reject when any one input promise rejects.
	 * @param {array|Promise} promises array (or promise for an array) of promises
	 * @returns {Promise}
	 */
	function all(promises) {
		return when(promises, Promise.all);
	}

	/**
	 * Return a promise that will always fulfill with an array containing
	 * the outcome states of all input promises.  The returned promise
	 * will only reject if `promises` itself is a rejected promise.
	 * @param {array|Promise} promises array (or promise for an array) of promises
	 * @returns {Promise} promise for array of settled state descriptors
	 */
	function settle(promises) {
		return when(promises, Promise.settle);
	}

	/**
	 * Promise-aware array map function, similar to `Array.prototype.map()`,
	 * but input array may contain promises or values.
	 * @param {Array|Promise} promises array of anything, may contain promises and values
	 * @param {function(x:*, index:Number):*} mapFunc map function which may
	 *  return a promise or value
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function map(promises, mapFunc) {
		return when(promises, function(promises) {
			return Promise.map(promises, mapFunc);
		});
	}

	/**
	 * Filter the provided array of promises using the provided predicate.  Input may
	 * contain promises and values
	 * @param {Array|Promise} promises array of promises and values
	 * @param {function(x:*, index:Number):boolean} predicate filtering predicate.
	 *  Must return truthy (or promise for truthy) for items to retain.
	 * @returns {Promise} promise that will fulfill with an array containing all items
	 *  for which predicate returned truthy.
	 */
	function filter(promises, predicate) {
		return when(promises, function(promises) {
			return Promise.filter(promises, predicate);
		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 * @param {Array|Promise} promises array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduce(promises, f /*, initialValue */) {
		/*jshint unused:false*/
		var args = slice.call(arguments, 1);
		return when(promises, function(array) {
			args.unshift(array);
			return Promise.reduce.apply(Promise, args);
		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduceRight()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 * @param {Array|Promise} promises array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduceRight(promises, f /*, initialValue */) {
		/*jshint unused:false*/
		var args = slice.call(arguments, 1);
		return when(promises, function(array) {
			args.unshift(array);
			return Promise.reduceRight.apply(Promise, args);
		});
	}

	return when;
});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./lib/Promise":14,"./lib/TimeoutError":17,"./lib/decorators/array":19,"./lib/decorators/flow":20,"./lib/decorators/fold":21,"./lib/decorators/inspect":22,"./lib/decorators/iterate":23,"./lib/decorators/progress":24,"./lib/decorators/timed":25,"./lib/decorators/unhandledRejection":26,"./lib/decorators/with":27}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL21haW4uanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9qcy9hcHAuanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9qcy9zdG9wc184MDFfMS5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9ub2RlX21vZHVsZXMvZ2VvbGliL2Rpc3QvZ2VvbGliLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL2xlYWZsZXQvZGlzdC9sZWFmbGV0LXNyYy5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy90aGVuLXJlcXVlc3QvYnJvd3Nlci5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy90aGVuLXJlcXVlc3QvbGliL2hhbmRsZS1xcy5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy90aGVuLXJlcXVlc3Qvbm9kZV9tb2R1bGVzL2h0dHAtcmVzcG9uc2Utb2JqZWN0L2luZGV4LmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3RoZW4tcmVxdWVzdC9ub2RlX21vZHVsZXMvcHJvbWlzZS9jb3JlLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3RoZW4tcmVxdWVzdC9ub2RlX21vZHVsZXMvcHJvbWlzZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy90aGVuLXJlcXVlc3Qvbm9kZV9tb2R1bGVzL3Byb21pc2Uvbm9kZV9tb2R1bGVzL2FzYXAvYXNhcC5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy90aGVuLXJlcXVlc3Qvbm9kZV9tb2R1bGVzL3FzL2luZGV4LmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL1Byb21pc2UuanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9ub2RlX21vZHVsZXMvd2hlbi9saWIvUXVldWUuanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9ub2RlX21vZHVsZXMvd2hlbi9saWIvU2NoZWR1bGVyLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL1RpbWVvdXRFcnJvci5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy93aGVuL2xpYi9hc3luYy5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy93aGVuL2xpYi9kZWNvcmF0b3JzL2FycmF5LmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL2RlY29yYXRvcnMvZmxvdy5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy93aGVuL2xpYi9kZWNvcmF0b3JzL2ZvbGQuanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9ub2RlX21vZHVsZXMvd2hlbi9saWIvZGVjb3JhdG9ycy9pbnNwZWN0LmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL2RlY29yYXRvcnMvaXRlcmF0ZS5qcyIsIi9Vc2Vycy9kYXJyZWxsL0RvY3VtZW50cy9kZXYvT3BlbkRhdGFQb3J0YWxBdXN0aW5EZW1vL25vZGVfbW9kdWxlcy93aGVuL2xpYi9kZWNvcmF0b3JzL3Byb2dyZXNzLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL2RlY29yYXRvcnMvdGltZWQuanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9ub2RlX21vZHVsZXMvd2hlbi9saWIvZGVjb3JhdG9ycy91bmhhbmRsZWRSZWplY3Rpb24uanMiLCIvVXNlcnMvZGFycmVsbC9Eb2N1bWVudHMvZGV2L09wZW5EYXRhUG9ydGFsQXVzdGluRGVtby9ub2RlX21vZHVsZXMvd2hlbi9saWIvZGVjb3JhdG9ycy93aXRoLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL21ha2VQcm9taXNlLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vbGliL3RpbWVyLmpzIiwiL1VzZXJzL2RhcnJlbGwvRG9jdW1lbnRzL2Rldi9PcGVuRGF0YVBvcnRhbEF1c3RpbkRlbW8vbm9kZV9tb2R1bGVzL3doZW4vd2hlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzduQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbndCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG5cbnZhciBhcHAgPSB3aW5kb3cuYXBwID0gbmV3IEFwcCgpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG4gICAgYXBwLnN0YXJ0KCk7XG59KTtcbiIsInZhciBMID0gcmVxdWlyZSgnbGVhZmxldCcpO1xudmFyIHdoZW4gPSByZXF1aXJlKCd3aGVuJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3RoZW4tcmVxdWVzdCcpO1xudmFyIGdlb2xpYiA9IHJlcXVpcmUoJ2dlb2xpYicpO1xudmFyIHN0b3BzID0gcmVxdWlyZSgnLi9zdG9wc184MDFfMScpO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG4gICAgdGhpcy5tYXAgPSBudWxsO1xuICAgIHRoaXMubGF0bG5nID0gbnVsbDtcbiAgICB0aGlzLl9yZXN0YXVyYW50RGF0YSA9IG51bGw7XG4gICAgdGhpcy5taW5TY29yZSA9IDMwO1xuICAgIHRoaXMubWF4U2NvcmUgPSA2MDtcbn1cblxuQXBwLnByb3RvdHlwZSA9IHtcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcpLnNldFZpZXcoWzMwLjI2NzE1MywgLTk3Ljc0MzA2MV0sIDEyKTtcblxuICAgICAgICBMLkljb24uRGVmYXVsdC5pbWFnZVBhdGggPSAnaHR0cDovL2FwaS50aWxlcy5tYXBib3guY29tL21hcGJveC5qcy92MS4wLjBiZXRhMC4wL2ltYWdlcyc7XG5cbiAgICAgICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly9vdGlsZXtzfS5tcWNkbi5jb20vdGlsZXMvMS4wLjAvbWFwL3t6fS97eH0ve3l9LmpwZWcnLCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGlvbjogJzxhIGhyZWY9XCJodHRwOi8vd3d3Lm1hcHF1ZXN0LmNvbS9cIj5UaWxlczwvYT4gfCA8YSBocmVmPVwiaHR0cDovL29wZW5zdHJlZXRtYXAub3JnXCI+TWFwIGRhdGE8L2E+LCA8YSBocmVmPVwiaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnktc2EvMi4wL1wiPmNvbnRyaWJ1dG9yczwvYT4nLFxuICAgICAgICAgICAgc3ViZG9tYWluczogJzEyMzQnXG4gICAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuICAgICAgICB0aGlzLm1hcC5sb2NhdGUoKTtcblxuICAgICAgICB0aGlzLm1hcC5vbignbG9jYXRpb25mb3VuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sYXRsbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhdGxuZyA9IFszMC4yNjcxNTMsIC05Ny43NDMwNjFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYXRsbmcgPSBlLmxhdGxuZztcblxuICAgICAgICAgICAgTC5jaXJjbGVNYXJrZXIodGhpcy5sYXRsbmcpLmFkZFRvKHRoaXMubWFwKVxuICAgICAgICAgICAgICAgIC5iaW5kUG9wdXAoJ3UgciBoZXJlPycpXG4gICAgICAgICAgICAgICAgLm9wZW5Qb3B1cCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHN0b3BzLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IDMsXG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmVkJyxcbiAgICAgICAgICAgICAgICBmaWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHJhZGl1czogMTIsXG4gICAgICAgICAgICAgICAgekluZGV4T2Zmc2V0OiAxXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgbWFya2VyID0gTC5jaXJjbGVNYXJrZXIoW3Muc3RvcF9sYXQsIHMuc3RvcF9sb25dLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgdmFyIHJlc3RhdXJhbnREYXRhR2V0dGVyID0gdGhpcy5yZXN0YXVyYW50RGF0YS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRyYXdSZXN0YXVyYW50ID0gdGhpcy5kcmF3UmVzdGF1cmFudC5iaW5kKHRoaXMpO1xuXG4gICAgICAgICAgICBtYXJrZXIub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhdCA9IHRoaXMuX2xhdGxuZy5sYXQ7XG4gICAgICAgICAgICAgICAgdmFyIGxuZyA9IHRoaXMuX2xhdGxuZy5sbmc7XG5cbiAgICAgICAgICAgICAgICByZXN0YXVyYW50RGF0YUdldHRlcigpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRzRGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4ubGF0aXR1ZGUgPSBuLmFkZHJlc3MubGF0aXR1ZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBuLmxvbmdpdHVkZSA9IG4uYWRkcmVzcy5sb25naXR1ZGU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvc2VzdCA9IGdlb2xpYi5maW5kTmVhcmVzdCh7bGF0aXR1ZGU6IGxhdCwgbG9uZ2l0dWRlOiBsbmd9LCBjb29yZHNEYXRhLCAwLCAzKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QuZm9yRWFjaChmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5zcGVjdGlvbkRhdGEgPSBkYXRhW051bWJlcihjLmtleSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd1Jlc3RhdXJhbnQoaW5zcGVjdGlvbkRhdGEsIGMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1hcmtlci5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICByZXN0YXVyYW50RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IHdoZW4uZGVmZXIoKSxcbiAgICAgICAgICAgIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgICAgIGlmICghdGhpcy5fcmVzdGF1cmFudERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFJlc3RhdXJhbnREYXRhKHRoaXMubWluU2NvcmUsIHRoaXMubWF4U2NvcmUpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXN0YXVyYW50RGF0YSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9yZXN0YXVyYW50RGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnWmVybyByZXN0YXVyYW50cyB3aXRoIHNjb3JlIGJldHdlZW4gJyArIHRoaXMubWluU2NvcmUgKyAnIGFuZCAnICsgdGhpcy5tYXhTY29yZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRoaXMuX3Jlc3RhdXJhbnREYXRhKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodGhpcy5fcmVzdGF1cmFudERhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfSxcbiAgICBsb2FkUmVzdGF1cmFudERhdGE6IGZ1bmN0aW9uKG1pblNjb3JlLCBtYXhTY29yZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSB3aGVuLmRlZmVyKCk7XG4gICAgICAgIHZhciByID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHZhciBkYXRhID0gbnVsbDtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gJyR3aGVyZT1zY29yZSA+ICcgKyBtaW5TY29yZSArICcgQU5EIHNjb3JlIDwgJyArIG1heFNjb3JlO1xuXG4gICAgICAgIHIub3BlbignR0VUJywgJ2h0dHA6Ly9kYXRhLmF1c3RpbnRleGFzLmdvdi9yZXNvdXJjZS9lY212LTl4eGkuanNvbj8nICsgcXVlcnksIHRydWUpO1xuXG4gICAgICAgIHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoci5zdGF0dXMgPj0gMjAwICYmIHIuc3RhdHVzIDwgNDAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyLnN0YXR1cywgci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgfTtcblxuICAgICAgICByLnNlbmQoKTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGRyYXdSZXN0YXVyYW50OiBmdW5jdGlvbihpbnNwZWN0aW9uRGF0YSwgZ2VvRGF0YSkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHdlaWdodDogMyxcbiAgICAgICAgICAgIGZpbGxDb2xvcjogJ2JsdWUnLFxuICAgICAgICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAxLFxuICAgICAgICAgICAgcmFkaXVzOiAxMixcbiAgICAgICAgICAgIHpJbmRleE9mZnNldDogMVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhcImRyYXdSZXN0YXVyYW50OiBpbnNwZWN0aW9uRGF0YVwiLCBpbnNwZWN0aW9uRGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZHJhd1Jlc3RhdXJhbnQ6IGdlb0RhdGFcIiwgZ2VvRGF0YSk7XG4gICAgICAgIHZhciBtYXJrZXIgPSBMLmNpcmNsZU1hcmtlcihbZ2VvRGF0YS5sYXRpdHVkZSwgZ2VvRGF0YS5sb25naXR1ZGVdLCBvcHRpb25zKTtcblxuICAgICAgICBtYXJrZXIuYWRkVG8odGhpcy5tYXApXG4gICAgICAgICAgICAuYmluZFBvcHVwKGluc3BlY3Rpb25EYXRhLnNjb3JlICsgJyAtLSAnICsgaW5zcGVjdGlvbkRhdGEucmVzdGF1cmFudF9uYW1lKVxuICAgICAgICAgICAgLm9wZW5Qb3B1cCgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwO1xuIiwidmFyIHN0b3BzID0gW3tcInN0b3BfbGF0XCI6IDMwLjE2Mjk1MSwgXCJzdG9wX3RpbWV6b25lXCI6IG51bGwsIFwid2hlZWxjaGFpcl9ib2FyZGluZ1wiOiAwLCBcInN0b3BfY29kZVwiOiBcIjU4NzNcIiwgXCJkaXJlY3Rpb25faWRcIjogMCwgXCJzdG9wX2xvblwiOiAtOTcuNzkwNDg4LCBcInBhcmVudF9zdGF0aW9uXCI6IG51bGwsIFwicm91dGVfaWRcIjogXCI4MDFcIiwgXCJzdG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FwbWV0cm8ub3JnL2dpc21hcHMvc3RvcHMvNTg3My5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiAxLCBcInN0b3BfaWRcIjogXCI1ODczXCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGhlYXN0IGNvcm5lciBvZiBUVVJLIGFuZCBDVUxMRU4gLSBNaWQtQmxvY2tcIiwgXCJzdG9wX25hbWVcIjogXCJTT1VUSFBBUksgTUVBRE9XUyBTVEFUSU9OXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4xOTQxODUsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMSwgXCJzdG9wX2NvZGVcIjogXCI0MzgyXCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc3ODI2MSwgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzQzODIuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMiwgXCJzdG9wX2lkXCI6IFwiNDM4MlwiLCBcInN0b3BfZGVzY1wiOiBcIk5vcnRoZWFzdCBjb3JuZXIgb2YgQ09OR1JFU1MgYW5kIFdJTExJQU0gQ0FOTk9OIC0gTWlkLUJsb2NrXCIsIFwic3RvcF9uYW1lXCI6IFwiUExFQVNBTlQgSElMTCBTVEFUSU9OIChOQilcIiwgXCJsb2NhdGlvbl90eXBlXCI6IG51bGwsIFwicGxhdGZvcm1fY29kZVwiOiBudWxsLCBcInpvbmVfaWRcIjogbnVsbH0sIHtcInN0b3BfbGF0XCI6IDMwLjIwMjEyNSwgXCJzdG9wX3RpbWV6b25lXCI6IG51bGwsIFwid2hlZWxjaGFpcl9ib2FyZGluZ1wiOiAwLCBcInN0b3BfY29kZVwiOiBcIjU1OVwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43NzU1MTYsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy81NTkuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMywgXCJzdG9wX2lkXCI6IFwiNTU5XCIsIFwic3RvcF9kZXNjXCI6IFwiU291dGhlYXN0IGNvcm5lciBvZiBDT05HUkVTUyBhbmQgTElUVExFIFRFWEFTIC0gTmVhcnNpZGVcIiwgXCJzdG9wX25hbWVcIjogXCJMSVRUTEUgVEVYQVMgU1RBVElPTiAoTkIpXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4yMjI5NDEsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCI1NTUyXCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc2NjI4LCBcInBhcmVudF9zdGF0aW9uXCI6IG51bGwsIFwicm91dGVfaWRcIjogXCI4MDFcIiwgXCJzdG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FwbWV0cm8ub3JnL2dpc21hcHMvc3RvcHMvNTU1Mi5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiA0LCBcInN0b3BfaWRcIjogXCI1NTUyXCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGh3ZXN0IGNvcm5lciBvZiBCRU4gV0hJVEUgYW5kIENPTkdSRVNTIC0gTWlkLUJsb2NrXCIsIFwic3RvcF9uYW1lXCI6IFwiU09VVEggQ09OR1JFU1MgU1RBVElPTiBCQVkgSlwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMjMwNTQ5LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTg2OVwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43NTk1MjMsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy81ODY5Lmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDUsIFwic3RvcF9pZFwiOiBcIjU4NjlcIiwgXCJzdG9wX2Rlc2NcIjogXCJOb3J0aGVhc3QgY29ybmVyIG9mIENPTkdSRVNTIGFuZCBXT09EV0FSRCAtIE1pZC1CbG9ja1wiLCBcInN0b3BfbmFtZVwiOiBcIlNUIEVEV0FSRFMgU1RBVElPTiAoTkIpXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4yMzk1NTQsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCI0MDM5XCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc1Mjg0LCBcInBhcmVudF9zdGF0aW9uXCI6IG51bGwsIFwicm91dGVfaWRcIjogXCI4MDFcIiwgXCJzdG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FwbWV0cm8ub3JnL2dpc21hcHMvc3RvcHMvNDAzOS5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiA2LCBcInN0b3BfaWRcIjogXCI0MDM5XCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGhlYXN0IGNvcm5lciBvZiBDT05HUkVTUyBhbmQgT0xUT1JGIC0gTWlkLUJsb2NrXCIsIFwic3RvcF9uYW1lXCI6IFwiT0xUT1JGIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMjQ4NzUsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCI0MDI2XCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc0OTgyLCBcInBhcmVudF9zdGF0aW9uXCI6IG51bGwsIFwicm91dGVfaWRcIjogXCI4MDFcIiwgXCJzdG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FwbWV0cm8ub3JnL2dpc21hcHMvc3RvcHMvNDAyNi5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiA3LCBcInN0b3BfaWRcIjogXCI0MDI2XCIsIFwic3RvcF9kZXNjXCI6IFwiU291dGhlYXN0IGNvcm5lciBvZiBDT05HUkVTUyBhbmQgRUxJWkFCRVRIIC0gTmVhcnNpZGVcIiwgXCJzdG9wX25hbWVcIjogXCJTT0NPIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMjU4MzA2LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTk0MlwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43NDc5MzgsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy81OTQyLmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDgsIFwic3RvcF9pZFwiOiBcIjU5NDJcIiwgXCJzdG9wX2Rlc2NcIjogXCJOb3J0aGVhc3QgY29ybmVyIG9mIFJJVkVSU0lERSBhbmQgQkFSVE9OIFNQUklOR1MgLSBNaWQtQmxvY2tcIiwgXCJzdG9wX25hbWVcIjogXCIyMTAgUklWRVJTSURFL0JBUlRPTiBTUFJJTkdTXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4yNjYyMTgsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCI1ODY4XCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc0NjA1NiwgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzU4NjguaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogOSwgXCJzdG9wX2lkXCI6IFwiNTg2OFwiLCBcInN0b3BfZGVzY1wiOiBcIk5vcnRoZWFzdCBjb3JuZXIgb2YgTEFWQUNBIGFuZCAzUkQgLSBGYXJzaWRlXCIsIFwic3RvcF9uYW1lXCI6IFwiUkVQVUJMSUMgU1FVQVJFIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMjcwNDIsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCIyNjA2XCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc0NDQ0LCBcInBhcmVudF9zdGF0aW9uXCI6IG51bGwsIFwicm91dGVfaWRcIjogXCI4MDFcIiwgXCJzdG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FwbWV0cm8ub3JnL2dpc21hcHMvc3RvcHMvMjYwNi5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiAxMCwgXCJzdG9wX2lkXCI6IFwiMjYwNlwiLCBcInN0b3BfZGVzY1wiOiBcIlNvdXRoZWFzdCBjb3JuZXIgb2YgTEFWQUNBIGFuZCA4VEggLSBOZWFyc2lkZVwiLCBcInN0b3BfbmFtZVwiOiBcIldPT0xEUklER0UgU1FVQVJFIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMjc1NTg3LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTkxXCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc0MjU1OCwgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzU5MS5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiAxMSwgXCJzdG9wX2lkXCI6IFwiNTkxXCIsIFwic3RvcF9kZXNjXCI6IFwiU291dGhlYXN0IGNvcm5lciBvZiBMQVZBQ0EgYW5kIDEzVEggLSBOZWFyc2lkZVwiLCBcInN0b3BfbmFtZVwiOiBcIkNBUElUT0wgU1RBVElPTiAoTkIpXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4yNzkzLCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNDY1N1wiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43NDExOSwgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzQ2NTcuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMTIsIFwic3RvcF9pZFwiOiBcIjQ2NTdcIiwgXCJzdG9wX2Rlc2NcIjogXCJTb3V0aGVhc3QgY29ybmVyIG9mIExBVkFDQSBhbmQgMTdUSCAtIE5lYXJzaWRlXCIsIFwic3RvcF9uYW1lXCI6IFwiTVVTRVVNIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMjg2MTI5LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTg2NVwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43NDE1OTYsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy81ODY1Lmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDEzLCBcInN0b3BfaWRcIjogXCI1ODY1XCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGhlYXN0IGNvcm5lciBvZiBHVUFEQUxVUEUgYW5kIFdFU1QgTUFMTCBVVCAtIEZhcnNpZGVcIiwgXCJzdG9wX25hbWVcIjogXCJVVCBXRVNUIE1BTEwgU1RBVElPTiAoTkIpXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4yODkyOTgsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCI1ODY0XCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3Ljc0MTM2MywgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzU4NjQuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMTQsIFwic3RvcF9pZFwiOiBcIjU4NjRcIiwgXCJzdG9wX2Rlc2NcIjogXCJTb3V0aGVhc3QgY29ybmVyIG9mIEdVQURBTFVQRSBhbmQgREVBTiBLRUVUT04gLSBNaWQtQmxvY2tcIiwgXCJzdG9wX25hbWVcIjogXCJVVCBERUFOIEtFRVRPTiBTVEFUSU9OIChOQilcIiwgXCJsb2NhdGlvbl90eXBlXCI6IG51bGwsIFwicGxhdGZvcm1fY29kZVwiOiBudWxsLCBcInpvbmVfaWRcIjogbnVsbH0sIHtcInN0b3BfbGF0XCI6IDMwLjMwNDQyOSwgXCJzdG9wX3RpbWV6b25lXCI6IG51bGwsIFwid2hlZWxjaGFpcl9ib2FyZGluZ1wiOiAwLCBcInN0b3BfY29kZVwiOiBcIjYwNlwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43MzY5NTQsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy82MDYuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMTUsIFwic3RvcF9pZFwiOiBcIjYwNlwiLCBcInN0b3BfZGVzY1wiOiBcIk5vcnRoZWFzdCBjb3JuZXIgb2YgR1VBREFMVVBFIGFuZCAzOVRIIC0gRmFyc2lkZVwiLCBcInN0b3BfbmFtZVwiOiBcIkhZREUgUEFSSyBTVEFUSU9OIChOQilcIiwgXCJsb2NhdGlvbl90eXBlXCI6IG51bGwsIFwicGxhdGZvcm1fY29kZVwiOiBudWxsLCBcInpvbmVfaWRcIjogbnVsbH0sIHtcInN0b3BfbGF0XCI6IDMwLjMxNDkwNywgXCJzdG9wX3RpbWV6b25lXCI6IG51bGwsIFwid2hlZWxjaGFpcl9ib2FyZGluZ1wiOiAwLCBcInN0b3BfY29kZVwiOiBcIjYxMFwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43MzIyNTcsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy82MTAuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMTYsIFwic3RvcF9pZFwiOiBcIjYxMFwiLCBcInN0b3BfZGVzY1wiOiBcIk5vcnRoZWFzdCBjb3JuZXIgb2YgR1VBREFMVVBFIGFuZCA0NlRIIC0gTWlkLUJsb2NrXCIsIFwic3RvcF9uYW1lXCI6IFwiVFJJQU5HTEUgU1RBVElPTiAoTkIpXCIsIFwibG9jYXRpb25fdHlwZVwiOiBudWxsLCBcInBsYXRmb3JtX2NvZGVcIjogbnVsbCwgXCJ6b25lX2lkXCI6IG51bGx9LCB7XCJzdG9wX2xhdFwiOiAzMC4zMjY0OTcsIFwic3RvcF90aW1lem9uZVwiOiBudWxsLCBcIndoZWVsY2hhaXJfYm9hcmRpbmdcIjogMCwgXCJzdG9wX2NvZGVcIjogXCI1ODYyXCIsIFwiZGlyZWN0aW9uX2lkXCI6IDAsIFwic3RvcF9sb25cIjogLTk3LjcyNTgwMSwgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzU4NjIuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMTcsIFwic3RvcF9pZFwiOiBcIjU4NjJcIiwgXCJzdG9wX2Rlc2NcIjogXCJOb3J0aGVhc3QgY29ybmVyIG9mIExBTUFSIGFuZCBLT0VOSUcgLSBGYXJzaWRlXCIsIFwic3RvcF9uYW1lXCI6IFwiS09FTklHIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMzM2OTI4LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTg2MFwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43MTkyNywgXCJwYXJlbnRfc3RhdGlvblwiOiBudWxsLCBcInJvdXRlX2lkXCI6IFwiODAxXCIsIFwic3RvcF91cmxcIjogXCJodHRwOi8vd3d3LmNhcG1ldHJvLm9yZy9naXNtYXBzL3N0b3BzLzU4NjAuaHRtbFwiLCBcInN0b3Bfc2VxdWVuY2VcIjogMTgsIFwic3RvcF9pZFwiOiBcIjU4NjBcIiwgXCJzdG9wX2Rlc2NcIjogXCJOb3J0aGVhc3QgY29ybmVyIG9mIExBTUFSIGFuZCBKVVNUSU4gLSBGYXJzaWRlXCIsIFwic3RvcF9uYW1lXCI6IFwiQ1JFU1RWSUVXIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMzQ5MzI2LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTg1OVwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny43MTE2ODUsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy81ODU5Lmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDE5LCBcInN0b3BfaWRcIjogXCI1ODU5XCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGh3ZXN0IGNvcm5lciBvZiBMQU1BUiBhbmQgUkVTRUFSQ0ggLSBOZWFyc2lkZVwiLCBcInN0b3BfbmFtZVwiOiBcIk5PUlRIIExBTUFSIFNUQVRJT05cIiwgXCJsb2NhdGlvbl90eXBlXCI6IG51bGwsIFwicGxhdGZvcm1fY29kZVwiOiBudWxsLCBcInpvbmVfaWRcIjogbnVsbH0sIHtcInN0b3BfbGF0XCI6IDMwLjM2MjYyMywgXCJzdG9wX3RpbWV6b25lXCI6IG51bGwsIFwid2hlZWxjaGFpcl9ib2FyZGluZ1wiOiAwLCBcInN0b3BfY29kZVwiOiBcIjI4MjFcIiwgXCJkaXJlY3Rpb25faWRcIjogMCwgXCJzdG9wX2xvblwiOiAtOTcuNjk3MTcsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy8yODIxLmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDIwLCBcInN0b3BfaWRcIjogXCIyODIxXCIsIFwic3RvcF9kZXNjXCI6IFwiU291dGhlYXN0IGNvcm5lciBvZiBMQU1BUiBhbmQgUlVOREJFUkcgLSBOZWFyc2lkZVwiLCBcInN0b3BfbmFtZVwiOiBcIlJVTkRCRVJHIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuMzcxNzUyLCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNDU0M1wiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny42OTE5OTgsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy80NTQzLmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDIxLCBcInN0b3BfaWRcIjogXCI0NTQzXCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGhlYXN0IGNvcm5lciBvZiBMQU1BUiBhbmQgTUFTVEVSU09OIC0gRmFyc2lkZVwiLCBcInN0b3BfbmFtZVwiOiBcIk1BU1RFUlNPTiBTVEFUSU9OIChOQilcIiwgXCJsb2NhdGlvbl90eXBlXCI6IG51bGwsIFwicGxhdGZvcm1fY29kZVwiOiBudWxsLCBcInpvbmVfaWRcIjogbnVsbH0sIHtcInN0b3BfbGF0XCI6IDMwLjM3OTQ0OSwgXCJzdG9wX3RpbWV6b25lXCI6IG51bGwsIFwid2hlZWxjaGFpcl9ib2FyZGluZ1wiOiAwLCBcInN0b3BfY29kZVwiOiBcIjQ1NDhcIiwgXCJkaXJlY3Rpb25faWRcIjogMCwgXCJzdG9wX2xvblwiOiAtOTcuNjg3NjM4LCBcInBhcmVudF9zdGF0aW9uXCI6IG51bGwsIFwicm91dGVfaWRcIjogXCI4MDFcIiwgXCJzdG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FwbWV0cm8ub3JnL2dpc21hcHMvc3RvcHMvNDU0OC5odG1sXCIsIFwic3RvcF9zZXF1ZW5jZVwiOiAyMiwgXCJzdG9wX2lkXCI6IFwiNDU0OFwiLCBcInN0b3BfZGVzY1wiOiBcIlNvdXRoZWFzdCBjb3JuZXIgb2YgTEFNQVIgYW5kIEtSQU1FUiAtIE5lYXJzaWRlXCIsIFwic3RvcF9uYW1lXCI6IFwiQ0hJTkFUT1dOIFNUQVRJT04gKE5CKVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfSwge1wic3RvcF9sYXRcIjogMzAuNDE4MTk5LCBcInN0b3BfdGltZXpvbmVcIjogbnVsbCwgXCJ3aGVlbGNoYWlyX2JvYXJkaW5nXCI6IDAsIFwic3RvcF9jb2RlXCI6IFwiNTMwNFwiLCBcImRpcmVjdGlvbl9pZFwiOiAwLCBcInN0b3BfbG9uXCI6IC05Ny42NjgyNDMsIFwicGFyZW50X3N0YXRpb25cIjogbnVsbCwgXCJyb3V0ZV9pZFwiOiBcIjgwMVwiLCBcInN0b3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYXBtZXRyby5vcmcvZ2lzbWFwcy9zdG9wcy81MzA0Lmh0bWxcIiwgXCJzdG9wX3NlcXVlbmNlXCI6IDIzLCBcInN0b3BfaWRcIjogXCI1MzA0XCIsIFwic3RvcF9kZXNjXCI6IFwiTm9ydGh3ZXN0IGNvcm5lciBvZiBDRU5URVIgUklER0UgYW5kIENFTlRFUiBMSU5FIC0gTWlkLUJsb2NrXCIsIFwic3RvcF9uYW1lXCI6IFwiVEVDSCBSSURHRSBCQVkgSVwiLCBcImxvY2F0aW9uX3R5cGVcIjogbnVsbCwgXCJwbGF0Zm9ybV9jb2RlXCI6IG51bGwsIFwiem9uZV9pZFwiOiBudWxsfV1cblxubW9kdWxlLmV4cG9ydHMgPSBzdG9wcztcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiLyohIGdlb2xpYiAyLjAuMTQgYnkgTWFudWVsIEJpZWhcclxuKiBMaWJyYXJ5IHRvIHByb3ZpZGUgZ2VvIGZ1bmN0aW9ucyBsaWtlIGRpc3RhbmNlIGNhbGN1bGF0aW9uLFxyXG4qIGNvbnZlcnNpb24gb2YgZGVjaW1hbCBjb29yZGluYXRlcyB0byBzZXhhZ2VzaW1hbCBhbmQgdmljZSB2ZXJzYSwgZXRjLlxyXG4qIFdHUyA4NCAoV29ybGQgR2VvZGV0aWMgU3lzdGVtIDE5ODQpXHJcbiogXHJcbiogQGF1dGhvciBNYW51ZWwgQmllaFxyXG4qIEB1cmwgaHR0cDovL3d3dy5tYW51ZWxiaWVoLmNvbS9cclxuKiBAdmVyc2lvbiAyLjAuMTRcclxuKiBAbGljZW5zZSBNSVQgXHJcbioqLzsoZnVuY3Rpb24oZ2xvYmFsLCB1bmRlZmluZWQpIHtcclxuXHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cdGZ1bmN0aW9uIEdlb2xpYigpIHt9XHJcblxyXG5cdC8vIFNldHRpbmcgcmVhZG9ubHkgZGVmYXVsdHNcclxuXHR2YXIgZ2VvbGliID0gT2JqZWN0LmNyZWF0ZShHZW9saWIucHJvdG90eXBlLCB7XHJcblx0XHR2ZXJzaW9uOiB7XHJcblx0XHRcdHZhbHVlOiBcIjIuMC4xNFwiXHJcblx0XHR9LFxyXG5cdFx0cmFkaXVzOiB7XHJcblx0XHRcdHZhbHVlOiA2Mzc4MTM3XHJcblx0XHR9LFxyXG5cdFx0bWluTGF0OiB7XHJcblx0XHRcdHZhbHVlOiAtOTBcclxuXHRcdH0sXHJcblx0XHRtYXhMYXQ6IHtcclxuXHRcdFx0dmFsdWU6IDkwXHJcblx0XHR9LFxyXG5cdFx0bWluTG9uOiB7XHJcblx0XHRcdHZhbHVlOiAtMTgwXHJcblx0XHR9LFxyXG5cdFx0bWF4TG9uOiB7XHJcblx0XHRcdHZhbHVlOiAxODBcclxuXHRcdH0sXHJcblx0XHRzZXhhZ2VzaW1hbFBhdHRlcm46IHtcclxuXHRcdFx0dmFsdWU6IC9eKFswLTldezEsM30pwrBcXHMqKFswLTldezEsM30oPzpcXC4oPzpbMC05XXsxLDJ9KSk/KSdcXHMqKChbMC05XXsxLDN9KFxcLihbMC05XXsxLDJ9KSk/KVwiXFxzKik/KFtORU9TV10/KSQvXHJcblx0XHR9LFxyXG5cdFx0bWVhc3VyZXM6IHtcclxuXHRcdFx0dmFsdWU6IE9iamVjdC5jcmVhdGUoT2JqZWN0LnByb3RvdHlwZSwge1xyXG5cdFx0XHRcdFwibVwiIDoge3ZhbHVlOiAxfSxcclxuXHRcdFx0XHRcImttXCI6IHt2YWx1ZTogMC4wMDF9LFxyXG5cdFx0XHRcdFwiY21cIjoge3ZhbHVlOiAxMDB9LFxyXG5cdFx0XHRcdFwibW1cIjoge3ZhbHVlOiAxMDAwfSxcclxuXHRcdFx0XHRcIm1pXCI6IHt2YWx1ZTogKDEgLyAxNjA5LjM0NCl9LFxyXG5cdFx0XHRcdFwic21cIjoge3ZhbHVlOiAoMSAvIDE4NTIuMjE2KX0sXHJcblx0XHRcdFx0XCJmdFwiOiB7dmFsdWU6ICgxMDAgLyAzMC40OCl9LFxyXG5cdFx0XHRcdFwiaW5cIjoge3ZhbHVlOiAoMTAwIC8gMi41NCl9LFxyXG5cdFx0XHRcdFwieWRcIjoge3ZhbHVlOiAoMSAvIDAuOTE0NCl9XHJcblx0XHRcdH0pXHJcblx0XHR9LFxyXG5cdFx0cHJvdG90eXBlOiB7XHJcblx0XHRcdHZhbHVlOiBHZW9saWIucHJvdG90eXBlXHJcblx0XHR9LFxyXG5cdFx0ZXh0ZW5kOiB7XHJcblx0XHRcdHZhbHVlOiBmdW5jdGlvbihtZXRob2RzLCBvdmVyd3JpdGUpIHtcclxuXHRcdFx0XHRmb3IodmFyIHByb3AgaW4gbWV0aG9kcykge1xyXG5cdFx0XHRcdFx0aWYodHlwZW9mIGdlb2xpYi5wcm90b3R5cGVbcHJvcF0gPT09ICd1bmRlZmluZWQnIHx8IG92ZXJ3cml0ZSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdFx0XHRnZW9saWIucHJvdG90eXBlW3Byb3BdID0gbWV0aG9kc1twcm9wXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0aWYgKHR5cGVvZihOdW1iZXIucHJvdG90eXBlLnRvUmFkKSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0TnVtYmVyLnByb3RvdHlwZS50b1JhZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcyAqIE1hdGguUEkgLyAxODA7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0aWYgKHR5cGVvZihOdW1iZXIucHJvdG90eXBlLnRvRGVnKSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0TnVtYmVyLnByb3RvdHlwZS50b0RlZyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcyAqIDE4MCAvIE1hdGguUEk7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gSGVyZSBjb21lcyB0aGUgbWFnaWNcclxuXHRnZW9saWIuZXh0ZW5kKHtcclxuXHJcblx0XHRkZWNpbWFsOiB7fSxcclxuXHJcblx0XHRzZXhhZ2VzaW1hbDoge30sXHJcblxyXG5cdFx0ZGlzdGFuY2U6IG51bGwsXHJcblxyXG5cdFx0Z2V0S2V5czogZnVuY3Rpb24ocG9pbnQpIHtcclxuXHJcblx0XHRcdC8vIEdlb0pTT04gQXJyYXkgW2xvbmdpdHVkZSwgbGF0aXR1ZGUoLCBlbGV2YXRpb24pXVxyXG5cdFx0XHRpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocG9pbnQpID09ICdbb2JqZWN0IEFycmF5XScpIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdGxvbmdpdHVkZTogcG9pbnQubGVuZ3RoID49IDEgPyAwIDogdW5kZWZpbmVkLFxyXG5cdFx0XHRcdFx0bGF0aXR1ZGU6IHBvaW50Lmxlbmd0aCA+PSAyID8gMSA6IHVuZGVmaW5lZCxcclxuXHRcdFx0XHRcdGVsZXZhdGlvbjogcG9pbnQubGVuZ3RoID49IDMgPyAyIDogdW5kZWZpbmVkXHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBnZXRLZXkgPSBmdW5jdGlvbihwb3NzaWJsZVZhbHVlcykge1xyXG5cclxuXHRcdFx0XHR2YXIga2V5O1xyXG5cclxuXHRcdFx0XHRwb3NzaWJsZVZhbHVlcy5ldmVyeShmdW5jdGlvbih2YWwpIHtcclxuXHRcdFx0XHRcdC8vIFRPRE86IGNoZWNrIGlmIHBvaW50IGlzIGFuIG9iamVjdFxyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHBvaW50ICE9ICdvYmplY3QnKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIHBvaW50Lmhhc093blByb3BlcnR5KHZhbCkgPyAoZnVuY3Rpb24oKSB7IGtleSA9IHZhbDsgcmV0dXJuIGZhbHNlOyB9KCkpIDogdHJ1ZTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGtleTtcclxuXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR2YXIgbG9uZ2l0dWRlID0gZ2V0S2V5KFsnbG5nJywgJ2xvbicsICdsb25naXR1ZGUnXSk7XHJcblx0XHRcdHZhciBsYXRpdHVkZSA9IGdldEtleShbJ2xhdCcsICdsYXRpdHVkZSddKTtcclxuXHRcdFx0dmFyIGVsZXZhdGlvbiA9IGdldEtleShbJ2FsdCcsICdhbHRpdHVkZScsICdlbGV2YXRpb24nLCAnZWxldiddKTtcclxuXHJcblx0XHRcdC8vIHJldHVybiB1bmRlZmluZWQgaWYgbm90IGF0IGxlYXN0IG9uZSB2YWxpZCBwcm9wZXJ0eSB3YXMgZm91bmRcclxuXHRcdFx0aWYodHlwZW9mIGxhdGl0dWRlID09ICd1bmRlZmluZWQnICYmIFxyXG5cdFx0XHRcdHR5cGVvZiBsb25naXR1ZGUgPT0gJ3VuZGVmaW5lZCcgJiYgXHJcblx0XHRcdFx0dHlwZW9mIGVsZXZhdGlvbiA9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0bGF0aXR1ZGU6IGxhdGl0dWRlLFxyXG5cdFx0XHRcdGxvbmdpdHVkZTogbG9uZ2l0dWRlLFxyXG5cdFx0XHRcdGVsZXZhdGlvbjogZWxldmF0aW9uXHJcblx0XHRcdH07XHJcblxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyByZXR1cm5zIGxhdGl0dWRlIG9mIGEgZ2l2ZW4gcG9pbnQsIGNvbnZlcnRlZCB0byBkZWNpbWFsXHJcblx0XHQvLyBzZXQgcmF3IHRvIHRydWUgdG8gYXZvaWQgY29udmVyc2lvblxyXG5cdFx0Z2V0TGF0OiBmdW5jdGlvbihwb2ludCwgcmF3KSB7XHJcblx0XHRcdHJldHVybiByYXcgPT09IHRydWUgPyBwb2ludFt0aGlzLmdldEtleXMocG9pbnQpLmxhdGl0dWRlXSA6IHRoaXMudXNlRGVjaW1hbChwb2ludFt0aGlzLmdldEtleXMocG9pbnQpLmxhdGl0dWRlXSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIEFsaWFzIGZvciBnZXRMYXRcclxuXHRcdGxhdGl0dWRlOiBmdW5jdGlvbihwb2ludCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRMYXQuY2FsbCh0aGlzLCBwb2ludCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIHJldHVybnMgbG9uZ2l0dWRlIG9mIGEgZ2l2ZW4gcG9pbnQsIGNvbnZlcnRlZCB0byBkZWNpbWFsXHJcblx0XHQvLyBzZXQgcmF3IHRvIHRydWUgdG8gYXZvaWQgY29udmVyc2lvblxyXG5cdFx0Z2V0TG9uOiBmdW5jdGlvbihwb2ludCwgcmF3KSB7XHJcblx0XHRcdHJldHVybiByYXcgPT09IHRydWUgPyBwb2ludFt0aGlzLmdldEtleXMocG9pbnQpLmxvbmdpdHVkZV0gOiB0aGlzLnVzZURlY2ltYWwocG9pbnRbdGhpcy5nZXRLZXlzKHBvaW50KS5sb25naXR1ZGVdKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gQWxpYXMgZm9yIGdldExvblxyXG5cdFx0bG9uZ2l0dWRlOiBmdW5jdGlvbihwb2ludCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRMb24uY2FsbCh0aGlzLCBwb2ludCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGdldEVsZXY6IGZ1bmN0aW9uKHBvaW50KSB7XHJcblx0XHRcdHJldHVybiBwb2ludFt0aGlzLmdldEtleXMocG9pbnQpLmVsZXZhdGlvbl07XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIEFsaWFzIGZvciBnZXRFbGV2XHJcblx0XHRlbGV2YXRpb246IGZ1bmN0aW9uKHBvaW50KSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmdldEVsZXYuY2FsbCh0aGlzLCBwb2ludCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGNvb3JkczogZnVuY3Rpb24ocG9pbnQsIHJhdykge1xyXG5cclxuXHRcdFx0dmFyIHJldHZhbCA9IHtcclxuXHRcdFx0XHRsYXRpdHVkZTogcmF3ID09PSB0cnVlID8gcG9pbnRbdGhpcy5nZXRLZXlzKHBvaW50KS5sYXRpdHVkZV0gOiB0aGlzLnVzZURlY2ltYWwocG9pbnRbdGhpcy5nZXRLZXlzKHBvaW50KS5sYXRpdHVkZV0pLFxyXG5cdFx0XHRcdGxvbmdpdHVkZTogcmF3ID09PSB0cnVlID8gcG9pbnRbdGhpcy5nZXRLZXlzKHBvaW50KS5sb25naXR1ZGVdIDogdGhpcy51c2VEZWNpbWFsKHBvaW50W3RoaXMuZ2V0S2V5cyhwb2ludCkubG9uZ2l0dWRlXSlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHZhciBlbGV2ID0gcG9pbnRbdGhpcy5nZXRLZXlzKHBvaW50KS5lbGV2YXRpb25dO1xyXG5cclxuXHRcdFx0aWYodHlwZW9mIGVsZXYgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0cmV0dmFsWydlbGV2YXRpb24nXSA9IGVsZXY7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByZXR2YWw7XHJcblxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBjaGVja3MgaWYgYSB2YXJpYWJsZSBjb250YWlucyBhIHZhbGlkIGxhdGxvbmcgb2JqZWN0XHJcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24ocG9pbnQpIHtcclxuXHJcblx0XHRcdHZhciBrZXlzID0gdGhpcy5nZXRLZXlzKHBvaW50KTtcclxuXHJcblx0XHRcdGlmKHR5cGVvZiBrZXlzID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Yga2V5cy5sYXRpdHVkZSA9PT0gJ3VuZGVmaW5lZCcgfHwga2V5cy5sb25naXR1ZGUgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgbGF0ID0gcG9pbnRba2V5cy5sYXRpdHVkZV07XHJcblx0XHRcdHZhciBsbmcgPSBwb2ludFtrZXlzLmxvbmdpdHVkZV07XHJcblxyXG5cdFx0XHRpZih0eXBlb2YgbGF0ID09PSAndW5kZWZpbmVkJyB8fCAhdGhpcy5pc0RlY2ltYWwobGF0KSAmJiAhdGhpcy5pc1NleGFnZXNpbWFsKGxhdCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHR5cGVvZiBsbmcgPT09ICd1bmRlZmluZWQnIHx8ICF0aGlzLmlzRGVjaW1hbChsbmcpICYmICF0aGlzLmlzU2V4YWdlc2ltYWwobG5nKSkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGF0ID0gdGhpcy51c2VEZWNpbWFsKGxhdCk7XHJcblx0XHRcdGxuZyA9IHRoaXMudXNlRGVjaW1hbChsbmcpO1xyXG5cclxuXHRcdFx0aWYobGF0IDwgdGhpcy5taW5MYXQgfHwgbGF0ID4gdGhpcy5tYXhMYXQgfHwgbG5nIDwgdGhpcy5taW5Mb24gfHwgbG5nID4gdGhpcy5tYXhMb24pIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIENhbGN1bGF0ZXMgZ2VvZGV0aWMgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzIHNwZWNpZmllZCBieSBsYXRpdHVkZS9sb25naXR1ZGUgdXNpbmcgXHJcblx0XHQqIFZpbmNlbnR5IGludmVyc2UgZm9ybXVsYSBmb3IgZWxsaXBzb2lkc1xyXG5cdFx0KiBWaW5jZW50eSBJbnZlcnNlIFNvbHV0aW9uIG9mIEdlb2Rlc2ljcyBvbiB0aGUgRWxsaXBzb2lkIChjKSBDaHJpcyBWZW5lc3MgMjAwMi0yMDEwXHJcblx0XHQqIChMaWNlbnNlZCB1bmRlciBDQyBCWSAzLjApXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSAgICBvYmplY3QgICAgU3RhcnQgcG9zaXRpb24ge2xhdGl0dWRlOiAxMjMsIGxvbmdpdHVkZTogMTIzfVxyXG5cdFx0KiBAcGFyYW0gICAgb2JqZWN0ICAgIEVuZCBwb3NpdGlvbiB7bGF0aXR1ZGU6IDEyMywgbG9uZ2l0dWRlOiAxMjN9XHJcblx0XHQqIEBwYXJhbSAgICBpbnRlZ2VyICAgQWNjdXJhY3kgKGluIG1ldGVycylcclxuXHRcdCogQHJldHVybiAgIGludGVnZXIgICBEaXN0YW5jZSAoaW4gbWV0ZXJzKVxyXG5cdFx0Ki9cclxuXHRcdGdldERpc3RhbmNlOiBmdW5jdGlvbihzdGFydCwgZW5kLCBhY2N1cmFjeSkge1xyXG5cclxuXHRcdFx0YWNjdXJhY3kgPSBNYXRoLmZsb29yKGFjY3VyYWN5KSB8fCAxO1xyXG5cclxuXHRcdFx0dmFyIHMgPSB0aGlzLmNvb3JkcyhzdGFydCk7XHJcblx0XHRcdHZhciBlID0gdGhpcy5jb29yZHMoZW5kKTtcclxuXHJcblx0XHRcdHZhciBhID0gNjM3ODEzNywgYiA9IDYzNTY3NTIuMzE0MjQ1LCAgZiA9IDEvMjk4LjI1NzIyMzU2MzsgIC8vIFdHUy04NCBlbGxpcHNvaWQgcGFyYW1zXHJcblx0XHRcdHZhciBMID0gKGVbJ2xvbmdpdHVkZSddLXNbJ2xvbmdpdHVkZSddKS50b1JhZCgpO1xyXG5cclxuXHRcdFx0dmFyIGNvc1NpZ21hLCBzaWdtYSwgc2luQWxwaGEsIGNvc1NxQWxwaGEsIGNvczJTaWdtYU0sIHNpblNpZ21hO1xyXG5cclxuXHRcdFx0dmFyIFUxID0gTWF0aC5hdGFuKCgxLWYpICogTWF0aC50YW4ocGFyc2VGbG9hdChzWydsYXRpdHVkZSddKS50b1JhZCgpKSk7XHJcblx0XHRcdHZhciBVMiA9IE1hdGguYXRhbigoMS1mKSAqIE1hdGgudGFuKHBhcnNlRmxvYXQoZVsnbGF0aXR1ZGUnXSkudG9SYWQoKSkpO1xyXG5cdFx0XHR2YXIgc2luVTEgPSBNYXRoLnNpbihVMSksIGNvc1UxID0gTWF0aC5jb3MoVTEpO1xyXG5cdFx0XHR2YXIgc2luVTIgPSBNYXRoLnNpbihVMiksIGNvc1UyID0gTWF0aC5jb3MoVTIpO1xyXG5cclxuXHRcdFx0dmFyIGxhbWJkYSA9IEwsIGxhbWJkYVAsIGl0ZXJMaW1pdCA9IDEwMDtcclxuXHRcdFx0ZG8ge1xyXG5cdFx0XHRcdHZhciBzaW5MYW1iZGEgPSBNYXRoLnNpbihsYW1iZGEpLCBjb3NMYW1iZGEgPSBNYXRoLmNvcyhsYW1iZGEpO1xyXG5cdFx0XHRcdHNpblNpZ21hID0gKFxyXG5cdFx0XHRcdFx0TWF0aC5zcXJ0KFxyXG5cdFx0XHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdFx0Y29zVTIgKiBzaW5MYW1iZGFcclxuXHRcdFx0XHRcdFx0KSAqIChcclxuXHRcdFx0XHRcdFx0XHRjb3NVMiAqIHNpbkxhbWJkYVxyXG5cdFx0XHRcdFx0XHQpICsgKFxyXG5cdFx0XHRcdFx0XHRcdGNvc1UxICogc2luVTIgLSBzaW5VMSAqIGNvc1UyICogY29zTGFtYmRhXHJcblx0XHRcdFx0XHRcdCkgKiAoXHJcblx0XHRcdFx0XHRcdFx0Y29zVTEgKiBzaW5VMiAtIHNpblUxICogY29zVTIgKiBjb3NMYW1iZGFcclxuXHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdFx0aWYgKHNpblNpZ21hID09PSAwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZ2VvbGliLmRpc3RhbmNlID0gMDsgIC8vIGNvLWluY2lkZW50IHBvaW50c1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y29zU2lnbWEgPSBzaW5VMSAqIHNpblUyICsgY29zVTEgKiBjb3NVMiAqIGNvc0xhbWJkYTtcclxuXHRcdFx0XHRzaWdtYSA9IE1hdGguYXRhbjIoc2luU2lnbWEsIGNvc1NpZ21hKTtcclxuXHRcdFx0XHRzaW5BbHBoYSA9IGNvc1UxICogY29zVTIgKiBzaW5MYW1iZGEgLyBzaW5TaWdtYTtcclxuXHRcdFx0XHRjb3NTcUFscGhhID0gMSAtIHNpbkFscGhhICogc2luQWxwaGE7XHJcblx0XHRcdFx0Y29zMlNpZ21hTSA9IGNvc1NpZ21hIC0gMiAqIHNpblUxICogc2luVTIgLyBjb3NTcUFscGhhO1xyXG5cclxuXHRcdFx0XHRpZiAoaXNOYU4oY29zMlNpZ21hTSkpIHtcclxuXHRcdFx0XHRcdGNvczJTaWdtYU0gPSAwOyAgLy8gZXF1YXRvcmlhbCBsaW5lOiBjb3NTcUFscGhhPTAgKMKnNilcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dmFyIEMgPSAoXHJcblx0XHRcdFx0XHRmIC8gMTYgKiBjb3NTcUFscGhhICogKFxyXG5cdFx0XHRcdFx0XHQ0ICsgZiAqIChcclxuXHRcdFx0XHRcdFx0XHQ0IC0gMyAqIGNvc1NxQWxwaGFcclxuXHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdFx0bGFtYmRhUCA9IGxhbWJkYTtcclxuXHRcdFx0XHRsYW1iZGEgPSAoXHJcblx0XHRcdFx0XHRMICsgKFxyXG5cdFx0XHRcdFx0XHQxIC0gQ1xyXG5cdFx0XHRcdFx0KSAqIGYgKiBzaW5BbHBoYSAqIChcclxuXHRcdFx0XHRcdFx0c2lnbWEgKyBDICogc2luU2lnbWEgKiAoXHJcblx0XHRcdFx0XHRcdFx0Y29zMlNpZ21hTSArIEMgKiBjb3NTaWdtYSAqIChcclxuXHRcdFx0XHRcdFx0XHRcdC0xICsgMiAqIGNvczJTaWdtYU0gKiBjb3MyU2lnbWFNXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdH0gd2hpbGUgKE1hdGguYWJzKGxhbWJkYS1sYW1iZGFQKSA+IDFlLTEyICYmIC0taXRlckxpbWl0PjApO1xyXG5cclxuXHRcdFx0aWYgKGl0ZXJMaW1pdCA9PT0gMCkge1xyXG5cdFx0XHRcdHJldHVybiBOYU47ICAvLyBmb3JtdWxhIGZhaWxlZCB0byBjb252ZXJnZVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgdVNxID0gKFxyXG5cdFx0XHRcdGNvc1NxQWxwaGEgKiAoXHJcblx0XHRcdFx0XHRhICogYSAtIGIgKiBiXHJcblx0XHRcdFx0KSAvIChcclxuXHRcdFx0XHRcdGIqYlxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHZhciBBID0gKFxyXG5cdFx0XHRcdDEgKyB1U3EgLyAxNjM4NCAqIChcclxuXHRcdFx0XHRcdDQwOTYgKyB1U3EgKiAoXHJcblx0XHRcdFx0XHRcdC03NjggKyB1U3EgKiAoXHJcblx0XHRcdFx0XHRcdFx0MzIwIC0gMTc1ICogdVNxXHJcblx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHR2YXIgQiA9IChcclxuXHRcdFx0XHR1U3EgLyAxMDI0ICogKFxyXG5cdFx0XHRcdFx0MjU2ICsgdVNxICogKFxyXG5cdFx0XHRcdFx0XHQtMTI4ICsgdVNxICogKFxyXG5cdFx0XHRcdFx0XHRcdDc0LTQ3ICogdVNxXHJcblx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHR2YXIgZGVsdGFTaWdtYSA9IChcclxuXHRcdFx0XHRCICogc2luU2lnbWEgKiAoXHJcblx0XHRcdFx0XHRjb3MyU2lnbWFNICsgQiAvIDQgKiAoXHJcblx0XHRcdFx0XHRcdGNvc1NpZ21hICogKFxyXG5cdFx0XHRcdFx0XHRcdC0xICsgMiAqIGNvczJTaWdtYU0gKiBjb3MyU2lnbWFNXHJcblx0XHRcdFx0XHRcdCkgLUIgLyA2ICogY29zMlNpZ21hTSAqIChcclxuXHRcdFx0XHRcdFx0XHQtMyArIDQgKiBzaW5TaWdtYSAqIHNpblNpZ21hXHJcblx0XHRcdFx0XHRcdCkgKiAoXHJcblx0XHRcdFx0XHRcdFx0LTMgKyA0ICogY29zMlNpZ21hTSAqIGNvczJTaWdtYU1cclxuXHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHZhciBkaXN0YW5jZSA9IGIgKiBBICogKHNpZ21hIC0gZGVsdGFTaWdtYSk7XHJcblxyXG5cdFx0XHRkaXN0YW5jZSA9IGRpc3RhbmNlLnRvRml4ZWQoMyk7IC8vIHJvdW5kIHRvIDFtbSBwcmVjaXNpb25cclxuXHJcblx0XHRcdC8vaWYgKHN0YXJ0Lmhhc093blByb3BlcnR5KGVsZXZhdGlvbikgJiYgZW5kLmhhc093blByb3BlcnR5KGVsZXZhdGlvbikpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLmVsZXZhdGlvbihzdGFydCkgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmVsZXZhdGlvbihlbmQpICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdHZhciBjbGltYiA9IE1hdGguYWJzKHRoaXMuZWxldmF0aW9uKHN0YXJ0KSAtIHRoaXMuZWxldmF0aW9uKGVuZCkpO1xyXG5cdFx0XHRcdGRpc3RhbmNlID0gTWF0aC5zcXJ0KGRpc3RhbmNlICogZGlzdGFuY2UgKyBjbGltYiAqIGNsaW1iKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXMuZGlzdGFuY2UgPSBNYXRoLmZsb29yKFxyXG5cdFx0XHRcdE1hdGgucm91bmQoZGlzdGFuY2UgLyBhY2N1cmFjeSkgKiBhY2N1cmFjeVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0LypcclxuXHRcdFx0Ly8gbm90ZTogdG8gcmV0dXJuIGluaXRpYWwvZmluYWwgYmVhcmluZ3MgaW4gYWRkaXRpb24gdG8gZGlzdGFuY2UsIHVzZSBzb21ldGhpbmcgbGlrZTpcclxuXHRcdFx0dmFyIGZ3ZEF6ID0gTWF0aC5hdGFuMihjb3NVMipzaW5MYW1iZGEsICBjb3NVMSpzaW5VMi1zaW5VMSpjb3NVMipjb3NMYW1iZGEpO1xyXG5cdFx0XHR2YXIgcmV2QXogPSBNYXRoLmF0YW4yKGNvc1UxKnNpbkxhbWJkYSwgLXNpblUxKmNvc1UyK2Nvc1UxKnNpblUyKmNvc0xhbWJkYSk7XHJcblxyXG5cdFx0XHRyZXR1cm4geyBkaXN0YW5jZTogcywgaW5pdGlhbEJlYXJpbmc6IGZ3ZEF6LnRvRGVnKCksIGZpbmFsQmVhcmluZzogcmV2QXoudG9EZWcoKSB9O1xyXG5cdFx0XHQqL1xyXG5cclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBzcG90cy4gXHJcblx0XHQqIFRoaXMgbWV0aG9kIGlzIG1vcmUgc2ltcGxlIGJ1dCBhbHNvIGZhciBtb3JlIGluYWNjdXJhdGVcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtICAgIG9iamVjdCAgICBTdGFydCBwb3NpdGlvbiB7bGF0aXR1ZGU6IDEyMywgbG9uZ2l0dWRlOiAxMjN9XHJcblx0XHQqIEBwYXJhbSAgICBvYmplY3QgICAgRW5kIHBvc2l0aW9uIHtsYXRpdHVkZTogMTIzLCBsb25naXR1ZGU6IDEyM31cclxuXHRcdCogQHBhcmFtICAgIGludGVnZXIgICBBY2N1cmFjeSAoaW4gbWV0ZXJzKVxyXG5cdFx0KiBAcmV0dXJuICAgaW50ZWdlciAgIERpc3RhbmNlIChpbiBtZXRlcnMpXHJcblx0XHQqL1xyXG5cdFx0Z2V0RGlzdGFuY2VTaW1wbGU6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQsIGFjY3VyYWN5KSB7XHJcblxyXG5cdFx0XHRhY2N1cmFjeSA9IE1hdGguZmxvb3IoYWNjdXJhY3kpIHx8IDE7XHJcblxyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBcclxuXHRcdFx0XHRNYXRoLnJvdW5kKFxyXG5cdFx0XHRcdFx0TWF0aC5hY29zKFxyXG5cdFx0XHRcdFx0XHRNYXRoLnNpbihcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmxhdGl0dWRlKGVuZCkudG9SYWQoKVxyXG5cdFx0XHRcdFx0XHQpICogXHJcblx0XHRcdFx0XHRcdE1hdGguc2luKFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubGF0aXR1ZGUoc3RhcnQpLnRvUmFkKClcclxuXHRcdFx0XHRcdFx0KSArIFxyXG5cdFx0XHRcdFx0XHRNYXRoLmNvcyhcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmxhdGl0dWRlKGVuZCkudG9SYWQoKVxyXG5cdFx0XHRcdFx0XHQpICogXHJcblx0XHRcdFx0XHRcdE1hdGguY29zKFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubGF0aXR1ZGUoc3RhcnQpLnRvUmFkKClcclxuXHRcdFx0XHRcdFx0KSAqIFxyXG5cdFx0XHRcdFx0XHRNYXRoLmNvcyhcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmxvbmdpdHVkZShzdGFydCkudG9SYWQoKSAtIHRoaXMubG9uZ2l0dWRlKGVuZCkudG9SYWQoKVxyXG5cdFx0XHRcdFx0XHQpIFxyXG5cdFx0XHRcdFx0KSAqIHRoaXMucmFkaXVzXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiBnZW9saWIuZGlzdGFuY2UgPSBNYXRoLmZsb29yKE1hdGgucm91bmQoZGlzdGFuY2UvYWNjdXJhY3kpKmFjY3VyYWN5KTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGEgY29sbGVjdGlvbiBvZiBnZW8gY29vcmRpbmF0ZXNcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdGFycmF5XHRcdENvbGxlY3Rpb24gb2YgY29vcmRzIFt7bGF0aXR1ZGU6IDUxLjUxMCwgbG9uZ2l0dWRlOiA3LjEzMjF9LCB7bGF0aXR1ZGU6IDQ5LjEyMzgsIGxvbmdpdHVkZTogXCI4wrAgMzAnIFdcIn0sIC4uLl1cclxuXHRcdCogQHJldHVyblx0XHRvYmplY3RcdFx0e2xhdGl0dWRlOiBjZW50ZXJMYXQsIGxvbmdpdHVkZTogY2VudGVyTG5nLCBkaXN0YW5jZTogZGlhZ29uYWxEaXN0YW5jZX1cclxuXHRcdCovXHJcblx0XHRnZXRDZW50ZXI6IGZ1bmN0aW9uKGNvb3Jkcykge1xyXG5cclxuXHRcdFx0aWYgKCFjb29yZHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgbWF4ID0gZnVuY3Rpb24oIGFycmF5ICl7XHJcblx0XHRcdFx0cmV0dXJuIE1hdGgubWF4LmFwcGx5KCBNYXRoLCBhcnJheSApO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0dmFyIG1pbiA9IGZ1bmN0aW9uKCBhcnJheSApe1xyXG5cdFx0XHRcdHJldHVybiBNYXRoLm1pbi5hcHBseSggTWF0aCwgYXJyYXkgKTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHZhclx0bGF0aXR1ZGU7XHJcblx0XHRcdHZhciBsb25naXR1ZGU7XHJcblx0XHRcdHZhciBzcGxpdENvb3JkcyA9IHtsYXRpdHVkZTogW10sIGxvbmdpdHVkZTogW119O1xyXG5cclxuXHRcdFx0Zm9yKHZhciBjb29yZCBpbiBjb29yZHMpIHtcclxuXHJcblx0XHRcdFx0c3BsaXRDb29yZHMubGF0aXR1ZGUucHVzaChcclxuXHRcdFx0XHRcdHRoaXMubGF0aXR1ZGUoY29vcmRzW2Nvb3JkXSlcclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRzcGxpdENvb3Jkcy5sb25naXR1ZGUucHVzaChcclxuXHRcdFx0XHRcdHRoaXMubG9uZ2l0dWRlKGNvb3Jkc1tjb29yZF0pXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBtaW5MYXQgPSBtaW4oc3BsaXRDb29yZHMubGF0aXR1ZGUpO1xyXG5cdFx0XHR2YXIgbWluTG9uID0gbWluKHNwbGl0Q29vcmRzLmxvbmdpdHVkZSk7XHJcblx0XHRcdHZhciBtYXhMYXQgPSBtYXgoc3BsaXRDb29yZHMubGF0aXR1ZGUpO1xyXG5cdFx0XHR2YXIgbWF4TG9uID0gbWF4KHNwbGl0Q29vcmRzLmxvbmdpdHVkZSk7XHJcblxyXG5cdFx0XHRsYXRpdHVkZSA9ICgobWluTGF0ICsgbWF4TGF0KS8yKS50b0ZpeGVkKDYpO1xyXG5cdFx0XHRsb25naXR1ZGUgPSAoKG1pbkxvbiArIG1heExvbikvMikudG9GaXhlZCg2KTtcclxuXHJcblx0XHRcdC8vIGRpc3RhbmNlIGZyb20gdGhlIGRlZXBlc3QgbGVmdCB0byB0aGUgaGlnaGVzdCByaWdodCBwb2ludCAoZGlhZ29uYWwgZGlzdGFuY2UpXHJcblx0XHRcdHZhciBkaXN0YW5jZSA9IHRoaXMuY29udmVydFVuaXQoJ2ttJywgdGhpcy5nZXREaXN0YW5jZSh7bGF0aXR1ZGU6IG1pbkxhdCwgbG9uZ2l0dWRlOiBtaW5Mb259LCB7bGF0aXR1ZGU6IG1heExhdCwgbG9uZ2l0dWRlOiBtYXhMb259KSk7XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdGxhdGl0dWRlOiBsYXRpdHVkZSwgXHJcblx0XHRcdFx0bG9uZ2l0dWRlOiBsb25naXR1ZGUsIFxyXG5cdFx0XHRcdGRpc3RhbmNlOiBkaXN0YW5jZVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdH0sXHJcblxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogR2V0cyB0aGUgbWF4IGFuZCBtaW4sIGxhdGl0dWRlLCBsb25naXR1ZGUsIGFuZCBlbGV2YXRpb24gKGlmIHByb3ZpZGVkKS5cclxuXHRcdCogQHBhcmFtXHRcdGFycmF5XHRcdGFycmF5IHdpdGggY29vcmRzIGUuZy4gW3tsYXRpdHVkZTogNTEuNTE0MywgbG9uZ2l0dWRlOiA3LjQxMzh9LCB7bGF0aXR1ZGU6IDEyMywgbG9uZ2l0dWRlOiAxMjN9LCAuLi5dIFxyXG5cdFx0KiBAcmV0dXJuXHRvYmplY3RcdFx0e21heExhdDogbWF4TGF0LFxyXG5cdFx0KiAgICAgICAgICAgICAgICAgICAgIG1pbkxhdDogbWluTGF0XHRcdFxyXG5cdFx0KiAgICAgICAgICAgICAgICAgICAgIG1heExuZzogbWF4TG5nLFxyXG5cdFx0KiAgICAgICAgICAgICAgICAgICAgIG1pbkxuZzogbWluTG5nLFxyXG5cdFx0KiAgICAgICAgICAgICAgICAgICAgIG1heEVsZXY6IG1heEVsZXYsXHJcblx0XHQqICAgICAgICAgICAgICAgICAgICAgbWluRWxldjogbWluRWxldn1cclxuXHRcdCovXHJcblx0XHRnZXRCb3VuZHM6IGZ1bmN0aW9uKGNvb3Jkcykge1xyXG5cclxuXHRcdFx0aWYgKCFjb29yZHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgdXNlRWxldmF0aW9uID0gdGhpcy5lbGV2YXRpb24oY29vcmRzWzBdKTtcclxuXHJcblx0XHRcdHZhciBzdGF0cyA9IHtcclxuXHRcdFx0XHRtYXhMYXQ6IC1JbmZpbml0eSxcclxuXHRcdFx0XHRtaW5MYXQ6IEluZmluaXR5LFxyXG5cdFx0XHRcdG1heExuZzogLUluZmluaXR5LFxyXG5cdFx0XHRcdG1pbkxuZzogSW5maW5pdHlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmICh0eXBlb2YgdXNlRWxldmF0aW9uICE9ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0c3RhdHMubWF4RWxldiA9IDA7XHJcblx0XHRcdFx0c3RhdHMubWluRWxldiA9IEluZmluaXR5O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IGNvb3Jkcy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuXHJcblx0XHRcdFx0c3RhdHMubWF4TGF0ID0gTWF0aC5tYXgodGhpcy5sYXRpdHVkZShjb29yZHNbaV0pLCBzdGF0cy5tYXhMYXQpO1xyXG5cdFx0XHRcdHN0YXRzLm1pbkxhdCA9IE1hdGgubWluKHRoaXMubGF0aXR1ZGUoY29vcmRzW2ldKSwgc3RhdHMubWluTGF0KTtcclxuXHRcdFx0XHRzdGF0cy5tYXhMbmcgPSBNYXRoLm1heCh0aGlzLmxvbmdpdHVkZShjb29yZHNbaV0pLCBzdGF0cy5tYXhMbmcpO1xyXG5cdFx0XHRcdHN0YXRzLm1pbkxuZyA9IE1hdGgubWluKHRoaXMubG9uZ2l0dWRlKGNvb3Jkc1tpXSksIHN0YXRzLm1pbkxuZyk7XHJcblxyXG5cdFx0XHRcdGlmICh1c2VFbGV2YXRpb24pIHtcclxuXHRcdFx0XHRcdHN0YXRzLm1heEVsZXYgPSBNYXRoLm1heCh0aGlzLmVsZXZhdGlvbihjb29yZHNbaV0pLCBzdGF0cy5tYXhFbGV2KTtcclxuXHRcdFx0XHRcdHN0YXRzLm1pbkVsZXYgPSBNYXRoLm1pbih0aGlzLmVsZXZhdGlvbihjb29yZHNbaV0pLCBzdGF0cy5taW5FbGV2KTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gc3RhdHM7XHJcblxyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIENvbXB1dGVzIHRoZSBib3VuZGluZyBjb29yZGluYXRlcyBvZiBhbGwgcG9pbnRzIG9uIHRoZSBzdXJmYWNlXHJcblx0XHQqIG9mIHRoZSBlYXJ0aCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHNwZWNpZmllZCBncmVhdCBjaXJjbGVcclxuXHRcdCogZGlzdGFuY2UuXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbSBvYmplY3QgUG9pbnQgcG9zaXRpb24ge2xhdGl0dWRlOiAxMjMsIGxvbmdpdHVkZTogMTIzfVxyXG5cdFx0KiBAcGFyYW0gbnVtYmVyIERpc3RhbmNlIChpbiBtZXRlcnMpLlxyXG5cdFx0KiBAcmV0dXJuIGFycmF5IENvbGxlY3Rpb24gb2YgdHdvIHBvaW50cyBkZWZpbmluZyB0aGUgU1cgYW5kIE5FIGNvcm5lcnMuXHJcblx0XHQqL1xyXG5cdFx0Z2V0Qm91bmRzT2ZEaXN0YW5jZTogZnVuY3Rpb24ocG9pbnQsIGRpc3RhbmNlKSB7XHJcblxyXG5cdFx0XHR2YXIgbGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlKHBvaW50KTtcclxuXHRcdFx0dmFyIGxvbmdpdHVkZSA9IHRoaXMubG9uZ2l0dWRlKHBvaW50KTtcclxuXHJcblx0XHRcdHZhciByYWRMYXQgPSBsYXRpdHVkZS50b1JhZCgpO1xyXG5cdFx0XHR2YXIgcmFkTG9uID0gbG9uZ2l0dWRlLnRvUmFkKCk7XHJcblxyXG5cdFx0XHR2YXIgcmFkRGlzdCA9IGRpc3RhbmNlIC8gdGhpcy5yYWRpdXM7XHJcblx0XHRcdHZhciBtaW5MYXQgPSByYWRMYXQgLSByYWREaXN0O1xyXG5cdFx0XHR2YXIgbWF4TGF0ID0gcmFkTGF0ICsgcmFkRGlzdDtcclxuXHJcblx0XHRcdHZhciBNQVhfTEFUX1JBRCA9IHRoaXMubWF4TGF0LnRvUmFkKCk7XHJcblx0XHRcdHZhciBNSU5fTEFUX1JBRCA9IHRoaXMubWluTGF0LnRvUmFkKCk7XHJcblx0XHRcdHZhciBNQVhfTE9OX1JBRCA9IHRoaXMubWF4TG9uLnRvUmFkKCk7XHJcblx0XHRcdHZhciBNSU5fTE9OX1JBRCA9IHRoaXMubWluTG9uLnRvUmFkKCk7XHJcblxyXG5cdFx0XHR2YXIgbWluTG9uO1xyXG5cdFx0XHR2YXIgbWF4TG9uO1xyXG5cclxuXHRcdFx0aWYgKG1pbkxhdCA+IE1JTl9MQVRfUkFEICYmIG1heExhdCA8IE1BWF9MQVRfUkFEKSB7XHJcblxyXG5cdFx0XHRcdHZhciBkZWx0YUxvbiA9IE1hdGguYXNpbihNYXRoLnNpbihyYWREaXN0KSAvIE1hdGguY29zKHJhZExhdCkpO1xyXG5cdFx0XHRcdG1pbkxvbiA9IHJhZExvbiAtIGRlbHRhTG9uO1xyXG5cclxuXHRcdFx0XHRpZiAobWluTG9uIDwgTUlOX0xPTl9SQUQpIHtcclxuXHRcdFx0XHRcdG1pbkxvbiArPSAyICogTWF0aC5QSTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG1heExvbiA9IHJhZExvbiArIGRlbHRhTG9uO1xyXG5cclxuXHRcdFx0XHRpZiAobWF4TG9uID4gTUFYX0xPTl9SQUQpIHtcclxuXHRcdFx0XHRcdG1heExvbiAtPSAyICogTWF0aC5QSTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIEEgcG9sZSBpcyB3aXRoaW4gdGhlIGRpc3RhbmNlLlxyXG5cdFx0XHRcdG1pbkxhdCA9IE1hdGgubWF4KG1pbkxhdCwgTUlOX0xBVF9SQUQpO1xyXG5cdFx0XHRcdG1heExhdCA9IE1hdGgubWluKG1heExhdCwgTUFYX0xBVF9SQUQpO1xyXG5cdFx0XHRcdG1pbkxvbiA9IE1JTl9MT05fUkFEO1xyXG5cdFx0XHRcdG1heExvbiA9IE1BWF9MT05fUkFEO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gW1xyXG5cdFx0XHRcdC8vIFNvdXRod2VzdFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGxhdGl0dWRlOiBtaW5MYXQudG9EZWcoKSwgXHJcblx0XHRcdFx0XHRsb25naXR1ZGU6IG1pbkxvbi50b0RlZygpXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHQvLyBOb3J0aGVhc3RcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsYXRpdHVkZTogbWF4TGF0LnRvRGVnKCksIFxyXG5cdFx0XHRcdFx0bG9uZ2l0dWRlOiBtYXhMb24udG9EZWcoKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIHdoZXRoZXIgYSBwb2ludCBpcyBpbnNpZGUgb2YgYSBwb2x5Z29uIG9yIG5vdC5cclxuXHRcdCogTm90ZSB0aGF0IHRoZSBwb2x5Z29uIGNvb3JkcyBtdXN0IGJlIGluIGNvcnJlY3Qgb3JkZXIhXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbVx0XHRvYmplY3RcdFx0Y29vcmRpbmF0ZSB0byBjaGVjayBlLmcuIHtsYXRpdHVkZTogNTEuNTAyMywgbG9uZ2l0dWRlOiA3LjM4MTV9XHJcblx0XHQqIEBwYXJhbVx0XHRhcnJheVx0XHRhcnJheSB3aXRoIGNvb3JkcyBlLmcuIFt7bGF0aXR1ZGU6IDUxLjUxNDMsIGxvbmdpdHVkZTogNy40MTM4fSwge2xhdGl0dWRlOiAxMjMsIGxvbmdpdHVkZTogMTIzfSwgLi4uXSBcclxuXHRcdCogQHJldHVyblx0XHRib29sXHRcdHRydWUgaWYgdGhlIGNvb3JkaW5hdGUgaXMgaW5zaWRlIHRoZSBnaXZlbiBwb2x5Z29uXHJcblx0XHQqL1xyXG5cdFx0aXNQb2ludEluc2lkZTogZnVuY3Rpb24obGF0bG5nLCBjb29yZHMpIHtcclxuXHJcblx0XHRcdGZvcih2YXIgYyA9IGZhbHNlLCBpID0gLTEsIGwgPSBjb29yZHMubGVuZ3RoLCBqID0gbCAtIDE7ICsraSA8IGw7IGogPSBpKSB7XHJcblxyXG5cdFx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHQodGhpcy5sb25naXR1ZGUoY29vcmRzW2ldKSA8PSB0aGlzLmxvbmdpdHVkZShsYXRsbmcpICYmIHRoaXMubG9uZ2l0dWRlKGxhdGxuZykgPCB0aGlzLmxvbmdpdHVkZShjb29yZHNbal0pKSB8fFxyXG5cdFx0XHRcdFx0XHQodGhpcy5sb25naXR1ZGUoY29vcmRzW2pdKSA8PSB0aGlzLmxvbmdpdHVkZShsYXRsbmcpICYmIHRoaXMubG9uZ2l0dWRlKGxhdGxuZykgPCB0aGlzLmxvbmdpdHVkZShjb29yZHNbaV0pKVxyXG5cdFx0XHRcdFx0KSAmJiBcclxuXHRcdFx0XHRcdChcclxuXHRcdFx0XHRcdFx0dGhpcy5sYXRpdHVkZShsYXRsbmcpIDwgKHRoaXMubGF0aXR1ZGUoY29vcmRzW2pdKSAtIHRoaXMubGF0aXR1ZGUoY29vcmRzW2ldKSkgKiBcclxuXHRcdFx0XHRcdFx0KHRoaXMubG9uZ2l0dWRlKGxhdGxuZykgLSB0aGlzLmxvbmdpdHVkZShjb29yZHNbaV0pKSAvIFxyXG5cdFx0XHRcdFx0XHQodGhpcy5sb25naXR1ZGUoY29vcmRzW2pdKSAtIHRoaXMubG9uZ2l0dWRlKGNvb3Jkc1tpXSkpICsgXHJcblx0XHRcdFx0XHRcdHRoaXMubGF0aXR1ZGUoY29vcmRzW2ldKVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCkge1xyXG5cdFx0XHRcdFx0YyA9ICFjO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBjO1xyXG5cclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBTaG9ydGN1dCBmb3IgZ2VvbGliLmlzUG9pbnRJbnNpZGUoKVxyXG5cdFx0Ki9cclxuXHRcdGlzSW5zaWRlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuaXNQb2ludEluc2lkZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyB3aGV0aGVyIGEgcG9pbnQgaXMgaW5zaWRlIG9mIGEgY2lyY2xlIG9yIG5vdC5cclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdG9iamVjdFx0XHRjb29yZGluYXRlIHRvIGNoZWNrIChlLmcuIHtsYXRpdHVkZTogNTEuNTAyMywgbG9uZ2l0dWRlOiA3LjM4MTV9KVxyXG5cdFx0KiBAcGFyYW1cdFx0b2JqZWN0XHRcdGNvb3JkaW5hdGUgb2YgdGhlIGNpcmNsZSdzIGNlbnRlciAoZS5nLiB7bGF0aXR1ZGU6IDUxLjQ4MTIsIGxvbmdpdHVkZTogNy40MDI1fSlcclxuXHRcdCogQHBhcmFtXHRcdGludGVnZXJcdFx0bWF4aW11bSByYWRpdXMgaW4gbWV0ZXJzIFxyXG5cdFx0KiBAcmV0dXJuXHRcdGJvb2xcdFx0dHJ1ZSBpZiB0aGUgY29vcmRpbmF0ZSBpcyB3aXRoaW4gdGhlIGdpdmVuIHJhZGl1c1xyXG5cdFx0Ki9cclxuXHRcdGlzUG9pbnRJbkNpcmNsZTogZnVuY3Rpb24obGF0bG5nLCBjZW50ZXIsIHJhZGl1cykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXREaXN0YW5jZShsYXRsbmcsIGNlbnRlcikgPCByYWRpdXM7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogU2hvcnRjdXQgZm9yIGdlb2xpYi5pc1BvaW50SW5DaXJjbGUoKVxyXG5cdFx0Ki9cclxuXHRcdHdpdGhpblJhZGl1czogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmlzUG9pbnRJbkNpcmNsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIEdldHMgcmh1bWIgbGluZSBiZWFyaW5nIG9mIHR3byBwb2ludHMuIEZpbmQgb3V0IGFib3V0IHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gcmh1bWIgbGluZSBhbmQgXHJcblx0XHQqIGdyZWF0IGNpcmNsZSBiZWFyaW5nIG9uIFdpa2lwZWRpYS4gSXQncyBxdWl0ZSBjb21wbGljYXRlZC4gUmh1bWIgbGluZSBzaG91bGQgYmUgZmluZSBpbiBtb3N0IGNhc2VzOlxyXG5cdFx0KlxyXG5cdFx0KiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JodW1iX2xpbmUjR2VuZXJhbF9hbmRfbWF0aGVtYXRpY2FsX2Rlc2NyaXB0aW9uXHJcblx0XHQqIFxyXG5cdFx0KiBGdW5jdGlvbiBoZWF2aWx5IGJhc2VkIG9uIERvdWcgVmFuZGVyd2VpZGUncyBncmVhdCBQSFAgdmVyc2lvbiAobGljZW5zZWQgdW5kZXIgR1BMIDMuMClcclxuXHRcdCogaHR0cDovL3d3dy5kb3Vndi5jb20vMjAwOS8wNy8xMy9jYWxjdWxhdGluZy10aGUtYmVhcmluZy1hbmQtY29tcGFzcy1yb3NlLWRpcmVjdGlvbi1iZXR3ZWVuLXR3by1sYXRpdHVkZS1sb25naXR1ZGUtY29vcmRpbmF0ZXMtaW4tcGhwL1xyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW1cdFx0b2JqZWN0XHRcdG9yaWdpbiBjb29yZGluYXRlIChlLmcuIHtsYXRpdHVkZTogNTEuNTAyMywgbG9uZ2l0dWRlOiA3LjM4MTV9KVxyXG5cdFx0KiBAcGFyYW1cdFx0b2JqZWN0XHRcdGRlc3RpbmF0aW9uIGNvb3JkaW5hdGVcclxuXHRcdCogQHJldHVyblx0XHRpbnRlZ2VyXHRcdGNhbGN1bGF0ZWQgYmVhcmluZ1xyXG5cdFx0Ki9cclxuXHRcdGdldFJodW1iTGluZUJlYXJpbmc6IGZ1bmN0aW9uKG9yaWdpbkxMLCBkZXN0TEwpIHtcclxuXHJcblx0XHRcdC8vIGRpZmZlcmVuY2Ugb2YgbG9uZ2l0dWRlIGNvb3Jkc1xyXG5cdFx0XHR2YXIgZGlmZkxvbiA9IHRoaXMubG9uZ2l0dWRlKGRlc3RMTCkudG9SYWQoKSAtIHRoaXMubG9uZ2l0dWRlKG9yaWdpbkxMKS50b1JhZCgpO1xyXG5cclxuXHRcdFx0Ly8gZGlmZmVyZW5jZSBsYXRpdHVkZSBjb29yZHMgcGhpXHJcblx0XHRcdHZhciBkaWZmUGhpID0gTWF0aC5sb2coXHJcblx0XHRcdFx0TWF0aC50YW4oXHJcblx0XHRcdFx0XHR0aGlzLmxhdGl0dWRlKGRlc3RMTCkudG9SYWQoKSAvIDIgKyBNYXRoLlBJIC8gNFxyXG5cdFx0XHRcdCkgLyBcclxuXHRcdFx0XHRNYXRoLnRhbihcclxuXHRcdFx0XHRcdHRoaXMubGF0aXR1ZGUob3JpZ2luTEwpLnRvUmFkKCkgLyAyICsgTWF0aC5QSSAvIDRcclxuXHRcdFx0XHQpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHQvLyByZWNhbGN1bGF0ZSBkaWZmTG9uIGlmIGl0IGlzIGdyZWF0ZXIgdGhhbiBwaVxyXG5cdFx0XHRpZihNYXRoLmFicyhkaWZmTG9uKSA+IE1hdGguUEkpIHtcclxuXHRcdFx0XHRpZihkaWZmTG9uID4gMCkge1xyXG5cdFx0XHRcdFx0ZGlmZkxvbiA9ICgyICogTWF0aC5QSSAtIGRpZmZMb24pICogLTE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0ZGlmZkxvbiA9IDIgKiBNYXRoLlBJICsgZGlmZkxvbjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vcmV0dXJuIHRoZSBhbmdsZSwgbm9ybWFsaXplZFxyXG5cdFx0XHRyZXR1cm4gKE1hdGguYXRhbjIoZGlmZkxvbiwgZGlmZlBoaSkudG9EZWcoKSArIDM2MCkgJSAzNjA7XHJcblxyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIEdldHMgZ3JlYXQgY2lyY2xlIGJlYXJpbmcgb2YgdHdvIHBvaW50cy4gU2VlIGRlc2NyaXB0aW9uIG9mIGdldFJodW1iTGluZUJlYXJpbmcgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdG9iamVjdFx0XHRvcmlnaW4gY29vcmRpbmF0ZSAoZS5nLiB7bGF0aXR1ZGU6IDUxLjUwMjMsIGxvbmdpdHVkZTogNy4zODE1fSlcclxuXHRcdCogQHBhcmFtXHRcdG9iamVjdFx0XHRkZXN0aW5hdGlvbiBjb29yZGluYXRlXHJcblx0XHQqIEByZXR1cm5cdFx0aW50ZWdlclx0XHRjYWxjdWxhdGVkIGJlYXJpbmdcclxuXHRcdCovXHJcblx0XHRnZXRCZWFyaW5nOiBmdW5jdGlvbihvcmlnaW5MTCwgZGVzdExMKSB7XHJcblxyXG5cdFx0XHRkZXN0TExbJ2xhdGl0dWRlJ10gPSB0aGlzLmxhdGl0dWRlKGRlc3RMTCk7XHJcblx0XHRcdGRlc3RMTFsnbG9uZ2l0dWRlJ10gPSB0aGlzLmxvbmdpdHVkZShkZXN0TEwpO1xyXG5cdFx0XHRvcmlnaW5MTFsnbGF0aXR1ZGUnXSA9IHRoaXMubGF0aXR1ZGUob3JpZ2luTEwpO1xyXG5cdFx0XHRvcmlnaW5MTFsnbG9uZ2l0dWRlJ10gPSB0aGlzLmxvbmdpdHVkZShvcmlnaW5MTCk7XHJcblxyXG5cdFx0XHR2YXIgYmVhcmluZyA9IChcclxuXHRcdFx0XHQoXHJcblx0XHRcdFx0XHRNYXRoLmF0YW4yKFxyXG5cdFx0XHRcdFx0XHRNYXRoLnNpbihcclxuXHRcdFx0XHRcdFx0XHRkZXN0TExbJ2xvbmdpdHVkZSddLnRvUmFkKCkgLSBcclxuXHRcdFx0XHRcdFx0XHRvcmlnaW5MTFsnbG9uZ2l0dWRlJ10udG9SYWQoKVxyXG5cdFx0XHRcdFx0XHQpICogXHJcblx0XHRcdFx0XHRcdE1hdGguY29zKFxyXG5cdFx0XHRcdFx0XHRcdGRlc3RMTFsnbGF0aXR1ZGUnXS50b1JhZCgpXHJcblx0XHRcdFx0XHRcdCksIFxyXG5cdFx0XHRcdFx0XHRNYXRoLmNvcyhcclxuXHRcdFx0XHRcdFx0XHRvcmlnaW5MTFsnbGF0aXR1ZGUnXS50b1JhZCgpXHJcblx0XHRcdFx0XHRcdCkgKiBcclxuXHRcdFx0XHRcdFx0TWF0aC5zaW4oXHJcblx0XHRcdFx0XHRcdFx0ZGVzdExMWydsYXRpdHVkZSddLnRvUmFkKClcclxuXHRcdFx0XHRcdFx0KSAtIFxyXG5cdFx0XHRcdFx0XHRNYXRoLnNpbihcclxuXHRcdFx0XHRcdFx0XHRvcmlnaW5MTFsnbGF0aXR1ZGUnXS50b1JhZCgpXHJcblx0XHRcdFx0XHRcdCkgKiBcclxuXHRcdFx0XHRcdFx0TWF0aC5jb3MoXHJcblx0XHRcdFx0XHRcdFx0ZGVzdExMWydsYXRpdHVkZSddLnRvUmFkKClcclxuXHRcdFx0XHRcdFx0KSAqIFxyXG5cdFx0XHRcdFx0XHRNYXRoLmNvcyhcclxuXHRcdFx0XHRcdFx0XHRkZXN0TExbJ2xvbmdpdHVkZSddLnRvUmFkKCkgLSBvcmlnaW5MTFsnbG9uZ2l0dWRlJ10udG9SYWQoKVxyXG5cdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0KS50b0RlZygpICsgMzYwXHJcblx0XHRcdCkgJSAzNjA7XHJcblxyXG5cdFx0XHRyZXR1cm4gYmVhcmluZztcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogR2V0cyB0aGUgY29tcGFzcyBkaXJlY3Rpb24gZnJvbSBhbiBvcmlnaW4gY29vcmRpbmF0ZSB0byBhIGRlc3RpbmF0aW9uIGNvb3JkaW5hdGUuXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbVx0XHRvYmplY3RcdFx0b3JpZ2luIGNvb3JkaW5hdGUgKGUuZy4ge2xhdGl0dWRlOiA1MS41MDIzLCBsb25naXR1ZGU6IDcuMzgxNX0pXHJcblx0XHQqIEBwYXJhbVx0XHRvYmplY3RcdFx0ZGVzdGluYXRpb24gY29vcmRpbmF0ZVxyXG5cdFx0KiBAcGFyYW1cdFx0c3RyaW5nXHRcdEJlYXJpbmcgbW9kZS4gQ2FuIGJlIGVpdGhlciBjaXJjbGUgb3Igcmh1bWJsaW5lXHJcblx0XHQqIEByZXR1cm5cdFx0b2JqZWN0XHRcdFJldHVybnMgYW4gb2JqZWN0IHdpdGggYSByb3VnaCAoTkVTVykgYW5kIGFuIGV4YWN0IGRpcmVjdGlvbiAoTk5FLCBORSwgRU5FLCBFLCBFU0UsIGV0YykuXHJcblx0XHQqL1xyXG5cdFx0Z2V0Q29tcGFzc0RpcmVjdGlvbjogZnVuY3Rpb24ob3JpZ2luTEwsIGRlc3RMTCwgYmVhcmluZ01vZGUpIHtcclxuXHJcblx0XHRcdHZhciBkaXJlY3Rpb247XHJcblx0XHRcdHZhciBiZWFyaW5nO1xyXG5cclxuXHRcdFx0aWYoYmVhcmluZ01vZGUgPT0gJ2NpcmNsZScpIHsgXHJcblx0XHRcdFx0Ly8gdXNlIGdyZWF0IGNpcmNsZSBiZWFyaW5nXHJcblx0XHRcdFx0YmVhcmluZyA9IHRoaXMuZ2V0QmVhcmluZyhvcmlnaW5MTCwgZGVzdExMKTtcclxuXHRcdFx0fSBlbHNlIHsgXHJcblx0XHRcdFx0Ly8gZGVmYXVsdCBpcyByaHVtYiBsaW5lIGJlYXJpbmdcclxuXHRcdFx0XHRiZWFyaW5nID0gdGhpcy5nZXRSaHVtYkxpbmVCZWFyaW5nKG9yaWdpbkxMLCBkZXN0TEwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzd2l0Y2goTWF0aC5yb3VuZChiZWFyaW5nLzIyLjUpKSB7XHJcblx0XHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0ge2V4YWN0OiBcIk5ORVwiLCByb3VnaDogXCJOXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0ge2V4YWN0OiBcIk5FXCIsIHJvdWdoOiBcIk5cIn07XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiRU5FXCIsIHJvdWdoOiBcIkVcIn07XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQ6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiRVwiLCByb3VnaDogXCJFXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0ge2V4YWN0OiBcIkVTRVwiLCByb3VnaDogXCJFXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2OlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0ge2V4YWN0OiBcIlNFXCIsIHJvdWdoOiBcIkVcIn07XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDc6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiU1NFXCIsIHJvdWdoOiBcIlNcIn07XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDg6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiU1wiLCByb3VnaDogXCJTXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA5OlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0ge2V4YWN0OiBcIlNTV1wiLCByb3VnaDogXCJTXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxMDpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IHtleGFjdDogXCJTV1wiLCByb3VnaDogXCJTXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxMTpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IHtleGFjdDogXCJXU1dcIiwgcm91Z2g6IFwiV1wifTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTI6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiV1wiLCByb3VnaDogXCJXXCJ9O1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxMzpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IHtleGFjdDogXCJXTldcIiwgcm91Z2g6IFwiV1wifTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTQ6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiTldcIiwgcm91Z2g6IFwiV1wifTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTU6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSB7ZXhhY3Q6IFwiTk5XXCIsIHJvdWdoOiBcIk5cIn07IFxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IHtleGFjdDogXCJOXCIsIHJvdWdoOiBcIk5cIn07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGRpcmVjdGlvblsnYmVhcmluZyddID0gYmVhcmluZztcclxuXHRcdFx0cmV0dXJuIGRpcmVjdGlvbjtcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogU2hvcnRjdXQgZm9yIGdldENvbXBhc3NEaXJlY3Rpb25cclxuXHRcdCovXHJcblx0XHRnZXREaXJlY3Rpb246IGZ1bmN0aW9uKG9yaWdpbkxMLCBkZXN0TEwsIGJlYXJpbmdNb2RlKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmdldENvbXBhc3NEaXJlY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBTb3J0cyBhbiBhcnJheSBvZiBjb29yZHMgYnkgZGlzdGFuY2UgZnJvbSBhIHJlZmVyZW5jZSBjb29yZGluYXRlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbVx0XHRvYmplY3RcdFx0cmVmZXJlbmNlIGNvb3JkaW5hdGUgZS5nLiB7bGF0aXR1ZGU6IDUxLjUwMjMsIGxvbmdpdHVkZTogNy4zODE1fVxyXG5cdFx0KiBAcGFyYW1cdFx0bWl4ZWRcdFx0YXJyYXkgb3Igb2JqZWN0IHdpdGggY29vcmRzIFt7bGF0aXR1ZGU6IDUxLjUxNDMsIGxvbmdpdHVkZTogNy40MTM4fSwge2xhdGl0dWRlOiAxMjMsIGxvbmdpdHVkZTogMTIzfSwgLi4uXSBcclxuXHRcdCogQHJldHVyblx0XHRhcnJheVx0XHRvcmRlcmVkIGFycmF5XHJcblx0XHQqL1xyXG5cdFx0b3JkZXJCeURpc3RhbmNlOiBmdW5jdGlvbihsYXRsbmcsIGNvb3Jkcykge1xyXG5cclxuXHRcdFx0dmFyIGNvb3Jkc0FycmF5ID0gW107XHJcblxyXG5cdFx0XHRmb3IodmFyIGNvb3JkIGluIGNvb3Jkcykge1xyXG5cclxuXHRcdFx0XHR2YXIgZCA9IHRoaXMuZ2V0RGlzdGFuY2UobGF0bG5nLCBjb29yZHNbY29vcmRdKTtcclxuXHJcblx0XHRcdFx0Y29vcmRzQXJyYXkucHVzaCh7XHJcblx0XHRcdFx0XHRrZXk6IGNvb3JkLCBcclxuXHRcdFx0XHRcdGxhdGl0dWRlOiB0aGlzLmxhdGl0dWRlKGNvb3Jkc1tjb29yZF0pLCBcclxuXHRcdFx0XHRcdGxvbmdpdHVkZTogdGhpcy5sb25naXR1ZGUoY29vcmRzW2Nvb3JkXSksIFxyXG5cdFx0XHRcdFx0ZGlzdGFuY2U6IGRcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBjb29yZHNBcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlOyB9KTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogRmluZHMgdGhlIG5lYXJlc3QgY29vcmRpbmF0ZSB0byBhIHJlZmVyZW5jZSBjb29yZGluYXRlXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbVx0XHRvYmplY3RcdFx0cmVmZXJlbmNlIGNvb3JkaW5hdGUgZS5nLiB7bGF0aXR1ZGU6IDUxLjUwMjMsIGxvbmdpdHVkZTogNy4zODE1fVxyXG5cdFx0KiBAcGFyYW1cdFx0bWl4ZWRcdFx0YXJyYXkgb3Igb2JqZWN0IHdpdGggY29vcmRzIFt7bGF0aXR1ZGU6IDUxLjUxNDMsIGxvbmdpdHVkZTogNy40MTM4fSwge2xhdGl0dWRlOiAxMjMsIGxvbmdpdHVkZTogMTIzfSwgLi4uXSBcclxuXHRcdCogQHJldHVyblx0XHRhcnJheVx0XHRvcmRlcmVkIGFycmF5XHJcblx0XHQqL1xyXG5cdFx0ZmluZE5lYXJlc3Q6IGZ1bmN0aW9uKGxhdGxuZywgY29vcmRzLCBvZmZzZXQsIGxpbWl0KSB7XHJcblxyXG5cdFx0XHRvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuXHRcdFx0bGltaXQgPSBsaW1pdCB8fCAxO1xyXG5cdFx0XHR2YXIgb3JkZXJlZCA9IHRoaXMub3JkZXJCeURpc3RhbmNlKGxhdGxuZywgY29vcmRzKTtcclxuXHJcblx0XHRcdGlmKGxpbWl0ID09PSAxKSB7XHJcblx0XHRcdFx0cmV0dXJuIG9yZGVyZWRbb2Zmc2V0XTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gb3JkZXJlZC5zcGxpY2Uob2Zmc2V0LCBsaW1pdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgZ2l2ZW4gcGF0aFxyXG5cdFx0KlxyXG5cdFx0KiBAcGFyYW1cdFx0bWl4ZWRcdFx0YXJyYXkgb3Igb2JqZWN0IHdpdGggY29vcmRzIFt7bGF0aXR1ZGU6IDUxLjUxNDMsIGxvbmdpdHVkZTogNy40MTM4fSwge2xhdGl0dWRlOiAxMjMsIGxvbmdpdHVkZTogMTIzfSwgLi4uXSBcclxuXHRcdCogQHJldHVyblx0XHRpbnRlZ2VyXHRcdGxlbmd0aCBvZiB0aGUgcGF0aCAoaW4gbWV0ZXJzKVxyXG5cdFx0Ki9cclxuXHRcdGdldFBhdGhMZW5ndGg6IGZ1bmN0aW9uKGNvb3Jkcykge1xyXG5cclxuXHRcdFx0dmFyIGRpc3QgPSAwO1xyXG5cdFx0XHR2YXIgbGFzdDtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gY29vcmRzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG5cdFx0XHRcdGlmKGxhc3QpIHtcclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coY29vcmRzW2ldLCBsYXN0LCB0aGlzLmdldERpc3RhbmNlKGNvb3Jkc1tpXSwgbGFzdCkpO1xyXG5cdFx0XHRcdFx0ZGlzdCArPSB0aGlzLmdldERpc3RhbmNlKHRoaXMuY29vcmRzKGNvb3Jkc1tpXSksIGxhc3QpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRsYXN0ID0gdGhpcy5jb29yZHMoY29vcmRzW2ldKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRpc3Q7XHJcblxyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIENhbGN1bGF0ZXMgdGhlIHNwZWVkIGJldHdlZW4gdG8gcG9pbnRzIHdpdGhpbiBhIGdpdmVuIHRpbWUgc3Bhbi5cclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdG9iamVjdFx0XHRjb29yZHMgd2l0aCBqYXZhc2NyaXB0IHRpbWVzdGFtcCB7bGF0aXR1ZGU6IDUxLjUxNDMsIGxvbmdpdHVkZTogNy40MTM4LCB0aW1lOiAxMzYwMjMxMjAwODgwfVxyXG5cdFx0KiBAcGFyYW1cdFx0b2JqZWN0XHRcdGNvb3JkcyB3aXRoIGphdmFzY3JpcHQgdGltZXN0YW1wIHtsYXRpdHVkZTogNTEuNTUwMiwgbG9uZ2l0dWRlOiA3LjQzMjMsIHRpbWU6IDEzNjAyNDU2MDA0NjB9XHJcblx0XHQqIEBwYXJhbVx0XHRvYmplY3RcdFx0b3B0aW9ucyAoY3VycmVudGx5IFwidW5pdFwiIGlzIHRoZSBvbmx5IG9wdGlvbi4gRGVmYXVsdDoga20oaCkpO1xyXG5cdFx0KiBAcmV0dXJuXHRcdGZsb2F0XHRcdHNwZWVkIGluIHVuaXQgcGVyIGhvdXJcclxuXHRcdCovXHJcblx0XHRnZXRTcGVlZDogZnVuY3Rpb24oc3RhcnQsIGVuZCwgb3B0aW9ucykge1xyXG5cclxuXHRcdFx0dmFyIHVuaXQgPSBvcHRpb25zICYmIG9wdGlvbnMudW5pdCB8fCAna20nO1xyXG5cclxuXHRcdFx0aWYodW5pdCA9PSAnbXBoJykge1xyXG5cdFx0XHRcdHVuaXQgPSAnbWknO1xyXG5cdFx0XHR9IGVsc2UgaWYodW5pdCA9PSAna21oJykge1xyXG5cdFx0XHRcdHVuaXQgPSAna20nO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBnZW9saWIuZ2V0RGlzdGFuY2Uoc3RhcnQsIGVuZCk7XHJcblx0XHRcdHZhciB0aW1lID0gKChlbmQudGltZSoxKS8xMDAwKSAtICgoc3RhcnQudGltZSoxKS8xMDAwKTtcclxuXHRcdFx0dmFyIG1QZXJIciA9IChkaXN0YW5jZS90aW1lKSozNjAwO1xyXG5cdFx0XHR2YXIgc3BlZWQgPSBNYXRoLnJvdW5kKG1QZXJIciAqIHRoaXMubWVhc3VyZXNbdW5pdF0gKiAxMDAwMCkvMTAwMDA7XHJcblx0XHRcdHJldHVybiBzcGVlZDtcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogQ29udmVydHMgYSBkaXN0YW5jZSBmcm9tIG1ldGVycyB0byBrbSwgbW0sIGNtLCBtaSwgZnQsIGluIG9yIHlkXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbVx0XHRzdHJpbmdcdFx0Rm9ybWF0IHRvIGJlIGNvbnZlcnRlZCBpblxyXG5cdFx0KiBAcGFyYW1cdFx0ZmxvYXRcdFx0RGlzdGFuY2UgaW4gbWV0ZXJzXHJcblx0XHQqIEBwYXJhbVx0XHRmbG9hdFx0XHREZWNpbWFsIHBsYWNlcyBmb3Igcm91bmRpbmcgKGRlZmF1bHQ6IDQpXHJcblx0XHQqIEByZXR1cm5cdFx0ZmxvYXRcdFx0Q29udmVydGVkIGRpc3RhbmNlXHJcblx0XHQqL1xyXG5cdFx0Y29udmVydFVuaXQ6IGZ1bmN0aW9uKHVuaXQsIGRpc3RhbmNlLCByb3VuZCkge1xyXG5cclxuXHRcdFx0aWYoZGlzdGFuY2UgPT09IDAgfHwgdHlwZW9mIGRpc3RhbmNlID09PSAndW5kZWZpbmVkJykge1xyXG5cclxuXHRcdFx0XHRpZih0aGlzLmRpc3RhbmNlID09PSAwKSB7XHJcblx0XHRcdFx0XHQvLyB0aHJvdyAnTm8gZGlzdGFuY2UgZ2l2ZW4uJztcclxuXHRcdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRkaXN0YW5jZSA9IHRoaXMuZGlzdGFuY2U7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dW5pdCA9IHVuaXQgfHwgJ20nO1xyXG5cdFx0XHRyb3VuZCA9IChudWxsID09IHJvdW5kID8gNCA6IHJvdW5kKTtcclxuXHJcblx0XHRcdGlmKHR5cGVvZiB0aGlzLm1lYXN1cmVzW3VuaXRdICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnJvdW5kKGRpc3RhbmNlICogdGhpcy5tZWFzdXJlc1t1bml0XSwgcm91bmQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignVW5rbm93biB1bml0IGZvciBjb252ZXJzaW9uLicpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGluIGRlY2ltYWwgZm9ybWF0IG9yLCBpZiBuZWNjZXNzYXJ5LCBjb252ZXJ0cyB0byBkZWNpbWFsXHJcblx0XHQqXHJcblx0XHQqIEBwYXJhbVx0XHRtaXhlZFx0XHRWYWx1ZShzKSB0byBiZSBjaGVja2VkL2NvbnZlcnRlZCAoYXJyYXkgb2YgbGF0bG5nIG9iamVjdHMsIGxhdGxuZyBvYmplY3QsIHNleGFnZXNpbWFsIHN0cmluZywgZmxvYXQpXHJcblx0XHQqIEByZXR1cm5cdFx0ZmxvYXRcdFx0SW5wdXQgZGF0YSBpbiBkZWNpbWFsIGZvcm1hdFxyXG5cdFx0Ki9cclxuXHRcdHVzZURlY2ltYWw6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG5cdFx0XHRpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XHJcblxyXG5cdFx0XHRcdHZhciBnZW9saWIgPSB0aGlzO1xyXG5cclxuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbih2YWwpIHtcclxuXHJcblx0XHRcdFx0XHQvL2lmKCFpc05hTihwYXJzZUZsb2F0KHZhbCkpKSB7XHJcblx0XHRcdFx0XHRpZihnZW9saWIuaXNEZWNpbWFsKHZhbCkpIHtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBnZW9saWIudXNlRGVjaW1hbCh2YWwpO1xyXG5cclxuXHRcdFx0XHRcdH0gZWxzZSBpZih0eXBlb2YgdmFsID09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRpZihnZW9saWIudmFsaWRhdGUodmFsKSkge1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZ2VvbGliLmNvb3Jkcyh2YWwpO1xyXG5cclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0Zm9yKHZhciBwcm9wIGluIHZhbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFsW3Byb3BdID0gZ2VvbGliLnVzZURlY2ltYWwodmFsW3Byb3BdKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWw7XHJcblxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKGdlb2xpYi5pc1NleGFnZXNpbWFsKHZhbCkpIHtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBnZW9saWIuc2V4YWdlc2ltYWwyZGVjaW1hbCh2YWwpO1xyXG5cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHJcblx0XHRcdH0gZWxzZSBpZih0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHRoaXMudmFsaWRhdGUodmFsdWUpKSB7XHJcblxyXG5cdFx0XHRcdHJldHVybiB0aGlzLmNvb3Jkcyh2YWx1ZSk7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0XHRmb3IodmFyIHByb3AgaW4gdmFsdWUpIHtcclxuXHRcdFx0XHRcdHZhbHVlW3Byb3BdID0gdGhpcy51c2VEZWNpbWFsKHZhbHVlW3Byb3BdKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRpZiAodGhpcy5pc0RlY2ltYWwodmFsdWUpKSB7XHJcblxyXG5cdFx0XHRcdHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHJcblx0XHRcdH0gZWxzZSBpZih0aGlzLmlzU2V4YWdlc2ltYWwodmFsdWUpID09PSB0cnVlKSB7XHJcblxyXG5cdFx0XHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2V4YWdlc2ltYWwyZGVjaW1hbCh2YWx1ZSkpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGZvcm1hdC4nKTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBDb252ZXJ0cyBhIGRlY2ltYWwgY29vcmRpbmF0ZSB2YWx1ZSB0byBzZXhhZ2VzaW1hbCBmb3JtYXRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdGZsb2F0XHRcdGRlY2ltYWxcclxuXHRcdCogQHJldHVyblx0XHRzdHJpbmdcdFx0U2V4YWdlc2ltYWwgdmFsdWUgKFhYwrAgWVknIFpaXCIpXHJcblx0XHQqL1xyXG5cdFx0ZGVjaW1hbDJzZXhhZ2VzaW1hbDogZnVuY3Rpb24oZGVjKSB7XHJcblxyXG5cdFx0XHRpZiAoZGVjIGluIHRoaXMuc2V4YWdlc2ltYWwpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXhhZ2VzaW1hbFtkZWNdO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgdG1wID0gZGVjLnRvU3RyaW5nKCkuc3BsaXQoJy4nKTtcclxuXHJcblx0XHRcdHZhciBkZWcgPSBNYXRoLmFicyh0bXBbMF0pO1xyXG5cdFx0XHR2YXIgbWluID0gKCcwLicgKyB0bXBbMV0pKjYwO1xyXG5cdFx0XHR2YXIgc2VjID0gbWluLnRvU3RyaW5nKCkuc3BsaXQoJy4nKTtcclxuXHJcblx0XHRcdG1pbiA9IE1hdGguZmxvb3IobWluKTtcclxuXHRcdFx0c2VjID0gKCgnMC4nICsgc2VjWzFdKSAqIDYwKS50b0ZpeGVkKDIpO1xyXG5cclxuXHRcdFx0dGhpcy5zZXhhZ2VzaW1hbFtkZWNdID0gKGRlZyArICfCsCAnICsgbWluICsgXCInIFwiICsgc2VjICsgJ1wiJyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcy5zZXhhZ2VzaW1hbFtkZWNdO1xyXG5cclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBDb252ZXJ0cyBhIHNleGFnZXNpbWFsIGNvb3JkaW5hdGUgdG8gZGVjaW1hbCBmb3JtYXRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdGZsb2F0XHRcdFNleGFnZXNpbWFsIGNvb3JkaW5hdGVcclxuXHRcdCogQHJldHVyblx0XHRzdHJpbmdcdFx0RGVjaW1hbCB2YWx1ZSAoWFguWFhYWFhYWFgpXHJcblx0XHQqL1xyXG5cdFx0c2V4YWdlc2ltYWwyZGVjaW1hbDogZnVuY3Rpb24oc2V4YWdlc2ltYWwpIHtcclxuXHJcblx0XHRcdGlmIChzZXhhZ2VzaW1hbCBpbiB0aGlzLmRlY2ltYWwpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5kZWNpbWFsW3NleGFnZXNpbWFsXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyXHRyZWdFeCA9IG5ldyBSZWdFeHAodGhpcy5zZXhhZ2VzaW1hbFBhdHRlcm4pO1xyXG5cdFx0XHR2YXJcdGRhdGEgPSByZWdFeC5leGVjKHNleGFnZXNpbWFsKTtcclxuXHRcdFx0dmFyIG1pbiA9IDAsIHNlYyA9IDA7XHJcblxyXG5cdFx0XHRpZihkYXRhKSB7XHJcblx0XHRcdFx0bWluID0gcGFyc2VGbG9hdChkYXRhWzJdLzYwKTtcclxuXHRcdFx0XHRzZWMgPSBwYXJzZUZsb2F0KGRhdGFbNF0vMzYwMCkgfHwgMDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyXHRkZWMgPSAoKHBhcnNlRmxvYXQoZGF0YVsxXSkgKyBtaW4gKyBzZWMpKS50b0ZpeGVkKDgpO1xyXG5cdFx0XHQvL3Zhclx0ZGVjID0gKChwYXJzZUZsb2F0KGRhdGFbMV0pICsgbWluICsgc2VjKSk7XHJcblxyXG5cdFx0XHRcdC8vIFNvdXRoIGFuZCBXZXN0IGFyZSBuZWdhdGl2ZSBkZWNpbWFsc1xyXG5cdFx0XHRcdGRlYyA9IChkYXRhWzddID09ICdTJyB8fCBkYXRhWzddID09ICdXJykgPyBwYXJzZUZsb2F0KC1kZWMpIDogcGFyc2VGbG9hdChkZWMpO1xyXG5cdFx0XHRcdC8vZGVjID0gKGRhdGFbN10gPT0gJ1MnIHx8IGRhdGFbN10gPT0gJ1cnKSA/IC1kZWMgOiBkZWM7XHJcblxyXG5cdFx0XHR0aGlzLmRlY2ltYWxbc2V4YWdlc2ltYWxdID0gZGVjO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlYztcclxuXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgaW4gZGVjaW1hbCBmb3JtYXRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdHN0cmluZ1x0XHRWYWx1ZSB0byBiZSBjaGVja2VkXHJcblx0XHQqIEByZXR1cm5cdFx0Ym9vbFx0XHRUcnVlIGlmIGluIHNleGFnZXNpbWFsIGZvcm1hdFxyXG5cdFx0Ki9cclxuXHRcdGlzRGVjaW1hbDogZnVuY3Rpb24odmFsdWUpIHtcclxuXHJcblx0XHRcdHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHMqLywgJycpO1xyXG5cclxuXHRcdFx0Ly8gbG9va3Mgc2lsbHkgYnV0IHdvcmtzIGFzIGV4cGVjdGVkXHJcblx0XHRcdC8vIGNoZWNrcyBpZiB2YWx1ZSBpcyBpbiBkZWNpbWFsIGZvcm1hdFxyXG5cdFx0XHRyZXR1cm4gKCFpc05hTihwYXJzZUZsb2F0KHZhbHVlKSkgJiYgcGFyc2VGbG9hdCh2YWx1ZSkgPT0gdmFsdWUpO1xyXG5cclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0KiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBpbiBzZXhhZ2VzaW1hbCBmb3JtYXRcclxuXHRcdCpcclxuXHRcdCogQHBhcmFtXHRcdHN0cmluZ1x0XHRWYWx1ZSB0byBiZSBjaGVja2VkXHJcblx0XHQqIEByZXR1cm5cdFx0Ym9vbFx0XHRUcnVlIGlmIGluIHNleGFnZXNpbWFsIGZvcm1hdFxyXG5cdFx0Ki9cclxuXHRcdGlzU2V4YWdlc2ltYWw6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG5cdFx0XHR2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxzKi8sICcnKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzLnNleGFnZXNpbWFsUGF0dGVybi50ZXN0KHZhbHVlKTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHRcdHJvdW5kOiBmdW5jdGlvbih2YWx1ZSwgbikge1xyXG5cdFx0XHR2YXIgZGVjUGxhY2UgPSBNYXRoLnBvdygxMCwgbik7XHJcblx0XHRcdHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogZGVjUGxhY2UpL2RlY1BsYWNlO1xyXG5cdFx0fVxyXG5cclxuXHR9KTtcclxuXHJcblx0Ly8gTm9kZSBtb2R1bGVcclxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG5cclxuXHRcdGdsb2JhbC5nZW9saWIgPSBtb2R1bGUuZXhwb3J0cyA9IGdlb2xpYjtcclxuXHJcblx0Ly8gQU1EIG1vZHVsZVxyXG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcclxuXHJcblx0XHRkZWZpbmUoXCJnZW9saWJcIiwgW10sIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIGdlb2xpYjsgXHJcblx0XHR9KTtcclxuXHJcblx0Ly8gd2UncmUgaW4gYSBicm93c2VyXHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHRnbG9iYWwuZ2VvbGliID0gZ2VvbGliO1xyXG5cclxuXHR9XHJcblxyXG59KHRoaXMpKTsiLCIvKlxuIExlYWZsZXQsIGEgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBtb2JpbGUtZnJpZW5kbHkgaW50ZXJhY3RpdmUgbWFwcy4gaHR0cDovL2xlYWZsZXRqcy5jb21cbiAoYykgMjAxMC0yMDEzLCBWbGFkaW1pciBBZ2Fmb25raW5cbiAoYykgMjAxMC0yMDExLCBDbG91ZE1hZGVcbiovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xyXG52YXIgb2xkTCA9IHdpbmRvdy5MLFxyXG4gICAgTCA9IHt9O1xyXG5cclxuTC52ZXJzaW9uID0gJzAuNy4yJztcclxuXHJcbi8vIGRlZmluZSBMZWFmbGV0IGZvciBOb2RlIG1vZHVsZSBwYXR0ZXJuIGxvYWRlcnMsIGluY2x1ZGluZyBCcm93c2VyaWZ5XHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcblx0bW9kdWxlLmV4cG9ydHMgPSBMO1xyXG5cclxuLy8gZGVmaW5lIExlYWZsZXQgYXMgYW4gQU1EIG1vZHVsZVxyXG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG5cdGRlZmluZShMKTtcclxufVxyXG5cclxuLy8gZGVmaW5lIExlYWZsZXQgYXMgYSBnbG9iYWwgTCB2YXJpYWJsZSwgc2F2aW5nIHRoZSBvcmlnaW5hbCBMIHRvIHJlc3RvcmUgbGF0ZXIgaWYgbmVlZGVkXHJcblxyXG5MLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0d2luZG93LkwgPSBvbGRMO1xyXG5cdHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxud2luZG93LkwgPSBMO1xyXG5cblxuLypcclxuICogTC5VdGlsIGNvbnRhaW5zIHZhcmlvdXMgdXRpbGl0eSBmdW5jdGlvbnMgdXNlZCB0aHJvdWdob3V0IExlYWZsZXQgY29kZS5cclxuICovXHJcblxyXG5MLlV0aWwgPSB7XHJcblx0ZXh0ZW5kOiBmdW5jdGlvbiAoZGVzdCkgeyAvLyAoT2JqZWN0WywgT2JqZWN0LCAuLi5dKSAtPlxyXG5cdFx0dmFyIHNvdXJjZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxyXG5cdFx0ICAgIGksIGosIGxlbiwgc3JjO1xyXG5cclxuXHRcdGZvciAoaiA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcclxuXHRcdFx0c3JjID0gc291cmNlc1tqXSB8fCB7fTtcclxuXHRcdFx0Zm9yIChpIGluIHNyYykge1xyXG5cdFx0XHRcdGlmIChzcmMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHRcdFx0XHRcdGRlc3RbaV0gPSBzcmNbaV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGVzdDtcclxuXHR9LFxyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoZm4sIG9iaikgeyAvLyAoRnVuY3Rpb24sIE9iamVjdCkgLT4gRnVuY3Rpb25cclxuXHRcdHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogbnVsbDtcclxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiBmbi5hcHBseShvYmosIGFyZ3MgfHwgYXJndW1lbnRzKTtcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblx0c3RhbXA6IChmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbGFzdElkID0gMCxcclxuXHRcdCAgICBrZXkgPSAnX2xlYWZsZXRfaWQnO1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcclxuXHRcdFx0b2JqW2tleV0gPSBvYmpba2V5XSB8fCArK2xhc3RJZDtcclxuXHRcdFx0cmV0dXJuIG9ialtrZXldO1xyXG5cdFx0fTtcclxuXHR9KCkpLFxyXG5cclxuXHRpbnZva2VFYWNoOiBmdW5jdGlvbiAob2JqLCBtZXRob2QsIGNvbnRleHQpIHtcclxuXHRcdHZhciBpLCBhcmdzO1xyXG5cclxuXHRcdGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcclxuXHJcblx0XHRcdGZvciAoaSBpbiBvYmopIHtcclxuXHRcdFx0XHRtZXRob2QuYXBwbHkoY29udGV4dCwgW2ksIG9ialtpXV0uY29uY2F0KGFyZ3MpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0bGltaXRFeGVjQnlJbnRlcnZhbDogZnVuY3Rpb24gKGZuLCB0aW1lLCBjb250ZXh0KSB7XHJcblx0XHR2YXIgbG9jaywgZXhlY09uVW5sb2NrO1xyXG5cclxuXHRcdHJldHVybiBmdW5jdGlvbiB3cmFwcGVyRm4oKSB7XHJcblx0XHRcdHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG5cclxuXHRcdFx0aWYgKGxvY2spIHtcclxuXHRcdFx0XHRleGVjT25VbmxvY2sgPSB0cnVlO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bG9jayA9IHRydWU7XHJcblxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRsb2NrID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdGlmIChleGVjT25VbmxvY2spIHtcclxuXHRcdFx0XHRcdHdyYXBwZXJGbi5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuXHRcdFx0XHRcdGV4ZWNPblVubG9jayA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgdGltZSk7XHJcblxyXG5cdFx0XHRmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblx0ZmFsc2VGbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdGZvcm1hdE51bTogZnVuY3Rpb24gKG51bSwgZGlnaXRzKSB7XHJcblx0XHR2YXIgcG93ID0gTWF0aC5wb3coMTAsIGRpZ2l0cyB8fCA1KTtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKG51bSAqIHBvdykgLyBwb3c7XHJcblx0fSxcclxuXHJcblx0dHJpbTogZnVuY3Rpb24gKHN0cikge1xyXG5cdFx0cmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XHJcblx0fSxcclxuXHJcblx0c3BsaXRXb3JkczogZnVuY3Rpb24gKHN0cikge1xyXG5cdFx0cmV0dXJuIEwuVXRpbC50cmltKHN0cikuc3BsaXQoL1xccysvKTtcclxuXHR9LFxyXG5cclxuXHRzZXRPcHRpb25zOiBmdW5jdGlvbiAob2JqLCBvcHRpb25zKSB7XHJcblx0XHRvYmoub3B0aW9ucyA9IEwuZXh0ZW5kKHt9LCBvYmoub3B0aW9ucywgb3B0aW9ucyk7XHJcblx0XHRyZXR1cm4gb2JqLm9wdGlvbnM7XHJcblx0fSxcclxuXHJcblx0Z2V0UGFyYW1TdHJpbmc6IGZ1bmN0aW9uIChvYmosIGV4aXN0aW5nVXJsLCB1cHBlcmNhc2UpIHtcclxuXHRcdHZhciBwYXJhbXMgPSBbXTtcclxuXHRcdGZvciAodmFyIGkgaW4gb2JqKSB7XHJcblx0XHRcdHBhcmFtcy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudCh1cHBlcmNhc2UgPyBpLnRvVXBwZXJDYXNlKCkgOiBpKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpbaV0pKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoKCFleGlzdGluZ1VybCB8fCBleGlzdGluZ1VybC5pbmRleE9mKCc/JykgPT09IC0xKSA/ICc/JyA6ICcmJykgKyBwYXJhbXMuam9pbignJicpO1xyXG5cdH0sXHJcblx0dGVtcGxhdGU6IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcclxuXHRcdHJldHVybiBzdHIucmVwbGFjZSgvXFx7ICooW1xcd19dKykgKlxcfS9nLCBmdW5jdGlvbiAoc3RyLCBrZXkpIHtcclxuXHRcdFx0dmFyIHZhbHVlID0gZGF0YVtrZXldO1xyXG5cdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignTm8gdmFsdWUgcHJvdmlkZWQgZm9yIHZhcmlhYmxlICcgKyBzdHIpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdHZhbHVlID0gdmFsdWUoZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0aXNBcnJheTogQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XHJcblx0XHRyZXR1cm4gKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nKTtcclxuXHR9LFxyXG5cclxuXHRlbXB0eUltYWdlVXJsOiAnZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFBRC9BQ3dBQUFBQUFRQUJBQUFDQURzPSdcclxufTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblxyXG5cdC8vIGluc3BpcmVkIGJ5IGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXHJcblxyXG5cdGZ1bmN0aW9uIGdldFByZWZpeGVkKG5hbWUpIHtcclxuXHRcdHZhciBpLCBmbixcclxuXHRcdCAgICBwcmVmaXhlcyA9IFsnd2Via2l0JywgJ21veicsICdvJywgJ21zJ107XHJcblxyXG5cdFx0Zm9yIChpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aCAmJiAhZm47IGkrKykge1xyXG5cdFx0XHRmbiA9IHdpbmRvd1twcmVmaXhlc1tpXSArIG5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmbjtcclxuXHR9XHJcblxyXG5cdHZhciBsYXN0VGltZSA9IDA7XHJcblxyXG5cdGZ1bmN0aW9uIHRpbWVvdXREZWZlcihmbikge1xyXG5cdFx0dmFyIHRpbWUgPSArbmV3IERhdGUoKSxcclxuXHRcdCAgICB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAodGltZSAtIGxhc3RUaW1lKSk7XHJcblxyXG5cdFx0bGFzdFRpbWUgPSB0aW1lICsgdGltZVRvQ2FsbDtcclxuXHRcdHJldHVybiB3aW5kb3cuc2V0VGltZW91dChmbiwgdGltZVRvQ2FsbCk7XHJcblx0fVxyXG5cclxuXHR2YXIgcmVxdWVzdEZuID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdCAgICAgICAgZ2V0UHJlZml4ZWQoJ1JlcXVlc3RBbmltYXRpb25GcmFtZScpIHx8IHRpbWVvdXREZWZlcjtcclxuXHJcblx0dmFyIGNhbmNlbEZuID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0ICAgICAgICBnZXRQcmVmaXhlZCgnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnKSB8fFxyXG5cdCAgICAgICAgZ2V0UHJlZml4ZWQoJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZScpIHx8XHJcblx0ICAgICAgICBmdW5jdGlvbiAoaWQpIHsgd2luZG93LmNsZWFyVGltZW91dChpZCk7IH07XHJcblxyXG5cclxuXHRMLlV0aWwucmVxdWVzdEFuaW1GcmFtZSA9IGZ1bmN0aW9uIChmbiwgY29udGV4dCwgaW1tZWRpYXRlLCBlbGVtZW50KSB7XHJcblx0XHRmbiA9IEwuYmluZChmbiwgY29udGV4dCk7XHJcblxyXG5cdFx0aWYgKGltbWVkaWF0ZSAmJiByZXF1ZXN0Rm4gPT09IHRpbWVvdXREZWZlcikge1xyXG5cdFx0XHRmbigpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHJlcXVlc3RGbi5jYWxsKHdpbmRvdywgZm4sIGVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUgPSBmdW5jdGlvbiAoaWQpIHtcclxuXHRcdGlmIChpZCkge1xyXG5cdFx0XHRjYW5jZWxGbi5jYWxsKHdpbmRvdywgaWQpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG59KCkpO1xyXG5cclxuLy8gc2hvcnRjdXRzIGZvciBtb3N0IHVzZWQgdXRpbGl0eSBmdW5jdGlvbnNcclxuTC5leHRlbmQgPSBMLlV0aWwuZXh0ZW5kO1xyXG5MLmJpbmQgPSBMLlV0aWwuYmluZDtcclxuTC5zdGFtcCA9IEwuVXRpbC5zdGFtcDtcclxuTC5zZXRPcHRpb25zID0gTC5VdGlsLnNldE9wdGlvbnM7XHJcblxuXG4vKlxyXG4gKiBMLkNsYXNzIHBvd2VycyB0aGUgT09QIGZhY2lsaXRpZXMgb2YgdGhlIGxpYnJhcnkuXHJcbiAqIFRoYW5rcyB0byBKb2huIFJlc2lnIGFuZCBEZWFuIEVkd2FyZHMgZm9yIGluc3BpcmF0aW9uIVxyXG4gKi9cclxuXHJcbkwuQ2xhc3MgPSBmdW5jdGlvbiAoKSB7fTtcclxuXHJcbkwuQ2xhc3MuZXh0ZW5kID0gZnVuY3Rpb24gKHByb3BzKSB7XHJcblxyXG5cdC8vIGV4dGVuZGVkIGNsYXNzIHdpdGggdGhlIG5ldyBwcm90b3R5cGVcclxuXHR2YXIgTmV3Q2xhc3MgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gY2FsbCB0aGUgY29uc3RydWN0b3JcclxuXHRcdGlmICh0aGlzLmluaXRpYWxpemUpIHtcclxuXHRcdFx0dGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY2FsbCBhbGwgY29uc3RydWN0b3IgaG9va3NcclxuXHRcdGlmICh0aGlzLl9pbml0SG9va3MpIHtcclxuXHRcdFx0dGhpcy5jYWxsSW5pdEhvb2tzKCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gaW5zdGFudGlhdGUgY2xhc3Mgd2l0aG91dCBjYWxsaW5nIGNvbnN0cnVjdG9yXHJcblx0dmFyIEYgPSBmdW5jdGlvbiAoKSB7fTtcclxuXHRGLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xyXG5cclxuXHR2YXIgcHJvdG8gPSBuZXcgRigpO1xyXG5cdHByb3RvLmNvbnN0cnVjdG9yID0gTmV3Q2xhc3M7XHJcblxyXG5cdE5ld0NsYXNzLnByb3RvdHlwZSA9IHByb3RvO1xyXG5cclxuXHQvL2luaGVyaXQgcGFyZW50J3Mgc3RhdGljc1xyXG5cdGZvciAodmFyIGkgaW4gdGhpcykge1xyXG5cdFx0aWYgKHRoaXMuaGFzT3duUHJvcGVydHkoaSkgJiYgaSAhPT0gJ3Byb3RvdHlwZScpIHtcclxuXHRcdFx0TmV3Q2xhc3NbaV0gPSB0aGlzW2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gbWl4IHN0YXRpYyBwcm9wZXJ0aWVzIGludG8gdGhlIGNsYXNzXHJcblx0aWYgKHByb3BzLnN0YXRpY3MpIHtcclxuXHRcdEwuZXh0ZW5kKE5ld0NsYXNzLCBwcm9wcy5zdGF0aWNzKTtcclxuXHRcdGRlbGV0ZSBwcm9wcy5zdGF0aWNzO1xyXG5cdH1cclxuXHJcblx0Ly8gbWl4IGluY2x1ZGVzIGludG8gdGhlIHByb3RvdHlwZVxyXG5cdGlmIChwcm9wcy5pbmNsdWRlcykge1xyXG5cdFx0TC5VdGlsLmV4dGVuZC5hcHBseShudWxsLCBbcHJvdG9dLmNvbmNhdChwcm9wcy5pbmNsdWRlcykpO1xyXG5cdFx0ZGVsZXRlIHByb3BzLmluY2x1ZGVzO1xyXG5cdH1cclxuXHJcblx0Ly8gbWVyZ2Ugb3B0aW9uc1xyXG5cdGlmIChwcm9wcy5vcHRpb25zICYmIHByb3RvLm9wdGlvbnMpIHtcclxuXHRcdHByb3BzLm9wdGlvbnMgPSBMLmV4dGVuZCh7fSwgcHJvdG8ub3B0aW9ucywgcHJvcHMub3B0aW9ucyk7XHJcblx0fVxyXG5cclxuXHQvLyBtaXggZ2l2ZW4gcHJvcGVydGllcyBpbnRvIHRoZSBwcm90b3R5cGVcclxuXHRMLmV4dGVuZChwcm90bywgcHJvcHMpO1xyXG5cclxuXHRwcm90by5faW5pdEhvb2tzID0gW107XHJcblxyXG5cdHZhciBwYXJlbnQgPSB0aGlzO1xyXG5cdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXHJcblx0TmV3Q2xhc3MuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcclxuXHJcblx0Ly8gYWRkIG1ldGhvZCBmb3IgY2FsbGluZyBhbGwgaG9va3NcclxuXHRwcm90by5jYWxsSW5pdEhvb2tzID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICh0aGlzLl9pbml0SG9va3NDYWxsZWQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0aWYgKHBhcmVudC5wcm90b3R5cGUuY2FsbEluaXRIb29rcykge1xyXG5cdFx0XHRwYXJlbnQucHJvdG90eXBlLmNhbGxJbml0SG9va3MuY2FsbCh0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pbml0SG9va3NDYWxsZWQgPSB0cnVlO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwcm90by5faW5pdEhvb2tzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHByb3RvLl9pbml0SG9va3NbaV0uY2FsbCh0aGlzKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gTmV3Q2xhc3M7XHJcbn07XHJcblxyXG5cclxuLy8gbWV0aG9kIGZvciBhZGRpbmcgcHJvcGVydGllcyB0byBwcm90b3R5cGVcclxuTC5DbGFzcy5pbmNsdWRlID0gZnVuY3Rpb24gKHByb3BzKSB7XHJcblx0TC5leHRlbmQodGhpcy5wcm90b3R5cGUsIHByb3BzKTtcclxufTtcclxuXHJcbi8vIG1lcmdlIG5ldyBkZWZhdWx0IG9wdGlvbnMgdG8gdGhlIENsYXNzXHJcbkwuQ2xhc3MubWVyZ2VPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRMLmV4dGVuZCh0aGlzLnByb3RvdHlwZS5vcHRpb25zLCBvcHRpb25zKTtcclxufTtcclxuXHJcbi8vIGFkZCBhIGNvbnN0cnVjdG9yIGhvb2tcclxuTC5DbGFzcy5hZGRJbml0SG9vayA9IGZ1bmN0aW9uIChmbikgeyAvLyAoRnVuY3Rpb24pIHx8IChTdHJpbmcsIGFyZ3MuLi4pXHJcblx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG5cclxuXHR2YXIgaW5pdCA9IHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyA/IGZuIDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpc1tmbl0uYXBwbHkodGhpcywgYXJncyk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5wcm90b3R5cGUuX2luaXRIb29rcyA9IHRoaXMucHJvdG90eXBlLl9pbml0SG9va3MgfHwgW107XHJcblx0dGhpcy5wcm90b3R5cGUuX2luaXRIb29rcy5wdXNoKGluaXQpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5NaXhpbi5FdmVudHMgaXMgdXNlZCB0byBhZGQgY3VzdG9tIGV2ZW50cyBmdW5jdGlvbmFsaXR5IHRvIExlYWZsZXQgY2xhc3Nlcy5cclxuICovXHJcblxyXG52YXIgZXZlbnRzS2V5ID0gJ19sZWFmbGV0X2V2ZW50cyc7XHJcblxyXG5MLk1peGluID0ge307XHJcblxyXG5MLk1peGluLkV2ZW50cyA9IHtcclxuXHJcblx0YWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKHR5cGVzLCBmbiwgY29udGV4dCkgeyAvLyAoU3RyaW5nLCBGdW5jdGlvblssIE9iamVjdF0pIG9yIChPYmplY3RbLCBPYmplY3RdKVxyXG5cclxuXHRcdC8vIHR5cGVzIGNhbiBiZSBhIG1hcCBvZiB0eXBlcy9oYW5kbGVyc1xyXG5cdFx0aWYgKEwuVXRpbC5pbnZva2VFYWNoKHR5cGVzLCB0aGlzLmFkZEV2ZW50TGlzdGVuZXIsIHRoaXMsIGZuLCBjb250ZXh0KSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdHZhciBldmVudHMgPSB0aGlzW2V2ZW50c0tleV0gPSB0aGlzW2V2ZW50c0tleV0gfHwge30sXHJcblx0XHQgICAgY29udGV4dElkID0gY29udGV4dCAmJiBjb250ZXh0ICE9PSB0aGlzICYmIEwuc3RhbXAoY29udGV4dCksXHJcblx0XHQgICAgaSwgbGVuLCBldmVudCwgdHlwZSwgaW5kZXhLZXksIGluZGV4TGVuS2V5LCB0eXBlSW5kZXg7XHJcblxyXG5cdFx0Ly8gdHlwZXMgY2FuIGJlIGEgc3RyaW5nIG9mIHNwYWNlLXNlcGFyYXRlZCB3b3Jkc1xyXG5cdFx0dHlwZXMgPSBMLlV0aWwuc3BsaXRXb3Jkcyh0eXBlcyk7XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdHlwZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0ZXZlbnQgPSB7XHJcblx0XHRcdFx0YWN0aW9uOiBmbixcclxuXHRcdFx0XHRjb250ZXh0OiBjb250ZXh0IHx8IHRoaXNcclxuXHRcdFx0fTtcclxuXHRcdFx0dHlwZSA9IHR5cGVzW2ldO1xyXG5cclxuXHRcdFx0aWYgKGNvbnRleHRJZCkge1xyXG5cdFx0XHRcdC8vIHN0b3JlIGxpc3RlbmVycyBvZiBhIHBhcnRpY3VsYXIgY29udGV4dCBpbiBhIHNlcGFyYXRlIGhhc2ggKGlmIGl0IGhhcyBhbiBpZClcclxuXHRcdFx0XHQvLyBnaXZlcyBhIG1ham9yIHBlcmZvcm1hbmNlIGJvb3N0IHdoZW4gcmVtb3ZpbmcgdGhvdXNhbmRzIG9mIG1hcCBsYXllcnNcclxuXHJcblx0XHRcdFx0aW5kZXhLZXkgPSB0eXBlICsgJ19pZHgnO1xyXG5cdFx0XHRcdGluZGV4TGVuS2V5ID0gaW5kZXhLZXkgKyAnX2xlbic7XHJcblxyXG5cdFx0XHRcdHR5cGVJbmRleCA9IGV2ZW50c1tpbmRleEtleV0gPSBldmVudHNbaW5kZXhLZXldIHx8IHt9O1xyXG5cclxuXHRcdFx0XHRpZiAoIXR5cGVJbmRleFtjb250ZXh0SWRdKSB7XHJcblx0XHRcdFx0XHR0eXBlSW5kZXhbY29udGV4dElkXSA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdC8vIGtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBrZXlzIGluIHRoZSBpbmRleCB0byBxdWlja2x5IGNoZWNrIGlmIGl0J3MgZW1wdHlcclxuXHRcdFx0XHRcdGV2ZW50c1tpbmRleExlbktleV0gPSAoZXZlbnRzW2luZGV4TGVuS2V5XSB8fCAwKSArIDE7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0eXBlSW5kZXhbY29udGV4dElkXS5wdXNoKGV2ZW50KTtcclxuXHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGV2ZW50c1t0eXBlXSA9IGV2ZW50c1t0eXBlXSB8fCBbXTtcclxuXHRcdFx0XHRldmVudHNbdHlwZV0ucHVzaChldmVudCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRoYXNFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKHR5cGUpIHsgLy8gKFN0cmluZykgLT4gQm9vbGVhblxyXG5cdFx0dmFyIGV2ZW50cyA9IHRoaXNbZXZlbnRzS2V5XTtcclxuXHRcdHJldHVybiAhIWV2ZW50cyAmJiAoKHR5cGUgaW4gZXZlbnRzICYmIGV2ZW50c1t0eXBlXS5sZW5ndGggPiAwKSB8fFxyXG5cdFx0ICAgICAgICAgICAgICAgICAgICAodHlwZSArICdfaWR4JyBpbiBldmVudHMgJiYgZXZlbnRzW3R5cGUgKyAnX2lkeF9sZW4nXSA+IDApKTtcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAodHlwZXMsIGZuLCBjb250ZXh0KSB7IC8vIChbU3RyaW5nLCBGdW5jdGlvbiwgT2JqZWN0XSkgb3IgKE9iamVjdFssIE9iamVjdF0pXHJcblxyXG5cdFx0aWYgKCF0aGlzW2V2ZW50c0tleV0pIHtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0eXBlcykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbGVhckFsbEV2ZW50TGlzdGVuZXJzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKEwuVXRpbC5pbnZva2VFYWNoKHR5cGVzLCB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIsIHRoaXMsIGZuLCBjb250ZXh0KSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdHZhciBldmVudHMgPSB0aGlzW2V2ZW50c0tleV0sXHJcblx0XHQgICAgY29udGV4dElkID0gY29udGV4dCAmJiBjb250ZXh0ICE9PSB0aGlzICYmIEwuc3RhbXAoY29udGV4dCksXHJcblx0XHQgICAgaSwgbGVuLCB0eXBlLCBsaXN0ZW5lcnMsIGosIGluZGV4S2V5LCBpbmRleExlbktleSwgdHlwZUluZGV4LCByZW1vdmVkO1xyXG5cclxuXHRcdHR5cGVzID0gTC5VdGlsLnNwbGl0V29yZHModHlwZXMpO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHR5cGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHR5cGUgPSB0eXBlc1tpXTtcclxuXHRcdFx0aW5kZXhLZXkgPSB0eXBlICsgJ19pZHgnO1xyXG5cdFx0XHRpbmRleExlbktleSA9IGluZGV4S2V5ICsgJ19sZW4nO1xyXG5cclxuXHRcdFx0dHlwZUluZGV4ID0gZXZlbnRzW2luZGV4S2V5XTtcclxuXHJcblx0XHRcdGlmICghZm4pIHtcclxuXHRcdFx0XHQvLyBjbGVhciBhbGwgbGlzdGVuZXJzIGZvciBhIHR5cGUgaWYgZnVuY3Rpb24gaXNuJ3Qgc3BlY2lmaWVkXHJcblx0XHRcdFx0ZGVsZXRlIGV2ZW50c1t0eXBlXTtcclxuXHRcdFx0XHRkZWxldGUgZXZlbnRzW2luZGV4S2V5XTtcclxuXHRcdFx0XHRkZWxldGUgZXZlbnRzW2luZGV4TGVuS2V5XTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGlzdGVuZXJzID0gY29udGV4dElkICYmIHR5cGVJbmRleCA/IHR5cGVJbmRleFtjb250ZXh0SWRdIDogZXZlbnRzW3R5cGVdO1xyXG5cclxuXHRcdFx0XHRpZiAobGlzdGVuZXJzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGogPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcclxuXHRcdFx0XHRcdFx0aWYgKChsaXN0ZW5lcnNbal0uYWN0aW9uID09PSBmbikgJiYgKCFjb250ZXh0IHx8IChsaXN0ZW5lcnNbal0uY29udGV4dCA9PT0gY29udGV4dCkpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVtb3ZlZCA9IGxpc3RlbmVycy5zcGxpY2UoaiwgMSk7XHJcblx0XHRcdFx0XHRcdFx0Ly8gc2V0IHRoZSBvbGQgYWN0aW9uIHRvIGEgbm8tb3AsIGJlY2F1c2UgaXQgaXMgcG9zc2libGVcclxuXHRcdFx0XHRcdFx0XHQvLyB0aGF0IHRoZSBsaXN0ZW5lciBpcyBiZWluZyBpdGVyYXRlZCBvdmVyIGFzIHBhcnQgb2YgYSBkaXNwYXRjaFxyXG5cdFx0XHRcdFx0XHRcdHJlbW92ZWRbMF0uYWN0aW9uID0gTC5VdGlsLmZhbHNlRm47XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZiAoY29udGV4dCAmJiB0eXBlSW5kZXggJiYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApKSB7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZSB0eXBlSW5kZXhbY29udGV4dElkXTtcclxuXHRcdFx0XHRcdFx0ZXZlbnRzW2luZGV4TGVuS2V5XS0tO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGNsZWFyQWxsRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGRlbGV0ZSB0aGlzW2V2ZW50c0tleV07XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRmaXJlRXZlbnQ6IGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7IC8vIChTdHJpbmdbLCBPYmplY3RdKVxyXG5cdFx0aWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXJzKHR5cGUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBldmVudCA9IEwuVXRpbC5leHRlbmQoe30sIGRhdGEsIHsgdHlwZTogdHlwZSwgdGFyZ2V0OiB0aGlzIH0pO1xyXG5cclxuXHRcdHZhciBldmVudHMgPSB0aGlzW2V2ZW50c0tleV0sXHJcblx0XHQgICAgbGlzdGVuZXJzLCBpLCBsZW4sIHR5cGVJbmRleCwgY29udGV4dElkO1xyXG5cclxuXHRcdGlmIChldmVudHNbdHlwZV0pIHtcclxuXHRcdFx0Ly8gbWFrZSBzdXJlIGFkZGluZy9yZW1vdmluZyBsaXN0ZW5lcnMgaW5zaWRlIG90aGVyIGxpc3RlbmVycyB3b24ndCBjYXVzZSBpbmZpbml0ZSBsb29wXHJcblx0XHRcdGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXS5zbGljZSgpO1xyXG5cclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0bGlzdGVuZXJzW2ldLmFjdGlvbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBldmVudCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBmaXJlIGV2ZW50IGZvciB0aGUgY29udGV4dC1pbmRleGVkIGxpc3RlbmVycyBhcyB3ZWxsXHJcblx0XHR0eXBlSW5kZXggPSBldmVudHNbdHlwZSArICdfaWR4J107XHJcblxyXG5cdFx0Zm9yIChjb250ZXh0SWQgaW4gdHlwZUluZGV4KSB7XHJcblx0XHRcdGxpc3RlbmVycyA9IHR5cGVJbmRleFtjb250ZXh0SWRdLnNsaWNlKCk7XHJcblxyXG5cdFx0XHRpZiAobGlzdGVuZXJzKSB7XHJcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0XHRsaXN0ZW5lcnNbaV0uYWN0aW9uLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGV2ZW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRhZGRPbmVUaW1lRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKHR5cGVzLCBmbiwgY29udGV4dCkge1xyXG5cclxuXHRcdGlmIChMLlV0aWwuaW52b2tlRWFjaCh0eXBlcywgdGhpcy5hZGRPbmVUaW1lRXZlbnRMaXN0ZW5lciwgdGhpcywgZm4sIGNvbnRleHQpKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0dmFyIGhhbmRsZXIgPSBMLmJpbmQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR0aGlzXHJcblx0XHRcdCAgICAucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlcywgZm4sIGNvbnRleHQpXHJcblx0XHRcdCAgICAucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlcywgaGFuZGxlciwgY29udGV4dCk7XHJcblx0XHR9LCB0aGlzKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0ICAgIC5hZGRFdmVudExpc3RlbmVyKHR5cGVzLCBmbiwgY29udGV4dClcclxuXHRcdCAgICAuYWRkRXZlbnRMaXN0ZW5lcih0eXBlcywgaGFuZGxlciwgY29udGV4dCk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5NaXhpbi5FdmVudHMub24gPSBMLk1peGluLkV2ZW50cy5hZGRFdmVudExpc3RlbmVyO1xyXG5MLk1peGluLkV2ZW50cy5vZmYgPSBMLk1peGluLkV2ZW50cy5yZW1vdmVFdmVudExpc3RlbmVyO1xyXG5MLk1peGluLkV2ZW50cy5vbmNlID0gTC5NaXhpbi5FdmVudHMuYWRkT25lVGltZUV2ZW50TGlzdGVuZXI7XHJcbkwuTWl4aW4uRXZlbnRzLmZpcmUgPSBMLk1peGluLkV2ZW50cy5maXJlRXZlbnQ7XHJcblxuXG4vKlxyXG4gKiBMLkJyb3dzZXIgaGFuZGxlcyBkaWZmZXJlbnQgYnJvd3NlciBhbmQgZmVhdHVyZSBkZXRlY3Rpb25zIGZvciBpbnRlcm5hbCBMZWFmbGV0IHVzZS5cclxuICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cclxuXHR2YXIgaWUgPSAnQWN0aXZlWE9iamVjdCcgaW4gd2luZG93LFxyXG5cdFx0aWVsdDkgPSBpZSAmJiAhZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcixcclxuXHJcblx0ICAgIC8vIHRlcnJpYmxlIGJyb3dzZXIgZGV0ZWN0aW9uIHRvIHdvcmsgYXJvdW5kIFNhZmFyaSAvIGlPUyAvIEFuZHJvaWQgYnJvd3NlciBidWdzXHJcblx0ICAgIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFxyXG5cdCAgICB3ZWJraXQgPSB1YS5pbmRleE9mKCd3ZWJraXQnKSAhPT0gLTEsXHJcblx0ICAgIGNocm9tZSA9IHVhLmluZGV4T2YoJ2Nocm9tZScpICE9PSAtMSxcclxuXHQgICAgcGhhbnRvbWpzID0gdWEuaW5kZXhPZigncGhhbnRvbScpICE9PSAtMSxcclxuXHQgICAgYW5kcm9pZCA9IHVhLmluZGV4T2YoJ2FuZHJvaWQnKSAhPT0gLTEsXHJcblx0ICAgIGFuZHJvaWQyMyA9IHVhLnNlYXJjaCgnYW5kcm9pZCBbMjNdJykgIT09IC0xLFxyXG5cdFx0Z2Vja28gPSB1YS5pbmRleE9mKCdnZWNrbycpICE9PSAtMSxcclxuXHJcblx0ICAgIG1vYmlsZSA9IHR5cGVvZiBvcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkICsgJycsXHJcblx0ICAgIG1zUG9pbnRlciA9IHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICYmXHJcblx0ICAgICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgJiYgIXdpbmRvdy5Qb2ludGVyRXZlbnQsXHJcblx0XHRwb2ludGVyID0gKHdpbmRvdy5Qb2ludGVyRXZlbnQgJiYgd2luZG93Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCAmJiB3aW5kb3cubmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzKSB8fFxyXG5cdFx0XHRcdCAgbXNQb2ludGVyLFxyXG5cdCAgICByZXRpbmEgPSAoJ2RldmljZVBpeGVsUmF0aW8nIGluIHdpbmRvdyAmJiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+IDEpIHx8XHJcblx0ICAgICAgICAgICAgICgnbWF0Y2hNZWRpYScgaW4gd2luZG93ICYmIHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXJlc29sdXRpb246MTQ0ZHBpKScpICYmXHJcblx0ICAgICAgICAgICAgICB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi1yZXNvbHV0aW9uOjE0NGRwaSknKS5tYXRjaGVzKSxcclxuXHJcblx0ICAgIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcclxuXHQgICAgaWUzZCA9IGllICYmICgndHJhbnNpdGlvbicgaW4gZG9jLnN0eWxlKSxcclxuXHQgICAgd2Via2l0M2QgPSAoJ1dlYktpdENTU01hdHJpeCcgaW4gd2luZG93KSAmJiAoJ20xMScgaW4gbmV3IHdpbmRvdy5XZWJLaXRDU1NNYXRyaXgoKSkgJiYgIWFuZHJvaWQyMyxcclxuXHQgICAgZ2Vja28zZCA9ICdNb3pQZXJzcGVjdGl2ZScgaW4gZG9jLnN0eWxlLFxyXG5cdCAgICBvcGVyYTNkID0gJ09UcmFuc2l0aW9uJyBpbiBkb2Muc3R5bGUsXHJcblx0ICAgIGFueTNkID0gIXdpbmRvdy5MX0RJU0FCTEVfM0QgJiYgKGllM2QgfHwgd2Via2l0M2QgfHwgZ2Vja28zZCB8fCBvcGVyYTNkKSAmJiAhcGhhbnRvbWpzO1xyXG5cclxuXHJcblx0Ly8gUGhhbnRvbUpTIGhhcyAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGJ1dCBkb2Vzbid0IGFjdHVhbGx5IHN1cHBvcnQgdG91Y2guXHJcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9wdWxsLzE0MzQjaXNzdWVjb21tZW50LTEzODQzMTUxXHJcblxyXG5cdHZhciB0b3VjaCA9ICF3aW5kb3cuTF9OT19UT1VDSCAmJiAhcGhhbnRvbWpzICYmIChmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIHN0YXJ0TmFtZSA9ICdvbnRvdWNoc3RhcnQnO1xyXG5cclxuXHRcdC8vIElFMTArIChXZSBzaW11bGF0ZSB0aGVzZSBpbnRvIHRvdWNoKiBldmVudHMgaW4gTC5Eb21FdmVudCBhbmQgTC5Eb21FdmVudC5Qb2ludGVyKSBvciBXZWJLaXQsIGV0Yy5cclxuXHRcdGlmIChwb2ludGVyIHx8IChzdGFydE5hbWUgaW4gZG9jKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGaXJlZm94L0dlY2tvXHJcblx0XHR2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHQgICAgc3VwcG9ydGVkID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKCFkaXYuc2V0QXR0cmlidXRlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGRpdi5zZXRBdHRyaWJ1dGUoc3RhcnROYW1lLCAncmV0dXJuOycpO1xyXG5cclxuXHRcdGlmICh0eXBlb2YgZGl2W3N0YXJ0TmFtZV0gPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0c3VwcG9ydGVkID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRkaXYucmVtb3ZlQXR0cmlidXRlKHN0YXJ0TmFtZSk7XHJcblx0XHRkaXYgPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiBzdXBwb3J0ZWQ7XHJcblx0fSgpKTtcclxuXHJcblxyXG5cdEwuQnJvd3NlciA9IHtcclxuXHRcdGllOiBpZSxcclxuXHRcdGllbHQ5OiBpZWx0OSxcclxuXHRcdHdlYmtpdDogd2Via2l0LFxyXG5cdFx0Z2Vja286IGdlY2tvICYmICF3ZWJraXQgJiYgIXdpbmRvdy5vcGVyYSAmJiAhaWUsXHJcblxyXG5cdFx0YW5kcm9pZDogYW5kcm9pZCxcclxuXHRcdGFuZHJvaWQyMzogYW5kcm9pZDIzLFxyXG5cclxuXHRcdGNocm9tZTogY2hyb21lLFxyXG5cclxuXHRcdGllM2Q6IGllM2QsXHJcblx0XHR3ZWJraXQzZDogd2Via2l0M2QsXHJcblx0XHRnZWNrbzNkOiBnZWNrbzNkLFxyXG5cdFx0b3BlcmEzZDogb3BlcmEzZCxcclxuXHRcdGFueTNkOiBhbnkzZCxcclxuXHJcblx0XHRtb2JpbGU6IG1vYmlsZSxcclxuXHRcdG1vYmlsZVdlYmtpdDogbW9iaWxlICYmIHdlYmtpdCxcclxuXHRcdG1vYmlsZVdlYmtpdDNkOiBtb2JpbGUgJiYgd2Via2l0M2QsXHJcblx0XHRtb2JpbGVPcGVyYTogbW9iaWxlICYmIHdpbmRvdy5vcGVyYSxcclxuXHJcblx0XHR0b3VjaDogdG91Y2gsXHJcblx0XHRtc1BvaW50ZXI6IG1zUG9pbnRlcixcclxuXHRcdHBvaW50ZXI6IHBvaW50ZXIsXHJcblxyXG5cdFx0cmV0aW5hOiByZXRpbmFcclxuXHR9O1xyXG5cclxufSgpKTtcclxuXG5cbi8qXHJcbiAqIEwuUG9pbnQgcmVwcmVzZW50cyBhIHBvaW50IHdpdGggeCBhbmQgeSBjb29yZGluYXRlcy5cclxuICovXHJcblxyXG5MLlBvaW50ID0gZnVuY3Rpb24gKC8qTnVtYmVyKi8geCwgLypOdW1iZXIqLyB5LCAvKkJvb2xlYW4qLyByb3VuZCkge1xyXG5cdHRoaXMueCA9IChyb3VuZCA/IE1hdGgucm91bmQoeCkgOiB4KTtcclxuXHR0aGlzLnkgPSAocm91bmQgPyBNYXRoLnJvdW5kKHkpIDogeSk7XHJcbn07XHJcblxyXG5MLlBvaW50LnByb3RvdHlwZSA9IHtcclxuXHJcblx0Y2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh0aGlzLngsIHRoaXMueSk7XHJcblx0fSxcclxuXHJcblx0Ly8gbm9uLWRlc3RydWN0aXZlLCByZXR1cm5zIGEgbmV3IHBvaW50XHJcblx0YWRkOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHJldHVybiB0aGlzLmNsb25lKCkuX2FkZChMLnBvaW50KHBvaW50KSk7XHJcblx0fSxcclxuXHJcblx0Ly8gZGVzdHJ1Y3RpdmUsIHVzZWQgZGlyZWN0bHkgZm9yIHBlcmZvcm1hbmNlIGluIHNpdHVhdGlvbnMgd2hlcmUgaXQncyBzYWZlIHRvIG1vZGlmeSBleGlzdGluZyBwb2ludFxyXG5cdF9hZGQ6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0dGhpcy54ICs9IHBvaW50Lng7XHJcblx0XHR0aGlzLnkgKz0gcG9pbnQueTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHN1YnRyYWN0OiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHJldHVybiB0aGlzLmNsb25lKCkuX3N1YnRyYWN0KEwucG9pbnQocG9pbnQpKTtcclxuXHR9LFxyXG5cclxuXHRfc3VidHJhY3Q6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0dGhpcy54IC09IHBvaW50Lng7XHJcblx0XHR0aGlzLnkgLT0gcG9pbnQueTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGRpdmlkZUJ5OiBmdW5jdGlvbiAobnVtKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9kaXZpZGVCeShudW0pO1xyXG5cdH0sXHJcblxyXG5cdF9kaXZpZGVCeTogZnVuY3Rpb24gKG51bSkge1xyXG5cdFx0dGhpcy54IC89IG51bTtcclxuXHRcdHRoaXMueSAvPSBudW07XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRtdWx0aXBseUJ5OiBmdW5jdGlvbiAobnVtKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9tdWx0aXBseUJ5KG51bSk7XHJcblx0fSxcclxuXHJcblx0X211bHRpcGx5Qnk6IGZ1bmN0aW9uIChudW0pIHtcclxuXHRcdHRoaXMueCAqPSBudW07XHJcblx0XHR0aGlzLnkgKj0gbnVtO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cm91bmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNsb25lKCkuX3JvdW5kKCk7XHJcblx0fSxcclxuXHJcblx0X3JvdW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XHJcblx0XHR0aGlzLnkgPSBNYXRoLnJvdW5kKHRoaXMueSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRmbG9vcjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoKS5fZmxvb3IoKTtcclxuXHR9LFxyXG5cclxuXHRfZmxvb3I6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMueCA9IE1hdGguZmxvb3IodGhpcy54KTtcclxuXHRcdHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy55KTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGRpc3RhbmNlVG86IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0cG9pbnQgPSBMLnBvaW50KHBvaW50KTtcclxuXHJcblx0XHR2YXIgeCA9IHBvaW50LnggLSB0aGlzLngsXHJcblx0XHQgICAgeSA9IHBvaW50LnkgLSB0aGlzLnk7XHJcblxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcclxuXHR9LFxyXG5cclxuXHRlcXVhbHM6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0cG9pbnQgPSBMLnBvaW50KHBvaW50KTtcclxuXHJcblx0XHRyZXR1cm4gcG9pbnQueCA9PT0gdGhpcy54ICYmXHJcblx0XHQgICAgICAgcG9pbnQueSA9PT0gdGhpcy55O1xyXG5cdH0sXHJcblxyXG5cdGNvbnRhaW5zOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHBvaW50ID0gTC5wb2ludChwb2ludCk7XHJcblxyXG5cdFx0cmV0dXJuIE1hdGguYWJzKHBvaW50LngpIDw9IE1hdGguYWJzKHRoaXMueCkgJiZcclxuXHRcdCAgICAgICBNYXRoLmFicyhwb2ludC55KSA8PSBNYXRoLmFicyh0aGlzLnkpO1xyXG5cdH0sXHJcblxyXG5cdHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gJ1BvaW50KCcgK1xyXG5cdFx0ICAgICAgICBMLlV0aWwuZm9ybWF0TnVtKHRoaXMueCkgKyAnLCAnICtcclxuXHRcdCAgICAgICAgTC5VdGlsLmZvcm1hdE51bSh0aGlzLnkpICsgJyknO1xyXG5cdH1cclxufTtcclxuXHJcbkwucG9pbnQgPSBmdW5jdGlvbiAoeCwgeSwgcm91bmQpIHtcclxuXHRpZiAoeCBpbnN0YW5jZW9mIEwuUG9pbnQpIHtcclxuXHRcdHJldHVybiB4O1xyXG5cdH1cclxuXHRpZiAoTC5VdGlsLmlzQXJyYXkoeCkpIHtcclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh4WzBdLCB4WzFdKTtcclxuXHR9XHJcblx0aWYgKHggPT09IHVuZGVmaW5lZCB8fCB4ID09PSBudWxsKSB7XHJcblx0XHRyZXR1cm4geDtcclxuXHR9XHJcblx0cmV0dXJuIG5ldyBMLlBvaW50KHgsIHksIHJvdW5kKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuQm91bmRzIHJlcHJlc2VudHMgYSByZWN0YW5ndWxhciBhcmVhIG9uIHRoZSBzY3JlZW4gaW4gcGl4ZWwgY29vcmRpbmF0ZXMuXHJcbiAqL1xyXG5cclxuTC5Cb3VuZHMgPSBmdW5jdGlvbiAoYSwgYikgeyAvLyhQb2ludCwgUG9pbnQpIG9yIFBvaW50W11cclxuXHRpZiAoIWEpIHsgcmV0dXJuOyB9XHJcblxyXG5cdHZhciBwb2ludHMgPSBiID8gW2EsIGJdIDogYTtcclxuXHJcblx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0dGhpcy5leHRlbmQocG9pbnRzW2ldKTtcclxuXHR9XHJcbn07XHJcblxyXG5MLkJvdW5kcy5wcm90b3R5cGUgPSB7XHJcblx0Ly8gZXh0ZW5kIHRoZSBib3VuZHMgdG8gY29udGFpbiB0aGUgZ2l2ZW4gcG9pbnRcclxuXHRleHRlbmQ6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQpXHJcblx0XHRwb2ludCA9IEwucG9pbnQocG9pbnQpO1xyXG5cclxuXHRcdGlmICghdGhpcy5taW4gJiYgIXRoaXMubWF4KSB7XHJcblx0XHRcdHRoaXMubWluID0gcG9pbnQuY2xvbmUoKTtcclxuXHRcdFx0dGhpcy5tYXggPSBwb2ludC5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5taW4ueCA9IE1hdGgubWluKHBvaW50LngsIHRoaXMubWluLngpO1xyXG5cdFx0XHR0aGlzLm1heC54ID0gTWF0aC5tYXgocG9pbnQueCwgdGhpcy5tYXgueCk7XHJcblx0XHRcdHRoaXMubWluLnkgPSBNYXRoLm1pbihwb2ludC55LCB0aGlzLm1pbi55KTtcclxuXHRcdFx0dGhpcy5tYXgueSA9IE1hdGgubWF4KHBvaW50LnksIHRoaXMubWF4LnkpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0Q2VudGVyOiBmdW5jdGlvbiAocm91bmQpIHsgLy8gKEJvb2xlYW4pIC0+IFBvaW50XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoXHJcblx0XHQgICAgICAgICh0aGlzLm1pbi54ICsgdGhpcy5tYXgueCkgLyAyLFxyXG5cdFx0ICAgICAgICAodGhpcy5taW4ueSArIHRoaXMubWF4LnkpIC8gMiwgcm91bmQpO1xyXG5cdH0sXHJcblxyXG5cdGdldEJvdHRvbUxlZnQ6IGZ1bmN0aW9uICgpIHsgLy8gLT4gUG9pbnRcclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh0aGlzLm1pbi54LCB0aGlzLm1heC55KTtcclxuXHR9LFxyXG5cclxuXHRnZXRUb3BSaWdodDogZnVuY3Rpb24gKCkgeyAvLyAtPiBQb2ludFxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KHRoaXMubWF4LngsIHRoaXMubWluLnkpO1xyXG5cdH0sXHJcblxyXG5cdGdldFNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm1heC5zdWJ0cmFjdCh0aGlzLm1pbik7XHJcblx0fSxcclxuXHJcblx0Y29udGFpbnM6IGZ1bmN0aW9uIChvYmopIHsgLy8gKEJvdW5kcykgb3IgKFBvaW50KSAtPiBCb29sZWFuXHJcblx0XHR2YXIgbWluLCBtYXg7XHJcblxyXG5cdFx0aWYgKHR5cGVvZiBvYmpbMF0gPT09ICdudW1iZXInIHx8IG9iaiBpbnN0YW5jZW9mIEwuUG9pbnQpIHtcclxuXHRcdFx0b2JqID0gTC5wb2ludChvYmopO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b2JqID0gTC5ib3VuZHMob2JqKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob2JqIGluc3RhbmNlb2YgTC5Cb3VuZHMpIHtcclxuXHRcdFx0bWluID0gb2JqLm1pbjtcclxuXHRcdFx0bWF4ID0gb2JqLm1heDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG1pbiA9IG1heCA9IG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gKG1pbi54ID49IHRoaXMubWluLngpICYmXHJcblx0XHQgICAgICAgKG1heC54IDw9IHRoaXMubWF4LngpICYmXHJcblx0XHQgICAgICAgKG1pbi55ID49IHRoaXMubWluLnkpICYmXHJcblx0XHQgICAgICAgKG1heC55IDw9IHRoaXMubWF4LnkpO1xyXG5cdH0sXHJcblxyXG5cdGludGVyc2VjdHM6IGZ1bmN0aW9uIChib3VuZHMpIHsgLy8gKEJvdW5kcykgLT4gQm9vbGVhblxyXG5cdFx0Ym91bmRzID0gTC5ib3VuZHMoYm91bmRzKTtcclxuXHJcblx0XHR2YXIgbWluID0gdGhpcy5taW4sXHJcblx0XHQgICAgbWF4ID0gdGhpcy5tYXgsXHJcblx0XHQgICAgbWluMiA9IGJvdW5kcy5taW4sXHJcblx0XHQgICAgbWF4MiA9IGJvdW5kcy5tYXgsXHJcblx0XHQgICAgeEludGVyc2VjdHMgPSAobWF4Mi54ID49IG1pbi54KSAmJiAobWluMi54IDw9IG1heC54KSxcclxuXHRcdCAgICB5SW50ZXJzZWN0cyA9IChtYXgyLnkgPj0gbWluLnkpICYmIChtaW4yLnkgPD0gbWF4LnkpO1xyXG5cclxuXHRcdHJldHVybiB4SW50ZXJzZWN0cyAmJiB5SW50ZXJzZWN0cztcclxuXHR9LFxyXG5cclxuXHRpc1ZhbGlkOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gISEodGhpcy5taW4gJiYgdGhpcy5tYXgpO1xyXG5cdH1cclxufTtcclxuXHJcbkwuYm91bmRzID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8gKEJvdW5kcykgb3IgKFBvaW50LCBQb2ludCkgb3IgKFBvaW50W10pXHJcblx0aWYgKCFhIHx8IGEgaW5zdGFuY2VvZiBMLkJvdW5kcykge1xyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cdHJldHVybiBuZXcgTC5Cb3VuZHMoYSwgYik7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlRyYW5zZm9ybWF0aW9uIGlzIGFuIHV0aWxpdHkgY2xhc3MgdG8gcGVyZm9ybSBzaW1wbGUgcG9pbnQgdHJhbnNmb3JtYXRpb25zIHRocm91Z2ggYSAyZC1tYXRyaXguXHJcbiAqL1xyXG5cclxuTC5UcmFuc2Zvcm1hdGlvbiA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkKSB7XHJcblx0dGhpcy5fYSA9IGE7XHJcblx0dGhpcy5fYiA9IGI7XHJcblx0dGhpcy5fYyA9IGM7XHJcblx0dGhpcy5fZCA9IGQ7XHJcbn07XHJcblxyXG5MLlRyYW5zZm9ybWF0aW9uLnByb3RvdHlwZSA9IHtcclxuXHR0cmFuc2Zvcm06IGZ1bmN0aW9uIChwb2ludCwgc2NhbGUpIHsgLy8gKFBvaW50LCBOdW1iZXIpIC0+IFBvaW50XHJcblx0XHRyZXR1cm4gdGhpcy5fdHJhbnNmb3JtKHBvaW50LmNsb25lKCksIHNjYWxlKTtcclxuXHR9LFxyXG5cclxuXHQvLyBkZXN0cnVjdGl2ZSB0cmFuc2Zvcm0gKGZhc3RlcilcclxuXHRfdHJhbnNmb3JtOiBmdW5jdGlvbiAocG9pbnQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDE7XHJcblx0XHRwb2ludC54ID0gc2NhbGUgKiAodGhpcy5fYSAqIHBvaW50LnggKyB0aGlzLl9iKTtcclxuXHRcdHBvaW50LnkgPSBzY2FsZSAqICh0aGlzLl9jICogcG9pbnQueSArIHRoaXMuX2QpO1xyXG5cdFx0cmV0dXJuIHBvaW50O1xyXG5cdH0sXHJcblxyXG5cdHVudHJhbnNmb3JtOiBmdW5jdGlvbiAocG9pbnQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDE7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoXHJcblx0XHQgICAgICAgIChwb2ludC54IC8gc2NhbGUgLSB0aGlzLl9iKSAvIHRoaXMuX2EsXHJcblx0XHQgICAgICAgIChwb2ludC55IC8gc2NhbGUgLSB0aGlzLl9kKSAvIHRoaXMuX2MpO1xyXG5cdH1cclxufTtcclxuXG5cbi8qXHJcbiAqIEwuRG9tVXRpbCBjb250YWlucyB2YXJpb3VzIHV0aWxpdHkgZnVuY3Rpb25zIGZvciB3b3JraW5nIHdpdGggRE9NLlxyXG4gKi9cclxuXHJcbkwuRG9tVXRpbCA9IHtcclxuXHRnZXQ6IGZ1bmN0aW9uIChpZCkge1xyXG5cdFx0cmV0dXJuICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIDogaWQpO1xyXG5cdH0sXHJcblxyXG5cdGdldFN0eWxlOiBmdW5jdGlvbiAoZWwsIHN0eWxlKSB7XHJcblxyXG5cdFx0dmFyIHZhbHVlID0gZWwuc3R5bGVbc3R5bGVdO1xyXG5cclxuXHRcdGlmICghdmFsdWUgJiYgZWwuY3VycmVudFN0eWxlKSB7XHJcblx0XHRcdHZhbHVlID0gZWwuY3VycmVudFN0eWxlW3N0eWxlXTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoKCF2YWx1ZSB8fCB2YWx1ZSA9PT0gJ2F1dG8nKSAmJiBkb2N1bWVudC5kZWZhdWx0Vmlldykge1xyXG5cdFx0XHR2YXIgY3NzID0gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XHJcblx0XHRcdHZhbHVlID0gY3NzID8gY3NzW3N0eWxlXSA6IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlID09PSAnYXV0bycgPyBudWxsIDogdmFsdWU7XHJcblx0fSxcclxuXHJcblx0Z2V0Vmlld3BvcnRPZmZzZXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcblxyXG5cdFx0dmFyIHRvcCA9IDAsXHJcblx0XHQgICAgbGVmdCA9IDAsXHJcblx0XHQgICAgZWwgPSBlbGVtZW50LFxyXG5cdFx0ICAgIGRvY0JvZHkgPSBkb2N1bWVudC5ib2R5LFxyXG5cdFx0ICAgIGRvY0VsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxyXG5cdFx0ICAgIHBvcztcclxuXHJcblx0XHRkbyB7XHJcblx0XHRcdHRvcCAgKz0gZWwub2Zmc2V0VG9wICB8fCAwO1xyXG5cdFx0XHRsZWZ0ICs9IGVsLm9mZnNldExlZnQgfHwgMDtcclxuXHJcblx0XHRcdC8vYWRkIGJvcmRlcnNcclxuXHRcdFx0dG9wICs9IHBhcnNlSW50KEwuRG9tVXRpbC5nZXRTdHlsZShlbCwgJ2JvcmRlclRvcFdpZHRoJyksIDEwKSB8fCAwO1xyXG5cdFx0XHRsZWZ0ICs9IHBhcnNlSW50KEwuRG9tVXRpbC5nZXRTdHlsZShlbCwgJ2JvcmRlckxlZnRXaWR0aCcpLCAxMCkgfHwgMDtcclxuXHJcblx0XHRcdHBvcyA9IEwuRG9tVXRpbC5nZXRTdHlsZShlbCwgJ3Bvc2l0aW9uJyk7XHJcblxyXG5cdFx0XHRpZiAoZWwub2Zmc2V0UGFyZW50ID09PSBkb2NCb2R5ICYmIHBvcyA9PT0gJ2Fic29sdXRlJykgeyBicmVhazsgfVxyXG5cclxuXHRcdFx0aWYgKHBvcyA9PT0gJ2ZpeGVkJykge1xyXG5cdFx0XHRcdHRvcCAgKz0gZG9jQm9keS5zY3JvbGxUb3AgIHx8IGRvY0VsLnNjcm9sbFRvcCAgfHwgMDtcclxuXHRcdFx0XHRsZWZ0ICs9IGRvY0JvZHkuc2Nyb2xsTGVmdCB8fCBkb2NFbC5zY3JvbGxMZWZ0IHx8IDA7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChwb3MgPT09ICdyZWxhdGl2ZScgJiYgIWVsLm9mZnNldExlZnQpIHtcclxuXHRcdFx0XHR2YXIgd2lkdGggPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICd3aWR0aCcpLFxyXG5cdFx0XHRcdCAgICBtYXhXaWR0aCA9IEwuRG9tVXRpbC5nZXRTdHlsZShlbCwgJ21heC13aWR0aCcpLFxyXG5cdFx0XHRcdCAgICByID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0XHRcdGlmICh3aWR0aCAhPT0gJ25vbmUnIHx8IG1heFdpZHRoICE9PSAnbm9uZScpIHtcclxuXHRcdFx0XHRcdGxlZnQgKz0gci5sZWZ0ICsgZWwuY2xpZW50TGVmdDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vY2FsY3VsYXRlIGZ1bGwgeSBvZmZzZXQgc2luY2Ugd2UncmUgYnJlYWtpbmcgb3V0IG9mIHRoZSBsb29wXHJcblx0XHRcdFx0dG9wICs9IHIudG9wICsgKGRvY0JvZHkuc2Nyb2xsVG9wICB8fCBkb2NFbC5zY3JvbGxUb3AgIHx8IDApO1xyXG5cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZWwgPSBlbC5vZmZzZXRQYXJlbnQ7XHJcblxyXG5cdFx0fSB3aGlsZSAoZWwpO1xyXG5cclxuXHRcdGVsID0gZWxlbWVudDtcclxuXHJcblx0XHRkbyB7XHJcblx0XHRcdGlmIChlbCA9PT0gZG9jQm9keSkgeyBicmVhazsgfVxyXG5cclxuXHRcdFx0dG9wICAtPSBlbC5zY3JvbGxUb3AgIHx8IDA7XHJcblx0XHRcdGxlZnQgLT0gZWwuc2Nyb2xsTGVmdCB8fCAwO1xyXG5cclxuXHRcdFx0ZWwgPSBlbC5wYXJlbnROb2RlO1xyXG5cdFx0fSB3aGlsZSAoZWwpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludChsZWZ0LCB0b3ApO1xyXG5cdH0sXHJcblxyXG5cdGRvY3VtZW50SXNMdHI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghTC5Eb21VdGlsLl9kb2NJc0x0ckNhY2hlZCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuX2RvY0lzTHRyQ2FjaGVkID0gdHJ1ZTtcclxuXHRcdFx0TC5Eb21VdGlsLl9kb2NJc0x0ciA9IEwuRG9tVXRpbC5nZXRTdHlsZShkb2N1bWVudC5ib2R5LCAnZGlyZWN0aW9uJykgPT09ICdsdHInO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIEwuRG9tVXRpbC5fZG9jSXNMdHI7XHJcblx0fSxcclxuXHJcblx0Y3JlYXRlOiBmdW5jdGlvbiAodGFnTmFtZSwgY2xhc3NOYW1lLCBjb250YWluZXIpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xyXG5cdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG5cclxuXHRcdGlmIChjb250YWluZXIpIHtcclxuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKGVsKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblx0aGFzQ2xhc3M6IGZ1bmN0aW9uIChlbCwgbmFtZSkge1xyXG5cdFx0aWYgKGVsLmNsYXNzTGlzdCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMobmFtZSk7XHJcblx0XHR9XHJcblx0XHR2YXIgY2xhc3NOYW1lID0gTC5Eb21VdGlsLl9nZXRDbGFzcyhlbCk7XHJcblx0XHRyZXR1cm4gY2xhc3NOYW1lLmxlbmd0aCA+IDAgJiYgbmV3IFJlZ0V4cCgnKF58XFxcXHMpJyArIG5hbWUgKyAnKFxcXFxzfCQpJykudGVzdChjbGFzc05hbWUpO1xyXG5cdH0sXHJcblxyXG5cdGFkZENsYXNzOiBmdW5jdGlvbiAoZWwsIG5hbWUpIHtcclxuXHRcdGlmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR2YXIgY2xhc3NlcyA9IEwuVXRpbC5zcGxpdFdvcmRzKG5hbWUpO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gY2xhc3Nlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGVsLmNsYXNzTGlzdC5hZGQoY2xhc3Nlc1tpXSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoIUwuRG9tVXRpbC5oYXNDbGFzcyhlbCwgbmFtZSkpIHtcclxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IEwuRG9tVXRpbC5fZ2V0Q2xhc3MoZWwpO1xyXG5cdFx0XHRMLkRvbVV0aWwuX3NldENsYXNzKGVsLCAoY2xhc3NOYW1lID8gY2xhc3NOYW1lICsgJyAnIDogJycpICsgbmFtZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIChlbCwgbmFtZSkge1xyXG5cdFx0aWYgKGVsLmNsYXNzTGlzdCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRMLkRvbVV0aWwuX3NldENsYXNzKGVsLCBMLlV0aWwudHJpbSgoJyAnICsgTC5Eb21VdGlsLl9nZXRDbGFzcyhlbCkgKyAnICcpLnJlcGxhY2UoJyAnICsgbmFtZSArICcgJywgJyAnKSkpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9zZXRDbGFzczogZnVuY3Rpb24gKGVsLCBuYW1lKSB7XHJcblx0XHRpZiAoZWwuY2xhc3NOYW1lLmJhc2VWYWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgPSBuYW1lO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gaW4gY2FzZSBvZiBTVkcgZWxlbWVudFxyXG5cdFx0XHRlbC5jbGFzc05hbWUuYmFzZVZhbCA9IG5hbWU7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2dldENsYXNzOiBmdW5jdGlvbiAoZWwpIHtcclxuXHRcdHJldHVybiBlbC5jbGFzc05hbWUuYmFzZVZhbCA9PT0gdW5kZWZpbmVkID8gZWwuY2xhc3NOYW1lIDogZWwuY2xhc3NOYW1lLmJhc2VWYWw7XHJcblx0fSxcclxuXHJcblx0c2V0T3BhY2l0eTogZnVuY3Rpb24gKGVsLCB2YWx1ZSkge1xyXG5cclxuXHRcdGlmICgnb3BhY2l0eScgaW4gZWwuc3R5bGUpIHtcclxuXHRcdFx0ZWwuc3R5bGUub3BhY2l0eSA9IHZhbHVlO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAoJ2ZpbHRlcicgaW4gZWwuc3R5bGUpIHtcclxuXHJcblx0XHRcdHZhciBmaWx0ZXIgPSBmYWxzZSxcclxuXHRcdFx0ICAgIGZpbHRlck5hbWUgPSAnRFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQWxwaGEnO1xyXG5cclxuXHRcdFx0Ly8gZmlsdGVycyBjb2xsZWN0aW9uIHRocm93cyBhbiBlcnJvciBpZiB3ZSB0cnkgdG8gcmV0cmlldmUgYSBmaWx0ZXIgdGhhdCBkb2Vzbid0IGV4aXN0XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZmlsdGVyID0gZWwuZmlsdGVycy5pdGVtKGZpbHRlck5hbWUpO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0Ly8gZG9uJ3Qgc2V0IG9wYWNpdHkgdG8gMSBpZiB3ZSBoYXZlbid0IGFscmVhZHkgc2V0IGFuIG9wYWNpdHksXHJcblx0XHRcdFx0Ly8gaXQgaXNuJ3QgbmVlZGVkIGFuZCBicmVha3MgdHJhbnNwYXJlbnQgcG5ncy5cclxuXHRcdFx0XHRpZiAodmFsdWUgPT09IDEpIHsgcmV0dXJuOyB9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMCk7XHJcblxyXG5cdFx0XHRpZiAoZmlsdGVyKSB7XHJcblx0XHRcdFx0ZmlsdGVyLkVuYWJsZWQgPSAodmFsdWUgIT09IDEwMCk7XHJcblx0XHRcdFx0ZmlsdGVyLk9wYWNpdHkgPSB2YWx1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRlbC5zdHlsZS5maWx0ZXIgKz0gJyBwcm9naWQ6JyArIGZpbHRlck5hbWUgKyAnKG9wYWNpdHk9JyArIHZhbHVlICsgJyknO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0dGVzdFByb3A6IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cclxuXHRcdHZhciBzdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChwcm9wc1tpXSBpbiBzdHlsZSkge1xyXG5cdFx0XHRcdHJldHVybiBwcm9wc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdGdldFRyYW5zbGF0ZVN0cmluZzogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHQvLyBvbiBXZWJLaXQgYnJvd3NlcnMgKENocm9tZS9TYWZhcmkvaU9TIFNhZmFyaS9BbmRyb2lkKSB1c2luZyB0cmFuc2xhdGUzZCBpbnN0ZWFkIG9mIHRyYW5zbGF0ZVxyXG5cdFx0Ly8gbWFrZXMgYW5pbWF0aW9uIHNtb290aGVyIGFzIGl0IGVuc3VyZXMgSFcgYWNjZWwgaXMgdXNlZC4gRmlyZWZveCAxMyBkb2Vzbid0IGNhcmVcclxuXHRcdC8vIChzYW1lIHNwZWVkIGVpdGhlciB3YXkpLCBPcGVyYSAxMiBkb2Vzbid0IHN1cHBvcnQgdHJhbnNsYXRlM2RcclxuXHJcblx0XHR2YXIgaXMzZCA9IEwuQnJvd3Nlci53ZWJraXQzZCxcclxuXHRcdCAgICBvcGVuID0gJ3RyYW5zbGF0ZScgKyAoaXMzZCA/ICczZCcgOiAnJykgKyAnKCcsXHJcblx0XHQgICAgY2xvc2UgPSAoaXMzZCA/ICcsMCcgOiAnJykgKyAnKSc7XHJcblxyXG5cdFx0cmV0dXJuIG9wZW4gKyBwb2ludC54ICsgJ3B4LCcgKyBwb2ludC55ICsgJ3B4JyArIGNsb3NlO1xyXG5cdH0sXHJcblxyXG5cdGdldFNjYWxlU3RyaW5nOiBmdW5jdGlvbiAoc2NhbGUsIG9yaWdpbikge1xyXG5cclxuXHRcdHZhciBwcmVUcmFuc2xhdGVTdHIgPSBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKG9yaWdpbi5hZGQob3JpZ2luLm11bHRpcGx5QnkoLTEgKiBzY2FsZSkpKSxcclxuXHRcdCAgICBzY2FsZVN0ciA9ICcgc2NhbGUoJyArIHNjYWxlICsgJykgJztcclxuXHJcblx0XHRyZXR1cm4gcHJlVHJhbnNsYXRlU3RyICsgc2NhbGVTdHI7XHJcblx0fSxcclxuXHJcblx0c2V0UG9zaXRpb246IGZ1bmN0aW9uIChlbCwgcG9pbnQsIGRpc2FibGUzRCkgeyAvLyAoSFRNTEVsZW1lbnQsIFBvaW50WywgQm9vbGVhbl0pXHJcblxyXG5cdFx0Ly8ganNoaW50IGNhbWVsY2FzZTogZmFsc2VcclxuXHRcdGVsLl9sZWFmbGV0X3BvcyA9IHBvaW50O1xyXG5cclxuXHRcdGlmICghZGlzYWJsZTNEICYmIEwuQnJvd3Nlci5hbnkzZCkge1xyXG5cdFx0XHRlbC5zdHlsZVtMLkRvbVV0aWwuVFJBTlNGT1JNXSA9ICBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKHBvaW50KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsLnN0eWxlLmxlZnQgPSBwb2ludC54ICsgJ3B4JztcclxuXHRcdFx0ZWwuc3R5bGUudG9wID0gcG9pbnQueSArICdweCc7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Z2V0UG9zaXRpb246IGZ1bmN0aW9uIChlbCkge1xyXG5cdFx0Ly8gdGhpcyBtZXRob2QgaXMgb25seSB1c2VkIGZvciBlbGVtZW50cyBwcmV2aW91c2x5IHBvc2l0aW9uZWQgdXNpbmcgc2V0UG9zaXRpb24sXHJcblx0XHQvLyBzbyBpdCdzIHNhZmUgdG8gY2FjaGUgdGhlIHBvc2l0aW9uIGZvciBwZXJmb3JtYW5jZVxyXG5cclxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXHJcblx0XHRyZXR1cm4gZWwuX2xlYWZsZXRfcG9zO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG4vLyBwcmVmaXggc3R5bGUgcHJvcGVydHkgbmFtZXNcclxuXHJcbkwuRG9tVXRpbC5UUkFOU0ZPUk0gPSBMLkRvbVV0aWwudGVzdFByb3AoXHJcbiAgICAgICAgWyd0cmFuc2Zvcm0nLCAnV2Via2l0VHJhbnNmb3JtJywgJ09UcmFuc2Zvcm0nLCAnTW96VHJhbnNmb3JtJywgJ21zVHJhbnNmb3JtJ10pO1xyXG5cclxuLy8gd2Via2l0VHJhbnNpdGlvbiBjb21lcyBmaXJzdCBiZWNhdXNlIHNvbWUgYnJvd3NlciB2ZXJzaW9ucyB0aGF0IGRyb3AgdmVuZG9yIHByZWZpeCBkb24ndCBkb1xyXG4vLyB0aGUgc2FtZSBmb3IgdGhlIHRyYW5zaXRpb25lbmQgZXZlbnQsIGluIHBhcnRpY3VsYXIgdGhlIEFuZHJvaWQgNC4xIHN0b2NrIGJyb3dzZXJcclxuXHJcbkwuRG9tVXRpbC5UUkFOU0lUSU9OID0gTC5Eb21VdGlsLnRlc3RQcm9wKFxyXG4gICAgICAgIFsnd2Via2l0VHJhbnNpdGlvbicsICd0cmFuc2l0aW9uJywgJ09UcmFuc2l0aW9uJywgJ01velRyYW5zaXRpb24nLCAnbXNUcmFuc2l0aW9uJ10pO1xyXG5cclxuTC5Eb21VdGlsLlRSQU5TSVRJT05fRU5EID1cclxuICAgICAgICBMLkRvbVV0aWwuVFJBTlNJVElPTiA9PT0gJ3dlYmtpdFRyYW5zaXRpb24nIHx8IEwuRG9tVXRpbC5UUkFOU0lUSU9OID09PSAnT1RyYW5zaXRpb24nID9cclxuICAgICAgICBMLkRvbVV0aWwuVFJBTlNJVElPTiArICdFbmQnIDogJ3RyYW5zaXRpb25lbmQnO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICgnb25zZWxlY3RzdGFydCcgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICBMLmV4dGVuZChMLkRvbVV0aWwsIHtcclxuICAgICAgICAgICAgZGlzYWJsZVRleHRTZWxlY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIEwuRG9tRXZlbnQub24od2luZG93LCAnc2VsZWN0c3RhcnQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGVuYWJsZVRleHRTZWxlY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIEwuRG9tRXZlbnQub2ZmKHdpbmRvdywgJ3NlbGVjdHN0YXJ0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHVzZXJTZWxlY3RQcm9wZXJ0eSA9IEwuRG9tVXRpbC50ZXN0UHJvcChcclxuICAgICAgICAgICAgWyd1c2VyU2VsZWN0JywgJ1dlYmtpdFVzZXJTZWxlY3QnLCAnT1VzZXJTZWxlY3QnLCAnTW96VXNlclNlbGVjdCcsICdtc1VzZXJTZWxlY3QnXSk7XHJcblxyXG4gICAgICAgIEwuZXh0ZW5kKEwuRG9tVXRpbCwge1xyXG4gICAgICAgICAgICBkaXNhYmxlVGV4dFNlbGVjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJTZWxlY3RQcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91c2VyU2VsZWN0ID0gc3R5bGVbdXNlclNlbGVjdFByb3BlcnR5XTtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZVt1c2VyU2VsZWN0UHJvcGVydHldID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZW5hYmxlVGV4dFNlbGVjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJTZWxlY3RQcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZVt1c2VyU2VsZWN0UHJvcGVydHldID0gdGhpcy5fdXNlclNlbGVjdDtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fdXNlclNlbGVjdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHRMLmV4dGVuZChMLkRvbVV0aWwsIHtcclxuXHRcdGRpc2FibGVJbWFnZURyYWc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vbih3aW5kb3csICdkcmFnc3RhcnQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZW5hYmxlSW1hZ2VEcmFnOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQub2ZmKHdpbmRvdywgJ2RyYWdzdGFydCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59KSgpO1xyXG5cblxuLypcclxuICogTC5MYXRMbmcgcmVwcmVzZW50cyBhIGdlb2dyYXBoaWNhbCBwb2ludCB3aXRoIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgY29vcmRpbmF0ZXMuXHJcbiAqL1xyXG5cclxuTC5MYXRMbmcgPSBmdW5jdGlvbiAobGF0LCBsbmcsIGFsdCkgeyAvLyAoTnVtYmVyLCBOdW1iZXIsIE51bWJlcilcclxuXHRsYXQgPSBwYXJzZUZsb2F0KGxhdCk7XHJcblx0bG5nID0gcGFyc2VGbG9hdChsbmcpO1xyXG5cclxuXHRpZiAoaXNOYU4obGF0KSB8fCBpc05hTihsbmcpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgTGF0TG5nIG9iamVjdDogKCcgKyBsYXQgKyAnLCAnICsgbG5nICsgJyknKTtcclxuXHR9XHJcblxyXG5cdHRoaXMubGF0ID0gbGF0O1xyXG5cdHRoaXMubG5nID0gbG5nO1xyXG5cclxuXHRpZiAoYWx0ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdHRoaXMuYWx0ID0gcGFyc2VGbG9hdChhbHQpO1xyXG5cdH1cclxufTtcclxuXHJcbkwuZXh0ZW5kKEwuTGF0TG5nLCB7XHJcblx0REVHX1RPX1JBRDogTWF0aC5QSSAvIDE4MCxcclxuXHRSQURfVE9fREVHOiAxODAgLyBNYXRoLlBJLFxyXG5cdE1BWF9NQVJHSU46IDEuMEUtOSAvLyBtYXggbWFyZ2luIG9mIGVycm9yIGZvciB0aGUgXCJlcXVhbHNcIiBjaGVja1xyXG59KTtcclxuXHJcbkwuTGF0TG5nLnByb3RvdHlwZSA9IHtcclxuXHRlcXVhbHM6IGZ1bmN0aW9uIChvYmopIHsgLy8gKExhdExuZykgLT4gQm9vbGVhblxyXG5cdFx0aWYgKCFvYmopIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cdFx0b2JqID0gTC5sYXRMbmcob2JqKTtcclxuXHJcblx0XHR2YXIgbWFyZ2luID0gTWF0aC5tYXgoXHJcblx0XHQgICAgICAgIE1hdGguYWJzKHRoaXMubGF0IC0gb2JqLmxhdCksXHJcblx0XHQgICAgICAgIE1hdGguYWJzKHRoaXMubG5nIC0gb2JqLmxuZykpO1xyXG5cclxuXHRcdHJldHVybiBtYXJnaW4gPD0gTC5MYXRMbmcuTUFYX01BUkdJTjtcclxuXHR9LFxyXG5cclxuXHR0b1N0cmluZzogZnVuY3Rpb24gKHByZWNpc2lvbikgeyAvLyAoTnVtYmVyKSAtPiBTdHJpbmdcclxuXHRcdHJldHVybiAnTGF0TG5nKCcgK1xyXG5cdFx0ICAgICAgICBMLlV0aWwuZm9ybWF0TnVtKHRoaXMubGF0LCBwcmVjaXNpb24pICsgJywgJyArXHJcblx0XHQgICAgICAgIEwuVXRpbC5mb3JtYXROdW0odGhpcy5sbmcsIHByZWNpc2lvbikgKyAnKSc7XHJcblx0fSxcclxuXHJcblx0Ly8gSGF2ZXJzaW5lIGRpc3RhbmNlIGZvcm11bGEsIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhdmVyc2luZV9mb3JtdWxhXHJcblx0Ly8gVE9ETyBtb3ZlIHRvIHByb2plY3Rpb24gY29kZSwgTGF0TG5nIHNob3VsZG4ndCBrbm93IGFib3V0IEVhcnRoXHJcblx0ZGlzdGFuY2VUbzogZnVuY3Rpb24gKG90aGVyKSB7IC8vIChMYXRMbmcpIC0+IE51bWJlclxyXG5cdFx0b3RoZXIgPSBMLmxhdExuZyhvdGhlcik7XHJcblxyXG5cdFx0dmFyIFIgPSA2Mzc4MTM3LCAvLyBlYXJ0aCByYWRpdXMgaW4gbWV0ZXJzXHJcblx0XHQgICAgZDJyID0gTC5MYXRMbmcuREVHX1RPX1JBRCxcclxuXHRcdCAgICBkTGF0ID0gKG90aGVyLmxhdCAtIHRoaXMubGF0KSAqIGQycixcclxuXHRcdCAgICBkTG9uID0gKG90aGVyLmxuZyAtIHRoaXMubG5nKSAqIGQycixcclxuXHRcdCAgICBsYXQxID0gdGhpcy5sYXQgKiBkMnIsXHJcblx0XHQgICAgbGF0MiA9IG90aGVyLmxhdCAqIGQycixcclxuXHRcdCAgICBzaW4xID0gTWF0aC5zaW4oZExhdCAvIDIpLFxyXG5cdFx0ICAgIHNpbjIgPSBNYXRoLnNpbihkTG9uIC8gMik7XHJcblxyXG5cdFx0dmFyIGEgPSBzaW4xICogc2luMSArIHNpbjIgKiBzaW4yICogTWF0aC5jb3MobGF0MSkgKiBNYXRoLmNvcyhsYXQyKTtcclxuXHJcblx0XHRyZXR1cm4gUiAqIDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEgLSBhKSk7XHJcblx0fSxcclxuXHJcblx0d3JhcDogZnVuY3Rpb24gKGEsIGIpIHsgLy8gKE51bWJlciwgTnVtYmVyKSAtPiBMYXRMbmdcclxuXHRcdHZhciBsbmcgPSB0aGlzLmxuZztcclxuXHJcblx0XHRhID0gYSB8fCAtMTgwO1xyXG5cdFx0YiA9IGIgfHwgIDE4MDtcclxuXHJcblx0XHRsbmcgPSAobG5nICsgYikgJSAoYiAtIGEpICsgKGxuZyA8IGEgfHwgbG5nID09PSBiID8gYiA6IGEpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcodGhpcy5sYXQsIGxuZyk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5sYXRMbmcgPSBmdW5jdGlvbiAoYSwgYikgeyAvLyAoTGF0TG5nKSBvciAoW051bWJlciwgTnVtYmVyXSkgb3IgKE51bWJlciwgTnVtYmVyKVxyXG5cdGlmIChhIGluc3RhbmNlb2YgTC5MYXRMbmcpIHtcclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHRpZiAoTC5VdGlsLmlzQXJyYXkoYSkpIHtcclxuXHRcdGlmICh0eXBlb2YgYVswXSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGFbMF0gPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHJldHVybiBuZXcgTC5MYXRMbmcoYVswXSwgYVsxXSwgYVsyXSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYgKGEgPT09IHVuZGVmaW5lZCB8fCBhID09PSBudWxsKSB7XHJcblx0XHRyZXR1cm4gYTtcclxuXHR9XHJcblx0aWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiAnbGF0JyBpbiBhKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKGEubGF0LCAnbG5nJyBpbiBhID8gYS5sbmcgOiBhLmxvbik7XHJcblx0fVxyXG5cdGlmIChiID09PSB1bmRlZmluZWQpIHtcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRyZXR1cm4gbmV3IEwuTGF0TG5nKGEsIGIpO1xyXG59O1xyXG5cclxuXG5cbi8qXHJcbiAqIEwuTGF0TG5nQm91bmRzIHJlcHJlc2VudHMgYSByZWN0YW5ndWxhciBhcmVhIG9uIHRoZSBtYXAgaW4gZ2VvZ3JhcGhpY2FsIGNvb3JkaW5hdGVzLlxyXG4gKi9cclxuXHJcbkwuTGF0TG5nQm91bmRzID0gZnVuY3Rpb24gKHNvdXRoV2VzdCwgbm9ydGhFYXN0KSB7IC8vIChMYXRMbmcsIExhdExuZykgb3IgKExhdExuZ1tdKVxyXG5cdGlmICghc291dGhXZXN0KSB7IHJldHVybjsgfVxyXG5cclxuXHR2YXIgbGF0bG5ncyA9IG5vcnRoRWFzdCA/IFtzb3V0aFdlc3QsIG5vcnRoRWFzdF0gOiBzb3V0aFdlc3Q7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwLCBsZW4gPSBsYXRsbmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHR0aGlzLmV4dGVuZChsYXRsbmdzW2ldKTtcclxuXHR9XHJcbn07XHJcblxyXG5MLkxhdExuZ0JvdW5kcy5wcm90b3R5cGUgPSB7XHJcblx0Ly8gZXh0ZW5kIHRoZSBib3VuZHMgdG8gY29udGFpbiB0aGUgZ2l2ZW4gcG9pbnQgb3IgYm91bmRzXHJcblx0ZXh0ZW5kOiBmdW5jdGlvbiAob2JqKSB7IC8vIChMYXRMbmcpIG9yIChMYXRMbmdCb3VuZHMpXHJcblx0XHRpZiAoIW9iaikgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdHZhciBsYXRMbmcgPSBMLmxhdExuZyhvYmopO1xyXG5cdFx0aWYgKGxhdExuZyAhPT0gbnVsbCkge1xyXG5cdFx0XHRvYmogPSBsYXRMbmc7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvYmogPSBMLmxhdExuZ0JvdW5kcyhvYmopO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBMLkxhdExuZykge1xyXG5cdFx0XHRpZiAoIXRoaXMuX3NvdXRoV2VzdCAmJiAhdGhpcy5fbm9ydGhFYXN0KSB7XHJcblx0XHRcdFx0dGhpcy5fc291dGhXZXN0ID0gbmV3IEwuTGF0TG5nKG9iai5sYXQsIG9iai5sbmcpO1xyXG5cdFx0XHRcdHRoaXMuX25vcnRoRWFzdCA9IG5ldyBMLkxhdExuZyhvYmoubGF0LCBvYmoubG5nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl9zb3V0aFdlc3QubGF0ID0gTWF0aC5taW4ob2JqLmxhdCwgdGhpcy5fc291dGhXZXN0LmxhdCk7XHJcblx0XHRcdFx0dGhpcy5fc291dGhXZXN0LmxuZyA9IE1hdGgubWluKG9iai5sbmcsIHRoaXMuX3NvdXRoV2VzdC5sbmcpO1xyXG5cclxuXHRcdFx0XHR0aGlzLl9ub3J0aEVhc3QubGF0ID0gTWF0aC5tYXgob2JqLmxhdCwgdGhpcy5fbm9ydGhFYXN0LmxhdCk7XHJcblx0XHRcdFx0dGhpcy5fbm9ydGhFYXN0LmxuZyA9IE1hdGgubWF4KG9iai5sbmcsIHRoaXMuX25vcnRoRWFzdC5sbmcpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIEwuTGF0TG5nQm91bmRzKSB7XHJcblx0XHRcdHRoaXMuZXh0ZW5kKG9iai5fc291dGhXZXN0KTtcclxuXHRcdFx0dGhpcy5leHRlbmQob2JqLl9ub3J0aEVhc3QpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Ly8gZXh0ZW5kIHRoZSBib3VuZHMgYnkgYSBwZXJjZW50YWdlXHJcblx0cGFkOiBmdW5jdGlvbiAoYnVmZmVyUmF0aW8pIHsgLy8gKE51bWJlcikgLT4gTGF0TG5nQm91bmRzXHJcblx0XHR2YXIgc3cgPSB0aGlzLl9zb3V0aFdlc3QsXHJcblx0XHQgICAgbmUgPSB0aGlzLl9ub3J0aEVhc3QsXHJcblx0XHQgICAgaGVpZ2h0QnVmZmVyID0gTWF0aC5hYnMoc3cubGF0IC0gbmUubGF0KSAqIGJ1ZmZlclJhdGlvLFxyXG5cdFx0ICAgIHdpZHRoQnVmZmVyID0gTWF0aC5hYnMoc3cubG5nIC0gbmUubG5nKSAqIGJ1ZmZlclJhdGlvO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmdCb3VuZHMoXHJcblx0XHQgICAgICAgIG5ldyBMLkxhdExuZyhzdy5sYXQgLSBoZWlnaHRCdWZmZXIsIHN3LmxuZyAtIHdpZHRoQnVmZmVyKSxcclxuXHRcdCAgICAgICAgbmV3IEwuTGF0TG5nKG5lLmxhdCArIGhlaWdodEJ1ZmZlciwgbmUubG5nICsgd2lkdGhCdWZmZXIpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRDZW50ZXI6IGZ1bmN0aW9uICgpIHsgLy8gLT4gTGF0TG5nXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKFxyXG5cdFx0ICAgICAgICAodGhpcy5fc291dGhXZXN0LmxhdCArIHRoaXMuX25vcnRoRWFzdC5sYXQpIC8gMixcclxuXHRcdCAgICAgICAgKHRoaXMuX3NvdXRoV2VzdC5sbmcgKyB0aGlzLl9ub3J0aEVhc3QubG5nKSAvIDIpO1xyXG5cdH0sXHJcblxyXG5cdGdldFNvdXRoV2VzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NvdXRoV2VzdDtcclxuXHR9LFxyXG5cclxuXHRnZXROb3J0aEVhc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9ub3J0aEVhc3Q7XHJcblx0fSxcclxuXHJcblx0Z2V0Tm9ydGhXZXN0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKHRoaXMuZ2V0Tm9ydGgoKSwgdGhpcy5nZXRXZXN0KCkpO1xyXG5cdH0sXHJcblxyXG5cdGdldFNvdXRoRWFzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyh0aGlzLmdldFNvdXRoKCksIHRoaXMuZ2V0RWFzdCgpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRXZXN0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc291dGhXZXN0LmxuZztcclxuXHR9LFxyXG5cclxuXHRnZXRTb3V0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NvdXRoV2VzdC5sYXQ7XHJcblx0fSxcclxuXHJcblx0Z2V0RWFzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX25vcnRoRWFzdC5sbmc7XHJcblx0fSxcclxuXHJcblx0Z2V0Tm9ydGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9ub3J0aEVhc3QubGF0O1xyXG5cdH0sXHJcblxyXG5cdGNvbnRhaW5zOiBmdW5jdGlvbiAob2JqKSB7IC8vIChMYXRMbmdCb3VuZHMpIG9yIChMYXRMbmcpIC0+IEJvb2xlYW5cclxuXHRcdGlmICh0eXBlb2Ygb2JqWzBdID09PSAnbnVtYmVyJyB8fCBvYmogaW5zdGFuY2VvZiBMLkxhdExuZykge1xyXG5cdFx0XHRvYmogPSBMLmxhdExuZyhvYmopO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b2JqID0gTC5sYXRMbmdCb3VuZHMob2JqKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgc3cgPSB0aGlzLl9zb3V0aFdlc3QsXHJcblx0XHQgICAgbmUgPSB0aGlzLl9ub3J0aEVhc3QsXHJcblx0XHQgICAgc3cyLCBuZTI7XHJcblxyXG5cdFx0aWYgKG9iaiBpbnN0YW5jZW9mIEwuTGF0TG5nQm91bmRzKSB7XHJcblx0XHRcdHN3MiA9IG9iai5nZXRTb3V0aFdlc3QoKTtcclxuXHRcdFx0bmUyID0gb2JqLmdldE5vcnRoRWFzdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c3cyID0gbmUyID0gb2JqO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAoc3cyLmxhdCA+PSBzdy5sYXQpICYmIChuZTIubGF0IDw9IG5lLmxhdCkgJiZcclxuXHRcdCAgICAgICAoc3cyLmxuZyA+PSBzdy5sbmcpICYmIChuZTIubG5nIDw9IG5lLmxuZyk7XHJcblx0fSxcclxuXHJcblx0aW50ZXJzZWN0czogZnVuY3Rpb24gKGJvdW5kcykgeyAvLyAoTGF0TG5nQm91bmRzKVxyXG5cdFx0Ym91bmRzID0gTC5sYXRMbmdCb3VuZHMoYm91bmRzKTtcclxuXHJcblx0XHR2YXIgc3cgPSB0aGlzLl9zb3V0aFdlc3QsXHJcblx0XHQgICAgbmUgPSB0aGlzLl9ub3J0aEVhc3QsXHJcblx0XHQgICAgc3cyID0gYm91bmRzLmdldFNvdXRoV2VzdCgpLFxyXG5cdFx0ICAgIG5lMiA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKSxcclxuXHJcblx0XHQgICAgbGF0SW50ZXJzZWN0cyA9IChuZTIubGF0ID49IHN3LmxhdCkgJiYgKHN3Mi5sYXQgPD0gbmUubGF0KSxcclxuXHRcdCAgICBsbmdJbnRlcnNlY3RzID0gKG5lMi5sbmcgPj0gc3cubG5nKSAmJiAoc3cyLmxuZyA8PSBuZS5sbmcpO1xyXG5cclxuXHRcdHJldHVybiBsYXRJbnRlcnNlY3RzICYmIGxuZ0ludGVyc2VjdHM7XHJcblx0fSxcclxuXHJcblx0dG9CQm94U3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gW3RoaXMuZ2V0V2VzdCgpLCB0aGlzLmdldFNvdXRoKCksIHRoaXMuZ2V0RWFzdCgpLCB0aGlzLmdldE5vcnRoKCldLmpvaW4oJywnKTtcclxuXHR9LFxyXG5cclxuXHRlcXVhbHM6IGZ1bmN0aW9uIChib3VuZHMpIHsgLy8gKExhdExuZ0JvdW5kcylcclxuXHRcdGlmICghYm91bmRzKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3NvdXRoV2VzdC5lcXVhbHMoYm91bmRzLmdldFNvdXRoV2VzdCgpKSAmJlxyXG5cdFx0ICAgICAgIHRoaXMuX25vcnRoRWFzdC5lcXVhbHMoYm91bmRzLmdldE5vcnRoRWFzdCgpKTtcclxuXHR9LFxyXG5cclxuXHRpc1ZhbGlkOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gISEodGhpcy5fc291dGhXZXN0ICYmIHRoaXMuX25vcnRoRWFzdCk7XHJcblx0fVxyXG59O1xyXG5cclxuLy9UT0RPIEludGVybmF0aW9uYWwgZGF0ZSBsaW5lP1xyXG5cclxuTC5sYXRMbmdCb3VuZHMgPSBmdW5jdGlvbiAoYSwgYikgeyAvLyAoTGF0TG5nQm91bmRzKSBvciAoTGF0TG5nLCBMYXRMbmcpXHJcblx0aWYgKCFhIHx8IGEgaW5zdGFuY2VvZiBMLkxhdExuZ0JvdW5kcykge1xyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cdHJldHVybiBuZXcgTC5MYXRMbmdCb3VuZHMoYSwgYik7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlByb2plY3Rpb24gY29udGFpbnMgdmFyaW91cyBnZW9ncmFwaGljYWwgcHJvamVjdGlvbnMgdXNlZCBieSBDUlMgY2xhc3Nlcy5cclxuICovXHJcblxyXG5MLlByb2plY3Rpb24gPSB7fTtcclxuXG5cbi8qXHJcbiAqIFNwaGVyaWNhbCBNZXJjYXRvciBpcyB0aGUgbW9zdCBwb3B1bGFyIG1hcCBwcm9qZWN0aW9uLCB1c2VkIGJ5IEVQU0c6Mzg1NyBDUlMgdXNlZCBieSBkZWZhdWx0LlxyXG4gKi9cclxuXHJcbkwuUHJvamVjdGlvbi5TcGhlcmljYWxNZXJjYXRvciA9IHtcclxuXHRNQVhfTEFUSVRVREU6IDg1LjA1MTEyODc3OTgsXHJcblxyXG5cdHByb2plY3Q6IGZ1bmN0aW9uIChsYXRsbmcpIHsgLy8gKExhdExuZykgLT4gUG9pbnRcclxuXHRcdHZhciBkID0gTC5MYXRMbmcuREVHX1RPX1JBRCxcclxuXHRcdCAgICBtYXggPSB0aGlzLk1BWF9MQVRJVFVERSxcclxuXHRcdCAgICBsYXQgPSBNYXRoLm1heChNYXRoLm1pbihtYXgsIGxhdGxuZy5sYXQpLCAtbWF4KSxcclxuXHRcdCAgICB4ID0gbGF0bG5nLmxuZyAqIGQsXHJcblx0XHQgICAgeSA9IGxhdCAqIGQ7XHJcblxyXG5cdFx0eSA9IE1hdGgubG9nKE1hdGgudGFuKChNYXRoLlBJIC8gNCkgKyAoeSAvIDIpKSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KHgsIHkpO1xyXG5cdH0sXHJcblxyXG5cdHVucHJvamVjdDogZnVuY3Rpb24gKHBvaW50KSB7IC8vIChQb2ludCwgQm9vbGVhbikgLT4gTGF0TG5nXHJcblx0XHR2YXIgZCA9IEwuTGF0TG5nLlJBRF9UT19ERUcsXHJcblx0XHQgICAgbG5nID0gcG9pbnQueCAqIGQsXHJcblx0XHQgICAgbGF0ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAocG9pbnQueSkpIC0gKE1hdGguUEkgLyAyKSkgKiBkO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcobGF0LCBsbmcpO1xyXG5cdH1cclxufTtcclxuXG5cbi8qXHJcbiAqIFNpbXBsZSBlcXVpcmVjdGFuZ3VsYXIgKFBsYXRlIENhcnJlZSkgcHJvamVjdGlvbiwgdXNlZCBieSBDUlMgbGlrZSBFUFNHOjQzMjYgYW5kIFNpbXBsZS5cclxuICovXHJcblxyXG5MLlByb2plY3Rpb24uTG9uTGF0ID0ge1xyXG5cdHByb2plY3Q6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludChsYXRsbmcubG5nLCBsYXRsbmcubGF0KTtcclxuXHR9LFxyXG5cclxuXHR1bnByb2plY3Q6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhwb2ludC55LCBwb2ludC54KTtcclxuXHR9XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkNSUyBpcyBhIGJhc2Ugb2JqZWN0IGZvciBhbGwgZGVmaW5lZCBDUlMgKENvb3JkaW5hdGUgUmVmZXJlbmNlIFN5c3RlbXMpIGluIExlYWZsZXQuXHJcbiAqL1xyXG5cclxuTC5DUlMgPSB7XHJcblx0bGF0TG5nVG9Qb2ludDogZnVuY3Rpb24gKGxhdGxuZywgem9vbSkgeyAvLyAoTGF0TG5nLCBOdW1iZXIpIC0+IFBvaW50XHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSB0aGlzLnByb2plY3Rpb24ucHJvamVjdChsYXRsbmcpLFxyXG5cdFx0ICAgIHNjYWxlID0gdGhpcy5zY2FsZSh6b29tKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmFuc2Zvcm1hdGlvbi5fdHJhbnNmb3JtKHByb2plY3RlZFBvaW50LCBzY2FsZSk7XHJcblx0fSxcclxuXHJcblx0cG9pbnRUb0xhdExuZzogZnVuY3Rpb24gKHBvaW50LCB6b29tKSB7IC8vIChQb2ludCwgTnVtYmVyWywgQm9vbGVhbl0pIC0+IExhdExuZ1xyXG5cdFx0dmFyIHNjYWxlID0gdGhpcy5zY2FsZSh6b29tKSxcclxuXHRcdCAgICB1bnRyYW5zZm9ybWVkUG9pbnQgPSB0aGlzLnRyYW5zZm9ybWF0aW9uLnVudHJhbnNmb3JtKHBvaW50LCBzY2FsZSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMucHJvamVjdGlvbi51bnByb2plY3QodW50cmFuc2Zvcm1lZFBvaW50KTtcclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5wcm9qZWN0aW9uLnByb2plY3QobGF0bG5nKTtcclxuXHR9LFxyXG5cclxuXHRzY2FsZTogZnVuY3Rpb24gKHpvb20pIHtcclxuXHRcdHJldHVybiAyNTYgKiBNYXRoLnBvdygyLCB6b29tKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTaXplOiBmdW5jdGlvbiAoem9vbSkge1xyXG5cdFx0dmFyIHMgPSB0aGlzLnNjYWxlKHpvb20pO1xyXG5cdFx0cmV0dXJuIEwucG9pbnQocywgcyk7XHJcblx0fVxyXG59O1xyXG5cblxuLypcbiAqIEEgc2ltcGxlIENSUyB0aGF0IGNhbiBiZSB1c2VkIGZvciBmbGF0IG5vbi1FYXJ0aCBtYXBzIGxpa2UgcGFub3JhbWFzIG9yIGdhbWUgbWFwcy5cbiAqL1xuXG5MLkNSUy5TaW1wbGUgPSBMLmV4dGVuZCh7fSwgTC5DUlMsIHtcblx0cHJvamVjdGlvbjogTC5Qcm9qZWN0aW9uLkxvbkxhdCxcblx0dHJhbnNmb3JtYXRpb246IG5ldyBMLlRyYW5zZm9ybWF0aW9uKDEsIDAsIC0xLCAwKSxcblxuXHRzY2FsZTogZnVuY3Rpb24gKHpvb20pIHtcblx0XHRyZXR1cm4gTWF0aC5wb3coMiwgem9vbSk7XG5cdH1cbn0pO1xuXG5cbi8qXHJcbiAqIEwuQ1JTLkVQU0czODU3IChTcGhlcmljYWwgTWVyY2F0b3IpIGlzIHRoZSBtb3N0IGNvbW1vbiBDUlMgZm9yIHdlYiBtYXBwaW5nXHJcbiAqIGFuZCBpcyB1c2VkIGJ5IExlYWZsZXQgYnkgZGVmYXVsdC5cclxuICovXHJcblxyXG5MLkNSUy5FUFNHMzg1NyA9IEwuZXh0ZW5kKHt9LCBMLkNSUywge1xyXG5cdGNvZGU6ICdFUFNHOjM4NTcnLFxyXG5cclxuXHRwcm9qZWN0aW9uOiBMLlByb2plY3Rpb24uU3BoZXJpY2FsTWVyY2F0b3IsXHJcblx0dHJhbnNmb3JtYXRpb246IG5ldyBMLlRyYW5zZm9ybWF0aW9uKDAuNSAvIE1hdGguUEksIDAuNSwgLTAuNSAvIE1hdGguUEksIDAuNSksXHJcblxyXG5cdHByb2plY3Q6IGZ1bmN0aW9uIChsYXRsbmcpIHsgLy8gKExhdExuZykgLT4gUG9pbnRcclxuXHRcdHZhciBwcm9qZWN0ZWRQb2ludCA9IHRoaXMucHJvamVjdGlvbi5wcm9qZWN0KGxhdGxuZyksXHJcblx0XHQgICAgZWFydGhSYWRpdXMgPSA2Mzc4MTM3O1xyXG5cdFx0cmV0dXJuIHByb2plY3RlZFBvaW50Lm11bHRpcGx5QnkoZWFydGhSYWRpdXMpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLkNSUy5FUFNHOTAwOTEzID0gTC5leHRlbmQoe30sIEwuQ1JTLkVQU0czODU3LCB7XHJcblx0Y29kZTogJ0VQU0c6OTAwOTEzJ1xyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuQ1JTLkVQU0c0MzI2IGlzIGEgQ1JTIHBvcHVsYXIgYW1vbmcgYWR2YW5jZWQgR0lTIHNwZWNpYWxpc3RzLlxyXG4gKi9cclxuXHJcbkwuQ1JTLkVQU0c0MzI2ID0gTC5leHRlbmQoe30sIEwuQ1JTLCB7XHJcblx0Y29kZTogJ0VQU0c6NDMyNicsXHJcblxyXG5cdHByb2plY3Rpb246IEwuUHJvamVjdGlvbi5Mb25MYXQsXHJcblx0dHJhbnNmb3JtYXRpb246IG5ldyBMLlRyYW5zZm9ybWF0aW9uKDEgLyAzNjAsIDAuNSwgLTEgLyAzNjAsIDAuNSlcclxufSk7XHJcblxuXG4vKlxyXG4gKiBMLk1hcCBpcyB0aGUgY2VudHJhbCBjbGFzcyBvZiB0aGUgQVBJIC0gaXQgaXMgdXNlZCB0byBjcmVhdGUgYSBtYXAuXHJcbiAqL1xyXG5cclxuTC5NYXAgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblxyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0Y3JzOiBMLkNSUy5FUFNHMzg1NyxcclxuXHJcblx0XHQvKlxyXG5cdFx0Y2VudGVyOiBMYXRMbmcsXHJcblx0XHR6b29tOiBOdW1iZXIsXHJcblx0XHRsYXllcnM6IEFycmF5LFxyXG5cdFx0Ki9cclxuXHJcblx0XHRmYWRlQW5pbWF0aW9uOiBMLkRvbVV0aWwuVFJBTlNJVElPTiAmJiAhTC5Ccm93c2VyLmFuZHJvaWQyMyxcclxuXHRcdHRyYWNrUmVzaXplOiB0cnVlLFxyXG5cdFx0bWFya2VyWm9vbUFuaW1hdGlvbjogTC5Eb21VdGlsLlRSQU5TSVRJT04gJiYgTC5Ccm93c2VyLmFueTNkXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGlkLCBvcHRpb25zKSB7IC8vIChIVE1MRWxlbWVudCBvciBTdHJpbmcsIE9iamVjdClcclxuXHRcdG9wdGlvbnMgPSBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblxyXG5cclxuXHRcdHRoaXMuX2luaXRDb250YWluZXIoaWQpO1xyXG5cdFx0dGhpcy5faW5pdExheW91dCgpO1xyXG5cclxuXHRcdC8vIGhhY2sgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvaXNzdWVzLzE5ODBcclxuXHRcdHRoaXMuX29uUmVzaXplID0gTC5iaW5kKHRoaXMuX29uUmVzaXplLCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLl9pbml0RXZlbnRzKCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMubWF4Qm91bmRzKSB7XHJcblx0XHRcdHRoaXMuc2V0TWF4Qm91bmRzKG9wdGlvbnMubWF4Qm91bmRzKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5jZW50ZXIgJiYgb3B0aW9ucy56b29tICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dGhpcy5zZXRWaWV3KEwubGF0TG5nKG9wdGlvbnMuY2VudGVyKSwgb3B0aW9ucy56b29tLCB7cmVzZXQ6IHRydWV9KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9oYW5kbGVycyA9IFtdO1xyXG5cclxuXHRcdHRoaXMuX2xheWVycyA9IHt9O1xyXG5cdFx0dGhpcy5fem9vbUJvdW5kTGF5ZXJzID0ge307XHJcblx0XHR0aGlzLl90aWxlTGF5ZXJzTnVtID0gMDtcclxuXHJcblx0XHR0aGlzLmNhbGxJbml0SG9va3MoKTtcclxuXHJcblx0XHR0aGlzLl9hZGRMYXllcnMob3B0aW9ucy5sYXllcnMpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBwdWJsaWMgbWV0aG9kcyB0aGF0IG1vZGlmeSBtYXAgc3RhdGVcclxuXHJcblx0Ly8gcmVwbGFjZWQgYnkgYW5pbWF0aW9uLXBvd2VyZWQgaW1wbGVtZW50YXRpb24gaW4gTWFwLlBhbkFuaW1hdGlvbi5qc1xyXG5cdHNldFZpZXc6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20pIHtcclxuXHRcdHpvb20gPSB6b29tID09PSB1bmRlZmluZWQgPyB0aGlzLmdldFpvb20oKSA6IHpvb207XHJcblx0XHR0aGlzLl9yZXNldFZpZXcoTC5sYXRMbmcoY2VudGVyKSwgdGhpcy5fbGltaXRab29tKHpvb20pKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHNldFpvb206IGZ1bmN0aW9uICh6b29tLCBvcHRpb25zKSB7XHJcblx0XHRpZiAoIXRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLl96b29tID0gdGhpcy5fbGltaXRab29tKHpvb20pO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLnNldFZpZXcodGhpcy5nZXRDZW50ZXIoKSwgem9vbSwge3pvb206IG9wdGlvbnN9KTtcclxuXHR9LFxyXG5cclxuXHR6b29tSW46IGZ1bmN0aW9uIChkZWx0YSwgb3B0aW9ucykge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0Wm9vbSh0aGlzLl96b29tICsgKGRlbHRhIHx8IDEpLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHR6b29tT3V0OiBmdW5jdGlvbiAoZGVsdGEsIG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiB0aGlzLnNldFpvb20odGhpcy5fem9vbSAtIChkZWx0YSB8fCAxKSwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0c2V0Wm9vbUFyb3VuZDogZnVuY3Rpb24gKGxhdGxuZywgem9vbSwgb3B0aW9ucykge1xyXG5cdFx0dmFyIHNjYWxlID0gdGhpcy5nZXRab29tU2NhbGUoem9vbSksXHJcblx0XHQgICAgdmlld0hhbGYgPSB0aGlzLmdldFNpemUoKS5kaXZpZGVCeSgyKSxcclxuXHRcdCAgICBjb250YWluZXJQb2ludCA9IGxhdGxuZyBpbnN0YW5jZW9mIEwuUG9pbnQgPyBsYXRsbmcgOiB0aGlzLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGF0bG5nKSxcclxuXHJcblx0XHQgICAgY2VudGVyT2Zmc2V0ID0gY29udGFpbmVyUG9pbnQuc3VidHJhY3Qodmlld0hhbGYpLm11bHRpcGx5QnkoMSAtIDEgLyBzY2FsZSksXHJcblx0XHQgICAgbmV3Q2VudGVyID0gdGhpcy5jb250YWluZXJQb2ludFRvTGF0TG5nKHZpZXdIYWxmLmFkZChjZW50ZXJPZmZzZXQpKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5zZXRWaWV3KG5ld0NlbnRlciwgem9vbSwge3pvb206IG9wdGlvbnN9KTtcclxuXHR9LFxyXG5cclxuXHRmaXRCb3VuZHM6IGZ1bmN0aW9uIChib3VuZHMsIG9wdGlvbnMpIHtcclxuXHJcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHRcdGJvdW5kcyA9IGJvdW5kcy5nZXRCb3VuZHMgPyBib3VuZHMuZ2V0Qm91bmRzKCkgOiBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdHZhciBwYWRkaW5nVEwgPSBMLnBvaW50KG9wdGlvbnMucGFkZGluZ1RvcExlZnQgfHwgb3B0aW9ucy5wYWRkaW5nIHx8IFswLCAwXSksXHJcblx0XHQgICAgcGFkZGluZ0JSID0gTC5wb2ludChvcHRpb25zLnBhZGRpbmdCb3R0b21SaWdodCB8fCBvcHRpb25zLnBhZGRpbmcgfHwgWzAsIDBdKSxcclxuXHJcblx0XHQgICAgem9vbSA9IHRoaXMuZ2V0Qm91bmRzWm9vbShib3VuZHMsIGZhbHNlLCBwYWRkaW5nVEwuYWRkKHBhZGRpbmdCUikpLFxyXG5cdFx0ICAgIHBhZGRpbmdPZmZzZXQgPSBwYWRkaW5nQlIuc3VidHJhY3QocGFkZGluZ1RMKS5kaXZpZGVCeSgyKSxcclxuXHJcblx0XHQgICAgc3dQb2ludCA9IHRoaXMucHJvamVjdChib3VuZHMuZ2V0U291dGhXZXN0KCksIHpvb20pLFxyXG5cdFx0ICAgIG5lUG9pbnQgPSB0aGlzLnByb2plY3QoYm91bmRzLmdldE5vcnRoRWFzdCgpLCB6b29tKSxcclxuXHRcdCAgICBjZW50ZXIgPSB0aGlzLnVucHJvamVjdChzd1BvaW50LmFkZChuZVBvaW50KS5kaXZpZGVCeSgyKS5hZGQocGFkZGluZ09mZnNldCksIHpvb20pO1xyXG5cclxuXHRcdHpvb20gPSBvcHRpb25zICYmIG9wdGlvbnMubWF4Wm9vbSA/IE1hdGgubWluKG9wdGlvbnMubWF4Wm9vbSwgem9vbSkgOiB6b29tO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnNldFZpZXcoY2VudGVyLCB6b29tLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRmaXRXb3JsZDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiB0aGlzLmZpdEJvdW5kcyhbWy05MCwgLTE4MF0sIFs5MCwgMTgwXV0sIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdHBhblRvOiBmdW5jdGlvbiAoY2VudGVyLCBvcHRpb25zKSB7IC8vIChMYXRMbmcpXHJcblx0XHRyZXR1cm4gdGhpcy5zZXRWaWV3KGNlbnRlciwgdGhpcy5fem9vbSwge3Bhbjogb3B0aW9uc30pO1xyXG5cdH0sXHJcblxyXG5cdHBhbkJ5OiBmdW5jdGlvbiAob2Zmc2V0KSB7IC8vIChQb2ludClcclxuXHRcdC8vIHJlcGxhY2VkIHdpdGggYW5pbWF0ZWQgcGFuQnkgaW4gTWFwLlBhbkFuaW1hdGlvbi5qc1xyXG5cdFx0dGhpcy5maXJlKCdtb3Zlc3RhcnQnKTtcclxuXHJcblx0XHR0aGlzLl9yYXdQYW5CeShMLnBvaW50KG9mZnNldCkpO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgnbW92ZScpO1xyXG5cdFx0cmV0dXJuIHRoaXMuZmlyZSgnbW92ZWVuZCcpO1xyXG5cdH0sXHJcblxyXG5cdHNldE1heEJvdW5kczogZnVuY3Rpb24gKGJvdW5kcykge1xyXG5cdFx0Ym91bmRzID0gTC5sYXRMbmdCb3VuZHMoYm91bmRzKTtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMubWF4Qm91bmRzID0gYm91bmRzO1xyXG5cclxuXHRcdGlmICghYm91bmRzKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLm9mZignbW92ZWVuZCcsIHRoaXMuX3Bhbkluc2lkZU1heEJvdW5kcywgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLl9wYW5JbnNpZGVNYXhCb3VuZHMoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5vbignbW92ZWVuZCcsIHRoaXMuX3Bhbkluc2lkZU1heEJvdW5kcywgdGhpcyk7XHJcblx0fSxcclxuXHJcblx0cGFuSW5zaWRlQm91bmRzOiBmdW5jdGlvbiAoYm91bmRzLCBvcHRpb25zKSB7XHJcblx0XHR2YXIgY2VudGVyID0gdGhpcy5nZXRDZW50ZXIoKSxcclxuXHRcdFx0bmV3Q2VudGVyID0gdGhpcy5fbGltaXRDZW50ZXIoY2VudGVyLCB0aGlzLl96b29tLCBib3VuZHMpO1xyXG5cclxuXHRcdGlmIChjZW50ZXIuZXF1YWxzKG5ld0NlbnRlcikpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5wYW5UbyhuZXdDZW50ZXIsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdGFkZExheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdC8vIFRPRE8gbWV0aG9kIGlzIHRvbyBiaWcsIHJlZmFjdG9yXHJcblxyXG5cdFx0dmFyIGlkID0gTC5zdGFtcChsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2xheWVyc1tpZF0pIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR0aGlzLl9sYXllcnNbaWRdID0gbGF5ZXI7XHJcblxyXG5cdFx0Ly8gVE9ETyBnZXRNYXhab29tLCBnZXRNaW5ab29tIGluIElMYXllciAoaW5zdGVhZCBvZiBvcHRpb25zKVxyXG5cdFx0aWYgKGxheWVyLm9wdGlvbnMgJiYgKCFpc05hTihsYXllci5vcHRpb25zLm1heFpvb20pIHx8ICFpc05hTihsYXllci5vcHRpb25zLm1pblpvb20pKSkge1xyXG5cdFx0XHR0aGlzLl96b29tQm91bmRMYXllcnNbaWRdID0gbGF5ZXI7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVpvb21MZXZlbHMoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUT0RPIGxvb2tzIHVnbHksIHJlZmFjdG9yISEhXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5UaWxlTGF5ZXIgJiYgKGxheWVyIGluc3RhbmNlb2YgTC5UaWxlTGF5ZXIpKSB7XHJcblx0XHRcdHRoaXMuX3RpbGVMYXllcnNOdW0rKztcclxuXHRcdFx0dGhpcy5fdGlsZUxheWVyc1RvTG9hZCsrO1xyXG5cdFx0XHRsYXllci5vbignbG9hZCcsIHRoaXMuX29uVGlsZUxheWVyTG9hZCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLl9sYXllckFkZChsYXllcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlTGF5ZXI6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0dmFyIGlkID0gTC5zdGFtcChsYXllcik7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9sYXllcnNbaWRdKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHRsYXllci5vblJlbW92ZSh0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRkZWxldGUgdGhpcy5fbGF5ZXJzW2lkXTtcclxuXHJcblx0XHRpZiAodGhpcy5fbG9hZGVkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnbGF5ZXJyZW1vdmUnLCB7bGF5ZXI6IGxheWVyfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX3pvb21Cb3VuZExheWVyc1tpZF0pIHtcclxuXHRcdFx0ZGVsZXRlIHRoaXMuX3pvb21Cb3VuZExheWVyc1tpZF07XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVpvb21MZXZlbHMoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUT0RPIGxvb2tzIHVnbHksIHJlZmFjdG9yXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5UaWxlTGF5ZXIgJiYgKGxheWVyIGluc3RhbmNlb2YgTC5UaWxlTGF5ZXIpKSB7XHJcblx0XHRcdHRoaXMuX3RpbGVMYXllcnNOdW0tLTtcclxuXHRcdFx0dGhpcy5fdGlsZUxheWVyc1RvTG9hZC0tO1xyXG5cdFx0XHRsYXllci5vZmYoJ2xvYWQnLCB0aGlzLl9vblRpbGVMYXllckxvYWQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGhhc0xheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdGlmICghbGF5ZXIpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cdFx0cmV0dXJuIChMLnN0YW1wKGxheWVyKSBpbiB0aGlzLl9sYXllcnMpO1xyXG5cdH0sXHJcblxyXG5cdGVhY2hMYXllcjogZnVuY3Rpb24gKG1ldGhvZCwgY29udGV4dCkge1xyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl9sYXllcnMpIHtcclxuXHRcdFx0bWV0aG9kLmNhbGwoY29udGV4dCwgdGhpcy5fbGF5ZXJzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGludmFsaWRhdGVTaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHRvcHRpb25zID0gTC5leHRlbmQoe1xyXG5cdFx0XHRhbmltYXRlOiBmYWxzZSxcclxuXHRcdFx0cGFuOiB0cnVlXHJcblx0XHR9LCBvcHRpb25zID09PSB0cnVlID8ge2FuaW1hdGU6IHRydWV9IDogb3B0aW9ucyk7XHJcblxyXG5cdFx0dmFyIG9sZFNpemUgPSB0aGlzLmdldFNpemUoKTtcclxuXHRcdHRoaXMuX3NpemVDaGFuZ2VkID0gdHJ1ZTtcclxuXHRcdHRoaXMuX2luaXRpYWxDZW50ZXIgPSBudWxsO1xyXG5cclxuXHRcdHZhciBuZXdTaXplID0gdGhpcy5nZXRTaXplKCksXHJcblx0XHQgICAgb2xkQ2VudGVyID0gb2xkU2l6ZS5kaXZpZGVCeSgyKS5yb3VuZCgpLFxyXG5cdFx0ICAgIG5ld0NlbnRlciA9IG5ld1NpemUuZGl2aWRlQnkoMikucm91bmQoKSxcclxuXHRcdCAgICBvZmZzZXQgPSBvbGRDZW50ZXIuc3VidHJhY3QobmV3Q2VudGVyKTtcclxuXHJcblx0XHRpZiAoIW9mZnNldC54ICYmICFvZmZzZXQueSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdGlmIChvcHRpb25zLmFuaW1hdGUgJiYgb3B0aW9ucy5wYW4pIHtcclxuXHRcdFx0dGhpcy5wYW5CeShvZmZzZXQpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmIChvcHRpb25zLnBhbikge1xyXG5cdFx0XHRcdHRoaXMuX3Jhd1BhbkJ5KG9mZnNldCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuZmlyZSgnbW92ZScpO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMuZGVib3VuY2VNb3ZlZW5kKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3NpemVUaW1lcik7XHJcblx0XHRcdFx0dGhpcy5fc2l6ZVRpbWVyID0gc2V0VGltZW91dChMLmJpbmQodGhpcy5maXJlLCB0aGlzLCAnbW92ZWVuZCcpLCAyMDApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZmlyZSgnbW92ZWVuZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuZmlyZSgncmVzaXplJywge1xyXG5cdFx0XHRvbGRTaXplOiBvbGRTaXplLFxyXG5cdFx0XHRuZXdTaXplOiBuZXdTaXplXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHQvLyBUT0RPIGhhbmRsZXIuYWRkVG9cclxuXHRhZGRIYW5kbGVyOiBmdW5jdGlvbiAobmFtZSwgSGFuZGxlckNsYXNzKSB7XHJcblx0XHRpZiAoIUhhbmRsZXJDbGFzcykgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdHZhciBoYW5kbGVyID0gdGhpc1tuYW1lXSA9IG5ldyBIYW5kbGVyQ2xhc3ModGhpcyk7XHJcblxyXG5cdFx0dGhpcy5faGFuZGxlcnMucHVzaChoYW5kbGVyKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zW25hbWVdKSB7XHJcblx0XHRcdGhhbmRsZXIuZW5hYmxlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbG9hZGVkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgndW5sb2FkJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faW5pdEV2ZW50cygnb2ZmJyk7XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Ly8gdGhyb3dzIGVycm9yIGluIElFNi04XHJcblx0XHRcdGRlbGV0ZSB0aGlzLl9jb250YWluZXIuX2xlYWZsZXQ7XHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5fbGVhZmxldCA9IHVuZGVmaW5lZDtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jbGVhclBhbmVzKCk7XHJcblx0XHRpZiAodGhpcy5fY2xlYXJDb250cm9sUG9zKSB7XHJcblx0XHRcdHRoaXMuX2NsZWFyQ29udHJvbFBvcygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NsZWFySGFuZGxlcnMoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gcHVibGljIG1ldGhvZHMgZm9yIGdldHRpbmcgbWFwIHN0YXRlXHJcblxyXG5cdGdldENlbnRlcjogZnVuY3Rpb24gKCkgeyAvLyAoQm9vbGVhbikgLT4gTGF0TG5nXHJcblx0XHR0aGlzLl9jaGVja0lmTG9hZGVkKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2luaXRpYWxDZW50ZXIgJiYgIXRoaXMuX21vdmVkKCkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2luaXRpYWxDZW50ZXI7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5sYXllclBvaW50VG9MYXRMbmcodGhpcy5fZ2V0Q2VudGVyTGF5ZXJQb2ludCgpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRab29tOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9vbTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBib3VuZHMgPSB0aGlzLmdldFBpeGVsQm91bmRzKCksXHJcblx0XHQgICAgc3cgPSB0aGlzLnVucHJvamVjdChib3VuZHMuZ2V0Qm90dG9tTGVmdCgpKSxcclxuXHRcdCAgICBuZSA9IHRoaXMudW5wcm9qZWN0KGJvdW5kcy5nZXRUb3BSaWdodCgpKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKHN3LCBuZSk7XHJcblx0fSxcclxuXHJcblx0Z2V0TWluWm9vbTogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5taW5ab29tID09PSB1bmRlZmluZWQgP1xyXG5cdFx0XHQodGhpcy5fbGF5ZXJzTWluWm9vbSA9PT0gdW5kZWZpbmVkID8gMCA6IHRoaXMuX2xheWVyc01pblpvb20pIDpcclxuXHRcdFx0dGhpcy5vcHRpb25zLm1pblpvb207XHJcblx0fSxcclxuXHJcblx0Z2V0TWF4Wm9vbTogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5tYXhab29tID09PSB1bmRlZmluZWQgP1xyXG5cdFx0XHQodGhpcy5fbGF5ZXJzTWF4Wm9vbSA9PT0gdW5kZWZpbmVkID8gSW5maW5pdHkgOiB0aGlzLl9sYXllcnNNYXhab29tKSA6XHJcblx0XHRcdHRoaXMub3B0aW9ucy5tYXhab29tO1xyXG5cdH0sXHJcblxyXG5cdGdldEJvdW5kc1pvb206IGZ1bmN0aW9uIChib3VuZHMsIGluc2lkZSwgcGFkZGluZykgeyAvLyAoTGF0TG5nQm91bmRzWywgQm9vbGVhbiwgUG9pbnRdKSAtPiBOdW1iZXJcclxuXHRcdGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dmFyIHpvb20gPSB0aGlzLmdldE1pblpvb20oKSAtIChpbnNpZGUgPyAxIDogMCksXHJcblx0XHQgICAgbWF4Wm9vbSA9IHRoaXMuZ2V0TWF4Wm9vbSgpLFxyXG5cdFx0ICAgIHNpemUgPSB0aGlzLmdldFNpemUoKSxcclxuXHJcblx0XHQgICAgbncgPSBib3VuZHMuZ2V0Tm9ydGhXZXN0KCksXHJcblx0XHQgICAgc2UgPSBib3VuZHMuZ2V0U291dGhFYXN0KCksXHJcblxyXG5cdFx0ICAgIHpvb21Ob3RGb3VuZCA9IHRydWUsXHJcblx0XHQgICAgYm91bmRzU2l6ZTtcclxuXHJcblx0XHRwYWRkaW5nID0gTC5wb2ludChwYWRkaW5nIHx8IFswLCAwXSk7XHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHR6b29tKys7XHJcblx0XHRcdGJvdW5kc1NpemUgPSB0aGlzLnByb2plY3Qoc2UsIHpvb20pLnN1YnRyYWN0KHRoaXMucHJvamVjdChudywgem9vbSkpLmFkZChwYWRkaW5nKTtcclxuXHRcdFx0em9vbU5vdEZvdW5kID0gIWluc2lkZSA/IHNpemUuY29udGFpbnMoYm91bmRzU2l6ZSkgOiBib3VuZHNTaXplLnggPCBzaXplLnggfHwgYm91bmRzU2l6ZS55IDwgc2l6ZS55O1xyXG5cclxuXHRcdH0gd2hpbGUgKHpvb21Ob3RGb3VuZCAmJiB6b29tIDw9IG1heFpvb20pO1xyXG5cclxuXHRcdGlmICh6b29tTm90Rm91bmQgJiYgaW5zaWRlKSB7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBpbnNpZGUgPyB6b29tIDogem9vbSAtIDE7XHJcblx0fSxcclxuXHJcblx0Z2V0U2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9zaXplIHx8IHRoaXMuX3NpemVDaGFuZ2VkKSB7XHJcblx0XHRcdHRoaXMuX3NpemUgPSBuZXcgTC5Qb2ludChcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIuY2xpZW50V2lkdGgsXHJcblx0XHRcdFx0dGhpcy5fY29udGFpbmVyLmNsaWVudEhlaWdodCk7XHJcblxyXG5cdFx0XHR0aGlzLl9zaXplQ2hhbmdlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3NpemUuY2xvbmUoKTtcclxuXHR9LFxyXG5cclxuXHRnZXRQaXhlbEJvdW5kczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHRvcExlZnRQb2ludCA9IHRoaXMuX2dldFRvcExlZnRQb2ludCgpO1xyXG5cdFx0cmV0dXJuIG5ldyBMLkJvdW5kcyh0b3BMZWZ0UG9pbnQsIHRvcExlZnRQb2ludC5hZGQodGhpcy5nZXRTaXplKCkpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRQaXhlbE9yaWdpbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fY2hlY2tJZkxvYWRlZCgpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX2luaXRpYWxUb3BMZWZ0UG9pbnQ7XHJcblx0fSxcclxuXHJcblx0Z2V0UGFuZXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYW5lcztcclxuXHR9LFxyXG5cclxuXHRnZXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XHJcblx0fSxcclxuXHJcblxyXG5cdC8vIFRPRE8gcmVwbGFjZSB3aXRoIHVuaXZlcnNhbCBpbXBsZW1lbnRhdGlvbiBhZnRlciByZWZhY3RvcmluZyBwcm9qZWN0aW9uc1xyXG5cclxuXHRnZXRab29tU2NhbGU6IGZ1bmN0aW9uICh0b1pvb20pIHtcclxuXHRcdHZhciBjcnMgPSB0aGlzLm9wdGlvbnMuY3JzO1xyXG5cdFx0cmV0dXJuIGNycy5zY2FsZSh0b1pvb20pIC8gY3JzLnNjYWxlKHRoaXMuX3pvb20pO1xyXG5cdH0sXHJcblxyXG5cdGdldFNjYWxlWm9vbTogZnVuY3Rpb24gKHNjYWxlKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9vbSArIChNYXRoLmxvZyhzY2FsZSkgLyBNYXRoLkxOMik7XHJcblx0fSxcclxuXHJcblxyXG5cdC8vIGNvbnZlcnNpb24gbWV0aG9kc1xyXG5cclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nLCB6b29tKSB7IC8vIChMYXRMbmdbLCBOdW1iZXJdKSAtPiBQb2ludFxyXG5cdFx0em9vbSA9IHpvb20gPT09IHVuZGVmaW5lZCA/IHRoaXMuX3pvb20gOiB6b29tO1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5jcnMubGF0TG5nVG9Qb2ludChMLmxhdExuZyhsYXRsbmcpLCB6b29tKTtcclxuXHR9LFxyXG5cclxuXHR1bnByb2plY3Q6IGZ1bmN0aW9uIChwb2ludCwgem9vbSkgeyAvLyAoUG9pbnRbLCBOdW1iZXJdKSAtPiBMYXRMbmdcclxuXHRcdHpvb20gPSB6b29tID09PSB1bmRlZmluZWQgPyB0aGlzLl96b29tIDogem9vbTtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuY3JzLnBvaW50VG9MYXRMbmcoTC5wb2ludChwb2ludCksIHpvb20pO1xyXG5cdH0sXHJcblxyXG5cdGxheWVyUG9pbnRUb0xhdExuZzogZnVuY3Rpb24gKHBvaW50KSB7IC8vIChQb2ludClcclxuXHRcdHZhciBwcm9qZWN0ZWRQb2ludCA9IEwucG9pbnQocG9pbnQpLmFkZCh0aGlzLmdldFBpeGVsT3JpZ2luKCkpO1xyXG5cdFx0cmV0dXJuIHRoaXMudW5wcm9qZWN0KHByb2plY3RlZFBvaW50KTtcclxuXHR9LFxyXG5cclxuXHRsYXRMbmdUb0xheWVyUG9pbnQ6IGZ1bmN0aW9uIChsYXRsbmcpIHsgLy8gKExhdExuZylcclxuXHRcdHZhciBwcm9qZWN0ZWRQb2ludCA9IHRoaXMucHJvamVjdChMLmxhdExuZyhsYXRsbmcpKS5fcm91bmQoKTtcclxuXHRcdHJldHVybiBwcm9qZWN0ZWRQb2ludC5fc3VidHJhY3QodGhpcy5nZXRQaXhlbE9yaWdpbigpKTtcclxuXHR9LFxyXG5cclxuXHRjb250YWluZXJQb2ludFRvTGF5ZXJQb2ludDogZnVuY3Rpb24gKHBvaW50KSB7IC8vIChQb2ludClcclxuXHRcdHJldHVybiBMLnBvaW50KHBvaW50KS5zdWJ0cmFjdCh0aGlzLl9nZXRNYXBQYW5lUG9zKCkpO1xyXG5cdH0sXHJcblxyXG5cdGxheWVyUG9pbnRUb0NvbnRhaW5lclBvaW50OiBmdW5jdGlvbiAocG9pbnQpIHsgLy8gKFBvaW50KVxyXG5cdFx0cmV0dXJuIEwucG9pbnQocG9pbnQpLmFkZCh0aGlzLl9nZXRNYXBQYW5lUG9zKCkpO1xyXG5cdH0sXHJcblxyXG5cdGNvbnRhaW5lclBvaW50VG9MYXRMbmc6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0dmFyIGxheWVyUG9pbnQgPSB0aGlzLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KEwucG9pbnQocG9pbnQpKTtcclxuXHRcdHJldHVybiB0aGlzLmxheWVyUG9pbnRUb0xhdExuZyhsYXllclBvaW50KTtcclxuXHR9LFxyXG5cclxuXHRsYXRMbmdUb0NvbnRhaW5lclBvaW50OiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5sYXllclBvaW50VG9Db250YWluZXJQb2ludCh0aGlzLmxhdExuZ1RvTGF5ZXJQb2ludChMLmxhdExuZyhsYXRsbmcpKSk7XHJcblx0fSxcclxuXHJcblx0bW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQ6IGZ1bmN0aW9uIChlKSB7IC8vIChNb3VzZUV2ZW50KVxyXG5cdFx0cmV0dXJuIEwuRG9tRXZlbnQuZ2V0TW91c2VQb3NpdGlvbihlLCB0aGlzLl9jb250YWluZXIpO1xyXG5cdH0sXHJcblxyXG5cdG1vdXNlRXZlbnRUb0xheWVyUG9pbnQ6IGZ1bmN0aW9uIChlKSB7IC8vIChNb3VzZUV2ZW50KVxyXG5cdFx0cmV0dXJuIHRoaXMuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQodGhpcy5tb3VzZUV2ZW50VG9Db250YWluZXJQb2ludChlKSk7XHJcblx0fSxcclxuXHJcblx0bW91c2VFdmVudFRvTGF0TG5nOiBmdW5jdGlvbiAoZSkgeyAvLyAoTW91c2VFdmVudClcclxuXHRcdHJldHVybiB0aGlzLmxheWVyUG9pbnRUb0xhdExuZyh0aGlzLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZSkpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBtYXAgaW5pdGlhbGl6YXRpb24gbWV0aG9kc1xyXG5cclxuXHRfaW5pdENvbnRhaW5lcjogZnVuY3Rpb24gKGlkKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmdldChpZCk7XHJcblxyXG5cdFx0aWYgKCFjb250YWluZXIpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdNYXAgY29udGFpbmVyIG5vdCBmb3VuZC4nKTtcclxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLl9sZWFmbGV0KSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignTWFwIGNvbnRhaW5lciBpcyBhbHJlYWR5IGluaXRpYWxpemVkLicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnRhaW5lci5fbGVhZmxldCA9IHRydWU7XHJcblx0fSxcclxuXHJcblx0X2luaXRMYXlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXI7XHJcblxyXG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKGNvbnRhaW5lciwgJ2xlYWZsZXQtY29udGFpbmVyJyArXHJcblx0XHRcdChMLkJyb3dzZXIudG91Y2ggPyAnIGxlYWZsZXQtdG91Y2gnIDogJycpICtcclxuXHRcdFx0KEwuQnJvd3Nlci5yZXRpbmEgPyAnIGxlYWZsZXQtcmV0aW5hJyA6ICcnKSArXHJcblx0XHRcdChMLkJyb3dzZXIuaWVsdDkgPyAnIGxlYWZsZXQtb2xkaWUnIDogJycpICtcclxuXHRcdFx0KHRoaXMub3B0aW9ucy5mYWRlQW5pbWF0aW9uID8gJyBsZWFmbGV0LWZhZGUtYW5pbScgOiAnJykpO1xyXG5cclxuXHRcdHZhciBwb3NpdGlvbiA9IEwuRG9tVXRpbC5nZXRTdHlsZShjb250YWluZXIsICdwb3NpdGlvbicpO1xyXG5cclxuXHRcdGlmIChwb3NpdGlvbiAhPT0gJ2Fic29sdXRlJyAmJiBwb3NpdGlvbiAhPT0gJ3JlbGF0aXZlJyAmJiBwb3NpdGlvbiAhPT0gJ2ZpeGVkJykge1xyXG5cdFx0XHRjb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2luaXRQYW5lcygpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9pbml0Q29udHJvbFBvcykge1xyXG5cdFx0XHR0aGlzLl9pbml0Q29udHJvbFBvcygpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9pbml0UGFuZXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwYW5lcyA9IHRoaXMuX3BhbmVzID0ge307XHJcblxyXG5cdFx0dGhpcy5fbWFwUGFuZSA9IHBhbmVzLm1hcFBhbmUgPSB0aGlzLl9jcmVhdGVQYW5lKCdsZWFmbGV0LW1hcC1wYW5lJywgdGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHR0aGlzLl90aWxlUGFuZSA9IHBhbmVzLnRpbGVQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC10aWxlLXBhbmUnLCB0aGlzLl9tYXBQYW5lKTtcclxuXHRcdHBhbmVzLm9iamVjdHNQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1vYmplY3RzLXBhbmUnLCB0aGlzLl9tYXBQYW5lKTtcclxuXHRcdHBhbmVzLnNoYWRvd1BhbmUgPSB0aGlzLl9jcmVhdGVQYW5lKCdsZWFmbGV0LXNoYWRvdy1wYW5lJyk7XHJcblx0XHRwYW5lcy5vdmVybGF5UGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtb3ZlcmxheS1wYW5lJyk7XHJcblx0XHRwYW5lcy5tYXJrZXJQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1tYXJrZXItcGFuZScpO1xyXG5cdFx0cGFuZXMucG9wdXBQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1wb3B1cC1wYW5lJyk7XHJcblxyXG5cdFx0dmFyIHpvb21IaWRlID0gJyBsZWFmbGV0LXpvb20taGlkZSc7XHJcblxyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMubWFya2VyWm9vbUFuaW1hdGlvbikge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MocGFuZXMubWFya2VyUGFuZSwgem9vbUhpZGUpO1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MocGFuZXMuc2hhZG93UGFuZSwgem9vbUhpZGUpO1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MocGFuZXMucG9wdXBQYW5lLCB6b29tSGlkZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2NyZWF0ZVBhbmU6IGZ1bmN0aW9uIChjbGFzc05hbWUsIGNvbnRhaW5lcikge1xyXG5cdFx0cmV0dXJuIEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSwgY29udGFpbmVyIHx8IHRoaXMuX3BhbmVzLm9iamVjdHNQYW5lKTtcclxuXHR9LFxyXG5cclxuXHRfY2xlYXJQYW5lczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuX21hcFBhbmUpO1xyXG5cdH0sXHJcblxyXG5cdF9hZGRMYXllcnM6IGZ1bmN0aW9uIChsYXllcnMpIHtcclxuXHRcdGxheWVycyA9IGxheWVycyA/IChMLlV0aWwuaXNBcnJheShsYXllcnMpID8gbGF5ZXJzIDogW2xheWVyc10pIDogW107XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGxheWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR0aGlzLmFkZExheWVyKGxheWVyc1tpXSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8vIHByaXZhdGUgbWV0aG9kcyB0aGF0IG1vZGlmeSBtYXAgc3RhdGVcclxuXHJcblx0X3Jlc2V0VmlldzogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgcHJlc2VydmVNYXBPZmZzZXQsIGFmdGVyWm9vbUFuaW0pIHtcclxuXHJcblx0XHR2YXIgem9vbUNoYW5nZWQgPSAodGhpcy5fem9vbSAhPT0gem9vbSk7XHJcblxyXG5cdFx0aWYgKCFhZnRlclpvb21BbmltKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnbW92ZXN0YXJ0Jyk7XHJcblxyXG5cdFx0XHRpZiAoem9vbUNoYW5nZWQpIHtcclxuXHRcdFx0XHR0aGlzLmZpcmUoJ3pvb21zdGFydCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fem9vbSA9IHpvb207XHJcblx0XHR0aGlzLl9pbml0aWFsQ2VudGVyID0gY2VudGVyO1xyXG5cclxuXHRcdHRoaXMuX2luaXRpYWxUb3BMZWZ0UG9pbnQgPSB0aGlzLl9nZXROZXdUb3BMZWZ0UG9pbnQoY2VudGVyKTtcclxuXHJcblx0XHRpZiAoIXByZXNlcnZlTWFwT2Zmc2V0KSB7XHJcblx0XHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9tYXBQYW5lLCBuZXcgTC5Qb2ludCgwLCAwKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9pbml0aWFsVG9wTGVmdFBvaW50Ll9hZGQodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl90aWxlTGF5ZXJzVG9Mb2FkID0gdGhpcy5fdGlsZUxheWVyc051bTtcclxuXHJcblx0XHR2YXIgbG9hZGluZyA9ICF0aGlzLl9sb2FkZWQ7XHJcblx0XHR0aGlzLl9sb2FkZWQgPSB0cnVlO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgndmlld3Jlc2V0Jywge2hhcmQ6ICFwcmVzZXJ2ZU1hcE9mZnNldH0pO1xyXG5cclxuXHRcdGlmIChsb2FkaW5nKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnbG9hZCcpO1xyXG5cdFx0XHR0aGlzLmVhY2hMYXllcih0aGlzLl9sYXllckFkZCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdtb3ZlJyk7XHJcblxyXG5cdFx0aWYgKHpvb21DaGFuZ2VkIHx8IGFmdGVyWm9vbUFuaW0pIHtcclxuXHRcdFx0dGhpcy5maXJlKCd6b29tZW5kJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdtb3ZlZW5kJywge2hhcmQ6ICFwcmVzZXJ2ZU1hcE9mZnNldH0pO1xyXG5cdH0sXHJcblxyXG5cdF9yYXdQYW5CeTogZnVuY3Rpb24gKG9mZnNldCkge1xyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX21hcFBhbmUsIHRoaXMuX2dldE1hcFBhbmVQb3MoKS5zdWJ0cmFjdChvZmZzZXQpKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0Wm9vbVNwYW46IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmdldE1heFpvb20oKSAtIHRoaXMuZ2V0TWluWm9vbSgpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVab29tTGV2ZWxzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaSxcclxuXHRcdFx0bWluWm9vbSA9IEluZmluaXR5LFxyXG5cdFx0XHRtYXhab29tID0gLUluZmluaXR5LFxyXG5cdFx0XHRvbGRab29tU3BhbiA9IHRoaXMuX2dldFpvb21TcGFuKCk7XHJcblxyXG5cdFx0Zm9yIChpIGluIHRoaXMuX3pvb21Cb3VuZExheWVycykge1xyXG5cdFx0XHR2YXIgbGF5ZXIgPSB0aGlzLl96b29tQm91bmRMYXllcnNbaV07XHJcblx0XHRcdGlmICghaXNOYU4obGF5ZXIub3B0aW9ucy5taW5ab29tKSkge1xyXG5cdFx0XHRcdG1pblpvb20gPSBNYXRoLm1pbihtaW5ab29tLCBsYXllci5vcHRpb25zLm1pblpvb20pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghaXNOYU4obGF5ZXIub3B0aW9ucy5tYXhab29tKSkge1xyXG5cdFx0XHRcdG1heFpvb20gPSBNYXRoLm1heChtYXhab29tLCBsYXllci5vcHRpb25zLm1heFpvb20pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGkgPT09IHVuZGVmaW5lZCkgeyAvLyB3ZSBoYXZlIG5vIHRpbGVsYXllcnNcclxuXHRcdFx0dGhpcy5fbGF5ZXJzTWF4Wm9vbSA9IHRoaXMuX2xheWVyc01pblpvb20gPSB1bmRlZmluZWQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9sYXllcnNNYXhab29tID0gbWF4Wm9vbTtcclxuXHRcdFx0dGhpcy5fbGF5ZXJzTWluWm9vbSA9IG1pblpvb207XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9sZFpvb21TcGFuICE9PSB0aGlzLl9nZXRab29tU3BhbigpKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnem9vbWxldmVsc2NoYW5nZScpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9wYW5JbnNpZGVNYXhCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMucGFuSW5zaWRlQm91bmRzKHRoaXMub3B0aW9ucy5tYXhCb3VuZHMpO1xyXG5cdH0sXHJcblxyXG5cdF9jaGVja0lmTG9hZGVkOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1NldCBtYXAgY2VudGVyIGFuZCB6b29tIGZpcnN0LicpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIG1hcCBldmVudHNcclxuXHJcblx0X2luaXRFdmVudHM6IGZ1bmN0aW9uIChvbk9mZikge1xyXG5cdFx0aWYgKCFMLkRvbUV2ZW50KSB7IHJldHVybjsgfVxyXG5cclxuXHRcdG9uT2ZmID0gb25PZmYgfHwgJ29uJztcclxuXHJcblx0XHRMLkRvbUV2ZW50W29uT2ZmXSh0aGlzLl9jb250YWluZXIsICdjbGljaycsIHRoaXMuX29uTW91c2VDbGljaywgdGhpcyk7XHJcblxyXG5cdFx0dmFyIGV2ZW50cyA9IFsnZGJsY2xpY2snLCAnbW91c2Vkb3duJywgJ21vdXNldXAnLCAnbW91c2VlbnRlcicsXHJcblx0XHQgICAgICAgICAgICAgICdtb3VzZWxlYXZlJywgJ21vdXNlbW92ZScsICdjb250ZXh0bWVudSddLFxyXG5cdFx0ICAgIGksIGxlbjtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBldmVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0TC5Eb21FdmVudFtvbk9mZl0odGhpcy5fY29udGFpbmVyLCBldmVudHNbaV0sIHRoaXMuX2ZpcmVNb3VzZUV2ZW50LCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnRyYWNrUmVzaXplKSB7XHJcblx0XHRcdEwuRG9tRXZlbnRbb25PZmZdKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUodGhpcy5fcmVzaXplUmVxdWVzdCk7XHJcblx0XHR0aGlzLl9yZXNpemVSZXF1ZXN0ID0gTC5VdGlsLnJlcXVlc3RBbmltRnJhbWUoXHJcblx0XHQgICAgICAgIGZ1bmN0aW9uICgpIHsgdGhpcy5pbnZhbGlkYXRlU2l6ZSh7ZGVib3VuY2VNb3ZlZW5kOiB0cnVlfSk7IH0sIHRoaXMsIGZhbHNlLCB0aGlzLl9jb250YWluZXIpO1xyXG5cdH0sXHJcblxyXG5cdF9vbk1vdXNlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoIXRoaXMuX2xvYWRlZCB8fCAoIWUuX3NpbXVsYXRlZCAmJlxyXG5cdFx0ICAgICAgICAoKHRoaXMuZHJhZ2dpbmcgJiYgdGhpcy5kcmFnZ2luZy5tb3ZlZCgpKSB8fFxyXG5cdFx0ICAgICAgICAgKHRoaXMuYm94Wm9vbSAgJiYgdGhpcy5ib3hab29tLm1vdmVkKCkpKSkgfHxcclxuXHRcdCAgICAgICAgICAgIEwuRG9tRXZlbnQuX3NraXBwZWQoZSkpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdwcmVjbGljaycpO1xyXG5cdFx0dGhpcy5fZmlyZU1vdXNlRXZlbnQoZSk7XHJcblx0fSxcclxuXHJcblx0X2ZpcmVNb3VzZUV2ZW50OiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQgfHwgTC5Eb21FdmVudC5fc2tpcHBlZChlKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgdHlwZSA9IGUudHlwZTtcclxuXHJcblx0XHR0eXBlID0gKHR5cGUgPT09ICdtb3VzZWVudGVyJyA/ICdtb3VzZW92ZXInIDogKHR5cGUgPT09ICdtb3VzZWxlYXZlJyA/ICdtb3VzZW91dCcgOiB0eXBlKSk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXJzKHR5cGUpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmICh0eXBlID09PSAnY29udGV4dG1lbnUnKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNvbnRhaW5lclBvaW50ID0gdGhpcy5tb3VzZUV2ZW50VG9Db250YWluZXJQb2ludChlKSxcclxuXHRcdCAgICBsYXllclBvaW50ID0gdGhpcy5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChjb250YWluZXJQb2ludCksXHJcblx0XHQgICAgbGF0bG5nID0gdGhpcy5sYXllclBvaW50VG9MYXRMbmcobGF5ZXJQb2ludCk7XHJcblxyXG5cdFx0dGhpcy5maXJlKHR5cGUsIHtcclxuXHRcdFx0bGF0bG5nOiBsYXRsbmcsXHJcblx0XHRcdGxheWVyUG9pbnQ6IGxheWVyUG9pbnQsXHJcblx0XHRcdGNvbnRhaW5lclBvaW50OiBjb250YWluZXJQb2ludCxcclxuXHRcdFx0b3JpZ2luYWxFdmVudDogZVxyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0X29uVGlsZUxheWVyTG9hZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fdGlsZUxheWVyc1RvTG9hZC0tO1xyXG5cdFx0aWYgKHRoaXMuX3RpbGVMYXllcnNOdW0gJiYgIXRoaXMuX3RpbGVMYXllcnNUb0xvYWQpIHtcclxuXHRcdFx0dGhpcy5maXJlKCd0aWxlbGF5ZXJzbG9hZCcpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jbGVhckhhbmRsZXJzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5faGFuZGxlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dGhpcy5faGFuZGxlcnNbaV0uZGlzYWJsZSgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHdoZW5SZWFkeTogZnVuY3Rpb24gKGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcblx0XHRpZiAodGhpcy5fbG9hZGVkKSB7XHJcblx0XHRcdGNhbGxiYWNrLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0aGlzKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMub24oJ2xvYWQnLCBjYWxsYmFjaywgY29udGV4dCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfbGF5ZXJBZGQ6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0bGF5ZXIub25BZGQodGhpcyk7XHJcblx0XHR0aGlzLmZpcmUoJ2xheWVyYWRkJywge2xheWVyOiBsYXllcn0pO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBwcml2YXRlIG1ldGhvZHMgZm9yIGdldHRpbmcgbWFwIHN0YXRlXHJcblxyXG5cdF9nZXRNYXBQYW5lUG9zOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gTC5Eb21VdGlsLmdldFBvc2l0aW9uKHRoaXMuX21hcFBhbmUpO1xyXG5cdH0sXHJcblxyXG5cdF9tb3ZlZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBvcyA9IHRoaXMuX2dldE1hcFBhbmVQb3MoKTtcclxuXHRcdHJldHVybiBwb3MgJiYgIXBvcy5lcXVhbHMoWzAsIDBdKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0VG9wTGVmdFBvaW50OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRQaXhlbE9yaWdpbigpLnN1YnRyYWN0KHRoaXMuX2dldE1hcFBhbmVQb3MoKSk7XHJcblx0fSxcclxuXHJcblx0X2dldE5ld1RvcExlZnRQb2ludDogZnVuY3Rpb24gKGNlbnRlciwgem9vbSkge1xyXG5cdFx0dmFyIHZpZXdIYWxmID0gdGhpcy5nZXRTaXplKCkuX2RpdmlkZUJ5KDIpO1xyXG5cdFx0Ly8gVE9ETyByb3VuZCBvbiBkaXNwbGF5LCBub3QgY2FsY3VsYXRpb24gdG8gaW5jcmVhc2UgcHJlY2lzaW9uP1xyXG5cdFx0cmV0dXJuIHRoaXMucHJvamVjdChjZW50ZXIsIHpvb20pLl9zdWJ0cmFjdCh2aWV3SGFsZikuX3JvdW5kKCk7XHJcblx0fSxcclxuXHJcblx0X2xhdExuZ1RvTmV3TGF5ZXJQb2ludDogZnVuY3Rpb24gKGxhdGxuZywgbmV3Wm9vbSwgbmV3Q2VudGVyKSB7XHJcblx0XHR2YXIgdG9wTGVmdCA9IHRoaXMuX2dldE5ld1RvcExlZnRQb2ludChuZXdDZW50ZXIsIG5ld1pvb20pLmFkZCh0aGlzLl9nZXRNYXBQYW5lUG9zKCkpO1xyXG5cdFx0cmV0dXJuIHRoaXMucHJvamVjdChsYXRsbmcsIG5ld1pvb20pLl9zdWJ0cmFjdCh0b3BMZWZ0KTtcclxuXHR9LFxyXG5cclxuXHQvLyBsYXllciBwb2ludCBvZiB0aGUgY3VycmVudCBjZW50ZXJcclxuXHRfZ2V0Q2VudGVyTGF5ZXJQb2ludDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQodGhpcy5nZXRTaXplKCkuX2RpdmlkZUJ5KDIpKTtcclxuXHR9LFxyXG5cclxuXHQvLyBvZmZzZXQgb2YgdGhlIHNwZWNpZmllZCBwbGFjZSB0byB0aGUgY3VycmVudCBjZW50ZXIgaW4gcGl4ZWxzXHJcblx0X2dldENlbnRlck9mZnNldDogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0cmV0dXJuIHRoaXMubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZykuc3VidHJhY3QodGhpcy5fZ2V0Q2VudGVyTGF5ZXJQb2ludCgpKTtcclxuXHR9LFxyXG5cclxuXHQvLyBhZGp1c3QgY2VudGVyIGZvciB2aWV3IHRvIGdldCBpbnNpZGUgYm91bmRzXHJcblx0X2xpbWl0Q2VudGVyOiBmdW5jdGlvbiAoY2VudGVyLCB6b29tLCBib3VuZHMpIHtcclxuXHJcblx0XHRpZiAoIWJvdW5kcykgeyByZXR1cm4gY2VudGVyOyB9XHJcblxyXG5cdFx0dmFyIGNlbnRlclBvaW50ID0gdGhpcy5wcm9qZWN0KGNlbnRlciwgem9vbSksXHJcblx0XHQgICAgdmlld0hhbGYgPSB0aGlzLmdldFNpemUoKS5kaXZpZGVCeSgyKSxcclxuXHRcdCAgICB2aWV3Qm91bmRzID0gbmV3IEwuQm91bmRzKGNlbnRlclBvaW50LnN1YnRyYWN0KHZpZXdIYWxmKSwgY2VudGVyUG9pbnQuYWRkKHZpZXdIYWxmKSksXHJcblx0XHQgICAgb2Zmc2V0ID0gdGhpcy5fZ2V0Qm91bmRzT2Zmc2V0KHZpZXdCb3VuZHMsIGJvdW5kcywgem9vbSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudW5wcm9qZWN0KGNlbnRlclBvaW50LmFkZChvZmZzZXQpLCB6b29tKTtcclxuXHR9LFxyXG5cclxuXHQvLyBhZGp1c3Qgb2Zmc2V0IGZvciB2aWV3IHRvIGdldCBpbnNpZGUgYm91bmRzXHJcblx0X2xpbWl0T2Zmc2V0OiBmdW5jdGlvbiAob2Zmc2V0LCBib3VuZHMpIHtcclxuXHRcdGlmICghYm91bmRzKSB7IHJldHVybiBvZmZzZXQ7IH1cclxuXHJcblx0XHR2YXIgdmlld0JvdW5kcyA9IHRoaXMuZ2V0UGl4ZWxCb3VuZHMoKSxcclxuXHRcdCAgICBuZXdCb3VuZHMgPSBuZXcgTC5Cb3VuZHModmlld0JvdW5kcy5taW4uYWRkKG9mZnNldCksIHZpZXdCb3VuZHMubWF4LmFkZChvZmZzZXQpKTtcclxuXHJcblx0XHRyZXR1cm4gb2Zmc2V0LmFkZCh0aGlzLl9nZXRCb3VuZHNPZmZzZXQobmV3Qm91bmRzLCBib3VuZHMpKTtcclxuXHR9LFxyXG5cclxuXHQvLyByZXR1cm5zIG9mZnNldCBuZWVkZWQgZm9yIHB4Qm91bmRzIHRvIGdldCBpbnNpZGUgbWF4Qm91bmRzIGF0IGEgc3BlY2lmaWVkIHpvb21cclxuXHRfZ2V0Qm91bmRzT2Zmc2V0OiBmdW5jdGlvbiAocHhCb3VuZHMsIG1heEJvdW5kcywgem9vbSkge1xyXG5cdFx0dmFyIG53T2Zmc2V0ID0gdGhpcy5wcm9qZWN0KG1heEJvdW5kcy5nZXROb3J0aFdlc3QoKSwgem9vbSkuc3VidHJhY3QocHhCb3VuZHMubWluKSxcclxuXHRcdCAgICBzZU9mZnNldCA9IHRoaXMucHJvamVjdChtYXhCb3VuZHMuZ2V0U291dGhFYXN0KCksIHpvb20pLnN1YnRyYWN0KHB4Qm91bmRzLm1heCksXHJcblxyXG5cdFx0ICAgIGR4ID0gdGhpcy5fcmVib3VuZChud09mZnNldC54LCAtc2VPZmZzZXQueCksXHJcblx0XHQgICAgZHkgPSB0aGlzLl9yZWJvdW5kKG53T2Zmc2V0LnksIC1zZU9mZnNldC55KTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoZHgsIGR5KTtcclxuXHR9LFxyXG5cclxuXHRfcmVib3VuZDogZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7XHJcblx0XHRyZXR1cm4gbGVmdCArIHJpZ2h0ID4gMCA/XHJcblx0XHRcdE1hdGgucm91bmQobGVmdCAtIHJpZ2h0KSAvIDIgOlxyXG5cdFx0XHRNYXRoLm1heCgwLCBNYXRoLmNlaWwobGVmdCkpIC0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihyaWdodCkpO1xyXG5cdH0sXHJcblxyXG5cdF9saW1pdFpvb206IGZ1bmN0aW9uICh6b29tKSB7XHJcblx0XHR2YXIgbWluID0gdGhpcy5nZXRNaW5ab29tKCksXHJcblx0XHQgICAgbWF4ID0gdGhpcy5nZXRNYXhab29tKCk7XHJcblxyXG5cdFx0cmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB6b29tKSk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwubWFwID0gZnVuY3Rpb24gKGlkLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLk1hcChpZCwgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBNZXJjYXRvciBwcm9qZWN0aW9uIHRoYXQgdGFrZXMgaW50byBhY2NvdW50IHRoYXQgdGhlIEVhcnRoIGlzIG5vdCBhIHBlcmZlY3Qgc3BoZXJlLlxyXG4gKiBMZXNzIHBvcHVsYXIgdGhhbiBzcGhlcmljYWwgbWVyY2F0b3I7IHVzZWQgYnkgcHJvamVjdGlvbnMgbGlrZSBFUFNHOjMzOTUuXHJcbiAqL1xyXG5cclxuTC5Qcm9qZWN0aW9uLk1lcmNhdG9yID0ge1xyXG5cdE1BWF9MQVRJVFVERTogODUuMDg0MDU5MTU1NixcclxuXHJcblx0Ul9NSU5PUjogNjM1Njc1Mi4zMTQyNDUxNzksXHJcblx0Ul9NQUpPUjogNjM3ODEzNyxcclxuXHJcblx0cHJvamVjdDogZnVuY3Rpb24gKGxhdGxuZykgeyAvLyAoTGF0TG5nKSAtPiBQb2ludFxyXG5cdFx0dmFyIGQgPSBMLkxhdExuZy5ERUdfVE9fUkFELFxyXG5cdFx0ICAgIG1heCA9IHRoaXMuTUFYX0xBVElUVURFLFxyXG5cdFx0ICAgIGxhdCA9IE1hdGgubWF4KE1hdGgubWluKG1heCwgbGF0bG5nLmxhdCksIC1tYXgpLFxyXG5cdFx0ICAgIHIgPSB0aGlzLlJfTUFKT1IsXHJcblx0XHQgICAgcjIgPSB0aGlzLlJfTUlOT1IsXHJcblx0XHQgICAgeCA9IGxhdGxuZy5sbmcgKiBkICogcixcclxuXHRcdCAgICB5ID0gbGF0ICogZCxcclxuXHRcdCAgICB0bXAgPSByMiAvIHIsXHJcblx0XHQgICAgZWNjZW50ID0gTWF0aC5zcXJ0KDEuMCAtIHRtcCAqIHRtcCksXHJcblx0XHQgICAgY29uID0gZWNjZW50ICogTWF0aC5zaW4oeSk7XHJcblxyXG5cdFx0Y29uID0gTWF0aC5wb3coKDEgLSBjb24pIC8gKDEgKyBjb24pLCBlY2NlbnQgKiAwLjUpO1xyXG5cclxuXHRcdHZhciB0cyA9IE1hdGgudGFuKDAuNSAqICgoTWF0aC5QSSAqIDAuNSkgLSB5KSkgLyBjb247XHJcblx0XHR5ID0gLXIgKiBNYXRoLmxvZyh0cyk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KHgsIHkpO1xyXG5cdH0sXHJcblxyXG5cdHVucHJvamVjdDogZnVuY3Rpb24gKHBvaW50KSB7IC8vIChQb2ludCwgQm9vbGVhbikgLT4gTGF0TG5nXHJcblx0XHR2YXIgZCA9IEwuTGF0TG5nLlJBRF9UT19ERUcsXHJcblx0XHQgICAgciA9IHRoaXMuUl9NQUpPUixcclxuXHRcdCAgICByMiA9IHRoaXMuUl9NSU5PUixcclxuXHRcdCAgICBsbmcgPSBwb2ludC54ICogZCAvIHIsXHJcblx0XHQgICAgdG1wID0gcjIgLyByLFxyXG5cdFx0ICAgIGVjY2VudCA9IE1hdGguc3FydCgxIC0gKHRtcCAqIHRtcCkpLFxyXG5cdFx0ICAgIHRzID0gTWF0aC5leHAoLSBwb2ludC55IC8gciksXHJcblx0XHQgICAgcGhpID0gKE1hdGguUEkgLyAyKSAtIDIgKiBNYXRoLmF0YW4odHMpLFxyXG5cdFx0ICAgIG51bUl0ZXIgPSAxNSxcclxuXHRcdCAgICB0b2wgPSAxZS03LFxyXG5cdFx0ICAgIGkgPSBudW1JdGVyLFxyXG5cdFx0ICAgIGRwaGkgPSAwLjEsXHJcblx0XHQgICAgY29uO1xyXG5cclxuXHRcdHdoaWxlICgoTWF0aC5hYnMoZHBoaSkgPiB0b2wpICYmICgtLWkgPiAwKSkge1xyXG5cdFx0XHRjb24gPSBlY2NlbnQgKiBNYXRoLnNpbihwaGkpO1xyXG5cdFx0XHRkcGhpID0gKE1hdGguUEkgLyAyKSAtIDIgKiBNYXRoLmF0YW4odHMgKlxyXG5cdFx0XHQgICAgICAgICAgICBNYXRoLnBvdygoMS4wIC0gY29uKSAvICgxLjAgKyBjb24pLCAwLjUgKiBlY2NlbnQpKSAtIHBoaTtcclxuXHRcdFx0cGhpICs9IGRwaGk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhwaGkgKiBkLCBsbmcpO1xyXG5cdH1cclxufTtcclxuXG5cblxyXG5MLkNSUy5FUFNHMzM5NSA9IEwuZXh0ZW5kKHt9LCBMLkNSUywge1xyXG5cdGNvZGU6ICdFUFNHOjMzOTUnLFxyXG5cclxuXHRwcm9qZWN0aW9uOiBMLlByb2plY3Rpb24uTWVyY2F0b3IsXHJcblxyXG5cdHRyYW5zZm9ybWF0aW9uOiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIG0gPSBMLlByb2plY3Rpb24uTWVyY2F0b3IsXHJcblx0XHQgICAgciA9IG0uUl9NQUpPUixcclxuXHRcdCAgICBzY2FsZSA9IDAuNSAvIChNYXRoLlBJICogcik7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLlRyYW5zZm9ybWF0aW9uKHNjYWxlLCAwLjUsIC1zY2FsZSwgMC41KTtcclxuXHR9KCkpXHJcbn0pO1xyXG5cblxuLypcclxuICogTC5UaWxlTGF5ZXIgaXMgdXNlZCBmb3Igc3RhbmRhcmQgeHl6LW51bWJlcmVkIHRpbGUgbGF5ZXJzLlxyXG4gKi9cclxuXHJcbkwuVGlsZUxheWVyID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0bWluWm9vbTogMCxcclxuXHRcdG1heFpvb206IDE4LFxyXG5cdFx0dGlsZVNpemU6IDI1NixcclxuXHRcdHN1YmRvbWFpbnM6ICdhYmMnLFxyXG5cdFx0ZXJyb3JUaWxlVXJsOiAnJyxcclxuXHRcdGF0dHJpYnV0aW9uOiAnJyxcclxuXHRcdHpvb21PZmZzZXQ6IDAsXHJcblx0XHRvcGFjaXR5OiAxLFxyXG5cdFx0LypcclxuXHRcdG1heE5hdGl2ZVpvb206IG51bGwsXHJcblx0XHR6SW5kZXg6IG51bGwsXHJcblx0XHR0bXM6IGZhbHNlLFxyXG5cdFx0Y29udGludW91c1dvcmxkOiBmYWxzZSxcclxuXHRcdG5vV3JhcDogZmFsc2UsXHJcblx0XHR6b29tUmV2ZXJzZTogZmFsc2UsXHJcblx0XHRkZXRlY3RSZXRpbmE6IGZhbHNlLFxyXG5cdFx0cmV1c2VUaWxlczogZmFsc2UsXHJcblx0XHRib3VuZHM6IGZhbHNlLFxyXG5cdFx0Ki9cclxuXHRcdHVubG9hZEludmlzaWJsZVRpbGVzOiBMLkJyb3dzZXIubW9iaWxlLFxyXG5cdFx0dXBkYXRlV2hlbklkbGU6IEwuQnJvd3Nlci5tb2JpbGVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcblx0XHRvcHRpb25zID0gTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdC8vIGRldGVjdGluZyByZXRpbmEgZGlzcGxheXMsIGFkanVzdGluZyB0aWxlU2l6ZSBhbmQgem9vbSBsZXZlbHNcclxuXHRcdGlmIChvcHRpb25zLmRldGVjdFJldGluYSAmJiBMLkJyb3dzZXIucmV0aW5hICYmIG9wdGlvbnMubWF4Wm9vbSA+IDApIHtcclxuXHJcblx0XHRcdG9wdGlvbnMudGlsZVNpemUgPSBNYXRoLmZsb29yKG9wdGlvbnMudGlsZVNpemUgLyAyKTtcclxuXHRcdFx0b3B0aW9ucy56b29tT2Zmc2V0Kys7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5taW5ab29tID4gMCkge1xyXG5cdFx0XHRcdG9wdGlvbnMubWluWm9vbS0tO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMub3B0aW9ucy5tYXhab29tLS07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuYm91bmRzKSB7XHJcblx0XHRcdG9wdGlvbnMuYm91bmRzID0gTC5sYXRMbmdCb3VuZHMob3B0aW9ucy5ib3VuZHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3VybCA9IHVybDtcclxuXHJcblx0XHR2YXIgc3ViZG9tYWlucyA9IHRoaXMub3B0aW9ucy5zdWJkb21haW5zO1xyXG5cclxuXHRcdGlmICh0eXBlb2Ygc3ViZG9tYWlucyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0dGhpcy5vcHRpb25zLnN1YmRvbWFpbnMgPSBzdWJkb21haW5zLnNwbGl0KCcnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cdFx0dGhpcy5fYW5pbWF0ZWQgPSBtYXAuX3pvb21BbmltYXRlZDtcclxuXHJcblx0XHQvLyBjcmVhdGUgYSBjb250YWluZXIgZGl2IGZvciB0aWxlc1xyXG5cdFx0dGhpcy5faW5pdENvbnRhaW5lcigpO1xyXG5cclxuXHRcdC8vIHNldCB1cCBldmVudHNcclxuXHRcdG1hcC5vbih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLl9yZXNldCxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVcclxuXHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9hbmltYXRlZCkge1xyXG5cdFx0XHRtYXAub24oe1xyXG5cdFx0XHRcdCd6b29tYW5pbSc6IHRoaXMuX2FuaW1hdGVab29tLFxyXG5cdFx0XHRcdCd6b29tZW5kJzogdGhpcy5fZW5kWm9vbUFuaW1cclxuXHRcdFx0fSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMudXBkYXRlV2hlbklkbGUpIHtcclxuXHRcdFx0dGhpcy5fbGltaXRlZFVwZGF0ZSA9IEwuVXRpbC5saW1pdEV4ZWNCeUludGVydmFsKHRoaXMuX3VwZGF0ZSwgMTUwLCB0aGlzKTtcclxuXHRcdFx0bWFwLm9uKCdtb3ZlJywgdGhpcy5fbGltaXRlZFVwZGF0ZSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmVzZXQoKTtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdH0sXHJcblxyXG5cdGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAuYWRkTGF5ZXIodGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRtYXAub2ZmKHtcclxuXHRcdFx0J3ZpZXdyZXNldCc6IHRoaXMuX3Jlc2V0LFxyXG5cdFx0XHQnbW92ZWVuZCc6IHRoaXMuX3VwZGF0ZVxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2FuaW1hdGVkKSB7XHJcblx0XHRcdG1hcC5vZmYoe1xyXG5cdFx0XHRcdCd6b29tYW5pbSc6IHRoaXMuX2FuaW1hdGVab29tLFxyXG5cdFx0XHRcdCd6b29tZW5kJzogdGhpcy5fZW5kWm9vbUFuaW1cclxuXHRcdFx0fSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMudXBkYXRlV2hlbklkbGUpIHtcclxuXHRcdFx0bWFwLm9mZignbW92ZScsIHRoaXMuX2xpbWl0ZWRVcGRhdGUsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9Gcm9udDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBhbmUgPSB0aGlzLl9tYXAuX3BhbmVzLnRpbGVQYW5lO1xyXG5cclxuXHRcdGlmICh0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0cGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9jb250YWluZXIpO1xyXG5cdFx0XHR0aGlzLl9zZXRBdXRvWkluZGV4KHBhbmUsIE1hdGgubWF4KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvQmFjazogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBhbmUgPSB0aGlzLl9tYXAuX3BhbmVzLnRpbGVQYW5lO1xyXG5cclxuXHRcdGlmICh0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0cGFuZS5pbnNlcnRCZWZvcmUodGhpcy5fY29udGFpbmVyLCBwYW5lLmZpcnN0Q2hpbGQpO1xyXG5cdFx0XHR0aGlzLl9zZXRBdXRvWkluZGV4KHBhbmUsIE1hdGgubWluKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRnZXRBdHRyaWJ1dGlvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5hdHRyaWJ1dGlvbjtcclxuXHR9LFxyXG5cclxuXHRnZXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XHJcblx0fSxcclxuXHJcblx0c2V0T3BhY2l0eTogZnVuY3Rpb24gKG9wYWNpdHkpIHtcclxuXHRcdHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuXHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZU9wYWNpdHkoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRaSW5kZXg6IGZ1bmN0aW9uICh6SW5kZXgpIHtcclxuXHRcdHRoaXMub3B0aW9ucy56SW5kZXggPSB6SW5kZXg7XHJcblx0XHR0aGlzLl91cGRhdGVaSW5kZXgoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRVcmw6IGZ1bmN0aW9uICh1cmwsIG5vUmVkcmF3KSB7XHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblxyXG5cdFx0aWYgKCFub1JlZHJhdykge1xyXG5cdFx0XHR0aGlzLnJlZHJhdygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlZHJhdzogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9yZXNldCh7aGFyZDogdHJ1ZX0pO1xyXG5cdFx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVaSW5kZXg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9jb250YWluZXIgJiYgdGhpcy5vcHRpb25zLnpJbmRleCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS56SW5kZXggPSB0aGlzLm9wdGlvbnMuekluZGV4O1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9zZXRBdXRvWkluZGV4OiBmdW5jdGlvbiAocGFuZSwgY29tcGFyZSkge1xyXG5cclxuXHRcdHZhciBsYXllcnMgPSBwYW5lLmNoaWxkcmVuLFxyXG5cdFx0ICAgIGVkZ2VaSW5kZXggPSAtY29tcGFyZShJbmZpbml0eSwgLUluZmluaXR5KSwgLy8gLUluZmluaXR5IGZvciBtYXgsIEluZmluaXR5IGZvciBtaW5cclxuXHRcdCAgICB6SW5kZXgsIGksIGxlbjtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHJcblx0XHRcdGlmIChsYXllcnNbaV0gIT09IHRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHRcdHpJbmRleCA9IHBhcnNlSW50KGxheWVyc1tpXS5zdHlsZS56SW5kZXgsIDEwKTtcclxuXHJcblx0XHRcdFx0aWYgKCFpc05hTih6SW5kZXgpKSB7XHJcblx0XHRcdFx0XHRlZGdlWkluZGV4ID0gY29tcGFyZShlZGdlWkluZGV4LCB6SW5kZXgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMub3B0aW9ucy56SW5kZXggPSB0aGlzLl9jb250YWluZXIuc3R5bGUuekluZGV4ID1cclxuXHRcdCAgICAgICAgKGlzRmluaXRlKGVkZ2VaSW5kZXgpID8gZWRnZVpJbmRleCA6IDApICsgY29tcGFyZSgxLCAtMSk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZU9wYWNpdHk6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBpLFxyXG5cdFx0ICAgIHRpbGVzID0gdGhpcy5fdGlsZXM7XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5pZWx0OSkge1xyXG5cdFx0XHRmb3IgKGkgaW4gdGlsZXMpIHtcclxuXHRcdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aWxlc1tpXSwgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9jb250YWluZXIsIHRoaXMub3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfaW5pdENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1sYXllcicpO1xyXG5cclxuXHRcdFx0dGhpcy5fdXBkYXRlWkluZGV4KCk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0XHR2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXInO1xyXG5cclxuXHRcdFx0XHR0aGlzLl9iZ0J1ZmZlciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHRcdFx0XHR0aGlzLl90aWxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lLCB0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl90aWxlQ29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aWxlUGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5vcGFjaXR5IDwgMSkge1xyXG5cdFx0XHRcdHRoaXMuX3VwZGF0ZU9wYWNpdHkoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9yZXNldDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl90aWxlcykge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ3RpbGV1bmxvYWQnLCB7dGlsZTogdGhpcy5fdGlsZXNba2V5XX0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3RpbGVzID0ge307XHJcblx0XHR0aGlzLl90aWxlc1RvTG9hZCA9IDA7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXVzZVRpbGVzKSB7XHJcblx0XHRcdHRoaXMuX3VudXNlZFRpbGVzID0gW107XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdGlsZUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQgJiYgZSAmJiBlLmhhcmQpIHtcclxuXHRcdFx0dGhpcy5fY2xlYXJCZ0J1ZmZlcigpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2luaXRDb250YWluZXIoKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0VGlsZVNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgem9vbSA9IG1hcC5nZXRab29tKCkgKyB0aGlzLm9wdGlvbnMuem9vbU9mZnNldCxcclxuXHRcdCAgICB6b29tTiA9IHRoaXMub3B0aW9ucy5tYXhOYXRpdmVab29tLFxyXG5cdFx0ICAgIHRpbGVTaXplID0gdGhpcy5vcHRpb25zLnRpbGVTaXplO1xyXG5cclxuXHRcdGlmICh6b29tTiAmJiB6b29tID4gem9vbU4pIHtcclxuXHRcdFx0dGlsZVNpemUgPSBNYXRoLnJvdW5kKG1hcC5nZXRab29tU2NhbGUoem9vbSkgLyBtYXAuZ2V0Wm9vbVNjYWxlKHpvb21OKSAqIHRpbGVTaXplKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGlsZVNpemU7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgYm91bmRzID0gbWFwLmdldFBpeGVsQm91bmRzKCksXHJcblx0XHQgICAgem9vbSA9IG1hcC5nZXRab29tKCksXHJcblx0XHQgICAgdGlsZVNpemUgPSB0aGlzLl9nZXRUaWxlU2l6ZSgpO1xyXG5cclxuXHRcdGlmICh6b29tID4gdGhpcy5vcHRpb25zLm1heFpvb20gfHwgem9vbSA8IHRoaXMub3B0aW9ucy5taW5ab29tKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgdGlsZUJvdW5kcyA9IEwuYm91bmRzKFxyXG5cdFx0ICAgICAgICBib3VuZHMubWluLmRpdmlkZUJ5KHRpbGVTaXplKS5fZmxvb3IoKSxcclxuXHRcdCAgICAgICAgYm91bmRzLm1heC5kaXZpZGVCeSh0aWxlU2l6ZSkuX2Zsb29yKCkpO1xyXG5cclxuXHRcdHRoaXMuX2FkZFRpbGVzRnJvbUNlbnRlck91dCh0aWxlQm91bmRzKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnVubG9hZEludmlzaWJsZVRpbGVzIHx8IHRoaXMub3B0aW9ucy5yZXVzZVRpbGVzKSB7XHJcblx0XHRcdHRoaXMuX3JlbW92ZU90aGVyVGlsZXModGlsZUJvdW5kcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2FkZFRpbGVzRnJvbUNlbnRlck91dDogZnVuY3Rpb24gKGJvdW5kcykge1xyXG5cdFx0dmFyIHF1ZXVlID0gW10sXHJcblx0XHQgICAgY2VudGVyID0gYm91bmRzLmdldENlbnRlcigpO1xyXG5cclxuXHRcdHZhciBqLCBpLCBwb2ludDtcclxuXHJcblx0XHRmb3IgKGogPSBib3VuZHMubWluLnk7IGogPD0gYm91bmRzLm1heC55OyBqKyspIHtcclxuXHRcdFx0Zm9yIChpID0gYm91bmRzLm1pbi54OyBpIDw9IGJvdW5kcy5tYXgueDsgaSsrKSB7XHJcblx0XHRcdFx0cG9pbnQgPSBuZXcgTC5Qb2ludChpLCBqKTtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMuX3RpbGVTaG91bGRCZUxvYWRlZChwb2ludCkpIHtcclxuXHRcdFx0XHRcdHF1ZXVlLnB1c2gocG9pbnQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciB0aWxlc1RvTG9hZCA9IHF1ZXVlLmxlbmd0aDtcclxuXHJcblx0XHRpZiAodGlsZXNUb0xvYWQgPT09IDApIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Ly8gbG9hZCB0aWxlcyBpbiBvcmRlciBvZiB0aGVpciBkaXN0YW5jZSB0byBjZW50ZXJcclxuXHRcdHF1ZXVlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuXHRcdFx0cmV0dXJuIGEuZGlzdGFuY2VUbyhjZW50ZXIpIC0gYi5kaXN0YW5jZVRvKGNlbnRlcik7XHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcblxyXG5cdFx0Ly8gaWYgaXRzIHRoZSBmaXJzdCBiYXRjaCBvZiB0aWxlcyB0byBsb2FkXHJcblx0XHRpZiAoIXRoaXMuX3RpbGVzVG9Mb2FkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnbG9hZGluZycpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3RpbGVzVG9Mb2FkICs9IHRpbGVzVG9Mb2FkO1xyXG5cclxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aWxlc1RvTG9hZDsgaSsrKSB7XHJcblx0XHRcdHRoaXMuX2FkZFRpbGUocXVldWVbaV0sIGZyYWdtZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl90aWxlQ29udGFpbmVyLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcclxuXHR9LFxyXG5cclxuXHRfdGlsZVNob3VsZEJlTG9hZGVkOiBmdW5jdGlvbiAodGlsZVBvaW50KSB7XHJcblx0XHRpZiAoKHRpbGVQb2ludC54ICsgJzonICsgdGlsZVBvaW50LnkpIGluIHRoaXMuX3RpbGVzKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTsgLy8gYWxyZWFkeSBsb2FkZWRcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcblx0XHRpZiAoIW9wdGlvbnMuY29udGludW91c1dvcmxkKSB7XHJcblx0XHRcdHZhciBsaW1pdCA9IHRoaXMuX2dldFdyYXBUaWxlTnVtKCk7XHJcblxyXG5cdFx0XHQvLyBkb24ndCBsb2FkIGlmIGV4Y2VlZHMgd29ybGQgYm91bmRzXHJcblx0XHRcdGlmICgob3B0aW9ucy5ub1dyYXAgJiYgKHRpbGVQb2ludC54IDwgMCB8fCB0aWxlUG9pbnQueCA+PSBsaW1pdC54KSkgfHxcclxuXHRcdFx0XHR0aWxlUG9pbnQueSA8IDAgfHwgdGlsZVBvaW50LnkgPj0gbGltaXQueSkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5ib3VuZHMpIHtcclxuXHRcdFx0dmFyIHRpbGVTaXplID0gb3B0aW9ucy50aWxlU2l6ZSxcclxuXHRcdFx0ICAgIG53UG9pbnQgPSB0aWxlUG9pbnQubXVsdGlwbHlCeSh0aWxlU2l6ZSksXHJcblx0XHRcdCAgICBzZVBvaW50ID0gbndQb2ludC5hZGQoW3RpbGVTaXplLCB0aWxlU2l6ZV0pLFxyXG5cdFx0XHQgICAgbncgPSB0aGlzLl9tYXAudW5wcm9qZWN0KG53UG9pbnQpLFxyXG5cdFx0XHQgICAgc2UgPSB0aGlzLl9tYXAudW5wcm9qZWN0KHNlUG9pbnQpO1xyXG5cclxuXHRcdFx0Ly8gVE9ETyB0ZW1wb3JhcnkgaGFjaywgd2lsbCBiZSByZW1vdmVkIGFmdGVyIHJlZmFjdG9yaW5nIHByb2plY3Rpb25zXHJcblx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvaXNzdWVzLzE2MThcclxuXHRcdFx0aWYgKCFvcHRpb25zLmNvbnRpbnVvdXNXb3JsZCAmJiAhb3B0aW9ucy5ub1dyYXApIHtcclxuXHRcdFx0XHRudyA9IG53LndyYXAoKTtcclxuXHRcdFx0XHRzZSA9IHNlLndyYXAoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCFvcHRpb25zLmJvdW5kcy5pbnRlcnNlY3RzKFtudywgc2VdKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHRfcmVtb3ZlT3RoZXJUaWxlczogZnVuY3Rpb24gKGJvdW5kcykge1xyXG5cdFx0dmFyIGtBcnIsIHgsIHksIGtleTtcclxuXHJcblx0XHRmb3IgKGtleSBpbiB0aGlzLl90aWxlcykge1xyXG5cdFx0XHRrQXJyID0ga2V5LnNwbGl0KCc6Jyk7XHJcblx0XHRcdHggPSBwYXJzZUludChrQXJyWzBdLCAxMCk7XHJcblx0XHRcdHkgPSBwYXJzZUludChrQXJyWzFdLCAxMCk7XHJcblxyXG5cdFx0XHQvLyByZW1vdmUgdGlsZSBpZiBpdCdzIG91dCBvZiBib3VuZHNcclxuXHRcdFx0aWYgKHggPCBib3VuZHMubWluLnggfHwgeCA+IGJvdW5kcy5tYXgueCB8fCB5IDwgYm91bmRzLm1pbi55IHx8IHkgPiBib3VuZHMubWF4LnkpIHtcclxuXHRcdFx0XHR0aGlzLl9yZW1vdmVUaWxlKGtleSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcmVtb3ZlVGlsZTogZnVuY3Rpb24gKGtleSkge1xyXG5cdFx0dmFyIHRpbGUgPSB0aGlzLl90aWxlc1trZXldO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgndGlsZXVubG9hZCcsIHt0aWxlOiB0aWxlLCB1cmw6IHRpbGUuc3JjfSk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXVzZVRpbGVzKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aWxlLCAnbGVhZmxldC10aWxlLWxvYWRlZCcpO1xyXG5cdFx0XHR0aGlzLl91bnVzZWRUaWxlcy5wdXNoKHRpbGUpO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAodGlsZS5wYXJlbnROb2RlID09PSB0aGlzLl90aWxlQ29udGFpbmVyKSB7XHJcblx0XHRcdHRoaXMuX3RpbGVDb250YWluZXIucmVtb3ZlQ2hpbGQodGlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9DbG91ZE1hZGUvTGVhZmxldC9pc3N1ZXMvMTM3XHJcblx0XHRpZiAoIUwuQnJvd3Nlci5hbmRyb2lkKSB7XHJcblx0XHRcdHRpbGUub25sb2FkID0gbnVsbDtcclxuXHRcdFx0dGlsZS5zcmMgPSBMLlV0aWwuZW1wdHlJbWFnZVVybDtcclxuXHRcdH1cclxuXHJcblx0XHRkZWxldGUgdGhpcy5fdGlsZXNba2V5XTtcclxuXHR9LFxyXG5cclxuXHRfYWRkVGlsZTogZnVuY3Rpb24gKHRpbGVQb2ludCwgY29udGFpbmVyKSB7XHJcblx0XHR2YXIgdGlsZVBvcyA9IHRoaXMuX2dldFRpbGVQb3ModGlsZVBvaW50KTtcclxuXHJcblx0XHQvLyBnZXQgdW51c2VkIHRpbGUgLSBvciBjcmVhdGUgYSBuZXcgdGlsZVxyXG5cdFx0dmFyIHRpbGUgPSB0aGlzLl9nZXRUaWxlKCk7XHJcblxyXG5cdFx0LypcclxuXHRcdENocm9tZSAyMCBsYXlvdXRzIG11Y2ggZmFzdGVyIHdpdGggdG9wL2xlZnQgKHZlcmlmeSB3aXRoIHRpbWVsaW5lLCBmcmFtZXMpXHJcblx0XHRBbmRyb2lkIDQgYnJvd3NlciBoYXMgZGlzcGxheSBpc3N1ZXMgd2l0aCB0b3AvbGVmdCBhbmQgcmVxdWlyZXMgdHJhbnNmb3JtIGluc3RlYWRcclxuXHRcdChvdGhlciBicm93c2VycyBkb24ndCBjdXJyZW50bHkgY2FyZSkgLSBzZWUgZGVidWcvaGFja3Mvaml0dGVyLmh0bWwgZm9yIGFuIGV4YW1wbGVcclxuXHRcdCovXHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGlsZSwgdGlsZVBvcywgTC5Ccm93c2VyLmNocm9tZSk7XHJcblxyXG5cdFx0dGhpcy5fdGlsZXNbdGlsZVBvaW50LnggKyAnOicgKyB0aWxlUG9pbnQueV0gPSB0aWxlO1xyXG5cclxuXHRcdHRoaXMuX2xvYWRUaWxlKHRpbGUsIHRpbGVQb2ludCk7XHJcblxyXG5cdFx0aWYgKHRpbGUucGFyZW50Tm9kZSAhPT0gdGhpcy5fdGlsZUNvbnRhaW5lcikge1xyXG5cdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGlsZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2dldFpvb21Gb3JVcmw6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuXHRcdCAgICB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy56b29tUmV2ZXJzZSkge1xyXG5cdFx0XHR6b29tID0gb3B0aW9ucy5tYXhab29tIC0gem9vbTtcclxuXHRcdH1cclxuXHJcblx0XHR6b29tICs9IG9wdGlvbnMuem9vbU9mZnNldDtcclxuXHJcblx0XHRyZXR1cm4gb3B0aW9ucy5tYXhOYXRpdmVab29tID8gTWF0aC5taW4oem9vbSwgb3B0aW9ucy5tYXhOYXRpdmVab29tKSA6IHpvb207XHJcblx0fSxcclxuXHJcblx0X2dldFRpbGVQb3M6IGZ1bmN0aW9uICh0aWxlUG9pbnQpIHtcclxuXHRcdHZhciBvcmlnaW4gPSB0aGlzLl9tYXAuZ2V0UGl4ZWxPcmlnaW4oKSxcclxuXHRcdCAgICB0aWxlU2l6ZSA9IHRoaXMuX2dldFRpbGVTaXplKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRpbGVQb2ludC5tdWx0aXBseUJ5KHRpbGVTaXplKS5zdWJ0cmFjdChvcmlnaW4pO1xyXG5cdH0sXHJcblxyXG5cdC8vIGltYWdlLXNwZWNpZmljIGNvZGUgKG92ZXJyaWRlIHRvIGltcGxlbWVudCBlLmcuIENhbnZhcyBvciBTVkcgdGlsZSBsYXllcilcclxuXHJcblx0Z2V0VGlsZVVybDogZnVuY3Rpb24gKHRpbGVQb2ludCkge1xyXG5cdFx0cmV0dXJuIEwuVXRpbC50ZW1wbGF0ZSh0aGlzLl91cmwsIEwuZXh0ZW5kKHtcclxuXHRcdFx0czogdGhpcy5fZ2V0U3ViZG9tYWluKHRpbGVQb2ludCksXHJcblx0XHRcdHo6IHRpbGVQb2ludC56LFxyXG5cdFx0XHR4OiB0aWxlUG9pbnQueCxcclxuXHRcdFx0eTogdGlsZVBvaW50LnlcclxuXHRcdH0sIHRoaXMub3B0aW9ucykpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRXcmFwVGlsZU51bTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGNycyA9IHRoaXMuX21hcC5vcHRpb25zLmNycyxcclxuXHRcdCAgICBzaXplID0gY3JzLmdldFNpemUodGhpcy5fbWFwLmdldFpvb20oKSk7XHJcblx0XHRyZXR1cm4gc2l6ZS5kaXZpZGVCeSh0aGlzLl9nZXRUaWxlU2l6ZSgpKS5fZmxvb3IoKTtcclxuXHR9LFxyXG5cclxuXHRfYWRqdXN0VGlsZVBvaW50OiBmdW5jdGlvbiAodGlsZVBvaW50KSB7XHJcblxyXG5cdFx0dmFyIGxpbWl0ID0gdGhpcy5fZ2V0V3JhcFRpbGVOdW0oKTtcclxuXHJcblx0XHQvLyB3cmFwIHRpbGUgY29vcmRpbmF0ZXNcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmNvbnRpbnVvdXNXb3JsZCAmJiAhdGhpcy5vcHRpb25zLm5vV3JhcCkge1xyXG5cdFx0XHR0aWxlUG9pbnQueCA9ICgodGlsZVBvaW50LnggJSBsaW1pdC54KSArIGxpbWl0LngpICUgbGltaXQueDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnRtcykge1xyXG5cdFx0XHR0aWxlUG9pbnQueSA9IGxpbWl0LnkgLSB0aWxlUG9pbnQueSAtIDE7XHJcblx0XHR9XHJcblxyXG5cdFx0dGlsZVBvaW50LnogPSB0aGlzLl9nZXRab29tRm9yVXJsKCk7XHJcblx0fSxcclxuXHJcblx0X2dldFN1YmRvbWFpbjogZnVuY3Rpb24gKHRpbGVQb2ludCkge1xyXG5cdFx0dmFyIGluZGV4ID0gTWF0aC5hYnModGlsZVBvaW50LnggKyB0aWxlUG9pbnQueSkgJSB0aGlzLm9wdGlvbnMuc3ViZG9tYWlucy5sZW5ndGg7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLnN1YmRvbWFpbnNbaW5kZXhdO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRUaWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnJldXNlVGlsZXMgJiYgdGhpcy5fdW51c2VkVGlsZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHR2YXIgdGlsZSA9IHRoaXMuX3VudXNlZFRpbGVzLnBvcCgpO1xyXG5cdFx0XHR0aGlzLl9yZXNldFRpbGUodGlsZSk7XHJcblx0XHRcdHJldHVybiB0aWxlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZVRpbGUoKTtcclxuXHR9LFxyXG5cclxuXHQvLyBPdmVycmlkZSBpZiBkYXRhIHN0b3JlZCBvbiBhIHRpbGUgbmVlZHMgdG8gYmUgY2xlYW5lZCB1cCBiZWZvcmUgcmV1c2VcclxuXHRfcmVzZXRUaWxlOiBmdW5jdGlvbiAoLyp0aWxlKi8pIHt9LFxyXG5cclxuXHRfY3JlYXRlVGlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHRpbGUgPSBMLkRvbVV0aWwuY3JlYXRlKCdpbWcnLCAnbGVhZmxldC10aWxlJyk7XHJcblx0XHR0aWxlLnN0eWxlLndpZHRoID0gdGlsZS5zdHlsZS5oZWlnaHQgPSB0aGlzLl9nZXRUaWxlU2l6ZSgpICsgJ3B4JztcclxuXHRcdHRpbGUuZ2FsbGVyeWltZyA9ICdubyc7XHJcblxyXG5cdFx0dGlsZS5vbnNlbGVjdHN0YXJ0ID0gdGlsZS5vbm1vdXNlbW92ZSA9IEwuVXRpbC5mYWxzZUZuO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIuaWVsdDkgJiYgdGhpcy5vcHRpb25zLm9wYWNpdHkgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aWxlLCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHR9XHJcblx0XHQvLyB3aXRob3V0IHRoaXMgaGFjaywgdGlsZXMgZGlzYXBwZWFyIGFmdGVyIHpvb20gb24gQ2hyb21lIGZvciBBbmRyb2lkXHJcblx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2lzc3Vlcy8yMDc4XHJcblx0XHRpZiAoTC5Ccm93c2VyLm1vYmlsZVdlYmtpdDNkKSB7XHJcblx0XHRcdHRpbGUuc3R5bGUuV2Via2l0QmFja2ZhY2VWaXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGlsZTtcclxuXHR9LFxyXG5cclxuXHRfbG9hZFRpbGU6IGZ1bmN0aW9uICh0aWxlLCB0aWxlUG9pbnQpIHtcclxuXHRcdHRpbGUuX2xheWVyICA9IHRoaXM7XHJcblx0XHR0aWxlLm9ubG9hZCAgPSB0aGlzLl90aWxlT25Mb2FkO1xyXG5cdFx0dGlsZS5vbmVycm9yID0gdGhpcy5fdGlsZU9uRXJyb3I7XHJcblxyXG5cdFx0dGhpcy5fYWRqdXN0VGlsZVBvaW50KHRpbGVQb2ludCk7XHJcblx0XHR0aWxlLnNyYyAgICAgPSB0aGlzLmdldFRpbGVVcmwodGlsZVBvaW50KTtcclxuXHJcblx0XHR0aGlzLmZpcmUoJ3RpbGVsb2Fkc3RhcnQnLCB7XHJcblx0XHRcdHRpbGU6IHRpbGUsXHJcblx0XHRcdHVybDogdGlsZS5zcmNcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdF90aWxlTG9hZGVkOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl90aWxlc1RvTG9hZC0tO1xyXG5cclxuXHRcdGlmICh0aGlzLl9hbmltYXRlZCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGlsZUNvbnRhaW5lciwgJ2xlYWZsZXQtem9vbS1hbmltYXRlZCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdGhpcy5fdGlsZXNUb0xvYWQpIHtcclxuXHRcdFx0dGhpcy5maXJlKCdsb2FkJyk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0XHQvLyBjbGVhciBzY2FsZWQgdGlsZXMgYWZ0ZXIgYWxsIG5ldyB0aWxlcyBhcmUgbG9hZGVkIChmb3IgcGVyZm9ybWFuY2UpXHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2NsZWFyQmdCdWZmZXJUaW1lcik7XHJcblx0XHRcdFx0dGhpcy5fY2xlYXJCZ0J1ZmZlclRpbWVyID0gc2V0VGltZW91dChMLmJpbmQodGhpcy5fY2xlYXJCZ0J1ZmZlciwgdGhpcyksIDUwMCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfdGlsZU9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxheWVyID0gdGhpcy5fbGF5ZXI7XHJcblxyXG5cdFx0Ly9Pbmx5IGlmIHdlIGFyZSBsb2FkaW5nIGFuIGFjdHVhbCBpbWFnZVxyXG5cdFx0aWYgKHRoaXMuc3JjICE9PSBMLlV0aWwuZW1wdHlJbWFnZVVybCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcywgJ2xlYWZsZXQtdGlsZS1sb2FkZWQnKTtcclxuXHJcblx0XHRcdGxheWVyLmZpcmUoJ3RpbGVsb2FkJywge1xyXG5cdFx0XHRcdHRpbGU6IHRoaXMsXHJcblx0XHRcdFx0dXJsOiB0aGlzLnNyY1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRsYXllci5fdGlsZUxvYWRlZCgpO1xyXG5cdH0sXHJcblxyXG5cdF90aWxlT25FcnJvcjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxheWVyID0gdGhpcy5fbGF5ZXI7XHJcblxyXG5cdFx0bGF5ZXIuZmlyZSgndGlsZWVycm9yJywge1xyXG5cdFx0XHR0aWxlOiB0aGlzLFxyXG5cdFx0XHR1cmw6IHRoaXMuc3JjXHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgbmV3VXJsID0gbGF5ZXIub3B0aW9ucy5lcnJvclRpbGVVcmw7XHJcblx0XHRpZiAobmV3VXJsKSB7XHJcblx0XHRcdHRoaXMuc3JjID0gbmV3VXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxheWVyLl90aWxlTG9hZGVkKCk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwudGlsZUxheWVyID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5UaWxlTGF5ZXIodXJsLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuVGlsZUxheWVyLldNUyBpcyB1c2VkIGZvciBwdXR0aW5nIFdNUyB0aWxlIGxheWVycyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuVGlsZUxheWVyLldNUyA9IEwuVGlsZUxheWVyLmV4dGVuZCh7XHJcblxyXG5cdGRlZmF1bHRXbXNQYXJhbXM6IHtcclxuXHRcdHNlcnZpY2U6ICdXTVMnLFxyXG5cdFx0cmVxdWVzdDogJ0dldE1hcCcsXHJcblx0XHR2ZXJzaW9uOiAnMS4xLjEnLFxyXG5cdFx0bGF5ZXJzOiAnJyxcclxuXHRcdHN0eWxlczogJycsXHJcblx0XHRmb3JtYXQ6ICdpbWFnZS9qcGVnJyxcclxuXHRcdHRyYW5zcGFyZW50OiBmYWxzZVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHsgLy8gKFN0cmluZywgT2JqZWN0KVxyXG5cclxuXHRcdHRoaXMuX3VybCA9IHVybDtcclxuXHJcblx0XHR2YXIgd21zUGFyYW1zID0gTC5leHRlbmQoe30sIHRoaXMuZGVmYXVsdFdtc1BhcmFtcyksXHJcblx0XHQgICAgdGlsZVNpemUgPSBvcHRpb25zLnRpbGVTaXplIHx8IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5kZXRlY3RSZXRpbmEgJiYgTC5Ccm93c2VyLnJldGluYSkge1xyXG5cdFx0XHR3bXNQYXJhbXMud2lkdGggPSB3bXNQYXJhbXMuaGVpZ2h0ID0gdGlsZVNpemUgKiAyO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0d21zUGFyYW1zLndpZHRoID0gd21zUGFyYW1zLmhlaWdodCA9IHRpbGVTaXplO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xyXG5cdFx0XHQvLyBhbGwga2V5cyB0aGF0IGFyZSBub3QgVGlsZUxheWVyIG9wdGlvbnMgZ28gdG8gV01TIHBhcmFtc1xyXG5cdFx0XHRpZiAoIXRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBpICE9PSAnY3JzJykge1xyXG5cdFx0XHRcdHdtc1BhcmFtc1tpXSA9IG9wdGlvbnNbaV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLndtc1BhcmFtcyA9IHdtc1BhcmFtcztcclxuXHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHJcblx0XHR0aGlzLl9jcnMgPSB0aGlzLm9wdGlvbnMuY3JzIHx8IG1hcC5vcHRpb25zLmNycztcclxuXHJcblx0XHR0aGlzLl93bXNWZXJzaW9uID0gcGFyc2VGbG9hdCh0aGlzLndtc1BhcmFtcy52ZXJzaW9uKTtcclxuXHJcblx0XHR2YXIgcHJvamVjdGlvbktleSA9IHRoaXMuX3dtc1ZlcnNpb24gPj0gMS4zID8gJ2NycycgOiAnc3JzJztcclxuXHRcdHRoaXMud21zUGFyYW1zW3Byb2plY3Rpb25LZXldID0gdGhpcy5fY3JzLmNvZGU7XHJcblxyXG5cdFx0TC5UaWxlTGF5ZXIucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcclxuXHR9LFxyXG5cclxuXHRnZXRUaWxlVXJsOiBmdW5jdGlvbiAodGlsZVBvaW50KSB7IC8vIChQb2ludCwgTnVtYmVyKSAtPiBTdHJpbmdcclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIHRpbGVTaXplID0gdGhpcy5vcHRpb25zLnRpbGVTaXplLFxyXG5cclxuXHRcdCAgICBud1BvaW50ID0gdGlsZVBvaW50Lm11bHRpcGx5QnkodGlsZVNpemUpLFxyXG5cdFx0ICAgIHNlUG9pbnQgPSBud1BvaW50LmFkZChbdGlsZVNpemUsIHRpbGVTaXplXSksXHJcblxyXG5cdFx0ICAgIG53ID0gdGhpcy5fY3JzLnByb2plY3QobWFwLnVucHJvamVjdChud1BvaW50LCB0aWxlUG9pbnQueikpLFxyXG5cdFx0ICAgIHNlID0gdGhpcy5fY3JzLnByb2plY3QobWFwLnVucHJvamVjdChzZVBvaW50LCB0aWxlUG9pbnQueikpLFxyXG5cdFx0ICAgIGJib3ggPSB0aGlzLl93bXNWZXJzaW9uID49IDEuMyAmJiB0aGlzLl9jcnMgPT09IEwuQ1JTLkVQU0c0MzI2ID9cclxuXHRcdCAgICAgICAgW3NlLnksIG53LngsIG53LnksIHNlLnhdLmpvaW4oJywnKSA6XHJcblx0XHQgICAgICAgIFtudy54LCBzZS55LCBzZS54LCBudy55XS5qb2luKCcsJyksXHJcblxyXG5cdFx0ICAgIHVybCA9IEwuVXRpbC50ZW1wbGF0ZSh0aGlzLl91cmwsIHtzOiB0aGlzLl9nZXRTdWJkb21haW4odGlsZVBvaW50KX0pO1xyXG5cclxuXHRcdHJldHVybiB1cmwgKyBMLlV0aWwuZ2V0UGFyYW1TdHJpbmcodGhpcy53bXNQYXJhbXMsIHVybCwgdHJ1ZSkgKyAnJkJCT1g9JyArIGJib3g7XHJcblx0fSxcclxuXHJcblx0c2V0UGFyYW1zOiBmdW5jdGlvbiAocGFyYW1zLCBub1JlZHJhdykge1xyXG5cclxuXHRcdEwuZXh0ZW5kKHRoaXMud21zUGFyYW1zLCBwYXJhbXMpO1xyXG5cclxuXHRcdGlmICghbm9SZWRyYXcpIHtcclxuXHRcdFx0dGhpcy5yZWRyYXcoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn0pO1xyXG5cclxuTC50aWxlTGF5ZXIud21zID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5UaWxlTGF5ZXIuV01TKHVybCwgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlRpbGVMYXllci5DYW52YXMgaXMgYSBjbGFzcyB0aGF0IHlvdSBjYW4gdXNlIGFzIGEgYmFzZSBmb3IgY3JlYXRpbmdcclxuICogZHluYW1pY2FsbHkgZHJhd24gQ2FudmFzLWJhc2VkIHRpbGUgbGF5ZXJzLlxyXG4gKi9cclxuXHJcbkwuVGlsZUxheWVyLkNhbnZhcyA9IEwuVGlsZUxheWVyLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0YXN5bmM6IGZhbHNlXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRyZWRyYXc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fcmVzZXQoe2hhcmQ6IHRydWV9KTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl90aWxlcykge1xyXG5cdFx0XHR0aGlzLl9yZWRyYXdUaWxlKHRoaXMuX3RpbGVzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9yZWRyYXdUaWxlOiBmdW5jdGlvbiAodGlsZSkge1xyXG5cdFx0dGhpcy5kcmF3VGlsZSh0aWxlLCB0aWxlLl90aWxlUG9pbnQsIHRoaXMuX21hcC5fem9vbSk7XHJcblx0fSxcclxuXHJcblx0X2NyZWF0ZVRpbGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0aWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnY2FudmFzJywgJ2xlYWZsZXQtdGlsZScpO1xyXG5cdFx0dGlsZS53aWR0aCA9IHRpbGUuaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnRpbGVTaXplO1xyXG5cdFx0dGlsZS5vbnNlbGVjdHN0YXJ0ID0gdGlsZS5vbm1vdXNlbW92ZSA9IEwuVXRpbC5mYWxzZUZuO1xyXG5cdFx0cmV0dXJuIHRpbGU7XHJcblx0fSxcclxuXHJcblx0X2xvYWRUaWxlOiBmdW5jdGlvbiAodGlsZSwgdGlsZVBvaW50KSB7XHJcblx0XHR0aWxlLl9sYXllciA9IHRoaXM7XHJcblx0XHR0aWxlLl90aWxlUG9pbnQgPSB0aWxlUG9pbnQ7XHJcblxyXG5cdFx0dGhpcy5fcmVkcmF3VGlsZSh0aWxlKTtcclxuXHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5hc3luYykge1xyXG5cdFx0XHR0aGlzLnRpbGVEcmF3bih0aWxlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRkcmF3VGlsZTogZnVuY3Rpb24gKC8qdGlsZSwgdGlsZVBvaW50Ki8pIHtcclxuXHRcdC8vIG92ZXJyaWRlIHdpdGggcmVuZGVyaW5nIGNvZGVcclxuXHR9LFxyXG5cclxuXHR0aWxlRHJhd246IGZ1bmN0aW9uICh0aWxlKSB7XHJcblx0XHR0aGlzLl90aWxlT25Mb2FkLmNhbGwodGlsZSk7XHJcblx0fVxyXG59KTtcclxuXHJcblxyXG5MLnRpbGVMYXllci5jYW52YXMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5UaWxlTGF5ZXIuQ2FudmFzKG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5JbWFnZU92ZXJsYXkgaXMgdXNlZCB0byBvdmVybGF5IGltYWdlcyBvdmVyIHRoZSBtYXAgKHRvIHNwZWNpZmljIGdlb2dyYXBoaWNhbCBib3VuZHMpLlxyXG4gKi9cclxuXHJcbkwuSW1hZ2VPdmVybGF5ID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0b3BhY2l0eTogMVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uICh1cmwsIGJvdW5kcywgb3B0aW9ucykgeyAvLyAoU3RyaW5nLCBMYXRMbmdCb3VuZHMsIE9iamVjdClcclxuXHRcdHRoaXMuX3VybCA9IHVybDtcclxuXHRcdHRoaXMuX2JvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9pbWFnZSkge1xyXG5cdFx0XHR0aGlzLl9pbml0SW1hZ2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHRtYXAuX3BhbmVzLm92ZXJsYXlQYW5lLmFwcGVuZENoaWxkKHRoaXMuX2ltYWdlKTtcclxuXHJcblx0XHRtYXAub24oJ3ZpZXdyZXNldCcsIHRoaXMuX3Jlc2V0LCB0aGlzKTtcclxuXHJcblx0XHRpZiAobWFwLm9wdGlvbnMuem9vbUFuaW1hdGlvbiAmJiBMLkJyb3dzZXIuYW55M2QpIHtcclxuXHRcdFx0bWFwLm9uKCd6b29tYW5pbScsIHRoaXMuX2FuaW1hdGVab29tLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9yZXNldCgpO1xyXG5cdH0sXHJcblxyXG5cdG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAuZ2V0UGFuZXMoKS5vdmVybGF5UGFuZS5yZW1vdmVDaGlsZCh0aGlzLl9pbWFnZSk7XHJcblxyXG5cdFx0bWFwLm9mZigndmlld3Jlc2V0JywgdGhpcy5fcmVzZXQsIHRoaXMpO1xyXG5cclxuXHRcdGlmIChtYXAub3B0aW9ucy56b29tQW5pbWF0aW9uKSB7XHJcblx0XHRcdG1hcC5vZmYoJ3pvb21hbmltJywgdGhpcy5fYW5pbWF0ZVpvb20sIHRoaXMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAuYWRkTGF5ZXIodGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRPcGFjaXR5OiBmdW5jdGlvbiAob3BhY2l0eSkge1xyXG5cdFx0dGhpcy5vcHRpb25zLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG5cdFx0dGhpcy5fdXBkYXRlT3BhY2l0eSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Ly8gVE9ETyByZW1vdmUgYnJpbmdUb0Zyb250L2JyaW5nVG9CYWNrIGR1cGxpY2F0aW9uIGZyb20gVGlsZUxheWVyL1BhdGhcclxuXHRicmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9pbWFnZSkge1xyXG5cdFx0XHR0aGlzLl9tYXAuX3BhbmVzLm92ZXJsYXlQYW5lLmFwcGVuZENoaWxkKHRoaXMuX2ltYWdlKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9CYWNrOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcGFuZSA9IHRoaXMuX21hcC5fcGFuZXMub3ZlcmxheVBhbmU7XHJcblx0XHRpZiAodGhpcy5faW1hZ2UpIHtcclxuXHRcdFx0cGFuZS5pbnNlcnRCZWZvcmUodGhpcy5faW1hZ2UsIHBhbmUuZmlyc3RDaGlsZCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRVcmw6IGZ1bmN0aW9uICh1cmwpIHtcclxuXHRcdHRoaXMuX3VybCA9IHVybDtcclxuXHRcdHRoaXMuX2ltYWdlLnNyYyA9IHRoaXMuX3VybDtcclxuXHR9LFxyXG5cclxuXHRnZXRBdHRyaWJ1dGlvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5hdHRyaWJ1dGlvbjtcclxuXHR9LFxyXG5cclxuXHRfaW5pdEltYWdlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9pbWFnZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2ltZycsICdsZWFmbGV0LWltYWdlLWxheWVyJyk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcC5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5Ccm93c2VyLmFueTNkKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9pbWFnZSwgJ2xlYWZsZXQtem9vbS1hbmltYXRlZCcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2ltYWdlLCAnbGVhZmxldC16b29tLWhpZGUnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl91cGRhdGVPcGFjaXR5KCk7XHJcblxyXG5cdFx0Ly9UT0RPIGNyZWF0ZUltYWdlIHV0aWwgbWV0aG9kIHRvIHJlbW92ZSBkdXBsaWNhdGlvblxyXG5cdFx0TC5leHRlbmQodGhpcy5faW1hZ2UsIHtcclxuXHRcdFx0Z2FsbGVyeWltZzogJ25vJyxcclxuXHRcdFx0b25zZWxlY3RzdGFydDogTC5VdGlsLmZhbHNlRm4sXHJcblx0XHRcdG9ubW91c2Vtb3ZlOiBMLlV0aWwuZmFsc2VGbixcclxuXHRcdFx0b25sb2FkOiBMLmJpbmQodGhpcy5fb25JbWFnZUxvYWQsIHRoaXMpLFxyXG5cdFx0XHRzcmM6IHRoaXMuX3VybFxyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0X2FuaW1hdGVab29tOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcclxuXHRcdCAgICBpbWFnZSA9IHRoaXMuX2ltYWdlLFxyXG5cdFx0ICAgIHNjYWxlID0gbWFwLmdldFpvb21TY2FsZShlLnpvb20pLFxyXG5cdFx0ICAgIG53ID0gdGhpcy5fYm91bmRzLmdldE5vcnRoV2VzdCgpLFxyXG5cdFx0ICAgIHNlID0gdGhpcy5fYm91bmRzLmdldFNvdXRoRWFzdCgpLFxyXG5cclxuXHRcdCAgICB0b3BMZWZ0ID0gbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQobncsIGUuem9vbSwgZS5jZW50ZXIpLFxyXG5cdFx0ICAgIHNpemUgPSBtYXAuX2xhdExuZ1RvTmV3TGF5ZXJQb2ludChzZSwgZS56b29tLCBlLmNlbnRlcikuX3N1YnRyYWN0KHRvcExlZnQpLFxyXG5cdFx0ICAgIG9yaWdpbiA9IHRvcExlZnQuX2FkZChzaXplLl9tdWx0aXBseUJ5KCgxIC8gMikgKiAoMSAtIDEgLyBzY2FsZSkpKTtcclxuXHJcblx0XHRpbWFnZS5zdHlsZVtMLkRvbVV0aWwuVFJBTlNGT1JNXSA9XHJcblx0XHQgICAgICAgIEwuRG9tVXRpbC5nZXRUcmFuc2xhdGVTdHJpbmcob3JpZ2luKSArICcgc2NhbGUoJyArIHNjYWxlICsgJykgJztcclxuXHR9LFxyXG5cclxuXHRfcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBpbWFnZSAgID0gdGhpcy5faW1hZ2UsXHJcblx0XHQgICAgdG9wTGVmdCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5fYm91bmRzLmdldE5vcnRoV2VzdCgpKSxcclxuXHRcdCAgICBzaXplID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9ib3VuZHMuZ2V0U291dGhFYXN0KCkpLl9zdWJ0cmFjdCh0b3BMZWZ0KTtcclxuXHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24oaW1hZ2UsIHRvcExlZnQpO1xyXG5cclxuXHRcdGltYWdlLnN0eWxlLndpZHRoICA9IHNpemUueCArICdweCc7XHJcblx0XHRpbWFnZS5zdHlsZS5oZWlnaHQgPSBzaXplLnkgKyAncHgnO1xyXG5cdH0sXHJcblxyXG5cdF9vbkltYWdlTG9hZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5maXJlKCdsb2FkJyk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZU9wYWNpdHk6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuRG9tVXRpbC5zZXRPcGFjaXR5KHRoaXMuX2ltYWdlLCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuaW1hZ2VPdmVybGF5ID0gZnVuY3Rpb24gKHVybCwgYm91bmRzLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkltYWdlT3ZlcmxheSh1cmwsIGJvdW5kcywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkljb24gaXMgYW4gaW1hZ2UtYmFzZWQgaWNvbiBjbGFzcyB0aGF0IHlvdSBjYW4gdXNlIHdpdGggTC5NYXJrZXIgZm9yIGN1c3RvbSBtYXJrZXJzLlxyXG4gKi9cclxuXHJcbkwuSWNvbiA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHQvKlxyXG5cdFx0aWNvblVybDogKFN0cmluZykgKHJlcXVpcmVkKVxyXG5cdFx0aWNvblJldGluYVVybDogKFN0cmluZykgKG9wdGlvbmFsLCB1c2VkIGZvciByZXRpbmEgZGV2aWNlcyBpZiBkZXRlY3RlZClcclxuXHRcdGljb25TaXplOiAoUG9pbnQpIChjYW4gYmUgc2V0IHRocm91Z2ggQ1NTKVxyXG5cdFx0aWNvbkFuY2hvcjogKFBvaW50KSAoY2VudGVyZWQgYnkgZGVmYXVsdCwgY2FuIGJlIHNldCBpbiBDU1Mgd2l0aCBuZWdhdGl2ZSBtYXJnaW5zKVxyXG5cdFx0cG9wdXBBbmNob3I6IChQb2ludCkgKGlmIG5vdCBzcGVjaWZpZWQsIHBvcHVwIG9wZW5zIGluIHRoZSBhbmNob3IgcG9pbnQpXHJcblx0XHRzaGFkb3dVcmw6IChTdHJpbmcpIChubyBzaGFkb3cgYnkgZGVmYXVsdClcclxuXHRcdHNoYWRvd1JldGluYVVybDogKFN0cmluZykgKG9wdGlvbmFsLCB1c2VkIGZvciByZXRpbmEgZGV2aWNlcyBpZiBkZXRlY3RlZClcclxuXHRcdHNoYWRvd1NpemU6IChQb2ludClcclxuXHRcdHNoYWRvd0FuY2hvcjogKFBvaW50KVxyXG5cdFx0Ki9cclxuXHRcdGNsYXNzTmFtZTogJydcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdGNyZWF0ZUljb246IGZ1bmN0aW9uIChvbGRJY29uKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlSWNvbignaWNvbicsIG9sZEljb24pO1xyXG5cdH0sXHJcblxyXG5cdGNyZWF0ZVNoYWRvdzogZnVuY3Rpb24gKG9sZEljb24pIHtcclxuXHRcdHJldHVybiB0aGlzLl9jcmVhdGVJY29uKCdzaGFkb3cnLCBvbGRJY29uKTtcclxuXHR9LFxyXG5cclxuXHRfY3JlYXRlSWNvbjogZnVuY3Rpb24gKG5hbWUsIG9sZEljb24pIHtcclxuXHRcdHZhciBzcmMgPSB0aGlzLl9nZXRJY29uVXJsKG5hbWUpO1xyXG5cclxuXHRcdGlmICghc3JjKSB7XHJcblx0XHRcdGlmIChuYW1lID09PSAnaWNvbicpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2ljb25Vcmwgbm90IHNldCBpbiBJY29uIG9wdGlvbnMgKHNlZSB0aGUgZG9jcykuJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGltZztcclxuXHRcdGlmICghb2xkSWNvbiB8fCBvbGRJY29uLnRhZ05hbWUgIT09ICdJTUcnKSB7XHJcblx0XHRcdGltZyA9IHRoaXMuX2NyZWF0ZUltZyhzcmMpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aW1nID0gdGhpcy5fY3JlYXRlSW1nKHNyYywgb2xkSWNvbik7XHJcblx0XHR9XHJcblx0XHR0aGlzLl9zZXRJY29uU3R5bGVzKGltZywgbmFtZSk7XHJcblxyXG5cdFx0cmV0dXJuIGltZztcclxuXHR9LFxyXG5cclxuXHRfc2V0SWNvblN0eWxlczogZnVuY3Rpb24gKGltZywgbmFtZSkge1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcblx0XHQgICAgc2l6ZSA9IEwucG9pbnQob3B0aW9uc1tuYW1lICsgJ1NpemUnXSksXHJcblx0XHQgICAgYW5jaG9yO1xyXG5cclxuXHRcdGlmIChuYW1lID09PSAnc2hhZG93Jykge1xyXG5cdFx0XHRhbmNob3IgPSBMLnBvaW50KG9wdGlvbnMuc2hhZG93QW5jaG9yIHx8IG9wdGlvbnMuaWNvbkFuY2hvcik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhbmNob3IgPSBMLnBvaW50KG9wdGlvbnMuaWNvbkFuY2hvcik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCFhbmNob3IgJiYgc2l6ZSkge1xyXG5cdFx0XHRhbmNob3IgPSBzaXplLmRpdmlkZUJ5KDIsIHRydWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGltZy5jbGFzc05hbWUgPSAnbGVhZmxldC1tYXJrZXItJyArIG5hbWUgKyAnICcgKyBvcHRpb25zLmNsYXNzTmFtZTtcclxuXHJcblx0XHRpZiAoYW5jaG9yKSB7XHJcblx0XHRcdGltZy5zdHlsZS5tYXJnaW5MZWZ0ID0gKC1hbmNob3IueCkgKyAncHgnO1xyXG5cdFx0XHRpbWcuc3R5bGUubWFyZ2luVG9wICA9ICgtYW5jaG9yLnkpICsgJ3B4JztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoc2l6ZSkge1xyXG5cdFx0XHRpbWcuc3R5bGUud2lkdGggID0gc2l6ZS54ICsgJ3B4JztcclxuXHRcdFx0aW1nLnN0eWxlLmhlaWdodCA9IHNpemUueSArICdweCc7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2NyZWF0ZUltZzogZnVuY3Rpb24gKHNyYywgZWwpIHtcclxuXHRcdGVsID0gZWwgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcblx0XHRlbC5zcmMgPSBzcmM7XHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblx0X2dldEljb25Vcmw6IGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRpZiAoTC5Ccm93c2VyLnJldGluYSAmJiB0aGlzLm9wdGlvbnNbbmFtZSArICdSZXRpbmFVcmwnXSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zW25hbWUgKyAnUmV0aW5hVXJsJ107XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zW25hbWUgKyAnVXJsJ107XHJcblx0fVxyXG59KTtcclxuXHJcbkwuaWNvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkljb24ob3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxuICogTC5JY29uLkRlZmF1bHQgaXMgdGhlIGJsdWUgbWFya2VyIGljb24gdXNlZCBieSBkZWZhdWx0IGluIExlYWZsZXQuXG4gKi9cblxuTC5JY29uLkRlZmF1bHQgPSBMLkljb24uZXh0ZW5kKHtcblxuXHRvcHRpb25zOiB7XG5cdFx0aWNvblNpemU6IFsyNSwgNDFdLFxuXHRcdGljb25BbmNob3I6IFsxMiwgNDFdLFxuXHRcdHBvcHVwQW5jaG9yOiBbMSwgLTM0XSxcblxuXHRcdHNoYWRvd1NpemU6IFs0MSwgNDFdXG5cdH0sXG5cblx0X2dldEljb25Vcmw6IGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0dmFyIGtleSA9IG5hbWUgKyAnVXJsJztcblxuXHRcdGlmICh0aGlzLm9wdGlvbnNba2V5XSkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1trZXldO1xuXHRcdH1cblxuXHRcdGlmIChMLkJyb3dzZXIucmV0aW5hICYmIG5hbWUgPT09ICdpY29uJykge1xuXHRcdFx0bmFtZSArPSAnLTJ4Jztcblx0XHR9XG5cblx0XHR2YXIgcGF0aCA9IEwuSWNvbi5EZWZhdWx0LmltYWdlUGF0aDtcblxuXHRcdGlmICghcGF0aCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb3VsZG5cXCd0IGF1dG9kZXRlY3QgTC5JY29uLkRlZmF1bHQuaW1hZ2VQYXRoLCBzZXQgaXQgbWFudWFsbHkuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGggKyAnL21hcmtlci0nICsgbmFtZSArICcucG5nJztcblx0fVxufSk7XG5cbkwuSWNvbi5EZWZhdWx0LmltYWdlUGF0aCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpLFxuXHQgICAgbGVhZmxldFJlID0gL1tcXC9eXWxlYWZsZXRbXFwtXFwuX10/KFtcXHdcXC1cXC5fXSopXFwuanNcXD8/LztcblxuXHR2YXIgaSwgbGVuLCBzcmMsIG1hdGNoZXMsIHBhdGg7XG5cblx0Zm9yIChpID0gMCwgbGVuID0gc2NyaXB0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHNyYyA9IHNjcmlwdHNbaV0uc3JjO1xuXHRcdG1hdGNoZXMgPSBzcmMubWF0Y2gobGVhZmxldFJlKTtcblxuXHRcdGlmIChtYXRjaGVzKSB7XG5cdFx0XHRwYXRoID0gc3JjLnNwbGl0KGxlYWZsZXRSZSlbMF07XG5cdFx0XHRyZXR1cm4gKHBhdGggPyBwYXRoICsgJy8nIDogJycpICsgJ2ltYWdlcyc7XG5cdFx0fVxuXHR9XG59KCkpO1xuXG5cbi8qXHJcbiAqIEwuTWFya2VyIGlzIHVzZWQgdG8gZGlzcGxheSBjbGlja2FibGUvZHJhZ2dhYmxlIGljb25zIG9uIHRoZSBtYXAuXHJcbiAqL1xyXG5cclxuTC5NYXJrZXIgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblxyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0aWNvbjogbmV3IEwuSWNvbi5EZWZhdWx0KCksXHJcblx0XHR0aXRsZTogJycsXHJcblx0XHRhbHQ6ICcnLFxyXG5cdFx0Y2xpY2thYmxlOiB0cnVlLFxyXG5cdFx0ZHJhZ2dhYmxlOiBmYWxzZSxcclxuXHRcdGtleWJvYXJkOiB0cnVlLFxyXG5cdFx0ekluZGV4T2Zmc2V0OiAwLFxyXG5cdFx0b3BhY2l0eTogMSxcclxuXHRcdHJpc2VPbkhvdmVyOiBmYWxzZSxcclxuXHRcdHJpc2VPZmZzZXQ6IDI1MFxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRsbmcsIG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHRcdHRoaXMuX2xhdGxuZyA9IEwubGF0TG5nKGxhdGxuZyk7XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHJcblx0XHRtYXAub24oJ3ZpZXdyZXNldCcsIHRoaXMudXBkYXRlLCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLl9pbml0SWNvbigpO1xyXG5cdFx0dGhpcy51cGRhdGUoKTtcclxuXHRcdHRoaXMuZmlyZSgnYWRkJyk7XHJcblxyXG5cdFx0aWYgKG1hcC5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgbWFwLm9wdGlvbnMubWFya2VyWm9vbUFuaW1hdGlvbikge1xyXG5cdFx0XHRtYXAub24oJ3pvb21hbmltJywgdGhpcy5fYW5pbWF0ZVpvb20sIHRoaXMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAuYWRkTGF5ZXIodGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0aWYgKHRoaXMuZHJhZ2dpbmcpIHtcclxuXHRcdFx0dGhpcy5kcmFnZ2luZy5kaXNhYmxlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmVtb3ZlSWNvbigpO1xyXG5cdFx0dGhpcy5fcmVtb3ZlU2hhZG93KCk7XHJcblxyXG5cdFx0dGhpcy5maXJlKCdyZW1vdmUnKTtcclxuXHJcblx0XHRtYXAub2ZmKHtcclxuXHRcdFx0J3ZpZXdyZXNldCc6IHRoaXMudXBkYXRlLFxyXG5cdFx0XHQnem9vbWFuaW0nOiB0aGlzLl9hbmltYXRlWm9vbVxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRnZXRMYXRMbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXRsbmc7XHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuZmlyZSgnbW92ZScsIHsgbGF0bG5nOiB0aGlzLl9sYXRsbmcgfSk7XHJcblx0fSxcclxuXHJcblx0c2V0WkluZGV4T2Zmc2V0OiBmdW5jdGlvbiAob2Zmc2V0KSB7XHJcblx0XHR0aGlzLm9wdGlvbnMuekluZGV4T2Zmc2V0ID0gb2Zmc2V0O1xyXG5cdFx0dGhpcy51cGRhdGUoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRJY29uOiBmdW5jdGlvbiAoaWNvbikge1xyXG5cclxuXHRcdHRoaXMub3B0aW9ucy5pY29uID0gaWNvbjtcclxuXHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX2luaXRJY29uKCk7XHJcblx0XHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuYmluZFBvcHVwKHRoaXMuX3BvcHVwKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHR1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9pY29uKSB7XHJcblx0XHRcdHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2xhdGxuZykucm91bmQoKTtcclxuXHRcdFx0dGhpcy5fc2V0UG9zKHBvcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X2luaXRJY29uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuXHRcdCAgICBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgYW5pbWF0aW9uID0gKG1hcC5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgbWFwLm9wdGlvbnMubWFya2VyWm9vbUFuaW1hdGlvbiksXHJcblx0XHQgICAgY2xhc3NUb0FkZCA9IGFuaW1hdGlvbiA/ICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnIDogJ2xlYWZsZXQtem9vbS1oaWRlJztcclxuXHJcblx0XHR2YXIgaWNvbiA9IG9wdGlvbnMuaWNvbi5jcmVhdGVJY29uKHRoaXMuX2ljb24pLFxyXG5cdFx0XHRhZGRJY29uID0gZmFsc2U7XHJcblxyXG5cdFx0Ly8gaWYgd2UncmUgbm90IHJldXNpbmcgdGhlIGljb24sIHJlbW92ZSB0aGUgb2xkIG9uZSBhbmQgaW5pdCBuZXcgb25lXHJcblx0XHRpZiAoaWNvbiAhPT0gdGhpcy5faWNvbikge1xyXG5cdFx0XHRpZiAodGhpcy5faWNvbikge1xyXG5cdFx0XHRcdHRoaXMuX3JlbW92ZUljb24oKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRhZGRJY29uID0gdHJ1ZTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLnRpdGxlKSB7XHJcblx0XHRcdFx0aWNvbi50aXRsZSA9IG9wdGlvbnMudGl0bGU7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmIChvcHRpb25zLmFsdCkge1xyXG5cdFx0XHRcdGljb24uYWx0ID0gb3B0aW9ucy5hbHQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoaWNvbiwgY2xhc3NUb0FkZCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMua2V5Ym9hcmQpIHtcclxuXHRcdFx0aWNvbi50YWJJbmRleCA9ICcwJztcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pY29uID0gaWNvbjtcclxuXHJcblx0XHR0aGlzLl9pbml0SW50ZXJhY3Rpb24oKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5yaXNlT25Ib3Zlcikge1xyXG5cdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdFx0Lm9uKGljb24sICdtb3VzZW92ZXInLCB0aGlzLl9icmluZ1RvRnJvbnQsIHRoaXMpXHJcblx0XHRcdFx0Lm9uKGljb24sICdtb3VzZW91dCcsIHRoaXMuX3Jlc2V0WkluZGV4LCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbmV3U2hhZG93ID0gb3B0aW9ucy5pY29uLmNyZWF0ZVNoYWRvdyh0aGlzLl9zaGFkb3cpLFxyXG5cdFx0XHRhZGRTaGFkb3cgPSBmYWxzZTtcclxuXHJcblx0XHRpZiAobmV3U2hhZG93ICE9PSB0aGlzLl9zaGFkb3cpIHtcclxuXHRcdFx0dGhpcy5fcmVtb3ZlU2hhZG93KCk7XHJcblx0XHRcdGFkZFNoYWRvdyA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG5ld1NoYWRvdykge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MobmV3U2hhZG93LCBjbGFzc1RvQWRkKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX3NoYWRvdyA9IG5ld1NoYWRvdztcclxuXHJcblxyXG5cdFx0aWYgKG9wdGlvbnMub3BhY2l0eSA8IDEpIHtcclxuXHRcdFx0dGhpcy5fdXBkYXRlT3BhY2l0eSgpO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHR2YXIgcGFuZXMgPSB0aGlzLl9tYXAuX3BhbmVzO1xyXG5cclxuXHRcdGlmIChhZGRJY29uKSB7XHJcblx0XHRcdHBhbmVzLm1hcmtlclBhbmUuYXBwZW5kQ2hpbGQodGhpcy5faWNvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG5ld1NoYWRvdyAmJiBhZGRTaGFkb3cpIHtcclxuXHRcdFx0cGFuZXMuc2hhZG93UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9zaGFkb3cpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9yZW1vdmVJY29uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnJpc2VPbkhvdmVyKSB7XHJcblx0XHRcdEwuRG9tRXZlbnRcclxuXHRcdFx0ICAgIC5vZmYodGhpcy5faWNvbiwgJ21vdXNlb3ZlcicsIHRoaXMuX2JyaW5nVG9Gcm9udClcclxuXHRcdFx0ICAgIC5vZmYodGhpcy5faWNvbiwgJ21vdXNlb3V0JywgdGhpcy5fcmVzZXRaSW5kZXgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX21hcC5fcGFuZXMubWFya2VyUGFuZS5yZW1vdmVDaGlsZCh0aGlzLl9pY29uKTtcclxuXHJcblx0XHR0aGlzLl9pY29uID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRfcmVtb3ZlU2hhZG93OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fc2hhZG93KSB7XHJcblx0XHRcdHRoaXMuX21hcC5fcGFuZXMuc2hhZG93UGFuZS5yZW1vdmVDaGlsZCh0aGlzLl9zaGFkb3cpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fc2hhZG93ID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRfc2V0UG9zOiBmdW5jdGlvbiAocG9zKSB7XHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5faWNvbiwgcG9zKTtcclxuXHJcblx0XHRpZiAodGhpcy5fc2hhZG93KSB7XHJcblx0XHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9zaGFkb3csIHBvcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fekluZGV4ID0gcG9zLnkgKyB0aGlzLm9wdGlvbnMuekluZGV4T2Zmc2V0O1xyXG5cclxuXHRcdHRoaXMuX3Jlc2V0WkluZGV4KCk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVpJbmRleDogZnVuY3Rpb24gKG9mZnNldCkge1xyXG5cdFx0dGhpcy5faWNvbi5zdHlsZS56SW5kZXggPSB0aGlzLl96SW5kZXggKyBvZmZzZXQ7XHJcblx0fSxcclxuXHJcblx0X2FuaW1hdGVab29tOiBmdW5jdGlvbiAob3B0KSB7XHJcblx0XHR2YXIgcG9zID0gdGhpcy5fbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQodGhpcy5fbGF0bG5nLCBvcHQuem9vbSwgb3B0LmNlbnRlcikucm91bmQoKTtcclxuXHJcblx0XHR0aGlzLl9zZXRQb3MocG9zKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdEludGVyYWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuY2xpY2thYmxlKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIFRPRE8gcmVmYWN0b3IgaW50byBzb21ldGhpbmcgc2hhcmVkIHdpdGggTWFwL1BhdGgvZXRjLiB0byBEUlkgaXQgdXBcclxuXHJcblx0XHR2YXIgaWNvbiA9IHRoaXMuX2ljb24sXHJcblx0XHQgICAgZXZlbnRzID0gWydkYmxjbGljaycsICdtb3VzZWRvd24nLCAnbW91c2VvdmVyJywgJ21vdXNlb3V0JywgJ2NvbnRleHRtZW51J107XHJcblxyXG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKGljb24sICdsZWFmbGV0LWNsaWNrYWJsZScpO1xyXG5cdFx0TC5Eb21FdmVudC5vbihpY29uLCAnY2xpY2snLCB0aGlzLl9vbk1vdXNlQ2xpY2ssIHRoaXMpO1xyXG5cdFx0TC5Eb21FdmVudC5vbihpY29uLCAna2V5cHJlc3MnLCB0aGlzLl9vbktleVByZXNzLCB0aGlzKTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGljb24sIGV2ZW50c1tpXSwgdGhpcy5fZmlyZU1vdXNlRXZlbnQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChMLkhhbmRsZXIuTWFya2VyRHJhZykge1xyXG5cdFx0XHR0aGlzLmRyYWdnaW5nID0gbmV3IEwuSGFuZGxlci5NYXJrZXJEcmFnKHRoaXMpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5kcmFnZ2FibGUpIHtcclxuXHRcdFx0XHR0aGlzLmRyYWdnaW5nLmVuYWJsZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X29uTW91c2VDbGljazogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHZhciB3YXNEcmFnZ2VkID0gdGhpcy5kcmFnZ2luZyAmJiB0aGlzLmRyYWdnaW5nLm1vdmVkKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuaGFzRXZlbnRMaXN0ZW5lcnMoZS50eXBlKSB8fCB3YXNEcmFnZ2VkKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh3YXNEcmFnZ2VkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmICgoIXRoaXMuZHJhZ2dpbmcgfHwgIXRoaXMuZHJhZ2dpbmcuX2VuYWJsZWQpICYmIHRoaXMuX21hcC5kcmFnZ2luZyAmJiB0aGlzLl9tYXAuZHJhZ2dpbmcubW92ZWQoKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLmZpcmUoZS50eXBlLCB7XHJcblx0XHRcdG9yaWdpbmFsRXZlbnQ6IGUsXHJcblx0XHRcdGxhdGxuZzogdGhpcy5fbGF0bG5nXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHRfb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnY2xpY2snLCB7XHJcblx0XHRcdFx0b3JpZ2luYWxFdmVudDogZSxcclxuXHRcdFx0XHRsYXRsbmc6IHRoaXMuX2xhdGxuZ1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfZmlyZU1vdXNlRXZlbnQ6IGZ1bmN0aW9uIChlKSB7XHJcblxyXG5cdFx0dGhpcy5maXJlKGUudHlwZSwge1xyXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBlLFxyXG5cdFx0XHRsYXRsbmc6IHRoaXMuX2xhdGxuZ1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gVE9ETyBwcm9wZXIgY3VzdG9tIGV2ZW50IHByb3BhZ2F0aW9uXHJcblx0XHQvLyB0aGlzIGxpbmUgd2lsbCBhbHdheXMgYmUgY2FsbGVkIGlmIG1hcmtlciBpcyBpbiBhIEZlYXR1cmVHcm91cFxyXG5cdFx0aWYgKGUudHlwZSA9PT0gJ2NvbnRleHRtZW51JyAmJiB0aGlzLmhhc0V2ZW50TGlzdGVuZXJzKGUudHlwZSkpIHtcclxuXHRcdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcclxuXHRcdH1cclxuXHRcdGlmIChlLnR5cGUgIT09ICdtb3VzZWRvd24nKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKGUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRzZXRPcGFjaXR5OiBmdW5jdGlvbiAob3BhY2l0eSkge1xyXG5cdFx0dGhpcy5vcHRpb25zLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVPcGFjaXR5KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZU9wYWNpdHk6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuRG9tVXRpbC5zZXRPcGFjaXR5KHRoaXMuX2ljb24sIHRoaXMub3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdGlmICh0aGlzLl9zaGFkb3cpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fc2hhZG93LCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2JyaW5nVG9Gcm9udDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fdXBkYXRlWkluZGV4KHRoaXMub3B0aW9ucy5yaXNlT2Zmc2V0KTtcclxuXHR9LFxyXG5cclxuXHRfcmVzZXRaSW5kZXg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX3VwZGF0ZVpJbmRleCgwKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5tYXJrZXIgPSBmdW5jdGlvbiAobGF0bG5nLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLk1hcmtlcihsYXRsbmcsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcbiAqIEwuRGl2SWNvbiBpcyBhIGxpZ2h0d2VpZ2h0IEhUTUwtYmFzZWQgaWNvbiBjbGFzcyAoYXMgb3Bwb3NlZCB0byB0aGUgaW1hZ2UtYmFzZWQgTC5JY29uKVxuICogdG8gdXNlIHdpdGggTC5NYXJrZXIuXG4gKi9cblxuTC5EaXZJY29uID0gTC5JY29uLmV4dGVuZCh7XG5cdG9wdGlvbnM6IHtcblx0XHRpY29uU2l6ZTogWzEyLCAxMl0sIC8vIGFsc28gY2FuIGJlIHNldCB0aHJvdWdoIENTU1xuXHRcdC8qXG5cdFx0aWNvbkFuY2hvcjogKFBvaW50KVxuXHRcdHBvcHVwQW5jaG9yOiAoUG9pbnQpXG5cdFx0aHRtbDogKFN0cmluZylcblx0XHRiZ1BvczogKFBvaW50KVxuXHRcdCovXG5cdFx0Y2xhc3NOYW1lOiAnbGVhZmxldC1kaXYtaWNvbicsXG5cdFx0aHRtbDogZmFsc2Vcblx0fSxcblxuXHRjcmVhdGVJY29uOiBmdW5jdGlvbiAob2xkSWNvbikge1xuXHRcdHZhciBkaXYgPSAob2xkSWNvbiAmJiBvbGRJY29uLnRhZ05hbWUgPT09ICdESVYnKSA/IG9sZEljb24gOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdGlmIChvcHRpb25zLmh0bWwgIT09IGZhbHNlKSB7XG5cdFx0XHRkaXYuaW5uZXJIVE1MID0gb3B0aW9ucy5odG1sO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkaXYuaW5uZXJIVE1MID0gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuYmdQb3MpIHtcblx0XHRcdGRpdi5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPVxuXHRcdFx0ICAgICAgICAoLW9wdGlvbnMuYmdQb3MueCkgKyAncHggJyArICgtb3B0aW9ucy5iZ1Bvcy55KSArICdweCc7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc2V0SWNvblN0eWxlcyhkaXYsICdpY29uJyk7XG5cdFx0cmV0dXJuIGRpdjtcblx0fSxcblxuXHRjcmVhdGVTaGFkb3c6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufSk7XG5cbkwuZGl2SWNvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdHJldHVybiBuZXcgTC5EaXZJY29uKG9wdGlvbnMpO1xufTtcblxuXG4vKlxyXG4gKiBMLlBvcHVwIGlzIHVzZWQgZm9yIGRpc3BsYXlpbmcgcG9wdXBzIG9uIHRoZSBtYXAuXHJcbiAqL1xyXG5cclxuTC5NYXAubWVyZ2VPcHRpb25zKHtcclxuXHRjbG9zZVBvcHVwT25DbGljazogdHJ1ZVxyXG59KTtcclxuXHJcbkwuUG9wdXAgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0aW5jbHVkZXM6IEwuTWl4aW4uRXZlbnRzLFxyXG5cclxuXHRvcHRpb25zOiB7XHJcblx0XHRtaW5XaWR0aDogNTAsXHJcblx0XHRtYXhXaWR0aDogMzAwLFxyXG5cdFx0Ly8gbWF4SGVpZ2h0OiBudWxsLFxyXG5cdFx0YXV0b1BhbjogdHJ1ZSxcclxuXHRcdGNsb3NlQnV0dG9uOiB0cnVlLFxyXG5cdFx0b2Zmc2V0OiBbMCwgN10sXHJcblx0XHRhdXRvUGFuUGFkZGluZzogWzUsIDVdLFxyXG5cdFx0Ly8gYXV0b1BhblBhZGRpbmdUb3BMZWZ0OiBudWxsLFxyXG5cdFx0Ly8gYXV0b1BhblBhZGRpbmdCb3R0b21SaWdodDogbnVsbCxcclxuXHRcdGtlZXBJblZpZXc6IGZhbHNlLFxyXG5cdFx0Y2xhc3NOYW1lOiAnJyxcclxuXHRcdHpvb21BbmltYXRpb246IHRydWVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucywgc291cmNlKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5fc291cmNlID0gc291cmNlO1xyXG5cdFx0dGhpcy5fYW5pbWF0ZWQgPSBMLkJyb3dzZXIuYW55M2QgJiYgdGhpcy5vcHRpb25zLnpvb21BbmltYXRpb247XHJcblx0XHR0aGlzLl9pc09wZW4gPSBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cclxuXHRcdGlmICghdGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHRoaXMuX2luaXRMYXlvdXQoKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgYW5pbUZhZGUgPSBtYXAub3B0aW9ucy5mYWRlQW5pbWF0aW9uO1xyXG5cclxuXHRcdGlmIChhbmltRmFkZSkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9jb250YWluZXIsIDApO1xyXG5cdFx0fVxyXG5cdFx0bWFwLl9wYW5lcy5wb3B1cFBhbmUuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRtYXAub24odGhpcy5fZ2V0RXZlbnRzKCksIHRoaXMpO1xyXG5cclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblxyXG5cdFx0aWYgKGFuaW1GYWRlKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5zZXRPcGFjaXR5KHRoaXMuX2NvbnRhaW5lciwgMSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdvcGVuJyk7XHJcblxyXG5cdFx0bWFwLmZpcmUoJ3BvcHVwb3BlbicsIHtwb3B1cDogdGhpc30pO1xyXG5cclxuXHRcdGlmICh0aGlzLl9zb3VyY2UpIHtcclxuXHRcdFx0dGhpcy5fc291cmNlLmZpcmUoJ3BvcHVwb3BlbicsIHtwb3B1cDogdGhpc30pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAuYWRkTGF5ZXIodGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRvcGVuT246IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5vcGVuUG9wdXAodGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLl9wYW5lcy5wb3B1cFBhbmUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRMLlV0aWwuZmFsc2VGbih0aGlzLl9jb250YWluZXIub2Zmc2V0V2lkdGgpOyAvLyBmb3JjZSByZWZsb3dcclxuXHJcblx0XHRtYXAub2ZmKHRoaXMuX2dldEV2ZW50cygpLCB0aGlzKTtcclxuXHJcblx0XHRpZiAobWFwLm9wdGlvbnMuZmFkZUFuaW1hdGlvbikge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9jb250YWluZXIsIDApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblxyXG5cdFx0dGhpcy5maXJlKCdjbG9zZScpO1xyXG5cclxuXHRcdG1hcC5maXJlKCdwb3B1cGNsb3NlJywge3BvcHVwOiB0aGlzfSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3NvdXJjZSkge1xyXG5cdFx0XHR0aGlzLl9zb3VyY2UuZmlyZSgncG9wdXBjbG9zZScsIHtwb3B1cDogdGhpc30pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldExhdExuZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2xhdGxuZztcclxuXHR9LFxyXG5cclxuXHRzZXRMYXRMbmc6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHRoaXMuX2xhdGxuZyA9IEwubGF0TG5nKGxhdGxuZyk7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVBvc2l0aW9uKCk7XHJcblx0XHRcdHRoaXMuX2FkanVzdFBhbigpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0Q29udGVudDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRlbnQ7XHJcblx0fSxcclxuXHJcblx0c2V0Q29udGVudDogZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdHRoaXMuX2NvbnRlbnQgPSBjb250ZW50O1xyXG5cdFx0dGhpcy51cGRhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcclxuXHJcblx0XHR0aGlzLl91cGRhdGVDb250ZW50KCk7XHJcblx0XHR0aGlzLl91cGRhdGVMYXlvdXQoKTtcclxuXHRcdHRoaXMuX3VwZGF0ZVBvc2l0aW9uKCk7XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcclxuXHJcblx0XHR0aGlzLl9hZGp1c3RQYW4oKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0RXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgZXZlbnRzID0ge1xyXG5cdFx0XHR2aWV3cmVzZXQ6IHRoaXMuX3VwZGF0ZVBvc2l0aW9uXHJcblx0XHR9O1xyXG5cclxuXHRcdGlmICh0aGlzLl9hbmltYXRlZCkge1xyXG5cdFx0XHRldmVudHMuem9vbWFuaW0gPSB0aGlzLl96b29tQW5pbWF0aW9uO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCdjbG9zZU9uQ2xpY2snIGluIHRoaXMub3B0aW9ucyA/IHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgOiB0aGlzLl9tYXAub3B0aW9ucy5jbG9zZVBvcHVwT25DbGljaykge1xyXG5cdFx0XHRldmVudHMucHJlY2xpY2sgPSB0aGlzLl9jbG9zZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMua2VlcEluVmlldykge1xyXG5cdFx0XHRldmVudHMubW92ZWVuZCA9IHRoaXMuX2FkanVzdFBhbjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZXZlbnRzO1xyXG5cdH0sXHJcblxyXG5cdF9jbG9zZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9tYXAuY2xvc2VQb3B1cCh0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfaW5pdExheW91dDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHByZWZpeCA9ICdsZWFmbGV0LXBvcHVwJyxcclxuXHRcdFx0Y29udGFpbmVyQ2xhc3MgPSBwcmVmaXggKyAnICcgKyB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lICsgJyBsZWFmbGV0LXpvb20tJyArXHJcblx0XHRcdCAgICAgICAgKHRoaXMuX2FuaW1hdGVkID8gJ2FuaW1hdGVkJyA6ICdoaWRlJyksXHJcblx0XHRcdGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNvbnRhaW5lckNsYXNzKSxcclxuXHRcdFx0Y2xvc2VCdXR0b247XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5jbG9zZUJ1dHRvbikge1xyXG5cdFx0XHRjbG9zZUJ1dHRvbiA9IHRoaXMuX2Nsb3NlQnV0dG9uID1cclxuXHRcdFx0ICAgICAgICBMLkRvbVV0aWwuY3JlYXRlKCdhJywgcHJlZml4ICsgJy1jbG9zZS1idXR0b24nLCBjb250YWluZXIpO1xyXG5cdFx0XHRjbG9zZUJ1dHRvbi5ocmVmID0gJyNjbG9zZSc7XHJcblx0XHRcdGNsb3NlQnV0dG9uLmlubmVySFRNTCA9ICcmIzIxNTsnO1xyXG5cdFx0XHRMLkRvbUV2ZW50LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKGNsb3NlQnV0dG9uKTtcclxuXHJcblx0XHRcdEwuRG9tRXZlbnQub24oY2xvc2VCdXR0b24sICdjbGljaycsIHRoaXMuX29uQ2xvc2VCdXR0b25DbGljaywgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHdyYXBwZXIgPSB0aGlzLl93cmFwcGVyID1cclxuXHRcdCAgICAgICAgTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgcHJlZml4ICsgJy1jb250ZW50LXdyYXBwZXInLCBjb250YWluZXIpO1xyXG5cdFx0TC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih3cmFwcGVyKTtcclxuXHJcblx0XHR0aGlzLl9jb250ZW50Tm9kZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIHByZWZpeCArICctY29udGVudCcsIHdyYXBwZXIpO1xyXG5cclxuXHRcdEwuRG9tRXZlbnQuZGlzYWJsZVNjcm9sbFByb3BhZ2F0aW9uKHRoaXMuX2NvbnRlbnROb2RlKTtcclxuXHRcdEwuRG9tRXZlbnQub24od3JhcHBlciwgJ2NvbnRleHRtZW51JywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xyXG5cclxuXHRcdHRoaXMuX3RpcENvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIHByZWZpeCArICctdGlwLWNvbnRhaW5lcicsIGNvbnRhaW5lcik7XHJcblx0XHR0aGlzLl90aXAgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBwcmVmaXggKyAnLXRpcCcsIHRoaXMuX3RpcENvbnRhaW5lcik7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZUNvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fY29udGVudCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRlbnQgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHRoaXMuX2NvbnRlbnROb2RlLmlubmVySFRNTCA9IHRoaXMuX2NvbnRlbnQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR3aGlsZSAodGhpcy5fY29udGVudE5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XHJcblx0XHRcdFx0dGhpcy5fY29udGVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGVudE5vZGUuZmlyc3RDaGlsZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5fY29udGVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fY29udGVudCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmZpcmUoJ2NvbnRlbnR1cGRhdGUnKTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlTGF5b3V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGVudE5vZGUsXHJcblx0XHQgICAgc3R5bGUgPSBjb250YWluZXIuc3R5bGU7XHJcblxyXG5cdFx0c3R5bGUud2lkdGggPSAnJztcclxuXHRcdHN0eWxlLndoaXRlU3BhY2UgPSAnbm93cmFwJztcclxuXHJcblx0XHR2YXIgd2lkdGggPSBjb250YWluZXIub2Zmc2V0V2lkdGg7XHJcblx0XHR3aWR0aCA9IE1hdGgubWluKHdpZHRoLCB0aGlzLm9wdGlvbnMubWF4V2lkdGgpO1xyXG5cdFx0d2lkdGggPSBNYXRoLm1heCh3aWR0aCwgdGhpcy5vcHRpb25zLm1pbldpZHRoKTtcclxuXHJcblx0XHRzdHlsZS53aWR0aCA9ICh3aWR0aCArIDEpICsgJ3B4JztcclxuXHRcdHN0eWxlLndoaXRlU3BhY2UgPSAnJztcclxuXHJcblx0XHRzdHlsZS5oZWlnaHQgPSAnJztcclxuXHJcblx0XHR2YXIgaGVpZ2h0ID0gY29udGFpbmVyLm9mZnNldEhlaWdodCxcclxuXHRcdCAgICBtYXhIZWlnaHQgPSB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0LFxyXG5cdFx0ICAgIHNjcm9sbGVkQ2xhc3MgPSAnbGVhZmxldC1wb3B1cC1zY3JvbGxlZCc7XHJcblxyXG5cdFx0aWYgKG1heEhlaWdodCAmJiBoZWlnaHQgPiBtYXhIZWlnaHQpIHtcclxuXHRcdFx0c3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4JztcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKGNvbnRhaW5lciwgc2Nyb2xsZWRDbGFzcyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoY29udGFpbmVyLCBzY3JvbGxlZENsYXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXJXaWR0aCA9IHRoaXMuX2NvbnRhaW5lci5vZmZzZXRXaWR0aDtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2xhdGxuZyksXHJcblx0XHQgICAgYW5pbWF0ZWQgPSB0aGlzLl9hbmltYXRlZCxcclxuXHRcdCAgICBvZmZzZXQgPSBMLnBvaW50KHRoaXMub3B0aW9ucy5vZmZzZXQpO1xyXG5cclxuXHRcdGlmIChhbmltYXRlZCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY29udGFpbmVyLCBwb3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lckJvdHRvbSA9IC1vZmZzZXQueSAtIChhbmltYXRlZCA/IDAgOiBwb3MueSk7XHJcblx0XHR0aGlzLl9jb250YWluZXJMZWZ0ID0gLU1hdGgucm91bmQodGhpcy5fY29udGFpbmVyV2lkdGggLyAyKSArIG9mZnNldC54ICsgKGFuaW1hdGVkID8gMCA6IHBvcy54KTtcclxuXHJcblx0XHQvLyBib3R0b20gcG9zaXRpb24gdGhlIHBvcHVwIGluIGNhc2UgdGhlIGhlaWdodCBvZiB0aGUgcG9wdXAgY2hhbmdlcyAoaW1hZ2VzIGxvYWRpbmcgZXRjKVxyXG5cdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLmJvdHRvbSA9IHRoaXMuX2NvbnRhaW5lckJvdHRvbSArICdweCc7XHJcblx0XHR0aGlzLl9jb250YWluZXIuc3R5bGUubGVmdCA9IHRoaXMuX2NvbnRhaW5lckxlZnQgKyAncHgnO1xyXG5cdH0sXHJcblxyXG5cdF96b29tQW5pbWF0aW9uOiBmdW5jdGlvbiAob3B0KSB7XHJcblx0XHR2YXIgcG9zID0gdGhpcy5fbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQodGhpcy5fbGF0bG5nLCBvcHQuem9vbSwgb3B0LmNlbnRlcik7XHJcblxyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NvbnRhaW5lciwgcG9zKTtcclxuXHR9LFxyXG5cclxuXHRfYWRqdXN0UGFuOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5hdXRvUGFuKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgY29udGFpbmVySGVpZ2h0ID0gdGhpcy5fY29udGFpbmVyLm9mZnNldEhlaWdodCxcclxuXHRcdCAgICBjb250YWluZXJXaWR0aCA9IHRoaXMuX2NvbnRhaW5lcldpZHRoLFxyXG5cclxuXHRcdCAgICBsYXllclBvcyA9IG5ldyBMLlBvaW50KHRoaXMuX2NvbnRhaW5lckxlZnQsIC1jb250YWluZXJIZWlnaHQgLSB0aGlzLl9jb250YWluZXJCb3R0b20pO1xyXG5cclxuXHRcdGlmICh0aGlzLl9hbmltYXRlZCkge1xyXG5cdFx0XHRsYXllclBvcy5fYWRkKEwuRG9tVXRpbC5nZXRQb3NpdGlvbih0aGlzLl9jb250YWluZXIpKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY29udGFpbmVyUG9zID0gbWFwLmxheWVyUG9pbnRUb0NvbnRhaW5lclBvaW50KGxheWVyUG9zKSxcclxuXHRcdCAgICBwYWRkaW5nID0gTC5wb2ludCh0aGlzLm9wdGlvbnMuYXV0b1BhblBhZGRpbmcpLFxyXG5cdFx0ICAgIHBhZGRpbmdUTCA9IEwucG9pbnQodGhpcy5vcHRpb25zLmF1dG9QYW5QYWRkaW5nVG9wTGVmdCB8fCBwYWRkaW5nKSxcclxuXHRcdCAgICBwYWRkaW5nQlIgPSBMLnBvaW50KHRoaXMub3B0aW9ucy5hdXRvUGFuUGFkZGluZ0JvdHRvbVJpZ2h0IHx8IHBhZGRpbmcpLFxyXG5cdFx0ICAgIHNpemUgPSBtYXAuZ2V0U2l6ZSgpLFxyXG5cdFx0ICAgIGR4ID0gMCxcclxuXHRcdCAgICBkeSA9IDA7XHJcblxyXG5cdFx0aWYgKGNvbnRhaW5lclBvcy54ICsgY29udGFpbmVyV2lkdGggKyBwYWRkaW5nQlIueCA+IHNpemUueCkgeyAvLyByaWdodFxyXG5cdFx0XHRkeCA9IGNvbnRhaW5lclBvcy54ICsgY29udGFpbmVyV2lkdGggLSBzaXplLnggKyBwYWRkaW5nQlIueDtcclxuXHRcdH1cclxuXHRcdGlmIChjb250YWluZXJQb3MueCAtIGR4IC0gcGFkZGluZ1RMLnggPCAwKSB7IC8vIGxlZnRcclxuXHRcdFx0ZHggPSBjb250YWluZXJQb3MueCAtIHBhZGRpbmdUTC54O1xyXG5cdFx0fVxyXG5cdFx0aWYgKGNvbnRhaW5lclBvcy55ICsgY29udGFpbmVySGVpZ2h0ICsgcGFkZGluZ0JSLnkgPiBzaXplLnkpIHsgLy8gYm90dG9tXHJcblx0XHRcdGR5ID0gY29udGFpbmVyUG9zLnkgKyBjb250YWluZXJIZWlnaHQgLSBzaXplLnkgKyBwYWRkaW5nQlIueTtcclxuXHRcdH1cclxuXHRcdGlmIChjb250YWluZXJQb3MueSAtIGR5IC0gcGFkZGluZ1RMLnkgPCAwKSB7IC8vIHRvcFxyXG5cdFx0XHRkeSA9IGNvbnRhaW5lclBvcy55IC0gcGFkZGluZ1RMLnk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGR4IHx8IGR5KSB7XHJcblx0XHRcdG1hcFxyXG5cdFx0XHQgICAgLmZpcmUoJ2F1dG9wYW5zdGFydCcpXHJcblx0XHRcdCAgICAucGFuQnkoW2R4LCBkeV0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbkNsb3NlQnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR0aGlzLl9jbG9zZSgpO1xyXG5cdFx0TC5Eb21FdmVudC5zdG9wKGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLnBvcHVwID0gZnVuY3Rpb24gKG9wdGlvbnMsIHNvdXJjZSkge1xyXG5cdHJldHVybiBuZXcgTC5Qb3B1cChvcHRpb25zLCBzb3VyY2UpO1xyXG59O1xyXG5cclxuXHJcbkwuTWFwLmluY2x1ZGUoe1xyXG5cdG9wZW5Qb3B1cDogZnVuY3Rpb24gKHBvcHVwLCBsYXRsbmcsIG9wdGlvbnMpIHsgLy8gKFBvcHVwKSBvciAoU3RyaW5nIHx8IEhUTUxFbGVtZW50LCBMYXRMbmdbLCBPYmplY3RdKVxyXG5cdFx0dGhpcy5jbG9zZVBvcHVwKCk7XHJcblxyXG5cdFx0aWYgKCEocG9wdXAgaW5zdGFuY2VvZiBMLlBvcHVwKSkge1xyXG5cdFx0XHR2YXIgY29udGVudCA9IHBvcHVwO1xyXG5cclxuXHRcdFx0cG9wdXAgPSBuZXcgTC5Qb3B1cChvcHRpb25zKVxyXG5cdFx0XHQgICAgLnNldExhdExuZyhsYXRsbmcpXHJcblx0XHRcdCAgICAuc2V0Q29udGVudChjb250ZW50KTtcclxuXHRcdH1cclxuXHRcdHBvcHVwLl9pc09wZW4gPSB0cnVlO1xyXG5cclxuXHRcdHRoaXMuX3BvcHVwID0gcG9wdXA7XHJcblx0XHRyZXR1cm4gdGhpcy5hZGRMYXllcihwb3B1cCk7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VQb3B1cDogZnVuY3Rpb24gKHBvcHVwKSB7XHJcblx0XHRpZiAoIXBvcHVwIHx8IHBvcHVwID09PSB0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHRwb3B1cCA9IHRoaXMuX3BvcHVwO1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRpZiAocG9wdXApIHtcclxuXHRcdFx0dGhpcy5yZW1vdmVMYXllcihwb3B1cCk7XHJcblx0XHRcdHBvcHVwLl9pc09wZW4gPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBQb3B1cCBleHRlbnNpb24gdG8gTC5NYXJrZXIsIGFkZGluZyBwb3B1cC1yZWxhdGVkIG1ldGhvZHMuXHJcbiAqL1xyXG5cclxuTC5NYXJrZXIuaW5jbHVkZSh7XHJcblx0b3BlblBvcHVwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fcG9wdXAgJiYgdGhpcy5fbWFwICYmICF0aGlzLl9tYXAuaGFzTGF5ZXIodGhpcy5fcG9wdXApKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLnNldExhdExuZyh0aGlzLl9sYXRsbmcpO1xyXG5cdFx0XHR0aGlzLl9tYXAub3BlblBvcHVwKHRoaXMuX3BvcHVwKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRjbG9zZVBvcHVwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fcG9wdXApIHtcclxuXHRcdFx0dGhpcy5fcG9wdXAuX2Nsb3NlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHR0b2dnbGVQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdGlmICh0aGlzLl9wb3B1cC5faXNPcGVuKSB7XHJcblx0XHRcdFx0dGhpcy5jbG9zZVBvcHVwKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5vcGVuUG9wdXAoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YmluZFBvcHVwOiBmdW5jdGlvbiAoY29udGVudCwgb3B0aW9ucykge1xyXG5cdFx0dmFyIGFuY2hvciA9IEwucG9pbnQodGhpcy5vcHRpb25zLmljb24ub3B0aW9ucy5wb3B1cEFuY2hvciB8fCBbMCwgMF0pO1xyXG5cclxuXHRcdGFuY2hvciA9IGFuY2hvci5hZGQoTC5Qb3B1cC5wcm90b3R5cGUub3B0aW9ucy5vZmZzZXQpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMub2Zmc2V0KSB7XHJcblx0XHRcdGFuY2hvciA9IGFuY2hvci5hZGQob3B0aW9ucy5vZmZzZXQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9wdGlvbnMgPSBMLmV4dGVuZCh7b2Zmc2V0OiBhbmNob3J9LCBvcHRpb25zKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCkge1xyXG5cdFx0XHR0aGlzXHJcblx0XHRcdCAgICAub24oJ2NsaWNrJywgdGhpcy50b2dnbGVQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vbigncmVtb3ZlJywgdGhpcy5jbG9zZVBvcHVwLCB0aGlzKVxyXG5cdFx0XHQgICAgLm9uKCdtb3ZlJywgdGhpcy5fbW92ZVBvcHVwLCB0aGlzKTtcclxuXHRcdFx0dGhpcy5fcG9wdXBIYW5kbGVyc0FkZGVkID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY29udGVudCBpbnN0YW5jZW9mIEwuUG9wdXApIHtcclxuXHRcdFx0TC5zZXRPcHRpb25zKGNvbnRlbnQsIG9wdGlvbnMpO1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IGNvbnRlbnQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IG5ldyBMLlBvcHVwKG9wdGlvbnMsIHRoaXMpXHJcblx0XHRcdFx0LnNldENvbnRlbnQoY29udGVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0UG9wdXBDb250ZW50OiBmdW5jdGlvbiAoY29udGVudCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLnNldENvbnRlbnQoY29udGVudCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHR1bmJpbmRQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwID0gbnVsbDtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLm9mZignY2xpY2snLCB0aGlzLnRvZ2dsZVBvcHVwLCB0aGlzKVxyXG5cdFx0XHQgICAgLm9mZigncmVtb3ZlJywgdGhpcy5jbG9zZVBvcHVwLCB0aGlzKVxyXG5cdFx0XHQgICAgLm9mZignbW92ZScsIHRoaXMuX21vdmVQb3B1cCwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0UG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9wb3B1cDtcclxuXHR9LFxyXG5cclxuXHRfbW92ZVBvcHVwOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fcG9wdXAuc2V0TGF0TG5nKGUubGF0bG5nKTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogTC5MYXllckdyb3VwIGlzIGEgY2xhc3MgdG8gY29tYmluZSBzZXZlcmFsIGxheWVycyBpbnRvIG9uZSBzbyB0aGF0XHJcbiAqIHlvdSBjYW4gbWFuaXB1bGF0ZSB0aGUgZ3JvdXAgKGUuZy4gYWRkL3JlbW92ZSBpdCkgYXMgb25lIGxheWVyLlxyXG4gKi9cclxuXHJcbkwuTGF5ZXJHcm91cCA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF5ZXJzKSB7XHJcblx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHJcblx0XHR2YXIgaSwgbGVuO1xyXG5cclxuXHRcdGlmIChsYXllcnMpIHtcclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5hZGRMYXllcihsYXllcnNbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0YWRkTGF5ZXI6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0dmFyIGlkID0gdGhpcy5nZXRMYXllcklkKGxheWVyKTtcclxuXHJcblx0XHR0aGlzLl9sYXllcnNbaWRdID0gbGF5ZXI7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9tYXAuYWRkTGF5ZXIobGF5ZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IGxheWVyIGluIHRoaXMuX2xheWVycyA/IGxheWVyIDogdGhpcy5nZXRMYXllcklkKGxheWVyKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbWFwICYmIHRoaXMuX2xheWVyc1tpZF0pIHtcclxuXHRcdFx0dGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX2xheWVyc1tpZF0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGRlbGV0ZSB0aGlzLl9sYXllcnNbaWRdO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGhhc0xheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdGlmICghbGF5ZXIpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cdFx0cmV0dXJuIChsYXllciBpbiB0aGlzLl9sYXllcnMgfHwgdGhpcy5nZXRMYXllcklkKGxheWVyKSBpbiB0aGlzLl9sYXllcnMpO1xyXG5cdH0sXHJcblxyXG5cdGNsZWFyTGF5ZXJzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLmVhY2hMYXllcih0aGlzLnJlbW92ZUxheWVyLCB0aGlzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGludm9rZTogZnVuY3Rpb24gKG1ldGhvZE5hbWUpIHtcclxuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuXHRcdCAgICBpLCBsYXllcjtcclxuXHJcblx0XHRmb3IgKGkgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdGxheWVyID0gdGhpcy5fbGF5ZXJzW2ldO1xyXG5cclxuXHRcdFx0aWYgKGxheWVyW21ldGhvZE5hbWVdKSB7XHJcblx0XHRcdFx0bGF5ZXJbbWV0aG9kTmFtZV0uYXBwbHkobGF5ZXIsIGFyZ3MpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHRcdHRoaXMuZWFjaExheWVyKG1hcC5hZGRMYXllciwgbWFwKTtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5lYWNoTGF5ZXIobWFwLnJlbW92ZUxheWVyLCBtYXApO1xyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0ZWFjaExheWVyOiBmdW5jdGlvbiAobWV0aG9kLCBjb250ZXh0KSB7XHJcblx0XHRmb3IgKHZhciBpIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRtZXRob2QuY2FsbChjb250ZXh0LCB0aGlzLl9sYXllcnNbaV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0TGF5ZXI6IGZ1bmN0aW9uIChpZCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2xheWVyc1tpZF07XHJcblx0fSxcclxuXHJcblx0Z2V0TGF5ZXJzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbGF5ZXJzID0gW107XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl9sYXllcnMpIHtcclxuXHRcdFx0bGF5ZXJzLnB1c2godGhpcy5fbGF5ZXJzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBsYXllcnM7XHJcblx0fSxcclxuXHJcblx0c2V0WkluZGV4OiBmdW5jdGlvbiAoekluZGV4KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5pbnZva2UoJ3NldFpJbmRleCcsIHpJbmRleCk7XHJcblx0fSxcclxuXHJcblx0Z2V0TGF5ZXJJZDogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRyZXR1cm4gTC5zdGFtcChsYXllcik7XHJcblx0fVxyXG59KTtcclxuXHJcbkwubGF5ZXJHcm91cCA9IGZ1bmN0aW9uIChsYXllcnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuTGF5ZXJHcm91cChsYXllcnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5GZWF0dXJlR3JvdXAgZXh0ZW5kcyBMLkxheWVyR3JvdXAgYnkgaW50cm9kdWNpbmcgbW91c2UgZXZlbnRzIGFuZCBhZGRpdGlvbmFsIG1ldGhvZHNcclxuICogc2hhcmVkIGJldHdlZW4gYSBncm91cCBvZiBpbnRlcmFjdGl2ZSBsYXllcnMgKGxpa2UgdmVjdG9ycyBvciBtYXJrZXJzKS5cclxuICovXHJcblxyXG5MLkZlYXR1cmVHcm91cCA9IEwuTGF5ZXJHcm91cC5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0c3RhdGljczoge1xyXG5cdFx0RVZFTlRTOiAnY2xpY2sgZGJsY2xpY2sgbW91c2VvdmVyIG1vdXNlb3V0IG1vdXNlbW92ZSBjb250ZXh0bWVudSBwb3B1cG9wZW4gcG9wdXBjbG9zZSdcclxuXHR9LFxyXG5cclxuXHRhZGRMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAodGhpcy5oYXNMYXllcihsYXllcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCdvbicgaW4gbGF5ZXIpIHtcclxuXHRcdFx0bGF5ZXIub24oTC5GZWF0dXJlR3JvdXAuRVZFTlRTLCB0aGlzLl9wcm9wYWdhdGVFdmVudCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0TC5MYXllckdyb3VwLnByb3RvdHlwZS5hZGRMYXllci5jYWxsKHRoaXMsIGxheWVyKTtcclxuXHJcblx0XHRpZiAodGhpcy5fcG9wdXBDb250ZW50ICYmIGxheWVyLmJpbmRQb3B1cCkge1xyXG5cdFx0XHRsYXllci5iaW5kUG9wdXAodGhpcy5fcG9wdXBDb250ZW50LCB0aGlzLl9wb3B1cE9wdGlvbnMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ2xheWVyYWRkJywge2xheWVyOiBsYXllcn0pO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdGlmICghdGhpcy5oYXNMYXllcihsYXllcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblx0XHRpZiAobGF5ZXIgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdGxheWVyID0gdGhpcy5fbGF5ZXJzW2xheWVyXTtcclxuXHRcdH1cclxuXHJcblx0XHRsYXllci5vZmYoTC5GZWF0dXJlR3JvdXAuRVZFTlRTLCB0aGlzLl9wcm9wYWdhdGVFdmVudCwgdGhpcyk7XHJcblxyXG5cdFx0TC5MYXllckdyb3VwLnByb3RvdHlwZS5yZW1vdmVMYXllci5jYWxsKHRoaXMsIGxheWVyKTtcclxuXHJcblx0XHRpZiAodGhpcy5fcG9wdXBDb250ZW50KSB7XHJcblx0XHRcdHRoaXMuaW52b2tlKCd1bmJpbmRQb3B1cCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ2xheWVycmVtb3ZlJywge2xheWVyOiBsYXllcn0pO1xyXG5cdH0sXHJcblxyXG5cdGJpbmRQb3B1cDogZnVuY3Rpb24gKGNvbnRlbnQsIG9wdGlvbnMpIHtcclxuXHRcdHRoaXMuX3BvcHVwQ29udGVudCA9IGNvbnRlbnQ7XHJcblx0XHR0aGlzLl9wb3B1cE9wdGlvbnMgPSBvcHRpb25zO1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdiaW5kUG9wdXAnLCBjb250ZW50LCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRvcGVuUG9wdXA6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdC8vIG9wZW4gcG9wdXAgb24gdGhlIGZpcnN0IGxheWVyXHJcblx0XHRmb3IgKHZhciBpZCBpbiB0aGlzLl9sYXllcnMpIHtcclxuXHRcdFx0dGhpcy5fbGF5ZXJzW2lkXS5vcGVuUG9wdXAobGF0bG5nKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRTdHlsZTogZnVuY3Rpb24gKHN0eWxlKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5pbnZva2UoJ3NldFN0eWxlJywgc3R5bGUpO1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9Gcm9udDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdicmluZ1RvRnJvbnQnKTtcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvQmFjazogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdicmluZ1RvQmFjaycpO1xyXG5cdH0sXHJcblxyXG5cdGdldEJvdW5kczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGJvdW5kcyA9IG5ldyBMLkxhdExuZ0JvdW5kcygpO1xyXG5cclxuXHRcdHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0XHRib3VuZHMuZXh0ZW5kKGxheWVyIGluc3RhbmNlb2YgTC5NYXJrZXIgPyBsYXllci5nZXRMYXRMbmcoKSA6IGxheWVyLmdldEJvdW5kcygpKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBib3VuZHM7XHJcblx0fSxcclxuXHJcblx0X3Byb3BhZ2F0ZUV2ZW50OiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0ZSA9IEwuZXh0ZW5kKHtcclxuXHRcdFx0bGF5ZXI6IGUudGFyZ2V0LFxyXG5cdFx0XHR0YXJnZXQ6IHRoaXNcclxuXHRcdH0sIGUpO1xyXG5cdFx0dGhpcy5maXJlKGUudHlwZSwgZSk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuZmVhdHVyZUdyb3VwID0gZnVuY3Rpb24gKGxheWVycykge1xyXG5cdHJldHVybiBuZXcgTC5GZWF0dXJlR3JvdXAobGF5ZXJzKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuUGF0aCBpcyBhIGJhc2UgY2xhc3MgZm9yIHJlbmRlcmluZyB2ZWN0b3IgcGF0aHMgb24gYSBtYXAuIEluaGVyaXRlZCBieSBQb2x5bGluZSwgQ2lyY2xlLCBldGMuXHJcbiAqL1xyXG5cclxuTC5QYXRoID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBbTC5NaXhpbi5FdmVudHNdLFxyXG5cclxuXHRzdGF0aWNzOiB7XHJcblx0XHQvLyBob3cgbXVjaCB0byBleHRlbmQgdGhlIGNsaXAgYXJlYSBhcm91bmQgdGhlIG1hcCB2aWV3XHJcblx0XHQvLyAocmVsYXRpdmUgdG8gaXRzIHNpemUsIGUuZy4gMC41IGlzIGhhbGYgdGhlIHNjcmVlbiBpbiBlYWNoIGRpcmVjdGlvbilcclxuXHRcdC8vIHNldCBpdCBzbyB0aGF0IFNWRyBlbGVtZW50IGRvZXNuJ3QgZXhjZWVkIDEyODBweCAodmVjdG9ycyBmbGlja2VyIG9uIGRyYWdlbmQgaWYgaXQgaXMpXHJcblx0XHRDTElQX1BBRERJTkc6IChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHZhciBtYXggPSBMLkJyb3dzZXIubW9iaWxlID8gMTI4MCA6IDIwMDAsXHJcblx0XHRcdCAgICB0YXJnZXQgPSAobWF4IC8gTWF0aC5tYXgod2luZG93Lm91dGVyV2lkdGgsIHdpbmRvdy5vdXRlckhlaWdodCkgLSAxKSAvIDI7XHJcblx0XHRcdHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigwLjUsIHRhcmdldCkpO1xyXG5cdFx0fSkoKVxyXG5cdH0sXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdHN0cm9rZTogdHJ1ZSxcclxuXHRcdGNvbG9yOiAnIzAwMzNmZicsXHJcblx0XHRkYXNoQXJyYXk6IG51bGwsXHJcblx0XHRsaW5lQ2FwOiBudWxsLFxyXG5cdFx0bGluZUpvaW46IG51bGwsXHJcblx0XHR3ZWlnaHQ6IDUsXHJcblx0XHRvcGFjaXR5OiAwLjUsXHJcblxyXG5cdFx0ZmlsbDogZmFsc2UsXHJcblx0XHRmaWxsQ29sb3I6IG51bGwsIC8vc2FtZSBhcyBjb2xvciBieSBkZWZhdWx0XHJcblx0XHRmaWxsT3BhY2l0eTogMC4yLFxyXG5cclxuXHRcdGNsaWNrYWJsZTogdHJ1ZVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl9pbml0RWxlbWVudHMoKTtcclxuXHRcdFx0dGhpcy5faW5pdEV2ZW50cygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMucHJvamVjdExhdGxuZ3MoKTtcclxuXHRcdHRoaXMuX3VwZGF0ZVBhdGgoKTtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHRoaXMuX21hcC5fcGF0aFJvb3QuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmZpcmUoJ2FkZCcpO1xyXG5cclxuXHRcdG1hcC5vbih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLnByb2plY3RMYXRsbmdzLFxyXG5cdFx0XHQnbW92ZWVuZCc6IHRoaXMuX3VwZGF0ZVBhdGhcclxuXHRcdH0sIHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAuYWRkTGF5ZXIodGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLl9wYXRoUm9vdC5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdC8vIE5lZWQgdG8gZmlyZSByZW1vdmUgZXZlbnQgYmVmb3JlIHdlIHNldCBfbWFwIHRvIG51bGwgYXMgdGhlIGV2ZW50IGhvb2tzIG1pZ2h0IG5lZWQgdGhlIG9iamVjdFxyXG5cdFx0dGhpcy5maXJlKCdyZW1vdmUnKTtcclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci52bWwpIHtcclxuXHRcdFx0dGhpcy5fY29udGFpbmVyID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fc3Ryb2tlID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fZmlsbCA9IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0bWFwLm9mZih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLnByb2plY3RMYXRsbmdzLFxyXG5cdFx0XHQnbW92ZWVuZCc6IHRoaXMuX3VwZGF0ZVBhdGhcclxuXHRcdH0sIHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdHByb2plY3RMYXRsbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHQvLyBkbyBhbGwgcHJvamVjdGlvbiBzdHVmZiBoZXJlXHJcblx0fSxcclxuXHJcblx0c2V0U3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIHN0eWxlKTtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVN0eWxlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVkcmF3OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMucHJvamVjdExhdGxuZ3MoKTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlUGF0aCgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuTWFwLmluY2x1ZGUoe1xyXG5cdF91cGRhdGVQYXRoVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwID0gTC5QYXRoLkNMSVBfUEFERElORyxcclxuXHRcdCAgICBzaXplID0gdGhpcy5nZXRTaXplKCksXHJcblx0XHQgICAgcGFuZVBvcyA9IEwuRG9tVXRpbC5nZXRQb3NpdGlvbih0aGlzLl9tYXBQYW5lKSxcclxuXHRcdCAgICBtaW4gPSBwYW5lUG9zLm11bHRpcGx5QnkoLTEpLl9zdWJ0cmFjdChzaXplLm11bHRpcGx5QnkocCkuX3JvdW5kKCkpLFxyXG5cdFx0ICAgIG1heCA9IG1pbi5hZGQoc2l6ZS5tdWx0aXBseUJ5KDEgKyBwICogMikuX3JvdW5kKCkpO1xyXG5cclxuXHRcdHRoaXMuX3BhdGhWaWV3cG9ydCA9IG5ldyBMLkJvdW5kcyhtaW4sIG1heCk7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEV4dGVuZHMgTC5QYXRoIHdpdGggU1ZHLXNwZWNpZmljIHJlbmRlcmluZyBjb2RlLlxyXG4gKi9cclxuXHJcbkwuUGF0aC5TVkdfTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xyXG5cclxuTC5Ccm93c2VyLnN2ZyA9ICEhKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAmJiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoTC5QYXRoLlNWR19OUywgJ3N2ZycpLmNyZWF0ZVNWR1JlY3QpO1xyXG5cclxuTC5QYXRoID0gTC5QYXRoLmV4dGVuZCh7XHJcblx0c3RhdGljczoge1xyXG5cdFx0U1ZHOiBMLkJyb3dzZXIuc3ZnXHJcblx0fSxcclxuXHJcblx0YnJpbmdUb0Zyb250OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcm9vdCA9IHRoaXMuX21hcC5fcGF0aFJvb3QsXHJcblx0XHQgICAgcGF0aCA9IHRoaXMuX2NvbnRhaW5lcjtcclxuXHJcblx0XHRpZiAocGF0aCAmJiByb290Lmxhc3RDaGlsZCAhPT0gcGF0aCkge1xyXG5cdFx0XHRyb290LmFwcGVuZENoaWxkKHBhdGgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YnJpbmdUb0JhY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciByb290ID0gdGhpcy5fbWFwLl9wYXRoUm9vdCxcclxuXHRcdCAgICBwYXRoID0gdGhpcy5fY29udGFpbmVyLFxyXG5cdFx0ICAgIGZpcnN0ID0gcm9vdC5maXJzdENoaWxkO1xyXG5cclxuXHRcdGlmIChwYXRoICYmIGZpcnN0ICE9PSBwYXRoKSB7XHJcblx0XHRcdHJvb3QuaW5zZXJ0QmVmb3JlKHBhdGgsIGZpcnN0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldFBhdGhTdHJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdC8vIGZvcm0gcGF0aCBzdHJpbmcgaGVyZVxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSkge1xyXG5cdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhMLlBhdGguU1ZHX05TLCBuYW1lKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdEVsZW1lbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9tYXAuX2luaXRQYXRoUm9vdCgpO1xyXG5cdFx0dGhpcy5faW5pdFBhdGgoKTtcclxuXHRcdHRoaXMuX2luaXRTdHlsZSgpO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0UGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyID0gdGhpcy5fY3JlYXRlRWxlbWVudCgnZycpO1xyXG5cclxuXHRcdHRoaXMuX3BhdGggPSB0aGlzLl9jcmVhdGVFbGVtZW50KCdwYXRoJyk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5jbGFzc05hbWUpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3BhdGgsIHRoaXMub3B0aW9ucy5jbGFzc05hbWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9wYXRoKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdFN0eWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0cm9rZSkge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWxpbmVqb2luJywgJ3JvdW5kJyk7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtbGluZWNhcCcsICdyb3VuZCcpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5maWxsKSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdmaWxsLXJ1bGUnLCAnZXZlbm9kZCcpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5wb2ludGVyRXZlbnRzKSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdwb2ludGVyLWV2ZW50cycsIHRoaXMub3B0aW9ucy5wb2ludGVyRXZlbnRzKTtcclxuXHRcdH1cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmNsaWNrYWJsZSAmJiAhdGhpcy5vcHRpb25zLnBvaW50ZXJFdmVudHMpIHtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX3VwZGF0ZVN0eWxlKCk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVN0eWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0cm9rZSkge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgdGhpcy5vcHRpb25zLmNvbG9yKTtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS1vcGFjaXR5JywgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgdGhpcy5vcHRpb25zLndlaWdodCk7XHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuZGFzaEFycmF5KSB7XHJcblx0XHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS1kYXNoYXJyYXknLCB0aGlzLm9wdGlvbnMuZGFzaEFycmF5KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl9wYXRoLnJlbW92ZUF0dHJpYnV0ZSgnc3Ryb2tlLWRhc2hhcnJheScpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMubGluZUNhcCkge1xyXG5cdFx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtbGluZWNhcCcsIHRoaXMub3B0aW9ucy5saW5lQ2FwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmxpbmVKb2luKSB7XHJcblx0XHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS1saW5lam9pbicsIHRoaXMub3B0aW9ucy5saW5lSm9pbik7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UnLCAnbm9uZScpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5maWxsKSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdmaWxsJywgdGhpcy5vcHRpb25zLmZpbGxDb2xvciB8fCB0aGlzLm9wdGlvbnMuY29sb3IpO1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbC1vcGFjaXR5JywgdGhpcy5vcHRpb25zLmZpbGxPcGFjaXR5KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdmaWxsJywgJ25vbmUnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlUGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHN0ciA9IHRoaXMuZ2V0UGF0aFN0cmluZygpO1xyXG5cdFx0aWYgKCFzdHIpIHtcclxuXHRcdFx0Ly8gZml4IHdlYmtpdCBlbXB0eSBzdHJpbmcgcGFyc2luZyBidWdcclxuXHRcdFx0c3RyID0gJ00wIDAnO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ2QnLCBzdHIpO1xyXG5cdH0sXHJcblxyXG5cdC8vIFRPRE8gcmVtb3ZlIGR1cGxpY2F0aW9uIHdpdGggTC5NYXBcclxuXHRfaW5pdEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5jbGlja2FibGUpIHtcclxuXHRcdFx0aWYgKEwuQnJvd3Nlci5zdmcgfHwgIUwuQnJvd3Nlci52bWwpIHtcclxuXHRcdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fcGF0aCwgJ2xlYWZsZXQtY2xpY2thYmxlJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdEwuRG9tRXZlbnQub24odGhpcy5fY29udGFpbmVyLCAnY2xpY2snLCB0aGlzLl9vbk1vdXNlQ2xpY2ssIHRoaXMpO1xyXG5cclxuXHRcdFx0dmFyIGV2ZW50cyA9IFsnZGJsY2xpY2snLCAnbW91c2Vkb3duJywgJ21vdXNlb3ZlcicsXHJcblx0XHRcdCAgICAgICAgICAgICAgJ21vdXNlb3V0JywgJ21vdXNlbW92ZScsICdjb250ZXh0bWVudSddO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdEwuRG9tRXZlbnQub24odGhpcy5fY29udGFpbmVyLCBldmVudHNbaV0sIHRoaXMuX2ZpcmVNb3VzZUV2ZW50LCB0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbk1vdXNlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwLmRyYWdnaW5nICYmIHRoaXMuX21hcC5kcmFnZ2luZy5tb3ZlZCgpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMuX2ZpcmVNb3VzZUV2ZW50KGUpO1xyXG5cdH0sXHJcblxyXG5cdF9maXJlTW91c2VFdmVudDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmICghdGhpcy5oYXNFdmVudExpc3RlbmVycyhlLnR5cGUpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgY29udGFpbmVyUG9pbnQgPSBtYXAubW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQoZSksXHJcblx0XHQgICAgbGF5ZXJQb2ludCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChjb250YWluZXJQb2ludCksXHJcblx0XHQgICAgbGF0bG5nID0gbWFwLmxheWVyUG9pbnRUb0xhdExuZyhsYXllclBvaW50KTtcclxuXHJcblx0XHR0aGlzLmZpcmUoZS50eXBlLCB7XHJcblx0XHRcdGxhdGxuZzogbGF0bG5nLFxyXG5cdFx0XHRsYXllclBvaW50OiBsYXllclBvaW50LFxyXG5cdFx0XHRjb250YWluZXJQb2ludDogY29udGFpbmVyUG9pbnQsXHJcblx0XHRcdG9yaWdpbmFsRXZlbnQ6IGVcclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmIChlLnR5cGUgPT09ICdjb250ZXh0bWVudScpIHtcclxuXHRcdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcclxuXHRcdH1cclxuXHRcdGlmIChlLnR5cGUgIT09ICdtb3VzZW1vdmUnKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRfaW5pdFBhdGhSb290OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX3BhdGhSb290KSB7XHJcblx0XHRcdHRoaXMuX3BhdGhSb290ID0gTC5QYXRoLnByb3RvdHlwZS5fY3JlYXRlRWxlbWVudCgnc3ZnJyk7XHJcblx0XHRcdHRoaXMuX3BhbmVzLm92ZXJsYXlQYW5lLmFwcGVuZENoaWxkKHRoaXMuX3BhdGhSb290KTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuem9vbUFuaW1hdGlvbiAmJiBMLkJyb3dzZXIuYW55M2QpIHtcclxuXHRcdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fcGF0aFJvb3QsICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnKTtcclxuXHJcblx0XHRcdFx0dGhpcy5vbih7XHJcblx0XHRcdFx0XHQnem9vbWFuaW0nOiB0aGlzLl9hbmltYXRlUGF0aFpvb20sXHJcblx0XHRcdFx0XHQnem9vbWVuZCc6IHRoaXMuX2VuZFBhdGhab29tXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3BhdGhSb290LCAnbGVhZmxldC16b29tLWhpZGUnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5vbignbW92ZWVuZCcsIHRoaXMuX3VwZGF0ZVN2Z1ZpZXdwb3J0KTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlU3ZnVmlld3BvcnQoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfYW5pbWF0ZVBhdGhab29tOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dmFyIHNjYWxlID0gdGhpcy5nZXRab29tU2NhbGUoZS56b29tKSxcclxuXHRcdCAgICBvZmZzZXQgPSB0aGlzLl9nZXRDZW50ZXJPZmZzZXQoZS5jZW50ZXIpLl9tdWx0aXBseUJ5KC1zY2FsZSkuX2FkZCh0aGlzLl9wYXRoVmlld3BvcnQubWluKTtcclxuXHJcblx0XHR0aGlzLl9wYXRoUm9vdC5zdHlsZVtMLkRvbVV0aWwuVFJBTlNGT1JNXSA9XHJcblx0XHQgICAgICAgIEwuRG9tVXRpbC5nZXRUcmFuc2xhdGVTdHJpbmcob2Zmc2V0KSArICcgc2NhbGUoJyArIHNjYWxlICsgJykgJztcclxuXHJcblx0XHR0aGlzLl9wYXRoWm9vbWluZyA9IHRydWU7XHJcblx0fSxcclxuXHJcblx0X2VuZFBhdGhab29tOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9wYXRoWm9vbWluZyA9IGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVTdmdWaWV3cG9ydDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICh0aGlzLl9wYXRoWm9vbWluZykge1xyXG5cdFx0XHQvLyBEbyBub3QgdXBkYXRlIFNWR3Mgd2hpbGUgYSB6b29tIGFuaW1hdGlvbiBpcyBnb2luZyBvbiBvdGhlcndpc2UgdGhlIGFuaW1hdGlvbiB3aWxsIGJyZWFrLlxyXG5cdFx0XHQvLyBXaGVuIHRoZSB6b29tIGFuaW1hdGlvbiBlbmRzIHdlIHdpbGwgYmUgdXBkYXRlZCBhZ2FpbiBhbnl3YXlcclxuXHRcdFx0Ly8gVGhpcyBmaXhlcyB0aGUgY2FzZSB3aGVyZSB5b3UgZG8gYSBtb21lbnR1bSBtb3ZlIGFuZCB6b29tIHdoaWxlIHRoZSBtb3ZlIGlzIHN0aWxsIG9uZ29pbmcuXHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl91cGRhdGVQYXRoVmlld3BvcnQoKTtcclxuXHJcblx0XHR2YXIgdnAgPSB0aGlzLl9wYXRoVmlld3BvcnQsXHJcblx0XHQgICAgbWluID0gdnAubWluLFxyXG5cdFx0ICAgIG1heCA9IHZwLm1heCxcclxuXHRcdCAgICB3aWR0aCA9IG1heC54IC0gbWluLngsXHJcblx0XHQgICAgaGVpZ2h0ID0gbWF4LnkgLSBtaW4ueSxcclxuXHRcdCAgICByb290ID0gdGhpcy5fcGF0aFJvb3QsXHJcblx0XHQgICAgcGFuZSA9IHRoaXMuX3BhbmVzLm92ZXJsYXlQYW5lO1xyXG5cclxuXHRcdC8vIEhhY2sgdG8gbWFrZSBmbGlja2VyIG9uIGRyYWcgZW5kIG9uIG1vYmlsZSB3ZWJraXQgbGVzcyBpcnJpdGF0aW5nXHJcblx0XHRpZiAoTC5Ccm93c2VyLm1vYmlsZVdlYmtpdCkge1xyXG5cdFx0XHRwYW5lLnJlbW92ZUNoaWxkKHJvb3QpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbihyb290LCBtaW4pO1xyXG5cdFx0cm9vdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgd2lkdGgpO1xyXG5cdFx0cm9vdC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGhlaWdodCk7XHJcblx0XHRyb290LnNldEF0dHJpYnV0ZSgndmlld0JveCcsIFttaW4ueCwgbWluLnksIHdpZHRoLCBoZWlnaHRdLmpvaW4oJyAnKSk7XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5tb2JpbGVXZWJraXQpIHtcclxuXHRcdFx0cGFuZS5hcHBlbmRDaGlsZChyb290KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogUG9wdXAgZXh0ZW5zaW9uIHRvIEwuUGF0aCAocG9seWxpbmVzLCBwb2x5Z29ucywgY2lyY2xlcyksIGFkZGluZyBwb3B1cC1yZWxhdGVkIG1ldGhvZHMuXHJcbiAqL1xyXG5cclxuTC5QYXRoLmluY2x1ZGUoe1xyXG5cclxuXHRiaW5kUG9wdXA6IGZ1bmN0aW9uIChjb250ZW50LCBvcHRpb25zKSB7XHJcblxyXG5cdFx0aWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBMLlBvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwID0gY29udGVudDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICghdGhpcy5fcG9wdXAgfHwgb3B0aW9ucykge1xyXG5cdFx0XHRcdHRoaXMuX3BvcHVwID0gbmV3IEwuUG9wdXAob3B0aW9ucywgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5fcG9wdXAuc2V0Q29udGVudChjb250ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIXRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCkge1xyXG5cdFx0XHR0aGlzXHJcblx0XHRcdCAgICAub24oJ2NsaWNrJywgdGhpcy5fb3BlblBvcHVwLCB0aGlzKVxyXG5cdFx0XHQgICAgLm9uKCdyZW1vdmUnLCB0aGlzLmNsb3NlUG9wdXAsIHRoaXMpO1xyXG5cclxuXHRcdFx0dGhpcy5fcG9wdXBIYW5kbGVyc0FkZGVkID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHR1bmJpbmRQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwID0gbnVsbDtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLm9mZignY2xpY2snLCB0aGlzLl9vcGVuUG9wdXApXHJcblx0XHRcdCAgICAub2ZmKCdyZW1vdmUnLCB0aGlzLmNsb3NlUG9wdXApO1xyXG5cclxuXHRcdFx0dGhpcy5fcG9wdXBIYW5kbGVyc0FkZGVkID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRvcGVuUG9wdXA6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHJcblx0XHRpZiAodGhpcy5fcG9wdXApIHtcclxuXHRcdFx0Ly8gb3BlbiB0aGUgcG9wdXAgZnJvbSBvbmUgb2YgdGhlIHBhdGgncyBwb2ludHMgaWYgbm90IHNwZWNpZmllZFxyXG5cdFx0XHRsYXRsbmcgPSBsYXRsbmcgfHwgdGhpcy5fbGF0bG5nIHx8XHJcblx0XHRcdCAgICAgICAgIHRoaXMuX2xhdGxuZ3NbTWF0aC5mbG9vcih0aGlzLl9sYXRsbmdzLmxlbmd0aCAvIDIpXTtcclxuXHJcblx0XHRcdHRoaXMuX29wZW5Qb3B1cCh7bGF0bG5nOiBsYXRsbmd9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRjbG9zZVBvcHVwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fcG9wdXApIHtcclxuXHRcdFx0dGhpcy5fcG9wdXAuX2Nsb3NlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfb3BlblBvcHVwOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fcG9wdXAuc2V0TGF0TG5nKGUubGF0bG5nKTtcclxuXHRcdHRoaXMuX21hcC5vcGVuUG9wdXAodGhpcy5fcG9wdXApO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBWZWN0b3IgcmVuZGVyaW5nIGZvciBJRTYtOCB0aHJvdWdoIFZNTC5cclxuICogVGhhbmtzIHRvIERtaXRyeSBCYXJhbm92c2t5IGFuZCBoaXMgUmFwaGFlbCBsaWJyYXJ5IGZvciBpbnNwaXJhdGlvbiFcclxuICovXHJcblxyXG5MLkJyb3dzZXIudm1sID0gIUwuQnJvd3Nlci5zdmcgJiYgKGZ1bmN0aW9uICgpIHtcclxuXHR0cnkge1xyXG5cdFx0dmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0ZGl2LmlubmVySFRNTCA9ICc8djpzaGFwZSBhZGo9XCIxXCIvPic7XHJcblxyXG5cdFx0dmFyIHNoYXBlID0gZGl2LmZpcnN0Q2hpbGQ7XHJcblx0XHRzaGFwZS5zdHlsZS5iZWhhdmlvciA9ICd1cmwoI2RlZmF1bHQjVk1MKSc7XHJcblxyXG5cdFx0cmV0dXJuIHNoYXBlICYmICh0eXBlb2Ygc2hhcGUuYWRqID09PSAnb2JqZWN0Jyk7XHJcblxyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn0oKSk7XHJcblxyXG5MLlBhdGggPSBMLkJyb3dzZXIuc3ZnIHx8ICFMLkJyb3dzZXIudm1sID8gTC5QYXRoIDogTC5QYXRoLmV4dGVuZCh7XHJcblx0c3RhdGljczoge1xyXG5cdFx0Vk1MOiB0cnVlLFxyXG5cdFx0Q0xJUF9QQURESU5HOiAwLjAyXHJcblx0fSxcclxuXHJcblx0X2NyZWF0ZUVsZW1lbnQ6IChmdW5jdGlvbiAoKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRkb2N1bWVudC5uYW1lc3BhY2VzLmFkZCgnbHZtbCcsICd1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOnZtbCcpO1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcclxuXHRcdFx0XHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnPGx2bWw6JyArIG5hbWUgKyAnIGNsYXNzPVwibHZtbFwiPicpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcclxuXHRcdFx0XHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0XHQgICAgICAgICc8JyArIG5hbWUgKyAnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cImx2bWxcIj4nKTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9KCkpLFxyXG5cclxuXHRfaW5pdFBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXIgPSB0aGlzLl9jcmVhdGVFbGVtZW50KCdzaGFwZScpO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsZWFmbGV0LXZtbC1zaGFwZScgK1xyXG5cdFx0XHQodGhpcy5vcHRpb25zLmNsYXNzTmFtZSA/ICcgJyArIHRoaXMub3B0aW9ucy5jbGFzc05hbWUgOiAnJykpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xpY2thYmxlKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsZWFmbGV0LWNsaWNrYWJsZScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnRhaW5lci5jb29yZHNpemUgPSAnMSAxJztcclxuXHJcblx0XHR0aGlzLl9wYXRoID0gdGhpcy5fY3JlYXRlRWxlbWVudCgncGF0aCcpO1xyXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3BhdGgpO1xyXG5cclxuXHRcdHRoaXMuX21hcC5fcGF0aFJvb3QuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdFN0eWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl91cGRhdGVTdHlsZSgpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHN0cm9rZSA9IHRoaXMuX3N0cm9rZSxcclxuXHRcdCAgICBmaWxsID0gdGhpcy5fZmlsbCxcclxuXHRcdCAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG5cdFx0ICAgIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcclxuXHJcblx0XHRjb250YWluZXIuc3Ryb2tlZCA9IG9wdGlvbnMuc3Ryb2tlO1xyXG5cdFx0Y29udGFpbmVyLmZpbGxlZCA9IG9wdGlvbnMuZmlsbDtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0aWYgKCFzdHJva2UpIHtcclxuXHRcdFx0XHRzdHJva2UgPSB0aGlzLl9zdHJva2UgPSB0aGlzLl9jcmVhdGVFbGVtZW50KCdzdHJva2UnKTtcclxuXHRcdFx0XHRzdHJva2UuZW5kY2FwID0gJ3JvdW5kJztcclxuXHRcdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoc3Ryb2tlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdHJva2Uud2VpZ2h0ID0gb3B0aW9ucy53ZWlnaHQgKyAncHgnO1xyXG5cdFx0XHRzdHJva2UuY29sb3IgPSBvcHRpb25zLmNvbG9yO1xyXG5cdFx0XHRzdHJva2Uub3BhY2l0eSA9IG9wdGlvbnMub3BhY2l0eTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmRhc2hBcnJheSkge1xyXG5cdFx0XHRcdHN0cm9rZS5kYXNoU3R5bGUgPSBMLlV0aWwuaXNBcnJheShvcHRpb25zLmRhc2hBcnJheSkgP1xyXG5cdFx0XHRcdCAgICBvcHRpb25zLmRhc2hBcnJheS5qb2luKCcgJykgOlxyXG5cdFx0XHRcdCAgICBvcHRpb25zLmRhc2hBcnJheS5yZXBsYWNlKC8oICosICopL2csICcgJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c3Ryb2tlLmRhc2hTdHlsZSA9ICcnO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChvcHRpb25zLmxpbmVDYXApIHtcclxuXHRcdFx0XHRzdHJva2UuZW5kY2FwID0gb3B0aW9ucy5saW5lQ2FwLnJlcGxhY2UoJ2J1dHQnLCAnZmxhdCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChvcHRpb25zLmxpbmVKb2luKSB7XHJcblx0XHRcdFx0c3Ryb2tlLmpvaW5zdHlsZSA9IG9wdGlvbnMubGluZUpvaW47XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2UgaWYgKHN0cm9rZSkge1xyXG5cdFx0XHRjb250YWluZXIucmVtb3ZlQ2hpbGQoc3Ryb2tlKTtcclxuXHRcdFx0dGhpcy5fc3Ryb2tlID0gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5maWxsKSB7XHJcblx0XHRcdGlmICghZmlsbCkge1xyXG5cdFx0XHRcdGZpbGwgPSB0aGlzLl9maWxsID0gdGhpcy5fY3JlYXRlRWxlbWVudCgnZmlsbCcpO1xyXG5cdFx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChmaWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRmaWxsLmNvbG9yID0gb3B0aW9ucy5maWxsQ29sb3IgfHwgb3B0aW9ucy5jb2xvcjtcclxuXHRcdFx0ZmlsbC5vcGFjaXR5ID0gb3B0aW9ucy5maWxsT3BhY2l0eTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKGZpbGwpIHtcclxuXHRcdFx0Y29udGFpbmVyLnJlbW92ZUNoaWxkKGZpbGwpO1xyXG5cdFx0XHR0aGlzLl9maWxsID0gbnVsbDtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlUGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHN0eWxlID0gdGhpcy5fY29udGFpbmVyLnN0eWxlO1xyXG5cclxuXHRcdHN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblx0XHR0aGlzLl9wYXRoLnYgPSB0aGlzLmdldFBhdGhTdHJpbmcoKSArICcgJzsgLy8gdGhlIHNwYWNlIGZpeGVzIElFIGVtcHR5IHBhdGggc3RyaW5nIGJ1Z1xyXG5cdFx0c3R5bGUuZGlzcGxheSA9ICcnO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5pbmNsdWRlKEwuQnJvd3Nlci5zdmcgfHwgIUwuQnJvd3Nlci52bWwgPyB7fSA6IHtcclxuXHRfaW5pdFBhdGhSb290OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fcGF0aFJvb3QpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIHJvb3QgPSB0aGlzLl9wYXRoUm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0cm9vdC5jbGFzc05hbWUgPSAnbGVhZmxldC12bWwtY29udGFpbmVyJztcclxuXHRcdHRoaXMuX3BhbmVzLm92ZXJsYXlQYW5lLmFwcGVuZENoaWxkKHJvb3QpO1xyXG5cclxuXHRcdHRoaXMub24oJ21vdmVlbmQnLCB0aGlzLl91cGRhdGVQYXRoVmlld3BvcnQpO1xyXG5cdFx0dGhpcy5fdXBkYXRlUGF0aFZpZXdwb3J0KCk7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIFZlY3RvciByZW5kZXJpbmcgZm9yIGFsbCBicm93c2VycyB0aGF0IHN1cHBvcnQgY2FudmFzLlxyXG4gKi9cclxuXHJcbkwuQnJvd3Nlci5jYW52YXMgPSAoZnVuY3Rpb24gKCkge1xyXG5cdHJldHVybiAhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQ7XHJcbn0oKSk7XHJcblxyXG5MLlBhdGggPSAoTC5QYXRoLlNWRyAmJiAhd2luZG93LkxfUFJFRkVSX0NBTlZBUykgfHwgIUwuQnJvd3Nlci5jYW52YXMgPyBMLlBhdGggOiBMLlBhdGguZXh0ZW5kKHtcclxuXHRzdGF0aWNzOiB7XHJcblx0XHQvL0NMSVBfUEFERElORzogMC4wMiwgLy8gbm90IHN1cmUgaWYgdGhlcmUncyBhIG5lZWQgdG8gc2V0IGl0IHRvIGEgc21hbGwgdmFsdWVcclxuXHRcdENBTlZBUzogdHJ1ZSxcclxuXHRcdFNWRzogZmFsc2VcclxuXHR9LFxyXG5cclxuXHRyZWRyYXc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5wcm9qZWN0TGF0bG5ncygpO1xyXG5cdFx0XHR0aGlzLl9yZXF1ZXN0VXBkYXRlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRTdHlsZTogZnVuY3Rpb24gKHN0eWxlKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgc3R5bGUpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fdXBkYXRlU3R5bGUoKTtcclxuXHRcdFx0dGhpcy5fcmVxdWVzdFVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcFxyXG5cdFx0ICAgIC5vZmYoJ3ZpZXdyZXNldCcsIHRoaXMucHJvamVjdExhdGxuZ3MsIHRoaXMpXHJcblx0XHQgICAgLm9mZignbW92ZWVuZCcsIHRoaXMuX3VwZGF0ZVBhdGgsIHRoaXMpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xpY2thYmxlKSB7XHJcblx0XHRcdHRoaXMuX21hcC5vZmYoJ2NsaWNrJywgdGhpcy5fb25DbGljaywgdGhpcyk7XHJcblx0XHRcdHRoaXMuX21hcC5vZmYoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9yZXF1ZXN0VXBkYXRlKCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZmlyZSgncmVtb3ZlJyk7XHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cdH0sXHJcblxyXG5cdF9yZXF1ZXN0VXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwICYmICFMLlBhdGguX3VwZGF0ZVJlcXVlc3QpIHtcclxuXHRcdFx0TC5QYXRoLl91cGRhdGVSZXF1ZXN0ID0gTC5VdGlsLnJlcXVlc3RBbmltRnJhbWUodGhpcy5fZmlyZU1hcE1vdmVFbmQsIHRoaXMuX21hcCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2ZpcmVNYXBNb3ZlRW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLlBhdGguX3VwZGF0ZVJlcXVlc3QgPSBudWxsO1xyXG5cdFx0dGhpcy5maXJlKCdtb3ZlZW5kJyk7XHJcblx0fSxcclxuXHJcblx0X2luaXRFbGVtZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fbWFwLl9pbml0UGF0aFJvb3QoKTtcclxuXHRcdHRoaXMuX2N0eCA9IHRoaXMuX21hcC5fY2FudmFzQ3R4O1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc3Ryb2tlKSB7XHJcblx0XHRcdHRoaXMuX2N0eC5saW5lV2lkdGggPSBvcHRpb25zLndlaWdodDtcclxuXHRcdFx0dGhpcy5fY3R4LnN0cm9rZVN0eWxlID0gb3B0aW9ucy5jb2xvcjtcclxuXHRcdH1cclxuXHRcdGlmIChvcHRpb25zLmZpbGwpIHtcclxuXHRcdFx0dGhpcy5fY3R4LmZpbGxTdHlsZSA9IG9wdGlvbnMuZmlsbENvbG9yIHx8IG9wdGlvbnMuY29sb3I7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2RyYXdQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaSwgaiwgbGVuLCBsZW4yLCBwb2ludCwgZHJhd01ldGhvZDtcclxuXHJcblx0XHR0aGlzLl9jdHguYmVnaW5QYXRoKCk7XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGhpcy5fcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0Zm9yIChqID0gMCwgbGVuMiA9IHRoaXMuX3BhcnRzW2ldLmxlbmd0aDsgaiA8IGxlbjI7IGorKykge1xyXG5cdFx0XHRcdHBvaW50ID0gdGhpcy5fcGFydHNbaV1bal07XHJcblx0XHRcdFx0ZHJhd01ldGhvZCA9IChqID09PSAwID8gJ21vdmUnIDogJ2xpbmUnKSArICdUbyc7XHJcblxyXG5cdFx0XHRcdHRoaXMuX2N0eFtkcmF3TWV0aG9kXShwb2ludC54LCBwb2ludC55KTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBUT0RPIHJlZmFjdG9yIHVnbHkgaGFja1xyXG5cdFx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIEwuUG9seWdvbikge1xyXG5cdFx0XHRcdHRoaXMuX2N0eC5jbG9zZVBhdGgoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jaGVja0lmRW1wdHk6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiAhdGhpcy5fcGFydHMubGVuZ3RoO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fY2hlY2tJZkVtcHR5KCkpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIGN0eCA9IHRoaXMuX2N0eCxcclxuXHRcdCAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuXHRcdHRoaXMuX2RyYXdQYXRoKCk7XHJcblx0XHRjdHguc2F2ZSgpO1xyXG5cdFx0dGhpcy5fdXBkYXRlU3R5bGUoKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5maWxsKSB7XHJcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IG9wdGlvbnMuZmlsbE9wYWNpdHk7XHJcblx0XHRcdGN0eC5maWxsKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc3Ryb2tlKSB7XHJcblx0XHRcdGN0eC5nbG9iYWxBbHBoYSA9IG9wdGlvbnMub3BhY2l0eTtcclxuXHRcdFx0Y3R4LnN0cm9rZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGN0eC5yZXN0b3JlKCk7XHJcblxyXG5cdFx0Ly8gVE9ETyBvcHRpbWl6YXRpb246IDEgZmlsbC9zdHJva2UgZm9yIGFsbCBmZWF0dXJlcyB3aXRoIGVxdWFsIHN0eWxlIGluc3RlYWQgb2YgMSBmb3IgZWFjaCBmZWF0dXJlXHJcblx0fSxcclxuXHJcblx0X2luaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xpY2thYmxlKSB7XHJcblx0XHRcdC8vIFRPRE8gZGJsY2xpY2tcclxuXHRcdFx0dGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX21hcC5vbignY2xpY2snLCB0aGlzLl9vbkNsaWNrLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25DbGljazogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmICh0aGlzLl9jb250YWluc1BvaW50KGUubGF5ZXJQb2ludCkpIHtcclxuXHRcdFx0dGhpcy5maXJlKCdjbGljaycsIGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbk1vdXNlTW92ZTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwIHx8IHRoaXMuX21hcC5fYW5pbWF0aW5nWm9vbSkgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBUT0RPIGRvbid0IGRvIG9uIGVhY2ggbW92ZVxyXG5cdFx0aWYgKHRoaXMuX2NvbnRhaW5zUG9pbnQoZS5sYXllclBvaW50KSkge1xyXG5cdFx0XHR0aGlzLl9jdHguY2FudmFzLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuXHRcdFx0dGhpcy5fbW91c2VJbnNpZGUgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmZpcmUoJ21vdXNlb3ZlcicsIGUpO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAodGhpcy5fbW91c2VJbnNpZGUpIHtcclxuXHRcdFx0dGhpcy5fY3R4LmNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnJztcclxuXHRcdFx0dGhpcy5fbW91c2VJbnNpZGUgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5maXJlKCdtb3VzZW91dCcsIGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5pbmNsdWRlKChMLlBhdGguU1ZHICYmICF3aW5kb3cuTF9QUkVGRVJfQ0FOVkFTKSB8fCAhTC5Ccm93c2VyLmNhbnZhcyA/IHt9IDoge1xyXG5cdF9pbml0UGF0aFJvb3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciByb290ID0gdGhpcy5fcGF0aFJvb3QsXHJcblx0XHQgICAgY3R4O1xyXG5cclxuXHRcdGlmICghcm9vdCkge1xyXG5cdFx0XHRyb290ID0gdGhpcy5fcGF0aFJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHRcdFx0cm9vdC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcblx0XHRcdGN0eCA9IHRoaXMuX2NhbnZhc0N0eCA9IHJvb3QuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcblx0XHRcdGN0eC5saW5lQ2FwID0gJ3JvdW5kJztcclxuXHRcdFx0Y3R4LmxpbmVKb2luID0gJ3JvdW5kJztcclxuXHJcblx0XHRcdHRoaXMuX3BhbmVzLm92ZXJsYXlQYW5lLmFwcGVuZENoaWxkKHJvb3QpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uKSB7XHJcblx0XHRcdFx0dGhpcy5fcGF0aFJvb3QuY2xhc3NOYW1lID0gJ2xlYWZsZXQtem9vbS1hbmltYXRlZCc7XHJcblx0XHRcdFx0dGhpcy5vbignem9vbWFuaW0nLCB0aGlzLl9hbmltYXRlUGF0aFpvb20pO1xyXG5cdFx0XHRcdHRoaXMub24oJ3pvb21lbmQnLCB0aGlzLl9lbmRQYXRoWm9vbSk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5vbignbW92ZWVuZCcsIHRoaXMuX3VwZGF0ZUNhbnZhc1ZpZXdwb3J0KTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlQ2FudmFzVmlld3BvcnQoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlQ2FudmFzVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdC8vIGRvbid0IHJlZHJhdyB3aGlsZSB6b29taW5nLiBTZWUgX3VwZGF0ZVN2Z1ZpZXdwb3J0IGZvciBtb3JlIGRldGFpbHNcclxuXHRcdGlmICh0aGlzLl9wYXRoWm9vbWluZykgeyByZXR1cm47IH1cclxuXHRcdHRoaXMuX3VwZGF0ZVBhdGhWaWV3cG9ydCgpO1xyXG5cclxuXHRcdHZhciB2cCA9IHRoaXMuX3BhdGhWaWV3cG9ydCxcclxuXHRcdCAgICBtaW4gPSB2cC5taW4sXHJcblx0XHQgICAgc2l6ZSA9IHZwLm1heC5zdWJ0cmFjdChtaW4pLFxyXG5cdFx0ICAgIHJvb3QgPSB0aGlzLl9wYXRoUm9vdDtcclxuXHJcblx0XHQvL1RPRE8gY2hlY2sgaWYgdGhpcyB3b3JrcyBwcm9wZXJseSBvbiBtb2JpbGUgd2Via2l0XHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24ocm9vdCwgbWluKTtcclxuXHRcdHJvb3Qud2lkdGggPSBzaXplLng7XHJcblx0XHRyb290LmhlaWdodCA9IHNpemUueTtcclxuXHRcdHJvb3QuZ2V0Q29udGV4dCgnMmQnKS50cmFuc2xhdGUoLW1pbi54LCAtbWluLnkpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBMLkxpbmVVdGlsIGNvbnRhaW5zIGRpZmZlcmVudCB1dGlsaXR5IGZ1bmN0aW9ucyBmb3IgbGluZSBzZWdtZW50c1xyXG4gKiBhbmQgcG9seWxpbmVzIChjbGlwcGluZywgc2ltcGxpZmljYXRpb24sIGRpc3RhbmNlcywgZXRjLilcclxuICovXHJcblxyXG4vKmpzaGludCBiaXR3aXNlOmZhbHNlICovIC8vIGFsbG93IGJpdHdpc2Ugb3BlcmF0aW9ucyBmb3IgdGhpcyBmaWxlXHJcblxyXG5MLkxpbmVVdGlsID0ge1xyXG5cclxuXHQvLyBTaW1wbGlmeSBwb2x5bGluZSB3aXRoIHZlcnRleCByZWR1Y3Rpb24gYW5kIERvdWdsYXMtUGV1Y2tlciBzaW1wbGlmaWNhdGlvbi5cclxuXHQvLyBJbXByb3ZlcyByZW5kZXJpbmcgcGVyZm9ybWFuY2UgZHJhbWF0aWNhbGx5IGJ5IGxlc3NlbmluZyB0aGUgbnVtYmVyIG9mIHBvaW50cyB0byBkcmF3LlxyXG5cclxuXHRzaW1wbGlmeTogZnVuY3Rpb24gKC8qUG9pbnRbXSovIHBvaW50cywgLypOdW1iZXIqLyB0b2xlcmFuY2UpIHtcclxuXHRcdGlmICghdG9sZXJhbmNlIHx8ICFwb2ludHMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBwb2ludHMuc2xpY2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgc3FUb2xlcmFuY2UgPSB0b2xlcmFuY2UgKiB0b2xlcmFuY2U7XHJcblxyXG5cdFx0Ly8gc3RhZ2UgMTogdmVydGV4IHJlZHVjdGlvblxyXG5cdFx0cG9pbnRzID0gdGhpcy5fcmVkdWNlUG9pbnRzKHBvaW50cywgc3FUb2xlcmFuY2UpO1xyXG5cclxuXHRcdC8vIHN0YWdlIDI6IERvdWdsYXMtUGV1Y2tlciBzaW1wbGlmaWNhdGlvblxyXG5cdFx0cG9pbnRzID0gdGhpcy5fc2ltcGxpZnlEUChwb2ludHMsIHNxVG9sZXJhbmNlKTtcclxuXHJcblx0XHRyZXR1cm4gcG9pbnRzO1xyXG5cdH0sXHJcblxyXG5cdC8vIGRpc3RhbmNlIGZyb20gYSBwb2ludCB0byBhIHNlZ21lbnQgYmV0d2VlbiB0d28gcG9pbnRzXHJcblx0cG9pbnRUb1NlZ21lbnREaXN0YW5jZTogIGZ1bmN0aW9uICgvKlBvaW50Ki8gcCwgLypQb2ludCovIHAxLCAvKlBvaW50Ki8gcDIpIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQodGhpcy5fc3FDbG9zZXN0UG9pbnRPblNlZ21lbnQocCwgcDEsIHAyLCB0cnVlKSk7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VzdFBvaW50T25TZWdtZW50OiBmdW5jdGlvbiAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc3FDbG9zZXN0UG9pbnRPblNlZ21lbnQocCwgcDEsIHAyKTtcclxuXHR9LFxyXG5cclxuXHQvLyBEb3VnbGFzLVBldWNrZXIgc2ltcGxpZmljYXRpb24sIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0RvdWdsYXMtUGV1Y2tlcl9hbGdvcml0aG1cclxuXHRfc2ltcGxpZnlEUDogZnVuY3Rpb24gKHBvaW50cywgc3FUb2xlcmFuY2UpIHtcclxuXHJcblx0XHR2YXIgbGVuID0gcG9pbnRzLmxlbmd0aCxcclxuXHRcdCAgICBBcnJheUNvbnN0cnVjdG9yID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09IHVuZGVmaW5lZCArICcnID8gVWludDhBcnJheSA6IEFycmF5LFxyXG5cdFx0ICAgIG1hcmtlcnMgPSBuZXcgQXJyYXlDb25zdHJ1Y3RvcihsZW4pO1xyXG5cclxuXHRcdG1hcmtlcnNbMF0gPSBtYXJrZXJzW2xlbiAtIDFdID0gMTtcclxuXHJcblx0XHR0aGlzLl9zaW1wbGlmeURQU3RlcChwb2ludHMsIG1hcmtlcnMsIHNxVG9sZXJhbmNlLCAwLCBsZW4gLSAxKTtcclxuXHJcblx0XHR2YXIgaSxcclxuXHRcdCAgICBuZXdQb2ludHMgPSBbXTtcclxuXHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0aWYgKG1hcmtlcnNbaV0pIHtcclxuXHRcdFx0XHRuZXdQb2ludHMucHVzaChwb2ludHNbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ld1BvaW50cztcclxuXHR9LFxyXG5cclxuXHRfc2ltcGxpZnlEUFN0ZXA6IGZ1bmN0aW9uIChwb2ludHMsIG1hcmtlcnMsIHNxVG9sZXJhbmNlLCBmaXJzdCwgbGFzdCkge1xyXG5cclxuXHRcdHZhciBtYXhTcURpc3QgPSAwLFxyXG5cdFx0ICAgIGluZGV4LCBpLCBzcURpc3Q7XHJcblxyXG5cdFx0Zm9yIChpID0gZmlyc3QgKyAxOyBpIDw9IGxhc3QgLSAxOyBpKyspIHtcclxuXHRcdFx0c3FEaXN0ID0gdGhpcy5fc3FDbG9zZXN0UG9pbnRPblNlZ21lbnQocG9pbnRzW2ldLCBwb2ludHNbZmlyc3RdLCBwb2ludHNbbGFzdF0sIHRydWUpO1xyXG5cclxuXHRcdFx0aWYgKHNxRGlzdCA+IG1heFNxRGlzdCkge1xyXG5cdFx0XHRcdGluZGV4ID0gaTtcclxuXHRcdFx0XHRtYXhTcURpc3QgPSBzcURpc3Q7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAobWF4U3FEaXN0ID4gc3FUb2xlcmFuY2UpIHtcclxuXHRcdFx0bWFya2Vyc1tpbmRleF0gPSAxO1xyXG5cclxuXHRcdFx0dGhpcy5fc2ltcGxpZnlEUFN0ZXAocG9pbnRzLCBtYXJrZXJzLCBzcVRvbGVyYW5jZSwgZmlyc3QsIGluZGV4KTtcclxuXHRcdFx0dGhpcy5fc2ltcGxpZnlEUFN0ZXAocG9pbnRzLCBtYXJrZXJzLCBzcVRvbGVyYW5jZSwgaW5kZXgsIGxhc3QpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIHJlZHVjZSBwb2ludHMgdGhhdCBhcmUgdG9vIGNsb3NlIHRvIGVhY2ggb3RoZXIgdG8gYSBzaW5nbGUgcG9pbnRcclxuXHRfcmVkdWNlUG9pbnRzOiBmdW5jdGlvbiAocG9pbnRzLCBzcVRvbGVyYW5jZSkge1xyXG5cdFx0dmFyIHJlZHVjZWRQb2ludHMgPSBbcG9pbnRzWzBdXTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMSwgcHJldiA9IDAsIGxlbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRpZiAodGhpcy5fc3FEaXN0KHBvaW50c1tpXSwgcG9pbnRzW3ByZXZdKSA+IHNxVG9sZXJhbmNlKSB7XHJcblx0XHRcdFx0cmVkdWNlZFBvaW50cy5wdXNoKHBvaW50c1tpXSk7XHJcblx0XHRcdFx0cHJldiA9IGk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChwcmV2IDwgbGVuIC0gMSkge1xyXG5cdFx0XHRyZWR1Y2VkUG9pbnRzLnB1c2gocG9pbnRzW2xlbiAtIDFdKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZWR1Y2VkUG9pbnRzO1xyXG5cdH0sXHJcblxyXG5cdC8vIENvaGVuLVN1dGhlcmxhbmQgbGluZSBjbGlwcGluZyBhbGdvcml0aG0uXHJcblx0Ly8gVXNlZCB0byBhdm9pZCByZW5kZXJpbmcgcGFydHMgb2YgYSBwb2x5bGluZSB0aGF0IGFyZSBub3QgY3VycmVudGx5IHZpc2libGUuXHJcblxyXG5cdGNsaXBTZWdtZW50OiBmdW5jdGlvbiAoYSwgYiwgYm91bmRzLCB1c2VMYXN0Q29kZSkge1xyXG5cdFx0dmFyIGNvZGVBID0gdXNlTGFzdENvZGUgPyB0aGlzLl9sYXN0Q29kZSA6IHRoaXMuX2dldEJpdENvZGUoYSwgYm91bmRzKSxcclxuXHRcdCAgICBjb2RlQiA9IHRoaXMuX2dldEJpdENvZGUoYiwgYm91bmRzKSxcclxuXHJcblx0XHQgICAgY29kZU91dCwgcCwgbmV3Q29kZTtcclxuXHJcblx0XHQvLyBzYXZlIDJuZCBjb2RlIHRvIGF2b2lkIGNhbGN1bGF0aW5nIGl0IG9uIHRoZSBuZXh0IHNlZ21lbnRcclxuXHRcdHRoaXMuX2xhc3RDb2RlID0gY29kZUI7XHJcblxyXG5cdFx0d2hpbGUgKHRydWUpIHtcclxuXHRcdFx0Ly8gaWYgYSxiIGlzIGluc2lkZSB0aGUgY2xpcCB3aW5kb3cgKHRyaXZpYWwgYWNjZXB0KVxyXG5cdFx0XHRpZiAoIShjb2RlQSB8IGNvZGVCKSkge1xyXG5cdFx0XHRcdHJldHVybiBbYSwgYl07XHJcblx0XHRcdC8vIGlmIGEsYiBpcyBvdXRzaWRlIHRoZSBjbGlwIHdpbmRvdyAodHJpdmlhbCByZWplY3QpXHJcblx0XHRcdH0gZWxzZSBpZiAoY29kZUEgJiBjb2RlQikge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0Ly8gb3RoZXIgY2FzZXNcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb2RlT3V0ID0gY29kZUEgfHwgY29kZUI7XHJcblx0XHRcdFx0cCA9IHRoaXMuX2dldEVkZ2VJbnRlcnNlY3Rpb24oYSwgYiwgY29kZU91dCwgYm91bmRzKTtcclxuXHRcdFx0XHRuZXdDb2RlID0gdGhpcy5fZ2V0Qml0Q29kZShwLCBib3VuZHMpO1xyXG5cclxuXHRcdFx0XHRpZiAoY29kZU91dCA9PT0gY29kZUEpIHtcclxuXHRcdFx0XHRcdGEgPSBwO1xyXG5cdFx0XHRcdFx0Y29kZUEgPSBuZXdDb2RlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRiID0gcDtcclxuXHRcdFx0XHRcdGNvZGVCID0gbmV3Q29kZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfZ2V0RWRnZUludGVyc2VjdGlvbjogZnVuY3Rpb24gKGEsIGIsIGNvZGUsIGJvdW5kcykge1xyXG5cdFx0dmFyIGR4ID0gYi54IC0gYS54LFxyXG5cdFx0ICAgIGR5ID0gYi55IC0gYS55LFxyXG5cdFx0ICAgIG1pbiA9IGJvdW5kcy5taW4sXHJcblx0XHQgICAgbWF4ID0gYm91bmRzLm1heDtcclxuXHJcblx0XHRpZiAoY29kZSAmIDgpIHsgLy8gdG9wXHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2ludChhLnggKyBkeCAqIChtYXgueSAtIGEueSkgLyBkeSwgbWF4LnkpO1xyXG5cdFx0fSBlbHNlIGlmIChjb2RlICYgNCkgeyAvLyBib3R0b21cclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvaW50KGEueCArIGR4ICogKG1pbi55IC0gYS55KSAvIGR5LCBtaW4ueSk7XHJcblx0XHR9IGVsc2UgaWYgKGNvZGUgJiAyKSB7IC8vIHJpZ2h0XHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2ludChtYXgueCwgYS55ICsgZHkgKiAobWF4LnggLSBhLngpIC8gZHgpO1xyXG5cdFx0fSBlbHNlIGlmIChjb2RlICYgMSkgeyAvLyBsZWZ0XHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2ludChtaW4ueCwgYS55ICsgZHkgKiAobWluLnggLSBhLngpIC8gZHgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9nZXRCaXRDb2RlOiBmdW5jdGlvbiAoLypQb2ludCovIHAsIGJvdW5kcykge1xyXG5cdFx0dmFyIGNvZGUgPSAwO1xyXG5cclxuXHRcdGlmIChwLnggPCBib3VuZHMubWluLngpIHsgLy8gbGVmdFxyXG5cdFx0XHRjb2RlIHw9IDE7XHJcblx0XHR9IGVsc2UgaWYgKHAueCA+IGJvdW5kcy5tYXgueCkgeyAvLyByaWdodFxyXG5cdFx0XHRjb2RlIHw9IDI7XHJcblx0XHR9XHJcblx0XHRpZiAocC55IDwgYm91bmRzLm1pbi55KSB7IC8vIGJvdHRvbVxyXG5cdFx0XHRjb2RlIHw9IDQ7XHJcblx0XHR9IGVsc2UgaWYgKHAueSA+IGJvdW5kcy5tYXgueSkgeyAvLyB0b3BcclxuXHRcdFx0Y29kZSB8PSA4O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjb2RlO1xyXG5cdH0sXHJcblxyXG5cdC8vIHNxdWFyZSBkaXN0YW5jZSAodG8gYXZvaWQgdW5uZWNlc3NhcnkgTWF0aC5zcXJ0IGNhbGxzKVxyXG5cdF9zcURpc3Q6IGZ1bmN0aW9uIChwMSwgcDIpIHtcclxuXHRcdHZhciBkeCA9IHAyLnggLSBwMS54LFxyXG5cdFx0ICAgIGR5ID0gcDIueSAtIHAxLnk7XHJcblx0XHRyZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XHJcblx0fSxcclxuXHJcblx0Ly8gcmV0dXJuIGNsb3Nlc3QgcG9pbnQgb24gc2VnbWVudCBvciBkaXN0YW5jZSB0byB0aGF0IHBvaW50XHJcblx0X3NxQ2xvc2VzdFBvaW50T25TZWdtZW50OiBmdW5jdGlvbiAocCwgcDEsIHAyLCBzcURpc3QpIHtcclxuXHRcdHZhciB4ID0gcDEueCxcclxuXHRcdCAgICB5ID0gcDEueSxcclxuXHRcdCAgICBkeCA9IHAyLnggLSB4LFxyXG5cdFx0ICAgIGR5ID0gcDIueSAtIHksXHJcblx0XHQgICAgZG90ID0gZHggKiBkeCArIGR5ICogZHksXHJcblx0XHQgICAgdDtcclxuXHJcblx0XHRpZiAoZG90ID4gMCkge1xyXG5cdFx0XHR0ID0gKChwLnggLSB4KSAqIGR4ICsgKHAueSAtIHkpICogZHkpIC8gZG90O1xyXG5cclxuXHRcdFx0aWYgKHQgPiAxKSB7XHJcblx0XHRcdFx0eCA9IHAyLng7XHJcblx0XHRcdFx0eSA9IHAyLnk7XHJcblx0XHRcdH0gZWxzZSBpZiAodCA+IDApIHtcclxuXHRcdFx0XHR4ICs9IGR4ICogdDtcclxuXHRcdFx0XHR5ICs9IGR5ICogdDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGR4ID0gcC54IC0geDtcclxuXHRcdGR5ID0gcC55IC0geTtcclxuXHJcblx0XHRyZXR1cm4gc3FEaXN0ID8gZHggKiBkeCArIGR5ICogZHkgOiBuZXcgTC5Qb2ludCh4LCB5KTtcclxuXHR9XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlBvbHlsaW5lIGlzIHVzZWQgdG8gZGlzcGxheSBwb2x5bGluZXMgb24gYSBtYXAuXHJcbiAqL1xyXG5cclxuTC5Qb2x5bGluZSA9IEwuUGF0aC5leHRlbmQoe1xyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0XHRMLlBhdGgucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9sYXRsbmdzID0gdGhpcy5fY29udmVydExhdExuZ3MobGF0bG5ncyk7XHJcblx0fSxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0Ly8gaG93IG11Y2ggdG8gc2ltcGxpZnkgdGhlIHBvbHlsaW5lIG9uIGVhY2ggem9vbSBsZXZlbFxyXG5cdFx0Ly8gbW9yZSA9IGJldHRlciBwZXJmb3JtYW5jZSBhbmQgc21vb3RoZXIgbG9vaywgbGVzcyA9IG1vcmUgYWNjdXJhdGVcclxuXHRcdHNtb290aEZhY3RvcjogMS4wLFxyXG5cdFx0bm9DbGlwOiBmYWxzZVxyXG5cdH0sXHJcblxyXG5cdHByb2plY3RMYXRsbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9sYXRsbmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHRoaXMuX29yaWdpbmFsUG9pbnRzW2ldID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmdzW2ldKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXRQYXRoU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5fcGFydHMubGVuZ3RoLCBzdHIgPSAnJzsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHN0ciArPSB0aGlzLl9nZXRQYXRoUGFydFN0cih0aGlzLl9wYXJ0c1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gc3RyO1xyXG5cdH0sXHJcblxyXG5cdGdldExhdExuZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXRsbmdzO1xyXG5cdH0sXHJcblxyXG5cdHNldExhdExuZ3M6IGZ1bmN0aW9uIChsYXRsbmdzKSB7XHJcblx0XHR0aGlzLl9sYXRsbmdzID0gdGhpcy5fY29udmVydExhdExuZ3MobGF0bG5ncyk7XHJcblx0XHRyZXR1cm4gdGhpcy5yZWRyYXcoKTtcclxuXHR9LFxyXG5cclxuXHRhZGRMYXRMbmc6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHRoaXMuX2xhdGxuZ3MucHVzaChMLmxhdExuZyhsYXRsbmcpKTtcclxuXHRcdHJldHVybiB0aGlzLnJlZHJhdygpO1xyXG5cdH0sXHJcblxyXG5cdHNwbGljZUxhdExuZ3M6IGZ1bmN0aW9uICgpIHsgLy8gKE51bWJlciBpbmRleCwgTnVtYmVyIGhvd01hbnkpXHJcblx0XHR2YXIgcmVtb3ZlZCA9IFtdLnNwbGljZS5hcHBseSh0aGlzLl9sYXRsbmdzLCBhcmd1bWVudHMpO1xyXG5cdFx0dGhpcy5fY29udmVydExhdExuZ3ModGhpcy5fbGF0bG5ncywgdHJ1ZSk7XHJcblx0XHR0aGlzLnJlZHJhdygpO1xyXG5cdFx0cmV0dXJuIHJlbW92ZWQ7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VzdExheWVyUG9pbnQ6IGZ1bmN0aW9uIChwKSB7XHJcblx0XHR2YXIgbWluRGlzdGFuY2UgPSBJbmZpbml0eSwgcGFydHMgPSB0aGlzLl9wYXJ0cywgcDEsIHAyLCBtaW5Qb2ludCA9IG51bGw7XHJcblxyXG5cdFx0Zm9yICh2YXIgaiA9IDAsIGpMZW4gPSBwYXJ0cy5sZW5ndGg7IGogPCBqTGVuOyBqKyspIHtcclxuXHRcdFx0dmFyIHBvaW50cyA9IHBhcnRzW2pdO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMSwgbGVuID0gcG9pbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0cDEgPSBwb2ludHNbaSAtIDFdO1xyXG5cdFx0XHRcdHAyID0gcG9pbnRzW2ldO1xyXG5cdFx0XHRcdHZhciBzcURpc3QgPSBMLkxpbmVVdGlsLl9zcUNsb3Nlc3RQb2ludE9uU2VnbWVudChwLCBwMSwgcDIsIHRydWUpO1xyXG5cdFx0XHRcdGlmIChzcURpc3QgPCBtaW5EaXN0YW5jZSkge1xyXG5cdFx0XHRcdFx0bWluRGlzdGFuY2UgPSBzcURpc3Q7XHJcblx0XHRcdFx0XHRtaW5Qb2ludCA9IEwuTGluZVV0aWwuX3NxQ2xvc2VzdFBvaW50T25TZWdtZW50KHAsIHAxLCBwMik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAobWluUG9pbnQpIHtcclxuXHRcdFx0bWluUG9pbnQuZGlzdGFuY2UgPSBNYXRoLnNxcnQobWluRGlzdGFuY2UpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1pblBvaW50O1xyXG5cdH0sXHJcblxyXG5cdGdldEJvdW5kczogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZ0JvdW5kcyh0aGlzLmdldExhdExuZ3MoKSk7XHJcblx0fSxcclxuXHJcblx0X2NvbnZlcnRMYXRMbmdzOiBmdW5jdGlvbiAobGF0bG5ncywgb3ZlcndyaXRlKSB7XHJcblx0XHR2YXIgaSwgbGVuLCB0YXJnZXQgPSBvdmVyd3JpdGUgPyBsYXRsbmdzIDogW107XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gbGF0bG5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRpZiAoTC5VdGlsLmlzQXJyYXkobGF0bG5nc1tpXSkgJiYgdHlwZW9mIGxhdGxuZ3NbaV1bMF0gIT09ICdudW1iZXInKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRhcmdldFtpXSA9IEwubGF0TG5nKGxhdGxuZ3NbaV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRhcmdldDtcclxuXHR9LFxyXG5cclxuXHRfaW5pdEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0TC5QYXRoLnByb3RvdHlwZS5faW5pdEV2ZW50cy5jYWxsKHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRQYXRoUGFydFN0cjogZnVuY3Rpb24gKHBvaW50cykge1xyXG5cdFx0dmFyIHJvdW5kID0gTC5QYXRoLlZNTDtcclxuXHJcblx0XHRmb3IgKHZhciBqID0gMCwgbGVuMiA9IHBvaW50cy5sZW5ndGgsIHN0ciA9ICcnLCBwOyBqIDwgbGVuMjsgaisrKSB7XHJcblx0XHRcdHAgPSBwb2ludHNbal07XHJcblx0XHRcdGlmIChyb3VuZCkge1xyXG5cdFx0XHRcdHAuX3JvdW5kKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3RyICs9IChqID8gJ0wnIDogJ00nKSArIHAueCArICcgJyArIHAueTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHI7XHJcblx0fSxcclxuXHJcblx0X2NsaXBQb2ludHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcclxuXHRcdCAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxyXG5cdFx0ICAgIGksIGssIHNlZ21lbnQ7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5ub0NsaXApIHtcclxuXHRcdFx0dGhpcy5fcGFydHMgPSBbcG9pbnRzXTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3BhcnRzID0gW107XHJcblxyXG5cdFx0dmFyIHBhcnRzID0gdGhpcy5fcGFydHMsXHJcblx0XHQgICAgdnAgPSB0aGlzLl9tYXAuX3BhdGhWaWV3cG9ydCxcclxuXHRcdCAgICBsdSA9IEwuTGluZVV0aWw7XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgayA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcclxuXHRcdFx0c2VnbWVudCA9IGx1LmNsaXBTZWdtZW50KHBvaW50c1tpXSwgcG9pbnRzW2kgKyAxXSwgdnAsIGkpO1xyXG5cdFx0XHRpZiAoIXNlZ21lbnQpIHtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cGFydHNba10gPSBwYXJ0c1trXSB8fCBbXTtcclxuXHRcdFx0cGFydHNba10ucHVzaChzZWdtZW50WzBdKTtcclxuXHJcblx0XHRcdC8vIGlmIHNlZ21lbnQgZ29lcyBvdXQgb2Ygc2NyZWVuLCBvciBpdCdzIHRoZSBsYXN0IG9uZSwgaXQncyB0aGUgZW5kIG9mIHRoZSBsaW5lIHBhcnRcclxuXHRcdFx0aWYgKChzZWdtZW50WzFdICE9PSBwb2ludHNbaSArIDFdKSB8fCAoaSA9PT0gbGVuIC0gMikpIHtcclxuXHRcdFx0XHRwYXJ0c1trXS5wdXNoKHNlZ21lbnRbMV0pO1xyXG5cdFx0XHRcdGsrKztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIHNpbXBsaWZ5IGVhY2ggY2xpcHBlZCBwYXJ0IG9mIHRoZSBwb2x5bGluZVxyXG5cdF9zaW1wbGlmeVBvaW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBhcnRzID0gdGhpcy5fcGFydHMsXHJcblx0XHQgICAgbHUgPSBMLkxpbmVVdGlsO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXJ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRwYXJ0c1tpXSA9IGx1LnNpbXBsaWZ5KHBhcnRzW2ldLCB0aGlzLm9wdGlvbnMuc21vb3RoRmFjdG9yKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlUGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy5fY2xpcFBvaW50cygpO1xyXG5cdFx0dGhpcy5fc2ltcGxpZnlQb2ludHMoKTtcclxuXHJcblx0XHRMLlBhdGgucHJvdG90eXBlLl91cGRhdGVQYXRoLmNhbGwodGhpcyk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwucG9seWxpbmUgPSBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5Qb2x5bGluZShsYXRsbmdzLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuUG9seVV0aWwgY29udGFpbnMgdXRpbGl0eSBmdW5jdGlvbnMgZm9yIHBvbHlnb25zIChjbGlwcGluZywgZXRjLikuXHJcbiAqL1xyXG5cclxuLypqc2hpbnQgYml0d2lzZTpmYWxzZSAqLyAvLyBhbGxvdyBiaXR3aXNlIG9wZXJhdGlvbnMgaGVyZVxyXG5cclxuTC5Qb2x5VXRpbCA9IHt9O1xyXG5cclxuLypcclxuICogU3V0aGVybGFuZC1Ib2RnZW1hbiBwb2x5Z29uIGNsaXBwaW5nIGFsZ29yaXRobS5cclxuICogVXNlZCB0byBhdm9pZCByZW5kZXJpbmcgcGFydHMgb2YgYSBwb2x5Z29uIHRoYXQgYXJlIG5vdCBjdXJyZW50bHkgdmlzaWJsZS5cclxuICovXHJcbkwuUG9seVV0aWwuY2xpcFBvbHlnb24gPSBmdW5jdGlvbiAocG9pbnRzLCBib3VuZHMpIHtcclxuXHR2YXIgY2xpcHBlZFBvaW50cyxcclxuXHQgICAgZWRnZXMgPSBbMSwgNCwgMiwgOF0sXHJcblx0ICAgIGksIGosIGssXHJcblx0ICAgIGEsIGIsXHJcblx0ICAgIGxlbiwgZWRnZSwgcCxcclxuXHQgICAgbHUgPSBMLkxpbmVVdGlsO1xyXG5cclxuXHRmb3IgKGkgPSAwLCBsZW4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdHBvaW50c1tpXS5fY29kZSA9IGx1Ll9nZXRCaXRDb2RlKHBvaW50c1tpXSwgYm91bmRzKTtcclxuXHR9XHJcblxyXG5cdC8vIGZvciBlYWNoIGVkZ2UgKGxlZnQsIGJvdHRvbSwgcmlnaHQsIHRvcClcclxuXHRmb3IgKGsgPSAwOyBrIDwgNDsgaysrKSB7XHJcblx0XHRlZGdlID0gZWRnZXNba107XHJcblx0XHRjbGlwcGVkUG9pbnRzID0gW107XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gcG9pbnRzLmxlbmd0aCwgaiA9IGxlbiAtIDE7IGkgPCBsZW47IGogPSBpKyspIHtcclxuXHRcdFx0YSA9IHBvaW50c1tpXTtcclxuXHRcdFx0YiA9IHBvaW50c1tqXTtcclxuXHJcblx0XHRcdC8vIGlmIGEgaXMgaW5zaWRlIHRoZSBjbGlwIHdpbmRvd1xyXG5cdFx0XHRpZiAoIShhLl9jb2RlICYgZWRnZSkpIHtcclxuXHRcdFx0XHQvLyBpZiBiIGlzIG91dHNpZGUgdGhlIGNsaXAgd2luZG93IChhLT5iIGdvZXMgb3V0IG9mIHNjcmVlbilcclxuXHRcdFx0XHRpZiAoYi5fY29kZSAmIGVkZ2UpIHtcclxuXHRcdFx0XHRcdHAgPSBsdS5fZ2V0RWRnZUludGVyc2VjdGlvbihiLCBhLCBlZGdlLCBib3VuZHMpO1xyXG5cdFx0XHRcdFx0cC5fY29kZSA9IGx1Ll9nZXRCaXRDb2RlKHAsIGJvdW5kcyk7XHJcblx0XHRcdFx0XHRjbGlwcGVkUG9pbnRzLnB1c2gocCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNsaXBwZWRQb2ludHMucHVzaChhKTtcclxuXHJcblx0XHRcdC8vIGVsc2UgaWYgYiBpcyBpbnNpZGUgdGhlIGNsaXAgd2luZG93IChhLT5iIGVudGVycyB0aGUgc2NyZWVuKVxyXG5cdFx0XHR9IGVsc2UgaWYgKCEoYi5fY29kZSAmIGVkZ2UpKSB7XHJcblx0XHRcdFx0cCA9IGx1Ll9nZXRFZGdlSW50ZXJzZWN0aW9uKGIsIGEsIGVkZ2UsIGJvdW5kcyk7XHJcblx0XHRcdFx0cC5fY29kZSA9IGx1Ll9nZXRCaXRDb2RlKHAsIGJvdW5kcyk7XHJcblx0XHRcdFx0Y2xpcHBlZFBvaW50cy5wdXNoKHApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRwb2ludHMgPSBjbGlwcGVkUG9pbnRzO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHBvaW50cztcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuUG9seWdvbiBpcyB1c2VkIHRvIGRpc3BsYXkgcG9seWdvbnMgb24gYSBtYXAuXHJcbiAqL1xyXG5cclxuTC5Qb2x5Z29uID0gTC5Qb2x5bGluZS5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGZpbGw6IHRydWVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdFx0TC5Qb2x5bGluZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xyXG5cdFx0dGhpcy5faW5pdFdpdGhIb2xlcyhsYXRsbmdzKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdFdpdGhIb2xlczogZnVuY3Rpb24gKGxhdGxuZ3MpIHtcclxuXHRcdHZhciBpLCBsZW4sIGhvbGU7XHJcblx0XHRpZiAobGF0bG5ncyAmJiBMLlV0aWwuaXNBcnJheShsYXRsbmdzWzBdKSAmJiAodHlwZW9mIGxhdGxuZ3NbMF1bMF0gIT09ICdudW1iZXInKSkge1xyXG5cdFx0XHR0aGlzLl9sYXRsbmdzID0gdGhpcy5fY29udmVydExhdExuZ3MobGF0bG5nc1swXSk7XHJcblx0XHRcdHRoaXMuX2hvbGVzID0gbGF0bG5ncy5zbGljZSgxKTtcclxuXHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuX2hvbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0aG9sZSA9IHRoaXMuX2hvbGVzW2ldID0gdGhpcy5fY29udmVydExhdExuZ3ModGhpcy5faG9sZXNbaV0pO1xyXG5cdFx0XHRcdGlmIChob2xlWzBdLmVxdWFscyhob2xlW2hvbGUubGVuZ3RoIC0gMV0pKSB7XHJcblx0XHRcdFx0XHRob2xlLnBvcCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGZpbHRlciBvdXQgbGFzdCBwb2ludCBpZiBpdHMgZXF1YWwgdG8gdGhlIGZpcnN0IG9uZVxyXG5cdFx0bGF0bG5ncyA9IHRoaXMuX2xhdGxuZ3M7XHJcblxyXG5cdFx0aWYgKGxhdGxuZ3MubGVuZ3RoID49IDIgJiYgbGF0bG5nc1swXS5lcXVhbHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSkge1xyXG5cdFx0XHRsYXRsbmdzLnBvcCgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHByb2plY3RMYXRsbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLlBvbHlsaW5lLnByb3RvdHlwZS5wcm9qZWN0TGF0bG5ncy5jYWxsKHRoaXMpO1xyXG5cclxuXHRcdC8vIHByb2plY3QgcG9seWdvbiBob2xlcyBwb2ludHNcclxuXHRcdC8vIFRPRE8gbW92ZSB0aGlzIGxvZ2ljIHRvIFBvbHlsaW5lIHRvIGdldCByaWQgb2YgZHVwbGljYXRpb25cclxuXHRcdHRoaXMuX2hvbGVQb2ludHMgPSBbXTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2hvbGVzKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBpLCBqLCBsZW4sIGxlbjI7XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGhpcy5faG9sZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dGhpcy5faG9sZVBvaW50c1tpXSA9IFtdO1xyXG5cclxuXHRcdFx0Zm9yIChqID0gMCwgbGVuMiA9IHRoaXMuX2hvbGVzW2ldLmxlbmd0aDsgaiA8IGxlbjI7IGorKykge1xyXG5cdFx0XHRcdHRoaXMuX2hvbGVQb2ludHNbaV1bal0gPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2hvbGVzW2ldW2pdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHNldExhdExuZ3M6IGZ1bmN0aW9uIChsYXRsbmdzKSB7XHJcblx0XHRpZiAobGF0bG5ncyAmJiBMLlV0aWwuaXNBcnJheShsYXRsbmdzWzBdKSAmJiAodHlwZW9mIGxhdGxuZ3NbMF1bMF0gIT09ICdudW1iZXInKSkge1xyXG5cdFx0XHR0aGlzLl9pbml0V2l0aEhvbGVzKGxhdGxuZ3MpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5yZWRyYXcoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBMLlBvbHlsaW5lLnByb3RvdHlwZS5zZXRMYXRMbmdzLmNhbGwodGhpcywgbGF0bG5ncyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2NsaXBQb2ludHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcclxuXHRcdCAgICBuZXdQYXJ0cyA9IFtdO1xyXG5cclxuXHRcdHRoaXMuX3BhcnRzID0gW3BvaW50c10uY29uY2F0KHRoaXMuX2hvbGVQb2ludHMpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubm9DbGlwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9wYXJ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR2YXIgY2xpcHBlZCA9IEwuUG9seVV0aWwuY2xpcFBvbHlnb24odGhpcy5fcGFydHNbaV0sIHRoaXMuX21hcC5fcGF0aFZpZXdwb3J0KTtcclxuXHRcdFx0aWYgKGNsaXBwZWQubGVuZ3RoKSB7XHJcblx0XHRcdFx0bmV3UGFydHMucHVzaChjbGlwcGVkKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3BhcnRzID0gbmV3UGFydHM7XHJcblx0fSxcclxuXHJcblx0X2dldFBhdGhQYXJ0U3RyOiBmdW5jdGlvbiAocG9pbnRzKSB7XHJcblx0XHR2YXIgc3RyID0gTC5Qb2x5bGluZS5wcm90b3R5cGUuX2dldFBhdGhQYXJ0U3RyLmNhbGwodGhpcywgcG9pbnRzKTtcclxuXHRcdHJldHVybiBzdHIgKyAoTC5Ccm93c2VyLnN2ZyA/ICd6JyA6ICd4Jyk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwucG9seWdvbiA9IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLlBvbHlnb24obGF0bG5ncywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBDb250YWlucyBMLk11bHRpUG9seWxpbmUgYW5kIEwuTXVsdGlQb2x5Z29uIGxheWVycy5cclxuICovXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cdGZ1bmN0aW9uIGNyZWF0ZU11bHRpKEtsYXNzKSB7XHJcblxyXG5cdFx0cmV0dXJuIEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XHJcblxyXG5cdFx0XHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdFx0XHRcdHRoaXMuX2xheWVycyA9IHt9O1xyXG5cdFx0XHRcdHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xyXG5cdFx0XHRcdHRoaXMuc2V0TGF0TG5ncyhsYXRsbmdzKTtcclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdHNldExhdExuZ3M6IGZ1bmN0aW9uIChsYXRsbmdzKSB7XHJcblx0XHRcdFx0dmFyIGkgPSAwLFxyXG5cdFx0XHRcdCAgICBsZW4gPSBsYXRsbmdzLmxlbmd0aDtcclxuXHJcblx0XHRcdFx0dGhpcy5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRcdFx0XHRpZiAoaSA8IGxlbikge1xyXG5cdFx0XHRcdFx0XHRsYXllci5zZXRMYXRMbmdzKGxhdGxuZ3NbaSsrXSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZUxheWVyKGxheWVyKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LCB0aGlzKTtcclxuXHJcblx0XHRcdFx0d2hpbGUgKGkgPCBsZW4pIHtcclxuXHRcdFx0XHRcdHRoaXMuYWRkTGF5ZXIobmV3IEtsYXNzKGxhdGxuZ3NbaSsrXSwgdGhpcy5fb3B0aW9ucykpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRnZXRMYXRMbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0dmFyIGxhdGxuZ3MgPSBbXTtcclxuXHJcblx0XHRcdFx0dGhpcy5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRcdFx0XHRsYXRsbmdzLnB1c2gobGF5ZXIuZ2V0TGF0TG5ncygpKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGxhdGxuZ3M7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0TC5NdWx0aVBvbHlsaW5lID0gY3JlYXRlTXVsdGkoTC5Qb2x5bGluZSk7XHJcblx0TC5NdWx0aVBvbHlnb24gPSBjcmVhdGVNdWx0aShMLlBvbHlnb24pO1xyXG5cclxuXHRMLm11bHRpUG9seWxpbmUgPSBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdFx0cmV0dXJuIG5ldyBMLk11bHRpUG9seWxpbmUobGF0bG5ncywgb3B0aW9ucyk7XHJcblx0fTtcclxuXHJcblx0TC5tdWx0aVBvbHlnb24gPSBmdW5jdGlvbiAobGF0bG5ncywgb3B0aW9ucykge1xyXG5cdFx0cmV0dXJuIG5ldyBMLk11bHRpUG9seWdvbihsYXRsbmdzLCBvcHRpb25zKTtcclxuXHR9O1xyXG59KCkpO1xyXG5cblxuLypcclxuICogTC5SZWN0YW5nbGUgZXh0ZW5kcyBQb2x5Z29uIGFuZCBjcmVhdGVzIGEgcmVjdGFuZ2xlIHdoZW4gcGFzc2VkIGEgTGF0TG5nQm91bmRzIG9iamVjdC5cclxuICovXHJcblxyXG5MLlJlY3RhbmdsZSA9IEwuUG9seWdvbi5leHRlbmQoe1xyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRMbmdCb3VuZHMsIG9wdGlvbnMpIHtcclxuXHRcdEwuUG9seWdvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIHRoaXMuX2JvdW5kc1RvTGF0TG5ncyhsYXRMbmdCb3VuZHMpLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRzZXRCb3VuZHM6IGZ1bmN0aW9uIChsYXRMbmdCb3VuZHMpIHtcclxuXHRcdHRoaXMuc2V0TGF0TG5ncyh0aGlzLl9ib3VuZHNUb0xhdExuZ3MobGF0TG5nQm91bmRzKSk7XHJcblx0fSxcclxuXHJcblx0X2JvdW5kc1RvTGF0TG5nczogZnVuY3Rpb24gKGxhdExuZ0JvdW5kcykge1xyXG5cdFx0bGF0TG5nQm91bmRzID0gTC5sYXRMbmdCb3VuZHMobGF0TG5nQm91bmRzKTtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdGxhdExuZ0JvdW5kcy5nZXRTb3V0aFdlc3QoKSxcclxuXHRcdFx0bGF0TG5nQm91bmRzLmdldE5vcnRoV2VzdCgpLFxyXG5cdFx0XHRsYXRMbmdCb3VuZHMuZ2V0Tm9ydGhFYXN0KCksXHJcblx0XHRcdGxhdExuZ0JvdW5kcy5nZXRTb3V0aEVhc3QoKVxyXG5cdFx0XTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5yZWN0YW5nbGUgPSBmdW5jdGlvbiAobGF0TG5nQm91bmRzLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLlJlY3RhbmdsZShsYXRMbmdCb3VuZHMsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5DaXJjbGUgaXMgYSBjaXJjbGUgb3ZlcmxheSAod2l0aCBhIGNlcnRhaW4gcmFkaXVzIGluIG1ldGVycykuXHJcbiAqL1xyXG5cclxuTC5DaXJjbGUgPSBMLlBhdGguZXh0ZW5kKHtcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5nLCByYWRpdXMsIG9wdGlvbnMpIHtcclxuXHRcdEwuUGF0aC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX2xhdGxuZyA9IEwubGF0TG5nKGxhdGxuZyk7XHJcblx0XHR0aGlzLl9tUmFkaXVzID0gcmFkaXVzO1xyXG5cdH0sXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGZpbGw6IHRydWVcclxuXHR9LFxyXG5cclxuXHRzZXRMYXRMbmc6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHRoaXMuX2xhdGxuZyA9IEwubGF0TG5nKGxhdGxuZyk7XHJcblx0XHRyZXR1cm4gdGhpcy5yZWRyYXcoKTtcclxuXHR9LFxyXG5cclxuXHRzZXRSYWRpdXM6IGZ1bmN0aW9uIChyYWRpdXMpIHtcclxuXHRcdHRoaXMuX21SYWRpdXMgPSByYWRpdXM7XHJcblx0XHRyZXR1cm4gdGhpcy5yZWRyYXcoKTtcclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0TGF0bG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxuZ1JhZGl1cyA9IHRoaXMuX2dldExuZ1JhZGl1cygpLFxyXG5cdFx0ICAgIGxhdGxuZyA9IHRoaXMuX2xhdGxuZyxcclxuXHRcdCAgICBwb2ludExlZnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KFtsYXRsbmcubGF0LCBsYXRsbmcubG5nIC0gbG5nUmFkaXVzXSk7XHJcblxyXG5cdFx0dGhpcy5fcG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyk7XHJcblx0XHR0aGlzLl9yYWRpdXMgPSBNYXRoLm1heCh0aGlzLl9wb2ludC54IC0gcG9pbnRMZWZ0LngsIDEpO1xyXG5cdH0sXHJcblxyXG5cdGdldEJvdW5kczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxuZ1JhZGl1cyA9IHRoaXMuX2dldExuZ1JhZGl1cygpLFxyXG5cdFx0ICAgIGxhdFJhZGl1cyA9ICh0aGlzLl9tUmFkaXVzIC8gNDAwNzUwMTcpICogMzYwLFxyXG5cdFx0ICAgIGxhdGxuZyA9IHRoaXMuX2xhdGxuZztcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKFxyXG5cdFx0ICAgICAgICBbbGF0bG5nLmxhdCAtIGxhdFJhZGl1cywgbGF0bG5nLmxuZyAtIGxuZ1JhZGl1c10sXHJcblx0XHQgICAgICAgIFtsYXRsbmcubGF0ICsgbGF0UmFkaXVzLCBsYXRsbmcubG5nICsgbG5nUmFkaXVzXSk7XHJcblx0fSxcclxuXHJcblx0Z2V0TGF0TG5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF0bG5nO1xyXG5cdH0sXHJcblxyXG5cdGdldFBhdGhTdHJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwID0gdGhpcy5fcG9pbnQsXHJcblx0XHQgICAgciA9IHRoaXMuX3JhZGl1cztcclxuXHJcblx0XHRpZiAodGhpcy5fY2hlY2tJZkVtcHR5KCkpIHtcclxuXHRcdFx0cmV0dXJuICcnO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIuc3ZnKSB7XHJcblx0XHRcdHJldHVybiAnTScgKyBwLnggKyAnLCcgKyAocC55IC0gcikgK1xyXG5cdFx0XHQgICAgICAgJ0EnICsgciArICcsJyArIHIgKyAnLDAsMSwxLCcgK1xyXG5cdFx0XHQgICAgICAgKHAueCAtIDAuMSkgKyAnLCcgKyAocC55IC0gcikgKyAnIHonO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cC5fcm91bmQoKTtcclxuXHRcdFx0ciA9IE1hdGgucm91bmQocik7XHJcblx0XHRcdHJldHVybiAnQUwgJyArIHAueCArICcsJyArIHAueSArICcgJyArIHIgKyAnLCcgKyByICsgJyAwLCcgKyAoNjU1MzUgKiAzNjApO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldFJhZGl1czogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX21SYWRpdXM7XHJcblx0fSxcclxuXHJcblx0Ly8gVE9ETyBFYXJ0aCBoYXJkY29kZWQsIG1vdmUgaW50byBwcm9qZWN0aW9uIGNvZGUhXHJcblxyXG5cdF9nZXRMYXRSYWRpdXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiAodGhpcy5fbVJhZGl1cyAvIDQwMDc1MDE3KSAqIDM2MDtcclxuXHR9LFxyXG5cclxuXHRfZ2V0TG5nUmFkaXVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0TGF0UmFkaXVzKCkgLyBNYXRoLmNvcyhMLkxhdExuZy5ERUdfVE9fUkFEICogdGhpcy5fbGF0bG5nLmxhdCk7XHJcblx0fSxcclxuXHJcblx0X2NoZWNrSWZFbXB0eTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9tYXApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHZwID0gdGhpcy5fbWFwLl9wYXRoVmlld3BvcnQsXHJcblx0XHQgICAgciA9IHRoaXMuX3JhZGl1cyxcclxuXHRcdCAgICBwID0gdGhpcy5fcG9pbnQ7XHJcblxyXG5cdFx0cmV0dXJuIHAueCAtIHIgPiB2cC5tYXgueCB8fCBwLnkgLSByID4gdnAubWF4LnkgfHxcclxuXHRcdCAgICAgICBwLnggKyByIDwgdnAubWluLnggfHwgcC55ICsgciA8IHZwLm1pbi55O1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmNpcmNsZSA9IGZ1bmN0aW9uIChsYXRsbmcsIHJhZGl1cywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5DaXJjbGUobGF0bG5nLCByYWRpdXMsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5DaXJjbGVNYXJrZXIgaXMgYSBjaXJjbGUgb3ZlcmxheSB3aXRoIGEgcGVybWFuZW50IHBpeGVsIHJhZGl1cy5cclxuICovXHJcblxyXG5MLkNpcmNsZU1hcmtlciA9IEwuQ2lyY2xlLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0cmFkaXVzOiAxMCxcclxuXHRcdHdlaWdodDogMlxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRsbmcsIG9wdGlvbnMpIHtcclxuXHRcdEwuQ2lyY2xlLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5nLCBudWxsLCBvcHRpb25zKTtcclxuXHRcdHRoaXMuX3JhZGl1cyA9IHRoaXMub3B0aW9ucy5yYWRpdXM7XHJcblx0fSxcclxuXHJcblx0cHJvamVjdExhdGxuZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX3BvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVTdHlsZSA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuQ2lyY2xlLnByb3RvdHlwZS5fdXBkYXRlU3R5bGUuY2FsbCh0aGlzKTtcclxuXHRcdHRoaXMuc2V0UmFkaXVzKHRoaXMub3B0aW9ucy5yYWRpdXMpO1xyXG5cdH0sXHJcblxyXG5cdHNldExhdExuZzogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0TC5DaXJjbGUucHJvdG90eXBlLnNldExhdExuZy5jYWxsKHRoaXMsIGxhdGxuZyk7XHJcblx0XHRpZiAodGhpcy5fcG9wdXAgJiYgdGhpcy5fcG9wdXAuX2lzT3Blbikge1xyXG5cdFx0XHR0aGlzLl9wb3B1cC5zZXRMYXRMbmcobGF0bG5nKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHNldFJhZGl1czogZnVuY3Rpb24gKHJhZGl1cykge1xyXG5cdFx0dGhpcy5vcHRpb25zLnJhZGl1cyA9IHRoaXMuX3JhZGl1cyA9IHJhZGl1cztcclxuXHRcdHJldHVybiB0aGlzLnJlZHJhdygpO1xyXG5cdH0sXHJcblxyXG5cdGdldFJhZGl1czogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JhZGl1cztcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jaXJjbGVNYXJrZXIgPSBmdW5jdGlvbiAobGF0bG5nLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkNpcmNsZU1hcmtlcihsYXRsbmcsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogRXh0ZW5kcyBMLlBvbHlsaW5lIHRvIGJlIGFibGUgdG8gbWFudWFsbHkgZGV0ZWN0IGNsaWNrcyBvbiBDYW52YXMtcmVuZGVyZWQgcG9seWxpbmVzLlxyXG4gKi9cclxuXHJcbkwuUG9seWxpbmUuaW5jbHVkZSghTC5QYXRoLkNBTlZBUyA/IHt9IDoge1xyXG5cdF9jb250YWluc1BvaW50OiBmdW5jdGlvbiAocCwgY2xvc2VkKSB7XHJcblx0XHR2YXIgaSwgaiwgaywgbGVuLCBsZW4yLCBkaXN0LCBwYXJ0LFxyXG5cdFx0ICAgIHcgPSB0aGlzLm9wdGlvbnMud2VpZ2h0IC8gMjtcclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLnRvdWNoKSB7XHJcblx0XHRcdHcgKz0gMTA7IC8vIHBvbHlsaW5lIGNsaWNrIHRvbGVyYW5jZSBvbiB0b3VjaCBkZXZpY2VzXHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGhpcy5fcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0cGFydCA9IHRoaXMuX3BhcnRzW2ldO1xyXG5cdFx0XHRmb3IgKGogPSAwLCBsZW4yID0gcGFydC5sZW5ndGgsIGsgPSBsZW4yIC0gMTsgaiA8IGxlbjI7IGsgPSBqKyspIHtcclxuXHRcdFx0XHRpZiAoIWNsb3NlZCAmJiAoaiA9PT0gMCkpIHtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGlzdCA9IEwuTGluZVV0aWwucG9pbnRUb1NlZ21lbnREaXN0YW5jZShwLCBwYXJ0W2tdLCBwYXJ0W2pdKTtcclxuXHJcblx0XHRcdFx0aWYgKGRpc3QgPD0gdykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEV4dGVuZHMgTC5Qb2x5Z29uIHRvIGJlIGFibGUgdG8gbWFudWFsbHkgZGV0ZWN0IGNsaWNrcyBvbiBDYW52YXMtcmVuZGVyZWQgcG9seWdvbnMuXHJcbiAqL1xyXG5cclxuTC5Qb2x5Z29uLmluY2x1ZGUoIUwuUGF0aC5DQU5WQVMgPyB7fSA6IHtcclxuXHRfY29udGFpbnNQb2ludDogZnVuY3Rpb24gKHApIHtcclxuXHRcdHZhciBpbnNpZGUgPSBmYWxzZSxcclxuXHRcdCAgICBwYXJ0LCBwMSwgcDIsXHJcblx0XHQgICAgaSwgaiwgayxcclxuXHRcdCAgICBsZW4sIGxlbjI7XHJcblxyXG5cdFx0Ly8gVE9ETyBvcHRpbWl6YXRpb246IGNoZWNrIGlmIHdpdGhpbiBib3VuZHMgZmlyc3RcclxuXHJcblx0XHRpZiAoTC5Qb2x5bGluZS5wcm90b3R5cGUuX2NvbnRhaW5zUG9pbnQuY2FsbCh0aGlzLCBwLCB0cnVlKSkge1xyXG5cdFx0XHQvLyBjbGljayBvbiBwb2x5Z29uIGJvcmRlclxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByYXkgY2FzdGluZyBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBpZiBwb2ludCBpcyBpbiBwb2x5Z29uXHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGhpcy5fcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0cGFydCA9IHRoaXMuX3BhcnRzW2ldO1xyXG5cclxuXHRcdFx0Zm9yIChqID0gMCwgbGVuMiA9IHBhcnQubGVuZ3RoLCBrID0gbGVuMiAtIDE7IGogPCBsZW4yOyBrID0gaisrKSB7XHJcblx0XHRcdFx0cDEgPSBwYXJ0W2pdO1xyXG5cdFx0XHRcdHAyID0gcGFydFtrXTtcclxuXHJcblx0XHRcdFx0aWYgKCgocDEueSA+IHAueSkgIT09IChwMi55ID4gcC55KSkgJiZcclxuXHRcdFx0XHRcdFx0KHAueCA8IChwMi54IC0gcDEueCkgKiAocC55IC0gcDEueSkgLyAocDIueSAtIHAxLnkpICsgcDEueCkpIHtcclxuXHRcdFx0XHRcdGluc2lkZSA9ICFpbnNpZGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGluc2lkZTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogRXh0ZW5kcyBMLkNpcmNsZSB3aXRoIENhbnZhcy1zcGVjaWZpYyBjb2RlLlxyXG4gKi9cclxuXHJcbkwuQ2lyY2xlLmluY2x1ZGUoIUwuUGF0aC5DQU5WQVMgPyB7fSA6IHtcclxuXHRfZHJhd1BhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwID0gdGhpcy5fcG9pbnQ7XHJcblx0XHR0aGlzLl9jdHguYmVnaW5QYXRoKCk7XHJcblx0XHR0aGlzLl9jdHguYXJjKHAueCwgcC55LCB0aGlzLl9yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcblx0fSxcclxuXHJcblx0X2NvbnRhaW5zUG9pbnQ6IGZ1bmN0aW9uIChwKSB7XHJcblx0XHR2YXIgY2VudGVyID0gdGhpcy5fcG9pbnQsXHJcblx0XHQgICAgdzIgPSB0aGlzLm9wdGlvbnMuc3Ryb2tlID8gdGhpcy5vcHRpb25zLndlaWdodCAvIDIgOiAwO1xyXG5cclxuXHRcdHJldHVybiAocC5kaXN0YW5jZVRvKGNlbnRlcikgPD0gdGhpcy5fcmFkaXVzICsgdzIpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxuICogQ2lyY2xlTWFya2VyIGNhbnZhcyBzcGVjaWZpYyBkcmF3aW5nIHBhcnRzLlxuICovXG5cbkwuQ2lyY2xlTWFya2VyLmluY2x1ZGUoIUwuUGF0aC5DQU5WQVMgPyB7fSA6IHtcblx0X3VwZGF0ZVN0eWxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5QYXRoLnByb3RvdHlwZS5fdXBkYXRlU3R5bGUuY2FsbCh0aGlzKTtcblx0fVxufSk7XG5cblxuLypcclxuICogTC5HZW9KU09OIHR1cm5zIGFueSBHZW9KU09OIGRhdGEgaW50byBhIExlYWZsZXQgbGF5ZXIuXHJcbiAqL1xyXG5cclxuTC5HZW9KU09OID0gTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGdlb2pzb24sIG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHJcblx0XHRpZiAoZ2VvanNvbikge1xyXG5cdFx0XHR0aGlzLmFkZERhdGEoZ2VvanNvbik7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0YWRkRGF0YTogZnVuY3Rpb24gKGdlb2pzb24pIHtcclxuXHRcdHZhciBmZWF0dXJlcyA9IEwuVXRpbC5pc0FycmF5KGdlb2pzb24pID8gZ2VvanNvbiA6IGdlb2pzb24uZmVhdHVyZXMsXHJcblx0XHQgICAgaSwgbGVuLCBmZWF0dXJlO1xyXG5cclxuXHRcdGlmIChmZWF0dXJlcykge1xyXG5cdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBmZWF0dXJlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdC8vIE9ubHkgYWRkIHRoaXMgaWYgZ2VvbWV0cnkgb3IgZ2VvbWV0cmllcyBhcmUgc2V0IGFuZCBub3QgbnVsbFxyXG5cdFx0XHRcdGZlYXR1cmUgPSBmZWF0dXJlc1tpXTtcclxuXHRcdFx0XHRpZiAoZmVhdHVyZS5nZW9tZXRyaWVzIHx8IGZlYXR1cmUuZ2VvbWV0cnkgfHwgZmVhdHVyZS5mZWF0dXJlcyB8fCBmZWF0dXJlLmNvb3JkaW5hdGVzKSB7XHJcblx0XHRcdFx0XHR0aGlzLmFkZERhdGEoZmVhdHVyZXNbaV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcblx0XHRpZiAob3B0aW9ucy5maWx0ZXIgJiYgIW9wdGlvbnMuZmlsdGVyKGdlb2pzb24pKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBsYXllciA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIoZ2VvanNvbiwgb3B0aW9ucy5wb2ludFRvTGF5ZXIsIG9wdGlvbnMuY29vcmRzVG9MYXRMbmcsIG9wdGlvbnMpO1xyXG5cdFx0bGF5ZXIuZmVhdHVyZSA9IEwuR2VvSlNPTi5hc0ZlYXR1cmUoZ2VvanNvbik7XHJcblxyXG5cdFx0bGF5ZXIuZGVmYXVsdE9wdGlvbnMgPSBsYXllci5vcHRpb25zO1xyXG5cdFx0dGhpcy5yZXNldFN0eWxlKGxheWVyKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5vbkVhY2hGZWF0dXJlKSB7XHJcblx0XHRcdG9wdGlvbnMub25FYWNoRmVhdHVyZShnZW9qc29uLCBsYXllcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuYWRkTGF5ZXIobGF5ZXIpO1xyXG5cdH0sXHJcblxyXG5cdHJlc2V0U3R5bGU6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0dmFyIHN0eWxlID0gdGhpcy5vcHRpb25zLnN0eWxlO1xyXG5cdFx0aWYgKHN0eWxlKSB7XHJcblx0XHRcdC8vIHJlc2V0IGFueSBjdXN0b20gc3R5bGVzXHJcblx0XHRcdEwuVXRpbC5leHRlbmQobGF5ZXIub3B0aW9ucywgbGF5ZXIuZGVmYXVsdE9wdGlvbnMpO1xyXG5cclxuXHRcdFx0dGhpcy5fc2V0TGF5ZXJTdHlsZShsYXllciwgc3R5bGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHNldFN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcclxuXHRcdHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0XHR0aGlzLl9zZXRMYXllclN0eWxlKGxheWVyLCBzdHlsZSk7XHJcblx0XHR9LCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRfc2V0TGF5ZXJTdHlsZTogZnVuY3Rpb24gKGxheWVyLCBzdHlsZSkge1xyXG5cdFx0aWYgKHR5cGVvZiBzdHlsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRzdHlsZSA9IHN0eWxlKGxheWVyLmZlYXR1cmUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGxheWVyLnNldFN0eWxlKSB7XHJcblx0XHRcdGxheWVyLnNldFN0eWxlKHN0eWxlKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5leHRlbmQoTC5HZW9KU09OLCB7XHJcblx0Z2VvbWV0cnlUb0xheWVyOiBmdW5jdGlvbiAoZ2VvanNvbiwgcG9pbnRUb0xheWVyLCBjb29yZHNUb0xhdExuZywgdmVjdG9yT3B0aW9ucykge1xyXG5cdFx0dmFyIGdlb21ldHJ5ID0gZ2VvanNvbi50eXBlID09PSAnRmVhdHVyZScgPyBnZW9qc29uLmdlb21ldHJ5IDogZ2VvanNvbixcclxuXHRcdCAgICBjb29yZHMgPSBnZW9tZXRyeS5jb29yZGluYXRlcyxcclxuXHRcdCAgICBsYXllcnMgPSBbXSxcclxuXHRcdCAgICBsYXRsbmcsIGxhdGxuZ3MsIGksIGxlbjtcclxuXHJcblx0XHRjb29yZHNUb0xhdExuZyA9IGNvb3Jkc1RvTGF0TG5nIHx8IHRoaXMuY29vcmRzVG9MYXRMbmc7XHJcblxyXG5cdFx0c3dpdGNoIChnZW9tZXRyeS50eXBlKSB7XHJcblx0XHRjYXNlICdQb2ludCc6XHJcblx0XHRcdGxhdGxuZyA9IGNvb3Jkc1RvTGF0TG5nKGNvb3Jkcyk7XHJcblx0XHRcdHJldHVybiBwb2ludFRvTGF5ZXIgPyBwb2ludFRvTGF5ZXIoZ2VvanNvbiwgbGF0bG5nKSA6IG5ldyBMLk1hcmtlcihsYXRsbmcpO1xyXG5cclxuXHRcdGNhc2UgJ011bHRpUG9pbnQnOlxyXG5cdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb29yZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRsYXRsbmcgPSBjb29yZHNUb0xhdExuZyhjb29yZHNbaV0pO1xyXG5cdFx0XHRcdGxheWVycy5wdXNoKHBvaW50VG9MYXllciA/IHBvaW50VG9MYXllcihnZW9qc29uLCBsYXRsbmcpIDogbmV3IEwuTWFya2VyKGxhdGxuZykpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBuZXcgTC5GZWF0dXJlR3JvdXAobGF5ZXJzKTtcclxuXHJcblx0XHRjYXNlICdMaW5lU3RyaW5nJzpcclxuXHRcdFx0bGF0bG5ncyA9IHRoaXMuY29vcmRzVG9MYXRMbmdzKGNvb3JkcywgMCwgY29vcmRzVG9MYXRMbmcpO1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9seWxpbmUobGF0bG5ncywgdmVjdG9yT3B0aW9ucyk7XHJcblxyXG5cdFx0Y2FzZSAnUG9seWdvbic6XHJcblx0XHRcdGlmIChjb29yZHMubGVuZ3RoID09PSAyICYmICFjb29yZHNbMV0ubGVuZ3RoKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEdlb0pTT04gb2JqZWN0LicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxhdGxuZ3MgPSB0aGlzLmNvb3Jkc1RvTGF0TG5ncyhjb29yZHMsIDEsIGNvb3Jkc1RvTGF0TG5nKTtcclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvbHlnb24obGF0bG5ncywgdmVjdG9yT3B0aW9ucyk7XHJcblxyXG5cdFx0Y2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcclxuXHRcdFx0bGF0bG5ncyA9IHRoaXMuY29vcmRzVG9MYXRMbmdzKGNvb3JkcywgMSwgY29vcmRzVG9MYXRMbmcpO1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuTXVsdGlQb2x5bGluZShsYXRsbmdzLCB2ZWN0b3JPcHRpb25zKTtcclxuXHJcblx0XHRjYXNlICdNdWx0aVBvbHlnb24nOlxyXG5cdFx0XHRsYXRsbmdzID0gdGhpcy5jb29yZHNUb0xhdExuZ3MoY29vcmRzLCAyLCBjb29yZHNUb0xhdExuZyk7XHJcblx0XHRcdHJldHVybiBuZXcgTC5NdWx0aVBvbHlnb24obGF0bG5ncywgdmVjdG9yT3B0aW9ucyk7XHJcblxyXG5cdFx0Y2FzZSAnR2VvbWV0cnlDb2xsZWN0aW9uJzpcclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gZ2VvbWV0cnkuZ2VvbWV0cmllcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cclxuXHRcdFx0XHRsYXllcnMucHVzaCh0aGlzLmdlb21ldHJ5VG9MYXllcih7XHJcblx0XHRcdFx0XHRnZW9tZXRyeTogZ2VvbWV0cnkuZ2VvbWV0cmllc1tpXSxcclxuXHRcdFx0XHRcdHR5cGU6ICdGZWF0dXJlJyxcclxuXHRcdFx0XHRcdHByb3BlcnRpZXM6IGdlb2pzb24ucHJvcGVydGllc1xyXG5cdFx0XHRcdH0sIHBvaW50VG9MYXllciwgY29vcmRzVG9MYXRMbmcsIHZlY3Rvck9wdGlvbnMpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbmV3IEwuRmVhdHVyZUdyb3VwKGxheWVycyk7XHJcblxyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEdlb0pTT04gb2JqZWN0LicpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGNvb3Jkc1RvTGF0TG5nOiBmdW5jdGlvbiAoY29vcmRzKSB7IC8vIChBcnJheVssIEJvb2xlYW5dKSAtPiBMYXRMbmdcclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcoY29vcmRzWzFdLCBjb29yZHNbMF0sIGNvb3Jkc1syXSk7XHJcblx0fSxcclxuXHJcblx0Y29vcmRzVG9MYXRMbmdzOiBmdW5jdGlvbiAoY29vcmRzLCBsZXZlbHNEZWVwLCBjb29yZHNUb0xhdExuZykgeyAvLyAoQXJyYXlbLCBOdW1iZXIsIEZ1bmN0aW9uXSkgLT4gQXJyYXlcclxuXHRcdHZhciBsYXRsbmcsIGksIGxlbixcclxuXHRcdCAgICBsYXRsbmdzID0gW107XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gY29vcmRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGxhdGxuZyA9IGxldmVsc0RlZXAgP1xyXG5cdFx0XHQgICAgICAgIHRoaXMuY29vcmRzVG9MYXRMbmdzKGNvb3Jkc1tpXSwgbGV2ZWxzRGVlcCAtIDEsIGNvb3Jkc1RvTGF0TG5nKSA6XHJcblx0XHRcdCAgICAgICAgKGNvb3Jkc1RvTGF0TG5nIHx8IHRoaXMuY29vcmRzVG9MYXRMbmcpKGNvb3Jkc1tpXSk7XHJcblxyXG5cdFx0XHRsYXRsbmdzLnB1c2gobGF0bG5nKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbGF0bG5ncztcclxuXHR9LFxyXG5cclxuXHRsYXRMbmdUb0Nvb3JkczogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0dmFyIGNvb3JkcyA9IFtsYXRsbmcubG5nLCBsYXRsbmcubGF0XTtcclxuXHJcblx0XHRpZiAobGF0bG5nLmFsdCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdGNvb3Jkcy5wdXNoKGxhdGxuZy5hbHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNvb3JkcztcclxuXHR9LFxyXG5cclxuXHRsYXRMbmdzVG9Db29yZHM6IGZ1bmN0aW9uIChsYXRMbmdzKSB7XHJcblx0XHR2YXIgY29vcmRzID0gW107XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGxhdExuZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0Y29vcmRzLnB1c2goTC5HZW9KU09OLmxhdExuZ1RvQ29vcmRzKGxhdExuZ3NbaV0pKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY29vcmRzO1xyXG5cdH0sXHJcblxyXG5cdGdldEZlYXR1cmU6IGZ1bmN0aW9uIChsYXllciwgbmV3R2VvbWV0cnkpIHtcclxuXHRcdHJldHVybiBsYXllci5mZWF0dXJlID8gTC5leHRlbmQoe30sIGxheWVyLmZlYXR1cmUsIHtnZW9tZXRyeTogbmV3R2VvbWV0cnl9KSA6IEwuR2VvSlNPTi5hc0ZlYXR1cmUobmV3R2VvbWV0cnkpO1xyXG5cdH0sXHJcblxyXG5cdGFzRmVhdHVyZTogZnVuY3Rpb24gKGdlb0pTT04pIHtcclxuXHRcdGlmIChnZW9KU09OLnR5cGUgPT09ICdGZWF0dXJlJykge1xyXG5cdFx0XHRyZXR1cm4gZ2VvSlNPTjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0eXBlOiAnRmVhdHVyZScsXHJcblx0XHRcdHByb3BlcnRpZXM6IHt9LFxyXG5cdFx0XHRnZW9tZXRyeTogZ2VvSlNPTlxyXG5cdFx0fTtcclxuXHR9XHJcbn0pO1xyXG5cclxudmFyIFBvaW50VG9HZW9KU09OID0ge1xyXG5cdHRvR2VvSlNPTjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIEwuR2VvSlNPTi5nZXRGZWF0dXJlKHRoaXMsIHtcclxuXHRcdFx0dHlwZTogJ1BvaW50JyxcclxuXHRcdFx0Y29vcmRpbmF0ZXM6IEwuR2VvSlNPTi5sYXRMbmdUb0Nvb3Jkcyh0aGlzLmdldExhdExuZygpKVxyXG5cdFx0fSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5NYXJrZXIuaW5jbHVkZShQb2ludFRvR2VvSlNPTik7XHJcbkwuQ2lyY2xlLmluY2x1ZGUoUG9pbnRUb0dlb0pTT04pO1xyXG5MLkNpcmNsZU1hcmtlci5pbmNsdWRlKFBvaW50VG9HZW9KU09OKTtcclxuXHJcbkwuUG9seWxpbmUuaW5jbHVkZSh7XHJcblx0dG9HZW9KU09OOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gTC5HZW9KU09OLmdldEZlYXR1cmUodGhpcywge1xyXG5cdFx0XHR0eXBlOiAnTGluZVN0cmluZycsXHJcblx0XHRcdGNvb3JkaW5hdGVzOiBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHRoaXMuZ2V0TGF0TG5ncygpKVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuUG9seWdvbi5pbmNsdWRlKHtcclxuXHR0b0dlb0pTT046IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb29yZHMgPSBbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyh0aGlzLmdldExhdExuZ3MoKSldLFxyXG5cdFx0ICAgIGksIGxlbiwgaG9sZTtcclxuXHJcblx0XHRjb29yZHNbMF0ucHVzaChjb29yZHNbMF1bMF0pO1xyXG5cclxuXHRcdGlmICh0aGlzLl9ob2xlcykge1xyXG5cdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aGlzLl9ob2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGhvbGUgPSBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHRoaXMuX2hvbGVzW2ldKTtcclxuXHRcdFx0XHRob2xlLnB1c2goaG9sZVswXSk7XHJcblx0XHRcdFx0Y29vcmRzLnB1c2goaG9sZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gTC5HZW9KU09OLmdldEZlYXR1cmUodGhpcywge1xyXG5cdFx0XHR0eXBlOiAnUG9seWdvbicsXHJcblx0XHRcdGNvb3JkaW5hdGVzOiBjb29yZHNcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cdGZ1bmN0aW9uIG11bHRpVG9HZW9KU09OKHR5cGUpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHZhciBjb29yZHMgPSBbXTtcclxuXHJcblx0XHRcdHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0XHRcdGNvb3Jkcy5wdXNoKGxheWVyLnRvR2VvSlNPTigpLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gTC5HZW9KU09OLmdldEZlYXR1cmUodGhpcywge1xyXG5cdFx0XHRcdHR5cGU6IHR5cGUsXHJcblx0XHRcdFx0Y29vcmRpbmF0ZXM6IGNvb3Jkc1xyXG5cdFx0XHR9KTtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRMLk11bHRpUG9seWxpbmUuaW5jbHVkZSh7dG9HZW9KU09OOiBtdWx0aVRvR2VvSlNPTignTXVsdGlMaW5lU3RyaW5nJyl9KTtcclxuXHRMLk11bHRpUG9seWdvbi5pbmNsdWRlKHt0b0dlb0pTT046IG11bHRpVG9HZW9KU09OKCdNdWx0aVBvbHlnb24nKX0pO1xyXG5cclxuXHRMLkxheWVyR3JvdXAuaW5jbHVkZSh7XHJcblx0XHR0b0dlb0pTT046IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRcdHZhciBnZW9tZXRyeSA9IHRoaXMuZmVhdHVyZSAmJiB0aGlzLmZlYXR1cmUuZ2VvbWV0cnksXHJcblx0XHRcdFx0anNvbnMgPSBbXSxcclxuXHRcdFx0XHRqc29uO1xyXG5cclxuXHRcdFx0aWYgKGdlb21ldHJ5ICYmIGdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvaW50Jykge1xyXG5cdFx0XHRcdHJldHVybiBtdWx0aVRvR2VvSlNPTignTXVsdGlQb2ludCcpLmNhbGwodGhpcyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBpc0dlb21ldHJ5Q29sbGVjdGlvbiA9IGdlb21ldHJ5ICYmIGdlb21ldHJ5LnR5cGUgPT09ICdHZW9tZXRyeUNvbGxlY3Rpb24nO1xyXG5cclxuXHRcdFx0dGhpcy5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRcdFx0aWYgKGxheWVyLnRvR2VvSlNPTikge1xyXG5cdFx0XHRcdFx0anNvbiA9IGxheWVyLnRvR2VvSlNPTigpO1xyXG5cdFx0XHRcdFx0anNvbnMucHVzaChpc0dlb21ldHJ5Q29sbGVjdGlvbiA/IGpzb24uZ2VvbWV0cnkgOiBMLkdlb0pTT04uYXNGZWF0dXJlKGpzb24pKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0aWYgKGlzR2VvbWV0cnlDb2xsZWN0aW9uKSB7XHJcblx0XHRcdFx0cmV0dXJuIEwuR2VvSlNPTi5nZXRGZWF0dXJlKHRoaXMsIHtcclxuXHRcdFx0XHRcdGdlb21ldHJpZXM6IGpzb25zLFxyXG5cdFx0XHRcdFx0dHlwZTogJ0dlb21ldHJ5Q29sbGVjdGlvbidcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxyXG5cdFx0XHRcdGZlYXR1cmVzOiBqc29uc1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59KCkpO1xyXG5cclxuTC5nZW9Kc29uID0gZnVuY3Rpb24gKGdlb2pzb24sIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuR2VvSlNPTihnZW9qc29uLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuRG9tRXZlbnQgY29udGFpbnMgZnVuY3Rpb25zIGZvciB3b3JraW5nIHdpdGggRE9NIGV2ZW50cy5cclxuICovXHJcblxyXG5MLkRvbUV2ZW50ID0ge1xyXG5cdC8qIGluc3BpcmVkIGJ5IEpvaG4gUmVzaWcsIERlYW4gRWR3YXJkcyBhbmQgWVVJIGFkZEV2ZW50IGltcGxlbWVudGF0aW9ucyAqL1xyXG5cdGFkZExpc3RlbmVyOiBmdW5jdGlvbiAob2JqLCB0eXBlLCBmbiwgY29udGV4dCkgeyAvLyAoSFRNTEVsZW1lbnQsIFN0cmluZywgRnVuY3Rpb25bLCBPYmplY3RdKVxyXG5cclxuXHRcdHZhciBpZCA9IEwuc3RhbXAoZm4pLFxyXG5cdFx0ICAgIGtleSA9ICdfbGVhZmxldF8nICsgdHlwZSArIGlkLFxyXG5cdFx0ICAgIGhhbmRsZXIsIG9yaWdpbmFsSGFuZGxlciwgbmV3VHlwZTtcclxuXHJcblx0XHRpZiAob2JqW2tleV0pIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHRoYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0cmV0dXJuIGZuLmNhbGwoY29udGV4dCB8fCBvYmosIGUgfHwgTC5Eb21FdmVudC5fZ2V0RXZlbnQoKSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIucG9pbnRlciAmJiB0eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkUG9pbnRlckxpc3RlbmVyKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKEwuQnJvd3Nlci50b3VjaCAmJiAodHlwZSA9PT0gJ2RibGNsaWNrJykgJiYgdGhpcy5hZGREb3VibGVUYXBMaXN0ZW5lcikge1xyXG5cdFx0XHR0aGlzLmFkZERvdWJsZVRhcExpc3RlbmVyKG9iaiwgaGFuZGxlciwgaWQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gb2JqKSB7XHJcblxyXG5cdFx0XHRpZiAodHlwZSA9PT0gJ21vdXNld2hlZWwnKSB7XHJcblx0XHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTU1vdXNlU2Nyb2xsJywgaGFuZGxlciwgZmFsc2UpO1xyXG5cdFx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHJcblx0XHRcdH0gZWxzZSBpZiAoKHR5cGUgPT09ICdtb3VzZWVudGVyJykgfHwgKHR5cGUgPT09ICdtb3VzZWxlYXZlJykpIHtcclxuXHJcblx0XHRcdFx0b3JpZ2luYWxIYW5kbGVyID0gaGFuZGxlcjtcclxuXHRcdFx0XHRuZXdUeXBlID0gKHR5cGUgPT09ICdtb3VzZWVudGVyJyA/ICdtb3VzZW92ZXInIDogJ21vdXNlb3V0Jyk7XHJcblxyXG5cdFx0XHRcdGhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdFx0aWYgKCFMLkRvbUV2ZW50Ll9jaGVja01vdXNlKG9iaiwgZSkpIHsgcmV0dXJuOyB9XHJcblx0XHRcdFx0XHRyZXR1cm4gb3JpZ2luYWxIYW5kbGVyKGUpO1xyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKG5ld1R5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHJcblx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NsaWNrJyAmJiBMLkJyb3dzZXIuYW5kcm9pZCkge1xyXG5cdFx0XHRcdG9yaWdpbmFsSGFuZGxlciA9IGhhbmRsZXI7XHJcblx0XHRcdFx0aGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gTC5Eb21FdmVudC5fZmlsdGVyQ2xpY2soZSwgb3JpZ2luYWxIYW5kbGVyKTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIGlmICgnYXR0YWNoRXZlbnQnIGluIG9iaikge1xyXG5cdFx0XHRvYmouYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGhhbmRsZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9ialtrZXldID0gaGFuZGxlcjtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVMaXN0ZW5lcjogZnVuY3Rpb24gKG9iaiwgdHlwZSwgZm4pIHsgIC8vIChIVE1MRWxlbWVudCwgU3RyaW5nLCBGdW5jdGlvbilcclxuXHJcblx0XHR2YXIgaWQgPSBMLnN0YW1wKGZuKSxcclxuXHRcdCAgICBrZXkgPSAnX2xlYWZsZXRfJyArIHR5cGUgKyBpZCxcclxuXHRcdCAgICBoYW5kbGVyID0gb2JqW2tleV07XHJcblxyXG5cdFx0aWYgKCFoYW5kbGVyKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyICYmIHR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHR0aGlzLnJlbW92ZVBvaW50ZXJMaXN0ZW5lcihvYmosIHR5cGUsIGlkKTtcclxuXHRcdH0gZWxzZSBpZiAoTC5Ccm93c2VyLnRvdWNoICYmICh0eXBlID09PSAnZGJsY2xpY2snKSAmJiB0aGlzLnJlbW92ZURvdWJsZVRhcExpc3RlbmVyKSB7XHJcblx0XHRcdHRoaXMucmVtb3ZlRG91YmxlVGFwTGlzdGVuZXIob2JqLCBpZCk7XHJcblxyXG5cdFx0fSBlbHNlIGlmICgncmVtb3ZlRXZlbnRMaXN0ZW5lcicgaW4gb2JqKSB7XHJcblxyXG5cdFx0XHRpZiAodHlwZSA9PT0gJ21vdXNld2hlZWwnKSB7XHJcblx0XHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTU1vdXNlU2Nyb2xsJywgaGFuZGxlciwgZmFsc2UpO1xyXG5cdFx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHJcblx0XHRcdH0gZWxzZSBpZiAoKHR5cGUgPT09ICdtb3VzZWVudGVyJykgfHwgKHR5cGUgPT09ICdtb3VzZWxlYXZlJykpIHtcclxuXHRcdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcigodHlwZSA9PT0gJ21vdXNlZW50ZXInID8gJ21vdXNlb3ZlcicgOiAnbW91c2VvdXQnKSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICgnZGV0YWNoRXZlbnQnIGluIG9iaikge1xyXG5cdFx0XHRvYmouZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGhhbmRsZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG9ialtrZXldID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzdG9wUHJvcGFnYXRpb246IGZ1bmN0aW9uIChlKSB7XHJcblxyXG5cdFx0aWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XHJcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRMLkRvbUV2ZW50Ll9za2lwcGVkKGUpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGRpc2FibGVTY3JvbGxQcm9wYWdhdGlvbjogZnVuY3Rpb24gKGVsKSB7XHJcblx0XHR2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xyXG5cclxuXHRcdHJldHVybiBMLkRvbUV2ZW50XHJcblx0XHRcdC5vbihlbCwgJ21vdXNld2hlZWwnLCBzdG9wKVxyXG5cdFx0XHQub24oZWwsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgc3RvcCk7XHJcblx0fSxcclxuXHJcblx0ZGlzYWJsZUNsaWNrUHJvcGFnYXRpb246IGZ1bmN0aW9uIChlbCkge1xyXG5cdFx0dmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gTC5EcmFnZ2FibGUuU1RBUlQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vbihlbCwgTC5EcmFnZ2FibGUuU1RBUlRbaV0sIHN0b3ApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBMLkRvbUV2ZW50XHJcblx0XHRcdC5vbihlbCwgJ2NsaWNrJywgTC5Eb21FdmVudC5fZmFrZVN0b3ApXHJcblx0XHRcdC5vbihlbCwgJ2RibGNsaWNrJywgc3RvcCk7XHJcblx0fSxcclxuXHJcblx0cHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uIChlKSB7XHJcblxyXG5cdFx0aWYgKGUucHJldmVudERlZmF1bHQpIHtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c3RvcDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHJldHVybiBMLkRvbUV2ZW50XHJcblx0XHRcdC5wcmV2ZW50RGVmYXVsdChlKVxyXG5cdFx0XHQuc3RvcFByb3BhZ2F0aW9uKGUpO1xyXG5cdH0sXHJcblxyXG5cdGdldE1vdXNlUG9zaXRpb246IGZ1bmN0aW9uIChlLCBjb250YWluZXIpIHtcclxuXHRcdGlmICghY29udGFpbmVyKSB7XHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2ludChlLmNsaWVudFgsIGUuY2xpZW50WSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHJlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KFxyXG5cdFx0XHRlLmNsaWVudFggLSByZWN0LmxlZnQgLSBjb250YWluZXIuY2xpZW50TGVmdCxcclxuXHRcdFx0ZS5jbGllbnRZIC0gcmVjdC50b3AgLSBjb250YWluZXIuY2xpZW50VG9wKTtcclxuXHR9LFxyXG5cclxuXHRnZXRXaGVlbERlbHRhOiBmdW5jdGlvbiAoZSkge1xyXG5cclxuXHRcdHZhciBkZWx0YSA9IDA7XHJcblxyXG5cdFx0aWYgKGUud2hlZWxEZWx0YSkge1xyXG5cdFx0XHRkZWx0YSA9IGUud2hlZWxEZWx0YSAvIDEyMDtcclxuXHRcdH1cclxuXHRcdGlmIChlLmRldGFpbCkge1xyXG5cdFx0XHRkZWx0YSA9IC1lLmRldGFpbCAvIDM7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGVsdGE7XHJcblx0fSxcclxuXHJcblx0X3NraXBFdmVudHM6IHt9LFxyXG5cclxuXHRfZmFrZVN0b3A6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHQvLyBmYWtlcyBzdG9wUHJvcGFnYXRpb24gYnkgc2V0dGluZyBhIHNwZWNpYWwgZXZlbnQgZmxhZywgY2hlY2tlZC9yZXNldCB3aXRoIEwuRG9tRXZlbnQuX3NraXBwZWQoZSlcclxuXHRcdEwuRG9tRXZlbnQuX3NraXBFdmVudHNbZS50eXBlXSA9IHRydWU7XHJcblx0fSxcclxuXHJcblx0X3NraXBwZWQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR2YXIgc2tpcHBlZCA9IHRoaXMuX3NraXBFdmVudHNbZS50eXBlXTtcclxuXHRcdC8vIHJlc2V0IHdoZW4gY2hlY2tpbmcsIGFzIGl0J3Mgb25seSB1c2VkIGluIG1hcCBjb250YWluZXIgYW5kIHByb3BhZ2F0ZXMgb3V0c2lkZSBvZiB0aGUgbWFwXHJcblx0XHR0aGlzLl9za2lwRXZlbnRzW2UudHlwZV0gPSBmYWxzZTtcclxuXHRcdHJldHVybiBza2lwcGVkO1xyXG5cdH0sXHJcblxyXG5cdC8vIGNoZWNrIGlmIGVsZW1lbnQgcmVhbGx5IGxlZnQvZW50ZXJlZCB0aGUgZXZlbnQgdGFyZ2V0IChmb3IgbW91c2VlbnRlci9tb3VzZWxlYXZlKVxyXG5cdF9jaGVja01vdXNlOiBmdW5jdGlvbiAoZWwsIGUpIHtcclxuXHJcblx0XHR2YXIgcmVsYXRlZCA9IGUucmVsYXRlZFRhcmdldDtcclxuXHJcblx0XHRpZiAoIXJlbGF0ZWQpIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHR3aGlsZSAocmVsYXRlZCAmJiAocmVsYXRlZCAhPT0gZWwpKSB7XHJcblx0XHRcdFx0cmVsYXRlZCA9IHJlbGF0ZWQucGFyZW50Tm9kZTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAocmVsYXRlZCAhPT0gZWwpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRFdmVudDogZnVuY3Rpb24gKCkgeyAvLyBldmlsIG1hZ2ljIGZvciBJRVxyXG5cdFx0Lypqc2hpbnQgbm9hcmc6ZmFsc2UgKi9cclxuXHRcdHZhciBlID0gd2luZG93LmV2ZW50O1xyXG5cdFx0aWYgKCFlKSB7XHJcblx0XHRcdHZhciBjYWxsZXIgPSBhcmd1bWVudHMuY2FsbGVlLmNhbGxlcjtcclxuXHRcdFx0d2hpbGUgKGNhbGxlcikge1xyXG5cdFx0XHRcdGUgPSBjYWxsZXJbJ2FyZ3VtZW50cyddWzBdO1xyXG5cdFx0XHRcdGlmIChlICYmIHdpbmRvdy5FdmVudCA9PT0gZS5jb25zdHJ1Y3Rvcikge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhbGxlciA9IGNhbGxlci5jYWxsZXI7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBlO1xyXG5cdH0sXHJcblxyXG5cdC8vIHRoaXMgaXMgYSBob3JyaWJsZSB3b3JrYXJvdW5kIGZvciBhIGJ1ZyBpbiBBbmRyb2lkIHdoZXJlIGEgc2luZ2xlIHRvdWNoIHRyaWdnZXJzIHR3byBjbGljayBldmVudHNcclxuXHRfZmlsdGVyQ2xpY2s6IGZ1bmN0aW9uIChlLCBoYW5kbGVyKSB7XHJcblx0XHR2YXIgdGltZVN0YW1wID0gKGUudGltZVN0YW1wIHx8IGUub3JpZ2luYWxFdmVudC50aW1lU3RhbXApLFxyXG5cdFx0XHRlbGFwc2VkID0gTC5Eb21FdmVudC5fbGFzdENsaWNrICYmICh0aW1lU3RhbXAgLSBMLkRvbUV2ZW50Ll9sYXN0Q2xpY2spO1xyXG5cclxuXHRcdC8vIGFyZSB0aGV5IGNsb3NlciB0b2dldGhlciB0aGFuIDUwMG1zIHlldCBtb3JlIHRoYW4gMTAwbXM/XHJcblx0XHQvLyBBbmRyb2lkIHR5cGljYWxseSB0cmlnZ2VycyB0aGVtIH4zMDBtcyBhcGFydCB3aGlsZSBtdWx0aXBsZSBsaXN0ZW5lcnNcclxuXHRcdC8vIG9uIHRoZSBzYW1lIGV2ZW50IHNob3VsZCBiZSB0cmlnZ2VyZWQgZmFyIGZhc3RlcjtcclxuXHRcdC8vIG9yIGNoZWNrIGlmIGNsaWNrIGlzIHNpbXVsYXRlZCBvbiB0aGUgZWxlbWVudCwgYW5kIGlmIGl0IGlzLCByZWplY3QgYW55IG5vbi1zaW11bGF0ZWQgZXZlbnRzXHJcblxyXG5cdFx0aWYgKChlbGFwc2VkICYmIGVsYXBzZWQgPiAxMDAgJiYgZWxhcHNlZCA8IDUwMCkgfHwgKGUudGFyZ2V0Ll9zaW11bGF0ZWRDbGljayAmJiAhZS5fc2ltdWxhdGVkKSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3AoZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdEwuRG9tRXZlbnQuX2xhc3RDbGljayA9IHRpbWVTdGFtcDtcclxuXHJcblx0XHRyZXR1cm4gaGFuZGxlcihlKTtcclxuXHR9XHJcbn07XHJcblxyXG5MLkRvbUV2ZW50Lm9uID0gTC5Eb21FdmVudC5hZGRMaXN0ZW5lcjtcclxuTC5Eb21FdmVudC5vZmYgPSBMLkRvbUV2ZW50LnJlbW92ZUxpc3RlbmVyO1xyXG5cblxuLypcclxuICogTC5EcmFnZ2FibGUgYWxsb3dzIHlvdSB0byBhZGQgZHJhZ2dpbmcgY2FwYWJpbGl0aWVzIHRvIGFueSBlbGVtZW50LiBTdXBwb3J0cyBtb2JpbGUgZGV2aWNlcyB0b28uXHJcbiAqL1xyXG5cclxuTC5EcmFnZ2FibGUgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0aW5jbHVkZXM6IEwuTWl4aW4uRXZlbnRzLFxyXG5cclxuXHRzdGF0aWNzOiB7XHJcblx0XHRTVEFSVDogTC5Ccm93c2VyLnRvdWNoID8gWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddIDogWydtb3VzZWRvd24nXSxcclxuXHRcdEVORDoge1xyXG5cdFx0XHRtb3VzZWRvd246ICdtb3VzZXVwJyxcclxuXHRcdFx0dG91Y2hzdGFydDogJ3RvdWNoZW5kJyxcclxuXHRcdFx0cG9pbnRlcmRvd246ICd0b3VjaGVuZCcsXHJcblx0XHRcdE1TUG9pbnRlckRvd246ICd0b3VjaGVuZCdcclxuXHRcdH0sXHJcblx0XHRNT1ZFOiB7XHJcblx0XHRcdG1vdXNlZG93bjogJ21vdXNlbW92ZScsXHJcblx0XHRcdHRvdWNoc3RhcnQ6ICd0b3VjaG1vdmUnLFxyXG5cdFx0XHRwb2ludGVyZG93bjogJ3RvdWNobW92ZScsXHJcblx0XHRcdE1TUG9pbnRlckRvd246ICd0b3VjaG1vdmUnXHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGVsZW1lbnQsIGRyYWdTdGFydFRhcmdldCkge1xyXG5cdFx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0XHR0aGlzLl9kcmFnU3RhcnRUYXJnZXQgPSBkcmFnU3RhcnRUYXJnZXQgfHwgZWxlbWVudDtcclxuXHR9LFxyXG5cclxuXHRlbmFibGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9lbmFibGVkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGZvciAodmFyIGkgPSBMLkRyYWdnYWJsZS5TVEFSVC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX2RyYWdTdGFydFRhcmdldCwgTC5EcmFnZ2FibGUuU1RBUlRbaV0sIHRoaXMuX29uRG93biwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fZW5hYmxlZCA9IHRydWU7XHJcblx0fSxcclxuXHJcblx0ZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9lbmFibGVkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGZvciAodmFyIGkgPSBMLkRyYWdnYWJsZS5TVEFSVC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9kcmFnU3RhcnRUYXJnZXQsIEwuRHJhZ2dhYmxlLlNUQVJUW2ldLCB0aGlzLl9vbkRvd24sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuX21vdmVkID0gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0X29uRG93bjogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHRoaXMuX21vdmVkID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKGUuc2hpZnRLZXkgfHwgKChlLndoaWNoICE9PSAxKSAmJiAoZS5idXR0b24gIT09IDEpICYmICFlLnRvdWNoZXMpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKGUpO1xyXG5cclxuXHRcdGlmIChMLkRyYWdnYWJsZS5fZGlzYWJsZWQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0TC5Eb21VdGlsLmRpc2FibGVJbWFnZURyYWcoKTtcclxuXHRcdEwuRG9tVXRpbC5kaXNhYmxlVGV4dFNlbGVjdGlvbigpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tb3ZpbmcpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIGZpcnN0ID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdIDogZTtcclxuXHJcblx0XHR0aGlzLl9zdGFydFBvaW50ID0gbmV3IEwuUG9pbnQoZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSk7XHJcblx0XHR0aGlzLl9zdGFydFBvcyA9IHRoaXMuX25ld1BvcyA9IEwuRG9tVXRpbC5nZXRQb3NpdGlvbih0aGlzLl9lbGVtZW50KTtcclxuXHJcblx0XHRMLkRvbUV2ZW50XHJcblx0XHQgICAgLm9uKGRvY3VtZW50LCBMLkRyYWdnYWJsZS5NT1ZFW2UudHlwZV0sIHRoaXMuX29uTW92ZSwgdGhpcylcclxuXHRcdCAgICAub24oZG9jdW1lbnQsIEwuRHJhZ2dhYmxlLkVORFtlLnR5cGVdLCB0aGlzLl9vblVwLCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRfb25Nb3ZlOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkge1xyXG5cdFx0XHR0aGlzLl9tb3ZlZCA9IHRydWU7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZmlyc3QgPSAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPT09IDEgPyBlLnRvdWNoZXNbMF0gOiBlKSxcclxuXHRcdCAgICBuZXdQb2ludCA9IG5ldyBMLlBvaW50KGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFkpLFxyXG5cdFx0ICAgIG9mZnNldCA9IG5ld1BvaW50LnN1YnRyYWN0KHRoaXMuX3N0YXJ0UG9pbnQpO1xyXG5cclxuXHRcdGlmICghb2Zmc2V0LnggJiYgIW9mZnNldC55KSB7IHJldHVybjsgfVxyXG5cdFx0aWYgKEwuQnJvd3Nlci50b3VjaCAmJiBNYXRoLmFicyhvZmZzZXQueCkgKyBNYXRoLmFicyhvZmZzZXQueSkgPCAzKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9tb3ZlZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2RyYWdzdGFydCcpO1xyXG5cclxuXHRcdFx0dGhpcy5fbW92ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLl9zdGFydFBvcyA9IEwuRG9tVXRpbC5nZXRQb3NpdGlvbih0aGlzLl9lbGVtZW50KS5zdWJ0cmFjdChvZmZzZXQpO1xyXG5cclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKGRvY3VtZW50LmJvZHksICdsZWFmbGV0LWRyYWdnaW5nJyk7XHJcblx0XHRcdHRoaXMuX2xhc3RUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9sYXN0VGFyZ2V0LCAnbGVhZmxldC1kcmFnLXRhcmdldCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX25ld1BvcyA9IHRoaXMuX3N0YXJ0UG9zLmFkZChvZmZzZXQpO1xyXG5cdFx0dGhpcy5fbW92aW5nID0gdHJ1ZTtcclxuXHJcblx0XHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lKHRoaXMuX2FuaW1SZXF1ZXN0KTtcclxuXHRcdHRoaXMuX2FuaW1SZXF1ZXN0ID0gTC5VdGlsLnJlcXVlc3RBbmltRnJhbWUodGhpcy5fdXBkYXRlUG9zaXRpb24sIHRoaXMsIHRydWUsIHRoaXMuX2RyYWdTdGFydFRhcmdldCk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLmZpcmUoJ3ByZWRyYWcnKTtcclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9lbGVtZW50LCB0aGlzLl9uZXdQb3MpO1xyXG5cdFx0dGhpcy5maXJlKCdkcmFnJyk7XHJcblx0fSxcclxuXHJcblx0X29uVXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAnbGVhZmxldC1kcmFnZ2luZycpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9sYXN0VGFyZ2V0KSB7XHJcblx0XHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9sYXN0VGFyZ2V0LCAnbGVhZmxldC1kcmFnLXRhcmdldCcpO1xyXG5cdFx0XHR0aGlzLl9sYXN0VGFyZ2V0ID0gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKHZhciBpIGluIEwuRHJhZ2dhYmxlLk1PVkUpIHtcclxuXHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHQgICAgLm9mZihkb2N1bWVudCwgTC5EcmFnZ2FibGUuTU9WRVtpXSwgdGhpcy5fb25Nb3ZlKVxyXG5cdFx0XHQgICAgLm9mZihkb2N1bWVudCwgTC5EcmFnZ2FibGUuRU5EW2ldLCB0aGlzLl9vblVwKTtcclxuXHRcdH1cclxuXHJcblx0XHRMLkRvbVV0aWwuZW5hYmxlSW1hZ2VEcmFnKCk7XHJcblx0XHRMLkRvbVV0aWwuZW5hYmxlVGV4dFNlbGVjdGlvbigpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tb3ZlZCAmJiB0aGlzLl9tb3ZpbmcpIHtcclxuXHRcdFx0Ly8gZW5zdXJlIGRyYWcgaXMgbm90IGZpcmVkIGFmdGVyIGRyYWdlbmRcclxuXHRcdFx0TC5VdGlsLmNhbmNlbEFuaW1GcmFtZSh0aGlzLl9hbmltUmVxdWVzdCk7XHJcblxyXG5cdFx0XHR0aGlzLmZpcmUoJ2RyYWdlbmQnLCB7XHJcblx0XHRcdFx0ZGlzdGFuY2U6IHRoaXMuX25ld1Bvcy5kaXN0YW5jZVRvKHRoaXMuX3N0YXJ0UG9zKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9tb3ZpbmcgPSBmYWxzZTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcblx0TC5IYW5kbGVyIGlzIGEgYmFzZSBjbGFzcyBmb3IgaGFuZGxlciBjbGFzc2VzIHRoYXQgYXJlIHVzZWQgaW50ZXJuYWxseSB0byBpbmplY3Rcblx0aW50ZXJhY3Rpb24gZmVhdHVyZXMgbGlrZSBkcmFnZ2luZyB0byBjbGFzc2VzIGxpa2UgTWFwIGFuZCBNYXJrZXIuXG4qL1xuXG5MLkhhbmRsZXIgPSBMLkNsYXNzLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChtYXApIHtcblx0XHR0aGlzLl9tYXAgPSBtYXA7XG5cdH0sXG5cblx0ZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX2VuYWJsZWQpIHsgcmV0dXJuOyB9XG5cblx0XHR0aGlzLl9lbmFibGVkID0gdHJ1ZTtcblx0XHR0aGlzLmFkZEhvb2tzKCk7XG5cdH0sXG5cblx0ZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5fZW5hYmxlZCkgeyByZXR1cm47IH1cblxuXHRcdHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLnJlbW92ZUhvb2tzKCk7XG5cdH0sXG5cblx0ZW5hYmxlZDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAhIXRoaXMuX2VuYWJsZWQ7XG5cdH1cbn0pO1xuXG5cbi8qXG4gKiBMLkhhbmRsZXIuTWFwRHJhZyBpcyB1c2VkIHRvIG1ha2UgdGhlIG1hcCBkcmFnZ2FibGUgKHdpdGggcGFubmluZyBpbmVydGlhKSwgZW5hYmxlZCBieSBkZWZhdWx0LlxuICovXG5cbkwuTWFwLm1lcmdlT3B0aW9ucyh7XG5cdGRyYWdnaW5nOiB0cnVlLFxuXG5cdGluZXJ0aWE6ICFMLkJyb3dzZXIuYW5kcm9pZDIzLFxuXHRpbmVydGlhRGVjZWxlcmF0aW9uOiAzNDAwLCAvLyBweC9zXjJcblx0aW5lcnRpYU1heFNwZWVkOiBJbmZpbml0eSwgLy8gcHgvc1xuXHRpbmVydGlhVGhyZXNob2xkOiBMLkJyb3dzZXIudG91Y2ggPyAzMiA6IDE4LCAvLyBtc1xuXHRlYXNlTGluZWFyaXR5OiAwLjI1LFxuXG5cdC8vIFRPRE8gcmVmYWN0b3IsIG1vdmUgdG8gQ1JTXG5cdHdvcmxkQ29weUp1bXA6IGZhbHNlXG59KTtcblxuTC5NYXAuRHJhZyA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5fZHJhZ2dhYmxlKSB7XG5cdFx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0XHR0aGlzLl9kcmFnZ2FibGUgPSBuZXcgTC5EcmFnZ2FibGUobWFwLl9tYXBQYW5lLCBtYXAuX2NvbnRhaW5lcik7XG5cblx0XHRcdHRoaXMuX2RyYWdnYWJsZS5vbih7XG5cdFx0XHRcdCdkcmFnc3RhcnQnOiB0aGlzLl9vbkRyYWdTdGFydCxcblx0XHRcdFx0J2RyYWcnOiB0aGlzLl9vbkRyYWcsXG5cdFx0XHRcdCdkcmFnZW5kJzogdGhpcy5fb25EcmFnRW5kXG5cdFx0XHR9LCB0aGlzKTtcblxuXHRcdFx0aWYgKG1hcC5vcHRpb25zLndvcmxkQ29weUp1bXApIHtcblx0XHRcdFx0dGhpcy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgdGhpcy5fb25QcmVEcmFnLCB0aGlzKTtcblx0XHRcdFx0bWFwLm9uKCd2aWV3cmVzZXQnLCB0aGlzLl9vblZpZXdSZXNldCwgdGhpcyk7XG5cblx0XHRcdFx0bWFwLndoZW5SZWFkeSh0aGlzLl9vblZpZXdSZXNldCwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuX2RyYWdnYWJsZS5lbmFibGUoKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX2RyYWdnYWJsZS5kaXNhYmxlKCk7XG5cdH0sXG5cblx0bW92ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZHJhZ2dhYmxlICYmIHRoaXMuX2RyYWdnYWJsZS5fbW92ZWQ7XG5cdH0sXG5cblx0X29uRHJhZ1N0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdGlmIChtYXAuX3BhbkFuaW0pIHtcblx0XHRcdG1hcC5fcGFuQW5pbS5zdG9wKCk7XG5cdFx0fVxuXG5cdFx0bWFwXG5cdFx0ICAgIC5maXJlKCdtb3Zlc3RhcnQnKVxuXHRcdCAgICAuZmlyZSgnZHJhZ3N0YXJ0Jyk7XG5cblx0XHRpZiAobWFwLm9wdGlvbnMuaW5lcnRpYSkge1xuXHRcdFx0dGhpcy5fcG9zaXRpb25zID0gW107XG5cdFx0XHR0aGlzLl90aW1lcyA9IFtdO1xuXHRcdH1cblx0fSxcblxuXHRfb25EcmFnOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX21hcC5vcHRpb25zLmluZXJ0aWEpIHtcblx0XHRcdHZhciB0aW1lID0gdGhpcy5fbGFzdFRpbWUgPSArbmV3IERhdGUoKSxcblx0XHRcdCAgICBwb3MgPSB0aGlzLl9sYXN0UG9zID0gdGhpcy5fZHJhZ2dhYmxlLl9uZXdQb3M7XG5cblx0XHRcdHRoaXMuX3Bvc2l0aW9ucy5wdXNoKHBvcyk7XG5cdFx0XHR0aGlzLl90aW1lcy5wdXNoKHRpbWUpO1xuXG5cdFx0XHRpZiAodGltZSAtIHRoaXMuX3RpbWVzWzBdID4gMjAwKSB7XG5cdFx0XHRcdHRoaXMuX3Bvc2l0aW9ucy5zaGlmdCgpO1xuXHRcdFx0XHR0aGlzLl90aW1lcy5zaGlmdCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX21hcFxuXHRcdCAgICAuZmlyZSgnbW92ZScpXG5cdFx0ICAgIC5maXJlKCdkcmFnJyk7XG5cdH0sXG5cblx0X29uVmlld1Jlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gVE9ETyBmaXggaGFyZGNvZGVkIEVhcnRoIHZhbHVlc1xuXHRcdHZhciBweENlbnRlciA9IHRoaXMuX21hcC5nZXRTaXplKCkuX2RpdmlkZUJ5KDIpLFxuXHRcdCAgICBweFdvcmxkQ2VudGVyID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChbMCwgMF0pO1xuXG5cdFx0dGhpcy5faW5pdGlhbFdvcmxkT2Zmc2V0ID0gcHhXb3JsZENlbnRlci5zdWJ0cmFjdChweENlbnRlcikueDtcblx0XHR0aGlzLl93b3JsZFdpZHRoID0gdGhpcy5fbWFwLnByb2plY3QoWzAsIDE4MF0pLng7XG5cdH0sXG5cblx0X29uUHJlRHJhZzogZnVuY3Rpb24gKCkge1xuXHRcdC8vIFRPRE8gcmVmYWN0b3IgdG8gYmUgYWJsZSB0byBhZGp1c3QgbWFwIHBhbmUgcG9zaXRpb24gYWZ0ZXIgem9vbVxuXHRcdHZhciB3b3JsZFdpZHRoID0gdGhpcy5fd29ybGRXaWR0aCxcblx0XHQgICAgaGFsZldpZHRoID0gTWF0aC5yb3VuZCh3b3JsZFdpZHRoIC8gMiksXG5cdFx0ICAgIGR4ID0gdGhpcy5faW5pdGlhbFdvcmxkT2Zmc2V0LFxuXHRcdCAgICB4ID0gdGhpcy5fZHJhZ2dhYmxlLl9uZXdQb3MueCxcblx0XHQgICAgbmV3WDEgPSAoeCAtIGhhbGZXaWR0aCArIGR4KSAlIHdvcmxkV2lkdGggKyBoYWxmV2lkdGggLSBkeCxcblx0XHQgICAgbmV3WDIgPSAoeCArIGhhbGZXaWR0aCArIGR4KSAlIHdvcmxkV2lkdGggLSBoYWxmV2lkdGggLSBkeCxcblx0XHQgICAgbmV3WCA9IE1hdGguYWJzKG5ld1gxICsgZHgpIDwgTWF0aC5hYnMobmV3WDIgKyBkeCkgPyBuZXdYMSA6IG5ld1gyO1xuXG5cdFx0dGhpcy5fZHJhZ2dhYmxlLl9uZXdQb3MueCA9IG5ld1g7XG5cdH0sXG5cblx0X29uRHJhZ0VuZDogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxuXHRcdCAgICBvcHRpb25zID0gbWFwLm9wdGlvbnMsXG5cdFx0ICAgIGRlbGF5ID0gK25ldyBEYXRlKCkgLSB0aGlzLl9sYXN0VGltZSxcblxuXHRcdCAgICBub0luZXJ0aWEgPSAhb3B0aW9ucy5pbmVydGlhIHx8IGRlbGF5ID4gb3B0aW9ucy5pbmVydGlhVGhyZXNob2xkIHx8ICF0aGlzLl9wb3NpdGlvbnNbMF07XG5cblx0XHRtYXAuZmlyZSgnZHJhZ2VuZCcsIGUpO1xuXG5cdFx0aWYgKG5vSW5lcnRpYSkge1xuXHRcdFx0bWFwLmZpcmUoJ21vdmVlbmQnKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHZhciBkaXJlY3Rpb24gPSB0aGlzLl9sYXN0UG9zLnN1YnRyYWN0KHRoaXMuX3Bvc2l0aW9uc1swXSksXG5cdFx0XHQgICAgZHVyYXRpb24gPSAodGhpcy5fbGFzdFRpbWUgKyBkZWxheSAtIHRoaXMuX3RpbWVzWzBdKSAvIDEwMDAsXG5cdFx0XHQgICAgZWFzZSA9IG9wdGlvbnMuZWFzZUxpbmVhcml0eSxcblxuXHRcdFx0ICAgIHNwZWVkVmVjdG9yID0gZGlyZWN0aW9uLm11bHRpcGx5QnkoZWFzZSAvIGR1cmF0aW9uKSxcblx0XHRcdCAgICBzcGVlZCA9IHNwZWVkVmVjdG9yLmRpc3RhbmNlVG8oWzAsIDBdKSxcblxuXHRcdFx0ICAgIGxpbWl0ZWRTcGVlZCA9IE1hdGgubWluKG9wdGlvbnMuaW5lcnRpYU1heFNwZWVkLCBzcGVlZCksXG5cdFx0XHQgICAgbGltaXRlZFNwZWVkVmVjdG9yID0gc3BlZWRWZWN0b3IubXVsdGlwbHlCeShsaW1pdGVkU3BlZWQgLyBzcGVlZCksXG5cblx0XHRcdCAgICBkZWNlbGVyYXRpb25EdXJhdGlvbiA9IGxpbWl0ZWRTcGVlZCAvIChvcHRpb25zLmluZXJ0aWFEZWNlbGVyYXRpb24gKiBlYXNlKSxcblx0XHRcdCAgICBvZmZzZXQgPSBsaW1pdGVkU3BlZWRWZWN0b3IubXVsdGlwbHlCeSgtZGVjZWxlcmF0aW9uRHVyYXRpb24gLyAyKS5yb3VuZCgpO1xuXG5cdFx0XHRpZiAoIW9mZnNldC54IHx8ICFvZmZzZXQueSkge1xuXHRcdFx0XHRtYXAuZmlyZSgnbW92ZWVuZCcpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvZmZzZXQgPSBtYXAuX2xpbWl0T2Zmc2V0KG9mZnNldCwgbWFwLm9wdGlvbnMubWF4Qm91bmRzKTtcblxuXHRcdFx0XHRMLlV0aWwucmVxdWVzdEFuaW1GcmFtZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0bWFwLnBhbkJ5KG9mZnNldCwge1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGRlY2VsZXJhdGlvbkR1cmF0aW9uLFxuXHRcdFx0XHRcdFx0ZWFzZUxpbmVhcml0eTogZWFzZSxcblx0XHRcdFx0XHRcdG5vTW92ZVN0YXJ0OiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSk7XG5cbkwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ2RyYWdnaW5nJywgTC5NYXAuRHJhZyk7XG5cblxuLypcbiAqIEwuSGFuZGxlci5Eb3VibGVDbGlja1pvb20gaXMgdXNlZCB0byBoYW5kbGUgZG91YmxlLWNsaWNrIHpvb20gb24gdGhlIG1hcCwgZW5hYmxlZCBieSBkZWZhdWx0LlxuICovXG5cbkwuTWFwLm1lcmdlT3B0aW9ucyh7XG5cdGRvdWJsZUNsaWNrWm9vbTogdHJ1ZVxufSk7XG5cbkwuTWFwLkRvdWJsZUNsaWNrWm9vbSA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX21hcC5vbignZGJsY2xpY2snLCB0aGlzLl9vbkRvdWJsZUNsaWNrLCB0aGlzKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX21hcC5vZmYoJ2RibGNsaWNrJywgdGhpcy5fb25Eb3VibGVDbGljaywgdGhpcyk7XG5cdH0sXG5cblx0X29uRG91YmxlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcblx0XHQgICAgem9vbSA9IG1hcC5nZXRab29tKCkgKyAoZS5vcmlnaW5hbEV2ZW50LnNoaWZ0S2V5ID8gLTEgOiAxKTtcblxuXHRcdGlmIChtYXAub3B0aW9ucy5kb3VibGVDbGlja1pvb20gPT09ICdjZW50ZXInKSB7XG5cdFx0XHRtYXAuc2V0Wm9vbSh6b29tKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWFwLnNldFpvb21Bcm91bmQoZS5jb250YWluZXJQb2ludCwgem9vbSk7XG5cdFx0fVxuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAnZG91YmxlQ2xpY2tab29tJywgTC5NYXAuRG91YmxlQ2xpY2tab29tKTtcblxuXG4vKlxuICogTC5IYW5kbGVyLlNjcm9sbFdoZWVsWm9vbSBpcyB1c2VkIGJ5IEwuTWFwIHRvIGVuYWJsZSBtb3VzZSBzY3JvbGwgd2hlZWwgem9vbSBvbiB0aGUgbWFwLlxuICovXG5cbkwuTWFwLm1lcmdlT3B0aW9ucyh7XG5cdHNjcm9sbFdoZWVsWm9vbTogdHJ1ZVxufSk7XG5cbkwuTWFwLlNjcm9sbFdoZWVsWm9vbSA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub24odGhpcy5fbWFwLl9jb250YWluZXIsICdtb3VzZXdoZWVsJywgdGhpcy5fb25XaGVlbFNjcm9sbCwgdGhpcyk7XG5cdFx0TC5Eb21FdmVudC5vbih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcblx0XHR0aGlzLl9kZWx0YSA9IDA7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ21vdXNld2hlZWwnLCB0aGlzLl9vbldoZWVsU2Nyb2xsKTtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcblx0fSxcblxuXHRfb25XaGVlbFNjcm9sbDogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGVsdGEgPSBMLkRvbUV2ZW50LmdldFdoZWVsRGVsdGEoZSk7XG5cblx0XHR0aGlzLl9kZWx0YSArPSBkZWx0YTtcblx0XHR0aGlzLl9sYXN0TW91c2VQb3MgPSB0aGlzLl9tYXAubW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQoZSk7XG5cblx0XHRpZiAoIXRoaXMuX3N0YXJ0VGltZSkge1xuXHRcdFx0dGhpcy5fc3RhcnRUaW1lID0gK25ldyBEYXRlKCk7XG5cdFx0fVxuXG5cdFx0dmFyIGxlZnQgPSBNYXRoLm1heCg0MCAtICgrbmV3IERhdGUoKSAtIHRoaXMuX3N0YXJ0VGltZSksIDApO1xuXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcblx0XHR0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoTC5iaW5kKHRoaXMuX3BlcmZvcm1ab29tLCB0aGlzKSwgbGVmdCk7XG5cblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuXHRcdEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKGUpO1xuXHR9LFxuXG5cdF9wZXJmb3JtWm9vbTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXG5cdFx0ICAgIGRlbHRhID0gdGhpcy5fZGVsdGEsXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xuXG5cdFx0ZGVsdGEgPSBkZWx0YSA+IDAgPyBNYXRoLmNlaWwoZGVsdGEpIDogTWF0aC5mbG9vcihkZWx0YSk7XG5cdFx0ZGVsdGEgPSBNYXRoLm1heChNYXRoLm1pbihkZWx0YSwgNCksIC00KTtcblx0XHRkZWx0YSA9IG1hcC5fbGltaXRab29tKHpvb20gKyBkZWx0YSkgLSB6b29tO1xuXG5cdFx0dGhpcy5fZGVsdGEgPSAwO1xuXHRcdHRoaXMuX3N0YXJ0VGltZSA9IG51bGw7XG5cblx0XHRpZiAoIWRlbHRhKSB7IHJldHVybjsgfVxuXG5cdFx0aWYgKG1hcC5vcHRpb25zLnNjcm9sbFdoZWVsWm9vbSA9PT0gJ2NlbnRlcicpIHtcblx0XHRcdG1hcC5zZXRab29tKHpvb20gKyBkZWx0YSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1hcC5zZXRab29tQXJvdW5kKHRoaXMuX2xhc3RNb3VzZVBvcywgem9vbSArIGRlbHRhKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5MLk1hcC5hZGRJbml0SG9vaygnYWRkSGFuZGxlcicsICdzY3JvbGxXaGVlbFpvb20nLCBMLk1hcC5TY3JvbGxXaGVlbFpvb20pO1xuXG5cbi8qXHJcbiAqIEV4dGVuZHMgdGhlIGV2ZW50IGhhbmRsaW5nIGNvZGUgd2l0aCBkb3VibGUgdGFwIHN1cHBvcnQgZm9yIG1vYmlsZSBicm93c2Vycy5cclxuICovXHJcblxyXG5MLmV4dGVuZChMLkRvbUV2ZW50LCB7XHJcblxyXG5cdF90b3VjaHN0YXJ0OiBMLkJyb3dzZXIubXNQb2ludGVyID8gJ01TUG9pbnRlckRvd24nIDogTC5Ccm93c2VyLnBvaW50ZXIgPyAncG9pbnRlcmRvd24nIDogJ3RvdWNoc3RhcnQnLFxyXG5cdF90b3VjaGVuZDogTC5Ccm93c2VyLm1zUG9pbnRlciA/ICdNU1BvaW50ZXJVcCcgOiBMLkJyb3dzZXIucG9pbnRlciA/ICdwb2ludGVydXAnIDogJ3RvdWNoZW5kJyxcclxuXHJcblx0Ly8gaW5zcGlyZWQgYnkgWmVwdG8gdG91Y2ggY29kZSBieSBUaG9tYXMgRnVjaHNcclxuXHRhZGREb3VibGVUYXBMaXN0ZW5lcjogZnVuY3Rpb24gKG9iaiwgaGFuZGxlciwgaWQpIHtcclxuXHRcdHZhciBsYXN0LFxyXG5cdFx0ICAgIGRvdWJsZVRhcCA9IGZhbHNlLFxyXG5cdFx0ICAgIGRlbGF5ID0gMjUwLFxyXG5cdFx0ICAgIHRvdWNoLFxyXG5cdFx0ICAgIHByZSA9ICdfbGVhZmxldF8nLFxyXG5cdFx0ICAgIHRvdWNoc3RhcnQgPSB0aGlzLl90b3VjaHN0YXJ0LFxyXG5cdFx0ICAgIHRvdWNoZW5kID0gdGhpcy5fdG91Y2hlbmQsXHJcblx0XHQgICAgdHJhY2tlZFRvdWNoZXMgPSBbXTtcclxuXHJcblx0XHRmdW5jdGlvbiBvblRvdWNoU3RhcnQoZSkge1xyXG5cdFx0XHR2YXIgY291bnQ7XHJcblxyXG5cdFx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIpIHtcclxuXHRcdFx0XHR0cmFja2VkVG91Y2hlcy5wdXNoKGUucG9pbnRlcklkKTtcclxuXHRcdFx0XHRjb3VudCA9IHRyYWNrZWRUb3VjaGVzLmxlbmd0aDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb3VudCA9IGUudG91Y2hlcy5sZW5ndGg7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGNvdW50ID4gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIG5vdyA9IERhdGUubm93KCksXHJcblx0XHRcdFx0ZGVsdGEgPSBub3cgLSAobGFzdCB8fCBub3cpO1xyXG5cclxuXHRcdFx0dG91Y2ggPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0gOiBlO1xyXG5cdFx0XHRkb3VibGVUYXAgPSAoZGVsdGEgPiAwICYmIGRlbHRhIDw9IGRlbGF5KTtcclxuXHRcdFx0bGFzdCA9IG5vdztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBvblRvdWNoRW5kKGUpIHtcclxuXHRcdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyKSB7XHJcblx0XHRcdFx0dmFyIGlkeCA9IHRyYWNrZWRUb3VjaGVzLmluZGV4T2YoZS5wb2ludGVySWQpO1xyXG5cdFx0XHRcdGlmIChpZHggPT09IC0xKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRyYWNrZWRUb3VjaGVzLnNwbGljZShpZHgsIDEpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoZG91YmxlVGFwKSB7XHJcblx0XHRcdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyKSB7XHJcblx0XHRcdFx0XHQvLyB3b3JrIGFyb3VuZCAudHlwZSBiZWluZyByZWFkb25seSB3aXRoIE1TUG9pbnRlciogZXZlbnRzXHJcblx0XHRcdFx0XHR2YXIgbmV3VG91Y2ggPSB7IH0sXHJcblx0XHRcdFx0XHRcdHByb3A7XHJcblxyXG5cdFx0XHRcdFx0Ly8ganNoaW50IGZvcmluOmZhbHNlXHJcblx0XHRcdFx0XHRmb3IgKHZhciBpIGluIHRvdWNoKSB7XHJcblx0XHRcdFx0XHRcdHByb3AgPSB0b3VjaFtpXTtcclxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3VG91Y2hbaV0gPSBwcm9wLmJpbmQodG91Y2gpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdG5ld1RvdWNoW2ldID0gcHJvcDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dG91Y2ggPSBuZXdUb3VjaDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dG91Y2gudHlwZSA9ICdkYmxjbGljayc7XHJcblx0XHRcdFx0aGFuZGxlcih0b3VjaCk7XHJcblx0XHRcdFx0bGFzdCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdG9ialtwcmUgKyB0b3VjaHN0YXJ0ICsgaWRdID0gb25Ub3VjaFN0YXJ0O1xyXG5cdFx0b2JqW3ByZSArIHRvdWNoZW5kICsgaWRdID0gb25Ub3VjaEVuZDtcclxuXHJcblx0XHQvLyBvbiBwb2ludGVyIHdlIG5lZWQgdG8gbGlzdGVuIG9uIHRoZSBkb2N1bWVudCwgb3RoZXJ3aXNlIGEgZHJhZyBzdGFydGluZyBvbiB0aGUgbWFwIGFuZCBtb3Zpbmcgb2ZmIHNjcmVlblxyXG5cdFx0Ly8gd2lsbCBub3QgY29tZSB0aHJvdWdoIHRvIHVzLCBzbyB3ZSB3aWxsIGxvc2UgdHJhY2sgb2YgaG93IG1hbnkgdG91Y2hlcyBhcmUgb25nb2luZ1xyXG5cdFx0dmFyIGVuZEVsZW1lbnQgPSBMLkJyb3dzZXIucG9pbnRlciA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IG9iajtcclxuXHJcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0b3VjaHN0YXJ0LCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcclxuXHRcdGVuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaGVuZCwgb25Ub3VjaEVuZCwgZmFsc2UpO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIucG9pbnRlcikge1xyXG5cdFx0XHRlbmRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoTC5Eb21FdmVudC5QT0lOVEVSX0NBTkNFTCwgb25Ub3VjaEVuZCwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZURvdWJsZVRhcExpc3RlbmVyOiBmdW5jdGlvbiAob2JqLCBpZCkge1xyXG5cdFx0dmFyIHByZSA9ICdfbGVhZmxldF8nO1xyXG5cclxuXHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuX3RvdWNoc3RhcnQsIG9ialtwcmUgKyB0aGlzLl90b3VjaHN0YXJ0ICsgaWRdLCBmYWxzZSk7XHJcblx0XHQoTC5Ccm93c2VyLnBvaW50ZXIgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBvYmopLnJlbW92ZUV2ZW50TGlzdGVuZXIoXHJcblx0XHQgICAgICAgIHRoaXMuX3RvdWNoZW5kLCBvYmpbcHJlICsgdGhpcy5fdG91Y2hlbmQgKyBpZF0sIGZhbHNlKTtcclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIpIHtcclxuXHRcdFx0ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoTC5Eb21FdmVudC5QT0lOVEVSX0NBTkNFTCwgb2JqW3ByZSArIHRoaXMuX3RvdWNoZW5kICsgaWRdLFxyXG5cdFx0XHRcdGZhbHNlKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcbiAqIEV4dGVuZHMgTC5Eb21FdmVudCB0byBwcm92aWRlIHRvdWNoIHN1cHBvcnQgZm9yIEludGVybmV0IEV4cGxvcmVyIGFuZCBXaW5kb3dzLWJhc2VkIGRldmljZXMuXG4gKi9cblxuTC5leHRlbmQoTC5Eb21FdmVudCwge1xuXG5cdC8vc3RhdGljXG5cdFBPSU5URVJfRE9XTjogTC5Ccm93c2VyLm1zUG9pbnRlciA/ICdNU1BvaW50ZXJEb3duJyA6ICdwb2ludGVyZG93bicsXG5cdFBPSU5URVJfTU9WRTogTC5Ccm93c2VyLm1zUG9pbnRlciA/ICdNU1BvaW50ZXJNb3ZlJyA6ICdwb2ludGVybW92ZScsXG5cdFBPSU5URVJfVVA6IEwuQnJvd3Nlci5tc1BvaW50ZXIgPyAnTVNQb2ludGVyVXAnIDogJ3BvaW50ZXJ1cCcsXG5cdFBPSU5URVJfQ0FOQ0VMOiBMLkJyb3dzZXIubXNQb2ludGVyID8gJ01TUG9pbnRlckNhbmNlbCcgOiAncG9pbnRlcmNhbmNlbCcsXG5cblx0X3BvaW50ZXJzOiBbXSxcblx0X3BvaW50ZXJEb2N1bWVudExpc3RlbmVyOiBmYWxzZSxcblxuXHQvLyBQcm92aWRlcyBhIHRvdWNoIGV2ZW50cyB3cmFwcGVyIGZvciAobXMpcG9pbnRlciBldmVudHMuXG5cdC8vIEJhc2VkIG9uIGNoYW5nZXMgYnkgdmVwcm96YSBodHRwczovL2dpdGh1Yi5jb20vQ2xvdWRNYWRlL0xlYWZsZXQvcHVsbC8xMDE5XG5cdC8vcmVmIGh0dHA6Ly93d3cudzMub3JnL1RSL3BvaW50ZXJldmVudHMvIGh0dHBzOi8vd3d3LnczLm9yZy9CdWdzL1B1YmxpYy9zaG93X2J1Zy5jZ2k/aWQ9MjI4OTBcblxuXHRhZGRQb2ludGVyTGlzdGVuZXI6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGhhbmRsZXIsIGlkKSB7XG5cblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRjYXNlICd0b3VjaHN0YXJ0Jzpcblx0XHRcdHJldHVybiB0aGlzLmFkZFBvaW50ZXJMaXN0ZW5lclN0YXJ0KG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpO1xuXHRcdGNhc2UgJ3RvdWNoZW5kJzpcblx0XHRcdHJldHVybiB0aGlzLmFkZFBvaW50ZXJMaXN0ZW5lckVuZChvYmosIHR5cGUsIGhhbmRsZXIsIGlkKTtcblx0XHRjYXNlICd0b3VjaG1vdmUnOlxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkUG9pbnRlckxpc3RlbmVyTW92ZShvYmosIHR5cGUsIGhhbmRsZXIsIGlkKTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgJ1Vua25vd24gdG91Y2ggZXZlbnQgdHlwZSc7XG5cdFx0fVxuXHR9LFxuXG5cdGFkZFBvaW50ZXJMaXN0ZW5lclN0YXJ0OiBmdW5jdGlvbiAob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCkge1xuXHRcdHZhciBwcmUgPSAnX2xlYWZsZXRfJyxcblx0XHQgICAgcG9pbnRlcnMgPSB0aGlzLl9wb2ludGVycztcblxuXHRcdHZhciBjYiA9IGZ1bmN0aW9uIChlKSB7XG5cblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG5cblx0XHRcdHZhciBhbHJlYWR5SW5BcnJheSA9IGZhbHNlO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocG9pbnRlcnNbaV0ucG9pbnRlcklkID09PSBlLnBvaW50ZXJJZCkge1xuXHRcdFx0XHRcdGFscmVhZHlJbkFycmF5ID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKCFhbHJlYWR5SW5BcnJheSkge1xuXHRcdFx0XHRwb2ludGVycy5wdXNoKGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRlLnRvdWNoZXMgPSBwb2ludGVycy5zbGljZSgpO1xuXHRcdFx0ZS5jaGFuZ2VkVG91Y2hlcyA9IFtlXTtcblxuXHRcdFx0aGFuZGxlcihlKTtcblx0XHR9O1xuXG5cdFx0b2JqW3ByZSArICd0b3VjaHN0YXJ0JyArIGlkXSA9IGNiO1xuXHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9ET1dOLCBjYiwgZmFsc2UpO1xuXG5cdFx0Ly8gbmVlZCB0byBhbHNvIGxpc3RlbiBmb3IgZW5kIGV2ZW50cyB0byBrZWVwIHRoZSBfcG9pbnRlcnMgbGlzdCBhY2N1cmF0ZVxuXHRcdC8vIHRoaXMgbmVlZHMgdG8gYmUgb24gdGhlIGJvZHkgYW5kIG5ldmVyIGdvIGF3YXlcblx0XHRpZiAoIXRoaXMuX3BvaW50ZXJEb2N1bWVudExpc3RlbmVyKSB7XG5cdFx0XHR2YXIgaW50ZXJuYWxDYiA9IGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAocG9pbnRlcnNbaV0ucG9pbnRlcklkID09PSBlLnBvaW50ZXJJZCkge1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0Ly9XZSBsaXN0ZW4gb24gdGhlIGRvY3VtZW50RWxlbWVudCBhcyBhbnkgZHJhZ3MgdGhhdCBlbmQgYnkgbW92aW5nIHRoZSB0b3VjaCBvZmYgdGhlIHNjcmVlbiBnZXQgZmlyZWQgdGhlcmVcblx0XHRcdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9VUCwgaW50ZXJuYWxDYiwgZmFsc2UpO1xuXHRcdFx0ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX0NBTkNFTCwgaW50ZXJuYWxDYiwgZmFsc2UpO1xuXG5cdFx0XHR0aGlzLl9wb2ludGVyRG9jdW1lbnRMaXN0ZW5lciA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkUG9pbnRlckxpc3RlbmVyTW92ZTogZnVuY3Rpb24gKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpIHtcblx0XHR2YXIgcHJlID0gJ19sZWFmbGV0XycsXG5cdFx0ICAgIHRvdWNoZXMgPSB0aGlzLl9wb2ludGVycztcblxuXHRcdGZ1bmN0aW9uIGNiKGUpIHtcblxuXHRcdFx0Ly8gZG9uJ3QgZmlyZSB0b3VjaCBtb3ZlcyB3aGVuIG1vdXNlIGlzbid0IGRvd25cblx0XHRcdGlmICgoZS5wb2ludGVyVHlwZSA9PT0gZS5NU1BPSU5URVJfVFlQRV9NT1VTRSB8fCBlLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKSAmJiBlLmJ1dHRvbnMgPT09IDApIHsgcmV0dXJuOyB9XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAodG91Y2hlc1tpXS5wb2ludGVySWQgPT09IGUucG9pbnRlcklkKSB7XG5cdFx0XHRcdFx0dG91Y2hlc1tpXSA9IGU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZS50b3VjaGVzID0gdG91Y2hlcy5zbGljZSgpO1xuXHRcdFx0ZS5jaGFuZ2VkVG91Y2hlcyA9IFtlXTtcblxuXHRcdFx0aGFuZGxlcihlKTtcblx0XHR9XG5cblx0XHRvYmpbcHJlICsgJ3RvdWNobW92ZScgKyBpZF0gPSBjYjtcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfTU9WRSwgY2IsIGZhbHNlKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZFBvaW50ZXJMaXN0ZW5lckVuZDogZnVuY3Rpb24gKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpIHtcblx0XHR2YXIgcHJlID0gJ19sZWFmbGV0XycsXG5cdFx0ICAgIHRvdWNoZXMgPSB0aGlzLl9wb2ludGVycztcblxuXHRcdHZhciBjYiA9IGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHRvdWNoZXNbaV0ucG9pbnRlcklkID09PSBlLnBvaW50ZXJJZCkge1xuXHRcdFx0XHRcdHRvdWNoZXMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGUudG91Y2hlcyA9IHRvdWNoZXMuc2xpY2UoKTtcblx0XHRcdGUuY2hhbmdlZFRvdWNoZXMgPSBbZV07XG5cblx0XHRcdGhhbmRsZXIoZSk7XG5cdFx0fTtcblxuXHRcdG9ialtwcmUgKyAndG91Y2hlbmQnICsgaWRdID0gY2I7XG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX1VQLCBjYiwgZmFsc2UpO1xuXHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9DQU5DRUwsIGNiLCBmYWxzZSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZW1vdmVQb2ludGVyTGlzdGVuZXI6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGlkKSB7XG5cdFx0dmFyIHByZSA9ICdfbGVhZmxldF8nLFxuXHRcdCAgICBjYiA9IG9ialtwcmUgKyB0eXBlICsgaWRdO1xuXG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0Y2FzZSAndG91Y2hzdGFydCc6XG5cdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfRE9XTiwgY2IsIGZhbHNlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ3RvdWNobW92ZSc6XG5cdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfTU9WRSwgY2IsIGZhbHNlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ3RvdWNoZW5kJzpcblx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9VUCwgY2IsIGZhbHNlKTtcblx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9DQU5DRUwsIGNiLCBmYWxzZSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cblxuLypcbiAqIEwuSGFuZGxlci5Ub3VjaFpvb20gaXMgdXNlZCBieSBMLk1hcCB0byBhZGQgcGluY2ggem9vbSBvbiBzdXBwb3J0ZWQgbW9iaWxlIGJyb3dzZXJzLlxuICovXG5cbkwuTWFwLm1lcmdlT3B0aW9ucyh7XG5cdHRvdWNoWm9vbTogTC5Ccm93c2VyLnRvdWNoICYmICFMLkJyb3dzZXIuYW5kcm9pZDIzLFxuXHRib3VuY2VBdFpvb21MaW1pdHM6IHRydWVcbn0pO1xuXG5MLk1hcC5Ub3VjaFpvb20gPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX21hcC5fY29udGFpbmVyLCAndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCwgdGhpcyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoU3RhcnQsIHRoaXMpO1xuXHR9LFxuXG5cdF9vblRvdWNoU3RhcnQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdGlmICghZS50b3VjaGVzIHx8IGUudG91Y2hlcy5sZW5ndGggIT09IDIgfHwgbWFwLl9hbmltYXRpbmdab29tIHx8IHRoaXMuX3pvb21pbmcpIHsgcmV0dXJuOyB9XG5cblx0XHR2YXIgcDEgPSBtYXAubW91c2VFdmVudFRvTGF5ZXJQb2ludChlLnRvdWNoZXNbMF0pLFxuXHRcdCAgICBwMiA9IG1hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUudG91Y2hlc1sxXSksXG5cdFx0ICAgIHZpZXdDZW50ZXIgPSBtYXAuX2dldENlbnRlckxheWVyUG9pbnQoKTtcblxuXHRcdHRoaXMuX3N0YXJ0Q2VudGVyID0gcDEuYWRkKHAyKS5fZGl2aWRlQnkoMik7XG5cdFx0dGhpcy5fc3RhcnREaXN0ID0gcDEuZGlzdGFuY2VUbyhwMik7XG5cblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX3pvb21pbmcgPSB0cnVlO1xuXG5cdFx0dGhpcy5fY2VudGVyT2Zmc2V0ID0gdmlld0NlbnRlci5zdWJ0cmFjdCh0aGlzLl9zdGFydENlbnRlcik7XG5cblx0XHRpZiAobWFwLl9wYW5BbmltKSB7XG5cdFx0XHRtYXAuX3BhbkFuaW0uc3RvcCgpO1xuXHRcdH1cblxuXHRcdEwuRG9tRXZlbnRcblx0XHQgICAgLm9uKGRvY3VtZW50LCAndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUsIHRoaXMpXG5cdFx0ICAgIC5vbihkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCwgdGhpcyk7XG5cblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuXHR9LFxuXG5cdF9vblRvdWNoTW92ZTogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0aWYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCAhPT0gMiB8fCAhdGhpcy5fem9vbWluZykgeyByZXR1cm47IH1cblxuXHRcdHZhciBwMSA9IG1hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUudG91Y2hlc1swXSksXG5cdFx0ICAgIHAyID0gbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZS50b3VjaGVzWzFdKTtcblxuXHRcdHRoaXMuX3NjYWxlID0gcDEuZGlzdGFuY2VUbyhwMikgLyB0aGlzLl9zdGFydERpc3Q7XG5cdFx0dGhpcy5fZGVsdGEgPSBwMS5fYWRkKHAyKS5fZGl2aWRlQnkoMikuX3N1YnRyYWN0KHRoaXMuX3N0YXJ0Q2VudGVyKTtcblxuXHRcdGlmICh0aGlzLl9zY2FsZSA9PT0gMSkgeyByZXR1cm47IH1cblxuXHRcdGlmICghbWFwLm9wdGlvbnMuYm91bmNlQXRab29tTGltaXRzKSB7XG5cdFx0XHRpZiAoKG1hcC5nZXRab29tKCkgPT09IG1hcC5nZXRNaW5ab29tKCkgJiYgdGhpcy5fc2NhbGUgPCAxKSB8fFxuXHRcdFx0ICAgIChtYXAuZ2V0Wm9vbSgpID09PSBtYXAuZ2V0TWF4Wm9vbSgpICYmIHRoaXMuX3NjYWxlID4gMSkpIHsgcmV0dXJuOyB9XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLl9tb3ZlZCkge1xuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKG1hcC5fbWFwUGFuZSwgJ2xlYWZsZXQtdG91Y2hpbmcnKTtcblxuXHRcdFx0bWFwXG5cdFx0XHQgICAgLmZpcmUoJ21vdmVzdGFydCcpXG5cdFx0XHQgICAgLmZpcmUoJ3pvb21zdGFydCcpO1xuXG5cdFx0XHR0aGlzLl9tb3ZlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0TC5VdGlsLmNhbmNlbEFuaW1GcmFtZSh0aGlzLl9hbmltUmVxdWVzdCk7XG5cdFx0dGhpcy5fYW5pbVJlcXVlc3QgPSBMLlV0aWwucmVxdWVzdEFuaW1GcmFtZShcblx0XHQgICAgICAgIHRoaXMuX3VwZGF0ZU9uTW92ZSwgdGhpcywgdHJ1ZSwgdGhpcy5fbWFwLl9jb250YWluZXIpO1xuXG5cdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcblx0fSxcblxuXHRfdXBkYXRlT25Nb3ZlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcblx0XHQgICAgb3JpZ2luID0gdGhpcy5fZ2V0U2NhbGVPcmlnaW4oKSxcblx0XHQgICAgY2VudGVyID0gbWFwLmxheWVyUG9pbnRUb0xhdExuZyhvcmlnaW4pLFxuXHRcdCAgICB6b29tID0gbWFwLmdldFNjYWxlWm9vbSh0aGlzLl9zY2FsZSk7XG5cblx0XHRtYXAuX2FuaW1hdGVab29tKGNlbnRlciwgem9vbSwgdGhpcy5fc3RhcnRDZW50ZXIsIHRoaXMuX3NjYWxlLCB0aGlzLl9kZWx0YSwgZmFsc2UsIHRydWUpO1xuXHR9LFxuXG5cdF9vblRvdWNoRW5kOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLl9tb3ZlZCB8fCAhdGhpcy5fem9vbWluZykge1xuXHRcdFx0dGhpcy5fem9vbWluZyA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHR0aGlzLl96b29taW5nID0gZmFsc2U7XG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKG1hcC5fbWFwUGFuZSwgJ2xlYWZsZXQtdG91Y2hpbmcnKTtcblx0XHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lKHRoaXMuX2FuaW1SZXF1ZXN0KTtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKVxuXHRcdCAgICAub2ZmKGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoRW5kKTtcblxuXHRcdHZhciBvcmlnaW4gPSB0aGlzLl9nZXRTY2FsZU9yaWdpbigpLFxuXHRcdCAgICBjZW50ZXIgPSBtYXAubGF5ZXJQb2ludFRvTGF0TG5nKG9yaWdpbiksXG5cblx0XHQgICAgb2xkWm9vbSA9IG1hcC5nZXRab29tKCksXG5cdFx0ICAgIGZsb2F0Wm9vbURlbHRhID0gbWFwLmdldFNjYWxlWm9vbSh0aGlzLl9zY2FsZSkgLSBvbGRab29tLFxuXHRcdCAgICByb3VuZFpvb21EZWx0YSA9IChmbG9hdFpvb21EZWx0YSA+IDAgP1xuXHRcdCAgICAgICAgICAgIE1hdGguY2VpbChmbG9hdFpvb21EZWx0YSkgOiBNYXRoLmZsb29yKGZsb2F0Wm9vbURlbHRhKSksXG5cblx0XHQgICAgem9vbSA9IG1hcC5fbGltaXRab29tKG9sZFpvb20gKyByb3VuZFpvb21EZWx0YSksXG5cdFx0ICAgIHNjYWxlID0gbWFwLmdldFpvb21TY2FsZSh6b29tKSAvIHRoaXMuX3NjYWxlO1xuXG5cdFx0bWFwLl9hbmltYXRlWm9vbShjZW50ZXIsIHpvb20sIG9yaWdpbiwgc2NhbGUpO1xuXHR9LFxuXG5cdF9nZXRTY2FsZU9yaWdpbjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjZW50ZXJPZmZzZXQgPSB0aGlzLl9jZW50ZXJPZmZzZXQuc3VidHJhY3QodGhpcy5fZGVsdGEpLmRpdmlkZUJ5KHRoaXMuX3NjYWxlKTtcblx0XHRyZXR1cm4gdGhpcy5fc3RhcnRDZW50ZXIuYWRkKGNlbnRlck9mZnNldCk7XG5cdH1cbn0pO1xuXG5MLk1hcC5hZGRJbml0SG9vaygnYWRkSGFuZGxlcicsICd0b3VjaFpvb20nLCBMLk1hcC5Ub3VjaFpvb20pO1xuXG5cbi8qXG4gKiBMLk1hcC5UYXAgaXMgdXNlZCB0byBlbmFibGUgbW9iaWxlIGhhY2tzIGxpa2UgcXVpY2sgdGFwcyBhbmQgbG9uZyBob2xkLlxuICovXG5cbkwuTWFwLm1lcmdlT3B0aW9ucyh7XG5cdHRhcDogdHJ1ZSxcblx0dGFwVG9sZXJhbmNlOiAxNVxufSk7XG5cbkwuTWFwLlRhcCA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub24odGhpcy5fbWFwLl9jb250YWluZXIsICd0b3VjaHN0YXJ0JywgdGhpcy5fb25Eb3duLCB0aGlzKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub2ZmKHRoaXMuX21hcC5fY29udGFpbmVyLCAndG91Y2hzdGFydCcsIHRoaXMuX29uRG93biwgdGhpcyk7XG5cdH0sXG5cblx0X29uRG93bjogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoIWUudG91Y2hlcykgeyByZXR1cm47IH1cblxuXHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG5cblx0XHR0aGlzLl9maXJlQ2xpY2sgPSB0cnVlO1xuXG5cdFx0Ly8gZG9uJ3Qgc2ltdWxhdGUgY2xpY2sgb3IgdHJhY2sgbG9uZ3ByZXNzIGlmIG1vcmUgdGhhbiAxIHRvdWNoXG5cdFx0aWYgKGUudG91Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHR0aGlzLl9maXJlQ2xpY2sgPSBmYWxzZTtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9ob2xkVGltZW91dCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGZpcnN0ID0gZS50b3VjaGVzWzBdLFxuXHRcdCAgICBlbCA9IGZpcnN0LnRhcmdldDtcblxuXHRcdHRoaXMuX3N0YXJ0UG9zID0gdGhpcy5fbmV3UG9zID0gbmV3IEwuUG9pbnQoZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSk7XG5cblx0XHQvLyBpZiB0b3VjaGluZyBhIGxpbmssIGhpZ2hsaWdodCBpdFxuXHRcdGlmIChlbC50YWdOYW1lICYmIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2EnKSB7XG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoZWwsICdsZWFmbGV0LWFjdGl2ZScpO1xuXHRcdH1cblxuXHRcdC8vIHNpbXVsYXRlIGxvbmcgaG9sZCBidXQgc2V0dGluZyBhIHRpbWVvdXRcblx0XHR0aGlzLl9ob2xkVGltZW91dCA9IHNldFRpbWVvdXQoTC5iaW5kKGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh0aGlzLl9pc1RhcFZhbGlkKCkpIHtcblx0XHRcdFx0dGhpcy5fZmlyZUNsaWNrID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuX29uVXAoKTtcblx0XHRcdFx0dGhpcy5fc2ltdWxhdGVFdmVudCgnY29udGV4dG1lbnUnLCBmaXJzdCk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyksIDEwMDApO1xuXG5cdFx0TC5Eb21FdmVudFxuXHRcdFx0Lm9uKGRvY3VtZW50LCAndG91Y2htb3ZlJywgdGhpcy5fb25Nb3ZlLCB0aGlzKVxuXHRcdFx0Lm9uKGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9vblVwLCB0aGlzKTtcblx0fSxcblxuXHRfb25VcDogZnVuY3Rpb24gKGUpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5faG9sZFRpbWVvdXQpO1xuXG5cdFx0TC5Eb21FdmVudFxuXHRcdFx0Lm9mZihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uTW92ZSwgdGhpcylcblx0XHRcdC5vZmYoZG9jdW1lbnQsICd0b3VjaGVuZCcsIHRoaXMuX29uVXAsIHRoaXMpO1xuXG5cdFx0aWYgKHRoaXMuX2ZpcmVDbGljayAmJiBlICYmIGUuY2hhbmdlZFRvdWNoZXMpIHtcblxuXHRcdFx0dmFyIGZpcnN0ID0gZS5jaGFuZ2VkVG91Y2hlc1swXSxcblx0XHRcdCAgICBlbCA9IGZpcnN0LnRhcmdldDtcblxuXHRcdFx0aWYgKGVsICYmIGVsLnRhZ05hbWUgJiYgZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnYScpIHtcblx0XHRcdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKGVsLCAnbGVhZmxldC1hY3RpdmUnKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2ltdWxhdGUgY2xpY2sgaWYgdGhlIHRvdWNoIGRpZG4ndCBtb3ZlIHRvbyBtdWNoXG5cdFx0XHRpZiAodGhpcy5faXNUYXBWYWxpZCgpKSB7XG5cdFx0XHRcdHRoaXMuX3NpbXVsYXRlRXZlbnQoJ2NsaWNrJywgZmlyc3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfaXNUYXBWYWxpZDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLl9uZXdQb3MuZGlzdGFuY2VUbyh0aGlzLl9zdGFydFBvcykgPD0gdGhpcy5fbWFwLm9wdGlvbnMudGFwVG9sZXJhbmNlO1xuXHR9LFxuXG5cdF9vbk1vdmU6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGZpcnN0ID0gZS50b3VjaGVzWzBdO1xuXHRcdHRoaXMuX25ld1BvcyA9IG5ldyBMLlBvaW50KGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFkpO1xuXHR9LFxuXG5cdF9zaW11bGF0ZUV2ZW50OiBmdW5jdGlvbiAodHlwZSwgZSkge1xuXHRcdHZhciBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuXG5cdFx0c2ltdWxhdGVkRXZlbnQuX3NpbXVsYXRlZCA9IHRydWU7XG5cdFx0ZS50YXJnZXQuX3NpbXVsYXRlZENsaWNrID0gdHJ1ZTtcblxuXHRcdHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KFxuXHRcdCAgICAgICAgdHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLFxuXHRcdCAgICAgICAgZS5zY3JlZW5YLCBlLnNjcmVlblksXG5cdFx0ICAgICAgICBlLmNsaWVudFgsIGUuY2xpZW50WSxcblx0XHQgICAgICAgIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBudWxsKTtcblxuXHRcdGUudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuXHR9XG59KTtcblxuaWYgKEwuQnJvd3Nlci50b3VjaCAmJiAhTC5Ccm93c2VyLnBvaW50ZXIpIHtcblx0TC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAndGFwJywgTC5NYXAuVGFwKTtcbn1cblxuXG4vKlxuICogTC5IYW5kbGVyLlNoaWZ0RHJhZ1pvb20gaXMgdXNlZCB0byBhZGQgc2hpZnQtZHJhZyB6b29tIGludGVyYWN0aW9uIHRvIHRoZSBtYXBcbiAgKiAoem9vbSB0byBhIHNlbGVjdGVkIGJvdW5kaW5nIGJveCksIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHRib3hab29tOiB0cnVlXG59KTtcblxuTC5NYXAuQm94Wm9vbSA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobWFwKSB7XG5cdFx0dGhpcy5fbWFwID0gbWFwO1xuXHRcdHRoaXMuX2NvbnRhaW5lciA9IG1hcC5fY29udGFpbmVyO1xuXHRcdHRoaXMuX3BhbmUgPSBtYXAuX3BhbmVzLm92ZXJsYXlQYW5lO1xuXHRcdHRoaXMuX21vdmVkID0gZmFsc2U7XG5cdH0sXG5cblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX2NvbnRhaW5lciwgJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLCB0aGlzKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub2ZmKHRoaXMuX2NvbnRhaW5lciwgJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xuXHR9LFxuXG5cdG1vdmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21vdmVkO1xuXHR9LFxuXG5cdF9vbk1vdXNlRG93bjogZnVuY3Rpb24gKGUpIHtcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xuXG5cdFx0aWYgKCFlLnNoaWZ0S2V5IHx8ICgoZS53aGljaCAhPT0gMSkgJiYgKGUuYnV0dG9uICE9PSAxKSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0XHRMLkRvbVV0aWwuZGlzYWJsZVRleHRTZWxlY3Rpb24oKTtcblx0XHRMLkRvbVV0aWwuZGlzYWJsZUltYWdlRHJhZygpO1xuXG5cdFx0dGhpcy5fc3RhcnRMYXllclBvaW50ID0gdGhpcy5fbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZSk7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vbihkb2N1bWVudCwgJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKVxuXHRcdCAgICAub24oZG9jdW1lbnQsICdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwLCB0aGlzKVxuXHRcdCAgICAub24oZG9jdW1lbnQsICdrZXlkb3duJywgdGhpcy5fb25LZXlEb3duLCB0aGlzKTtcblx0fSxcblxuXHRfb25Nb3VzZU1vdmU6IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCF0aGlzLl9tb3ZlZCkge1xuXHRcdFx0dGhpcy5fYm94ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtem9vbS1ib3gnLCB0aGlzLl9wYW5lKTtcblx0XHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9ib3gsIHRoaXMuX3N0YXJ0TGF5ZXJQb2ludCk7XG5cblx0XHRcdC8vVE9ETyByZWZhY3RvcjogbW92ZSBjdXJzb3IgdG8gc3R5bGVzXG5cdFx0XHR0aGlzLl9jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcic7XG5cdFx0XHR0aGlzLl9tYXAuZmlyZSgnYm94em9vbXN0YXJ0Jyk7XG5cdFx0fVxuXG5cdFx0dmFyIHN0YXJ0UG9pbnQgPSB0aGlzLl9zdGFydExheWVyUG9pbnQsXG5cdFx0ICAgIGJveCA9IHRoaXMuX2JveCxcblxuXHRcdCAgICBsYXllclBvaW50ID0gdGhpcy5fbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZSksXG5cdFx0ICAgIG9mZnNldCA9IGxheWVyUG9pbnQuc3VidHJhY3Qoc3RhcnRQb2ludCksXG5cblx0XHQgICAgbmV3UG9zID0gbmV3IEwuUG9pbnQoXG5cdFx0ICAgICAgICBNYXRoLm1pbihsYXllclBvaW50LngsIHN0YXJ0UG9pbnQueCksXG5cdFx0ICAgICAgICBNYXRoLm1pbihsYXllclBvaW50LnksIHN0YXJ0UG9pbnQueSkpO1xuXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKGJveCwgbmV3UG9zKTtcblxuXHRcdHRoaXMuX21vdmVkID0gdHJ1ZTtcblxuXHRcdC8vIFRPRE8gcmVmYWN0b3I6IHJlbW92ZSBoYXJkY29kZWQgNCBwaXhlbHNcblx0XHRib3guc3R5bGUud2lkdGggID0gKE1hdGgubWF4KDAsIE1hdGguYWJzKG9mZnNldC54KSAtIDQpKSArICdweCc7XG5cdFx0Ym94LnN0eWxlLmhlaWdodCA9IChNYXRoLm1heCgwLCBNYXRoLmFicyhvZmZzZXQueSkgLSA0KSkgKyAncHgnO1xuXHR9LFxuXG5cdF9maW5pc2g6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5fbW92ZWQpIHtcblx0XHRcdHRoaXMuX3BhbmUucmVtb3ZlQ2hpbGQodGhpcy5fYm94KTtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJztcblx0XHR9XG5cblx0XHRMLkRvbVV0aWwuZW5hYmxlVGV4dFNlbGVjdGlvbigpO1xuXHRcdEwuRG9tVXRpbC5lbmFibGVJbWFnZURyYWcoKTtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKVxuXHRcdCAgICAub2ZmKGRvY3VtZW50LCAnbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcClcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ2tleWRvd24nLCB0aGlzLl9vbktleURvd24pO1xuXHR9LFxuXG5cdF9vbk1vdXNlVXA6IGZ1bmN0aW9uIChlKSB7XG5cblx0XHR0aGlzLl9maW5pc2goKTtcblxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXG5cdFx0ICAgIGxheWVyUG9pbnQgPSBtYXAubW91c2VFdmVudFRvTGF5ZXJQb2ludChlKTtcblxuXHRcdGlmICh0aGlzLl9zdGFydExheWVyUG9pbnQuZXF1YWxzKGxheWVyUG9pbnQpKSB7IHJldHVybjsgfVxuXG5cdFx0dmFyIGJvdW5kcyA9IG5ldyBMLkxhdExuZ0JvdW5kcyhcblx0XHQgICAgICAgIG1hcC5sYXllclBvaW50VG9MYXRMbmcodGhpcy5fc3RhcnRMYXllclBvaW50KSxcblx0XHQgICAgICAgIG1hcC5sYXllclBvaW50VG9MYXRMbmcobGF5ZXJQb2ludCkpO1xuXG5cdFx0bWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuXG5cdFx0bWFwLmZpcmUoJ2JveHpvb21lbmQnLCB7XG5cdFx0XHRib3hab29tQm91bmRzOiBib3VuZHNcblx0XHR9KTtcblx0fSxcblxuXHRfb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmIChlLmtleUNvZGUgPT09IDI3KSB7XG5cdFx0XHR0aGlzLl9maW5pc2goKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5MLk1hcC5hZGRJbml0SG9vaygnYWRkSGFuZGxlcicsICdib3hab29tJywgTC5NYXAuQm94Wm9vbSk7XG5cblxuLypcbiAqIEwuTWFwLktleWJvYXJkIGlzIGhhbmRsaW5nIGtleWJvYXJkIGludGVyYWN0aW9uIHdpdGggdGhlIG1hcCwgZW5hYmxlZCBieSBkZWZhdWx0LlxuICovXG5cbkwuTWFwLm1lcmdlT3B0aW9ucyh7XG5cdGtleWJvYXJkOiB0cnVlLFxuXHRrZXlib2FyZFBhbk9mZnNldDogODAsXG5cdGtleWJvYXJkWm9vbU9mZnNldDogMVxufSk7XG5cbkwuTWFwLktleWJvYXJkID0gTC5IYW5kbGVyLmV4dGVuZCh7XG5cblx0a2V5Q29kZXM6IHtcblx0XHRsZWZ0OiAgICBbMzddLFxuXHRcdHJpZ2h0OiAgIFszOV0sXG5cdFx0ZG93bjogICAgWzQwXSxcblx0XHR1cDogICAgICBbMzhdLFxuXHRcdHpvb21JbjogIFsxODcsIDEwNywgNjEsIDE3MV0sXG5cdFx0em9vbU91dDogWzE4OSwgMTA5LCAxNzNdXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG1hcCkge1xuXHRcdHRoaXMuX21hcCA9IG1hcDtcblxuXHRcdHRoaXMuX3NldFBhbk9mZnNldChtYXAub3B0aW9ucy5rZXlib2FyZFBhbk9mZnNldCk7XG5cdFx0dGhpcy5fc2V0Wm9vbU9mZnNldChtYXAub3B0aW9ucy5rZXlib2FyZFpvb21PZmZzZXQpO1xuXHR9LFxuXG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuX21hcC5fY29udGFpbmVyO1xuXG5cdFx0Ly8gbWFrZSB0aGUgY29udGFpbmVyIGZvY3VzYWJsZSBieSB0YWJiaW5nXG5cdFx0aWYgKGNvbnRhaW5lci50YWJJbmRleCA9PT0gLTEpIHtcblx0XHRcdGNvbnRhaW5lci50YWJJbmRleCA9ICcwJztcblx0XHR9XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vbihjb250YWluZXIsICdmb2N1cycsIHRoaXMuX29uRm9jdXMsIHRoaXMpXG5cdFx0ICAgIC5vbihjb250YWluZXIsICdibHVyJywgdGhpcy5fb25CbHVyLCB0aGlzKVxuXHRcdCAgICAub24oY29udGFpbmVyLCAnbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24sIHRoaXMpO1xuXG5cdFx0dGhpcy5fbWFwXG5cdFx0ICAgIC5vbignZm9jdXMnLCB0aGlzLl9hZGRIb29rcywgdGhpcylcblx0XHQgICAgLm9uKCdibHVyJywgdGhpcy5fcmVtb3ZlSG9va3MsIHRoaXMpO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fcmVtb3ZlSG9va3MoKTtcblxuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9tYXAuX2NvbnRhaW5lcjtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHQgICAgLm9mZihjb250YWluZXIsICdmb2N1cycsIHRoaXMuX29uRm9jdXMsIHRoaXMpXG5cdFx0ICAgIC5vZmYoY29udGFpbmVyLCAnYmx1cicsIHRoaXMuX29uQmx1ciwgdGhpcylcblx0XHQgICAgLm9mZihjb250YWluZXIsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdGhpcyk7XG5cblx0XHR0aGlzLl9tYXBcblx0XHQgICAgLm9mZignZm9jdXMnLCB0aGlzLl9hZGRIb29rcywgdGhpcylcblx0XHQgICAgLm9mZignYmx1cicsIHRoaXMuX3JlbW92ZUhvb2tzLCB0aGlzKTtcblx0fSxcblxuXHRfb25Nb3VzZURvd246IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5fZm9jdXNlZCkgeyByZXR1cm47IH1cblxuXHRcdHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSxcblx0XHQgICAgZG9jRWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0ICAgIHRvcCA9IGJvZHkuc2Nyb2xsVG9wIHx8IGRvY0VsLnNjcm9sbFRvcCxcblx0XHQgICAgbGVmdCA9IGJvZHkuc2Nyb2xsTGVmdCB8fCBkb2NFbC5zY3JvbGxMZWZ0O1xuXG5cdFx0dGhpcy5fbWFwLl9jb250YWluZXIuZm9jdXMoKTtcblxuXHRcdHdpbmRvdy5zY3JvbGxUbyhsZWZ0LCB0b3ApO1xuXHR9LFxuXG5cdF9vbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fZm9jdXNlZCA9IHRydWU7XG5cdFx0dGhpcy5fbWFwLmZpcmUoJ2ZvY3VzJyk7XG5cdH0sXG5cblx0X29uQmx1cjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX2ZvY3VzZWQgPSBmYWxzZTtcblx0XHR0aGlzLl9tYXAuZmlyZSgnYmx1cicpO1xuXHR9LFxuXG5cdF9zZXRQYW5PZmZzZXQ6IGZ1bmN0aW9uIChwYW4pIHtcblx0XHR2YXIga2V5cyA9IHRoaXMuX3BhbktleXMgPSB7fSxcblx0XHQgICAgY29kZXMgPSB0aGlzLmtleUNvZGVzLFxuXHRcdCAgICBpLCBsZW47XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb2Rlcy5sZWZ0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLmxlZnRbaV1dID0gWy0xICogcGFuLCAwXTtcblx0XHR9XG5cdFx0Zm9yIChpID0gMCwgbGVuID0gY29kZXMucmlnaHQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMucmlnaHRbaV1dID0gW3BhbiwgMF07XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLmRvd24ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMuZG93bltpXV0gPSBbMCwgcGFuXTtcblx0XHR9XG5cdFx0Zm9yIChpID0gMCwgbGVuID0gY29kZXMudXAubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMudXBbaV1dID0gWzAsIC0xICogcGFuXTtcblx0XHR9XG5cdH0sXG5cblx0X3NldFpvb21PZmZzZXQ6IGZ1bmN0aW9uICh6b29tKSB7XG5cdFx0dmFyIGtleXMgPSB0aGlzLl96b29tS2V5cyA9IHt9LFxuXHRcdCAgICBjb2RlcyA9IHRoaXMua2V5Q29kZXMsXG5cdFx0ICAgIGksIGxlbjtcblxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnpvb21Jbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0a2V5c1tjb2Rlcy56b29tSW5baV1dID0gem9vbTtcblx0XHR9XG5cdFx0Zm9yIChpID0gMCwgbGVuID0gY29kZXMuem9vbU91dC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0a2V5c1tjb2Rlcy56b29tT3V0W2ldXSA9IC16b29tO1xuXHRcdH1cblx0fSxcblxuXHRfYWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9uKGRvY3VtZW50LCAna2V5ZG93bicsIHRoaXMuX29uS2V5RG93biwgdGhpcyk7XG5cdH0sXG5cblx0X3JlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vZmYoZG9jdW1lbnQsICdrZXlkb3duJywgdGhpcy5fb25LZXlEb3duLCB0aGlzKTtcblx0fSxcblxuXHRfb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBrZXkgPSBlLmtleUNvZGUsXG5cdFx0ICAgIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdGlmIChrZXkgaW4gdGhpcy5fcGFuS2V5cykge1xuXG5cdFx0XHRpZiAobWFwLl9wYW5BbmltICYmIG1hcC5fcGFuQW5pbS5faW5Qcm9ncmVzcykgeyByZXR1cm47IH1cblxuXHRcdFx0bWFwLnBhbkJ5KHRoaXMuX3BhbktleXNba2V5XSk7XG5cblx0XHRcdGlmIChtYXAub3B0aW9ucy5tYXhCb3VuZHMpIHtcblx0XHRcdFx0bWFwLnBhbkluc2lkZUJvdW5kcyhtYXAub3B0aW9ucy5tYXhCb3VuZHMpO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmIChrZXkgaW4gdGhpcy5fem9vbUtleXMpIHtcblx0XHRcdG1hcC5zZXRab29tKG1hcC5nZXRab29tKCkgKyB0aGlzLl96b29tS2V5c1trZXldKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0TC5Eb21FdmVudC5zdG9wKGUpO1xuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAna2V5Ym9hcmQnLCBMLk1hcC5LZXlib2FyZCk7XG5cblxuLypcbiAqIEwuSGFuZGxlci5NYXJrZXJEcmFnIGlzIHVzZWQgaW50ZXJuYWxseSBieSBMLk1hcmtlciB0byBtYWtlIHRoZSBtYXJrZXJzIGRyYWdnYWJsZS5cbiAqL1xuXG5MLkhhbmRsZXIuTWFya2VyRHJhZyA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobWFya2VyKSB7XG5cdFx0dGhpcy5fbWFya2VyID0gbWFya2VyO1xuXHR9LFxuXG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGljb24gPSB0aGlzLl9tYXJrZXIuX2ljb247XG5cdFx0aWYgKCF0aGlzLl9kcmFnZ2FibGUpIHtcblx0XHRcdHRoaXMuX2RyYWdnYWJsZSA9IG5ldyBMLkRyYWdnYWJsZShpY29uLCBpY29uKTtcblx0XHR9XG5cblx0XHR0aGlzLl9kcmFnZ2FibGVcblx0XHRcdC5vbignZHJhZ3N0YXJ0JywgdGhpcy5fb25EcmFnU3RhcnQsIHRoaXMpXG5cdFx0XHQub24oJ2RyYWcnLCB0aGlzLl9vbkRyYWcsIHRoaXMpXG5cdFx0XHQub24oJ2RyYWdlbmQnLCB0aGlzLl9vbkRyYWdFbmQsIHRoaXMpO1xuXHRcdHRoaXMuX2RyYWdnYWJsZS5lbmFibGUoKTtcblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fbWFya2VyLl9pY29uLCAnbGVhZmxldC1tYXJrZXItZHJhZ2dhYmxlJyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9kcmFnZ2FibGVcblx0XHRcdC5vZmYoJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0LCB0aGlzKVxuXHRcdFx0Lm9mZignZHJhZycsIHRoaXMuX29uRHJhZywgdGhpcylcblx0XHRcdC5vZmYoJ2RyYWdlbmQnLCB0aGlzLl9vbkRyYWdFbmQsIHRoaXMpO1xuXG5cdFx0dGhpcy5fZHJhZ2dhYmxlLmRpc2FibGUoKTtcblx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fbWFya2VyLl9pY29uLCAnbGVhZmxldC1tYXJrZXItZHJhZ2dhYmxlJyk7XG5cdH0sXG5cblx0bW92ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZHJhZ2dhYmxlICYmIHRoaXMuX2RyYWdnYWJsZS5fbW92ZWQ7XG5cdH0sXG5cblx0X29uRHJhZ1N0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fbWFya2VyXG5cdFx0ICAgIC5jbG9zZVBvcHVwKClcblx0XHQgICAgLmZpcmUoJ21vdmVzdGFydCcpXG5cdFx0ICAgIC5maXJlKCdkcmFnc3RhcnQnKTtcblx0fSxcblxuXHRfb25EcmFnOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hcmtlciA9IHRoaXMuX21hcmtlcixcblx0XHQgICAgc2hhZG93ID0gbWFya2VyLl9zaGFkb3csXG5cdFx0ICAgIGljb25Qb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24obWFya2VyLl9pY29uKSxcblx0XHQgICAgbGF0bG5nID0gbWFya2VyLl9tYXAubGF5ZXJQb2ludFRvTGF0TG5nKGljb25Qb3MpO1xuXG5cdFx0Ly8gdXBkYXRlIHNoYWRvdyBwb3NpdGlvblxuXHRcdGlmIChzaGFkb3cpIHtcblx0XHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbihzaGFkb3csIGljb25Qb3MpO1xuXHRcdH1cblxuXHRcdG1hcmtlci5fbGF0bG5nID0gbGF0bG5nO1xuXG5cdFx0bWFya2VyXG5cdFx0ICAgIC5maXJlKCdtb3ZlJywge2xhdGxuZzogbGF0bG5nfSlcblx0XHQgICAgLmZpcmUoJ2RyYWcnKTtcblx0fSxcblxuXHRfb25EcmFnRW5kOiBmdW5jdGlvbiAoZSkge1xuXHRcdHRoaXMuX21hcmtlclxuXHRcdCAgICAuZmlyZSgnbW92ZWVuZCcpXG5cdFx0ICAgIC5maXJlKCdkcmFnZW5kJywgZSk7XG5cdH1cbn0pO1xuXG5cbi8qXHJcbiAqIEwuQ29udHJvbCBpcyBhIGJhc2UgY2xhc3MgZm9yIGltcGxlbWVudGluZyBtYXAgY29udHJvbHMuIEhhbmRsZXMgcG9zaXRpb25pbmcuXHJcbiAqIEFsbCBvdGhlciBjb250cm9scyBleHRlbmQgZnJvbSB0aGlzIGNsYXNzLlxyXG4gKi9cclxuXHJcbkwuQ29udHJvbCA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRwb3NpdGlvbjogJ3RvcHJpZ2h0J1xyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0Z2V0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMucG9zaXRpb247XHJcblx0fSxcclxuXHJcblx0c2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcclxuXHJcblx0XHRpZiAobWFwKSB7XHJcblx0XHRcdG1hcC5yZW1vdmVDb250cm9sKHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cclxuXHRcdGlmIChtYXApIHtcclxuXHRcdFx0bWFwLmFkZENvbnRyb2wodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cdGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblxyXG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IHRoaXMub25BZGQobWFwKSxcclxuXHRcdCAgICBwb3MgPSB0aGlzLmdldFBvc2l0aW9uKCksXHJcblx0XHQgICAgY29ybmVyID0gbWFwLl9jb250cm9sQ29ybmVyc1twb3NdO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsZWFmbGV0LWNvbnRyb2wnKTtcclxuXHJcblx0XHRpZiAocG9zLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkge1xyXG5cdFx0XHRjb3JuZXIuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgY29ybmVyLmZpcnN0Q2hpbGQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29ybmVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlRnJvbTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dmFyIHBvcyA9IHRoaXMuZ2V0UG9zaXRpb24oKSxcclxuXHRcdCAgICBjb3JuZXIgPSBtYXAuX2NvbnRyb2xDb3JuZXJzW3Bvc107XHJcblxyXG5cdFx0Y29ybmVyLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cclxuXHRcdGlmICh0aGlzLm9uUmVtb3ZlKSB7XHJcblx0XHRcdHRoaXMub25SZW1vdmUobWFwKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfcmVmb2N1c09uTWFwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX21hcC5nZXRDb250YWluZXIoKS5mb2N1cygpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5MLmNvbnRyb2wgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5Db250cm9sKG9wdGlvbnMpO1xyXG59O1xyXG5cclxuXHJcbi8vIGFkZHMgY29udHJvbC1yZWxhdGVkIG1ldGhvZHMgdG8gTC5NYXBcclxuXHJcbkwuTWFwLmluY2x1ZGUoe1xyXG5cdGFkZENvbnRyb2w6IGZ1bmN0aW9uIChjb250cm9sKSB7XHJcblx0XHRjb250cm9sLmFkZFRvKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlQ29udHJvbDogZnVuY3Rpb24gKGNvbnRyb2wpIHtcclxuXHRcdGNvbnRyb2wucmVtb3ZlRnJvbSh0aGlzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0Q29udHJvbFBvczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGNvcm5lcnMgPSB0aGlzLl9jb250cm9sQ29ybmVycyA9IHt9LFxyXG5cdFx0ICAgIGwgPSAnbGVhZmxldC0nLFxyXG5cdFx0ICAgIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRyb2xDb250YWluZXIgPVxyXG5cdFx0ICAgICAgICAgICAgTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgbCArICdjb250cm9sLWNvbnRhaW5lcicsIHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0ZnVuY3Rpb24gY3JlYXRlQ29ybmVyKHZTaWRlLCBoU2lkZSkge1xyXG5cdFx0XHR2YXIgY2xhc3NOYW1lID0gbCArIHZTaWRlICsgJyAnICsgbCArIGhTaWRlO1xyXG5cclxuXHRcdFx0Y29ybmVyc1t2U2lkZSArIGhTaWRlXSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSwgY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRjcmVhdGVDb3JuZXIoJ3RvcCcsICdsZWZ0Jyk7XHJcblx0XHRjcmVhdGVDb3JuZXIoJ3RvcCcsICdyaWdodCcpO1xyXG5cdFx0Y3JlYXRlQ29ybmVyKCdib3R0b20nLCAnbGVmdCcpO1xyXG5cdFx0Y3JlYXRlQ29ybmVyKCdib3R0b20nLCAncmlnaHQnKTtcclxuXHR9LFxyXG5cclxuXHRfY2xlYXJDb250cm9sUG9zOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5fY29udHJvbENvbnRhaW5lcik7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuQ29udHJvbC5ab29tIGlzIHVzZWQgZm9yIHRoZSBkZWZhdWx0IHpvb20gYnV0dG9ucyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuQ29udHJvbC5ab29tID0gTC5Db250cm9sLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0cG9zaXRpb246ICd0b3BsZWZ0JyxcclxuXHRcdHpvb21JblRleHQ6ICcrJyxcclxuXHRcdHpvb21JblRpdGxlOiAnWm9vbSBpbicsXHJcblx0XHR6b29tT3V0VGV4dDogJy0nLFxyXG5cdFx0em9vbU91dFRpdGxlOiAnWm9vbSBvdXQnXHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHZhciB6b29tTmFtZSA9ICdsZWFmbGV0LWNvbnRyb2wtem9vbScsXHJcblx0XHQgICAgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2Jywgem9vbU5hbWUgKyAnIGxlYWZsZXQtYmFyJyk7XHJcblxyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cclxuXHRcdHRoaXMuX3pvb21JbkJ1dHRvbiAgPSB0aGlzLl9jcmVhdGVCdXR0b24oXHJcblx0XHQgICAgICAgIHRoaXMub3B0aW9ucy56b29tSW5UZXh0LCB0aGlzLm9wdGlvbnMuem9vbUluVGl0bGUsXHJcblx0XHQgICAgICAgIHpvb21OYW1lICsgJy1pbicsICBjb250YWluZXIsIHRoaXMuX3pvb21JbiwgIHRoaXMpO1xyXG5cdFx0dGhpcy5fem9vbU91dEJ1dHRvbiA9IHRoaXMuX2NyZWF0ZUJ1dHRvbihcclxuXHRcdCAgICAgICAgdGhpcy5vcHRpb25zLnpvb21PdXRUZXh0LCB0aGlzLm9wdGlvbnMuem9vbU91dFRpdGxlLFxyXG5cdFx0ICAgICAgICB6b29tTmFtZSArICctb3V0JywgY29udGFpbmVyLCB0aGlzLl96b29tT3V0LCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLl91cGRhdGVEaXNhYmxlZCgpO1xyXG5cdFx0bWFwLm9uKCd6b29tZW5kIHpvb21sZXZlbHNjaGFuZ2UnLCB0aGlzLl91cGRhdGVEaXNhYmxlZCwgdGhpcyk7XHJcblxyXG5cdFx0cmV0dXJuIGNvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLm9mZignem9vbWVuZCB6b29tbGV2ZWxzY2hhbmdlJywgdGhpcy5fdXBkYXRlRGlzYWJsZWQsIHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdF96b29tSW46IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR0aGlzLl9tYXAuem9vbUluKGUuc2hpZnRLZXkgPyAzIDogMSk7XHJcblx0fSxcclxuXHJcblx0X3pvb21PdXQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR0aGlzLl9tYXAuem9vbU91dChlLnNoaWZ0S2V5ID8gMyA6IDEpO1xyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVCdXR0b246IGZ1bmN0aW9uIChodG1sLCB0aXRsZSwgY2xhc3NOYW1lLCBjb250YWluZXIsIGZuLCBjb250ZXh0KSB7XHJcblx0XHR2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCBjbGFzc05hbWUsIGNvbnRhaW5lcik7XHJcblx0XHRsaW5rLmlubmVySFRNTCA9IGh0bWw7XHJcblx0XHRsaW5rLmhyZWYgPSAnIyc7XHJcblx0XHRsaW5rLnRpdGxlID0gdGl0bGU7XHJcblxyXG5cdFx0dmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcclxuXHJcblx0XHRMLkRvbUV2ZW50XHJcblx0XHQgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXHJcblx0XHQgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxyXG5cdFx0ICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBzdG9wKVxyXG5cdFx0ICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxyXG5cdFx0ICAgIC5vbihsaW5rLCAnY2xpY2snLCBmbiwgY29udGV4dClcclxuXHRcdCAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fcmVmb2N1c09uTWFwLCBjb250ZXh0KTtcclxuXHJcblx0XHRyZXR1cm4gbGluaztcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlRGlzYWJsZWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHRcdGNsYXNzTmFtZSA9ICdsZWFmbGV0LWRpc2FibGVkJztcclxuXHJcblx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fem9vbUluQnV0dG9uLCBjbGFzc05hbWUpO1xyXG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3pvb21PdXRCdXR0b24sIGNsYXNzTmFtZSk7XHJcblxyXG5cdFx0aWYgKG1hcC5fem9vbSA9PT0gbWFwLmdldE1pblpvb20oKSkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fem9vbU91dEJ1dHRvbiwgY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHRcdGlmIChtYXAuX3pvb20gPT09IG1hcC5nZXRNYXhab29tKCkpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3pvb21JbkJ1dHRvbiwgY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5NYXAubWVyZ2VPcHRpb25zKHtcclxuXHR6b29tQ29udHJvbDogdHJ1ZVxyXG59KTtcclxuXHJcbkwuTWFwLmFkZEluaXRIb29rKGZ1bmN0aW9uICgpIHtcclxuXHRpZiAodGhpcy5vcHRpb25zLnpvb21Db250cm9sKSB7XHJcblx0XHR0aGlzLnpvb21Db250cm9sID0gbmV3IEwuQ29udHJvbC5ab29tKCk7XHJcblx0XHR0aGlzLmFkZENvbnRyb2wodGhpcy56b29tQ29udHJvbCk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuY29udHJvbC56b29tID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ29udHJvbC5ab29tKG9wdGlvbnMpO1xyXG59O1xyXG5cclxuXG5cbi8qXHJcbiAqIEwuQ29udHJvbC5BdHRyaWJ1dGlvbiBpcyB1c2VkIGZvciBkaXNwbGF5aW5nIGF0dHJpYnV0aW9uIG9uIHRoZSBtYXAgKGFkZGVkIGJ5IGRlZmF1bHQpLlxyXG4gKi9cclxuXHJcbkwuQ29udHJvbC5BdHRyaWJ1dGlvbiA9IEwuQ29udHJvbC5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdHBvc2l0aW9uOiAnYm90dG9tcmlnaHQnLFxyXG5cdFx0cHJlZml4OiAnPGEgaHJlZj1cImh0dHA6Ly9sZWFmbGV0anMuY29tXCIgdGl0bGU9XCJBIEpTIGxpYnJhcnkgZm9yIGludGVyYWN0aXZlIG1hcHNcIj5MZWFmbGV0PC9hPidcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX2F0dHJpYnV0aW9ucyA9IHt9O1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1jb250cm9sLWF0dHJpYnV0aW9uJyk7XHJcblx0XHRMLkRvbUV2ZW50LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiBtYXAuX2xheWVycykge1xyXG5cdFx0XHRpZiAobWFwLl9sYXllcnNbaV0uZ2V0QXR0cmlidXRpb24pIHtcclxuXHRcdFx0XHR0aGlzLmFkZEF0dHJpYnV0aW9uKG1hcC5fbGF5ZXJzW2ldLmdldEF0dHJpYnV0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdG1hcFxyXG5cdFx0ICAgIC5vbignbGF5ZXJhZGQnLCB0aGlzLl9vbkxheWVyQWRkLCB0aGlzKVxyXG5cdFx0ICAgIC5vbignbGF5ZXJyZW1vdmUnLCB0aGlzLl9vbkxheWVyUmVtb3ZlLCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cdG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXBcclxuXHRcdCAgICAub2ZmKCdsYXllcmFkZCcsIHRoaXMuX29uTGF5ZXJBZGQpXHJcblx0XHQgICAgLm9mZignbGF5ZXJyZW1vdmUnLCB0aGlzLl9vbkxheWVyUmVtb3ZlKTtcclxuXHJcblx0fSxcclxuXHJcblx0c2V0UHJlZml4OiBmdW5jdGlvbiAocHJlZml4KSB7XHJcblx0XHR0aGlzLm9wdGlvbnMucHJlZml4ID0gcHJlZml4O1xyXG5cdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRhZGRBdHRyaWJ1dGlvbjogZnVuY3Rpb24gKHRleHQpIHtcclxuXHRcdGlmICghdGV4dCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAoIXRoaXMuX2F0dHJpYnV0aW9uc1t0ZXh0XSkge1xyXG5cdFx0XHR0aGlzLl9hdHRyaWJ1dGlvbnNbdGV4dF0gPSAwO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fYXR0cmlidXRpb25zW3RleHRdKys7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlQXR0cmlidXRpb246IGZ1bmN0aW9uICh0ZXh0KSB7XHJcblx0XHRpZiAoIXRleHQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0aWYgKHRoaXMuX2F0dHJpYnV0aW9uc1t0ZXh0XSkge1xyXG5cdFx0XHR0aGlzLl9hdHRyaWJ1dGlvbnNbdGV4dF0tLTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9tYXApIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIGF0dHJpYnMgPSBbXTtcclxuXHJcblx0XHRmb3IgKHZhciBpIGluIHRoaXMuX2F0dHJpYnV0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5fYXR0cmlidXRpb25zW2ldKSB7XHJcblx0XHRcdFx0YXR0cmlicy5wdXNoKGkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHByZWZpeEFuZEF0dHJpYnMgPSBbXTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnByZWZpeCkge1xyXG5cdFx0XHRwcmVmaXhBbmRBdHRyaWJzLnB1c2godGhpcy5vcHRpb25zLnByZWZpeCk7XHJcblx0XHR9XHJcblx0XHRpZiAoYXR0cmlicy5sZW5ndGgpIHtcclxuXHRcdFx0cHJlZml4QW5kQXR0cmlicy5wdXNoKGF0dHJpYnMuam9pbignLCAnKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyLmlubmVySFRNTCA9IHByZWZpeEFuZEF0dHJpYnMuam9pbignIHwgJyk7XHJcblx0fSxcclxuXHJcblx0X29uTGF5ZXJBZGQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoZS5sYXllci5nZXRBdHRyaWJ1dGlvbikge1xyXG5cdFx0XHR0aGlzLmFkZEF0dHJpYnV0aW9uKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24oKSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X29uTGF5ZXJSZW1vdmU6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoZS5sYXllci5nZXRBdHRyaWJ1dGlvbikge1xyXG5cdFx0XHR0aGlzLnJlbW92ZUF0dHJpYnV0aW9uKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24oKSk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXHJcbkwuTWFwLm1lcmdlT3B0aW9ucyh7XHJcblx0YXR0cmlidXRpb25Db250cm9sOiB0cnVlXHJcbn0pO1xyXG5cclxuTC5NYXAuYWRkSW5pdEhvb2soZnVuY3Rpb24gKCkge1xyXG5cdGlmICh0aGlzLm9wdGlvbnMuYXR0cmlidXRpb25Db250cm9sKSB7XHJcblx0XHR0aGlzLmF0dHJpYnV0aW9uQ29udHJvbCA9IChuZXcgTC5Db250cm9sLkF0dHJpYnV0aW9uKCkpLmFkZFRvKHRoaXMpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmNvbnRyb2wuYXR0cmlidXRpb24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5Db250cm9sLkF0dHJpYnV0aW9uKG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcbiAqIEwuQ29udHJvbC5TY2FsZSBpcyB1c2VkIGZvciBkaXNwbGF5aW5nIG1ldHJpYy9pbXBlcmlhbCBzY2FsZSBvbiB0aGUgbWFwLlxuICovXG5cbkwuQ29udHJvbC5TY2FsZSA9IEwuQ29udHJvbC5leHRlbmQoe1xuXHRvcHRpb25zOiB7XG5cdFx0cG9zaXRpb246ICdib3R0b21sZWZ0Jyxcblx0XHRtYXhXaWR0aDogMTAwLFxuXHRcdG1ldHJpYzogdHJ1ZSxcblx0XHRpbXBlcmlhbDogdHJ1ZSxcblx0XHR1cGRhdGVXaGVuSWRsZTogZmFsc2Vcblx0fSxcblxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xuXHRcdHRoaXMuX21hcCA9IG1hcDtcblxuXHRcdHZhciBjbGFzc05hbWUgPSAnbGVhZmxldC1jb250cm9sLXNjYWxlJyxcblx0XHQgICAgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lKSxcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdHRoaXMuX2FkZFNjYWxlcyhvcHRpb25zLCBjbGFzc05hbWUsIGNvbnRhaW5lcik7XG5cblx0XHRtYXAub24ob3B0aW9ucy51cGRhdGVXaGVuSWRsZSA/ICdtb3ZlZW5kJyA6ICdtb3ZlJywgdGhpcy5fdXBkYXRlLCB0aGlzKTtcblx0XHRtYXAud2hlblJlYWR5KHRoaXMuX3VwZGF0ZSwgdGhpcyk7XG5cblx0XHRyZXR1cm4gY29udGFpbmVyO1xuXHR9LFxuXG5cdG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG5cdFx0bWFwLm9mZih0aGlzLm9wdGlvbnMudXBkYXRlV2hlbklkbGUgPyAnbW92ZWVuZCcgOiAnbW92ZScsIHRoaXMuX3VwZGF0ZSwgdGhpcyk7XG5cdH0sXG5cblx0X2FkZFNjYWxlczogZnVuY3Rpb24gKG9wdGlvbnMsIGNsYXNzTmFtZSwgY29udGFpbmVyKSB7XG5cdFx0aWYgKG9wdGlvbnMubWV0cmljKSB7XG5cdFx0XHR0aGlzLl9tU2NhbGUgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUgKyAnLWxpbmUnLCBjb250YWluZXIpO1xuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5pbXBlcmlhbCkge1xuXHRcdFx0dGhpcy5faVNjYWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1saW5lJywgY29udGFpbmVyKTtcblx0XHR9XG5cdH0sXG5cblx0X3VwZGF0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCksXG5cdFx0ICAgIGNlbnRlckxhdCA9IGJvdW5kcy5nZXRDZW50ZXIoKS5sYXQsXG5cdFx0ICAgIGhhbGZXb3JsZE1ldGVycyA9IDYzNzgxMzcgKiBNYXRoLlBJICogTWF0aC5jb3MoY2VudGVyTGF0ICogTWF0aC5QSSAvIDE4MCksXG5cdFx0ICAgIGRpc3QgPSBoYWxmV29ybGRNZXRlcnMgKiAoYm91bmRzLmdldE5vcnRoRWFzdCgpLmxuZyAtIGJvdW5kcy5nZXRTb3V0aFdlc3QoKS5sbmcpIC8gMTgwLFxuXG5cdFx0ICAgIHNpemUgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpLFxuXHRcdCAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdCAgICBtYXhNZXRlcnMgPSAwO1xuXG5cdFx0aWYgKHNpemUueCA+IDApIHtcblx0XHRcdG1heE1ldGVycyA9IGRpc3QgKiAob3B0aW9ucy5tYXhXaWR0aCAvIHNpemUueCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fdXBkYXRlU2NhbGVzKG9wdGlvbnMsIG1heE1ldGVycyk7XG5cdH0sXG5cblx0X3VwZGF0ZVNjYWxlczogZnVuY3Rpb24gKG9wdGlvbnMsIG1heE1ldGVycykge1xuXHRcdGlmIChvcHRpb25zLm1ldHJpYyAmJiBtYXhNZXRlcnMpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZU1ldHJpYyhtYXhNZXRlcnMpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLmltcGVyaWFsICYmIG1heE1ldGVycykge1xuXHRcdFx0dGhpcy5fdXBkYXRlSW1wZXJpYWwobWF4TWV0ZXJzKTtcblx0XHR9XG5cdH0sXG5cblx0X3VwZGF0ZU1ldHJpYzogZnVuY3Rpb24gKG1heE1ldGVycykge1xuXHRcdHZhciBtZXRlcnMgPSB0aGlzLl9nZXRSb3VuZE51bShtYXhNZXRlcnMpO1xuXG5cdFx0dGhpcy5fbVNjYWxlLnN0eWxlLndpZHRoID0gdGhpcy5fZ2V0U2NhbGVXaWR0aChtZXRlcnMgLyBtYXhNZXRlcnMpICsgJ3B4Jztcblx0XHR0aGlzLl9tU2NhbGUuaW5uZXJIVE1MID0gbWV0ZXJzIDwgMTAwMCA/IG1ldGVycyArICcgbScgOiAobWV0ZXJzIC8gMTAwMCkgKyAnIGttJztcblx0fSxcblxuXHRfdXBkYXRlSW1wZXJpYWw6IGZ1bmN0aW9uIChtYXhNZXRlcnMpIHtcblx0XHR2YXIgbWF4RmVldCA9IG1heE1ldGVycyAqIDMuMjgwODM5OSxcblx0XHQgICAgc2NhbGUgPSB0aGlzLl9pU2NhbGUsXG5cdFx0ICAgIG1heE1pbGVzLCBtaWxlcywgZmVldDtcblxuXHRcdGlmIChtYXhGZWV0ID4gNTI4MCkge1xuXHRcdFx0bWF4TWlsZXMgPSBtYXhGZWV0IC8gNTI4MDtcblx0XHRcdG1pbGVzID0gdGhpcy5fZ2V0Um91bmROdW0obWF4TWlsZXMpO1xuXG5cdFx0XHRzY2FsZS5zdHlsZS53aWR0aCA9IHRoaXMuX2dldFNjYWxlV2lkdGgobWlsZXMgLyBtYXhNaWxlcykgKyAncHgnO1xuXHRcdFx0c2NhbGUuaW5uZXJIVE1MID0gbWlsZXMgKyAnIG1pJztcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmZWV0ID0gdGhpcy5fZ2V0Um91bmROdW0obWF4RmVldCk7XG5cblx0XHRcdHNjYWxlLnN0eWxlLndpZHRoID0gdGhpcy5fZ2V0U2NhbGVXaWR0aChmZWV0IC8gbWF4RmVldCkgKyAncHgnO1xuXHRcdFx0c2NhbGUuaW5uZXJIVE1MID0gZmVldCArICcgZnQnO1xuXHRcdH1cblx0fSxcblxuXHRfZ2V0U2NhbGVXaWR0aDogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0cmV0dXJuIE1hdGgucm91bmQodGhpcy5vcHRpb25zLm1heFdpZHRoICogcmF0aW8pIC0gMTA7XG5cdH0sXG5cblx0X2dldFJvdW5kTnVtOiBmdW5jdGlvbiAobnVtKSB7XG5cdFx0dmFyIHBvdzEwID0gTWF0aC5wb3coMTAsIChNYXRoLmZsb29yKG51bSkgKyAnJykubGVuZ3RoIC0gMSksXG5cdFx0ICAgIGQgPSBudW0gLyBwb3cxMDtcblxuXHRcdGQgPSBkID49IDEwID8gMTAgOiBkID49IDUgPyA1IDogZCA+PSAzID8gMyA6IGQgPj0gMiA/IDIgOiAxO1xuXG5cdFx0cmV0dXJuIHBvdzEwICogZDtcblx0fVxufSk7XG5cbkwuY29udHJvbC5zY2FsZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdHJldHVybiBuZXcgTC5Db250cm9sLlNjYWxlKG9wdGlvbnMpO1xufTtcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wuTGF5ZXJzIGlzIGEgY29udHJvbCB0byBhbGxvdyB1c2VycyB0byBzd2l0Y2ggYmV0d2VlbiBkaWZmZXJlbnQgbGF5ZXJzIG9uIHRoZSBtYXAuXHJcbiAqL1xyXG5cclxuTC5Db250cm9sLkxheWVycyA9IEwuQ29udHJvbC5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGNvbGxhcHNlZDogdHJ1ZSxcclxuXHRcdHBvc2l0aW9uOiAndG9wcmlnaHQnLFxyXG5cdFx0YXV0b1pJbmRleDogdHJ1ZVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChiYXNlTGF5ZXJzLCBvdmVybGF5cywgb3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX2xheWVycyA9IHt9O1xyXG5cdFx0dGhpcy5fbGFzdFpJbmRleCA9IDA7XHJcblx0XHR0aGlzLl9oYW5kbGluZ0NsaWNrID0gZmFsc2U7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiBiYXNlTGF5ZXJzKSB7XHJcblx0XHRcdHRoaXMuX2FkZExheWVyKGJhc2VMYXllcnNbaV0sIGkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAoaSBpbiBvdmVybGF5cykge1xyXG5cdFx0XHR0aGlzLl9hZGRMYXllcihvdmVybGF5c1tpXSwgaSwgdHJ1ZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX2luaXRMYXlvdXQoKTtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cclxuXHRcdG1hcFxyXG5cdFx0ICAgIC5vbignbGF5ZXJhZGQnLCB0aGlzLl9vbkxheWVyQ2hhbmdlLCB0aGlzKVxyXG5cdFx0ICAgIC5vbignbGF5ZXJyZW1vdmUnLCB0aGlzLl9vbkxheWVyQ2hhbmdlLCB0aGlzKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cdG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXBcclxuXHRcdCAgICAub2ZmKCdsYXllcmFkZCcsIHRoaXMuX29uTGF5ZXJDaGFuZ2UsIHRoaXMpXHJcblx0XHQgICAgLm9mZignbGF5ZXJyZW1vdmUnLCB0aGlzLl9vbkxheWVyQ2hhbmdlLCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRhZGRCYXNlTGF5ZXI6IGZ1bmN0aW9uIChsYXllciwgbmFtZSkge1xyXG5cdFx0dGhpcy5fYWRkTGF5ZXIobGF5ZXIsIG5hbWUpO1xyXG5cdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRhZGRPdmVybGF5OiBmdW5jdGlvbiAobGF5ZXIsIG5hbWUpIHtcclxuXHRcdHRoaXMuX2FkZExheWVyKGxheWVyLCBuYW1lLCB0cnVlKTtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlTGF5ZXI6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0dmFyIGlkID0gTC5zdGFtcChsYXllcik7XHJcblx0XHRkZWxldGUgdGhpcy5fbGF5ZXJzW2lkXTtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X2luaXRMYXlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjbGFzc05hbWUgPSAnbGVhZmxldC1jb250cm9sLWxheWVycycsXHJcblx0XHQgICAgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lKTtcclxuXHJcblx0XHQvL01ha2VzIHRoaXMgd29yayBvbiBJRTEwIFRvdWNoIGRldmljZXMgYnkgc3RvcHBpbmcgaXQgZnJvbSBmaXJpbmcgYSBtb3VzZW91dCBldmVudCB3aGVuIHRoZSB0b3VjaCBpcyByZWxlYXNlZFxyXG5cdFx0Y29udGFpbmVyLnNldEF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcsIHRydWUpO1xyXG5cclxuXHRcdGlmICghTC5Ccm93c2VyLnRvdWNoKSB7XHJcblx0XHRcdEwuRG9tRXZlbnRcclxuXHRcdFx0XHQuZGlzYWJsZUNsaWNrUHJvcGFnYXRpb24oY29udGFpbmVyKVxyXG5cdFx0XHRcdC5kaXNhYmxlU2Nyb2xsUHJvcGFnYXRpb24oY29udGFpbmVyKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdEwuRG9tRXZlbnQub24oY29udGFpbmVyLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScsIGNsYXNzTmFtZSArICctbGlzdCcpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY29sbGFwc2VkKSB7XHJcblx0XHRcdGlmICghTC5Ccm93c2VyLmFuZHJvaWQpIHtcclxuXHRcdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdFx0ICAgIC5vbihjb250YWluZXIsICdtb3VzZW92ZXInLCB0aGlzLl9leHBhbmQsIHRoaXMpXHJcblx0XHRcdFx0ICAgIC5vbihjb250YWluZXIsICdtb3VzZW91dCcsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgbGluayA9IHRoaXMuX2xheWVyc0xpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgY2xhc3NOYW1lICsgJy10b2dnbGUnLCBjb250YWluZXIpO1xyXG5cdFx0XHRsaW5rLmhyZWYgPSAnIyc7XHJcblx0XHRcdGxpbmsudGl0bGUgPSAnTGF5ZXJzJztcclxuXHJcblx0XHRcdGlmIChMLkJyb3dzZXIudG91Y2gpIHtcclxuXHRcdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdFx0ICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3ApXHJcblx0XHRcdFx0ICAgIC5vbihsaW5rLCAnY2xpY2snLCB0aGlzLl9leHBhbmQsIHRoaXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdEwuRG9tRXZlbnQub24obGluaywgJ2ZvY3VzJywgdGhpcy5fZXhwYW5kLCB0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL1dvcmsgYXJvdW5kIGZvciBGaXJlZm94IGFuZHJvaWQgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9pc3N1ZXMvMjAzM1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGZvcm0sICdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KEwuYmluZCh0aGlzLl9vbklucHV0Q2xpY2ssIHRoaXMpLCAwKTtcclxuXHRcdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0XHR0aGlzLl9tYXAub24oJ2NsaWNrJywgdGhpcy5fY29sbGFwc2UsIHRoaXMpO1xyXG5cdFx0XHQvLyBUT0RPIGtleWJvYXJkIGFjY2Vzc2liaWxpdHlcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2V4cGFuZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2Jhc2VMYXllcnNMaXN0ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1iYXNlJywgZm9ybSk7XHJcblx0XHR0aGlzLl9zZXBhcmF0b3IgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUgKyAnLXNlcGFyYXRvcicsIGZvcm0pO1xyXG5cdFx0dGhpcy5fb3ZlcmxheXNMaXN0ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1vdmVybGF5cycsIGZvcm0pO1xyXG5cclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcclxuXHR9LFxyXG5cclxuXHRfYWRkTGF5ZXI6IGZ1bmN0aW9uIChsYXllciwgbmFtZSwgb3ZlcmxheSkge1xyXG5cdFx0dmFyIGlkID0gTC5zdGFtcChsYXllcik7XHJcblxyXG5cdFx0dGhpcy5fbGF5ZXJzW2lkXSA9IHtcclxuXHRcdFx0bGF5ZXI6IGxheWVyLFxyXG5cdFx0XHRuYW1lOiBuYW1lLFxyXG5cdFx0XHRvdmVybGF5OiBvdmVybGF5XHJcblx0XHR9O1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuYXV0b1pJbmRleCAmJiBsYXllci5zZXRaSW5kZXgpIHtcclxuXHRcdFx0dGhpcy5fbGFzdFpJbmRleCsrO1xyXG5cdFx0XHRsYXllci5zZXRaSW5kZXgodGhpcy5fbGFzdFpJbmRleCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2Jhc2VMYXllcnNMaXN0LmlubmVySFRNTCA9ICcnO1xyXG5cdFx0dGhpcy5fb3ZlcmxheXNMaXN0LmlubmVySFRNTCA9ICcnO1xyXG5cclxuXHRcdHZhciBiYXNlTGF5ZXJzUHJlc2VudCA9IGZhbHNlLFxyXG5cdFx0ICAgIG92ZXJsYXlzUHJlc2VudCA9IGZhbHNlLFxyXG5cdFx0ICAgIGksIG9iajtcclxuXHJcblx0XHRmb3IgKGkgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdG9iaiA9IHRoaXMuX2xheWVyc1tpXTtcclxuXHRcdFx0dGhpcy5fYWRkSXRlbShvYmopO1xyXG5cdFx0XHRvdmVybGF5c1ByZXNlbnQgPSBvdmVybGF5c1ByZXNlbnQgfHwgb2JqLm92ZXJsYXk7XHJcblx0XHRcdGJhc2VMYXllcnNQcmVzZW50ID0gYmFzZUxheWVyc1ByZXNlbnQgfHwgIW9iai5vdmVybGF5O1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3NlcGFyYXRvci5zdHlsZS5kaXNwbGF5ID0gb3ZlcmxheXNQcmVzZW50ICYmIGJhc2VMYXllcnNQcmVzZW50ID8gJycgOiAnbm9uZSc7XHJcblx0fSxcclxuXHJcblx0X29uTGF5ZXJDaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR2YXIgb2JqID0gdGhpcy5fbGF5ZXJzW0wuc3RhbXAoZS5sYXllcildO1xyXG5cclxuXHRcdGlmICghb2JqKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmICghdGhpcy5faGFuZGxpbmdDbGljaykge1xyXG5cdFx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgdHlwZSA9IG9iai5vdmVybGF5ID9cclxuXHRcdFx0KGUudHlwZSA9PT0gJ2xheWVyYWRkJyA/ICdvdmVybGF5YWRkJyA6ICdvdmVybGF5cmVtb3ZlJykgOlxyXG5cdFx0XHQoZS50eXBlID09PSAnbGF5ZXJhZGQnID8gJ2Jhc2VsYXllcmNoYW5nZScgOiBudWxsKTtcclxuXHJcblx0XHRpZiAodHlwZSkge1xyXG5cdFx0XHR0aGlzLl9tYXAuZmlyZSh0eXBlLCBvYmopO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIElFNyBidWdzIG91dCBpZiB5b3UgY3JlYXRlIGEgcmFkaW8gZHluYW1pY2FsbHksIHNvIHlvdSBoYXZlIHRvIGRvIGl0IHRoaXMgaGFja3kgd2F5IChzZWUgaHR0cDovL2JpdC5seS9QcVlMQmUpXHJcblx0X2NyZWF0ZVJhZGlvRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIGNoZWNrZWQpIHtcclxuXHJcblx0XHR2YXIgcmFkaW9IdG1sID0gJzxpbnB1dCB0eXBlPVwicmFkaW9cIiBjbGFzcz1cImxlYWZsZXQtY29udHJvbC1sYXllcnMtc2VsZWN0b3JcIiBuYW1lPVwiJyArIG5hbWUgKyAnXCInO1xyXG5cdFx0aWYgKGNoZWNrZWQpIHtcclxuXHRcdFx0cmFkaW9IdG1sICs9ICcgY2hlY2tlZD1cImNoZWNrZWRcIic7XHJcblx0XHR9XHJcblx0XHRyYWRpb0h0bWwgKz0gJy8+JztcclxuXHJcblx0XHR2YXIgcmFkaW9GcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0cmFkaW9GcmFnbWVudC5pbm5lckhUTUwgPSByYWRpb0h0bWw7XHJcblxyXG5cdFx0cmV0dXJuIHJhZGlvRnJhZ21lbnQuZmlyc3RDaGlsZDtcclxuXHR9LFxyXG5cclxuXHRfYWRkSXRlbTogZnVuY3Rpb24gKG9iaikge1xyXG5cdFx0dmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKSxcclxuXHRcdCAgICBpbnB1dCxcclxuXHRcdCAgICBjaGVja2VkID0gdGhpcy5fbWFwLmhhc0xheWVyKG9iai5sYXllcik7XHJcblxyXG5cdFx0aWYgKG9iai5vdmVybGF5KSB7XHJcblx0XHRcdGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHRcdFx0aW5wdXQudHlwZSA9ICdjaGVja2JveCc7XHJcblx0XHRcdGlucHV0LmNsYXNzTmFtZSA9ICdsZWFmbGV0LWNvbnRyb2wtbGF5ZXJzLXNlbGVjdG9yJztcclxuXHRcdFx0aW5wdXQuZGVmYXVsdENoZWNrZWQgPSBjaGVja2VkO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aW5wdXQgPSB0aGlzLl9jcmVhdGVSYWRpb0VsZW1lbnQoJ2xlYWZsZXQtYmFzZS1sYXllcnMnLCBjaGVja2VkKTtcclxuXHRcdH1cclxuXHJcblx0XHRpbnB1dC5sYXllcklkID0gTC5zdGFtcChvYmoubGF5ZXIpO1xyXG5cclxuXHRcdEwuRG9tRXZlbnQub24oaW5wdXQsICdjbGljaycsIHRoaXMuX29uSW5wdXRDbGljaywgdGhpcyk7XHJcblxyXG5cdFx0dmFyIG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblx0XHRuYW1lLmlubmVySFRNTCA9ICcgJyArIG9iai5uYW1lO1xyXG5cclxuXHRcdGxhYmVsLmFwcGVuZENoaWxkKGlucHV0KTtcclxuXHRcdGxhYmVsLmFwcGVuZENoaWxkKG5hbWUpO1xyXG5cclxuXHRcdHZhciBjb250YWluZXIgPSBvYmoub3ZlcmxheSA/IHRoaXMuX292ZXJsYXlzTGlzdCA6IHRoaXMuX2Jhc2VMYXllcnNMaXN0O1xyXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKGxhYmVsKTtcclxuXHJcblx0XHRyZXR1cm4gbGFiZWw7XHJcblx0fSxcclxuXHJcblx0X29uSW5wdXRDbGljazogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGksIGlucHV0LCBvYmosXHJcblx0XHQgICAgaW5wdXRzID0gdGhpcy5fZm9ybS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSxcclxuXHRcdCAgICBpbnB1dHNMZW4gPSBpbnB1dHMubGVuZ3RoO1xyXG5cclxuXHRcdHRoaXMuX2hhbmRsaW5nQ2xpY2sgPSB0cnVlO1xyXG5cclxuXHRcdGZvciAoaSA9IDA7IGkgPCBpbnB1dHNMZW47IGkrKykge1xyXG5cdFx0XHRpbnB1dCA9IGlucHV0c1tpXTtcclxuXHRcdFx0b2JqID0gdGhpcy5fbGF5ZXJzW2lucHV0LmxheWVySWRdO1xyXG5cclxuXHRcdFx0aWYgKGlucHV0LmNoZWNrZWQgJiYgIXRoaXMuX21hcC5oYXNMYXllcihvYmoubGF5ZXIpKSB7XHJcblx0XHRcdFx0dGhpcy5fbWFwLmFkZExheWVyKG9iai5sYXllcik7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYgKCFpbnB1dC5jaGVja2VkICYmIHRoaXMuX21hcC5oYXNMYXllcihvYmoubGF5ZXIpKSB7XHJcblx0XHRcdFx0dGhpcy5fbWFwLnJlbW92ZUxheWVyKG9iai5sYXllcik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9oYW5kbGluZ0NsaWNrID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy5fcmVmb2N1c09uTWFwKCk7XHJcblx0fSxcclxuXHJcblx0X2V4cGFuZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtY29udHJvbC1sYXllcnMtZXhwYW5kZWQnKTtcclxuXHR9LFxyXG5cclxuXHRfY29sbGFwc2U6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLl9jb250YWluZXIuY2xhc3NOYW1lLnJlcGxhY2UoJyBsZWFmbGV0LWNvbnRyb2wtbGF5ZXJzLWV4cGFuZGVkJywgJycpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmNvbnRyb2wubGF5ZXJzID0gZnVuY3Rpb24gKGJhc2VMYXllcnMsIG92ZXJsYXlzLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkNvbnRyb2wuTGF5ZXJzKGJhc2VMYXllcnMsIG92ZXJsYXlzLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXG4gKiBMLlBvc0FuaW1hdGlvbiBpcyB1c2VkIGJ5IExlYWZsZXQgaW50ZXJuYWxseSBmb3IgcGFuIGFuaW1hdGlvbnMuXG4gKi9cblxuTC5Qb3NBbmltYXRpb24gPSBMLkNsYXNzLmV4dGVuZCh7XG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcblxuXHRydW46IGZ1bmN0aW9uIChlbCwgbmV3UG9zLCBkdXJhdGlvbiwgZWFzZUxpbmVhcml0eSkgeyAvLyAoSFRNTEVsZW1lbnQsIFBvaW50WywgTnVtYmVyLCBOdW1iZXJdKVxuXHRcdHRoaXMuc3RvcCgpO1xuXG5cdFx0dGhpcy5fZWwgPSBlbDtcblx0XHR0aGlzLl9pblByb2dyZXNzID0gdHJ1ZTtcblx0XHR0aGlzLl9uZXdQb3MgPSBuZXdQb3M7XG5cblx0XHR0aGlzLmZpcmUoJ3N0YXJ0Jyk7XG5cblx0XHRlbC5zdHlsZVtMLkRvbVV0aWwuVFJBTlNJVElPTl0gPSAnYWxsICcgKyAoZHVyYXRpb24gfHwgMC4yNSkgK1xuXHRcdCAgICAgICAgJ3MgY3ViaWMtYmV6aWVyKDAsMCwnICsgKGVhc2VMaW5lYXJpdHkgfHwgMC41KSArICcsMSknO1xuXG5cdFx0TC5Eb21FdmVudC5vbihlbCwgTC5Eb21VdGlsLlRSQU5TSVRJT05fRU5ELCB0aGlzLl9vblRyYW5zaXRpb25FbmQsIHRoaXMpO1xuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbihlbCwgbmV3UG9zKTtcblxuXHRcdC8vIHRvZ2dsZSByZWZsb3csIENocm9tZSBmbGlja2VycyBmb3Igc29tZSByZWFzb24gaWYgeW91IGRvbid0IGRvIHRoaXNcblx0XHRMLlV0aWwuZmFsc2VGbihlbC5vZmZzZXRXaWR0aCk7XG5cblx0XHQvLyB0aGVyZSdzIG5vIG5hdGl2ZSB3YXkgdG8gdHJhY2sgdmFsdWUgdXBkYXRlcyBvZiB0cmFuc2l0aW9uZWQgcHJvcGVydGllcywgc28gd2UgaW1pdGF0ZSB0aGlzXG5cdFx0dGhpcy5fc3RlcFRpbWVyID0gc2V0SW50ZXJ2YWwoTC5iaW5kKHRoaXMuX29uU3RlcCwgdGhpcyksIDUwKTtcblx0fSxcblxuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLl9pblByb2dyZXNzKSB7IHJldHVybjsgfVxuXG5cdFx0Ly8gaWYgd2UganVzdCByZW1vdmVkIHRoZSB0cmFuc2l0aW9uIHByb3BlcnR5LCB0aGUgZWxlbWVudCB3b3VsZCBqdW1wIHRvIGl0cyBmaW5hbCBwb3NpdGlvbixcblx0XHQvLyBzbyB3ZSBuZWVkIHRvIG1ha2UgaXQgc3RheSBhdCB0aGUgY3VycmVudCBwb3NpdGlvblxuXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2VsLCB0aGlzLl9nZXRQb3MoKSk7XG5cdFx0dGhpcy5fb25UcmFuc2l0aW9uRW5kKCk7XG5cdFx0TC5VdGlsLmZhbHNlRm4odGhpcy5fZWwub2Zmc2V0V2lkdGgpOyAvLyBmb3JjZSByZWZsb3cgaW4gY2FzZSB3ZSBhcmUgYWJvdXQgdG8gc3RhcnQgYSBuZXcgYW5pbWF0aW9uXG5cdH0sXG5cblx0X29uU3RlcDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdGVwUG9zID0gdGhpcy5fZ2V0UG9zKCk7XG5cdFx0aWYgKCFzdGVwUG9zKSB7XG5cdFx0XHR0aGlzLl9vblRyYW5zaXRpb25FbmQoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly8ganNoaW50IGNhbWVsY2FzZTogZmFsc2Vcblx0XHQvLyBtYWtlIEwuRG9tVXRpbC5nZXRQb3NpdGlvbiByZXR1cm4gaW50ZXJtZWRpYXRlIHBvc2l0aW9uIHZhbHVlIGR1cmluZyBhbmltYXRpb25cblx0XHR0aGlzLl9lbC5fbGVhZmxldF9wb3MgPSBzdGVwUG9zO1xuXG5cdFx0dGhpcy5maXJlKCdzdGVwJyk7XG5cdH0sXG5cblx0Ly8geW91IGNhbid0IGVhc2lseSBnZXQgaW50ZXJtZWRpYXRlIHZhbHVlcyBvZiBwcm9wZXJ0aWVzIGFuaW1hdGVkIHdpdGggQ1NTMyBUcmFuc2l0aW9ucyxcblx0Ly8gd2UgbmVlZCB0byBwYXJzZSBjb21wdXRlZCBzdHlsZSAoaW4gY2FzZSBvZiB0cmFuc2Zvcm0gaXQgcmV0dXJucyBtYXRyaXggc3RyaW5nKVxuXG5cdF90cmFuc2Zvcm1SZTogLyhbLStdPyg/OlxcZCpcXC4pP1xcZCspXFxEKiwgKFstK10/KD86XFxkKlxcLik/XFxkKylcXEQqXFwpLyxcblxuXHRfZ2V0UG9zOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGxlZnQsIHRvcCwgbWF0Y2hlcyxcblx0XHQgICAgZWwgPSB0aGlzLl9lbCxcblx0XHQgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG5cblx0XHRpZiAoTC5Ccm93c2VyLmFueTNkKSB7XG5cdFx0XHRtYXRjaGVzID0gc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0ubWF0Y2godGhpcy5fdHJhbnNmb3JtUmUpO1xuXHRcdFx0aWYgKCFtYXRjaGVzKSB7IHJldHVybjsgfVxuXHRcdFx0bGVmdCA9IHBhcnNlRmxvYXQobWF0Y2hlc1sxXSk7XG5cdFx0XHR0b3AgID0gcGFyc2VGbG9hdChtYXRjaGVzWzJdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGVmdCA9IHBhcnNlRmxvYXQoc3R5bGUubGVmdCk7XG5cdFx0XHR0b3AgID0gcGFyc2VGbG9hdChzdHlsZS50b3ApO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgTC5Qb2ludChsZWZ0LCB0b3AsIHRydWUpO1xuXHR9LFxuXG5cdF9vblRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9lbCwgTC5Eb21VdGlsLlRSQU5TSVRJT05fRU5ELCB0aGlzLl9vblRyYW5zaXRpb25FbmQsIHRoaXMpO1xuXG5cdFx0aWYgKCF0aGlzLl9pblByb2dyZXNzKSB7IHJldHVybjsgfVxuXHRcdHRoaXMuX2luUHJvZ3Jlc3MgPSBmYWxzZTtcblxuXHRcdHRoaXMuX2VsLnN0eWxlW0wuRG9tVXRpbC5UUkFOU0lUSU9OXSA9ICcnO1xuXG5cdFx0Ly8ganNoaW50IGNhbWVsY2FzZTogZmFsc2Vcblx0XHQvLyBtYWtlIHN1cmUgTC5Eb21VdGlsLmdldFBvc2l0aW9uIHJldHVybnMgdGhlIGZpbmFsIHBvc2l0aW9uIHZhbHVlIGFmdGVyIGFuaW1hdGlvblxuXHRcdHRoaXMuX2VsLl9sZWFmbGV0X3BvcyA9IHRoaXMuX25ld1BvcztcblxuXHRcdGNsZWFySW50ZXJ2YWwodGhpcy5fc3RlcFRpbWVyKTtcblxuXHRcdHRoaXMuZmlyZSgnc3RlcCcpLmZpcmUoJ2VuZCcpO1xuXHR9XG5cbn0pO1xuXG5cbi8qXG4gKiBFeHRlbmRzIEwuTWFwIHRvIGhhbmRsZSBwYW5uaW5nIGFuaW1hdGlvbnMuXG4gKi9cblxuTC5NYXAuaW5jbHVkZSh7XG5cblx0c2V0VmlldzogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgb3B0aW9ucykge1xuXG5cdFx0em9vbSA9IHpvb20gPT09IHVuZGVmaW5lZCA/IHRoaXMuX3pvb20gOiB0aGlzLl9saW1pdFpvb20oem9vbSk7XG5cdFx0Y2VudGVyID0gdGhpcy5fbGltaXRDZW50ZXIoTC5sYXRMbmcoY2VudGVyKSwgem9vbSwgdGhpcy5vcHRpb25zLm1heEJvdW5kcyk7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRpZiAodGhpcy5fcGFuQW5pbSkge1xuXHRcdFx0dGhpcy5fcGFuQW5pbS5zdG9wKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCAmJiAhb3B0aW9ucy5yZXNldCAmJiBvcHRpb25zICE9PSB0cnVlKSB7XG5cblx0XHRcdGlmIChvcHRpb25zLmFuaW1hdGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRvcHRpb25zLnpvb20gPSBMLmV4dGVuZCh7YW5pbWF0ZTogb3B0aW9ucy5hbmltYXRlfSwgb3B0aW9ucy56b29tKTtcblx0XHRcdFx0b3B0aW9ucy5wYW4gPSBMLmV4dGVuZCh7YW5pbWF0ZTogb3B0aW9ucy5hbmltYXRlfSwgb3B0aW9ucy5wYW4pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0cnkgYW5pbWF0aW5nIHBhbiBvciB6b29tXG5cdFx0XHR2YXIgYW5pbWF0ZWQgPSAodGhpcy5fem9vbSAhPT0gem9vbSkgP1xuXHRcdFx0XHR0aGlzLl90cnlBbmltYXRlZFpvb20gJiYgdGhpcy5fdHJ5QW5pbWF0ZWRab29tKGNlbnRlciwgem9vbSwgb3B0aW9ucy56b29tKSA6XG5cdFx0XHRcdHRoaXMuX3RyeUFuaW1hdGVkUGFuKGNlbnRlciwgb3B0aW9ucy5wYW4pO1xuXG5cdFx0XHRpZiAoYW5pbWF0ZWQpIHtcblx0XHRcdFx0Ly8gcHJldmVudCByZXNpemUgaGFuZGxlciBjYWxsLCB0aGUgdmlldyB3aWxsIHJlZnJlc2ggYWZ0ZXIgYW5pbWF0aW9uIGFueXdheVxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fc2l6ZVRpbWVyKTtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYW5pbWF0aW9uIGRpZG4ndCBzdGFydCwganVzdCByZXNldCB0aGUgbWFwIHZpZXdcblx0XHR0aGlzLl9yZXNldFZpZXcoY2VudGVyLCB6b29tKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHBhbkJ5OiBmdW5jdGlvbiAob2Zmc2V0LCBvcHRpb25zKSB7XG5cdFx0b2Zmc2V0ID0gTC5wb2ludChvZmZzZXQpLnJvdW5kKCk7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRpZiAoIW9mZnNldC54ICYmICFvZmZzZXQueSkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLl9wYW5BbmltKSB7XG5cdFx0XHR0aGlzLl9wYW5BbmltID0gbmV3IEwuUG9zQW5pbWF0aW9uKCk7XG5cblx0XHRcdHRoaXMuX3BhbkFuaW0ub24oe1xuXHRcdFx0XHQnc3RlcCc6IHRoaXMuX29uUGFuVHJhbnNpdGlvblN0ZXAsXG5cdFx0XHRcdCdlbmQnOiB0aGlzLl9vblBhblRyYW5zaXRpb25FbmRcblx0XHRcdH0sIHRoaXMpO1xuXHRcdH1cblxuXHRcdC8vIGRvbid0IGZpcmUgbW92ZXN0YXJ0IGlmIGFuaW1hdGluZyBpbmVydGlhXG5cdFx0aWYgKCFvcHRpb25zLm5vTW92ZVN0YXJ0KSB7XG5cdFx0XHR0aGlzLmZpcmUoJ21vdmVzdGFydCcpO1xuXHRcdH1cblxuXHRcdC8vIGFuaW1hdGUgcGFuIHVubGVzcyBhbmltYXRlOiBmYWxzZSBzcGVjaWZpZWRcblx0XHRpZiAob3B0aW9ucy5hbmltYXRlICE9PSBmYWxzZSkge1xuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX21hcFBhbmUsICdsZWFmbGV0LXBhbi1hbmltJyk7XG5cblx0XHRcdHZhciBuZXdQb3MgPSB0aGlzLl9nZXRNYXBQYW5lUG9zKCkuc3VidHJhY3Qob2Zmc2V0KTtcblx0XHRcdHRoaXMuX3BhbkFuaW0ucnVuKHRoaXMuX21hcFBhbmUsIG5ld1Bvcywgb3B0aW9ucy5kdXJhdGlvbiB8fCAwLjI1LCBvcHRpb25zLmVhc2VMaW5lYXJpdHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9yYXdQYW5CeShvZmZzZXQpO1xuXHRcdFx0dGhpcy5maXJlKCdtb3ZlJykuZmlyZSgnbW92ZWVuZCcpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdF9vblBhblRyYW5zaXRpb25TdGVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5maXJlKCdtb3ZlJyk7XG5cdH0sXG5cblx0X29uUGFuVHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9tYXBQYW5lLCAnbGVhZmxldC1wYW4tYW5pbScpO1xuXHRcdHRoaXMuZmlyZSgnbW92ZWVuZCcpO1xuXHR9LFxuXG5cdF90cnlBbmltYXRlZFBhbjogZnVuY3Rpb24gKGNlbnRlciwgb3B0aW9ucykge1xuXHRcdC8vIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbmV3IGFuZCBjdXJyZW50IGNlbnRlcnMgaW4gcGl4ZWxzXG5cdFx0dmFyIG9mZnNldCA9IHRoaXMuX2dldENlbnRlck9mZnNldChjZW50ZXIpLl9mbG9vcigpO1xuXG5cdFx0Ly8gZG9uJ3QgYW5pbWF0ZSB0b28gZmFyIHVubGVzcyBhbmltYXRlOiB0cnVlIHNwZWNpZmllZCBpbiBvcHRpb25zXG5cdFx0aWYgKChvcHRpb25zICYmIG9wdGlvbnMuYW5pbWF0ZSkgIT09IHRydWUgJiYgIXRoaXMuZ2V0U2l6ZSgpLmNvbnRhaW5zKG9mZnNldCkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0XHR0aGlzLnBhbkJ5KG9mZnNldCwgb3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufSk7XG5cblxuLypcbiAqIEwuUG9zQW5pbWF0aW9uIGZhbGxiYWNrIGltcGxlbWVudGF0aW9uIHRoYXQgcG93ZXJzIExlYWZsZXQgcGFuIGFuaW1hdGlvbnNcbiAqIGluIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBDU1MzIFRyYW5zaXRpb25zLlxuICovXG5cbkwuUG9zQW5pbWF0aW9uID0gTC5Eb21VdGlsLlRSQU5TSVRJT04gPyBMLlBvc0FuaW1hdGlvbiA6IEwuUG9zQW5pbWF0aW9uLmV4dGVuZCh7XG5cblx0cnVuOiBmdW5jdGlvbiAoZWwsIG5ld1BvcywgZHVyYXRpb24sIGVhc2VMaW5lYXJpdHkpIHsgLy8gKEhUTUxFbGVtZW50LCBQb2ludFssIE51bWJlciwgTnVtYmVyXSlcblx0XHR0aGlzLnN0b3AoKTtcblxuXHRcdHRoaXMuX2VsID0gZWw7XG5cdFx0dGhpcy5faW5Qcm9ncmVzcyA9IHRydWU7XG5cdFx0dGhpcy5fZHVyYXRpb24gPSBkdXJhdGlvbiB8fCAwLjI1O1xuXHRcdHRoaXMuX2Vhc2VPdXRQb3dlciA9IDEgLyBNYXRoLm1heChlYXNlTGluZWFyaXR5IHx8IDAuNSwgMC4yKTtcblxuXHRcdHRoaXMuX3N0YXJ0UG9zID0gTC5Eb21VdGlsLmdldFBvc2l0aW9uKGVsKTtcblx0XHR0aGlzLl9vZmZzZXQgPSBuZXdQb3Muc3VidHJhY3QodGhpcy5fc3RhcnRQb3MpO1xuXHRcdHRoaXMuX3N0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG5cdFx0dGhpcy5maXJlKCdzdGFydCcpO1xuXG5cdFx0dGhpcy5fYW5pbWF0ZSgpO1xuXHR9LFxuXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIXRoaXMuX2luUHJvZ3Jlc3MpIHsgcmV0dXJuOyB9XG5cblx0XHR0aGlzLl9zdGVwKCk7XG5cdFx0dGhpcy5fY29tcGxldGUoKTtcblx0fSxcblxuXHRfYW5pbWF0ZTogZnVuY3Rpb24gKCkge1xuXHRcdC8vIGFuaW1hdGlvbiBsb29wXG5cdFx0dGhpcy5fYW5pbUlkID0gTC5VdGlsLnJlcXVlc3RBbmltRnJhbWUodGhpcy5fYW5pbWF0ZSwgdGhpcyk7XG5cdFx0dGhpcy5fc3RlcCgpO1xuXHR9LFxuXG5cdF9zdGVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGVsYXBzZWQgPSAoK25ldyBEYXRlKCkpIC0gdGhpcy5fc3RhcnRUaW1lLFxuXHRcdCAgICBkdXJhdGlvbiA9IHRoaXMuX2R1cmF0aW9uICogMTAwMDtcblxuXHRcdGlmIChlbGFwc2VkIDwgZHVyYXRpb24pIHtcblx0XHRcdHRoaXMuX3J1bkZyYW1lKHRoaXMuX2Vhc2VPdXQoZWxhcHNlZCAvIGR1cmF0aW9uKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX3J1bkZyYW1lKDEpO1xuXHRcdFx0dGhpcy5fY29tcGxldGUoKTtcblx0XHR9XG5cdH0sXG5cblx0X3J1bkZyYW1lOiBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcblx0XHR2YXIgcG9zID0gdGhpcy5fc3RhcnRQb3MuYWRkKHRoaXMuX29mZnNldC5tdWx0aXBseUJ5KHByb2dyZXNzKSk7XG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2VsLCBwb3MpO1xuXG5cdFx0dGhpcy5maXJlKCdzdGVwJyk7XG5cdH0sXG5cblx0X2NvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5VdGlsLmNhbmNlbEFuaW1GcmFtZSh0aGlzLl9hbmltSWQpO1xuXG5cdFx0dGhpcy5faW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdHRoaXMuZmlyZSgnZW5kJyk7XG5cdH0sXG5cblx0X2Vhc2VPdXQ6IGZ1bmN0aW9uICh0KSB7XG5cdFx0cmV0dXJuIDEgLSBNYXRoLnBvdygxIC0gdCwgdGhpcy5fZWFzZU91dFBvd2VyKTtcblx0fVxufSk7XG5cblxuLypcbiAqIEV4dGVuZHMgTC5NYXAgdG8gaGFuZGxlIHpvb20gYW5pbWF0aW9ucy5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHR6b29tQW5pbWF0aW9uOiB0cnVlLFxuXHR6b29tQW5pbWF0aW9uVGhyZXNob2xkOiA0XG59KTtcblxuaWYgKEwuRG9tVXRpbC5UUkFOU0lUSU9OKSB7XG5cblx0TC5NYXAuYWRkSW5pdEhvb2soZnVuY3Rpb24gKCkge1xuXHRcdC8vIGRvbid0IGFuaW1hdGUgb24gYnJvd3NlcnMgd2l0aG91dCBoYXJkd2FyZS1hY2NlbGVyYXRlZCB0cmFuc2l0aW9ucyBvciBvbGQgQW5kcm9pZC9PcGVyYVxuXHRcdHRoaXMuX3pvb21BbmltYXRlZCA9IHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuRG9tVXRpbC5UUkFOU0lUSU9OICYmXG5cdFx0XHRcdEwuQnJvd3Nlci5hbnkzZCAmJiAhTC5Ccm93c2VyLmFuZHJvaWQyMyAmJiAhTC5Ccm93c2VyLm1vYmlsZU9wZXJhO1xuXG5cdFx0Ly8gem9vbSB0cmFuc2l0aW9ucyBydW4gd2l0aCB0aGUgc2FtZSBkdXJhdGlvbiBmb3IgYWxsIGxheWVycywgc28gaWYgb25lIG9mIHRyYW5zaXRpb25lbmQgZXZlbnRzXG5cdFx0Ly8gaGFwcGVucyBhZnRlciBzdGFydGluZyB6b29tIGFuaW1hdGlvbiAocHJvcGFnYXRpbmcgdG8gdGhlIG1hcCBwYW5lKSwgd2Uga25vdyB0aGF0IGl0IGVuZGVkIGdsb2JhbGx5XG5cdFx0aWYgKHRoaXMuX3pvb21BbmltYXRlZCkge1xuXHRcdFx0TC5Eb21FdmVudC5vbih0aGlzLl9tYXBQYW5lLCBMLkRvbVV0aWwuVFJBTlNJVElPTl9FTkQsIHRoaXMuX2NhdGNoVHJhbnNpdGlvbkVuZCwgdGhpcyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuTC5NYXAuaW5jbHVkZSghTC5Eb21VdGlsLlRSQU5TSVRJT04gPyB7fSA6IHtcblxuXHRfY2F0Y2hUcmFuc2l0aW9uRW5kOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICh0aGlzLl9hbmltYXRpbmdab29tICYmIGUucHJvcGVydHlOYW1lLmluZGV4T2YoJ3RyYW5zZm9ybScpID49IDApIHtcblx0XHRcdHRoaXMuX29uWm9vbVRyYW5zaXRpb25FbmQoKTtcblx0XHR9XG5cdH0sXG5cblx0X25vdGhpbmdUb0FuaW1hdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gIXRoaXMuX2NvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnKS5sZW5ndGg7XG5cdH0sXG5cblx0X3RyeUFuaW1hdGVkWm9vbTogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgb3B0aW9ucykge1xuXG5cdFx0aWYgKHRoaXMuX2FuaW1hdGluZ1pvb20pIHsgcmV0dXJuIHRydWU7IH1cblxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Ly8gZG9uJ3QgYW5pbWF0ZSBpZiBkaXNhYmxlZCwgbm90IHN1cHBvcnRlZCBvciB6b29tIGRpZmZlcmVuY2UgaXMgdG9vIGxhcmdlXG5cdFx0aWYgKCF0aGlzLl96b29tQW5pbWF0ZWQgfHwgb3B0aW9ucy5hbmltYXRlID09PSBmYWxzZSB8fCB0aGlzLl9ub3RoaW5nVG9BbmltYXRlKCkgfHxcblx0XHQgICAgICAgIE1hdGguYWJzKHpvb20gLSB0aGlzLl96b29tKSA+IHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uVGhyZXNob2xkKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0Ly8gb2Zmc2V0IGlzIHRoZSBwaXhlbCBjb29yZHMgb2YgdGhlIHpvb20gb3JpZ2luIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IGNlbnRlclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuZ2V0Wm9vbVNjYWxlKHpvb20pLFxuXHRcdCAgICBvZmZzZXQgPSB0aGlzLl9nZXRDZW50ZXJPZmZzZXQoY2VudGVyKS5fZGl2aWRlQnkoMSAtIDEgLyBzY2FsZSksXG5cdFx0XHRvcmlnaW4gPSB0aGlzLl9nZXRDZW50ZXJMYXllclBvaW50KCkuX2FkZChvZmZzZXQpO1xuXG5cdFx0Ly8gZG9uJ3QgYW5pbWF0ZSBpZiB0aGUgem9vbSBvcmlnaW4gaXNuJ3Qgd2l0aGluIG9uZSBzY3JlZW4gZnJvbSB0aGUgY3VycmVudCBjZW50ZXIsIHVubGVzcyBmb3JjZWRcblx0XHRpZiAob3B0aW9ucy5hbmltYXRlICE9PSB0cnVlICYmICF0aGlzLmdldFNpemUoKS5jb250YWlucyhvZmZzZXQpKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0dGhpc1xuXHRcdCAgICAuZmlyZSgnbW92ZXN0YXJ0Jylcblx0XHQgICAgLmZpcmUoJ3pvb21zdGFydCcpO1xuXG5cdFx0dGhpcy5fYW5pbWF0ZVpvb20oY2VudGVyLCB6b29tLCBvcmlnaW4sIHNjYWxlLCBudWxsLCB0cnVlKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdF9hbmltYXRlWm9vbTogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgb3JpZ2luLCBzY2FsZSwgZGVsdGEsIGJhY2t3YXJkcywgZm9yVG91Y2hab29tKSB7XG5cblx0XHRpZiAoIWZvclRvdWNoWm9vbSkge1xuXHRcdFx0dGhpcy5fYW5pbWF0aW5nWm9vbSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gcHV0IHRyYW5zZm9ybSB0cmFuc2l0aW9uIG9uIGFsbCBsYXllcnMgd2l0aCBsZWFmbGV0LXpvb20tYW5pbWF0ZWQgY2xhc3Ncblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fbWFwUGFuZSwgJ2xlYWZsZXQtem9vbS1hbmltJyk7XG5cblx0XHQvLyByZW1lbWJlciB3aGF0IGNlbnRlci96b29tIHRvIHNldCBhZnRlciBhbmltYXRpb25cblx0XHR0aGlzLl9hbmltYXRlVG9DZW50ZXIgPSBjZW50ZXI7XG5cdFx0dGhpcy5fYW5pbWF0ZVRvWm9vbSA9IHpvb207XG5cblx0XHQvLyBkaXNhYmxlIGFueSBkcmFnZ2luZyBkdXJpbmcgYW5pbWF0aW9uXG5cdFx0aWYgKEwuRHJhZ2dhYmxlKSB7XG5cdFx0XHRMLkRyYWdnYWJsZS5fZGlzYWJsZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuZmlyZSgnem9vbWFuaW0nLCB7XG5cdFx0XHRcdGNlbnRlcjogY2VudGVyLFxuXHRcdFx0XHR6b29tOiB6b29tLFxuXHRcdFx0XHRvcmlnaW46IG9yaWdpbixcblx0XHRcdFx0c2NhbGU6IHNjYWxlLFxuXHRcdFx0XHRkZWx0YTogZGVsdGEsXG5cdFx0XHRcdGJhY2t3YXJkczogYmFja3dhcmRzXG5cdFx0XHR9KTtcblx0XHR9LCB0aGlzKTtcblx0fSxcblxuXHRfb25ab29tVHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0dGhpcy5fYW5pbWF0aW5nWm9vbSA9IGZhbHNlO1xuXG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX21hcFBhbmUsICdsZWFmbGV0LXpvb20tYW5pbScpO1xuXG5cdFx0dGhpcy5fcmVzZXRWaWV3KHRoaXMuX2FuaW1hdGVUb0NlbnRlciwgdGhpcy5fYW5pbWF0ZVRvWm9vbSwgdHJ1ZSwgdHJ1ZSk7XG5cblx0XHRpZiAoTC5EcmFnZ2FibGUpIHtcblx0XHRcdEwuRHJhZ2dhYmxlLl9kaXNhYmxlZCA9IGZhbHNlO1xuXHRcdH1cblx0fVxufSk7XG5cblxuLypcblx0Wm9vbSBhbmltYXRpb24gbG9naWMgZm9yIEwuVGlsZUxheWVyLlxuKi9cblxuTC5UaWxlTGF5ZXIuaW5jbHVkZSh7XG5cdF9hbmltYXRlWm9vbTogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoIXRoaXMuX2FuaW1hdGluZykge1xuXHRcdFx0dGhpcy5fYW5pbWF0aW5nID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3ByZXBhcmVCZ0J1ZmZlcigpO1xuXHRcdH1cblxuXHRcdHZhciBiZyA9IHRoaXMuX2JnQnVmZmVyLFxuXHRcdCAgICB0cmFuc2Zvcm0gPSBMLkRvbVV0aWwuVFJBTlNGT1JNLFxuXHRcdCAgICBpbml0aWFsVHJhbnNmb3JtID0gZS5kZWx0YSA/IEwuRG9tVXRpbC5nZXRUcmFuc2xhdGVTdHJpbmcoZS5kZWx0YSkgOiBiZy5zdHlsZVt0cmFuc2Zvcm1dLFxuXHRcdCAgICBzY2FsZVN0ciA9IEwuRG9tVXRpbC5nZXRTY2FsZVN0cmluZyhlLnNjYWxlLCBlLm9yaWdpbik7XG5cblx0XHRiZy5zdHlsZVt0cmFuc2Zvcm1dID0gZS5iYWNrd2FyZHMgP1xuXHRcdFx0XHRzY2FsZVN0ciArICcgJyArIGluaXRpYWxUcmFuc2Zvcm0gOlxuXHRcdFx0XHRpbml0aWFsVHJhbnNmb3JtICsgJyAnICsgc2NhbGVTdHI7XG5cdH0sXG5cblx0X2VuZFpvb21BbmltOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGZyb250ID0gdGhpcy5fdGlsZUNvbnRhaW5lcixcblx0XHQgICAgYmcgPSB0aGlzLl9iZ0J1ZmZlcjtcblxuXHRcdGZyb250LnN0eWxlLnZpc2liaWxpdHkgPSAnJztcblx0XHRmcm9udC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGZyb250KTsgLy8gQnJpbmcgdG8gZm9yZVxuXG5cdFx0Ly8gZm9yY2UgcmVmbG93XG5cdFx0TC5VdGlsLmZhbHNlRm4oYmcub2Zmc2V0V2lkdGgpO1xuXG5cdFx0dGhpcy5fYW5pbWF0aW5nID0gZmFsc2U7XG5cdH0sXG5cblx0X2NsZWFyQmdCdWZmZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0aWYgKG1hcCAmJiAhbWFwLl9hbmltYXRpbmdab29tICYmICFtYXAudG91Y2hab29tLl96b29taW5nKSB7XG5cdFx0XHR0aGlzLl9iZ0J1ZmZlci5pbm5lckhUTUwgPSAnJztcblx0XHRcdHRoaXMuX2JnQnVmZmVyLnN0eWxlW0wuRG9tVXRpbC5UUkFOU0ZPUk1dID0gJyc7XG5cdFx0fVxuXHR9LFxuXG5cdF9wcmVwYXJlQmdCdWZmZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBmcm9udCA9IHRoaXMuX3RpbGVDb250YWluZXIsXG5cdFx0ICAgIGJnID0gdGhpcy5fYmdCdWZmZXI7XG5cblx0XHQvLyBpZiBmb3JlZ3JvdW5kIGxheWVyIGRvZXNuJ3QgaGF2ZSBtYW55IHRpbGVzIGJ1dCBiZyBsYXllciBkb2VzLFxuXHRcdC8vIGtlZXAgdGhlIGV4aXN0aW5nIGJnIGxheWVyIGFuZCBqdXN0IHpvb20gaXQgc29tZSBtb3JlXG5cblx0XHR2YXIgYmdMb2FkZWQgPSB0aGlzLl9nZXRMb2FkZWRUaWxlc1BlcmNlbnRhZ2UoYmcpLFxuXHRcdCAgICBmcm9udExvYWRlZCA9IHRoaXMuX2dldExvYWRlZFRpbGVzUGVyY2VudGFnZShmcm9udCk7XG5cblx0XHRpZiAoYmcgJiYgYmdMb2FkZWQgPiAwLjUgJiYgZnJvbnRMb2FkZWQgPCAwLjUpIHtcblxuXHRcdFx0ZnJvbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXHRcdFx0dGhpcy5fc3RvcExvYWRpbmdJbWFnZXMoZnJvbnQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIHByZXBhcmUgdGhlIGJ1ZmZlciB0byBiZWNvbWUgdGhlIGZyb250IHRpbGUgcGFuZVxuXHRcdGJnLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRiZy5zdHlsZVtMLkRvbVV0aWwuVFJBTlNGT1JNXSA9ICcnO1xuXG5cdFx0Ly8gc3dpdGNoIG91dCB0aGUgY3VycmVudCBsYXllciB0byBiZSB0aGUgbmV3IGJnIGxheWVyIChhbmQgdmljZS12ZXJzYSlcblx0XHR0aGlzLl90aWxlQ29udGFpbmVyID0gYmc7XG5cdFx0YmcgPSB0aGlzLl9iZ0J1ZmZlciA9IGZyb250O1xuXG5cdFx0dGhpcy5fc3RvcExvYWRpbmdJbWFnZXMoYmcpO1xuXG5cdFx0Ly9wcmV2ZW50IGJnIGJ1ZmZlciBmcm9tIGNsZWFyaW5nIHJpZ2h0IGFmdGVyIHpvb21cblx0XHRjbGVhclRpbWVvdXQodGhpcy5fY2xlYXJCZ0J1ZmZlclRpbWVyKTtcblx0fSxcblxuXHRfZ2V0TG9hZGVkVGlsZXNQZXJjZW50YWdlOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG5cdFx0dmFyIHRpbGVzID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSxcblx0XHQgICAgaSwgbGVuLCBjb3VudCA9IDA7XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aWxlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0aWYgKHRpbGVzW2ldLmNvbXBsZXRlKSB7XG5cdFx0XHRcdGNvdW50Kys7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjb3VudCAvIGxlbjtcblx0fSxcblxuXHQvLyBzdG9wcyBsb2FkaW5nIGFsbCB0aWxlcyBpbiB0aGUgYmFja2dyb3VuZCBsYXllclxuXHRfc3RvcExvYWRpbmdJbWFnZXM6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcblx0XHR2YXIgdGlsZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjb250YWluZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpKSxcblx0XHQgICAgaSwgbGVuLCB0aWxlO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGlsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHRpbGUgPSB0aWxlc1tpXTtcblxuXHRcdFx0aWYgKCF0aWxlLmNvbXBsZXRlKSB7XG5cdFx0XHRcdHRpbGUub25sb2FkID0gTC5VdGlsLmZhbHNlRm47XG5cdFx0XHRcdHRpbGUub25lcnJvciA9IEwuVXRpbC5mYWxzZUZuO1xuXHRcdFx0XHR0aWxlLnNyYyA9IEwuVXRpbC5lbXB0eUltYWdlVXJsO1xuXG5cdFx0XHRcdHRpbGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aWxlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuXG5cbi8qXHJcbiAqIFByb3ZpZGVzIEwuTWFwIHdpdGggY29udmVuaWVudCBzaG9ydGN1dHMgZm9yIHVzaW5nIGJyb3dzZXIgZ2VvbG9jYXRpb24gZmVhdHVyZXMuXHJcbiAqL1xyXG5cclxuTC5NYXAuaW5jbHVkZSh7XHJcblx0X2RlZmF1bHRMb2NhdGVPcHRpb25zOiB7XHJcblx0XHR3YXRjaDogZmFsc2UsXHJcblx0XHRzZXRWaWV3OiBmYWxzZSxcclxuXHRcdG1heFpvb206IEluZmluaXR5LFxyXG5cdFx0dGltZW91dDogMTAwMDAsXHJcblx0XHRtYXhpbXVtQWdlOiAwLFxyXG5cdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiBmYWxzZVxyXG5cdH0sXHJcblxyXG5cdGxvY2F0ZTogZnVuY3Rpb24gKC8qT2JqZWN0Ki8gb3B0aW9ucykge1xyXG5cclxuXHRcdG9wdGlvbnMgPSB0aGlzLl9sb2NhdGVPcHRpb25zID0gTC5leHRlbmQodGhpcy5fZGVmYXVsdExvY2F0ZU9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdGlmICghbmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcblx0XHRcdHRoaXMuX2hhbmRsZUdlb2xvY2F0aW9uRXJyb3Ioe1xyXG5cdFx0XHRcdGNvZGU6IDAsXHJcblx0XHRcdFx0bWVzc2FnZTogJ0dlb2xvY2F0aW9uIG5vdCBzdXBwb3J0ZWQuJ1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG9uUmVzcG9uc2UgPSBMLmJpbmQodGhpcy5faGFuZGxlR2VvbG9jYXRpb25SZXNwb25zZSwgdGhpcyksXHJcblx0XHRcdG9uRXJyb3IgPSBMLmJpbmQodGhpcy5faGFuZGxlR2VvbG9jYXRpb25FcnJvciwgdGhpcyk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMud2F0Y2gpIHtcclxuXHRcdFx0dGhpcy5fbG9jYXRpb25XYXRjaElkID1cclxuXHRcdFx0ICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24ud2F0Y2hQb3NpdGlvbihvblJlc3BvbnNlLCBvbkVycm9yLCBvcHRpb25zKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24ob25SZXNwb25zZSwgb25FcnJvciwgb3B0aW9ucyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzdG9wTG9jYXRlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAobmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcblx0XHRcdG5hdmlnYXRvci5nZW9sb2NhdGlvbi5jbGVhcldhdGNoKHRoaXMuX2xvY2F0aW9uV2F0Y2hJZCk7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5fbG9jYXRlT3B0aW9ucykge1xyXG5cdFx0XHR0aGlzLl9sb2NhdGVPcHRpb25zLnNldFZpZXcgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9oYW5kbGVHZW9sb2NhdGlvbkVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHRcdHZhciBjID0gZXJyb3IuY29kZSxcclxuXHRcdCAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZSB8fFxyXG5cdFx0ICAgICAgICAgICAgKGMgPT09IDEgPyAncGVybWlzc2lvbiBkZW5pZWQnIDpcclxuXHRcdCAgICAgICAgICAgIChjID09PSAyID8gJ3Bvc2l0aW9uIHVuYXZhaWxhYmxlJyA6ICd0aW1lb3V0JykpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9sb2NhdGVPcHRpb25zLnNldFZpZXcgJiYgIXRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLmZpdFdvcmxkKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdsb2NhdGlvbmVycm9yJywge1xyXG5cdFx0XHRjb2RlOiBjLFxyXG5cdFx0XHRtZXNzYWdlOiAnR2VvbG9jYXRpb24gZXJyb3I6ICcgKyBtZXNzYWdlICsgJy4nXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHRfaGFuZGxlR2VvbG9jYXRpb25SZXNwb25zZTogZnVuY3Rpb24gKHBvcykge1xyXG5cdFx0dmFyIGxhdCA9IHBvcy5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHQgICAgbG5nID0gcG9zLmNvb3Jkcy5sb25naXR1ZGUsXHJcblx0XHQgICAgbGF0bG5nID0gbmV3IEwuTGF0TG5nKGxhdCwgbG5nKSxcclxuXHJcblx0XHQgICAgbGF0QWNjdXJhY3kgPSAxODAgKiBwb3MuY29vcmRzLmFjY3VyYWN5IC8gNDAwNzUwMTcsXHJcblx0XHQgICAgbG5nQWNjdXJhY3kgPSBsYXRBY2N1cmFjeSAvIE1hdGguY29zKEwuTGF0TG5nLkRFR19UT19SQUQgKiBsYXQpLFxyXG5cclxuXHRcdCAgICBib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhcclxuXHRcdCAgICAgICAgICAgIFtsYXQgLSBsYXRBY2N1cmFjeSwgbG5nIC0gbG5nQWNjdXJhY3ldLFxyXG5cdFx0ICAgICAgICAgICAgW2xhdCArIGxhdEFjY3VyYWN5LCBsbmcgKyBsbmdBY2N1cmFjeV0pLFxyXG5cclxuXHRcdCAgICBvcHRpb25zID0gdGhpcy5fbG9jYXRlT3B0aW9ucztcclxuXHJcblx0XHRpZiAob3B0aW9ucy5zZXRWaWV3KSB7XHJcblx0XHRcdHZhciB6b29tID0gTWF0aC5taW4odGhpcy5nZXRCb3VuZHNab29tKGJvdW5kcyksIG9wdGlvbnMubWF4Wm9vbSk7XHJcblx0XHRcdHRoaXMuc2V0VmlldyhsYXRsbmcsIHpvb20pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRsYXRsbmc6IGxhdGxuZyxcclxuXHRcdFx0Ym91bmRzOiBib3VuZHMsXHJcblx0XHRcdHRpbWVzdGFtcDogcG9zLnRpbWVzdGFtcFxyXG5cdFx0fTtcclxuXHJcblx0XHRmb3IgKHZhciBpIGluIHBvcy5jb29yZHMpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBwb3MuY29vcmRzW2ldID09PSAnbnVtYmVyJykge1xyXG5cdFx0XHRcdGRhdGFbaV0gPSBwb3MuY29vcmRzW2ldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdsb2NhdGlvbmZvdW5kJywgZGF0YSk7XHJcblx0fVxyXG59KTtcclxuXG5cbn0od2luZG93LCBkb2N1bWVudCkpOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZScpO1xyXG52YXIgUmVzcG9uc2UgPSByZXF1aXJlKCdodHRwLXJlc3BvbnNlLW9iamVjdCcpO1xyXG52YXIgaGFuZGxlUXMgPSByZXF1aXJlKCcuL2xpYi9oYW5kbGUtcXMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9SZXF1ZXN0O1xyXG5mdW5jdGlvbiBkb1JlcXVlc3QobWV0aG9kLCB1cmwsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgdmFyIHJlc3VsdCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG4gICAgLy8gY2hlY2sgdHlwZXMgb2YgYXJndW1lbnRzXHJcblxyXG4gICAgaWYgKHR5cGVvZiBtZXRob2QgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBtZXRob2QgbXVzdCBiZSBhIHN0cmluZy4nKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgVVJML3BhdGggbXVzdCBiZSBhIHN0cmluZy4nKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XHJcbiAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBvcHRpb25zID0ge307XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ09wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QgKG9yIG51bGwpLicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBjYWxsYmFjayA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBtZXRob2QgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcclxuICAgIG9wdGlvbnMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fTtcclxuXHJcbiAgICAvLyBoYW5kbGUgY3Jvc3MgZG9tYWluXHJcblxyXG4gICAgdmFyIG1hdGNoO1xyXG4gICAgdmFyIGNyb3NzRG9tYWluID0gISEoKG1hdGNoID0gL14oW1xcdy1dKzopP1xcL1xcLyhbXlxcL10rKS8uZXhlYyhvcHRpb25zLnVyaSkpICYmIChtYXRjaFsyXSAhPSB3aW5kb3cubG9jYXRpb24uaG9zdCkpO1xyXG4gICAgaWYgKCFjcm9zc0RvbWFpbikgb3B0aW9ucy5oZWFkZXJzWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xyXG5cclxuICAgIC8vIGhhbmRsZSBxdWVyeSBzdHJpbmdcclxuICAgIGlmIChvcHRpb25zLnFzKSB7XHJcbiAgICAgIHVybCA9IGhhbmRsZVFzKHVybCwgb3B0aW9ucy5xcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaGFuZGxlIGpzb24gYm9keVxyXG4gICAgaWYgKG9wdGlvbnMuanNvbikge1xyXG4gICAgICBvcHRpb25zLmJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmpzb24pO1xyXG4gICAgICBvcHRpb25zLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICB2YXIgaGVhZGVycyA9IHt9O1xyXG4gICAgICAgIHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS5zcGxpdCgnXFxyXFxuJykuZm9yRWFjaChmdW5jdGlvbiAoaGVhZGVyKSB7XHJcbiAgICAgICAgICB2YXIgaCA9IGhlYWRlci5zcGxpdCgnOicpO1xyXG4gICAgICAgICAgaWYgKGgubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBoZWFkZXJzW2hbMF0udG9Mb3dlckNhc2UoKV0gPSBoLnNsaWNlKDEpLmpvaW4oJzonKS50cmltKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoeGhyLnN0YXR1cywgaGVhZGVycywgeGhyLnJlc3BvbnNlVGV4dCkpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIG1ldGhvZCwgdXJsLCBhc3luY1xyXG4gICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xyXG5cclxuICAgIGZvciAodmFyIG5hbWUgaW4gb3B0aW9ucy5oZWFkZXJzKSB7XHJcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUudG9Mb3dlckNhc2UoKSwgb3B0aW9ucy5oZWFkZXJzW25hbWVdKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdm9pZCBzZW5kaW5nIGVtcHR5IHN0cmluZyAoIzMxOSlcclxuICAgIHhoci5zZW5kKG9wdGlvbnMuYm9keSA/IG9wdGlvbnMuYm9keSA6IG51bGwpO1xyXG4gIH0pO1xyXG4gIHJlc3VsdC5nZXRCb2R5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHJlc3VsdC50aGVuKGZ1bmN0aW9uIChyZXMpIHsgcmV0dXJuIHJlcy5nZXRCb2R5KCk7IH0pO1xyXG4gIH07XHJcbiAgcmV0dXJuIHJlc3VsdC5ub2RlaWZ5KGNhbGxiYWNrKTtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgcGFyc2UgPSByZXF1aXJlKCdxcycpLnBhcnNlO1xyXG52YXIgc3RyaW5naWZ5ID0gcmVxdWlyZSgncXMnKS5zdHJpbmdpZnk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGhhbmRsZVFzO1xyXG5mdW5jdGlvbiBoYW5kbGVRcyh1cmwsIHF1ZXJ5KSB7XHJcbiAgdXJsID0gdXJsLnNwbGl0KCc/Jyk7XHJcbiAgdmFyIHN0YXJ0ID0gdXJsWzBdO1xyXG4gIHZhciBxcyA9ICh1cmxbMV0gfHwgJycpLnNwbGl0KCcjJylbMF07XHJcbiAgdmFyIGVuZCA9IHVybFsxXSAmJiB1cmxbMV0uc3BsaXQoJyMnKS5sZW5ndGggPiAxID8gJyMnICsgdXJsWzFdLnNwbGl0KCcjJylbMV0gOiAnJztcclxuXHJcbiAgdmFyIGJhc2VRcyA9IHBhcnNlKHFzKTtcclxuICBmb3IgKHZhciBpIGluIHF1ZXJ5KSB7XHJcbiAgICBiYXNlUXNbaV0gPSBxdWVyeVtpXTtcclxuICB9XHJcbiAgcXMgPSBzdHJpbmdpZnkoYmFzZVFzKTtcclxuICBpZiAocXMgIT09ICcnKSB7XHJcbiAgICBxcyA9ICc/JyArIHFzO1xyXG4gIH1cclxuICByZXR1cm4gc3RhcnQgKyBxcyArIGVuZDtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3BvbnNlO1xyXG5cclxuLyoqXHJcbiAqIEEgcmVzcG9uc2UgZnJvbSBhIHdlYiByZXF1ZXN0XHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNDb2RlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJzXHJcbiAqIEBwYXJhbSB7QnVmZmVyfSBib2R5XHJcbiAqL1xyXG5mdW5jdGlvbiBSZXNwb25zZShzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5KSB7XHJcbiAgaWYgKHR5cGVvZiBzdGF0dXNDb2RlICE9PSAnbnVtYmVyJykge1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RhdHVzQ29kZSBtdXN0IGJlIGEgbnVtYmVyIGJ1dCB3YXMgJyArICh0eXBlb2Ygc3RhdHVzQ29kZSkpO1xyXG4gIH1cclxuICBpZiAoaGVhZGVycyA9PT0gbnVsbCkge1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaGVhZGVycyBjYW5ub3QgYmUgbnVsbCcpO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIGhlYWRlcnMgIT09ICdvYmplY3QnKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdoZWFkZXJzIG11c3QgYmUgYW4gb2JqZWN0IGJ1dCB3YXMgJyArICh0eXBlb2YgaGVhZGVycykpO1xyXG4gIH1cclxuICB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xyXG4gIHRoaXMuaGVhZGVycyA9IHt9O1xyXG4gIGZvciAodmFyIGtleSBpbiBoZWFkZXJzKSB7XHJcbiAgICB0aGlzLmhlYWRlcnNba2V5LnRvTG93ZXJDYXNlKCldID0gaGVhZGVyc1trZXldO1xyXG4gIH1cclxuICB0aGlzLmJvZHkgPSBib2R5O1xyXG59XHJcblxyXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0Qm9keSA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xyXG4gIGlmICh0aGlzLnN0YXR1c0NvZGUgPj0gMzAwKSB7XHJcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdTZXJ2ZXIgcmVzcG9uZGVkIHdpdGggc3RhdHVzIGNvZGUgJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgdGhpcy5zdGF0dXNDb2RlICsgJzpcXG4nICsgdGhpcy5ib2R5LnRvU3RyaW5nKCkpO1xyXG4gICAgZXJyLnN0YXR1c0NvZGUgPSB0aGlzLnN0YXR1c0NvZGU7XHJcbiAgICBlcnIuaGVhZGVycyA9IHRoaXMuaGVhZGVycztcclxuICAgIGVyci5ib2R5ID0gdGhpcy5ib2R5O1xyXG4gICAgdGhyb3cgZXJyO1xyXG4gIH1cclxuICByZXR1cm4gZW5jb2RpbmcgPyB0aGlzLmJvZHkudG9TdHJpbmcoZW5jb2RpbmcpIDogdGhpcy5ib2R5O1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhc2FwID0gcmVxdWlyZSgnYXNhcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZVxuZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICBpZiAodHlwZW9mIHRoaXMgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKVxuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBmdW5jdGlvbicpXG4gIHZhciBzdGF0ZSA9IG51bGxcbiAgdmFyIHZhbHVlID0gbnVsbFxuICB2YXIgZGVmZXJyZWRzID0gW11cbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdGhpcy50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBoYW5kbGUobmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCkpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZShkZWZlcnJlZCkge1xuICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgYXNhcChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYiA9IHN0YXRlID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkXG4gICAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgICAgKHN0YXRlID8gZGVmZXJyZWQucmVzb2x2ZSA6IGRlZmVycmVkLnJlamVjdCkodmFsdWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmFyIHJldFxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2IodmFsdWUpXG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJldClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZShuZXdWYWx1ZSkge1xuICAgIHRyeSB7IC8vUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZikgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKVxuICAgICAgaWYgKG5ld1ZhbHVlICYmICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBuZXdWYWx1ZS50aGVuXG4gICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGRvUmVzb2x2ZSh0aGVuLmJpbmQobmV3VmFsdWUpLCByZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YXRlID0gdHJ1ZVxuICAgICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgICAgZmluYWxlKClcbiAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKSB9XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3QobmV3VmFsdWUpIHtcbiAgICBzdGF0ZSA9IGZhbHNlXG4gICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgIGZpbmFsZSgpXG4gIH1cblxuICBmdW5jdGlvbiBmaW5hbGUoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKylcbiAgICAgIGhhbmRsZShkZWZlcnJlZHNbaV0pXG4gICAgZGVmZXJyZWRzID0gbnVsbFxuICB9XG5cbiAgZG9SZXNvbHZlKGZuLCByZXNvbHZlLCByZWplY3QpXG59XG5cblxuZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcmVzb2x2ZSwgcmVqZWN0KXtcbiAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbFxuICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsXG4gIHRoaXMucmVzb2x2ZSA9IHJlc29sdmVcbiAgdGhpcy5yZWplY3QgPSByZWplY3Rcbn1cblxuLyoqXG4gKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuICovXG5mdW5jdGlvbiBkb1Jlc29sdmUoZm4sIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuXG4gICAgICBkb25lID0gdHJ1ZVxuICAgICAgb25GdWxmaWxsZWQodmFsdWUpXG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKGRvbmUpIHJldHVyblxuICAgICAgZG9uZSA9IHRydWVcbiAgICAgIG9uUmVqZWN0ZWQocmVhc29uKVxuICAgIH0pXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgaWYgKGRvbmUpIHJldHVyblxuICAgIGRvbmUgPSB0cnVlXG4gICAgb25SZWplY3RlZChleClcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1RoaXMgZmlsZSBjb250YWlucyB0aGVuL3Byb21pc2Ugc3BlY2lmaWMgZXh0ZW5zaW9ucyB0byB0aGUgY29yZSBwcm9taXNlIEFQSVxuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4vY29yZS5qcycpXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2VcblxuLyogU3RhdGljIEZ1bmN0aW9ucyAqL1xuXG5mdW5jdGlvbiBWYWx1ZVByb21pc2UodmFsdWUpIHtcbiAgdGhpcy50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkKSB7XG4gICAgaWYgKHR5cGVvZiBvbkZ1bGZpbGxlZCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRoaXNcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzb2x2ZShvbkZ1bGZpbGxlZCh2YWx1ZSkpXG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgcmVqZWN0KGV4KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5WYWx1ZVByb21pc2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQcm9taXNlLnByb3RvdHlwZSlcblxudmFyIFRSVUUgPSBuZXcgVmFsdWVQcm9taXNlKHRydWUpXG52YXIgRkFMU0UgPSBuZXcgVmFsdWVQcm9taXNlKGZhbHNlKVxudmFyIE5VTEwgPSBuZXcgVmFsdWVQcm9taXNlKG51bGwpXG52YXIgVU5ERUZJTkVEID0gbmV3IFZhbHVlUHJvbWlzZSh1bmRlZmluZWQpXG52YXIgWkVSTyA9IG5ldyBWYWx1ZVByb21pc2UoMClcbnZhciBFTVBUWVNUUklORyA9IG5ldyBWYWx1ZVByb21pc2UoJycpXG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSByZXR1cm4gdmFsdWVcblxuICBpZiAodmFsdWUgPT09IG51bGwpIHJldHVybiBOVUxMXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gVU5ERUZJTkVEXG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSkgcmV0dXJuIFRSVUVcbiAgaWYgKHZhbHVlID09PSBmYWxzZSkgcmV0dXJuIEZBTFNFXG4gIGlmICh2YWx1ZSA9PT0gMCkgcmV0dXJuIFpFUk9cbiAgaWYgKHZhbHVlID09PSAnJykgcmV0dXJuIEVNUFRZU1RSSU5HXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0aGVuID0gdmFsdWUudGhlblxuICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSh0aGVuLmJpbmQodmFsdWUpKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZWplY3QoZXgpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVmFsdWVQcm9taXNlKHZhbHVlKVxufVxuXG5Qcm9taXNlLmZyb20gPSBQcm9taXNlLmNhc3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignUHJvbWlzZS5mcm9tIGFuZCBQcm9taXNlLmNhc3QgYXJlIGRlcHJlY2F0ZWQsIHVzZSBQcm9taXNlLnJlc29sdmUgaW5zdGVhZCcpXG4gIGVyci5uYW1lID0gJ1dhcm5pbmcnXG4gIGNvbnNvbGUud2FybihlcnIuc3RhY2spXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpXG59XG5cblByb21pc2UuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGZuLCBhcmd1bWVudENvdW50KSB7XG4gIGFyZ3VtZW50Q291bnQgPSBhcmd1bWVudENvdW50IHx8IEluZmluaXR5XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHdoaWxlIChhcmdzLmxlbmd0aCAmJiBhcmdzLmxlbmd0aCA+IGFyZ3VtZW50Q291bnQpIHtcbiAgICAgICAgYXJncy5wb3AoKVxuICAgICAgfVxuICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICBlbHNlIHJlc29sdmUocmVzKVxuICAgICAgfSlcbiAgICAgIGZuLmFwcGx5KHNlbGYsIGFyZ3MpXG4gICAgfSlcbiAgfVxufVxuUHJvbWlzZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgdmFyIGNhbGxiYWNrID0gdHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJyA/IGFyZ3MucG9wKCkgOiBudWxsXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpLm5vZGVpZnkoY2FsbGJhY2spXG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIGlmIChjYWxsYmFjayA9PT0gbnVsbCB8fCB0eXBlb2YgY2FsbGJhY2sgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgcmVqZWN0KGV4KSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2FsbGVkV2l0aEFycmF5ID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGFyZ3VtZW50c1swXSlcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjYWxsZWRXaXRoQXJyYXkgPyBhcmd1bWVudHNbMF0gOiBhcmd1bWVudHMpXG5cbiAgaWYgKCFjYWxsZWRXaXRoQXJyYXkpIHtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdQcm9taXNlLmFsbCBzaG91bGQgYmUgY2FsbGVkIHdpdGggYSBzaW5nbGUgYXJyYXksIGNhbGxpbmcgaXQgd2l0aCBtdWx0aXBsZSBhcmd1bWVudHMgaXMgZGVwcmVjYXRlZCcpXG4gICAgZXJyLm5hbWUgPSAnV2FybmluZydcbiAgICBjb25zb2xlLndhcm4oZXJyLnN0YWNrKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKVxuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aFxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlblxuICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkgeyByZXMoaSwgdmFsKSB9LCByZWplY3QpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXJnc1tpXSA9IHZhbFxuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpXG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pXG4gICAgfVxuICB9KVxufVxuXG5Qcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBcbiAgICByZWplY3QodmFsdWUpO1xuICB9KTtcbn1cblxuUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBcbiAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KVxuICB9KTtcbn1cblxuLyogUHJvdG90eXBlIE1ldGhvZHMgKi9cblxuUHJvbWlzZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICB2YXIgc2VsZiA9IGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnRoZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHRoaXNcbiAgc2VsZi50aGVuKG51bGwsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH0pXG4gIH0pXG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nKSByZXR1cm4gdGhpc1xuXG4gIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKVxuICAgIH0pXG4gIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKGVycilcbiAgICB9KVxuICB9KVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG5cbi8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxudmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbnZhciB0YWlsID0gaGVhZDtcbnZhciBmbHVzaGluZyA9IGZhbHNlO1xudmFyIHJlcXVlc3RGbHVzaCA9IHZvaWQgMDtcbnZhciBpc05vZGVKUyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cblxuICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgICAgdmFyIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgIGhlYWQudGFzayA9IHZvaWQgMDtcbiAgICAgICAgdmFyIGRvbWFpbiA9IGhlYWQuZG9tYWluO1xuXG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGFzaygpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgIC8vIEluIG5vZGUsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIGNvbnNpZGVyZWQgZmF0YWwgZXJyb3JzLlxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgIC8vIGxpc3RlbmluZyBcInVuY2F1Z2h0RXhjZXB0aW9uXCIgZXZlbnRzIChhcyBkb21haW5zIGRvZXMpLlxuICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRocm93IGU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIGFzeW5jaHJvbm91c2x5IHRvIGF2b2lkIHNsb3ctZG93bnMuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZsdXNoaW5nID0gZmFsc2U7XG59XG5cbmlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgLy8gTm9kZS5qcyBiZWZvcmUgMC45LiBOb3RlIHRoYXQgc29tZSBmYWtlLU5vZGUgZW52aXJvbm1lbnRzLCBsaWtlIHRoZVxuICAgIC8vIE1vY2hhIHRlc3QgcnVubmVyLCBpbnRyb2R1Y2UgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgLlxuICAgIGlzTm9kZUpTID0gdHJ1ZTtcblxuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgfTtcblxufSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJlcXVlc3RGbHVzaCA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgIH07XG4gICAgfVxuXG59IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9O1xuXG59IGVsc2Uge1xuICAgIC8vIG9sZCBicm93c2Vyc1xuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYXNhcCh0YXNrKSB7XG4gICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcbiAgICAgICAgbmV4dDogbnVsbFxuICAgIH07XG5cbiAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgcmVxdWVzdEZsdXNoKCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhc2FwO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKSIsIi8qKlxuICogT2JqZWN0I3RvU3RyaW5nKCkgcmVmIGZvciBzdHJpbmdpZnkoKS5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIE9iamVjdCNoYXNPd25Qcm9wZXJ0eSByZWZcbiAqL1xuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFycmF5I2luZGV4T2Ygc2hpbS5cbiAqL1xuXG52YXIgaW5kZXhPZiA9IHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJ1xuICA/IGZ1bmN0aW9uKGFyciwgZWwpIHsgcmV0dXJuIGFyci5pbmRleE9mKGVsKTsgfVxuICA6IGZ1bmN0aW9uKGFyciwgZWwpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJbaV0gPT09IGVsKSByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4vKipcbiAqIEFycmF5LmlzQXJyYXkgc2hpbS5cbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24oYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbi8qKlxuICogT2JqZWN0LmtleXMgc2hpbS5cbiAqL1xuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgcmV0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIEFycmF5I2ZvckVhY2ggc2hpbS5cbiAqL1xuXG52YXIgZm9yRWFjaCA9IHR5cGVvZiBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJ1xuICA/IGZ1bmN0aW9uKGFyciwgZm4pIHsgcmV0dXJuIGFyci5mb3JFYWNoKGZuKTsgfVxuICA6IGZ1bmN0aW9uKGFyciwgZm4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBmbihhcnJbaV0pO1xuICAgIH07XG5cbi8qKlxuICogQXJyYXkjcmVkdWNlIHNoaW0uXG4gKi9cblxudmFyIHJlZHVjZSA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpIHtcbiAgaWYgKHR5cGVvZiBhcnIucmVkdWNlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gYXJyLnJlZHVjZShmbiwgaW5pdGlhbCk7XG4gIHZhciByZXMgPSBpbml0aWFsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgcmVzID0gZm4ocmVzLCBhcnJbaV0pO1xuICByZXR1cm4gcmVzO1xufTtcblxuLyoqXG4gKiBDYWNoZSBub24taW50ZWdlciB0ZXN0IHJlZ2V4cC5cbiAqL1xuXG52YXIgaXNpbnQgPSAvXlswLTldKyQvO1xuXG5mdW5jdGlvbiBwcm9tb3RlKHBhcmVudCwga2V5KSB7XG4gIGlmIChwYXJlbnRba2V5XS5sZW5ndGggPT0gMCkgcmV0dXJuIHBhcmVudFtrZXldID0ge31cbiAgdmFyIHQgPSB7fTtcbiAgZm9yICh2YXIgaSBpbiBwYXJlbnRba2V5XSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmVudFtrZXldLCBpKSkge1xuICAgICAgdFtpXSA9IHBhcmVudFtrZXldW2ldO1xuICAgIH1cbiAgfVxuICBwYXJlbnRba2V5XSA9IHQ7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBwYXJzZShwYXJ0cywgcGFyZW50LCBrZXksIHZhbCkge1xuICB2YXIgcGFydCA9IHBhcnRzLnNoaWZ0KCk7XG4gIFxuICAvLyBpbGxlZ2FsXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE9iamVjdC5wcm90b3R5cGUsIGtleSkpIHJldHVybjtcbiAgXG4gIC8vIGVuZFxuICBpZiAoIXBhcnQpIHtcbiAgICBpZiAoaXNBcnJheShwYXJlbnRba2V5XSkpIHtcbiAgICAgIHBhcmVudFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2UgaWYgKCdvYmplY3QnID09IHR5cGVvZiBwYXJlbnRba2V5XSkge1xuICAgICAgcGFyZW50W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2YgcGFyZW50W2tleV0pIHtcbiAgICAgIHBhcmVudFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRba2V5XSA9IFtwYXJlbnRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgLy8gYXJyYXlcbiAgfSBlbHNlIHtcbiAgICB2YXIgb2JqID0gcGFyZW50W2tleV0gPSBwYXJlbnRba2V5XSB8fCBbXTtcbiAgICBpZiAoJ10nID09IHBhcnQpIHtcbiAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgaWYgKCcnICE9IHZhbCkgb2JqLnB1c2godmFsKTtcbiAgICAgIH0gZWxzZSBpZiAoJ29iamVjdCcgPT0gdHlwZW9mIG9iaikge1xuICAgICAgICBvYmpbb2JqZWN0S2V5cyhvYmopLmxlbmd0aF0gPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmogPSBwYXJlbnRba2V5XSA9IFtwYXJlbnRba2V5XSwgdmFsXTtcbiAgICAgIH1cbiAgICAgIC8vIHByb3BcbiAgICB9IGVsc2UgaWYgKH5pbmRleE9mKHBhcnQsICddJykpIHtcbiAgICAgIHBhcnQgPSBwYXJ0LnN1YnN0cigwLCBwYXJ0Lmxlbmd0aCAtIDEpO1xuICAgICAgaWYgKCFpc2ludC50ZXN0KHBhcnQpICYmIGlzQXJyYXkob2JqKSkgb2JqID0gcHJvbW90ZShwYXJlbnQsIGtleSk7XG4gICAgICBwYXJzZShwYXJ0cywgb2JqLCBwYXJ0LCB2YWwpO1xuICAgICAgLy8ga2V5XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghaXNpbnQudGVzdChwYXJ0KSAmJiBpc0FycmF5KG9iaikpIG9iaiA9IHByb21vdGUocGFyZW50LCBrZXkpO1xuICAgICAgcGFyc2UocGFydHMsIG9iaiwgcGFydCwgdmFsKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNZXJnZSBwYXJlbnQga2V5L3ZhbCBwYWlyLlxuICovXG5cbmZ1bmN0aW9uIG1lcmdlKHBhcmVudCwga2V5LCB2YWwpe1xuICBpZiAofmluZGV4T2Yoa2V5LCAnXScpKSB7XG4gICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KCdbJylcbiAgICAgICwgbGVuID0gcGFydHMubGVuZ3RoXG4gICAgICAsIGxhc3QgPSBsZW4gLSAxO1xuICAgIHBhcnNlKHBhcnRzLCBwYXJlbnQsICdiYXNlJywgdmFsKTtcbiAgICAvLyBvcHRpbWl6ZVxuICB9IGVsc2Uge1xuICAgIGlmICghaXNpbnQudGVzdChrZXkpICYmIGlzQXJyYXkocGFyZW50LmJhc2UpKSB7XG4gICAgICB2YXIgdCA9IHt9O1xuICAgICAgZm9yICh2YXIgayBpbiBwYXJlbnQuYmFzZSkgdFtrXSA9IHBhcmVudC5iYXNlW2tdO1xuICAgICAgcGFyZW50LmJhc2UgPSB0O1xuICAgIH1cbiAgICBzZXQocGFyZW50LmJhc2UsIGtleSwgdmFsKTtcbiAgfVxuXG4gIHJldHVybiBwYXJlbnQ7XG59XG5cbi8qKlxuICogQ29tcGFjdCBzcGFyc2UgYXJyYXlzLlxuICovXG5cbmZ1bmN0aW9uIGNvbXBhY3Qob2JqKSB7XG4gIGlmICgnb2JqZWN0JyAhPSB0eXBlb2Ygb2JqKSByZXR1cm4gb2JqO1xuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICB2YXIgcmV0ID0gW107XG5cbiAgICBmb3IgKHZhciBpIGluIG9iaikge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkge1xuICAgICAgICByZXQucHVzaChvYmpbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgb2JqW2tleV0gPSBjb21wYWN0KG9ialtrZXldKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIG9iai5cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZU9iamVjdChvYmope1xuICB2YXIgcmV0ID0geyBiYXNlOiB7fSB9O1xuXG4gIGZvckVhY2gob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihuYW1lKXtcbiAgICBtZXJnZShyZXQsIG5hbWUsIG9ialtuYW1lXSk7XG4gIH0pO1xuXG4gIHJldHVybiBjb21wYWN0KHJldC5iYXNlKTtcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gc3RyLlxuICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cil7XG4gIHZhciByZXQgPSByZWR1Y2UoU3RyaW5nKHN0cikuc3BsaXQoJyYnKSwgZnVuY3Rpb24ocmV0LCBwYWlyKXtcbiAgICB2YXIgZXFsID0gaW5kZXhPZihwYWlyLCAnPScpXG4gICAgICAsIGJyYWNlID0gbGFzdEJyYWNlSW5LZXkocGFpcilcbiAgICAgICwga2V5ID0gcGFpci5zdWJzdHIoMCwgYnJhY2UgfHwgZXFsKVxuICAgICAgLCB2YWwgPSBwYWlyLnN1YnN0cihicmFjZSB8fCBlcWwsIHBhaXIubGVuZ3RoKVxuICAgICAgLCB2YWwgPSB2YWwuc3Vic3RyKGluZGV4T2YodmFsLCAnPScpICsgMSwgdmFsLmxlbmd0aCk7XG5cbiAgICAvLyA/Zm9vXG4gICAgaWYgKCcnID09IGtleSkga2V5ID0gcGFpciwgdmFsID0gJyc7XG4gICAgaWYgKCcnID09IGtleSkgcmV0dXJuIHJldDtcblxuICAgIHJldHVybiBtZXJnZShyZXQsIGRlY29kZShrZXkpLCBkZWNvZGUodmFsKSk7XG4gIH0sIHsgYmFzZToge30gfSkuYmFzZTtcblxuICByZXR1cm4gY29tcGFjdChyZXQpO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBxdWVyeSBgc3RyYCBvciBgb2JqYCwgcmV0dXJuaW5nIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIHwge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAobnVsbCA9PSBzdHIgfHwgJycgPT0gc3RyKSByZXR1cm4ge307XG4gIHJldHVybiAnb2JqZWN0JyA9PSB0eXBlb2Ygc3RyXG4gICAgPyBwYXJzZU9iamVjdChzdHIpXG4gICAgOiBwYXJzZVN0cmluZyhzdHIpO1xufTtcblxuLyoqXG4gKiBUdXJuIHRoZSBnaXZlbiBgb2JqYCBpbnRvIGEgcXVlcnkgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG52YXIgc3RyaW5naWZ5ID0gZXhwb3J0cy5zdHJpbmdpZnkgPSBmdW5jdGlvbihvYmosIHByZWZpeCkge1xuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIHN0cmluZ2lmeUFycmF5KG9iaiwgcHJlZml4KTtcbiAgfSBlbHNlIGlmICgnW29iamVjdCBPYmplY3RdJyA9PSB0b1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICByZXR1cm4gc3RyaW5naWZ5T2JqZWN0KG9iaiwgcHJlZml4KTtcbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygb2JqKSB7XG4gICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyhvYmosIHByZWZpeCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHByZWZpeCArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcob2JqKSk7XG4gIH1cbn07XG5cbi8qKlxuICogU3RyaW5naWZ5IHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlTdHJpbmcoc3RyLCBwcmVmaXgpIHtcbiAgaWYgKCFwcmVmaXgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZ2lmeSBleHBlY3RzIGFuIG9iamVjdCcpO1xuICByZXR1cm4gcHJlZml4ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cik7XG59XG5cbi8qKlxuICogU3RyaW5naWZ5IHRoZSBnaXZlbiBgYXJyYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcmVmaXhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ2lmeUFycmF5KGFyciwgcHJlZml4KSB7XG4gIHZhciByZXQgPSBbXTtcbiAgaWYgKCFwcmVmaXgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZ2lmeSBleHBlY3RzIGFuIG9iamVjdCcpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIHJldC5wdXNoKHN0cmluZ2lmeShhcnJbaV0sIHByZWZpeCArICdbJyArIGkgKyAnXScpKTtcbiAgfVxuICByZXR1cm4gcmV0LmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBTdHJpbmdpZnkgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcmVmaXhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ2lmeU9iamVjdChvYmosIHByZWZpeCkge1xuICB2YXIgcmV0ID0gW11cbiAgICAsIGtleXMgPSBvYmplY3RLZXlzKG9iailcbiAgICAsIGtleTtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGtleSA9IGtleXNbaV07XG4gICAgaWYgKCcnID09IGtleSkgY29udGludWU7XG4gICAgaWYgKG51bGwgPT0gb2JqW2tleV0pIHtcbiAgICAgIHJldC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0LnB1c2goc3RyaW5naWZ5KG9ialtrZXldLCBwcmVmaXhcbiAgICAgICAgPyBwcmVmaXggKyAnWycgKyBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICddJ1xuICAgICAgICA6IGVuY29kZVVSSUNvbXBvbmVudChrZXkpKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldC5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogU2V0IGBvYmpgJ3MgYGtleWAgdG8gYHZhbGAgcmVzcGVjdGluZ1xuICogdGhlIHdlaXJkIGFuZCB3b25kZXJmdWwgc3ludGF4IG9mIGEgcXMsXG4gKiB3aGVyZSBcImZvbz1iYXImZm9vPWJhelwiIGJlY29tZXMgYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2V0KG9iaiwga2V5LCB2YWwpIHtcbiAgdmFyIHYgPSBvYmpba2V5XTtcbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoT2JqZWN0LnByb3RvdHlwZSwga2V5KSkgcmV0dXJuO1xuICBpZiAodW5kZWZpbmVkID09PSB2KSB7XG4gICAgb2JqW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2KSkge1xuICAgIHYucHVzaCh2YWwpO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gW3YsIHZhbF07XG4gIH1cbn1cblxuLyoqXG4gKiBMb2NhdGUgbGFzdCBicmFjZSBpbiBgc3RyYCB3aXRoaW4gdGhlIGtleS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsYXN0QnJhY2VJbktleShzdHIpIHtcbiAgdmFyIGxlbiA9IHN0ci5sZW5ndGhcbiAgICAsIGJyYWNlXG4gICAgLCBjO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgYyA9IHN0cltpXTtcbiAgICBpZiAoJ10nID09IGMpIGJyYWNlID0gZmFsc2U7XG4gICAgaWYgKCdbJyA9PSBjKSBicmFjZSA9IHRydWU7XG4gICAgaWYgKCc9JyA9PSBjICYmICFicmFjZSkgcmV0dXJuIGk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNvZGUgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVjb2RlKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDE0IG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG4vKiogQGF1dGhvciBCcmlhbiBDYXZhbGllciAqL1xuLyoqIEBhdXRob3IgSm9obiBIYW5uICovXG5cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uIChyZXF1aXJlKSB7XG5cblx0dmFyIG1ha2VQcm9taXNlID0gcmVxdWlyZSgnLi9tYWtlUHJvbWlzZScpO1xuXHR2YXIgU2NoZWR1bGVyID0gcmVxdWlyZSgnLi9TY2hlZHVsZXInKTtcblx0dmFyIGFzeW5jID0gcmVxdWlyZSgnLi9hc3luYycpO1xuXG5cdHJldHVybiBtYWtlUHJvbWlzZSh7XG5cdFx0c2NoZWR1bGVyOiBuZXcgU2NoZWR1bGVyKGFzeW5jKVxuXHR9KTtcblxufSk7XG59KSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbiAoZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSk7IH0pO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDE0IG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG4vKiogQGF1dGhvciBCcmlhbiBDYXZhbGllciAqL1xuLyoqIEBhdXRob3IgSm9obiBIYW5uICovXG5cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHQvKipcblx0ICogQ2lyY3VsYXIgcXVldWVcblx0ICogQHBhcmFtIHtudW1iZXJ9IGNhcGFjaXR5UG93MiBwb3dlciBvZiAyIHRvIHdoaWNoIHRoaXMgcXVldWUncyBjYXBhY2l0eVxuXHQgKiAgd2lsbCBiZSBzZXQgaW5pdGlhbGx5LiBlZyB3aGVuIGNhcGFjaXR5UG93MiA9PSAzLCBxdWV1ZSBjYXBhY2l0eVxuXHQgKiAgd2lsbCBiZSA4LlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGZ1bmN0aW9uIFF1ZXVlKGNhcGFjaXR5UG93Mikge1xuXHRcdHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IHRoaXMubGVuZ3RoID0gMDtcblx0XHR0aGlzLmJ1ZmZlciA9IG5ldyBBcnJheSgxIDw8IGNhcGFjaXR5UG93Mik7XG5cdH1cblxuXHRRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKHgpIHtcblx0XHRpZih0aGlzLmxlbmd0aCA9PT0gdGhpcy5idWZmZXIubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLl9lbnN1cmVDYXBhY2l0eSh0aGlzLmxlbmd0aCAqIDIpO1xuXHRcdH1cblxuXHRcdHRoaXMuYnVmZmVyW3RoaXMudGFpbF0gPSB4O1xuXHRcdHRoaXMudGFpbCA9ICh0aGlzLnRhaWwgKyAxKSAmICh0aGlzLmJ1ZmZlci5sZW5ndGggLSAxKTtcblx0XHQrK3RoaXMubGVuZ3RoO1xuXHRcdHJldHVybiB0aGlzLmxlbmd0aDtcblx0fTtcblxuXHRRdWV1ZS5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgeCA9IHRoaXMuYnVmZmVyW3RoaXMuaGVhZF07XG5cdFx0dGhpcy5idWZmZXJbdGhpcy5oZWFkXSA9IHZvaWQgMDtcblx0XHR0aGlzLmhlYWQgPSAodGhpcy5oZWFkICsgMSkgJiAodGhpcy5idWZmZXIubGVuZ3RoIC0gMSk7XG5cdFx0LS10aGlzLmxlbmd0aDtcblx0XHRyZXR1cm4geDtcblx0fTtcblxuXHRRdWV1ZS5wcm90b3R5cGUuX2Vuc3VyZUNhcGFjaXR5ID0gZnVuY3Rpb24oY2FwYWNpdHkpIHtcblx0XHR2YXIgaGVhZCA9IHRoaXMuaGVhZDtcblx0XHR2YXIgYnVmZmVyID0gdGhpcy5idWZmZXI7XG5cdFx0dmFyIG5ld0J1ZmZlciA9IG5ldyBBcnJheShjYXBhY2l0eSk7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciBsZW47XG5cblx0XHRpZihoZWFkID09PSAwKSB7XG5cdFx0XHRsZW4gPSB0aGlzLmxlbmd0aDtcblx0XHRcdGZvcig7IGk8bGVuOyArK2kpIHtcblx0XHRcdFx0bmV3QnVmZmVyW2ldID0gYnVmZmVyW2ldO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjYXBhY2l0eSA9IGJ1ZmZlci5sZW5ndGg7XG5cdFx0XHRsZW4gPSB0aGlzLnRhaWw7XG5cdFx0XHRmb3IoOyBoZWFkPGNhcGFjaXR5OyArK2ksICsraGVhZCkge1xuXHRcdFx0XHRuZXdCdWZmZXJbaV0gPSBidWZmZXJbaGVhZF07XG5cdFx0XHR9XG5cblx0XHRcdGZvcihoZWFkPTA7IGhlYWQ8bGVuOyArK2ksICsraGVhZCkge1xuXHRcdFx0XHRuZXdCdWZmZXJbaV0gPSBidWZmZXJbaGVhZF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5idWZmZXIgPSBuZXdCdWZmZXI7XG5cdFx0dGhpcy5oZWFkID0gMDtcblx0XHR0aGlzLnRhaWwgPSB0aGlzLmxlbmd0aDtcblx0fTtcblxuXHRyZXR1cm4gUXVldWU7XG5cbn0pO1xufSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbihmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cbi8qKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyICovXG4vKiogQGF1dGhvciBKb2huIEhhbm4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24ocmVxdWlyZSkge1xuXG5cdHZhciBRdWV1ZSA9IHJlcXVpcmUoJy4vUXVldWUnKTtcblxuXHQvLyBDcmVkaXQgdG8gVHdpc29sIChodHRwczovL2dpdGh1Yi5jb20vVHdpc29sKSBmb3Igc3VnZ2VzdGluZ1xuXHQvLyB0aGlzIHR5cGUgb2YgZXh0ZW5zaWJsZSBxdWV1ZSArIHRyYW1wb2xpbmUgYXBwcm9hY2ggZm9yIG5leHQtdGljayBjb25mbGF0aW9uLlxuXG5cdC8qKlxuXHQgKiBBc3luYyB0YXNrIHNjaGVkdWxlclxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBhc3luYyBmdW5jdGlvbiB0byBzY2hlZHVsZSBhIHNpbmdsZSBhc3luYyBmdW5jdGlvblxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGZ1bmN0aW9uIFNjaGVkdWxlcihhc3luYykge1xuXHRcdHRoaXMuX2FzeW5jID0gYXN5bmM7XG5cdFx0dGhpcy5fcXVldWUgPSBuZXcgUXVldWUoMTUpO1xuXHRcdHRoaXMuX2FmdGVyUXVldWUgPSBuZXcgUXVldWUoNSk7XG5cdFx0dGhpcy5fcnVubmluZyA9IGZhbHNlO1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuZHJhaW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuX2RyYWluKCk7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFbnF1ZXVlIGEgdGFza1xuXHQgKiBAcGFyYW0ge3sgcnVuOmZ1bmN0aW9uIH19IHRhc2tcblx0ICovXG5cdFNjaGVkdWxlci5wcm90b3R5cGUuZW5xdWV1ZSA9IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR0aGlzLl9hZGQodGhpcy5fcXVldWUsIHRhc2spO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBFbnF1ZXVlIGEgdGFzayB0byBydW4gYWZ0ZXIgdGhlIG1haW4gdGFzayBxdWV1ZVxuXHQgKiBAcGFyYW0ge3sgcnVuOmZ1bmN0aW9uIH19IHRhc2tcblx0ICovXG5cdFNjaGVkdWxlci5wcm90b3R5cGUuYWZ0ZXJRdWV1ZSA9IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR0aGlzLl9hZGQodGhpcy5fYWZ0ZXJRdWV1ZSwgdGFzayk7XG5cdH07XG5cblx0LyoqXG5cdCAqIERyYWluIHRoZSBoYW5kbGVyIHF1ZXVlIGVudGlyZWx5LCBhbmQgdGhlbiB0aGUgYWZ0ZXIgcXVldWVcblx0ICovXG5cdFNjaGVkdWxlci5wcm90b3R5cGUuX2RyYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0cnVuUXVldWUodGhpcy5fcXVldWUpO1xuXHRcdHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcblx0XHRydW5RdWV1ZSh0aGlzLl9hZnRlclF1ZXVlKTtcblx0fTtcblxuXHQvKipcblx0ICogQWRkIGEgdGFzayB0byB0aGUgcSwgYW5kIHNjaGVkdWxlIGRyYWluIGlmIG5vdCBhbHJlYWR5IHNjaGVkdWxlZFxuXHQgKiBAcGFyYW0ge1F1ZXVlfSBxdWV1ZVxuXHQgKiBAcGFyYW0ge3tydW46ZnVuY3Rpb259fSB0YXNrXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRTY2hlZHVsZXIucHJvdG90eXBlLl9hZGQgPSBmdW5jdGlvbihxdWV1ZSwgdGFzaykge1xuXHRcdHF1ZXVlLnB1c2godGFzayk7XG5cdFx0aWYoIXRoaXMuX3J1bm5pbmcpIHtcblx0XHRcdHRoaXMuX3J1bm5pbmcgPSB0cnVlO1xuXHRcdFx0dGhpcy5fYXN5bmModGhpcy5kcmFpbik7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSdW4gYWxsIHRoZSB0YXNrcyBpbiB0aGUgcVxuXHQgKiBAcGFyYW0gcXVldWVcblx0ICovXG5cdGZ1bmN0aW9uIHJ1blF1ZXVlKHF1ZXVlKSB7XG5cdFx0d2hpbGUocXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0cXVldWUuc2hpZnQoKS5ydW4oKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gU2NoZWR1bGVyO1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxNCBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuLyoqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXIgKi9cbi8qKiBAYXV0aG9yIEpvaG4gSGFubiAqL1xuXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbigpIHtcblxuXHQvKipcblx0ICogQ3VzdG9tIGVycm9yIHR5cGUgZm9yIHByb21pc2VzIHJlamVjdGVkIGJ5IHByb21pc2UudGltZW91dFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGZ1bmN0aW9uIFRpbWVvdXRFcnJvciAobWVzc2FnZSkge1xuXHRcdEVycm9yLmNhbGwodGhpcyk7XG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0XHR0aGlzLm5hbWUgPSBUaW1lb3V0RXJyb3IubmFtZTtcblx0XHRpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBUaW1lb3V0RXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdFRpbWVvdXRFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5cdFRpbWVvdXRFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUaW1lb3V0RXJyb3I7XG5cblx0cmV0dXJuIFRpbWVvdXRFcnJvcjtcbn0pO1xufSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbihmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpOyB9KSk7IiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxNCBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuLyoqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXIgKi9cbi8qKiBAYXV0aG9yIEpvaG4gSGFubiAqL1xuXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbihyZXF1aXJlKSB7XG5cblx0Ly8gU25pZmYgXCJiZXN0XCIgYXN5bmMgc2NoZWR1bGluZyBvcHRpb25cblx0Ly8gUHJlZmVyIHByb2Nlc3MubmV4dFRpY2sgb3IgTXV0YXRpb25PYnNlcnZlciwgdGhlbiBjaGVjayBmb3Jcblx0Ly8gdmVydHggYW5kIGZpbmFsbHkgZmFsbCBiYWNrIHRvIHNldFRpbWVvdXRcblxuXHQvKmpzaGludCBtYXhjb21wbGV4aXR5OjYqL1xuXHQvKmdsb2JhbCBwcm9jZXNzLGRvY3VtZW50LHNldFRpbWVvdXQsTXV0YXRpb25PYnNlcnZlcixXZWJLaXRNdXRhdGlvbk9ic2VydmVyKi9cblx0dmFyIG5leHRUaWNrLCBNdXRhdGlvbk9icztcblxuXHRpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MgIT09IG51bGwgJiZcblx0XHR0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdG5leHRUaWNrID0gZnVuY3Rpb24oZikge1xuXHRcdFx0cHJvY2Vzcy5uZXh0VGljayhmKTtcblx0XHR9O1xuXG5cdH0gZWxzZSBpZiAoTXV0YXRpb25PYnMgPVxuXHRcdCh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBNdXRhdGlvbk9ic2VydmVyKSB8fFxuXHRcdCh0eXBlb2YgV2ViS2l0TXV0YXRpb25PYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBXZWJLaXRNdXRhdGlvbk9ic2VydmVyKSkge1xuXHRcdG5leHRUaWNrID0gKGZ1bmN0aW9uIChkb2N1bWVudCwgTXV0YXRpb25PYnNlcnZlcikge1xuXHRcdFx0dmFyIHNjaGVkdWxlZDtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dmFyIG8gPSBuZXcgTXV0YXRpb25PYnNlcnZlcihydW4pO1xuXHRcdFx0by5vYnNlcnZlKGVsLCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cblx0XHRcdGZ1bmN0aW9uIHJ1bigpIHtcblx0XHRcdFx0dmFyIGYgPSBzY2hlZHVsZWQ7XG5cdFx0XHRcdHNjaGVkdWxlZCA9IHZvaWQgMDtcblx0XHRcdFx0ZigpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKGYpIHtcblx0XHRcdFx0c2NoZWR1bGVkID0gZjtcblx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsICd4Jyk7XG5cdFx0XHR9O1xuXHRcdH0oZG9jdW1lbnQsIE11dGF0aW9uT2JzKSk7XG5cblx0fSBlbHNlIHtcblx0XHRuZXh0VGljayA9IChmdW5jdGlvbihjanNSZXF1aXJlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyB2ZXJ0LnggMS54IHx8IDIueFxuXHRcdFx0XHRyZXR1cm4gY2pzUmVxdWlyZSgndmVydHgnKS5ydW5Pbkxvb3AgfHwgY2pzUmVxdWlyZSgndmVydHgnKS5ydW5PbkNvbnRleHQ7XG5cdFx0XHR9IGNhdGNoIChpZ25vcmUpIHt9XG5cblx0XHRcdC8vIGNhcHR1cmUgc2V0VGltZW91dCB0byBhdm9pZCBiZWluZyBjYXVnaHQgYnkgZmFrZSB0aW1lcnNcblx0XHRcdC8vIHVzZWQgaW4gdGltZSBiYXNlZCB0ZXN0c1xuXHRcdFx0dmFyIGNhcHR1cmVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0Y2FwdHVyZWRTZXRUaW1lb3V0KHQsIDApO1xuXHRcdFx0fTtcblx0XHR9KHJlcXVpcmUpKTtcblx0fVxuXG5cdHJldHVybiBuZXh0VGljaztcbn0pO1xufSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbihmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKTsgfSkpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSkiLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cbi8qKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyICovXG4vKiogQGF1dGhvciBKb2huIEhhbm4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIGFycmF5KFByb21pc2UpIHtcblxuXHRcdHZhciBhcnJheVJlZHVjZSA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2U7XG5cdFx0dmFyIGFycmF5UmVkdWNlUmlnaHQgPSBBcnJheS5wcm90b3R5cGUucmVkdWNlUmlnaHQ7XG5cblx0XHR2YXIgdG9Qcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlO1xuXHRcdHZhciBhbGwgPSBQcm9taXNlLmFsbDtcblxuXHRcdC8vIEFkZGl0aW9uYWwgYXJyYXkgY29tYmluYXRvcnNcblxuXHRcdFByb21pc2UuYW55ID0gYW55O1xuXHRcdFByb21pc2Uuc29tZSA9IHNvbWU7XG5cdFx0UHJvbWlzZS5zZXR0bGUgPSBzZXR0bGU7XG5cblx0XHRQcm9taXNlLm1hcCA9IG1hcDtcblx0XHRQcm9taXNlLmZpbHRlciA9IGZpbHRlcjtcblx0XHRQcm9taXNlLnJlZHVjZSA9IHJlZHVjZTtcblx0XHRQcm9taXNlLnJlZHVjZVJpZ2h0ID0gcmVkdWNlUmlnaHQ7XG5cblx0XHQvKipcblx0XHQgKiBXaGVuIHRoaXMgcHJvbWlzZSBmdWxmaWxscyB3aXRoIGFuIGFycmF5LCBkb1xuXHRcdCAqIG9uRnVsZmlsbGVkLmFwcGx5KHZvaWQgMCwgYXJyYXkpXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gb25GdWxmaWxsZWQgZnVuY3Rpb24gdG8gYXBwbHlcblx0XHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSBmb3IgdGhlIHJlc3VsdCBvZiBhcHBseWluZyBvbkZ1bGZpbGxlZFxuXHRcdCAqL1xuXHRcdFByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50aGVuKGFsbCkudGhlbihmdW5jdGlvbihhcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gb25GdWxmaWxsZWQuYXBwbHkodm9pZCAwLCBhcnJheSk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIFByb21pc2U7XG5cblx0XHQvKipcblx0XHQgKiBPbmUtd2lubmVyIGNvbXBldGl0aXZlIHJhY2UuXG5cdFx0ICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgZnVsZmlsbCB3aGVuIG9uZSBvZiB0aGUgcHJvbWlzZXNcblx0XHQgKiBpbiB0aGUgaW5wdXQgYXJyYXkgZnVsZmlsbHMsIG9yIHdpbGwgcmVqZWN0IHdoZW4gYWxsIHByb21pc2VzXG5cdFx0ICogaGF2ZSByZWplY3RlZC5cblx0XHQgKiBAcGFyYW0ge2FycmF5fSBwcm9taXNlc1xuXHRcdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIGZvciB0aGUgZmlyc3QgZnVsZmlsbGVkIHZhbHVlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYW55KHByb21pc2VzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdHZhciBlcnJvcnMgPSBbXTtcblx0XHRcdFx0dmFyIHBlbmRpbmcgPSBpbml0UmFjZShwcm9taXNlcywgcmVzb2x2ZSwgaGFuZGxlUmVqZWN0KTtcblxuXHRcdFx0XHRpZihwZW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBSYW5nZUVycm9yKCdhbnkoKSBpbnB1dCBtdXN0IG5vdCBiZSBlbXB0eScpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGhhbmRsZVJlamVjdChlKSB7XG5cdFx0XHRcdFx0ZXJyb3JzLnB1c2goZSk7XG5cdFx0XHRcdFx0aWYoLS1wZW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoZXJyb3JzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIE4td2lubmVyIGNvbXBldGl0aXZlIHJhY2Vcblx0XHQgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdoZW4gbiBpbnB1dCBwcm9taXNlcyBoYXZlXG5cdFx0ICogZnVsZmlsbGVkLCBvciB3aWxsIHJlamVjdCB3aGVuIGl0IGJlY29tZXMgaW1wb3NzaWJsZSBmb3IgblxuXHRcdCAqIGlucHV0IHByb21pc2VzIHRvIGZ1bGZpbGwgKGllIHdoZW4gcHJvbWlzZXMubGVuZ3RoIC0gbiArIDFcblx0XHQgKiBoYXZlIHJlamVjdGVkKVxuXHRcdCAqIEBwYXJhbSB7YXJyYXl9IHByb21pc2VzXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IG5cblx0XHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSBmb3IgdGhlIGVhcmxpZXN0IG4gZnVsZmlsbG1lbnQgdmFsdWVzXG5cdFx0ICpcblx0XHQgKiBAZGVwcmVjYXRlZFxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNvbWUocHJvbWlzZXMsIG4pIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QsIG5vdGlmeSkge1xuXHRcdFx0XHR2YXIgcmVzdWx0cyA9IFtdO1xuXHRcdFx0XHR2YXIgZXJyb3JzID0gW107XG5cdFx0XHRcdHZhciBuUmVqZWN0O1xuXHRcdFx0XHR2YXIgbkZ1bGZpbGwgPSBpbml0UmFjZShwcm9taXNlcywgaGFuZGxlUmVzb2x2ZSwgaGFuZGxlUmVqZWN0LCBub3RpZnkpO1xuXG5cdFx0XHRcdG4gPSBNYXRoLm1heChuLCAwKTtcblx0XHRcdFx0blJlamVjdCA9IChuRnVsZmlsbCAtIG4gKyAxKTtcblx0XHRcdFx0bkZ1bGZpbGwgPSBNYXRoLm1pbihuLCBuRnVsZmlsbCk7XG5cblx0XHRcdFx0aWYobiA+IG5GdWxmaWxsKSB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBSYW5nZUVycm9yKCdzb21lKCkgaW5wdXQgbXVzdCBjb250YWluIGF0IGxlYXN0ICdcblx0XHRcdFx0XHRcdCsgbiArICcgZWxlbWVudChzKSwgYnV0IGhhZCAnICsgbkZ1bGZpbGwpKTtcblx0XHRcdFx0fSBlbHNlIGlmKG5GdWxmaWxsID09PSAwKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXN1bHRzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGhhbmRsZVJlc29sdmUoeCkge1xuXHRcdFx0XHRcdGlmKG5GdWxmaWxsID4gMCkge1xuXHRcdFx0XHRcdFx0LS1uRnVsZmlsbDtcblx0XHRcdFx0XHRcdHJlc3VsdHMucHVzaCh4KTtcblxuXHRcdFx0XHRcdFx0aWYobkZ1bGZpbGwgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShyZXN1bHRzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiBoYW5kbGVSZWplY3QoZSkge1xuXHRcdFx0XHRcdGlmKG5SZWplY3QgPiAwKSB7XG5cdFx0XHRcdFx0XHQtLW5SZWplY3Q7XG5cdFx0XHRcdFx0XHRlcnJvcnMucHVzaChlKTtcblxuXHRcdFx0XHRcdFx0aWYoblJlamVjdCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRyZWplY3QoZXJyb3JzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgYSByYWNlIG9ic2VydmluZyBlYWNoIHByb21pc2UgaW4gdGhlIGlucHV0IHByb21pc2VzXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gcHJvbWlzZXNcblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gcmVqZWN0XG5cdFx0ICogQHBhcmFtIHs/ZnVuY3Rpb249fSBub3RpZnlcblx0XHQgKiBAcmV0dXJucyB7TnVtYmVyfSBhY3R1YWwgY291bnQgb2YgaXRlbXMgYmVpbmcgcmFjZWRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBpbml0UmFjZShwcm9taXNlcywgcmVzb2x2ZSwgcmVqZWN0LCBub3RpZnkpIHtcblx0XHRcdHJldHVybiBhcnJheVJlZHVjZS5jYWxsKHByb21pc2VzLCBmdW5jdGlvbihwZW5kaW5nLCBwKSB7XG5cdFx0XHRcdHRvUHJvbWlzZShwKS50aGVuKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KTtcblx0XHRcdFx0cmV0dXJuIHBlbmRpbmcgKyAxO1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQXBwbHkgZiB0byB0aGUgdmFsdWUgb2YgZWFjaCBwcm9taXNlIGluIGEgbGlzdCBvZiBwcm9taXNlc1xuXHRcdCAqIGFuZCByZXR1cm4gYSBuZXcgbGlzdCBjb250YWluaW5nIHRoZSByZXN1bHRzLlxuXHRcdCAqIEBwYXJhbSB7YXJyYXl9IHByb21pc2VzXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbih4OiosIGluZGV4Ok51bWJlcik6Kn0gZiBtYXBwaW5nIGZ1bmN0aW9uXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbWFwKHByb21pc2VzLCBmKSB7XG5cdFx0XHRpZih0eXBlb2YgcHJvbWlzZXMgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiB0b1Byb21pc2UoW10pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYWxsKG1hcEFycmF5KGZ1bmN0aW9uKHgsIGkpIHtcblx0XHRcdFx0cmV0dXJuIHRvUHJvbWlzZSh4KS5mb2xkKG1hcFdpdGhJbmRleCwgaSk7XG5cdFx0XHR9LCBwcm9taXNlcykpO1xuXG5cdFx0XHRmdW5jdGlvbiBtYXBXaXRoSW5kZXgoaywgeCkge1xuXHRcdFx0XHRyZXR1cm4gZih4LCBrKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGaWx0ZXIgdGhlIHByb3ZpZGVkIGFycmF5IG9mIHByb21pc2VzIHVzaW5nIHRoZSBwcm92aWRlZCBwcmVkaWNhdGUuICBJbnB1dCBtYXlcblx0XHQgKiBjb250YWluIHByb21pc2VzIGFuZCB2YWx1ZXNcblx0XHQgKiBAcGFyYW0ge0FycmF5fSBwcm9taXNlcyBhcnJheSBvZiBwcm9taXNlcyBhbmQgdmFsdWVzXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbih4OiosIGluZGV4Ok51bWJlcik6Ym9vbGVhbn0gcHJlZGljYXRlIGZpbHRlcmluZyBwcmVkaWNhdGUuXG5cdFx0ICogIE11c3QgcmV0dXJuIHRydXRoeSAob3IgcHJvbWlzZSBmb3IgdHJ1dGh5KSBmb3IgaXRlbXMgdG8gcmV0YWluLlxuXHRcdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgY29udGFpbmluZyBhbGwgaXRlbXNcblx0XHQgKiAgZm9yIHdoaWNoIHByZWRpY2F0ZSByZXR1cm5lZCB0cnV0aHkuXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZmlsdGVyKHByb21pc2VzLCBwcmVkaWNhdGUpIHtcblx0XHRcdHJldHVybiBhbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG5cdFx0XHRcdHJldHVybiBhbGwobWFwQXJyYXkocHJlZGljYXRlLCB2YWx1ZXMpKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcblx0XHRcdFx0XHR2YXIgbGVuID0gcmVzdWx0cy5sZW5ndGg7XG5cdFx0XHRcdFx0dmFyIGZpbHRlcmVkID0gbmV3IEFycmF5KGxlbik7XG5cdFx0XHRcdFx0Zm9yKHZhciBpPTAsIGo9IDAsIHg7IGk8bGVuOyArK2kpIHtcblx0XHRcdFx0XHRcdHggPSByZXN1bHRzW2ldO1xuXHRcdFx0XHRcdFx0aWYoeCA9PT0gdm9pZCAwICYmICEoaSBpbiByZXN1bHRzKSkge1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmKHJlc3VsdHNbaV0pIHtcblx0XHRcdFx0XHRcdFx0ZmlsdGVyZWRbaisrXSA9IHZhbHVlc1tpXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlsdGVyZWQubGVuZ3RoID0gajtcblx0XHRcdFx0XHRyZXR1cm4gZmlsdGVyZWQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgYWx3YXlzIGZ1bGZpbGwgd2l0aCBhbiBhcnJheSBjb250YWluaW5nXG5cdFx0ICogdGhlIG91dGNvbWUgc3RhdGVzIG9mIGFsbCBpbnB1dCBwcm9taXNlcy4gIFRoZSByZXR1cm5lZCBwcm9taXNlXG5cdFx0ICogd2lsbCBuZXZlciByZWplY3QuXG5cdFx0ICogQHBhcmFtIHthcnJheX0gcHJvbWlzZXNcblx0XHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSBmb3IgYXJyYXkgb2Ygc2V0dGxlZCBzdGF0ZSBkZXNjcmlwdG9yc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNldHRsZShwcm9taXNlcykge1xuXHRcdFx0cmV0dXJuIGFsbChtYXBBcnJheShmdW5jdGlvbihwKSB7XG5cdFx0XHRcdHAgPSB0b1Byb21pc2UocCk7XG5cdFx0XHRcdHJldHVybiBwLnRoZW4oaW5zcGVjdCwgaW5zcGVjdCk7XG5cblx0XHRcdFx0ZnVuY3Rpb24gaW5zcGVjdCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gcC5pbnNwZWN0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHByb21pc2VzKSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVkdWNlIGFuIGFycmF5IG9mIHByb21pc2VzIGFuZCB2YWx1ZXNcblx0XHQgKiBAcGFyYW0ge0FycmF5fSBwcm9taXNlc1xuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb24oYWNjdW11bGF0ZWQ6KiwgeDoqLCBpbmRleDpOdW1iZXIpOip9IGYgcmVkdWNlIGZ1bmN0aW9uXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgZm9yIHJlZHVjZWQgdmFsdWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZWR1Y2UocHJvbWlzZXMsIGYpIHtcblx0XHRcdHZhciByZWR1Y2VyID0gbWFrZVJlZHVjZXIoZik7XG5cdFx0XHRyZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDJcblx0XHRcdFx0PyBhcnJheVJlZHVjZS5jYWxsKHByb21pc2VzLCByZWR1Y2VyLCBhcmd1bWVudHNbMl0pXG5cdFx0XHRcdDogYXJyYXlSZWR1Y2UuY2FsbChwcm9taXNlcywgcmVkdWNlcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVkdWNlIGFuIGFycmF5IG9mIHByb21pc2VzIGFuZCB2YWx1ZXMgZnJvbSB0aGUgcmlnaHRcblx0XHQgKiBAcGFyYW0ge0FycmF5fSBwcm9taXNlc1xuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb24oYWNjdW11bGF0ZWQ6KiwgeDoqLCBpbmRleDpOdW1iZXIpOip9IGYgcmVkdWNlIGZ1bmN0aW9uXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgZm9yIHJlZHVjZWQgdmFsdWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZWR1Y2VSaWdodChwcm9taXNlcywgZikge1xuXHRcdFx0dmFyIHJlZHVjZXIgPSBtYWtlUmVkdWNlcihmKTtcblx0XHRcdHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuXHRcdFx0XHQ/IGFycmF5UmVkdWNlUmlnaHQuY2FsbChwcm9taXNlcywgcmVkdWNlciwgYXJndW1lbnRzWzJdKVxuXHRcdFx0XHQ6IGFycmF5UmVkdWNlUmlnaHQuY2FsbChwcm9taXNlcywgcmVkdWNlcik7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gbWFrZVJlZHVjZXIoZikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHJlZHVjZXIocmVzdWx0LCB4LCBpKSB7XG5cdFx0XHRcdHJldHVybiB0b1Byb21pc2UocmVzdWx0KS50aGVuKGZ1bmN0aW9uKHIpIHtcblx0XHRcdFx0XHRyZXR1cm4gdG9Qcm9taXNlKHgpLnRoZW4oZnVuY3Rpb24oeCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGYociwgeCwgaSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBtYXBBcnJheShmLCBhKSB7XG5cdFx0XHR2YXIgbCA9IGEubGVuZ3RoO1xuXHRcdFx0dmFyIGIgPSBuZXcgQXJyYXkobCk7XG5cdFx0XHRmb3IodmFyIGk9MCwgeDsgaTxsOyArK2kpIHtcblx0XHRcdFx0eCA9IGFbaV07XG5cdFx0XHRcdGlmKHggPT09IHZvaWQgMCAmJiAhKGkgaW4gYSkpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRiW2ldID0gZihhW2ldLCBpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBiO1xuXHRcdH1cblx0fTtcblxuXG5cbn0pO1xufSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbihmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cbi8qKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyICovXG4vKiogQGF1dGhvciBKb2huIEhhbm4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIGZsb3coUHJvbWlzZSkge1xuXG5cdFx0dmFyIHJlamVjdCA9IFByb21pc2UucmVqZWN0O1xuXHRcdHZhciBvcmlnQ2F0Y2ggPSBQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXTtcblxuXHRcdC8qKlxuXHRcdCAqIEhhbmRsZSB0aGUgdWx0aW1hdGUgZnVsZmlsbG1lbnQgdmFsdWUgb3IgcmVqZWN0aW9uIHJlYXNvbiwgYW5kIGFzc3VtZVxuXHRcdCAqIHJlc3BvbnNpYmlsaXR5IGZvciBhbGwgZXJyb3JzLiAgSWYgYW4gZXJyb3IgcHJvcGFnYXRlcyBvdXQgb2YgcmVzdWx0XG5cdFx0ICogb3IgaGFuZGxlRmF0YWxFcnJvciwgaXQgd2lsbCBiZSByZXRocm93biB0byB0aGUgaG9zdCwgcmVzdWx0aW5nIGluIGFcblx0XHQgKiBsb3VkIHN0YWNrIHRyYWNrIG9uIG1vc3QgcGxhdGZvcm1zIGFuZCBhIGNyYXNoIG9uIHNvbWUuXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbj99IG9uUmVzdWx0XG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbj99IG9uRXJyb3Jcblx0XHQgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuXHRcdCAqL1xuXHRcdFByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbihvblJlc3VsdCwgb25FcnJvcikge1xuXHRcdFx0dGhpcy5faGFuZGxlci52aXNpdCh0aGlzLl9oYW5kbGVyLnJlY2VpdmVyLCBvblJlc3VsdCwgb25FcnJvcik7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBFcnJvci10eXBlIGFuZCBwcmVkaWNhdGUgbWF0Y2hpbmcgdG8gY2F0Y2guICBFeGFtcGxlczpcblx0XHQgKiBwcm9taXNlLmNhdGNoKFR5cGVFcnJvciwgaGFuZGxlVHlwZUVycm9yKVxuXHRcdCAqICAgLmNhdGNoKHByZWRpY2F0ZSwgaGFuZGxlTWF0Y2hlZEVycm9ycylcblx0XHQgKiAgIC5jYXRjaChoYW5kbGVSZW1haW5pbmdFcnJvcnMpXG5cdFx0ICogQHBhcmFtIG9uUmVqZWN0ZWRcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKi9cblx0XHRQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IFByb21pc2UucHJvdG90eXBlLm90aGVyd2lzZSA9IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpIHtcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuXHRcdFx0XHRyZXR1cm4gb3JpZ0NhdGNoLmNhbGwodGhpcywgb25SZWplY3RlZCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZih0eXBlb2Ygb25SZWplY3RlZCAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmVuc3VyZShyZWplY3RJbnZhbGlkUHJlZGljYXRlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBvcmlnQ2F0Y2guY2FsbCh0aGlzLCBjcmVhdGVDYXRjaEZpbHRlcihhcmd1bWVudHNbMV0sIG9uUmVqZWN0ZWQpKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogV3JhcHMgdGhlIHByb3ZpZGVkIGNhdGNoIGhhbmRsZXIsIHNvIHRoYXQgaXQgd2lsbCBvbmx5IGJlIGNhbGxlZFxuXHRcdCAqIGlmIHRoZSBwcmVkaWNhdGUgZXZhbHVhdGVzIHRydXRoeVxuXHRcdCAqIEBwYXJhbSB7P2Z1bmN0aW9ufSBoYW5kbGVyXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gcHJlZGljYXRlXG5cdFx0ICogQHJldHVybnMge2Z1bmN0aW9ufSBjb25kaXRpb25hbCBjYXRjaCBoYW5kbGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY3JlYXRlQ2F0Y2hGaWx0ZXIoaGFuZGxlciwgcHJlZGljYXRlKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRyZXR1cm4gZXZhbHVhdGVQcmVkaWNhdGUoZSwgcHJlZGljYXRlKVxuXHRcdFx0XHRcdD8gaGFuZGxlci5jYWxsKHRoaXMsIGUpXG5cdFx0XHRcdFx0OiByZWplY3QoZSk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVuc3VyZXMgdGhhdCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgcmVnYXJkbGVzcyBvZiB3aGV0aGVyXG5cdFx0ICogdGhpcyBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC4gIG9uRnVsZmlsbGVkT3JSZWplY3RlZCBXSUxMIE5PVFxuXHRcdCAqIHJlY2VpdmUgdGhlIHByb21pc2VzJyB2YWx1ZSBvciByZWFzb24uICBBbnkgcmV0dXJuZWQgdmFsdWUgd2lsbCBiZSBkaXNyZWdhcmRlZC5cblx0XHQgKiBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQgbWF5IHRocm93IG9yIHJldHVybiBhIHJlamVjdGVkIHByb21pc2UgdG8gc2lnbmFsXG5cdFx0ICogYW4gYWRkaXRpb25hbCBlcnJvci5cblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyIGhhbmRsZXIgdG8gYmUgY2FsbGVkIHJlZ2FyZGxlc3Mgb2Zcblx0XHQgKiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdFx0ICovXG5cdFx0UHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSA9IFByb21pc2UucHJvdG90eXBlLmVuc3VyZSA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcblx0XHRcdGlmKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaXNvbGF0ZWQgPSBpc29sYXRlKGhhbmRsZXIpO1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbihpc29sYXRlZCwgaXNvbGF0ZWQpWyd5aWVsZCddKHRoaXMpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZWNvdmVyIGZyb20gYSBmYWlsdXJlIGJ5IHJldHVybmluZyBhIGRlZmF1bHRWYWx1ZS4gIElmIGRlZmF1bHRWYWx1ZVxuXHRcdCAqIGlzIGEgcHJvbWlzZSwgaXQncyBmdWxmaWxsbWVudCB2YWx1ZSB3aWxsIGJlIHVzZWQuICBJZiBkZWZhdWx0VmFsdWUgaXNcblx0XHQgKiBhIHByb21pc2UgdGhhdCByZWplY3RzLCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlamVjdCB3aXRoIHRoZVxuXHRcdCAqIHNhbWUgcmVhc29uLlxuXHRcdCAqIEBwYXJhbSB7Kn0gZGVmYXVsdFZhbHVlXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9IG5ldyBwcm9taXNlXG5cdFx0ICovXG5cdFx0UHJvbWlzZS5wcm90b3R5cGVbJ2Vsc2UnXSA9IFByb21pc2UucHJvdG90eXBlLm9yRWxzZSA9IGZ1bmN0aW9uKGRlZmF1bHRWYWx1ZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFNob3J0Y3V0IGZvciAudGhlbihmdW5jdGlvbigpIHsgcmV0dXJuIHZhbHVlOyB9KVxuXHRcdCAqIEBwYXJhbSAgeyp9IHZhbHVlXG5cdFx0ICogQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHRoYXQ6XG5cdFx0ICogIC0gaXMgZnVsZmlsbGVkIGlmIHZhbHVlIGlzIG5vdCBhIHByb21pc2UsIG9yXG5cdFx0ICogIC0gaWYgdmFsdWUgaXMgYSBwcm9taXNlLCB3aWxsIGZ1bGZpbGwgd2l0aCBpdHMgdmFsdWUsIG9yIHJlamVjdFxuXHRcdCAqICAgIHdpdGggaXRzIHJlYXNvbi5cblx0XHQgKi9cblx0XHRQcm9taXNlLnByb3RvdHlwZVsneWllbGQnXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUnVucyBhIHNpZGUgZWZmZWN0IHdoZW4gdGhpcyBwcm9taXNlIGZ1bGZpbGxzLCB3aXRob3V0IGNoYW5naW5nIHRoZVxuXHRcdCAqIGZ1bGZpbGxtZW50IHZhbHVlLlxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IG9uRnVsZmlsbGVkU2lkZUVmZmVjdFxuXHRcdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHRcdCAqL1xuXHRcdFByb21pc2UucHJvdG90eXBlLnRhcCA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkU2lkZUVmZmVjdCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbihvbkZ1bGZpbGxlZFNpZGVFZmZlY3QpWyd5aWVsZCddKHRoaXMpO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gUHJvbWlzZTtcblx0fTtcblxuXHRmdW5jdGlvbiByZWplY3RJbnZhbGlkUHJlZGljYXRlKCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2NhdGNoIHByZWRpY2F0ZSBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGV2YWx1YXRlUHJlZGljYXRlKGUsIHByZWRpY2F0ZSkge1xuXHRcdHJldHVybiBpc0Vycm9yKHByZWRpY2F0ZSkgPyBlIGluc3RhbmNlb2YgcHJlZGljYXRlIDogcHJlZGljYXRlKGUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaXNFcnJvcihwcmVkaWNhdGUpIHtcblx0XHRyZXR1cm4gcHJlZGljYXRlID09PSBFcnJvclxuXHRcdFx0fHwgKHByZWRpY2F0ZSAhPSBudWxsICYmIHByZWRpY2F0ZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBFcnJvcik7XG5cdH1cblxuXHRmdW5jdGlvbiBpc29sYXRlKGYpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gZi5jYWxsKHRoaXMpO1xuXHRcdH07XG5cdH1cblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxNCBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuLyoqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXIgKi9cbi8qKiBAYXV0aG9yIEpvaG4gSGFubiAqL1xuLyoqIEBhdXRob3IgSmVmZiBFc2NhbGFudGUgKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIGZvbGQoUHJvbWlzZSkge1xuXG5cdFx0UHJvbWlzZS5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKGYsIHopIHtcblx0XHRcdHZhciBwcm9taXNlID0gdGhpcy5fYmVnZXQoKTtcblxuXHRcdFx0dGhpcy5faGFuZGxlci5mb2xkKGZ1bmN0aW9uKHosIHgsIHRvKSB7XG5cdFx0XHRcdFByb21pc2UuX2hhbmRsZXIoeikuZm9sZChmdW5jdGlvbih4LCB6LCB0bykge1xuXHRcdFx0XHRcdHRvLnJlc29sdmUoZi5jYWxsKHRoaXMsIHosIHgpKTtcblx0XHRcdFx0fSwgeCwgdGhpcywgdG8pO1xuXHRcdFx0fSwgeiwgcHJvbWlzZS5faGFuZGxlci5yZWNlaXZlciwgcHJvbWlzZS5faGFuZGxlcik7XG5cblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gUHJvbWlzZTtcblx0fTtcblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxNCBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuLyoqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXIgKi9cbi8qKiBAYXV0aG9yIEpvaG4gSGFubiAqL1xuXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbigpIHtcblxuXHRyZXR1cm4gZnVuY3Rpb24gaW5zcGVjdGlvbihQcm9taXNlKSB7XG5cblx0XHRQcm9taXNlLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gaW5zcGVjdChQcm9taXNlLl9oYW5kbGVyKHRoaXMpKTtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gaW5zcGVjdChoYW5kbGVyKSB7XG5cdFx0XHR2YXIgc3RhdGUgPSBoYW5kbGVyLnN0YXRlKCk7XG5cblx0XHRcdGlmKHN0YXRlID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiB7IHN0YXRlOiAncGVuZGluZycgfTtcblx0XHRcdH1cblxuXHRcdFx0aWYoc3RhdGUgPiAwKSB7XG5cdFx0XHRcdHJldHVybiB7IHN0YXRlOiAnZnVsZmlsbGVkJywgdmFsdWU6IGhhbmRsZXIudmFsdWUgfTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgc3RhdGU6ICdyZWplY3RlZCcsIHJlYXNvbjogaGFuZGxlci52YWx1ZSB9O1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlO1xuXHR9O1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDE0IG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG4vKiogQGF1dGhvciBCcmlhbiBDYXZhbGllciAqL1xuLyoqIEBhdXRob3IgSm9obiBIYW5uICovXG5cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKCkge1xuXG5cdHJldHVybiBmdW5jdGlvbiBnZW5lcmF0ZShQcm9taXNlKSB7XG5cblx0XHR2YXIgcmVzb2x2ZSA9IFByb21pc2UucmVzb2x2ZTtcblxuXHRcdFByb21pc2UuaXRlcmF0ZSA9IGl0ZXJhdGU7XG5cdFx0UHJvbWlzZS51bmZvbGQgPSB1bmZvbGQ7XG5cblx0XHRyZXR1cm4gUHJvbWlzZTtcblxuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlIGEgKHBvdGVudGlhbGx5IGluZmluaXRlKSBzdHJlYW0gb2YgcHJvbWlzZWQgdmFsdWVzOlxuXHRcdCAqIHgsIGYoeCksIGYoZih4KSksIGV0Yy4gdW50aWwgY29uZGl0aW9uKHgpIHJldHVybnMgdHJ1ZVxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGYgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgYSBuZXcgeCBmcm9tIHRoZSBwcmV2aW91cyB4XG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGZ1bmN0aW9uIHRoYXQsIGdpdmVuIHRoZSBjdXJyZW50IHgsIHJldHVybnNcblx0XHQgKiAgdHJ1dGh5IHdoZW4gdGhlIGl0ZXJhdGUgc2hvdWxkIHN0b3Bcblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyIGZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgdmFsdWUgcHJvZHVjZWQgYnkgZlxuXHRcdCAqIEBwYXJhbSB7KnxQcm9taXNlfSB4IHN0YXJ0aW5nIHZhbHVlLCBtYXkgYmUgYSBwcm9taXNlXG5cdFx0ICogQHJldHVybiB7UHJvbWlzZX0gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBjYWxsIHRvIGYgYmVmb3JlXG5cdFx0ICogIGNvbmRpdGlvbiByZXR1cm5zIHRydWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBpdGVyYXRlKGYsIGNvbmRpdGlvbiwgaGFuZGxlciwgeCkge1xuXHRcdFx0cmV0dXJuIHVuZm9sZChmdW5jdGlvbih4KSB7XG5cdFx0XHRcdHJldHVybiBbeCwgZih4KV07XG5cdFx0XHR9LCBjb25kaXRpb24sIGhhbmRsZXIsIHgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlIGEgKHBvdGVudGlhbGx5IGluZmluaXRlKSBzdHJlYW0gb2YgcHJvbWlzZWQgdmFsdWVzXG5cdFx0ICogYnkgYXBwbHlpbmcgaGFuZGxlcihnZW5lcmF0b3Ioc2VlZCkpIGl0ZXJhdGl2ZWx5IHVudGlsXG5cdFx0ICogY29uZGl0aW9uKHNlZWQpIHJldHVybnMgdHJ1ZS5cblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1bnNwb29sIGZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgW3ZhbHVlLCBuZXdTZWVkXVxuXHRcdCAqICBnaXZlbiBhIHNlZWQuXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY29uZGl0aW9uIGZ1bmN0aW9uIHRoYXQsIGdpdmVuIHRoZSBjdXJyZW50IHNlZWQsIHJldHVybnNcblx0XHQgKiAgdHJ1dGh5IHdoZW4gdGhlIHVuZm9sZCBzaG91bGQgc3RvcFxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXIgZnVuY3Rpb24gdG8gaGFuZGxlIHRoZSB2YWx1ZSBwcm9kdWNlZCBieSB1bnNwb29sXG5cdFx0ICogQHBhcmFtIHggeyp8UHJvbWlzZX0gc3RhcnRpbmcgdmFsdWUsIG1heSBiZSBhIHByb21pc2Vcblx0XHQgKiBAcmV0dXJuIHtQcm9taXNlfSB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IHZhbHVlIHByb2R1Y2VkIGJ5IHVuc3Bvb2wgYmVmb3JlXG5cdFx0ICogIGNvbmRpdGlvbiByZXR1cm5zIHRydWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB1bmZvbGQodW5zcG9vbCwgY29uZGl0aW9uLCBoYW5kbGVyLCB4KSB7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZSh4KS50aGVuKGZ1bmN0aW9uKHNlZWQpIHtcblx0XHRcdFx0cmV0dXJuIHJlc29sdmUoY29uZGl0aW9uKHNlZWQpKS50aGVuKGZ1bmN0aW9uKGRvbmUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZG9uZSA/IHNlZWQgOiByZXNvbHZlKHVuc3Bvb2woc2VlZCkpLnNwcmVhZChuZXh0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0ZnVuY3Rpb24gbmV4dChpdGVtLCBuZXdTZWVkKSB7XG5cdFx0XHRcdHJldHVybiByZXNvbHZlKGhhbmRsZXIoaXRlbSkpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZm9sZCh1bnNwb29sLCBjb25kaXRpb24sIGhhbmRsZXIsIG5ld1NlZWQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cbn0pO1xufSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbihmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cbi8qKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyICovXG4vKiogQGF1dGhvciBKb2huIEhhbm4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHByb2dyZXNzKFByb21pc2UpIHtcblxuXHRcdC8qKlxuXHRcdCAqIFJlZ2lzdGVyIGEgcHJvZ3Jlc3MgaGFuZGxlciBmb3IgdGhpcyBwcm9taXNlXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gb25Qcm9ncmVzc1xuXHRcdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHRcdCAqL1xuXHRcdFByb21pc2UucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24ob25Qcm9ncmVzcykge1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHZvaWQgMCwgb25Qcm9ncmVzcyk7XG5cdFx0fTtcblxuXHRcdHJldHVybiBQcm9taXNlO1xuXHR9O1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDE0IG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG4vKiogQGF1dGhvciBCcmlhbiBDYXZhbGllciAqL1xuLyoqIEBhdXRob3IgSm9obiBIYW5uICovXG5cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKHJlcXVpcmUpIHtcblxuXHR2YXIgdGltZXIgPSByZXF1aXJlKCcuLi90aW1lcicpO1xuXHR2YXIgVGltZW91dEVycm9yID0gcmVxdWlyZSgnLi4vVGltZW91dEVycm9yJyk7XG5cblx0ZnVuY3Rpb24gc2V0VGltZW91dChmLCBtcywgeCwgeSkge1xuXHRcdHJldHVybiB0aW1lci5zZXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRmKHgsIHksIG1zKTtcblx0XHR9LCBtcyk7XG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24gdGltZWQoUHJvbWlzZSkge1xuXHRcdC8qKlxuXHRcdCAqIFJldHVybiBhIG5ldyBwcm9taXNlIHdob3NlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIHJldmVhbGVkIG9ubHlcblx0XHQgKiBhZnRlciBtcyBtaWxsaXNlY29uZHNcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbXMgbWlsbGlzZWNvbmRzXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdFx0ICovXG5cdFx0UHJvbWlzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbihtcykge1xuXHRcdFx0dmFyIHAgPSB0aGlzLl9iZWdldCgpO1xuXHRcdFx0dGhpcy5faGFuZGxlci5mb2xkKGhhbmRsZURlbGF5LCBtcywgdm9pZCAwLCBwLl9oYW5kbGVyKTtcblx0XHRcdHJldHVybiBwO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVEZWxheShtcywgeCwgaCkge1xuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlRGVsYXksIG1zLCB4LCBoKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiByZXNvbHZlRGVsYXkoeCwgaCkge1xuXHRcdFx0aC5yZXNvbHZlKHgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJldHVybiBhIG5ldyBwcm9taXNlIHRoYXQgcmVqZWN0cyBhZnRlciBtcyBtaWxsaXNlY29uZHMgdW5sZXNzXG5cdFx0ICogdGhpcyBwcm9taXNlIGZ1bGZpbGxzIGVhcmxpZXIsIGluIHdoaWNoIGNhc2UgdGhlIHJldHVybmVkIHByb21pc2Vcblx0XHQgKiBmdWxmaWxscyB3aXRoIHRoZSBzYW1lIHZhbHVlLlxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBtcyBtaWxsaXNlY29uZHNcblx0XHQgKiBAcGFyYW0ge0Vycm9yfCo9fSByZWFzb24gb3B0aW9uYWwgcmVqZWN0aW9uIHJlYXNvbiB0byB1c2UsIGRlZmF1bHRzXG5cdFx0ICogICB0byBhIFRpbWVvdXRFcnJvciBpZiBub3QgcHJvdmlkZWRcblx0XHQgKiBAcmV0dXJucyB7UHJvbWlzZX1cblx0XHQgKi9cblx0XHRQcm9taXNlLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMsIHJlYXNvbikge1xuXHRcdFx0dmFyIHAgPSB0aGlzLl9iZWdldCgpO1xuXHRcdFx0dmFyIGggPSBwLl9oYW5kbGVyO1xuXG5cdFx0XHR2YXIgdCA9IHNldFRpbWVvdXQob25UaW1lb3V0LCBtcywgcmVhc29uLCBwLl9oYW5kbGVyKTtcblxuXHRcdFx0dGhpcy5faGFuZGxlci52aXNpdChoLFxuXHRcdFx0XHRmdW5jdGlvbiBvbkZ1bGZpbGwoeCkge1xuXHRcdFx0XHRcdHRpbWVyLmNsZWFyKHQpO1xuXHRcdFx0XHRcdHRoaXMucmVzb2x2ZSh4KTsgLy8gdGhpcyA9IGhcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24gb25SZWplY3QoeCkge1xuXHRcdFx0XHRcdHRpbWVyLmNsZWFyKHQpO1xuXHRcdFx0XHRcdHRoaXMucmVqZWN0KHgpOyAvLyB0aGlzID0gaFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoLm5vdGlmeSk7XG5cblx0XHRcdHJldHVybiBwO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBvblRpbWVvdXQocmVhc29uLCBoLCBtcykge1xuXHRcdFx0dmFyIGUgPSB0eXBlb2YgcmVhc29uID09PSAndW5kZWZpbmVkJ1xuXHRcdFx0XHQ/IG5ldyBUaW1lb3V0RXJyb3IoJ3RpbWVkIG91dCBhZnRlciAnICsgbXMgKyAnbXMnKVxuXHRcdFx0XHQ6IHJlYXNvbjtcblx0XHRcdGgucmVqZWN0KGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlO1xuXHR9O1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxNCBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuLyoqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXIgKi9cbi8qKiBAYXV0aG9yIEpvaG4gSGFubiAqL1xuXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbihyZXF1aXJlKSB7XG5cblx0dmFyIHRpbWVyID0gcmVxdWlyZSgnLi4vdGltZXInKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdW5oYW5kbGVkUmVqZWN0aW9uKFByb21pc2UpIHtcblx0XHR2YXIgbG9nRXJyb3IgPSBub29wO1xuXHRcdHZhciBsb2dJbmZvID0gbm9vcDtcblxuXHRcdGlmKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0bG9nRXJyb3IgPSB0eXBlb2YgY29uc29sZS5lcnJvciAhPT0gJ3VuZGVmaW5lZCdcblx0XHRcdFx0PyBmdW5jdGlvbiAoZSkgeyBjb25zb2xlLmVycm9yKGUpOyB9XG5cdFx0XHRcdDogZnVuY3Rpb24gKGUpIHsgY29uc29sZS5sb2coZSk7IH07XG5cblx0XHRcdGxvZ0luZm8gPSB0eXBlb2YgY29uc29sZS5pbmZvICE9PSAndW5kZWZpbmVkJ1xuXHRcdFx0XHQ/IGZ1bmN0aW9uIChlKSB7IGNvbnNvbGUuaW5mbyhlKTsgfVxuXHRcdFx0XHQ6IGZ1bmN0aW9uIChlKSB7IGNvbnNvbGUubG9nKGUpOyB9O1xuXHRcdH1cblxuXHRcdFByb21pc2Uub25Qb3RlbnRpYWxseVVuaGFuZGxlZFJlamVjdGlvbiA9IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuXHRcdFx0ZW5xdWV1ZShyZXBvcnQsIHJlamVjdGlvbik7XG5cdFx0fTtcblxuXHRcdFByb21pc2Uub25Qb3RlbnRpYWxseVVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZWQgPSBmdW5jdGlvbihyZWplY3Rpb24pIHtcblx0XHRcdGVucXVldWUodW5yZXBvcnQsIHJlamVjdGlvbik7XG5cdFx0fTtcblxuXHRcdFByb21pc2Uub25GYXRhbFJlamVjdGlvbiA9IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuXHRcdFx0ZW5xdWV1ZSh0aHJvd2l0LCByZWplY3Rpb24udmFsdWUpO1xuXHRcdH07XG5cblx0XHR2YXIgdGFza3MgPSBbXTtcblx0XHR2YXIgcmVwb3J0ZWQgPSBbXTtcblx0XHR2YXIgcnVubmluZyA9IGZhbHNlO1xuXG5cdFx0ZnVuY3Rpb24gcmVwb3J0KHIpIHtcblx0XHRcdGlmKCFyLmhhbmRsZWQpIHtcblx0XHRcdFx0cmVwb3J0ZWQucHVzaChyKTtcblx0XHRcdFx0bG9nRXJyb3IoJ1BvdGVudGlhbGx5IHVuaGFuZGxlZCByZWplY3Rpb24gWycgKyByLmlkICsgJ10gJyArIGZvcm1hdEVycm9yKHIudmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiB1bnJlcG9ydChyKSB7XG5cdFx0XHR2YXIgaSA9IHJlcG9ydGVkLmluZGV4T2Yocik7XG5cdFx0XHRpZihpID49IDApIHtcblx0XHRcdFx0cmVwb3J0ZWQuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRsb2dJbmZvKCdIYW5kbGVkIHByZXZpb3VzIHJlamVjdGlvbiBbJyArIHIuaWQgKyAnXSAnICsgZm9ybWF0T2JqZWN0KHIudmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBlbnF1ZXVlKGYsIHgpIHtcblx0XHRcdHRhc2tzLnB1c2goZiwgeCk7XG5cdFx0XHRpZighcnVubmluZykge1xuXHRcdFx0XHRydW5uaW5nID0gdHJ1ZTtcblx0XHRcdFx0cnVubmluZyA9IHRpbWVyLnNldChmbHVzaCwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0XHR3aGlsZSh0YXNrcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRhc2tzLnNoaWZ0KCkodGFza3Muc2hpZnQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2U7XG5cdH07XG5cblx0ZnVuY3Rpb24gZm9ybWF0RXJyb3IoZSkge1xuXHRcdHZhciBzID0gdHlwZW9mIGUgPT09ICdvYmplY3QnICYmIGUuc3RhY2sgPyBlLnN0YWNrIDogZm9ybWF0T2JqZWN0KGUpO1xuXHRcdHJldHVybiBlIGluc3RhbmNlb2YgRXJyb3IgPyBzIDogcyArICcgKFdBUk5JTkc6IG5vbi1FcnJvciB1c2VkKSc7XG5cdH1cblxuXHRmdW5jdGlvbiBmb3JtYXRPYmplY3Qobykge1xuXHRcdHZhciBzID0gU3RyaW5nKG8pO1xuXHRcdGlmKHMgPT09ICdbb2JqZWN0IE9iamVjdF0nICYmIHR5cGVvZiBKU09OICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cyA9IHRyeVN0cmluZ2lmeShvLCBzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHM7XG5cdH1cblxuXHRmdW5jdGlvbiB0cnlTdHJpbmdpZnkoZSwgZGVmYXVsdFZhbHVlKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShlKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdC8vIElnbm9yZS4gQ2Fubm90IEpTT04uc3RyaW5naWZ5IGUsIHN0aWNrIHdpdGggU3RyaW5nKGUpXG5cdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRocm93aXQoZSkge1xuXHRcdHRocm93IGU7XG5cdH1cblxuXHRmdW5jdGlvbiBub29wKCkge31cblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cbi8qKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyICovXG4vKiogQGF1dGhvciBKb2huIEhhbm4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIGFkZFdpdGgoUHJvbWlzZSkge1xuXHRcdC8qKlxuXHRcdCAqIFJldHVybnMgYSBwcm9taXNlIHdob3NlIGhhbmRsZXJzIHdpbGwgYmUgY2FsbGVkIHdpdGggYHRoaXNgIHNldCB0b1xuXHRcdCAqIHRoZSBzdXBwbGllZCByZWNlaXZlci4gIFN1YnNlcXVlbnQgcHJvbWlzZXMgZGVyaXZlZCBmcm9tIHRoZVxuXHRcdCAqIHJldHVybmVkIHByb21pc2Ugd2lsbCBhbHNvIGhhdmUgdGhlaXIgaGFuZGxlcnMgY2FsbGVkIHdpdGggcmVjZWl2ZXJcblx0XHQgKiBhcyBgdGhpc2AuIENhbGxpbmcgYHdpdGhgIHdpdGggdW5kZWZpbmVkIG9yIG5vIGFyZ3VtZW50cyB3aWxsIHJldHVyblxuXHRcdCAqIGEgcHJvbWlzZSB3aG9zZSBoYW5kbGVycyB3aWxsIGFnYWluIGJlIGNhbGxlZCBpbiB0aGUgdXN1YWwgUHJvbWlzZXMvQStcblx0XHQgKiB3YXkgKG5vIGB0aGlzYCkgdGh1cyBzYWZlbHkgdW5kb2luZyBhbnkgcHJldmlvdXMgYHdpdGhgIGluIHRoZVxuXHRcdCAqIHByb21pc2UgY2hhaW4uXG5cdFx0ICpcblx0XHQgKiBXQVJOSU5HOiBQcm9taXNlcyByZXR1cm5lZCBmcm9tIGB3aXRoYC9gd2l0aFRoaXNgIGFyZSBOT1QgUHJvbWlzZXMvQStcblx0XHQgKiBjb21wbGlhbnQsIHNwZWNpZmljYWxseSB2aW9sYXRpbmcgMi4yLjUgKGh0dHA6Ly9wcm9taXNlc2FwbHVzLmNvbS8jcG9pbnQtNDEpXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVjZWl2ZXIgYHRoaXNgIHZhbHVlIGZvciBhbGwgaGFuZGxlcnMgYXR0YWNoZWQgdG9cblx0XHQgKiAgdGhlIHJldHVybmVkIHByb21pc2UuXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdFx0ICovXG5cdFx0UHJvbWlzZS5wcm90b3R5cGVbJ3dpdGgnXSA9IFByb21pc2UucHJvdG90eXBlLndpdGhUaGlzID0gZnVuY3Rpb24ocmVjZWl2ZXIpIHtcblx0XHRcdHZhciBwID0gdGhpcy5fYmVnZXQoKTtcblx0XHRcdHZhciBjaGlsZCA9IHAuX2hhbmRsZXI7XG5cdFx0XHRjaGlsZC5yZWNlaXZlciA9IHJlY2VpdmVyO1xuXHRcdFx0dGhpcy5faGFuZGxlci5jaGFpbihjaGlsZCwgcmVjZWl2ZXIpO1xuXHRcdFx0cmV0dXJuIHA7XG5cdFx0fTtcblxuXHRcdHJldHVybiBQcm9taXNlO1xuXHR9O1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuXG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cbi8qKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyICovXG4vKiogQGF1dGhvciBKb2huIEhhbm4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIG1ha2VQcm9taXNlKGVudmlyb25tZW50KSB7XG5cblx0XHR2YXIgdGFza3MgPSBlbnZpcm9ubWVudC5zY2hlZHVsZXI7XG5cblx0XHR2YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fFxuXHRcdFx0ZnVuY3Rpb24ocHJvdG8pIHtcblx0XHRcdFx0ZnVuY3Rpb24gQ2hpbGQoKSB7fVxuXHRcdFx0XHRDaGlsZC5wcm90b3R5cGUgPSBwcm90bztcblx0XHRcdFx0cmV0dXJuIG5ldyBDaGlsZCgpO1xuXHRcdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhIHByb21pc2Ugd2hvc2UgZmF0ZSBpcyBkZXRlcm1pbmVkIGJ5IHJlc29sdmVyXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Vcblx0XHQgKiBAbmFtZSBQcm9taXNlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlciwgaGFuZGxlcikge1xuXHRcdFx0dGhpcy5faGFuZGxlciA9IHJlc29sdmVyID09PSBIYW5kbGVyID8gaGFuZGxlciA6IGluaXQocmVzb2x2ZXIpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJ1biB0aGUgc3VwcGxpZWQgcmVzb2x2ZXJcblx0XHQgKiBAcGFyYW0gcmVzb2x2ZXJcblx0XHQgKiBAcmV0dXJucyB7UGVuZGluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBpbml0KHJlc29sdmVyKSB7XG5cdFx0XHR2YXIgaGFuZGxlciA9IG5ldyBQZW5kaW5nKCk7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlc29sdmVyKHByb21pc2VSZXNvbHZlLCBwcm9taXNlUmVqZWN0LCBwcm9taXNlTm90aWZ5KTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cHJvbWlzZVJlamVjdChlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGhhbmRsZXI7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVHJhbnNpdGlvbiBmcm9tIHByZS1yZXNvbHV0aW9uIHN0YXRlIHRvIHBvc3QtcmVzb2x1dGlvbiBzdGF0ZSwgbm90aWZ5aW5nXG5cdFx0XHQgKiBhbGwgbGlzdGVuZXJzIG9mIHRoZSB1bHRpbWF0ZSBmdWxmaWxsbWVudCBvciByZWplY3Rpb25cblx0XHRcdCAqIEBwYXJhbSB7Kn0geCByZXNvbHV0aW9uIHZhbHVlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHByb21pc2VSZXNvbHZlICh4KSB7XG5cdFx0XHRcdGhhbmRsZXIucmVzb2x2ZSh4KTtcblx0XHRcdH1cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVqZWN0IHRoaXMgcHJvbWlzZSB3aXRoIHJlYXNvbiwgd2hpY2ggd2lsbCBiZSB1c2VkIHZlcmJhdGltXG5cdFx0XHQgKiBAcGFyYW0ge0Vycm9yfCp9IHJlYXNvbiByZWplY3Rpb24gcmVhc29uLCBzdHJvbmdseSBzdWdnZXN0ZWRcblx0XHRcdCAqICAgdG8gYmUgYW4gRXJyb3IgdHlwZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBwcm9taXNlUmVqZWN0IChyZWFzb24pIHtcblx0XHRcdFx0aGFuZGxlci5yZWplY3QocmVhc29uKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJc3N1ZSBhIHByb2dyZXNzIGV2ZW50LCBub3RpZnlpbmcgYWxsIHByb2dyZXNzIGxpc3RlbmVyc1xuXHRcdFx0ICogQHBhcmFtIHsqfSB4IHByb2dyZXNzIGV2ZW50IHBheWxvYWQgdG8gcGFzcyB0byBhbGwgbGlzdGVuZXJzXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHByb21pc2VOb3RpZnkgKHgpIHtcblx0XHRcdFx0aGFuZGxlci5ub3RpZnkoeCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ3JlYXRpb25cblxuXHRcdFByb21pc2UucmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0UHJvbWlzZS5yZWplY3QgPSByZWplY3Q7XG5cdFx0UHJvbWlzZS5uZXZlciA9IG5ldmVyO1xuXG5cdFx0UHJvbWlzZS5fZGVmZXIgPSBkZWZlcjtcblx0XHRQcm9taXNlLl9oYW5kbGVyID0gZ2V0SGFuZGxlcjtcblxuXHRcdC8qKlxuXHRcdCAqIFJldHVybnMgYSB0cnVzdGVkIHByb21pc2UuIElmIHggaXMgYWxyZWFkeSBhIHRydXN0ZWQgcHJvbWlzZSwgaXQgaXNcblx0XHQgKiByZXR1cm5lZCwgb3RoZXJ3aXNlIHJldHVybnMgYSBuZXcgdHJ1c3RlZCBQcm9taXNlIHdoaWNoIGZvbGxvd3MgeC5cblx0XHQgKiBAcGFyYW0gIHsqfSB4XG5cdFx0ICogQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlc29sdmUoeCkge1xuXHRcdFx0cmV0dXJuIGlzUHJvbWlzZSh4KSA/IHhcblx0XHRcdFx0OiBuZXcgUHJvbWlzZShIYW5kbGVyLCBuZXcgQXN5bmMoZ2V0SGFuZGxlcih4KSkpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJldHVybiBhIHJlamVjdCBwcm9taXNlIHdpdGggeCBhcyBpdHMgcmVhc29uICh4IGlzIHVzZWQgdmVyYmF0aW0pXG5cdFx0ICogQHBhcmFtIHsqfSB4XG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9IHJlamVjdGVkIHByb21pc2Vcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZWplY3QoeCkge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKEhhbmRsZXIsIG5ldyBBc3luYyhuZXcgUmVqZWN0ZWQoeCkpKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgcmVtYWlucyBwZW5kaW5nIGZvcmV2ZXJcblx0XHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gZm9yZXZlci1wZW5kaW5nIHByb21pc2UuXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbmV2ZXIoKSB7XG5cdFx0XHRyZXR1cm4gZm9yZXZlclBlbmRpbmdQcm9taXNlOyAvLyBTaG91bGQgYmUgZnJvemVuXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlcyBhbiBpbnRlcm5hbCB7cHJvbWlzZSwgcmVzb2x2ZXJ9IHBhaXJcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGRlZmVyKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKEhhbmRsZXIsIG5ldyBQZW5kaW5nKCkpO1xuXHRcdH1cblxuXHRcdC8vIFRyYW5zZm9ybWF0aW9uIGFuZCBmbG93IGNvbnRyb2xcblxuXHRcdC8qKlxuXHRcdCAqIFRyYW5zZm9ybSB0aGlzIHByb21pc2UncyBmdWxmaWxsbWVudCB2YWx1ZSwgcmV0dXJuaW5nIGEgbmV3IFByb21pc2Vcblx0XHQgKiBmb3IgdGhlIHRyYW5zZm9ybWVkIHJlc3VsdC4gIElmIHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQsIG9uUmVqZWN0ZWRcblx0XHQgKiBpcyBjYWxsZWQgd2l0aCB0aGUgcmVhc29uLiAgb25Qcm9ncmVzcyAqbWF5KiBiZSBjYWxsZWQgd2l0aCB1cGRhdGVzIHRvd2FyZFxuXHRcdCAqIHRoaXMgcHJvbWlzZSdzIGZ1bGZpbGxtZW50LlxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb249fSBvbkZ1bGZpbGxlZCBmdWxmaWxsbWVudCBoYW5kbGVyXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbj19IG9uUmVqZWN0ZWQgcmVqZWN0aW9uIGhhbmRsZXJcblx0XHQgKiBAZGVwcmVjYXRlZCBAcGFyYW0ge2Z1bmN0aW9uPX0gb25Qcm9ncmVzcyBwcm9ncmVzcyBoYW5kbGVyXG5cdFx0ICogQHJldHVybiB7UHJvbWlzZX0gbmV3IHByb21pc2Vcblx0XHQgKi9cblx0XHRQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcblx0XHRcdHZhciBwYXJlbnQgPSB0aGlzLl9oYW5kbGVyO1xuXG5cdFx0XHRpZiAodHlwZW9mIG9uRnVsZmlsbGVkICE9PSAnZnVuY3Rpb24nICYmIHBhcmVudC5qb2luKCkuc3RhdGUoKSA+IDApIHtcblx0XHRcdFx0Ly8gU2hvcnQgY2lyY3VpdDogdmFsdWUgd2lsbCBub3QgY2hhbmdlLCBzaW1wbHkgc2hhcmUgaGFuZGxlclxuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoSGFuZGxlciwgcGFyZW50KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHAgPSB0aGlzLl9iZWdldCgpO1xuXHRcdFx0dmFyIGNoaWxkID0gcC5faGFuZGxlcjtcblxuXHRcdFx0cGFyZW50LmNoYWluKGNoaWxkLCBwYXJlbnQucmVjZWl2ZXIsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLFxuXHRcdFx0XHRcdGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzJdIDogdm9pZCAwKTtcblxuXHRcdFx0cmV0dXJuIHA7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIElmIHRoaXMgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkIGR1ZSB0byBhbiBlcnJvciwgY2FsbCBvblJlamVjdGVkIHRvXG5cdFx0ICogaGFuZGxlIHRoZSBlcnJvci4gU2hvcnRjdXQgZm9yIC50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZClcblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gb25SZWplY3RlZFxuXHRcdCAqIEByZXR1cm4ge1Byb21pc2V9XG5cdFx0ICovXG5cdFx0UHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbihvblJlamVjdGVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgb25SZWplY3RlZCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZXMgYSBuZXcsIHBlbmRpbmcgcHJvbWlzZSBvZiB0aGUgc2FtZSB0eXBlIGFzIHRoaXMgcHJvbWlzZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdFx0ICovXG5cdFx0UHJvbWlzZS5wcm90b3R5cGUuX2JlZ2V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5faGFuZGxlcjtcblx0XHRcdHZhciBjaGlsZCA9IG5ldyBQZW5kaW5nKHBhcmVudC5yZWNlaXZlciwgcGFyZW50LmpvaW4oKS5jb250ZXh0KTtcblx0XHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihIYW5kbGVyLCBjaGlsZCk7XG5cdFx0fTtcblxuXHRcdC8vIEFycmF5IGNvbWJpbmF0b3JzXG5cblx0XHRQcm9taXNlLmFsbCA9IGFsbDtcblx0XHRQcm9taXNlLnJhY2UgPSByYWNlO1xuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgZnVsZmlsbCB3aGVuIGFsbCBwcm9taXNlcyBpbiB0aGVcblx0XHQgKiBpbnB1dCBhcnJheSBoYXZlIGZ1bGZpbGxlZCwgb3Igd2lsbCByZWplY3Qgd2hlbiBvbmUgb2YgdGhlXG5cdFx0ICogcHJvbWlzZXMgcmVqZWN0cy5cblx0XHQgKiBAcGFyYW0ge2FycmF5fSBwcm9taXNlcyBhcnJheSBvZiBwcm9taXNlc1xuXHRcdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIGZvciBhcnJheSBvZiBmdWxmaWxsbWVudCB2YWx1ZXNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcblx0XHRcdC8qanNoaW50IG1heGNvbXBsZXhpdHk6OCovXG5cdFx0XHR2YXIgcmVzb2x2ZXIgPSBuZXcgUGVuZGluZygpO1xuXHRcdFx0dmFyIHBlbmRpbmcgPSBwcm9taXNlcy5sZW5ndGggPj4+IDA7XG5cdFx0XHR2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShwZW5kaW5nKTtcblxuXHRcdFx0dmFyIGksIGgsIHgsIHM7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgcHJvbWlzZXMubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0eCA9IHByb21pc2VzW2ldO1xuXG5cdFx0XHRcdGlmICh4ID09PSB2b2lkIDAgJiYgIShpIGluIHByb21pc2VzKSkge1xuXHRcdFx0XHRcdC0tcGVuZGluZztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChtYXliZVRoZW5hYmxlKHgpKSB7XG5cdFx0XHRcdFx0aCA9IGlzUHJvbWlzZSh4KVxuXHRcdFx0XHRcdFx0PyB4Ll9oYW5kbGVyLmpvaW4oKVxuXHRcdFx0XHRcdFx0OiBnZXRIYW5kbGVyVW50cnVzdGVkKHgpO1xuXG5cdFx0XHRcdFx0cyA9IGguc3RhdGUoKTtcblx0XHRcdFx0XHRpZiAocyA9PT0gMCkge1xuXHRcdFx0XHRcdFx0aC5mb2xkKHNldHRsZUF0LCBpLCByZXN1bHRzLCByZXNvbHZlcik7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChzID4gMCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0c1tpXSA9IGgudmFsdWU7XG5cdFx0XHRcdFx0XHQtLXBlbmRpbmc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlc29sdmVyLmJlY29tZShoKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdHNbaV0gPSB4O1xuXHRcdFx0XHRcdC0tcGVuZGluZztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZihwZW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdHJlc29sdmVyLmJlY29tZShuZXcgRnVsZmlsbGVkKHJlc3VsdHMpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKEhhbmRsZXIsIHJlc29sdmVyKTtcblxuXHRcdFx0ZnVuY3Rpb24gc2V0dGxlQXQoaSwgeCwgcmVzb2x2ZXIpIHtcblx0XHRcdFx0Lypqc2hpbnQgdmFsaWR0aGlzOnRydWUqL1xuXHRcdFx0XHR0aGlzW2ldID0geDtcblx0XHRcdFx0aWYoLS1wZW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZXIuYmVjb21lKG5ldyBGdWxmaWxsZWQodGhpcykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVsZmlsbC1yZWplY3QgY29tcGV0aXRpdmUgcmFjZS4gUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgc2V0dGxlXG5cdFx0ICogdG8gdGhlIHNhbWUgc3RhdGUgYXMgdGhlIGVhcmxpZXN0IGlucHV0IHByb21pc2UgdG8gc2V0dGxlLlxuXHRcdCAqXG5cdFx0ICogV0FSTklORzogVGhlIEVTNiBQcm9taXNlIHNwZWMgcmVxdWlyZXMgdGhhdCByYWNlKClpbmcgYW4gZW1wdHkgYXJyYXlcblx0XHQgKiBtdXN0IHJldHVybiBhIHByb21pc2UgdGhhdCBpcyBwZW5kaW5nIGZvcmV2ZXIuICBUaGlzIGltcGxlbWVudGF0aW9uXG5cdFx0ICogcmV0dXJucyBhIHNpbmdsZXRvbiBmb3JldmVyLXBlbmRpbmcgcHJvbWlzZSwgdGhlIHNhbWUgc2luZ2xldG9uIHRoYXQgaXNcblx0XHQgKiByZXR1cm5lZCBieSBQcm9taXNlLm5ldmVyKCksIHRodXMgY2FuIGJlIGNoZWNrZWQgd2l0aCA9PT1cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7YXJyYXl9IHByb21pc2VzIGFycmF5IG9mIHByb21pc2VzIHRvIHJhY2Vcblx0XHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gaWYgaW5wdXQgaXMgbm9uLWVtcHR5LCBhIHByb21pc2UgdGhhdCB3aWxsIHNldHRsZVxuXHRcdCAqIHRvIHRoZSBzYW1lIG91dGNvbWUgYXMgdGhlIGVhcmxpZXN0IGlucHV0IHByb21pc2UgdG8gc2V0dGxlLiBpZiBlbXB0eVxuXHRcdCAqIGlzIGVtcHR5LCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgbmV2ZXIgc2V0dGxlLlxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJhY2UocHJvbWlzZXMpIHtcblx0XHRcdC8vIFNpZ2gsIHJhY2UoW10pIGlzIHVudGVzdGFibGUgdW5sZXNzIHdlIHJldHVybiAqc29tZXRoaW5nKlxuXHRcdFx0Ly8gdGhhdCBpcyByZWNvZ25pemFibGUgd2l0aG91dCBjYWxsaW5nIC50aGVuKCkgb24gaXQuXG5cdFx0XHRpZihPYmplY3QocHJvbWlzZXMpID09PSBwcm9taXNlcyAmJiBwcm9taXNlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIG5ldmVyKCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBoID0gbmV3IFBlbmRpbmcoKTtcblx0XHRcdHZhciBpLCB4O1xuXHRcdFx0Zm9yKGk9MDsgaTxwcm9taXNlcy5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHR4ID0gcHJvbWlzZXNbaV07XG5cdFx0XHRcdGlmICh4ICE9PSB2b2lkIDAgJiYgaSBpbiBwcm9taXNlcykge1xuXHRcdFx0XHRcdGdldEhhbmRsZXIoeCkudmlzaXQoaCwgaC5yZXNvbHZlLCBoLnJlamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShIYW5kbGVyLCBoKTtcblx0XHR9XG5cblx0XHQvLyBQcm9taXNlIGludGVybmFsc1xuXHRcdC8vIEJlbG93IHRoaXMsIGV2ZXJ5dGhpbmcgaXMgQHByaXZhdGVcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbiBhcHByb3ByaWF0ZSBoYW5kbGVyIGZvciB4LCB3aXRob3V0IGNoZWNraW5nIGZvciBjeWNsZXNcblx0XHQgKiBAcGFyYW0geyp9IHhcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSBoYW5kbGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0SGFuZGxlcih4KSB7XG5cdFx0XHRpZihpc1Byb21pc2UoeCkpIHtcblx0XHRcdFx0cmV0dXJuIHguX2hhbmRsZXIuam9pbigpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1heWJlVGhlbmFibGUoeCkgPyBnZXRIYW5kbGVyVW50cnVzdGVkKHgpIDogbmV3IEZ1bGZpbGxlZCh4KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYSBoYW5kbGVyIGZvciBwb3RlbnRpYWxseSB1bnRydXN0ZWQgdGhlbmFibGUgeFxuXHRcdCAqIEBwYXJhbSB7Kn0geFxuXHRcdCAqIEByZXR1cm5zIHtvYmplY3R9IGhhbmRsZXJcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRIYW5kbGVyVW50cnVzdGVkKHgpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciB1bnRydXN0ZWRUaGVuID0geC50aGVuO1xuXHRcdFx0XHRyZXR1cm4gdHlwZW9mIHVudHJ1c3RlZFRoZW4gPT09ICdmdW5jdGlvbidcblx0XHRcdFx0XHQ/IG5ldyBUaGVuYWJsZSh1bnRydXN0ZWRUaGVuLCB4KVxuXHRcdFx0XHRcdDogbmV3IEZ1bGZpbGxlZCh4KTtcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkKGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEhhbmRsZXIgZm9yIGEgcHJvbWlzZSB0aGF0IGlzIHBlbmRpbmcgZm9yZXZlclxuXHRcdCAqIEBjb25zdHJ1Y3RvclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIEhhbmRsZXIoKSB7fVxuXG5cdFx0SGFuZGxlci5wcm90b3R5cGUud2hlblxuXHRcdFx0PSBIYW5kbGVyLnByb3RvdHlwZS5iZWNvbWVcblx0XHRcdD0gSGFuZGxlci5wcm90b3R5cGUubm90aWZ5XG5cdFx0XHQ9IEhhbmRsZXIucHJvdG90eXBlLmZhaWxcblx0XHRcdD0gSGFuZGxlci5wcm90b3R5cGUuX3VucmVwb3J0XG5cdFx0XHQ9IEhhbmRsZXIucHJvdG90eXBlLl9yZXBvcnRcblx0XHRcdD0gbm9vcDtcblxuXHRcdEhhbmRsZXIucHJvdG90eXBlLl9zdGF0ZSA9IDA7XG5cblx0XHRIYW5kbGVyLnByb3RvdHlwZS5zdGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3N0YXRlO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZWN1cnNpdmVseSBjb2xsYXBzZSBoYW5kbGVyIGNoYWluIHRvIGZpbmQgdGhlIGhhbmRsZXJcblx0XHQgKiBuZWFyZXN0IHRvIHRoZSBmdWxseSByZXNvbHZlZCB2YWx1ZS5cblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSBoYW5kbGVyIG5lYXJlc3QgdGhlIGZ1bGx5IHJlc29sdmVkIHZhbHVlXG5cdFx0ICovXG5cdFx0SGFuZGxlci5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGggPSB0aGlzO1xuXHRcdFx0d2hpbGUoaC5oYW5kbGVyICE9PSB2b2lkIDApIHtcblx0XHRcdFx0aCA9IGguaGFuZGxlcjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBoO1xuXHRcdH07XG5cblx0XHRIYW5kbGVyLnByb3RvdHlwZS5jaGFpbiA9IGZ1bmN0aW9uKHRvLCByZWNlaXZlciwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcblx0XHRcdHRoaXMud2hlbih7XG5cdFx0XHRcdHJlc29sdmVyOiB0byxcblx0XHRcdFx0cmVjZWl2ZXI6IHJlY2VpdmVyLFxuXHRcdFx0XHRmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcblx0XHRcdFx0cmVqZWN0ZWQ6IHJlamVjdGVkLFxuXHRcdFx0XHRwcm9ncmVzczogcHJvZ3Jlc3Ncblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRIYW5kbGVyLnByb3RvdHlwZS52aXNpdCA9IGZ1bmN0aW9uKHJlY2VpdmVyLCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuXHRcdFx0dGhpcy5jaGFpbihmYWlsSWZSZWplY3RlZCwgcmVjZWl2ZXIsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcblx0XHR9O1xuXG5cdFx0SGFuZGxlci5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKGYsIHosIGMsIHRvKSB7XG5cdFx0XHR0aGlzLnZpc2l0KHRvLCBmdW5jdGlvbih4KSB7XG5cdFx0XHRcdGYuY2FsbChjLCB6LCB4LCB0aGlzKTtcblx0XHRcdH0sIHRvLnJlamVjdCwgdG8ubm90aWZ5KTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogSGFuZGxlciB0aGF0IGludm9rZXMgZmFpbCgpIG9uIGFueSBoYW5kbGVyIGl0IGJlY29tZXNcblx0XHQgKiBAY29uc3RydWN0b3Jcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBGYWlsSWZSZWplY3RlZCgpIHt9XG5cblx0XHRpbmhlcml0KEhhbmRsZXIsIEZhaWxJZlJlamVjdGVkKTtcblxuXHRcdEZhaWxJZlJlamVjdGVkLnByb3RvdHlwZS5iZWNvbWUgPSBmdW5jdGlvbihoKSB7XG5cdFx0XHRoLmZhaWwoKTtcblx0XHR9O1xuXG5cdFx0dmFyIGZhaWxJZlJlamVjdGVkID0gbmV3IEZhaWxJZlJlamVjdGVkKCk7XG5cblx0XHQvKipcblx0XHQgKiBIYW5kbGVyIHRoYXQgbWFuYWdlcyBhIHF1ZXVlIG9mIGNvbnN1bWVycyB3YWl0aW5nIG9uIGEgcGVuZGluZyBwcm9taXNlXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gUGVuZGluZyhyZWNlaXZlciwgaW5oZXJpdGVkQ29udGV4dCkge1xuXHRcdFx0UHJvbWlzZS5jcmVhdGVDb250ZXh0KHRoaXMsIGluaGVyaXRlZENvbnRleHQpO1xuXG5cdFx0XHR0aGlzLmNvbnN1bWVycyA9IHZvaWQgMDtcblx0XHRcdHRoaXMucmVjZWl2ZXIgPSByZWNlaXZlcjtcblx0XHRcdHRoaXMuaGFuZGxlciA9IHZvaWQgMDtcblx0XHRcdHRoaXMucmVzb2x2ZWQgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpbmhlcml0KEhhbmRsZXIsIFBlbmRpbmcpO1xuXG5cdFx0UGVuZGluZy5wcm90b3R5cGUuX3N0YXRlID0gMDtcblxuXHRcdFBlbmRpbmcucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbih4KSB7XG5cdFx0XHR0aGlzLmJlY29tZShnZXRIYW5kbGVyKHgpKTtcblx0XHR9O1xuXG5cdFx0UGVuZGluZy5wcm90b3R5cGUucmVqZWN0ID0gZnVuY3Rpb24oeCkge1xuXHRcdFx0aWYodGhpcy5yZXNvbHZlZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYmVjb21lKG5ldyBSZWplY3RlZCh4KSk7XG5cdFx0fTtcblxuXHRcdFBlbmRpbmcucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICghdGhpcy5yZXNvbHZlZCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblxuXHRcdFx0dmFyIGggPSB0aGlzO1xuXG5cdFx0XHR3aGlsZSAoaC5oYW5kbGVyICE9PSB2b2lkIDApIHtcblx0XHRcdFx0aCA9IGguaGFuZGxlcjtcblx0XHRcdFx0aWYgKGggPT09IHRoaXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5oYW5kbGVyID0gY3ljbGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaDtcblx0XHR9O1xuXG5cdFx0UGVuZGluZy5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcSA9IHRoaXMuY29uc3VtZXJzO1xuXHRcdFx0dmFyIGhhbmRsZXIgPSB0aGlzLmpvaW4oKTtcblx0XHRcdHRoaXMuY29uc3VtZXJzID0gdm9pZCAwO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHEubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0aGFuZGxlci53aGVuKHFbaV0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRQZW5kaW5nLnByb3RvdHlwZS5iZWNvbWUgPSBmdW5jdGlvbihoYW5kbGVyKSB7XG5cdFx0XHRpZih0aGlzLnJlc29sdmVkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5yZXNvbHZlZCA9IHRydWU7XG5cdFx0XHR0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuXHRcdFx0aWYodGhpcy5jb25zdW1lcnMgIT09IHZvaWQgMCkge1xuXHRcdFx0XHR0YXNrcy5lbnF1ZXVlKHRoaXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGlzLmNvbnRleHQgIT09IHZvaWQgMCkge1xuXHRcdFx0XHRoYW5kbGVyLl9yZXBvcnQodGhpcy5jb250ZXh0KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0UGVuZGluZy5wcm90b3R5cGUud2hlbiA9IGZ1bmN0aW9uKGNvbnRpbnVhdGlvbikge1xuXHRcdFx0aWYodGhpcy5yZXNvbHZlZCkge1xuXHRcdFx0XHR0YXNrcy5lbnF1ZXVlKG5ldyBDb250aW51YXRpb25UYXNrKGNvbnRpbnVhdGlvbiwgdGhpcy5oYW5kbGVyKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZih0aGlzLmNvbnN1bWVycyA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0dGhpcy5jb25zdW1lcnMgPSBbY29udGludWF0aW9uXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmNvbnN1bWVycy5wdXNoKGNvbnRpbnVhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0UGVuZGluZy5wcm90b3R5cGUubm90aWZ5ID0gZnVuY3Rpb24oeCkge1xuXHRcdFx0aWYoIXRoaXMucmVzb2x2ZWQpIHtcblx0XHRcdFx0dGFza3MuZW5xdWV1ZShuZXcgUHJvZ3Jlc3NUYXNrKHgsIHRoaXMpKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0UGVuZGluZy5wcm90b3R5cGUuZmFpbCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRcdHZhciBjID0gdHlwZW9mIGNvbnRleHQgPT09ICd1bmRlZmluZWQnID8gdGhpcy5jb250ZXh0IDogY29udGV4dDtcblx0XHRcdHRoaXMucmVzb2x2ZWQgJiYgdGhpcy5oYW5kbGVyLmpvaW4oKS5mYWlsKGMpO1xuXHRcdH07XG5cblx0XHRQZW5kaW5nLnByb3RvdHlwZS5fcmVwb3J0ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRcdFx0dGhpcy5yZXNvbHZlZCAmJiB0aGlzLmhhbmRsZXIuam9pbigpLl9yZXBvcnQoY29udGV4dCk7XG5cdFx0fTtcblxuXHRcdFBlbmRpbmcucHJvdG90eXBlLl91bnJlcG9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5yZXNvbHZlZCAmJiB0aGlzLmhhbmRsZXIuam9pbigpLl91bnJlcG9ydCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBXcmFwIGFub3RoZXIgaGFuZGxlciBhbmQgZm9yY2UgaXQgaW50byBhIGZ1dHVyZSBzdGFja1xuXHRcdCAqIEBwYXJhbSB7b2JqZWN0fSBoYW5kbGVyXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gQXN5bmMoaGFuZGxlcikge1xuXHRcdFx0dGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcblx0XHR9XG5cblx0XHRpbmhlcml0KEhhbmRsZXIsIEFzeW5jKTtcblxuXHRcdEFzeW5jLnByb3RvdHlwZS53aGVuID0gZnVuY3Rpb24oY29udGludWF0aW9uKSB7XG5cdFx0XHR0YXNrcy5lbnF1ZXVlKG5ldyBDb250aW51YXRpb25UYXNrKGNvbnRpbnVhdGlvbiwgdGhpcykpO1xuXHRcdH07XG5cblx0XHRBc3luYy5wcm90b3R5cGUuX3JlcG9ydCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRcdHRoaXMuam9pbigpLl9yZXBvcnQoY29udGV4dCk7XG5cdFx0fTtcblxuXHRcdEFzeW5jLnByb3RvdHlwZS5fdW5yZXBvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuam9pbigpLl91bnJlcG9ydCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBIYW5kbGVyIHRoYXQgd3JhcHMgYW4gdW50cnVzdGVkIHRoZW5hYmxlIGFuZCBhc3NpbWlsYXRlcyBpdCBpbiBhIGZ1dHVyZSBzdGFja1xuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHRoZW5cblx0XHQgKiBAcGFyYW0ge3t0aGVuOiBmdW5jdGlvbn19IHRoZW5hYmxlXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gVGhlbmFibGUodGhlbiwgdGhlbmFibGUpIHtcblx0XHRcdFBlbmRpbmcuY2FsbCh0aGlzKTtcblx0XHRcdHRhc2tzLmVucXVldWUobmV3IEFzc2ltaWxhdGVUYXNrKHRoZW4sIHRoZW5hYmxlLCB0aGlzKSk7XG5cdFx0fVxuXG5cdFx0aW5oZXJpdChQZW5kaW5nLCBUaGVuYWJsZSk7XG5cblx0XHQvKipcblx0XHQgKiBIYW5kbGVyIGZvciBhIGZ1bGZpbGxlZCBwcm9taXNlXG5cdFx0ICogQHBhcmFtIHsqfSB4IGZ1bGZpbGxtZW50IHZhbHVlXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gRnVsZmlsbGVkKHgpIHtcblx0XHRcdFByb21pc2UuY3JlYXRlQ29udGV4dCh0aGlzKTtcblx0XHRcdHRoaXMudmFsdWUgPSB4O1xuXHRcdH1cblxuXHRcdGluaGVyaXQoSGFuZGxlciwgRnVsZmlsbGVkKTtcblxuXHRcdEZ1bGZpbGxlZC5wcm90b3R5cGUuX3N0YXRlID0gMTtcblxuXHRcdEZ1bGZpbGxlZC5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKGYsIHosIGMsIHRvKSB7XG5cdFx0XHRydW5Db250aW51YXRpb24zKGYsIHosIHRoaXMsIGMsIHRvKTtcblx0XHR9O1xuXG5cdFx0RnVsZmlsbGVkLnByb3RvdHlwZS53aGVuID0gZnVuY3Rpb24oY29udCkge1xuXHRcdFx0cnVuQ29udGludWF0aW9uMShjb250LmZ1bGZpbGxlZCwgdGhpcywgY29udC5yZWNlaXZlciwgY29udC5yZXNvbHZlcik7XG5cdFx0fTtcblxuXHRcdHZhciBlcnJvcklkID0gMDtcblxuXHRcdC8qKlxuXHRcdCAqIEhhbmRsZXIgZm9yIGEgcmVqZWN0ZWQgcHJvbWlzZVxuXHRcdCAqIEBwYXJhbSB7Kn0geCByZWplY3Rpb24gcmVhc29uXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gUmVqZWN0ZWQoeCkge1xuXHRcdFx0UHJvbWlzZS5jcmVhdGVDb250ZXh0KHRoaXMpO1xuXG5cdFx0XHR0aGlzLmlkID0gKytlcnJvcklkO1xuXHRcdFx0dGhpcy52YWx1ZSA9IHg7XG5cdFx0XHR0aGlzLmhhbmRsZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMucmVwb3J0ZWQgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5fcmVwb3J0KCk7XG5cdFx0fVxuXG5cdFx0aW5oZXJpdChIYW5kbGVyLCBSZWplY3RlZCk7XG5cblx0XHRSZWplY3RlZC5wcm90b3R5cGUuX3N0YXRlID0gLTE7XG5cblx0XHRSZWplY3RlZC5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKGYsIHosIGMsIHRvKSB7XG5cdFx0XHR0by5iZWNvbWUodGhpcyk7XG5cdFx0fTtcblxuXHRcdFJlamVjdGVkLnByb3RvdHlwZS53aGVuID0gZnVuY3Rpb24oY29udCkge1xuXHRcdFx0aWYodHlwZW9mIGNvbnQucmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGhpcy5fdW5yZXBvcnQoKTtcblx0XHRcdH1cblx0XHRcdHJ1bkNvbnRpbnVhdGlvbjEoY29udC5yZWplY3RlZCwgdGhpcywgY29udC5yZWNlaXZlciwgY29udC5yZXNvbHZlcik7XG5cdFx0fTtcblxuXHRcdFJlamVjdGVkLnByb3RvdHlwZS5fcmVwb3J0ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRcdFx0dGFza3MuYWZ0ZXJRdWV1ZShuZXcgUmVwb3J0VGFzayh0aGlzLCBjb250ZXh0KSk7XG5cdFx0fTtcblxuXHRcdFJlamVjdGVkLnByb3RvdHlwZS5fdW5yZXBvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaGFuZGxlZCA9IHRydWU7XG5cdFx0XHR0YXNrcy5hZnRlclF1ZXVlKG5ldyBVbnJlcG9ydFRhc2sodGhpcykpO1xuXHRcdH07XG5cblx0XHRSZWplY3RlZC5wcm90b3R5cGUuZmFpbCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRcdFByb21pc2Uub25GYXRhbFJlamVjdGlvbih0aGlzLCBjb250ZXh0ID09PSB2b2lkIDAgPyB0aGlzLmNvbnRleHQgOiBjb250ZXh0KTtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gUmVwb3J0VGFzayhyZWplY3Rpb24sIGNvbnRleHQpIHtcblx0XHRcdHRoaXMucmVqZWN0aW9uID0gcmVqZWN0aW9uO1xuXHRcdFx0dGhpcy5jb250ZXh0ID0gY29udGV4dDtcblx0XHR9XG5cblx0XHRSZXBvcnRUYXNrLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCF0aGlzLnJlamVjdGlvbi5oYW5kbGVkKSB7XG5cdFx0XHRcdHRoaXMucmVqZWN0aW9uLnJlcG9ydGVkID0gdHJ1ZTtcblx0XHRcdFx0UHJvbWlzZS5vblBvdGVudGlhbGx5VW5oYW5kbGVkUmVqZWN0aW9uKHRoaXMucmVqZWN0aW9uLCB0aGlzLmNvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBVbnJlcG9ydFRhc2socmVqZWN0aW9uKSB7XG5cdFx0XHR0aGlzLnJlamVjdGlvbiA9IHJlamVjdGlvbjtcblx0XHR9XG5cblx0XHRVbnJlcG9ydFRhc2sucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhpcy5yZWplY3Rpb24ucmVwb3J0ZWQpIHtcblx0XHRcdFx0UHJvbWlzZS5vblBvdGVudGlhbGx5VW5oYW5kbGVkUmVqZWN0aW9uSGFuZGxlZCh0aGlzLnJlamVjdGlvbik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIFVuaGFuZGxlZCByZWplY3Rpb24gaG9va3Ncblx0XHQvLyBCeSBkZWZhdWx0LCBldmVyeXRoaW5nIGlzIGEgbm9vcFxuXG5cdFx0Ly8gVE9ETzogQmV0dGVyIG5hbWVzOiBcImFubm90YXRlXCI/XG5cdFx0UHJvbWlzZS5jcmVhdGVDb250ZXh0XG5cdFx0XHQ9IFByb21pc2UuZW50ZXJDb250ZXh0XG5cdFx0XHQ9IFByb21pc2UuZXhpdENvbnRleHRcblx0XHRcdD0gUHJvbWlzZS5vblBvdGVudGlhbGx5VW5oYW5kbGVkUmVqZWN0aW9uXG5cdFx0XHQ9IFByb21pc2Uub25Qb3RlbnRpYWxseVVuaGFuZGxlZFJlamVjdGlvbkhhbmRsZWRcblx0XHRcdD0gUHJvbWlzZS5vbkZhdGFsUmVqZWN0aW9uXG5cdFx0XHQ9IG5vb3A7XG5cblx0XHQvLyBFcnJvcnMgYW5kIHNpbmdsZXRvbnNcblxuXHRcdHZhciBmb3JldmVyUGVuZGluZ0hhbmRsZXIgPSBuZXcgSGFuZGxlcigpO1xuXHRcdHZhciBmb3JldmVyUGVuZGluZ1Byb21pc2UgPSBuZXcgUHJvbWlzZShIYW5kbGVyLCBmb3JldmVyUGVuZGluZ0hhbmRsZXIpO1xuXG5cdFx0ZnVuY3Rpb24gY3ljbGUoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkKG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UgY3ljbGUnKSk7XG5cdFx0fVxuXG5cdFx0Ly8gVGFzayBydW5uZXJzXG5cblx0XHQvKipcblx0XHQgKiBSdW4gYSBzaW5nbGUgY29uc3VtZXJcblx0XHQgKiBAY29uc3RydWN0b3Jcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBDb250aW51YXRpb25UYXNrKGNvbnRpbnVhdGlvbiwgaGFuZGxlcikge1xuXHRcdFx0dGhpcy5jb250aW51YXRpb24gPSBjb250aW51YXRpb247XG5cdFx0XHR0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuXHRcdH1cblxuXHRcdENvbnRpbnVhdGlvblRhc2sucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5oYW5kbGVyLmpvaW4oKS53aGVuKHRoaXMuY29udGludWF0aW9uKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUnVuIGEgcXVldWUgb2YgcHJvZ3Jlc3MgaGFuZGxlcnNcblx0XHQgKiBAY29uc3RydWN0b3Jcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBQcm9ncmVzc1Rhc2sodmFsdWUsIGhhbmRsZXIpIHtcblx0XHRcdHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0UHJvZ3Jlc3NUYXNrLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBxID0gdGhpcy5oYW5kbGVyLmNvbnN1bWVycztcblx0XHRcdGlmKHEgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGZvciAodmFyIGMsIGkgPSAwOyBpIDwgcS5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHRjID0gcVtpXTtcblx0XHRcdFx0cnVuTm90aWZ5KGMucHJvZ3Jlc3MsIHRoaXMudmFsdWUsIHRoaXMuaGFuZGxlciwgYy5yZWNlaXZlciwgYy5yZXNvbHZlcik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEFzc2ltaWxhdGUgYSB0aGVuYWJsZSwgc2VuZGluZyBpdCdzIHZhbHVlIHRvIHJlc29sdmVyXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gdGhlblxuXHRcdCAqIEBwYXJhbSB7b2JqZWN0fGZ1bmN0aW9ufSB0aGVuYWJsZVxuXHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNvbHZlclxuXHRcdCAqIEBjb25zdHJ1Y3RvclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIEFzc2ltaWxhdGVUYXNrKHRoZW4sIHRoZW5hYmxlLCByZXNvbHZlcikge1xuXHRcdFx0dGhpcy5fdGhlbiA9IHRoZW47XG5cdFx0XHR0aGlzLnRoZW5hYmxlID0gdGhlbmFibGU7XG5cdFx0XHR0aGlzLnJlc29sdmVyID0gcmVzb2x2ZXI7XG5cdFx0fVxuXG5cdFx0QXNzaW1pbGF0ZVRhc2sucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGggPSB0aGlzLnJlc29sdmVyO1xuXHRcdFx0dHJ5QXNzaW1pbGF0ZSh0aGlzLl90aGVuLCB0aGlzLnRoZW5hYmxlLCBfcmVzb2x2ZSwgX3JlamVjdCwgX25vdGlmeSk7XG5cblx0XHRcdGZ1bmN0aW9uIF9yZXNvbHZlKHgpIHsgaC5yZXNvbHZlKHgpOyB9XG5cdFx0XHRmdW5jdGlvbiBfcmVqZWN0KHgpICB7IGgucmVqZWN0KHgpOyB9XG5cdFx0XHRmdW5jdGlvbiBfbm90aWZ5KHgpICB7IGgubm90aWZ5KHgpOyB9XG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIHRyeUFzc2ltaWxhdGUodGhlbiwgdGhlbmFibGUsIHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGVuLmNhbGwodGhlbmFibGUsIHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmVqZWN0KGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIE90aGVyIGhlbHBlcnNcblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSB7Kn0geFxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmZiB4IGlzIGEgdHJ1c3RlZCBQcm9taXNlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNQcm9taXNlKHgpIHtcblx0XHRcdHJldHVybiB4IGluc3RhbmNlb2YgUHJvbWlzZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUZXN0IGp1c3QgZW5vdWdoIHRvIHJ1bGUgb3V0IHByaW1pdGl2ZXMsIGluIG9yZGVyIHRvIHRha2UgZmFzdGVyXG5cdFx0ICogcGF0aHMgaW4gc29tZSBjb2RlXG5cdFx0ICogQHBhcmFtIHsqfSB4XG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59IGZhbHNlIGlmZiB4IGlzIGd1YXJhbnRlZWQgKm5vdCogdG8gYmUgYSB0aGVuYWJsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG1heWJlVGhlbmFibGUoeCkge1xuXHRcdFx0cmV0dXJuICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbicpICYmIHggIT09IG51bGw7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcnVuQ29udGludWF0aW9uMShmLCBoLCByZWNlaXZlciwgbmV4dCkge1xuXHRcdFx0aWYodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIG5leHQuYmVjb21lKGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRQcm9taXNlLmVudGVyQ29udGV4dChoKTtcblx0XHRcdHRyeUNhdGNoUmVqZWN0KGYsIGgudmFsdWUsIHJlY2VpdmVyLCBuZXh0KTtcblx0XHRcdFByb21pc2UuZXhpdENvbnRleHQoKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBydW5Db250aW51YXRpb24zKGYsIHgsIGgsIHJlY2VpdmVyLCBuZXh0KSB7XG5cdFx0XHRpZih0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gbmV4dC5iZWNvbWUoaCk7XG5cdFx0XHR9XG5cblx0XHRcdFByb21pc2UuZW50ZXJDb250ZXh0KGgpO1xuXHRcdFx0dHJ5Q2F0Y2hSZWplY3QzKGYsIHgsIGgudmFsdWUsIHJlY2VpdmVyLCBuZXh0KTtcblx0XHRcdFByb21pc2UuZXhpdENvbnRleHQoKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBydW5Ob3RpZnkoZiwgeCwgaCwgcmVjZWl2ZXIsIG5leHQpIHtcblx0XHRcdGlmKHR5cGVvZiBmICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiBuZXh0Lm5vdGlmeSh4KTtcblx0XHRcdH1cblxuXHRcdFx0UHJvbWlzZS5lbnRlckNvbnRleHQoaCk7XG5cdFx0XHR0cnlDYXRjaFJldHVybihmLCB4LCByZWNlaXZlciwgbmV4dCk7XG5cdFx0XHRQcm9taXNlLmV4aXRDb250ZXh0KCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJuIGYuY2FsbCh0aGlzQXJnLCB4KSwgb3IgaWYgaXQgdGhyb3dzIHJldHVybiBhIHJlamVjdGVkIHByb21pc2UgZm9yXG5cdFx0ICogdGhlIHRocm93biBleGNlcHRpb25cblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0cnlDYXRjaFJlamVjdChmLCB4LCB0aGlzQXJnLCBuZXh0KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRuZXh0LmJlY29tZShnZXRIYW5kbGVyKGYuY2FsbCh0aGlzQXJnLCB4KSkpO1xuXHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdG5leHQuYmVjb21lKG5ldyBSZWplY3RlZChlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2FtZSBhcyBhYm92ZSwgYnV0IGluY2x1ZGVzIHRoZSBleHRyYSBhcmd1bWVudCBwYXJhbWV0ZXIuXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdHJ5Q2F0Y2hSZWplY3QzKGYsIHgsIHksIHRoaXNBcmcsIG5leHQpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGYuY2FsbCh0aGlzQXJnLCB4LCB5LCBuZXh0KTtcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRuZXh0LmJlY29tZShuZXcgUmVqZWN0ZWQoZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJldHVybiBmLmNhbGwodGhpc0FyZywgeCksIG9yIGlmIGl0IHRocm93cywgKnJldHVybiogdGhlIGV4Y2VwdGlvblxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHRyeUNhdGNoUmV0dXJuKGYsIHgsIHRoaXNBcmcsIG5leHQpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5leHQubm90aWZ5KGYuY2FsbCh0aGlzQXJnLCB4KSk7XG5cdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0bmV4dC5ub3RpZnkoZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaW5oZXJpdChQYXJlbnQsIENoaWxkKSB7XG5cdFx0XHRDaGlsZC5wcm90b3R5cGUgPSBvYmplY3RDcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XG5cdFx0XHRDaGlsZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGlsZDtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBub29wKCkge31cblxuXHRcdHJldHVybiBQcm9taXNlO1xuXHR9O1xufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxNCBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuLyoqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXIgKi9cbi8qKiBAYXV0aG9yIEpvaG4gSGFubiAqL1xuXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbihyZXF1aXJlKSB7XG5cdC8qZ2xvYmFsIHNldFRpbWVvdXQsY2xlYXJUaW1lb3V0Ki9cblx0dmFyIGNqc1JlcXVpcmUsIHZlcnR4LCBzZXRUaW1lciwgY2xlYXJUaW1lcjtcblxuXHRjanNSZXF1aXJlID0gcmVxdWlyZTtcblxuXHR0cnkge1xuXHRcdHZlcnR4ID0gY2pzUmVxdWlyZSgndmVydHgnKTtcblx0XHRzZXRUaW1lciA9IGZ1bmN0aW9uIChmLCBtcykgeyByZXR1cm4gdmVydHguc2V0VGltZXIobXMsIGYpOyB9O1xuXHRcdGNsZWFyVGltZXIgPSB2ZXJ0eC5jYW5jZWxUaW1lcjtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHNldFRpbWVyID0gZnVuY3Rpb24oZiwgbXMpIHsgcmV0dXJuIHNldFRpbWVvdXQoZiwgbXMpOyB9O1xuXHRcdGNsZWFyVGltZXIgPSBmdW5jdGlvbih0KSB7IHJldHVybiBjbGVhclRpbWVvdXQodCk7IH07XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNldDogc2V0VGltZXIsXG5cdFx0Y2xlYXI6IGNsZWFyVGltZXJcblx0fTtcblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTQgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBQcm9taXNlcy9BKyBhbmQgd2hlbigpIGltcGxlbWVudGF0aW9uXG4gKiB3aGVuIGlzIHBhcnQgb2YgdGhlIGN1am9KUyBmYW1pbHkgb2YgbGlicmFyaWVzIChodHRwOi8vY3Vqb2pzLmNvbS8pXG4gKiBAYXV0aG9yIEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yIEpvaG4gSGFublxuICogQHZlcnNpb24gMy40LjNcbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24gKHJlcXVpcmUpIHtcblxuXHR2YXIgdGltZWQgPSByZXF1aXJlKCcuL2xpYi9kZWNvcmF0b3JzL3RpbWVkJyk7XG5cdHZhciBhcnJheSA9IHJlcXVpcmUoJy4vbGliL2RlY29yYXRvcnMvYXJyYXknKTtcblx0dmFyIGZsb3cgPSByZXF1aXJlKCcuL2xpYi9kZWNvcmF0b3JzL2Zsb3cnKTtcblx0dmFyIGZvbGQgPSByZXF1aXJlKCcuL2xpYi9kZWNvcmF0b3JzL2ZvbGQnKTtcblx0dmFyIGluc3BlY3QgPSByZXF1aXJlKCcuL2xpYi9kZWNvcmF0b3JzL2luc3BlY3QnKTtcblx0dmFyIGdlbmVyYXRlID0gcmVxdWlyZSgnLi9saWIvZGVjb3JhdG9ycy9pdGVyYXRlJyk7XG5cdHZhciBwcm9ncmVzcyA9IHJlcXVpcmUoJy4vbGliL2RlY29yYXRvcnMvcHJvZ3Jlc3MnKTtcblx0dmFyIHdpdGhUaGlzID0gcmVxdWlyZSgnLi9saWIvZGVjb3JhdG9ycy93aXRoJyk7XG5cdHZhciB1bmhhbmRsZWRSZWplY3Rpb24gPSByZXF1aXJlKCcuL2xpYi9kZWNvcmF0b3JzL3VuaGFuZGxlZFJlamVjdGlvbicpO1xuXHR2YXIgVGltZW91dEVycm9yID0gcmVxdWlyZSgnLi9saWIvVGltZW91dEVycm9yJyk7XG5cblx0dmFyIFByb21pc2UgPSBbYXJyYXksIGZsb3csIGZvbGQsIGdlbmVyYXRlLCBwcm9ncmVzcyxcblx0XHRpbnNwZWN0LCB3aXRoVGhpcywgdGltZWQsIHVuaGFuZGxlZFJlamVjdGlvbl1cblx0XHQucmVkdWNlKGZ1bmN0aW9uKFByb21pc2UsIGZlYXR1cmUpIHtcblx0XHRcdHJldHVybiBmZWF0dXJlKFByb21pc2UpO1xuXHRcdH0sIHJlcXVpcmUoJy4vbGliL1Byb21pc2UnKSk7XG5cblx0dmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5cdC8vIFB1YmxpYyBBUElcblxuXHR3aGVuLnByb21pc2UgICAgID0gcHJvbWlzZTsgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHBlbmRpbmcgcHJvbWlzZVxuXHR3aGVuLnJlc29sdmUgICAgID0gUHJvbWlzZS5yZXNvbHZlOyAgICAgIC8vIENyZWF0ZSBhIHJlc29sdmVkIHByb21pc2Vcblx0d2hlbi5yZWplY3QgICAgICA9IFByb21pc2UucmVqZWN0OyAgICAgICAvLyBDcmVhdGUgYSByZWplY3RlZCBwcm9taXNlXG5cblx0d2hlbi5saWZ0ICAgICAgICA9IGxpZnQ7ICAgICAgICAgICAgICAgICAvLyBsaWZ0IGEgZnVuY3Rpb24gdG8gcmV0dXJuIHByb21pc2VzXG5cdHdoZW5bJ3RyeSddICAgICAgPSBhdHRlbXB0OyAgICAgICAgICAgICAgLy8gY2FsbCBhIGZ1bmN0aW9uIGFuZCByZXR1cm4gYSBwcm9taXNlXG5cdHdoZW4uYXR0ZW1wdCAgICAgPSBhdHRlbXB0OyAgICAgICAgICAgICAgLy8gYWxpYXMgZm9yIHdoZW4udHJ5XG5cblx0d2hlbi5pdGVyYXRlICAgICA9IFByb21pc2UuaXRlcmF0ZTsgICAgICAvLyBHZW5lcmF0ZSBhIHN0cmVhbSBvZiBwcm9taXNlc1xuXHR3aGVuLnVuZm9sZCAgICAgID0gUHJvbWlzZS51bmZvbGQ7ICAgICAgIC8vIEdlbmVyYXRlIGEgc3RyZWFtIG9mIHByb21pc2VzXG5cblx0d2hlbi5qb2luICAgICAgICA9IGpvaW47ICAgICAgICAgICAgICAgICAvLyBKb2luIDIgb3IgbW9yZSBwcm9taXNlc1xuXG5cdHdoZW4uYWxsICAgICAgICAgPSBhbGw7ICAgICAgICAgICAgICAgICAgLy8gUmVzb2x2ZSBhIGxpc3Qgb2YgcHJvbWlzZXNcblx0d2hlbi5zZXR0bGUgICAgICA9IHNldHRsZTsgICAgICAgICAgICAgICAvLyBTZXR0bGUgYSBsaXN0IG9mIHByb21pc2VzXG5cblx0d2hlbi5hbnkgICAgICAgICA9IGxpZnQoUHJvbWlzZS5hbnkpOyAgICAvLyBPbmUtd2lubmVyIHJhY2Vcblx0d2hlbi5zb21lICAgICAgICA9IGxpZnQoUHJvbWlzZS5zb21lKTsgICAvLyBNdWx0aS13aW5uZXIgcmFjZVxuXHR3aGVuLnJhY2UgICAgICAgID0gbGlmdChQcm9taXNlLnJhY2UpOyAgIC8vIEZpcnN0LXRvLXNldHRsZSByYWNlXG5cblx0d2hlbi5tYXAgICAgICAgICA9IG1hcDsgICAgICAgICAgICAgICAgICAvLyBBcnJheS5tYXAoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5maWx0ZXIgICAgICA9IGZpbHRlcjsgICAgICAgICAgICAgICAvLyBBcnJheS5maWx0ZXIoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5yZWR1Y2UgICAgICA9IHJlZHVjZTsgICAgICAgICAgICAgICAvLyBBcnJheS5yZWR1Y2UoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5yZWR1Y2VSaWdodCA9IHJlZHVjZVJpZ2h0OyAgICAgICAgICAvLyBBcnJheS5yZWR1Y2VSaWdodCgpIGZvciBwcm9taXNlc1xuXG5cdHdoZW4uaXNQcm9taXNlTGlrZSA9IGlzUHJvbWlzZUxpa2U7ICAgICAgLy8gSXMgc29tZXRoaW5nIHByb21pc2UtbGlrZSwgYWthIHRoZW5hYmxlXG5cblx0d2hlbi5Qcm9taXNlICAgICA9IFByb21pc2U7ICAgICAgICAgICAgICAvLyBQcm9taXNlIGNvbnN0cnVjdG9yXG5cdHdoZW4uZGVmZXIgICAgICAgPSBkZWZlcjsgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEge3Byb21pc2UsIHJlc29sdmUsIHJlamVjdH0gdHVwbGVcblxuXHQvLyBFcnJvciB0eXBlc1xuXG5cdHdoZW4uVGltZW91dEVycm9yID0gVGltZW91dEVycm9yO1xuXG5cdC8qKlxuXHQgKiBHZXQgYSB0cnVzdGVkIHByb21pc2UgZm9yIHgsIG9yIGJ5IHRyYW5zZm9ybWluZyB4IHdpdGggb25GdWxmaWxsZWRcblx0ICpcblx0ICogQHBhcmFtIHsqfSB4XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBvbkZ1bGZpbGxlZCBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiB4IGlzXG5cdCAqICAgc3VjY2Vzc2Z1bGx5IGZ1bGZpbGxlZC4gIElmIHByb21pc2VPclZhbHVlIGlzIGFuIGltbWVkaWF0ZSB2YWx1ZSwgY2FsbGJhY2tcblx0ICogICB3aWxsIGJlIGludm9rZWQgaW1tZWRpYXRlbHkuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBvblJlamVjdGVkIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIHggaXNcblx0ICogICByZWplY3RlZC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IG9uUHJvZ3Jlc3MgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gcHJvZ3Jlc3MgdXBkYXRlc1xuXHQgKiAgIGFyZSBpc3N1ZWQgZm9yIHguIEBkZXByZWNhdGVkXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBhIG5ldyBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggdGhlIHJldHVyblxuXHQgKiAgIHZhbHVlIG9mIGNhbGxiYWNrIG9yIGVycmJhY2sgb3IgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgcHJvbWlzZU9yVmFsdWUgaWZcblx0ICogICBjYWxsYmFjayBhbmQvb3IgZXJyYmFjayBpcyBub3Qgc3VwcGxpZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiB3aGVuKHgsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG5cdFx0dmFyIHAgPSBQcm9taXNlLnJlc29sdmUoeCk7XG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcblx0XHRcdHJldHVybiBwO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gM1xuXHRcdFx0PyBwLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIGFyZ3VtZW50c1szXSlcblx0XHRcdDogcC50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IHByb21pc2Ugd2hvc2UgZmF0ZSBpcyBkZXRlcm1pbmVkIGJ5IHJlc29sdmVyLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlciBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QsIG5vdGlmeSlcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hvc2UgZmF0ZSBpcyBkZXRlcm1pbmUgYnkgcmVzb2x2ZXJcblx0ICovXG5cdGZ1bmN0aW9uIHByb21pc2UocmVzb2x2ZXIpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpZnQgdGhlIHN1cHBsaWVkIGZ1bmN0aW9uLCBjcmVhdGluZyBhIHZlcnNpb24gb2YgZiB0aGF0IHJldHVybnNcblx0ICogcHJvbWlzZXMsIGFuZCBhY2NlcHRzIHByb21pc2VzIGFzIGFyZ3VtZW50cy5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gZlxuXHQgKiBAcmV0dXJucyB7RnVuY3Rpb259IHZlcnNpb24gb2YgZiB0aGF0IHJldHVybnMgcHJvbWlzZXNcblx0ICovXG5cdGZ1bmN0aW9uIGxpZnQoZikge1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBfYXBwbHkoZiwgdGhpcywgc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGwgZiBpbiBhIGZ1dHVyZSB0dXJuLCB3aXRoIHRoZSBzdXBwbGllZCBhcmdzLCBhbmQgcmV0dXJuIGEgcHJvbWlzZVxuXHQgKiBmb3IgdGhlIHJlc3VsdC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gZlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIGF0dGVtcHQoZiAvKiwgYXJncy4uLiAqLykge1xuXHRcdC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG5cdFx0cmV0dXJuIF9hcHBseShmLCB0aGlzLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIHRyeS9saWZ0IGhlbHBlciB0aGF0IGFsbG93cyBzcGVjaWZ5aW5nIHRoaXNBcmdcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9hcHBseShmLCB0aGlzQXJnLCBhcmdzKSB7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFyZ3MpLnRoZW4oZnVuY3Rpb24oYXJncykge1xuXHRcdFx0cmV0dXJuIGYuYXBwbHkodGhpc0FyZywgYXJncyk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHtwcm9taXNlLCByZXNvbHZlcn0gcGFpciwgZWl0aGVyIG9yIGJvdGggb2Ygd2hpY2hcblx0ICogbWF5IGJlIGdpdmVuIG91dCBzYWZlbHkgdG8gY29uc3VtZXJzLlxuXHQgKiBAcmV0dXJuIHt7cHJvbWlzZTogUHJvbWlzZSwgcmVzb2x2ZTogZnVuY3Rpb24sIHJlamVjdDogZnVuY3Rpb24sIG5vdGlmeTogZnVuY3Rpb259fVxuXHQgKi9cblx0ZnVuY3Rpb24gZGVmZXIoKSB7XG5cdFx0cmV0dXJuIG5ldyBEZWZlcnJlZCgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gRGVmZXJyZWQoKSB7XG5cdFx0dmFyIHAgPSBQcm9taXNlLl9kZWZlcigpO1xuXG5cdFx0ZnVuY3Rpb24gcmVzb2x2ZSh4KSB7IHAuX2hhbmRsZXIucmVzb2x2ZSh4KTsgfVxuXHRcdGZ1bmN0aW9uIHJlamVjdCh4KSB7IHAuX2hhbmRsZXIucmVqZWN0KHgpOyB9XG5cdFx0ZnVuY3Rpb24gbm90aWZ5KHgpIHsgcC5faGFuZGxlci5ub3RpZnkoeCk7IH1cblxuXHRcdHRoaXMucHJvbWlzZSA9IHA7XG5cdFx0dGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcblx0XHR0aGlzLnJlamVjdCA9IHJlamVjdDtcblx0XHR0aGlzLm5vdGlmeSA9IG5vdGlmeTtcblx0XHR0aGlzLnJlc29sdmVyID0geyByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCwgbm90aWZ5OiBub3RpZnkgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIGlmIHggaXMgcHJvbWlzZS1saWtlLCBpLmUuIGEgdGhlbmFibGUgb2JqZWN0XG5cdCAqIE5PVEU6IFdpbGwgcmV0dXJuIHRydWUgZm9yICphbnkgdGhlbmFibGUgb2JqZWN0KiwgYW5kIGlzbid0IHRydWx5XG5cdCAqIHNhZmUsIHNpbmNlIGl0IG1heSBhdHRlbXB0IHRvIGFjY2VzcyB0aGUgYHRoZW5gIHByb3BlcnR5IG9mIHggKGkuZS5cblx0ICogIGNsZXZlci9tYWxpY2lvdXMgZ2V0dGVycyBtYXkgZG8gd2VpcmQgdGhpbmdzKVxuXHQgKiBAcGFyYW0geyp9IHggYW55dGhpbmdcblx0ICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgeCBpcyBwcm9taXNlLWxpa2Vcblx0ICovXG5cdGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UoeCkge1xuXHRcdHJldHVybiB4ICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvbmx5IG9uY2UgYWxsIHRoZSBzdXBwbGllZCBhcmd1bWVudHNcblx0ICogaGF2ZSByZXNvbHZlZC4gVGhlIHJlc29sdXRpb24gdmFsdWUgb2YgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSBhbiBhcnJheVxuXHQgKiBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIHZhbHVlcyBvZiBlYWNoIG9mIHRoZSBhcmd1bWVudHMuXG5cdCAqIEBwYXJhbSB7Li4uKn0gYXJndW1lbnRzIG1heSBiZSBhIG1peCBvZiBwcm9taXNlcyBhbmQgdmFsdWVzXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gam9pbigvKiAuLi5wcm9taXNlcyAqLykge1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChhcmd1bWVudHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIHByb21pc2UgdGhhdCB3aWxsIGZ1bGZpbGwgb25jZSBhbGwgaW5wdXQgcHJvbWlzZXMgaGF2ZVxuXHQgKiBmdWxmaWxsZWQsIG9yIHJlamVjdCB3aGVuIGFueSBvbmUgaW5wdXQgcHJvbWlzZSByZWplY3RzLlxuXHQgKiBAcGFyYW0ge2FycmF5fFByb21pc2V9IHByb21pc2VzIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgcHJvbWlzZXNcblx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdCAqL1xuXHRmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcblx0XHRyZXR1cm4gd2hlbihwcm9taXNlcywgUHJvbWlzZS5hbGwpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIHByb21pc2UgdGhhdCB3aWxsIGFsd2F5cyBmdWxmaWxsIHdpdGggYW4gYXJyYXkgY29udGFpbmluZ1xuXHQgKiB0aGUgb3V0Y29tZSBzdGF0ZXMgb2YgYWxsIGlucHV0IHByb21pc2VzLiAgVGhlIHJldHVybmVkIHByb21pc2Vcblx0ICogd2lsbCBvbmx5IHJlamVjdCBpZiBgcHJvbWlzZXNgIGl0c2VsZiBpcyBhIHJlamVjdGVkIHByb21pc2UuXG5cdCAqIEBwYXJhbSB7YXJyYXl8UHJvbWlzZX0gcHJvbWlzZXMgYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiBwcm9taXNlc1xuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSBmb3IgYXJyYXkgb2Ygc2V0dGxlZCBzdGF0ZSBkZXNjcmlwdG9yc1xuXHQgKi9cblx0ZnVuY3Rpb24gc2V0dGxlKHByb21pc2VzKSB7XG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZXMsIFByb21pc2Uuc2V0dGxlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9taXNlLWF3YXJlIGFycmF5IG1hcCBmdW5jdGlvbiwgc2ltaWxhciB0byBgQXJyYXkucHJvdG90eXBlLm1hcCgpYCxcblx0ICogYnV0IGlucHV0IGFycmF5IG1heSBjb250YWluIHByb21pc2VzIG9yIHZhbHVlcy5cblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBwcm9taXNlcyBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHg6KiwgaW5kZXg6TnVtYmVyKToqfSBtYXBGdW5jIG1hcCBmdW5jdGlvbiB3aGljaCBtYXlcblx0ICogIHJldHVybiBhIHByb21pc2Ugb3IgdmFsdWVcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgdGhhdCB3aWxsIGZ1bGZpbGwgd2l0aCBhbiBhcnJheSBvZiBtYXBwZWQgdmFsdWVzXG5cdCAqICBvciByZWplY3QgaWYgYW55IGlucHV0IHByb21pc2UgcmVqZWN0cy5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChwcm9taXNlcywgbWFwRnVuYykge1xuXHRcdHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbihwcm9taXNlcykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UubWFwKHByb21pc2VzLCBtYXBGdW5jKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgdGhlIHByb3ZpZGVkIGFycmF5IG9mIHByb21pc2VzIHVzaW5nIHRoZSBwcm92aWRlZCBwcmVkaWNhdGUuICBJbnB1dCBtYXlcblx0ICogY29udGFpbiBwcm9taXNlcyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZXMgYXJyYXkgb2YgcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHg6KiwgaW5kZXg6TnVtYmVyKTpib29sZWFufSBwcmVkaWNhdGUgZmlsdGVyaW5nIHByZWRpY2F0ZS5cblx0ICogIE11c3QgcmV0dXJuIHRydXRoeSAob3IgcHJvbWlzZSBmb3IgdHJ1dGh5KSBmb3IgaXRlbXMgdG8gcmV0YWluLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IHdpbGwgZnVsZmlsbCB3aXRoIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIGl0ZW1zXG5cdCAqICBmb3Igd2hpY2ggcHJlZGljYXRlIHJldHVybmVkIHRydXRoeS5cblx0ICovXG5cdGZ1bmN0aW9uIGZpbHRlcihwcm9taXNlcywgcHJlZGljYXRlKSB7XG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uKHByb21pc2VzKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5maWx0ZXIocHJvbWlzZXMsIHByZWRpY2F0ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJhZGl0aW9uYWwgcmVkdWNlIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUucmVkdWNlKClgLCBidXRcblx0ICogaW5wdXQgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kL29yIHZhbHVlcywgYW5kIHJlZHVjZUZ1bmNcblx0ICogbWF5IHJldHVybiBlaXRoZXIgYSB2YWx1ZSBvciBhIHByb21pc2UsICphbmQqIGluaXRpYWxWYWx1ZSBtYXlcblx0ICogYmUgYSBwcm9taXNlIGZvciB0aGUgc3RhcnRpbmcgdmFsdWUuXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZXMgYXJyYXkgb3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgYW55dGhpbmcsXG5cdCAqICAgICAgbWF5IGNvbnRhaW4gYSBtaXggb2YgcHJvbWlzZXMgYW5kIHZhbHVlcy5cblx0ICogQHBhcmFtIHtmdW5jdGlvbihhY2N1bXVsYXRlZDoqLCB4OiosIGluZGV4Ok51bWJlcik6Kn0gZiByZWR1Y2UgZnVuY3Rpb25cblx0ICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSBmaW5hbCByZWR1Y2VkIHZhbHVlXG5cdCAqL1xuXHRmdW5jdGlvbiByZWR1Y2UocHJvbWlzZXMsIGYgLyosIGluaXRpYWxWYWx1ZSAqLykge1xuXHRcdC8qanNoaW50IHVudXNlZDpmYWxzZSovXG5cdFx0dmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uKGFycmF5KSB7XG5cdFx0XHRhcmdzLnVuc2hpZnQoYXJyYXkpO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVkdWNlLmFwcGx5KFByb21pc2UsIGFyZ3MpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyYWRpdGlvbmFsIHJlZHVjZSBmdW5jdGlvbiwgc2ltaWxhciB0byBgQXJyYXkucHJvdG90eXBlLnJlZHVjZVJpZ2h0KClgLCBidXRcblx0ICogaW5wdXQgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kL29yIHZhbHVlcywgYW5kIHJlZHVjZUZ1bmNcblx0ICogbWF5IHJldHVybiBlaXRoZXIgYSB2YWx1ZSBvciBhIHByb21pc2UsICphbmQqIGluaXRpYWxWYWx1ZSBtYXlcblx0ICogYmUgYSBwcm9taXNlIGZvciB0aGUgc3RhcnRpbmcgdmFsdWUuXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZXMgYXJyYXkgb3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgYW55dGhpbmcsXG5cdCAqICAgICAgbWF5IGNvbnRhaW4gYSBtaXggb2YgcHJvbWlzZXMgYW5kIHZhbHVlcy5cblx0ICogQHBhcmFtIHtmdW5jdGlvbihhY2N1bXVsYXRlZDoqLCB4OiosIGluZGV4Ok51bWJlcik6Kn0gZiByZWR1Y2UgZnVuY3Rpb25cblx0ICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSBmaW5hbCByZWR1Y2VkIHZhbHVlXG5cdCAqL1xuXHRmdW5jdGlvbiByZWR1Y2VSaWdodChwcm9taXNlcywgZiAvKiwgaW5pdGlhbFZhbHVlICovKSB7XG5cdFx0Lypqc2hpbnQgdW51c2VkOmZhbHNlKi9cblx0XHR2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblx0XHRyZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24oYXJyYXkpIHtcblx0XHRcdGFyZ3MudW5zaGlmdChhcnJheSk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWR1Y2VSaWdodC5hcHBseShQcm9taXNlLCBhcmdzKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB3aGVuO1xufSk7XG59KSh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUgOiBmdW5jdGlvbiAoZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSk7IH0pO1xuIl19
