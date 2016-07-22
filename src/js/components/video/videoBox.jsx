import React, {Component} from 'react';
import Video from './video.jsx'
import RTC from '../../lib/rtc.js'

export default class VideoComponent extends Component {
    constructor() {
        super();
        this.state = {
            in_call: false,
            src: ''
        };

    }

    mediaUp() {
        let _rtc = new RTC;
        _rtc.mediaUP().then((res) => {
            this.setState({
                in_call: true,
                src: res
            })
        })
    }

    render() {
        return (
            <div>
                <Video src={this.state.src}/>
                <button onClick={this.mediaUp.bind(this)}>Call</button>
            </div>
        )
    }
}

