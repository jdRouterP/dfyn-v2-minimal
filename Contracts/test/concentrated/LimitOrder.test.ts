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
import {
  Vault,
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolFactory,
  ConcentratedLiquidityPoolHelper,
  ConcentratedLiquidityPoolManager,
  ConcentratedLiquidityPoolStaker,
  DyDxMath,
  MasterDeployer,
  TickMathMock,
  ERC20Mock,
  TridentRouter,
} from "../../types";

import { getValidTick } from "./utils/utils";
import { getBigNumber, customError } from "../utilities";
import { Trident } from "../harness/Trident";

describe("Limit Order Test On Concentrated Liquidity Product Pool", function () {
  let _snapshotId: string;
  let snapshotId: string;
  let trident: Trident;
  let defaultAddress: string;
  let limitOrderSwapper: string;
  const helper = new LinkedListHelper(-887272);
  const step = 10800; // 2^5 * 3^2 * 5^2 (nicely divisible number)

  before(async () => {
    _snapshotId = await ethers.provider.send("evm_snapshot", []);
    trident = await Trident.Instance.init();
    defaultAddress = trident.accounts[0].address;
    limitOrderSwapper = trident.accounts[2].address;
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

  describe("Limit Order tests", async () => {
    it("Put limitorder and swap", async () => {
      const pool: ConcentratedLiquidityPool = trident.concentratedPools[2];
      helper.reset();
      const tickSpacing = (await pool.getImmutables())._tickSpacing;
      const { _MAX_TICK_LIQUIDITY, _tickSpacing, _swapFee, _barFeeTo, _vault, _masterDeployer, _token0, _token1 } =
        await pool.getImmutables();
      const tickAtPrice = await getTickAtCurrentPrice(pool);
      console.log("initial tick", tickAtPrice);

      const nearestValidTick = tickAtPrice - (tickAtPrice % tickSpacing);

      const nearestEvenValidTick =
        (nearestValidTick / tickSpacing) % 2 == 0 ? nearestValidTick : nearestValidTick - tickSpacing;

      let lower = nearestEvenValidTick - 2 * tickSpacing;
      let upper = nearestEvenValidTick + 3 * tickSpacing;
      console.log(
        "token0 bal before",
        (await trident.getBalance(trident.tokens[0].address, defaultAddress)).toString()
      );
      console.log(
        "token1 bal before",
        (await trident.getBalance(trident.tokens[1].address, defaultAddress)).toString()
      );
      console.log(
        "tri bal0",
        (await trident.getTokenBalance([trident.tokens[0].address], pool.address, false))[0].toString()
      );
      console.log(
        "tri bal1",
        (await trident.getTokenBalance([trident.tokens[1].address], pool.address, false))[0].toString()
      );
      let addLiquidityParams = {
        pool: pool,
        amount0Desired: getBigNumber(10000),
        amount1Desired: getBigNumber(10000),
        native: false,
        lowerOld: helper.insert(lower),
        lower,
        upperOld: helper.insert(upper),
        upper,
        positionOwner: trident.concentratedPoolManager.address,
        recipient: defaultAddress,
      };

      console.log("lower", lower);
      console.log("upper", upper);

      await addLiquidityViaManager(addLiquidityParams);
      const oldData=await pool.ticks(887272)
      console.log("lowerold",addLiquidityParams.lowerOld)
      console.log("upperold",addLiquidityParams.upperOld)

      console.log('Min Liquidity',oldData.liquidity.toString());
 
      // console.log("token0 bal after", (await trident.getBalance(trident.tokens[0].address, defaultAddress)).toString());
      // console.log("token1 bal after", (await trident.getBalance(trident.tokens[1].address, defaultAddress)).toString());
      // console.log(
      //   "tri bal0",
      //   (await trident.getTokenBalance([trident.tokens[0].address], pool.address, false))[0].toString()
      // );
      // console.log(
      //   "tri bal1",
      //   (await trident.getTokenBalance([trident.tokens[1].address], pool.address, false))[0].toString()
      // );
      // // addLiquidityParams = helper.setTicks(lower - 10 * step, upper + 10 * step, addLiquidityParams);

      // // const lp = await addLiquidityViaManager(addLiquidityParams);
      // const currenttickAtPrice = await getTickAtCurrentPrice(pool);
      // console.log("currenttick", currenttickAtPrice);

      // console.log("sqrt price", (await pool.getPriceAndNearestTicks())._price.toString());
      // const currentnearestValidTick = currenttickAtPrice + (currenttickAtPrice % tickSpacing);
      // console.log("currentnearesttickAtPrice", currentnearestValidTick);

      // const limitOrderTick = getValidTick(upper, tickSpacing);

      // await trident.concentratedPoolManager
      //   .connect(trident.accounts[2])
      //   .createLimitOrder(pool.address, limitOrderTick, false, "1000000000000000000", true);

      // const limitOrderid = await trident.concentratedPoolManager.limitOrderId();

      // const limitOrderData = await trident.concentratedPoolManager.limitOrders(limitOrderid);

      // console.log(limitOrderData);

      // console.log("amountout", limitOrderData.amountOut.toString());

      // let liquidity = await pool.limitOrderTicks(upper);
      // console.log(liquidity.token0Liquidity.toString());

      // // swap accross the range and back
      // //                       ▼ - - - - - - -> ▼
      // // ----------------|xxxxxxxxxxx|-------------------------------
      // // ----|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|-----

      // const currentPrice = (await pool.getPriceAndNearestTicks())._price;
      // const upperPrice = await trident.tickMath.getSqrtRatioAtTick(upper);
      // console.log("upperPrice", upperPrice.toString());
      // const maxDy = await getDy(await pool.liquidity(), currentPrice, upperPrice, false);
      // console.log("maxdy", maxDy.toString());
      // let swapTx = await swapViaRouter({
      //   pool: pool,
      //   unwrapVault: true,
      //   zeroForOne: false,
      //   // inAmount: BigNumber.from("12500000000020000000000"),
      //   inAmount: maxDy.add(getBigNumber("260270591473216000000", 0)),
      //   recipient: defaultAddress,
      // });

      // liquidity = await pool.limitOrderTicks(upper);
      // console.log("claimable amount", liquidity);
      // console.log("claimable amount", liquidity.token1Claimable.toString());

      // const currenttickAtPriceafterswap = await getTickAtCurrentPrice(pool);
      // console.log(currenttickAtPriceafterswap);

      // const share = await trident.vault.toShare(_token1, liquidity.token1Claimable, false);

      // console.log("share", share.toString());

      // const poolmanger = await trident.concentratedPoolManager.address;
      // console.log("manager address", poolmanger);

      // let balance = await trident.vault.balanceOf(_token1, trident.accounts[2].address);
      // console.log("balance before claim", balance.toString());

      // await trident.concentratedPoolManager
      //   .connect(trident.accounts[2])
      //   .claimLimitOrder(limitOrderData.id.toString(), share, false);

      // balance = await trident.vault.balanceOf(_token1, trident.accounts[2].address);
      // console.log("balance after claim", balance.toString());
    });

    // it.skip("Put limitorder and cancel", async () => {
    //   const pool: ConcentratedLiquidityPool = trident.concentratedPools[2];
    //   helper.reset();
    //   const tickSpacing = (await pool.getImmutables())._tickSpacing;
    //   const { _MAX_TICK_LIQUIDITY, _tickSpacing, _swapFee, _barFeeTo, _vault, _masterDeployer, _token0, _token1 } =
    //     await pool.getImmutables();
    //   const tickAtPrice = await getTickAtCurrentPrice(pool);
    //   console.log("initial tick", tickAtPrice);

    //   const nearestValidTick = tickAtPrice - (tickAtPrice % tickSpacing);

    //   const nearestEvenValidTick =
    //     (nearestValidTick / tickSpacing) % 2 == 0 ? nearestValidTick : nearestValidTick - tickSpacing;

    //   let lower = nearestEvenValidTick - 2 * tickSpacing;
    //   let upper = nearestEvenValidTick + 3 * tickSpacing;

    //   let addLiquidityParams = {
    //     pool: pool,
    //     amount0Desired: getBigNumber(10000),
    //     amount1Desired: getBigNumber(10000),
    //     native: false,
    //     lowerOld: helper.insert(lower),
    //     lower,
    //     upperOld: helper.insert(upper),
    //     upper,
    //     positionOwner: trident.concentratedPoolManager.address,
    //     recipient: defaultAddress,
    //   };

    //   console.log("lower", lower);
    //   console.log("upper", upper);

    //   await addLiquidityViaManager(addLiquidityParams);
    //   addLiquidityParams = helper.setTicks(lower - 10 * step, upper + 10 * step, addLiquidityParams);

    //   const lp = await addLiquidityViaManager(addLiquidityParams);
    //   const currenttickAtPrice = await getTickAtCurrentPrice(pool);
    //   console.log("currenttick", currenttickAtPrice);
    //   const currentnearestValidTick = currenttickAtPrice + (currenttickAtPrice % tickSpacing);
    //   console.log("currentnearesttickAtPrice", currentnearestValidTick);

    //   await trident.concentratedPoolManager
    //     .connect(trident.accounts[2])
    //     .createLimitOrder(pool.address, upper, false, 20000000000, true);

    //   const limitOrderid = await trident.concentratedPoolManager.limitOrderId();

    //   let limitOrderData = await trident.concentratedPoolManager.limitOrders(limitOrderid);

    //   console.log(limitOrderData);

    //   let balance = await trident.vault.balanceOf(_token0, trident.accounts[2].address);
    //   console.log("balance before cancel", balance.toString());

    //   await trident.concentratedPoolManager.connect(trident.accounts[2]).cancelLimitOrder(limitOrderid, false);

    //   limitOrderData = await trident.concentratedPoolManager.limitOrders(limitOrderid);

    //   console.log(limitOrderData);

    //   balance = await trident.vault.balanceOf(_token0, trident.accounts[2].address);
    //   console.log("balance after cancel", balance.toString());
    // });
  });
});
