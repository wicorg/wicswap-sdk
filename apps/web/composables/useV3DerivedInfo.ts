import type { Token } from '@wicswap/swap-sdk-core'
import { CurrencyAmount, Price } from '@wicswap/swap-sdk-core'
import { Position, type FeeAmount } from '@wicswap/v3-sdk'
import { encodeSqrtRatioX96, nearestUsableTick, Pool, priceToClosestTick, TICK_SPACINGS, TickMath } from '@wicswap/v3-sdk'
import { computeAllRoutes } from '@wicswap/smart-router'

export default function useV3DerivedInfo() {
  return {encodeSqrtRatioX96, nearestUsableTick, computeAllRoutes}
}
