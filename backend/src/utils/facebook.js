const crypto = require('crypto');
const { FACEBOOK_CLIENT_SECRET } = require('../config');

function generateAppSecretProof(accessToken, appSecret = FACEBOOK_CLIENT_SECRET) {
  if (!accessToken || !appSecret) return null;
  return crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex');
}

module.exports = { generateAppSecretProof };
