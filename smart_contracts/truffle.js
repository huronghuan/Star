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

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  	networks: {
	  development: {
	   host: "127.0.0.1",
	   port: 7545,
	   network_id: "*" // Match any network id
	 },
	 rinkeby: {
		  provider: function() {
		 	return new HDWalletProvider("this is a test program named starNotary used for examing,author is huronghuan ", "https://rinkeby.infura.io/v3/5afd2be08b9b41ec992bf6e4db36f007")
		     },
	      network_id: '4',
	    }
	}
};
