module.exports={
    poolHelperAbi: [
        {
          "inputs": [
            {
              "internalType": "contract IConcentratedLiquidityPool",
              "name": "pool",
              "type": "address"
            },
            {
              "internalType": "uint24",
              "name": "tickCount",
              "type": "uint24"
            }
          ],
          "name": "getTickState",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "int24",
                  "name": "index",
                  "type": "int24"
                },
                {
                  "internalType": "uint128",
                  "name": "liquidity",
                  "type": "uint128"
                }
              ],
              "internalType": "struct ConcentratedLiquidityPoolHelper.SimpleTick[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ],

}