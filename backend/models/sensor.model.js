const {DataTypes} = require('sequelize');
const Sequelize = require('../db/db');

const Sensors = Sequelize.define('sensor',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name:{
        type: DataTypes.STRING,
        length: 20,
        allowNull:false,
    },
    warning:{
        type: DataTypes.DOUBLE,
        allowNull:false,
        defaultValue:0
    },
    height:{
        type: DataTypes.DOUBLE,
        allowNull:false,
        defaultValue:0
    },
},{
    timestamps: true
})

module.exports = Sensors;