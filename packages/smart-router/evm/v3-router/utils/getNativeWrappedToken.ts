import { Token, WNATIVE } from '@wicswap/sdk'
import { ChainId } from '@wicswap/chains'

export function getNativeWrappedToken(chainId: ChainId): Token | null {
  return WNATIVE[chainId] ?? null
}
