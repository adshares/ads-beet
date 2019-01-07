import CryptoJS from 'crypto-js';
import * as KeyBox from './keybox';
import config from '../config/config';

const SEED_PHRASE = 'p';
const SEED = 's';
const KEY_COUNT = 'c';
const KEYS = 'k';
const ACCOUNTS = 'a';
const ACCOUNT_ADDRESS = 'a';
const ACCOUNT_NAME = 'n';
// const SETTINGS = 'o';

function checkPassword(vault, password) {
  try {
    CryptoJS.AES.decrypt(vault.secret, password)
      .toString(CryptoJS.enc.Utf8);
    return true;
  } catch (err) {
    // Error means that data cannot be decrypted with given password.
    return false;
  }
}

function encrypt(vault, password) {
  const keys = vault.keys
    .filter(key => key.type && key.type !== 'auto')
    // eslint-disable-next-line no-unused-vars
    .map(({ publicKey, ...keysToKeep }) => keysToKeep);
  const crypt = CryptoJS.AES.encrypt(JSON.stringify({
    [SEED_PHRASE]: vault.seedPhrase,
    [SEED]: vault.seed,
    [KEY_COUNT]: vault.keyCount,
    [KEYS]: keys,
    [ACCOUNTS]: vault.accounts.map(account => (
      {
        [ACCOUNT_ADDRESS]: account.address,
        [ACCOUNT_NAME]: account.name,
      }
    )),
  }), password)
    .toString();
  return crypt;
}

function decrypt(encryptedVault, password) {
  const vault = JSON.parse(
    CryptoJS.AES.decrypt(encryptedVault.secret, password)
      .toString(CryptoJS.enc.Utf8)
  );
  const decryptedVault = {
    seedPhrase: vault[SEED_PHRASE],
    seed: vault[SEED],
    keyCount: vault[KEY_COUNT],
    keys: vault[KEYS] || [],
    accounts: vault[ACCOUNTS].map(account => (
      {
        address: account[ACCOUNT_ADDRESS],
        name: account[ACCOUNT_NAME],
      }
    )),
  };
  const keys = [
    ...decryptedVault.keys.map(key => ({
      ...key,
      publicKey: KeyBox.getPublicKeyFromSecret(key.secretKey),
    })),
    ...KeyBox.initKeys(
      decryptedVault.seed,
      decryptedVault.keyCount || config.initKeysQuantity
    )
  ];
  const accounts = decryptedVault.accounts.map(account => ({
    ...account,
    balance: null,
    messageId: null,
    hash: null,
  }));

  return {
    ...decryptedVault,
    keys,
    accounts,
    selectedAccount: accounts.length > 0 ? accounts[0].address : null,
  };
}

function load(callback) {
  const key = config.vaultStorageKey;
  chrome.storage.sync.get(key, (result) => {
    const vault = {
      secret: result[key] || '',
      sealed: true,
      empty: !result[key] || result[key].length === 0,
    };
    callback(vault);
  });
}

function save(vault, password, callback) {
  const secret = encrypt(vault, password);
  chrome.storage.sync.set({ [config.vaultStorageKey]: secret || '' }, callback);
  return secret;
}

function erase(callback) {
  chrome.storage.sync.remove(config.vaultStorageKey, callback);
}

export default {
  checkPassword,
  encrypt,
  decrypt,
  load,
  save,
  erase,
};
