// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockFeed is AggregatorV3Interface {
    event AnswerUpdated(int256 current, uint256 roundId, uint256 updatedAt);

    uint8 public constant override decimals = 8;
    string public constant override description = "Mock BTC/USD";
    uint256 public constant override version = 1;

    uint80 public roundId;
    int256 public answer;
    uint256 public startedAt;
    uint256 public updatedAt;
    uint80 public answeredInRound;

    constructor(int256 _initialPrice) {
        roundId = 1;
        answer = _initialPrice;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
        answeredInRound = 1;
    }

    function updatePrice(int256 _newPrice) external {
        roundId++;
        answer = _newPrice;
        startedAt = updatedAt;
        updatedAt = block.timestamp;
        answeredInRound = roundId;
        emit AnswerUpdated(answer, roundId, updatedAt);
    }

    function getRoundData(uint80 _roundId) external view override returns (uint80, int256, uint256, uint256, uint80) {
        require(_roundId == roundId, "Round not found");
        return (roundId, answer, startedAt, updatedAt, answeredInRound);
    }

    function latestRoundData() external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (roundId, answer, startedAt, updatedAt, answeredInRound);
    }
}