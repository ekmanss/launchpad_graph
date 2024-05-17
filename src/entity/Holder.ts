import {Holder} from "../../generated/schema";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";


export function getHolder(id: string): Holder {
    let holder = Holder.load(id)
    if (holder === null) {
        holder = new Holder(id)
        holder.userAddress = "null"
        holder.tokenAddress = "null"
        holder.balance = BigInt.zero()
        holder.balance_formatted = BigDecimal.zero()
        holder.ratio = BigDecimal.zero()

        holder.save()
    }

    return holder
}