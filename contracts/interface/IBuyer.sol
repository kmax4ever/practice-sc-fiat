pragma solidity ^0.8.0;

interface IBuyer {
    function count() external returns(uint256);
    function totalBuyer() external view returns (uint256);
}
