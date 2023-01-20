const axios = require('axios');

/**
 * Gets the user details of a guest user via token.
 *
 * @param {string} jwtToken
 * @returns {object} User Object from the /people/me endpoint
 */
async function loginWebexGuest(jwtToken) {
  const guestLoginOptions = {
    headers: {
      authorization: `Bearer ${jwtToken}`,
    },
    method: 'POST',
    url: 'https://webexapis.com/v1/jwt/login',
  };

  try {
    const response = await axios(guestLoginOptions);
    const guestAccessToken = response.data.token;
    const getMeOptions = {
      headers: {
        authorization: `Bearer ${guestAccessToken}`,
      },
      method: 'GET',
      url: 'https://webexapis.com/v1/people/me',
    };
    const guestUser = await axios(getMeOptions);

    return guestUser.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {loginWebexGuest};