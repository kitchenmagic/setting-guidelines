const mongoose = require('mongoose');
const Event = require('../event/event');

// Define the Slot schema
const appointmentSlotSchema = new mongoose.Schema({
    appointments: [mongoose.Schema.Types.ObjectId],
    shifts: [mongoose.Schema.Types.ObjectId]
})

class AppointmentSlotClass {

    get availability(){
        return (this.shifts - this.appointments.length) 
    };

}


appointmentSlotSchema.pre('save', async function(next){
    
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

// Add the appointment slot class to the schema 
appointmentSlotSchema.loadClass(AppointmentSlotClass);

// Create the Appointment Slot model
const AppointmentSlot = Event.discriminator('AppointmentSlot', appointmentSlotSchema, 'appointmentSlot');


module.exports = AppointmentSlot;