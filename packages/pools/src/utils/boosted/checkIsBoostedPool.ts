import { ChainId } from '@wicswap/chains'
import { getBoostedPoolsConfig } from '../../constants/boostedPools'

export const checkIsBoostedPool = (contract: string, chainId: ChainId): boolean => {
  const list = getBoostedPoolsConfig(chainId)
  const isBoosted = list?.find((i) => i?.contractAddress?.toLowerCase() === contract.toLowerCase())

  return isBoosted !== undefined
}
