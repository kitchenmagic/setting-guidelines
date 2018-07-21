# Setting Guidelines
#### Kitchen Magic's In-Home Estimate Availability App

The purpose of this app is to compute Kitchen Magic's appointment availability and make it accessable via a user interface and programming interface (API). Appointment availability is computed by subtracting the number of appointments currently booked from the sales teams availability (sales capacity) in each region for each date and appointment time slot.

## Requirements
1. Contact center agent will enter in zipcode to determine region or list will automatically filter only show availability in that region


## Setup

### Setup MongoDB Locally
1. Install MongoDB
2. Open **Advanced System Settings**
3. Open **System Variables**
4. Under the **System Variables** section select **Path**
5. Click **Edit**
6. Click **New**
7. Paste the path to *mongod* `C:\Program Files\MongoDB\Server\[version number]\bin`
8. Click **Ok**, **Ok**, **Ok**

### Node
1. In Terminal/Command Prompt run: `export DEBUG=*`


### ToDo
Set up task runner


Appointment slots will be persisted.

There will be a scheduled task (probably nightly) to generate Appointment Slots for the set number of `daysOut`. `daysOut` is the number of days from today that availability will be calculated for. If `daysOut` is set to 30, then a appointment slots will be generated for the next 30 days. Deputy will be queried for the next 30 days worth of shifts and the appointments from sales app will remain the same because that number is set by Chad. 

If a recurring appointment slot is modified, all future appointment slots, even those that were not modified will need to be regenerated. This is because appointments and shifts may now have better appointment slot matches.

Because of the high query frequency, calculating recurring events (Appointment Slots) is less efficient than persisting them. Persisting appointment slots will also make reporting easier if it is decided to add reporting functionality in the future.


When a user updates a recurring event they will be asked if they want to update just that instance or all future occurences of that event. If they choose to update all future occurences of that event, then it's parent and it's rrule will be updated. If not, only that event will be updated.







Event Form Fields
- Starts DateTime: Date
- Ends DateTime: Date
- Frequency: String [Every Day, Every Week, Every Month, Every Year]
- Duration: [Forever, For n {frequency}, Until Date ]


