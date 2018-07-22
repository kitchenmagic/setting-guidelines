/*
 * Appointment Slots
 * The pre-determined dates and time for which Appointments are scheduled
 * Both shifts and appointments are related to an appointment slot. Shift count
 * minus appointment count equals apointment availability.
 */
const mongoose = require('mongoose');
const eventModel = require('../event/eventModel');
const Event = eventModel.Event;


// Define the Slot schema
const slotSchema = new mongoose.Schema({
    appointments: [mongoose.Schema.Types.ObjectId],
    shifts: [mongoose.Schema.Types.ObjectId]
})

class SlotClass {

    get availability(){
        return (this.shifts - this.appointments.length) 
    };

}
// Add the appointment slot class to the schema 
slotSchema.loadClass(SlotClass);

// Create the Appointment Slot model
exports.Slot = Event.discriminator('Slot', slotSchema, 'slot');









//returns array of slots which overlap the given startDateTime and endDateTime
// function getRelevantSlots(startDateTime, endDateTime, slots){
    
//     // Convert parameters to moments
//     startDateTime = moment(startDateTime);
//     endDateTime = moment(endDateTime);
    
//     // Check if parameters are valid moment objects 
//     if(!(startDateTime.isValid() & endDateTime.isValid() ) )
//         throw new Error("Invalid Argument: startDateTime or endDateTime are not valid date objects");

//     if(!slots)
//         throw new Error("Invalid Argument: Missing Slots")


//     //Try to get the relevant slots for the provided dateTime range
//     try {


//         return slots
            
//             //Convert the mongoose model to a standard object
//             .map( slot => slot = slot.toObject() )
            
//             // Filters out slots that don't apply to start day of week 
//             .filter( (slot) => slot.daysOfWeek.indexOf( startDateTime.day() ) > -1 ) 

//             // Fitler out slots where the shift doesn't meet the minumum overlap requirements
//             .filter( (slot) => {

//                 // Slots have no context, they only apply to days of the week and times
//                 // Use the date of the input for the date of the slot
//                 const slotStart = moment(startDateTime).startOf('day').add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
//                 const slotEnd = moment(endDateTime).startOf('day').add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');

//                 // Convert overlap from milliseconds to minutes 
//                 const minutesOverlap = getRangeOverlap(startDateTime, endDateTime, slotStart, slotEnd) / 60000; 

//                 slot.overlap = minutesOverlap;
//                 slot.percentMatch = (slot.overlap/slot.duration) * 100;

//                 return slot.percentMatch > 0; // Replace "0" with minimum overlap requirements. 
//                 // Is minumum overlap based on fixed number, percentage or both?
//             });

//     } catch( err ) {
//         throw new Error( err ); 
//     }
// }