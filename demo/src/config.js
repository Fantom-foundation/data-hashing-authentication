/**
 * This contains configuration data for the Data Hashing Record Authentication
 * contract demo.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// load needed libs
const {utils: Utils} = require('web3');
const Tx = require('ethereumjs-tx');

// export configs and helpers
module.exports = {
    // owner of the contract
    // represents the account authorized to add new products to the contract
    // is determined on contract deployment
    owner: {
        // address of the contract owner / manager
        address: '',

        // private key of the owner
        // @note This has to be kept secret and managed in a secure way on real app!
        pk: ''
    },

    // smart contract details
    contract: {
        // the ABI of deployed contract never changes since the contract in the blockchain is immutable
        // you can find the ABI on the contract GitHub.com page
        // @see https://github.com/Fantom-foundation/data-hashing-authentication/blob/master/README.md
        abi: '[{"inputs":[],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"HashAdded","type":"event"},{"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"add","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"auth","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"}]',

        // define the address on which the contract is deployed
        // this address is determined on contract deployment process
        // and does not change over time since deployed contracts are immutable
        address: ''
    },

    // testing data
    products: [
        // random product; should always be recognized as a new product
        // since the expiry date is part of the hashing process
        // and we generate it from the current local time
        {
            name: "Rebus",
            batchNo: "2020.05.0141321",
            barcodeNo: "2020050141321",
            expiryDate: (Date.now() / 1000) + (86400 * 180),
            productionDate: new Date("2020-05-25").valueOf() / 1000,
            fdaNo: 73737373,
            producerName: "Factorem Productum",
            scanLocation: "Forum Loco",
            scanStatus: "ok",
            scanTime: Date.now() / 1000,
            scanDate: Date.now() / 1000
        },

        // static product; once added, it should be always
        // available for validation; scan timestamps do not contribute
        // to the product hash
        {
            name: "Viribus",
            batchNo: "2020.01.151615",
            barcodeNo: "202001151615",
            expiryDate: new Date("2025-12-31") / 1000,
            productionDate: new Date("2020-05-25").valueOf() / 1000,
            fdaNo: 73737373,
            producerName: "Factorem Productum",
            scanLocation: "Forum Loco",
            scanStatus: "ok",
            scanTime: Date.now() / 1000,
            scanDate: Date.now() / 1000
        }
    ],

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
            gasLimit: Utils.toHex(2100000),
            gasPrice: Utils.toHex(Utils.toWei('6', 'gwei')),
            data: encodedData
        };

        // prep PK for signing
        // this should be much safer in the real application
        const privateKey = Buffer.from(pk, 'hex');

        // construct the transaction object
        const tx = new Tx(txObject);
        tx.sign(privateKey);

        // return the signed transaction data
        return '0x' + tx.serialize().toString('hex');
    }
};
