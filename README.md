# Data Hashing Record Authentication Contract

Solidity smart contract for registering authentic products, and their later validation based 
on predefined set of attributes, which are hashed inside the contract.

The essentials:
    
- The contract allows registering of authentic products by storing a hash of specified
  set of scanned attributes of the product. The set of attributes is predefined and all
  parameters are mandatory.
- Only authorized account can add new authentic products' hashes to the contract.
- The contract allows verifying authenticity of a product by providing the same set of
  predefined attributes. The contract calculates a hash of these attributes and returns
  a timestamp of the registration if the product is known. If the product is not recognized
  by the contract, zero value is returned instead.
- Any account can check authenticity of a product.

##Compilation and Deployment
1. Install [Solidity](https://solidity.readthedocs.io) compiler. 
    The contract expects Solidity version to be at least 0.5.0 and at most 0.6.0.
2. Compile the contract for deployment.
    `solc -o ./build --optimize --optimize-runs=200 --abi --bin ./contracts/DataHashAuth.sol`
3. Deploy compiled binary file `./build/DataHashAuth.bin` into the blockchain.
4. Use generated ABI file `./build/DataHashAuth.abi` to interact with the contract.

##Product Parameters
The contract expects and validates following product attributes:
- name ... (string) Name of the product.
- batchNo ... (string) Production batch number.
- barcodeNo ... (string) Barcode number.
- expiryDate ... (number) Time stamp of the product expiration (UNIX epoch).
- productionDate ... (number) Time stamp of the product manufacturing (UNIX epoch). 
- fdaNo ... (number) FDA product identification number (256 bits).
- producerName ... (string) Name of the manufacturer.
- scanLocation ... (string) Location of the registration scan.
- scanStatus ... (string) Status of the registration scan.
- scanTime ... (number) Time stamp of the scan (UNIX epoch).
- scanDate ... (number) Time stamp of the scan date (UNIX epoch).

##Public Functions
The contract offers two major functions:

- Function `addProduct` consumes list of product attributes,makes basic validation checks, 
  calculates the product hash and adds the hash into it's internal state. This function has 
  to be called from a signed transaction and mutates the internal state. The function can be called only
  from an address which deployed the original contract, so called owner.
   
  This function also emits an event `HashAdded` on success. These events can be captured, or filtered later.
  
- Function `authProduct` authenticates a product by consuming the product attributes and checking 
  the corresponding hash with its internal state. The same rules for attributes apply here.
  
##The Contract Abi
You need this ABI to interact with the contract:
```json
[{"inputs":[],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"HashAdded","type":"event"},{"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"add","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"auth","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
```

##Testing the Contract
The repository also contains a simple JavaScript application for contract testing. To be able to do the testing, 
you will need a Node.js version 10.0, or later and NPM installed on your machine.

1. Open the demo folder. `cd demo`
2. Install dependencies using NPM. `npm install`
3. Run the demo code. `npm start`

The demo application connects with the Opera TestNet network, validates a non-existence of a random product
setup, adds the product to the contract and re-validates it. On the first check, the product should be unknown.
On the second check, after the product has been added, the expected response is a valid time stamp 
of the adding.
   