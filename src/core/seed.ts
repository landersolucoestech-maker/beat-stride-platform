import { Artist } from "@/core/catalog/domain/Artist";
import { Release } from "@/core/catalog/domain/Release";
import { Track } from "@/core/catalog/domain/Track";
import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Money } from "@/core/shared/domain/Money";
import { Delivery } from "@/core/distribution/domain/Delivery";
import { RoyaltyLine } from "@/core/royalties/domain/RoyaltyLine";
import { Wallet } from "@/core/wallet/domain/Wallet";
import { Withdrawal } from "@/core/wallet/domain/Withdrawal";
import { SmartLink } from "@/core/smartlinks/domain/SmartLink";
import { FraudAlert } from "@/core/fraud/domain/FraudAlert";

export const seedArtists = [
  Artist.create({
    name: "Luna Nova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    monthlyListeners: 125000,
    bio: "Pop alternativo brasileiro",
  }, new UniqueId("artist-1")),
  Artist.create({
    name: "The Midnight Echo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    monthlyListeners: 89000,
  }, new UniqueId("artist-2")),
  Artist.create({
    name: "Velocity",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    monthlyListeners: 234000,
  }, new UniqueId("artist-3")),
];

export const seedReleases = [
  Release.create({
    title: "Neon Dreams",
    artistId: "artist-1",
    artistName: "Luna Nova",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
    type: "single",
    releaseDate: "2024-03-15",
    status: "live",
    genre: "Pop",
    explicit: false,
    upc: "0123456789012",
    tracks: [
      Track.create({ title: "Neon Dreams", duration: "3:45", isrc: "USRC12345678", explicit: false }, new UniqueId("track-1")),
    ],
  }, new UniqueId("release-1")),
  Release.create({
    title: "Midnight Sessions",
    artistId: "artist-2",
    artistName: "The Midnight Echo",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    type: "ep",
    releaseDate: "2024-04-01",
    status: "scheduled",
    genre: "Electronic",
    explicit: true,
    tracks: [
      Track.create({ title: "Shadow Dance", duration: "4:12", isrc: "USRC12345679", explicit: false }, new UniqueId("track-2")),
      Track.create({ title: "Electric Pulse", duration: "3:58", isrc: "USRC12345680", explicit: true }, new UniqueId("track-3")),
    ],
  }, new UniqueId("release-2")),
  Release.create({
    title: "Velocity",
    artistId: "artist-3",
    artistName: "Velocity",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    type: "album",
    releaseDate: "2024-05-20",
    status: "review",
    genre: "Hip-Hop",
    explicit: true,
    tracks: [
      Track.create({ title: "Fast Lane", duration: "3:15", isrc: "USRC12345683", explicit: true }, new UniqueId("track-6")),
      Track.create({ title: "No Brakes", duration: "2:58", isrc: "USRC12345684", explicit: true }, new UniqueId("track-7")),
    ],
  }, new UniqueId("release-3")),
];

export const seedDeliveries = [
  Delivery.create({ releaseId: "release-1", dsp: "Spotify", status: "delivered", submittedAt: "2024-03-10", liveAt: "2024-03-15" }),
  Delivery.create({ releaseId: "release-1", dsp: "Apple Music", status: "delivered", submittedAt: "2024-03-10", liveAt: "2024-03-15" }),
  Delivery.create({ releaseId: "release-1", dsp: "YouTube Music", status: "delivered", submittedAt: "2024-03-10", liveAt: "2024-03-16" }),
  Delivery.create({ releaseId: "release-2", dsp: "Spotify", status: "delivering", submittedAt: "2024-03-25" }),
  Delivery.create({ releaseId: "release-2", dsp: "Deezer", status: "queued", submittedAt: "2024-03-25" }),
  Delivery.create({ releaseId: "release-3", dsp: "TikTok", status: "failed", submittedAt: "2024-04-01", errorMessage: "Metadados inválidos" }),
];

