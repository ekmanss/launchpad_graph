import {Pool} from "../../generated/schema";


export function getPool(address: string): Pool {
    let pool = Pool.load(address)
    if (pool === null) {
        pool = new Pool(address)
        pool.token0 = "null"
        pool.token1 = "null"
        pool.save()
    }

    return pool
}