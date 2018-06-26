const config = require('config');
const mongoose = require('mongoose');
const moment = require('moment');
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
    start: Date,
    end: Date,
    regionName: String,
    regionNumber: Number,
    employeeId: Number,
    appointmentSlotId: [Number]
});

//Set regionNumber
shiftSchema.pre('save', function(next){
    this.regionNumber = parseRegionNumber(this.regionName);
    next();
})

//Create the shift model
const Model = mongoose.model('Shift', shiftSchema);




//CRUD FUNCTIONS
function insert(shift, callback){
    return Model.create(shift, callback);
}

//Inserts many documents (shifts) into the database in one call.
//Atomic function
function insertMany(shiftsArray, callback){
    return Model.insertMany(shiftsArray, callback );
}


// async function update(id){}

function upsertByDeputyRosterId(shifts){

    if(Array.isArray(shifts))
        return shifts.map(shift => upsertShift(shift) );

    return upsertShift(shifts);

    function upsertShift(shift){
        try{
            let query = { 'deputyRosterId': shift.deputyRosterId };
            const options = { upsert: true, new:true }; //, overwrite:true
            let upsertData = shift.toObject();
            delete upsertData._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues

            return Model.findOneAndUpdate( query, {$set: upsertData } , options, (err,doc)=>{
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
function parseDeputyRoster(rosterData){
    "use strict";

    if(Array.isArray(rosterData))
        return rosterData.map( rosterDoc => rosterDocToShift(rosterDoc) );

    return rosterDocToShift(rosterData);

    function rosterDocToShift(rosterDoc){
        return new Model({
            deputyRosterId: rosterDoc.Id,
            startDateTime: rosterDoc.StartTimeLocalized,
            endDateTime: rosterDoc.EndTimeLocalized,
            regionName: rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName,
            employeeId: rosterDoc._DPMetaData.OperationalUnitInfo.Id,
            regionNumber: parseRegionNumber(rosterDoc._DPMetaData.OperationalUnitInfo.OperationalUnitName),
            appointmentSlotId: computeAppointmentSlotId(rosterDoc.StartTimeLocalized, rosterDoc.EndTimeLocalized)
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


module.exports = {
    Model,
    insert,
    insertMany,
    remove,
    upsertByDeputyRosterId,
    parseDeputyRoster
};




