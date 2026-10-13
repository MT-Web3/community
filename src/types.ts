export type CampaignStatus = 'draft' | 'upcoming' | 'active' | 'ended'
export type CampaignType = 'Whitelist' | 'Giveaway' | 'Community Nomination' | 'NFT Allowlist' | 'Early Access' | 'Community Campaign'

export interface Campaign {
  id: string
  slug: string
  name: string
  project: string
  description: string
  longDescription: string
  type: CampaignType
  status: CampaignStatus
  startsAt: string | null
  endsAt: string | null
  capacity: number | null
  reward: string
  requirements: string[]
  walletRequired: boolean
  accent: string
}

export interface SubmissionInput {
  campaignId: string
  xUsername: string
  xProfileUrl?: string
  postUrl1: string
  postUrl2: string
  walletAddress?: string
  consent: boolean
  turnstileToken?: string
}
