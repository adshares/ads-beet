import ADS from './ads';
import VaultCrypt from './vaultcrypt';
import KeysImporterPage from '../containers/Settings/KeysImporterPage';
import config from '../config/config';
import AccountEditorPage from '../containers/Settings/AccountEditorPage';
import { getPublicKeyFromSecret } from './keybox';

const name = ({ pageName, value, vault }) => {
  if (pageName === KeysImporterPage.PAGE_NAME && vault.keys.find(key => key.name === value)) {
    return `Key named ${value} already exists`;
  }
  if (pageName === AccountEditorPage.PAGE_NAME &&
    vault.accounts.find(account => account.name === value)) {
    return `Account named ${value} already exists`;
  }
  if (vault.length > config.accountAndKeyNameMaxLength) {
    return `Given name ${value} is too long.`;
  }
  return null;
};
const publicKey = ({ value, inputs, vault, pageName }) => {
  if (!ADS.validateKey(value)) {
    return 'Please provide an valid public key';
  }
  const keys = vault.keys;

  console.log('pageName', pageName)
  console.log('warunek ', pageName === AccountEditorPage.PAGE_NAME && !keys.find(({ secretKey }) => getPublicKeyFromSecret(secretKey) === value))
  if (pageName === KeysImporterPage.PAGE_NAME) {
    if (!inputs.secretKey || !inputs.secretKey.value) {
      throw new Error('Provide secretKey to full fil publicKey validation');
    }
    if (getPublicKeyFromSecret(inputs.secretKey.value) !== value) {
      return 'Public and secret key does not match';
    }
    if (keys.find(key => key.publicKey === value)) {
      return 'Given public key already exists in data base';
    }
    if (keys.filter(key => key.type === 'imported').length >=
      config.importedKeysLimit) {
      return `You've already imported ${config.importedKeysLimit}. To import more keys increase
       your imported keys limit`;
    }
  } else if (pageName === AccountEditorPage.PAGE_NAME && !keys.find(({ secretKey }) => getPublicKeyFromSecret(secretKey) === value)) {
    console.log('keys.find(({ secretKey }) => getPublicKeyFromSecret(secretKey) === value)',keys.find(({ secretKey }) => getPublicKeyFromSecret(secretKey) === value) )
    console.log('weszlo', )
    return 'Cannot find a key in storage. Please import secret key first.';
  }
  return null;
};

const secretKey = ({ value, vault }) => {
  if (!ADS.validateKey(value)) {
    return 'Please provide an valid secret key';
  }
  if (vault.keys.find(key => key.secretKey === value)) {
    return 'Given secret key already exists in data base';
  }
  return null;
};

const password = ({ value, vault }) => {
  if (!VaultCrypt.checkPassword(vault, value)) {
    return 'Invalid password';
  }
  return null;
};

const address = ({ value, vault }) => {
  if (!value || !ADS.validateAddress(value)) {
    return 'Please provide an valid account address';
  }
  if (vault.accounts.find(a => a.address.toUpperCase() === value.toUpperCase())) {
    return `Account ${value} already exists`;
  }
  return null;
};

const amount = ({ value }) => {
  if (!/^[0-9,.]*$/.test(value)) {
    return 'Invalid amount';
  }
  return null;
};

const message = ({ value }) => {
  const maxLength = 64;
  if (!/^[0-9a-fA-F]*$/.test(value)) {
    return 'Message can contain only hexadecimal characters';
  }
  if (value.length > maxLength) {
    return `Massage too long (max ${maxLength} characters)`;
  }
  return null;
};

export { name, publicKey, secretKey, password, address, amount, message };
