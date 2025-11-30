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

    // VM detection - matches reference pattern
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

        // Subscribe only on Reactive Network main instance (not in ReactVM)
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

    // Debug events to track execution flow
    event DebugStep(string step, uint256 value1, uint256 value2);
    event DebugData(bytes data, uint256 length);
    event DebugDecodeSuccess(int256 answer, uint256 roundId, uint256 updatedAt);
    event DebugDecodeFailed();
    event DebugCallbackEmitted(uint256 chainId, address destContract, uint64 gasLimit);

    function react(LogRecord calldata log) external override {
        // CRITICAL: Match reference implementation pattern exactly
        // VM check - react() should only run in ReactVM
        require(vm, "ReactiveMirror: VM only");
        
        // Validate source first
        require(log.chain_id == ORIGIN_CHAIN_ID, "ReactiveMirror: wrong chain");
        require(log._contract == originFeed, "ReactiveMirror: wrong feed");
        require(log.topic_0 == TOPIC_0, "ReactiveMirror: wrong event");
        
        // Decode AnswerUpdated event
        // Reference pattern: answer and roundId from topics, updatedAt from data
        // But if topics are 0x0, decode all from data
        int256 answer;
        uint256 roundId;
        uint256 updatedAt;
        
        if (log.topic_1 != 0 && log.topic_2 != 0) {
            // Indexed parameters in topics (reference pattern)
            answer = int256(log.topic_1);
            roundId = log.topic_2;
            require(log.data.length >= 32, "ReactiveMirror: insufficient data");
            updatedAt = abi.decode(log.data, (uint256));
        } else {
            // All non-indexed - decode all from data
            require(log.data.length >= 96, "ReactiveMirror: insufficient data");
            (answer, roundId, updatedAt) = abi.decode(log.data, (int256, uint256, uint256));
        }

        // Encode Payload - match reference pattern exactly
        bytes memory payload = abi.encodeWithSignature(
            "updatePrice(address,bytes32,uint80,int256,uint256,uint256,uint80)",
            address(0), // Will be replaced with rvm_id by Reactive Network
            DOMAIN_SEPARATOR,
            uint80(roundId), 
            answer, 
            updatedAt, // startedAt
            updatedAt, // updatedAt
            uint80(roundId) // answeredInRound
        );

        // Emit Callback - Reactive Network picks this up
        emit Callback(DEST_CHAIN_ID, destContract, CALLBACK_GAS_LIMIT, payload);
    }
    
    // Helper function for decoding (must be external for try-catch)
    function decodeEventData(bytes calldata data) external pure returns (int256, uint256, uint256) {
        return abi.decode(data, (int256, uint256, uint256));
    }
    
    // Helper function for decoding single value (updatedAt from data)
    function decodeSingleValue(bytes calldata data) external pure returns (uint256) {
        return abi.decode(data, (uint256));
    }

    /**
     * @notice Pay function required by IPayer interface
     * @dev Allows System Contract to settle callback debt automatically
     * @dev Called by System Contract (0x0000000000000000000000000000000000fffFfF) when callback results in debt
     * @dev This enables "On-The-Spot Payment" for reactive contracts
     * @dev The System Contract sends funds via this function to settle debt
     */
    function pay() external payable override {
        require(msg.sender == SYSTEM_CONTRACT, "ReactiveMirror: not System Contract");
        // Accept payment from System Contract
        // The System Contract will send funds to settle any outstanding debt
        // This function just needs to accept the payment
    }

    /**
     * @notice Receive function to accept native REACT tokens
     * @dev Allows direct funding of the contract for callback execution
     */
    receive() external payable {}
}