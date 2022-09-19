import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { routerAbi } from "../constants/router";
import { tickMathAbi } from "../constants/tickmath";
import { tridentMathUIAbi } from "../constants/tridentMath";
import { vaultAbi } from "../constants/vault";
import { erc20TokenAbi } from "../constants/abis/contracts/mocks/ERC20Mock.sol/ERC20Mock";
import { Router, Vault, TridentMath } from "../constants/constants";
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
import { factoryAbi } from "../constants/factory";
import { factory } from "../constants/constants";
export const injected = new InjectedConnector();

export default function Swap() {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [inAmount, setInAmount] = useState("");
  const [token0, setToken0] = useState(
    "0xb56b6549E17D681BC46203972f49A4f72d1bF22B"
  );
  const [token1, setToken1] = useState(
    "0xc7B8Da9185bBE76907711F34E1D9d12e978da93d"
  );
  const [pool, setPool] = useState("");
  const [currentprice, setCurrentPrice] = useState("");
  const [unwrapVault, setUnWrapVault] = useState(true);
  const [tokenAddress, setTokenAddress] = useState("");
  const [amountOutMinimum, setAmountOutMinimum] = useState("0");

  const [swap0btnstatus, setswap0btnstatus] = useState(undefined);
  const [swap1btnstatus, setswap1btnstatus] = useState(undefined);

  const {
    active,
    activate,
    chainId,
    account,
    library: provider,
  } = useWeb3React();

  useEffect(() => {
    if (!active) {
      setswap0btnstatus("Wallet Not Connected");
    } else if (token0 === "") {
      setswap0btnstatus("Enter Token0");
    } else if (token1 === "") {
      setswap0btnstatus("Enter Token1");
    } else if (pool === "") {
      setswap0btnstatus("Pool not found");
    } else if (inAmount === "") {
      setswap0btnstatus("Enter Amount In");
    } else {
      setswap0btnstatus(undefined);
    }
  }, [active, token0, token1, pool, inAmount]);
  useEffect(() => {
    if (!active) {
      setswap1btnstatus("Wallet Not Connected");
    } else if (token0 === "") {
      setswap1btnstatus("Enter Token0");
    } else if (token1 === "") {
      setswap1btnstatus("Enter Token1");
    } else if (pool === "") {
      setswap1btnstatus("Pool not found");
    } else if (inAmount === "") {
      setswap1btnstatus("Enter Amount In");
    } else {
      setswap1btnstatus(undefined);
    }
  }, [active, token0, token1, pool, inAmount]);

  useEffect(() => {
    if (token0 !== "" && token1 !== "") {
      getPool();
    }
  }, [token0, token1, active]);
  useEffect(() => {
    if (pool !== "") {
      getPrice();
    }
  }, [pool]);

  async function getPool() {
    if (active) {
      const signer = provider.getSigner();
      const factoryContract = new ethers.Contract(factory, factoryAbi, signer);
      try {
        const pools = await factoryContract.pools(token0, token1, 0);
        setPool(pools);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }
  async function getPrice() {
    if (active) {
      const signer = provider.getSigner();
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const tridentMathInst = new ethers.Contract(
        TridentMath,
        tridentMathUIAbi,
        signer
      );
      const twoX192 = BigNumber.from(2).pow(96);

      try {
        const poolCurrentprice = await poolInst.price();
        console.log(poolCurrentprice.toString());
        const currentprice = await tridentMathInst.priceFromSqrtprice(
          twoX192.toString(),
          poolCurrentprice.toString()
        );
        console.log(currentprice.toString());
        setCurrentPrice(currentprice.toString());
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  }, []);

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
      const _token0 = await poolInst.token0();

      const tokenAInst = new ethers.Contract(_token0, erc20TokenAbi, signer);
      const vaultInst = new ethers.Contract(Vault, vaultAbi, signer);
      try {
        let tx = await tokenAInst.approve(pool, getBigNumber(inAmount));
        await tx.wait();
        tx = await tokenAInst.approve(Vault, getBigNumber(inAmount));
        await tx.wait();

        tx = await vaultInst.setMasterContractApproval(
          accountAddress,
          Router,
          true,
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        await tx.wait();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function getTickAtCurrentPrice(pool) {
    return getTickAtPrice((await pool.getPriceAndNearestTicks())._price);
  }

  function getTickAtPrice(price) {
    // tickMath Contract
    return Dfyn.Instance.tickMath.getTickAtSqrtRatio(price);
  }

  async function approveToken1() {
    if (active) {
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      console.log("signer", accountAddress);
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const _token1 = await poolInst.token1();

      const tokenBInst = new ethers.Contract(_token1, erc20TokenAbi, signer);
      const vaultInst = new ethers.Contract(Vault, vaultAbi, signer);
      try {
        let tx = await tokenBInst.approve(pool, getBigNumber(inAmount));
        await tx.wait();
        tx = await tokenBInst.approve(Vault, getBigNumber(inAmount));
        await tx.wait();

        tx = await vaultInst.setMasterContractApproval(
          accountAddress,
          Router,
          true,
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        await tx.wait();
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
      const _token0 = await poolInst.token0();
      console.log("account Address", accountAddress);
      console.log("inAmount", getBigNumber(inAmount));
      try {
        const tx = await vaultInst.deposit(
          _token0,
          accountAddress,
          accountAddress,
          getBigNumber(inAmount),
          "0"
        );
        await tx.wait();
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
      const _token1 = await poolInst.token1();
      let token;
      console.log("account Address", accountAddress);
      console.log("inAmount", getBigNumber(inAmount));
      try {
        const tx = await vaultInst.deposit(
          _token1,
          accountAddress,
          accountAddress,
          getBigNumber(inAmount),
          "0"
        );
        await tx.wait();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function SwapIn() {
    if (active) {
      setswap0btnstatus("Approving token!");
      await approveToken0();
      setswap0btnstatus("Depositing to vault!");
      await depositToVault0();
      setswap0btnstatus("Swapping!");
      const signer = provider.getSigner();
      const routerInst = new ethers.Contract(Router, routerAbi, signer);
      const accountAddress = await signer.getAddress();
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const _token0 = await poolInst.token0();
      let token;
      let zeroForOne = true;
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
        const tx = await routerInst.exactInputSingle(swapParams);
        await tx.wait();
        getPrice();
        setswap0btnstatus(undefined);
      } catch (error) {
        console.log(error);
        setswap0btnstatus("error");
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function SwapOut() {
    if (active) {
      setswap1btnstatus("Approving token!");

      await approveToken1();
      setswap1btnstatus("Depositing to vault!");

      await depositToVault1();
      setswap1btnstatus("Swapping!");

      const signer = provider.getSigner();
      const routerInst = new ethers.Contract(Router, routerAbi, signer);
      const accountAddress = await signer.getAddress();
      const poolInst = new ethers.Contract(pool, poolAbi, signer);
      const _token1 = await poolInst.token1();
      const zeroForOne = false;
      const deployData = await ethers.utils.defaultAbiCoder.encode(
        ["bool", "address", "bool"],
        [zeroForOne, accountAddress, unwrapVault]
      );
      const inAmount1 = getBigNumber(inAmount.toString());
      let swapParams = {
        pool: pool,
        tokenIn: _token1,
        amountIn: inAmount1,
        data: deployData,
        amountOutMinimum: "0",
      };
      console.log(swapParams);
      try {
        const tx = await routerInst.exactInputSingle(swapParams);
        await tx.wait();
        getPrice();
        setswap1btnstatus(undefined);
      } catch (error) {
        console.log(error);
        setswap1btnstatus("Error");
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <div>
      {hasMetamask ? (
        active ? (
          chainId === 80001 ? (
            "Connected! "
          ) : (
            <button className="btn btn-danger float-end">
              Switch To Mumbai
            </button>
          )
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
                  Token0
                </label>
                <input
                  className="form-control"
                  onChange={(event) => setToken0(event.target.value)}
                  type="text"
                  value={token0}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Token1
                </label>
                <input
                  className="form-control"
                  onChange={(event) => setToken1(event.target.value)}
                  type="text"
                  value={token1}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Pool
                </label>
                <input
                  className="form-control"
                  readOnly
                  type="text"
                  value={pool}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Current price
                </label>
                <input
                  className="form-control"
                  type="text"
                  readOnly
                  value={
                    currentprice === ""
                      ? 0
                      : ethers.utils.formatUnits(currentprice, 6)
                  }
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
              {/* {active ? (
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
              )} */}
              {active ? (
                <button
                  type="button"
                  disabled={!!swap0btnstatus}
                  className="btn btn-primary "
                  onClick={() => SwapIn()}
                >
                  {swap0btnstatus ? swap0btnstatus : "Swap"}
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
                  Current price
                </label>
                <input
                  className="form-control"
                  type="text"
                  readOnly
                  value={
                    currentprice === ""
                      ? 0
                      : ethers.utils.formatUnits(currentprice, 6)
                  }
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
              {/* {active ? (
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
              )} */}
              {active ? (
                <button
                  type="button"
                  disabled={!!swap1btnstatus}
                  className="btn btn-primary "
                  onClick={() => SwapOut()}
                >
                  {swap1btnstatus ? swap1btnstatus : "Swap"}
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
