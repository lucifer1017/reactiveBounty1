// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

/**
 * @title IPayer
 * @notice Interface for contracts that need to pay Reactive Network callback fees
 */
interface IPayer {
    function pay() external payable;
}

/**
 * @title IReactive
 * @notice Interface for Reactive Network contracts that react to cross-chain events
 * @dev According to Reactive Network docs: "interface IReactive is IPayer"
 */
interface IReactive is IPayer {
    /**
     * @notice Log record structure representing an event from a source chain
     * @dev Must match the Reactive Network specification exactly
     */
    struct LogRecord {
        uint256 chain_id;
        address _contract;
        uint256 topic_0;
        uint256 topic_1;
        uint256 topic_2;
        uint256 topic_3;
        bytes data;
        uint256 block_number;
        uint256 op_code;
        uint256 block_hash;
        uint256 tx_hash;
        uint256 log_index;
    }

    event Callback(
        uint256 indexed chain_id,
        address indexed _contract,
        uint64 indexed gas_limit,
        bytes payload
    );

    function react(LogRecord calldata log) external;
}

/**
 * @title ISystemContract
 * @notice Interface for the Reactive Network System Contract
 */
interface ISystemContract {
    function subscribe(
        uint256 chain_id,
        address contract_address,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;

    function unsubscribe(
        uint256 chain_id,
        address contract_address,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;
}
