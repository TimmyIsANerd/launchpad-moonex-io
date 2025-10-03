export type Address = `0x${string}`

export const BNB_ADDRESSES = {
  registry: "0xB0E0E8B8cd486adb5b0A1Ea1AaFB1449F8065516" as Address,
  factory: "0xDf686F4dD229DBa0E1A7E06A8e720384c30aE809" as Address,
  lpLocker: "0x25BB660fA411D38BC46D0f1C7bC45Aa4e9f2F5e9" as Address,
  bondingCurveLaunch: "0x1fCDdBbDdecF993C5DC18d886902D7a0052ADA6e" as Address,
} as const
