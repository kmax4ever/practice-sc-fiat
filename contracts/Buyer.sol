pragma solidity ^0.8.17;

import "./interface/IBuyer.sol";

contract Buyer is IBuyer {
    uint256 private _totalBuyer;

    function count() external returns (uint256) {
        _totalBuyer++;
    }

    function totalBuyer() public view returns (uint256 tota) {
        tota = _totalBuyer;
    }
}
