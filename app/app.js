var dataHub = angular.module('DataHub',['ngRoute']);
//controller for the Main Menu, display as simple tab
dataHub.config(function ($routeProvider) {
    $routeProvider
        .when('/group/:groupID',
            {
                controller: 'groupDetailController',
                templateUrl: 'pages/groupDetails.html'
            })  
        .when('/group/:tableID/:groupID',
            {
                controller: 'tableDetailController',
                templateUrl: 'pages/tableDetails.html'
        })  
        .when('/column/:colid',
        	{
        		controller: '',
        		templateUrl: ''
        })
        .otherwise({ redirectTo: '/' });
});
/*custom methods*/
dataHub.factory('econdb', function($http){
    var apikey = 'aaaabbbbccccdddd';
    return{
        dbCategory: function(gid){
            var url ='http://www.opendataph.com/dataAPI/index.php'; 
            return $http.jsonp(url, {
                params: {
                    id: gid,
                    callback: 'JSON_CALLBACK'
                },
                cache:true
            });
        },
        dbTable: function(gid){
            var url ='http://www.opendataph.com/dataAPI/index.php'; 
            return $http.jsonp(url, {
                params: {
                    id: gid,
                    callback: 'JSON_CALLBACK',
                    format:'table'
                },
                cache:true
            });
        },
        convertTableRow:function(json){ //create per row object/array
            jsonobject = [];
            jsonres = [];
            for (var j=0; j < json.dataset[1].tablerows.length; j++){
                for(var i=0; i < json.dataset[3].tabledata.length;i++){
                    if (parseInt(json.dataset[1].tablerows[j].id) == parseInt(json.dataset[3].tabledata[i].rowid)){
                        jsonres.push(Number(json.dataset[3].tabledata[i].data));   
                    }                    
                }
                jsonobject[json.dataset[1].tablerows[j].id] =  jsonres;
                jsonres=[];
            }
            return jsonobject;   
        },
        convertTableColumn:function(json){ //create per column object/array
            jsonobject = [];
            jsonres = [];
            for (var j=0; j < json.dataset[2].tablecolumns.length; j++){
                for(var i=0; i < json.dataset[3].tabledata.length;i++){
                    if (parseInt(json.dataset[2].tablecolumns[j].id) == parseInt(json.dataset[3].tabledata[i].columnid)){
                        jsonres.push(Number(json.dataset[3].tabledata[i].data));   
                    }                    
                }
                jsonobject[json.dataset[2].tablecolumns[j].id] =  jsonres;
                jsonres=[];
            }
            return jsonobject;   
        },
        graphTable:function(){ //to be continued
            dataset =[];
            for (var i = 0; i < 25; i++) {
                var newNumber = Math.random() * 30;
                dataset.push(newNumber);
            }
            var svg = d3.select("div#chart");              
            svg.attr("width", 500).attr("height", 200);
           
            var barchart = svg.selectAll("rect") //create containers or template for circles
                         .data(dataset)
                         .enter()
                         .append("rect");

            var barAttributes = barchart
                       .attr("x", function (d,i) { return i * (500 / dataset.length) ; })
                       .attr("y", function (d,i) { return 200-d ; })
                       .attr("width", function (d,i) { return (500 / dataset.length) -1 ; })
                       .attr("height", function(d,i) { return d;})
                       .attr("fill", function(d) {
                           return "rgb(0, 0, " + (d * 30) + ")";
                       });
           
        }
    }
    
});
/*custom tags*/
dataHub.directive('ngDbChart', function($parse,$window){
   /*var link = function ($scope, $el, $attrs) { //B
      $scope.$on('windowResize', resize);
      $scope.$watch('tagsize', update);
      $scope.$watch('toptags', update);

    };*/
    return { //C
      template: "<svg width='850' height='200'></svg>",
      restrict: 'EA',
	  link: function(scope,elem,attrs){
	  	   var exp = $parse(attrs.chartData);

           var salesDataToPlot=exp(scope);
           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen, lineFun;

           var d3 = $window.d3;
           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);
		  

          /* scope.$watchCollection(exp, function(newVal, oldVal){
               salesDataToPlot=newVal;
               redrawLineChart();
           });*/

           function setChartParameters(){

               xScale = d3.scale.linear()
                   .domain([salesDataToPlot[0].hour, salesDataToPlot[salesDataToPlot.length-1].hour])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(salesDataToPlot, function (d) {
                       return d.sales;
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .orient("bottom")
                   .ticks(salesDataToPlot.length - 1);

               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5);

               lineFun = d3.svg.line()
                   .x(function (d) {
                       return xScale(d.hour);
                   })
                   .y(function (d) {
                       return yScale(d.sales);
                   })
                   .interpolate("basis");
           }
         
         function drawLineChart() {

               setChartParameters();

               svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(0,180)")
                   .call(xAxisGen);

               svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(20,0)")
                   .call(yAxisGen);

               svg.append("svg:path")
                   .attr({
                       d: lineFun(salesDataToPlot),
                       "stroke": "blue",
                       "stroke-width": 2,
                       "fill": "none",
                       "class": pathClass
                   });
           }

           /*function redrawLineChart() {

               setChartParameters();

               svg.selectAll("g.y.axis").call(yAxisGen);

               svg.selectAll("g.x.axis").call(xAxisGen);

               svg.selectAll("."+pathClass)
                   .attr({
                       d: lineFun(salesDataToPlot)
                   });
           }*/

           drawLineChart();
		  
	  }
    }; 
});
dataHub.directive('ngDbMap', function(econdb){
   var link = function ($scope, $el, $attrs) { //B
      /*$scope.$on('windowResize', resize);
      $scope.$watch('tagsize', update);
      $scope.$watch('toptags', update);*/

    };
    return { //C
      template: '<div style="width:38%;height:100px;font-size:24px;color:blue;float:left;margin-top:100px;">ng-db-map</div>',
      replace: true,
      link: link, 
      restrict: 'EA' 
    }; 
});
/*controllers*/