export const seedRoyalties: RoyaltyLine[] = [
  RoyaltyLine.create({ trackId: "track-1", trackTitle: "Neon Dreams", artistId: "artist-1", dsp: "Spotify", country: "BR", streams: 45230, gross: new Money(180.92), net: new Money(144.74), period: "2024-02" }),
  RoyaltyLine.create({ trackId: "track-1", trackTitle: "Neon Dreams", artistId: "artist-1", dsp: "Apple Music", country: "US", streams: 23450, gross: new Money(234.50), net: new Money(187.60), period: "2024-02" }),
  RoyaltyLine.create({ trackId: "track-2", trackTitle: "Shadow Dance", artistId: "artist-2", dsp: "Spotify", country: "PT", streams: 67800, gross: new Money(271.20), net: new Money(216.96), period: "2024-02" }),
  RoyaltyLine.create({ trackId: "track-6", trackTitle: "Fast Lane", artistId: "artist-3", dsp: "TikTok", country: "BR", streams: 890000, gross: new Money(445.00), net: new Money(356.00), period: "2024-02" }),
];

export const seedWallets = [
  Wallet.create({ artistId: "artist-1", available: new Money(3847.50), pending: new Money(1250.00), lifetimeEarnings: new Money(48230.10) }),
  Wallet.create({ artistId: "artist-2", available: new Money(1209.85), pending: new Money(540.00), lifetimeEarnings: new Money(15670.50) }),
  Wallet.create({ artistId: "artist-3", available: new Money(8932.40), pending: new Money(3120.00), lifetimeEarnings: new Money(102450.90) }),
];

export const seedWithdrawals = [
  Withdrawal.create({ artistId: "artist-1", artistName: "Luna Nova", amount: new Money(1250.00), method: "pix", status: "completed", requestedAt: "2024-02-15", completedAt: "2024-02-15" }),
  Withdrawal.create({ artistId: "artist-3", artistName: "Velocity", amount: new Money(2340.00), method: "paypal", status: "processing", requestedAt: "2024-03-01" }),
  Withdrawal.create({ artistId: "artist-1", artistName: "Luna Nova", amount: new Money(567.80), method: "pix", status: "pending", requestedAt: "2024-03-15" }),
];

export const seedSmartLinks = [
  SmartLink.create({
    releaseId: "release-1", slug: "neon-dreams", title: "Neon Dreams",
    artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
    destinations: [
      { dsp: "Spotify", url: "https://open.spotify.com/track/x" },
      { dsp: "Apple Music", url: "https://music.apple.com/x" },
      { dsp: "YouTube Music", url: "https://music.youtube.com/x" },
    ],
    visits: 12450, conversions: 4320, createdAt: "2024-03-10",
  }),
  SmartLink.create({
    releaseId: "release-2", slug: "midnight-sessions", title: "Midnight Sessions EP",
    artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    destinations: [
      { dsp: "Spotify", url: "https://open.spotify.com/album/y" },
      { dsp: "Deezer", url: "https://deezer.com/y" },
    ],
    visits: 3210, conversions: 890, createdAt: "2024-03-25",
  }),
];

export const seedFraudAlerts = [
  FraudAlert.create({
    trackId: "track-6", trackTitle: "Fast Lane", artistName: "Velocity",
    dsp: "Spotify", detectedAt: "2024-03-20T10:00:00", reason: "Pico de streams de bots em 1 cluster IP",
    suspiciousStreams: 18420, severity: "high", status: "investigating",
  }),
  FraudAlert.create({
    trackId: "track-2", trackTitle: "Shadow Dance", artistName: "The Midnight Echo",
    dsp: "TikTok", detectedAt: "2024-03-22T14:00:00", reason: "Padrão repetitivo de 30s seguido por skip",
    suspiciousStreams: 5210, severity: "medium", status: "open",
  }),
  FraudAlert.create({
    trackId: "track-1", trackTitle: "Neon Dreams", artistName: "Luna Nova",
    dsp: "Spotify", detectedAt: "2024-03-25T08:00:00", reason: "Streams anômalos vindos de país sem audiência",
    suspiciousStreams: 980, severity: "low", status: "dismissed",
  }),
];
