import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { routerAbi } from "../constants/router";
import { vaultAbi } from "../constants/vault";
import { erc20TokenAbi } from "../constants/abis/contracts/mocks/ERC20Mock.sol/ERC20Mock";
import { Router, Vault } from "../constants/constants";
import { poolAbi } from "../constants/pool";
import {
  getSqrtX96FromPrice,
  getSqrtX96FromPrice1,
  nearestValidTick,
  findLowerValidTick,
  findUpperValidTick,
  getpriceFromSqrtX96,
  getpriceFromSqrtX961,
  getBigNumber,
  oldTickFinder,
} from "../utils/tick";

export const injected = new InjectedConnector();

export default function Swap() {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [inAmount, setInAmount] = useState('');
  const [pool, setPool] = useState(
    "0xb1a768834E20E76fa592F8126f1F831bDBc7fC29"
  );
  const [unwrapVault, setUnWrapVault] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [amountOutMinimum, setAmountOutMinimum] = useState("0");

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

  async function approveToken0() {
    if (active) {
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      console.log("signer", accountAddress);
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const {
        _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1,
      } = await poolInst.getImmutables();
      const tokenAInst = new ethers.Contract(_token0, erc20TokenAbi, signer);
      const vaultInst = new ethers.Contract(Vault, vaultAbi, signer);
      try {
        await tokenAInst.approve(Vault, getBigNumber(inAmount));
        await vaultInst.setMasterContractApproval(
          accountAddress,
          Router,
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

  async function approveToken1() {
    if (active) {
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      console.log("signer", accountAddress);
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const {
        _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1,
      } = await poolInst.getImmutables();
      const tokenBInst = new ethers.Contract(_token1, erc20TokenAbi, signer);
      const vaultInst = new ethers.Contract(Vault, vaultAbi, signer);
      try {
        await tokenBInst.approve(Vault, getBigNumber(inAmount));
        await vaultInst.setMasterContractApproval(
          accountAddress,
          Router,
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

  async function depositToVault0() {
    if (active) {
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      const vaultInst = new ethers.Contract(Vault, vaultAbi, signer);
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const {
        _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1,
      } = await poolInst.getImmutables();
      console.log("account Address", accountAddress);
      console.log("inAmount", getBigNumber(inAmount));
      try {
        await vaultInst.deposit(
          _token0,
          accountAddress,
          accountAddress,
          getBigNumber(inAmount),
          "0"
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }



  async function depositToVault1() {
    if (active) {
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      const vaultInst = new ethers.Contract(Vault, vaultAbi, signer);
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const {
        _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1,
      } = await poolInst.getImmutables();
      let token;
      console.log("account Address", accountAddress);
      console.log("inAmount", getBigNumber(inAmount));
      try {
        await vaultInst.deposit(
          _token1,
          accountAddress,
          accountAddress,
          getBigNumber(inAmount),
          "0"
        );
        setTokenAddress(_token1);
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
      const routerInst = new ethers.Contract(Router, routerAbi, signer);
      const accountAddress = await signer.getAddress();
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const {
        _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1,
      } = await poolInst.getImmutables();
      let token;
      let zeroForOne=true;
      const deployData = await ethers.utils.defaultAbiCoder.encode(
        ["bool", "address", "bool"],
        [zeroForOne, accountAddress, unwrapVault]
      );
      let swapParams = {
        pool: pool,
        tokenIn: _token0,
        amountIn: getBigNumber(inAmount),
        data: deployData,
        amountOutMinimum: "0",
      };
      console.log(swapParams);
      try {
        await routerInst.exactInputSingle(swapParams);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function SwapOut() {
    if (active) {
      const signer = provider.getSigner();
      const routerInst = new ethers.Contract(Router, routerAbi, signer);
      const accountAddress = await signer.getAddress();
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const {
        _MAX_TICK_LIQUIDITY,
        _tickSpacing,
        _swapFee,
        _barFeeTo,
        _vault,
        _masterDeployer,
        _token0,
        _token1,
      } = await poolInst.getImmutables();
      const zeroForOne=false;
      const deployData = await ethers.utils.defaultAbiCoder.encode(
        ["bool", "address", "bool"],
        [zeroForOne, accountAddress, unwrapVault]
      );
      const inAmount1=getBigNumber(inAmount.toString());
      let swapParams = {
        pool: pool,
        tokenIn: _token1,
        amountIn: inAmount1,
        data: deployData,
        amountOutMinimum: "0",
      };
      console.log(swapParams);
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
          "Connected!"
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
        <h1>Swap In</h1>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Pool
                </label>
                <input
                  className="form-control"
                  onChange={(event) => setPool(event.target.value)}
                  type="text"
                  value={pool}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  InAmount
                </label>
                <input
                  className="form-control"
                  onChange={(event) => setInAmount(event.target.value)}
                  type="text"
                  value={inAmount}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  OutAmount
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="exampleInputPassword1"
                />
              </div>
              {active ? (
                <button
                  type="button"
                  className="btn btn-success btn-space"
                  onClick={() => approveToken0()}
                >
                  Approve
                </button>
              ) : (
                ""
              )}
              {active ? (
                <button
                  type="button"
                  className="btn btn-success btn-space"
                  onClick={() => depositToVault0()}
                >
                  Deposit To Vault
                </button>
              ) : (
                ""
              )}
              {active ? (
                <button
                  type="button"
                  className="btn btn-primary "
                  onClick={() => SwapIn()}
                >
                  Swap
                </button>
              ) : (
                ""
              )}
            </form>
          </div>
        </div>
        <h1>Swap out</h1>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Pool
                </label>
                <input
                  className="form-control"
                  onChange={(event) => setPool(event.target.value)}
                  type="text"
                  value={pool}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  InAmount
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="exampleInputPassword1"
                />
                <div className="mb-3">
                  <label htmlFor="exampleInputPassword1" className="form-label">
                    OutAmount
                  </label>
                  <input
                    className="form-control"
                    onChange={(event) => setInAmount(event.target.value)}
                    type="text"
                    value={inAmount}
                  />
                </div>
              </div>
              {active ? (
                <button
                  type="button"
                  className="btn btn-success btn-space"
                  onClick={() => approveToken1()}
                >
                  Approve
                </button>
              ) : (
                ""
              )}
              {active ? (
                <button
                  type="button"
                  className="btn btn-success btn-space"
                  onClick={() => depositToVault1()}
                >
                  Deposit To Vault
                </button>
              ) : (
                ""
              )}
              {active ? (
                <button
                  type="button"
                  className="btn btn-primary "
                  onClick={() => SwapOut()}
                >
                  Swap
                </button>
              ) : (
                ""
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
