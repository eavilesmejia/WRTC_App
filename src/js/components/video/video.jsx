import React, {Component} from 'react';


export default class Video extends Component {
    render() {
        return (
            <video src={this.props.src} autoPlay>
            </video>
        );
    }
}