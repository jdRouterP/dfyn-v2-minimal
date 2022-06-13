import { BigNumber, BigNumberish } from "ethers";

export const ZERO = BigNumber.from(0);
export const ONE = BigNumber.from(1);
export const TWO = BigNumber.from(2);

export const E18 = BigNumber.from(10).pow(18);

export const MAX_FEE = BigNumber.from(10000);

export const BASE_TEN = 10;
function sqrt(x: BigNumber) {
    let z = x.add(ONE).div(TWO);
    let y = x;
    while (z.sub(y).isNegative()) {
      y = z;
      z = x.div(z).add(z).div(TWO);
    }
    return y;
  }

  export function getBigNumber(amount: BigNumberish, decimals = 18): BigNumber {
    return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
  }

  export function getSqrtX96FromPrice(price){
    const sqrtprice=sqrt(BigNumber.from(price))
    const twoX96=BigNumber.from(2).pow(96)
    const sqrt2X96=BigNumber.from(sqrtprice).mul(twoX96)
    return sqrt2X96;
  }

  export function nearestValidTick(desiredTick,tickSpacing){
    let limitOrderTick
    let MIN_TICK = -887272;
    let MAX_TICK =-MIN_TICK
      const rounded = Math.round(desiredTick / tickSpacing) * tickSpacing
      if (rounded < MIN_TICK){
        limitOrderTick=rounded + tickSpacing
      }
      else if (rounded >MAX_TICK){
        limitOrderTick=rounded - tickSpacing
      }
      else{
        limitOrderTick=rounded
      }
      return limitOrderTick;
  }