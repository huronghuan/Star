/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 *   0xd05327ee0d434abbccbb79ae3a9af47dff5f3c93
 */

require('babel-register')

const HDWalletProvider = require('truffle-hdwallet-provider')

const MENOMIC = "visit ensure jacket joy awkward similar silver room giggle stool tool short"

const rinkeby_url = "https://rinkeby.infura.io/v3/5afd2be08b9b41ec992bf6e4db36f007"

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks : {
    development : {
      host : '127.0.0.1',
      port : 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider( MENOMIC, rinkeby_url, 0, 4)
      },
      network_id: '4',
      gas: 4500000,
      gasPrice: 100000000000
    }
  },
  currentNetwork:'development'// determine the current network for web use
}
