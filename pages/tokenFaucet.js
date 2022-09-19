import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { tokenFaucetAbi } from "../constants/abis/token-faucet";
import { tokenFactoryAbi } from "../constants/tokenFactory";
import { tokenFactoryAddress } from "../constants/constants";
export const injected = new InjectedConnector();
const tokensName = ["USDC2", "USDC"];
export default function Faucet() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokens, setTokens] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("");
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
  const tokenRequest = async (num) => {
    if (active) {
      if (tokenAddress === "") return;
      const signer = provider.getSigner();
      const tokenInst = new ethers.Contract(
        tokenAddress,
        tokenFaucetAbi,
        signer
      );
      const tx = await tokenInst.mintMe();
    }
  };
  const addToken = async (num) => {
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
          },
        },
      });

      if (wasAdded) {
        console.log("Thanks for your interest!");
      } else {
        console.log("Your loss!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const createtoken = async () => {
    try {
      if (active) {
        const signer = provider.getSigner();
        const tokenFactoryInst = new ethers.Contract(
          tokenFactoryAddress,
          tokenFactoryAbi,
          signer
        );
        const tx = await tokenFactoryInst.deployNewERC20Token(
          tokenName,
          symbol,
          decimals
        );
        await tx.wait();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAllTokens = async () => {
    try {
      if (active) {
        const signer = provider.getSigner();
        const tokenFactoryInst = new ethers.Contract(
          tokenFactoryAddress,
          tokenFactoryAbi,
          signer
        );
        const tokens = await tokenFactoryInst.getAllTokens();
        setTokens(tokens);
      }
    } catch (error) {
      console.log(error);
    }
  };
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
        <h1>Token factory 🏭</h1>
        <div>
          <label htmlFor="exampleInputEmail1" className="form-label">
            NAME
          </label>
          <input
            className="form-control"
            onChange={(event) => setTokenName(event.target.value)}
            type="text"
            value={tokenName}
          />
        </div>
        <div>
          <label htmlFor="exampleInputEmail1" className="form-label">
            Symbol
          </label>
          <input
            className="form-control"
            onChange={(event) => setSymbol(event.target.value)}
            type="text"
            value={symbol}
          />
        </div>
        <div>
          <label htmlFor="exampleInputEmail1" className="form-label">
            Decimals
          </label>
          <input
            className="form-control"
            onChange={(event) => setDecimals(event.target.value)}
            type="text"
            value={decimals}
          />
        </div>
        <button
          className="btn btn-primary btn-space"
          onClick={() => createtoken()}
        >
          Create Token 🏗
        </button>
        <div>
          5 newly created Token List
          {tokens
            .slice(tokens.length - 5 ? tokens.length - 5 : 0)
            .map((token) => {
              return <p key={token}>{token}</p>;
            })}
          <button
            className="btn btn-primary btn-space"
            onClick={() => getAllTokens()}
          >
            Fetch List
          </button>
        </div>
        <h1>Token Faucet</h1>
        {active ? (
          <>
            <div>
              Token 0 :{" "}
              <div>
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Token Address
                </label>
                <input
                  className="form-control"
                  onChange={(event) => setTokenAddress(event.target.value)}
                  type="text"
                  value={tokenAddress}
                />
              </div>
              <button
                className="btn btn-primary btn-space"
                onClick={() => tokenRequest()}
              >
                Get Token
              </button>
              {/* <button onClick={() => addToken()}>
                Add token to metamask Token
              </button> */}
            </div>
            {/* <div>
              Token 1 :{" "}
              <button onClick={() => tokenRequest(1)}>Get Token</button>
              <button onClick={() => addToken(1)}>
                Add token to MetaMask Token
              </button>
            </div> */}
          </>
        ) : (
          <>Connect wallet</>
        )}
      </div>
    </div>
  );
}
