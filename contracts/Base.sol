pragma solidity ^0.8.17;
import "./Struct.sol";
import "./Index.sol";
import "./ERC20Basic.sol";
import "./Event.sol";
import "./Statistic.sol";
import "./Buyer.sol";

contract Base is Struct, Index, ERC20Basic, Event, Statistic ,Buyer{}
