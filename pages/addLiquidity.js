import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {erc20TokenAbi} from "../constants/abis/contracts/mocks/ERC20Mock.sol/ERC20Mock"
import {MasterDeployer,factory,Vault,Manager,TickMath} from "../constants/constants"
import {poolAbi} from "../constants/pool"
import { vaultAbi } from "../constants/vault";
import {getSqrtX96FromPrice,nearestValidTick,findLowerValidTick,findUpperValidTick,getpriceFromSqrtX96} from "../utils/tick"
import { tickMathAbi } from "../constants/tickmath";


export const injected = new InjectedConnector();

export default function Addliquidity() {
  const [hasMetamask, setHasMetamask] = useState(false);

  const [values, setValues] = useState({
    pool: "0xb1a768834E20E76fa592F8126f1F831bDBc7fC29",
    tokenId: "0",
    upperPrice: "",
    lowerPrice:'',
    tokenAAmount:'',
    tokenBAmount:'',
    success: false
  });
  const { pool,tokenId,lowerPrice,upperPrice,tokenAAmount,tokenBAmount,fee,tickSpacing,error, success } = values;

  const handleChange = name => event => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

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
        await tokenAInst.approve(Vault,tokenAAmount);
        await tokenBInst.approve(Vault,tokenBAmount);
        await vaultInst.setMasterContractApproval(
          accountAddress,
          Manager,
          true,
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function getvalidPrice() {
    if (active) {
      const signer = provider.getSigner();
      const poolInst = new ethers.Contract(pool,poolAbi, signer);
      const{ _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1}=await poolInst.getImmutables()
      const tickMathInst= new ethers.Contract(TickMath,tickMathAbi, signer)
      console.log("Desired lower price",lowerPrice)
      const lowerSqrtX96=await getSqrtX96FromPrice(lowerPrice.toString())
      console.log("desired lowerSqrtX96",lowerSqrtX96.toString())
      const tickAtLowerPrice=await tickMathInst.getTickAtSqrtRatio(lowerSqrtX96.toString())
      console.log("Desired Lower Tick",tickAtLowerPrice)

      let lowestEvenTick= findLowerValidTick(tickAtLowerPrice,_tickSpacing);
      console.log("Valid Even tick",lowestEvenTick)

      let lowerSqrtX96actual=await tickMathInst.getSqrtRatioAtTick(lowestEvenTick.toString());
      console.log('lower price from tick',lowerSqrtX96actual.toString())

      const actuallowerPrice=getpriceFromSqrtX96(lowerSqrtX96actual)
      console.log("actual lower price",actuallowerPrice.toString())


      setValues({ ...values, error: false, lowerPrice: actuallowerPrice.toString() });
      const upperSqrtX96=getSqrtX96FromPrice(upperPrice)
      const tickAtUpperPrice=await tickMathInst.getTickAtSqrtRatio(upperSqrtX96)
      console.log("Desired Upper Tick",tickAtUpperPrice)

      let upperOddTick= findUpperValidTick(tickAtUpperPrice,tickSpacing);
      console.log('Valid  upper tick',upperOddTick.toString())
      let upperSqrtX96actual=await tickMathInst.getSqrtRatioAtTick(upperOddTick.toString());
      const actualupperPrice=getpriceFromSqrtX96(upperSqrtX96actual)
      console.log("actual upper price",actualupperPrice.toString())

      setValues({ ...values, error: false, upperPrice:actualupperPrice.toString() });
    } else {
      console.log("Please install MetaMask");
    }
  }
  async function addliquidity() {
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        await contract.store(42);
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
      <h1>AddLiquidity</h1>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">Pool</label>
                <input  className="form-control"
                onChange={handleChange("pool")}
                type="text"
                value={pool} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">tokenId</label>
                <input  className="form-control"
                onChange={handleChange("tokenId")}
                type="text"
                value={tokenId} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">Upper price</label>
                <input  className="form-control"
                onChange={handleChange("upperPrice")}
                type="text"
                value={upperPrice} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Lower Price</label>
                <input  className="form-control"
                onChange={handleChange("lowerPrice")}
                type="text"
                value={lowerPrice} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Token A amount</label>
                <input  className="form-control"
                onChange={handleChange("tokenAAmount")}
                type="text"
                value={tokenAAmount} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Token B amount</label>
                <input  className="form-control"
                onChange={handleChange("tokenBAmount")}
                type="text"
                value={tokenBAmount} />
              </div>
              {active ? <button type="button" className="btn btn-success btn-space" onClick={()=>approveTokens()}>Approve</button> : ""}
              {active ? <button type="button" className="btn btn-primary " onClick={()=>getvalidPrice()}>AddLiquidity</button> : ""}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
