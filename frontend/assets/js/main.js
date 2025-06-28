// import {io} from "../vendor/socket/client-dist/socket.io"
// const {io} = require('../vendor/socket/client-dist/socket.io');
const socket = io("http://localhost:3030");

socket.on("connect", () => {
  console.log("connected");
});

console.log("test");

socket.on("new",(data)=>{
    console.log(data);
    
})
