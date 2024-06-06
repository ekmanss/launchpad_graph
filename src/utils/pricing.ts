import {BigDecimal, BigInt, log} from "@graphprotocol/graph-ts";
import {Token} from "../../generated/schema";
import {exponentToBigDecimal, ONE_BD, safeDiv, ZERO_BD, ZERO_BI} from "./constants";


export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigInt, token0: Token, token1: Token): BigDecimal[] {
    let Q192 = BigDecimal.fromString(BigInt.fromI32(2).pow(192).toString())
    let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal()
    let denom = BigDecimal.fromString(Q192.toString())
    let price1 = num
        .div(denom)
        .times(exponentToBigDecimal(token0.decimals))
        .div(exponentToBigDecimal(token1.decimals))

    let price0 = safeDiv(BigDecimal.fromString('1'), price1)
    return [price0, price1]
}