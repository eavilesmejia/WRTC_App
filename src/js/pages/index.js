/**
 * Created by gmena on 06-15-16.
 */
import React from 'react';
import ReactDom from 'react-dom';
import VideoComponent from '../components/video/videoBox.jsx'


//Receiver
ReactDom.render(
    <VideoComponent class="receiver-video"/>,
    document.getElementById('video-box-receiver')
);


//Sender
ReactDom.render(
    <VideoComponent class="sender-video" action="call"/>,
    document.getElementById('video-box-sender')
);