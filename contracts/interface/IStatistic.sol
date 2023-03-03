pragma solidity ^0.8.0;

/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details{}
interface IStatistic {
    function getStatistic() external view returns (uint256 count);
    function store(uint256 count) external returns (uint256);
}
