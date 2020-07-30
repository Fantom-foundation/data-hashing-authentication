// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

// DataHashAuth implements contract for registering authentic
// products hash inside the ledger by hashing their unique attributes
// and validating products authenticity providing the same set of attributes.
contract DataHashAuth {
    // TProduct defines the scanned product information stored inside
    // the contract for future validation.
    struct TProduct {
        bytes32 productHash; // hash of the product data for validation
        string name; // name of the product
        string producer; // name of the product manufacturer
        string batchNo; // production batch number
        string barcode; // barcode of the product
        uint64 produced; // the UTC timestamp of the production date
        uint64 expiration; // the UTC timestamp of the expiration date
        uint64 added; // the time stamp of the product record creation
        uint64 updated; // the time stamp of the last product update
        unit64 invalidated; // the time stamp of the product invalidation
    }

    // manager is the account allowed to register new authentic products
    // to the contract.
    address public _manager;

    // scanners define access to the product registration
    // and editing functionality. Only scanners can manage
    // products pool.
    mapping (address => bool) public _scanners;

    // products represent mapping between authentic product PIN
    // and the product details record held inside the contract.
    mapping(uint256 => TProduct) public _products;

    // ProductAdded event is emitted on new product receival.
    event ProductAdded(uint256 indexed _pin, bytes32 _hash, uint64 _timestamp);

    // ProductUpdated event is emitted on an existing product data change.
    event ProductUpdated(uint256 indexed _pin, bytes32 _hash, uint64 _timestamp);

    // ProductInvalidated event is emitted on marking a product as invalid.
    event ProductInvalidated(uint256 indexed _pin, uint64 _timestamp);

    // constructor initializes new contract instance on deployment
    // the creator will also become the hash repository manager
    constructor() public payable {
        // keep the manager reference
        _manager = msg.sender;

        // manager is the first one allowed to manage products
        _scanners[msg.sender] = true;
    }

    // setProduct adds new authentic product data set, or updates
    // an existing product set in the contract. The PIN is used
    // as an unique identifier of the product, hash is generated
    // to support the product details validation on subsequent checks.
    // Only authenticated scanners are allowed to perform this function.
    function setProduct(
        uint256 _pin,
        string calldata _name,
        string calldata _producerName,
        string calldata _batchNo,
        string calldata _barcodeNo,
        uint64 _productionDate,
        uint64 _expiryDate
    ) external returns (bytes32) {
        // make sure this is autenticated access
        require(_scanners[msg.sender], "access restricted");

        // calculate the hash
        bytes32 _hash = _hashProduct(
            _pin,
            _name,
            _producerName,
            _batchNo,
            _barcodeNo,
            _expiryDate,
            _productionDate);

        // the product PIN is expected to be unique
        bool isNew = (_products[_pin].added == 0);

        // enlist the product in the contract
        TProduct storage inProduct = _products[_pin];
        inProduct.productHash = _hash;
        inProduct.name = _name;
        inProduct.producer = _producerName;
        inProduct.batchNo = _batchNo;
        inProduct.barcode = _barcodeNo;
        inProduct.produced = _productionDate;
        inProduct.expiration = _expiryDate;

        // set the product timestamp record to recognize the action
        // emit the product event based on set status
        if (isNew) {
            // the product didn't exist before and so it's a new one
            inProduct.added = now;
            emit ProductAdded(_pin, _hash, now);
        } else {
            // the product existed before and so it's an update
            inProduct.updated = now;
            emit ProductUpdated(_pin, _hash, now);
        }

        // return the generated hash value
        return _hash;
    }

    // productHashByPin returns a hash of a product identified by the PIN
    // if the product is recognized by the contract, or zero hash for unknown
    // products.
    function productHashByPin(uint256 _pin) external view returns (bytes32) {
        // invalidated products are skipped on this check
        if (_products[_pin].invalidated > 0) {
            return 0x0;
        }
        return _products[_pin].productHash;
    }

    // authProduct validates product authenticity for the given product data set
    // using an internal authentic products list. Anybody can authenticate
    // products using this function, no access restrictions are applied.
    function authProduct(
        uint256 _pin,
        string calldata _name,
        string calldata _producerName,
        string calldata _batchNo,
        string calldata _barcodeNo,
        uint64 _productionDate,
        uint64 _expiryDate
    ) public view returns (bytes32, bool) {
        // calculate the hash
        bytes32 _hash = _hashProduct(
            _pin,
            _name,
            _producerName,
            _batchNo,
            _barcodeNo,
            _expiryDate,
            _productionDate);

        // return the calculated hash and TRUE if the product
        // is authentic, or FALSE for wrong product details
        return (_hash, 0 == _products[_pin].invalidated && _hash == _products[_pin].productHash);
    }

    // invalidate sets the product status to invalid.
    function invalidate(uint256 _pin) external {
        // make sure this is autenticated access
        require(_scanners[msg.sender], "access restricted");

        // make sure the product is known
        require(_products[_pin].added > 0, "unknown product");

        // make the change
        _products[_pin].invalidated = now;

        // emit the event
        emit ProductInvalidated(_pin, now);
    }

    // _hash calculates the hash of the product used for both
    // the product registration and validation procedures.
    function _hashProduct(
        uint256 _pin,
        string calldata _name,
        string calldata _producerName,
        string calldata _batchNo,
        string calldata _barcodeNo,
        uint64 _productionDate,
        uint64 _expiryDate
    ) internal pure returns (bytes32) {
        // calculate the hash from encoded product data pack
        return keccak256(abi.encode(
                _pin,
                _name,
                _batchNo,
                _barcodeNo,
                _expiryDate,
                _productionDate,
                _producerName
            ));
    }
}
