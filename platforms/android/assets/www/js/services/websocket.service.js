angular.module('starter.services.WSService', [])
    .factory('WSService',
        function($interval, $rootScope,APIService, $log,UserService) {
            console.log("WSService begin");
            var ws;
            $rootScope.isConnected = false;
            var isConnecting = false;
            var mapCallBackFunc = {};
            var countPingConnectServer = 0;
            var sessionId = "";
            var wsServerUrl = "";
            var wsRequestId = 1;
            var MSG_REQUEST = 0;
            var MSG_RESPONSE = 1000;
            $rootScope.response = {};
            // 0 la mat ket noi , 1 ket noi thanh cong
            $rootScope.Connect = 0;

            //request - response
            var MSG_TYPE_PING = MSG_REQUEST + 0;
            var MSG_TYPE_GET_DEVICE_LIST = MSG_REQUEST + 1;
            var MSG_TYPE_CONTROL_DEVICE = MSG_REQUEST + 2;

            var MSG_TYPE_PRINT_TEMPLATE = MSG_REQUEST + 101;
            var MSG_TYPE_PRINT_TEMPLATE_BY_VID = MSG_REQUEST + 104;
            var MSG_TYPE_CONTROL_DEVICE_BY_VID = MSG_REQUEST + 105;
            var MSG_WIRELESS_CONFIG_CHANGE = MSG_REQUEST + 106;


            //message notfication from server
            var MSG_DEVICE_STATUS_CHANGE = 100000;
            var eventBroadcastList = {
                eventConnectedCallBack: [],
                eventDisConnectCallBack: []
            }
            var maxInt = Math.pow(2, 32) - 1;


            function addNtfCallBack(msgType, func) {
                //mapCallBackFunc[maxInt.toString() + '-' +msgType.toString()] = func;
                var name = msgType.toString();
                mapCallBackFunc[msgType.toString()] = func;
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
            genSessionID();



            function startNewWebsocket() {
                console.log("startNewWebsocket begin");
                if ($rootScope.isConnected == true) {
                    console.log("startNewWebsocket close connection");
                    ws.close();
                    $rootScope.isConnected = false;
                };

                isConnecting = true;
                ws = new WebSocket(wsServerUrl);
                //receive data from server
                ws.onmessage = function(message) {
                    // console.log("onmessage");
                    // console.log(message);
                    var cbFunc;
                    var jsonObj = JSON.parse(message.data);
                    //jsonObj.data = JSON.parse(jsonObj.data);
                    // console.log("received msg");
                    // console.log(jsonObj);
                    var methodId = jsonObj.method_id.toString();
                    // if (jsonObj.status == maxInt) {
                    //   methodId = maxInt.toString() + '-' + methodId;
                    // }

                    //console.log("message message message message");
                    //console.log(jsonObj);
                    if (jsonObj.method_id === MSG_TYPE_PING && jsonObj.status !== maxInt) { //ping to server and received pong msg   
                        //console.log("received pong message");       
                        countPingConnectServer = 0;
                        //console.log(jsonObj.data);
                    } else if (mapCallBackFunc.hasOwnProperty(methodId)) {
                        //console.log("received msg");
                        //console.log(jsonObj);
                        cbFunc = mapCallBackFunc[methodId];

                        cbFunc(jsonObj);
                    } else {
                        // console.log("received not process..................................");
                        // console.log(jsonObj);
                    }

                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(message),
                        logs: JSON.stringify(jsonObj)
                    };
                    // console.log(JSON.stringify(apiData));
                    // APIService.api_writeLogFile(apiData).then(function(result) {
                    //     console.log(JSON.stringify(result));
                    // }, function(err) {
                    //     // body...
                    // });


                };

                ws.onopen = function(event) {

                    console.log("onopen connect success", event);
                    console.log(ws);
                    $rootScope.isConnected = true;
                    $rootScope.Connect = 1;
                    countPingConnectServer = 0;
                    broadcastEventCallback(eventBroadcastList.eventConnectedCallBack);
                    isConnecting = false;
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(event),
                        logs: 'onopen connect success'
                    };
                    // console.log(JSON.stringify(apiData));
                    // APIService.api_writeLogFile(apiData).then(function(result) {
                    //     console.log(JSON.stringify(result));
                    // }, function(err) {
                    //     // body...
                    // });
                };

                ws.onclose = function(event) {
                    console.log('connection closed', event);
                    $rootScope.isConnected = false;
                    broadcastEventCallback(eventBroadcastList.eventDisConnectCallBack);
                    isConnecting = false;
                    $rootScope.Connect = 0;
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(event) ,
                        logs: 'connection closed'
                    };
                    // console.log(JSON.stringify(apiData));
                    // APIService.api_writeLogFile(apiData).then(function(result) {
                    //     console.log(JSON.stringify(result));
                    // }, function(err) {
                    //     // body...
                    // });
                };

                ws.onerror = function(event) {
                    console.log('connection Error', event);
                    isConnecting = false;
                    $rootScope.isConnected = false;
                    $rootScope.Connect = 0;
                    console.log('mat ket noi')
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(event),
                        logs: 'connection Error'
                    };
                    // console.log(JSON.stringify(apiData));
                    // APIService.api_writeLogFile(apiData).then(function(result) {
                    //     console.log(JSON.stringify(result));
                    // }, function(err) {
                    //     // body...
                    // });
                };
                // console.log(ws.readyState);
                console.log("startNewWebsocket end");
            };

            //startNewWebsocket();

            function sendPingMsg() {
                var jsonObj = {};
                jsonObj.method_id = MSG_TYPE_PING;
                jsonObj.request_id = 0;
                jsonObj.payload = "Ping from client";
                var message = JSON.stringify(jsonObj);
                ws.send(message);
                countPingConnectServer++;
            }

            //send message to server
            function send(message) {
                if (angular.isString(message)) {
                    
                    
                    ws.send(message);
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
                    
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: message,
                        logs: 'send'
                    };
                    console.log(JSON.stringify(apiData));
                    APIService.api_writeLogFile(apiData).then(function(result) {
                        console.log(JSON.stringify(result));
                    }, function(err) {
                        // body...
                    });
                    ws.send(JSON.stringify(message));
                }
                console.log('message');
                console.log(message);
                console.log('respose');
                ws.onmessage = function(message) {
                    $rootScope.response = message.data;
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(message),
                        logs: 'onmessage'
                    };
                    // console.log(JSON.stringify(apiData));
                    // APIService.api_writeLogFile(apiData).then(function(result) {
                    //     console.log(JSON.stringify(result));
                    // }, function(err) {
                    //     // body...
                    // });
                }
                ws.onerror = function(message) {
                    console.log(message)
                    $rootScope.Connect = 0;
                    $rootScope.response = message.data;
                    var apiData = {
                        shopid: UserService.getUser().shopid,
                        status: JSON.stringify(message),
                        logs: 'onerror'
                    };
                    // console.log(JSON.stringify(apiData));
                    // APIService.api_writeLogFile(apiData).then(function(result) {
                    //     console.log(JSON.stringify(result));
                    // }, function(err) {
                    //     // body...
                    // });
                }

            }

            function close() {
                console.log('closeWebsocket');
                ws.close();
                isConnecting = false;

                ws.onmessage = function(message) {
                    console.log(message);                }
                ws.onerror = function(message) {
                    console.log(message);
                }

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

            }



            var methods = {
                //collection: collection        
            };

            function getHeader(methodId) {
                var jsonObj = {};
                jsonObj.method_id = methodId;
                jsonObj.request_id = ++wsRequestId;
                return jsonObj;
            }

            function start(url) {
                genSessionID();
                wsServerUrl = url + "?client_id=" + sessionId;
                startNewWebsocket();
                // console.log($rootScope.isConnected);				

                // setInterval(function() {
                if ($rootScope.isConnected) {
                    console.log('check 1');
                    if (countPingConnectServer >= 3) {
                        $rootScope.isConnected = false;
                        if (isConnecting == false) {
                            console.log("connect server after 4s");
                            startNewWebsocket();
                        }


                    } else {
                        // console.log('check 2');
                        sendPingMsg();
                    }
                } else {
                    // console.log('check 3');
                    if (isConnecting == false) {
                        startNewWebsocket();
                    }
                }

                // }, 3000);
            }
            //Duong


            methods.addCallBack = addCallBack;
            methods.send = send;
            methods.close = close;
            methods.sendPingMsg = sendPingMsg;
            methods.getHeader = getHeader;
            methods.sendRetry = sendRetry;
            methods.start = start;

            methods.addEventConnectCallBack = addEventConnectCallBack;
            methods.addEventDisConnectCallBack = addEventDisConnectCallBack;
            methods.addNtfCallBack = addNtfCallBack;

            return methods;
        } // end
    )
