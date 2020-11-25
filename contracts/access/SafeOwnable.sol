// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import './Ownable.sol';
import './LibSafeOwnable.sol';

contract SafeOwnable is Ownable {
  modifier onlyNomineeOwner () {
    require(msg.sender == nomineeOwner(), 'SafeOwnable: sender must be nominee owner');
    _;
  }

  function nomineeOwner () virtual public view returns (address) {
    return LibSafeOwnable.layout().nomineeOwner;
  }

  function transferOwnership (address account) virtual override external onlyOwner {
    LibSafeOwnable.layout().nomineeOwner = account;
  }

  function acceptOwnership () virtual external onlyNomineeOwner {
    emit OwnershipTransferred(owner(), msg.sender);
    LibOwnable.layout().owner = msg.sender;
    LibSafeOwnable.layout().nomineeOwner = address(0);
  }
}
