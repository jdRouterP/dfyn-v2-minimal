// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "../interfaces/IPoolFactory.sol";
import "../abstract/PoolDeployer.sol";
import "../TridentRouter.sol";

contract RouterMock is TridentRouter {
    constructor(
        IVaultMinimal vault,
        IMasterDeployer masterDeployer,
        address wETH
    ) TridentRouter(vault, masterDeployer, wETH) {
        //
    }
}
