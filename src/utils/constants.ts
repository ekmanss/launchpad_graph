/* eslint-disable prefer-const */
import {BigInt, BigDecimal, Address, ethereum, log} from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export const BASIS_POINTS_DIVISOR = BigInt.fromI32(10000)

export const BI_10 = BigInt.fromI32(10)

export const BI_12_PRECISION = BigInt.fromI32(10).pow(12)
export const BI_18_PRECISION = BigInt.fromI32(10).pow(18)
export const BI_22_PRECISION = BigInt.fromI32(10).pow(22)

export const yearly = "yearly"
export const monthly = "monthly"
export const weekly = "weekly"
export const daily = "daily"
export const hourly = "hourly"


export enum intervalUnixTime {
    SEC = 1,
    SEC60 = 60,
    MIN5 = 300,
    MIN15 = 900,
    MIN30 = 1800,
    MIN60 = 3600,
    HR2 = 7200,
    HR4 = 14400,
    HR8 = 28800,
    HR24 = 86400,
    DAY7 = 604800,
    MONTH = 2628000,
    MONTH12 = 31536000
}


export function negate(n: BigInt): BigInt {
    return n.abs().times(BigInt.fromI32(-1))
}

export function timestampToDay(timestamp: BigInt): BigInt {
    return BigInt.fromI32(86400).times(BigInt.fromI32(86400)).div(timestamp)
}


export function getIdFromEvent(event: ethereum.Event): string {
    return event.transaction.hash.toHexString() + ':' + event.logIndex.toString()
}

export function getIntervalIdentifier(event: ethereum.Event, name: string, interval: intervalUnixTime): string {
    const intervalID = getIntervalId(interval, event)
    return name + ":" + interval.toString() + ':' + intervalID.toString()
}

export function getDurationSeconds(durationFlag: string): i32 {
    if (durationFlag == yearly) {
        return intervalUnixTime.MONTH12
    } else if (durationFlag == monthly) {
        return intervalUnixTime.MONTH
    } else if (durationFlag == weekly) {
        return intervalUnixTime.DAY7
    } else if (durationFlag == daily) {
        return intervalUnixTime.HR24
    } else if (durationFlag == hourly) {
        return intervalUnixTime.MIN60
    }

    return -1
}

export function getOpenTimestamp(event: ethereum.Event, durationFlag: string): BigInt {
    let durationSeconds = getDurationSeconds(durationFlag)
    let intervalId = getIntervalId(durationSeconds, event)
    return BigInt.fromI32(intervalId).times(BigInt.fromI32(durationSeconds))
}

export function getDurationIdWithFlag(event: ethereum.Event, durationFlag: string): i32 {
    if (durationFlag == yearly) {
        return getIntervalId(intervalUnixTime.MONTH12, event)
    } else if (durationFlag == monthly) {
        return getIntervalId(intervalUnixTime.MONTH, event)
    } else if (durationFlag == weekly) {
        return getIntervalId(intervalUnixTime.DAY7, event)
    } else if (durationFlag == daily) {
        return getIntervalId(intervalUnixTime.HR24, event)
    } else if (durationFlag == hourly) {
        return getIntervalId(intervalUnixTime.MIN60, event)
    }
    return -1

}

export function getIntervalId(interval: intervalUnixTime, event: ethereum.Event): i32 {
    return event.block.timestamp.toI32() / interval
}

export function getHourlyId(event: ethereum.Event): i32 {
    return getIntervalId(intervalUnixTime.MIN60, event)
}

export function getDailyId(event: ethereum.Event): i32 {
    return getIntervalId(intervalUnixTime.HR24, event)
}

export function getWeeklyId(event: ethereum.Event): i32 {
    return getIntervalId(intervalUnixTime.DAY7, event)
}

export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
    if (amount1.equals(ZERO_BD)) {
        return ZERO_BD
    } else {
        return amount0.div(amount1)
    }
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == ZERO_BI) {
        return tokenAmount.toBigDecimal()
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
        bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
    if (power.equals(ZERO_BI)) {
        return ONE_BD
    }
    let negativePower = power.lt(ZERO_BI)
    let result = ZERO_BD.plus(value)
    let powerAbs = power.abs()
    for (let i = ONE_BI; i.lt(powerAbs); i = i.plus(ONE_BI)) {
        result = result.times(value)
    }

    if (negativePower) {
        result = safeDiv(ONE_BD, result)
    }

    return result
}

export function feeTierToTickSpacing(feeTier: BigInt): BigInt {
    if (feeTier.equals(BigInt.fromI32(10000))) {
        return BigInt.fromI32(200)
    }
    if (feeTier.equals(BigInt.fromI32(3000))) {
        return BigInt.fromI32(60)
    }
    if (feeTier.equals(BigInt.fromI32(500))) {
        return BigInt.fromI32(10)
    }
    if (feeTier.equals(BigInt.fromI32(100))) {
        return BigInt.fromI32(1)
    }

    log.critical('Unexpected fee tier : {}', [feeTier.toString()])
    return BigInt.fromI32(1)
}