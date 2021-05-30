Database = require('arangojs').Database;
db = new Database('http://127.0.0.1:8529');
db.useDatabase('teagent');
db.useBasicAuth("agent", "teagent");
collection=db.collection('student_activity');
collection1=db.collection('duration');
const _=require('lodash');

  function multiDimDistance( pointA,pointB){
    
 return _.chain(pointA)
      .zip(pointB)
      .map(([a,b])=>(a-b)**2)
      .sum()
      .value()**0.5;
  }

 function knn(data, point, k){ 
    return _.chain(data).map(row => [multiDimDistance(_.initial(row),point[0]),_.last(row)])
        .sortBy(row=>row[0])
        .slice(0,k)
        .countBy(row=>row[1])
        .toPairs()
        .sortBy(row=>row[1])
        .last()
        .first()
        .value();
    
    }

    function getTrainingSet(arr1, arr2, arr3){
        
        
        var ideallyLow=[];
        ideallyLow.push(_.slice(arr1,0,2));
        ideallyLow.push(_.slice(arr2,0,2));
        ideallyLow.push(_.slice(arr3,0,2));
        var ideallyHigh=[];
        ideallyHigh.push(_.slice(arr1,arr1.length-2,arr1.length));
        ideallyHigh.push(_.slice(arr2,arr2.length-2,arr2.length));
        ideallyHigh.push(_.slice(arr3,arr3.length-2,arr3.length));
        //transponovanje i spajanje matrica
        var trainingSet=_.concat(_.zip.apply(_,ideallyLow),_.zip.apply(_,ideallyHigh)); 
        
        _.range(0,2).forEach(i=>trainingSet[i].push(0));
        _.range(2,4).forEach(i=>trainingSet[i].push(1));
        var middFirst=Math.floor((arr1[arr1.length-2]-arr1[1])/2);
        var middSecond=Math.floor((arr2[arr2.length-2]-arr2[1])/2);
        var middThird=Math.floor((arr3[arr3.length-2]-arr3[1])/2);
       if(arr1.length>7 && arr2.length>7 && arr3.length>7){
        trainingSet.push([middFirst,middSecond,middThird,0.5]);
        trainingSet.push([Math.floor((arr1[arr1.length-2]-middFirst)/2)+middFirst,Math.floor((arr2[arr2.length-2]-middSecond)/2)+middSecond,Math.floor((arr3[arr3.length-2]-middThird)/2)+middThird,0.5]);
        trainingSet.push([middFirst-Math.floor((middFirst-arr1[1])/2),middSecond-Math.floor((middSecond-arr2[1])/2),middThird-Math.floor((middThird-arr3[1])/2),0.5]);
    }
        return normalization(trainingSet,arr1,arr2,arr3);
    }
console.log( findLineByLeastSquares([0,1],[1,1]));
function findLineByLeastSquares(values_x, values_y) {
    console.log(values_x,values_y);
    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;
    var count = 0;
    if (values_x.length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }
    if (values_x.length === 0) {
        return [ [], [] ];
    }

    for (let i = 0; i< values_x.length; i++) {
        x_sum+= values_x[i];
        y_sum+= values_y[i];
        xx_sum += values_x[i]**2;
        xy_sum += values_x[i]*values_y[i];
        count++;
    }
    var m = (count*xy_sum - x_sum*y_sum) / (count*xx_sum - x_sum*x_sum);
    var b = (y_sum/count) - (m*x_sum)/count;

    var result_values_x = [];
    var result_values_y = [];

    for (let i = 0; i < values_x.length; i++) {
        result_values_x.push(values_x[i]);
        result_values_y.push(values_x[i] * m + b);
    } 
    return [result_values_x, result_values_y];
}

    function normalization(arr,arr1,arr2,arr3){
        for(let j=0;j<arr.length;j++){
           
            arr[j][0]=(arr[j][0]-arr1[0])/(arr1[arr1.length-1]-arr1[0]);  
            arr[j][1]=(arr[j][1]-arr2[0])/(arr2[arr2.length-1]-arr2[0]);  
            arr[j][2]=(arr[j][2]-arr3[0])/(arr3[arr3.length-1]-arr3[0]);     
        }
        return arr;
    }
//console.log(findLineByLeastSquares([ 0, 120, 360, 480, 33884, 33917 ],[ 0, 0, 0, 0, 0, 1 ]));
    module.exports.getTrainingSet=getTrainingSet;
    module.exports.knn=knn;
    module.exports.normalization=normalization;
    module.exports.findLineByLeastSquares=findLineByLeastSquares;