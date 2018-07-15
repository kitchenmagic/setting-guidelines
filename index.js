const mongoose = require('mongoose');
const config = require('config');
const log = require('debug')('index');
const syncShifts = require('./sync/syncShifts')
let db;

// const shifts = require('./components/shifts/shifts');
const slot = require('./components/slots/slots');

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{
        log('Sucessfully connected to MongoDB...');
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));

        syncShifts()
            .then( ( result ) => { log('syncShift result: ', result); })
            .catch( (err)=> { console.error.bind(console, 'Error syncing shifts:'); log(err); } );
    })
    .catch((err)=>{
        log(err);
    });





















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