import { Token } from '@wicswap/sdk'
import { ChainId } from '@wicswap/chains'

// a list of tokens by chain
export type ChainMap<T> = {
  readonly [chainId in ChainId]: T
}

export type ChainTokenList = ChainMap<Token[]>
