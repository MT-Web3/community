import type { Campaign } from './types'

export const seedCampaigns: Campaign[] = [
  {
    id: 'fungolabs-vn-2026',
    slug: 'fungolabs-vietnam-2026',
    name: 'FungoLabs — Community Contributors',
    project: 'FungoLabs',
    description: 'Chương trình nomination dành cho contributor Việt Nam của dự án NFT mã hóa trên Ethereum, xây dựng với FHE của Zama.',
    longDescription: 'Fungo Labs xây dựng bộ sưu tập 3.232 NFT mã hóa trên Ethereum: phần hình ảnh do holder quyết định công khai, còn “essence” được giữ mã hóa on-chain. Chiến dịch MT-Web3 ghi nhận contributor Việt Nam đã tạo nội dung nguyên bản và đóng góp thực chất; hồ sơ được xét duyệt thủ công, không dựa trên follower hay tương tác.',
    type: 'Community Nomination',
    status: 'draft',
    startsAt: null,
    endsAt: null,
    capacity: null,
    reward: 'Quyền lợi đang chờ xác nhận chính thức',
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
