pragma solidity ^0.8.17;
import "./Struct.sol";
import "./Index.sol";
import "./ERC20Basic.sol";
import "./Event.sol";
contract Base is Struct, Index, ERC20Basic, Event {}
