// import { time } from 'node:console';
// import { diff } from 'node:util';
import { Server } from 'socket.io';

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    console.log("Socket connected");
    const io = new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
        
    });

    io.on("connection", (socket) => {
        console.log("New user connected");
        socket.on("join-call", (path) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; a++) {
                    io.to(socket.id).emit(
                        "chat-message",
                        messages[path][a]['data'],
                        messages[path][a]['sender'],
                        messages[path][a]['socket-id-sender']
                    );
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] =Object.entries(connections)
                .reduce(([room,isFound],[roomkey, roomValue]) =>{
                     if(!isFound && roomValue.includes(socket.id)){
                         return [roomkey, true];
                     }
                     return [room ,isFound]
                 },['', false]);
            if (found==true) {
                if(messages[matchingRoom] ===undefined){
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    'data': data,
                    'sender': sender,
                    "socket-id-sender": socket.id
                });
                console.log("message",matchingRoom, ":", sender,data)

                connections[matchingRoom].forEach((elem)=>{
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                })
            }
        });

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date());
            console.log(diffTime);
            
            let key;

            for(const [room,clients] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                for(let a = 0; a<clients.length; ++a){
                    if(clients[a] === socket.id){
                        key = room;
                        for(let a=0; a< connections[room].length; a++){
                            io.to(connections[key][a]).emit("user-left", socket.id);
                        }
                        let index = connections[room].indexOf(socket.id);
                        connections[room].splice(index, 1);
                        if(connections[room].length === 0){
                            delete connections[room];
                            delete messages[room];
                        }

                    }
                }
            }
        });


    });

    return io;
};
