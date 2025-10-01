// Terminal API DTOs (trimmed to currently-used fields by UI)
export interface MemeDTO {
  _id: string
  name: string
  ticker: string
  desc?: string | null
  telegram?: string | null
  image?: string | null
  address: string // token address (lowercase)
  userProfile?: { username?: string | null; address: string; profilePicture?: string | null }
}

export interface PagedResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface SingleResponse<T> { data: T }
