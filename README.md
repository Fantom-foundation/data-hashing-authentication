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

## Compilation and Deployment
1. Install [Solidity](https://solidity.readthedocs.io) compiler. 
    The contract expects Solidity version to be at least 0.5.0 and at most 0.6.0.
2. Compile the contract for deployment.
    `solc -o ./build --optimize --optimize-runs=200 --abi --bin ./contracts/DataHashAuth.sol`
3. Deploy compiled binary file `./build/DataHashAuth.bin` into the blockchain.
4. Use generated ABI file `./build/DataHashAuth.abi` to interact with the contract.

## Product Parameters
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

## Public Functions
The contract offers two major functions:

- Function `addProduct` consumes list of product attributes,makes basic validation checks, 
  calculates the product hash and adds the hash into it's internal state. This function has 
  to be called from a signed transaction and mutates the internal state. The function can be called only
  from an address which deployed the original contract, so called owner.
   
  This function also emits an event `HashAdded` on success. These events can be captured, or filtered later.
  
- Function `authProduct` authenticates a product by consuming the product attributes and checking 
  the corresponding hash with its internal state. The same rules for attributes apply here.
  
## The Contract Abi
You need this ABI to interact with the contract:
```json
[{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"HashAdded","type":"event"},{"constant":false,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"addProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"authProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]
```

## Testing the Contract
The repository also contains a simple JavaScript application for contract testing. To be able to do the testing, 
you will need a Node.js version 10.0, or later and NPM installed on your machine.

1. Open the demo folder. `cd demo`
2. Install dependencies using NPM. `npm install`
3. Run the demo code. `npm start`

The demo application connects with the Opera TestNet network, validates a non-existence of a random product
setup, adds the product to the contract and re-validates it. On the first check, the product should be unknown.
On the second check, after the product has been added, the expected response is a valid time stamp 
of the adding.

**Please note**: You need to have some FTM currency on your owner/administrator account 
to be able to add new products to the contract. The new product hashing is a state changing
function and as such, it requires the client to pay the transaction fee.

### Testing Account
Test net owner/manager account address utilized in the demo uses BIP44 path `m/44'/60'/0'/0/0`. Please make sure
to use a **different secure account** for the production environment. 

BIP39 Mnemonic Phrase for the account is: 
```
noodle cotton assist team 
pink tent talent blind 
eye candy disease balcony 
soldier feel dinner sting 
shop detail swift soap 
cradle pizza disease fish
```

The test address is:
`0xe46839D86997C38D53E5a9AaFC320EB6b51BABAc`.

## Deployment Using Lachesis

This is an example script for the contract deployment using Lachesis JavaScript console. Please make sure
you have a working Lachesis binary installed and running to be able to use this deployment script.

1. Open Lachesis JavaScript console `lachesis attach`.

2. Run the deployment script. Make sure to set correct account address and password 
of the account you are going to use for the deployment. The account has to be accessible 
to the Lachesis binary, so you need to have the account available in Lachesis key store.
  
```JavaScript
// setup the deplyment account
var account = "<your deployment account address, i.e. 0xe46839D86997C38D53E5a9AaFC320EB6b51BABAc>";
personal.unlockAccount(account, "<your deployment account keystore password>", 60);
web3.ftm.defaultAccount = account;

// contract details provided by Solidity compiler
var abi = JSON.parse('[{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"HashAdded","type":"event"},{"constant":false,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"addProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"authProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"}],"name":"getProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"}],"name":"getProductByHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]');
var bytecode = '6080604052600080546001600160a01b03191633179055610e9b806100256000396000f3fe60806040526004361061004a5760003560e01c806312bb797a1461004f578063481c6a75146103ca578063510d53d0146103fb5780639f11d94014610762578063ad38ec261461078c575b600080fd5b34801561005b57600080fd5b506103b1600480360361016081101561007357600080fd5b810190602081018135600160201b81111561008d57600080fd5b82018360208201111561009f57600080fd5b803590602001918460018302840111600160201b831117156100c057600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561011257600080fd5b82018360208201111561012457600080fd5b803590602001918460018302840111600160201b8311171561014557600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561019757600080fd5b8201836020820111156101a957600080fd5b803590602001918460018302840111600160201b831117156101ca57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295843595602086013595604081013595509193509150608081019060600135600160201b81111561022e57600080fd5b82018360208201111561024057600080fd5b803590602001918460018302840111600160201b8311171561026157600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156102b357600080fd5b8201836020820111156102c557600080fd5b803590602001918460018302840111600160201b831117156102e657600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561033857600080fd5b82018360208201111561034a57600080fd5b803590602001918460018302840111600160201b8311171561036b57600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050823593505050602001356109d8565b6040805192835260208301919091528051918290030190f35b3480156103d657600080fd5b506103df610a2b565b604080516001600160a01b039092168252519081900360200190f35b610750600480360361016081101561041257600080fd5b810190602081018135600160201b81111561042c57600080fd5b82018360208201111561043e57600080fd5b803590602001918460018302840111600160201b8311171561045f57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156104b157600080fd5b8201836020820111156104c357600080fd5b803590602001918460018302840111600160201b831117156104e457600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561053657600080fd5b82018360208201111561054857600080fd5b803590602001918460018302840111600160201b8311171561056957600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295843595602086013595604081013595509193509150608081019060600135600160201b8111156105cd57600080fd5b8201836020820111156105df57600080fd5b803590602001918460018302840111600160201b8311171561060057600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561065257600080fd5b82018360208201111561066457600080fd5b803590602001918460018302840111600160201b8311171561068557600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156106d757600080fd5b8201836020820111156106e957600080fd5b803590602001918460018302840111600160201b8311171561070a57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295505082359350505060200135610a3a565b60408051918252519081900360200190f35b34801561076e57600080fd5b506103b16004803603602081101561078557600080fd5b5035610b6c565b34801561079857600080fd5b506103b1600480360360c08110156107af57600080fd5b810190602081018135600160201b8111156107c957600080fd5b8201836020820111156107db57600080fd5b803590602001918460018302840111600160201b831117156107fc57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561084e57600080fd5b82018360208201111561086057600080fd5b803590602001918460018302840111600160201b8311171561088157600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156108d357600080fd5b8201836020820111156108e557600080fd5b803590602001918460018302840111600160201b8311171561090657600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295843595602086013595919450925060608101915060400135600160201b81111561096457600080fd5b82018360208201111561097657600080fd5b803590602001918460018302840111600160201b8311171561099757600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550610b7f945050505050565b6000806109ee8d8d8d8d8d8d8d8d8d8d8d610bb1565b6109f757600080fd5b6000610a078e8e8e8e8e8d610c68565b600081815260016020526040902054909f909e509c50505050505050505050505050565b6000546001600160a01b031681565b600080546001600160a01b03163314610a845760405162461bcd60e51b8152600401808060200182810382526022815260200180610e456022913960400191505060405180910390fd5b610a978c8c8c8c8c8c8c8c8c8c8c610bb1565b610aa057600080fd5b6000610ab08d8d8d8d8d8c610c68565b60008181526001602052604090205490915015610b0d576040805162461bcd60e51b81526020600482015260166024820152751c1c9bd91d58dd08185b1c9958591e481b1a5cdd195960521b604482015290519081900360640190fd5b600081815260016020908152604091829020429081905582518481529182015281517f0b4925df5dd8116ca4b5baabefa179f138d18e28f9ec96d84d70c857c6311f45929181900390910190a190505b9b9a5050505050505050505050565b6000818152600160205260409020549091565b6000806000610b92898989898989610c68565b600081815260016020526040902054909a909950975050505050505050565b60008b5160001415610bc557506000610b5d565b8a51610bd357506000610b5d565b8951610be157506000610b5d565b8551610bef57506000610b5d565b428911610bfe57506000610b5d565b428810610c0d57506000610b5d565b8451610c1b57506000610b5d565b8351610c2957506000610b5d565b86610c3657506000610b5d565b87831015610c4657506000610b5d565b87821015610c5657506000610b5d565b5060019b9a5050505050505050505050565b6000868686868686604051602001808060200180602001806020018781526020018681526020018060200185810385528b818151815260200191508051906020019080838360005b83811015610cc8578181015183820152602001610cb0565b50505050905090810190601f168015610cf55780820380516001836020036101000a031916815260200191505b5085810384528a5181528a516020918201918c019080838360005b83811015610d28578181015183820152602001610d10565b50505050905090810190601f168015610d555780820380516001836020036101000a031916815260200191505b5085810383528951815289516020918201918b019080838360005b83811015610d88578181015183820152602001610d70565b50505050905090810190601f168015610db55780820380516001836020036101000a031916815260200191505b50858103825286518152865160209182019188019080838360005b83811015610de8578181015183820152602001610dd0565b50505050905090810190601f168015610e155780820380516001836020036101000a031916815260200191505b509a5050505050505050505050604051602081830303815290604052805190602001209050969550505050505056fe6f6e6c79206d616e61676572732063616e20616464206e65772070726f6475637473a265627a7a72315820b6959cadadf62581831ffaa44196e6bf5e53ccf221a798685926376922793c3564736f6c63430005110032';

// deploy
var contract = web3.ftm.contract(abi);
var deploy = contract.new({
	data: bytecode,
	from: account,
	gas: 1500000
});

// what is the address
deploy.address
```
