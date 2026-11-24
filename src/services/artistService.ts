import type { Artist, Track, Album } from '../types'
import { SAMPLE_ARTISTS, SAMPLE_TRACKS, SAMPLE_ALBUMS } from '../data/musicData'
import { searchGlobalMusic } from './musicSearch'

// Persistent Followed Artists Store
const FOLLOWED_ARTISTS_KEY = 'raiwave_followed_artists'

// Curated Artist Discographies & Profiles
export const CURATED_ARTISTS: Artist[] = [
  // 1. The Local Train
  {
    id: 'artist-the-local-train',
    name: 'The Local Train',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    monthlyListeners: 2450000,
    isVerified: true,
    genre: 'Indie Rock / Hindi Indie',
    bio: 'The Local Train was an acclaimed Indian indie rock band formed in New Delhi in 2008. Widely celebrated for their poetic Hindi songwriting, soaring acoustic riffs, and emotive anthems such as "Choo Lo", "Aaoge Tum Kabhi", and "Aaftaab".',
    topTracks: [
      {
        id: 'yt-tlt-choo-lo',
        title: 'Choo Lo',
        artist: 'The Local Train',
        artistId: 'artist-the-local-train',
        album: 'Aalas Ka Pedh',
        albumId: 'album-aalas-ka-pedh',
        duration: 234,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'sFMRqxCexDk',
        source: 'youtube',
        genre: 'Indie Rock',
        releaseYear: 2015,
        color: '#8b5cf6',
      },
      {
        id: 'yt-tlt-aaoge-tum-kabhi',
        title: 'Aaoge Tum Kabhi',
        artist: 'The Local Train',
        artistId: 'artist-the-local-train',
        album: 'Aalas Ka Pedh',
        albumId: 'album-aalas-ka-pedh',
        duration: 314,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'x_eK_g11UeU',
        source: 'youtube',
        genre: 'Indie Rock',
        releaseYear: 2015,
        color: '#6366f1',
      },
      {
        id: 'yt-tlt-aaftaab',
        title: 'Aaftaab',
        artist: 'The Local Train',
        artistId: 'artist-the-local-train',
        album: 'Vaaqif',
        albumId: 'album-vaaqif',
        duration: 238,
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        youtubeId: '8ofvI9s9z20',
        source: 'youtube',
        genre: 'Indie Rock',
        releaseYear: 2018,
        color: '#f59e0b',
      },
      {
        id: 'yt-tlt-dil-mere',
        title: 'Dil Mere',
        artist: 'The Local Train',
        artistId: 'artist-the-local-train',
        album: 'Aalas Ka Pedh',
        albumId: 'album-aalas-ka-pedh',
        duration: 213,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'qLCLvzTFx6A',
        source: 'youtube',
        genre: 'Indie Rock',
        releaseYear: 2015,
        color: '#10b981',
      },
      {
        id: 'yt-tlt-vaaqif',
        title: 'Vaaqif',
        artist: 'The Local Train',
        artistId: 'artist-the-local-train',
        album: 'Vaaqif',
        albumId: 'album-vaaqif',
        duration: 310,
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'O0b_rP9kYFc',
        source: 'youtube',
        genre: 'Indie Rock',
        releaseYear: 2018,
        color: '#ec4899',
      },
    ],
    albums: [
      {
        id: 'album-aalas-ka-pedh',
        title: 'Aalas Ka Pedh',
        artist: 'The Local Train',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        year: 2015,
        color: '#8b5cf6',
        tracks: [
          {
            id: 'yt-tlt-choo-lo',
            title: 'Choo Lo',
            artist: 'The Local Train',
            album: 'Aalas Ka Pedh',
            duration: 234,
            coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
            youtubeId: 'sFMRqxCexDk',
            source: 'youtube',
            genre: 'Indie Rock',
            releaseYear: 2015,
          },
          {
            id: 'yt-tlt-aaoge-tum-kabhi',
            title: 'Aaoge Tum Kabhi',
            artist: 'The Local Train',
            album: 'Aalas Ka Pedh',
            duration: 314,
            coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
            youtubeId: 'x_eK_g11UeU',
            source: 'youtube',
            genre: 'Indie Rock',
            releaseYear: 2015,
          },
          {
            id: 'yt-tlt-dil-mere',
            title: 'Dil Mere',
            artist: 'The Local Train',
            album: 'Aalas Ka Pedh',
            duration: 213,
            coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
            youtubeId: 'qLCLvzTFx6A',
            source: 'youtube',
            genre: 'Indie Rock',
            releaseYear: 2015,
          },
        ],
      },
      {
        id: 'album-vaaqif',
        title: 'Vaaqif',
        artist: 'The Local Train',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        year: 2018,
        color: '#f59e0b',
        tracks: [
          {
            id: 'yt-tlt-aaftaab',
            title: 'Aaftaab',
            artist: 'The Local Train',
            album: 'Vaaqif',
            duration: 238,
            coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
            youtubeId: '8ofvI9s9z20',
            source: 'youtube',
            genre: 'Indie Rock',
            releaseYear: 2018,
          },
          {
            id: 'yt-tlt-vaaqif',
            title: 'Vaaqif',
            artist: 'The Local Train',
            album: 'Vaaqif',
            duration: 310,
            coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
            youtubeId: 'O0b_rP9kYFc',
            source: 'youtube',
            genre: 'Indie Rock',
            releaseYear: 2018,
          },
        ],
      },
    ],
    singles: [
      {
        id: 'yt-tlt-single-khudi',
        title: 'Khudi',
        artist: 'The Local Train',
        album: 'Khudi - Single',
        duration: 298,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'sFMRqxCexDk',
        source: 'youtube',
        genre: 'Indie Rock',
        releaseYear: 2017,
      },
    ],
    relatedArtists: [
      { id: 'rel-anuv-jain', name: 'Anuv Jain', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80' },
      { id: 'rel-prateek-kuhad', name: 'Prateek Kuhad', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80' },
      { id: 'rel-when-chai-met-toast', name: 'When Chai Met Toast', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80' },
    ],
  },

  // 2. The Weeknd
  {
    ...SAMPLE_ARTISTS[0],
    isVerified: true,
    genre: 'R&B / Synthpop',
    albums: [SAMPLE_ALBUMS[0]],
    relatedArtists: [
      { id: 'rel-daft-punk', name: 'Daft Punk', avatarUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80' },
      { id: 'rel-dua-lipa', name: 'Dua Lipa', avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80' },
    ],
  },

  // 3. Taylor Swift
  {
    ...SAMPLE_ARTISTS[1],
    isVerified: true,
    genre: 'Pop / Indie Folk',
    albums: [SAMPLE_ALBUMS[3]],
    relatedArtists: [
      { id: 'rel-ed-sheeran', name: 'Ed Sheeran', avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' },
      { id: 'rel-dua-lipa', name: 'Dua Lipa', avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80' },
    ],
  },

  // 4. Arijit Singh
  {
    id: 'artist-arijit-singh',
    name: 'Arijit Singh',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    monthlyListeners: 38400000,
    isVerified: true,
    genre: 'Bollywood / Soulful Acoustic',
    bio: 'Arijit Singh is India’s foremost playback vocalist, revered for his emotive vocal texture and timeless melodies across Hindi and Bengali cinema.',
    topTracks: [
      {
        id: 'yt-arijit-tum-hi-ho',
        title: 'Tum Hi Ho',
        artist: 'Arijit Singh',
        artistId: 'artist-arijit-singh',
        album: 'Aashiqui 2',
        duration: 262,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'IJq0yyWug1k',
        source: 'youtube',
        genre: 'Soulful Ballad',
        releaseYear: 2013,
        color: '#dc2626',
      },
      {
        id: 'yt-arijit-kesariya',
        title: 'Kesariya',
        artist: 'Arijit Singh',
        artistId: 'artist-arijit-singh',
        album: 'Brahmastra',
        duration: 268,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'BddP6PYo2gs',
        source: 'youtube',
        genre: 'Romantic',
        releaseYear: 2022,
        color: '#f59e0b',
      },
    ],
    albums: [
      {
        id: 'album-aashiqui2',
        title: 'Aashiqui 2',
        artist: 'Arijit Singh',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        year: 2013,
        color: '#dc2626',
        tracks: [],
      },
    ],
    relatedArtists: [
      { id: 'rel-the-local-train', name: 'The Local Train', avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80' },
      { id: 'rel-anupam-roy', name: 'Anupam Roy', avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80' },
    ],
  },

  // 5. Anupam Roy (Bengali & Hindi Icon)
  {
    id: 'artist-anupam-roy',
    name: 'Anupam Roy',
    avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
    monthlyListeners: 1200000,
    isVerified: true,
    genre: 'Bengali Folk Rock / Acoustic',
    bio: 'Anupam Roy is a National Film Award-winning Indian lyricist, music director, and singer from Kolkata. Famous for revitalizing modern Bengali music with heartfelt acoustic rock poetry.',
    topTracks: [
      {
        id: 'yt-anupam-amake-amar-moto',
        title: 'Amake Amar Moto Thakte Dao',
        artist: 'Anupam Roy',
        artistId: 'artist-anupam-roy',
        album: 'Autograph',
        duration: 295,
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'b_t0m6JzL-w',
        source: 'youtube',
        genre: 'Bengali Rock',
        releaseYear: 2010,
        color: '#7c3aed',
      },
      {
        id: 'yt-anupam-boba-tunnel',
        title: 'Boba Tunnel',
        artist: 'Anupam Roy',
        artistId: 'artist-anupam-roy',
        album: 'Chotushkone',
        duration: 260,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        youtubeId: 'u4iW4vK1RQI',
        source: 'youtube',
        genre: 'Bengali Acoustic',
        releaseYear: 2014,
        color: '#6366f1',
      },
    ],
    albums: [
      {
        id: 'album-autograph',
        title: 'Autograph Soundtrack',
        artist: 'Anupam Roy',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        year: 2010,
        color: '#7c3aed',
        tracks: [],
      },
    ],
    relatedArtists: [
      { id: 'rel-shironamhin', name: 'Shironamhin', avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' },
      { id: 'rel-the-local-train', name: 'The Local Train', avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80' },
    ],
  },
]

// Combined catalog pool of known artists
const allKnownArtists = [...CURATED_ARTISTS]
for (const art of SAMPLE_ARTISTS) {
  if (!allKnownArtists.some((a) => a.name.toLowerCase() === art.name.toLowerCase())) {
    allKnownArtists.push(art)
  }
}

export const artistService = {
  /**
   * Get artist profile by Name or ID with automatic fallback & dynamic resolution
   */
  async getArtistProfile(nameOrId: string): Promise<Artist> {
    const clean = nameOrId.trim().toLowerCase()

    // 1. Search in-memory curated and sample artists
    const found = allKnownArtists.find(
      (a) => a.id.toLowerCase() === clean || a.name.toLowerCase() === clean
    )
    if (found) return found

    // 2. Partial name match in catalog
    const partialMatch = allKnownArtists.find(
      (a) => a.name.toLowerCase().includes(clean) || clean.includes(a.name.toLowerCase())
    )
    if (partialMatch) return partialMatch

    // 3. Search local SAMPLE_TRACKS for any tracks by this artist
    const localTracks = SAMPLE_TRACKS.filter(
      (t) => t.artist.toLowerCase().includes(clean) || clean.includes(t.artist.toLowerCase())
    )

    // 4. Query global catalog online for the artist's real tracks
    let fetchedTracks: Track[] = []
    try {
      fetchedTracks = await searchGlobalMusic(nameOrId)
    } catch {}

    const combinedTracks = [...localTracks]
    for (const track of fetchedTracks) {
      if (!combinedTracks.some((t) => t.id === track.id)) {
        combinedTracks.push(track)
      }
    }

    const firstTrack = combinedTracks[0]
    const avatarUrl = firstTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    const headerImage = firstTrack?.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'

    // Deduce unique albums from tracks
    const albumMap = new Map<string, Album>()
    for (const t of combinedTracks) {
      if (t.album && !albumMap.has(t.album)) {
        albumMap.set(t.album, {
          id: `album-${encodeURIComponent(t.album.toLowerCase().slice(0, 15))}`,
          title: t.album,
          artist: t.artist || nameOrId,
          coverUrl: t.coverUrl,
          year: t.releaseYear || new Date().getFullYear(),
          color: t.color || '#8b5cf6',
          tracks: [t],
        })
      }
    }

    const dynamicArtist: Artist = {
      id: `artist-${encodeURIComponent(nameOrId.toLowerCase().replace(/\s+/g, '-'))}`,
      name: nameOrId,
      avatarUrl,
      headerImage,
      monthlyListeners: Math.floor(Math.random() * 5000000) + 500000,
      isVerified: false,
      genre: firstTrack?.genre || 'Music',
      bio: `${nameOrId} is an artist streamed on RAIWAVE with lossless studio audio quality and dynamic visuals.`,
      topTracks: combinedTracks.slice(0, 15),
      albums: Array.from(albumMap.values()),
      singles: combinedTracks.filter((t) => t.album?.toLowerCase().includes('single')),
      relatedArtists: allKnownArtists.slice(0, 3).map((a) => ({
        id: a.id,
        name: a.name,
        avatarUrl: a.avatarUrl,
      })),
    }

    // Cache to pool
    allKnownArtists.push(dynamicArtist)
    return dynamicArtist
  },

  /**
   * Check if user follows artist
   */
  isFollowing(artistId: string): boolean {
    try {
      const saved = localStorage.getItem(FOLLOWED_ARTISTS_KEY)
      if (!saved) return false
      const ids: string[] = JSON.parse(saved)
      return ids.includes(artistId)
    } catch {
      return false
    }
  },

  /**
   * Toggle follow artist
   */
  toggleFollow(artistId: string): boolean {
    try {
      const saved = localStorage.getItem(FOLLOWED_ARTISTS_KEY)
      let ids: string[] = saved ? JSON.parse(saved) : []
      let nowFollowing = false
      if (ids.includes(artistId)) {
        ids = ids.filter((id) => id !== artistId)
        nowFollowing = false
      } else {
        ids.push(artistId)
        nowFollowing = true
      }
      localStorage.setItem(FOLLOWED_ARTISTS_KEY, JSON.stringify(ids))
      return nowFollowing
    } catch {
      return false
    }
  },
}
