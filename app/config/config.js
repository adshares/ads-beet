const config = {
  testnet: false,
  blockLength: 512,
  dividentLength: 2048,
  derivationPath: "m/44'/311'/",
  passwordMinLength: 8,
  initKeysQuantity: 3,
  itemNameMaxLength: 16,
  accountsLimit: 20,
  importedKeysLimit: 20,
  sessionMaxAge: 60 * 60 * 1000,
  vaultStorageKey: 'vault',
  queueStorageKey: 'queue',
  routerStorageKey: 'router',
  accountStorageKey: 'account',
  formsStorageKey: 'forms',
  transactionsStorageKey: 'transactions',
  proxyConnectionName: 'ads-wallet-proxy',
  adsRpcHost: 'https://rpc.adshares.net/',
  operatorUrl: 'https://operator.adshares.net/',
  apiDocUrl: 'https://github.com/adshares/ads/wiki/ADS-API#',
  helpUrl: 'https://github.com/adshares/ads-browser-wallet/wiki',
  websiteUrl: 'https://adshares.net/wallet',
  supportUrl: 'https://github.com/adshares/ads-browser-wallet/issues',
  about: require('./about'),
  terms: require('./terms'),
  attributions: require('./attributions'),
};

module.exports = config;

if (window.ADS_NET === 'testnet') {
  module.exports = {
    ...module.exports,
    ...require('./config.testnet'),
  };
}
if (process.env.NODE_ENV !== 'production') {
  module.exports = {
    ...module.exports,
    ...require('./config.dev'),
  };
}
