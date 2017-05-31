angular.module('starter.services.WSService', [])
    .factory('WSService',
        function($interval, $rootScope, APIService, $log, UserService, $q, $timeout) {

            console.log("WSService begin");
            var ws;
            $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";
            $rootScope.isConnected = false;
            //0 đóng reconnect, 1 đang reconnect, 2 không thể reconnect
            $rootScope.Reconnect= 0;
            var isConnecting = false;
            var mapCallBackFunc = {};
            var countPingConnectServer = 0;
            $rootScope.response = {};
            var responseDock = {};
            var sessionId = "";
            var wsServerUrl = "";
            var wsRequestId = 1;
            var eventBroadcastList = {
                eventConnectedCallBack: [],
                eventDisConnectCallBack: []
            }

            function addCallBack(msgType, func) {
                var name = msgType.toString();
                mapCallBackFunc[msgType.toString()] = func;
            }

            function addEventConnectCallBack(func) {
                eventBroadcastList.eventConnectedCallBack.push(func);
            }

            function addEventDisConnectCallBack(func) {
                eventBroadcastList.eventDisConnectCallBack.push(func);
            }

            function broadcastEventCallback(callbackList) {
                for (var i in callbackList) {
                    callbackList[i]();
                }
            }


            function genSessionID() {
                var current = Date.now();
                var tempNum = Math.floor(Math.random() * (1000 - 1 + 1) + 1);
                sessionId = current.toString() + "-" + tempNum.toString();
            }
            // genSessionID();


            function startNewWebsocket() {
                console.log("startNewWebsocket begin :" + isConnecting);

                // if (isConnecting == true) {
                //     console.log("startNewWebsocket close connection");
                //     ws.close();
                //     isConnecting = false;
                // };
                ws = new WebSocket(wsServerUrl);
                // isConnecting = true;
                ws.onmessage = function(message) {
                    console.log("startNewWebsocket onmessage" + message);
                    isConnecting = true;
                    var cbFunc;
                    var jsonObj = JSON.parse(message.data);

                    var msgType = jsonObj.msg_type.toString();

                    if (msgType == MSG_S2C_PONG) { //ping to server and received pong msg   
                        countPingConnectServer = 0;
                    } else if (mapCallBackFunc.hasOwnProperty(msgType)) {
                        console.log("received msg");
                        console.log(jsonObj);
                        cbFunc = mapCallBackFunc[msgType];
                        cbFunc(jsonObj);
                    } else {
                        console.log("received not process..................................");
                        console.log(jsonObj);
                    }

                };
                ws.onopen = function() {
                    console.log("onopen connect success");
                    console.log(ws);
                    $rootScope.isConnected = true;
                    countPingConnectServer = 0;
                    broadcastEventCallback(eventBroadcastList.eventConnectedCallBack);
                    isConnecting = true;
                };
                ws.onclose = function(event) {
                    console.log('connection closed', event);
                    $rootScope.isConnected = false;
                    broadcastEventCallback(eventBroadcastList.eventDisConnectCallBack);
                    isConnecting = false;
                };
                ws.onerror = function(event) {
                    console.log('connection Error', event);
                    isConnecting = false;
                };
                console.log("startNewWebsocket finish");
            };

            function sendPingMsg() {
                var jsonObj = {};
                jsonObj.msg_type = MSG_C2S_PING;
                jsonObj.request_id = 0;
                jsonObj.msg = "";
                jsonObj.data = {
                    info: "Ping from client"
                };
                var message = JSON.stringify(jsonObj);
                ws.send(message);
                countPingConnectServer++;
            }

            function sendRetry(message) {
                var count = 5;
                var timerId = $interval(function() {
                    if (count <= 0) {
                        $interval.cancel(timerId);
                        return;
                    }

                    if ($rootScope.isConnected) {
                        send(message);
                        $interval.cancel(timerId);
                        return;
                    } else {
                        count -= 1;
                    }
                }, 500);

            };
            //function điều khiển máy in 
            function sendEvtControl(data) {
                console.log('sendEvtControl');
                console.log(data);
                // if (callback && typeOf(callback) == "function") {
                //     callback();
                // }
                //B1: Thực hiện start socket
                var defer = $q.defer();
                connetSocket($rootScope.dockUrl).then(function(result) {
                    console.log(result);
                    console.log('Kết nối DOCK thành công');
                    console.log(data);
                    if (data) {
                        send(data).then(function(result) {
                            console.log(result);
                            defer.resolve(result);
                        }, function(err) {
                            defer.reject(err);
                            console.log(err);
                        });
                    }

                }, function(err) {
                    console.log('kết nối DOCK lỗi')
                    console.log(err);
                    defer.reject('kết nối DOCK lỗi');
                    // isConnecting = false;
                    // var count = 15;
                    // var timerId = $interval(function() {
                    //     connetSocket($rootScope.dockUrl).then(function(result){
                    //         console.log('Reconnect Dock thành công !');
                    //         isConnecting= true;
                    //         $rootScope.Reconnect=0;
                    //     },function(err){
                    //     });
                    //     if (count <= 0) {
                    //         $interval.cancel(timerId);
                    //         console.log('Không thể reconnect tới dock');
                    //         $rootScope.Reconnect=2;
                    //         defer.reject('ErrConnect');
                    //         return;
                    //     }
                    //     if (isConnecting == false) {
                    //         console.log('kết nối lại : ' + count);
                    //         $rootScope.Reconnect=1;
                    //         count -= 1;
                    //     } else {
                    //         console.log('kết nối thành công !')
                    //         $interval.cancel(timerId);
                    //         count = 0;
                    //         $rootScope.Reconnect=0;
                    //         sendEvtControl(data);
                    //     }
                    // }, 2000);

                });
                return defer.promise;

            }

            function connetSocket(url) {
                genSessionID(); // gen mới session 
                wsServerUrl = url + "?client_id=" + sessionId;
                startNewWebsocket();
                var defer = $q.defer();
                $timeout(function() {
                    if (isConnecting == true) {
                        console.log('Socket connect success');
                        defer.resolve(isConnecting);
                    } else {
                        defer.reject(isConnecting);
                    }
                }, 300);

                return defer.promise;
            };
            //send message to server
            function send(message) {
                var defer = $q.defer();
                if (angular.isString(message)) {
                    console.log(JSON.stringify(message));
                    ws.send(message);
                    //ghi logs cho dock
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(message),
                        logs: 'send'
                    };
                    console.log(JSON.stringify(apiData));
                    APIService.api_writeLogFile(apiData).then(function(result) {
                        console.log(JSON.stringify(result));
                    }, function(err) {
                        // body...
                    });
                } else if (angular.isObject(message)) {
                    console.log(message);
                    ws.send(JSON.stringify(message));
                    //ghi logs cho dock
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: message,
                        logs: 'send'
                    };
                    console.log(apiData);
                    APIService.api_writeLogFile(apiData).then(function(result) {
                        console.log(JSON.stringify(result));
                    }, function(err) {
                        // body...
                    });
                }

                console.log(message);
                ws.onmessage = function(message) {
                    defer.resolve(message);
                    console.log(message.data);
                    $rootScope.response = message.data;
                }
                ws.onerror = function(message) {
                    console.log(message.data)
                    defer.reject(message);
                    $rootScope.response = message.data;
                }

                return defer.promise;


            };

            function close() {
                console.log('closeWebsocket');
                ws.close();
                isConnecting = false;
                ws.onmessage = function(message) {

                    console.log(message);
                }
                ws.onerror = function(message) {
                    console.log(message);
                }
            };



            function getHeader(msgType) {
                var jsonObj = {};
                jsonObj.msg_type = msgType;
                jsonObj.request_id = ++wsRequestId;
                return jsonObj;
            }

            function start(url) {
                genSessionID();
                wsServerUrl = url + "?client_id=" + sessionId;
                startNewWebsocket();

                // setInterval(function(){
                if ($rootScope.isConnected) {
                    if (countPingConnectServer >= 3) {
                        console.log("connect server after 4s");
                        startNewWebsocket();

                    } else {
                        //sendPingMsg();
                    }
                } else {
                    if (isConnecting == false) {
                        startNewWebsocket();
                    }
                }

                // }, 10000);
            }

            var methods = {};
            methods.addCallBack = addCallBack;
            methods.send = send;
            methods.sendPingMsg = sendPingMsg;
            methods.getHeader = getHeader;
            methods.sendRetry = sendRetry;
            methods.start = start;
            methods.close = close;
            methods.connetSocket = connetSocket;
            methods.sendEvtControl = sendEvtControl;

            methods.addEventConnectCallBack = addEventConnectCallBack;
            methods.addEventDisConnectCallBack = addEventDisConnectCallBack;

            return methods;
        })
