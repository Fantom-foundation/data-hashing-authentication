/**
 * This implements the Data Hashing Record Authentication
 * contract demo interaction. The code simply adds a new product
 * to the contract.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// import demo data
const cfg = require('./config_mainnet');
const utils = require('./utils');

// import needed libs
const Web3 = require('web3');

// setup Lachesis server provider used for all Web3 RPC calls
const provider = new Web3.providers.HttpProvider(cfg.rpc.address);

// initialize the Web3 client using configured provider
const client = new Web3(provider);

// verify that we are connected and able to communicate with the blockchain
// node and interact with the smart contract (we use simple eth call to find out)
client.eth.getBlockNumber().then(async (blockNum) => {
    // inform we are ready to communicate
    console.log("Lachesis node connection is active.\nCurrent block height is:", blockNum);

    // parse the contract ABI, which defines the contract communication interface
    // @see https://github.com/Fantom-foundation/data-hashing-authentication/blob/master/README.md
    let abi;
    try {
        abi = JSON.parse(cfg.contract.abi);
    } catch (e) {
        console.log("Error parsing the contract ABI.", e.toString());
        return;
    }

    // create the contract call wrapper we will use to interact with
    // the deployed contract on the blockchain
    const contract = new client.eth.Contract(abi, cfg.contract.address);

    // try to add the product to the contract
    console.log("Random product", cfg.products[0].name, "is being added to the contract.");
    await utils.addProduct(cfg.products[0], contract, cfg.owner, client);
}).catch(e => {
    // connection failed, inform about the situation
    // we can not continue
    console.log("Smart contract interaction failed!\n", e.toString())
});
