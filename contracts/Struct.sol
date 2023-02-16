pragma solidity ^0.8.17;

contract Struct {
    enum DEAL_STATUS {
        PENDING,
        FILL,
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

    struct Order {
        bytes32 orderId;
        address owner;
        uint256 amount0Total;
        uint256 amount1Total;
        uint256 amount0;
        uint256 amount1;
        uint256 price;
        address token0;
        address token1;
        uint256 createdTime;
        ORDER_STATUS status;
        ORDER_TYPE orderType;
    }

    struct Pair {
        bytes32 pair;
        address token0;
        address token1;
    }

    enum ORDER_STATUS {
        PENDING,
        FILL,
        CANCEL
    }

    enum ORDER_TYPE {
        BUY,
        SELL
    }
}
