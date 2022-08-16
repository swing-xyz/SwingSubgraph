import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { SwitchEvent, Swapped, CrosschainSwapRequest } from "../generated/SwitchEvent/SwitchEvent"
import { Switch } from "../generated/SwitchEvent/Switch"
import { Swap, User, Summary } from "../generated/schema"

export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BI = BigInt.fromI32(0)
export const SWITCH_CONTRACT_ADDRESS = Address.fromString("0xD6AE699B9Ca3e2A7eb7Ed7b414Ca2f341C1900b1")
export const USDC_ADDRESS = Address.fromString("0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E")
export const BASE = BigInt.fromString("1000000")
export const PARTS = 30
export function handleSwapped(event: Swapped): void {
  let swap = Swap.load(event.transaction.hash.toHex())
  if (swap) {
    return
  }

  swap = new Swap(event.transaction.hash.toHex())
  // Entity fields can be set based on event parameters
  swap.from = event.params.from
  swap.recipient = event.params.recipient
  swap.fromToken = event.params.fromToken
  swap.destToken = event.params.destToken
  swap.fromAmount = event.params.fromAmount
  swap.destAmount = event.params.destAmount
  swap.reward = event.params.reward
  swap.timestamp = event.block.timestamp


  let switchContract = Switch.bind(
      SWITCH_CONTRACT_ADDRESS
  );
  let result = switchContract.getExpectedReturn(event.params.fromToken, USDC_ADDRESS, event.params.fromAmount, BigInt.fromI32(PARTS))
  swap.usdAmount = result.value0.div(BASE)

  swap.save()

  let summary = Summary.load((1).toString())
  if (summary == null) {
    summary = new Summary((1).toString())
    summary.totalVolumeUSD = BigInt.fromString(swap.usdAmount.toString())
    summary.tradeCount = ONE_BI
    summary.userCount = ZERO_BI
  } else {
    summary.totalVolumeUSD = summary.totalVolumeUSD.plus(BigInt.fromString(swap.usdAmount.toString()))
    summary.tradeCount = summary.tradeCount.plus(ONE_BI)
  }

  let user = User.load(event.params.recipient.toHex())
  if (user == null) {
    user = new User(event.params.recipient.toHex())
    user.volumeUSD = swap.usdAmount
    user.tradeCount = BigInt.fromI32(1)
    // summary.userCount = summary.userCount.plus(BigInt.fromI32(1))
  } else {
    user.volumeUSD = user.volumeUSD.plus(swap.usdAmount)
    user.tradeCount = user.tradeCount.plus(BigInt.fromI32(1))
  }

  // summary.save()
  user.save()
}

export function handleCrosschainSwapRequest(event: CrosschainSwapRequest): void {
  let swap = Swap.load(event.transaction.hash.toHex())
  if (swap) {
    return
  }
  swap = new Swap(event.transaction.hash.toHex())
  // Entity fields can be set based on event parameters
  swap.from = event.params.from
  swap.recipient = event.params.from
  swap.fromToken = event.params.fromToken
  swap.destToken = event.params.destToken
  swap.fromAmount = event.params.fromAmount
  swap.destAmount = event.params.dstAmount
  swap.timestamp = event.block.timestamp


  let switchContract = Switch.bind(
      SWITCH_CONTRACT_ADDRESS
  );
  let result = switchContract.getExpectedReturn(event.params.fromToken, USDC_ADDRESS, event.params.fromAmount, BigInt.fromI32(PARTS))
  swap.usdAmount = result.value0.div(BASE)

  swap.save()

  let summary = Summary.load((1).toString())
  if (summary == null) {
    summary = new Summary((1).toString())
    summary.totalVolumeUSD = BigInt.fromString(swap.usdAmount.toString())
    summary.tradeCount = ONE_BI
    summary.userCount = ZERO_BI
  } else {
    summary.totalVolumeUSD = summary.totalVolumeUSD.plus(BigInt.fromString(swap.usdAmount.toString()))
    summary.tradeCount = summary.tradeCount.plus(ONE_BI)
  }

  let user = User.load(event.params.from.toHex())
  if (user == null) {
    user = new User(event.params.from.toHex())
    user.volumeUSD = swap.usdAmount
    user.tradeCount = BigInt.fromI32(1)
    summary.userCount = summary.userCount.plus(BigInt.fromI32(1))
  } else {
    user.volumeUSD = user.volumeUSD.plus(swap.usdAmount)
    user.tradeCount = user.tradeCount.plus(BigInt.fromI32(1))
  }

  summary.save()
  user.save()
}
