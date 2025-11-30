// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IReactive.sol";

contract ReactiveMirror is IReactive {
    address public constant SYSTEM_CONTRACT = 0x0000000000000000000000000000000000fffFfF;
    uint256 public constant REACTIVE_IGNORE = 0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad;

    uint256 public constant ORIGIN_CHAIN_ID = 80002;
    address public immutable originFeed; 

    uint256 public constant DEST_CHAIN_ID = 11155111;
    address public immutable destContract;

    uint256 public constant TOPIC_0 = 0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;
    bytes32 public constant DOMAIN_SEPARATOR = keccak256("REACTIVE_ORACLE_V1");
    uint64 public constant CALLBACK_GAS_LIMIT = 500000;

    bool private vm;
    
    function _detectVm() private view returns (bool) {
        uint256 size;
        assembly { 
            size := extcodesize(SYSTEM_CONTRACT) 
        }
        return size == 0;
    }

    constructor(address _originFeed, address _destContract, address _systemContract) {
        require(_originFeed != address(0), "Invalid origin feed");
        require(_destContract != address(0), "Invalid dest contract");
        
        originFeed = _originFeed;
        destContract = _destContract;
        
        address systemContract = _systemContract == address(0) ? SYSTEM_CONTRACT : _systemContract;
        vm = _detectVm();

        if (!vm) {
            try ISystemContract(systemContract).subscribe(
                ORIGIN_CHAIN_ID,
                originFeed,
                TOPIC_0,
                REACTIVE_IGNORE, 
                REACTIVE_IGNORE, 
                REACTIVE_IGNORE 
            ) {} catch {}
        }
    }

    function react(LogRecord calldata log) external override {
        require(vm, "ReactiveMirror: VM only");
        require(log.chain_id == ORIGIN_CHAIN_ID, "ReactiveMirror: wrong chain");
        require(log._contract == originFeed, "ReactiveMirror: wrong feed");
        require(log.topic_0 == TOPIC_0, "ReactiveMirror: wrong event");
        
        int256 answer;
        uint256 roundId;
        uint256 updatedAt;
        
        if (log.topic_1 != 0 && log.topic_2 != 0) {
            answer = int256(log.topic_1);
            roundId = log.topic_2;
            require(log.data.length >= 32, "ReactiveMirror: insufficient data");
            updatedAt = abi.decode(log.data, (uint256));
        } else {
            require(log.data.length >= 96, "ReactiveMirror: insufficient data");
            (answer, roundId, updatedAt) = abi.decode(log.data, (int256, uint256, uint256));
        }

        bytes memory payload = abi.encodeWithSignature(
            "updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)",
            address(0),
            DOMAIN_SEPARATOR,
            uint80(roundId), 
            answer, 
            updatedAt,
            updatedAt,
            uint80(roundId)
        );

        emit Callback(DEST_CHAIN_ID, destContract, CALLBACK_GAS_LIMIT, payload);
    }

    function pay() external payable override {
        require(msg.sender == SYSTEM_CONTRACT, "ReactiveMirror: not System Contract");
    }

    receive() external payable {}
}