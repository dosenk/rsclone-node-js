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
            origins:["https://rsclone-node-js.herokuapp.com/"],
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
            console.log(socket.id, '- socket id');
            this.users.set(socket.id, args);
            if (!this.gameFlag) this.setPainter(socket.id)
            else {
                this.guesser.push(socket.id);
                this.io.to(socket.id).emit("game", 'guesser');
                }
            });

            socket.on("disconnect", () => {
                this.users.delete(socket.id);
                this.painter = this.painter.filter((soketId) => soketId !== socket.id);
                this.guesser = this.guesser.filter((soketId) => soketId !== socket.id);
                if (this.painter.length === 0) this.gameFlag = false;
            });
        });
    }

    setPainter(socketId) {
        let gamer = 'painter';
        if (this.painter.indexOf(socketId) === -1) {
            this.painter.push(socketId);
            this.gameFlag = true;
            this.io.to(socketId).emit("game", gamer);
        } else {
            this.guesser.push(socketId);
            this.io.to(socketId).emit("game", 'guesser');
        }
    }
}

module.exports = new SocketController(server, CONSTANTS);