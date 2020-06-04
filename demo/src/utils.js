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

// TEST_NET_CHAIN_ID represents chain id of the Opera TestNet
// A different Chain ID (main net 0xfa) must be used for production deployment.
const TEST_NET_CHAIN_ID = 0xfa2;

/**
 * getTransactionSignatureOptions builds and returns chain signature options
 * The structure is used on transaction signing process to handle chain id related
 * processing. See EIP155 for the details on mitigating replay attacks through
 * adding chain id to the signed transaction hash.
 *
 * @return {{}}
 */
function getTransactionSignatureOptions() {
    return {
        common: Common.default.forCustomChain(
            'mainnet',
            {
                name: 'custom-network',
                networkId: 1,
                chainId: TEST_NET_CHAIN_ID
            },
            'petersburg'
        )
    };
}

// export helpers
module.exports = {
    // isProductKnown simply checks if tested product is known
    // to the chain using test call response
    isProductKnown: function (response) {
        // we expect an object with hash on the key "0" and time stamp on the key "1"
        if (!("object" === typeof response) || !response.hasOwnProperty(1)) {
            return false;
        }

        // parse the time stamp
        const ts = parseInt(response[1]);
        return !isNaN(ts) && 0 < ts;
    },

    // getProductTimeStampFormatted returns formatted product test response
    getProductTimeStampFormatted: function (response) {
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
    },

    // getProductParams encodes product data for the contract call.
    getProductParams: function (product) {
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
    },

    // getSignedTransaction creates and signs transaction
    // for provided encoded data (smart contract mutating call)
    getSignedTransaction: async function (sender, pk, contractAddress, encodedData, web3Client) {
        // get sender's nonce so we can build the transaction
        const txCount = await web3Client.eth.getTransactionCount(sender);

        // create the transaction object
        const txObject = {
            nonce: Utils.toHex(txCount),
            to: contractAddress,
            value: Utils.toHex(Utils.toWei('0', 'ether')),
            gasLimit: Utils.toHex(4200000),
            gasPrice: Utils.toHex(Utils.toWei('1', 'gwei')),
            data: encodedData
        };

        // prep PK for signing
        // this should be much safer in the real application
        const privateKey = Buffer.from(pk, 'hex');

        // construct the transaction object
        const tx = new Tx(txObject, getTransactionSignatureOptions());
        console.log("Chain ID:", tx.getChainId());

        tx.sign(privateKey);

        // return the signed transaction data
        return '0x' + tx.serialize().toString('hex');
    }
};