import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  getSqrtX96FromPrice,
  nearestValidTick
} from "../utils/math";

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