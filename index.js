'use strict'
const config = require('config');
const mongoose = require('mongoose');
const AppointmentSlot = require('./components/appointmentSlot/appointmentSlot');
const log = require('debug')('app');
const moment = require('moment');
// const syncShifts = require('./sync/syncShifts');
// const syncAppointments = require('./sync/syncAppointments');

mongoose.set('debug', true);

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{
        let db = mongoose.connection;
        console.log('Sucessfully connected to MongoDB...', db);
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        run();
    })
    .catch((err)=>{
        log(err);
    });


async function run(cb){
    try{

        // let appointmentSlot = new AppointmentSlot({
        //     startDateTime: new Date(),
        //     isRecurring: true,
        //     rrule: "FREQ=WEEKLY;DTSTART=20180721T223000Z;UNTIL=20180831T200000Z;WKST=MO;BYDAY=MO,TU,WE,TH,FR"
        // });

        /*
         * 10AM:    FREQ=WEEKLY;DTSTART=20180720T140000Z;WKST=MO;BYDAY=MO,TU,WE,TH,FR
         * 2PM:     FREQ=WEEKLY;DTSTART=20180721T180000Z;WKST=MO;BYDAY=MO,TU,WE,TH,FR
         * 6:30PM:  FREQ=WEEKLY;DTSTART=20180721T223000Z;WKST=MO;BYDAY=MO,TU,WE,TH,FR
         * UNTIL=20180831T200000Z;
         *         
        */
        
        // await appointmentSlot.save( (error) => {
        //     if(error) throw new Error(error.message);
        // });

        await AppointmentSlot();

    }catch(err){
        throw new Error(err);
    }
}  



















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