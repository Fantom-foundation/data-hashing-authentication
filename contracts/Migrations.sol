pragma solidity >=0.4.25 <0.7.0;

// Migrations implements migration contract base.
contract Migrations {
  // owner keeps contract manager reference
  address public owner;

  // last_completed_migration keeps reference to the last deplyment
  uint public last_completed_migration;

  // restricted implements modifier for access restricted to manager only
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  // constructor initiates the contract
  constructor() public {
    owner = msg.sender;
  }

  // setCompleted updates the migration status
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}
