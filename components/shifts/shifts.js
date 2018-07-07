const config = require('config');
const mongoose = require('mongoose');
const moment = require('moment');
const utilities = require('../utilities.js') 
const debug = require('debug')('shifts');

//Config
const slots = config.get('appointment.slots');
const apptDuration = config.get('appointment.duration');

// mongoose.set('debug',true);
mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{debug('Connected to MongoDB...');})
    .catch((err)=>{debug(err);});


//Get reference to database 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const shiftSchema = new mongoose.Schema({
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
    appointmentSlots: [ Object ]
});

//Create the shift model
const Shift = mongoose.model('Shift', shiftSchema);



//Creates a shift
async function createShift(start, end, regionName, regionNumber, employeeId){

    const shift = new Shift({
        start,
        end,
        regionName,
        regionNumber,
        employeeId
    });

    //Add shifts to slot
    shift.appointmentSlots = getRelevantSlots(shift.start, shift.end);

    return await shift.save();
}



//Takes single document or array of documents
function upsert(query, documents, options){

    options = options || { upsert:true, runValidators:true, new: true }

    if(Array.isArray(documents))
        return documents.map( document => update( query, document, options ) )
    
    return update( query, documents, options );

}

// Updates shifts in database
function update(query, document, options, callback){

    options = options || {new:true, runValidators:true, upsert:false };

    try {

        if( document.constructor.name === 'model' ){
            document = document.toObject();
            delete document._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues
        }

        document.appointmentSlots = getRelevantSlots(document.start, document.end);
        
        if(!options.overwrite)
             document = { $set: document }

        return Shift.findOneAndUpdate(query, document, options, callback);

    } catch(err) {

        throw new Error( err.message );

    }
}



//Inserts many documents (shifts) into the database in one call.
//Atomic function
function insertMany(shiftsArray, callback){
    return Shift.insertMany(shiftsArray, callback );
}


function remove(id){
    // const result = await Model.deleteOne({_id:id});
}



//returns array of slots which overlap the given startDateTime and endDateTime
function getRelevantSlots(startDateTime, endDateTime){

    // Convert parameters to moments
    startDateTime = moment(startDateTime);
    endDateTime = moment(endDateTime);

    // Check if parameters are valid moment objects 
    if(!(startDateTime.isValid() & endDateTime.isValid() ) )
        return 

    const relevantSlots = slots
        
        // Filters out slots that don't apply to start day of week 
        .filter( (slot) => slot.dayOfWeek.indexOf( startDateTime.day() ) > -1 ) 

        // Fitler out slots where the shift doesn't meet the minumum overlap requirements
        .filter( (slot) => {

            // Slots have no context, they only apply to days of the week and times
            // Use the date of the input for the date of the slot
            const slotStart = startDateTime.startOf('day').add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
            const slotEnd = endDateTime.startOf('day').add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');

            // Convert overlap from milliseconds to minutes 
            const minutesOverlap = utilities.getRangeOverlap(startDateTime, endDateTime, slotStart, slotEnd) / 60000; 

            slot.overlap = minutesOverlap;
            slot.overlapPerc = (slot.overlap/slot.duration) * 100;

            return minutesOverlap > 0; // Replace "0" with minimum overlap requirements. 
            // Is minumum overlap based on fixed number, percentage or both?
        })

    return relevantSlots
}


module.exports = {
    Shift,
    createShift,
    insertMany,
    upsert,
    update,
    remove
};




