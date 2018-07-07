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