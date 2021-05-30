var http = require('http');
var _=require('lodash')
var schedule=require('node-schedule');
const knn=require('./knn');
const WebSocketServer=require('websocket').server;
Database = require('arangojs').Database;
db = new Database('http://127.0.0.1:8529');
db.useDatabase('teagent');
db.useBasicAuth("agent", "teagent");
collection=db.collection('student_activity');
collection1=db.collection('duration');
collection2=db.collection('results');

function checkForAdvice(user,course_title,connection){
    db.query("for doc in results filter doc.user=='"+user+"' and doc.course_title=='"+course_title+"' sort doc.updateTime desc limit 1 return [doc.result,doc.updateTime,doc.regression]").then(function(result){
        var arr=result._result;
        if(arr.length>0){
        var advice="";
        var info="";
        var regression="";
       var adv=_.head(_.head(arr));
       var reg=_.last(_.head(arr));
        if(adv>=0){
            switch(adv){
                case 0:
                    advice='The engagement effort should be better.';
                    break;
                case 0.5:
                    advice='The engagement effort is average.';
                    break;
                case 1:
                    advice='Your engagement is on track.';
                    break;
                }
        if(reg>=0)
            switch(reg){
                case 0:
                    regression='should be better overall. ';
                    break;
                case 0.5:
                    regression="it's still average overall.";
                    break;
                case 1:
                    regression='you are still on a right track overall.';
                    break;
            }
                
        var diff=Math.floor(new Date() / 1000)-arr[0][1];
        if(diff<60)
            info="<span style='color: darkgray; font-weight: bold; font-size: 15px'>this is new information</span>";
        else if(diff<3600)
            if(Math.floor(diff/60)==1)
                info="<span style='color: darkgray; font-weight: normal; font-size: 15px'>this information is "+Math.floor(diff/60)+" minute old</span>";
            else
                info="<span style='color: darkgray; font-weight: normal; font-size: 15px'>this information is "+Math.floor(diff/60)+" minutes old</span>";
        else if(diff<86400)
            if(Math.floor(diff/3600)==1)
                info="<span style='color: darkgray; font-weight: normal; font-size: 15px'>but this information is "+Math.floor(diff/3600)+" hour old</span>";
            else
                info="<span style='color: red; font-weight: normal; font-size: 15px'>but this information is "+Math.floor(diff/3600)+" hours old</span>";
        else 
            if(Math.floor(diff/86400)==1)
                info="<span style='color: red; font-weight: normal; font-size: 15px'>but this information is "+Math.floor(diff/86400)+" day old</span>";
            else
                info="<span style='color: red; font-weight: bold; font-size: 15px'>but this information is "+Math.floor(diff/86400)+" days old</span>";   
        }
       
        var send=advice;
        if(adv>reg && reg>=0)
        send= advice+"<br>But "+regression;
        if(adv<reg && reg>=0)
        send= advice+"<br>However, "+regression;
        send="<span style='font-size: 18px'>"+send+"</span><br>"+info;
          connection.sendUTF(
               JSON.stringify({ type: 'advice', data: send} ));
         }
        });
}
//checkForAdvice('ad23ff0b59939d565800cc4acb3f848f',null);
function dataPreparaton(){
    var curr_time= Math.floor(new Date() / 1000);
    var cursor= db.query('for doc in student_activity filter doc.processed==null sort doc.user,doc.course_title,doc.updateTime return [doc.user,doc.course_title,doc.time, doc.type,doc._key]').then(function(result){
        var arr=result._result;
        var user="",title="",firstTime=0,lastTime=0,cnt=0,clickCnt=0;
        if(arr.length>1){
        for (var i=0; i < arr.length; i++) {
         if(title!=arr[i][1] || user!=arr[i][0] && lastTime>0 && firstTime>0)
         {
             if(lastTime!="" && firstTime!="")
             collection1.save({
                user: user, 
                title: title,
                views: cnt,
                clicks: clickCnt,
                updateTime: curr_time,
                time:parseInt(lastTime)-parseInt(firstTime)}).then(
                    meta=> console.log('Document saved into duration: ',meta._rev),
                    err => console.error('Failed to save document:',err)     
                );
             user="";
             title="";
             firstTime=0;
             lastTime=0;
             cnt=0;
             clickCnt=0;
         }
         if(arr[i][3]=="open")
            cnt++;
        if(arr[i][3]=="click")
            clickCnt++;
         if(user==arr[i][0] && title==arr[i][1])
         lastTime=arr[i][2];
         if(user=="")
         user=arr[i][0];
         if(title=="")
         title=arr[i][1];
         if(firstTime=="")
         firstTime=arr[i][2]; 
         var temp=db.query('for u in student_activity UPDATE { _key: "'+arr[i][4]+'", processed: "yes" } in student_activity'); 
     }
      
     if(lastTime>0 && firstTime>0)
             collection1.save({
                user: user, 
                title: title,
                views: cnt,
                clicks: clickCnt,
                updateTime: curr_time,
                time:parseInt(lastTime)-parseInt(firstTime)}).then(
                    meta=> {console.log('Document saved into duration: ',meta._rev);
                    dataMining(curr_time);},
                    err => console.error('Failed to save document:',err)     
                );
        }

    });//.then(dataMining(curr_time));  
}
//dataPreparaton();
//dataMining(1585162680);
function dataMining(curr_time){
    db.query('for doc in duration filter doc.updateTime=='+curr_time+' return [doc.user,doc.views,doc.clicks,doc.time,doc.title]').then(function(result)
    {
        var toClassified=result._result;
        if(toClassified.length>0)
            {
                _.range(0,toClassified.length).forEach(i=>
                {
                  
                    db.query("for doc in duration filter doc.user=='"+toClassified[i][0]+"' or doc.title=='"+toClassified[i][4]+"' sort doc.views return distinct doc.views").then(function(result)
                    {
                        var arr1=result._result;
                        db.query("for doc in duration filter doc.user=='"+toClassified[i][0]+"' or doc.title=='"+toClassified[i][4]+"' sort doc.clicks return distinct doc.clicks").then(function(result)
                        {
                            var arr2=result._result;
                            db.query("for doc in duration filter doc.user=='"+toClassified[i][0]+"' or doc.title=='"+toClassified[i][4]+"' sort doc.time return distinct doc.time").then(function(result)
                            {
                                var arr3=result._result;
                                if(arr1.length>=4 && arr2.length>=4 && arr3.length>=4){
                                var trainingSet=knn.getTrainingSet(arr1,arr2,arr3);
                                console.log(trainingSet,knn.normalization([_.initial(_.tail(toClassified[i]))],arr1,arr2,arr3));
                                var adv=Number(knn.knn(trainingSet,knn.normalization([_.initial(_.tail(toClassified[i]))],arr1,arr2,arr3),3));
                               console.log(adv);
                                // console.log(toClassified[i],adv,knn.normalization([_.tail(toClassified[i])],arr1,arr2,arr3));
                                doRegression(toClassified[i][0],adv,toClassified[i][4]);
                                }
                            });
                        });
                    });
                });
            }});
    }
