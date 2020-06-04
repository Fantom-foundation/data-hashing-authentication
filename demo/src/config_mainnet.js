/**
 * This contains configuration data for the Data Hashing Record Authentication
 * contract demo.
 *
 * @author Fantom Foundation, (c) 2020
 * @version 1.0.0
 */
// export configs and helpers
module.exports = {
    rpc: {
        // address of the RPC interface of the Lachesis node used
        // to interact with the blockchain
        address: "https://xapi1.fantom.network/lachesis",
    },

    // owner of the contract
    // represents the account authorized to add new products to the contract
    // is determined on contract deployment
    owner: {
        // address of the contract owner / manager
        address: '0xe46839D86997C38D53E5a9AaFC320EB6b51BABAc',

        // private key of the owner
        // @note This has to be kept secret and managed in a secure way on real app!
        pk: 'cc736dc1cf9ee5256494d5465b4e2e5548196942f7ee98b38d14fee0e63f24bf',
    },

    // smart contract details
    contract: {
        // the ABI of deployed contract never changes since the contract in the blockchain is immutable
        // you can find the ABI on the contract GitHub.com page
        // @see https://github.com/Fantom-foundation/data-hashing-authentication/blob/master/README.md
        abi: '[{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"HashAdded","type":"event"},{"constant":false,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"addProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"authProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]',

        // define the address on which the contract is deployed
        // this address is determined on contract deployment process
        // and does not change over time since deployed contracts are immutable
        address: '0xd1728b465e62abe6550179ba03d52130c1960274'
    },

    // testing data
    products: [
        // random product; should always be recognized as a new product
        // since the expiry date is part of the hashing process
        // and we generate it from the current local time
        {
            name: "Rebus Main",
            batchNo: "2020.05.0141321",
            barcodeNo: (Math.random() * (999999999 - 111111111)+ 111111111).toString(),
            expiryDate: Math.ceil(Date.now() / 1000) + (86400 * 180),
            productionDate: Math.ceil(new Date("2020-05-25").valueOf() / 1000),
            fdaNo: 73737373,
            producerName: "Factorem Productum",
            scanLocation: "Forum Loco",
            scanStatus: "ok",
            scanTime: Math.ceil(Date.now() / 1000),
            scanDate: Math.ceil(Date.now() / 1000)
        },

        // static product; once added, it should be always
        // available for validation; scan timestamps do not contribute
        // to the product hash
        {
            name: "Viribus Main",
            batchNo: "2020.01.151615",
            barcodeNo: "202001151615",
            expiryDate: Math.ceil(new Date("2025-12-31") / 1000),
            productionDate: Math.ceil(new Date("2020-05-25").valueOf() / 1000),
            fdaNo: 73737373,
            producerName: "Factorem Productum",
            scanLocation: "Forum Loco",
            scanStatus: "ok",
            scanTime: Math.ceil(Date.now() / 1000),
            scanDate: Math.ceil(Date.now() / 1000)
        }
    ]
};
