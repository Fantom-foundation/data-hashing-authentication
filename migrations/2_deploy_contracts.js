const DataHashAuth = artifacts.require("DataHashAuth");

// This will deploy the actual contract code
module.exports = function(deployer) {
  deployer.deploy(DataHashAuth);
};
