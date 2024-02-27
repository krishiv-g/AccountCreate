const fs = require("fs");
const dsteem = require("dsteem");

// Specify your custom Steem node URL here
const steemClient = new dsteem.Client('https://api.steemit.com');

// Checking if the account already exists
async function checkAccountName(client, username) {
  const ac = await client.database.call('lookup_account_names', [[username]]);
  return (ac[0] === null) ? true : false;
}

// Returns an account's Resource Credits data
async function getRC(client, username) {
  return client.call('rc_api', 'find_rc_accounts', { accounts: [username] });
}

// Generates all Private Keys from username and password
function getPrivateKeys(username, password, roles = ['owner', 'active', 'posting', 'memo']) {
  const privKeys = {};
  roles.forEach((role) => {
    privKeys[role] = dsteem.PrivateKey.fromLogin(username, password, role).toString();
    privKeys[`${role}Pubkey`] = dsteem.PrivateKey.from(privKeys[role]).createPublic().toString();
  });
  return privKeys;
};

// Creates a suggested password
function suggestPassword() {
  const array = new Uint32Array(10);
  window.crypto.getRandomValues(array);
  return 'P' + dsteem.PrivateKey.fromSeed(array).toString();
}

$(document).ready(async function () {
  // Checks and shows an account's RC
  $('#username').keyup(async function () {
    const parent = $(this).parent('.form-group');
    const steemRC = await getRC(steemClient, $(this).val());

    const notifyDiv = parent.find('.text-muted');
    notifyDiv.empty();

    let message = '';

    if (steemRC.rc_accounts.length > 0) {
      message = 'STEEM RC: ' + Number(steemRC.rc_accounts[0].rc_manabar.current_mana).toLocaleString();
    }

    notifyDiv.text(message);
  });

  // Check if the name is available
  $('#new-account').keyup(async function () {
    const notifyDiv = $(this).parent('.form-group').find('.message');
    notifyDiv.text('Enter the username you want to create.');

    if ($(this).val().length >= 3) {
      const steemAvailable = await checkAccountName(steemClient, $(this).val());

      let message = steemAvailable ? '<span class="text-success">Available on STEEM.</span>' : '<span class="text-danger">Not available on STEEM.</span>';
      notifyDiv.html(message);
    }
  });

  // Auto fills password field with a suggested password
  $('#password').val(suggestPassword());

  // Further functionality for claiming and creating accounts on Steem can be added here,
  // similar to the removed Hive functionalities, using steemClient for blockchain interactions.
});
