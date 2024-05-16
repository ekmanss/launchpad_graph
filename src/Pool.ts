import {Swap as SwapEvent} from "../generated/templates/Pool/Pool";
import {Swap} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts";

import {Pool as PoolEntity} from "../generated/schema";
import {getPool} from "./entity/Pool";

import {
    convertTokenToDecimal,
} from "./utils/constants";
import {getToken} from "./entity/Token";
import {getSwap} from "./entity/Swap";



export function handleSwap(event: SwapEvent): void {
    let pool = getPool(event.address.toHexString())
    let token0 = getToken(pool.token0)
    let token1 = getToken(pool.token1)

    // amounts - 0/1 are token deltas: can be positive or negative
    let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
    let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)


    const swap_id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let swap = getSwap(swap_id)
    swap.transaction = event.transaction.hash.toHexString()
    swap.timestamp = event.block.timestamp
    swap.pool = pool.id
    swap.token0 = token0.id
    swap.token1 = token1.id
    swap.sender = event.params.sender
    swap.recipient = event.params.recipient
    swap.origin = event.transaction.from
    swap.amount0 = amount0
    swap.amount1 = amount1

    swap.save()

}