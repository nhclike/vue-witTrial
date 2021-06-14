var ws = null;
var caseName;
var url;
var iflyteClientPath;

function iflyteInit(iflyteClientPathParam,serverUrl,caseNameParam){
	caseName = caseNameParam;
	url = serverUrl;
	iflyteClientPath = iflyteClientPathParam;
	if(url != '' && url != null){
		try{
			connectionService();
    	}catch(e){
            console.log('连接语音服务异常'+e);
        }
		
	}
}

//初始化WebSocket连接
function connectionService() {
    if ("WebSocket" in window) {
        ws = new WebSocket(url);
    } else if ("MozWebSocket" in window) {
        ws = new MozWebSocket(fullUrl);
    } 
    ws.onopen = function () {
    	console.log("语音识别websocket连接成功");
    	setTimeout(function (){
    		startClient();
        }, 10000);
    }

    ws.onclose = function () {
    	console.log("语音识别websocket连接关闭");
    }

    ws.onerror = function () {
    	console.log("语音识别websocket连接失败");
    	startIflytekClient();
    }

    ws.onmessage = function (msg) {
        let reader = new FileReader();
        reader.addEventListener("loadend", function () {
            console.log(JSON.parse(reader.result));
        });
        reader.readAsText(msg.data);
    }
}

//启动语音识别exe程序
function startIflytekClient() {
	
	try{
        //新建一个ActiveXObject对象
		if(iflyteClientPath != ""){
	        var exe = new ActiveXObject("wscript.shell");
	        var exePath = decodeURIComponent(iflyteClientPath);
	        exe.run(exePath); 
	        setTimeout(function (){
	        	connectionService();
	        }, 3000);
		}
    }catch(e){
        alert('启动语音识别服务异常');
    }
}

//拉起客户端
function startClient() {
    var msg = '{"operation":"processControl","controlType":1,"caseName":"'+caseName+'","timesSpeak":"true","caseData":"","templateUrl":""}';
    if (ws) {
        ws.send(msg);
    }
}

export {
	iflyteInit
};