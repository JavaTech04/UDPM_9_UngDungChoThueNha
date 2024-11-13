window.ListController = function($scope, $http){
    const API = "http://localhost:3000/home";
    
    $scope.getData = function() {
        $http.get(API).then(function(response){
            $scope.listHome = response.data;
        })
    }
    $scope.getData();

    $scope.delete = function(id) {
        $http.delete(`${API}/${id}`).then(function(response){
            window.location.href = "http://127.0.0.1:5500/index.html#!/list";
        })
    }
}