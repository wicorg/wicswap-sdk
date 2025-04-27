import { Percent as PancakePercent } from '@wicswap/sdk'

export function encodeFeeBips(fee: PancakePercent): string {
  return fee.multiply(10_000).quotient.toString()
}
