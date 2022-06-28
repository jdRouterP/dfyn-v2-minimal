import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const injected = new InjectedConnector();

export default function Home() {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [pool, setPool] = useState('');
  const [price, setPrice] = useState('');
  const [zeroForOne, setZeroForOne] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');

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
  return (
    <div className="container">
      <h1>Place Limit Order</h1>
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
                <label htmlFor="exampleInputEmail1" className="form-label">ZeroForOne</label>
                <input  className="form-control"
                onChange={event=>setZeroForOne(event.target.value)}
                type="text"
                value={zeroForOne} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">price</label>
                <input  className="form-control"
                onChange={event=>setPrice(event.target.value)}
                type="text"
                value={price} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">TokenAmount</label>
                <input  className="form-control"
                onChange={event=>setTokenAmount(event.target.value)}
                type="text"
                value={tokenAmount} />
              </div>
              {active ? <button type="button" className="btn btn-success btn-space" onClick={()=>approveTokens()}>Approve</button> : ""}
              {active ? <button type="button" className="btn btn-primary btn-space" onClick={()=>addliquidity()}>Add Liquidity</button> : ""}
              {active ? <button type="button" className="btn btn-primary btn-space" onClick={()=>getvalidPrice()}>Find Valid price</button> : ""}
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
  );
}
