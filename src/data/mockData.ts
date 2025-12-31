export interface Artist {
  id: string;
  name: string;
  avatar: string;
  monthlyListeners: number;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  type: 'single' | 'ep' | 'album';
  releaseDate: string;
  preSaveLink: string;
  status: 'draft' | 'review' | 'scheduled' | 'live' | 'rejected';
  genre: string;
  explicit: boolean;
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  isrc: string;
  explicit: boolean;
}

export interface Royalty {
  id: string;
  trackId: string;
  trackTitle: string;
  dsp: string;
  streams: number;
  grossRevenue: number;
  netRevenue: number;
  period: string;
}

export interface Payout {
  id: string;
  artistId: string;
  artistName: string;
  amount: number;
  method: 'pix' | 'bank_transfer' | 'paypal';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export const artists: Artist[] = [
  { id: '1', name: 'Luna Nova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', monthlyListeners: 125000 },
  { id: '2', name: 'The Midnight Echo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', monthlyListeners: 89000 },
  { id: '3', name: 'Velocity', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', monthlyListeners: 234000 },
];

export const releases: Release[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Luna Nova',
    artistId: '1',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
    type: 'single',
    releaseDate: '2024-03-15',
    preSaveLink: 'https://presave.io/neon-dreams',
    status: 'live',
    genre: 'Pop',
    explicit: false,
    tracks: [
      { id: 't1', title: 'Neon Dreams', duration: '3:45', isrc: 'USRC12345678', explicit: false }
    ]
  },
  {
    id: '2',
    title: 'Midnight Sessions',
    artist: 'The Midnight Echo',
    artistId: '2',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    type: 'ep',
    releaseDate: '2024-04-01',
    preSaveLink: 'https://presave.io/midnight-sessions',
    status: 'scheduled',
    genre: 'Electronic',
    explicit: true,
    tracks: [
      { id: 't2', title: 'Shadow Dance', duration: '4:12', isrc: 'USRC12345679', explicit: false },
      { id: 't3', title: 'Electric Pulse', duration: '3:58', isrc: 'USRC12345680', explicit: true },
      { id: 't4', title: 'After Hours', duration: '5:23', isrc: 'USRC12345681', explicit: false },
      { id: 't5', title: 'Neon Lights', duration: '4:01', isrc: 'USRC12345682', explicit: false },
    ]
  },
  {
    id: '3',
    title: 'Velocity',
    artist: 'Velocity',
    artistId: '3',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    type: 'album',
    releaseDate: '2024-05-20',
    preSaveLink: 'https://presave.io/velocity-album',
    status: 'review',
    genre: 'Hip-Hop',
    explicit: true,
    tracks: [
      { id: 't6', title: 'Fast Lane', duration: '3:15', isrc: 'USRC12345683', explicit: true },
      { id: 't7', title: 'No Brakes', duration: '2:58', isrc: 'USRC12345684', explicit: true },
      { id: 't8', title: 'Turbo', duration: '4:22', isrc: 'USRC12345685', explicit: false },
    ]
  },
  {
    id: '4',
    title: 'Summer Vibes',
    artist: 'Luna Nova',
    artistId: '1',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    type: 'single',
    releaseDate: '2024-06-01',
    preSaveLink: '',
    status: 'draft',
    genre: 'Pop',
    explicit: false,
    tracks: [
      { id: 't9', title: 'Summer Vibes', duration: '3:30', isrc: '', explicit: false }
    ]
  },
];

export const royalties: Royalty[] = [
  { id: 'r1', trackId: 't1', trackTitle: 'Neon Dreams', dsp: 'Spotify', streams: 45230, grossRevenue: 180.92, netRevenue: 144.74, period: '2024-02' },
  { id: 'r2', trackId: 't1', trackTitle: 'Neon Dreams', dsp: 'Apple Music', streams: 23450, grossRevenue: 234.50, netRevenue: 187.60, period: '2024-02' },
  { id: 'r3', trackId: 't1', trackTitle: 'Neon Dreams', dsp: 'Deezer', streams: 8900, grossRevenue: 53.40, netRevenue: 42.72, period: '2024-02' },
  { id: 'r4', trackId: 't2', trackTitle: 'Shadow Dance', dsp: 'Spotify', streams: 67800, grossRevenue: 271.20, netRevenue: 216.96, period: '2024-02' },
  { id: 'r5', trackId: 't2', trackTitle: 'Shadow Dance', dsp: 'YouTube Music', streams: 34500, grossRevenue: 103.50, netRevenue: 82.80, period: '2024-02' },
  { id: 'r6', trackId: 't6', trackTitle: 'Fast Lane', dsp: 'Spotify', streams: 156000, grossRevenue: 624.00, netRevenue: 499.20, period: '2024-02' },
  { id: 'r7', trackId: 't6', trackTitle: 'Fast Lane', dsp: 'TikTok', streams: 890000, grossRevenue: 445.00, netRevenue: 356.00, period: '2024-02' },
];

export const payouts: Payout[] = [
  { id: 'p1', artistId: '1', artistName: 'Luna Nova', amount: 1250.00, method: 'pix', status: 'completed', date: '2024-02-15' },
  { id: 'p2', artistId: '2', artistName: 'The Midnight Echo', amount: 890.50, method: 'bank_transfer', status: 'completed', date: '2024-02-15' },
  { id: 'p3', artistId: '3', artistName: 'Velocity', amount: 2340.00, method: 'paypal', status: 'processing', date: '2024-03-01' },
  { id: 'p4', artistId: '1', artistName: 'Luna Nova', amount: 567.80, method: 'pix', status: 'pending', date: '2024-03-15' },
];

export const tickets: Ticket[] = [
  {
    id: 'tk1',
    subject: 'Problema com upload de faixa',
    description: 'Não consigo fazer upload de uma música com mais de 50MB',
    status: 'open',
    priority: 'high',
    createdAt: '2024-03-01T10:30:00',
    updatedAt: '2024-03-01T10:30:00',
  },
  {
    id: 'tk2',
    subject: 'Dúvida sobre splits',
    description: 'Como dividir os royalties entre colaboradores?',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-02-20T14:15:00',
    updatedAt: '2024-02-21T09:00:00',
  },
  {
    id: 'tk3',
    subject: 'Atualização de metadados',
    description: 'Preciso corrigir o nome do artista em um lançamento',
    status: 'in_progress',
    priority: 'low',
    createdAt: '2024-02-28T16:45:00',
    updatedAt: '2024-03-01T11:00:00',
  },
];

export const dspData = [
  { name: 'Spotify', streams: 245000, revenue: 980, color: 'hsl(var(--chart-1))' },
  { name: 'Apple Music', streams: 89000, revenue: 890, color: 'hsl(var(--chart-2))' },
  { name: 'YouTube Music', streams: 156000, revenue: 468, color: 'hsl(var(--chart-3))' },
  { name: 'Deezer', streams: 34000, revenue: 204, color: 'hsl(var(--chart-4))' },
  { name: 'TikTok', streams: 890000, revenue: 445, color: 'hsl(var(--chart-5))' },
];

export const walletData = {
  available: 3847.50,
  pending: 1250.00,
  lastPayout: 1890.00,
  lastPayoutDate: '2024-02-15',
};

export const genres = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 
  'Country', 'Reggae', 'Latin', 'Metal', 'Folk', 'Blues', 'Funk', 'Soul'
];

export const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

export const supportedDSPs = [
  { name: 'Spotify', icon: '🎵', enabled: true },
  { name: 'Apple Music', icon: '🍎', enabled: true },
  { name: 'YouTube Music', icon: '▶️', enabled: true },
  { name: 'Deezer', icon: '🎧', enabled: true },
  { name: 'TikTok', icon: '📱', enabled: true },
  { name: 'Amazon Music', icon: '📦', enabled: true },
  { name: 'Tidal', icon: '🌊', enabled: true },
  { name: 'Pandora', icon: '📻', enabled: false },
];
