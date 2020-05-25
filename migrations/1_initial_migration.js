const Migrations = artifacts.require("Migrations");

// this will deploy the Migrations contract
module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
