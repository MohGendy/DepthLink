const EventEmmiter = require("./event");

function ioHandeler(io){
    io.on("connect",(sockets)=>{
        console.log("a client is connected");
        EventEmmiter.on("new",(data)=>{
            // console.log(data)
            sockets.emit("new",data)
        })
    })
}

module.exports = {ioHandeler,EventEmmiter}