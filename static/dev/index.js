/**
 * Created by yantianyu on 2016/7/25 0025.
 */

import './css/style.css'

import './lib/zepto.min'
import './lib/zepto.scroll'
import {devJudge, JSNativeBridge} from './lib/tools'

window.canvasVideo = (function () {
    var OperationType = {
        PEN_STU_ONE: 1001,         //black, #202020
        PEN_STU_TWO: 1002,         //blue, #2477C2
        PEN_STU_THREE: 1003,       //red, #D61910
        PEN_TEA_ONE: 2001,         //black, #202020
        PEN_TEA_TWO: 2002,         //blue, #2477C2
        PEN_TEA_THREE: 2003,       //red, #D61910
        ERASER: 3001,
        SCROLL: 3011,
        PICTURE_ADD: 3021,
        PICTURE_ROTATE: 3022,
        PICTURE_ZOOM: 3023,

        ZOOM_STATUS_NORMAL: 0,
        ZOOM_STATUS_LARGE: 1
    };
    var configMap = (function () {
        // var screenWidth = window.screen.width > window.screen.height ? window.screen.width : window.screen.height;
        // var screenHeight = (window.screen.width < window.screen.height ? window.screen.width : window.screen.height) - window.screenTop - window.screenLeft;
        var screenWidth = document.body.clientWidth;
        var screenHeight = document.body.clientHeight - (window.screenTop === 0 ? 50 : window.screenTop) - $('#audio').height() - 10;
        if (devJudge.isAndroid()) {
            screenWidth = document.documentElement.clientWidth;
            screenHeight = document.documentElement.clientHeight;
        }
        // alert('screenWidth:' + screenWidth + '\nscreenHeight:' + screenHeight);
        // alert('document.body.clientHeight:' + document.body.clientHeight + '\document.body.clientWidth:' + document.body.clientWidth);
        var canvasWidth = screenWidth;
        var screens = 20;
        var canvasHeight = screenHeight * screens;
        var initDif = document.body.clientHeight - screenHeight;

        var initPenWidth = 4 / 1180 * screenWidth;
        var initEraserWidth = 40 / 1180 * screenWidth;

        var pic_padding = 20 / 1180 * screenWidth;
        var pic_nor_width = 600 / 1180 * screenWidth;
        var pic_nor_height = pic_nor_width * 0.75;
        var pic_big_width = screenWidth - 2 * pic_padding;
        var pic_big_height = screenHeight - 2 * pic_padding;

        return {
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            screens: screens,
            initDif: initDif,
            tempScrollTop: null,
            tempTargetScrollTop: null,
            lastOperateTime: null,
            lastPicBotmY: 0,
            lastPicBotmY_cache: 0,
            pageSet: null,
            initPenWidth: initPenWidth,
            initEraserWidth: initEraserWidth,
            photo_shift: [],
            pic_padding: pic_padding,
            pic_nor_width: pic_nor_width,
            pic_nor_height: pic_nor_height,
            pic_big_width: pic_big_width,
            pic_big_height: pic_big_height,
            ctxOutEraser_cache: [],
            oriURL: ''
        };
    })();


    var timmerPicker = null;
    var i, globalI = 0;
    var $canvasOut = $("#canvasOut");
    var $canvasIn = $("#canvasIn");
    var ctxOut = $canvasOut[0].getContext("2d");
    var ctxIn = $canvasIn[0].getContext("2d");
    $('canvas').attr('width', configMap.canvasWidth).attr('height', configMap.canvasHeight);
    $('.videoContainer').css('height', configMap.screenHeight - 30);
    var canvasData = null;
    var crossCanvasInitTime = false;


    function pageLineInit() {
        var i = 0;
        for (i = 0; i < 20; i++) {
            $('.pageLine > li ').eq(2 * i).css({
                position: 'absolute',
                top: configMap.screenHeight * (i) + 10
            });
            $('.pageLine > li').eq(2 * i + 1).css({
                position: 'absolute',
                top: configMap.screenHeight * (i + 1)
            });
        }
    }

    function embPointToSend(x, y) {
        return {x: x / configMap.screenWidth, y: (y ) / configMap.screenHeight};
    }

    function embPointToDraw(x, y) {
        return {x: x * configMap.screenWidth, y: y * configMap.screenHeight};
    }

    function setCanvasData(obj) {
        canvasData = obj;
    }

    function playVideo() {
        if (canvasData == null) {
            alert('画板数据为空!');
            return false;
        }

        if (globalI == 0 && !crossCanvasInitTime) {
            //globalI++;
            crossCanvasInitTime = true;
            setTimeout(canvasVideo.playVideo, canvasData[0].time - 0);
            return;
        }

        drawCanvas(canvasData[globalI]);
        globalI++;

        if (!canvasData[globalI]) {
            console.log('播放结束');
            return false;
        }

        timmerPicker = setTimeout(canvasVideo.playVideo, canvasData[globalI].time - canvasData[globalI - 1].time);
    }

    function drawCanvas(drawData) {

        var ctx = null;
        var i = null;
        var temp = null;

        if (drawData.type < 3000) {
            switch (drawData.type) {
                case OperationType.PEN_STU_ONE:
                    ctx = ctxIn;
                    ctx.strokeStyle = '#202020';
                    break;

                case OperationType.PEN_TEA_ONE:
                    ctx = ctxOut;
                    ctx.strokeStyle = '#202020';
                    break;

                case OperationType.PEN_STU_TWO:
                    ctx = ctxIn;
                    ctx.strokeStyle = '#2477C2';
                    break;

                case OperationType.PEN_TEA_TWO:
                    ctx = ctxOut;
                    ctx.strokeStyle = '#2477C2';
                    break;

                case OperationType.PEN_STU_THREE:
                    ctx = ctxIn;
                    ctx.strokeStyle = '#D61910';
                    break;

                case OperationType.PEN_TEA_THREE:
                    ctx = ctxOut;
                    ctx.strokeStyle = '#D61910';
                    break;

                default :
                    break;
            }

            ctx.beginPath();
            ctx.lineWidth = drawData.width * configMap.screenWidth;
            for (i = 0; i < drawData.points.length; i++) {
                temp = embPointToDraw(drawData.points[i].x, drawData.points[i].y);

                if (i == 0) {
                    ctx.moveTo(temp.x, temp.y);
                } else {
                    ctx.lineTo(temp.x, temp.y);
                }
            }
            ctx.stroke();
            ctx.closePath();

        } else if (drawData.type == OperationType.ERASER) {
            ctxIn.beginPath();
            ctxIn.globalCompositeOperation = "destination-out";
            ctxIn.lineWidth = drawData.width * configMap.screenWidth;

            ctxOut.beginPath();
            ctxOut.globalCompositeOperation = "destination-out";
            ctxOut.lineWidth = drawData.width * configMap.screenWidth;

            for (i = 0; i < drawData.points.length; i++) {

                temp = embPointToDraw(drawData.points[i].x, drawData.points[i].y);

                if (i == 0) {
                    ctxIn.moveTo(temp.x, temp.y);
                    ctxOut.moveTo(temp.x, temp.y);
                } else {
                    ctxIn.lineTo(temp.x, temp.y);
                    ctxOut.lineTo(temp.x, temp.y);
                }

            }

            ctxIn.stroke();
            ctxIn.closePath();
            ctxIn.globalCompositeOperation = "source-over";

            ctxOut.stroke();
            ctxOut.closePath();
            ctxOut.globalCompositeOperation = "source-over";
        } else if (drawData.type == OperationType.SCROLL) {
            $('.videoContainer').scrollTo({
                endY: drawData.points[0].y * configMap.screenHeight,
                duration: 100,
                callback: function () {
                }
            });
        } else if (drawData.type == OperationType.PICTURE_ADD) {
            var $imgContainer = $('<div class="imgContainer"><img src="' + drawData.url + '"/></div>');
            $imgContainer.css({
                position: 'absolute',
                top: drawData.points[0].y * configMap.screenHeight,
                left: drawData.points[0].x * configMap.screenWidth,
                width: (drawData.points[1].x - drawData.points[0].x) * configMap.screenWidth,
                height: 0
            });
            $imgContainer.find('img').css({
                width: (drawData.points[1].x - drawData.points[0].x) * configMap.screenWidth,
                height: (drawData.points[1].y - drawData.points[0].y) * configMap.screenHeight
            });
            $('.videoContainer').append($imgContainer);
            $('.videoContainer').scrollTo({
                endY: drawData.points[0].y * configMap.screenHeight - 50,
                duration: 100,
                callback: function () {
                }
            });
        } else if (drawData.type == OperationType.PICTURE_ZOOM) {
            var $targetImgContainer = null;
            $('.imgContainer').each(function () {
                if ($(this).find('img').attr('src') == drawData.url) {
                    $targetImgContainer = $(this);
                }
            });
            $targetImgContainer.css({
                position: 'absolute',
                top: drawData.points[0].y * configMap.screenHeight,
                left: drawData.points[0].x * configMap.screenWidth,
                width: (drawData.points[1].x - drawData.points[0].x) * configMap.screenWidth,
                height: 0
            });
            $targetImgContainer.find('img').css({
                width: (drawData.points[1].x - drawData.points[0].x) * configMap.screenWidth,
                height: (drawData.points[1].y - drawData.points[0].y) * configMap.screenHeight
            });
        }
    }

    function jumpToFrame(audioTime) {
        $('.imgContainer').remove();
        $('.videoContainer').scrollTo({
            endY: 0,
            duration: 0,
            callback: function () {
            }
        });
        for (var i = 0; i < canvasData.length; i++) {
            if (canvasData[i].time > audioTime) {
                globalI = i;
                break;
            }
            drawCanvas(canvasData[i]);
        }
    }

    function stopVideo() {
        clearTimeout(timmerPicker);
    }

    function clearCanvas() {
        $('.imgContainer').remove();
        ctxOut.clearRect(0, 0, configMap.canvasWidth, configMap.canvasHeight);
        ctxIn.clearRect(0, 0, configMap.canvasWidth, configMap.canvasHeight);
    }

    function init(canvasData) {
        pageLineInit();
        setCanvasData(canvasData);
    }

    return {
        playVideo: playVideo,
        jumpToFrame: jumpToFrame,
        stopVideo: stopVideo,
        clearCanvas: clearCanvas,
        init: init
    }

})();
// canvasVideo.init(JSON.parse($('#canvasData').text()));

