import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  getSqrtX96FromPrice,
  nearestValidTick
} from "../utils/math";

import { ethers } from "hardhat";

task("deploycontracts").setAction(async function (taskArguments: TaskArguments, hre) {
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

  const ConcentratedLiquidityPoolHelperContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPoolHelper");
  const concentratedLiquidityPoolHelper = await  ConcentratedLiquidityPoolHelperContract.deploy();
  await concentratedLiquidityPoolHelper.deployed();

  console.log("concentratedLiquidityPoolHelper deployed at ", concentratedLiquidityPoolHelper.address);

});


