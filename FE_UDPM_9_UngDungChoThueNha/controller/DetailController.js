window.DetailController = function($scope, $http, $routeParams){

    const API = "http://localhost:8080/api/home";

    var id = $routeParams.id;

    $scope.getData = function() {
        $http.get(`${API}/${id}`).then(function(response){
            $scope.inputValue = response.data.data;
        });   
    }
    $scope.getData();
}