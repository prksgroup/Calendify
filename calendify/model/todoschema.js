//importing mongoose to crete schema
const mongoose = require('mongoose');
const todoschema = new mongoose.Schema({

    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {

        type: String,
        required: true
    },
    timefrom: {
        type: String,
        required: true
    },
    timeto: {
        type: String,
        required: true
    },
    availableday: [{
        type: String,
        required: true
    }]
}, {
    //timestamps to get info about creation and updation 
    timestamps: true
});
const todo = mongoose.model('todo', todoschema);
//exporting created schema 
module.exports = todo;