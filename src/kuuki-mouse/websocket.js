
/**
 * 创建一个WebSocket连接并返回其控制方法及实例
 * @param {string} url - WebSocket服务器的URL
 * @returns {Object} 包含onText, onKey, onMouse, Close方法和ws对象的对象
*/
export function createWebSocketConnection(url, onLog, onClose) {
    let socket;

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        onLog?.("WebSocket is already open or connecting.");
        return;
    }

    try {
        socket = new WebSocket(url);

        socket.onopen = () => {
            onLog?.('WebSocket connection established.');
        };


        socket.onmessage = (event) => {
            onLog?.('Message from server:', event.data);
        };
        socket.onclose = (event) => {
            onLog?.('WebSocket connection closed:', event.code, event.reason);
            // Optional: attempt to reconnect after a delay
            onClose?.('WebSocket connection closed:', event.code, event.reason)
        };
        socket.onerror = (error) => {
            onLog?.('WebSocket error:', error);
        };

        const handleMotion = (event) => {
            // 反正没用到,不写了.
        }

        const handleOrientation = (event) => {
            const currentGyro = {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
            };
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(currentGyro));
            }
        }

        // 请求和权限处理部分.
        // iOS 13+ Safari specific permission request
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleMotion, true);
                        onLog?.('加速度计权限已授予。');
                    } else {
                        onLog?.('加速度计权限被拒绝。');
                    }
                })
                .catch(error => {
                    onLog?.('请求加速度计权限时出错: ' + error);
                    onLog?.('DeviceMotionEvent Error:', error);
                });
        } else {
            // For other browsers or older iOS
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', handleMotion, true);
                onLog?.('尝试监听加速度计... (非iOS13+或安卓)');
            } else {
                onLog?.('此浏览器不支持加速度计事件。');
            }
        }

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        // Append to status, don't overwrite if motion was successful
                        onLog?.('陀螺仪权限已授予。');
                    } else {
                        onLog?.('陀螺仪权限被拒绝。');
                    }
                })
                .catch(error => {
                    onLog?.('请求陀螺仪权限时出错: ' + error);
                    onLog?.('DeviceOrientationEvent Error:', error);
                });
        } else {
            // For other browsers or older iOS
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', handleOrientation, true);
                onLog?.(' 尝试监听陀螺仪... (非iOS13+或安卓)');
            } else {
                onLog?.(' 此浏览器不支持陀螺仪事件。');
            }
        }



        function onMouse(action = 'left click') {
            onLog?.("Mouse action: " + action);
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    mouse: action,
                }));
            }
        }

        function onText(text = "") {
            onLog?.("Sending text: " + text);
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    text: text,
                }));
            }
        }

        function onKeyDown(key = "Enter") {
            onLog?.("Key down: " + key);
            console.log(socket);
            console.log(socket.readyState);
            console.log(WebSocket.OPEN);
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    keydown: key,
                }));
            }
        }

        function onKeyUp(key = "Enter") {
            onLog?.("Key up: " + key);
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    keyup: key,
                }));
            }
        }

        return {onMouse, onText, onKeyDown, onKeyUp, socket}
    } catch (e) {
        onClose?.("WebSocket error: " + e.message);
        throw e.message
    }
}