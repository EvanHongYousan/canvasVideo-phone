/**
 * Created by yantianyu on 2016/7/25 0025.
 */

import './css/style.css'

import './lib/zepto.min'
import './lib/zepto.scroll'

import {JSNativeBridge} from './lib/tools'
import canvasVideo from './components/canvasVideo'
import mediaPlayer from './components/mediaPlayer'

function getReqPrm(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
        r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return unescape(r[2]);
    }
    return null;
}

let path = null;

try {
    path = getReqPrm('path');
    path = decodeURIComponent(path);
    path = '/' + path + '/';
} catch (e) {
    path = null;
}

if (path === '/null/' || path === null || path === undefined) {
    console.log('获取path参数出错，现在对path赋入测试值');
    path = './test_data/';
}

$.ajax({
    method: 'GET',
    url: path + 'canvas.json',
    success: function (data) {
        canvasVideo.init(JSON.parse(data));
        // canvasVideo.init(JSON.parse($('#canvasData').text()));
        setTimeout(function () {
            $('#audio')[0].src = path + 'audio.mp3';
        }, 1000);
    }
});

mediaPlayer.init();

JSNativeBridge.init();