import {Swap as SwapEvent} from "../generated/templates/Pool/Pool";
import {Swap, Status, User} from "../generated/schema";
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


    // global status
    let status = Status.load("1")
    if (status == null) {
        status = new Status("1")
        status.totalSwapUser = BigInt.zero()
        status.save()
    }

    // token status
    let token0Status = getToken(token0.id)
    let token1Status = getToken(token1.id)


    // add global user
    let global_user = User.load("global-" + event.transaction.from.toHexString())
    if (global_user == null) {
        global_user = new User(event.transaction.from.toHexString())
        global_user.address = event.transaction.from.toHexString()
        global_user.save()

        // update global status
        status.totalSwapUser = status.totalSwapUser.plus(BigInt.fromI32(1))
    }

    // add token user
    let token0_user = User.load(token0.id + "-" + event.transaction.from.toHexString())
    let token1_user = User.load(token1.id + "-" + event.transaction.from.toHexString())
    if (token0_user == null) {
        token0_user = new User(token0.id + "-" + event.transaction.from.toHexString())
        token0_user.address = event.transaction.from.toHexString()
        token0_user.save()

        // update token status
        token0Status.userCount = token0Status.userCount.plus(BigInt.fromI32(1))
    }
    if (token1_user == null) {
        token1_user = new User(token1.id + "-" + event.transaction.from.toHexString())
        token1_user.address = event.transaction.from.toHexString()
        token1_user.save()

        // update token status
        token1Status.userCount = token1Status.userCount.plus(BigInt.fromI32(1))
    }



    status.save()
    token0Status.save()
    token1Status.save()

}