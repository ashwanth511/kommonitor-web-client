angular.module('kommonitorMap').component(
  'kommonitorMap',
  {
    templateUrl: "components/kommonitorUserInterface/kommonitorMap/kommonitor-map.template.html",
    controller: [
      '$rootScope',
      '$http',
      '$scope',
      '$timeout',
      'kommonitorMapService',
      'kommonitorDataExchangeService',
      'kommonitorVisualStyleHelperService',
      'kommonitorInfoLegendHelperService',
      '__env',
      function MapController($rootScope, $http, $scope, $timeout, kommonitorMapService, kommonitorDataExchangeService, kommonitorVisualStyleHelperService, kommonitorInfoLegendHelperService, __env) {

        const INDICATOR_DATE_PREFIX = __env.indicatorDatePrefix;
        const numberOfDecimals = __env.numberOfDecimals;
        var defaultColorForFilteredValues = __env.defaultColorForFilteredValues;
        var defaultBorderColorForFilteredValues = __env.defaultBorderColorForFilteredValues;
        var defaultBorderColor = __env.defaultBorderColor;
        var defaultFillOpacity = __env.defaultFillOpacity;
        var defaultFillOpacityForFilteredFeatures = __env.defaultFillOpacityForFilteredFeatures;
        var defaultFillOpacityForHighlightedFeatures = __env.defaultFillOpacityForHighlightedFeatures;
        var defaultFillOpacityForZeroFeatures = __env.defaultFillOpacityForZeroFeatures;
        var defaultColorBrewerPaletteForBalanceIncreasingValues = __env.defaultColorBrewerPaletteForBalanceIncreasingValues;
        var defaultColorBrewerPaletteForBalanceDecreasingValues = __env.defaultColorBrewerPaletteForBalanceDecreasingValues;
        var defaultColorBrewerPaletteForGtMovValues = __env.defaultColorBrewerPaletteForGtMovValues;
        var defaultColorBrewerPaletteForLtMovValues = __env.defaultColorBrewerPaletteForLtMovValues;
        var defaultColorForHoveredFeatures = __env.defaultColorForHoveredFeatures;
        var defaultColorForClickedFeatures = __env.defaultColorForClickedFeatures;
        var defaultBorderColorForNoDataValues = __env.defaultBorderColorForNoDataValues;
        var defaultColorForNoDataValues = __env.defaultColorForNoDataValues;
        var defaultFillOpacityForNoDataValues = __env.defaultFillOpacityForNoDataValues;


        var defaultColorForOutliers_high = __env.defaultColorForOutliers_high;
        var defaultBorderColorForOutliers_high = __env.defaultBorderColorForOutliers_high;
        var defaultFillOpacityForOutliers_high = __env.defaultFillOpacityForOutliers_high;
        var defaultColorForOutliers_low = __env.defaultColorForOutliers_low;
        var defaultBorderColorForOutliers_low = __env.defaultBorderColorForOutliers_low;
        var defaultFillOpacityForOutliers_low = __env.defaultFillOpacityForOutliers_low;
        var useOutlierDetectionOnIndicator = __env.useOutlierDetectionOnIndicator;

        const outlierPropertyName = "outlier";
        const outlierPropertyValue_high_soft = "high-soft";
        const outlierPropertyValue_low_soft = "low-soft";
        const outlierPropertyValue_high_extreme = "high-extreme";
        const outlierPropertyValue_low_extreme = "low-extreme";
        const outlierPropertyValue_no = "no";

        $scope.containsOutliers_high = false;
        $scope.containsOutliers_low = false;
        $scope.outliers_high = undefined;
        $scope.outliers_low = undefined;
        kommonitorDataExchangeService.useOutlierDetectionOnIndicator = useOutlierDetectionOnIndicator;

        $scope.svgString_outlierLow = '<svg height="18" width="18"><line x1="10" y1="0" x2="110" y2="100" style="stroke:' + defaultColorForOutliers_low + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_low + ';" /><line x1="0" y1="0" x2="100" y2="100" style="stroke:' + defaultColorForOutliers_low + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_low + ';" /><line x1="0" y1="10" x2="100" y2="110" style="stroke:' + defaultColorForOutliers_low + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_low + ';" />Sorry, your browser does not support inline SVG.</svg>';
        $scope.svgString_outlierHigh = '<svg height="18" width="18"><line x1="8" y1="18" x2="18" y2="8" style="stroke:' + defaultColorForOutliers_high + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_high + ';" /><line x1="0" y1="18" x2="18" y2="0" style="stroke:' + defaultColorForOutliers_high + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_high + ';" /><line x1="0" y1="10" x2="10" y2="0" style="stroke:' + defaultColorForOutliers_high + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_high + ';" />Sorry, your browser does not support inline SVG.</svg>';

        $scope.showOutlierInfoAlert = false;



        $scope.drawnPointFeatures = undefined;
        $scope.drawPointControl = undefined;

        const MultipleResultsLeafletSearch = L.Control.Search.extend({

          _makeUniqueKey: function (featureName, featureId) {
            return featureName + " (Name) - " + featureId + " (ID)";
          },

          _searchInLayer: function (layer, retRecords, propName) {
            var self = this, loc;
            var key_withUniqueID;

            if (layer instanceof L.Control.Search.Marker) return;

            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
              if (self._getPath(layer.options, propName)) {
                loc = layer.getLatLng();
                loc.layer = layer;
                retRecords[self._getPath(layer.options, propName)] = loc;
              }
              else if (self._getPath(layer.feature.properties, propName)) {
                loc = layer.getLatLng();
                loc.layer = layer;
                key_withUniqueID = this._makeUniqueKey(self._getPath(layer.feature.properties, propName), layer.feature.properties.ID);
                retRecords[key_withUniqueID] = loc;
              }
              else {
                //throw new Error("propertyName '"+propName+"' not found in marker");
                console.warn("propertyName '" + propName + "' not found in marker");
              }
            }
            else if (layer instanceof L.Path || layer instanceof L.Polyline || layer instanceof L.Polygon) {
              if (self._getPath(layer.options, propName)) {
                loc = layer.getBounds().getCenter();
                loc.layer = layer;
                retRecords[self._getPath(layer.options, propName)] = loc;
              }
              else if (self._getPath(layer.feature.properties, propName)) {
                loc = layer.getBounds().getCenter();
                loc.layer = layer;
                key_withUniqueID = this._makeUniqueKey(self._getPath(layer.feature.properties, propName), layer.feature.properties.ID);
                retRecords[key_withUniqueID] = loc;
              }
              else {
                //throw new Error("propertyName '"+propName+"' not found in shape");
                console.warn("propertyName '" + propName + "' not found in shape");
              }
            }
            else if (layer.hasOwnProperty('feature'))//GeoJSON
            {
              if (layer.feature.properties.hasOwnProperty(propName)) {

                key_withUniqueID = this._makeUniqueKey(self._getPath(layer.feature.properties, propName), layer.feature.properties.ID);
                if (layer.getLatLng && typeof layer.getLatLng === 'function') {
                  loc = layer.getLatLng();
                  loc.layer = layer;
                  retRecords[key_withUniqueID] = loc;
                } else if (layer.getBounds && typeof layer.getBounds === 'function') {
                  loc = layer.getBounds().getCenter();
                  loc.layer = layer;
                  retRecords[key_withUniqueID] = loc;
                } else {
                  console.warn("Unknown type of Layer");
                }
              }
              else {
                //throw new Error("propertyName '"+propName+"' not found in feature");
                console.warn("propertyName '" + propName + "' not found in feature");
              }
            }
            else if (layer instanceof L.LayerGroup) {
              layer.eachLayer(function (layer) {
                self._searchInLayer(layer, retRecords, propName);
              });
            }
          },
          _defaultMoveToLocation: function (latlng, title, map) {
            if (this.options.zoom)
              this._map.setView(latlng, this.options.zoom);
            else
              this._map.panTo(latlng);

            // add collapse after click on item
            this.collapse();
          },
          _handleAutoresize: function () {
            var maxWidth;

            if (!this._map) {
              this._map = $scope.map;
            }

            if (this._input.style.maxWidth !== this._map._container.offsetWidth) {
              maxWidth = this._map._container.clientWidth;

              // other side margin + padding + width border + width search-button + width search-cancel
              maxWidth -= 10 + 20 + 1 + 30 + 22;

              this._input.style.maxWidth = maxWidth.toString() + 'px';
            }

            if (this.options.autoResize && (this._container.offsetWidth + 20 < this._map._container.offsetWidth)) {
              this._input.size = this._input.value.length < this._inputMinSize ? this._inputMinSize : this._input.value.length;
            }
          }
        });

        $scope.onCloseOutlierAlert = function () {
          // $("#outlierInfo").hide();
          $scope.showOutlierInfoAlert = false;
        };


        var refreshNoDataStyle = function () {

          $scope.currentIndicatorContainsNoDataValues = false;
          $scope.svgString_noData = '<svg height="18" width="18">' +
            '<circle style="stroke-opacity: ' + defaultFillOpacityForNoDataValues + ';" cx="4" cy="4" r="1.5" stroke="' + defaultBorderColorForNoDataValues + '" stroke-width="2" fill="' + defaultColorForNoDataValues + '" />' +
            '<circle style="stroke-opacity: ' + defaultFillOpacityForNoDataValues + ';" cx="14" cy="4" r="1.5" stroke="' + defaultBorderColorForNoDataValues + '" stroke-width="2" fill="' + defaultColorForNoDataValues + '" />' +
            '<circle style="stroke-opacity: ' + defaultFillOpacityForNoDataValues + ';" cx="4" cy="14" r="1.5" stroke="' + defaultBorderColorForNoDataValues + '" stroke-width="2" fill="' + defaultColorForNoDataValues + '" />' +
            '<circle style="stroke-opacity: ' + defaultFillOpacityForNoDataValues + ';" cx="14" cy="14" r="1.5" stroke="' + defaultBorderColorForNoDataValues + '" stroke-width="2" fill="' + defaultColorForNoDataValues + '" />' +
            'Sorry, your browser does not support inline SVG.</svg>';

          $scope.noDataStyle = kommonitorVisualStyleHelperService.noDataStyle;
        };

        var refreshOutliersStyle = function () {

          $scope.containsOutliers_high = false;
          $scope.containsOutliers_low = false;
          $scope.outlierMinValue = undefined;
          $scope.outlierMaxValue = undefined;
          $scope.showOutlierInfoAlert = false;

          $scope.svgString_outlierLow = '<svg height="18" width="18"><line x1="10" y1="0" x2="110" y2="100" style="stroke:' + defaultColorForOutliers_low + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_low + ';" /><line x1="0" y1="0" x2="100" y2="100" style="stroke:' + defaultColorForOutliers_low + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_low + ';" /><line x1="0" y1="10" x2="100" y2="110" style="stroke:' + defaultColorForOutliers_low + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_low + ';" />Sorry, your browser does not support inline SVG.</svg>';
          $scope.svgString_outlierHigh = '<svg height="18" width="18"><line x1="8" y1="18" x2="18" y2="8" style="stroke:' + defaultColorForOutliers_high + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_high + ';" /><line x1="0" y1="18" x2="18" y2="0" style="stroke:' + defaultColorForOutliers_high + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_high + ';" /><line x1="0" y1="10" x2="10" y2="0" style="stroke:' + defaultColorForOutliers_high + ';stroke-width:2; stroke-opacity: ' + defaultFillOpacityForOutliers_high + ';" />Sorry, your browser does not support inline SVG.</svg>';

          // if ($scope.useTransparencyOnIndicator) {
          //   fillOpacity_high = defaultFillOpacityForOutliers_high;
          //   fillOpacity_low = defaultFillOpacityForOutliers_low;
          // }

          $scope.outlierStyle_high = kommonitorVisualStyleHelperService.outlierStyle_high;

          $scope.outlierStyle_low = kommonitorVisualStyleHelperService.outlierStyle_low;
        };

        $scope.useTransparencyOnIndicator = __env.useTransparencyOnIndicator;

        //allowesValues: equal_interval, quantile, jenks
        $scope.classifyMethods = [{
          name: "Jenks",
          value: "jenks"
        }, {
          name: "Gleiches Intervall",
          value: "equal_interval"
        }, {
          name: "Quantile",
          value: "quantile"
        }];

        // updateInterval (from kommonitor data management api) = ['ARBITRARY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']
        $scope.updateInterval = new Map();
        $scope.updateInterval.set("ARBITRARY", "beliebig");
        $scope.updateInterval.set("YEARLY", "jährlich");
        $scope.updateInterval.set("HALF_YEARLY", "halbjährig");
        $scope.updateInterval.set("MONTHLY", "monatlich");
        $scope.updateInterval.set("QUARTERLY", "vierteljährlich");

        $scope.classifyMethod = __env.defaultClassifyMethod || "jenks";

        $scope.filteredStyle = kommonitorVisualStyleHelperService.filteredStyle;

        var refreshFilteredStyle = function () {

          $scope.filteredStyle = kommonitorVisualStyleHelperService.filteredStyle;
        };

        this.kommonitorMapServiceInstance = kommonitorMapService;
        this.kommonitorDataExchangeServiceInstance = kommonitorDataExchangeService;
        $scope.inputLayerCounter = 0;

        $scope.latCenter = __env.initialLatitude;
        $scope.lonCenter = __env.initialLongitude;
        $scope.zoomLevel = __env.initialZoomLevel;

        $scope.loadingData = true;

        $scope.drawnItems = new L.FeatureGroup();
        $scope.drawControl = undefined;

        $scope.allDrawingToolsEnabled = false;
        $scope.date = undefined;

        // central map object
        $scope.map = undefined;
        $scope.scaleBar = undefined;
        $scope.layerControl = undefined;
        $scope.showInfoControl = true;
        $scope.showLegendControl = true;
        $scope.showLegend = true;
        $scope.overlays = new Array();
        $scope.baseMaps = new Array();
        $scope.baseMapLayers = new L.LayerGroup();
        const spatialUnitLayerGroupName = "Raumeinheiten";
        const georesourceLayerGroupName = "Georessourcen";
        const poiLayerGroupName = "Points of Interest";
        const loiLayerGroupName = "Lines of Interest";
        const aoiLayerGroupName = "Areas of Interest";
        const indicatorLayerGroupName = "Indikatoren";
        const reachabilityLayerGroupName = "Erreichbarkeiten";
        const wmsLayerGroupName = "Web Map Services (WMS)";
        const wfsLayerGroupName = "Web Feature Services (WFS)";
        const fileLayerGroupName = "Dateilayer";

        // create classyBrew object
        $scope.defaultBrew = new classyBrew();
        $scope.gtMeasureOfValueBrew = new classyBrew();
        $scope.ltMeasureOfValueBrew = new classyBrew();

        $scope.currentIndicatorMetadataAndGeoJSON;
        $scope.currentGeoJSONOfCurrentLayer;
        $scope.currentIndicatorContainsZeroValues = false;
        $scope.currentIndicatorContainsNoDataValues = false;
        $scope.indicatorTypeOfCurrentLayer;
        $scope.defaultColorForZeroValues = __env.defaultColorForZeroValues;

        $scope.customIndicatorPropertyName;
        $scope.customIndicatorName;
        $scope.customIndicatorUnit;

        $scope.currentCustomIndicatorLayerOfCurrentLayer;
        $scope.customPropertyName;

        $scope.currentCustomIndicatorLayer;
        $scope.isochronesLayer = undefined;
        $scope.isochroneMarkerLayer = undefined;

        /*
         * L.TileLayer.Grayscale is a regular tilelayer with grayscale makeover.
         */

        L.TileLayer.Grayscale = L.TileLayer.extend({
          options: {
            quotaRed: 21,
            quotaGreen: 71,
            quotaBlue: 8,
            quotaDividerTune: 0,
            quotaDivider: function () {
              return this.quotaRed + this.quotaGreen + this.quotaBlue + this.quotaDividerTune;
            }
          },

          initialize: function (url, options) {
            options = options || {};
            options.crossOrigin = true;
            L.TileLayer.prototype.initialize.call(this, url, options);

            this.on('tileload', function (e) {
              this._makeGrayscale(e.tile);
            });
          },

          _createTile: function () {
            var tile = L.TileLayer.prototype._createTile.call(this);
            tile.crossOrigin = "Anonymous";
            return tile;
          },

          _makeGrayscale: function (img) {
            if (img.getAttribute('data-grayscaled'))
              return;

            img.crossOrigin = '';
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var pix = imgd.data;
            for (var i = 0, n = pix.length; i < n; i += 4) {
              pix[i] = pix[i + 1] = pix[i + 2] = (this.options.quotaRed * pix[i] + this.options.quotaGreen * pix[i + 1] + this.options.quotaBlue * pix[i + 2]) / this.options.quotaDivider();
            }
            ctx.putImageData(imgd, 0, 0);
            img.setAttribute('data-grayscaled', true);
            img.src = canvas.toDataURL();
          }
        });

        L.tileLayer.grayscale = function (url, options) {
          return new L.TileLayer.Grayscale(url, options);
        };

        this.initializeMap = function () {

          $scope.loadingData = true;

          // initialize map referring to div element with id="map"


          // create OSM tile layer with correct attribution
          var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
          var osm = new L.TileLayer(osmUrl, { minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel, attribution: osmAttrib });

          // var osm_blackWhite = L.tileLayer('https://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel, attribution: osmAttrib});

          var osm_blackWhite = new L.tileLayer.grayscale(osmUrl, { minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel, attribution: osmAttrib });

          var rvrAttrib = 'Map data © <a href="https://geodaten.metropoleruhr.de">https://geodaten.metropoleruhr.de</a>';
          var wmsLayerRVR = L.tileLayer.wms('https://geodaten.metropoleruhr.de/spw2?', {
            layers: 'stadtplan_rvr',
            minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel,
            attribution: rvrAttrib
          });
          var wmsLayerRVR_test = L.tileLayer.wms('https://geodaten.metropoleruhr.de/spw2?', {
            layers: 'spw2_graublau',
            minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel,
            attribution: rvrAttrib
          });
          var geobasisAttrib = 'Map data © <a href="https://www.bezreg-koeln.nrw.de/brk_internet/geobasis/">Geobasis NRW</a>';
          var wmsLayerDTK = L.tileLayer.wms('https://www.wms.nrw.de/geobasis/wms_nw_dtk?', {
            layers: 'nw_dtk_pan',
            minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel,
            attribution: geobasisAttrib
          });
          var wmsLayerDOP = L.tileLayer.wms('https://www.wms.nrw.de/geobasis/wms_nw_dop?', {
            layers: 'nw_dop_rgb',
            minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel,
            attribution: geobasisAttrib
          });

          //CITY OF ESSEN WMS #1
          var wms_essen_ALK_grau = L.tileLayer.wms('https://geo.essen.de/arcgis/services/basemap/Stadtplanpaket_ALK_grau/MapServer/WMSServer?',
            {
              minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel,
              layers: "0,1,2,3",
              attribution: 'Stadt Essen: Amt f&uumlr Geoinformation, Vermessung und Kataster'
            });
          // CITY OF ESSEN WMS #2
          var wms_essen_ABK = L.tileLayer
            .wms(
              'https://geo.essen.de/arcgis/services/basemap/Uebersicht_ABK_Stadtgrundkarte/MapServer/WMSServer?',
              {
                minZoom: __env.minZoomLevel, maxZoom: __env.maxZoomLevel,
                layers: "0,1,2,3",
                attribution: 'Stadt Essen: Amt f&uumlr Geoinformation, Vermessung und Kataster'
              });


          $scope.map = L.map('map', {
            center: [$scope.latCenter, $scope.lonCenter],
            zoom: $scope.zoomLevel,
            zoomDelta: 0.5,
            zoomSnap: 0.5,
            layers: [osm_blackWhite]
          });

          // execute update search control on layer add and remove
          $scope.map.on('overlayadd', function (eo) {
            $scope.updateSearchControl();
          });
          $scope.map.on('overlayremove', function (eo) {
            $scope.updateSearchControl();
          });

          $scope.baseMaps = {
            "Stadt Essen - Automatisierte Liegenschaftskarte": wms_essen_ALK_grau,
            "Stadt Essen - Amtliche Basiskarte": wms_essen_ABK,
            "OpenStreetMap - Graustufen": osm_blackWhite,
            "OpenStreetMap - Farbe": osm,
            "NRW Digitale Topographische Karte": wmsLayerDTK,
            "NRW Digitale Orthophotos (Luftbilder)": wmsLayerDOP,
            "RVR Stadtplan - Farbe": wmsLayerRVR,
            "RVR Stadtplan - Graublau": wmsLayerRVR_test
          };

          $scope.groupedOverlays = {
            indicatorLayerGroupName: {

            },
            poiLayerGroupName: {

            },
            loiLayerGroupName: {

            },
            aoiLayerGroupName: {

            },
            wmsLayerGroupName: {

            },
            wfsLayerGroupName: {

            },
            fileLayerGroupName: {

            },
            reachabilityLayerGroupName: {

            }
          };

          $scope.layerControl = L.control.groupedLayers($scope.baseMaps, $scope.groupedOverlays, { position: 'topleft' });
          $scope.map.addControl($scope.layerControl);

          // Disable dragging when user's cursor enters the element
          $scope.layerControl.getContainer().addEventListener('mouseover', function () {
            $scope.map.dragging.disable();
            $scope.map.touchZoom.disable();
            $scope.map.doubleClickZoom.disable();
            $scope.map.scrollWheelZoom.disable();
          });

          // Re-enable dragging when user's cursor leaves the element
          $scope.layerControl.getContainer().addEventListener('mouseout', function () {
            $scope.map.dragging.enable();
            $scope.map.touchZoom.enable();
            $scope.map.doubleClickZoom.enable();
            $scope.map.scrollWheelZoom.enable();
          });

          $scope.scaleBar = L.control.scale();
          $scope.scaleBar.addTo($scope.map);



          // hatch patterns
          // var diagonalPattern = new L.PatternPath({ d: "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" , fill: true });

          // $scope.outlierFillPattern_high = new L.Pattern();
          // $scope.outlierFillPattern_high.addShape(diagonalPattern);
          // $scope.outlierFillPattern_high.addTo($scope.map);

          $scope.outlierFillPattern_low = kommonitorVisualStyleHelperService.outlierFillPattern_low;
          $scope.outlierFillPattern_low.addTo($scope.map);

          $scope.outlierFillPattern_high = kommonitorVisualStyleHelperService.outlierFillPattern_high;
          $scope.outlierFillPattern_high.addTo($scope.map);

          $scope.noDataFillPattern = kommonitorVisualStyleHelperService.noDataFillPattern;
          $scope.noDataFillPattern.addTo($scope.map);

          // $scope.loadingData = false;

          /////////////////////////////////////////////////////
          ///// LEAFLET GEOSEARCH SETUP
          /////////////////////////////////////////////////////
          var GeoSearchControl = window.GeoSearch.GeoSearchControl;
          var OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider;

          // remaining is the same as in the docs, accept for the var instead of const declarations
          var provider = new OpenStreetMapProvider();

          $scope.geosearchControl = new GeoSearchControl({
            position: "topleft",
            provider: provider,
            style: 'button',
            autoComplete: true,
            autoCompleteDelay: 250,
            showMarker: true,                                   // optional: true|false  - default true
            showPopup: false,                                   // optional: true|false  - default false
            marker: {                                           // optional: L.Marker    - default L.Icon.Default
              icon: new L.Icon.Default(),
              draggable: false,
            },
            popupFormat: ({ query, result }) => result.label,   // optional: function    - default returns result label
            maxMarkers: 1,                                      // optional: number      - default 1
            retainZoomLevel: false,                             // optional: true|false  - default false
            animateZoom: true,                                  // optional: true|false  - default true
            autoClose: false,                                   // optional: true|false  - default false
            searchLabel: 'Suche nach Adressen ...',                       // optional: string      - default 'Enter address'
            keepResult: false                                   // optional: true|false  - default false
          });

          $scope.map.addControl($scope.geosearchControl);


          /////////////////////////////////////////////////////
          ///// LEAFLET SEARCH SETUP
          /////////////////////////////////////////////////////
          // will be updated once example indicator layer is loaded
          $scope.searchControl = new MultipleResultsLeafletSearch({
          });
          $scope.searchControl.addTo($scope.map);


          /////////////////////////////////////////////////////
          ///// LEAFLET MEASURE SETUP
          /////////////////////////////////////////////////////
          var measureOptions = {
            position: 'topleft',
            primaryLengthUnit: 'meters',
            secondaryLengthUnit: 'kilometers',
            primaryAreaUnit: 'sqmeters',
            activeColor: "#d15c54",
            completedColor: "#d15c54",
            decPoint: ',',
            thousandsSep: '.'
          };

          $scope.measureControl = new L.Control.Measure(measureOptions);
          $scope.measureControl.addTo($scope.map);

          /////////////////////////////////////////////////////
          ///// LEAFLET EASY PRINT SETUP
          /////////////////////////////////////////////////////

          $scope.printControl = L.easyPrint({
            title: 'Kartenexport',
            position: 'topleft',
            sizeModes: ['Current'],
            exportOnly: true,
            hidden: true,
            filename: "KomMonitor-Kartenexport",
            hideControlContainer: false,
            hideClasses: ['leaflet-left'],
            defaultSizeTitles: { Current: 'Aktueller Kartenausschnitt', A4Landscape: 'A4 Querformat', A4Portrait: 'A4 Portrait' }
          });

          $scope.printControl.addTo($scope.map);

        }; // end initialize map


        $scope.$on("exportMap", function (event) {
          try {
            $scope.printControl.printMap('CurrentSize', 'KomMonitor-Kartenexport');

            setTimeout(function () {
              $(".leaflet-left").css("display", "");
            }, 1000);
          }
          catch (error) {
            console.log("Error while exporting map view.");
            console.error(error);

            $(".leaflet-left").css("display", "");
          }

        });

        $scope.updateSearchControl = function () {

          setTimeout(function () {
            if ($scope.searchControl) {
              try {
                $scope.map.removeControl($scope.searchControl);
                $scope.searchControl = undefined;
              }
              catch (error) {
              }
            }

            // build L.layerGroup of available POI layers
            var featureLayers = [];

            for (var layerEntry of $scope.layerControl._layers) {
              if (layerEntry) {
                if (layerEntry.overlay) {
                  if ($scope.map.hasLayer(layerEntry.layer)) {
                    if (layerEntry.group.name === poiLayerGroupName || layerEntry.group.name === loiLayerGroupName || layerEntry.group.name === aoiLayerGroupName || layerEntry.group.name === indicatorLayerGroupName || layerEntry.group.name === wfsLayerGroupName || layerEntry.group.name === fileLayerGroupName) {
                      featureLayers.push(layerEntry.layer);
                    }
                  }

                }
              }
            }

            var layerGroup;
            // if no relevant layers are currently displayed, then
            if (featureLayers.length === 0) {
              $scope.searchControl = new MultipleResultsLeafletSearch({
              });
              $scope.searchControl.addTo($scope.map);
            }
            else {
              layerGroup = L.featureGroup(featureLayers);

              $scope.searchControl = new MultipleResultsLeafletSearch({
                position: "topleft",
                layer: layerGroup,
                initial: false,
                propertyName: __env.FEATURE_NAME_PROPERTY_NAME,
                textPlaceholder: "Layer-Objekte nach Name und/oder ID filtern",
                textCancel: "Abbrechen",
                textErr: "Position nicht gefunden",
                hideMarkerOnCollapse: true,
                zoom: 15,
                autoResize: true,
                autoCollapse: false,
                autoType: true,
                formatData: function (json) {	//adds coordinates to name.
                  var propName = this.options.propertyName,
                    propLoc = this.options.propertyLoc,
                    i, jsonret = {};
                  if (L.Util.isArray(propLoc))
                    for (i in json) {
                      if (!this._getPath(json[i], propName)) continue;
                      jsonret[this._getPath(json[i], propName) + " (" + json[i][propLoc[0]] + "," + json[i][propLoc[1]] + ")"] = L.latLng(json[i][propLoc[0]], json[i][propLoc[1]]);
                    }
                  else
                    for (i in json) {
                      if (!this._getPath(json[i], propName)) continue;
                      jsonret[this._getPath(json[i], propName) + " (" + json[i][propLoc][0] + "," + json[i][propLoc][1] + ")"] = L.latLng(this._getPath(json[i], propLoc));
                    }
                  return jsonret;
                },
                filterData: function (text, records) {
                  var I, icase, regSearch, frecords = {};

                  text = text.replace(/[.*+?^${}()|[\]\\]/g, '');  //sanitize remove all special characters
                  if (text === '')
                    return [];

                  I = this.options.initial ? '^' : '';  //search only initial text
                  icase = !this.options.casesensitive ? 'i' : undefined;

                  regSearch = new RegExp(I + text, icase);

                  //TODO use .filter or .map
                  for (var key in records) {
                    if (regSearch.test(key))
                      frecords[key] = records[key];
                  }

                  return frecords;
                },
                buildTip: function (text, val) {
                  var emString = "";

                  if (val.layer.metadataObject) {
                    if (val.layer.metadataObject.isPOI) {
                      emString += '<i style="width:14px;height:14px;float:left;" class="awesome-marker-legend awesome-marker-legend-icon-' + val.layer.metadataObject.poiMarkerColor + '">';
                      emString += "<span style='margin-left:3px; top:-2px; font-size:0.7em; color:" + val.layer.metadataObject.poiSymbolColor + ";' align='center' class='glyphicon glyphicon-" + val.layer.metadataObject.poiSymbolBootstrap3Name + "' aria-hidden='true'></span>";
                      emString += '</i>';
                    }
                  }
                  else {
                    emString += "<i style='font-size:1.0em;' class='fas fa-sitemap'></i>";
                  }
                  return '<a href="" class="search-tip">' + emString + '&nbsp;&nbsp;' + text + '</a>';
                }
              });

              $scope.searchControl.addTo($scope.map);
            }
          }, 200);
        };

        $scope.$on("showLoadingIconOnMap", function (event) {
          // console.log("Show loading icon on map");
          $scope.loadingData = true;
        });

        $scope.$on("hideLoadingIconOnMap", function (event) {
          // console.log("Hide loading icon on map");
          $scope.loadingData = false;
        });

        $(document).on('click', '#selectSpatialUnitViaInfoControl li p', function () {
          var spatialUnitName = $(this).text();
          $('#selectSpatialUnitViaInfoControl_text').text(spatialUnitName);

          $rootScope.$broadcast("changeSpatialUnitViaInfoControl", spatialUnitName);
        });

        // $(document).on('change','#selectSimplifyGeometriesViaInfoControl',function(){
        //   var selector = document.getElementById('selectSimplifyGeometriesViaInfoControl');
        //   var simplifyGeometries = selector[selector.selectedIndex].value;
        //
        //   kommonitorDataExchangeService.simplifyGeometries = simplifyGeometries;
        //
        //   $rootScope.$broadcast("changeSpatialUnit");
        // });

        $scope.$on("changeSpatialUnitViaInfoControl", function (event, spatialUnitLevel) {
          //TODO
          for (var i = 0; i < kommonitorDataExchangeService.availableSpatialUnits.length; i++) {
            if (kommonitorDataExchangeService.availableSpatialUnits[i].spatialUnitLevel === spatialUnitLevel) {
              kommonitorDataExchangeService.selectedSpatialUnit = kommonitorDataExchangeService.availableSpatialUnits[i];
              break;
            }
          }

          $rootScope.$broadcast("changeSpatialUnit");

        });


        $scope.appendSpatialUnitOptions = function () {

          // <form action="select.html">
          //   <label>Künstler(in):
          //     <select name="top5" size="5">
          //       <option>Heino</option>
          //       <option>Michael Jackson</option>
          //       <option>Tom Waits</option>
          //       <option>Nina Hagen</option>
          //       <option>Marianne Rosenberg</option>
          //     </select>
          //   </label>
          // </form>

          // var innerHTMLString = "<form>";
          // innerHTMLString += "<label>Raumebene:  ";
          // innerHTMLString += "<select id='selectSpatialUnitViaInfoControl'>";
          //
          //
          // for (var option of kommonitorDataExchangeService.availableSpatialUnits){
          //
          //   if (kommonitorDataExchangeService.selectedIndicator.applicableSpatialUnits.includes(option.spatialUnitLevel)){
          //     innerHTMLString += ' <option value="' + option.spatialUnitLevel + '" ';
          //     if (kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel === option.spatialUnitLevel){
          //       innerHTMLString +=' selected ';
          //     }
          //     innerHTMLString +='>' + option.spatialUnitLevel + '</option>';
          //   }
          // }
          // innerHTMLString += "</select>";
          // innerHTMLString += "</label>";
          // innerHTMLString += "</form>";
          // // innerHTMLString += "<br/>";

          // <div class="dropdown">
          //     <a aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" class="dropdown-toggle" href="#">
          //       <span id="selected">Chose option</span><span class="caret"></span></a>
          //   <ul class="dropdown-menu">
          //     <li><a href="#">Option 1</a></li>
          //     <li><a href="#">Option 2</a></li>
          //     <li><a href="#">Option 3</a></li>
          //     <li><a href="#">Option 4</a></li>
          //   </ul>
          // </div>

          var innerHTMLString = '<div class="row" style="margin-right: 0px;">';
          innerHTMLString += "<div class='col-sm-3'><div class='text-left'><label>Raumebene:   </label></div></div>";
          innerHTMLString += "<div class='col-sm-9'><div class='text-left'><div id='selectSpatialUnitViaInfoControl' class='dropup'>";
          innerHTMLString += '<button class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown"><span id="selectSpatialUnitViaInfoControl_text">' + kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel + '&nbsp;&nbsp;&nbsp;</span><span class="caret"></span></button>';
          innerHTMLString += '<ul id="spatialUnitInfoControlDropdown" class="dropdown-menu">';

          for (var option of kommonitorDataExchangeService.availableSpatialUnits) {

            if (kommonitorDataExchangeService.selectedIndicator.applicableSpatialUnits.includes(option.spatialUnitLevel)) {
              innerHTMLString += ' <li><p style="cursor: pointer; font-size:12px;">' + option.spatialUnitLevel;
              innerHTMLString += '</p></li>';
            }
          }
          innerHTMLString += "</ul>";
          innerHTMLString += "</div></div></div>";
          innerHTMLString += "</div>";

          return innerHTMLString;
        };

        // $scope.appendSimplifyGeometriesOptions = function(){
        //
        //   // <form action="select.html">
        //   //   <label>Künstler(in):
        //   //     <select name="top5" size="5">
        //   //       <option>Heino</option>
        //   //       <option>Michael Jackson</option>
        //   //       <option>Tom Waits</option>
        //   //       <option>Nina Hagen</option>
        //   //       <option>Marianne Rosenberg</option>
        //   //     </select>
        //   //   </label>
        //   // </form>
        //
        //   var innerHTMLString = "<form>";
        //   innerHTMLString += "<label title='Angabe, ob die Geometrien für die Kartendarstellung vereinfacht werden sollen. Jede der Optionen schwach, mittel, stark, reduziert dabei die Stützpunkte der Geometrien um ein Zunehmendes Maß. Dies reduziert die Geometrie-Komplexitität und erhöht die Performanz.'>Geometrie vereinfachen?  ";
        //   innerHTMLString += "<select id='selectSimplifyGeometriesViaInfoControl'>";
        //
        //
        //   for (var option of kommonitorDataExchangeService.simplifyGeometriesOptions){
        //       innerHTMLString += ' <option value="' + option.value + '" ';
        //       if (kommonitorDataExchangeService.simplifyGeometries === option.value){
        //         innerHTMLString +=' selected ';
        //       }
        //       innerHTMLString +='>' + option.label + '</option>';
        //   }
        //   innerHTMLString += "</select>";
        //   innerHTMLString += "</label>";
        //   innerHTMLString += "</form>";
        //   // innerHTMLString += "<br/>";
        //
        //   return innerHTMLString;
        // };

        function dateToTS(date) {
          return date.valueOf();
        }

        function tsToDate(ts) {
          var date = new Date(ts);

          return date.toLocaleDateString("de-DE", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }

        function tsToDate_fullYear(ts) {
          var date = new Date(ts);

          /**
          * TODO FIXME dateSLider formatter will return only year for now to prevent misleading month and day settings
          */

          return date.getFullYear();

          // return date.toLocaleDateString("de-DE", {
          // 		year: 'numeric',
          // 		month: 'long',
          // 		day: 'numeric'
          // });
        }

        var toggleInfoControl = function () {
          if ($scope.showInfoControl === true) {
            /* use jquery to select your DOM elements that has the class 'legend' */
            $('.info').hide();
            $scope.showInfoControl = false;

            $('#toggleInfoControlButton').show();
          } else {
            $('.info').show();
            $scope.showInfoControl = true;

            // button is defined in kommonitor-user-interface component
            $('#toggleInfoControlButton').hide();
          }
        };

        var toggleLegendControl = function () {
          if ($scope.showLegendControl === true) {
            /* use jquery to select your DOM elements that has the class 'legend' */
            $('.legendMap').hide();
            $scope.showLegendControl = false;

            $('#toggleLegendControlButton').show();
          } else {
            $('.legendMap').show();
            $scope.showLegendControl = true;

            // button is defined in kommonitor-user-interface component
            $('#toggleLegendControlButton').hide();
          }
        };

        $scope.$on("toggleInfoControl", function (event) {
          toggleInfoControl();
        });

        $scope.$on("toggleLegendControl", function (event) {
          toggleLegendControl();
        });

        $scope.downloadIndicatorAsGeoJSON = function () {

          var geoJSON_string = JSON.stringify(kommonitorDataExchangeService.selectedIndicator.geoJSON);

          var fileName = kommonitorDataExchangeService.selectedIndicator.indicatorName + "_" + kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel + "_" + kommonitorDataExchangeService.selectedDate + ".geojson";

          var blob = new Blob([geoJSON_string], { type: "application/json" });
          var data = URL.createObjectURL(blob);
          //
          // $scope.indicatorDownloadURL = data;
          // $scope.indicatorDownloadName = fileName;

          // var element = document.createElement('a');
          // element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJSON)));
          // element.setAttribute('download', fileName);
          //
          // element.style.display = 'none';
          // document.body.appendChild(element);
          //
          // element.click();
          //
          // document.body.removeChild(element);

          var a = document.createElement('a');
          a.download = fileName;
          a.href = data;
          a.textContent = "GeoJSON";
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.click();

          a.remove();
        };

        $scope.downloadIndicatorAsShape = function () {

          var folderName = kommonitorDataExchangeService.selectedIndicator.indicatorName + "_" + kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel + "_" + kommonitorDataExchangeService.selectedDate;
          var polygonName = kommonitorDataExchangeService.selectedIndicator.indicatorName + "_" + kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel;

          var options = {
            folder: folderName,
            types: {
              point: 'points',
              polygon: polygonName,
              line: 'lines'
            }
          };

          var geoJSON = jQuery.extend(true, {}, kommonitorDataExchangeService.selectedIndicator.geoJSON);

          for (var feature of geoJSON.features) {
            var properties = feature.properties;

            // rename all properties due to char limit in shaoefiles
            var keys = Object.keys(properties);

            for (var key of keys) {
              var newKey = undefined;
              if (key.toLowerCase().includes("featureid")) {
                newKey = "ID";
              }
              else if (key.toLowerCase().includes("featurename")) {
                newKey = "NAME";
              }
              else if (key.toLowerCase().includes("date_")) {
                // from DATE_2018-01-01
                // to 20180101
                newKey = key.split("_")[1].replace(/-|\s/g, "");
              }
              else if (key.toLowerCase().includes("startdate")) {
                newKey = "validFrom";
              }
              else if (key.toLowerCase().includes("enddate")) {
                newKey = "validTo";
              }

              if (newKey) {
                properties[newKey] = properties[key];
                delete properties[key];
              }
            }

            // replace properties with the one with new keys
            feature.properties = properties;
          }

          shpwrite.download(geoJSON, options);
        };

        $(document).on('click', '#downloadGeoJSON', function (e) {
          $scope.downloadIndicatorAsGeoJSON();
        });

        $(document).on('click', '#downloadShape', function (e) {
          $scope.downloadIndicatorAsShape();
        });

        $(document).on('click', '#info_close', function (e) {
          toggleInfoControl();
        });

        $(document).on('click', '#legend_close', function (e) {
          toggleLegendControl();
        });

        $(document).on('input change', '#indicatorTransparencyInput', function (e) {
          var indicatorMetadata = kommonitorDataExchangeService.selectedIndicator;

          var transparency = document.getElementById("indicatorTransparencyInput").value;
          var opacity = 1 - transparency;

          $rootScope.$broadcast("adjustOpacityForIndicatorLayer", indicatorMetadata, opacity);
        });

        $(document).on('click', '#downloadMetadata', function (e) {
          // create PDF from currently selected/displayed indicator!
          var indicatorMetadata = kommonitorDataExchangeService.selectedIndicator;

          var jspdf = new jsPDF();
          jspdf.setFontSize(16);
          // jspdf.text("Metadatenblatt", 70, 6);

          //insert logo
          var img = new Image();
          img.src = '/logos/KM_Logo1.png';
          jspdf.addImage(img, 'PNG', 193, 5, 12, 12);

          jspdf.setFontSize(16);
          jspdf.setFontStyle('bolditalic');
          var titleArray = jspdf.splitTextToSize(indicatorMetadata.indicatorName, 180);
          jspdf.text(titleArray, 14, 25);

          if (indicatorMetadata.characteristicValue && indicatorMetadata.characteristicValue != "-" && indicatorMetadata.characteristicValue != "") {
            jspdf.setFontSize(14);
            jspdf.text(indicatorMetadata.characteristicValue, 14, 25);
          }


          jspdf.setFontSize(11);

          var initialStartY = 30;

          if (titleArray.length > 1) {
            titleArray.forEach(function (item) {
              initialStartY += 5;
            });
          }
          if (indicatorMetadata.characteristicValue && indicatorMetadata.characteristicValue != "-" && indicatorMetadata.characteristicValue != "") {
            initialStartY += 5;
          }

          var headStyles = {
            fontStyle: 'bold',
            fontSize: 12,
            fillColor: '#337ab7',
            // auto or wrap
            cellWidth: 'auto'
          };

          var bodyStyles = {
            fontStyle: 'normal',
            fontSize: 11,
            // auto or wrap or number
            cellWidth: 'auto'
          };

          // first column with fixed width
          var columnStyles = {
            0: { cellWidth: 45, fontStyle: 'bold' },
            1: { fontStyle: 'normal' }
          };

          var topicsString = kommonitorDataExchangeService.getTopicHierarchyDisplayString(indicatorMetadata.topicReference);

          var category = "Subindikator";
          if (indicatorMetadata.isHeadingIndicator) {
            category = "Leitindikator";
          }

          // Or JavaScript:
          jspdf.autoTable({
            head: [['Themenfeld', 'Kategorie', 'Typ', 'Kennzeichen']],
            body: [
              [topicsString, category, kommonitorDataExchangeService.getIndicatorStringFromIndicatorType($scope.currentIndicatorMetadataAndGeoJSON.indicatorType), indicatorMetadata.abbreviation ? indicatorMetadata.abbreviation : "-"]
              // ...
            ],
            theme: 'grid',
            headStyles: headStyles,
            bodyStyles: bodyStyles,
            startY: initialStartY
          });

          var linkedIndicatorsString = "";

          for (var [index, linkedIndicator] of indicatorMetadata.referencedIndicators.entries()) {
            linkedIndicatorsString += linkedIndicator.referencedIndicatorName + " - \n   " + linkedIndicator.referencedIndicatorDescription;

            if (index < indicatorMetadata.referencedIndicators.length - 1) {
              linkedIndicatorsString += "\n\n";
            }
          }

          if (linkedIndicatorsString === "") {
            linkedIndicatorsString = "-";
          }

          var linkedGeoresourcesString = "";

          for (var [k, linkedGeoresource] of indicatorMetadata.referencedGeoresources.entries()) {
            linkedGeoresourcesString += linkedGeoresource.referencedGeoresourceName + " - \n   " + linkedGeoresource.referencedGeoresourceDescription;

            if (k < indicatorMetadata.referencedGeoresources.length - 1) {
              linkedGeoresourcesString += "\n\n";
            }
          }

          if (linkedGeoresourcesString === "") {
            linkedGeoresourcesString = "-";
          }

          // jspdf.autoTable({
          //     head: [],
          //     body: [
          //         ["Beschreibung", indicatorMetadata.metadata.description],
          //         ["Maßeinheit", indicatorMetadata.unit],
          //         ["Definition des Leitindikators", "-"],
          //         ["Klassifizierung", "-"],
          //         ["Interpretation", "-"],
          //         ["Verknüpfte Indikatoren", linkedIndicatorsString],
          //         ["Verknüpfte Geodaten", linkedGeoresourcesString]
          //         // ...
          //     ],
          //     startY: jspdf.autoTable.previous.finalY + 20,
          // });

          var spatialUnitsString = "";
          var processedSpatialUnits = 0;

          for (var availableSpatialUnit of kommonitorDataExchangeService.availableSpatialUnits) {

            for (var applicableSpatialUnit of indicatorMetadata.applicableSpatialUnits) {

              if (availableSpatialUnit.spatialUnitLevel === applicableSpatialUnit) {
                spatialUnitsString += applicableSpatialUnit;
                processedSpatialUnits++;

                if (processedSpatialUnits < indicatorMetadata.applicableSpatialUnits.length) {
                  spatialUnitsString += "\n";
                }
              }

            }
          }

          var datesString = "";

          for (var [j, date] of indicatorMetadata.applicableDates.entries()) {

            var dateComponents = date.split("-");
            var asDate = new Date(Number(dateComponents[0]), Number(dateComponents[1]) - 1, Number(dateComponents[2]));

            datesString += tsToDate_fullYear(dateToTS(asDate));

            if (j < indicatorMetadata.applicableDates.length - 1) {
              datesString += "\n";
            }
          }

          jspdf.autoTable({
            head: [],
            body: [
              ["Beschreibung", indicatorMetadata.metadata.description],
              ["Maßeinheit", indicatorMetadata.unit],
              ["Methodik", indicatorMetadata.processDescription ? indicatorMetadata.processDescription : "-"],
              // ["Klassifizierung", "-"],
              ["Interpretation", indicatorMetadata.interpretation ? indicatorMetadata.interpretation : "-"],
              ["Tags", indicatorMetadata.tags ? JSON.stringify(indicatorMetadata.tags) : "-"],
              ["Verknüpfte Indikatoren", linkedIndicatorsString],
              ["Verknüpfte Geodaten", linkedGeoresourcesString]
            ],
            theme: 'grid',
            headStyles: headStyles,
            bodyStyles: bodyStyles,
            columnStyles: columnStyles,
            startY: jspdf.autoTable.previous.finalY + 10
          });

          // // linked elements
          // jspdf.autoTable({
          //     head: [],
          //     body: [
          //         ["Verknüpfte Indikatoren", linkedIndicatorsString],
          //         ["Verknüpfte Geodaten", linkedGeoresourcesString]
          //     ],
          //     theme: 'grid',
          //     headStyles: headStyles,
          //     bodyStyles: bodyStyles,
          //     columnStyles: columnStyles,
          //     startY: jspdf.autoTable.previous.finalY + 10
          // });

          // linked elements
          jspdf.autoTable({
            head: [],
            body: [
              ["Datengrundlage", indicatorMetadata.metadata.databasis ? indicatorMetadata.metadata.databasis : "-"],
              ["Datenquelle", indicatorMetadata.metadata.datasource ? indicatorMetadata.metadata.datasource : "-"],
              ["Datenhalter und Kontakt", indicatorMetadata.metadata.contact ? indicatorMetadata.metadata.contact : "-"],
              ["Bemerkung", indicatorMetadata.metadata.note ? indicatorMetadata.metadata.note : "-"],
              ["Raumbezug", spatialUnitsString],
              // $scope.updateInteval is a map mapping the english KEYs to german expressions
              ["Zeitbezug / Fortführungsintervall", $scope.updateInterval.get(indicatorMetadata.metadata.updateInterval.toUpperCase())],
              ["Verfügbare Zeitreihen", datesString],
              ["Datum der letzten Aktualisierung", indicatorMetadata.metadata.lastUpdate],
              ["Quellen / Literatur", indicatorMetadata.metadata.literature ? indicatorMetadata.metadata.literature : "-"]
            ],
            theme: 'grid',
            headStyles: headStyles,
            bodyStyles: bodyStyles,
            columnStyles: columnStyles,
            startY: jspdf.autoTable.previous.finalY + 10
          });

          //
          // jspdf.autoTable({
          //     head: [],
          //     body: [
          //         ["Quellen / Literatur", indicatorMetadata.metadata.literature ? indicatorMetadata.metadata.literature : "-"]
          //         // ...
          //     ],
          //     theme: 'grid',
          //     headStyles: headStyles,
          //     bodyStyles: bodyStyles,
          //     columnStyles: columnStyles,
          //     startY: jspdf.autoTable.previous.finalY + 10
          // });

          var pdfName = indicatorMetadata.indicatorName + ".pdf";

          jspdf.setProperties({
            title: 'KomMonitor Indikatorenblatt',
            subject: pdfName,
            author: 'KomMonitor',
            keywords: 'Indikator, Metadatenblatt',
            creator: 'KomMonitor'
          });

          jspdf.save(pdfName);
        });

        $scope.appendInfoCloseButton = function () {
          return '<div id="info_close" class="btn btn-link" style="right: 0px; position: relative; float: right;" title="beenden"><span class="glyphicon glyphicon-remove"></span></div>';
        };

        $scope.appendLegendCloseButton = function () {
          return '<div id="legend_close" class="btn btn-link" style="right: 0px; position: relative; float: right;" title="beenden"><span class="glyphicon glyphicon-remove"></span></div>';
        };

        $scope.makeInfoControl = function (date, isCustomComputation) {

          if (!$scope.showInfoControl) {
            try {
              toggleInfoControl();
            }
            catch (error) {
            }
          }

          if ($scope.infoControl) {
            try {
              $scope.map.removeControl($scope.infoControl);
              $scope.infoControl = undefined;
            }
            catch (error) {
            }
          }

          $scope.infoControl = L.control({ position: 'topright' });

          $scope.infoControl.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"

            this._div.id = "infoControl";
            // [year, month, day]
            var lastUpdateComponents = $scope.currentIndicatorMetadataAndGeoJSON.metadata.lastUpdate.split("-");
            var lastUpdateAsDate = new Date(Number(lastUpdateComponents[0]), Number(lastUpdateComponents[1]) - 1, Number(lastUpdateComponents[2]));

            this._div.innerHTML = $scope.appendInfoCloseButton();
            this._div.innerHTML += '<div>';
            var titel = $scope.indicatorName;

            if (isCustomComputation) {
              titel += " - <i>individuelles Berechnungsergebnis</i>";
            }

            this._div.innerHTML += '<h4><b>Indikatoreninformation</b><br/>' + $scope.indicatorName + '</h4><br/>';
            // this._div.innerHTML += '<p>' + $scope.indicatorDescription + '</p>'
            this._div.innerHTML += '<b>Beschreibung: </b> ' + $scope.indicatorDescription + '<br/>';
            this._div.innerHTML += '<b>Methodik: </b> ' + $scope.currentIndicatorMetadataAndGeoJSON.processDescription + '<br/>';
            this._div.innerHTML += '<b>Datenquelle: </b> ' + $scope.currentIndicatorMetadataAndGeoJSON.metadata.datasource + '<br/>';
            this._div.innerHTML += '<b>Kontakt: </b> ' + $scope.currentIndicatorMetadataAndGeoJSON.metadata.contact + '<br/>';
            // this._div.innerHTML += '<b>Aktualisierungszyklus: </b> ' + $scope.updateInterval.get($scope.currentIndicatorMetadataAndGeoJSON.metadata.updateInterval.toUpperCase()) + '<br/>';
            // this._div.innerHTML += '<b>zuletzt aktualisiert am: </b> ' + tsToDate(dateToTS(lastUpdateAsDate)) + '<br/><br/>';
            this._div.innerHTML += $scope.appendSpatialUnitOptions();
            // this._div.innerHTML += $scope.appendTransparencyCheckbox();

            // <form class="form-inline">
            // <div class="form-group" align="center">
            //
            //   <input class="form-control" id="indicatorTransparencyInput" type="range"  min="0" max="1" step="0.01">
            //
            //   <label id="">0.3</label>
            // </div>
            // </form>

            var transparencyDomString = "";
            transparencyDomString += '<br/><div class="row vertical-align" style="margin-right:0px;">';
            transparencyDomString += '<div class="col-sm-3">';
            transparencyDomString += '<div class="text-left">';
            transparencyDomString += '<label>Transparenz</label>';
            transparencyDomString += '</div>';
            transparencyDomString += '</div>';
            transparencyDomString += '<div class="col-sm-7">';
            transparencyDomString += '<div class="text-left">';
            transparencyDomString += '<input style="width:100%;" id="indicatorTransparencyInput" type="range" value="' + (1 - defaultFillOpacity).toFixed(numberOfDecimals) + '" min="0" max="1" step="0.01">';
            transparencyDomString += '</div>';
            transparencyDomString += '</div>';
            transparencyDomString += '<div class="col-sm-2">';
            transparencyDomString += '<div class="text-left">';
            transparencyDomString += '<label id="indicatorTransparencyLabel">' + (1 - defaultFillOpacity).toFixed(numberOfDecimals) + '</label>';
            transparencyDomString += '</div>';
            transparencyDomString += '</div>';
            transparencyDomString += '</div>';

            this._div.innerHTML += transparencyDomString;

            var exportDomString = '<br/><div class="btn-group">';
            exportDomString += "<label><i class='fa fa-file-download'></i>&nbsp;&nbsp;&nbsp;Export</label>";
            exportDomString += '<br/><button id="downloadMetadata" class="btn btn-default btn-xs">Metadatenblatt</button>';
            exportDomString += '<button id="downloadGeoJSON" class="btn btn-primary btn-xs">GeoJSON</button>';
            exportDomString += '<button id="downloadShape" class="btn btn-primary btn-xs">ESRI Shape</button>';
            // temporarily disable WMS and WFS export
            exportDomString += '<a style="color:white;pointer-events: none;cursor: default;" class="btn btn-primary btn-xs disabled" href="' + kommonitorDataExchangeService.wmsUrlForSelectedIndicator + '" target="_blank" rel="noopener noreferrer" id="downloadWMS"><span title="WMS Link in Zukunft abrufbar">WMS</span></a>';
            exportDomString += '<a style="color:white;pointer-events: none;cursor: default;" class="btn btn-primary btn-xs disabled" href="' + kommonitorDataExchangeService.wfsUrlForSelectedIndicator + '" target="_blank" rel="noopener noreferrer" id="downloadWFS"><span title="WFS Link in Zukunft abrufbar">WFS</span></a>';
            exportDomString += "</div>";

            this._div.innerHTML += exportDomString;

            // this._div.innerHTML += $scope.appendSimplifyGeometriesOptions();
            return this._div;
          };

          $scope.infoControl.addTo($scope.map);

          // Disable dragging when user's cursor enters the element
          $scope.infoControl.getContainer().addEventListener('mouseover', function () {
            $scope.map.dragging.disable();
            $scope.map.touchZoom.disable();
            $scope.map.doubleClickZoom.disable();
            $scope.map.scrollWheelZoom.disable();
          });

          // Re-enable dragging when user's cursor leaves the element
          $scope.infoControl.getContainer().addEventListener('mouseout', function () {
            $scope.map.dragging.enable();
            $scope.map.touchZoom.enable();
            $scope.map.doubleClickZoom.enable();
            $scope.map.scrollWheelZoom.enable();
          });
        };

        $scope.makeCustomInfoControl = function (date) {

          if (!$scope.showInfoControl) {
            try {
              toggleInfoControl();
            }
            catch (error) {
            }
          }

          if ($scope.infoControl) {
            try {
              $scope.map.removeControl($scope.infoControl);
              $scope.infoControl = undefined;
            }
            catch (error) {
            }
          }


          $scope.infoControl = L.control({ position: 'topright' });

          $scope.infoControl.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"

            this._div.innerHTML = '<h4>' + $scope.customIndicatorName + ' ' + date + '</h4>';
            // this._div.innerHTML += '<p>' + $scope.indicatorDescription + '</p>'
            this._div.innerHTML += '<p>' + $scope.customIndicatorDescription + '</p>';
            this._div.innerHTML += '<p>&uuml;ber ein Feature hovern</p>';

            // this.update();
            return this._div;
          };

          // method that we will use to update the control based on feature properties passed
          $scope.infoControl.update = function (props) {
            this._div.innerHTML = '<h4>' + $scope.customIndicatorName + ' ' + date + '</h4>';
            this._div.innerHTML += '<p>' + $scope.customIndicatorDescription + '</p>';
            this._div.innerHTML += (props ?
              '<b>' + props[__env.FEATURE_NAME_PROPERTY_NAME] + '</b><br />' + props[$scope.customIndicatorPropertyName] + ' ' + $scope.customIndicatorUnit
              : '&uuml;ber ein Feature hovern');
          };

          $scope.infoControl.addTo($scope.map);
        };

        $(document).on('click', '#radiojenks', function (e) {
          $rootScope.$broadcast("changeClassifyMethod", "jenks");
        });

        $(document).on('click', '#radioquantile', function (e) {
          $rootScope.$broadcast("changeClassifyMethod", "quantile");
        });

        $(document).on('click', '#radioequal_interval', function (e) {
          $rootScope.$broadcast("changeClassifyMethod", "equal_interval");
        });

        $(document).on('click', '#controlIndicatorTransparency', function (e) {
          var indicatorTransparencyCheckbox = document.getElementById('controlIndicatorTransparency');
          if (indicatorTransparencyCheckbox.checked) {
            $scope.useTransparencyOnIndicator = true;
          }
          else {
            $scope.useTransparencyOnIndicator = false;
          }
          $rootScope.$broadcast("restyleCurrentLayer", false);

          // ensure that highlighted features remain highlighted
          preserveHighlightedFeatures();
        });

        $(document).on('click', '#controlIndicatorOutlierDetection', function (e) {
          var indicatorOutlierCheckbox = document.getElementById('controlIndicatorOutlierDetection');
          if (indicatorOutlierCheckbox.checked) {
            kommonitorDataExchangeService.useOutlierDetectionOnIndicator = true;
          }
          else {
            kommonitorDataExchangeService.useOutlierDetectionOnIndicator = false;
          }
          $rootScope.$broadcast("restyleCurrentLayer", false);

          // ensure that highlighted features remain highlighted
          preserveHighlightedFeatures();
        });

        $scope.$on("changeClassifyMethod", function (event, method) {
          $scope.classifyMethod = method;

          $rootScope.$broadcast("restyleCurrentLayer", false);
        });


        $scope.appendClassifyRadioOptions = function () {
          var innerHTMLString = "<strong title='Hier können Sie die Klassifizierungsmethode ändern. Das Herüberfahren des Mauszeigers über eine der Optionen öffnet einen Tooltip mit Informationen zu den Methoden. In Zukunft sollen auch manuelle Klassifikationen möglich gemacht werden.'>Klassifizierungsmethode:</strong>";

          // <label class="radio-inline"><input type="radio" name="optradio" checked>Option 1</label>
          // <label class="radio-inline"><input type="radio" name="optradio">Option 2</label>
          // <label class="radio-inline"><input type="radio" name="optradio">Option 3</label>

          // angular
          //<form>
          //   <div ng-repeat="option in occurrenceOptions track by $index">
          //     <input type="radio" name="occurrences" ng-value="option" ng-model="model.selectedOccurrence" />
          //     <label>{{ option }}</label>
          //   </div>
          // </form>
          innerHTMLString += "<form>";
          innerHTMLString += '<div>';
          for (var option of $scope.classifyMethods) {
            // innerHTMLString += ' <label class="radio-inline"><input type="radio" name="classifyMethod" onclick="onClickClassifyMethod(\'' + option.value + '\')" ';
            innerHTMLString += ' <label title="Mit der Methode Gleiches Intervall wird der Bereich der Attributwerte in gleich große Teilbereiche unterteilt. Bei der Quantil-Methode enthält jede Klasse die gleiche Anzahl von Features. Bei Jenks (Natürliche Unterbrechungen) werden Klassengrenzen identifiziert, die ähnliche Werte möglichst gut gruppieren und zugleich die Unterschiede zwischen den Klassen maximieren." class="radio-inline"><input id="radio' + option.value + '" type="radio" name="classifyMethod" ';
            if ($scope.classifyMethod === option.value) {
              innerHTMLString += ' checked ';
            }
            innerHTMLString += '>' + option.name + '</label>';

          }
          innerHTMLString += "</div>";
          innerHTMLString += "</form>";
          innerHTMLString += "<br/>";

          return innerHTMLString;
        };

        $scope.appendInterpretation = function () {

          var innerHTMLString = "<label>Interpretationshilfe:</label>  ";

          // <label class="radio-inline"><input type="radio" name="optradio" checked>Option 1</label>
          // <label class="radio-inline"><input type="radio" name="optradio">Option 2</label>
          // <label class="radio-inline"><input type="radio" name="optradio">Option 3</label>

          // angular
          //<form>
          //   <div ng-repeat="option in occurrenceOptions track by $index">
          //     <input type="radio" name="occurrences" ng-value="option" ng-model="model.selectedOccurrence" />
          //     <label>{{ option }}</label>
          //   </div>
          // </form>
          innerHTMLString += $scope.currentIndicatorMetadataAndGeoJSON.interpretation;
          innerHTMLString += "<br/>";
          innerHTMLString += "<br/>";

          return innerHTMLString;

        };

        $scope.appendTransparencyCheckbox = function () {

          /*
          * <strong>Schwellwertklassifizierung aktivieren/deaktivieren</strong>
            &nbsp;
            <label class="switch">
              <input id="measureOfValueCheckbox" type="checkbox" ng-change="$ctrl.onChangeUseMeasureOfValue()" ng-model="$ctrl.kommonitorDataExchangeServiceInstance.isMeasureOfValueChecked" ng-checked="$ctrl.kommonitorDataExchangeServiceInstance.isMeasureOfValueChecked"></input>
              <span class="switchslider round"></span>
            </label>
          */
          var innerHTMLString = '<br/><strong>Indikator semi-transparent darstellen</strong> &nbsp;';
          innerHTMLString += "<label class='switch' title='Einstellung, ob der Indikatorenlayer semi-transparent oder opak dargestellt wird'>";
          innerHTMLString += "<input id='controlIndicatorTransparency' type='checkbox' value='useTransparency'";
          if ($scope.useTransparencyOnIndicator) {
            innerHTMLString += " checked";
          }
          innerHTMLString += ">";
          innerHTMLString += "<span class='switchslider round'></span>";
          innerHTMLString += '</label>';

          return innerHTMLString;
        };

        $scope.appendOutliersCheckbox = function () {

          /*
          * <strong>Schwellwertklassifizierung aktivieren/deaktivieren</strong>
            &nbsp;
            <label class="switch">
              <input id="measureOfValueCheckbox" type="checkbox" ng-change="$ctrl.onChangeUseMeasureOfValue()" ng-model="$ctrl.kommonitorDataExchangeServiceInstance.isMeasureOfValueChecked" ng-checked="$ctrl.kommonitorDataExchangeServiceInstance.isMeasureOfValueChecked"></input>
              <span class="switchslider round"></span>
            </label>
          */
          var innerHTMLString = '<strong>Ausreißer gesondert markieren</strong> &nbsp;';
          innerHTMLString += "<label class='switch' title='Ausreißer gesondert darstellen'>";
          innerHTMLString += "<input id='controlIndicatorOutlierDetection' type='checkbox' value='useOutlierDetection'";
          if (kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {
            innerHTMLString += " checked";
          }
          innerHTMLString += ">";
          innerHTMLString += "<span class='switchslider round'></span>";
          innerHTMLString += '</label>';
          innerHTMLString += '<br/>';
          innerHTMLString += '<br/>';

          return innerHTMLString;
        };

        function makeOutliersLowLegendString(outliersArray) {
          if (outliersArray.length > 1) {

            return "(" + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(outliersArray[0]) + " &ndash; " + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(outliersArray[outliersArray.length - 1]) + ")";
          }
          else {
            return "(" + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(outliersArray[0]) + ")";
          }
        }

        function makeOutliersHighLegendString(outliersArray) {
          if (outliersArray.length > 1) {
            return "(" + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(outliersArray[0]) + " &ndash; " + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(outliersArray[outliersArray.length - 1]) + ")";
          }
          else {
            return "(" + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(outliersArray[0]) + ")";
          }
        }

        $scope.registerEventListenersForLegend = function () {
          // Disable dragging when user's cursor enters the element
          $scope.legendControl.getContainer().addEventListener('mouseover', function () {
            $scope.map.dragging.disable();
            $scope.map.touchZoom.disable();
            $scope.map.doubleClickZoom.disable();
            $scope.map.scrollWheelZoom.disable();
          });

          // Re-enable dragging when user's cursor leaves the element
          $scope.legendControl.getContainer().addEventListener('mouseout', function () {
            $scope.map.dragging.enable();
            $scope.map.touchZoom.enable();
            $scope.map.doubleClickZoom.enable();
            $scope.map.scrollWheelZoom.enable();
          });
        };

        $scope.makeDefaultLegend = function (defaultClassificationMapping, containsNegativeValues) {

          if (!$scope.showLegendControl) {
            try {
              toggleLegendControl();
            }
            catch (error) {
            }
          }

          if ($scope.legendControl) {
            try {
              $scope.map.removeControl($scope.legendControl);
              $scope.legendControl = undefined;
            }
            catch (error) {
            }
          }

          var dateComponents = $scope.date.split("-");
          var dateAsDate = new Date(Number(dateComponents[0]), Number(dateComponents[1]) - 1, Number(dateComponents[2]));

          $scope.legendControl = L.control({ position: 'bottomright' });

          $scope.legendControl.onAdd = function (map) {

            $scope.div = L.DomUtil.create('div', 'legendMap');


            $scope.div.id = "legendControl";

            $scope.div.innerHTML = $scope.appendLegendCloseButton();
            var opacity = 1;
            if ($scope.useTransparencyOnIndicator) {
              opacity = defaultFillOpacity;
            }

            $scope.div.innerHTML += '<div>';

            // loop through our density intervals and generate a label with a colored square for each interval
            // for (var i = 0; i < labels.length; i++) {
            //     $scope.div.innerHTML +=
            //         '<i style="background:' + $scope.defaultBrew.getColorInRange(labels[i] + 1) + '"></i> ' +
            //         labels[i] + (labels[i + 1] ? ' &ndash; &lt; ' + labels[i + 1] + '<br>' : '+');
            // }

            $scope.div.innerHTML += "<h4><b>Indikatorenlegende</b><br/>" + kommonitorDataExchangeService.getIndicatorStringFromIndicatorType($scope.currentIndicatorMetadataAndGeoJSON.indicatorType) + "</h4><br/><em>Darstellung der Indikatorenwerte zum gew&auml;hlten Zeitpunkt " + tsToDate_fullYear(dateToTS(dateAsDate)) + "</em><br/><br/>";

            $scope.div.innerHTML += $scope.appendClassifyRadioOptions();

            $scope.div.innerHTML += "<label>Einheit: </label> " + $scope.indicatorUnit + "<br/>";

            if ($scope.currentIndicatorMetadataAndGeoJSON.interpretation && $scope.currentIndicatorMetadataAndGeoJSON.interpretation != "") {
              $scope.div.innerHTML += $scope.appendInterpretation();
            }

            if ($scope.containsOutliers_low || $scope.containsOutliers_high) {
              $scope.div.innerHTML += $scope.appendOutliersCheckbox();
            }

            if ($scope.currentIndicatorContainsNoDataValues) {
              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_noData + '</i> ' +
                "Leerwert <br/>";
            }

            var useFilteredOrZeroOrOutlierValues = false;

            if ($scope.containsOutliers_low && kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {

              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_outlierLow + '</i> ' +
                "untere Ausrei&szlig;er " + makeOutliersLowLegendString($scope.outliers_low) + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }
            if ($scope.containsOutliers_high && kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {

              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_outlierHigh + '</i> ' +
                "obere Ausrei&szlig;er " + makeOutliersHighLegendString($scope.outliers_high) + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.length > 0) {
              $scope.div.innerHTML +=
                '<i style="background:' + defaultColorForFilteredValues + '; border: 2px solid ' + defaultBorderColorForFilteredValues + '; opacity: ' + opacity + ';"></i> ' +
                "gefilterte Features" + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if (containsNegativeValues) {
              // dynamic legend creation depending on number of positive and negative classes
              if ($scope.dynamicDecreaseBrew) {
                var labelsDynamicDecrease = $scope.dynamicDecreaseBrew.breaks;
                var colorsDynamicDecrease = $scope.dynamicDecreaseBrew.colors;

                $scope.div.innerHTML += "<label>Werte < 0</label><br/>";

                // invert color labeling as colorization of lT features is also inverted
                for (var i = 0; i < colorsDynamicDecrease.length; i++) {
                  $scope.div.innerHTML +=
                    '<i style="background:' + colorsDynamicDecrease[colorsDynamicDecrease.length - 1 - i] + '; opacity: ' + opacity + ';"></i> ' +
                    kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicDecrease[i]) + (typeof labelsDynamicDecrease[i + 1] != 'undefined' ? ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicDecrease[i + 1]) + '<br>' : ' &ndash; &lt; 0');
                }

              }

              if ($scope.currentIndicatorContainsZeroValues) {
                $scope.div.innerHTML += "<br/>";
                $scope.div.innerHTML +=
                  '<i style="background:' + $scope.defaultColorForZeroValues + '; opacity: ' + opacity + ';"></i> ' +
                  "0" + '</br>';
              }

              if ($scope.dynamicIncreaseBrew) {
                $scope.div.innerHTML += "<br/>";
                var labelsDynamicIncrease = $scope.dynamicIncreaseBrew.breaks;
                var colorsDynamicIncrease = $scope.dynamicIncreaseBrew.colors;

                $scope.div.innerHTML += "<label>Werte > 0</label><br/>";

                // invert color labeling as colorization of lT features is also inverted
                for (var k = 0; k < colorsDynamicIncrease.length; k++) {
                  $scope.div.innerHTML +=
                    '<i style="background:' + colorsDynamicIncrease[k] + '; opacity: ' + opacity + ';"></i> ' +
                    kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicIncrease[k]) + (typeof labelsDynamicIncrease[k + 1] === 'undefined' ? '' : ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicIncrease[k + 1]) + '<br>');
                }
                $scope.div.innerHTML += "<br/>";
              }

            }
            else {
              //TODO FIXME defaultCustomRating comes in the wrong order! inspect that behaviour server-side

              if ($scope.currentIndicatorContainsZeroValues) {
                $scope.div.innerHTML +=
                  '<i style="background:' + $scope.defaultColorForZeroValues + '; opacity: ' + opacity + ';"></i> ' +
                  "0" + '<br/>';
                useFilteredOrZeroOrOutlierValues = true;
              }

              if (useFilteredOrZeroOrOutlierValues) {
                $scope.div.innerHTML += '<br/>';
              }

              var labels = $scope.defaultBrew.getBreaks();
              var colors = $scope.defaultBrew.getColors();

              for (var j = 0; j < colors.length; j++) {
                $scope.div.innerHTML +=
                  // '<i style="background:' + colors[i] + '"></i> ' +
                  // defaultClassificationMapping.items[defaultClassificationMapping.items.length - 1 - i].defaultCustomRating + ' (' + (+labels[i].toFixed(numberOfDecimals)) + ((+labels[i + 1]) ? ' &ndash; &lt; ' + (+labels[i + 1].toFixed(numberOfDecimals)) + ') <br>' : '+');
                  '<i style="background:' + colors[j] + '; opacity: ' + opacity + ';"></i> ' +
                  kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labels[j]) + (kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labels[j + 1]) ? ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labels[j + 1]) + ' <br>' : '+');
              }
            }

            $scope.div.innerHTML += '</div>';

            return $scope.div;
          };

          $scope.legendControl.addTo($scope.map);

          $scope.registerEventListenersForLegend();
        };

        $scope.makeDynamicIndicatorLegend = function () {

          if (!$scope.showLegendControl) {
            try {
              toggleLegendControl();
            }
            catch (error) {
            }
          }

          if ($scope.legendControl) {
            try {
              $scope.map.removeControl($scope.legendControl);
              $scope.legendControl = undefined;
            }
            catch (error) {
            }
          }

          var opacity = 1;
          if ($scope.useTransparencyOnIndicator) {
            opacity = defaultFillOpacity;
          }

          $scope.legendControl = L.control({ position: 'bottomright' });

          $scope.legendControl.onAdd = function (map) {

            $scope.div = L.DomUtil.create('div', 'legendMap');
            $scope.div.id = "legendControl";

            $scope.div.innerHTML = $scope.appendLegendCloseButton();
            $scope.div.innerHTML += '<div>';

            if ($scope.currentIndicatorMetadataAndGeoJSON['fromDate']) {
              $scope.div.innerHTML += "<h4><b>Indikatorenlegende</b><br/>" + kommonitorDataExchangeService.getIndicatorStringFromIndicatorType($scope.currentIndicatorMetadataAndGeoJSON.indicatorType) + "</h4><br/>";
              $scope.div.innerHTML += "<em>Bilanzierung " + $scope.currentIndicatorMetadataAndGeoJSON['fromDate'] + " - " + $scope.currentIndicatorMetadataAndGeoJSON['toDate'] + "</em><br/><br/>";
            }
            else {

              var dateComponents = $scope.date.split("-");
              var dateAsDate = new Date(Number(dateComponents[0]), Number(dateComponents[1]) - 1, Number(dateComponents[2]));
              $scope.div.innerHTML += "<h4><b>Indikatorenlegende</b><br/>" + kommonitorDataExchangeService.getIndicatorStringFromIndicatorType($scope.currentIndicatorMetadataAndGeoJSON.indicatorType) + "</h4><br/><em>Darstellung der zeitlichen Entwicklung zum gew&auml;hlten Zeitpunkt " + tsToDate_fullYear(dateToTS(dateAsDate)) + "</em><br/><br/>";
            }

            $scope.div.innerHTML += $scope.appendClassifyRadioOptions();

            $scope.div.innerHTML += "<label>Einheit: </label> " + $scope.indicatorUnit + "<br/>";

            if ($scope.currentIndicatorMetadataAndGeoJSON.interpretation && $scope.currentIndicatorMetadataAndGeoJSON.interpretation != "") {
              $scope.div.innerHTML += $scope.appendInterpretation();
            }

            if ($scope.containsOutliers_low || $scope.containsOutliers_high) {
              $scope.div.innerHTML += $scope.appendOutliersCheckbox();
            }

            if ($scope.currentIndicatorContainsNoDataValues) {
              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_noData + '</i> ' +
                "Leerwert <br/>";
            }

            var useFilteredOrZeroOrOutlierValues = false;

            if ($scope.containsOutliers_low && kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {

              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_outlierLow + '</i> ' +
                "untere Ausrei&szlig;er " + makeOutliersLowLegendString($scope.outliers_low) + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }
            if ($scope.containsOutliers_high && kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {

              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_outlierHigh + '</i> ' +
                "obere Ausrei&szlig;er " + makeOutliersHighLegendString($scope.outliers_high) + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.length > 0) {
              $scope.div.innerHTML +=
                '<i style="background:' + defaultColorForFilteredValues + '; border: 2px solid ' + defaultBorderColorForFilteredValues + '; opacity: ' + opacity + ';"></i> ' +
                "gefilterte Features" + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if (useFilteredOrZeroOrOutlierValues) {
              $scope.div.innerHTML += '<br/>';
            }

            // dynamic legend creation depending on number of positive and negative classes
            if ($scope.dynamicDecreaseBrew) {
              var labelsDynamicDecrease = $scope.dynamicDecreaseBrew.breaks;
              var colorsDynamicDecrease = $scope.dynamicDecreaseBrew.colors;

              $scope.div.innerHTML += "<label>Abnahme</label><br/>";

              // invert color labeling as colorization of lT features is also inverted
              for (var i = 0; i < colorsDynamicDecrease.length; i++) {
                $scope.div.innerHTML +=
                  '<i style="background:' + colorsDynamicDecrease[colorsDynamicDecrease.length - 1 - i] + '; opacity: ' + opacity + ';"></i> ' +
                  kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicDecrease[i]) + (typeof labelsDynamicDecrease[i + 1] != 'undefined' ? ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicDecrease[i + 1]) + '<br>' : ' &ndash; &lt; 0');
              }

            }

            if ($scope.currentIndicatorContainsZeroValues) {
              $scope.div.innerHTML += "<br/>";
              $scope.div.innerHTML +=
                '<i style="background:' + $scope.defaultColorForZeroValues + '; opacity: ' + opacity + ';"></i> ' +
                "0" + '</br>';
            }

            if ($scope.dynamicIncreaseBrew) {
              $scope.div.innerHTML += "<br/>";
              var labelsDynamicIncrease = $scope.dynamicIncreaseBrew.breaks;
              var colorsDynamicIncrease = $scope.dynamicIncreaseBrew.colors;

              $scope.div.innerHTML += "<label>Zunahme</label><br/>";

              // invert color labeling as colorization of lT features is also inverted
              for (var k = 0; k < colorsDynamicIncrease.length; k++) {
                $scope.div.innerHTML +=
                  '<i style="background:' + colorsDynamicIncrease[k] + '; opacity: ' + opacity + ';"></i> ' +
                  kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicIncrease[k]) + (typeof labelsDynamicIncrease[k + 1] === 'undefined' ? '' : ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsDynamicIncrease[k + 1]) + '<br>');
              }
              $scope.div.innerHTML += "<br/>";
            }

            $scope.div.innerHTML += '</div>';

            return $scope.div;
          };

          $scope.legendControl.addTo($scope.map);

          $scope.registerEventListenersForLegend();

        };

        $scope.makeMeasureOfValueLegend = function () {

          if (!$scope.showLegendControl) {
            try {
              toggleLegendControl();
            }
            catch (error) {
            }
          }

          if ($scope.legendControl) {
            try {
              $scope.map.removeControl($scope.legendControl);
              $scope.legendControl = undefined;
            }
            catch (error) {
            }
          }

          var opacity = 1;
          if ($scope.useTransparencyOnIndicator) {
            opacity = defaultFillOpacity;
          }

          var dateComponents = $scope.date.split("-");
          var dateAsDate = new Date(Number(dateComponents[0]), Number(dateComponents[1]) - 1, Number(dateComponents[2]));

          $scope.legendControl = L.control({ position: 'bottomright' });

          $scope.legendControl.onAdd = function (map) {

            $scope.div = L.DomUtil.create('div', 'legendMap');
            $scope.div.id = "legendControl";

            $scope.div.innerHTML = $scope.appendLegendCloseButton();
            $scope.div.innerHTML += '<div>';

            $scope.div.innerHTML += "<h4><b>Indikatorenlegende</b><br/>" + kommonitorDataExchangeService.getIndicatorStringFromIndicatorType($scope.currentIndicatorMetadataAndGeoJSON.indicatorType) + "</h4><br/><em>Schwellwert-Klassifizierung<br/>Gew&auml;hlter Zeitpunkt: " + tsToDate_fullYear(dateToTS(dateAsDate)) + "</em><br/>";

            $scope.div.innerHTML += "<em>aktueller Schwellwert: </em> " + kommonitorDataExchangeService.measureOfValue + "<br/><br/>";

            $scope.div.innerHTML += $scope.appendClassifyRadioOptions();
            $scope.div.innerHTML += "<label>Einheit: </label> " + $scope.indicatorUnit + "<br/>";
            if ($scope.currentIndicatorMetadataAndGeoJSON.interpretation && $scope.currentIndicatorMetadataAndGeoJSON.interpretation != "") {
              $scope.div.innerHTML += $scope.appendInterpretation();
            }

            if ($scope.containsOutliers_low || $scope.containsOutliers_high) {
              $scope.div.innerHTML += $scope.appendOutliersCheckbox();
            }

            if ($scope.currentIndicatorContainsNoDataValues) {
              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_noData + '</i> ' +
                "Leerwert <br/>";
            }

            var useFilteredOrZeroOrOutlierValues = false;

            if ($scope.containsOutliers_low && kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {

              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_outlierLow + '</i> ' +
                "untere Ausrei&szlig;er " + makeOutliersLowLegendString($scope.outliers_low) + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }
            if ($scope.containsOutliers_high && kommonitorDataExchangeService.useOutlierDetectionOnIndicator) {

              $scope.div.innerHTML +=
                // '<i style="opacity: ' + opacity + ';">' + svgString + '</i> ' +
                '<i>' + $scope.svgString_outlierLow + '</i> ' +
                "obere Ausrei&szlig;er " + makeOutliersHighLegendString($scope.outliers_high) + '<br/>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.length > 0) {
              $scope.div.innerHTML +=
                '<i style="background:' + defaultColorForFilteredValues + '; border: 2px solid ' + defaultBorderColorForFilteredValues + '; opacity: ' + opacity + ';"></i> ' +
                "gefilterte Features" + '</br>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if ($scope.currentIndicatorContainsZeroValues) {
              $scope.div.innerHTML +=
                '<i style="background:' + $scope.defaultColorForZeroValues + '; opacity: ' + opacity + ';"></i> ' +
                "0" + '<br>';
              useFilteredOrZeroOrOutlierValues = true;
            }

            if (useFilteredOrZeroOrOutlierValues) {
              $scope.div.innerHTML += '<br/>';
            }

            // loop through our density intervals and generate a label with a colored square for each interval
            // for (var i = 0; i < labels.length; i++) {
            //     $scope.div.innerHTML +=
            //         '<i style="background:' + $scope.defaultBrew.getColorInRange(labels[i] + 1) + '"></i> ' +
            //         labels[i] + (labels[i + 1] ? ' &ndash; &lt; ' + labels[i + 1] + '<br>' : '+');
            // }

            if ($scope.ltMeasureOfValueBrew) {
              var labelsLtMeasureOfValue = $scope.ltMeasureOfValueBrew.breaks;
              var colorsLtMeasureOfValue = $scope.ltMeasureOfValueBrew.colors;
              $scope.div.innerHTML += "<label>Features < Schwellwert</label><br/>";

              // var labelArray_below = ["deutlich kleiner Schwellwert", "moderat kleiner Schwellwert", "geringfügig kleiner Schwellwert"];
              // var labelArray_upper = ["geringfügig über Schwellwert", "moderat über Schwellwert", "deutlich über Schwellwert"];

              // invert color labeling as colorization of lT features is also inverted
              // for (var i = 0; i < colorsLtMeasureOfValue.length; i++) {
              //     $scope.div.innerHTML +=
              //         '<i style="background:' + colorsLtMeasureOfValue[colorsLtMeasureOfValue.length - 1 - i] + '"></i> ' +
              //         //(+labelsLtMeasureOfValue[i].toFixed(4)) + ((+labelsLtMeasureOfValue[i + 1].toFixed(4)) ? ' &ndash; &lt; ' + (+labelsLtMeasureOfValue[i + 1].toFixed(4)) + '<br>' : '+');
              //         labelArray_below[i] + ' (' + (+labelsLtMeasureOfValue[i].toFixed(numberOfDecimals)) + ((+labelsLtMeasureOfValue[i + 1]) ? ' &ndash; &lt; ' + (+labelsLtMeasureOfValue[i + 1].toFixed(numberOfDecimals)) + ') <br>' : '+');
              // }
              for (var i = 0; i < colorsLtMeasureOfValue.length; i++) {
                $scope.div.innerHTML +=
                  '<i style="background:' + colorsLtMeasureOfValue[colorsLtMeasureOfValue.length - 1 - i] + '; opacity: ' + opacity + ';"></i> ' +
                  kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsLtMeasureOfValue[i]) + (typeof labelsLtMeasureOfValue[i + 1] === 'undefined' ? '' : ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsLtMeasureOfValue[i + 1]) + '</br>');
              }

              $scope.div.innerHTML += "<br/>";
            }

            if ($scope.gtMeasureOfValueBrew) {
              var labelsGtMeasureOfValue = $scope.gtMeasureOfValueBrew.breaks;
              var colorsGtMeasureOfValue = $scope.gtMeasureOfValueBrew.colors;

              $scope.div.innerHTML += "<label>Features >= Schwellwert</label><br/>";

              // for (var i = 0; i < colorsGtMeasureOfValue.length; i++) {
              //     $scope.div.innerHTML +=
              //         '<i style="background:' + colorsGtMeasureOfValue[i] + '"></i> ' +
              //         labelArray_upper[i] + ' (' + (+labelsGtMeasureOfValue[i].toFixed(numberOfDecimals)) + ((+labelsGtMeasureOfValue[i + 1]) ? ' &ndash; &lt; ' + (+labelsGtMeasureOfValue[i + 1].toFixed(numberOfDecimals)) + ') <br>' : '+');
              // }
              for (var k = 0; k < colorsGtMeasureOfValue.length; k++) {
                $scope.div.innerHTML +=
                  '<i style="background:' + colorsGtMeasureOfValue[k] + '; opacity: ' + opacity + ';"></i> ' +
                  kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsGtMeasureOfValue[k]) + (typeof labelsGtMeasureOfValue[k + 1] === 'undefined' ? '' : ' &ndash; &lt; ' + kommonitorDataExchangeService.getIndicatorValue_asFormattedText(labelsGtMeasureOfValue[k + 1]) + '<br>');
              }
            }

            $scope.div.innerHTML += '</div>';

            return $scope.div;
          };

          $scope.legendControl.addTo($scope.map);
          $scope.registerEventListenersForLegend();

        };

        /**
         * binds the popup of a clicked output
         * to layer.feature.properties.popupContent
         */
        function onEachFeatureSpatialUnit(feature, layer) {
          // does this feature have a property named popupContent?
          layer.on({
            click: function () {

              // var propertiesString = "<pre>" + JSON.stringify(feature.properties, null, ' ').replace(/[\{\}"]/g, '') + "</pre>";

              var popupContent = '<div class="spatialUnitInfoPopupContent featurePropertyPopupContent"><table class="table table-condensed">';
              for (var p in feature.properties) {
                  popupContent += '<tr><td>' + p + '</td><td>'+ feature.properties[p] + '</td></tr>';
              }
              popupContent += '</table></div>';

              layer.bindPopup(popupContent);              

              // if (propertiesString)
              //   layer.bindPopup(propertiesString);
            }
          });
        }

        /**
         * binds the popup of a clicked output
         * to layer.feature.properties.popupContent
         */
        function onEachFeatureGeoresource(feature, layer) {
          // does this feature have a property named popupContent?
          layer.on({
            click: function () {

              var popupContent = '<div class="georesourceInfoPopupContent featurePropertyPopupContent"><table class="table table-condensed">';
              for (var p in feature.properties) {
                  popupContent += '<tr><td>' + p + '</td><td>'+ feature.properties[p] + '</td></tr>';
              }
              popupContent += '</table></div>';

              layer.bindPopup(popupContent);

              // var propertiesString = "<pre>" + JSON.stringify(feature.properties, null, ' ').replace(/[\{\}"]/g, '') + "</pre>";

              // if (propertiesString)
              //   layer.bindPopup(propertiesString);
            }
          });
        }

        /**
         * binds the popup of a clicked output
         * to layer.feature.properties.popupContent
         */
        function onEachFeatureIndicator(feature, layer) {
          var indicatorValue = feature.properties[INDICATOR_DATE_PREFIX + $scope.date];
          var indicatorValueText;
          if (kommonitorDataExchangeService.indicatorValueIsNoData(indicatorValue)) {
            indicatorValueText = "NoData";
          }
          else {
            indicatorValueText = kommonitorDataExchangeService.getIndicatorValue_asFormattedText(indicatorValue);
          }
          var tooltipHtml = "<b>" + feature.properties[__env.FEATURE_NAME_PROPERTY_NAME] + "</b><br/>" + indicatorValueText + " [" + kommonitorDataExchangeService.selectedIndicator.unit + "]";
          layer.bindTooltip(tooltipHtml, {
            sticky: true // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
          });
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: function () {
              switchHighlightFeature(layer);
            }
          });
        }



        function switchHighlightFeature(layer) {
          // add or remove feature within a list of "clicked features"
          // those shall be treated specially, i.e. keep being highlighted
          if (!kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
            kommonitorDataExchangeService.clickedIndicatorFeatureNames.push(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME]);
            highlightClickedFeature(layer);
          }

          else {
            //remove from array
            var index = kommonitorDataExchangeService.clickedIndicatorFeatureNames.indexOf(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME]);
            kommonitorDataExchangeService.clickedIndicatorFeatureNames.splice(index, 1);
            resetHighlightClickedFeature(layer);
          }
        }

        function onEachFeatureCustomIndicator(feature, layer) {
          // does this feature have a property named popupContent?
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlightCustom,
            click: function () {

              var popupContent = layer.feature.properties;

              if (popupContent)
                layer.bindPopup("Indicator: " + JSON.stringify(popupContent));
            }
          });
        }


        $scope.$on("addSpatialUnitAsGeopackage", function (event) {

          console.log('addSpatialUnitAsGeopackage was called');

          var layer = L.geoPackageFeatureLayer([], {
            geoPackageUrl: './test1234.gpkg',
            layerName: 'test1234',
            style: function (feature) {
              return {
                color: "#F00",
                weight: 1,
                opacity: 1
              };
            },
            onEachFeature: onEachFeatureSpatialUnit
          });

          // layer.StyledLayerControl = {
          // 	removable : true,
          // 	visible : true
          // };

          $scope.layerControl.addOverlay(layer, "GeoPackage", { groupName: spatialUnitLayerGroupName });
          layer.addTo($scope.map);
          $scope.updateSearchControl();


        });

        $scope.$on("addSpatialUnitAsGeoJSON", function (event, spatialUnitMetadataAndGeoJSON, date) {

          console.log('addSpatialUnitAsGeoJSON was called');

          // if ($scope.layers.overlays[spatialUnitMetadataAndGeoJSON.spatialUnitLevel]) {
          //     delete $scope.layers.overlays[spatialUnitMetadataAndGeoJSON.spatialUnitLevel];
          //
          //     console.log($scope.layers.overlays);
          // }

          var layer = L.geoJSON(spatialUnitMetadataAndGeoJSON.geoJSON, {
            style: function (feature) {
              return {
                color: "blue",
                weight: 1,
                opacity: 1
              };
            },
            onEachFeature: onEachFeatureSpatialUnit
          });

          // layer.StyledLayerControl = {
          // 	removable : true,
          // 	visible : true
          // };

          $scope.layerControl.addOverlay(layer, spatialUnitMetadataAndGeoJSON.spatialUnitLevel + "_" + date, spatialUnitLayerGroupName);
          layer.addTo($scope.map);
          $scope.updateSearchControl();

        });

        $scope.$on("addGeoresourceAsGeoJSON", function (event, georesourceMetadataAndGeoJSON, date) {

          var layer = L.geoJSON(georesourceMetadataAndGeoJSON.geoJSON, {
            style: function (feature) {
              return {
                color: "red",
                weight: 1,
                opacity: 1
              };
            },
            onEachFeature: onEachFeatureGeoresource
          });

          // layer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay(layer, georesourceMetadataAndGeoJSON.datasetName + "_" + date, georesourceLayerGroupName);
          layer.addTo($scope.map);
          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        });

        $scope.$on("replaceIsochronesAsGeoJSON", function (event, geoJSON, transitMode, reachMode, cutOffValues, useMultipleStartPoints, dissolveIsochrones) {

          if ($scope.isochronesLayer) {
            $scope.layerControl.removeLayer($scope.isochronesLayer);
            $scope.map.removeLayer($scope.isochronesLayer);
          }

          $scope.isochronesLayer = L.featureGroup();

          $scope.isochroneReachMode = reachMode;
          var cutOffUnitValue = "Meter";
          var reachModeValue = "Distanz";
          if (reachMode === "time") {
            cutOffUnitValue = "Minuten";
            reachModeValue = "Zeit";
          }

          var transitModeValue = "Passant";
          switch (transitMode) {
            case "cycling-regular":
              transitModeValue = "Fahrrad";
              break;
            case "driving-car":
              transitModeValue = "PKW";
              break;
            case "wheelchair":
              transitModeValue = "Barrierefrei";
              break;
            default:
              transitModeValue = "Passant";
          }

          kommonitorDataExchangeService.isochroneLegend = {
            transitMode: transitModeValue,
            reachMode: reachModeValue,
            colorValueEntries: [],
            cutOffValues: cutOffValues,
            cutOffUnit: cutOffUnitValue
          };

          if (cutOffValues.length === 0) {
            return;
          }
          else if (cutOffValues.length === 1) {
            kommonitorDataExchangeService.isochroneLegend.colorValueEntries = [{
              color: "green",
              value: cutOffValues[0]
            }];
          }
          else if (cutOffValues.length === 2) {
            kommonitorDataExchangeService.isochroneLegend.colorValueEntries = [{
              color: "yellow",
              value: cutOffValues[1]
            },
            {
              color: "green",
              value: cutOffValues[0]
            }];
          }
          else if (cutOffValues.length === 3) {
            kommonitorDataExchangeService.isochroneLegend.colorValueEntries = [{
              color: "red",
              value: cutOffValues[2]
            },
            {
              color: "yellow",
              value: cutOffValues[1]
            },
            {
              color: "green",
              value: cutOffValues[0]
            }];
          }
          else if (cutOffValues.length === 4) {
            kommonitorDataExchangeService.isochroneLegend.colorValueEntries = [{
              color: "red",
              value: cutOffValues[3]
            },
            {
              color: "orange",
              value: cutOffValues[2]
            },
            {
              color: "yellow",
              value: cutOffValues[1]
            },
            {
              color: "green",
              value: cutOffValues[0]
            }];
          }
          else if (cutOffValues.length === 5) {
            kommonitorDataExchangeService.isochroneLegend.colorValueEntries = [{
              color: "brown",
              value: cutOffValues[4]
            }, {
              color: "red",
              value: cutOffValues[3]
            },
            {
              color: "orange",
              value: cutOffValues[2]
            },
            {
              color: "yellow",
              value: cutOffValues[1]
            },
            {
              color: "green",
              value: cutOffValues[0]
            }];
          }
          else {
            kommonitorDataExchangeService.isochroneLegend.colorValueEntries = [{
              color: "brown",
              value: cutOffValues[4]
            }, {
              color: "red",
              value: cutOffValues[3]
            },
            {
              color: "orange",
              value: cutOffValues[2]
            },
            {
              color: "yellow",
              value: cutOffValues[1]
            },
            {
              color: "green",
              value: cutOffValues[0]
            }];
          }

          if (useMultipleStartPoints && dissolveIsochrones) {
            // merge intersecting isochrones of same cutOffValue

            // execute it 3 times in order to dissolve multiple intersections
            geoJSON = mergeIntersectingIsochrones(geoJSON);
            geoJSON = mergeIntersectingIsochrones(geoJSON);
            geoJSON = mergeIntersectingIsochrones(geoJSON);
          }

          // sort features to ensure correct z-order of layers (begin with smallest isochrones)
          geoJSON.features.sort((a, b) => a.properties.value - b.properties.value);

          for (var index = geoJSON.features.length - 1; index >= 0; index--) {

            var styleIndex = getStyleIndexForFeature(geoJSON.features[index], kommonitorDataExchangeService.isochroneLegend.colorValueEntries, reachMode);

            var style = {
              color: kommonitorDataExchangeService.isochroneLegend.colorValueEntries[styleIndex].color,
              weight: 1,
              opacity: 0.4,
              fillOpacity: 0.3
            };

            L.geoJSON(geoJSON.features[index], {
              style: style,
              onEachFeature: function (feature, layer) {
                layer.on({
                  click: function () {

                    var isochroneValue = layer.feature.properties.value;

                    if ($scope.isochroneReachMode === "time") {
                      //transform seconds to minutes
                      isochroneValue = isochroneValue / 60;
                    }
                    var popupContent = "" + isochroneValue + " " + cutOffUnitValue;
                    // var popupContent = "TestValue";

                    if (popupContent)
                      layer.bindPopup("Isochrone: " + JSON.stringify(popupContent));
                  }
                });
              }
            }).addTo($scope.isochronesLayer);
          }

          // $scope.isochronesLayer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay($scope.isochronesLayer, "Erreichbarkeits-Isochronen_" + transitModeValue, reachabilityLayerGroupName);
          $scope.isochronesLayer.addTo($scope.map);
          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        });

        $scope.$on("replaceRouteAsGeoJSON", function (event, geoJSON, transitMode, preference, routingStartPoint, routingEndPoint) {

          if ($scope.routingLayer) {
            $scope.layerControl.removeLayer($scope.routingLayer);
            $scope.map.removeLayer($scope.routingLayer);
          }

          var preferenceValue = "Schnellste";
          if (preference === "recommended") {
            preferenceValue = "Empfohlen";
          }
          else if (preference === "shortest") {
            preferenceValue = "Kürzeste";
          }

          var transitModeValue = "Passant";
          switch (transitMode) {
            case "cycling-regular":
              transitModeValue = "Fahrrad";
              break;
            case "driving-car":
              transitModeValue = "PKW";
              break;
            case "wheelchair":
              transitModeValue = "Barrierefrei";
              break;
            default:
              transitModeValue = "Passant";
          }

          kommonitorDataExchangeService.routingLegend = {
            transitMode: transitModeValue,
            preference: preferenceValue
          };

          var style = {
            color: "#ed561a",
            weight: 5,
            opacity: 0.7
          };

          $scope.routingLayer = L.featureGroup();

          // start and end point
          var customStartMarker = L.AwesomeMarkers.icon({
            icon: "home",
            iconColor: "white",
            markerColor: "green"
          });

          var customEndMarker = L.AwesomeMarkers.icon({
            icon: "screenshot",
            iconColor: "white",
            markerColor: "red"
          });

          var numPoints = geoJSON.features[0].geometry.coordinates.length;
          var startPoint = geoJSON.features[0].geometry.coordinates[0];
          var endPoint = geoJSON.features[0].geometry.coordinates[numPoints - 1];

          L.marker([startPoint[1], startPoint[0]], { icon: customStartMarker }).bindPopup(routingStartPoint.label).addTo($scope.routingLayer);
          L.marker([endPoint[1], endPoint[0]], { icon: customEndMarker }).bindPopup(routingEndPoint.label).addTo($scope.routingLayer);

          L.geoJSON(geoJSON, {
            style: style,
            onEachFeature: function (feature, layer) {
              layer.on({
                click: function () {
                  var popupContent = "Routing Ergebnis - " + transitModeValue + " - " + preferenceValue;
                  // var popupContent = "TestValue";

                  if (popupContent)
                    layer.bindPopup(JSON.stringify(popupContent));
                }
              });
            }
          }).addTo($scope.routingLayer);

          // $scope.isochronesLayer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay($scope.routingLayer, "Routing-Ergebnis_" + transitModeValue + "_" + preferenceValue, reachabilityLayerGroupName);
          $scope.routingLayer.addTo($scope.map);
          $scope.map.fitBounds($scope.routingLayer.getBounds());
          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        });

        var getStyleIndexForFeature = function (feature, colorValueEntries, reachMode) {
          var index = 0;
          var featureCutOffValue = feature.properties.value;

          if (reachMode === "time") {
            // answe has time in seconds - we expect minutes!
            featureCutOffValue = featureCutOffValue / 60;
          }

          for (var i = 0; i < colorValueEntries.length; i++) {
            if (featureCutOffValue === colorValueEntries[i].value) {
              index = i;
              break;
            }
          }

          return index;
        };

        var mergeIntersectingIsochrones = function (geoJSON) {
          // use turf to dissolve any overlapping/intersecting isochrones that have the same cutOffValue!

          try {
            var dissolved = turf.dissolve(geoJSON, { propertyName: 'value' });

            return dissolved;
          } catch (e) {
            console.error("Dissolving Isochrones failed with error: " + e);
            console.error("Will return undissolved isochrones");
            return geoJSON;
          } finally {

          }

        };

        $scope.$on("replaceIsochroneMarker", function (event, lonLatArray) {

          if ($scope.isochroneMarkerLayer) {
            $scope.layerControl.removeLayer($scope.isochroneMarkerLayer);
            $scope.map.removeLayer($scope.isochroneMarkerLayer);
          }

          $scope.isochroneMarkerLayer = L.featureGroup();

          lonLatArray.forEach(function (lonLat) {
            var layer = L.marker([lonLat[1], lonLat[0]]);
            layer.bindPopup("Startpunkt der Isochronenberechnung");
            layer.addTo($scope.isochroneMarkerLayer);
          });

          $scope.layerControl.addOverlay($scope.isochroneMarkerLayer, "Startpunkte für Isochronenberechnung", reachabilityLayerGroupName);
          $scope.isochroneMarkerLayer.addTo($scope.map);
          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        });

        $scope.$on("addPoiGeoresourceAsGeoJSON", function (event, georesourceMetadataAndGeoJSON, date, useCluster) {

          // use leaflet.markercluster to cluster markers!
          var markers;
          if (useCluster) {
            markers = L.markerClusterGroup({
              iconCreateFunction: function (cluster) {
                var childCount = cluster.getChildCount();

                var c = 'cluster-';
                if (childCount < 10) {
                  c += 'small';
                } else if (childCount < 30) {
                  c += 'medium';
                } else {
                  c += 'large';
                }

                var className = "marker-cluster " + c + " awesome-marker-legend-TransparentIcon-" + georesourceMetadataAndGeoJSON.poiMarkerColor;

                //'marker-cluster' + c + ' ' +
                return new L.DivIcon({ html: '<div class="awesome-marker-legend-icon-' + georesourceMetadataAndGeoJSON.poiMarkerColor + '" ><span>' + childCount + '</span></div>', className: className, iconSize: new L.Point(40, 40) });
              }
            });
          }
          else {
            markers = L.layerGroup();
          }
          var customMarker;
          try {
            customMarker = L.AwesomeMarkers.icon({
              icon: georesourceMetadataAndGeoJSON.poiSymbolBootstrap3Name,
              iconColor: georesourceMetadataAndGeoJSON.poiSymbolColor,
              markerColor: georesourceMetadataAndGeoJSON.poiMarkerColor
            });
          } catch (err) {
            customMarker = L.AwesomeMarkers.icon({
              icon: 'home', // default back to home
              iconColor: georesourceMetadataAndGeoJSON.poiSymbolColor,
              markerColor: georesourceMetadataAndGeoJSON.poiMarkerColor
            });
          }

          georesourceMetadataAndGeoJSON.geoJSON.features.forEach(function (poiFeature) {
            // index 0 should be longitude and index 1 should be latitude
            //.bindPopup( poiFeature.properties.name )
            var newMarker = L.marker([Number(poiFeature.geometry.coordinates[1]), Number(poiFeature.geometry.coordinates[0])], { icon: customMarker });

            //populate the original geoJSOn feature to the marker layer!
            newMarker.feature = poiFeature;
            newMarker.metadataObject = georesourceMetadataAndGeoJSON;

            // var propertiesString = "<pre>" + JSON.stringify(poiFeature.properties, null, ' ').replace(/[\{\}"]/g, '') + "</pre>";

            var popupContent = '<div class="poiInfoPopupContent featurePropertyPopupContent"><table class="table table-condensed">';
              for (var p in poiFeature.properties) {
                  popupContent += '<tr><td>' + p + '</td><td>'+ poiFeature.properties[p] + '</td></tr>';
              }
              popupContent += '</table></div>';

            if (poiFeature.properties.name) {
              newMarker.bindPopup(poiFeature.properties.name + "\n\n" + popupContent);
            }
            else if (poiFeature.properties.NAME) {
              newMarker.bindPopup(poiFeature.properties.NAME + "\n\n" + popupContent);
            }
            else if (poiFeature.properties[__env.FEATURE_NAME_PROPERTY_NAME]) {
              newMarker.bindPopup(poiFeature.properties[__env.FEATURE_NAME_PROPERTY_NAME] + "\n\n" + popupContent);
            }
            else {
              // newMarker.bindPopup(propertiesString);
              newMarker.bindPopup(popupContent);
            }
            markers.addLayer(newMarker);
          });


          // markers.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay(markers, georesourceMetadataAndGeoJSON.datasetName + "_" + date, poiLayerGroupName);
          markers.addTo($scope.map);
          $scope.updateSearchControl();
          // $scope.map.addLayer( markers );
          $scope.map.invalidateSize(true);
        });

        $scope.$on("removePoiGeoresource", function (event, georesourceMetadataAndGeoJSON) {

          var layerName = georesourceMetadataAndGeoJSON.datasetName;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === poiLayerGroupName && layer.name.includes(layerName + "_")) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
              $scope.updateSearchControl();
            }
          });
        });

        $scope.$on("addAoiGeoresourceAsGeoJSON", function (event, georesourceMetadataAndGeoJSON, date) {

          var color = georesourceMetadataAndGeoJSON.aoiColor;

          var layer = L.geoJSON(georesourceMetadataAndGeoJSON.geoJSON, {
            style: function (feature) {
              return {
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
              };
            },
            onEachFeature: onEachFeatureGeoresource
          });

          // layer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay(layer, georesourceMetadataAndGeoJSON.datasetName + "_" + date, aoiLayerGroupName);
          layer.addTo($scope.map);
          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        });

        $scope.$on("removeAoiGeoresource", function (event, georesourceMetadataAndGeoJSON) {

          var layerName = georesourceMetadataAndGeoJSON.datasetName;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === aoiLayerGroupName && layer.name.includes(layerName + "_")) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
              $scope.updateSearchControl();
            }
          });
        });

        $scope.$on("addLoiGeoresourceAsGeoJSON", function (event, georesourceMetadataAndGeoJSON, date) {

          var color = georesourceMetadataAndGeoJSON.aoiColor;

          var featureGroup = L.featureGroup();

          var style = {
            color: georesourceMetadataAndGeoJSON.loiColor,
            dashArray: georesourceMetadataAndGeoJSON.loiDashArrayString,
            weight: 3,
            opacity: 1
          };



          georesourceMetadataAndGeoJSON.geoJSON.features.forEach((item, i) => {
            var type = item.geometry.type;

            if (type === "Polygon" || type === "MultiPolygon"){
              var lines = turf.polygonToLine(item);

              L.geoJSON(lines, {
                style: style,
                onEachFeature: onEachFeatureGeoresource
              }).addTo(featureGroup);
            }
            else{
              L.geoJSON(item, {
                style: style,
                onEachFeature: onEachFeatureGeoresource
              }).addTo(featureGroup);
            }
          });

          // georesourceMetadataAndGeoJSON.geoJSON.features.forEach((loiFeature, i) => {
          //   var latLngs =
          //   var polyline = L.polyline(loiFeature.geometry.coordinates);
          //
          //   var geoJSON = polyline.toGeoJSON();
          //
          //   var geoJSON_line = L.geoJSON(geoJSON, {
          //     style: style,
          //     onEachFeature: onEachFeatureGeoresource
          //   })
          //
          //   geoJSON_line.addTo(featureGroup);
          // });

          // layer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay(featureGroup, georesourceMetadataAndGeoJSON.datasetName + "_" + date, loiLayerGroupName);
          featureGroup.addTo($scope.map);
          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        });

        $scope.$on("removeLoiGeoresource", function (event, georesourceMetadataAndGeoJSON) {

          var layerName = georesourceMetadataAndGeoJSON.datasetName;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === loiLayerGroupName && layer.name.includes(layerName + "_")) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
              $scope.updateSearchControl();
            }
          });
        });

        $scope.$on("adjustOpacityForIndicatorLayer", function (event, indicatorMetadata, opacity) {
          // var layerName = indicatorMetadataAndGeoJSON.indicatorName;
          //
          // $scope.layerControl._layers.forEach(function(layer){
          //   if(layer.group.name === indicatorLayerGroupName && layer.name.includes(layerName)){
          //     layer.layer.setOpacity(opacity);
          //     layer.layer.setStyle({
          //       opacity: opacity
          //     });
          //   }
          // });

          opacity = opacity.toFixed(numberOfDecimals);

          // set transparency here
          document.getElementById("indicatorTransparencyLabel").innerHTML = (1 - opacity).toFixed(numberOfDecimals);
          kommonitorVisualStyleHelperService.setOpacity(opacity);
          $rootScope.$broadcast("restyleCurrentLayer", true);
        });

        $scope.$on("addWmsLayerToMap", function (event, dataset, opacity) {
          var wmsLayer = L.tileLayer.betterWms(dataset.url, {
            layers: dataset.layerName,
            transparent: true,
            format: 'image/png',
            minZoom: __env.minZoomLevel,
            maxZoom: __env.maxZoomLevel,
            opacity: opacity
          });

          $scope.layerControl.addOverlay(wmsLayer, dataset.title, wmsLayerGroupName);
          wmsLayer.addTo($scope.map);
          $scope.updateSearchControl();
          $scope.map.invalidateSize(true);
        });

        $scope.$on("adjustOpacityForWmsLayer", function (event, dataset, opacity) {
          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === wmsLayerGroupName && layer.name.includes(layerName)) {
              layer.layer.setOpacity(opacity);
            }
          });
        });

        $scope.$on("removeWmsLayerFromMap", function (event, dataset) {

          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === wmsLayerGroupName && layer.name.includes(layerName)) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
            }
          });
        });

        $scope.$on("addWfsLayerToMap", function (event, dataset, opacity) {
          var wfsLayerOptions = {
            url: dataset.url,
            typeNS: dataset.featureTypeNamespace,
            namespaceUri: "http://mapserver.gis.umn.edu/mapserver",
            typeName: dataset.featureTypeName,
            geometryField: dataset.featureTypeGeometryName,
            maxFeatures: null,
            style: {
              weight: 1,
              opacity: opacity,
              color: defaultBorderColor,
              dashArray: '',
              fillOpacity: 1,
              fillColor: dataset.displayColor
            }
          };

          if (dataset.filterFeaturesToMapBBOX) {
            wfsLayerOptions.filter = new L.Filter.BBox(dataset.featureTypeGeometryName, $scope.map.getBounds(), L.CRS.EPSG3857);
          }

          var wfsLayer = new L.WFS(wfsLayerOptions);

          try {
            wfsLayer.once('load', function () {

              console.log("Try to fit bounds on wfsLayer");
              $scope.map.fitBounds(wfsLayer.getBounds());

              console.log("Tried fit bounds on wfsLayer");

              //var geoJSON = layer.layertoGeoJSON();
              var firstLayersPropertyName = Object.keys(wfsLayer._layers)[0];
              if (firstLayersPropertyName) {
                var geoJSON_exmaple = wfsLayer._layers[firstLayersPropertyName].toGeoJSON();
                if (isLinearGeoJSON(geoJSON_exmaple)) {
                  var newStyle = {
                    color: dataset.displayColor
                  };

                  wfsLayer.setStyle(newStyle);

                }
              }
              $scope.map.invalidateSize(true);
              // $scope.loadingData = false;
            });

            wfsLayer.on('click', function (event) {
              // var propertiesString = "<pre>" + JSON.stringify(event.layer.feature.properties, null, ' ').replace(/[\{\}"]/g, '') + "</pre>";

              var popupContent = '<div class="wfsInfoPopupContent featurePropertyPopupContent"><table class="table table-condensed">';
              for (var p in event.layer.feature.properties) {
                  popupContent += '<tr><td>' + p + '</td><td>'+ event.layer.feature.properties[p] + '</td></tr>';
              }
              popupContent += '</table></div>';

              var popup = L.popup();
              popup
                .setLatLng(event.latlng)
                .setContent(popupContent)
                .openOn($scope.map);
            });
            $scope.layerControl.addOverlay(wfsLayer, dataset.title, wfsLayerGroupName);
            wfsLayer.addTo($scope.map);
            $scope.updateSearchControl();

          }
          catch (error) {
            // $scope.loadingData = false;
          }

        });

        $scope.$on("adjustOpacityForWfsLayer", function (event, dataset, opacity) {
          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === wfsLayerGroupName && layer.name.includes(layerName)) {
              // layer.layer.setOpacity(opacity);
              var newStyle = {
                weight: 1,
                opacity: opacity,
                color: defaultBorderColor,
                dashArray: '',
                fillOpacity: opacity,
                fillColor: dataset.displayColor
              };
              // layer.layer.options.style = newStyle;
              layer.layer.setStyle(newStyle);
            }
          });
        });

        $scope.$on("adjustColorForWfsLayer", function (event, dataset) {
          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === wfsLayerGroupName && layer.name.includes(layerName)) {
              var newStyle = {
                weight: 1,
                color: defaultBorderColor,
                dashArray: '',
                fillColor: dataset.displayColor
              };

              //var geoJSON = layer.layertoGeoJSON();
              var firstLayersPropertyName = Object.keys(layer.layer._layers)[0];
              if (firstLayersPropertyName) {
                var geoJSON_exmaple = layer.layer._layers[firstLayersPropertyName].toGeoJSON();
                if (isLinearGeoJSON(geoJSON_exmaple)) {
                  newStyle.color = dataset.displayColor;
                }
              }

              layer.layer.setStyle(newStyle);
            }
          });
        });

        $scope.$on("removeWfsLayerFromMap", function (event, dataset) {

          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === wfsLayerGroupName && layer.name.includes(layerName)) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
            }
          });
        });

        $scope.$on("addFileLayerToMap", function (event, dataset, opacity) {
          var fileLayer;

          var style = {
            weight: 1,
            opacity: opacity,
            color: defaultBorderColor,
            dashArray: '',
            fillOpacity: 1,
            fillColor: dataset.displayColor
          };

          var fileType = dataset.type;
          if (fileType.toUpperCase() === "geojson".toUpperCase()) {
            var geoJSON = dataset.content;

            if (isLinearGeoJSON(geoJSON)) {
              // when is line dataset then set the border color
              style.color = dataset.displayColor;
            }

            fileLayer = L.geoJSON(geoJSON, {
              style: style,
              onEachFeature: function (feature, layer) {
                layer.on({
                  click: function () {

                    // var propertiesString = "<pre>" + JSON.stringify(feature.properties, null, ' ').replace(/[\{\}"]/g, '') + "</pre>";

                    var popupContent = '<div class="fileInfoPopupContent featurePropertyPopupContent"><table class="table table-condensed">';
                    for (var p in feature.properties) {
                        popupContent += '<tr><td>' + p + '</td><td>'+ feature.properties[p] + '</td></tr>';
                    }
                    popupContent += '</table></div>';

                    if (popupContent)
                      layer.bindPopup(popupContent);
                  }
                });
              }
            });
            $scope.showFileLayer(fileLayer, dataset);
          }
          else if (fileType.toUpperCase() === "shp".toUpperCase()) {
            // transform shape ZIP arrayBuffer to GeoJSON
            // var geoJSON = await shp(dataset.content).then(
            // var zip = shp.parseZip(dataset.content);
            shp(dataset.content).then(
              function (geojson) {
                console.log("Shapefile parsed successfully");

                if (isLinearGeoJSON(geojson)) {
                  // when is line dataset then set the border color
                  style.color = dataset.displayColor;
                }

                fileLayer = L.geoJSON(geojson, {
                  style: style,
                  onEachFeature: function (feature, layer) {
                    layer.on({
                      click: function () {

                        // var propertiesString = "<pre>" + JSON.stringify(feature.properties, null, ' ').replace(/[\{\}"]/g, '') + "</pre>";

                        var popupContent = '<div class="fileInfoPopupContent featurePropertyPopupContent"><table class="table table-condensed">';
                        for (var p in feature.properties) {
                            popupContent += '<tr><td>' + p + '</td><td>'+ feature.properties[p] + '</td></tr>';
                        }
                        popupContent += '</table></div>';

                        if (popupContent)
                          layer.bindPopup(popupContent);
                      }
                    });
                  }
                });


                $scope.showFileLayer(fileLayer, dataset);
              },
              function (reason) {
                console.error("Error while parsing Shapefile");
                console.error(reason);
                $rootScope.$broadcast("FileLayerError", reason, dataset);
                throw reason;
              }
            );
          }

        });

        var isLinearGeoJSON = function (geoJSON) {
          if (geoJSON.features) {
            // featureCollection
            if (geoJSON.features[0].geometry) {
              if (geoJSON.features[0].geometry.type === "LineString" || geoJSON.features[0].geometry.type === "MultiLineString") {
                return true;
              }
            }
          }
          else if (geoJSON.geometry) {
            // single object
            if (geoJSON.geometry.type === "LineString" || geoJSON.geometry.type === "MultiLineString") {
              return true;
            }
          }
          else if (geoJSON.geometries) {
            // geometryCollection
            if (geoJSON.geometries[0].type === "LineString" || geoJSON.geometries[0].type === "MultiLineString") {
              return true;
            }
          }

          return false;
        };

        $scope.showFileLayer = function (fileLayer, dataset) {
          $scope.layerControl.addOverlay(fileLayer, dataset.title, fileLayerGroupName);
          fileLayer.addTo($scope.map);

          console.log("Try to fit bounds on fileLayer");
          $scope.map.fitBounds(fileLayer.getBounds());

          console.log("Tried fit bounds on fileLayer");

          $rootScope.$broadcast("FileLayerSuccess", dataset);

          $scope.updateSearchControl();

          $scope.map.invalidateSize(true);
        };

        $scope.$on("adjustOpacityForFileLayer", function (event, dataset, opacity) {
          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === fileLayerGroupName && layer.name.includes(layerName)) {
              var newStyle = {
                weight: 1,
                opacity: opacity,
                color: defaultBorderColor,
                dashArray: '',
                fillOpacity: opacity,
                fillColor: dataset.displayColor
              };

              // layer.layer.options.style = newStyle;
              layer.layer.setStyle(newStyle);
            }
          });
        });

        $scope.$on("adjustColorForFileLayer", function (event, dataset) {
          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === fileLayerGroupName && layer.name.includes(layerName)) {
              var newStyle = {
                weight: 1,
                color: defaultBorderColor,
                dashArray: '',
                fillColor: dataset.displayColor
              };

              //var geoJSON = layer.layertoGeoJSON();
              var firstLayersPropertyName = Object.keys(layer.layer._layers)[0];
              if (firstLayersPropertyName) {
                var geoJSON_exmaple = layer.layer._layers[firstLayersPropertyName].toGeoJSON();
                if (isLinearGeoJSON(geoJSON_exmaple)) {
                  newStyle.color = dataset.displayColor;
                }
              }

              layer.layer.setStyle(newStyle);
            }
          });
        });

        $scope.$on("removeFileLayerFromMap", function (event, dataset) {

          var layerName = dataset.title;

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === fileLayerGroupName && layer.name.includes(layerName)) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
            }
          });
        });

        $scope.$on("removeReachabilityLayers", function (event) {

          var layerNamePartly = "Isochrone";

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === reachabilityLayerGroupName && layer.name.includes(layerNamePartly)) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
            }
          });
        });

        $scope.$on("removeRoutingLayers", function (event) {

          var layerNamePartly = "Routing";

          $scope.layerControl._layers.forEach(function (layer) {
            if (layer.group.name === reachabilityLayerGroupName && layer.name.includes(layerNamePartly)) {
              $scope.layerControl.removeLayer(layer.layer);
              $scope.map.removeLayer(layer.layer);
            }
          });
        });

        function highlightFeature(e) {
          var layer = e.target;

          highlightFeatureForLayer(layer);
        }

        function highlightFeatureForLayer(layer) {

          setTemporarilyHighlightedStyle(layer);

          // update diagrams for hovered feature
          $rootScope.$broadcast("updateDiagramsForHoveredFeature", layer.feature.properties);

        }

        function highlightClickedFeature(layer) {

          setPermanentlyHighlightedStyle(layer);

          // update diagrams for hovered feature
          $rootScope.$broadcast("updateDiagramsForHoveredFeature", layer.feature.properties);
        }

        function setPermanentlyHighlightedStyle(layer) {
          var fillOpacity = 1;
          if ($scope.useTransparencyOnIndicator) {
            fillOpacity = defaultFillOpacityForHighlightedFeatures;
          }

          layer.setStyle({
            weight: 3,
            color: defaultColorForClickedFeatures,
            dashArray: '',
            fillOpacity: fillOpacity
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
            // also bring possible isochrone layer to front
            // so it will not disapper behing indicator layer
            if ($scope.isochronesLayer) {
              $scope.isochronesLayer.bringToFront();
            }
          }
        }

        function setTemporarilyHighlightedStyle(layer) {
          var fillOpacity = 1;
          if ($scope.useTransparencyOnIndicator) {
            fillOpacity = defaultFillOpacity;
          }

          layer.setStyle({
            weight: 3,
            color: defaultColorForHoveredFeatures,
            dashArray: '',
            fillOpacity: fillOpacity
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
            // also bring possible isochrone layer to front
            // so it will not disapper behing indicator layer
            if ($scope.isochronesLayer) {
              $scope.isochronesLayer.bringToFront();
            }
          }
        }

        function preserveHighlightedFeatures() {
          $scope.map.eachLayer(function (layer) {
            if (layer.feature) {
              if (kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
                setPermanentlyHighlightedStyle(layer);
                $rootScope.$broadcast("updateDiagramsForHoveredFeature", layer.feature.properties);
              }
            }
          });
        }

        $scope.$on("preserveHighlightedFeatures", function (event) {
          preserveHighlightedFeatures();
        });

        function resetHighlight(e) {
          var layer = e.target;
          resetHighlightForLayer(layer);

          if (!kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
            layer.bringToBack();
          }
          //layer.bringToBack();
        }

        function resetHighlightForLayer(layer) {

          var style;

          // only restyle feature when not in list of clicked features
          if (!kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
            if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
              layer.setStyle($scope.filteredStyle);
            }
            else if (!kommonitorDataExchangeService.isMeasureOfValueChecked) {
              //$scope.currentIndicatorLayer.resetStyle(layer);
              if ($scope.indicatorTypeOfCurrentLayer.includes('DYNAMIC')) {
                style = kommonitorVisualStyleHelperService.styleDynamicIndicator(layer.feature, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);

                layer.setStyle(style);
              }
              else {
                style = kommonitorVisualStyleHelperService.styleDefault(layer.feature, $scope.defaultBrew, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator, $scope.datasetContainsNegativeValues);
                layer.setStyle(style);
              }
            }
            else {
              style = kommonitorVisualStyleHelperService.styleMeasureOfValue(layer.feature, $scope.gtMeasureOfValueBrew, $scope.ltMeasureOfValueBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);
              layer.setStyle(style);
            }
          }
          else {
            setPermanentlyHighlightedStyle(layer);
          }

          //update diagrams for unhoveredFeature
          $rootScope.$broadcast("updateDiagramsForUnhoveredFeature", layer.feature.properties);
        }

        function resetHighlightClickedFeature(layer) {
          var style;
          //$scope.currentIndicatorLayer.resetStyle(layer);
          if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
            layer.setStyle($scope.filteredStyle);
          }
          else if (!kommonitorDataExchangeService.isMeasureOfValueChecked) {
            //$scope.currentIndicatorLayer.resetStyle(layer);
            if ($scope.indicatorTypeOfCurrentLayer.includes('DYNAMIC')) {
              style = kommonitorVisualStyleHelperService.styleDynamicIndicator(layer.feature, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);

              layer.setStyle(style);
            }
            else {
              style = kommonitorVisualStyleHelperService.styleDefault(layer.feature, $scope.defaultBrew, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator, $scope.datasetContainsNegativeValues);

              layer.setStyle(style);
            }
          }
          else {
            style = kommonitorVisualStyleHelperService.styleMeasureOfValue(layer.feature, $scope.gtMeasureOfValueBrew, $scope.ltMeasureOfValueBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);

            layer.setStyle(style);
          }
        }

        function resetHighlightCustom(e) {
          $scope.currentCustomIndicatorLayer.resetStyle(e.target);
          if (!kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(e.target.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
            e.target.bringToBack();
          }
        }

        var wait = ms => new Promise((r, j) => setTimeout(r, ms))

        $scope.recenterMap = async function () {
          $scope.map.invalidateSize(true);

          fitBounds();

        };

        $scope.$on("recenterMapContent", async function (event) {
          $scope.recenterMap();
        });

        $scope.$on("recenterMapOnHideSideBar", async function (event) {
          //wait due to animation of the sidebar

          // make animation in 30 steps
          // var waitForInMs = 30;
          // for(var i=0; i<=300; i++){
          //
          //   i += waitForInMs;
          //
          //   await wait(waitForInMs);
          //
          //   $scope.map.invalidateSize(true);
          //
          //   panToCenterOnInActiveMenue(500);
          //   // $scope.recenterMap();
          // }

          var waitForInMs = 100;
          await wait(waitForInMs);
          panToCenterOnInActiveMenue(500);
        });

        $scope.$on("recenterMapOnShowSideBar", async function (event) {
          //wait due to animation of the sidebar

          // make animation in 30 steps
          // var waitForInMs = 30;
          // for(var i=0; i<=300; i++){
          //
          //   i += waitForInMs;
          //
          //   await wait(waitForInMs);
          //
          //   $scope.map.invalidateSize(true);
          //
          //   panToCenterOnActiveMenue(500);
          //   // $scope.recenterMap();
          // }

          var waitForInMs = 100;
          await wait(waitForInMs);
          panToCenterOnActiveMenue(500);

        });

        function panToCenterOnActiveMenue(numPixels) {
          if ($scope.map) {
            $scope.map.invalidateSize(true);
            $scope.map.panBy(L.point(numPixels, 0));

            $scope.map.invalidateSize(true);
          }
        };

        function panToCenterOnInActiveMenue(numPixels) {
          if ($scope.map) {
            $scope.map.invalidateSize(true);
            $scope.map.panBy(L.point(-numPixels, 0));

            $scope.map.invalidateSize(true);
          }
        };


        function fitBounds() {
          if ($scope.map && $scope.currentIndicatorLayer) {

            $scope.map.invalidateSize(true);
            // $scope.map.setView(L.latLng($scope.latCenter, $scope.lonCenter), $scope.zoomLevel);
            $scope.map.fitBounds($scope.currentIndicatorLayer.getBounds());
          }

        }

        function zoomToFeature(e) {
          map.fitBounds(e.target.getBounds());
        }

        function markOutliers(indicatorMetadataAndGeoJSON, indicatorPropertyName) {
          // identify possible data outliers
          // mark them using a dedicated property

          $scope.outliers_high = [];
          $scope.outliers_low = [];

          var valueArray = new Array();

          indicatorMetadataAndGeoJSON.geoJSON.features.forEach(function (feature) {
            if (!kommonitorDataExchangeService.indicatorValueIsNoData(feature.properties[indicatorPropertyName])) {
              if (!valueArray.includes(feature.properties[indicatorPropertyName])) {
                valueArray.push(feature.properties[indicatorPropertyName]);
              }
            }
          });

          // https://jstat.github.io/all.html#quartiles
          var quartiles = jStat.quartiles(valueArray);
          var quartile_25 = quartiles[0];
          var quartile_75 = quartiles[2];

          var diff = quartile_75 - quartile_25;
          var whiskerRange_outliers_soft = diff * 1.5;
          var whiskerRange_outliers_extreme = diff * 3;

          var whisker_low_soft = quartile_25 - whiskerRange_outliers_soft;
          var whisker_high_soft = quartile_75 + whiskerRange_outliers_soft;

          var whisker_low_extreme = quartile_25 - whiskerRange_outliers_extreme;
          var whisker_high_extreme = quartile_75 + whiskerRange_outliers_extreme;

          // for now only mark extreme outliers!

          indicatorMetadataAndGeoJSON.geoJSON.features.forEach(function (feature) {
            // compare feature value to whiskers and set property
            if (kommonitorDataExchangeService.indicatorValueIsNoData(feature.properties[indicatorPropertyName])) {
              feature.properties[outlierPropertyName] = outlierPropertyValue_no;
            }
            else if (feature.properties[indicatorPropertyName] < whisker_low_extreme) {
              feature.properties[outlierPropertyName] = outlierPropertyValue_low_extreme;
              $scope.containsOutliers_low = true;
              $scope.outliers_low.push(feature.properties[indicatorPropertyName]);
            }
            // else if (feature.properties[indicatorPropertyName] < whisker_low_soft){
            //   feature.properties[outlierPropertyName] = outlierPropertyValue_low_soft;
            //   $scope.containsOutliers_low = true;
            //   $scope.outliers_low.push(feature.properties[indicatorPropertyName]);
            // }
            else if (feature.properties[indicatorPropertyName] > whisker_high_extreme) {
              feature.properties[outlierPropertyName] = outlierPropertyValue_high_extreme;
              $scope.containsOutliers_high = true;
              $scope.outliers_high.push(feature.properties[indicatorPropertyName]);
            }
            // else if (feature.properties[indicatorPropertyName] > whisker_high_soft){
            //   feature.properties[outlierPropertyName] = outlierPropertyValue_high_soft;
            //   $scope.containsOutliers_high = true;
            //   $scope.outliers_high.push(feature.properties[indicatorPropertyName]);
            // }
            else {
              feature.properties[outlierPropertyName] = outlierPropertyValue_no;
            }
          });

          // sort outliers arrays
          $scope.outliers_high.sort(function (a, b) {
            return a - b;
          });
          $scope.outliers_low.sort(function (a, b) {
            return a - b;
          });

          return indicatorMetadataAndGeoJSON;
        }

        $scope.setNoDataValuesAsNull = function (indicatorMetadataAndGeoJSON) {
          indicatorMetadataAndGeoJSON.geoJSON.features.forEach(function (feature) {
            if (kommonitorDataExchangeService.indicatorValueIsNoData(feature.properties[$scope.indicatorPropertyName])) {
              feature.properties[$scope.indicatorPropertyName] = null;
            }
          });

          return indicatorMetadataAndGeoJSON;
        }

        $scope.$on("replaceIndicatorAsGeoJSON", function (event, indicatorMetadataAndGeoJSON, spatialUnitName, date, justRestyling, isCustomComputation) {

          console.log('replaceIndicatorAsGeoJSON was called');

          //reset opacity
          kommonitorVisualStyleHelperService.setOpacity(__env.defaultFillOpacity);

          refreshFilteredStyle();
          refreshOutliersStyle();
          refreshNoDataStyle();

          $scope.defaultBrew = new classyBrew();
          $scope.gtMeasureOfValueBrew = new classyBrew();
          $scope.ltMeasureOfValueBrew = new classyBrew();

          $scope.currentIndicatorMetadataAndGeoJSON = indicatorMetadataAndGeoJSON;

          if (!justRestyling) {
            // empty layer of possibly selected features
            kommonitorDataExchangeService.clickedIndicatorFeatureNames = [];
            kommonitorDataExchangeService.filteredIndicatorFeatureNames = [];

            $rootScope.$broadcast("checkBalanceMenueAndButton");
          }

          console.log("Remove old indicatorLayer if exists");
          if ($scope.currentIndicatorLayer) {
            $scope.layerControl.removeLayer($scope.currentIndicatorLayer);
            $scope.map.removeLayer($scope.currentIndicatorLayer);
          }

          $scope.currentIndicatorContainsZeroValues = false;

          $scope.date = date;

          $scope.indicatorPropertyName = INDICATOR_DATE_PREFIX + date;
          $scope.indicatorName = indicatorMetadataAndGeoJSON.indicatorName;
          $scope.indicatorDescription = indicatorMetadataAndGeoJSON.metadata.description;
          $scope.indicatorUnit = indicatorMetadataAndGeoJSON.unit;

          $scope.currentIndicatorMetadataAndGeoJSON = $scope.setNoDataValuesAsNull($scope.currentIndicatorMetadataAndGeoJSON);

          // identify and mark outliers prior to setting up of styling
          // in styling methods, outliers should be removed from classification!
          $scope.currentIndicatorMetadataAndGeoJSON = markOutliers($scope.currentIndicatorMetadataAndGeoJSON, $scope.indicatorPropertyName);

          $scope.currentGeoJSONOfCurrentLayer = $scope.currentIndicatorMetadataAndGeoJSON.geoJSON;

          for (var i = 0; i < indicatorMetadataAndGeoJSON.geoJSON.features.length; i++) {
            var containsZero = false;
            var containsNoData = false;
            if (indicatorMetadataAndGeoJSON.geoJSON.features[i].properties[$scope.indicatorPropertyName] === 0 || indicatorMetadataAndGeoJSON.geoJSON.features[i].properties[$scope.indicatorPropertyName] === "0") {
              $scope.currentIndicatorContainsZeroValues = true;
              containsZero = true;
            };

            if (kommonitorDataExchangeService.indicatorValueIsNoData(indicatorMetadataAndGeoJSON.geoJSON.features[i].properties[$scope.indicatorPropertyName])) {
              $scope.currentIndicatorContainsNoDataValues = true;
              containsNoData = true;
            };

            if (containsZero && containsNoData) {
              break;
            }
          }

          var layer;

          $scope.indicatorTypeOfCurrentLayer = indicatorMetadataAndGeoJSON.indicatorType;

          if (kommonitorDataExchangeService.isMeasureOfValueChecked) {
            var measureOfValueBrewArray = kommonitorVisualStyleHelperService.setupMeasureOfValueBrew($scope.currentGeoJSONOfCurrentLayer, $scope.indicatorPropertyName, defaultColorBrewerPaletteForGtMovValues, defaultColorBrewerPaletteForLtMovValues, $scope.classifyMethod, kommonitorDataExchangeService.measureOfValue);
            $scope.gtMeasureOfValueBrew = measureOfValueBrewArray[0];
            $scope.ltMeasureOfValueBrew = measureOfValueBrewArray[1];

            $scope.propertyName = INDICATOR_DATE_PREFIX + date;

            layer = L.geoJSON(indicatorMetadataAndGeoJSON.geoJSON, {
              style: function (feature) {
                return kommonitorVisualStyleHelperService.styleMeasureOfValue(featue, $scope.gtMeasureOfValueBrew, $scope.ltMeasureOfValueBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);
              },
              onEachFeature: onEachFeatureIndicator
            });

            $scope.makeInfoControl(date, isCustomComputation);
            $scope.makeMeasureOfValueLegend();

          }
          else {

            if (indicatorMetadataAndGeoJSON.indicatorType.includes("STATUS")) {
              $scope.datasetContainsNegativeValues = $scope.containsNegativeValues(indicatorMetadataAndGeoJSON.geoJSON);
              if ($scope.datasetContainsNegativeValues) {
                var dynamicIndicatorBrewArray = kommonitorVisualStyleHelperService.setupDynamicIndicatorBrew(indicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, defaultColorBrewerPaletteForBalanceIncreasingValues, defaultColorBrewerPaletteForBalanceDecreasingValues, $scope.classifyMethod);
                $scope.dynamicIncreaseBrew = dynamicIndicatorBrewArray[0];
                $scope.dynamicDecreaseBrew = dynamicIndicatorBrewArray[1];

              }
              else {
                $scope.defaultBrew = kommonitorVisualStyleHelperService.setupDefaultBrew(indicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, indicatorMetadataAndGeoJSON.defaultClassificationMapping.items.length, indicatorMetadataAndGeoJSON.defaultClassificationMapping.colorBrewerSchemeName, $scope.classifyMethod);
              }
              $scope.propertyName = INDICATOR_DATE_PREFIX + date;

              layer = L.geoJSON(indicatorMetadataAndGeoJSON.geoJSON, {
                style: function (feature) {
                  return kommonitorVisualStyleHelperService.styleDefault(feature, $scope.defaultBrew, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator, $scope.datasetContainsNegativeValues);
                },
                onEachFeature: onEachFeatureIndicator
              });
              $scope.makeInfoControl(date, isCustomComputation);
              $scope.makeDefaultLegend(indicatorMetadataAndGeoJSON.defaultClassificationMapping, $scope.datasetContainsNegativeValues);
            }
            else if (indicatorMetadataAndGeoJSON.indicatorType.includes("DYNAMIC")) {
              var dynamicIndicatorBrewArray = kommonitorVisualStyleHelperService.setupDynamicIndicatorBrew(indicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, defaultColorBrewerPaletteForBalanceIncreasingValues, defaultColorBrewerPaletteForBalanceDecreasingValues, $scope.classifyMethod);
              $scope.dynamicIncreaseBrew = dynamicIndicatorBrewArray[0];
              $scope.dynamicDecreaseBrew = dynamicIndicatorBrewArray[1];

              $scope.propertyName = INDICATOR_DATE_PREFIX + date;

              layer = L.geoJSON(indicatorMetadataAndGeoJSON.geoJSON, {
                style: function(feature){
                  return kommonitorVisualStyleHelperService.styleDynamicIndicator(feature, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);
                },
                onEachFeature: onEachFeatureIndicator
              });
              $scope.makeInfoControl(date, isCustomComputation);
              $scope.makeDynamicIndicatorLegend();
            }


          }

          $scope.currentIndicatorLayer = layer;

          // layer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          var layerName = indicatorMetadataAndGeoJSON.indicatorName + "_" + spatialUnitName + "_" + date;

          if (isCustomComputation) {
            layerName += " - individuelles Berechnungsergebnis";
          }
          $scope.layerControl.addOverlay(layer, layerName, indicatorLayerGroupName);
          layer.addTo($scope.map);
          $scope.updateSearchControl();

          // var justRestyling = false;

          // fitBounds();

          if ($scope.containsOutliers_low || $scope.containsOutliers_high) {
            $scope.showOutlierInfoAlert = true;
          }

          $rootScope.$broadcast("updateDiagrams", $scope.currentIndicatorMetadataAndGeoJSON, kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel, kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitId, date, $scope.defaultBrew, $scope.gtMeasureOfValueBrew, $scope.ltMeasureOfValueBrew, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, kommonitorDataExchangeService.isMeasureOfValueChecked, kommonitorDataExchangeService.measureOfValue, justRestyling);

          $scope.map.invalidateSize(true);
        });

        $scope.containsNegativeValues = function (geoJSON) {

          var containsNegativeValues = false;
          $scope.datasetContainsNegativeValues = false;
          for (var i = 0; i < geoJSON.features.length; i++) {
            if (geoJSON.features[i].properties[$scope.indicatorPropertyName] < 0) {
              containsNegativeValues = true;
              break;
            }
          }

          return containsNegativeValues;
        };

        $scope.$on("addCustomIndicatorAsGeoJSON", function (event, indicatorMetadataAndGeoJSON, spatialUnitName, date) {

          console.log('addCustomIndicatorAsGeoJSON was called');

          $scope.date = date;

          $scope.customIndicatorPropertyName = INDICATOR_DATE_PREFIX + date;
          $scope.customIndicatorName = indicatorMetadataAndGeoJSON.indicatorName;
          $scope.customIndicatorUnit = indicatorMetadataAndGeoJSON.unit;
          $scope.customIndicatorDescription = indicatorMetadataAndGeoJSON.metadata.description;

          $scope.currentCustomIndicatorLayerOfCurrentLayer = indicatorMetadataAndGeoJSON.geoJSON;

          $scope.datasetContainsNegativeValues = $scope.containsNegativeValues(indicatorMetadataAndGeoJSON.geoJSON);
          if ($scope.datasetContainsNegativeValues) {
            var dynamicIndicatorBrewArray = kommonitorVisualStyleHelperService.setupDynamicIndicatorBrew(indicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, defaultColorBrewerPaletteForBalanceIncreasingValues, defaultColorBrewerPaletteForBalanceDecreasingValues, $scope.classifyMethod);
            $scope.dynamicIncreaseBrew = dynamicIndicatorBrewArray[0];
            $scope.dynamicDecreaseBrew = dynamicIndicatorBrewArray[1];
          }
          else {
            $scope.defaultBrew = kommonitorVisualStyleHelperService.setupDefaultBrew(indicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, indicatorMetadataAndGeoJSON.defaultClassificationMapping.items.length, indicatorMetadataAndGeoJSON.defaultClassificationMapping.colorBrewerSchemeName, $scope.classifyMethod);
          }

          $scope.customPropertyName = INDICATOR_DATE_PREFIX + date;

          var layer = L.geoJSON(indicatorMetadataAndGeoJSON.geoJSON, {
            style: styleCustomDefault,
            onEachFeature: onEachFeatureCustomIndicator
          });

          $scope.currentCustomIndicatorLayer = layer;

          // layer.StyledLayerControl = {
          //   removable : false,
          //   visible : true
          // };

          $scope.layerControl.addOverlay(layer, indicatorMetadataAndGeoJSON.indicatorName + "_" + spatialUnitName + "_" + date + "_CUSTOM", indicatorLayerGroupName);
          layer.addTo($scope.map);
          $scope.updateSearchControl();

          $scope.makeCustomInfoControl(date);
          $scope.makeDefaultLegend(indicatorMetadataAndGeoJSON.defaultClassificationMapping, $scope.datasetContainsNegativeValues);

          $scope.map.invalidateSize(true);
        });


        $scope.$on("restyleCurrentLayer", function (event, skipDiagramRefresh) {

          // var transparency = document.getElementById("indicatorTransparencyInput").value;
          // var opacity = 1 - transparency;
          //
          // kommonitorVisualStyleHelperService.setOpacity(opacity);

          refreshFilteredStyle();
          refreshOutliersStyle();
          refreshNoDataStyle();

          $scope.defaultBrew = new classyBrew();
          $scope.gtMeasureOfValueBrew = new classyBrew();
          $scope.ltMeasureOfValueBrew = new classyBrew();

          var style;
          if ($scope.currentIndicatorLayer) {

            if (!kommonitorDataExchangeService.isBalanceChecked) {
              // if mode is not balance then we have to make use of "normal" unbalanced indicator values
              $scope.currentIndicatorMetadataAndGeoJSON = kommonitorDataExchangeService.selectedIndicator;
              $scope.currentIndicatorMetadataAndGeoJSON = markOutliers($scope.currentIndicatorMetadataAndGeoJSON, $scope.indicatorPropertyName);
              $scope.currentGeoJSONOfCurrentLayer = kommonitorDataExchangeService.selectedIndicator.geoJSON;
            }
            else {
              // if mode is not balance then we have to make use of "normal" unbalanced indicator values
              $scope.currentIndicatorMetadataAndGeoJSON = kommonitorDataExchangeService.indicatorAndMetadataAsBalance;
              $scope.currentIndicatorMetadataAndGeoJSON = markOutliers($scope.currentIndicatorMetadataAndGeoJSON, $scope.indicatorPropertyName);
              $scope.currentGeoJSONOfCurrentLayer = kommonitorDataExchangeService.indicatorAndMetadataAsBalance.geoJSON;
            }

            $scope.currentIndicatorContainsZeroValues = false;

            for (var i = 0; i < $scope.currentIndicatorMetadataAndGeoJSON.geoJSON.features.length; i++) {
              var containsZero = false;
              var containsNoData = false;
              if ($scope.currentIndicatorMetadataAndGeoJSON.geoJSON.features[i].properties[$scope.indicatorPropertyName] === 0 || $scope.currentIndicatorMetadataAndGeoJSON.geoJSON.features[i].properties[$scope.indicatorPropertyName] === "0") {
                $scope.currentIndicatorContainsZeroValues = true;
                containsZero = true;
              };

              if (kommonitorDataExchangeService.indicatorValueIsNoData($scope.currentIndicatorMetadataAndGeoJSON.geoJSON.features[i].properties[$scope.indicatorPropertyName])) {
                $scope.currentIndicatorContainsNoDataValues = true;
                containsNoData = true;
              };

              if (containsZero && containsNoData) {
                break;
              }
            }

            if (kommonitorDataExchangeService.isMeasureOfValueChecked) {
              var measureOfValueBrewArray = kommonitorVisualStyleHelperService.setupMeasureOfValueBrew($scope.currentGeoJSONOfCurrentLayer, $scope.indicatorPropertyName, defaultColorBrewerPaletteForGtMovValues, defaultColorBrewerPaletteForLtMovValues, $scope.classifyMethod, kommonitorDataExchangeService.measureOfValue);
              $scope.gtMeasureOfValueBrew = measureOfValueBrewArray[0];
              $scope.ltMeasureOfValueBrew = measureOfValueBrewArray[1];

              $scope.currentIndicatorLayer.eachLayer(function (layer) {
                if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
                  layer.setStyle($scope.filteredStyle);
                }
                else {
                  style = kommonitorVisualStyleHelperService.styleMeasureOfValue(layer.feature, $scope.gtMeasureOfValueBrew, $scope.ltMeasureOfValueBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);

                  layer.setStyle(style);
                }

              });

              $scope.makeMeasureOfValueLegend();
            }
            else {

              if ($scope.indicatorTypeOfCurrentLayer.includes('DYNAMIC')) {
                var dynamicIndicatorBrewArray = kommonitorVisualStyleHelperService.setupDynamicIndicatorBrew($scope.currentIndicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, defaultColorBrewerPaletteForBalanceIncreasingValues, defaultColorBrewerPaletteForBalanceDecreasingValues, $scope.classifyMethod);
                $scope.dynamicIncreaseBrew = dynamicIndicatorBrewArray[0];
                $scope.dynamicDecreaseBrew = dynamicIndicatorBrewArray[1];

                $scope.currentIndicatorLayer.eachLayer(function (layer) {
                  if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
                    layer.setStyle($scope.filteredStyle);
                  }
                  else {
                    style = kommonitorVisualStyleHelperService.styleDynamicIndicator(layer.feature, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator);

                    layer.setStyle(style);
                  }

                });
                $scope.makeDynamicIndicatorLegend();
              }
              else {
                $scope.datasetContainsNegativeValues = $scope.containsNegativeValues($scope.currentGeoJSONOfCurrentLayer);
                if ($scope.datasetContainsNegativeValues) {
                  var dynamicIndicatorBrewArray = kommonitorVisualStyleHelperService.setupDynamicIndicatorBrew($scope.currentIndicatorMetadataAndGeoJSON.geoJSON, $scope.indicatorPropertyName, defaultColorBrewerPaletteForBalanceIncreasingValues, defaultColorBrewerPaletteForBalanceDecreasingValues, $scope.classifyMethod);
                  $scope.dynamicIncreaseBrew = dynamicIndicatorBrewArray[0];
                  $scope.dynamicDecreaseBrew = dynamicIndicatorBrewArray[1];
                }
                else {
                  $scope.defaultBrew = kommonitorVisualStyleHelperService.setupDefaultBrew($scope.currentGeoJSONOfCurrentLayer, $scope.indicatorPropertyName, $scope.currentIndicatorMetadataAndGeoJSON.defaultClassificationMapping.items.length, $scope.currentIndicatorMetadataAndGeoJSON.defaultClassificationMapping.colorBrewerSchemeName, $scope.classifyMethod);
                }

                $scope.currentIndicatorLayer.eachLayer(function (layer) {
                  if (kommonitorDataExchangeService.filteredIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
                    layer.setStyle($scope.filteredStyle);
                  }
                  else {
                    style = kommonitorVisualStyleHelperService.styleDefault(layer.feature, $scope.defaultBrew, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, $scope.propertyName, $scope.useTransparencyOnIndicator, $scope.datasetContainsNegativeValues);
                    layer.setStyle(style);
                  }
                });
                $scope.makeDefaultLegend(kommonitorDataExchangeService.selectedIndicator.defaultClassificationMapping, $scope.datasetContainsNegativeValues);
              }

            }

            if (!skipDiagramRefresh) {
              var justRestyling = true;

              var indicatorObjectForDiagramUpdate = kommonitorDataExchangeService.selectedIndicator;
              if (kommonitorDataExchangeService.isBalanceChecked) {
                indicatorObjectForDiagramUpdate = $scope.currentIndicatorMetadataAndGeoJSON;
              }
              $rootScope.$broadcast("updateDiagrams", indicatorObjectForDiagramUpdate, kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel, kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitId, $scope.date, $scope.defaultBrew, $scope.gtMeasureOfValueBrew, $scope.ltMeasureOfValueBrew, $scope.dynamicIncreaseBrew, $scope.dynamicDecreaseBrew, kommonitorDataExchangeService.isMeasureOfValueChecked, kommonitorDataExchangeService.measureOfValue, justRestyling);
            }

            //ensure that highlighted feature remain highlighted
            preserveHighlightedFeatures();
          }

          $scope.map.invalidateSize(true);

        });

        $scope.$on("highlightFeatureOnMap", function (event, spatialFeatureName) {

          // console.log("highlight feature on map for featureName " + spatialFeatureName);

          var done = false;

          $scope.map.eachLayer(function (layer) {
            if (!done && layer.feature) {
              if (layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME] === spatialFeatureName) {
                highlightFeatureForLayer(layer);
                done = true;
              }
            }

          });

        });

        $scope.$on("unhighlightFeatureOnMap", function (event, spatialFeatureName) {

          // console.log("unhighlight feature on map for featureName " + spatialFeatureName);

          var done = false;

          $scope.map.eachLayer(function (layer) {
            if (!done && layer.feature) {
              if (layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME] === spatialFeatureName) {
                resetHighlightForLayer(layer);
                done = true;
              }
            }

          });

        });

        $scope.$on("switchHighlightFeatureOnMap", function (event, spatialFeatureName) {

          // console.log("switch highlight feature on map for featureName " + spatialFeatureName);

          var done = false;

          $scope.map.eachLayer(function (layer) {
            if (!done && layer.feature) {
              if (layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME] === spatialFeatureName) {
                switchHighlightFeature(layer);
                done = true;
              }
            }

          });

        });

        $scope.$on("unselectAllFeatures", function (event) {

          if (kommonitorDataExchangeService.clickedIndicatorFeatureNames && kommonitorDataExchangeService.clickedIndicatorFeatureNames.length > 0) {
            $scope.map.eachLayer(function (layer) {
              if (layer.feature) {
                if (kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME])) {
                  var index = kommonitorDataExchangeService.clickedIndicatorFeatureNames.indexOf(layer.feature.properties[__env.FEATURE_NAME_PROPERTY_NAME]);
                  kommonitorDataExchangeService.clickedIndicatorFeatureNames.splice(index, 1);
                  resetHighlightForLayer(layer);
                }
              }
            });
          }
        });

        $scope.$on("removeAllDrawnPoints", function (event) {

          if ($scope.drawnPointFeatures) {
            $scope.drawnPointFeatures.clearLayers();
            $rootScope.$broadcast("onUpdateDrawnPointFeatures");
          }
        });

        $scope.$on("enablePointDrawTool", function (event) {

          // FeatureGroup is to store editable layers
          if (!$scope.drawnPointFeatures) {
            $scope.drawnPointFeatures = new L.FeatureGroup();
          }

          L.drawLocal = {
            edit: {
              toolbar: {
                actions: {
                  save: {
                    title: "Bearbeitung speichern.",
                    text: "Speichern",
                  },
                  cancel: {
                    title: "Bearbeitung verwerfen.",
                    text: "Abbrechen",
                  },
                  clearAll: {
                    title: "Alle Features entfernen.",
                    text: "Alle Features entfernen",
                  },
                },
                buttons: {
                  edit: "Layer editieren.",
                  editDisabled: "Keine Layer zum editieren vorhanden.",
                  remove: "Layer entfernen.",
                  removeDisabled: "Keine Layer zum entfernen vorhanden.",
                },
              },
              handlers: {
                edit: {
                  tooltip: {
                    text: "Bearbeitungspunkte oder Punktmarker ziehen, um Feature zu editieren.",
                    subtext: "Abbrechen klicken, um Bearbeitung zu verwefen.",
                  },
                },
                remove: {
                  tooltip: {
                    text: "Feature anklicken, um es zu entfernen",
                  },
                },
              }
            },
            draw: {
              toolbar: {
                actions: {
                  title: "Zeichnen abbrechen",
                  text: "Abbrechen",
                },
                finish: {
                  title: "Zeichnen beenden",
                  text: "Beenden",
                },
                undo: {
                  title: "Zuletzt gezeichneten Punkt entfernen",
                  text: "Letzten Punkt entfernen",
                },
                buttons: {
                  polyline: "Polylinie zeichnen",
                  polygon: "Polygon zeichnen",
                  rectangle: "Rechteck zeichnen",
                  circle: "Kreis zeichnen",
                  marker: "Punkt zeichnen",
                  circlemarker: "Kreispunkt zeichnen",
                },
              },
              handlers: {
                circle: {
                  tooltip: {
                    start: "Klicken und halten, um Kreis zu zeichnen.",
                  },
                  radius: "Radius",
                },
                circlemarker: {
                  tooltip: {
                    start: "Klicken, um einen Punkt zu markieren.",
                  },
                },
                marker: {
                  tooltip: {
                    start: "Klicken, um einen Punkt zu markieren.",
                  },
                },
                polygon: {
                  tooltip: {
                    start: "Klicken, um ein Polygon zu beginnen.",
                    cont: "Klicken, um das Polygon weiter zu zeichnen.",
                    end: "Ersten Punkt anklicken, um Polygon zu beenden.",
                  },
                },
                polyline: {
                  error: "<strong>Fehler:</strong> Selbstueberschneidung!",
                  tooltip: {
                    start: "Klicken, um eine Polylinie zu beginnen.",
                    cont: "Klicken, um die Polylinie weiter zu zeichnen.",
                    end: "Letzten Punkt erneut anklicken, um Polylinie zu beenden.",
                  },
                },
                rectangle: {
                  tooltip: {
                    start: "Klicken und halten, um Rechteck zu zeichnen.",
                  },
                },
                simpleshape: {
                  tooltip: {
                    end: "Maus loslassen, um Zeichnung zu beenden.",
                  },
                },
              }
            }

          };

          $scope.map.addLayer($scope.drawnPointFeatures);
          $scope.drawPointControl = new L.Control.Draw({
            edit: {
              featureGroup: $scope.drawnPointFeatures
            },
            draw: {
              polyline: false,
              polygon: false,
              rectangle: false,
              circle: false,
              circlemarker: false
            },
            position: 'bottomleft'

          });

          $scope.map.addControl($scope.drawPointControl);

          $scope.map.on(L.Draw.Event.CREATED, function (event) {
            var layer = event.layer;

            $scope.drawnPointFeatures.addLayer(layer);

            $rootScope.$broadcast("onUpdateDrawnPointFeatures", $scope.drawnPointFeatures);
          });

          $scope.map.on(L.Draw.Event.EDITED, function (event) {

            $rootScope.$broadcast("onUpdateDrawnPointFeatures", $scope.drawnPointFeatures);
          });

          $scope.map.on(L.Draw.Event.DELETED, function (event) {

            $rootScope.$broadcast("onUpdateDrawnPointFeatures", $scope.drawnPointFeatures);
          });

        });

        $scope.$on("disablePointDrawTool", function (event) {

          try {
            $scope.map.removeLayer($scope.drawnPointFeatures);
            $scope.map.removeControl($scope.drawPointControl);
            $scope.drawPointControl = undefined;
          }
          catch (error) {

          }

        });

      }
    ]
  });
