const path = require('path');
const jwt = require('jsonwebtoken');

class FrontController {

    static home(req,res){
        res.sendFile(path.join(__dirname,"../../frontend/index.html"))
    }
    static dashboard(req,res){
        res.sendFile(path.join(__dirname,"../../frontend/dashboard.html"))
    }
    static sensors(req,res){
        res.sendFile(path.join(__dirname,"../../frontend/sensors.html"))
    }
    static readings(req,res){
        res.sendFile(path.join(__dirname,"../../frontend/readings.html"))
    }
    static loginPage(req,res){
        res.sendFile(path.join(__dirname,"../../frontend/login.html"))
    }
    static auth(req,res,next){
        if(!req.cookies.auth){
            res.redirect(`/login?d=${req.url}`)
        }else{
            const token = req.cookies.auth;
            jwt.verify(token,"test1234@ourteam",(err,decoded)=>{
                if(err){
                    res.redirect(`/login?d=${req.url}`)
                }else{
                    req.user = decoded;
                    next();
                }
            });
        }
    }
    static login(req,res){
        const {username,password,d} = req.body;
        if(password == "123456789"){
            const token = jwt.sign({username}, "test1234@ourteam");
            res.cookie('auth',token,{maxAge:1000*60*60*3});
            res.redirect(d)
        }else{
            res.redirect("/login?msg=4&d="+d)
        }
    }
}

module.exports = FrontController