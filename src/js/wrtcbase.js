/**
 * Created with JetBrains PhpStorm.
 * User: Geolffrey Mena
 * Date: 08-13-13
 * Time: 09:20 PM
 * WebRTC.
 */


/**Dialogs*/
'use strict';
var WARNING_RTC = {
    ERROR: {
        RTCCORE: {
            NOTPEER: 'Es necesario setear el peer. connectPeer',
            NOTCHANNEL: 'Es necesario el canal. createChannel',
            NODEVICE: 'No se encontr&oacute; ningun dispositivo. Por favor conecte uno.',
            DEVICENOFOUND: 'El dispositivo no puede ser encontrado.',
            DEVICEPERMISSIONDENIED: 'Permiso denegado para utilizar sus dispositivos. Por favor conceda permiso o verifique que exista un dispositivo conectado.',
            SOCKETNOTSET: 'Es necesaria la inicalizacion del signaling para su uso'
        }
    }
};

var RTCPeer = function () {
    /**Variables*/
    var _proto = this.__proto__,
        _navigator = _.getNav(),
        _answerDone = false,
        _callDone = false,
        _videoAudioMandatory = _navigator.nav != 'firefox' ? {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        } : null,
        _peerClass = (typeof webkitRTCPeerConnection !== 'undefined' && webkitRTCPeerConnection)
            || (typeof mozRTCPeerConnection !== 'undefined' && mozRTCPeerConnection)
            || (typeof RTCPeerConnection !== 'undefined' && RTCPeerConnection),

        _sdp = (typeof webkitRTCSessionDescription !== 'undefined' && webkitRTCSessionDescription)
            || (typeof mozRTCSessionDescription !== 'undefined' && mozRTCSessionDescription)
            || (typeof RTCSessionDescription !== 'undefined' && RTCSessionDescription),

        _ice = (typeof webkitRTCIceCandidate !== 'undefined' && webkitRTCIceCandidate)
            || (typeof mozRTCIceCandidate !== 'undefined' && mozRTCIceCandidate)
            || (typeof RTCIceCandidate !== 'undefined' && RTCIceCandidate);


    /**Atributos*/
    this.sdp = null;
    this.peer = null;
    this.remoteDescription = null;

    this.onconnected = null;
    this.onopen = null;
    this.onclose = null;

    this.onaddstream = null;
    this.onendstream = null;
    this.onbrokenstream = null;

    this.onsignalingstate = null;
    this.onconnectionstate = null;
    this.onicecandidate = null;

    this.remoteStream = false;
    this.channel = null;

    this.onchannelopen = null;
    this.onchannelmessage = null;
    this.onchannelclose = null;


    //Devuelve la configuracion de los servidores TURN y STUN
    _proto.getStunAndTurnServers = function () {

        var STUN = {url: _navigator == 'Chrome' ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'},
            TURN = {url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo'},
            IceServers = {
                iceServers: [STUN]
            };

        if (_navigator.nav == 'chrome') {
            if (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 28)
                TURN = {
                    url: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                };
            IceServers.iceServers = [STUN, TURN];
        }

        return IceServers;

    };

    /**Establece el SDP generado como descripcion local*/
    _proto.setLocalDescription = function (sdp) {
        var self = this;

        _.warning('Signaling.. ');
        self.peer.setLocalDescription(sdp);
        self.sdp = sdp;

    };

    _proto.setRemoteDescription = function (msg, callback) {
        var self = this;
        _.warning('Receiving Singal..');
        self.remoteDescription = new _sdp(msg.sdp);
        self.peer.setRemoteDescription(self.remoteDescription, callback);
    };

    _proto.addIceCandidate = function (msg) {
        var self = this;
        _.warning('Receiving Candidate..');
        self.peer.addIceCandidate(new _ice({
            sdpMLineIndex: msg.sdpMLineIndex,
            candidate: msg.candidate
        }));

    };

    /**Realiza una llamada
     * @param callback function
     * @return void
     * */
    _proto.call = function (callback) {
        var self = this;

        self.peer.createOffer(callback, function (e) {
            _.error('ERROR OFFER' + e);
        }, _videoAudioMandatory);
        _callDone = true;


    };

    /**Responde a una llamada
     * @param callback function
     * @return void
     * */
    _proto.answer = function (callback) {
        var self = this;

        self.peer.createAnswer(callback, function (e) {
            _.error('ERROR ANSWER ' + e);
        }, _videoAudioMandatory);
        _answerDone = true;

    };

    _proto.mediaError = function (e) {
        var self = this;
        if (e === 'NO_DEVICES_FOUND' || e.name === 'NO_DEVICES_FOUND') {
            self.error(WARNING_RTC.ERROR.RTCCORE.NODEVICE);
        } else {
            if (e === 'HARDWARE_UNAVAILABLE' || e.name === 'HARDWARE_UNAVAILABLE') {
                self.error(WARNING_RTC.ERROR.RTCCORE.DEVICENOFOUND);
            } else {
                if (e === 'PERMISSION_DENIED' || e.name === 'PERMISSION_DENIED') {
                    self.error(WARNING_RTC.ERROR.RTCCORE.DEVICEPERMISSIONDENIED);
                }
            }
        }
    };

    _proto.addStream = function (stream) {
        this.peer.addStream(stream);
    };

    _proto.mediaUp = function (constraints, callback) {
        var self = this;
        navigator.userMedia = (navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia);
        navigator.userMedia(
            constraints,
            function (stream) {
                if (callback) {
                    callback(stream);
                }

            }, self.mediaError);
    };


    /********PEER CONFIGS********/

    /**Connecting Peer*/

    _proto.holdOn = function () {
        var self = this;
        if (_answerDone || _callDone) {
            _answerDone = false;
            _callDone = false;
            self.onaddstream();
        } else {
            setTimeout(function () {
                self.holdOn();
            }, 1000)
        }
    };

    _proto.connectPeer = function () {
        var self = this;
        _.warning('Peer Seteado');
        var optional = {
                optional: []
            },
            _iceServers = self.getStunAndTurnServers();

        self.peer = new _peerClass(_iceServers, optional);

        /**Basic Listener Events*/
        self.peer.addEventListener('addstream', function (remote) {
            if (!remote)return;
            var remoteStream = remote.stream;

            remoteStream.onended = function (e) {
                if (self.onendstream) {
                    self.onendstream(remoteStream);
                }
            };

            remoteStream.onremovetrack = function (e) {
                if (self.onbrokenstream) {
                    self.onbrokenstream(remoteStream);
                }
            };

            self.remoteStream = remoteStream;
            if (self.onaddstream) {
                self.holdOn();
            }
        });

        self.peer.addEventListener('open', function () {
            if (self.onopen) {
                self.onopen(true);
            }
        });

        self.peer.addEventListener('icecandidate', function (obj) {
            if (self.onicecandidate) {
                self.onicecandidate({candidate: obj.candidate});
            }
        });

        self.peer.addEventListener('negotiationneeded', function () {
            //self.call();
        });

        self.peer.addEventListener('signalingstatechange', function (e) {
            if (self.onsignalingstate) {
                self.onsignalingstate(e);
            }
        });

        self.peer.addEventListener('iceconnectionstatechange', function (e) {
            var target = e.currentTarget;

            if (target.iceConnectionState === 'disconnected') {
                if (self.onclose) {
                    self.onclose(target);
                }
            }

            if (target.iceConnectionState === "connected"
                && target.signalingState === "stable"
                && target.iceGatheringState === 'complete'
            ) {

                if (self.onconnected) {
                    self.onconnected(target);
                }

            }

            if (self.onconnectionstate) {
                self.onconnectionstate(target);
            }
        });

        return self.peer;

    };

    /**Event Handler
     * @param events string
     * @param callback function
     * @return object
     * */
    _proto.on = function (events, callback) {
        var self = this;
        if (!callback) {
            return false;
        }

        return [{
            open: function () {
                self.onopen = callback;
            },
            close: function () {
                self.onclose = callback;
            },
            stream: function () {
                self.onaddstream = callback;
            },
            connected: function () {
                self.onconnected = callback;
            },
            icecandidate: function () {
                self.onicecandidate = callback;
            },
            'connectionstate': function () {
                self.onconnectionstate = callback;
            },
            'signalingstate': function () {
                self.onsignalingstate = callback;
            },
            streamend: function () {
                self.onendstream = callback;
            },
            brokenstream: function () {
                self.onbrokenstream = callback;
            }

        }[events]()];

    };


    /**Closing Peer*/
    _proto.closePeer = function (callback) {
        var self = this;
        if (self.peer) {
            self.peer.close();
            self.peer = null;
        }

        if (callback) {
            callback(true);
        }

        //playPauseSoundCall(true);
    };

    /*********CHANNELS*********/

    _proto.createChannel = function (name, conf) {
        var self = this;
        if (!self.peer) {
            _.error(WARNING_RTC.ERROR.NOTPEER);
        }

        self.channel = self.peer.createChannel(name, _.extend(conf, {
            reliable: false
        }));

        self.channel.addEventListener('message', function (event) {
            if (self.onchannelmessage) {
                self.onchannelmessage(event.data);
            }
        });

        self.channel.addEventListener('open', function () {
            if (self.onchannelopen) {
                self.onchannelopen(true);
            }
        });

        self.channel.addEventListener('close', function () {
            if (self.onchannelclose) {
                self.onchannelclose(true);
            }
        });


    };

    _proto.channelSend = function (msg) {
        var self = this;
        if (!self.channel) {
            _.error(WARNING_RTC.ERROR.NOTCHANNEL);
        }
        self.channel.send(msg);

    };

    _proto.closeChannel = function () {
        var self = this;
        if (!self.channel) {
            _.error(WARNING_RTC.ERROR.NOTCHANNEL);
        }

        self.channel.close();
    };

    /**Event Handler
     * @param events string
     * @param callback function
     * @return object
     * */
    _proto.onChannel = function (events, callback) {
        var self = this;
        return [{
            open: function () {
                if (callback) {
                    self.onchannelopen = callback;
                }
            },
            close: function () {
                if (callback) {
                    self.onchannelclose = callback;
                }
            },
            message: function () {
                if (callback) {
                    self.onchannelmessage = callback;
                }
            }

        }[events]()];

    };

    _proto.setBandwidth = function (sdp, audio, video) {
        sdp.sdp = sdp.sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audio + '\r\n');
        sdp.sdp = sdp.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + video + '\r\n');
        return sdp;
    };

    _proto.addStereo = function (sdp) {
        var sdpLines = sdp.split('\r\n'),
            opusPayload = 0, fmtpLineIndex = 0;

        _.each(sdpLines, function (v) {
            if (v.search('opus/48000') !== -1) {
                opusPayload = extractSdp(v, /:(\d+) opus\/48000/i);
                return false;
            }
        });

        _.each(function (v, i) {
            if (v.search('a=fmtp') !== -1) {
                var payload = extractSdp(v, /a=fmtp:(\d+)/);
                if (payload === opusPayload) {
                    fmtpLineIndex = i;
                    return false;
                }
            }
        });

        if (fmtpLineIndex === null)
            return sdp;

        sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat(' stereo=1');

        sdp = sdpLines.join('\r\n');
        return sdp;
    };


};