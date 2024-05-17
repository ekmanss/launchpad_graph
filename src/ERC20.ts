import {ERC20Abi, Transfer} from "../generated/templates/Token/ERC20Abi";
import {Address, BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {getToken} from "./entity/Token";
import {getHolder} from "./entity/Holder";


export function handleTransfer(event: Transfer): void {
    let token_address = event.address
    let transfer_from = event.params.from.toHexString()
    let transfer_to = event.params.to.toHexString()

    let token_entity = getToken(token_address.toHexString())
    let token_contract = ERC20Abi.bind(token_address)

    let total_supply = token_contract.totalSupply()
    let balance_from = token_contract.balanceOf(Address.fromString(transfer_from))
    let balance_to = token_contract.balanceOf(Address.fromString(transfer_to))

    let from_ration = balance_from.toBigDecimal().div(total_supply.toBigDecimal())
    let to_ration = balance_to.toBigDecimal().div(total_supply.toBigDecimal())

    let from_holder_id = token_address.toHexString() + "-" + transfer_from
    let to_holder_id = token_address.toHexString() + "-" + transfer_to

    let from_holder = getHolder(from_holder_id)
    let to_holder = getHolder(to_holder_id)

    from_holder.userAddress = transfer_from
    from_holder.tokenAddress = token_address.toHexString()
    from_holder.balance = balance_from
    from_holder.balance_formatted = balance_from.toBigDecimal().div(
        BigInt.fromI32(10).pow(token_entity.decimals.toI32() as u8).toBigDecimal()
    )
    from_holder.ratio = from_ration

    to_holder.userAddress = transfer_to
    to_holder.tokenAddress = token_address.toHexString()
    to_holder.balance = balance_to
    to_holder.balance_formatted = balance_to.toBigDecimal().div(
        BigInt.fromI32(10).pow(token_entity.decimals.toI32() as u8).toBigDecimal()
    )
    to_holder.ratio = to_ration


    let token_holder_list = token_entity.holder
    if (token_holder_list.indexOf(from_holder_id) == -1) {
        token_holder_list.push(from_holder_id)
    }
    if (token_holder_list.indexOf(to_holder_id) == -1) {
        token_holder_list.push(to_holder_id)
    }
    token_entity.holder = token_holder_list

    from_holder.save()
    to_holder.save()
    token_entity.save()
}