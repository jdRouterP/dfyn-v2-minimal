import { BigNumber, BigNumberish } from "ethers";
// import { BigNumber } from "bignumber.js";
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

export function divRoundingUp(numba, denominator) {
  const res = numba.div(denominator);
  const remainder = numba.mod(denominator);
  if (remainder.eq(0)) return res;
  return res.add(1);
}

export function getBigNumber(amount, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
}

export function getSqrtX96FromPrice(price) {
  const twoX192=BigNumber.from(2).pow(192);
  const sqrtprice=BigNumber.from(price).mul(twoX192)
  console.log('sqrtprice',sqrtprice)
  return sqrtprice;
}


export function getpriceFromSqrtX96(sqrtpriceX96){
  const twoX192=BigNumber.from(2).pow(192);
  const bigsqrtpriceX96=BigNumber.from(sqrtpriceX96)
  const price=divRoundingUp(bigsqrtpriceX96,twoX192)
    return price;
}   

export function nearestValidTick(desiredTick, tickSpacing) {
  let limitOrderTick;
  let MIN_TICK = -887272;
  let MAX_TICK = -MIN_TICK;
  const rounded = Math.round(desiredTick / tickSpacing) * tickSpacing;
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
  let nearestEvenValidTick=nearestValidTick(tick,tickSpacing);
  let validTick=nearestEvenValidTick;
  let found=false
  if (Math.trunc(validTick/(tickSpacing)) % 2 != 0){
    for(let i=1;!found;i++){
      validTick=nearestEvenValidTick+(i*tickSpacing)
      if(validTick>MAX_TICK){
        validTick=nearestEvenValidTick-(i*tickSpacing);
      }
      if(Math.trunc(validTick /(tickSpacing)) % 2 == 0){
        found=true;
      }
    }
  }
  return validTick;
}

    export function findUpperValidTick(tick,tickSpacing){
        let nearestOddValidTick=nearestValidTick(tick,tickSpacing);
        let validTick=nearestOddValidTick;
        let found=false
        if (Math.trunc(validTick / (tickSpacing)) % 2 == 0){
          for(let i=1;!found;i++){
            validTick=nearestOddValidTick+(i*tickSpacing)
            if(validTick>MAX_TICK){
              validTick=nearestOddValidTick-(i*tickSpacing);
            }
            if(Math.trunc(validTick / (tickSpacing)) % 2 != 0){
              found=true;
            }
          }
        }
        return validTick;
    }

    export function oldTickFinder(tickArray, tick) {
      var midpoint = Math.floor(tickArray.length / 2);
    
      if (tickArray[midpoint] === tick) {
        if (midpoint === 0) {
          return tickArray[midpoint];
        } else {
          return tickArray[midpoint - 1];
        }
      }
      if (tickArray.length === 1) {
        return tickArray[0];
      }
    
      if (tickArray[midpoint] > tick) {
        return oldTickFinder(tickArray.slice(0, midpoint), tick);
      } else if (tickArray[midpoint] < tick) {
        return oldTickFinder(tickArray.slice(midpoint), tick);
      }
    }   


