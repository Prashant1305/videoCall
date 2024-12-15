const express = require("express");
const { initializeSocket } = require("./socketSetup");
const { createServer } = require('http');
const PORT = process.env.PORT || 3012;
const app = express();
app.use(express.json());

const allowedOrigins = [
    'http://www.example.com',
    `${process.env.CORS_ORIGIN}`,
    'https://jq4m0xhj-3000.inc1.devtunnels.ms',
    'https://chitii.vercel.app',
    'https://chitii.netlify.app',
    'http://localhost:3000',
]

var corsOptions = {
    origin: function (origin, callback) {
        if (process.env.NODE_ENV === "development") {
            console.log("req is from ", origin);
        }

        if (allowedOrigins.includes(origin) || !origin || true) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`)); // Block the request
        }
    },
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
};
// SOCKET
const server = createServer(app);
const io = initializeSocket(server, corsOptions)

server.listen(PORT, () => {

    console.log(`server running on port ${PORT}`);
})