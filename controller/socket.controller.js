const CONSTANTS = require('../constants/constants');
const server = require('http');
const io = require('socket.io');

class SocketController {
    constructor(server, url) {
        this.server = server;
        this.url = url;
        this.users = new Map();
        this.painter = {
            id: null,
            name: null,
        };
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

            socket.on("usersInfo", (info, actionType) => {
                if (actionType === CONSTANTS.NAME) {
                    const name = info;
                    const socketId = socket.id;
                    this.setUserName(socketId, name)
                    if (!this.gameFlag) this.setPainter(socketId, name)
                    else this.setGuesser(socketId, name);
                    this.io.emit("usersInfo", this.getUsers(), CONSTANTS.USERS);  
                }
            });

             socket.on("draw", (info, actionType) => {
                socket.broadcast.emit("draw", info, actionType);
            });

            socket.on("disconnect", () => {
                console.log(socket.id, ' - disconnected');
                this.deleteUser(socket.id);
                this.io.emit("usersInfo", this.getUsers(), CONSTANTS.USERS); 
            });
        });
    }

    setUserName(socketId, name) {
        this.users.set(socketId, name);  
        this.io.to(socketId).emit("usersInfo", name, CONSTANTS.NAME);   
    }

    setPainter(socketId, name) {
        this.painter = {
            id: socketId,
            name
        };
        this.gameFlag = true;
        this.io.to(socketId).emit("usersInfo", CONSTANTS.ROLE_PAINTER, CONSTANTS.ROLE);
    }

    setGuesser(socketId, name) {
        const guesser = {
            id: socketId,
            name
        }
        this.guesser.push(guesser);
        this.io.to(socketId).emit("usersInfo", CONSTANTS.ROLE_GUESSER, CONSTANTS.ROLE);
    }

    getUsers() {
        return { painter: this.painter, guesser: this.guesser } 
    }

    deleteUser(socketId) {
        this.users.delete(socketId);
        if (this.painter.id === socketId) {
            this.painter.id = null;
            this.painter.name = null;
            this.gameFlag = false;
        }
        this.guesser = this.guesser.filter((guesser) => guesser.id !== socketId);
    }
}

module.exports = new SocketController(server, CONSTANTS);