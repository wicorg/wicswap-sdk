import { ChainId, chainNames } from '@wicswap/chains'
import { FACTORY_ADDRESS_MAP, Token, computePairAddress } from '@wicswap/sdk'
import { DEPLOYER_ADDRESSES, computePoolAddress } from '@wicswap/v3-sdk'
import groupBy from 'lodash/groupBy'
import { PublicClient, createPublicClient, fallback, http, parseAbiItem } from 'viem'
import * as CHAINS from 'viem/chains'
import { describe, expect, it, test } from 'vitest'
import { GAUGES_SUPPORTED_CHAIN_IDS } from '../constants/chainId'
import { getGauges } from '../constants/config/getGauges'
import { GaugeStableSwapConfig, GaugeType } from '../types'

const PUBLIC_NODES: Record<string, string[]> = {
  [ChainId.ARBITRUM_ONE]: [
    CHAINS.arbitrum.rpcUrls.default.http[0],
    'https://arbitrum-one.publicnode.com',
    'https://arbitrum.llamarpc.com',
  ],
  [ChainId.ETHEREUM]: [
    CHAINS.mainnet.rpcUrls.default.http[0],
    'https://ethereum.publicnode.com',
    'https://eth.llamarpc.com',
  ],
}

describe.skip('Gauges Config', async () => {
  const configProd = await getGauges()
  const gidGroups = groupBy(configProd, 'gid')
  const chainIdGroups = groupBy(configProd, 'chainId')

  Object.keys(chainIdGroups).forEach((chainId) => {
    it(`chainId ${
      chainNames[chainId as unknown as ChainId]
    }(${chainId}) should be in GAUGES_SUPPORTED_CHAIN_IDS`, () => {
      expect(GAUGES_SUPPORTED_CHAIN_IDS.includes(Number(chainId))).toBe(true)
    })
  })

  const publicClient = Object.keys(chainIdGroups).reduce((acc, chainId) => {
    const node = PUBLIC_NODES[chainId]
    const chain = Object.values(CHAINS).find((c) => c.id === Number(chainId))
    if (!chain) return acc
    return {
      ...acc,
      [chainId]: createPublicClient({
        chain,
        transport: node ? fallback(node.map((rpc: string) => http(rpc))) : http(chain.rpcUrls.default.http[0]),
      }) as PublicClient,
    }
  }, {} as Record<string, PublicClient>)

  Object.entries(gidGroups).forEach(([gid, gauge]) => {
    it(`gauges with gid #${gid} should be unique`, () => {
      expect(gauge.length).toBe(1)
    })
  })

  const stableSwapGauges = Object.entries(chainIdGroups).reduce((acc, [chainId, gauges]) => {
    const _stableSwapGauges = gauges.filter(
      (gauge) => gauge.type === GaugeType.StableSwap && !gauge.killed,
    ) as GaugeStableSwapConfig[]
    if (_stableSwapGauges.length === 0) return acc
    return {
      ...acc,
      [chainId]: _stableSwapGauges,
    }
  }, {} as Record<string, GaugeStableSwapConfig[]>)
  Object.entries(stableSwapGauges).forEach(([chainId, gauges]) => {
    describe(`chainId ${chainId} stableSwap gauges address should be LP address`, async () => {
      const minters = await publicClient[chainId].multicall({
        contracts: gauges.map((gauge) => ({
          abi: [parseAbiItem('function minter() view returns (address)')],
          address: gauge.address,
          functionName: 'minter',
        })),
        allowFailure: false,
      })

      expect(minters.length).toBe(gauges.length)

      const stableSwapCoins = await publicClient[chainId].multicall({
        contracts: minters.map((minter) => ({
          abi: [parseAbiItem('function N_COINS() view returns (uint256)')],
          address: minter,
          functionName: 'N_COINS',
        })),
        allowFailure: false,
      })

      expect(stableSwapCoins.length).toBe(gauges.length)
      expect(stableSwapCoins.every((c) => c >= 2n)).toBe(true)

      stableSwapCoins.forEach((coins, idx) => {
        test(`stableSwap gauge #${gauges[idx].gid} should have correct N_COINS`, () => {
          expect(Number(coins)).toBe(gauges[idx].tokenAddresses.length)
        })
      })
    })
  })

  configProd.forEach((gauge) => {
    const chainName = chainNames[gauge.chainId]
    it(`${chainName} gid #${gauge.gid} tokens chainId-lpAddress-feeTier should be matched`, () => {
      if (gauge.type === GaugeType.V3) {
        const tokenA = new Token(gauge.chainId, gauge.token0Address, 18, '')
        const tokenB = new Token(gauge.chainId, gauge.token1Address, 18, '')
        const computedAddress = computePoolAddress({
          deployerAddress: DEPLOYER_ADDRESSES[gauge.chainId],
          tokenA,
          tokenB,
          fee: gauge.feeTier,
        })
        expect(computedAddress).toBe(gauge.address)
      }

      if (gauge.type === GaugeType.V2) {
        const tokenA = new Token(gauge.chainId, gauge.token0Address, 18, '')
        const tokenB = new Token(gauge.chainId, gauge.token1Address, 18, '')
        const computedAddress = computePairAddress({
          factoryAddress: FACTORY_ADDRESS_MAP[gauge.chainId],
          tokenA,
          tokenB,
        })
        expect(gauge.address).toBe(computedAddress)
      }
    })
  })
})
