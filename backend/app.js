const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Sequelize = require('./db/db');
const socketIo = require('socket.io');
const {ioHandeler} = require('./services/socket');
const http = require('http');
const app = express()
const server = http.createServer(app)
const io = socketIo(server,{
    cors:{
        origin:"*",
        methods:"*"
    }
})
ioHandeler(io)
app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}));

// -- Routers --
const EspRouter = require('./routes/esp.router');
const SensorRouter = require('./routes/sensor.router');
const ReadingRouter = require('./routes/reading.router');
const FrontRouter = require('./routes/front.router');

//apis for web
app.use('/sensor',SensorRouter)
app.use('/reading',ReadingRouter)
app.use('/esp',EspRouter)
app.use('/',FrontRouter);

Sequelize.sync({alter:true}).then(()=>{
    server.listen(3030,(err)=>{
        if(err){
            console.log("some error happend:\n",err);
        }else{
            console.log("server is running on port 3030");
        }
    })
}).catch((err)=>{
    console.log("some error happend:\n",err);
})

app.get('/test',(req,res)=>{
    res.send("test25");    
})
// mac1 = C8:C9:A3:56:71:12 (big bread board)
// mac2 = C8:C9:A3:57:A1:AA (small bread board)