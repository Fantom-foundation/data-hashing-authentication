/**
 * This implements the Data Hashing Record Authentication
 * contract demo interaction.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// import demo data
const cfg = require('./config');
const utils = require('./utils');

// import needed libs
const Web3 = require('web3');

// setup Lachesis server provider used for all Web3 RPC calls
const provider = new Web3.providers.HttpProvider(cfg.rpc.address);

// initialize the Web3 client using configured provider
const client = new Web3(provider);

// testProduct executes a product test
async function testProduct(product, contract) {
    // log action
    console.log("Testing Product: ", product.name);

    // parse product params
    const params = utils.getProductParams(product);

    // execute the product test call
    const res = await contract.methods.authProduct(
        params.name,
        params.batchNo,
        params.barcodeNo,
        params.expiryDate,
        params.productionDate,
        params.fdaNo,
        params.producerName,
        params.scanLocation,
        params.scanStatus,
        params.scanTime,
        params.scanDate
    ).call();

    // what's the result
    if (utils.isProductKnown(res)) {
        // show the time stamp of the product added
        console.log("Product", product.name, "has been added ", utils.getProductTimeStampFormatted(res));
    } else {
        // show unknown product message
        console.log("Unknown product", product.name);
    }

    return res;
}

// addProduct executes a product adding function
async function addProduct(product, contract, client) {
    // log action
    console.log("Adding Product: ", product.name);

    // parse product params
    const params = utils.getProductParams(product);

    // execute the product test call
    const data = contract.methods.addProduct(
        params.name,
        params.batchNo,
        params.barcodeNo,
        params.expiryDate,
        params.productionDate,
        params.fdaNo,
        params.producerName,
        params.scanLocation,
        params.scanStatus,
        params.scanTime,
        params.scanDate
    ).encodeABI();

    // construct the mutating transaction for adding a new product
    const tx = await utils.getSignedTransaction(cfg.owner.address, cfg.owner.pk, cfg.contract.address, data, client);
    const add = await client.eth.sendSignedTransaction(tx);

    // log the result
    console.log("Product", product.name, "has been added with block #", add.blockNumber);
    console.log("Transaction: ", add.transactionHash);

    return add;
}

// verify that we are connected and able to communicate with the blockchain
// node and interact with the smart contract (we use simple eth call to find out)
client.eth.getBlockNumber().then(async (blockNum) => {
    // inform we are ready to communicate
    console.log("Lachesis node connection is active. Current block height is:", blockNum);

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

    // who is the owner
    const manager = await contract.methods.manager().call();
    console.log("Current contract manager account is:", manager);

    // validate that the first test product is not known yet
    await testProduct(cfg.products[0], contract);

    // try to add the product to the contract
    console.log("Random product is being added to the contract.");
    await addProduct(cfg.products[0], contract, client);

    // validate that the random product is known in the block chain
    await testProduct(cfg.products[0], contract);

    // try to check deterministic product
    console.log("Specific product is being tested: ", cfg.products[1].name);
    const test = await testProduct(cfg.products[1], contract);

    // is the product already in the contract?
    if (!utils.isProductKnown(test)) {
        // product not registered and needs to be added first
        console.log("Product not known yet, adding to the block chain.");
        await addProduct(cfg.products[1], contract, client);
    } else {
        // it's already there
        console.log("Product ok.");
    }
}).catch(e => {
    // connection failed, inform about the situation
    // we can not continue
    console.log("Can not communicate with the Lachesis node.\nSmart contract interaction not available!\n", e.toString())
});
