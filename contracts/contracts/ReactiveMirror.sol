// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IReactive.sol";

contract ReactiveMirror is IReactive {
    address public constant SYSTEM_CONTRACT = 0x0000000000000000000000000000000000fffFfF;
    uint256 public constant REACTIVE_IGNORE = 0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad;

    // --- CONFIGURATION ---
    // Origin: Polygon Amoy (ID: 80002)
    uint256 public constant ORIGIN_CHAIN_ID = 80002;
    // UPDATE THIS CONSTANT AFTER DEPLOYING MOCKFEED ON AMOY:
    address public immutable originFeed; 

    // Destination: Sepolia (ID: 11155111)
    uint256 public constant DEST_CHAIN_ID = 11155111;
    // Destination Contract (FeedProxy on Sepolia)
    address public immutable destContract;

    // Topic 0: AnswerUpdated(int256,uint256,uint256)
    uint256 public constant TOPIC_0 = 0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;
    bytes32 public constant DOMAIN_SEPARATOR = keccak256("REACTIVE_ORACLE_V1");
    uint64 public constant CALLBACK_GAS_LIMIT = 500000;

    constructor(address _originFeed, address _destContract, address _systemContract) {
        require(_originFeed != address(0), "Invalid origin feed");
        require(_destContract != address(0), "Invalid dest contract");
        
        originFeed = _originFeed;
        destContract = _destContract;
        
        address systemContract = _systemContract == address(0) ? SYSTEM_CONTRACT : _systemContract;

        ISystemContract(systemContract).subscribe(
            ORIGIN_CHAIN_ID,
            originFeed,
            TOPIC_0,
            REACTIVE_IGNORE, 
            REACTIVE_IGNORE, 
            REACTIVE_IGNORE 
        );
    }

    function react(LogRecord calldata log) external override {
        // 1. Verify Source
        if (log.chain_id != ORIGIN_CHAIN_ID || log._contract != originFeed || log.topic_0 != TOPIC_0) {
            return;
        }

        // 2. Decode Data
        int256 answer = int256(log.topic_1);
        uint256 roundId = log.topic_2;
        if (log.data.length < 32) return;
        uint256 updatedAt = abi.decode(log.data, (uint256));

        // 3. Encode Payload
        // Note: address(0) is replaced by RVM ID by the network
        bytes memory payload = abi.encodeWithSignature(
            "updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)",
            address(0), 
            DOMAIN_SEPARATOR,
            uint80(roundId), 
            answer, 
            updatedAt, // startedAt
            updatedAt, // updatedAt
            uint80(roundId) // answeredInRound
        );

        // 4. Trigger Cross-Chain Action
        emit Callback(DEST_CHAIN_ID, destContract, CALLBACK_GAS_LIMIT, payload);
    }
}