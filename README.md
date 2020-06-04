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
var abi = JSON.parse('[{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"HashAdded","type":"event"},{"constant":false,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"addProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes","name":"name","type":"bytes"},{"internalType":"bytes","name":"batchNo","type":"bytes"},{"internalType":"bytes","name":"barcodeNo","type":"bytes"},{"internalType":"uint256","name":"expiryDate","type":"uint256"},{"internalType":"uint256","name":"productionDate","type":"uint256"},{"internalType":"uint256","name":"fdaNo","type":"uint256"},{"internalType":"bytes","name":"producerName","type":"bytes"},{"internalType":"bytes","name":"scanLocation","type":"bytes"},{"internalType":"bytes","name":"scanStatus","type":"bytes"},{"internalType":"uint256","name":"scanTime","type":"uint256"},{"internalType":"uint256","name":"scanDate","type":"uint256"}],"name":"authProduct","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]');
var bytecode = '0x6080604052600080546001600160a01b03191633179055610bc8806100256000396000f3fe6080604052600436106100345760003560e01c806312bb797a14610039578063481c6a75146103b4578063510d53d0146103e5575b600080fd5b34801561004557600080fd5b5061039b600480360361016081101561005d57600080fd5b810190602081018135600160201b81111561007757600080fd5b82018360208201111561008957600080fd5b803590602001918460018302840111600160201b831117156100aa57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156100fc57600080fd5b82018360208201111561010e57600080fd5b803590602001918460018302840111600160201b8311171561012f57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561018157600080fd5b82018360208201111561019357600080fd5b803590602001918460018302840111600160201b831117156101b457600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295843595602086013595604081013595509193509150608081019060600135600160201b81111561021857600080fd5b82018360208201111561022a57600080fd5b803590602001918460018302840111600160201b8311171561024b57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561029d57600080fd5b8201836020820111156102af57600080fd5b803590602001918460018302840111600160201b831117156102d057600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561032257600080fd5b82018360208201111561033457600080fd5b803590602001918460018302840111600160201b8311171561035557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550508235935050506020013561074c565b6040805192835260208301919091528051918290030190f35b3480156103c057600080fd5b506103c961079f565b604080516001600160a01b039092168252519081900360200190f35b61073a60048036036101608110156103fc57600080fd5b810190602081018135600160201b81111561041657600080fd5b82018360208201111561042857600080fd5b803590602001918460018302840111600160201b8311171561044957600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561049b57600080fd5b8201836020820111156104ad57600080fd5b803590602001918460018302840111600160201b831117156104ce57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561052057600080fd5b82018360208201111561053257600080fd5b803590602001918460018302840111600160201b8311171561055357600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295843595602086013595604081013595509193509150608081019060600135600160201b8111156105b757600080fd5b8201836020820111156105c957600080fd5b803590602001918460018302840111600160201b831117156105ea57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561063c57600080fd5b82018360208201111561064e57600080fd5b803590602001918460018302840111600160201b8311171561066f57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156106c157600080fd5b8201836020820111156106d357600080fd5b803590602001918460018302840111600160201b831117156106f457600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050823593505050602001356107ae565b60408051918252519081900360200190f35b6000806107628d8d8d8d8d8d8d8d8d8d8d6108e0565b61076b57600080fd5b600061077b8e8e8e8e8e8d610995565b600081815260016020526040902054909f909e509c50505050505050505050505050565b6000546001600160a01b031681565b600080546001600160a01b031633146107f85760405162461bcd60e51b8152600401808060200182810382526022815260200180610b726022913960400191505060405180910390fd5b61080b8c8c8c8c8c8c8c8c8c8c8c6108e0565b61081457600080fd5b60006108248d8d8d8d8d8c610995565b60008181526001602052604090205490915015610881576040805162461bcd60e51b81526020600482015260166024820152751c1c9bd91d58dd08185b1c9958591e481b1a5cdd195960521b604482015290519081900360640190fd5b600081815260016020908152604091829020429081905582518481529182015281517f0b4925df5dd8116ca4b5baabefa179f138d18e28f9ec96d84d70c857c6311f45929181900390910190a190505b9b9a5050505050505050505050565b60008b51600014156108f4575060006108d1565b8a51610902575060006108d1565b8951610910575060006108d1565b855161091e575060006108d1565b42891161092d575060006108d1565b42881061093c575060006108d1565b845161094a575060006108d1565b8351610958575060006108d1565b86610965575060006108d1565b428311610974575060006108d1565b428211610983575060006108d1565b5060019b9a5050505050505050505050565b6000868686868686604051602001808060200180602001806020018781526020018681526020018060200185810385528b818151815260200191508051906020019080838360005b838110156109f55781810151838201526020016109dd565b50505050905090810190601f168015610a225780820380516001836020036101000a031916815260200191505b5085810384528a5181528a516020918201918c019080838360005b83811015610a55578181015183820152602001610a3d565b50505050905090810190601f168015610a825780820380516001836020036101000a031916815260200191505b5085810383528951815289516020918201918b019080838360005b83811015610ab5578181015183820152602001610a9d565b50505050905090810190601f168015610ae25780820380516001836020036101000a031916815260200191505b50858103825286518152865160209182019188019080838360005b83811015610b15578181015183820152602001610afd565b50505050905090810190601f168015610b425780820380516001836020036101000a031916815260200191505b509a5050505050505050505050604051602081830303815290604052805190602001209050969550505050505056fe6f6e6c79206d616e61676572732063616e20616464206e65772070726f6475637473a265627a7a72315820ef22e37c2ebc67911c26e205a676cbce2c91280f62aaff2fb8a143581416c7da64736f6c63430005110032';

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
