import { Token } from '@wicswap/sdk'
import { ChainId } from '@wicswap/chains'

import { usdGasTokensByChain } from '../../constants'

export function getUsdGasToken(chainId: ChainId): Token | null {
  return usdGasTokensByChain[chainId]?.[0] ?? null
}
