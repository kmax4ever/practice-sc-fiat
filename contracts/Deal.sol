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
        IERC20 token,
        address _sender,
        address _reciver,
        uint256 _amount0
    ) public payable {
        require(
            token.allowance(msg.sender, address(this)) >= _amount0,
            "Error"
        );
        token.transferFrom(msg.sender, address(this), _amount0);
    }

    function createDeal(
        bytes32 pair,
        uint256 amount0,
        uint256 amount1,
        uint256 expireTime
    ) public payable {
        // requied pair exists
        require(mapPair[pair].pair == pair, "pair not exit");
        PairInfo memory pairData = mapPair[pair];

        IERC20 tokenA = IERC20(pairData.token0);
        require(amount0 < tokenA.balanceOf(msg.sender), "invalid amount");

        // require(
        //     tokenA.allowance(msg.sender, address(this)) >= amount0,
        //     "Error"
        // );
        // tokenA.transferFrom(msg.sender, address(this), amount0);
        deposit(tokenA, msg.sender, address(this), amount0);
        require(expireTime > block.timestamp, "invalid time");

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

    function getDealActive(address _owner) public view returns (Deal[] memory) {
        return mapDealToSeller[_owner];
    }
}
