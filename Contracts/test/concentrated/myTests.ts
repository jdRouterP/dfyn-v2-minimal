import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import {
  addLiquidityViaManager,
  _addLiquidityViaManager,
  removeLiquidityViaManager,
  collectFees,
  collectProtocolFee,
  getDx,
  getDy,
  getTickAtCurrentPrice,
  LinkedListHelper,
  swapViaRouter,
  TWO_POW_128,
} from "../harness/Concentrated";
import { getBigNumber, customError } from "../utilities";
import { Trident } from "../harness/Trident";

describe("Concentrated Liquidity Product Pool", function () {
  let _snapshotId: string;
  let snapshotId: string;
  let trident: Trident;
  let defaultAddress: string;
  const helper = new LinkedListHelper(-887272);
  const step = 10800; // 2^5 * 3^2 * 5^2 (nicely divisible number)

  before(async () => {
    _snapshotId = await ethers.provider.send("evm_snapshot", []);
    trident = await Trident.Instance.init();
    defaultAddress = trident.accounts[0].address;
    snapshotId = await ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await network.provider.send("evm_revert", [snapshotId]);
    snapshotId = await ethers.provider.send("evm_snapshot", []);
  });

  after(async () => {
    await network.provider.send("evm_revert", [_snapshotId]);
    _snapshotId = await ethers.provider.send("evm_snapshot", []);
  });

  describe("Valid actions", async () => {
    it("Lets mint liq in range for 1 type of pool", async () => {
      const pool = trident.concentratedPools[2];
      helper.reset();

      const tickSpacing = (await pool.getImmutables())._tickSpacing;
      const tickAtPrice = await getTickAtCurrentPrice(pool);
      const nearestValidTick = tickAtPrice - (tickAtPrice % tickSpacing);
      const nearestEvenValidTick =
        (nearestValidTick / tickSpacing) % 2 == 0 ? nearestValidTick : nearestValidTick + tickSpacing;

      // assume increasing tick value by one step brings us to a valid tick
      // satisfy "lower even" & "upper odd" conditions
      let lower = nearestEvenValidTick - step;
      let upper = nearestEvenValidTick + step + tickSpacing;

      let addLiquidityParams = {
        pool: pool,
        amount0Desired: getBigNumber(50),
        amount1Desired: getBigNumber(50),
        native: true,
        lowerOld: helper.insert(lower),
        lower,
        upperOld: helper.insert(upper),
        upper,
        positionOwner: trident.concentratedPoolManager.address,
        recipient: defaultAddress,
      };
      console.log('tickSpacing', tickSpacing);
      console.log('tickAtPrice', tickAtPrice);
      console.log('nearestValidTick', nearestValidTick);
      console.log('nearestEvenValidTick', nearestEvenValidTick);
      console.log('lower', lower);
      console.log('upper', upper);
      console.log('lowerOld', addLiquidityParams.lowerOld);
      console.log('upperOld', addLiquidityParams.upperOld);
      // normal mint
      await addLiquidityViaManager(addLiquidityParams);

      // print swapFees
      console.log(((await pool.getImmutables())._swapFee).toString());

      // update swapFee
      await trident.concentratedPoolFactory.updateSwapFee(pool.address, 1);

      // print swapFees
      console.log(((await pool.getImmutables())._swapFee).toString());
    });
  });

});
