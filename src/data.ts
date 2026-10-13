import type { Campaign } from './types'

export const seedCampaigns: Campaign[] = [
  {
    id: 'fungolabs-vn-2026',
    slug: 'fungolabs-vietnam-2026',
    name: 'FungoLabs — Community Contributors',
    project: 'FungoLabs',
    description: 'Ghi nhận những thành viên Việt Nam đã tạo nội dung nguyên bản và đóng góp thực chất cho cộng đồng FungoLabs.',
    longDescription: 'Chiến dịch cộng đồng dành cho các contributor Việt Nam. Hồ sơ được đánh giá thủ công dựa trên chất lượng và tính nguyên bản của đóng góp — không dựa trên follower hay số lượt tương tác.',
    type: 'Community Nomination',
    status: 'draft',
    startsAt: null,
    endsAt: null,
    capacity: null,
    reward: 'Chưa công bố',
    requirements: [
      'Có ít nhất 2 bài đăng gốc về FungoLabs trước 00:00 ngày 13/10/2026 (UTC+7).',
      'Cung cấp 2 liên kết bài đăng X để chứng minh.',
      'Không tính repost thuần túy, nội dung sao chép hoặc spam.',
      'Mỗi người chỉ được tham gia một lần.',
      'Ưu tiên người đã có đóng góp thực chất; không đánh giá theo follower hoặc tương tác.'
    ],
    walletRequired: false,
    accent: '#F5A623'
  }
]

export const publicCampaigns = seedCampaigns.filter((campaign) => campaign.status !== 'draft')
