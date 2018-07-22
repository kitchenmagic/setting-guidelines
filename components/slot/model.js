/*
 * Appointment Slots
 * The pre-determined dates and time for which Appointments are scheduled
 * Both shifts and appointments are related to an appointment slot. Shift count
 * minus appointment count equals apointment availability.
 */

const mongoose = require('mongoose');
const Event = require('../event/model');
const moment = require('moment');
const config = require('config');
const RRule = require('rrule');

// Define the Slot schema
const slotSchema = new mongoose.Schema({
    region: Number,
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

/*
 * Middleware
 */
slotSchema.pre('save', async function(next){
    
    // Handle Recurring events
    if(this.rrule) {
        if(this.isNew){
            let results = await createRecurringEvents(this);
        }else{
            let result = await updateRecurringEvents(this);
        }
    }

    next();
})

// Create the Appointment Slot model
const Slot = Event.discriminator('Slot', slotSchema, 'slot');
exports.Slot = Slot;



exports.forwardFillRecurringSlots = async function(){

    try{
        const scheduleWindowEnd = moment().startOf('day').add( config.get('scheduleWindowSize') ,'days');
        // Get all recurring slots
        const recurringSlots = await Slot.find({isRecurring: true}, (err) => { if(err) throw new Error(err); });

        // Determine which recurring slots have instances within
        // the current scheduling window (scheduling window is typically 
        // the next 30 days)
        const newSlots = recurringSlots.filter( (recurringSlot) => {
            
            if(!recurringSlot.rrule) return false;

            // Utility to find if rule has instances within date range
            const rrule = RRule.fromString(recurringSlot.rrule);

            const dates = rrule.between(new Date(), scheduleWindowEnd.toDate());

            return (dates.length > 0);
        })

        return newSlots;

        // Create missing recurring slots instances to fill scheduling window 
    } catch(err){
        throw new Error(err);
    }
}