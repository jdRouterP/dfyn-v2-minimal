import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  getSqrtX96FromPrice,
  nearestValidTick
} from "../utils/Math";
import { ethers } from "hardhat";



task("deployclp").setAction(async function (taskArguments: TaskArguments, hre) {
  console.log("Deploying Weth:");
  const wethContract = await hre.ethers.getContractFactory("WETH9");
  const weth = await wethContract.deploy();
  await weth.deployed();
  console.log("Deployed at", weth.address);
  console.log("Deploying vault");
  const vaultContract = await hre.ethers.getContractFactory("Vault");
  const vault = await vaultContract.deploy(weth.address);
  await vault.deployed();
  console.log("vault deployed at", vault.address);

  console.log("Deploying MasterDeployer");

  const masterDeployerContract = await hre.ethers.getContractFactory("MasterDeployer");
  const barFee = 50;
  const { deployer, barFeeTo } = await hre.getNamedAccounts();

  const masterDeployer = await masterDeployerContract.deploy(barFee, barFeeTo, vault.address);
  await masterDeployer.deployed();
  console.log("MasterDeployer deployed at", masterDeployer.address);

  console.log("Deploying dydx");
  const dydxContract = await hre.ethers.getContractFactory("DyDxMath");
  const dydx = await dydxContract.deploy();
  await dydx.deployed();
  console.log("Dydx deployed at", dydx.address);
  console.log("Deploying ticks");
  const ticksContract = await hre.ethers.getContractFactory("Ticks");
  const ticks = await ticksContract.deploy();
  await ticks.deployed();
  console.log("Ticks deployed at", ticks.address);

  console.log("Deploying concentrated Pool Factory");
  const factoryContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPoolFactory", {
    libraries: {
      DyDxMath: dydx.address,
      Ticks: ticks.address,
    },
  });

  const factory = await factoryContract.deploy(masterDeployer.address);
  await factory.deployed();
  console.log("factory deployed at", factory.address);

  console.log("Deploying concentrated Pool Manager");

  const managerContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPoolManager");
  const manager = await managerContract.deploy(masterDeployer.address, weth.address);
  await manager.deployed();
  console.log("manager deployed at", manager.address);

  console.log("Whitelisting factory");

  const masterDeployerInst = await masterDeployerContract.attach(masterDeployer.address);
  await masterDeployerInst.addToWhitelist(factory.address);

  console.log("Deploying Tokens");

  const tokenAContract = await hre.ethers.getContractFactory("ERC20Mock");

  const totalsupply = hre.ethers.utils.parseEther("2000000000000000000000000000");
  const tokenA = await tokenAContract.deploy("TokenA", "TK1", totalsupply);
  await tokenA.deployed();
  console.log("tokenA deployed at", tokenA.address);

  const tokenB = await tokenAContract.deploy("TokenB", "TK2", totalsupply);
  await tokenB.deployed();
  console.log("tokenB deployed at", tokenB.address);

  const routerContract = await hre.ethers.getContractFactory("TridentRouter");
  const router = await routerContract.deploy(vault.address, masterDeployer.address, weth.address);
  await router.deployed();

  console.log("router deployed at ", router.address);

  const tickMathContract = await hre.ethers.getContractFactory("TickMathUI");
  const tickMath = await tickMathContract.deploy();
  await tickMath.deployed();

  console.log("tickMath deployed at ", tickMath.address);

  await vault.whitelistMasterContract(manager.address,true);

});

task("deploypool").setAction(async function (taskArguments: TaskArguments, hre) {
   
  let tokenA='0x999D86E29A04B4354d5149aBdB32c6A766894438'
  let tokenB='0x528BC890512D07f95D42D8249bAF55E3Bc3B3B8f'
  let masterDeployerAddress='0x9225A12f9397B7FeB8b917e576Aa8d3C6cF488f9'
  let factoryAddress='0xb715Ad91fd0d19ae47fd8da0519C098A412173D5'
  let dydx='0x38A79b10800E88c07C76c763c5374b95B78B952b'
  let ticks='0x264E77E82A34E42e702472d0B733Cf766634038c'
  console.log("Deploying Pool");
  const fee = 5;
  const tickSpacing = 60;
  const TWO_POW_96 = BigNumber.from(2).pow(96);

  const deployData = await hre.ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "uint24", "uint160", "uint24"],
    [tokenB, tokenA, fee, TWO_POW_96, tickSpacing]
  );
  const masterDeployerContract = await hre.ethers.getContractFactory("MasterDeployer");
  const masterDeployerInst = await masterDeployerContract.attach(masterDeployerAddress);

  await masterDeployerInst.deployPool(factoryAddress, deployData);

  console.log("Deploying concentrated Pool Factory");
  const factoryContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPoolFactory", {
    libraries: {
      DyDxMath: dydx,
      Ticks: ticks,
    },
  });
  const factory = await factoryContract.attach(factoryAddress);

  const poolsCount = await factory.poolsCount(tokenA, tokenB);

  console.log("Pool count", poolsCount.toString());

  const poolAddress = await factory.getPools(tokenA, tokenB, 0, poolsCount.toString());

  console.log("Pool Address", poolAddress);
})


task("addliquidity").setAction(async function (taskArguments: TaskArguments, hre) {
    let tokenA='0x999D86E29A04B4354d5149aBdB32c6A766894438'
    let tokenB='0x528BC890512D07f95D42D8249bAF55E3Bc3B3B8f'
    let pool='0xE01cAA02276d73186Ba417E9149924996eA71133'
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

