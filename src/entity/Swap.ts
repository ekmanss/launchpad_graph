import {Swap} from "../../generated/schema";
import {BigDecimal, BigInt, Bytes} from "@graphprotocol/graph-ts";

export function getSwap(address: string): Swap {
    let swap = Swap.load(address)
    if (swap === null) {
        swap = new Swap(address)
        swap.transaction = "null"
        swap.timestamp = BigInt.zero()
        swap.pool = "null"
        swap.token0 = "null"
        swap.token1 = "null"
        swap.sender = Bytes.empty()
        swap.recipient = Bytes.empty()
        swap.origin = Bytes.empty()
        swap.amount0 = BigDecimal.zero()
        swap.amount1 = BigDecimal.zero()

        swap.save()
    }

    return swap
}