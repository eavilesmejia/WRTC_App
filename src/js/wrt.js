/**
 * Created by gmena on 01-17-14.
 */

"use strict";
var RTCConnection;
RTCConnection = function ( config ) {
    var _sdp_collection = {},
        _candidate_collection = {},
        _proto = this.__proto__,
        _contraints = {
            video: {
                mandatory: {
                    minWidth:  0x280,
                    minHeight: 0x1E0,
                    maxWidth:  0x500,
                    maxHeight: 0x2D0
                },
                optional:  []
            },
            audio: true
        };

    this.peer = {};
    this.socket = null;
    this.localUser = null;
    this.localStream = null;
    this.remoteUser = null;
    this.onstream = null;
    this.onclose = null;
    this.onconnected = null;
    this.waitingMedia = false;


    _proto.setLocalUser = function ( info ) {
        this.localUser = info;
    };

    _proto.setRemoteUser = function ( usr ) {
        this.remoteUser = usr;
    };

    _proto.call = function ( _user, callback ) {
        var self = this,
            exec = false;

        if ( typeof _user === 'function' ) {
            callback = _user;
            _user = [self.localUser.admin_id];
        }

        _.each ( _user, function ( user ) {
            if ( user !== self.localUser.id && !self.peer[user] ) {
                self.peer[user] = new RTCPeer;
                self.peer[user].connectPeer ();
                self.events ( user );
                self.mediaUp ( user, function ( stream, _user_id ) {
                    self.peer[_user_id].call ( function ( sdp ) {
                        self.peer[_user_id].setLocalDescription ( sdp );
                        self.trace ( {
                            to:  _user_id,
                            sdp: sdp
                        } );

                        if ( callback && !exec ) {
                            callback ( stream );
                            exec = true;
                        }
                    } );
                } );
            }
        } );


    };

    _proto.answer = function ( user, callback ) {
        var self = this;
        self.mediaUp ( user, function ( stream ) {
            // self.signalingConf(user, function () {
            self.peer[user].answer ( function ( sdp ) {
                self.peer[user].setLocalDescription ( sdp );
                self.trace ( {
                    to:  user,
                    sdp: sdp
                } );

                if ( callback ) {
                    callback ( stream );
                }
            } );
            //})

        } );

    };

    _proto.mediaUp = function ( user, callback ) {
        var self = this;

        if ( self.waitingMedia ) {
            setTimeout ( function () {
                self.mediaUp ( user, callback );
            }, 1000 );
            return;
        }

        if ( !!self.localStream ) {
            self.waitingMedia = false;
            self.peer[user].addStream ( self.localStream );
            if ( callback ) {
                callback ( self.localStream, user );
            }
            return;
        }

        self.waitingMedia = true;
        self.peer[user].mediaUp ( _contraints, function ( stream ) {
            self.peer[user].addStream ( stream );
            self.localStream = stream;
            self.waitingMedia = false;
            if ( callback ) {
                callback ( stream, user );
            }
        } );
    };

    _proto.waitForVideo = function ( media, callback ) {
        var self = this;
        if ( media.readyState > 0 && !media.paused && media.currentTime > 0 ) {
            if ( callback ) {
                callback ( true );
            }
        } else {
            setTimeout ( function () {
                self.waitForVideo ( media, callback );
            }, 2000 );
        }
    };


    _proto.showVideo = function ( container, stream, mute ) {

        if ( !stream ) {
            return false;
        }
        var local = document.querySelector ( container );
        local.src = window.URL.createObjectURL ( stream );
        if ( mute ) {
            local.muted = true;
        }
        local.play ();

        return local;
    };


    _proto.events = function ( user ) {
        var self = this;
        self.peer[user].on ( 'stream', function ( stream ) {
            if ( self.onstream ) {
                self.onstream ( stream );
            }
        } );

        self.peer[user].on ( 'icecandidate', function ( obj ) {
            obj.to = user;
            self.trace ( obj );
        } );

        self.peer[user].on ( 'close', function ( e ) {
            if ( self.onclose ) {
                self.onclose ( e, user );
            }
        } );

        self.peer[user].on ( 'connected', function ( e ) {
            if ( self.onconnected ) {
                self.onconnected ( e, user );
            }

        } );

    };

    _proto.trace = function ( msg ) {
        var self = this;
        if ( typeof  msg != 'object' ) {
            self.error ( WARNING_RTC.ERROR.RTCCORE.SENDMSG );
        }

        msg.userinfo = self.localUser;
        msg.to = !!msg.to ? msg.to : self.remoteUser.id;
        msg.all = false;
        self.socket.send ( msg );
    };

    _proto.on = function ( event, callback ) {
        var self = this;
        return [{
            'stream':    function () {
                if ( callback ) {
                    self.onstream = callback;
                }
            },
            'close':     function () {
                if ( callback ) {
                    self.onclose = callback;
                }
            },
            'connected': function () {
                if ( callback ) {
                    self.onconnected = callback;
                }
            }

        }[event] ()]
    };

    _proto.close = function ( user, callback ) {
        var self = this;

        if ( typeof user === 'function' ) {
            callback = user;
            user = self.localUser.id;
        }

        if ( !user ) {
            user = self.localUser.id;
        }

        if ( !!self.localStream ) {
            self.localStream.stop ();
            self.localStream = null;
        }

        if ( !!self.peer[user] ) {
            self.peer[user].closePeer ( callback );
            self.peer[user] = null;
            _.warning ( user + ' cerrado' );
        }

    };

    _proto.signalingConf = function ( user, callback ) {
        var self = this;
        if ( _sdp_collection[user] ) {
            self.peer[user].setRemoteDescription ( _sdp_collection[user] );
        }

        if ( _candidate_collection[user] ) {
            _.each ( _candidate_collection[user], function ( v ) {
                self.peer[user].addIceCandidate ( v );
            } )
        }

        _.callbackAudit ( callback, user );
    };

    _proto.create = function ( _user, _user_id ) {
        var self = this;
        self.peer[_user_id] = new RTCPeer;
        self.peer[_user_id].connectPeer ();
        self.events ( _user_id );
        self.setRemoteUser ( _user )
    };


    _proto.signaling = function ( callback ) {
        var self = this;
        self.socket = new _.Socket;
        self.socket.set ( config );

        self.socket.on ( 'message', function ( data ) {
            var _msg = JSON.parse ( data.data ),
                _user = _msg.userinfo,
                _user_id = _msg.from;

            if ( !self.peer[_user_id] ) {
                self.create ( _user, _user_id )
            }
            if ( !!_msg.sdp && !!_user_id ) {
                self.peer[_user_id].setRemoteDescription ( _msg );
            } else {
                if ( !!_msg.candidate && !!_user_id ) {
                    self.peer[_user_id].addIceCandidate ( _msg.candidate );
                }
            }

            if ( callback ) {
                callback ( {
                    user: _user,
                    data: _msg,
                    type: !!_msg.sdp ? _msg.sdp.type : 'none'
                } );
            }

        } )
    }

};

Syrup.blend ( RTCConnection );