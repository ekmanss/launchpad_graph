import {TokenLaunchPoolInfo} from "../../generated/schema";

export function getTokenLaunchPoolInfo(address: string): TokenLaunchPoolInfo {
    let launchPoolInfo = TokenLaunchPoolInfo.load(address)
    if (launchPoolInfo === null) {
        launchPoolInfo = new TokenLaunchPoolInfo(address)
        launchPoolInfo.pool = "null"
        launchPoolInfo.isToken0 = false

        launchPoolInfo.save()
    }

    return launchPoolInfo
}
