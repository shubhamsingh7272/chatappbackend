const mongoose = require('mongoose')

mongoose.connect(process.env.CONN_STRING)



const db = mongoose.connection

db.on('connected',()=>{
    console.log('connected to database')
})
db.on('error', (err) => {
    console.log(err)
    })

    module.exports = db