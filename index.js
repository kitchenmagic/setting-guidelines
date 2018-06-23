const config = require('config');
const log = require('debug')('log');
// const express = require('express');
// const app = express();

//Components
require('./components/shifts/shifts');
require('./syncDB/syncDeputyRoster');




















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