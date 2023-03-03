pragma solidity ^0.8.0;

import "./interface/IStatistic.sol";

contract Statistic is IStatistic {
    uint256 private _totalOrder;

    function getStatistic() external view returns (uint256 totalOrder) {
        totalOrder = _totalOrder;
    }

    function store(uint256 _count) external returns (uint256) {
        _totalOrder = _count;
    }
}
