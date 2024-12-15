import React, { Children, useEffect, useState } from 'react'
import { GetSocket } from '../context/SocketConnectContext'
import ReactPlayer from 'react-player';
import './calling.css'
import { useSocketEvent } from '../hooks/socket_hooks'
import { PeerServices } from '../lib/peerServiceManager'

function Calling() {

    const [myStream, setMyStream] = useState();
    const [remoteStreams, setRemoteStreams] = useState([]);
    const { socket, socketId } = GetSocket()

    const handleIncomingCall = async ({ from, offer }) => { // picking incoming call automatically
        console.log({ from, offer });
        // if (!myStream) {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        setMyStream(stream)
        // }
        const peer = PeerServices.getPeerService(from);

        // Listen for incoming tracks
        peer.peer.ontrack = (event) => {
            console.log('Track received:', event);
            addRemoteStream(event.streams[0]);
        };

        // Handle negotiationneeded event
        peer.peer.onnegotiationneeded = async () => {
            const newOffer = await peer.getOffer();
            console.log("negotiation needed")
            socket.emit('renegotiate_offer', { to: from, offer: newOffer });
        };

        const ans = await peer.getAnswer(offer);
        socket.emit('received_call_response', { to: from, ans });
    }

    const handleDialledCallResponse = async ({ from, ans }) => {
        console.log({ from, ans });
        const peer = PeerServices.getPeerService(from)

        // Set the received answer as the remote description
        await peer.setLocalDescription(ans);

        // Add local tracks to the connection
        for (let track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }

        // Listen for incoming tracks
        peer.peer.ontrack = (event) => {
            console.log('Track received:', event.streams[0]);
            addRemoteStream(event.streams[0]);
        };

        // Handle negotiationneeded event
        peer.peer.onnegotiationneeded = async () => {
            const newOffer = await peer.getOffer();
            console.log("negotiation needed")
            socket.emit('renegotiate_offer', { to: from, offer: newOffer });
        };

    }

    const handleRenegoteOffer = async ({ from, offer }) => {
        console.log("received negotiation offer")
        const peer = PeerServices.getPeerService(from);
        const ans = await peer.getAnswer(offer);

        socket.emit('renegotiate_answer', { to: from, ans });
    }

    const handleRenegoteAns = async ({ from, ans }) => {
        console.log("received negotiation ans")

        const peer = PeerServices.getPeerService(from);
        await peer.setLocalDescription(ans);
        socket.emit('send_stream', { to: from });
    }

    const handleSendStream = async ({ from }) => {
        console.log("handle send stream called")
        try {
            sendStreams();
        } catch (error) {
            console.log(error)
        }
    }
    useSocketEvent(socket, {
        "incoming_call": handleIncomingCall,
        "dialled_call_response": handleDialledCallResponse,
        "renegotiate_offer": handleRenegoteOffer,
        "renegotiate_answer": handleRenegoteAns,
        // "send_stream": handleSendStream
    })
    // Helper Function to Add a Remote Stream to State
    const addRemoteStream = (stream) => {
        setRemoteStreams((prevStreams) => {
            const streamExists = prevStreams.some(
                (existingStream) => existingStream.id === stream.id
            );
            if (!streamExists) {
                return [...prevStreams, stream];
            }
            return prevStreams;
        });
    };

    const sendStreams = () => {
        PeerServices.peerServices.forEach((peer, key) => {
            // Add local tracks to the connection
            for (let track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream);
            }
            console.dir(peer.peer)
        })
    }

    return (
        <div>
            <div>socket id is {socketId ? socketId : "nothing"}</div>
            <div id='video_container'>video container
                <div>
                    {
                        myStream && <><h3>My Stream</h3> <ReactPlayer playing muted height="300px" width="500px" url={myStream} /></>
                    }
                </div>
                <div>
                    {
                        remoteStreams.length > 0 && (
                            <>
                                <h3>Remote Streams</h3>
                                {
                                    remoteStreams.map((stream, index) => (
                                        <ReactPlayer key={index} playing height="300px" width="500px" url={stream} />))
                                }
                            </>
                        )
                    }
                </div>

            </div>
            <div id='button_container'>
                <h2>Control container</h2>
                <input type="text" id="socketIdInput" />
                <button onClick={async () => {
                    const toSocketId = document.getElementById('socketIdInput').value
                    const peer = PeerServices.getPeerService(toSocketId);
                    const offer = await peer.getOffer();
                    // if (!myStream) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    })
                    setMyStream(stream)
                    // }

                    socket.emit('calling', { to: toSocketId, offer })

                    // console.log(peer)
                }}>Call</button>
                <button onClick={async () => {
                    const entriesArray = Array.from(PeerServices.peerServices.entries());
                    console.dir(entriesArray);
                }}>print map</button>
                <button onClick={() => {
                    sendStreams();
                }}>Send Stream</button>
            </div>
        </div>
    )
}

export default Calling