/**
 * This contains shared utility code for the Data Hashing Record Authentication
 * contract demo.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// load needed libs
const {utils: Utils} = require('web3');
const {Transaction: Tx} = require('ethereumjs-tx');
const Common = require('ethereumjs-common');

/**
 * getTransactionSignatureOptions builds and returns chain signature options
 * The structure is used on transaction signing process to handle chain id related
 * processing. See EIP155 for the details on mitigating replay attacks through
 * adding chain id to the signed transaction hash.
 *
 * @return {{}}
 */
function getTransactionSignatureOptions(chainId) {
    return {
        common: Common.default.forCustomChain(
            'mainnet',
            {
                name: 'custom-network',
                networkId: 1,
                chainId: chainId
            },
            'petersburg'
        )
    };
}

// getProductParams encodes product data for the contract call.
function getProductParams(product) {
    return {
        name: Utils.utf8ToHex(product.name),
        batchNo: Utils.utf8ToHex(product.batchNo),
        barcodeNo: Utils.utf8ToHex(product.barcodeNo),
        expiryDate: Utils.numberToHex(product.expiryDate),
        productionDate: Utils.numberToHex(product.productionDate),
        fdaNo: Utils.numberToHex(product.fdaNo),
        producerName: Utils.utf8ToHex(product.producerName),
        scanLocation: Utils.utf8ToHex(product.scanLocation),
        scanStatus: Utils.utf8ToHex(product.scanStatus),
        scanTime: Utils.numberToHex(product.scanTime),
        scanDate: Utils.numberToHex(product.scanDate)
    };
}

// getProductTimeStampFormatted returns formatted product test response
function getProductTimeStampFormatted(response) {
    // we expect an object with hash on the key "0" and time stamp on the key "1"
    if (!("object" === typeof response) || !response.hasOwnProperty(1)) {
        return "invalid response";
    }

    // parse the time stamp
    const ts = parseInt(response[1]);
    if (isNaN(ts)) {
        return "product time stamp not recognized";
    }

    // if the time stamp equals zero, the product is not known
    if (0 === ts) {
        return "unknown product";
    }

    // return formatted time stamp of the product
    const dt = new Date(ts * 1000);
    return dt.toLocaleString();
}

// getSignedTransaction creates and signs transaction
// for provided encoded data (smart contract mutating call)
async function getSignedTransaction(sender, pk, contractAddress, encodedData, web3Client) {
    // get sender's nonce so we can build the transaction
    const chainId = await web3Client.eth.getChainId();
    const txCount = await web3Client.eth.getTransactionCount(sender);
    const gasPrice = await web3Client.eth.getGasPrice();

    // show the chain id
    console.log("Using network chain ID:", chainId);
    console.log("Current sender's nonce is:", txCount);
    console.log("Current gas price is:", gasPrice, 'WEI');

    // create the transaction object
    const txObject = {
        nonce: Utils.toHex(txCount),
        to: contractAddress,
        value: Utils.toHex(Utils.toWei('0', 'ether')),
        gasLimit: Utils.toHex(2500000),
        gasPrice: Utils.toHex(gasPrice),
        data: encodedData
    };

    // construct the transaction object
    const tx = new Tx(txObject, getTransactionSignatureOptions(chainId));

    // prep PK for signing and use it for signing the transaction
    // this should be much safer in the real application
    const privateKey = Buffer.from(pk, 'hex');
    tx.sign(privateKey);

    // return the signed transaction data serialized for sending
    return '0x' + tx.serialize().toString('hex');
}

// isProductKnown simply checks if tested product is known
function isProductKnown(response) {
    // we expect an object with hash on the key "0" and time stamp on the key "1"
    if (!("object" === typeof response) || !response.hasOwnProperty(1)) {
        return false;
    }

    // parse the time stamp
    const ts = parseInt(response[1]);
    return !isNaN(ts) && 0 < ts;
}

// export helpers
module.exports = {
    // isProductKnown simply checks if tested product is known
    isProductKnown: isProductKnown,

    // testProduct executes a product test
    testProduct: async function (product, contract) {
        // log action
        console.log("Testing Product: ", product.name);

        // parse product params
        const params = getProductParams(product);
        let res;

        // execute the product test call
        try {
            res = await contract.methods.authProduct(
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
        } catch (e) {
            console.log("Product", product.name, "not found.");
            return {0: '', 1: 0};
        }

        // what's the result
        if (isProductKnown(res)) {
            // show the time stamp of the product added
            console.log("Product", product.name, "has been added ", getProductTimeStampFormatted(res));
        } else {
            // show unknown product message
            console.log("Unknown product", product.name);
        }

        return res;
    },

    // addProduct executes a product adding function
    addProduct: async function (product, contract, owner, client) {
        // log action
        console.log("Adding Product: ", product.name, "to contract", contract.options.address);

        // parse product params
        const params = getProductParams(product);

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
        const tx = await getSignedTransaction(owner.address, owner.pk, contract.options.address, data, client);
        const add = await client.eth.sendSignedTransaction(tx);

        // log the result
        console.log("Product", product.name, "has been added with block #", add.blockNumber);
        console.log("Transaction: ", add.transactionHash);

        return add;
    }
};