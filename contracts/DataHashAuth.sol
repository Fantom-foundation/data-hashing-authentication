// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// DataHashAuth implements contract for registering authentic
// products hash inside the ledger by hashing their unique attributes
// and validating products authenticity providing the same set of attributes.
contract DataHashAuth {
    // TProduct defines the scanned product information stored inside
    // the contract for future validation.
    struct TProduct {
        string name; // name of the product
        string producerName; // name of the product manufacturer
        string batchNo; // production batch number
        string barcodeNo; // barcode of the product
        uint64 productionDate; // the UTC timestamp of the production date
        uint64 expiryDate; // the UTC timestamp of the expiration date
        uint64 added; // the time stamp of the product record creation
        uint64 updated; // the time stamp of the last product update
        uint64 invalidated; // the time stamp of the product invalidation
        bytes32 productHash; // hash of the product data for validation
    }

    // InputProduct defines a structure for product input.
    struct InputProduct {
        uint64 pid; // unique product identifier
        string name; // name of the product
        string producer; // name of the producer
        string batchNo; // batch number
        string barcodeNo; // barcode number
        uint64 productionDate; // timestamp of the production
        uint64 expiryDate; // timestamp of the expiration
    }

    // admin is the account allowed to change contract parameters.
    address public _admin;

    // proManagers are the accounts allowed to add new products
    // and product related data into the contract.
    mapping (address => bool) public _proManagers;

    // products represents mapping between unique product PID
    // and the product details record held inside the contract.
    mapping(uint64 => TProduct) public _products;

    // pinToProductPid represents mapping between authentic product PIN
    // and a unique product identifier, the PID.
    mapping(uint256 => uint64) public _pinToProductPid;

    // ProductAdded event is emitted on new product receival.
    event ProductAdded(uint64 indexed _pid, bytes32 _hash, uint64 _timestamp);

    // ProductUpdated event is emitted on an existing product data change.
    event ProductUpdated(uint64 indexed _pid, bytes32 _hash, uint64 _timestamp);

    // ProductInvalidated event is emitted on marking a product as invalid.
    event ProductInvalidated(uint64 indexed _pid, uint64 _timestamp);

    // PinAdded event is emitted on adding a new PIN to the contract.
    event PinAdded(uint64 indexed _pid, uint256 indexed _pin, uint64 _timestamp);

    // ManagerPromoted event is emitted on adding new authorized scanner.
    event ManagerPromoted(address indexed _addr, uint64 _timestamp);

    // ManagerDemoted event is emitted on removing a scanner from authorized.
    event ManagerDemoted(address indexed _addr, uint64 _timestamp);

    // constructor initializes new contract instance on deployment
    // the creator will also become the hash repository manager
    constructor() public payable {
        // keep the administrator reference
        _admin = msg.sender;

        // administrator is the first one allowed to manage products
        _proManagers[msg.sender] = true;
    }

    // ----------------------------------------------------------------
    // products management
    // ----------------------------------------------------------------

    // setProduct adds or updates a product information
    // from an authorized product manager address in the contract.
    function setProduct(InputProduct calldata _product) external {
        // make sure this is autenticated access
        require(_proManagers[msg.sender], "access restricted");

        // the product PIN is expected to be unique
        bool isNew = (_products[_product.pid].added == 0);

        // calculate the hash
        bytes32 _hash = _hashProduct(
            _product.pid,
            _product.name,
            _product.producer,
            _product.batchNo,
            _product.barcodeNo,
            _product.expiryDate,
            _product.productionDate);

        // enlist the product in the contract (aloc the storage for it)
        TProduct storage inProduct = _products[_product.pid];

        // update the product data
        inProduct.name = _product.name;
        inProduct.producerName = _product.producer;
        inProduct.batchNo = _product.batchNo;
        inProduct.barcodeNo = _product.barcodeNo;
        inProduct.productionDate = _product.productionDate;
        inProduct.expiryDate = _product.expiryDate;
        inProduct.productHash = _hash;

        // set the product timestamp record to recognize the action
        // and emit the appropriate product event
        if (isNew) {
            // the product didn't exist before and so it's a new one
            inProduct.added = uint64(now);
            emit ProductAdded(_product.pid, _hash, uint64(now));
        } else {
            // the product existed before and so it's an update
            inProduct.updated = uint64(now);
            emit ProductUpdated(_product.pid, _hash, uint64(now));
        }
    }

    // invalidate a product identified by it's unique PID id.
    function invalidate(uint64 _pid) external {
        // make sure this is autenticated access
        require(_proManagers[msg.sender], "access restricted");

        // make sure the product is known
        require(_products[_pid].added > 0, "unknown product");

        // make the change
        _products[_pid].invalidated = uint64(now);

        // emit the event
        emit ProductInvalidated(_pid, uint64(now));
    }

    // _hash calculates the hash of the product used for both
    // the product registration and validation procedures.
    function _hashProduct(
        uint64 _pid,
        string memory _name,
        string memory _producerName,
        string memory _batchNo,
        string memory _barcodeNo,
        uint64 _productionDate,
        uint64 _expiryDate
    ) internal pure returns (bytes32) {
        // calculate the hash from encoded product data pack
        return keccak256(abi.encode(
                _pid,
                _name,
                _batchNo,
                _barcodeNo,
                _expiryDate,
                _productionDate,
                _producerName
            ));
    }

    // ----------------------------------------------------------------
    // product PIN management (the PIN is what's printed on QR patches)
    // ----------------------------------------------------------------

    // addPins adds a new set of PINs for the product identified
    // by the unique product PID.
    function addPins(uint64 _pid, uint256[] calldata _pins) external {
        // make sure this is autenticated access
        require(_proManagers[msg.sender], "access restricted");

        // we do not check product existence here since the product may
        // be added later based on client data processing queue.
        for (uint i = 0; i < _pins.length; i++) {
            // make sure this pin is new
            if (0 == _pinToProductPid[_pins[i]]) {
                // add the PIN to PID link
                _pinToProductPid[_pins[i]] = _pid;

                // emit the event
                emit PinAdded(_pid, _pins[i], uint64(now));
            }
        }
    }

    // ckeck validates product authenticity for the given product data set
    // using an internal authentic products list. Anybody can authenticate
    // products using this function, no access restrictions are applied.
    function check(
        uint256 _pin,
        string memory _name,
        string memory _producerName,
        string memory _batchNo,
        string memory _barcodeNo,
        uint64 _productionDate,
        uint64 _expiryDate
    ) public view returns (bool) {
        // do we even know the PIN?
        if (0 == _pinToProductPid[_pin]) {
            return false;
        }

        // get the product PID
        uint64 _pid = _pinToProductPid[_pin];

        // calculate the hash
        bytes32 _hash = _hashProduct(
            _pid,
            _name,
            _producerName,
            _batchNo,
            _barcodeNo,
            _expiryDate,
            _productionDate);

        // compare the product details hash with the stored product details
        // make sure the product has not been invalidated
        return (
            _hash == _products[_pid].productHash &&
            0 == _products[_pid].invalidated
        );
    }

    // ----------------------------------------------------------------
    // contract internals management
    // ----------------------------------------------------------------

    // promote adds a new authorized scanner address
    // into the contract.
    function promote(address _addr) external {
        // only manager can authorize
        require(msg.sender == _admin, "access restricted");

        // authorize the address and inform listeners
        _proManagers[_addr] = true;
        emit ManagerPromoted(_addr, uint64(now));
    }

    // demote removes the specified address
    // from authorized scanners.
    function demote(address _addr) external {
        // only manager can authorize
        require(msg.sender == _admin, "access restricted");

        // authorize the address
        _proManagers[_addr] = false;
        emit ManagerDemoted(_addr, uint64(now));
    }
}
