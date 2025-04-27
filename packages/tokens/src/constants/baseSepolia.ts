import { ChainId } from '@wicswap/chains'
import { WETH9 } from '@wicswap/sdk'
import { USDC } from './common'

export const baseSepoliaTokens = {
  weth: WETH9[ChainId.BASE_SEPOLIA],
  usdc: USDC[ChainId.BASE_SEPOLIA],
}
