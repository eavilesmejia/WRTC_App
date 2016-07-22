import React, {Component} from 'react';


export default class Video extends Component {
    render() {
        return (
            <video className={this.props.class} src={this.props.src} autoPlay>
            </video>
        );
    }
}