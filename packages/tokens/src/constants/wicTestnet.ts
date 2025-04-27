import { ChainId } from '@wicswap/chains'
import { WETH9 } from '@wicswap/sdk'
import { BUSD, USDT } from './common'

export const wicTestnetTokens = {
  weth: WETH9[ChainId.WIC_TESTNET],
  busd: BUSD[ChainId.WIC_TESTNET],
  usdt: USDT[ChainId.WIC_TESTNET],
}
