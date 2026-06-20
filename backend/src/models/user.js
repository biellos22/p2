const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },

    senha: {
        type: String,
        required: true
    },

    funcao: {
        type: String,
        required: true,
        enum: ['admin', 'funcionario']
    }
},
{timestamps : true}
);

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    userSchema
};