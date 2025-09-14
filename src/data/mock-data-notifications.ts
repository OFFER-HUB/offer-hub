 import { CheckCircle, AlertCircle, Zap, MapPin } from 'lucide-react'
 
export const notifications = [
    {
      id: 1,
      type: 'payment',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      title: 'New Payment Received',
      description: '0.15 ETH has been successfully credited to your wallet for the project \'DeFi Landing Page Design\'.',
      timestamp: 'April 18, 2025 - 3:42 PM',
    },
    {
      id: 2,
      type: 'milestone',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
      title: 'Client Funds Milestone',
      description: 'Your client @blockchainjay funded the escrow for \'Web3 Brand Identity Design\'.',
      timestamp: 'April 17, 2025 - 5:15 PM',
    },
    {
      id: 3,
      type: 'approval',
      icon: Zap,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      title: 'Job Milestone Approved',
      description: 'Milestone 2 of \'Crypto Podcast Branding\' approved by @bitvoice. Next payout: 0.075 BTC.',
      timestamp: 'April 18, 2025 - 8:47 AM',
    },
    {
      id: 4,
      type: 'security',
      icon: MapPin,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      title: 'Login from New Location',
      description:
        'New login detected from Lagos, Nigeria - Chrome on Windows. If this wasn\'t you, secure your account.',
      timestamp: 'April 18, 2025 - 8:47 AM',
    },
  ]
