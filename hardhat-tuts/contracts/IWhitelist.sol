// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWhitelist {
    // checking if our address are in the whitelist or not
    function whitelistedAddresses(address) external view returns (bool);
}
