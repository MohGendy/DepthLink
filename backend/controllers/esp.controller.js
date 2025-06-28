const {Readings , Sensors} = require('../models/models');
const {EventEmmiter} = require('../services/socket');
class EspController {

    static insert(req,res){
        const data = req.body.data || []
        if(data.length){
            Readings.bulkCreate(data).then(records=>{
                return Readings.findAll({
                    where: {
                        id : records.map(el=>el.id)
                    },
                    attributes:['value','sensorID',"id"],
                    include:{
                        model:Sensors,
                        as:"sensor",
                        attributes:['warning','height']
                    }
                })
            }).then(records=>{
                let temp = records
                console.log(temp);
                
                temp.forEach(e => {
                    e.value = e.sensor.height - e.value
                });

                EventEmmiter.emit("new",temp)
                if(records.some(elem=>(elem.sensor.height - elem.value) >= elem.sensor.warning)){
                    res.status(427).send('warning high water level')
                }else{
                    res.send('records added successfully')
                }
            }).catch(err=>{
                console.log('error while add records: \n',err);
                res.status(500).send("error while add records - sensor might be undefined")
            })
        }else{
            res.status(400).send("no records to add")            
        }
    }
}

module.exports = EspController;