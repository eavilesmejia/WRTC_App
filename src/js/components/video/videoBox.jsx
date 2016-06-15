import React,{Component} from 'react';
import ReactDom from 'react-dom';
import Video from './video.jsx'

class VideoComponent extends Component {
    render() {
        return <div>
            <Video src={this.props.src}/>
        </div>
    }
}

ReactDom.render(
    <VideoComponent src='http://localhost'/>,
    document.getElementById('video-box')
);