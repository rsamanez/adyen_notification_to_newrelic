const express = require("express");
const axios = require('axios');
const path = require("path");
const hbs = require("express-handlebars");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { hmacValidator } = require('@adyen/api-library');


// init app
const app = express();
// setup request logging
app.use(morgan("dev"));
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Serve client from build folder
app.use(express.static(path.join(__dirname, "/public")));

// enables environment variables by
// parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env",
});

app.engine(
  "handlebars",
  hbs({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts",
    helpers: require("./util/helpers"),
  })
);

app.set("view engine", "handlebars");

/* ################# WEBHOOK ###################### */

app.post("/api/webhook/notifications", async (req, res) => {

  // YOUR_HMAC_KEY from the Customer Area
  const hmacKey = process.env.ADYEN_HMAC_KEY;
  const validator = new hmacValidator()
  // Notification Request JSON
  const notificationRequest = req.body;
  const notificationRequestItems = notificationRequest.notificationItems

  const newRelicEvents = [];
  // Handling multiple notificationRequests
  notificationRequestItems.forEach(function(notificationRequestItem) {

    const notification = notificationRequestItem.NotificationRequestItem;

    // Handle the notification
    if( validator.validateHMAC(notification, hmacKey) ) {
      // Process the notification based on the eventCode
      const merchantReference = notification.merchantReference;
      const eventCode = notification.eventCode;
      if(eventCode=='AUTHORISATION'){
        const amount_currency = notification.amount.currency;
        const amount_value = notification.amount.value;
        const event_date = notification.eventDate;
        const merchant_code = notification.merchantAccountCode;
        const merchant_ref = notification.merchantReference;
        const payment_method = notification.paymentMethod;
        const psp = notification.pspReference;
        const reason = notification.reason;
        const success = notification.success;
        newRelicEvents.push(
          {
            "eventType": "AdyenNotifications",
            "notificationType": "AUTHORISATION",
            "amountCurrency": amount_currency,
            "amountValue" : amount_value,
            "eventDate": event_date,
            "merchantCode": merchant_code,
            "merchantReference": merchant_ref,
            "paymentMethod": payment_method,
            "pspReference": psp,
            "reason": reason,
            "success": success
          }
        );
      }
      
      // TODO process other Notifications types
      console.log(newRelicEvents);
      
      // Sending Data to Newrelic
      if(newRelicEvents.length>0){
        var data = JSON.stringify(newRelicEvents);
        var config = {
          method: 'post',
          url: `https://insights-collector.newrelic.com/v1/accounts/${process.env.NEWRELIC_ACCOUNT_ID}/events`,
          headers: { 
            'Content-Type': 'application/json', 
            'X-Insert-Key': process.env.NEWRELIC_INSERT_KEY
          },
          data : data
        };
        axios(config).then(function (response) {
          console.log(JSON.stringify(response.data));
        }).catch(function (error) {
          console.log(error);
        });
      }
    } else {
      // invalid hmac: do not send [accepted] response
      console.log("Invalid HMAC signature: " + notification);
      throw new Error("Invalid HMAC signature")
    }
});

  res.send('[accepted]')
});


/* ################# end WEBHOOK ###################### */

/* ################# UTILS ###################### */

function getPort() {
  return process.env.PORT || 8080;
}

/* ################# end UTILS ###################### */

// Start server
const PORT = process.env.PORT || 8080;
app.listen(getPort(), () => console.log(`Server started -> http://localhost:${getPort()}`));
