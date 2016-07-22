/**
 * Created by gmena on 06-16-16.
 */

export default class RTC {

    constructor() {
        //Navigator info
        this.isMozNav = !!navigator.mozGetUserMedia;
        this.chromeVersion = this.isMozNav
            ? 0 : parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

        // Basic objects
        // RTC Peer Fallback
        this.RTCPeerConnection = window.RTCPeerConnection
            || window.webkitRTCPeerConnection
            || window.mozRTCPeerConnection;
        // SessionDescription Fallback
        this.SessionDescription = window.RTCSessionDescription
            || window.mozRTCSessionDescription;
        // IceCandidate Fallback
        this.IceCandidate = window.RTCIceCandidate
            || RTC.window.mozRTCIceCandidate;


        //Basic conf
        this.conf = {
            //Handle bandwidth usage
            bandwidth: {
                audio: 50,
                video: 256,
                data: 30 * 1000 * 1000
            },
            constraints: {
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 0x280,
                        minHeight: 0x1E0,
                        maxWidth: 0x500,
                        maxHeight: 0x2D0
                    },
                    optional: []
                }
            }

        };

    }



    /***
     * Set configuration
     * @param conf
     */
    setConf(conf) {
        this.conf = Object.assign(
            this.conf, conf
        )
    }

    /**
     * Resolve needed ICE Servers for NAT traversing
     * @return object
     * */
    getStunAndTurnServers() {

        let IceServers = [];

        if (this.isMozNav) {
            IceServers.push({
                url: 'stun:23.21.150.121'
            });

            IceServers.push({
                url: 'stun:stun.services.mozilla.com'
            });
        }

        if (!this.isMozNav) {
            IceServers.push({
                url: 'stun:stun.l.google.com:19302'
            });

            IceServers.push({
                url: 'stun:stun.anyfirewall.com:3478'
            });
        }

        if (!this.isMozNav && this.chromeVersion < 28) {
            IceServers.push({
                url: 'turn:homeo@turn.bistri.com:80',
                credential: 'homeo'
            });
        }

        if (!this.isMozNav && this.chromeVersion >= 28) {
            IceServers.push({
                url: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            });

            IceServers.push({
                url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            });
        }

        //IceServers Object
        return {
            iceServers: IceServers
        };
    }

    /***
     * Set bandwidth usage
     * @param sdp
     * @return {XML|string|void|*}
     */
    setBandwidth(sdp) {

        if (this.isMozNav/* || navigator.userAgent.match( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i ) */)
            return sdp;

        // remove existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

        //Replace bandwidth
        for (var key of this.conf.bandwidth) {
            let regexp = new RegExp('a=mid:' + key + '\r\n', 'g');
            sdp = sdp.replace(regexp, 'a=mid:' + key + '\r\nb=AS:' + this.conf.bandwidth[key] + '\r\n');
        }

        //Modified sdp
        return sdp;
    }

    /***
     * Start media
     * @return object
     *
     */
    mediaUP() {
        navigator.userMedia = (
            navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia
            || navigator.getUserMedia
        );

        return new Promise((res, err) => {
            navigator.userMedia(
                this.conf.constraints,
                stream => res(
                    window.URL.createObjectURL(stream)
                ), err
            );
        });

    }



}