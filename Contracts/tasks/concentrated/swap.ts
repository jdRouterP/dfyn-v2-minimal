import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  getSqrtX96FromPrice,
  nearestValidTick
} from "../utils/math";

import { ethers } from "hardhat";

import {CLRPool} from "../utils/tines/src/CLPool";
const helper=new CLRPool()

task("Swap").setAction(async function (taskArguments: TaskArguments, hre) {
    const ConcentratedLiquidityPoolHelper='0xCcE59A5668Ebcd3756d73127679FdC05FDDC68F1';
    const poolAddress='0xD03096cF7Ac1D6F1a514b3e9eDAA2508b63782c2'
    const dydx='0x38A79b10800E88c07C76c763c5374b95B78B952b'
    const ticks='0x264E77E82A34E42e702472d0B733Cf766634038c'
    const ConcentratedLiquidityPoolHelperContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPoolHelper");
    const poolContract = await hre.ethers.getContractFactory("ConcentratedLiquidityPool", {
      libraries: {
        DyDxMath: dydx,
        Ticks: ticks,
      },
    });
    const poolInst=await poolContract.attach(poolAddress)
    const concentratedLiquidityPoolHelperInst = await  ConcentratedLiquidityPoolHelperContract.attach(ConcentratedLiquidityPoolHelper);
    const tickCount=await poolInst.tickCount();
    console.log('tickCount',tickCount.toString());
    const tickData=await concentratedLiquidityPoolHelperInst.getTickState(poolAddress,tickCount);
    console.log(tickData);
  })