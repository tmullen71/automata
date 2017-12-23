(function (app) {
  'use strict';

  // Start by defining the main module and adding the module dependencies
  angular
    .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular
    .module(app.applicationModuleName)
    .config(bootstrapConfig);

  bootstrapConfig.$inject = ['$compileProvider', '$locationProvider', '$httpProvider', '$logProvider'];

  function bootstrapConfig($compileProvider, $locationProvider, $httpProvider, $logProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    }).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');

    // Disable debug data for production environment
    // @link https://docs.angularjs.org/guide/production
    // $compileProvider.debugInfoEnabled(app.applicationEnvironment !== 'production');
    // Unfortunately, debug data must be enabled in order to access the scope of a
    // DOM element, which is necessary to open the modal window from cytoscape
    // edgehandles. Until a better solution exists, we have to leave debug info enabled.
    // https://github.com/angular/angular.js/issues/9515
    $compileProvider.debugInfoEnabled(true);
  }


  // Then define the init function for starting up the application
  // TODO: upon refreshing the page in edit mode (which shouldn't have to be done but is a use case nonetheless)
  // app attempts to bootstrap angular twice. App will still crash in this case due to an issue in automatonGraph.
  // In the meantime, when refreshing the app just go back to the main page
  if (angular.element(document).data().$injector === undefined) { // added this conditional to suppress re-bootstrap error
    angular.element(document).ready(init);
    function init() {
      // Fixing facebook bug with redirect
      if (window.location.hash && window.location.hash === '#_=_') {
        if (window.history && history.pushState) {
          window.history.pushState('', document.title, window.location.pathname);
        } else {
          // Prevent scrolling by storing the page's current scroll offset
          var scroll = {
            top: document.body.scrollTop,
            left: document.body.scrollLeft
          };
          window.location.hash = '';
          // Restore the scroll offset, should be flicker free
          document.body.scrollTop = scroll.top;
          document.body.scrollLeft = scroll.left;
        }
      }
      // Then init the app
      angular.bootstrap(document, [app.applicationModuleName]);
    }
  }
}(ApplicationConfiguration));
