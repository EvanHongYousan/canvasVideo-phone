/**
 * Created by yantianyu on 2014/12/12.
 */
let devJudge = (function () {
    var userAgent = window.navigator.userAgent.toLowerCase();
    return {
        isWeixin: function () {
            return userAgent.indexOf('micromessenger') > 0;
        },
        isAndroid: function () {
            return userAgent.indexOf('android') > 0;
        },
        isIOS: function () {
            return /iphone/i.test(userAgent) || /ipod/i.test(userAgent) || /ipad/i.test(userAgent);
        }
    }
})();

let JSNativeBridge = (function () {
    var _handler = null;
    var oriURL = window.location.href;

    function _send(id, content) {
        uplusInterface.postWebpageMessage(id, encodeURIComponent(JSON.stringify(!content ? '' : content)));
    }

    function _receive(msg, msg_content) {
        _handler(msg, msg_content);
    }

    function _addHandler(handler) {
        _handler = handler;
    }

    return {
        send: function (id, content) {
            _send(id, content);
        },

        receive: function (msg_id, msg_content) {
            try {
                _receive(msg_id, JSON.parse(decodeURIComponent(msg_content)));
            } catch (e) {

            }
        },
        postNativeMessage: function () {
            JSNativeBridge.receive.apply(this, arguments);
        },

        init: function (handler) {
            if (!window.uplusInterface) {
                window.uplusInterface = {};
                window.uplusInterface.postWebpageMessage = function (id, content) {
                    window.location.href = oriURL + '#msg_id=' + id + '&msg_content=' + content;
                }
            }
            _addHandler(handler);
        }
    }
}());

export {devJudge, JSNativeBridge}