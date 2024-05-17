import {CreateToken} from "../generated/TokenFactory/TokenFactory";
import {CreatePool} from "../generated/LaunchpadContract/LaunchpadContract";
import {Pool} from "../generated/LaunchpadContract/Pool";
import {ERC20Abi} from "../generated/TokenFactory/ERC20Abi"

import {Pool as PoolTemplate} from "../generated/templates"


import {Token, TokenInfo, Pool as PoolEntity} from "../generated/schema";
import {Address} from "@graphprotocol/graph-ts";
import {getToken} from "./entity/Token";
import {getTokenLaunchPoolInfo} from "./entity/LaunchPoolInfo";
import {getPool} from "./entity/Pool";


export function handleCreateToken(event: CreateToken): void {
    const token_key = event.params.tokenKey.toHexString()


    const token_id = event.params.token.toHexString()
    let token_entity = getToken(token_id)
    token_entity.tokenKey = token_key
    token_entity.createdAtTimestamp = event.block.timestamp
    token_entity.createdOrigin = event.transaction.from
    token_entity.save()

}

export function handleCreatePool(event: CreatePool): void {
    const token_address = event.params.token.toHexString()
    const token_launch_pool = event.params.pool.toHexString()
    const is_token0 = event.params.isToken0

    // save token_launch_pool_info
    let token_launch_pool_info = getTokenLaunchPoolInfo(token_launch_pool)
    token_launch_pool_info.pool = token_launch_pool
    token_launch_pool_info.isToken0 = is_token0
    token_launch_pool_info.save()

    // update token.launchPoolInfo
    let token = getToken(token_address)
    token.launchPoolInfo = token_launch_pool_info.id
    token.save()

    // create pool
    let pool_contract = Pool.bind(Address.fromString(token_launch_pool))
    let token0 = getToken(pool_contract.token0().toHexString())
    let token1 = getToken(pool_contract.token1().toHexString())

    let pool_entity = getPool(token_launch_pool)
    pool_entity.token0 = token0.id
    pool_entity.token1 = token1.id
    pool_entity.save()


    // create PoolTemplate
    PoolTemplate.create(event.params.pool)

}