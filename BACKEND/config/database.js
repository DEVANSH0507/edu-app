const mongoose = require('mongoose');
require("dotenv").config()
const connected = {}
exports.connect = () => {
    if(connected?.isConnected){
        console.log("alraidy connected");

         process.exit(1);
    }

    mongoose.connect(process.env.EXTRA_DB_LINK)
    .then(() => {
        console.log("Database Connection established")
        connected.isConnected= true
    })
    .catch((err) => {
        // console.error(err)
        console.log("Connection Issues with Database");
        process.exit(1);
    })
}