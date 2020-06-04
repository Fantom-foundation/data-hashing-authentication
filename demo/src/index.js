/**
 * This implements the Data Hashing Record Authentication
 * contract demo interaction.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// import demo data
const cfg = require('./config_testnet');
const utils = require('./utils');

// import needed libs
const Web3 = require('web3');

// setup Lachesis server provider used for all Web3 RPC calls
const provider = new Web3.providers.WebsocketProvider(cfg.rpc.address);

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

    // who is the owner of the contract
    const manager = await contract.methods.manager().call();
    console.log("Current contract manager account is:", manager);

    // validate that the first test product is not known yet
    console.log("Testing random product, the product should not be found.");
    await utils.testProduct(cfg.products[0], contract);

    // try to add the product to the contract
    console.log("Random product is being added to the contract.");
    await utils.addProduct(cfg.products[0], contract, cfg.owner, client);

    // validate that the random product is known in the block chain
    console.log("Testing random product again, this time it should be found.");
    await utils.testProduct(cfg.products[0], contract);

    // try to check deterministic product
    console.log("Specific non-random product", cfg.products[1].name, "is being tested.");
    const test = await utils.testProduct(cfg.products[1], contract);

    // is the product already in the contract?
    if (!utils.isProductKnown(test)) {
        // product not registered and needs to be added first
        console.log("Product not known yet, adding to the block chain.");
        await utils.addProduct(cfg.products[1], contract, cfg.owner, client);
    } else {
        // it's already there
        console.log("Product ok.");
    }

    // disconnect
    return provider.disconnect();
}).catch(e => {
    // connection failed, inform about the situation
    // we can not continue
    console.log("Smart contract interaction failed!\n", e.toString())

    // disconnect
    return provider.disconnect();
});
