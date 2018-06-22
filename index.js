const config = require('config');
const log = require('debug')('log');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');

const axios = require('axios');


// const express = require('express');
// const app = express();

firebase.initializeApp(config.get('firebase'));



getScheduledShifts().then((shifts)=>{
    log("NEW",shifts);

    writeShiftData(shifts);
});











function getAvailabilityData(){

    const uri = 'https://setting-guidelines.firebaseio.com/appointment-availability.json';

    const headers = {
        "content-type": "application/json",
        "accept": "application/json"
    }

    const options = {
        uri: uri,
        method: 'GET',
        headers: headers
    }

    function reqCallback( error, res, body ){
        if (!error && res.statusCode == 200) {
            log('Body', JSON.parse(body));
        } else {
            log('Error: ', error);
        }
    }

    request(JSON.stringify(options), reqCallback);

}











/*
    Tasks
        1) Get roster data from deputy
            - Nightly refresh of all data
            - Webhooks for roster CRUDs
        2) Update database with cleaned capacity data
        3) Get appointment data 


    1) Get Sales Capacity

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