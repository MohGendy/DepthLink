const Sequelize = require('sequelize');

const sequelize = new Sequelize("db_name","db_user","db_pass",{
    host: "host",/assets/images/logo.jpeg
    port: 3306, 
    dialect: 'mysql',
})

sequelize.authenticate().then(()=>{
    console.log('connected to db');
}).catch(()=>{
    console.log('cannot connect to db');
})

module.exports = sequelize

