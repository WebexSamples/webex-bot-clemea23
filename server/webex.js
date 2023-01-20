const webex = require('webex/env');

if (!process.env.WEBEX_ACCESS_TOKEN) {
  console.error('Environment variable WEBEX_TOKEN must be defined');
}

/**
 * Prepares a space by creating it, adding members, and sending a message.
 *
 * @param {Object} param
 * @param {string} param.title Title of the space to create.
 * @param {string} param.email Email address of additional webex user to add to the space.
 * @param {string} param.message Message to send to the space after creating.
 * @param {string} param.guest ID of the guest user to add to the space.
 * @returns
 */
async function prepareSpace({title, email, message, guest}) {
  // Create a Room
  const room = await webex.rooms.create({title});
  // Add the Webex User
  if (email) {
    await webex.memberships.create({
      roomId: room.id,
      personEmail: email,
    });
  }
  // Add the "guest"
  await webex.memberships.create({
    roomId: room.id,
    personId: guest,
  });
  // Send the details as a room message
  await webex.messages.create({
    roomId: room.id,
    text: message,
  });

  return room;
}

module.exports = {prepareSpace};