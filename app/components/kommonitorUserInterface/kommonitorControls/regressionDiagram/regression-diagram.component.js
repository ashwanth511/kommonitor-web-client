angular
		.module('regressionDiagram')
		.component(
				'regressionDiagram',
				{
					templateUrl : "components/kommonitorUserInterface/kommonitorControls/regressionDiagram/regression-diagram.template.html",

					controller : [
							'kommonitorDataExchangeService', '$scope', '$rootScope', '$http',
							function indicatorRadarController(
									kommonitorDataExchangeService, $scope, $rootScope, $http) {
								/*
								 * reference to kommonitorDataExchangeService instances
								 */
								this.kommonitorDataExchangeServiceInstance = kommonitorDataExchangeService;

								const DATE_PREFIX = "DATE_";

								$scope.setupCompleted = false;

								//$scope.allIndicatorProperties;
								$scope.selectedIndicatorForXAxis;
								$scope.selectedIndicatorForYAxis;
								$scope.correlation;
								$scope.linearRegression;
								$scope.regressionOption;
								$scope.regressionChart;
								$scope.data;
								$scope.dataWithLabels;
								$scope.eventsRegistered = false;
								// $scope.userHoveresOverItem = false;

								$scope.sortedIndicatorProps;
								$scope.spatialUnitName;
								$scope.date;

								$scope.filterIndicatorsBySpatialUnitAndDate = function() {
								  return function( item ) {

										if(item.applicableSpatialUnits.includes(kommonitorDataExchangeService.selectedSpatialUnit.spatialUnitLevel)){
											return item.applicableDates.includes(kommonitorDataExchangeService.selectedDate);
										}
										else{
											return false;
										}

								  };
								};

								$scope.$on("allIndicatorPropertiesForCurrentSpatialUnitAndTime setup completed", function (event) {
									$scope.setupCompleted = true;
								});

								$scope.$on("updateDiagrams", function (event, indicatorMetadataAndGeoJSON, spatialUnitName, spatialUnitId, date, defaultBrew, gtMeasureOfValueBrew, ltMeasureOfValueBrew, isMeasureOfValueChecked, measureOfValue, justRestyling) {

									if($scope.regressionChart){
										$scope.regressionChart.dispose();
										$scope.regressionChart = undefined;
									}

									$scope.setupCompleted = false;

									$scope.selectedIndicatorForXAxis = undefined;
									$scope.selectedIndicatorForYAxis = undefined;
									$scope.correlation = undefined;
									$scope.linearRegression = undefined;
									$scope.regressionOption = undefined;
									$scope.sortedIndicatorProps = undefined;
									$scope.data = undefined;
									$scope.dataWithLabels = undefined;
									$scope.eventsRegistered = false;
									// $scope.userHoveresOverItem = false;
									$scope.spatialUnitName = spatialUnitName;
									$scope.date = date;

								});

								$scope.$on("updateDiagramsForHoveredFeature", function (event, featureProperties) {

									if(!$scope.regressionChart){
										return;
									}

									// if($scope.userHoveresOverItem){
									// 	return;
									// }

									var index = -1;
									for(var i=0; i<$scope.regressionOption.series[0].data.length; i++){
										if($scope.regressionOption.series[0].data[i].name === featureProperties.spatialUnitFeatureName){
											index = i;
											break;
										}
									}

									if(index > -1){
										$scope.regressionChart.dispatchAction({
												type: 'highlight',
												seriesIndex: 0,
												dataIndex: index
										});
								    // tooltip
								    $scope.regressionChart.dispatchAction({
								        type: 'showTip',
												seriesIndex: 0,
												dataIndex: index
								    });
									}
								});

								$scope.$on("updateDiagramsForUnhoveredFeature", function (event, featureProperties) {

									if(!$scope.regressionChart){
										return;
									}

									if(! kommonitorDataExchangeService.clickedIndicatorFeatureNames.includes(featureProperties.spatialUnitFeatureName)){
										// highlight the corresponding bar diagram item
										var index = -1;
										for(var i=0; i<$scope.regressionOption.series[0].data.length; i++){
											if($scope.regressionOption.series[0].data[i].name === featureProperties.spatialUnitFeatureName){
												index = i;
												break;
											}
										}

										if(index > -1){
											$scope.regressionChart.dispatchAction({
													type: 'downplay',
													seriesIndex: 0,
													dataIndex: index
											});
									    // tooltip
									    $scope.regressionChart.dispatchAction({
									        type: 'hideTip',
													seriesIndex: 0,
													dataIndex: index
									    });
										}
									}
								});

								$scope.getAllIndicatorPropertiesSortedBySpatialUnitFeatureName = function(){
									for(var i=0; i<kommonitorDataExchangeService.allIndicatorPropertiesForCurrentSpatialUnitAndTime.length; i++){
											// make object to hold indicatorName, max value and average value
											kommonitorDataExchangeService.allIndicatorPropertiesForCurrentSpatialUnitAndTime[i].indicatorProperties.sort(function(a, b) {
												// a and b are arrays of indicatorProperties for all features of the selected spatialUnit. We sort them by their property "spatialUnitFeatureName"

													var nameA = a.spatialUnitFeatureName.toUpperCase(); // ignore upper and lowercase
												  var nameB = b.spatialUnitFeatureName.toUpperCase(); // ignore upper and lowercase
												  if (nameA < nameB) {
												    return -1;
												  }
												  if (nameA > nameB) {
												    return 1;
												  }

												  // names are equal
												  return 0;
											});
									}

									return kommonitorDataExchangeService.allIndicatorPropertiesForCurrentSpatialUnitAndTime;
								};

								$scope.getPropertiesForIndicatorName = function(indicatorName){
									for (var indicator of $scope.sortedIndicatorProps){
										if(indicator.indicatorMetadata.indicatorName === indicatorName){
											return indicator.indicatorProperties;
										}
									}
								};

								$scope.buildDataArrayForSelectedIndicators = function(){
									$scope.data = new Array();
									$scope.dataWithLabels = new Array();

									var indicatorPropertiesArrayForXAxis = $scope.getPropertiesForIndicatorName($scope.selectedIndicatorForXAxis.indicatorName);
									var indicatorPropertiesArrayForYAxis = $scope.getPropertiesForIndicatorName($scope.selectedIndicatorForYAxis.indicatorName);

									for (var i=0; i<indicatorPropertiesArrayForXAxis.length; i++){

										// + sign turns output into number!
										var xAxisDataElement = +indicatorPropertiesArrayForXAxis[i][DATE_PREFIX + kommonitorDataExchangeService.selectedDate];
										var yAxisDataElement = +indicatorPropertiesArrayForYAxis[i][DATE_PREFIX + kommonitorDataExchangeService.selectedDate];
										$scope.data.push([Number(xAxisDataElement.toFixed(4)), Number(yAxisDataElement.toFixed(4))]);

										var featureName = indicatorPropertiesArrayForXAxis[i].spatialUnitFeatureName;
										$scope.dataWithLabels.push({
											name: featureName,
											value: [Number(xAxisDataElement.toFixed(4)), Number(yAxisDataElement.toFixed(4))]
										});
									}

									return $scope.data;
								};

								/*
								 *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
								 */
								function getPearsonCorrelation(x, y) {
								    var shortestArrayLength = 0;

								    if(x.length == y.length) {
								        shortestArrayLength = x.length;
								    } else if(x.length > y.length) {
								        shortestArrayLength = y.length;
								        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
								    } else {
								        shortestArrayLength = x.length;
								        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
								    }

								    var xy = [];
								    var x2 = [];
								    var y2 = [];

								    for(var i=0; i<shortestArrayLength; i++) {
								        xy.push(x[i] * y[i]);
								        x2.push(x[i] * x[i]);
								        y2.push(y[i] * y[i]);
								    }

								    var sum_x = 0;
								    var sum_y = 0;
								    var sum_xy = 0;
								    var sum_x2 = 0;
								    var sum_y2 = 0;

								    for(var i=0; i< shortestArrayLength; i++) {
								        sum_x += x[i];
								        sum_y += y[i];
								        sum_xy += xy[i];
								        sum_x2 += x2[i];
								        sum_y2 += y2[i];
								    }

								    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
								    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
								    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
								    var step4 = Math.sqrt(step2 * step3);
								    var answer = step1 / step4;

								    return Number(+answer.toFixed(2));
									}

									$scope.calculatePearsonCorrelation = function(data){
										// data is an array of arrays containing the pairs of [x, y]

										var xArray = new Array();
										var yArray = new Array();

										data.forEach(function(xyPair) {
										  xArray.push(xyPair[0]);
											yArray.push(xyPair[1]);
										});

										return getPearsonCorrelation(xArray, yArray);
									}

								$scope.onChangeSelectedIndicators = function(){
									if($scope.selectedIndicatorForXAxis && $scope.selectedIndicatorForYAxis){

										$scope.eventsRegistered = false;

										if(!$scope.regressionChart)
											$scope.regressionChart = echarts.init(document.getElementById('regressionDiagram'));
										else{
											// explicitly kill and reinstantiate histogram diagram to avoid zombie states on spatial unit change
											$scope.regressionChart.dispose();
											$scope.regressionChart = echarts.init(document.getElementById('regressionDiagram'));
										}

										$scope.regressionChart.showLoading();

										if(!$scope.sortedIndicatorProps){
											$scope.sortedIndicatorProps = $scope.getAllIndicatorPropertiesSortedBySpatialUnitFeatureName();
										}

										var data = $scope.buildDataArrayForSelectedIndicators();

										data.sort(function(a, b) {
										    return a[0] - b[0];
										});

										$scope.correlation = $scope.calculatePearsonCorrelation(data);

										$scope.linearRegression = ecStat.regression('linear', data);

										for(var i=0; i<$scope.linearRegression.points.length; i++){
											$scope.linearRegression.points[i][0] = Number($scope.linearRegression.points[i][0].toFixed(4));
											$scope.linearRegression.points[i][1] = Number($scope.linearRegression.points[i][1].toFixed(4));
										}

										$scope.regressionOption = {
										    title: {
										        text: 'Lineare Regression - ' + $scope.spatialUnitName + ' - ' + $scope.date,
										        left: 'center'
										    },
										    tooltip: {
										        trigger: 'item',
										        axisPointer: {
										            type: 'cross'
										        },
														formatter: '{b0}: {c0}'
										    },
										    xAxis: {
														name: $scope.selectedIndicatorForXAxis.indicatorName + " [" + $scope.selectedIndicatorForXAxis.unit + "]",
														nameLocation: 'center',
														nameGap: 30,
		                        scale: true,
										        type: 'value',
										        splitLine: {
										            lineStyle: {
										                type: 'dashed'
										            }
										        },
										    },
										    yAxis: {
														name: $scope.selectedIndicatorForYAxis.indicatorName + " [" + $scope.selectedIndicatorForYAxis.unit + "]",
														nameLocation: 'center',
														nameGap: 60,
										        type: 'value',
										        splitLine: {
										            lineStyle: {
										                type: 'dashed'
										            }
										        },
										    },
												toolbox: {
														show : true,
														feature : {
																// mark : {show: true},
																dataView : {show: true, readOnly: true, title: "Data View", lang: ['Data View', 'close', 'refresh']},
																restore : {show: true, title: "Restore"},
																saveAsImage : {show: true, title: "Save"}
														}
												},
										    series: [{
										        name: "scatter",
										        type: 'scatter',
										        // label: {
										        //     emphasis: {
										        //         show: false,
										        //         position: 'left',
										        //         textStyle: {
										        //             color: 'blue',
										        //             fontSize: 16
										        //         }
										        //     }
										        // },
														emphasis: {
															itemStyle: {
																borderWidth: 4,
																borderColor: '#42e5f4'
															}
														},
										        data: $scope.dataWithLabels
										    }, {
										        name: 'line',
										        type: 'line',
										        showSymbol: false,
										        data: $scope.linearRegression.points,
										        markPoint: {
										            itemStyle: {
										                normal: {
										                    color: 'transparent'
										                }
										            },
										            label: {
										                normal: {
										                    show: true,
										                    position: 'left',
										                    formatter: $scope.linearRegression.expression,
										                    textStyle: {
										                        color: '#333',
										                        fontSize: 14
										                    }
										                }
										            },
										            data: [{
										                coord: $scope.linearRegression.points[$scope.linearRegression.points.length - 1]
										            }]
										        }
										    }]
										};

										$scope.regressionChart.hideLoading();
										$scope.regressionChart.setOption($scope.regressionOption);

										registerEventsIfNecessary();

									}
								}

								function registerEventsIfNecessary(){
									if(!$scope.eventsRegistered){
										// when hovering over elements of the chart then highlight them in the map.
										$scope.regressionChart.on('mouseOver', function(params){
											// $scope.userHoveresOverItem = true;
											var spatialFeatureName = params.data.name;
											// console.log(spatialFeatureName);
											$rootScope.$broadcast("highlightFeatureOnMap", spatialFeatureName);
										});

										$scope.regressionChart.on('mouseOut', function(params){
											// $scope.userHoveresOverItem = false;

											var spatialFeatureName = params.data.name;
											// console.log(spatialFeatureName);
											$rootScope.$broadcast("unhighlightFeatureOnMap", spatialFeatureName);
										});

										$scope.regressionChart.on('click', function(params){
											var spatialFeatureName = params.data.name;
											// console.log(spatialFeatureName);
											$rootScope.$broadcast("switchHighlightFeatureOnMap", spatialFeatureName);
										});

										$scope.eventsRegistered = true;
									}
								};


							} ]
				});
