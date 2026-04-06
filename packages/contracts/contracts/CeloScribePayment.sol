// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CeloScribePayment
 * @notice Receives cUSD micropayments for AI task access on CeloScribe.
 * @dev Uses SafeERC20, ReentrancyGuard, Ownable, and Pausable from OpenZeppelin v5.
 *      Follows Checks-Effects-Interactions pattern throughout.
 *      Task pricing is denominated in cUSD (18 decimals).
 */
contract CeloScribePayment is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /// @notice cUSD token address on Celo Mainnet
    address public constant CUSD_MAINNET = 0x765DE816845861e75A25fCA122bb6898B8B1282a;

    // â”€â”€â”€ Task Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    enum TaskType {
        TEXT_SHORT, // $0.01 â€” up to 300 words
        TEXT_LONG, // $0.05 â€” up to 1500 words
        IMAGE, // $0.08 â€” image generation
        TRANSLATE // $0.02 â€” language translation
    }

    // â”€â”€â”€ Pricing (in cUSD, 18 decimals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    uint256 public constant PRICE_TEXT_SHORT = 0.01 ether; // 0.01 cUSD
    uint256 public constant PRICE_TEXT_LONG = 0.05 ether; // 0.05 cUSD
    uint256 public constant PRICE_IMAGE = 0.08 ether; // 0.08 cUSD
    uint256 public constant PRICE_TRANSLATE = 0.02 ether; // 0.02 cUSD

    // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    IERC20 public immutable cusd;
    address public treasury;
    uint256 public totalPaymentsReceived;

    // â”€â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /// @notice Emitted on every successful task payment
    event PaymentReceived(address indexed user, TaskType indexed taskType, uint256 amount, uint256 timestamp);

    /// @notice Emitted when the treasury address is updated
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @notice Emitted when accumulated cUSD is withdrawn to treasury
    event TreasuryWithdrawal(address indexed treasury, uint256 amount);

    // â”€â”€â”€ Errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    error InsufficientPayment(uint256 required, uint256 provided);
    error ZeroAddress();
    error ZeroBalance();
    error InvalidTaskType();

    // â”€â”€â”€ Constructor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * @param _cusd Address of the cUSD ERC-20 token
     * @param _treasury Address that receives protocol revenue
     */
    constructor(address _cusd, address _treasury) Ownable(msg.sender) {
        if (_cusd == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        cusd = IERC20(_cusd);
        treasury = _treasury;
    }

    // â”€â”€â”€ External Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * @notice Pay for an AI task. User must have approved this contract to spend cUSD.
     * @param taskType The type of AI task being requested.
     * @dev Follows Checks-Effects-Interactions:
     *      1. Check: validate approval against task price
     *      2. Effect: update state (totalPaymentsReceived, emit event)
     *      3. Interact: transfer cUSD from user to this contract
     */
    function payForTask(TaskType taskType) external nonReentrant whenNotPaused {
        uint256 requiredAmount = priceOf(taskType);

        // CHECKS
        uint256 approvedAmount = cusd.allowance(msg.sender, address(this));
        if (approvedAmount < requiredAmount) revert InsufficientPayment(requiredAmount, approvedAmount);

        // EFFECTS
        totalPaymentsReceived += requiredAmount;
        emit PaymentReceived(msg.sender, taskType, requiredAmount, block.timestamp);

        // INTERACTIONS
        cusd.safeTransferFrom(msg.sender, address(this), requiredAmount);
    }
}
