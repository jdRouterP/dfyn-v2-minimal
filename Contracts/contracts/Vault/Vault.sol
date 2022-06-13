// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "@boringcrypto/boring-solidity/contracts/libraries/BoringERC20.sol";
import "@boringcrypto/boring-solidity/contracts/libraries/BoringRebase.sol";
import "@boringcrypto/boring-solidity/contracts/BoringBatchable.sol";

import "../interfaces/IWETH.sol";
import "./MasterContractManager.sol";
import "../libraries/BoringMath.sol";

contract Vault is BoringBatchable, MasterContractManager {
    using BoringMath for uint256;
    using BoringMath128 for uint128;
    using BoringERC20 for IERC20;
    using RebaseLibrary for Rebase;

    // ************** //
    // *** EVENTS *** //
    // ************** //

    event LogDeposit(IERC20 indexed token, address indexed from, address indexed to, uint256 amount, uint256 share);
    event LogWithdraw(IERC20 indexed token, address indexed from, address indexed to, uint256 amount, uint256 share);
    event LogTransfer(IERC20 indexed token, address indexed from, address indexed to, uint256 share);

    IERC20 private immutable wethToken;

    IERC20 private constant USE_ETHEREUM = IERC20(address(0));

    uint256 private constant MINIMUM_SHARE_BALANCE = 1000; // To prevent the ratio going off

    // ***************** //
    // *** VARIABLES *** //
    // ***************** //

    // Balance per token per address/contract in shares
    mapping(IERC20 => mapping(address => uint256)) public balanceOf;

    // Rebase from amount to share
    mapping(IERC20 => Rebase) public totals;

    // ******************* //
    // *** CONSTRUCTOR *** //
    // ******************* //

    constructor(IERC20 wethToken_) {
        wethToken = wethToken_;
    }

    // ***************** //
    // *** MODIFIERS *** //
    // ***************** //

    /// Modifier to check if the msg.sender is allowed to use funds belonging to the 'from' address.
    /// If 'from' is msg.sender, it's allowed.
    /// If 'from' is the Vault itself, it's allowed. Any ETH, token balances (above the known balances) or Vault balances
    /// can be taken by anyone.
    /// This is to enable skimming, not just for deposits, but also for withdrawals or transfers, enabling better composability.
    /// If 'from' is a clone of a masterContract AND the 'from' address has approved that masterContract, it's allowed.
    modifier allowed(address from) {
        if (from != msg.sender && from != address(this)) {
            // From is sender or you are skimming
            address masterContract = masterContractOf[msg.sender];
            require(masterContract != address(0), "No masterContract");
            require(masterContractApproved[masterContract][from], "Transfer not approved");
        }
        _;
    }

    // ************************** //
    // *** INTERNAL FUNCTIONS *** //
    // ************************** //

    /// @dev Returns the total balance of `token` this contracts holds,
    function _tokenBalanceOf(IERC20 token) internal view returns (uint256 amount) {
        amount = token.balanceOf(address(this));
    }

    // ************************ //
    // *** PUBLIC FUNCTIONS *** //
    // ************************ //

    /// @dev Helper function to represent an `amount` of `token` in shares.
    /// @param token The ERC-20 token.
    /// @param amount The `token` amount.
    /// @param roundUp If the result `share` should be rounded up.
    /// @return share The token amount represented in shares.
    function toShare(
        IERC20 token,
        uint256 amount,
        bool roundUp
    ) external view returns (uint256 share) {
        share = totals[token].toBase(amount, roundUp);
    }

    /// @dev Helper function represent shares back into the `token` amount.
    /// @param token The ERC-20 token.
    /// @param share The amount of shares.
    /// @param roundUp If the result should be rounded up.
    /// @return amount The share amount back into native representation.
    function toAmount(
        IERC20 token,
        uint256 share,
        bool roundUp
    ) external view returns (uint256 amount) {
        amount = totals[token].toElastic(share, roundUp);
    }

    /// @notice Deposit an amount of `token` represented in either `amount` or `share`.
    /// @param token_ The ERC-20 token to deposit.
    /// @param from which account to pull the tokens.
    /// @param to which account to push the tokens.
    /// @param amount Token amount in native representation to deposit.
    /// @param share Token amount represented in shares to deposit. Takes precedence over `amount`.
    /// @return amountOut The amount deposited.
    /// @return shareOut The deposited amount represented in shares.
    function deposit(
        IERC20 token_,
        address from,
        address to,
        uint256 amount,
        uint256 share
    ) public payable allowed(from) returns (uint256 amountOut, uint256 shareOut) {
        // Checks
        require(to != address(0), "to address not set"); // To avoid a bad UI from burning funds

        // Effects
        IERC20 token = token_ == USE_ETHEREUM ? wethToken : token_;
        Rebase memory total = totals[token];

        // If a new token gets added, the tokenSupply call checks that this is a deployed contract. Needed for security.
        require(total.elastic != 0 || token.totalSupply() > 0, "No tokens");
        if (share == 0) {
            // value of the share may be lower than the amount due to rounding, that's ok
            share = total.toBase(amount, false);
            // Any deposit should lead to at least the minimum share balance, otherwise it's ignored (no amount taken)
            if (total.base.add(share.to128()) < MINIMUM_SHARE_BALANCE) {
                return (0, 0);
            }
        } else {
            // amount may be lower than the value of share due to rounding, in that case, add 1 to amount (Always round up)
            amount = total.toElastic(share, true);
        }

        // In case of skimming, check that only the skimmable amount is taken.
        // For ETH, the full balance is available, so no need to check.
        // During flashloans the _tokenBalanceOf is lower than 'reality', so skimming deposits will mostly fail during a flashloan.
        require(from != address(this) || token_ == USE_ETHEREUM || amount <= _tokenBalanceOf(token).sub(total.elastic), "Skim too much");

        balanceOf[token][to] = balanceOf[token][to].add(share);
        total.base = total.base.add(share.to128());
        total.elastic = total.elastic.add(amount.to128());
        totals[token] = total;

        // Interactions
        // During the first deposit, we check that this token is 'real'
        if (token_ == USE_ETHEREUM) {
            // X2 - If there is an error, could it cause a DoS. Like balanceOf causing revert. (SWC-113)
            // X2: If the WETH implementation is faulty or malicious, it will block adding ETH (but we know the WETH implementation)
            IWETH(address(wethToken)).deposit{value: amount}();
        } else if (from != address(this)) {
            // X2 - If there is an error, could it cause a DoS. Like balanceOf causing revert. (SWC-113)
            // X2: If the token implementation is faulty or malicious, it may block adding tokens. Good.
            token.safeTransferFrom(from, address(this), amount);
        }
        emit LogDeposit(token, from, to, amount, share);
        amountOut = amount;
        shareOut = share;
    }

    /// @notice Withdraws an amount of `token` from a user account.
    /// @param token_ The ERC-20 token to withdraw.
    /// @param from which user to pull the tokens.
    /// @param to which user to push the tokens.
    /// @param amount of tokens. Either one of `amount` or `share` needs to be supplied.
    /// @param share Like above, but `share` takes precedence over `amount`.
    function withdraw(
        IERC20 token_,
        address from,
        address to,
        uint256 amount,
        uint256 share
    ) public allowed(from) returns (uint256 amountOut, uint256 shareOut) {
        // Checks
        require(to != address(0), "to address not set"); // To avoid a bad UI from burning funds

        // Effects
        IERC20 token = token_ == USE_ETHEREUM ? wethToken : token_;
        Rebase memory total = totals[token];
        if (share == 0) {
            // value of the share paid could be lower than the amount paid due to rounding, in that case, add a share (Always round up)
            share = total.toBase(amount, true);
        } else {
            // amount may be lower than the value of share due to rounding, that's ok
            amount = total.toElastic(share, false);
        }

        balanceOf[token][from] = balanceOf[token][from].sub(share);
        total.elastic = total.elastic.sub(amount.to128());
        total.base = total.base.sub(share.to128());
        // There have to be at least 1000 shares left to prevent reseting the share/amount ratio (unless it's fully emptied)
        require(total.base >= MINIMUM_SHARE_BALANCE || total.base == 0, "cannot be empty");
        totals[token] = total;

        // Interactions
        if (token_ == USE_ETHEREUM) {
            // X2, X3: A revert or big gas usage in the WETH contract could block withdrawals, but WETH9 is fine.
            IWETH(address(wethToken)).withdraw(amount);
            // X2, X3: A revert or big gas usage could block, however, the to address is under control of the caller.
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // X2, X3: A malicious token could block withdrawal of just THAT token.
            //         masterContracts may want to take care not to rely on withdraw always succeeding.
            token.safeTransfer(to, amount);
        }
        emit LogWithdraw(token, from, to, amount, share);
        amountOut = amount;
        shareOut = share;
    }

    /// @notice Transfer shares from a user account to another one.
    /// @param token The ERC-20 token to transfer.
    /// @param from which user to pull the tokens.
    /// @param to which user to push the tokens.
    /// @param share The amount of `token` in shares.
    // Clones of master contracts can transfer from any account that has approved them
    // F3 - Can it be combined with another similar function?
    // F3: This isn't combined with transferMultiple for gas optimization
    function transfer(
        IERC20 token,
        address from,
        address to,
        uint256 share
    ) public allowed(from) {
        // Checks
        require(to != address(0), "to address not set"); // To avoid a bad UI from burning funds

        // Effects
        balanceOf[token][from] = balanceOf[token][from].sub(share);
        balanceOf[token][to] = balanceOf[token][to].add(share);

        emit LogTransfer(token, from, to, share);
    }

    /// @notice Transfer shares from a user account to multiple other ones.
    /// @param token The ERC-20 token to transfer.
    /// @param from which user to pull the tokens.
    /// @param tos The receivers of the tokens.
    /// @param shares The amount of `token` in shares for each receiver in `tos`.
    // F3 - Can it be combined with another similar function?
    // F3: This isn't combined with transfer for gas optimization
    function transferMultiple(
        IERC20 token,
        address from,
        address[] calldata tos,
        uint256[] calldata shares
    ) public allowed(from) {
        // Checks
        require(tos[0] != address(0), "to address not set"); // To avoid a bad UI from burning funds

        // Effects
        uint256 totalAmount;
        uint256 len = tos.length;
        for (uint256 i = 0; i < len; i++) {
            address to = tos[i];
            balanceOf[token][to] = balanceOf[token][to].add(shares[i]);
            totalAmount = totalAmount.add(shares[i]);
            emit LogTransfer(token, from, to, shares[i]);
        }
        balanceOf[token][from] = balanceOf[token][from].sub(totalAmount);
    }

    // Contract should be able to receive ETH deposits to support deposit & skim
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
