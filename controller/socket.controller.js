const CONSTANTS = require('../constants/constants');
const server = require('http');
const io = require('socket.io');

class SocketController {
    constructor(server, url) {
        this.server = server;
        this.url = url;
        this.users = new Map();
        this.painter = [];
        this.guesser = [];
        this.gameFlag = false;
    }
    
    start(httpServer) {
        const options = {
            cors: true,
            methods: ["GET", "POST"],
            origins:[CONSTANTS.SOCKET_SERVER_URL],
        };
        this.io = io(httpServer, options);
        this.addEventListeners();
    }

    addEventListeners() {
        this.io.on('connection', socket => { 
            socket.on("broadcast", (args) => {
                console.log(args);
                this.io.emit("broadcast", this.users.get(socket.id), args);
            });

           

            socket.on("name", (args) => {
                console.log(socket.id, ' - connected');
                this.users.set(socket.id, args);
                if (!this.gameFlag) this.setPainter(socket.id)
                else {
                    this.guesser.push(socket.id);
                    this.io.to(socket.id).emit("role", CONSTANTS.ROLE_GUESSER);
                    }
            });

             socket.on("draw", (info, actionType) => {
                socket.broadcast.emit("draw", info, actionType);
            });

            socket.on("disconnect", () => {
                console.log(socket.id, ' - disconnected');
                this.users.delete(socket.id);
                this.painter = this.painter.filter((soketId) => soketId !== socket.id);
                this.guesser = this.guesser.filter((soketId) => soketId !== socket.id);
                if (this.painter.length === 0) this.gameFlag = false;
            });
        });
    }

    setPainter(socketId) {
        if (this.painter.indexOf(socketId) === -1) {
            this.painter.push(socketId);
            this.gameFlag = true;
            this.io.to(socketId).emit("role", CONSTANTS.ROLE_PAINTER);
        } else {
            this.guesser.push(socketId);
            this.io.to(socketId).emit("role", CONSTANTS.ROLE_GUESSER);
        }
    }
}

module.exports = new SocketController(server, CONSTANTS);