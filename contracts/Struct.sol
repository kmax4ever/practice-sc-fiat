pragma solidity ^0.8.17;

contract Struct {
    enum DEAL_STATUS {
        PENDING,
        FULLFILL,
        CANCEL
    }

    address constant ZERO_ADDRESS = address(0x0);

    struct Deal {
        bytes32 dealId;
        address seller;
        address buyer;
        uint256 amount0Total;
        uint256 amount1Total;
        uint256 amount0;
        uint256 amount1;
        address token0;
        address token1;
        uint256 createdTime;
        uint256 expireTime;
        DEAL_STATUS status;
    }

  
}
