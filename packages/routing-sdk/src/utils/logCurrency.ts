import { Currency } from '@wicswap/swap-sdk-core'

export function logCurrency(c: Currency) {
  return `${c.chainId}_${c.isNative}_${c.wrapped.address}`
}
