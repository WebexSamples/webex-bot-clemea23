require("dotenv").config();

const config = {
  webhookUrl: process.env.WEBHOOKURL,
  token: process.env.BOTTOKEN,
  port: process.env.PORT,
  // Title for the space that will be created with guest user
  spaceTitle: 'Cisco Live Webex 4 Devs Info',
  // Admin user who will also be added to the spaces (optional)
  adminEmail: ''
};

var webhook = require("webex-node-bot-framework/webhook");
const {createUser} = require('./server/jwt');
const {loginWebexGuest} = require('./server/login');
const {prepareSpace} = require('./server/webex');
const {setupBotFramework} = require('./server/bot');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(express.static("images"));
app.use(express.static("client"));

// init framework
var framework = setupBotFramework(config);


//Server config & housekeeping
// Health Check
app.get("/status", (req, res) => {
  res.send(`I'm alive.`);
});

app.post("/framework", webhook(framework));

/**
 * This endpoint does the following things:
 * Creates a Guest User with the submitted data
 * Creates a Webex Space
 * Adds Guest User and "expert" to space
 * Sends details as a space message
 */
app.post('/guest', async (req, res) => {
  // The response should allow the user to open an sdk instance to listen to meetings on the create space.
  try {
    const displayName = req.body.name || 'CLEMEA Attendee';
    const spaceTitle = config.spaceTitle;
    const guestJWT = await createUser({displayName});
    const guestUser = await loginWebexGuest(guestJWT);
    const spaceConfig = {
      title: spaceTitle,
      email: config.adminEmail,
      guest: guestUser.id
    };
    const space = await prepareSpace(spaceConfig);

    const response = {
      guestJWT,
      guestUser,
      space,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

var server = app.listen(config.port, () => {
  console.log('app.listen on port', config.port);
  framework.debug("framework listening on port %s", config.port);
});

// gracefully shutdown (ctrl-c)
process.on("SIGINT", () => {
  framework.debug("stopping...");
  server.close();
  framework.stop().then(() => {
    process.exit();
  });
});
