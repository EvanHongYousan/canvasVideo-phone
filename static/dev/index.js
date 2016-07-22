/**
 * Created by yantianyu on 2016/6/7 0007.
 */

import './base.css'

import ReactDOM from 'react-dom'

import VideoContainer from './components/VideoContainer'

let content = document.createElement('div');
document.body.appendChild(content);

ReactDOM.render(
    <VideoContainer />,
    content
);