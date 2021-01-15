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
        this.gameDrawInfo = {
            drawColor: "black",
            drawThickness: 1
        };
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
            const ip = socket.conn.remoteAddress;
            console.log(`client ip: ${ip}`);
            socket.on("broadcast", (args) => {
                this.io.emit("broadcast", this.users.get(socket.id), args);
            });

            socket.on("usersInfo", (info, actionType) => {
                if (actionType === CONSTANTS.NAME) {
                    const name = info;
                    const socketId = socket.id;
                    this.setUserName(socketId, name)
                    if (!this.gameFlag) this.setPainter(socketId, name)
                    else this.setGuesser(socketId, name);
                    this.io.emit("usersInfo", this.getUsers(), CONSTANTS.USERS); //отправляет новому клиенту в игре всех пользователей в игре  
                }
            });

            socket.on("draw", (info, actionType) => {
                this.setDrawInfo(actionType, info);
                socket.broadcast.emit("draw", info, actionType);
            });

            socket.on("disconnect", () => {
                console.log(socket.id, ' - disconnected');
                this.deleteUser(socket.id);
                this.io.emit("usersInfo", this.getUsers(), CONSTANTS.USERS); 
            });
        });
    }

    setDrawInfo(actionType, info) {
        if (actionType === CONSTANTS.DRAW_THICKNESS) this.gameDrawInfo.drawThickness = info;
        if (actionType === CONSTANTS.DRAW_COLOR) this.gameDrawInfo.drawColor = info;
    }

    setDefaultDrawInfo() {
        this.gameDrawInfo.drawColor = 'black';
        this.gameDrawInfo.drawThickness = 1;
    }

    sendDrawInfo(socketEvent, socketId) {
        this.io.to(socketId).emit(socketEvent, this.gameDrawInfo.drawColor, CONSTANTS.DRAW_COLOR);  
        this.io.to(socketId).emit(socketEvent, this.gameDrawInfo.drawThickness, CONSTANTS.DRAW_THICKNESS);  
    }

    setUserName(socketId, name) {
        this.users.set(socketId, name);  
        this.io.to(socketId).emit("usersInfo", name, CONSTANTS.NAME);   
    }

    setPainter(socketId, name) {
        this.setDefaultDrawInfo(); // для новых painter устанавить параметры по умолчанию
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
        this.sendDrawInfo("draw", socketId); //отправляет новому клиенту в игре параметры рисования
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