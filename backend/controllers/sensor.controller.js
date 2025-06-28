const {Readings , Sensors} = require('../models/models');

class SensorController {
    
    static create(req,res){
        const {name , warning , height} = req.body
        Sensors.create({name , warning , height}).then((sensor)=>{
            res.send("sensor created successfully")
        }).catch((err)=>{
            console.log('error while creating sensor: \n',err);
            res.status(400).send("error while creating sensor")
        })
    }

    static find(req,res){
        const id = req.query.id || null
        if(id){
            Sensors.findOne({ where: { id } }).then(sensor=>{
            // Sensors.findByPK(id).then(sensor=>{ !better to be used
                if(sensor){
                    res.send(sensor.toJSON())
                }else{
                    res.status(404).send("sensor not found")
                }
            })
        }else{
            Sensors.findAll().then(sensors=>{
                let sensorsJson = sensors.map(el=>{return el.toJSON()})
                res.send(sensorsJson)
            })
        }
    }

    static destroy(req,res){
        const id = req.query.id || null
        if(!id){
            return res.status(400).send("missing data in the request")
        }
        Sensors.findOne({where:{id}}).then(sensor =>{
            if(!sensor){
                return Promise.reject("sensor not found")
            }else{
                // return Promise.resolve("you correct")
                return sensor.destroy()
            }
        }).then(()=>{
            res.send("sensor deleted successfully")
        }).catch((err)=>{
            if(err == "sensor not found"){
                res.status(404).send(err)
            }else{
                console.log('error while deleting sensor: \n',err);
                res.status(500).send("error while deleting sensor")
            }
        })
        
    }

    static update(req,res){
        const {id , ...data} = req.body
        if(!id){
            return res.status(400).send("missing data in the request")
        }
        Sensors.findOne({where:{id}}).then(sensor=>{
            if(!sensor){
                return Promise.reject("sensor not found")
            }
            return sensor.update(data)
        }).then(()=>{
            res.send("sensor updated successfully")
        }).catch(err=>{
            if(err == "sensor not found"){
                res.status(404).send(err)
            }else{
                console.log('error while updating sensor: \n',err);
                res.status(500).send("error while updating sensor")
            }
        })
        
    }
}

module.exports = SensorController;