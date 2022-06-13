// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "../interfaces/IPool.sol";
import "../interfaces/ITridentCallee.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IVaultMinimal.sol";
import "hardhat/console.sol";

contract FlashSwapMock {
    IVaultMinimal public immutable vault;

    constructor(IVaultMinimal _vault) {
        vault = _vault;
    }

    function testFlashSwap(IPool pair, bytes calldata data) external {
        pair.flashSwap(data);
    }

    function tridentSwapCallback(bytes calldata data) external {
        (bool success, address token, bool viaVault) = abi.decode(data, (bool, address, bool));
        if (success) {
            if (viaVault) {
                uint256 tokenBalanceVault = vault.balanceOf(token, address(this));
                vault.transfer(token, address(this), msg.sender, tokenBalanceVault);
            } else {
                uint256 tokenBalance = IERC20(token).balanceOf(address(this));
                IERC20(token).transfer(address(vault), tokenBalance);
                vault.deposit(token, address(vault), msg.sender, tokenBalance, 0);
            }
        }
    }
}