dataHub.controller('tabController',['$scope','$http', function($scope,$http){
    $http.jsonp('http://www.opendataph.com/dataAPI/index.php?id=3&callback=JSON_CALLBACK',{cache:true})
    .success(function(data){
       $scope.result =data;
    });
	
}]
);

dataHub.controller('groupDetailController', function($scope,$routeParams,econdb){
    econdb.dbCategory($routeParams.groupID).success(function(res){
        if (res.error) {
           throw new Error(res.message);
        } else {
            $scope.data = res.dataset[0].data;
            $scope.group = res.dataset[1].group[0];
        }
            
    });
                                  
});

dataHub.controller('tableDetailController', function($scope,$routeParams,econdb){
    econdb.dbTable($routeParams.tableID)
        .success(function(data){
           $scope.tableheader = data.dataset[0].tableheader[0];
           $scope.tablerows = data.dataset[1].tablerows;
           $scope.tablecolumns = data.dataset[2].tablecolumns;
           $scope.tabledata = data.dataset[3].tabledata;
           $scope.group = data.dataset[4].group[0]; 
           $scope.rowTable = econdb.convertTableRow(data);
           $scope.columnTable = econdb.convertTableColumn(data);
          // console.log($scope.rowtable);
           //console.log($scope.columntable);

        })
        .finally(function(data) {
            $scope.loading = false;
        });
    $scope.tableid = $routeParams.tableID;
    $scope.groupid = $routeParams.groupID;
	$scope.salesData=[
        {hour: 1,sales: 54},
        {hour: 2,sales: 66},
        {hour: 3,sales: 77},
        {hour: 4,sales: 70},
        {hour: 5,sales: 60},
        {hour: 6,sales: 63},
        {hour: 7,sales: 55},
        {hour: 8,sales: 47},
        {hour: 9,sales: 55},
        {hour: 10,sales: 30}
    ];

   
});

dataHub.controller('formController', function($scope,$http){
    $scope.myList =[];
    $scope.add = function(){
        if ($scope.fname != ""){
             $scope.myList.push($scope.fname);
             $scope.fname ="";
        }
         
    }
    
});