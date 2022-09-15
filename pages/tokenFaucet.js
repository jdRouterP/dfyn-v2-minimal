import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { tokenFaucetAbi } from "../constants/abis/token-faucet";
export const injected = new InjectedConnector();
const tokens = [
  "0xc7B8Da9185bBE76907711F34E1D9d12e978da93d",
  "0xb56b6549E17D681BC46203972f49A4f72d1bF22B",
];
const tokensName = ["USDC2", "USDC"];
export default function Faucet() {
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
      const signer = provider.getSigner();
      const tokenInst = new ethers.Contract(
        tokens[num],
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
            address: tokens[num], // The address that the token is at.
            symbol: tokensName[num], // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
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
        <h1>Token Faucet</h1>
        {active ? (
          <>
            <div>
              Token 0 :{" "}
              <button onClick={() => tokenRequest(0)}>Get Token</button>
              <button onClick={() => addToken(0)}>
                Add token to metamask Token
              </button>
            </div>
            <div>
              Token 1 :{" "}
              <button onClick={() => tokenRequest(1)}>Get Token</button>
              <button onClick={() => addToken(1)}>
                Add token to MetaMask Token
              </button>
            </div>
          </>
        ) : (
          <>Connect wallet</>
        )}
      </div>
    </div>
  );
}
