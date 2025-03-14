pragma solidity ^0.8.17;

import "./Base.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Order is Base {
    using SafeMath for uint256;
    address private _admin;
    mapping(bytes32 => Pair) mapPair;
    uint256 private _orderCount = 0;
    mapping(address => mapping(address => bytes32)) mapTokensToPair;
    mapping(bytes32 => Order) mapOrder;
    mapping(uint256 => bytes32) mapIndexOrder;
    mapping(bytes32 => uint256) lockAmount;
    mapping(ORDER_TYPE => uint256) orderCountByType;
    mapping(ORDER_TYPE => mapping(uint256 => uint256)) countOrderByTypeAndPrice;

    mapping(ORDER_TYPE => uint256) countOrderByType;
    mapping(ORDER_TYPE => mapping(uint256 => bytes32)) mapIndexOrderByTypeAndPrice;

    uint256 matchCount;
    mapping(uint256 => MatchOrder) mapMatchOrder;

    struct Test {
        address owner;
        uint256 number;
    }

    constructor() {
        _admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == _admin);
        _;
    }

    modifier onlyOwner(bytes32 _orderId) {
        Order storage order = mapOrder[_orderId];
        require(order.owner == msg.sender, "Not owner");
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
        (address token0, address token1) = _tokenA < _tokenB
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

        bytes32 _pairId = mapTokensToPair[token0][token1];
        Pair memory pair = mapPair[_pairId];

        return pair;
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

        require(
            IERC20(pair.token0).allowance(msg.sender, address(this)) >= _amount,
            "Error"
        );
        require(_price > 0, "Invalid price");

        lock(
            (_orderType == ORDER_TYPE.BUY) ? pair.token0 : pair.token1,
            _amount
        );

        bytes32 _orderId = _createOrderId();
        mapIndexOrder[_orderCount] = _orderId;

        IStatistic(address(this)).store(_orderCount);

        if (_orderType == ORDER_TYPE.BUY) {
            IBuyer(address(this)).count();
        }

        orderCountByType[_orderType]++;
        mapIndexOrderByTypeAndPrice[_orderType][
            countOrderByTypeAndPrice[_orderType][_price]
        ] = _orderId;

        countOrderByTypeAndPrice[_orderType][_price]++;

        Order storage _order = mapOrder[_orderId];
        _order.orderId = _orderId;
        _order.owner = msg.sender;
        _order.amount0Total = _orderType == ORDER_TYPE.BUY ? _amount : 0;
        _order.amount1Total = _orderType == ORDER_TYPE.SELL ? _amount : 0;
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
            _order.owner,
            _order.amount0Total,
            _order.amount1Total,
            _order.amount0,
            _order.amount1,
            _order.price,
            _order.token0,
            _order.token1,
            _order.createdTime,
            _order.status,
            _order.orderType
        );
        _handleMatchOrder(_order);
    }

    function getOrdersByType(ORDER_TYPE _orderType)
        public
        view
        returns (Order[] memory)
    {
        Order[] memory orders = new Order[](orderCountByType[_orderType]);
        uint32 index = 0;
        for (uint256 i = 1; i <= _orderCount; i++) {
            // init i=1 because _orderCount fisrt create _orderCount++ =1
            bytes32 _orderId = mapIndexOrder[i];
            if (mapOrder[_orderId].orderType == _orderType) {
                orders[index] = mapOrder[_orderId];
                index++;
            }
        }
        return orders;
    }

    function getOrders() public view returns (Order[] memory) {
        Order[] memory orders = new Order[](_orderCount);
        uint32 index = 0;
        for (uint256 i = _orderCount; i >= 1; i--) {
            // init i=_orderCount because _orderCount++  before mapIndexOrder[_orderCount] , at func _createOrderId
            bytes32 _orderId = mapIndexOrder[i];
            Order memory order = mapOrder[_orderId];
            orders[index] = order;
            index++;
        }
        return orders;
    }

    function getOrdersSort() public view returns (Order[] memory) {}

    function updateOrder(
        bytes32 _orderId,
        uint256 _price,
        uint256 _amount
    ) public {}

    function cancelOrder(bytes32 _orderId) public onlyOwner(_orderId) {
        _cancelOrder(_orderId);
    }

    function _cancelOrder(bytes32 _orderId) private {
        require(mapOrder[_orderId].orderId == _orderId, "order not found!");
        Order storage _order = mapOrder[_orderId];
        require(_order.status != ORDER_STATUS.CANCEL, "order status invalid");

        if (_order.orderType == ORDER_TYPE.BUY) {
            require(_order.amount0Total > _order.amount0, " order full fill");
        } else {
            require(_order.amount1Total > _order.amount1, " order full fill");
        }

        bool cond = _order.orderType == ORDER_TYPE.BUY;

        address token = cond ? _order.token0 : _order.token1;

        uint256 _amountCanUnlock = cond
            ? _order.amount0Total - _order.amount0
            : _order.amount1Total - _order.amount1;

        require(
            IERC20(token).balanceOf(address(this)) >= _amountCanUnlock,
            "not enough contract balance"
        );

        unlock(token, msg.sender, _amountCanUnlock);
        _order.status = ORDER_STATUS.CANCEL;

        emit CancelOrder(
            _order.orderId,
            _order.owner,
            _order.amount0Total,
            _order.amount1Total,
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

    function getOrderById(bytes32 _orderId) public view returns (Order memory) {
        Order memory order = mapOrder[_orderId];
        return order;
    }

    function _handleMatchOrder(Order storage currentOrder) private {
        console.log("************* _handleMatchOrder ************* ");
        console.log("");
        ORDER_TYPE _findType = currentOrder.orderType == ORDER_TYPE.BUY
            ? ORDER_TYPE.SELL
            : ORDER_TYPE.BUY;

        uint256 _price = currentOrder.price;
        if (countOrderByTypeAndPrice[_findType][currentOrder.price] == 0) {
            return;
        }

        bool isBuyOrder = currentOrder.orderType == ORDER_TYPE.BUY;
        for (
            uint256 i = 0;
            i < countOrderByTypeAndPrice[_findType][_price];
            i++
        ) {
            bytes32 _orderIdMatch = mapIndexOrderByTypeAndPrice[_findType][i];
            Order storage _orderMatch = mapOrder[_orderIdMatch];

            console.log("xxx _price", _price);
            //   console.log("_orderMatch", _orderMatch);
            require(
                currentOrder.orderId != _orderMatch.orderId,
                "Error orderId"
            );

            if (
                (_findType == ORDER_TYPE.BUY &&
                    _orderMatch.amount0Total == _orderMatch.amount0) ||
                (_findType == ORDER_TYPE.SELL &&
                    _orderMatch.amount1Total == _orderMatch.amount1)
            ) {
                console.log("order full fill, return.");
                continue;
            }

            uint256 _amount0;
            uint256 _amount1;

            if (isBuyOrder) {
                uint256 _amount0Exists = currentOrder.amount0Total.sub(
                    currentOrder.amount0
                );

                uint256 _amount1Exists = _orderMatch.amount1Total.sub(
                    _orderMatch.amount1
                );

                uint256 _amount1Need = _amount0Exists.mul(_price);

                _amount1 = (_amount1Need > _amount1Exists)
                    ? _amount1Exists
                    : (_amount1Need == _amount1Exists)
                    ? _amount1Exists
                    : (_amount1Need);

                _amount0 = _amount1.div(_price);

                console.log("_amount1Need", _amount1Need);
                console.log("_amount0Exists", _amount0Exists);

                console.log("_amount1Exists", _amount1Exists);
                console.log(
                    "currentOrder.amount1Total",
                    currentOrder.amount1Total
                );
                console.log("_amount0", _amount0);
                console.log("_amount1", _amount1);

                require(
                    currentOrder.amount0Total.sub(currentOrder.amount0) >=
                        _amount0,
                    "invalid _amount0"
                );
            } else {
                uint256 _amount0Exists = _orderMatch.amount0Total.sub(
                    _orderMatch.amount0
                );

                uint256 _amount1Exists = currentOrder.amount1Total.sub(
                    currentOrder.amount1
                );

                uint256 _amount0Need = _amount1Exists.div(_price);

                _amount0 = (_amount0Need > _amount0Exists)
                    ? _amount0Exists
                    : _amount0Exists == _amount0Need
                    ? _amount0Exists
                    : _amount0Need;

                _amount1 = _amount0.mul(_price);
                console.log("_amount0Need", _amount0Exists);
                console.log("_amount0Exists", _amount0Exists);

                console.log("_amount1Exists", _amount1Exists);
                console.log(
                    "currentOrder.amount1Total",
                    currentOrder.amount1Total
                );
                console.log("_amount0", _amount0);
                console.log("_amount1", _amount1);

                require(
                    currentOrder.amount1Total >= _amount1,
                    "invalid _amount1"
                );
            }
            require(
                IERC20(_orderMatch.token0).balanceOf(address(this)) >= _amount0,
                "not enough balance"
            );
            require(
                IERC20(_orderMatch.token1).balanceOf(address(this)) >= _amount1,
                "not enough balance"
            );

            currentOrder.amount0 = currentOrder.amount0.add(_amount0);
            currentOrder.amount1 = currentOrder.amount1.add(_amount1);
            currentOrder.status = ORDER_STATUS.FILL;

            _orderMatch.amount0 = _orderMatch.amount0.add(_amount0);
            _orderMatch.amount1 = _orderMatch.amount1.add(_amount1);
            _orderMatch.status = ORDER_STATUS.FILL;

            unlock(_orderMatch.token0, msg.sender, _amount0); //transfer buyer
            unlock(_orderMatch.token1, currentOrder.owner, _amount1); //transfer seller

            // (bytes32 orderSellId, bytes32 orderBuyId) = isBuyOrder
            //     ? (currentOrder.orderId, _orderMatch.orderId)
            //     : (_orderMatch.orderId, currentOrder.orderId);

            // (address seller, address buyer) = isBuyOrder
            //     ? (currentOrder.owner, _orderMatch.owner)
            //     : (_orderMatch.owner, currentOrder.owner);

            // emit Match(
            //     orderSellId,
            //     orderBuyId,
            //     seller,
            //     buyer,
            //     _amount0,
            //     _amount1,
            //     block.timestamp
            // );

            MatchOrder storage matchOrder = mapMatchOrder[matchCount];
            matchCount++;
            (matchOrder.orderSellId, matchOrder.orderBuyId) = isBuyOrder
                ? (currentOrder.orderId, _orderMatch.orderId)
                : (_orderMatch.orderId, currentOrder.orderId);

            (matchOrder.seller, matchOrder.buyer) = isBuyOrder
                ? (currentOrder.owner, _orderMatch.owner)
                : (_orderMatch.owner, currentOrder.owner);

            (
                matchOrder.amount0,
                matchOrder.amount1,
                matchOrder.price,
                matchOrder.time
            ) = (_amount0, _amount1, _price, block.timestamp);
        }
    }

    function getMatchs() public view returns (MatchOrder[] memory) {
        MatchOrder[] memory matchs = new MatchOrder[](matchCount);
        uint256 index = 0;
        for (uint256 i = matchCount - 1; i >= 0; i--) {
            matchs[index] = mapMatchOrder[i];
            index++;
            if (i == 0) {
                break;
            }
        }
        return matchs;
    }

    function testStructParam(Test memory _query)
        public
        view
        returns (Test memory result)
    {
        result.owner = _query.owner;
        result.number = _query.number;

        // return result;
    }

    function totalOrder() public view returns (uint256) {
        return IStatistic(address(this)).getStatistic();
    }

    function buyerCount() public view returns (uint256) {
        return IBuyer(address(this)).totalBuyer();
    }
}
