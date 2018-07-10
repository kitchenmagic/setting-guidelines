// const shifts = require('./components/shifts/shifts');
const deputyRosterModule = require('./syncDeputy/syncDeputyRoster');
const slotsModule = require('./components/slots/slots');
let slots;

(async function init(){
    slots = await slotsModule.getSlots();
    deputyRoster.sync();

}());
























/*
    Tasks
        1) Get roster data from deputy
            - Nightly refresh of all data
            - Webhooks for roster CRUDs
        2) Update database with cleaned capacity data
        3) Get appointment data 


    1) Get Shifts
        Push shifts 

    2) Get Booked Appointments
    3) Compute Appointment Availability
    4) Write Appointment Availability to Database




    API REQUESTS
        GETs
            appointment availability
            booked appointments
            salesperson availability

        POSTs
            booked appointments




*/