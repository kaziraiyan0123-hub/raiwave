import type { Artist, Track, Album } from '../types'
import { SAMPLE_ARTISTS, SAMPLE_TRACKS, SAMPLE_ALBUMS } from '../data/musicData'
import { searchGlobalMusic } from './musicSearch'
import { getNetworkState } from '../utils/networkImage'

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

const ARTIST_CACHE_KEY = 'raiwave_artist_cache_v1'
const ALBUM_CACHE_KEY = 'raiwave_album_cache_v1'
const CACHE_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

// Combined catalog pool of known artists
const allKnownArtists: Artist[] = [...CURATED_ARTISTS]
for (const art of SAMPLE_ARTISTS) {
  if (!allKnownArtists.some((a) => a.name.toLowerCase() === art.name.toLowerCase())) {
    allKnownArtists.push(art)
  }
}

function normalizeArtistKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractPrimaryArtistName(rawArtist: string): string {
  const cleaned = rawArtist.trim()
  if (!cleaned) return 'Unknown Artist'
  // Preserve multi-word band names while splitting feat/comma/ampersand lists safely
  const parts = cleaned.split(/\s*(?:,|feat\.?|ft\.?|&|×| x )\s*/i).filter(Boolean)
  return (parts[0] || cleaned).trim()
}

