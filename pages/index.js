import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { MasterDeployer, factory, Vault } from "../constants/constants";
// import {erc20TokenAbi} from "../constants/abis/contracts/mocks/ERC20Mock.sol/ERC20Mock"
import { masterDeployerAbi } from "../constants/masterdeployer";
import { factoryAbi } from "../constants/factory";

export const injected = new InjectedConnector();

export default function Createpool() {
  const TWO_POW_96 = BigNumber.from(2).pow(96);
  const [values, setValues] = useState({
    tokenA: "0x999D86E29A04B4354d5149aBdB32c6A766894438",
    tokenB: "0x528BC890512D07f95D42D8249bAF55E3Bc3B3B8f",
    error: "",
    price: "1",
    fee: "5",
    tickSpacing: "60",
    tokenAAmount: "",
    tokenBAmount: "",
    success: false,
  });
  const {
    tokenA,
    tokenB,
    price,
    tokenAAmount,
    tokenBAmount,
    fee,
    tickSpacing,
    error,
    success,
  } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const [hasMetamask, setHasMetamask] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  }, []);

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

  async function deployPool() {
    if (active) {
      const signer = provider.getSigner();
      const masterDeployer = new ethers.Contract(
        MasterDeployer,
        masterDeployerAbi,
        signer
      );
      let sqrtprice=TWO_POW_96.mul(price)
      const deployData = await ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint24", "uint160", "uint24"],
        [tokenB, tokenA, fee,sqrtprice, tickSpacing]
      );
      try {
        await masterDeployer.deployPool(factory, deployData);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <>
      {hasMetamask ? (
        active ? (
          "Connected! "
        ) : (
          <button
            className="btn btn-danger float-end"
            onClick={() => connect()}
          >
            Connect
          </button>
        )
      ) : (
        "Please install metamask"
      )}
      <div className="container">
        <h1>Create Pool</h1>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  TokenA
                </label>
                <input
                  className="form-control"
                  onChange={handleChange("tokenA")}
                  type="text"
                  value={tokenA}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  TokenB
                </label>
                <input
                  className="form-control"
                  onChange={handleChange("tokenB")}
                  type="text"
                  value={tokenB}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  Price
                </label>
                <input
                  className="form-control"
                  onChange={handleChange("price")}
                  type="text"
                  value={price}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  Fee
                </label>
                <input
                  className="form-control"
                  onChange={handleChange("fee")}
                  type="text"
                  value={fee}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  tickSpacing
                </label>
                <input
                  className="form-control"
                  onChange={handleChange("tickSpacing")}
                  type="text"
                  value={tickSpacing}
                />
              </div>
              {active ? (
                <button
                  type="button"
                  className="btn btn-primary "
                  onClick={() => deployPool()}
                >
                  Create
                </button>
              ) : (
                ""
              )}
            </form>
          </div>
         
        </div>
        <h1>Work Flow</h1>
          <h3>1.Click Connect</h3>
          <h3>2.Enter values</h3>
          <h3>3.Click Create</h3>
      </div>
    </>
  );
}
