//Importing mongoose to make connectivity with database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/todoapp');
const dataoftodo = mongoose.connection;
dataoftodo.on('error', console.error.bind(console, 'error occurred during connecting the database!'));
dataoftodo.once('open', function() {
        console.log('DATADABE IS CONNECTED SUCCESSFULLY WITH CONTACT APP');
    })
    //Exporting the data base that connected successfully 
module.exports = dataoftodo;