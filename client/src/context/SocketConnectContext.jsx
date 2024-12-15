import io from "socket.io-client";
import { baseUrl } from "../Constant";
import { createContext, useContext, useEffect, useMemo, useState } from "react";


const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const [socketId, setSocketId] = useState(null);

    const socket = useMemo(() => io(baseUrl, {
        withCredentials: true,
        reconnection: true, // Enable reconnection
        reconnectionAttempts: Infinity, // Number of reconnection attempts before giving up
        reconnectionDelay: 200, // Time to wait before attempting to reconnect (in ms)
        reconnectionDelayMax: 5000, // Maximum time to wait between reconnections (in ms)
        randomizationFactor: 0.5, // Randomization factor for reconnection delay
        transports: ['websocket', 'polling'],
    }), []);

    useEffect(() => {
        const handleConnect = (data) => {
            setSocketId(() => socket.id)
        }

        const handleDisconnect = () => {
            console.log('Disconnected from the server');
            setSocketId(() => null)
        };
        const handleError = (err) => {
            console.log(`Error occurred while connecting to the server and error is ${err}`);
            setSocketId(() => null)
        }

        socket.on('connect', () => { handleConnect() });
        socket.on('disconnect', handleDisconnect);
        socket.on('error', handleError);

        return () => {
            console.log('cleaning')
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('error', handleError);
            socket.disconnect();
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, socketId }}>
            {children}
        </SocketContext.Provider>
    );
}

export const GetSocket = () => useContext(SocketContext);
export default SocketProvider;
