const config = require('config');
const mongoose = require('mongoose');
const moment = require('moment');
const slots = config.get('appointment.slots');
const utilities = require('../utilities.js') 
const apptDuration = config.get('appointment.duration')

// const log = require('debug')('log');

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{console.log('Connected to MongoDB...');})
    .catch((err)=>{console.log(err);});
mongoose.set('debug',true);

//Get reference to database 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const shiftSchema = new mongoose.Schema({
    deputyRosterId: String,
    start: Object, //Moment
    end: Object, //Moment
    duration: Object,//Moment duration
    regionName: String,
    regionNumber: Number,
    employeeId: Number,
    appointmentSlotId: [Number]
});

//Set regionNumber
shiftSchema.pre('findOneAndUpdate', function(next){

    if(this.regionName)
        this.regionNumber = parseRegionNumber(this.regionName);
    
    this.duration = duration( this.start, this.end ).asMinutes(),
    getSlotCoverage(this.toObject(), slots); 

    console.log('Pre Update');
    next();
})

//Create the shift model
const Model = mongoose.model('Shift', shiftSchema);




//Creates a shift
async function createShift(start, end, regionName, regionNumber, employeeId, appointmentSlotId){
    const shift = new Shift({
        start,
        end,
        regionName,
        regionNumber,
        employeeId,
        appointmentSlotId
    })
    return await shift.save();
}

//Inserts many documents (shifts) into the database in one call.
//Atomic function
function insertMany(shiftsArray, callback){
    return Model.insertMany(shiftsArray, callback );
}


// Updates a shift based on it's deputy 
function upsertByDeputyRosterId(shifts){

    if(Array.isArray(shifts))
        return shifts.map(shift => upsertShift(shift) );

    return upsertShift(shifts);

    function upsertShift(shift){

        if(!shift.deputyRosterId)
            return;

        try{
            let upsertData = shift.toObject();
            delete upsertData._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues
            
            let query = { 'deputyRosterId': shift.deputyRosterId };
            const options = { upsert: true, new:true }; //, overwrite:true
            return Model.findOneAndUpdate( query, {$set: upsertData, runValidators:true } , options, (err,doc)=>{
                if(err)
                    throw new Error(err.message);
                return doc;
            });

        }catch(err){
            throw new Error(err.message);
        }
    }

}

function remove(id){
    // const result = await Model.deleteOne({_id:id});
}

//Utilities

//Gets the region number from a string
function parseRegionNumber(regionName){

    if(regionName.search(/Region/i) >= 0)
        return parseInt(regionName.substr(-(regionName.length - 6)).trim());

    return null;
}


//Creates a Shift object from a Deputy Roster Document
function parseShiftsFromDeputyRoster(rosterData){
    "use strict";

    if(Array.isArray(rosterData))
        return rosterData.map( rosterDoc => rosterDocToShift(rosterDoc) );

    return rosterDocToShift(rosterData);

    function rosterDocToShift(rosterDoc){

        return new Model({
            deputyRosterId: rosterDoc.Id,
            start: moment(rosterDoc.StartTimeLocalized),
            end: moment(rosterDoc.EndTimeLocalized),
            regionName: rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName,
            employeeId: rosterDoc._DPMetaData.OperationalUnitInfo.Id,
        });
    }

}


//Determine which time slot a shift falls into
function computeAppointmentSlotId(startDateTime, endDateTime){
    let timeSlots = Object.assign(config.get('appointment.slots'));
    const start = moment(startDateTime);
    const end = moment(endDateTime);
    const dow = start.day();

    //Get the time slots that apply to the day of week
    timeSlots = timeSlots.filter( slot => slot.dayOfWeek.indexOf(dow) > -1 );

    timeSlots.forEach( slot => {

        const slotStart = moment({
            year: start.year(), 
            month: start.month(), 
            date: start.date(), 
            hour:slot.start.hour, 
            minute: slot.start.minute
        });

        const slotEnd = moment({
            year: end.year(), 
            month: end.month(), 
            date: end.date(), 
            hour: slot.end.hour, 
            minute: slot.end.minute
        });

        //check if there is any overlap
        //Is the shift start between the slot start and end
        const startTimesDiff = start.diff(slotStart);
        console.log( start, ' and ', slotStart, ' are ', (startTimesDiff/60000), ' apart.');
    })
    
    // console.log(date.day(),timeSlots.length);
    return [1];
}



//Returns shift with slot appended 
function addSlotsToShifts(shift, slots){
    const shiftStart = moment(shift.start);
    const shiftEnd = moment(shit.end);

    const dayOfWeek = start.day();
    
    //Filters out any slots that don't apply to day of week
    slots = slots
        .filter( slot => slot.dayOfWeek.indexOf(dayOfWeek) > -1 )
        .filter( (slot)=>{

        const slotStart = moment( shiftStart.date() ).add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
        const slotEnd = moment( shiftEnd.date() ).add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');
        const overlap = utilities.getRangeOverlap(shiftStart,shiftEnd,slotStart,slotEnd);
        console.log('Overlap: ', overlap);

        return overlap > 0;
    })

    console.log('Slots ', slots)

}


module.exports = {
    Model,
    createShift,
    insertMany,
    remove,
    upsertByDeputyRosterId,
    parseShiftsFromDeputyRoster
};




