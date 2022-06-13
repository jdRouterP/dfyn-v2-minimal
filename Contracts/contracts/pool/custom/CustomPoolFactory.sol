// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../abstract/PoolDeployer.sol";
import "../../interfaces/ICustomLiquidityPool.sol";

/// @notice Dfyn's Factory for deploying custom liquidity pools.

contract CustomFactory is PoolDeployer {
    address internal immutable strategyContract;

    /* ========== constructor ========== */
    constructor(address _masterDeployer, address _strategyContract) PoolDeployer(_masterDeployer) {
        strategyContract = _strategyContract;
    }

    function deployPool(bytes memory _deployData) external returns (address pool) {
        (address[] memory tokens, uint24 swapFee, uint160 price, uint24 tickSpacing) = abi.decode(
            _deployData,
            (address[], uint24, uint160, uint24)
        );
        // Strips any extra data.
        // Don't include price in _deployData to enable predictable address calculation.
        _deployData = abi.encode(tokens, swapFee, tickSpacing);
        // Salt is not actually needed since `_deployData` is part of creationCode and already contains the salt.
        bytes32 salt = keccak256(_deployData);
        pool = Clones.cloneDeterministic(strategyContract, salt);
        bytes memory payload = abi.encodeWithSelector("", _deployData); //keccak256(initialize(bytes memory _data, address _deployer))
        (bool success, bytes memory returnData) = address(pool).call(payload);
        require(success && (returnData.length == 0 || abi.decode(returnData, (bool))), "Initialization Failed");
        delete success;
        delete returnData;
        //TODO:Add initialize functionsig
        payload = abi.encodeWithSelector(0xd90bda4e, price); //keccak256(setPrice(uint160 _price))
        (success, returnData) = address(pool).call(payload);
        require(success && (returnData.length == 0 || abi.decode(returnData, (bool))), "Price Initialization Failed");
        _registerPool(pool, tokens, salt);
        ICustomLiquidityPool(pool).setPrice(price);
    }
}
