const mongoose = require("mongoose");
let instance = null;
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

class Database {

    constructor() {

        if(!instance){
           this.mongoConnection = null;
           instance = this; 
        }
        return instance;
    }


    async connect() {
        try{
         console.log("Bağlanıyor..");
         console.log("🔥 ENV TEST:", process.env.CONNECTION_STRING);

         let db = await mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

         this.mongoConnection = db;
         console.log("Bağlantı sağlandı");
        } catch(err){
            console.error(err);
            process.exit(1);

        }
        
    }
}

module.exports = Database;