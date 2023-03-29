import { CarbonSDKUpdateProps } from "./types"

export const CarbonSDKActionTypes = {
    UPDATE_SDK: "UPDATE_SDK",
    WATCH_SDK: "WATCH_SDK"
}

export function updateCarbonSDK(payload: CarbonSDKUpdateProps) {
    return {
        type: CarbonSDKActionTypes.UPDATE_SDK,
        payload
    }
};

export function watchSDK() {
    return {
        type: CarbonSDKActionTypes.UPDATE_SDK,
    }
};
