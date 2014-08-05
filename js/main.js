var L = require('leaflet');

document.addEventListener('DOMContentLoaded', function(){
    var map = L.map('map').setView([30.267153, -97.743061], 12);

    L.Icon.Default.imagePath = 'http://api.tiles.mapbox.com/mapbox.js/v1.0.0beta0.0/images';

    L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
        attribution: '<a href="http://www.mapquest.com/">Tiles</a> | <a href="http://openstreetmap.org">Map data</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">contributors</a>',
        subdomains: '1234'
    }).addTo(map);

    L.circleMarker([30.267153, -97.743061]).addTo(map)
        .bindPopup('Meow')
        .openPopup();
});
