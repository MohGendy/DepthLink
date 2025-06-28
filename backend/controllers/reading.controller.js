const {Readings , Sensors} = require('../models/models');

class ReadingConstroller {

    static find(req, res){
        const id = req.query.id || null;
        const num = parseInt(req.query.num) || 0;
        const findOptions = {
            attributes: ['id', 'name', 'warning','height'],
            include: {
                model: Readings,
                as: 'readings',
                separate: true,
                order: [['createdAt', 'DESC']],
            },
        }
        if(num){
            findOptions.include.limit = num;
        }
        if (id) {
            findOptions.where = { id };
        }
        Sensors.findAll(findOptions)
            .then(data => {
                // console.log(data);
                
                if (data.length == 0) {
                    return res.status(404).send("records not found");
                }
                data = data.map(elem=>{
                    let {readings , ...data} = elem.dataValues
                    readings = readings.map(el=>{                        
                        let {value , ...remain} = el.dataValues
                        value =  (data.height-value)
                        return {...remain , value}
                    })                    
                    return {...data,readings}

                })                
                res.json(data);
            })
            .catch(err => {
                console.log('Error while finding records: \n', err);
                res.status(500).send("Error while finding records");
            });
    }

    static destroy(req,res){
        const id = req.query.id || null
        if(!id){
            return res.status(400).send("missing data in the request")
        }
        Readings.findOne({where:{id}}).then(reading =>{
            if(!reading){
                return Promise.reject("record not found")
            }else{
                return reading.destroy()
            }
        }).then(()=>{
            res.send("record deleted successfully")
        }).catch((err)=>{
            if(err == "record not found"){
                res.status(404).send(err)
            }else{
                console.log('error while deleting reading: \n',err);
                res.status(500).send("error while deleting records")
            }
        })
    }

    static clear(req,res){
        const {id,key} = req.query
        if(key === 'Midas'){
            let opt = id?{where:{sensorID:id}}:{where:{},truncate:true}
            Readings.destroy(opt).then(deleteCount=>{
                if(deleteCount <= 0){
                    res.status(201).send("no records to delete")
                }else{
                    res.send(`deleted ${deleteCount}  records`)
                }
            }).catch(err=>{
                console.log('error while deleting records: \n',err);
                res.status(500).send("error while deleting records")
            })
        }else{
            res.status(401).send("unautharized request")
        }
    }

}

module.exports = ReadingConstroller;