const moongose = require("mongoose");

const schema = mongoose.Schema({
    role_id: {type: moongose.SchemaTypes.ObjectId, required: true},
    user_id: {type: moongose.SchemaTypes.ObjectId, required: true},
},{
    versionKey: false,
    timestamps:{
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
    
});

class UserRoles extends mongoose.Model{

}

schema.loadClass(AuditLogs);
module.exports = mongoose.model("user_roles", schema);
 
