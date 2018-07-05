const config = require('config');
const mongoose = require('mongoose');
const moment = require('moment');
const slots = config.get('appointment.slots');
const utilities = require('../utilities.js') 
const apptDuration = config.get('appointment.duration');
const debug = require('debug')('shifts');

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{debug('Connected to MongoDB...');})
    .catch((err)=>{debug(err);});

    // mongoose.set('debug',true);

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


shiftSchema.on('init', function(){
    debug('Schema Init');
    
    // if(this.regionName)
    //     this.regionNumber = utilities.parseRegionNumber(this.regionName);
    
    // addSlotsToShifts(this, slots);
})

//Create the shift model
const Model = mongoose.model('Shift', shiftSchema);



//Set regionNumber
shiftSchema.pre('findOneAndUpdate', function(next){
    debug('Pre Update');
    // this.duration = duration( this.start, this.end ).asMinutes(),
    debug(this);
    next();
})






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








//Returns shift with slot appended 
function addSlotsToShifts(shift, slots){
    const shiftStart = moment(shift.start);
    const shiftEnd = moment(shift.end);

    const dayOfWeek = shiftStart.day();
    
    //Filters out any slots that don't apply to day of week
    slots = slots
        .filter( slot => slot.dayOfWeek.indexOf(dayOfWeek) > -1 )
        .filter( (slot)=>{

        const slotStart = moment( shiftStart.date() ).add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
        const slotEnd = moment( shiftEnd.date() ).add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');
        const overlap = utilities.getRangeOverlap(shiftStart,shiftEnd,slotStart,slotEnd);
        debug('Overlap: ', overlap);

        return overlap > 0;
    })

    debug('Slots ', slots)

}


module.exports = {
    Model,
    createShift,
    insertMany,
    remove,
    upsertByDeputyRosterId
};




