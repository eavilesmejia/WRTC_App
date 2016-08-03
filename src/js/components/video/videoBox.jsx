import React, {Component} from 'react';

//Components
import Video from './video.jsx'
import Button from '../button/button.jsx'

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

    mediaClose() {
        console.log('closing');
    }

    render() {

        //Handle button
        let _button;
        if (this.props.action == 'call') {
            if (this.state.in_call) {
                _button = <Button
                    onClick={()=>{this.mediaClose()}}
                    class="btn btn-danger"
                    btnContent="close"
                />
            } else {
                _button = <Button
                    onClick={()=>{this.mediaUp()}}
                    class="btn btn-default"
                    btnContent="Call"
                />
            }

        }

        return (
            <div>
                <Video class={this.props.class} src={this.state.src}/>
                {_button}
            </div>
        )
    }
}


