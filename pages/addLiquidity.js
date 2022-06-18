import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {erc20TokenAbi} from "../constants/abis/contracts/mocks/ERC20Mock.sol/ERC20Mock"
import {MasterDeployer,factory,Vault,Manager,TickMath,TridentMath,PoolHelper} from "../constants/constants"
import {poolAbi} from "../constants/pool"
import { vaultAbi } from "../constants/vault";
import { poolHelperAbi } from "../constants/poolHelper";
import {getSqrtX96FromPrice,
  getSqrtX96FromPrice1,
  nearestValidTick,
  findLowerValidTick,
  findUpperValidTick,
  getpriceFromSqrtX96,
  getpriceFromSqrtX961,
  getBigNumber,
  oldTickFinder} from "../utils/tick"
import { tickMathAbi } from "../constants/tickmath";
import  { poolManagerAbi } from "../constants/poolManager";
import { tridentMathUIAbi } from "../constants/tridentMath";
import { BigNumber, BigNumberish } from "ethers";




export const injected = new InjectedConnector();

export default function Addliquidity() {
  //States
  const [hasMetamask, setHasMetamask] = useState(false);
  const [lowerPrice,setLowerPrice]=useState('');
  const [upperPrice,setUpperPrice]=useState('');
  const [pool,setPool]=useState('0xb1a768834E20E76fa592F8126f1F831bDBc7fC29')
  const [tokenId,setTokenId]=useState('0');
  const [token0Amount,setToken0Amount]=useState('')
  const [token1Amount,setToken1Amount]=useState('');
  const [lowerTick,setLowerTick]=useState('');
  const [upperTick,setUpperTick]=useState('');
  const [upperOldTick,setUpperOldTick]=useState('');
  const [lowerOldTick,setLowerOldTick]=useState('');
 
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
        const tridentMathInst= new ethers.Contract(TridentMath,tridentMathUIAbi, signer)

        const twoX192=BigNumber.from(2).pow(96);
        //Fetching current Pool Price
        const poolCurrentprice=(await poolInst.getPriceAndNearestTicks())._price
        const currentprice=await tridentMathInst.priceFromSqrtprice(twoX192,poolCurrentprice.toString());
        console.log('current pool price',currentprice.toString())

        //Lower Price calculation

      const desiredSqrtX96Price=await tridentMathInst.sqrtPriceFromPrice(twoX192.toString(),lowerPrice.toString())
      console.log("desired lowerSqrtX96",desiredSqrtX96Price.toString())
      
      const desiredLowerTick=await tickMathInst.getTickAtSqrtRatio(desiredSqrtX96Price.toString())
      console.log("Desired Lower Tick",desiredLowerTick)

      let lowerValidTick= await findLowerValidTick(desiredLowerTick,_tickSpacing);
      console.log("Valid Even tick",lowerValidTick)

      
      let lowerValidSqrtPrice=await tickMathInst.getSqrtRatioAtTick(lowerValidTick.toString());
      console.log('lower price from tick',lowerValidSqrtPrice.toString())


      const actuallowerPrice=await tridentMathInst.priceFromSqrtprice(twoX192,lowerValidSqrtPrice.toString());
      console.log('lower price actual ',actuallowerPrice.toString())



        // Upper Tick Calculation

      const upperSqrtX96=await tridentMathInst.sqrtPriceFromPrice(twoX192.toString(),upperPrice.toString())
      console.log("desired upperSqrtX96",upperSqrtX96.toString())
      
      const tickAtUpperPrice=await tickMathInst.getTickAtSqrtRatio( upperSqrtX96.toString())
      console.log("Desired Upper Tick",tickAtUpperPrice.toString())

      let UpperValidTick= await findUpperValidTick(tickAtUpperPrice,_tickSpacing);
      console.log("Valid Upper tick",UpperValidTick)

      let UpperSqrtX96Valid=await tickMathInst.getSqrtRatioAtTick(UpperValidTick.toString());
      console.log('Upper price from tick',UpperSqrtX96Valid.toString())

      const finalUpperPrice=await tridentMathInst.priceFromSqrtprice(twoX192,UpperSqrtX96Valid.toString());

      console.log('Upper price actual ',finalUpperPrice.toString())

      //finding upper and lower old ticks
      
      //Updating states
      setLowerTick(lowerValidTick)
      setUpperTick(UpperValidTick)
      setLowerPrice(actuallowerPrice)
      setUpperPrice(finalUpperPrice)
  
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function findOldTicks(){
    const signer = provider.getSigner();
    const poolInst = new ethers.Contract(pool,poolAbi, signer);
    const poolhelperInst = new ethers.Contract(PoolHelper,poolHelperAbi, signer);

    const tickCount=await poolInst.tickCount();
    const validTicksData=await poolhelperInst.getTickState(pool,tickCount);
    const validTicks=[];
    validTicksData.map((tickData)=>{
      validTicks.push(tickData.index);
    })
    //Including current ticks
    validTicks.push(lowerTick,upperTick)
    //Sorting in ascending Order
    validTicks.sort(function (a, b) {
      return a - b;
    });
    console.log('valiticks',validTicks)
    let lowerOld = oldTickFinder(validTicks, lowerTick);
    let upperOld = oldTickFinder(validTicks, upperTick);
    console.log('low1',lowerOld)
    console.log('low2',upperOld)
    setUpperOldTick(upperOld)
    setLowerOldTick(lowerOld)
  }
  async function addliquidity() {
    if (active) {
      const signer = provider.getSigner();
      const poolManagerInst = new ethers.Contract(Manager,poolManagerAbi, signer);
      let tokenXamount=getBigNumber(token0Amount)
      let tokenYamount=getBigNumber(token1Amount)
      console.log('pool',pool)
      console.log('loweroldTick',lowerOldTick)
      console.log('LowerTick',lowerTick)
      console.log('UpperOldTick',upperOldTick)
      console.log('UpperTick',upperTick)
      console.log('tokenXamount',tokenXamount)
      console.log('tokenYamount',tokenYamount)
      console.log('tokenId',tokenId)
      try {
        await poolManagerInst.mint(
          pool,
          lowerOldTick,
          lowerTick,
          upperOldTick,
          upperTick,
          tokenXamount.toString(),
          tokenYamount.toString(),
          true,
          "0",
          tokenId,
        )
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
                onChange={event=>setPool(event.target.value)}
                type="text"
                value={pool} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">tokenId</label>
                <input  className="form-control"
                onChange={event=>setTokenId(event.target.value)}
                type="text"
                value={tokenId} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">Upper price</label>
                <input  className="form-control"
                onChange={event=>setUpperPrice(event.target.value)}
                type="text"
                value={upperPrice} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Lower Price</label>
                <input  className="form-control"
                onChange={event=>setLowerPrice(event.target.value)}
                type="text"
                value={lowerPrice} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Token A amount</label>
                <input  className="form-control"
                onChange={event=>setToken0Amount(event.target.value)}
                type="text"
                value={token0Amount} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Token B amount</label>
                <input  className="form-control"
                onChange={event=>setToken1Amount(event.target.value)}
                type="text"
                value={token1Amount} />
              </div>
              {active ? <button type="button" className="btn btn-success btn-space" onClick={()=>approveTokens()}>Approve</button> : ""}
              {active ? <button type="button" className="btn btn-primary btn-space" onClick={()=>addliquidity()}>Add Liquidity</button> : ""}
              {active ? <button type="button" className="btn btn-primary btn-space" onClick={()=>getvalidPrice()}>Find Valid price</button> : ""}
              {active ? <button type="button" className="btn btn-primary btn-space" onClick={()=>findOldTicks()}>Find Old Ticks</button> : ""}
            </form>
          </div>
        </div>
      <h1>WorkFlow</h1>

      <h3>1.Click Connect</h3>
      <h3>2.Enter values</h3>
      <h3>3.Click Find valid Price</h3>
      <h3>4.Click Find Old Tick</h3>
      <h3>5.Click Approve</h3>
      <h3>6.Click AddLiquidity</h3>
      </div>
    </div>
  );
}
