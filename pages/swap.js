import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {routerAbi} from "../constants/router"
import { vaultAbi } from "../constants/vault";
import {erc20TokenAbi} from "../constants/abis/contracts/mocks/ERC20Mock.sol/ERC20Mock"
import {Router,Vault} from "../constants/constants"

export const injected = new InjectedConnector();

export default function Swap() {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [inAmount, setInAmount] = useState(false);
  const [pool,setPool]=useState('0xb1a768834E20E76fa592F8126f1F831bDBc7fC29')
  const [zeroForOne,setZeroForOne]=useState(true)
  const [unwrapVault,setUnWrapVault]=useState(true)
  const [tokenAddress,setTokenAddress]=useState('')
  const [amountOutMinimum,setAmountOutMinimum]=useState('0')



  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  const {
    active,
    activate,
    chainId,
    account,
    library: provider,
  } = useWeb3React();

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await activate(injected);
        setHasMetamask(true);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function approveTokens() {
    if (active) {
      const signer = provider.getSigner();
      const accountAddress=await signer.getAddress()
      console.log('signer',accountAddress)
      const poolInst = new ethers.Contract(pool,poolAbi, signer);
      const{ _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1}=await poolInst.getImmutables()
        console.log('hello')
        const tokenAInst= new ethers.Contract(_token0,erc20TokenAbi, signer)
        const tokenBInst= new ethers.Contract(_token1,erc20TokenAbi, signer)
        const vaultInst=new ethers.Contract(Vault,vaultAbi,signer);
      try {
        await tokenAInst.approve(Vault,getBigNumber(token0Amount));
        await tokenBInst.approve(Vault,getBigNumber(token1Amount));
        await vaultInst.setMasterContractApproval(
          accountAddress,
          Manager,
          true,
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        await vaultInst.deposit(_token0,accountAddress,pool,getBigNumber(token0Amount))
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }



  async function depositToVault() {
    if (active) {
      const signer = provider.getSigner();
      const vaultInst = new ethers.Contract(Vault,vaultAbi,signer);
      const poolInst = new ethers.Contract(pool,poolAbi, signer);
      const{ _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1}=await poolInst.getImmutables()
      try {
        await vaultInst.deposit(_token0,accountAddress,pool,getBigNumber(token0Amount));
        setTokenAddress(_token0)
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }


  async function SwapIn() {
    if (active) {
      const signer = provider.getSigner();
      const routerInst = new ethers.Contract(Router,routerAbi, signer);
      const deployData = await ethers.utils.defaultAbiCoder.encode(
        ["bool", "address", "bool"],
        [zeroForOne, receipient,unwrapVault]
      );
      let swapParams={
        pool:pool,
        tokenIn:tokenAddress,
        amountIn:getBigNumber(token0Amount),
        data:deployData,
        amountOutMinimum:amountOutMinimum
      }
      try {
        await routerInst.exactInputSingle(swapParams);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <div>
      {hasMetamask ? (
        active ? (
          "Connected! "
        ) : (
          <button className="btn btn-danger float-end" onClick={() => connect()}>Connect</button>
        )
      ) : (
        "Please install metamask"
      )}
      <div className="container">
      <h1>Swap In</h1>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">Pool</label>
                <input  className="form-control"
                onChange={event=>setPool(event.target.value)}
                type="text"
                value={pool} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">InAmount</label>
                <input  className="form-control"
                onChange={event=>setInAmount(event.target.value)}
                type="text"
                value={inAmount} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">OutAmount</label>
                <input type="password" className="form-control" id="exampleInputPassword1" />
              </div>
              {active ? <button type="submit" className="btn btn-success btn-space" onClick={()=>approveTokens()}>Approve</button> : ""}
              {active ? <button type="submit" className="btn btn-success btn-space" onClick={()=>depositToVault()}>Deposit To Vault</button> : ""}
              {active ? <button type="submit" className="btn btn-primary " onClick={()=>SwapIn()}>Swap</button> : ""}
            </form>
          </div>
        </div>
        <h1>Swap out</h1>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">Pool</label>
                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">InAmount</label>
                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">OutAmount</label>
                <input type="password" className="form-control" id="exampleInputPassword1" />
              </div>
              {active ? <button type="submit" className="btn btn-success btn-space">Approve</button> : ""}
              {active ? <button type="submit" className="btn btn-primary ">Swap</button> : ""}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