$.ajax({
    method: 'GET',
    url: './test_data/canvas.json',
    success: function (data) {
        // canvasVideo.init(JSON.parse(data));
        canvasVideo.init(JSON.parse($('#canvasData').text()));
        setTimeout(function () {
            $('#audio')[0].src = './test_data/audio.mp3';
        }, 1000);
    }
});

(function () {
    function timeToTimeStr(time) {
        var time_second = '', time_minute = '', time_hour = '';
        time_second = time % 60;
        time_minute = parseInt(time / 60);
        time_hour = parseInt(time_minute / 60);
        time_minute = time_minute % 60;
        if (time_second.toString().length < 2) {
            time_second = '0' + time_second;
        }
        if (time_minute.toString().length < 2) {
            time_minute = '0' + time_minute;
        }
        if (time_hour.toString().length < 2) {
            time_hour = '0' + time_hour;
        }
        return time_minute + ':' + time_second;
    }

    var $audio = $('#audio');
    $audio.on('play', function () {
        canvasVideo.clearCanvas();
        canvasVideo.jumpToFrame(this.currentTime * 1000);
        canvasVideo.playVideo();
    });
    $audio.on('seeked', function () {
        canvasVideo.clearCanvas();
        canvasVideo.jumpToFrame(this.currentTime * 1000);
        // canvasVideo.playVideo();
        $audio[0].pause();
    });
    $audio.on('pause', function () {
        canvasVideo.stopVideo();
    });
    $audio.on('canplay', function () {
        var total = timeToTimeStr(parseInt(this.duration));
        $('.simMediaPlay .timeStr .totalTime').text(total);
    });
    $audio.on('timeupdate', function () {
        var current = timeToTimeStr(parseInt(this.currentTime));
        var total = timeToTimeStr(parseInt(this.duration));
        $('.simMediaPlay .timeStr .currentTime').text(current);
        var percentStr = parseInt((this.currentTime / this.duration) * 100) + "%";
        $('.simMediaPlay .controlBar .colorBar').css('flex', '0 0 ' + percentStr);
    });

    $('.simMediaPlay').delegate('.play', 'click', function () {
        // alert('fdsa');
        setTimeout(function () {
            $('#audio')[0].play();
            $('.simMediaPlay .pause').show();
            $('.simMediaPlay .play').hide();
        }, 0);
    });

    $('.simMediaPlay').delegate('.pause', 'click', function () {
        setTimeout(function () {
            $('#audio')[0].pause();
            $('.simMediaPlay .pause').hide();
            $('.simMediaPlay .play').show();
        }, 0);
    });

    $('.simMediaPlay .drapBtn').on('touchstart', function () {
        $(this).attr('data-canMove', 'true');
    });

    $('.simMediaPlay .drapBtn').on('touchend', function () {
        $(this).attr('data-canMove', 'false');
    });

    $('.simMediaPlay .drapBtn').on('touchmove', function (e) {
        if ($(this).attr('data-canMove') === 'true') {
            $('.simMediaPlay .controlBar').width();
            var offset_target = e.touches[0].clientX - $('.simMediaPlay .colorBar').offset().left;
            var persent_num = parseInt(offset_target / $('.simMediaPlay .controlBar').width() * 100);
            persent_num = persent_num > 100 ? 100 : persent_num;
            var persent_str = persent_num + '%';
            $('.simMediaPlay .controlBar .colorBar').css('flex', '0 0 ' + persent_str);

            var target_sencond = parseInt(persent_num / 100 * $('#audio')[0].duration);
            $('#audio')[0].currentTime = target_sencond;
            $('.simMediaPlay .timeStr .currentTime').text(timeToTimeStr(target_sencond));

            $('.simMediaPlay .pause').hide();
            $('.simMediaPlay .play').show();
        }
    });
})();

JSNativeBridge.init();