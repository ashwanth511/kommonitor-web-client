(function (window) {
  window.__env = window.__env || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = true;

  // API url
  // window.__env.apiUrl = 'http://kommonitor.fbg-hsbo.de/';
  window.__env.apiUrl = 'http://localhost:8085/';
  // Base url
  window.__env.basePath = 'management';
  window.__env.targetUrlToProcessingEngine = 'http://localhost:8086/processing/script-engine/customizableIndicatorComputation';
  window.__env.targetUrlToReachabilityService = 'http://localhost:8088/otp/routers/current';



  window.__env.indicatorDatePrefix = "DATE_";

  window.__env.numberOfDecimals = 4;

  window.__env.initialLatitude = 51.4386432;
  window.__env.initialLongitude = 7.0115552;
  window.__env.initialZoomLevel = 12;
  window.__env.minZoomLevel = 1;
  window.__env.maxZoomLevel = 19;

  window.__env.defaultColorForZeroValues = "black";
  window.__env.defaultBorderColor = "black";
  window.__env.defaultColorForFilteredValues = "#a6a6a6";
  window.__env.defaultBorderColorForFilteredValues = "black";
  window.__env.defaultFillOpacity = "0.8";
  window.__env.defaultFillOpacityForFilteredFeatures = "0.7";
  window.__env.defaultFillOpacityForHighlightedFeatures = "0.95";
  //allowesValues: equal_interval, quantile, jenks
  window.__env.defaultClassifyMethod = "jenks";



}(this));
