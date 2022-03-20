import { BigInt } from "@graphprotocol/graph-ts"
import { SwitchView, Swapped } from "../generated/SwitchView/SwitchView"
import { Swap } from "../generated/schema"

export function handleSwapped(event: Swapped): void {
  let swap = new Swap(event.transaction.from.toHex())
  // Entity fields can be set based on event parameters
  swap.from = event.params.from
  swap.recipient = event.params.recipient
  swap.fromToken = event.params.fromToken
  swap.destToken = event.params.destToken

  // Entities can be written to the store with `.save()`
  swap.save()
}
