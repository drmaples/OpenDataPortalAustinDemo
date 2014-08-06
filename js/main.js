var App = require('./app');

var app = window.app = new App();
document.addEventListener('DOMContentLoaded', function(){
    app.start();
});
