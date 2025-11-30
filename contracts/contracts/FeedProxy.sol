// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./IReactive.sol";

contract FeedProxy is AggregatorV3Interface, IPayer {
    // OFFICIAL SEPOLIA CALLBACK PROXY
    address public constant CALLBACK_PROXY = 0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA;

    bytes32 public constant DOMAIN_SEPARATOR = keccak256("REACTIVE_ORACLE_V1");
    address public immutable reactiveVmId;

    event PriceUpdated(uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);

    struct RoundData {
        uint80 roundId;
        int256 answer;
        uint256 startedAt;
        uint256 updatedAt;
        uint80 answeredInRound;
    }

    RoundData public latestRound;
    uint8 public constant override decimals = 8;
    string public constant override description = "BTC/USD (Reactive Mirror)";
    uint256 public constant override version = 1;

    modifier onlyReactive() {
        require(msg.sender == CALLBACK_PROXY, "FeedProxy: not Reactive proxy");
        _;
    }

    constructor(address _reactiveVmId) {
        require(_reactiveVmId != address(0), "FeedProxy: invalid RVM ID");
        reactiveVmId = _reactiveVmId;
        latestRound.startedAt = block.timestamp;
    }

    function updatePrice(
        address sender,
        bytes32 _domainSeparator,
        uint80 _roundId,
        int256 _answer,
        uint256 _startedAt,
        uint256 _updatedAt,
        uint80 _answeredInRound
    ) external onlyReactive {
        require(sender == reactiveVmId, "FeedProxy: unauthorized sender");
        require(_domainSeparator == DOMAIN_SEPARATOR, "FeedProxy: invalid domain separator");
        require(_updatedAt > latestRound.updatedAt, "FeedProxy: stale price");

        latestRound = RoundData({
            roundId: _roundId,
            answer: _answer,
            startedAt: _startedAt,
            updatedAt: _updatedAt,
            answeredInRound: _answeredInRound
        });

        emit PriceUpdated(_roundId, _answer, _startedAt, _updatedAt, _answeredInRound);
    }

    // Standard Getters
    function getRoundData(uint80 _roundId) external view override returns (uint80, int256, uint256, uint256, uint80) {
        require(_roundId == latestRound.roundId, "FeedProxy: round not found");
        return (latestRound.roundId, latestRound.answer, latestRound.startedAt, latestRound.updatedAt, latestRound.answeredInRound);
    }

    function latestRoundData() external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (latestRound.roundId, latestRound.answer, latestRound.startedAt, latestRound.updatedAt, latestRound.answeredInRound);
    }

    function pay() external payable override {
        require(msg.sender == CALLBACK_PROXY, "FeedProxy: not Reactive proxy");
    }

    receive() external payable {}
}







