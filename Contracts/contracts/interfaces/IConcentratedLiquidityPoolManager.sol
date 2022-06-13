// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "./IConcentratedLiquidityPool.sol";
import "./ITridentNFT.sol";

/// @notice Trident concentrated liquidity pool manager contract Structs.
interface IConcentratedLiquidityPoolManagerStruct {
    enum LimitOrderStatus {
        closed,
        active
    }
    struct Position {
        IConcentratedLiquidityPool pool;
        uint128 liquidity;
        int24 lower;
        int24 upper;
        uint32 latestAddition;
        uint256 feeGrowthInside0; /// @dev Per unit of liquidity.
        uint256 feeGrowthInside1;
    }

    struct LimitOrder {
        IConcentratedLiquidityPool pool;
        uint256 id;
        int24 tick;
        uint256 price;
        bool zeroForOne;
        uint256 amountIn;
        uint256 amountOut;
        uint256 claimedAmount;
        LimitOrderStatus status;
    }
}

/// @notice Trident concentrated liquidity manager contract interface.
interface IConcentratedLiquidityPoolManager is IConcentratedLiquidityPoolManagerStruct, ITridentNFT {
    function positions(uint256) external view returns (Position memory);

    function vault() external view returns (IVaultMinimal);
}
