angular.module('infoModal').component('infoModal', {
	templateUrl : "components/kommonitorUserInterface/kommonitorControls/infoModal/info-modal.template.html",
	controller : ['kommonitorDataExchangeService', '$scope', '$rootScope', function InfoModalController(kommonitorDataExchangeService, $scope, $rootScope) {

		this.kommonitorDataExchangeServiceInstance = kommonitorDataExchangeService;

	}
]});
