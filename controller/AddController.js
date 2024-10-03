window.AddController = function ($scope, $http) {
  const API = "http://localhost:3000/home";

  $scope.add = function () {
    $http.post(API, $scope.inputValue);
    window.location.href = "http://127.0.0.1:5500/index.html#!/list";
  };
};
