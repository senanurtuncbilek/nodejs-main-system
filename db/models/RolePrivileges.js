const mongoose = require("mongoose");

const schema = mongoose.Schema({
    role_id: { type: mongoose.SchemaTypes.ObjectId, required: true},
    permission: { type: String},
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
    }
},{
    versionKey: false,
    timestamps:{
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
    
});

class Role_Privileges extends mongoose.Model{

}

schema.loadClass(Role_Privileges);
module.exports = mongoose.model("role_privileges", schema);
 
