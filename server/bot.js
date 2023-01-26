const cardJSON = require('./info-card.json');
var BotFramework = require("webex-node-bot-framework");

function setupBotFramework(config) {
  var framework = new BotFramework(config);
  framework.start();
  console.log("Starting framework, please wait...");

  framework.on("initialized", () => {
    console.log("framework is all fired up! [Press CTRL-C to quit]");
  });

  // A spawn event is generated when the framework finds a space with your bot in it
  // If actorId is set, it means that user has just added your bot to a new space
  // If not, the framework has discovered your bot in an existing space
  framework.on("spawn", (bot, id, actorId) => {
    if (!actorId) {
      // don't say anything here or your bot's spaces will get
      // spammed every time your server is restarted
      console.log(
        `While starting up, the framework found our bot in a space called: ${bot.room.title}`
      );
    } else {
      // When actorId is present it means someone added your bot got added to a new space
      let msg =
        "Welcome to Cisco Live Amsterdam!";
      // Say hello, and tell users what you do!
      if (!bot.isDirect) {
        let botName = bot.person.displayName;
        msg += `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@mention* ${botName}.`;
      }
      msg += '\n\nAssembling your info card...';
      bot.say("markdown", msg).then(() => {
        bot.sendCard(
          cardJSON,
          "This is customizable fallback text for clients that do not support buttons & cards"
        );
      });
    }
  });

  // Implementing a framework.on('log') handler allows you to capture
  // events emitted from the framework.  Its a handy way to better understand
  // what the framework is doing when first getting started, and a great
  // way to troubleshoot issues.
  // You may wish to disable this for production apps
  framework.on("log", (msg) => {
    console.log(msg);
  });

  /* On mention with card example
  ex User enters @botname 'card me' phrase, the bot will produce a personalized card - https://developer.webex.com/docs/api/guides/cards
  */
  framework.hears(
    "card me",
    (bot, trigger) => {
      console.log("someone asked for a card");
      bot.say('Assembling your card...')
        .then(() => {
          bot.sendCard(
            cardJSON,
            "This is customizable fallback text for clients that do not support buttons & cards"
          );
        });
    },
    "**card me**: (a cool card!)",
    0
  );

  /* On mention with command
  ex User enters @botname help, the bot will write back in markdown
   *
   * The framework.showHelp method will use the help phrases supplied with the previous
   * framework.hears() commands
  */
  framework.hears(
    /help|what can i (do|say)|what (can|do) you do/i,
    (bot, trigger) => {
      const footer = 'Powered by Webex Node Bot Framework - https://github.com/WebexCommunity/webex-node-bot-framework';
      console.log(`someone needs help! They asked ${trigger.text}`);
      bot
        .say(`Hello ${trigger.person.displayName}.`)
        .then(() => bot.say("markdown", framework.showHelp('', footer)))
        .catch((e) => console.error(`Problem in help hander: ${e.message}`));
    },
    "**help**: (what you are reading now)",
    0
  );

  /* On mention with unexpected bot command
     Its a good practice is to gracefully handle unexpected input
     Setting the priority to a higher number here ensures that other
     handlers with lower priority will be called instead if there is another match
  */
  framework.hears(
    /.*/,
    (bot, trigger) => {
      // This will fire for any input so only respond if we haven't already
      console.log(`catch-all handler fired for user input: ${trigger.text}`);
      bot
        .say(`Sorry, I don't know how to respond to "${trigger.text}"`)
        .then(() => bot.say("markdown", framework.showHelp()))
        //    .then(() => sendHelp(bot))
        .catch((e) =>
          console.error(`Problem in the unexepected command hander: ${e.message}`)
        );
    },
    99999
  );

  return framework;
}

module.exports = {setupBotFramework};
