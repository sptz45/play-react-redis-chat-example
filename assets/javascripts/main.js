
var Router = require('./Router');

document.addEventListener('DOMContentLoaded', function() {
    Router('content').navigateToHome(window.location.pathname);
});

