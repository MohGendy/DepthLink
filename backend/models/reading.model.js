const {DataTypes} = require('sequelize');
const Sequelize = require('../db/db');
const Sensors = require('./sensor.model');

const Readings = Sequelize.define("reading",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sensorID:{
        type:DataTypes.INTEGER,
    },
    value:{
        type:DataTypes.DOUBLE,
        allowNull: false,
    }
},{
    timestamps: true
})


module.exports = Readings