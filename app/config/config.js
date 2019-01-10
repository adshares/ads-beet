const config = {
  testnet: false,
  blockLength: 512,
  dividentLength: 2048,
  derivationPath: "m/44'/311'/",
  passwordMinLength: 1,
  initKeysQuantity: 10,
  itemNameMaxLength: 16,
  accountsLimit: 20,
  importedKeysLimit: 20,
  sessionMaxAge: 60 * 60 * 1000,
  vaultStorageKey: 'vault',
  queueStorageKey: 'queue',
  routerStorageKey: 'router',
  accountStorageKey: 'account',
  proxyConnectionName: 'ads-wallet-proxy',
  adsRpcHost: 'https://rpc.adshares.net/',
  operatorUrl: 'https://operator.adshares.net/',
  apiDocUrl: 'https://github.com/adshares/ads/wiki/ADS-API#',
  getAccountLink: 'https://github.com/adshares/ads/wiki/How-to-convert-ADST-tokens#get-an-account',
  about: require('./about'),
  regulations: require('./regulations'),
  attributions: require('./attributions'),
};

if (window.ADS_NET === 'testnet') {
  module.exports = {
    ...config,
    ...require('./config.testnet'),
  };
} else {
  module.exports = config;
}
