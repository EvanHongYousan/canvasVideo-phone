/**
 * Created by yantianyu on 2016/7/25 0025.
 */

import canvasVideo from './canvasVideo'
import {JSNativeBridge} from '../lib/tools'

function init() {

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
        $('#audio')[0].play();
        $('.simMediaPlay .pause').show();
        $('.simMediaPlay .play').hide();
        setTimeout(function () {
            $('.simMediaPlay').removeClass('hover');
        }, 1000);
    });

    $('.simMediaPlay').delegate('.pause', 'click', function () {
        $('#audio')[0].pause();
        $('.simMediaPlay .pause').hide();
        $('.simMediaPlay .play').show();
        setTimeout(function () {
            $('.simMediaPlay').removeClass('hover');
        }, 1000);
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

    $('.simMediaPlay').click(function () {
        if (!$(this).hasClass('hover')) {
            $(this).addClass('hover');
        }
    });

    $('.simMediaPlay .top > span').on('touchstart', function () {
        JSNativeBridge.send('js_msg_close_page', {});
    });
}

let mediaPlayer = {
    init: init
};

export default mediaPlayer