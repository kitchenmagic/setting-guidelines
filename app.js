'use strict'
const config = require('config');
const mongoose = require('mongoose');
const slotModel = require('./components/slot/slotModel');
const Slot = slotModel.Slot;
const eventModel = require('./components/event/eventModel');
const Event = eventModel.Event;
const moment = require('moment');

mongoose.set('debug', true);

mongoose.connect(config.get('mongoDB.path'))
    .then(()=>{
        let db = mongoose.connection;
        console.log('Sucessfully connected to MongoDB...', db);
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        run();
    })
    .catch((err)=>{
        console.log(err);
    });


async function run(cb){
    try{


        let event = new Slot({
            startDateTime: new Date(),
            endDateTime: moment().add(2, 'hours').toDate(),
            isRecurring: true,
            rrule: "FREQ=WEEKLY;DTSTART=20180720T140000Z;COUNT=30;WKST=MO;BYDAY=MO,TU,WE,TH,FR"
        })

        let results = await event.save();
        console.log(results);


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

        // await AppointmentSlot();

    }catch(err){
        throw new Error(err);
    }
}  
















