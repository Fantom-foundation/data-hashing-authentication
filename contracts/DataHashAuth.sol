// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

// DataHashAuth implements contract for registering authentic
// products hash inside the ledger by hashing their unique attributes
// and validating products authenticity providing the same set of attributes.
contract DataHashAuth {
	// manager is the account allowed to register new authentic products
	// to the contract.
	address public manager;

	// products store mapping between authentic product hash and registration
	// timestamp, the time stamp can be taken from the processing block since
    // we don't need better time accuracy.
	mapping (bytes32 => uint) internal products;

	// HashAdded event is emitted on successful
	event HashAdded(bytes32 hash, uint time);

	// constructor initializes new contract instance on deployment
	// the creator will also become the hash repository manager
	constructor() public payable {
		// keep the manager reference
		manager = msg.sender;
	}

	// add adds new authentic product data set.
	// Only contract manager is allowed to perform this function.
	function addProduct(
		bytes memory name,
		bytes memory batchNo,
		bytes memory barcodeNo,
		uint expiryDate,
		uint productionDate,
        uint fdaNo,
		bytes memory producerName,
		bytes memory scanLocation,
		bytes memory scanStatus,
		uint scanTime,
		uint scanDate
	) public payable returns (bytes32) {
		// make sure this is the manager
		require(msg.sender == manager, "only managers can add new products");

		// make sure this is a valid product
		require(_isValid(
				name,
				batchNo,
				barcodeNo,
				expiryDate,
				productionDate,
				fdaNo,
				producerName,
				scanLocation,
				scanStatus,
				scanTime,
				scanDate
		));

		// calculate the hash
		bytes32 hash = _hash(name, batchNo, barcodeNo, expiryDate, productionDate, producerName);

		// make sure the product is not already enlisted with the contract
		require(products[hash] == 0, "product already listed");

		// enlist the product
		products[hash] = now;
		emit HashAdded(hash, now);

		// return the hash value
		return hash;
	}

	// auth validates product authenticity for the given product data set
	// using an internal authentic products list. Anybody can authenticate
	// products using this function, no access restrictions are applied.
	function authProduct(
		bytes memory name,
		bytes memory batchNo,
		bytes memory barcodeNo,
		uint expiryDate,
		uint productionDate,
		uint fdaNo,
		bytes memory producerName,
		bytes memory scanLocation,
		bytes memory scanStatus,
		uint scanTime,
		uint scanDate
	) public view returns (bytes32, uint){
		// make sure this is a valid product
		require(_isValid(
				name,
				batchNo,
				barcodeNo,
				expiryDate,
				productionDate,
				fdaNo,
				producerName,
				scanLocation,
				scanStatus,
				scanTime,
				scanDate
			));

		// calculate the hash
		bytes32 hash = _hash(name, batchNo, barcodeNo, expiryDate, productionDate, producerName);

		// return the hash and corresponding time stamp if any
		// return zero (the default mapping value for non-existent mapping) otherwise
		return (hash, products[hash]);
	}

	// _isValid validates the input product record checking
	// for basic requirements it has to meet.
	// We check if:
	//    - hash building fields are all present and non-empty
	//    - production date is in the past
	//    - expiry date is in the future
	//    - all other (non-hashed) fields are present
	function _isValid(
		bytes memory name,
		bytes memory batchNo,
		bytes memory barcodeNo,
		uint expiryDate,
		uint productionDate,
		uint fdaNo,
		bytes memory producerName,
		bytes memory scanLocation,
		bytes memory scanStatus,
		uint scanTime,
		uint scanDate
	) internal view returns (bool) {
		// name must not be empty
		if (0 == name.length) {
			return false;
		}

		// batch no must not be empty
		if (0 == batchNo.length) {
			return false;
		}

		// bar code no must not be empty
		if (0 == barcodeNo.length) {
			return false;
		}

		// bar code no must not be empty
		if (0 == producerName.length) {
			return false;
		}

		// expiration date must be in the future
		if (expiryDate <= now) {
			return false;
		}

		// production date must be in the past
		if (productionDate >= now) {
			return false;
		}

		// --------------------------------------------
		// non-hashed scan elements below this line
		// --------------------------------------------

		// scan location no must not be empty
		if (0 == scanLocation.length) {
			return false;
		}

		// scan status must not be empty
		if (0 == scanStatus.length) {
			return false;
		}

		// FDA number must be non-zero
		if (0 == fdaNo) {
			return false;
		}

		// scan time must be in the past
		if (scanTime > now) {
			return false;
		}

		// scan date must be in the past
		if (scanDate > now) {
			return false;
		}

		return true;
	}

	// _hash calculates the hash of the product used for both
	// the product registration and validation procedures.
	function _hash(
		bytes memory name,
		bytes memory batchNo,
		bytes memory barcodeNo,
		uint expiryDate,
		uint productionDate,
		bytes memory producerName
	) internal pure returns (bytes32) {
		return keccak256(abi.encode(
			name,
			batchNo,
			barcodeNo,
			expiryDate,
			productionDate,
			producerName
		));
	}
}
