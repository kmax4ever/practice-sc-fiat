pragma solidity ^0.8.17;
import "./Base.sol";

contract Deal is Base {
    event CreateDeal(
        bytes32 dealId,
        address seller,
        address buyer,
        uint256 amount0Total,
        uint256 amount1Total,
        uint256 amount0,
        uint256 amount1,
        address token0,
        address token1,
        uint256 createdTime,
        uint256 expireTime,
        DEAL_STATUS status
    );

    event CancelDeal(
        bytes32 dealId,
        address seller,
        address buyer,
        uint256 amount0Total,
        uint256 amount1Total,
        uint256 amount0,
        uint256 amount1,
        address token0,
        address token1,
        uint256 createdTime,
        uint256 expireTime,
        DEAL_STATUS status
    );

    event CreatePair(bytes32 pair, address token0, address token1);

    struct Token {
        address tokenO;
        address token1;
    }

    struct PairInfo {
        bytes32 pair;
        address token0;
        address token1;
    }
    PairInfo[] pairs;
    mapping(bytes32 => address) mapDealToBuyer;
    mapping(address => mapping(address => bytes32)) mapTokensToPair;
    mapping(bytes32 => PairInfo) mapPair;
    mapping(bytes32 => Deal) private mapDeal;
    mapping(address => uint256) private dealOwnerCount;
    mapping(address => Deal[]) private mapDealToSeller;
    mapping(bytes32 => address) private mapOwnerDeal;
    uint256 fee = 0.01 ether;

    function _createPair(address tokenA, address tokenB) private {
        require(tokenA != tokenB, "token not same address!");

        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);

        bytes32 pair = keccak256(abi.encode(token0, token1));
        require(mapTokensToPair[token0][token1] != pair, "pair created");

        mapPair[pair] = PairInfo(pair, token0, token1);
        mapTokensToPair[token0][token1] = pair;
        pairs.push(PairInfo(pair, token0, token1));
        emit CreatePair(pair, token0, token1);
    }

    function createPair(address _tokenA, address _tokenB) public {
        _createPair(_tokenA, _tokenB);
    }

    function setFee(uint256 _newFee) public {
        fee = _newFee;
    }

    // function _sort(address _tokenA, address _tokenB)
    //     private
    //     view
    //     returns (Token memory)
    // {
    //     (address token0, address token1) = _tokenA < _tokenB
    //         ? (_tokenA, _tokenB)
    //         : (_tokenB, _tokenA);

    //     return Token(token0, token1);
    // }

    function getAllPairs() public view returns (PairInfo[] memory) {
        return pairs;
    }

    function getPairByToken(address tokenA, address tokenB)
        public
        view
        returns (PairInfo memory)
    {
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);

        return PairInfo(mapTokensToPair[token0][token1], token0, token1);
    }

    function deposit(
        address token,
        address _sender,
        uint256 _amount
    ) public payable {
        require(
            IERC20(token).allowance(_sender, address(this)) >= _amount,
            "Error"
        );
        IERC20(token).transferFrom(_sender, address(this), _amount);
    }

    function withdraw(
        address token,
        address _receiver,
        uint256 _amount
    ) public payable {
        require(IERC20(token).balanceOf(address(this)) >= _amount, "Error");
        IERC20(token).transfer(_receiver, _amount);
    }

    function createDeal(
        bytes32 pair,
        uint256 amount0,
        uint256 amount1,
        uint256 expireTime
    ) public payable {
        require(mapPair[pair].pair == pair, "pair not exit");
        PairInfo memory pairData = mapPair[pair];

        //IERC20 tokenA = IERC20(pairData.token0);
        require(
            amount0 < IERC20(pairData.token0).balanceOf(msg.sender),
            "invalid amount"
        );
        require(
            IERC20(pairData.token0).allowance(msg.sender, address(this)) >=
                amount0,
            "Error"
        );
        require(expireTime > block.timestamp, "invalid time");
        require(msg.value >= fee, "fee < vallue");
        _createDeal(pair, amount0, amount1, expireTime);
        deposit(pairData.token0, msg.sender, amount0);
    }

    function _createDeal(
        bytes32 pair,
        uint256 amount0,
        uint256 amount1,
        uint256 expireTime
    ) private {
        PairInfo memory pairData = mapPair[pair];

        bytes32 _dealId = createDealId();

        Deal storage deal = mapDeal[_dealId];
        deal.dealId = _dealId;
        deal.amount0 = amount0;
        deal.amount1 = amount1;
        deal.amount0Total = amount0;
        deal.amount1Total = amount1;
        deal.token0 = pairData.token0;
        deal.token1 = pairData.token1;
        deal.status = DEAL_STATUS.PENDING;
        deal.expireTime = expireTime;
        deal.createdTime = block.timestamp;
        deal.seller = msg.sender;
        deal.buyer = ZERO_ADDRESS;

        dealOwnerCount[msg.sender]++;
        mapDealToSeller[msg.sender].push(deal);
        mapOwnerDeal[_dealId] = msg.sender;
        emit CreateDeal(
            deal.dealId,
            deal.seller,
            deal.buyer,
            deal.amount0Total,
            deal.amount1Total,
            deal.amount0,
            deal.amount1,
            deal.token0,
            deal.token1,
            deal.createdTime,
            deal.expireTime,
            deal.status
        );
    }

    function cancelDeal(bytes32 _dealId) public payable {
        _cancelDeal(_dealId);
        payable(msg.sender).transfer(fee); //send ether to msg.sender
    }

    function _cancelDeal(bytes32 _dealId) private {
        require(mapDeal[_dealId].dealId == _dealId, "Deal not exists");
        Deal storage deal = mapDeal[_dealId];
        require(deal.seller == msg.sender, "not owner");
        require(deal.status == DEAL_STATUS.PENDING, "deal status not pending");
        deal.status = DEAL_STATUS.CANCEL;
        deal.expireTime = 0;
        emit CancelDeal(
            deal.dealId,
            deal.seller,
            deal.buyer,
            deal.amount0Total,
            deal.amount1Total,
            deal.amount0,
            deal.amount1,
            deal.token0,
            deal.token1,
            deal.createdTime,
            deal.expireTime,
            deal.status
        );
        withdraw(deal.token0, msg.sender, deal.amount0);
    }

    function getDealActive(address _owner) public view returns (Deal[] memory) {
        return mapDealToSeller[_owner];
    }

    function getDeal(bytes32 _dealId) public view returns (Deal memory) {
        return mapDeal[_dealId];
    }
}
