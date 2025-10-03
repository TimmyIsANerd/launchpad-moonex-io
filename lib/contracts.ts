export type Address = `0x${string}`

export const BNB_ADDRESSES = {
  registry: "0xb169cdB282696fb30f2998aCFf44b69f3d9bbD27" as Address,
  factory: "0xe252dD1291C3662121B1AfFF48FDD5A4dE360608" as Address,
  lpLocker: "0x2703C2eeE7847a5ABc4105F3D8882Ee3E6795dF9" as Address,
  bondingCurveLaunch: "0x14F9F5F8454a5aB9F8A5eDBFd54BC01E2B19d4e1" as Address,
} as const
