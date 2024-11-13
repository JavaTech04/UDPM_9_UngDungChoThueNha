window.ListController = function($scope, $http){
    const API = "http://localhost:8080/api/home";
    
    $scope.getData = function() {
        $http.get(API).then(function(response){
            console.log(response.data.data);
            
            $scope.listHome = response.data.data;
        })
    }
    $scope.getData();

    $scope.delete = function(id) {
        $http.delete(`${API}/${id}`).then(function(response){
            window.location.href = "http://127.0.0.1:5500/index.html#!/list";
        })
    }
}