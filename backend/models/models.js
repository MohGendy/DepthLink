const Readings = require('./reading.model');
const Sensors = require('./sensor.model');

Readings.belongsTo(Sensors,{
    foreignKey: 'sensorID',
    as:'sensor',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Sensors.hasMany(Readings,{
    foreignKey: 'sensorID',
    as:"readings",
    onDelete:"CASCADE",
    onDelete:"CASCADE"
})

module.exports = {Readings, Sensors};