export type Address = `0x${string}`

export const RISE_ADDRESSES = {
  registry: "0x9677D28779b97D913c891032908073815f266F92" as Address,
  factory: "0x8e8F4C04FE30CbD818eC70847425B274b18B0741" as Address,
  lpLocker: "0x841E48361aA6c50Db885e117D307A6AA8D2aCD2d" as Address,
  bondingCurveLaunch: "0x0039C3A8FAABF6E64F0265ed1A53938920e1b832" as Address,
} as const
