'use strict'
const config = require('config');
const mongoose = require('mongoose');
const syncShifts = require('./sync/syncShifts');
const syncAppointments = require('./sync/syncAppointments');

const log = require('debug')('app');

let db;

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{
        log('Sucessfully connected to MongoDB...');
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));

        run( ()=>db.close() );
    })
    .catch((err)=>{
        log(err);
    });


async function run(cb){
    try{
        const syncdShifts = await syncShifts();
        // const syncdAppointments = await syncAppointments();
        cb();
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