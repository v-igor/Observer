

M.block_observer = {
    initObserver: function () {
        agent=new Agent();
        agent.start();
    }
};
class Agent {
    start(){
        var user=document.getElementById("observer_user");
        var x = document.getElementsByClassName("page-header-headings");
        this.communication({
            user: user.value, 
            course_title: x[0].innerHTML.replace(/(<([^>]+)>)/ig,""), 
            full_title: document.title,
            time: Math.floor(new Date().getTime()/1000), 
            type: 'open'});
        document.addEventListener('mousedown',this.addEvent);  

    }
  
    communication(message){
        return new Promise(function(resolve,reject){
            var ws = new WebSocket('ws://localhost:8080/');
            ws.onopen= function(){ 
              ws.send(JSON.stringify(message));
            };
            ws.onmessage= function(e){
                    try {
                      var json = JSON.parse(e.data);
                      document.getElementById("advice").innerHTML=""+json.data;
                    } catch (e) {
                      console.log('Invalid JSON: ', message.data);
                      return;
                    }
            resolve(e.data);    
            };  
        });    
    }

    addEvent(evt){
   
    if(evt.type=='mousedown')
    {
        var proba=function(message){
            return new Promise(function(resolve,reject){
                var ws = new WebSocket('ws://localhost:8080/');
                ws.onopen= function(){
                    ws.send(JSON.stringify(message));
                };
                ws.onmessage= function(e){
                    resolve(e.data);
                };
            });
        }
        var user=document.getElementById("observer_user");
        var x = document.getElementsByClassName("page-header-headings");
        var tes={ 
            user: user.value, 
            course_title: x[0].innerHTML.replace(/(<([^>]+)>)/ig,""), 
            full_title: document.title,
            time: Math.floor(new Date().getTime()/1000), 
            type: "click"};
        proba(tes);
    }
}

}
