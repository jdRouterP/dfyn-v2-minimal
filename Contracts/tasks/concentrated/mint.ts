import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  getSqrtX96FromPrice,
  nearestValidTick
} from "../utils/math";

task("addliquidity").setAction(async function (taskArguments: TaskArguments, hre) {
    let tokenA='0x999D86E29A04B4354d5149aBdB32c6A766894438'
    let tokenB='0x528BC890512D07f95D42D8249bAF55E3Bc3B3B8f'
    let pool='0xD03096cF7Ac1D6F1a514b3e9eDAA2508b63782c2'
    let lowerprice=10
    let lowerOldTick=-887272
    let upperprice=100
    let upperOldTick=887272
    let amount0=hre.ethers.utils.parseEther("200")
    let amount1=hre.ethers.utils.parseEther("200")
    let native=true
    let minliquidity=0
    let positionid=0
    let PoolManager ='0x633600f0c77130d20F069705334E2108e5Ad21d0'
    let tickMathAddress='0x07BFfb7f8C97370601fDcC661E2F864c2F6BE7CA'
    let dydx='0x38A79b10800E88c07C76c763c5374b95B78B952b'
    let ticks='0x264E77E82A34E42e702472d0B733Cf766634038c'


    const poolContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPool", {
      libraries: {
        DyDxMath: dydx,
        Ticks: ticks,
      },
    });
    const poolInst = await poolContract.attach(pool);

    const price=await poolInst.getPriceAndNearestTicks();
    const tickSpacing= (await poolInst.getImmutables())._tickSpacing;

    console.log('current price',price._price.toString());
    const tickMathContract = await hre.ethers.getContractFactory("TickMathUI");
    const tickMath =await tickMathContract.attach(tickMathAddress);
    const currentTick= await tickMath.getTickAtSqrtRatio(price._price);
    console.log('current tick: ' ,currentTick)
    let lowerSqrtPriceX96= getSqrtX96FromPrice(lowerprice)
    let lowerTick= await tickMath.getTickAtSqrtRatio(lowerSqrtPriceX96);
    let lowestVaildTick=nearestValidTick(lowerTick,tickSpacing)
    console.log("Lower Valid Tick",lowestVaildTick)
    let upperSqrtPriceX96= getSqrtX96FromPrice(upperprice)
    let upperTick= await tickMath.getTickAtSqrtRatio(upperSqrtPriceX96);
    let upperVaildTick=nearestValidTick(upperTick,tickSpacing)
    let upperOdd=upperVaildTick+tickSpacing;
    console.log("Upper Valid Tick",upperOdd)
  const poolManagerContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPoolManager");
  const poolManagerInst = await poolManagerContract.attach(PoolManager);
  await poolManagerInst.mint(
    pool,
    lowerOldTick,
    lowestVaildTick,
    lowestVaildTick,
    upperOdd,
    amount0,
    amount1,
    native,
    minliquidity,
    positionid
  );
})

task("approvetoken").setAction(async function (taskArguments: TaskArguments, hre) {
    let tokenA='0x999D86E29A04B4354d5149aBdB32c6A766894438'
    let tokenB='0x528BC890512D07f95D42D8249bAF55E3Bc3B3B8f'
    let owner='0xdd52d715316DE155D2b7278Ca632c5f8C0321eD0'
    let token=tokenB;
    let vault="0x997bAaDAa2963f0218A8Dd0E97f26D8a62aBbf1b"
    let manager="0x633600f0c77130d20F069705334E2108e5Ad21d0"
    let tokenAmount=hre.ethers.utils.parseEther("2000")
    console.log(tokenAmount.toString())
    console.log("Deploying Pool");
    const tokenContract = await hre.ethers.getContractFactory("ERC20Mock");
    const vaultContract = await hre.ethers.getContractFactory("Vault");
    const vaultInst = await vaultContract.attach(vault);
  
    const tokenInst = await tokenContract.attach(token);
    await tokenInst.approve(vault, tokenAmount);
    // await vaultInst.deposit(token,owner,owner,tokenAmount,0)
    await vaultInst.setMasterContractApproval(
      owner,
      manager,
      true,
      "0",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
  
  })