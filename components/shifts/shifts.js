'Use Strict';
const config = require('config');
const mongoose = require('mongoose');
const slots = require('../slots/slots');
const log = require('debug')('shifts');
const utilities = require('../utilities')

// mongoose.set('debug',true);
mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{log('Connected to MongoDB...');})
    .catch((err)=>{log(err);});


//Get reference to database 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


// Define schema for shifts
const schema = new mongoose.Schema({
    deputyRosterId: String,
    start: {
        type: Date,
        required: true
    }, 
    end: {
        type: Date,
        required: true
    }, 
    duration: Number,
    regionName: String,
    regionNumber: Number,
    employeeId: Number,
    slots: [ mongoose.Schema.Types.ObjectId ]
});

// Create the shift model
const Model = mongoose.model('Shift', schema);


// Creates a shift
async function createShift(start, end, regionName, regionNumber, employeeId){

    try{

        const shift = new Model({
            start,
            end,
            regionName,
            regionNumber,
            employeeId
        });
        
        //Add shifts to slot
        shift.appointmentSlots = getRelevantSlots(shift.start, shift.end);
        
        return await shift.save();

    } catch(err){
        utilities.handleError(error);
    }
}







//Takes single document or array of documents
async function upsert(query, document, options, callback){

    options = options || { runValidators:true, new: true }
    
    options.upsert = true;

    return await update( query, document, options, callback )

}



// Updates shifts in database
async function update(query, document, options, callback){

    options = options || {new:true, runValidators:true };

    try {

        if( document.constructor.name === 'model' ){
            document = document.toObject();
            delete document._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues
        }

        if(!options.overwrite)
             document = { $set: document }

        return Model.findOneAndUpdate(query, document, options, callback);

    } catch(err) {

        throw new Error( err.message );

    }
}










//Inserts many documents (shifts) into the database in one call.
//Atomic function
function insertMany(shiftsArray, callback){
    return Model.insertMany(shiftsArray, callback );
}


function remove(id){
    // const result = await Model.deleteOne({_id:id});
}



module.exports = {
    Model,
    schema,
    createShift,
    insertMany,
    upsert,
    update,
    remove
};
