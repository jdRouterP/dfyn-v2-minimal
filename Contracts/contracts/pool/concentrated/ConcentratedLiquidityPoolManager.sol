// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "../../abstract/Multicall.sol";
import "../../abstract/DfynLPToken.sol";
import "../../interfaces/IMasterDeployer.sol";
import "../../interfaces/IVaultMinimal.sol";
import "../../interfaces/ITridentRouter.sol";
import "../../interfaces/IConcentratedLiquidityPoolManager.sol";
import "../../interfaces/IConcentratedLiquidityPool.sol";
import "../../interfaces/IPositionManager.sol";
import "../../libraries/FullMath.sol";
import "../../libraries/TickMath.sol";
import "../../libraries/DyDxMath.sol";

import "./LimitOrderToken.sol";

/// @notice Trident Concentrated Liquidity Pool periphery contract that combines non-fungible position management and staking.
contract ConcentratedLiquidityPoolManager is IConcentratedLiquidityPoolManagerStruct, IPositionManager, DfynLPToken, Multicall {
    event IncreaseLiquidity(address indexed pool, address indexed owner, uint256 indexed positionId, uint128 liquidity);
    event DecreaseLiquidity(address indexed pool, address indexed owner, uint256 indexed positionId, uint128 liquidity);
    event CreateLImitOrder(address indexed pool, uint256 indexed price, uint256 id);
    event ClaimLimitOrder(address indexed pool, uint256 id, uint256 amount);
    event CancelLimitOrder(address indexed pool, uint256 id, uint256 amount);
    address internal cachedMsgSender = address(1);
    address internal cachedPool = address(1);

    address internal immutable wETH;
    IVaultMinimal public immutable vault;
    IMasterDeployer public immutable masterDeployer;

    mapping(uint256 => Position) public positions;
    mapping(uint256 => LimitOrder) public limitOrders;

    LimitOrderToken public limitOrderToken;
    uint256 public limitOrderId;

    constructor(address _masterDeployer, address _wETH) {
        masterDeployer = IMasterDeployer(_masterDeployer);
        IVaultMinimal _vault = IVaultMinimal(IMasterDeployer(_masterDeployer).vault());
        _vault.registerProtocol();
        vault = _vault;
        wETH = _wETH;
        limitOrderToken = new LimitOrderToken("DfynLOT", "DLOT");
        mint(address(this));
    }

    function mint(
        IConcentratedLiquidityPool pool,
        int24 lowerOld,
        int24 lower,
        int24 upperOld,
        int24 upper,
        uint128 amount0Desired,
        uint128 amount1Desired,
        bool native,
        uint256 minLiquidity,
        uint256 positionId
    )
        external
        payable
        returns (
            //have some extra params for limit orders here
            //bool limitOrder
            uint256 _positionId
        )
    {
        require(masterDeployer.pools(address(pool)), "INVALID_POOL");

        //here check if limit order then lower == upper, otherwise revert

        cachedMsgSender = msg.sender;
        cachedPool = address(pool);

        uint128 liquidityMinted = uint128(
            pool.mint(
                IConcentratedLiquidityPoolStruct.MintParams({
                    lowerOld: lowerOld,
                    lower: lower,
                    upperOld: upperOld,
                    upper: upper,
                    amount0Desired: amount0Desired,
                    amount1Desired: amount1Desired,
                    native: native
                    // limitOrder: limitOrder
                })
            )
        );

        // @todo make sure you mint some different kind of ERC721, because otherwise you cant burn this ERC721 token from swap.

        require(liquidityMinted >= minLiquidity, "TOO_LITTLE_RECEIVED");

        (uint256 feeGrowthInside0, uint256 feeGrowthInside1) = pool.rangeFeeGrowth(lower, upper);

        if (positionId == 0) {
            // We mint a new NFT.
            _positionId = nftCount.minted;
            positions[_positionId] = Position({
                pool: pool,
                liquidity: liquidityMinted,
                lower: lower,
                upper: upper,
                latestAddition: uint32(block.timestamp),
                feeGrowthInside0: feeGrowthInside0,
                feeGrowthInside1: feeGrowthInside1
            });
            mint(msg.sender);
        } else {
            // We increase liquidity for an existing NFT.
            _positionId = positionId;
            Position storage position = positions[_positionId];
            require(address(position.pool) == address(pool), "POOL_MIS_MATCH");
            require(position.lower == lower && position.upper == upper, "RANGE_MIS_MATCH");
            require(ownerOf(positionId) == msg.sender, "NOT_ID_OWNER");
            // Fees should be claimed first.
            position.feeGrowthInside0 = feeGrowthInside0;
            position.feeGrowthInside1 = feeGrowthInside1;
            position.liquidity += liquidityMinted;
            // Incentives should be claimed first.
            position.latestAddition = uint32(block.timestamp);
        }

        emit IncreaseLiquidity(address(pool), msg.sender, _positionId, liquidityMinted);

        cachedMsgSender = address(1);
        cachedPool = address(1);
    }

    function createLimitOrder(
        IConcentratedLiquidityPool pool,
        int24 tick,
        bool native,
        uint256 amountIn,
        bool zeroForOne
    ) external payable returns (uint256) {
        cachedPool = address(pool);
        cachedMsgSender = msg.sender;
        uint256 price;

        pool.createLimitOrder(tick, amountIn, native, zeroForOne);

        uint160 sqrtpriceX96 = TickMath.getSqrtRatioAtTick(tick);

        price = (sqrtpriceX96 * 10**6) / (2**96);
        price = (price**2);

        uint256 amountOut;

        if (zeroForOne) {
            amountOut = (amountIn * price) / 10**12;
        } else {
            amountOut = price / (amountIn * 10**12);
        }
        // amountOut = amountOut / 10**6;
        limitOrderId++;

        limitOrders[limitOrderId] = LimitOrder({
            pool: pool,
            id: limitOrderId,
            tick: tick,
            price: price,
            zeroForOne: zeroForOne,
            amountIn: amountIn,
            amountOut: amountOut,
            claimedAmount: 0,
            status: LimitOrderStatus.active
        });

        limitOrderToken.mint(msg.sender, limitOrderId);

        emit CreateLImitOrder(address(pool), price, limitOrderId);

        return limitOrderId;
    }

    function limitOrderCallback(
        address token,
        uint256 amount,
        bool native
    ) external override {
        require(msg.sender == cachedPool, "UNAUTHORIZED_CALLBACK");

        if (native) {
            _depositFromUserToVault(token, msg.sender, msg.sender, amount);
        } else {
            vault.transfer(token, cachedMsgSender, msg.sender, amount);
        }
        cachedMsgSender = address(1);
        cachedPool = address(1);
    }

    function mintCallback(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1,
        bool native
    ) external override {
        require(msg.sender == cachedPool, "UNAUTHORIZED_CALLBACK");
        if (native) {
            _depositFromUserToVault(token0, cachedMsgSender, msg.sender, amount0);
            _depositFromUserToVault(token1, cachedMsgSender, msg.sender, amount1);
        } else {
            vault.transfer(token0, cachedMsgSender, msg.sender, amount0);
            vault.transfer(token1, cachedMsgSender, msg.sender, amount1);
        }
        cachedMsgSender = address(1);
        cachedPool = address(1);
    }

    function burn(
        uint256 tokenId,
        uint128 amount,
        address recipient,
        bool unwrapVault,
        uint256 minimumOut0,
        uint256 minimumOut1
    ) external returns (uint256 token0Amount, uint256 token1Amount) {
        require(msg.sender == ownerOf(tokenId), "NOT_ID_OWNER");

        Position memory position = positions[tokenId];

        (uint256 token0Fees, uint256 token1Fees, uint256 feeGrowthInside0, uint256 feeGrowthInside1) = positionFees(tokenId);

        if (amount < position.liquidity) {
            (token0Amount, token1Amount, , ) = position.pool.burn(position.lower, position.upper, amount);

            positions[tokenId].feeGrowthInside0 = feeGrowthInside0;
            positions[tokenId].feeGrowthInside1 = feeGrowthInside1;
            positions[tokenId].liquidity -= amount;
        } else {
            amount = position.liquidity;
            (token0Amount, token1Amount, , ) = position.pool.burn(position.lower, position.upper, amount);
            burn(tokenId);
            delete positions[tokenId];
        }

        require(token0Amount >= minimumOut0 && token1Amount >= minimumOut1, "TOO_LITTLE_RECEIVED");

        unchecked {
            token0Amount += token0Fees;
            token1Amount += token1Fees;
        }

        _transferBoth(position.pool, recipient, token0Amount, token1Amount, unwrapVault);

        emit DecreaseLiquidity(address(position.pool), msg.sender, tokenId, amount);
    }

    function claimLimitOrder(
        uint256 tokenId,
        uint256 amount,
        bool unwrapVault
    ) public {
        require(msg.sender == limitOrderToken.ownerOf(tokenId), "NOT_ID_OWNER");

        LimitOrder memory limitOrder = limitOrders[tokenId];

        require(limitOrder.status != LimitOrderStatus.closed, "Limit Order: Inactive");

        (, , , , , , address _token0, address _token1) = limitOrder.pool.getImmutables();

        uint256 totalClaimableAmount = limitOrder.amountOut - limitOrder.claimedAmount;

        require(totalClaimableAmount >= amount, "Amount Exceeds Claimable Amount");

        limitOrder.pool.claimLimitOrder(amount, limitOrder.tick, limitOrder.zeroForOne);

        limitOrders[tokenId].claimedAmount += amount;

        if (limitOrders[tokenId].claimedAmount == limitOrders[tokenId].amountOut) {
            limitOrder.status = LimitOrderStatus.closed;
            limitOrderToken.burn(tokenId);
        }

        if (limitOrder.zeroForOne) {
            _transferOut(_token1, msg.sender, amount, unwrapVault);
        } else {
            _transferOut(_token0, msg.sender, amount, unwrapVault);
        }

        emit CreateLImitOrder(address(limitOrder.pool), tokenId, amount);
    }

    function cancelLimitOrder(uint256 tokenId, bool unwrapVault) public {
        require(msg.sender == limitOrderToken.ownerOf(tokenId), "NOT_ID_OWNER");

        LimitOrder memory limitOrder = limitOrders[tokenId];

        require(limitOrder.status != LimitOrderStatus.closed, "Limit Order:Inactive");

        (, , , , , , address _token0, address _token1) = limitOrder.pool.getImmutables();

        uint256 totalClaimableAmount = limitOrder.amountOut - limitOrder.claimedAmount;
        uint256 refundAmount;
        if (limitOrder.zeroForOne) {
            refundAmount = totalClaimableAmount / limitOrder.price;
            limitOrder.pool.cancelLimitOrder(refundAmount, limitOrder.tick, limitOrder.zeroForOne);
            _transferOut(_token0, msg.sender, refundAmount, unwrapVault);
        } else {
            refundAmount = limitOrder.price / totalClaimableAmount;
            limitOrder.pool.cancelLimitOrder(refundAmount, limitOrder.tick, limitOrder.zeroForOne);
            _transferOut(_token1, msg.sender, refundAmount, unwrapVault);
        }

        limitOrders[tokenId].status = LimitOrderStatus.closed;

        emit CancelLimitOrder(address(limitOrder.pool), tokenId, refundAmount);
    }

    function collect(
        uint256 tokenId,
        address recipient,
        bool unwrapVault
    ) public returns (uint256 token0amount, uint256 token1amount) {
        require(msg.sender == ownerOf(tokenId), "NOT_ID_OWNER");
        Position storage position = positions[tokenId];

        (, , , , , , address token0, address token1) = position.pool.getImmutables();

        (token0amount, token1amount, position.feeGrowthInside0, position.feeGrowthInside1) = positionFees(tokenId);

        uint256 balance0 = vault.balanceOf(token0, address(this));
        uint256 balance1 = vault.balanceOf(token1, address(this));

        if (balance0 < token0amount || balance1 < token1amount) {
            (uint256 amount0fees, uint256 amount1fees) = position.pool.collect(position.lower, position.upper);

            uint256 newBalance0 = amount0fees + balance0;
            uint256 newBalance1 = amount1fees + balance1;

            // Rounding errors due to frequent claiming of other users in the same position may cost us some wei units.
            if (token0amount > newBalance0) token0amount = newBalance0;
            if (token1amount > newBalance1) token1amount = newBalance1;
        }

        _transferOut(token0, recipient, token0amount, unwrapVault);
        _transferOut(token1, recipient, token1amount, unwrapVault);
    }

    /// @notice Returns the claimable fees and the fee growth accumulators of a given position.
    function positionFees(uint256 tokenId)
        public
        view
        returns (
            uint256 token0amount,
            uint256 token1amount,
            uint256 feeGrowthInside0,
            uint256 feeGrowthInside1
        )
    {
        Position memory position = positions[tokenId];

        (feeGrowthInside0, feeGrowthInside1) = position.pool.rangeFeeGrowth(position.lower, position.upper);

        token0amount = FullMath.mulDiv(
            feeGrowthInside0 - position.feeGrowthInside0,
            position.liquidity,
            0x100000000000000000000000000000000
        );

        token1amount = FullMath.mulDiv(
            feeGrowthInside1 - position.feeGrowthInside1,
            position.liquidity,
            0x100000000000000000000000000000000
        );
    }

    function _transferBoth(
        IConcentratedLiquidityPool pool,
        address to,
        uint256 token0Amount,
        uint256 token1Amount,
        bool unwrapVault
    ) internal {
        (, , , , , , address token0, address token1) = pool.getImmutables();
        _transferOut(token0, to, token0Amount, unwrapVault);
        _transferOut(token1, to, token1Amount, unwrapVault);
    }

    function _transferOut(
        address token,
        address to,
        uint256 shares,
        bool unwrapVault
    ) internal {
        if (unwrapVault) {
            vault.withdraw(token, address(this), to, 0, shares);
        } else {
            vault.transfer(token, address(this), to, shares);
        }
    }

    function _depositFromUserToVault(
        address token,
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        if (token == wETH && address(this).balance > 0) {
            // 'amount' is in Vault share units.
            uint256 ethAmount = vault.toAmount(token, amount, true);
            if (address(this).balance >= ethAmount) {
                vault.deposit{value: ethAmount}(address(0), sender, recipient, 0, amount);
                return;
            }
        }
        vault.deposit(token, sender, recipient, 0, amount);
    }
}
