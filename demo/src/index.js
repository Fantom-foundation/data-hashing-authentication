/**
 * This implements the Data Hashing Record Authentication
 * contract demo interaction.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// import demo data
const cfg = require('./config');

// import needed libs
const Web3 = require('web3');

// setup Lachesis server provider used for all Web3 RPC calls
const provider = new Web3.providers.HttpProvider('https://xapi.testnet.fantom.network/lachesis');

// initialize the Web3 client using configured provider
const client = new Web3(provider);

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

    // ------------------------------------------------------
    // validate that the first test product is not known yet
    // ------------------------------------------------------
    // it should not be since we generate expiry timestamp from the current local time
    // @see config.js for the details
    console.log("Testing random product: ", cfg.products[0].name);
    let res = await contract.authProduct(
        cfg.products[0].name,
        cfg.products[0].batchNo,
        cfg.products[0].barcodeNo,
        cfg.products[0].expiryDate,
        cfg.products[0].productionDate,
        cfg.products[0].fdaNo,
        cfg.products[0].producerName,
        cfg.products[0].scanLocation,
        cfg.products[0].scanStatus,
        cfg.products[0].scanTime,
        cfg.products[0].scanDate
    ).call();

    // log the result
    console.log("Random product test response: ", res);

    // ------------------------------------------------------
    // try to add the product to the contract
    // ------------------------------------------------------
    console.log("Random product is being added to the contract.");

    // add the random product to contract database
    const addData = contract.methods.addProduct(
        cfg.products[0].name,
        cfg.products[0].batchNo,
        cfg.products[0].barcodeNo,
        cfg.products[0].expiryDate,
        cfg.products[0].productionDate,
        cfg.products[0].fdaNo,
        cfg.products[0].producerName,
        cfg.products[0].scanLocation,
        cfg.products[0].scanStatus,
        cfg.products[0].scanTime,
        cfg.products[0].scanDate
    ).encodeABI();

    // construct the mutating transaction for adding a new product
    const tx = await cfg.getSignedTransaction(cfg.owner.address, cfg.owner.pk, cfg.contract.address, addData, client);
    const add = await client.eth.sendSignedTransaction(tx);

    // log the result
    console.log("Random product added.\n", add);

    // ------------------------------------------------------
    // validate that the random product is known now
    // ------------------------------------------------------
    console.log("Testing random product again: ", cfg.products[0].name);
    res = await contract.authProduct(
        cfg.products[0].name,
        cfg.products[0].batchNo,
        cfg.products[0].barcodeNo,
        cfg.products[0].expiryDate,
        cfg.products[0].productionDate,
        cfg.products[0].fdaNo,
        cfg.products[0].producerName,
        cfg.products[0].scanLocation,
        cfg.products[0].scanStatus,
        cfg.products[0].scanTime,
        cfg.products[0].scanDate
    ).call();

    // log the result
    console.log("Test response: ", res);

}).catch(e => {
    // connection failed, inform about the situation
    // we can not continue
    console.log("Can not communicate with the Lachesis node.\nSmart contract interaction not available!\n", e.toString())
});