//dataMining(1585164600);
function doRegression(user,adv,course_title){
     db.query("for doc in results filter doc.user=='"+user+"' and doc.course_title=='"+course_title+"' sort doc.updateTime return [doc.result,doc.updateTime]").then((result)=>{
        var updateTime=Math.floor(new Date() / 1000);
        var arr=result._result; 
        var reg=-1;
        arr.push([adv,updateTime]);
        if(arr.length>2){
        var xss=[];
        var yss=[];
        var x_start=arr[0][1];
        for(let i=0;i<arr.length;i++){
            yss.push(arr[i][0]); 
            xss.push(arr[i][1]-x_start);
            }

        var regTemp=_.last(_.last(knn.findLineByLeastSquares(xss,yss)));
        if(regTemp<=0.25)
            reg=0;
        else if(regTemp>=0.75)
            reg=1;
        else
            reg=0.5;
        }
         collection2.save({
            user: user,
            course_title: course_title, 
            result: adv, 
            regression: reg, 
            updateTime: Math.floor(new Date() / 1000)}).then(
                    meta=> console.log('Document saved into results: ',meta._rev),
                    err => console.error('Failed to save document:',err));
        console.log(user+"<-->"+adv+","+reg); });
            }

         

const server = http.createServer(function (req, resp) { //Agnt za pripremu podataka  
}).listen(8080);
var curr_time=0;
const sch=schedule.scheduleJob('*/2 * * * *', dataPreparaton);

const wsServer=new WebSocketServer({
    httpServer: server
});
wsServer.on('request', function(request){
    const connection=request.accept(null, request.origin);
    connection.on('message',function(message){
        
        var json = JSON.parse(message.utf8Data);
            collection.save({
                user: json.user, 
                course_title: json.course_title, 
                full_title: json.full_title, 
                time: json.time,
                type: json.type}).then(
                    meta=> console.log('Document saved into student_activity: ',meta._rev),
                    err => console.error('Failed to save document:',err)     
                );
        checkForAdvice(json.user,json.course_title,connection);
    });
  
    
        
      
    connection.on('close',function(reasonCode, description){
       // console.log('Klijent se otkacio');
    });
});
