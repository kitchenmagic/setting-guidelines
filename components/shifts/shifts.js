const config = require('config');
const mongoose = require('mongoose');
const moment = require('moment');
const utilities = require('../utilities.js') 
const debug = require('debug')('shifts');

//Config
const slots = config.get('appointment.slots');
const apptDuration = config.get('appointment.duration');

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{debug('Connected to MongoDB...');})
    .catch((err)=>{debug(err);});

    // mongoose.set('debug',true);

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
    duration: Object,
    regionName: String,
    regionNumber: Number,
    employeeId: Number,
    appointmentSlots: [ Object ]
});

//Create the shift model
const Model = mongoose.model('Shift', shiftSchema);

shiftSchema.pre('update', (doc)=>{
    debug('validate');
    doc();
})

// shiftSchema.on('init', function(){
    // debug('Schema Init');
    
    // if(this.regionName)
    //     this.regionNumber = utilities.parseRegionNumber(this.regionName);
    // addSlotsToShifts(this, slots);
// })

//Set regionNumber
// shiftSchema.pre('findOneAndUpdate', function(next){
//     debug('Pre Update');
//     this.duration = duration( this.start, this.end ).asMinutes(),
//     debug(this);
//     next();
// })



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



//Takes single shift or array of shifts
function upsert(query, documents, options){

    options = options || { upsert:true, runValidators:true, new: true }

    if(Array.isArray(documents)){

        return documents.map( document => update( query, document, options ) )
    }

    return update( query, documents, options );
}




function update(query, document, options, callback){

    options = options || {};

    try {

        if( document.constructor.name === 'model' ){
            document = document.toObject();
            delete document._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues
        }
        
        if(!options.overwrite)
            document = { $set: document }

        if(callback){
            return Model.update(query, document, options, callback);
        }
        
        return Model.update(query, document, options);

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



//returns array of slots which apply to given dateTime range
function getRelevantSlots(startDateTime, endDateTime){

    const inputStart = moment(startDateTime);
    const inputEnd = moment(endDateTime);
    
    //Filters out any slots that don't apply to day of week
    const relevantSlots = slots.filter( slot => slot.dayOfWeek.indexOf( inputStart.day() ) > -1 ) //Filters out slots that don't apply to start day of week
        .filter( (slot)=>{

            const slotStart = moment( inputStart.date() ).add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
            const slotEnd = moment( inputEnd.date() ).add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');

            const overlap = utilities.getRangeOverlap(inputStart,inputEnd,slotStart,slotEnd);

            debug('Overlap: ', overlap);

            return overlap > 0;
        })

    debug('Relevant Slots', relevantSlots);

    return relevantSlots
}


module.exports = {
    Model,
    createShift,
    insertMany,
    upsert,
    update,
    remove
};




