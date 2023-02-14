pragma solidity ^0.8.17;

import "./Base.sol";

contract Order is Base {
    address private _admin;
    mapping(bytes32 => Pair) mapPair;
    uint256 private _orderCount = 0;
    mapping(address => mapping(address => bytes32)) mapTokensToPair;
    mapping(bytes32 => Order) mapOrder;
    mapping(uint256 => bytes32) mapIndexOrder;
    mapping(bytes32 => uint256) lockAmount;
    mapping(ORDER_TYPE => uint256) orderCountByType;

    constructor() {
        _admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == _admin);
        _;
    }

    modifier onlyOwner(bytes32 _orderId) {
        Order storage order = mapOrder[_orderId];
        require(order.seller == msg.sender, "Not owner");
        _;
    }

    function lock(address _token, uint256 _amount) public {
        require(
            IERC20(_token).allowance(msg.sender, address(this)) >= _amount,
            "Not allowance"
        );
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    }

    function unlock(
        address _token,
        address _receiver,
        uint256 _amount
    ) public {
        require(
            IERC20(_token).balanceOf(address(this)) >= _amount,
            "Not enough balance"
        );

        IERC20(_token).transfer(_receiver, _amount);
    }

    function _createOrderId() private returns (bytes32) {
        _orderCount++;
        return keccak256(abi.encodePacked(address(this), _orderCount));
    }

    function createPair(address _tokenA, address _tokenB) public onlyAdmin {
        (address token0, address token1) = (_tokenA > _tokenB)
            ? (_tokenA, _tokenB)
            : (_tokenB, _tokenA);

        bytes32 _pairId = keccak256(abi.encodePacked(token0, token1));

        require(mapTokensToPair[token0][token1] != _pairId, "Pair created!");

        Pair storage pair = mapPair[_pairId];
        pair.pair = _pairId;
        pair.token0 = token0;
        pair.token1 = token1;
        mapTokensToPair[token0][token1] = _pairId;
        emit CreatePair(_pairId, token0, token1);
    }

    function getPairByToken(address tokenA, address tokenB)
        public
        view
        returns (Pair memory)
    {
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);

        return Pair(mapTokensToPair[token0][token1], token0, token1);
    }

    function createOrder(
        bytes32 _pair,
        ORDER_TYPE _orderType,
        uint256 _amount,
        uint256 _price
    ) public {
        _createOrder(_pair, _orderType, _amount, _price);
    }

    function _createOrder(
        bytes32 _pair,
        ORDER_TYPE _orderType,
        uint256 _amount,
        uint256 _price
    ) private {
        Pair memory pair = mapPair[_pair];
        require(pair.pair == _pair, "Pair not found!");

        // require(
        //     IERC20(pair.token0).allowance(msg.sender, address(this)) >= _amount,
        //     "Error"
        // );
        require(_price > 0, "Invalid price");
        //lock(pair.token0, _amount);
        bytes32 _orderId = _createOrderId();
        mapIndexOrder[_orderCount] = _orderId;
        orderCountByType[_orderType]++;

        Order storage _order = mapOrder[_orderId];
        _order.orderId = _orderId;
        _order.seller = msg.sender;
        _order.amount0Total = _amount;
        _order.amount0 = 0;
        _order.amount1 = 0;

        _order.price = _price;
        _order.token0 = pair.token0;
        _order.token1 = pair.token1;

        _order.createdTime = block.timestamp;
        _order.status = ORDER_STATUS.PENDING;
        _order.orderType = _orderType;

        emit CreateOrder(
            _order.orderId,
            _order.seller,
            _order.amount0Total,
            _order.amount0,
            _order.amount1,
            _order.price,
            _order.token0,
            _order.token1,
            _order.createdTime,
            _order.status,
            _order.orderType
        );
    }

    function getOrdersByType(ORDER_TYPE _orderType)
        public
        view
        returns (Order[] memory)
    {
        uint256 _count = orderCountByType[_orderType];
        Order[] memory orders = new Order[](_count);
        uint32 index = 0;
        for (uint256 i = 0; i <= _orderCount; i++) {
            bytes32 _orderId = mapIndexOrder[i];
            Order memory order = mapOrder[_orderId];
            // if (order.orderType == _orderType) {
            orders[index] = order;
            index++;
            // }
        }
        return orders;
    }

    function updateOrder(
        bytes32 _orderId,
        uint256 _price,
        uint256 _amount
    ) public {}

    function cancelOrder(bytes32 _orderId) public {}
}
