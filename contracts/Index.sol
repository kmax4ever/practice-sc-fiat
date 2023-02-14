pragma solidity ^0.8.17;

contract Index {
    uint256 private _dealCount = 0;
    mapping(address => uint256) private _userNonce;

    function nextUserNonce(address _user) public {
        _userNonce[_user]++;
    }

    function getUserNonce(address _user) public view returns (uint256) {
        return _userNonce[_user];
    }

    function createDealId() public returns (bytes32) {
        _dealCount++;
        return keccak256(abi.encode(_dealCount));
    }
}
