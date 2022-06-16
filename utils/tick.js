import { BigNumber, BigNumberish } from "ethers";

export const ZERO = BigNumber.from(0);
export const ONE = BigNumber.from(1);
export const TWO = BigNumber.from(2);

export const E18 = BigNumber.from(10).pow(18);

export const MAX_FEE = BigNumber.from(10000);
let MIN_TICK = -887272;
let MAX_TICK = -MIN_TICK;
export const BASE_TEN = 10;
function sqrt(x) {
  let z = x.add(ONE).div(TWO);
  let y = x;
  while (z.sub(y).isNegative()) {
    y = z;
    z = x.div(z).add(z).div(TWO);
  }
  return y;
}

export function getBigNumber(amount, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
}

export function getSqrtX96FromPrice(price) {
  const sqrtprice = sqrt(BigNumber.from(price));
  const twoX96 = BigNumber.from(2).pow(96);
  const sqrt2X96 = BigNumber.from(sqrtprice).mul(twoX96);
  return sqrt2X96;
}

export function getpriceFromSqrtX96(sqrtpriceX96){
  const twoX96 = BigNumber.from(2).pow(96);

    const sqrtprice=BigNumber.from(sqrtpriceX96).div(twoX96);
    const price=BigNumber.from(sqrtprice).mul(sqrtprice)

    return price;

}   

export function nearestValidTick(desiredTick, tickSpacing) {
  let limitOrderTick;
  const rounded = Math.trunc(desiredTick / tickSpacing) * tickSpacing;
  if (rounded < MIN_TICK) {
    limitOrderTick = rounded + tickSpacing;
  } else if (rounded > MAX_TICK) {
    limitOrderTick = rounded - tickSpacing;
  } else {
    limitOrderTick = rounded;
  }
  return limitOrderTick;
}

export function findLowerValidTick(tick,tickSpacing){
    let nearestEvenValidTick=tick;
    if (Math.trunc(tick /(tickSpacing)) % 2 != 0){
        nearestEvenValidTick =
        (tick / tickSpacing) % 2 == 0 ? tick : tick - tickSpacing;
        let i=1
        while(nearestEvenValidTick % 2 != 0){
          nearestEvenValidTick=nearestEvenValidTick-(i*tickSpacing);
          i++;
        }
        if (nearestEvenValidTick<MIN_TICK){
          nearestEvenValidTick=MIN_TICK;
        }
      }
    return nearestEvenValidTick;
}

    export function findUpperValidTick(tick,tickSpacing){
        let nearestEvenValidTick=tick;
        if (Math.trunc(tick / (tickSpacing)) % 2 == 0){
            nearestEvenValidTick =
            (tick / tickSpacing) % 2 == 0 ? tick : tick - tickSpacing;
            let i=1
            while(nearestEvenValidTick % 2 == 0){
              nearestEvenValidTick=nearestEvenValidTick+(i*tickSpacing);
              i++;
            }
            if (nearestEvenValidTick>MAX_TICK){
              nearestEvenValidTick=MAX_TICK
            }
        }
        return nearestEvenValidTick;
    }


