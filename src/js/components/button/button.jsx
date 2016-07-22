import React, {Component} from 'react';


export default class Button extends Component {
    render() {
        return (
            <button className={this.props.class} onClick={this.props.onClick}>
                {this.props.btnContent}
            </button>
        );
    }
}