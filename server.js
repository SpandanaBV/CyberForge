const express = require("express");
const webPush = require("web-push");
const bodyParser = require("body-parser");

const app = express();
const subscriptions = [];  // Store subscriptions in-memory for this example

// VAPID Keys (You can generate these using web-push package)
const publicVapidKey = "BM_4yWWzf2a44YydnUV5McRQnp2y7WG9f5nmDSTGSlRkeyk_fsRg6RSfDZZbBgPpForsfBL7WMDknCVn3evV6xg";
const privateVapidKey = "Zn61vxXblohEROg-B0fpsfvkFPl4zF9JOPZtMhkM0hY";

webPush.setVapidDetails("mailto:example@example.com", publicVapidKey, privateVapidKey);

// Middleware
app.use(bodyParser.json());

// Route to handle subscription
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);  // Store the subscription (e.g., in a database)
  res.status(201).json({ message: "Subscribed!" });
});

// Route to send alert notifications
app.post("/send-alert", (req, res) => {
  const alertMessage = req.body.message;
  const payload = JSON.stringify({
    title: "Disaster Alert",
    body: alertMessage,
  });

  // Send notifications to all subscribers
  Promise.all(subscriptions.map(subscription => {
    return webPush.sendNotification(subscription, payload);
  }))
  .then(() => {
    res.status(200).json({ message: "Alerts sent successfully!" });
  })
  .catch(err => {
    console.error("Error sending notifications:", err);
    res.status(500).json({ error: "Failed to send alerts" });
  });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log("Server running on port ${3000}");
});