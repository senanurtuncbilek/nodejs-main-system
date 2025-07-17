const mongoose = require("mongoose");
let instance = null;

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