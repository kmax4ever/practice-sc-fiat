pragma solidity ^0.8.17;
import "./Struct.sol";

contract Event is Struct {
    event CreateOrder(
        bytes32 orderId,
        address owner,
        uint256 amount0Total,
        uint256 amount1Total,
        uint256 amount0,
        uint256 amount1,
        uint256 price,
        address token0,
        address token1,
        uint256 createdTime,
        ORDER_STATUS status,
        ORDER_TYPE orderType
    );
    // price : token0Price

    event CancelOrder(
        bytes32 orderId,
        address owner,
        uint256 amount0Total,
        uint256 amount1Total,
        uint256 amount0,
        uint256 amount1,
        uint256 price,
        address token0,
        address token1,
        uint256 createdTime,
        ORDER_STATUS status,
        ORDER_TYPE orderType
    );

    event Match(
        bytes32 orderSellId,
        bytes32 orderBuyId,
        address seller,
        address buyer,
        uint256 amount0,
        uint256 amount1,
        int256 price,
        uint256 time
    );

    event CreatePair(bytes32 pairId, address token0, address token1);
}
