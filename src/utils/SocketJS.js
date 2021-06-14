import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// 定义客户端的认证信息,按需求配置
let commHeaders = {
    token: ''
};
let connectNum = 0;
let stompClient = null;
let isError = false;
let times = null;
const MAXCONNECTNUM = 100; //最多连接次数
const CONNECTTIME = 5000; //连接间隔时间

function connectSocket(token) {

    commHeaders = {
        token: token
    };
    try {
        // 建立连接对象
        let socket = new SockJS(`${__API__}/trial/websocket`);
        // let socket = new SockJS('http://172.19.82.219:12366/dingApi/testsocketJs');

        // 获取STOMP子协议的客户端对象
        stompClient = Stomp.over(socket);

        // 向服务器发起websocket连接
        stompClient.connect(commHeaders, () => {
            return new Promise((resolve, reject) => {
                if (stompClient.connected) {
                    console.log('连接成功', stompClient);
                    if (isError) {
                        isError = false;
                        connectNum = 0;
                        window.location.reload();
                    }
                    resolve(stompClient);

                } else {
                    console.log('连接状态false', stompClient);
                    reject(stompClient);
                }
            });

        }, (err) => {
            console.log('连接状态err' + err);
            disconnectSocket();
            isError = true;
            if (connectNum > MAXCONNECTNUM) {
                clearTimeout(times);
                times = null;
                disconnectSocket();
                console.log('不再重连err', connectNum);
                window.opener = null;             //如果没有这行和下面的一行则会出现上面的第二个询问框。
		　　    window.open(' ', '_self', ' '); 
			    window.close();
                return false;
            } else {
                times = setTimeout(() => {
                    connectNum++;
                    console.log("再次连接", connectNum);
                    connectSocket();
                }, CONNECTTIME);
                
            }
        });

    } catch (err) {
        console.log('建立连接报错!', err);
        isError = true;
        disconnectSocket();
        if (connectNum > MAXCONNECTNUM) {
            clearTimeout(times);
            times = null;
            console.log("不再重连", connectNum)
            return false;
        } else {
            times = setTimeout(() => {
                connectNum++;
                console.log("再次连接", connectNum);
                connectSocket();
            }, CONNECTTIME);
        }
    }

}

function startSubscribeFn(url, callback, headers, stompClient) {
    let subcribeObj = stompClient.subscribe(url, (msg) => { // 订阅服务端提供的某个topic
        console.log('订阅成功');
        console.log(msg); // msg.body存放的是服务端发送给我们的信息
        callback(msg);
    }, Object.assign(commHeaders, headers));
    return subcribeObj;
}
// function sendMsgFn( params, stompClient, headers) {
//     stompClient.send('/app/webSocket/handleMessage', Object.assign(commHeaders, headers), JSON.stringify(params));

// }
const configJson = { 'headers': { 'Content-Type': 'application/json' } };

function sendMsgFn(params) {
    axios.post(`${__API__}/trial/webSocket/handleMessage`, params, configJson);
}

function cancelSubscribeFn(id, stompClient) {
    stompClient.unsubscribe(id);
}

function disconnectSocket(stompClient) {
    console.log('disconnectSocket', stompClient);
    if (stompClient) {
        stompClient.disconnect();
        stompClient = null;
        console.log('disconnectSocket', stompClient);

    }
}
export {
    connectSocket,
    startSubscribeFn,
    cancelSubscribeFn,
    sendMsgFn,
    disconnectSocket,
    stompClient
};