function readLocalCache<T>(storageKey: string, itemKey: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, { ts: number; data: T }>
    const entry = map[itemKey]
    if (!entry) return null
    if (Date.now() - entry.ts > CACHE_TTL_MS && getNetworkState().isOnline) {
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function writeLocalCache<T>(storageKey: string, itemKey: string, data: T): void {
  try {
    const raw = localStorage.getItem(storageKey)
    const map: Record<string, { ts: number; data: T }> = raw ? JSON.parse(raw) : {}
    map[itemKey] = { ts: Date.now(), data }
    const keys = Object.keys(map)
    if (keys.length > 25) {
      const oldest = keys.sort((a, b) => map[a].ts - map[b].ts)[0]
      delete map[oldest]
    }
    localStorage.setItem(storageKey, JSON.stringify(map))
  } catch {
    // Ignore storage quota overflow
  }
}

function trackMatchesArtist(trackArtist: string, targetArtist: string): boolean {
  const ta = normalizeArtistKey(trackArtist)
  const target = normalizeArtistKey(targetArtist)
  if (!ta || !target) return false
  if (ta === target) return true
  const segments = ta.split(/\s*(?:,|feat\.?|ft\.?|&|\/)\s*/i).map((s) => s.trim())
  return segments.some((seg) => seg === target)
}

export const artistService = {
  /**
   * Get artist profile by Name or ID with curated + real remote metadata + offline cache
   */
  async getArtistProfile(nameOrId: string): Promise<Artist> {
    const rawInput = nameOrId.trim()
    const clean = normalizeArtistKey(rawInput)
    const cleanNoThe = clean.replace(/^the\s+/, '')

    // 1. Exact ID or normalized name match in curated/sample artists (no loose substring collision)
    const found = allKnownArtists.find((a) => {
      const aNorm = normalizeArtistKey(a.name)
      const aNoThe = aNorm.replace(/^the\s+/, '')
      return (
        a.id.toLowerCase() === clean ||
        aNorm === clean ||
        (cleanNoThe.length >= 4 && aNoThe === cleanNoThe)
      )
    })

    if (found) {
      // Ensure Appears On tracks are attached if collaborations exist in catalog
      const appearsOnTracks = SAMPLE_TRACKS.filter(
        (t) =>
          !found.topTracks.some((ft) => ft.id === t.id) &&
          trackMatchesArtist(t.artist, found.name)
      )
      return {
        ...found,
        bannerUrl: found.bannerUrl || found.headerImage,
        genres: found.genres || (found.genre ? [found.genre] : []),
        appearsOn:
          found.appearsOn ||
          (appearsOnTracks.length > 0
            ? [
                {
                  id: `appears-${found.id}`,
                  title: 'Featured & Collaborations',
                  artist: found.name,
                  coverUrl: appearsOnTracks[0].coverUrl,
                  year: appearsOnTracks[0].releaseYear,
                  color: appearsOnTracks[0].color || '#8B5CF6',
                  tracks: appearsOnTracks,
                },
              ]
            : []),
      }
    }

    // 2. Check persistent cached remote artist profile (essential for offline / Data Saver)
    const cached = readLocalCache<Artist>(ARTIST_CACHE_KEY, clean)
    const net = getNetworkState()
    if (cached && (!net.isOnline || net.isLowDataMode)) {
      return cached
    }

    // 3. Query local catalog for exact matching artist tracks
    const localTracks = SAMPLE_TRACKS.filter((t) => trackMatchesArtist(t.artist, rawInput))

    // 4. Query /api/yt-artist for real Wikipedia bio, iTunes discography, and YouTube Music tracks
    let remoteArtist: Partial<Artist> | null = null
    if (net.isOnline) {
      try {
        const res = await fetch(
          `/api/yt-artist?name=${encodeURIComponent(rawInput)}${net.isLowDataMode ? '&lite=1' : ''}`
        )
        if (res.ok) {
          const json = (await res.json()) as { artist?: Partial<Artist> }
          if (json.artist) remoteArtist = json.artist
        }
      } catch {
        // Fallback cleanly to searchGlobalMusic
      }
    }

    if (cached && !remoteArtist) {
      return cached
    }

    // Supplement playable top tracks via musicSearch only if /api/yt-artist yielded too few tracks
    let searchTracks: Track[] = []
    if (net.isOnline && (!remoteArtist?.topTracks || remoteArtist.topTracks.length < 4)) {
      try {
        const rawSearch = await searchGlobalMusic(rawInput)
        searchTracks = rawSearch.filter(
          (t) =>
            trackMatchesArtist(t.artist, rawInput) ||
            t.title.toLowerCase().includes(clean)
        )
      } catch {
        // Offline / failure fallback handled below
      }
    }

    const combinedTracks: Track[] = [...localTracks]
    const appendUnique = (list?: Track[]) => {
      for (const track of list || []) {
        const normT = `${track.title.toLowerCase().trim()}|${track.artist.toLowerCase().trim()}`
        if (
          !combinedTracks.some(
            (t) =>
              t.id === track.id ||
              `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}` === normT
          )
        ) {
          combinedTracks.push(track)
        }
      }
    }
    appendUnique(remoteArtist?.topTracks)
    appendUnique(searchTracks)

    const fallbackArt = combinedTracks[0]?.coverUrl || ''
    const resolvedName = remoteArtist?.name || rawInput
    const primaryGenre =
      remoteArtist?.genre ||
      combinedTracks.find((t) => t.genre && t.genre !== 'Music')?.genre ||
      ''

    // Derive albums from combined tracks when remote discography is empty
    const remoteAlbums = remoteArtist?.albums || []
    const derivedAlbumMap = new Map<string, Album>()
    if (remoteAlbums.length === 0) {
      for (const t of combinedTracks) {
        if (t.album && !/^(single|top result)$/i.test(t.album)) {
          const existing = derivedAlbumMap.get(t.album)
          if (existing) {
            existing.tracks.push(t)
          } else {
            derivedAlbumMap.set(t.album, {
              id: `album-${encodeURIComponent(t.album.toLowerCase().slice(0, 20))}`,
              title: t.album,
              artist: t.artist || resolvedName,
              coverUrl: t.coverUrl,
              year: t.releaseYear || new Date().getFullYear(),
              color: t.color || '#8b5cf6',
              tracks: [t],
            })
          }
        }
      }
    }

    // Real related artists matching genre (never arbitrary top-3 slice)
    const relatedFromCatalog = allKnownArtists
      .filter(
        (a) =>
          normalizeArtistKey(a.name) !== clean &&
          primaryGenre &&
          a.genre?.toLowerCase().includes(primaryGenre.toLowerCase())
      )
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        name: a.name,
        avatarUrl: a.avatarUrl,
      }))

    const dynamicArtist: Artist = {
      id: remoteArtist?.id || `artist-${encodeURIComponent(clean.replace(/\s+/g, '-'))}`,
      name: resolvedName,
      avatarUrl: remoteArtist?.avatarUrl || fallbackArt,
      headerImage: remoteArtist?.headerImage || fallbackArt,
      bannerUrl: remoteArtist?.bannerUrl || remoteArtist?.headerImage || fallbackArt,
      monthlyListeners: remoteArtist?.monthlyListeners || 0,
      isVerified: Boolean(remoteArtist?.isVerified || combinedTracks.length > 0),
      genre: primaryGenre || 'Music',
      genres: remoteArtist?.genres || (primaryGenre ? [primaryGenre] : []),
      bio: remoteArtist?.bio || '',
      isFallbackBio: Boolean(!remoteArtist?.bio),
      topTracks: combinedTracks.slice(0, 15),
      albums: remoteAlbums.length > 0 ? remoteAlbums : Array.from(derivedAlbumMap.values()),
      eps: remoteArtist?.eps || [],
      singles:
        remoteArtist?.singles && remoteArtist.singles.length > 0
          ? remoteArtist.singles
          : combinedTracks.filter((t) => /single/i.test(t.album || '')),
      appearsOn: [],
      relatedArtists:
        remoteArtist?.relatedArtists && remoteArtist.relatedArtists.length > 0
          ? remoteArtist.relatedArtists
          : relatedFromCatalog,
    }

    if (combinedTracks.length > 0 || (dynamicArtist.albums && dynamicArtist.albums.length > 0)) {
      writeLocalCache(ARTIST_CACHE_KEY, clean, dynamicArtist)
    }

    return dynamicArtist
  },

  /**
   * Resolves tracks for an album that was fetched as metadata-only (e.g. iTunes collection or curated album stub)
   */
  async getAlbumTracks(album: Album): Promise<Track[]> {
    if (album.tracks && album.tracks.length > 0) {
      return album.tracks
    }

    const cacheKey = album.id.toLowerCase()
    const cached = readLocalCache<Track[]>(ALBUM_CACHE_KEY, cacheKey)
    if (cached && cached.length > 0) {
      return cached
    }

    // 1. Check local catalog tracks matching the album name
    const localMatches = SAMPLE_TRACKS.filter(
      (t) =>
        t.album.toLowerCase().includes(album.title.toLowerCase()) &&
        trackMatchesArtist(t.artist, album.artist)
    )
    if (localMatches.length >= 3) {
      writeLocalCache(ALBUM_CACHE_KEY, cacheKey, localMatches)
      return localMatches
    }

    const net = getNetworkState()
    if (!net.isOnline) {
      return localMatches
    }

    // 2. If it came from iTunes discography, look up official tracklist via /api/yt-artist
    if (album.id.startsWith('itunes-alb-')) {
      try {
        const res = await fetch(
          `/api/yt-artist?albumId=${encodeURIComponent(album.id)}&artist=${encodeURIComponent(album.artist)}`
        )
        if (res.ok) {
          const json = (await res.json()) as { tracks?: Track[] }
          if (json.tracks && json.tracks.length > 0) {
            writeLocalCache(ALBUM_CACHE_KEY, cacheKey, json.tracks)
            return json.tracks
          }
        }
      } catch {
        // Fallback to search below
      }
    }

    // 3. Query global search for the album title + artist
    try {
      const results = await searchGlobalMusic(`${album.title} ${album.artist} album`)
      const matched = results.filter(
        (t) =>
          trackMatchesArtist(t.artist, album.artist) ||
          t.title.toLowerCase().includes(album.title.toLowerCase()) ||
          t.album.toLowerCase().includes(album.title.toLowerCase())
      )
      const finalTracks = (matched.length > 0 ? matched : results).slice(0, 12)
      if (finalTracks.length > 0) {
        writeLocalCache(ALBUM_CACHE_KEY, cacheKey, finalTracks)
      }
      return finalTracks
    } catch {
      return localMatches
    }
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
