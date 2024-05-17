import {Address, BigInt, log} from "@graphprotocol/graph-ts";

import {Token, TokenInfo} from "../../generated/schema";

import {ERC20Abi} from "../../generated/LaunchpadContract/ERC20Abi"


export function getTokenInfo(address: string): TokenInfo {
    let tokenInfo = TokenInfo.load(address)
    if (tokenInfo === null) {
        let tokenContract = ERC20Abi.bind(Address.fromString(address))
        tokenInfo = new TokenInfo(address)

        tokenInfo.name = tokenContract.try_name().reverted ? "Unknown" : tokenContract.name()
        tokenInfo.symbol = tokenContract.try_symbol().reverted ? "Unknown" : tokenContract.symbol()
        tokenInfo.decimal = BigInt.fromI32(tokenContract.decimals())
        tokenInfo.totalSupply = tokenContract.totalSupply()

        tokenInfo.save()
    }
    return tokenInfo

}

export function getToken(address: string): Token {
    let tokenInfo = getTokenInfo(address)
    let token = Token.load(address)
    if (token === null) {
        token = new Token(address)
        token.address = address
        token.name = tokenInfo.name
        token.symbol = tokenInfo.symbol
        token.decimals = tokenInfo.decimal
        token.tokenKey = "null"
        token.userCount = BigInt.zero()
        token.createdAtTimestamp = BigInt.zero()
        token.createdOrigin = Address.zero()
        token.tokenInfo = tokenInfo.id
        token.holder = []

        token.save()
    }

    return token
}