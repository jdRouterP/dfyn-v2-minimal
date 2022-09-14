module.exports={
    poolAbi: [
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "_deployData",
            "type": "bytes"
          },
          {
            "internalType": "contract IMasterDeployer",
            "name": "_masterDeployer",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "InvalidLimitOrderFee",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidSwapFee",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidTick",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidToken",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "LiquidityOverflow",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "Locked",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "LowerEven",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "MaxTickLiquidity",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "OnlyOwner",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "Overflow",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "PriceOutOfBounds",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "TickOutOfBounds",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "Token0Missing",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "Token1Missing",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "UpperOdd",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount0",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "name": "Burn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount0",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "name": "Collect",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newLimitOrderFee",
            "type": "uint256"
          }
        ],
        "name": "LimitOrderFeeUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount0",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "name": "Mint",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenIn",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenOut",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          }
        ],
        "name": "Swap",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newSwapFee",
            "type": "uint256"
          }
        ],
        "name": "SwapFeeUpdated",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "_balance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "int24",
            "name": "lower",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "upper",
            "type": "int24"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          }
        ],
        "name": "burn",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "token0Amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token1Amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token0Fees",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token1Fees",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          }
        ],
        "name": "cancelLimitOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountToClaim",
            "type": "uint256"
          },
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          }
        ],
        "name": "claimLimitOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "int24",
            "name": "lower",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "upper",
            "type": "int24"
          }
        ],
        "name": "collect",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount0fees",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1fees",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "collectLimitOrderFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount0",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "collectProtocolFee",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "amount0",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amount1",
            "type": "uint128"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "lowerOld",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "upperOld",
            "type": "int24"
          },
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "native",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          }
        ],
        "name": "createLimitOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "dfynFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "dfynFeeTo",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeGrowthGlobal0",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeGrowthGlobal1",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lastObservation",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "limitOrderFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "limitOrderReserve0",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "limitOrderReserve1",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "int24",
            "name": "",
            "type": "int24"
          }
        ],
        "name": "limitOrderTicks",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "token0Liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token1Liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token0Claimable",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "token1Claimable",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "liquidity",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "",
            "type": "uint128"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "masterDeployer",
        "outputs": [
          {
            "internalType": "contract IMasterDeployer",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "int24",
                "name": "lowerOld",
                "type": "int24"
              },
              {
                "internalType": "int24",
                "name": "lower",
                "type": "int24"
              },
              {
                "internalType": "int24",
                "name": "upperOld",
                "type": "int24"
              },
              {
                "internalType": "int24",
                "name": "upper",
                "type": "int24"
              },
              {
                "internalType": "uint128",
                "name": "amount0Desired",
                "type": "uint128"
              },
              {
                "internalType": "uint128",
                "name": "amount1Desired",
                "type": "uint128"
              },
              {
                "internalType": "bool",
                "name": "native",
                "type": "bool"
              }
            ],
            "internalType": "struct IConcentratedLiquidityPoolStruct.MintParams",
            "name": "mintParams",
            "type": "tuple"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "liquidityMinted",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nearestTick",
        "outputs": [
          {
            "internalType": "int24",
            "name": "",
            "type": "int24"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "int24",
            "name": "",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "",
            "type": "int24"
          }
        ],
        "name": "positions",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "liquidity",
            "type": "uint128"
          },
          {
            "internalType": "uint256",
            "name": "feeGrowthInside0Last",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeGrowthInside1Last",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "price",
        "outputs": [
          {
            "internalType": "uint160",
            "name": "",
            "type": "uint160"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "int24",
            "name": "lowerTick",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "upperTick",
            "type": "int24"
          }
        ],
        "name": "rangeFeeGrowth",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "feeGrowthInside0",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeGrowthInside1",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "reserve0",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "",
            "type": "uint128"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "reserve1",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "",
            "type": "uint128"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "secondsGrowthGlobal",
        "outputs": [
          {
            "internalType": "uint160",
            "name": "",
            "type": "uint160"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint160",
            "name": "_price",
            "type": "uint160"
          }
        ],
        "name": "setPrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "swap",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "swapFee",
        "outputs": [
          {
            "internalType": "uint24",
            "name": "",
            "type": "uint24"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "tickCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "tickSpacing",
        "outputs": [
          {
            "internalType": "uint24",
            "name": "",
            "type": "uint24"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "int24",
            "name": "",
            "type": "int24"
          }
        ],
        "name": "ticks",
        "outputs": [
          {
            "internalType": "int24",
            "name": "previousTick",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "nextTick",
            "type": "int24"
          },
          {
            "internalType": "uint128",
            "name": "liquidity",
            "type": "uint128"
          },
          {
            "internalType": "uint256",
            "name": "feeGrowthOutside0",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "feeGrowthOutside1",
            "type": "uint256"
          },
          {
            "internalType": "uint160",
            "name": "secondsGrowthOutside",
            "type": "uint160"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token0",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token0LimitOrderFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token0ProtocolFee",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "",
            "type": "uint128"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token1",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token1LimitOrderFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token1ProtocolFee",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "",
            "type": "uint128"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "updateBarFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint24",
            "name": "_limitOrderFee",
            "type": "uint24"
          }
        ],
        "name": "updateLimitOrderFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint24",
            "name": "_swapFee",
            "type": "uint24"
          }
        ],
        "name": "updateSwapFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "vault",
        "outputs": [
          {
            "internalType": "contract IVaultMinimal",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
}