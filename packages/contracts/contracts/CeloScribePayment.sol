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
}
