import * as actions from '../actions/vault';
import * as KeyBox from '../utils/keybox';
import VaultCrypt from '../utils/vaultcrypt';
import BgClient from '../../app/utils/background';
import ADS from '../../app/utils/ads';
import {
  InvalidPasswordError,
  AccountsLimitError,
  UnknownPublicKeyError,
  ItemNotFound,
} from '../actions/errors';
import config from '../config/config';
import { findAccountByAddressInVault, findIfPublicKeyExist } from '../utils/utils';
import {
  RETRIEVE_ACCOUNT_DATA_IN_INTERVALS_SUCCESS,
  RETRIEVE_NODES_DATA_IN_INTERVALS_SUCCESS
} from '../actions/actions';

const initialVault = {
  empty: true,
  sealed: true,
  secret: '',
  seedPhrase: '',
  seed: '',
  keys: [],
  keyCount: config.initKeysQuantity,
  accounts: [],
  selectedAccount: null,
  nodes: [],
};

export default function (vault = initialVault, action) {
  switch (action.type) {
    case actions.CREATE: {
      BgClient.startSession(window.btoa(action.password));
      const seed = KeyBox.seedPhraseToHex(action.seedPhrase);
      const vaultKeys = vault.keys ? vault.keys : [];
      const newVault = {
        ...initialVault,
        ...vault,
        empty: false,
        sealed: false,
        seedPhrase: action.seedPhrase,
        seed,
        keys: [...vaultKeys, ...KeyBox.generateKeys(seed, config.initKeysQuantity)],
        keyCount: config.initKeysQuantity,
      };
      newVault.secret = VaultCrypt.save(newVault, action.password, action.callback);
      return newVault;
    }

    case actions.ERASE: {
      return initialVault;
    }

    case actions.SELECT_ACTIVE_ACCOUNT: {
      chrome.storage.local.set({ [config.accountStorageKey]: action.accountAddress });
      return {
        ...vault,
        selectedAccount: action.accountAddress
      };
    }

    case actions.UNSEAL: {
      return {
        ...initialVault,
        ...vault,
        ...action.unsealedVault,

        sealed: false,
      };
    }

    case actions.SEAL: {
      BgClient.removeSession();
      return {
        ...initialVault,
        secret: vault.secret,
        empty: vault.empty,
        sealed: true,
      };
    }

    case actions.SWITCH_NETWORK: {
      BgClient.changeNetwork(action.testnet, (data) => {
        console.log('SWITCH_NETWORK', data);
      });
      return vault;
    }

    case actions.ADD_ACCOUNT: {
      if (vault.accounts.length >= config.accountsLimit) {
        throw new AccountsLimitError(config.accountsLimit);
      }
      const { nodeId, userAccountId } = ADS.splitAddress(action.address);
      const address = ADS.formatAddress(nodeId, userAccountId);
      const name = action.name;
      const publicKey = action.publicKey.toUpperCase();
      const key = findIfPublicKeyExist(vault, action.publicKey);

      const updatedVault = {
        ...initialVault,
        ...vault,
        accounts: [
          ...vault.accounts,
          {
            address,
            name,
            publicKey,
            secretKey: key.secretKey,
          }]
      };
      updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);
      return updatedVault;
    }

    case actions.UPDATE_ACCOUNT: {
      if (!VaultCrypt.checkPassword(vault, action.password)) {
        throw new InvalidPasswordError();
      }

      const address = action.address.toUpperCase();
      const name = action.name;
      const publicKey = action.publicKey.toUpperCase();
      const key = findIfPublicKeyExist(vault, action.publicKey);

      if (!key) {
        throw new UnknownPublicKeyError(action.publicKey);
      }

      const account = findAccountByAddressInVault(vault, address);
      if (!account) {
        throw new ItemNotFound('account', action.address);
      }

      account.name = name;
      account.publicKey = publicKey;
      account.secretKey = key.secretKey;

      const updatedVault = {
        ...initialVault,
        ...vault,
      };
      updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);

      return updatedVault;
    }

    case actions.REMOVE_ACCOUNT: {
      const checkSelectedAccount = action.updatedAccounts.find(
        account => account.address === vault.selectedAccount);
      if (!checkSelectedAccount) {
        chrome.storage.local.set({ [config.accountStorageKey]: null });
      }

      const updatedVault = {
        ...initialVault,
        ...vault,
        accounts: action.updatedAccounts,
        selectedAccount: checkSelectedAccount || null
      };
      updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);

      return updatedVault;
    }

    case actions.IMPORT_KEY: {
      const updatedVault = { ...vault };
      updatedVault.keys.push({
        type: 'imported',
        name: action.name,
        secretKey: action.secretKey,
        publicKey: action.publicKey,
      });
      updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);
      return updatedVault;
    }

    case actions.REMOVE_KEY: {
      const updatedVault = {
        ...vault,
        keys: action.keysArr
      };

      updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);
      return updatedVault;
    }

    case actions.SAVE_GENERATED_KEYS: {
      const updatedVault = {
        ...vault,
        keyCount: action.newKeyCount,
        keys: [
          ...vault.keys,
          ...action.keys
        ]
      };

      updatedVault.secret = VaultCrypt.save(updatedVault, action.password, action.callback);
      return updatedVault;
    }

    case RETRIEVE_ACCOUNT_DATA_IN_INTERVALS_SUCCESS: {
      const accounts = vault.accounts.map(acount => acount.address === action.account.address ? {
        ...acount,
        ...action.account
      } : acount);
      return {
        ...vault,
        accounts,
      };
    }

    case RETRIEVE_NODES_DATA_IN_INTERVALS_SUCCESS: {
      return {
        ...vault,
        nodes: action.nodes,
      };
    }


    default:
      return vault;
  }
}
