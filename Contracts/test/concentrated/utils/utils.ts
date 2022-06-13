/**
 * Function for getting nearest valid tick
 * @param tick tick for which nearest valid tick to be calculated
 * @param tickSpacing
 * @returns nearest valid tick
 */
export function getValidTick(tick, tickSpacing) {
  let MIN_TICK = -887272;
  let MAX_TICK = -MIN_TICK;
  let limitOrderTick;
  const rounded = Math.round(tick / tickSpacing) * tickSpacing;
  if (rounded < MIN_TICK) {
    limitOrderTick = rounded + tickSpacing;
  } else if (rounded > MAX_TICK) {
    limitOrderTick = rounded - tickSpacing;
  } else {
    limitOrderTick = rounded;
  }
  return limitOrderTick;
}
