const { Server } = require("socket.io");
const { getIo, setIo } = require("./socket/io");

function initializeSocket(server, corsOptions) {
    setIo(new Server(server, { cors: corsOptions }));

    const io = getIo();

    io.use((socket, next) => {
        console.log(`from line 10 of socketSetup ${socket}`)
        // console.log({socket})
        next()
    });

    io.on("connection", (socket) => {
        console.log({ id: socket.id })
        socket.on('calling', ({ to, offer }) => {
            io.to(to).emit("incoming_call", ({ from: socket.id, offer }))
        })
        socket.on('received_call_response', ({ to, ans }) => {
            io.to(to).emit('dialled_call_response', { from: socket.id, ans })
        })
        socket.on('renegotiate_offer', ({ to, offer }) => {
            // console.log("received re-negotiation")
            // console.log({ to, offer })
            io.to(to).emit('renegotiate_offer', { from: socket.id, offer })
        })
        socket.on('renegotiate_answer', ({ to, ans }) => {
            io.to(to).emit('renegotiate_answer', { from: socket.id, ans })
        })
        socket.on('send_stream', ({ to }) => {
            console.log("first")
            io.to(to).emit("send_stream", { from: socket.id });
        })

        socket.on("disconnect", () => {
            console.log("user disconnected");

        });
    });

    return io;
}

module.exports = { initializeSocket };
