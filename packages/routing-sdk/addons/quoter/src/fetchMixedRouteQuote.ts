import { ChainId } from '@wicswap/chains'
import { StablePool, isStablePool } from '@wicswap/routing-sdk-addon-stable-swap'
import { V2Pool, isV2Pool } from '@wicswap/routing-sdk-addon-v2'
import { V3Pool, isV3Pool } from '@wicswap/routing-sdk-addon-v3'
import invariant from 'tiny-invariant'

import { mixedRouteQuoterV1ABI } from './abis/IMixedRouteQuoterV1'
import { MIXED_ROUTE_QUOTER_ADDRESSES } from './constants'
import type { QuoteRoute } from './types'
import { encodeRouteToPath } from './utils'

export type SupportedPool = V3Pool | V2Pool | StablePool

export function buildMixedRouteQuoteCall<P extends SupportedPool = SupportedPool>(route: QuoteRoute<P>) {
  const { path, amount } = route
  const {
    currency: { chainId },
  } = amount
  const isExactOut = path[path.length - 1].wrapped.equals(amount.currency.wrapped)
  invariant(!isExactOut, 'EXACT_OUT_NOT_SUPPORTED')
  return {
    address: MIXED_ROUTE_QUOTER_ADDRESSES[chainId as ChainId],
    abi: mixedRouteQuoterV1ABI,
    functionName: 'quoteExactInput',
    args: [
      encodeRouteToPath(route, false),
      route.pools
        .map((pool) => {
          if (isV3Pool(pool)) {
            return 0n
          }
          if (isV2Pool(pool)) {
            return 1n
          }
          if (isStablePool(pool)) {
            const stablePool = pool.getPoolData()
            if (stablePool.balances.length === 2) {
              return 2n
            }
            if (stablePool.balances.length === 3) {
              return 3n
            }
          }
          return -1n
        })
        .filter((index) => index >= 0),
      amount.quotient,
    ],
  } as const
}
