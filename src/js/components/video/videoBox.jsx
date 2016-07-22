import React, {Component} from 'react';
import Video from './video.jsx'

//Libs
import RTC from '../../lib/rtc.js'

export default class VideoComponent extends Component {
    constructor() {
        super();
        //The rtc peer
        this._rtcPeer = new RTC;

        //The initial state for component
        this.state = {
            in_call: false,
            src: ''
        };

    }

    mediaUp() {
        this._rtcPeer.mediaUP().then((res) => {
            this.setState({
                in_call: true,
                src: res
            })
        })
    }

    render() {
        return (
            <div>
                <Video class={this.props.class} src={this.state.src}/>
                <button onClick={()=>this.mediaUp()}>
                    Call
                </button>
            </div>
        )
    }
}

