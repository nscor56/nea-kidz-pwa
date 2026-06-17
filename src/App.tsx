import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Crown,
  Gift,
  HandHeart,
  Headphones,
  Heart,
  Moon,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Palette,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Repeat2,
  Search,
  Settings,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Smartphone,
  Sparkles,
  Sun,
  Type,
  UserCircle,
  WifiOff,
  X,
} from 'lucide-react'
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const PUBLIC_API_BASE = 'https://api.neakidz.com'
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : PUBLIC_API_BASE)
const SESSION_KEY = 'neakidz.pwa2.session'
const FIRST_PLAY_KEY = 'neakidz.pwa2.firstPlayTracked'
const KNOWN_DUAS_KEY = 'neakidz.pwa2.duas.known'
const THEME_MODE_KEY = 'neakidz.pwa2.themeMode'
const TEXT_SCALE_KEY = 'neakidz.pwa2.textScale'
const LOGO_FACE = '/nea_kidz_face_light_gold_transparent.png'

type View =
  | 'home'
  | 'duas'
  | 'search'
  | 'collection'
  | 'episode'
  | 'profile'
  | 'settings'
  | 'paywall'
  | 'auth'
  | 'onboarding'
  | 'success'
type MainTab = 'home' | 'duas' | 'search'
type AuthMode = 'login' | 'register'
type Plan = 'monthly' | 'yearly'
type DuaMemoryFilter = 'all' | 'known' | 'learning'
type ThemeMode = 'light' | 'dark' | 'system'
type TextScale = 0.9 | 1 | 1.2
type OnboardingValues = {
  usageContext: string
  listenerAgeGroup: string
  listeningMoment: string
}

type Session = {
  token: string
  refreshToken: string
}

type User = {
  id: string
  email: string
  name: string
  status: string
  plan: string | null
  provider: string | null
  is_premium?: boolean
  isPremium?: boolean
  expiresAt?: number | string | null
  premium_until?: number | string | null
  subscriptionStatus?: string
  subscription_status?: string
  willRenew?: boolean
  will_renew?: boolean
  usage_context?: string
  usageContext?: string
  listener_age_group?: string
  listenerAgeGroup?: string
  listening_moment?: string
  listeningMoment?: string
  onboarding_completed_at?: string | null
  onboardingCompletedAt?: string | null
  onboarding_skipped_at?: string | null
  onboardingSkippedAt?: string | null
  onboarding_version?: number
  onboardingVersion?: number
  onboarding_required?: boolean
  onboardingRequired?: boolean
}

type Episode = {
  id: string
  title: string
  number?: number
  duration?: number
  sizeMb?: number
  isFree?: boolean
  coverUrl?: string
  heroImageUrl?: string
  collectionId?: string
  collectionName?: string
  seasonName?: string
}

type Collection = {
  id: string
  name: string
  coverUrl?: string
  episodeCount?: number
  episodes: Episode[]
  seasonId?: string
  seasonName?: string
}

type Season = {
  id: string
  name: string
  icon?: string
  color?: string
  imagePath?: string | null
  collections: Collection[]
}

type Catalog = {
  totalSeasons: number
  totalEpisodes: number
  seasons: Season[]
}

type Dua = {
  id: string
  title: string
  context_label?: string
  arabic: string
  transliteration?: string
  meaning_fr?: string
  category?: string
  sort_order?: number
  is_sourate?: boolean
  audio_url_ar?: string | null
  audio_url_fr?: string | null
}

type SearchResult = {
  collections: Array<Pick<Collection, 'id' | 'name' | 'seasonId' | 'seasonName'>>
  episodes: Episode[]
}

type PlayerState = {
  episode: Episode
  collection?: Collection
  src: string
  playing: boolean
  progress: number
  duration: number
}

type DuaAudioState = {
  dua: Dua
  src: string
  playing: boolean
  repeat: boolean
  progress: number
  duration: number
}

type ApiError = Error & {
  status?: number
  code?: string
  payload?: unknown
}

type PreferencesResponse = {
  success?: boolean
  user?: User
  profile?: {
    onboarding_required?: boolean
  }
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const searchSuggestions = ['Adam', 'Nouh', 'Maryam', 'Aïcha', 'bon comportement', 'duaas', 'anges', 'sommeil']
const orderedDuaCategories = ['matin', 'journee', 'journée', 'jour', 'nuit', 'sommeil', 'priere', 'prière', 'coeur', 'cœur', 'occasions', 'sourates']
const duaCategoryLabels: Record<string, string> = {
  matin: 'Matin',
  journee: 'Journée',
  journée: 'Journée',
  jour: 'Journée',
  nuit: 'Nuit & Sommeil',
  sommeil: 'Nuit & Sommeil',
  priere: 'Prière',
  prière: 'Prière',
  coeur: 'Cœur',
  cœur: 'Cœur',
  occasions: 'Occasions',
  sourates: 'Sourates',
}

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  if (API_BASE === '/api') return `/api${path}`
  return `${API_BASE}${path}`
}

function mediaUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (API_BASE === '/api') return `/api${url.startsWith('/') ? url : `/${url}`}`
  return `${PUBLIC_API_BASE}${url.startsWith('/') ? url : `/${url}`}`
}

function loadStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadKnownDuas() {
  try {
    const raw = localStorage.getItem(KNOWN_DUAS_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

function loadThemeMode(): ThemeMode {
  try {
    const value = localStorage.getItem(THEME_MODE_KEY)
    return value === 'dark' || value === 'system' ? value : 'light'
  } catch {
    return 'light'
  }
}

function loadTextScale(): TextScale {
  try {
    const value = Number(localStorage.getItem(TEXT_SCALE_KEY))
    if (Math.abs(value - 0.9) < 0.05) return 0.9
    if (Math.abs(value - 1.2) < 0.05) return 1.2
  } catch {
    // Android defaults to the medium scale.
  }
  return 1
}

function resolveThemeMode(mode: ThemeMode, systemDark: boolean) {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
}

function durationLabel(seconds?: number) {
  const safe = Math.max(0, Math.floor(seconds || 0))
  const min = Math.floor(safe / 60)
  const sec = String(safe % 60).padStart(2, '0')
  return `${min}:${sec}`
}

function planLabel(plan?: string | null) {
  if (plan === 'yearly') return 'Annuel'
  if (plan === 'monthly') return 'Mensuel'
  return 'Premium'
}

function isPremiumUser(user: User | null) {
  if (!user) return false
  const flag = user.is_premium ?? user.isPremium ?? (user.status === 'paid' || user.status === 'premium')
  const rawDate = user.expiresAt ?? user.premium_until
  if (!flag || !rawDate) return Boolean(flag)
  const expiresMs = typeof rawDate === 'number' ? rawDate * 1000 : Date.parse(String(rawDate))
  return Number.isNaN(expiresMs) ? Boolean(flag) : expiresMs > Date.now()
}

function needsOnboarding(user: User | null) {
  if (!user) return false
  const explicit = user.onboarding_required ?? user.onboardingRequired
  if (explicit === true) return true
  if (explicit === false) return false

  const usage = user.usage_context ?? user.usageContext
  const age = user.listener_age_group ?? user.listenerAgeGroup
  const completed = user.onboarding_completed_at ?? user.onboardingCompletedAt
  const skipped = user.onboarding_skipped_at ?? user.onboardingSkippedAt
  const hasPreferenceSignals = usage !== undefined || age !== undefined || completed !== undefined || skipped !== undefined

  return Boolean(hasPreferenceSignals && (usage || 'unknown') === 'unknown' && (age || 'unknown') === 'unknown' && !completed && !skipped)
}

function userWithCompletedOnboarding(user: User | null, values?: Partial<OnboardingValues>) {
  if (!user) return user
  return {
    ...user,
    usage_context: values?.usageContext ?? user.usage_context ?? user.usageContext ?? 'unknown',
    usageContext: values?.usageContext ?? user.usageContext ?? user.usage_context ?? 'unknown',
    listener_age_group: values?.listenerAgeGroup ?? user.listener_age_group ?? user.listenerAgeGroup ?? 'unknown',
    listenerAgeGroup: values?.listenerAgeGroup ?? user.listenerAgeGroup ?? user.listener_age_group ?? 'unknown',
    listening_moment: values?.listeningMoment ?? user.listening_moment ?? user.listeningMoment ?? 'unknown',
    listeningMoment: values?.listeningMoment ?? user.listeningMoment ?? user.listening_moment ?? 'unknown',
    onboarding_required: false,
    onboardingRequired: false,
    onboarding_completed_at: values ? new Date().toISOString() : user.onboarding_completed_at,
    onboardingCompletedAt: values ? new Date().toISOString() : user.onboardingCompletedAt,
  }
}

function providerLabel(provider?: string | null) {
  if (provider === 'stripe') return 'Stripe Web'
  if (provider === 'google' || provider === 'google_play') return 'Google Play'
  if (provider === 'apple') return 'Apple'
  if (provider === 'promo') return 'Offre promo'
  return 'Compte NEA KIDZ'
}

function activeTabFor(view: View): MainTab {
  if (view === 'duas') return 'duas'
  if (view === 'search') return 'search'
  return 'home'
}

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const duaAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastHistorySaveRef = useRef(0)
  const listened60Ref = useRef(false)
  const onboardingStartedRef = useRef(false)
  const [session, setSession] = useState<Session | null>(() => loadStoredSession())
  const [user, setUser] = useState<User | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [catalogError, setCatalogError] = useState('')
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [checkingAccount, setCheckingAccount] = useState(Boolean(session?.token))
  const [view, setView] = useState<View>(() => (window.location.pathname.includes('abonnement/succes') ? 'success' : session ? 'home' : 'auth'))
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searchResult, setSearchResult] = useState<SearchResult>({ collections: [], episodes: [] })
  const [searching, setSearching] = useState(false)
  const [player, setPlayer] = useState<PlayerState | null>(null)
  const [duas, setDuas] = useState<Dua[]>([])
  const [duasError, setDuasError] = useState('')
  const [loadingDuas, setLoadingDuas] = useState(false)
  const [duaQuery, setDuaQuery] = useState('')
  const [duaCategory, setDuaCategory] = useState('all')
  const [duaMemoryFilter, setDuaMemoryFilter] = useState<DuaMemoryFilter>('all')
  const [knownDuas, setKnownDuas] = useState<Set<string>>(() => loadKnownDuas())
  const [duaAudio, setDuaAudio] = useState<DuaAudioState | null>(null)
  const [toast, setToast] = useState('')
  const [networkBusy, setNetworkBusy] = useState(false)
  const [paywallEpisode, setPaywallEpisode] = useState<Episode | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => loadThemeMode())
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
  const [textScale, setTextScaleState] = useState<TextScale>(() => loadTextScale())

  const saveSession = useCallback((next: Session | null) => {
    setSession(next)
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  }, [])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    localStorage.setItem(THEME_MODE_KEY, mode)
  }, [])

  const setTextScale = useCallback((scale: TextScale) => {
    setTextScaleState(scale)
    localStorage.setItem(TEXT_SCALE_KEY, String(scale))
  }, [])

  const logout = useCallback(() => {
    saveSession(null)
    setUser(null)
    setCatalog(null)
    setPlayer(null)
    setDuaAudio(null)
    onboardingStartedRef.current = false
    audioRef.current?.pause()
    duaAudioRef.current?.pause()
    setView('auth')
    setToast('Session fermée.')
  }, [saveSession])

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) return null
    const response = await fetch(apiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
    if (!response.ok) {
      logout()
      return null
    }
    const data = await response.json()
    const next = { token: data.token, refreshToken: data.refreshToken }
    saveSession(next)
    setUser(data.user)
    return next.token
  }, [logout, saveSession, session?.refreshToken])

  const apiFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}, auth = true): Promise<T> => {
      const run = async (token?: string | null) => {
        const headers = new Headers(options.headers)
        if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
        if (auth && token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(apiUrl(path), { ...options, headers })
      }

      let response = await run(session?.token)
      if (response.status === 401 && auth && session?.refreshToken && path !== '/auth/refresh') {
        const nextToken = await refreshSession()
        if (nextToken) response = await run(nextToken)
      }

      const text = await response.text()
      const payload = text ? JSON.parse(text) : null
      if (!response.ok) {
        const error = new Error(payload?.message || 'Erreur réseau') as ApiError
        error.status = response.status
        error.code = payload?.code
        error.payload = payload
        throw error
      }
      return payload as T
    },
    [refreshSession, session?.refreshToken, session?.token],
  )

  const trackEvent = useCallback(
    async (eventName: string, properties: Record<string, unknown> = {}) => {
      try {
        await apiFetch(
          '/analytics/events',
          {
            method: 'POST',
            body: JSON.stringify({
              eventName,
              source: 'pwa2',
              properties,
              device: {
                platform: /iphone|ipad|ipod/i.test(navigator.userAgent)
                  ? 'ios'
                  : /android/i.test(navigator.userAgent)
                    ? 'android'
                    : 'desktop',
                browserName: navigator.userAgent.includes('Safari') ? 'Safari' : undefined,
                isPwa: window.matchMedia('(display-mode: standalone)').matches,
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                locale: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                appVersion: 'pwa2-android-shell-0.2.0',
              },
            }),
          },
          Boolean(session?.token),
        )
      } catch {
        // Analytics must never block listening.
      }
    },
    [apiFetch, session?.token],
  )

  const refreshMe = useCallback(async () => {
    if (!session?.token) {
      setCheckingAccount(false)
      return
    }
    setCheckingAccount(true)
    try {
      const me = await apiFetch<User>('/auth/me')
      setUser(me)
    } catch (error) {
      const status = (error as ApiError).status
      if (status === 401) logout()
    } finally {
      setCheckingAccount(false)
    }
  }, [apiFetch, logout, session?.token])

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true)
    setCatalogError('')
    try {
      const data = await apiFetch<Catalog>('/catalog/seasons')
      setCatalog(hydrateCatalog(data))
    } catch {
      setCatalogError('Catalogue indisponible. Réessayez dans un instant.')
    } finally {
      setLoadingCatalog(false)
    }
  }, [apiFetch])

  const loadDuas = useCallback(async () => {
    setLoadingDuas(true)
    setDuasError('')
    try {
      const data = await apiFetch<Dua[]>('/catalog/duas')
      setDuas(data)
    } catch {
      setDuasError('Invocations indisponibles pour le moment.')
    } finally {
      setLoadingDuas(false)
    }
  }, [apiFetch])

  useEffect(() => {
    if (!session?.token) {
      setLoadingCatalog(false)
      setLoadingDuas(false)
      setCheckingAccount(false)
      return
    }
    loadCatalog()
    loadDuas()
  }, [loadCatalog, loadDuas, session?.token])

  useEffect(() => {
    if (session?.token) refreshMe()
  }, [refreshMe, session?.token])

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!query) return undefined
    const update = () => setSystemDark(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = resolveThemeMode(themeMode, systemDark)
    document.documentElement.dataset.themeMode = themeMode
    document.documentElement.dataset.textScale = String(textScale)
  }, [systemDark, textScale, themeMode])

  useEffect(() => {
    if (!session?.token) {
      if (view !== 'auth' && view !== 'success') {
        setAuthMode('login')
        setView('auth')
      }
      return
    }
    if (needsOnboarding(user) && view !== 'onboarding' && view !== 'auth' && view !== 'success') {
      setView('onboarding')
    }
  }, [session?.token, user, view])

  useEffect(() => {
    if (view !== 'onboarding' || !session?.token || onboardingStartedRef.current) return
    onboardingStartedRef.current = true
    apiFetch(
      '/auth/me/preferences/start',
      {
        method: 'POST',
        body: JSON.stringify({ onboarding_version: 1, platform: 'pwa2' }),
      },
    ).catch(() => undefined)
  }, [apiFetch, session?.token, view])

  useEffect(() => {
    if (!session?.token) return
    apiFetch<{ ids: string[] }>('/user/duas/memorized')
      .then((payload) => {
        const next = new Set(payload.ids || [])
        setKnownDuas(next)
        localStorage.setItem(KNOWN_DUAS_KEY, JSON.stringify([...next]))
      })
      .catch(() => undefined)
  }, [apiFetch, session?.token])

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      trackEvent('pwa_install_prompt_seen')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [trackEvent])

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResult({ collections: [], episodes: [] })
      return
    }
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const data = await apiFetch<SearchResult>(`/catalog/search?q=${encodeURIComponent(query.trim())}`)
        setSearchResult(data)
      } catch {
        setSearchResult({ collections: [], episodes: [] })
      } finally {
        setSearching(false)
      }
    }, 220)
    return () => window.clearTimeout(timer)
  }, [apiFetch, query])

  const allCollections = useMemo(() => {
    if (!catalog) return []
    return catalog.seasons.flatMap((season) =>
      season.collections.map((collection) => ({
        ...collection,
        seasonId: season.id,
        seasonName: season.name,
      })),
    )
  }, [catalog])

  const allEpisodes = useMemo(
    () =>
      allCollections.flatMap((collection) =>
        collection.episodes.map((episode) => ({
          ...episode,
          collectionId: collection.id,
          collectionName: collection.name,
          seasonName: collection.seasonName,
        })),
      ),
    [allCollections],
  )

  const selectedCollection = useMemo(
    () => allCollections.find((collection) => collection.id === selectedCollectionId) || allCollections[0],
    [allCollections, selectedCollectionId],
  )

  const selectedEpisode = useMemo(
    () => allEpisodes.find((episode) => episode.id === selectedEpisodeId) || null,
    [allEpisodes, selectedEpisodeId],
  )

  const premium = isPremiumUser(user)
  const onboardingRequired = needsOnboarding(user)
  const accountPending = Boolean(session?.token && checkingAccount && !user && view !== 'success')
  const featuredEpisode = player?.episode || allEpisodes.find((episode) => episode.isFree) || allEpisodes[0]
  const freeCollection = allCollections.find((collection) => collection.id === 'histoires_gratuites')
  const lockedAuthView = view === 'auth' && !session?.token
  const showBottomNav = Boolean(session?.token && !accountPending && !onboardingRequired && ['home', 'duas', 'search', 'collection', 'episode'].includes(view))
  const showTopMiniPlayer = Boolean(player && view !== 'home' && view !== 'auth' && view !== 'onboarding' && view !== 'success')

  const openCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId)
    setView('collection')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEpisode = (episodeId: string) => {
    const episode = allEpisodes.find((item) => item.id === episodeId)
    if (episode?.collectionId) setSelectedCollectionId(episode.collectionId)
    setSelectedEpisodeId(episodeId)
    setView('episode')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const promptPaywall = async (episode?: Episode) => {
    if (episode) setPaywallEpisode(episode)
    setView('paywall')
    await trackEvent('paywall_seen', {
      episode_id: episode?.id || null,
      plan: selectedPlan,
    })
  }

  const saveHistory = async (episodeId: string, progress: number, completed = false) => {
    if (!session?.token) return
    try {
      await apiFetch('/user/history', {
        method: 'POST',
        body: JSON.stringify({ episodeId, progress: Math.floor(progress), completed }),
      })
    } catch {
      // Listening stays local if history cannot sync.
    }
  }

  const playEpisode = async (episode: Episode, collection?: Collection) => {
    if (!episode.isFree && !premium) {
      await promptPaywall(episode)
      return
    }

    duaAudioRef.current?.pause()
    setDuaAudio((current) => (current ? { ...current, playing: false } : null))
    setNetworkBusy(true)
    try {
      const stream = await apiFetch<{ url: string; duration?: number }>(`/stream/${episode.id}`)
      const src = mediaUrl(stream.url)
      setPlayer({
        episode,
        collection,
        src,
        playing: true,
        progress: 0,
        duration: stream.duration || episode.duration || 0,
      })
      listened60Ref.current = false
      lastHistorySaveRef.current = 0
      window.setTimeout(() => {
        audioRef.current?.play().catch(() => {
          setPlayer((current) => (current ? { ...current, playing: false } : current))
          setToast('Touchez lecture pour démarrer l’audio.')
        })
      }, 0)
      if (!localStorage.getItem(FIRST_PLAY_KEY)) {
        localStorage.setItem(FIRST_PLAY_KEY, '1')
        trackEvent('first_play', { episode_id: episode.id, collection_id: collection?.id || episode.collectionId })
      }
      trackEvent('audio_play_started', { episode_id: episode.id, collection_id: collection?.id || episode.collectionId })
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401) {
        setAuthMode('login')
        setView('auth')
        setToast('Connectez-vous pour continuer.')
      } else if (apiError.status === 403 || apiError.code === 'PREMIUM_REQUIRED') {
        await promptPaywall(episode)
      } else {
        setToast('Audio indisponible pour le moment.')
        trackEvent('audio_error', { episode_id: episode.id, code: apiError.code || 'stream_failed' })
      }
    } finally {
      setNetworkBusy(false)
    }
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio || !player) return
    if (audio.paused) {
      audio.play()
      setPlayer({ ...player, playing: true })
    } else {
      audio.pause()
      setPlayer({ ...player, playing: false })
    }
  }

  const playAdjacentEpisode = (direction: -1 | 1) => {
    if (!player || allEpisodes.length === 0) return
    const currentIndex = Math.max(0, allEpisodes.findIndex((episode) => episode.id === player.episode.id))
    const nextIndex = (currentIndex + direction + allEpisodes.length) % allEpisodes.length
    const nextEpisode = allEpisodes[nextIndex]
    const nextCollection = allCollections.find((collection) => collection.id === nextEpisode.collectionId)
    playEpisode(nextEpisode, nextCollection)
  }

  const closePlayer = () => {
    audioRef.current?.pause()
    setPlayer(null)
  }

  const startDua = (dua: Dua, repeat = false) => {
    audioRef.current?.pause()
    setPlayer((current) => (current ? { ...current, playing: false } : null))
    setDuaAudio({
      dua,
      src: mediaUrl(dua.audio_url_ar || `/stream/duas/${dua.id}/ar`),
      playing: true,
      repeat,
      progress: 0,
      duration: 0,
    })
    window.setTimeout(() => {
      duaAudioRef.current?.play().catch(() => {
        setDuaAudio((current) => (current ? { ...current, playing: false } : current))
        setToast('Touchez lecture pour démarrer l’invocation.')
      })
    }, 0)
  }

  const toggleDuaPlayback = (dua: Dua, repeat = false) => {
    const audio = duaAudioRef.current
    if (duaAudio?.dua.id !== dua.id || !audio) {
      startDua(dua, repeat)
      return
    }
    if (repeat !== duaAudio.repeat) {
      setDuaAudio({ ...duaAudio, repeat })
      audio.loop = repeat
    }
    if (audio.paused) {
      audio.play()
      setDuaAudio({ ...duaAudio, playing: true, repeat })
    } else {
      audio.pause()
      setDuaAudio({ ...duaAudio, playing: false, repeat })
    }
  }

  const toggleKnownDua = (duaId: string) => {
    const next = new Set(knownDuas)
    const known = next.has(duaId)
    if (known) next.delete(duaId)
    else next.add(duaId)
    setKnownDuas(next)
    localStorage.setItem(KNOWN_DUAS_KEY, JSON.stringify([...next]))
    if (session?.token) {
      apiFetch(`/user/duas/memorized/${duaId}`, { method: known ? 'DELETE' : 'PUT' }).catch(() => undefined)
    }
  }

  const checkout = async (plan: Plan) => {
    setSelectedPlan(plan)
    if (!session?.token) {
      setAuthMode('register')
      setView('auth')
      setToast('Créez votre compte pour activer premium.')
      return
    }
    setNetworkBusy(true)
    try {
      const sessionData = await apiFetch<{ url: string }>('/subscription/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = sessionData.url
    } catch (error) {
      const apiError = error as ApiError
      setToast(apiError.status === 503 ? 'Stripe doit être configuré côté backend.' : 'Paiement indisponible.')
    } finally {
      setNetworkBusy(false)
    }
  }

  const openPortal = async () => {
    setNetworkBusy(true)
    try {
      const sessionData = await apiFetch<{ url: string }>('/subscription/stripe/portal', { method: 'POST' })
      window.location.href = sessionData.url
    } catch {
      setToast('Portail Stripe indisponible pour ce compte.')
    } finally {
      setNetworkBusy(false)
    }
  }

  const updatePreferences = async (payload: Record<string, unknown>) => {
    const options = { method: 'PATCH', body: JSON.stringify(payload) }
    try {
      return await apiFetch<PreferencesResponse>('/auth/me/preferences', options)
    } catch (error) {
      const status = (error as ApiError).status
      if (status !== 404 && status !== 405) throw error
      return apiFetch<PreferencesResponse>('/me/preferences', options)
    }
  }

  const completeOnboarding = async (values: OnboardingValues) => {
    setNetworkBusy(true)
    try {
      const data = await updatePreferences({
        usage_context: values.usageContext,
        listener_age_group: values.listenerAgeGroup,
        listening_moment: values.listeningMoment,
        onboarding_version: 1,
        platform: 'pwa2',
      })
      setUser(data.user || userWithCompletedOnboarding(user, values))
      setView('home')
      setToast('Espace d’écoute prêt.')
    } catch (error) {
      setToast((error as ApiError).message || 'Préférences indisponibles.')
    } finally {
      setNetworkBusy(false)
    }
  }

  const skipOnboarding = async () => {
    setNetworkBusy(true)
    try {
      const data = await updatePreferences({
        skip_onboarding: true,
        onboarding_version: 1,
        platform: 'pwa2',
      })
      setUser(data.user || userWithCompletedOnboarding(user))
      setView('home')
      setToast('Vous pourrez compléter ces préférences plus tard.')
    } catch (error) {
      setToast((error as ApiError).message || 'Préférences indisponibles.')
    } finally {
      setNetworkBusy(false)
    }
  }

  const installPwa = async () => {
    if (!installPrompt) return
    await trackEvent('pwa_add_to_home_screen_intent')
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const switchMainTab = (tab: MainTab) => {
    setView(tab === 'home' ? 'home' : tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onAudioTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !player) return
    const progress = audio.currentTime
    const duration = audio.duration || player.duration
    setPlayer({ ...player, progress, duration, playing: !audio.paused })
    if (progress >= 60 && !listened60Ref.current) {
      listened60Ref.current = true
      trackEvent('60s_listened', { episode_id: player.episode.id })
    }
    if (progress - lastHistorySaveRef.current > 25) {
      lastHistorySaveRef.current = progress
      saveHistory(player.episode.id, progress)
    }
  }

  const onAudioEnded = () => {
    if (!player) return
    saveHistory(player.episode.id, player.duration || player.progress, true)
    trackEvent('episode_completed', { episode_id: player.episode.id })
    trackEvent('audio_completed', { episode_id: player.episode.id })
    setPlayer({ ...player, progress: player.duration, playing: false })
  }

  const onDuaTimeUpdate = () => {
    const audio = duaAudioRef.current
    if (!audio || !duaAudio) return
    setDuaAudio({ ...duaAudio, progress: audio.currentTime, duration: audio.duration || duaAudio.duration, playing: !audio.paused })
  }

  const onDuaEnded = () => {
    if (!duaAudio) return
    setDuaAudio({ ...duaAudio, progress: duaAudio.duration, playing: false })
  }

  return (
    <main className="app-shell">
      <audio
        ref={audioRef}
        src={player?.src}
        onTimeUpdate={onAudioTimeUpdate}
        onEnded={onAudioEnded}
        onPlay={() => player && setPlayer({ ...player, playing: true })}
        onPause={() => player && setPlayer({ ...player, playing: false })}
      />
      <audio
        ref={duaAudioRef}
        src={duaAudio?.src}
        loop={duaAudio?.repeat}
        onTimeUpdate={onDuaTimeUpdate}
        onEnded={onDuaEnded}
        onPlay={() => duaAudio && setDuaAudio({ ...duaAudio, playing: true })}
        onPause={() => duaAudio && setDuaAudio({ ...duaAudio, playing: false })}
      />

      {showTopMiniPlayer && player ? (
        <MiniPlayerTop player={player} onToggle={togglePlayback} onPrevious={() => playAdjacentEpisode(-1)} onNext={() => playAdjacentEpisode(1)} onClose={closePlayer} />
      ) : (
        <AppHeader
          variant={lockedAuthView || view === 'onboarding' ? 'locked' : view === 'home' || view === 'duas' || view === 'search' ? 'root' : 'detail'}
          showRight={view !== 'profile' && view !== 'settings' && view !== 'auth' && view !== 'onboarding' && view !== 'success'}
          onBack={() => setView('home')}
          onHome={() => setView('home')}
          onProfile={() => {
            setView('profile')
          }}
          onSettings={() => setView('settings')}
        />
      )}

      <section className="content-zone">
        {accountPending && <LoadingState />}
        {!accountPending && view === 'home' && (
          <HomeView
            catalog={catalog}
            loading={loadingCatalog}
            error={catalogError}
            premium={premium}
            player={player}
            featuredEpisode={featuredEpisode}
            freeCollection={freeCollection}
            allCollections={allCollections}
            onRetry={loadCatalog}
            onOpenCollection={openCollection}
            onOpenEpisode={openEpisode}
            onPlay={playEpisode}
            onPaywall={promptPaywall}
            onTogglePlayer={togglePlayback}
            onPrevious={() => playAdjacentEpisode(-1)}
            onNext={() => playAdjacentEpisode(1)}
          />
        )}
        {!accountPending && view === 'duas' && (
          <DuasView
            duas={duas}
            loading={loadingDuas}
            error={duasError}
            query={duaQuery}
            category={duaCategory}
            memoryFilter={duaMemoryFilter}
            knownDuas={knownDuas}
            duaAudio={duaAudio}
            onQuery={setDuaQuery}
            onCategory={setDuaCategory}
            onMemoryFilter={setDuaMemoryFilter}
            onRetry={loadDuas}
            onPlay={toggleDuaPlayback}
            onKnown={toggleKnownDua}
          />
        )}
        {!accountPending && view === 'collection' && selectedCollection && (
          <CollectionView
            collection={selectedCollection}
            premium={premium}
            onBack={() => setView('home')}
            onOpenEpisode={openEpisode}
            onPlay={playEpisode}
          />
        )}
        {!accountPending && view === 'episode' && selectedEpisode && (
          <EpisodeView
            episode={selectedEpisode}
            collection={allCollections.find((item) => item.id === selectedEpisode.collectionId)}
            premium={premium}
            onBack={() => setView(selectedEpisode.collectionId ? 'collection' : 'home')}
            onPlay={playEpisode}
            onPaywall={promptPaywall}
          />
        )}
        {!accountPending && view === 'search' && (
          <SearchView
            query={query}
            searching={searching}
            result={searchResult}
            catalogEpisodes={allEpisodes}
            catalogCollections={allCollections}
            onQuery={setQuery}
            onOpenCollection={openCollection}
            onOpenEpisode={openEpisode}
            onPlay={playEpisode}
          />
        )}
        {!accountPending && view === 'profile' && (
          <ProfileView
            user={user}
            premium={premium}
            busy={networkBusy}
            onLogin={() => {
              setAuthMode('login')
              setView('auth')
            }}
            onLogout={logout}
            onPortal={openPortal}
            onPaywall={() => promptPaywall()}
            onRefresh={refreshMe}
          />
        )}
        {!accountPending && view === 'settings' && (
          <SettingsView
            installable={Boolean(installPrompt)}
            busy={networkBusy}
            themeMode={themeMode}
            textScale={textScale}
            onInstall={installPwa}
            onRefresh={() => {
              loadCatalog()
              loadDuas()
              refreshMe()
            }}
            onProfile={() => setView(user ? 'profile' : 'auth')}
            onPreferences={() => setView('onboarding')}
            onThemeMode={setThemeMode}
            onTextScale={setTextScale}
          />
        )}
        {!accountPending && view === 'paywall' && (
          <PaywallView
            episode={paywallEpisode}
            selectedPlan={selectedPlan}
            busy={networkBusy}
            authenticated={Boolean(session?.token)}
            onSelectPlan={setSelectedPlan}
            onCheckout={checkout}
            onBack={() => setView('home')}
            onAuth={() => {
              setAuthMode('register')
              setView('auth')
            }}
          />
        )}
        {!accountPending && view === 'auth' && (
          <AuthView
            mode={authMode}
            busy={networkBusy}
            locked={lockedAuthView}
            onMode={setAuthMode}
            onBack={() => setView('home')}
            onSubmit={async (mode, values) => {
              setNetworkBusy(true)
              try {
                const data = await apiFetch<{ token: string; refreshToken: string; user: User }>(
                  mode === 'login' ? '/auth/login' : '/auth/register',
                  { method: 'POST', body: JSON.stringify(values) },
                  false,
                )
                saveSession({ token: data.token, refreshToken: data.refreshToken })
                setUser(data.user)
                setView(needsOnboarding(data.user) ? 'onboarding' : 'home')
                setToast(mode === 'login' ? 'Connexion réussie.' : 'Compte créé.')
              } catch (error) {
                setToast((error as ApiError).message)
              } finally {
                setNetworkBusy(false)
              }
            }}
          />
        )}
        {!accountPending && view === 'onboarding' && (
          <OnboardingView
            user={user}
            busy={networkBusy}
            onComplete={completeOnboarding}
            onSkip={skipOnboarding}
          />
        )}
        {view === 'success' && (
          <SuccessView
            onContinue={async () => {
              await refreshMe()
              setView('home')
            }}
          />
        )}
      </section>

      {showBottomNav && <BottomNav active={activeTabFor(view)} onView={switchMainTab} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      {networkBusy && (
        <div className="busy-pill">
          <Loader2 size={16} />
        </div>
      )}
    </main>
  )
}

function hydrateCatalog(data: Catalog): Catalog {
  return {
    ...data,
    seasons: data.seasons.map((season) => ({
      ...season,
      collections: season.collections.map((collection) => ({
        ...collection,
        seasonId: season.id,
        seasonName: season.name,
        episodes: collection.episodes.map((episode) => ({
          ...episode,
          collectionId: collection.id,
          collectionName: collection.name,
          seasonName: season.name,
          coverUrl: episode.coverUrl || collection.coverUrl,
          heroImageUrl: episode.heroImageUrl || episode.coverUrl || collection.coverUrl,
        })),
      })),
    })),
  }
}

function AppHeader({
  variant,
  showRight,
  onBack,
  onHome,
  onProfile,
  onSettings,
}: {
  variant: 'root' | 'detail' | 'locked'
  showRight: boolean
  onBack: () => void
  onHome: () => void
  onProfile: () => void
  onSettings: () => void
}) {
  return (
    <header className="app-header">
      {variant === 'locked' ? (
        <span className="header-icon-placeholder" />
      ) : (
        <button className="header-icon" type="button" onClick={variant === 'root' ? onProfile : onBack} aria-label={variant === 'root' ? 'Profil' : 'Retour'}>
          {variant === 'root' ? <UserCircle size={25} /> : <ArrowLeft size={24} />}
        </button>
      )}
      <button className="brand-lockup" type="button" onClick={variant === 'locked' ? undefined : onHome} aria-label="Accueil NEA KIDZ" aria-disabled={variant === 'locked'}>
        <span>NEA</span>
        <img src={LOGO_FACE} alt="" />
        <span>KIDZ</span>
      </button>
      {showRight ? (
        <button className="header-icon" type="button" onClick={onSettings} aria-label="Réglages">
          <Settings size={23} />
        </button>
      ) : (
        <span className="header-icon-placeholder" />
      )}
    </header>
  )
}

function HomeView({
  catalog,
  loading,
  error,
  premium,
  player,
  featuredEpisode,
  freeCollection,
  allCollections,
  onRetry,
  onOpenCollection,
  onOpenEpisode,
  onPlay,
  onPaywall,
  onTogglePlayer,
  onPrevious,
  onNext,
}: {
  catalog: Catalog | null
  loading: boolean
  error: string
  premium: boolean
  player: PlayerState | null
  featuredEpisode?: Episode
  freeCollection?: Collection
  allCollections: Collection[]
  onRetry: () => void
  onOpenCollection: (id: string) => void
  onOpenEpisode: (id: string) => void
  onPlay: (episode: Episode, collection?: Collection) => void
  onPaywall: () => void
  onTogglePlayer: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (!catalog) return null

  const seasons = catalog.seasons.filter((season) => season.collections.length > 0)
  const premiumCollections = allCollections.filter((collection) => collection.id !== 'histoires_gratuites')
  const topStories = premiumCollections
    .flatMap((collection) =>
      collection.episodes.slice(0, 1).map((episode) => ({
        ...episode,
        collectionId: collection.id,
        collectionName: collection.name,
        coverUrl: episode.coverUrl || collection.coverUrl,
        heroImageUrl: episode.heroImageUrl || episode.coverUrl || collection.coverUrl,
      })),
    )
    .slice(0, 7)
  const featuredCollection = allCollections.find((collection) => collection.id === featuredEpisode?.collectionId) || freeCollection

  return (
    <div className="screen home-screen">
      {featuredEpisode && (
        <AudioHeroCard
          episode={featuredEpisode}
          collection={featuredCollection}
          player={player}
          onPlay={() => (player?.episode.id === featuredEpisode.id ? onTogglePlayer() : onPlay(featuredEpisode, featuredCollection))}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      )}

      <section className="playlist-section">
        <SectionHeader title="Listes de lecture" />
        <div className="playlist-strip">
          <button className="playlist-shortcut" type="button">
            <span className="playlist-icon">
              <Heart size={21} />
            </span>
            <span>
              <strong>Favoris</strong>
              <small>0 histoire</small>
            </span>
          </button>
          <button className="playlist-add" type="button" onClick={onPaywall} aria-label="Créer une liste de lecture">
            <Plus size={31} />
          </button>
        </div>
      </section>

      {!premium && freeCollection && (
        <Rail
          title="Histoires gratuites"
          episodes={freeCollection.episodes}
          premium={premium}
          onPlay={(episode) => onPlay(episode, freeCollection)}
        />
      )}

      {topStories.length > 0 && (
        <TopStoriesRail
          title="Les plus écoutées"
          episodes={topStories}
          premium={premium}
          onOpenEpisode={onOpenEpisode}
          onOpenCollection={onOpenCollection}
        />
      )}

      {seasons
        .filter((season) => season.id !== 'gratuit')
        .map((season) => (
          <CollectionRail
            key={season.id}
            title={season.name}
            collections={season.collections}
            premium={premium}
            onOpenCollection={onOpenCollection}
            onPaywall={onPaywall}
          />
        ))}
    </div>
  )
}

function AudioHeroCard({
  episode,
  collection,
  player,
  onPlay,
  onPrevious,
  onNext,
}: {
  episode: Episode
  collection?: Collection
  player: PlayerState | null
  onPlay: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const isCurrent = player?.episode.id === episode.id
  const percent = isCurrent && player?.duration ? Math.min(100, (player.progress / player.duration) * 100) : 0

  return (
    <section className="audio-hero">
      <img src={mediaUrl(episode.heroImageUrl || episode.coverUrl || collection?.coverUrl)} alt="" />
      <div className="audio-hero-overlay">
        <div>
          <h1>{episode.title}</h1>
          <span>{collection?.name || episode.collectionName || 'Histoires'}</span>
        </div>
        <div className="audio-controls">
          <button className="play-main" type="button" onClick={onPlay} aria-label={isCurrent && player?.playing ? 'Pause' : 'Lecture'}>
            {isCurrent && player?.playing ? <Pause size={25} /> : <Play size={25} />}
          </button>
          <button type="button" onClick={onPrevious} aria-label="Précédent">
            <SkipBack size={18} />
          </button>
          <button type="button" onClick={onNext} aria-label="Suivant">
            <SkipForward size={18} />
          </button>
          <div className="hero-progress" aria-hidden="true">
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Rail({
  title,
  episodes,
  premium,
  onPlay,
}: {
  title: string
  episodes: Episode[]
  premium: boolean
  onPlay: (episode: Episode) => void
}) {
  return (
    <section className="rail-section">
      <SectionHeader title={title} />
      <div className="episode-rail">
        {episodes.map((episode) => (
          <article className="story-card" key={episode.id}>
            <button className="story-art" type="button" onClick={() => onPlay(episode)}>
              <img src={mediaUrl(episode.coverUrl || episode.heroImageUrl)} alt="" />
              {!episode.isFree && !premium && (
                <span className="lock-badge">
                  <Lock size={13} />
                </span>
              )}
              <span className="story-play-overlay" aria-hidden="true">
                <Play size={17} />
              </span>
            </button>
            <button className="story-title" type="button" onClick={() => onPlay(episode)}>
              <span>{episode.title}</span>
              <small>
                <Clock3 size={12} />
                {durationLabel(episode.duration)}
              </small>
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function TopStoriesRail({
  title,
  episodes,
  premium,
  onOpenEpisode,
  onOpenCollection,
}: {
  title: string
  episodes: Episode[]
  premium: boolean
  onOpenEpisode: (id: string) => void
  onOpenCollection: (id: string) => void
}) {
  return (
    <section className="top-stories-section">
      <SectionHeader title={title} />
      <div className="top-stories-shelf">
        {episodes.map((episode, index) => {
          const locked = !premium && !episode.isFree
          const openTarget = () => (episode.collectionId ? onOpenCollection(episode.collectionId) : onOpenEpisode(episode.id))
          return (
            <article className="top-story-card" key={episode.id}>
              <span className="top-story-rank">{index + 1}</span>
              <button className="top-story-panel" type="button" onClick={openTarget}>
                <span className="top-story-cover">
                  <img src={mediaUrl(episode.coverUrl || episode.heroImageUrl)} alt="" />
                  {locked && <span className="premium-badge">Premium</span>}
                </span>
                <span className="top-story-title">
                  <span>{episode.title}</span>
                </span>
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function CollectionRail({
  title,
  collections,
  premium,
  onOpenCollection,
  onPaywall,
}: {
  title: string
  collections: Collection[]
  premium: boolean
  onOpenCollection: (id: string) => void
  onPaywall: () => void
}) {
  return (
    <section className="collection-rail-section">
      <SectionHeader title={title} />
      <div className="collection-shelf">
        {collections.map((collection) => {
          const locked = !premium && collection.id !== 'histoires_gratuites'
          const cover = collection.coverUrl || collection.episodes[0]?.coverUrl || collection.episodes[0]?.heroImageUrl
          return (
            <button
              className={locked ? 'collection-tile locked' : 'collection-tile'}
              type="button"
              key={collection.id}
              onClick={() => (locked ? onPaywall() : onOpenCollection(collection.id))}
            >
              <img src={mediaUrl(cover)} alt="" />
              <span>{collection.name}</span>
              {locked && (
                <i aria-hidden="true">
                  <Lock size={16} />
                </i>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function DuasView({
  duas,
  loading,
  error,
  query,
  category,
  memoryFilter,
  knownDuas,
  duaAudio,
  onQuery,
  onCategory,
  onMemoryFilter,
  onRetry,
  onPlay,
  onKnown,
}: {
  duas: Dua[]
  loading: boolean
  error: string
  query: string
  category: string
  memoryFilter: DuaMemoryFilter
  knownDuas: Set<string>
  duaAudio: DuaAudioState | null
  onQuery: (query: string) => void
  onCategory: (category: string) => void
  onMemoryFilter: (filter: DuaMemoryFilter) => void
  onRetry: () => void
  onPlay: (dua: Dua, repeat?: boolean) => void
  onKnown: (duaId: string) => void
}) {
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={onRetry} />

  const categories = [
    'all',
    ...[...new Set(duas.map((dua) => dua.category).filter(Boolean) as string[])].sort((a, b) => categoryRank(a) - categoryRank(b)),
  ]
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = duas.filter((dua) => {
    const categoryMatch = category === 'all' || dua.category === category
    const known = knownDuas.has(dua.id)
    const memoryMatch = memoryFilter === 'all' || (memoryFilter === 'known' ? known : !known)
    const textMatch =
      !normalizedQuery ||
      [dua.title, dua.context_label, dua.transliteration, dua.meaning_fr, dua.arabic]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    return categoryMatch && memoryMatch && textMatch
  })

  return (
    <div className="screen duas-screen">
      <section className="library-intro">
        <h1>Invocations</h1>
        <p>Écoute, répète, puis coche quand tu les connais</p>
      </section>

      <div className="mode-switch" role="tablist" aria-label="Bibliothèque">
        <button className="active" type="button">
          Invocations
        </button>
        <button type="button">
          99 noms d’Allah
        </button>
      </div>

      <div className="search-box embedded">
        <Search size={19} />
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Rechercher une invocation..." />
        {query && (
          <button type="button" onClick={() => onQuery('')} aria-label="Effacer">
            <X size={17} />
          </button>
        )}
      </div>

      <div className="chip-rail">
        {categories.map((item) => (
          <button className={category === item ? 'active' : ''} type="button" key={item} onClick={() => onCategory(item)}>
            {item === 'all' ? 'Toutes' : categoryLabel(item)}
          </button>
        ))}
      </div>

      <div className="memory-filters">
        <button className={memoryFilter === 'all' ? 'active' : ''} type="button" onClick={() => onMemoryFilter('all')}>
          Toutes
        </button>
        <button className={memoryFilter === 'known' ? 'active' : ''} type="button" onClick={() => onMemoryFilter('known')}>
          Connues ({knownDuas.size})
        </button>
        <button className={memoryFilter === 'learning' ? 'active' : ''} type="button" onClick={() => onMemoryFilter('learning')}>
          À apprendre
        </button>
      </div>

      <div className="dua-list">
        {filtered.map((dua) => (
          <DuaCard
            key={dua.id}
            dua={dua}
            known={knownDuas.has(dua.id)}
            playing={duaAudio?.dua.id === dua.id && duaAudio.playing}
            repeating={duaAudio?.dua.id === dua.id && duaAudio.repeat}
            onPlay={() => onPlay(dua)}
            onRepeat={() => onPlay(dua, true)}
            onKnown={() => onKnown(dua.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon={<Search size={28} />} title="Aucun résultat" text="Essaie une autre catégorie ou un autre mot." />}
    </div>
  )
}

function categoryRank(category: string) {
  const index = orderedDuaCategories.indexOf(category)
  return index === -1 ? 99 : index
}

function categoryLabel(category: string) {
  return duaCategoryLabels[category] || category.replaceAll('_', ' ')
}

function DuaCard({
  dua,
  known,
  playing,
  repeating,
  onPlay,
  onRepeat,
  onKnown,
}: {
  dua: Dua
  known: boolean
  playing?: boolean
  repeating?: boolean
  onPlay: () => void
  onRepeat: () => void
  onKnown: () => void
}) {
  return (
    <article className={known ? 'dua-card known' : 'dua-card'}>
      <div className="dua-card-head">
        <span>{dua.context_label || categoryLabel(dua.category || '')}</span>
        {known && <CheckCircle2 size={18} />}
      </div>
      <p className="arabic-text">{dua.arabic}</p>
      <h2>{dua.title}</h2>
      {dua.transliteration && <p className="transliteration">{dua.transliteration}</p>}
      {dua.meaning_fr && <p className="meaning">{dua.meaning_fr}</p>}
      <div className="dua-actions">
        <button type="button" onClick={onPlay}>
          {playing && !repeating ? <Pause size={16} /> : <Play size={16} />}
          Écouter
        </button>
        <button className={repeating ? 'active' : ''} type="button" onClick={onRepeat}>
          <Repeat2 size={16} />
          Répéter
        </button>
        <button className={known ? 'active' : ''} type="button" onClick={onKnown}>
          <Check size={16} />
          Je connais
        </button>
      </div>
    </article>
  )
}

function CollectionView({
  collection,
  premium,
  onBack,
  onOpenEpisode,
  onPlay,
}: {
  collection: Collection
  premium: boolean
  onBack: () => void
  onOpenEpisode: (id: string) => void
  onPlay: (episode: Episode, collection?: Collection) => void
}) {
  return (
    <div className="screen">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Histoires
      </button>
      <section className="collection-hero">
        <img src={mediaUrl(collection.coverUrl || collection.episodes[0]?.coverUrl)} alt="" />
        <div>
          <span className="eyebrow">
            <BookOpen size={14} />
            {collection.seasonName || 'Collection'}
          </span>
          <h1>{collection.name}</h1>
          <p>{collection.episodes.length} épisodes</p>
        </div>
      </section>
      <div className="episode-list">
        {collection.episodes.map((episode) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            premium={premium}
            onOpen={() => onOpenEpisode(episode.id)}
            onPlay={() => onPlay(episode, collection)}
          />
        ))}
      </div>
    </div>
  )
}

function EpisodeView({
  episode,
  collection,
  premium,
  onBack,
  onPlay,
  onPaywall,
}: {
  episode: Episode
  collection?: Collection
  premium: boolean
  onBack: () => void
  onPlay: (episode: Episode, collection?: Collection) => void
  onPaywall: (episode?: Episode) => void
}) {
  const locked = !episode.isFree && !premium
  return (
    <div className="screen">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Retour
      </button>
      <section className="episode-detail">
        <img src={mediaUrl(episode.heroImageUrl || episode.coverUrl)} alt="" />
        <span className={locked ? 'status-pill locked' : 'status-pill'}>
          {locked ? <Lock size={14} /> : <CheckCircle2 size={14} />}
          {locked ? 'Premium' : 'Disponible'}
        </span>
        <h1>{episode.title}</h1>
        <p>{episode.collectionName || collection?.name}</p>
        <div className="detail-facts">
          <span>
            <Clock3 size={15} />
            {durationLabel(episode.duration)}
          </span>
          <span>
            <Headphones size={15} />
            Audio
          </span>
        </div>
        <button className="primary-action full" type="button" onClick={() => (locked ? onPaywall(episode) : onPlay(episode, collection))}>
          {locked ? <Crown size={19} /> : <Play size={19} />}
          {locked ? 'Débloquer' : 'Écouter'}
        </button>
      </section>
    </div>
  )
}

function SearchView({
  query,
  searching,
  result,
  catalogEpisodes,
  catalogCollections,
  onQuery,
  onOpenCollection,
  onOpenEpisode,
  onPlay,
}: {
  query: string
  searching: boolean
  result: SearchResult
  catalogEpisodes: Episode[]
  catalogCollections: Collection[]
  onQuery: (query: string) => void
  onOpenCollection: (id: string) => void
  onOpenEpisode: (id: string) => void
  onPlay: (episode: Episode) => void
}) {
  const matchedEpisodes = result.episodes.map((episode) => catalogEpisodes.find((item) => item.id === episode.id) || episode)
  return (
    <div className="screen search-screen">
      <div className="search-box">
        <Search size={20} />
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Rechercher une histoire..." autoFocus />
        {query && (
          <button type="button" onClick={() => onQuery('')} aria-label="Effacer">
            <X size={18} />
          </button>
        )}
      </div>

      {!query && (
        <div className="suggestions">
          {searchSuggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => onQuery(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {searching && <p className="muted-line">Recherche...</p>}
      {!query && <EmptyState icon={<Search size={28} />} title="Recherche" text="Prophètes, douas, compagnons, bonnes manières..." />}
      {query && !searching && matchedEpisodes.length === 0 && result.collections.length === 0 && (
        <EmptyState icon={<WifiOff size={28} />} title="Aucun résultat" text="Essayez un autre mot-clé." />
      )}
      {result.collections.length > 0 && (
        <section className="season-band">
          <SectionHeader title={`Collections (${result.collections.length})`} />
          <div className="horizontal-collections">
            {result.collections.map((collection) => {
              const full = catalogCollections.find((item) => item.id === collection.id)
              return (
                <button className="wide-collection" type="button" key={collection.id} onClick={() => onOpenCollection(collection.id)}>
                  <img src={mediaUrl(full?.coverUrl || full?.episodes[0]?.coverUrl)} alt="" />
                  <span>{collection.name}</span>
                  <ChevronRight size={18} />
                </button>
              )
            })}
          </div>
        </section>
      )}
      {matchedEpisodes.length > 0 && (
        <section className="episode-list-section">
          <SectionHeader title={`Épisodes (${matchedEpisodes.length})`} />
          <div className="episode-list">
            {matchedEpisodes.map((episode) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                premium
                onOpen={() => onOpenEpisode(episode.id)}
                onPlay={() => onPlay(episode)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProfileView({
  user,
  premium,
  busy,
  onLogin,
  onLogout,
  onPortal,
  onPaywall,
  onRefresh,
}: {
  user: User | null
  premium: boolean
  busy: boolean
  onLogin: () => void
  onLogout: () => void
  onPortal: () => void
  onPaywall: () => void
  onRefresh: () => void
}) {
  if (!user) {
    return (
      <div className="screen profile-screen">
        <section className="profile-panel guest">
          <UserCircle size={54} />
          <h1>Connectez-vous pour accéder<br />à toutes les fonctionnalités</h1>
          <p>Épisodes premium, favoris, historique...</p>
          <button className="primary-action full" type="button" onClick={onLogin}>
            <LogIn size={18} />
            Se connecter
          </button>
          <small>Un compte est obligatoire pour accéder au contenu.</small>
        </section>
      </div>
    )
  }

  const status = user.subscriptionStatus || user.subscription_status || (premium ? 'active' : 'free')
  return (
    <div className="screen profile-screen">
      <section className="profile-panel">
        <div className="avatar">{user.name?.[0]?.toUpperCase() || 'N'}</div>
        <h1>{user.name || 'Famille NEA KIDZ'}</h1>
        <p>{user.email}</p>
        <span className={premium ? 'status-pill' : 'status-pill muted'}>
          {premium ? <BadgeCheck size={14} /> : <Gift size={14} />}
          {premium ? `${planLabel(user.plan)} actif` : 'Compte gratuit'}
        </span>
      </section>
      <div className="settings-list">
        <div className="settings-row">
          <ShieldCheck size={20} />
          <div>
            <strong>Statut</strong>
            <span>{status}</span>
          </div>
        </div>
        <div className="settings-row">
          <CreditCard size={20} />
          <div>
            <strong>Provider</strong>
            <span>{providerLabel(user.provider)}</span>
          </div>
        </div>
        {premium && user.provider === 'stripe' && (
          <button className="settings-row action-row" type="button" onClick={onPortal} disabled={busy}>
            <CreditCard size={20} />
            <div>
              <strong>Gérer Stripe</strong>
              <span>Facturation et résiliation</span>
            </div>
            <ChevronRight size={18} />
          </button>
        )}
        {!premium && (
          <button className="settings-row action-row" type="button" onClick={onPaywall}>
            <Crown size={20} />
            <div>
              <strong>Passer premium</strong>
              <span>Mensuel ou annuel</span>
            </div>
            <ChevronRight size={18} />
          </button>
        )}
        <button className="settings-row action-row" type="button" onClick={onRefresh}>
          <RefreshCcw size={20} />
          <div>
            <strong>Actualiser</strong>
            <span>Synchroniser le compte</span>
          </div>
          <ChevronRight size={18} />
        </button>
        <button className="settings-row action-row danger" type="button" onClick={onLogout}>
          <LogOut size={20} />
          <div>
            <strong>Déconnexion</strong>
            <span>Fermer la session</span>
          </div>
        </button>
      </div>
    </div>
  )
}

function SettingsView({
  installable,
  busy,
  themeMode,
  textScale,
  onInstall,
  onRefresh,
  onProfile,
  onPreferences,
  onThemeMode,
  onTextScale,
}: {
  installable: boolean
  busy: boolean
  themeMode: ThemeMode
  textScale: TextScale
  onInstall: () => void
  onRefresh: () => void
  onProfile: () => void
  onPreferences: () => void
  onThemeMode: (mode: ThemeMode) => void
  onTextScale: (scale: TextScale) => void
}) {
  return (
    <div className="screen">
      <section className="settings-title">
        <h1>Réglages</h1>
      </section>
      <SettingsSection title="Compte">
        <div className="settings-list">
          <button className="settings-row action-row" type="button" onClick={onProfile}>
            <UserCircle size={20} />
            <div>
              <strong>Profil</strong>
              <span>Compte et abonnement</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </SettingsSection>
      <SettingsSection title="Écoute">
        <div className="settings-list">
          <button className="settings-row action-row" type="button" onClick={onRefresh} disabled={busy}>
            <RefreshCcw size={20} />
            <div>
              <strong>Actualiser</strong>
              <span>Catalogue et invocations</span>
            </div>
            <ChevronRight size={18} />
          </button>
          {installable && (
            <button className="settings-row action-row" type="button" onClick={onInstall}>
              <Sparkles size={20} />
              <div>
                <strong>Installer l’app</strong>
                <span>Ajouter à l’écran d’accueil</span>
              </div>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </SettingsSection>
      <SettingsSection title="Expérience">
        <div className="settings-list">
          <button className="settings-row action-row" type="button" onClick={onPreferences}>
            <Settings size={20} />
            <div>
              <strong>Préférences d’écoute</strong>
              <span>Adapter NEA KIDZ à votre famille</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
        <AppearanceAccessibilityCard
          themeMode={themeMode}
          textScale={textScale}
          onThemeMode={onThemeMode}
          onTextScale={onTextScale}
        />
      </SettingsSection>
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function AppearanceAccessibilityCard({
  themeMode,
  textScale,
  onThemeMode,
  onTextScale,
}: {
  themeMode: ThemeMode
  textScale: TextScale
  onThemeMode: (mode: ThemeMode) => void
  onTextScale: (scale: TextScale) => void
}) {
  return (
    <section className="appearance-card">
      <SettingsCardTitle icon={<Type size={19} />} title="Accessibilité" />
      <h2>Taille de police</h2>
      <p>Appliquée instantanément et mémorisée sur cet appareil.</p>
      <div className="settings-radio-list">
        <SettingsRadioRow label="Petit" selected={textScale === 0.9} onSelect={() => onTextScale(0.9)} />
        <SettingsRadioRow label="Moyen" selected={textScale === 1} onSelect={() => onTextScale(1)} />
        <SettingsRadioRow label="Grand" selected={textScale === 1.2} onSelect={() => onTextScale(1.2)} />
      </div>
      <div className="settings-divider" />
      <SettingsCardTitle icon={<Palette size={19} />} title="Apparence" />
      <p>Le thème clair est appliqué par défaut. Le thème sombre reste disponible pour une écoute plus feutrée.</p>
      <div className="settings-radio-list">
        <SettingsRadioRow label="Clair" selected={themeMode === 'light'} onSelect={() => onThemeMode('light')} icon={<Sun size={17} />} />
        <SettingsRadioRow label="Sombre" selected={themeMode === 'dark'} onSelect={() => onThemeMode('dark')} icon={<Moon size={17} />} />
        <SettingsRadioRow label="Auto" selected={themeMode === 'system'} onSelect={() => onThemeMode('system')} icon={<Smartphone size={17} />} />
      </div>
    </section>
  )
}

function SettingsCardTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="settings-card-title">
      {icon}
      <strong>{title}</strong>
    </div>
  )
}

function SettingsRadioRow({
  label,
  selected,
  icon,
  onSelect,
}: {
  label: string
  selected: boolean
  icon?: ReactNode
  onSelect: () => void
}) {
  const className = ['settings-radio', selected ? 'selected' : '', icon ? 'has-icon' : ''].filter(Boolean).join(' ')
  return (
    <button className={className} type="button" onClick={onSelect}>
      {icon}
      <span>{label}</span>
      <i aria-hidden="true">{selected && <Check size={14} />}</i>
    </button>
  )
}

function PaywallView({
  episode,
  selectedPlan,
  busy,
  authenticated,
  onSelectPlan,
  onCheckout,
  onBack,
  onAuth,
}: {
  episode: Episode | null
  selectedPlan: Plan
  busy: boolean
  authenticated: boolean
  onSelectPlan: (plan: Plan) => void
  onCheckout: (plan: Plan) => void
  onBack: () => void
  onAuth: () => void
}) {
  const cta = selectedPlan === 'yearly' ? 'Essayer gratuitement 7 jours*' : 'Commencez pour 7,99 €/mois'
  return (
    <div className="screen">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Accueil
      </button>
      <section className="paywall">
        <span className="eyebrow">
          <Crown size={15} />
          NEA KIDZ Premium
        </span>
        <h1>Toutes nos histoires pour toute la famille</h1>
        <p>{episode?.title || '200+ récits à écouter, aimer et transmettre.'}</p>

        <div className="plan-stack">
          <button className={selectedPlan === 'yearly' ? 'plan selected' : 'plan'} type="button" onClick={() => onSelectPlan('yearly')}>
            <span>Annuel</span>
            <strong>49,99 €</strong>
            <em>-48%</em>
            <small>Économisez 46 €/an<br />7 jours offerts*</small>
          </button>
          <button className={selectedPlan === 'monthly' ? 'plan selected' : 'plan'} type="button" onClick={() => onSelectPlan('monthly')}>
            <span>Mensuel</span>
            <strong>7,99 €</strong>
            <small>Sans engagement</small>
          </button>
        </div>

        <button className="primary-action full" type="button" onClick={() => (authenticated ? onCheckout(selectedPlan) : onAuth())} disabled={busy}>
          {busy ? <Loader2 size={18} /> : <CreditCard size={18} />}
          {authenticated ? cta : 'Créer mon compte'}
        </button>
        <div className="paywall-reassurance">
          <ShieldCheck size={18} />
          <span>Aucun paiement aujourd’hui<br />Payez après la période d’essai</span>
        </div>
        <p className="legal-copy">
          {selectedPlan === 'yearly'
            ? '*: 7 jours offerts, puis 49.99€/an.\nPayez après la période d’essai.'
            : '7,99 €/mois, renouvellement automatique.\nAnnulable à tout moment.'}
        </p>
      </section>
    </div>
  )
}

function AuthView({
  mode,
  busy,
  locked,
  onMode,
  onBack,
  onSubmit,
}: {
  mode: AuthMode
  busy: boolean
  locked: boolean
  onMode: (mode: AuthMode) => void
  onBack: () => void
  onSubmit: (mode: AuthMode, values: Record<string, string>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(mode, mode === 'register' ? { name, email, password } : { email, password })
  }

  return (
    <div className="screen">
      {!locked && (
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          Accueil
        </button>
      )}
      <section className="auth-panel">
        <div className="auth-intro">
          <Headphones size={30} />
          <h1>{mode === 'login' ? 'Connectez-vous' : 'Créez votre espace'}</h1>
          <p>Votre compte NEA KIDZ protège l’écoute, les favoris et les préférences de la famille.</p>
        </div>
        <div className="segmented">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => onMode('login')}>
            Connexion
          </button>
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => onMode('register')}>
            Compte
          </button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom de famille" required />}
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" type="password" minLength={8} required />
          <button className="primary-action full" type="submit" disabled={busy}>
            {busy ? <Loader2 size={18} /> : <LogIn size={18} />}
            {mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>
        </form>
      </section>
    </div>
  )
}

type OnboardingOption = {
  value: string
  label: string
  description: string
  icon: ReactNode
}

function OnboardingView({
  user,
  busy,
  onComplete,
  onSkip,
}: {
  user: User | null
  busy: boolean
  onComplete: (values: OnboardingValues) => Promise<void>
  onSkip: () => Promise<void>
}) {
  const knownValue = (value?: string) => (value && value !== 'unknown' ? value : '')
  const [step, setStep] = useState(0)
  const [usageContext, setUsageContext] = useState(() => knownValue(user?.usage_context ?? user?.usageContext))
  const [listenerAgeGroup, setListenerAgeGroup] = useState(() => knownValue(user?.listener_age_group ?? user?.listenerAgeGroup))
  const [listeningMoment, setListeningMoment] = useState(() => knownValue(user?.listening_moment ?? user?.listeningMoment))
  const [notificationGranted, setNotificationGranted] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const [notificationBusy, setNotificationBusy] = useState(false)
  const [notificationHint, setNotificationHint] = useState('')

  const contextOptions: OnboardingOption[] = [
    { value: 'children', label: 'Mes enfants', description: 'Des histoires adaptées à leur âge', icon: <Heart size={20} /> },
    { value: 'family', label: 'En famille', description: 'Pour les trajets, le coucher ou les moments ensemble', icon: <HandHeart size={20} /> },
    { value: 'self', label: 'Moi-même', description: 'Pour apprendre et mieux transmettre', icon: <UserCircle size={20} /> },
    { value: 'mixed', label: 'Un peu de tout', description: 'On variera les recommandations', icon: <Sparkles size={20} /> },
  ]
  const ageOptions: OnboardingOption[] = [
    { value: '3_5', label: '3–5 ans', description: 'Des récits courts, doux et très imagés', icon: <Gift size={20} /> },
    { value: '6_8', label: '6–8 ans', description: 'Des aventures simples à raconter ensuite', icon: <BookOpen size={20} /> },
    { value: '9_12', label: '9–12 ans', description: 'Des histoires plus riches et inspirantes', icon: <BadgeCheck size={20} /> },
    { value: 'teen', label: 'Adolescents', description: 'Des contenus pour réfléchir et transmettre', icon: <ShieldCheck size={20} /> },
    { value: 'multiple', label: 'Plusieurs âges', description: 'Pour une famille avec plusieurs enfants', icon: <Headphones size={20} /> },
  ]
  const momentOptions: OnboardingOption[] = [
    { value: 'bedtime', label: 'Avant de dormir', description: 'Pour un retour au calme', icon: <Clock3 size={20} /> },
    { value: 'car', label: 'En voiture', description: 'Pour transformer les trajets en histoires', icon: <Headphones size={20} /> },
    { value: 'quiet_time', label: 'Temps calme', description: 'Sans écran, à la maison', icon: <Heart size={20} /> },
    { value: 'anytime', label: 'À tout moment', description: 'On vous proposera un mélange équilibré', icon: <Sparkles size={20} /> },
  ]

  const selectedLabel = (options: OnboardingOption[], value: string) => options.find((option) => option.value === value)?.label || 'À affiner plus tard'
  const isFinalStep = step === 5
  const canContinue = step === 0 || step === 4 || isFinalStep || (step === 1 && Boolean(usageContext)) || (step === 2 && Boolean(listenerAgeGroup)) || step === 3
  const progress = `${Math.min(100, ((step + 1) / 6) * 100)}%`
  const ctaLabel = step === 0
    ? 'Créer mon espace d’écoute'
    : step === 4
      ? 'Terminer'
      : isFinalStep
        ? 'Découvrir mes histoires'
        : 'Continuer'
  const microcopy = isFinalStep
    ? 'Chaque histoire est une graine.'
    : step === 1
      ? 'Vous pourrez modifier vos réponses plus tard.'
      : step === 2
        ? 'Choisissez l’âge principal, ou plusieurs âges si besoin.'
        : step === 3
          ? 'Cette étape affine vos recommandations, sans vous enfermer.'
          : step === 4
            ? 'Vous pourrez modifier les rappels depuis votre profil.'
            : ''

  const goNext = () => {
    if (!canContinue || busy) return
    if (step < 5) {
      setStep(step + 1)
      return
    }
    onComplete({
      usageContext,
      listenerAgeGroup,
      listeningMoment: listeningMoment || 'anytime',
    })
  }

  const activateNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setNotificationHint('Les notifications ne sont pas disponibles dans ce navigateur.')
      return
    }
    if (Notification.permission === 'granted') {
      setNotificationGranted(true)
      setNotificationHint('')
      return
    }
    if (Notification.permission === 'denied') {
      setNotificationHint('Autorisez NEA KIDZ dans les réglages du navigateur.')
      return
    }
    setNotificationBusy(true)
    try {
      const permission = await Notification.requestPermission()
      setNotificationGranted(permission === 'granted')
      setNotificationHint(permission === 'granted' ? '' : 'Vous pourrez activer les rappels plus tard depuis votre profil.')
    } finally {
      setNotificationBusy(false)
    }
  }

  return (
    <div className="screen onboarding-screen">
      <div className="onboarding-topbar">
        <button type="button" onClick={() => (step > 0 ? setStep(step - 1) : undefined)} disabled={busy || notificationBusy || step === 0} aria-label="Retour">
          <ArrowLeft size={18} />
        </button>
        <div className="onboarding-progress" aria-hidden="true">
          <i style={{ width: progress }} />
        </div>
        {step > 0 && step < 5 ? (
          <button className="skip-link" type="button" onClick={onSkip} disabled={busy || notificationBusy}>
            Passer
          </button>
        ) : (
          <span className="skip-placeholder" />
        )}
      </div>

      {step === 0 && (
        <section className="onboarding-hero">
          <div className="onboarding-image">
            <img src="/onboarding_premium_listening_hero.png" alt="" />
            <strong>Quand l’écran s’éteint,<br />l’imaginaire se rallume.</strong>
          </div>
          <h1>Bienvenue dans NEA KIDZ</h1>
          <h2>Des récits islamiques à écouter, aimer et transmettre.</h2>
          <p>En quelques secondes, préparons un espace d’écoute adapté à votre famille.</p>
        </section>
      )}

      {step === 1 && (
        <OnboardingChoiceStep
          eyebrow="1/3"
          title="Qui va écouter les histoires ?"
          subtitle="Nous adapterons les recommandations à votre façon d’écouter."
          visualIcon={<HandHeart size={30} />}
          options={contextOptions}
          selected={usageContext}
          onSelect={setUsageContext}
        />
      )}

      {step === 2 && (
        <OnboardingChoiceStep
          eyebrow="2/3"
          title="Quel âge ont vos enfants ?"
          subtitle="Cela nous aide à proposer les récits les plus adaptés."
          visualIcon={<Gift size={30} />}
          options={ageOptions}
          selected={listenerAgeGroup}
          onSelect={setListenerAgeGroup}
        />
      )}

      {step === 3 && (
        <OnboardingChoiceStep
          eyebrow="3/3"
          title="Quand écoutez-vous le plus souvent ?"
          subtitle="NEA KIDZ s’adapte aux moments naturels de votre famille."
          visualIcon={<Headphones size={30} />}
          options={momentOptions}
          selected={listeningMoment}
          onSelect={setListeningMoment}
          optional
        />
      )}

      {step === 4 && (
        <NotificationOnboardingStep
          granted={notificationGranted}
          busy={notificationBusy}
          hint={notificationHint}
          onActivate={activateNotifications}
        />
      )}

      {step === 5 && (
        <section className="onboarding-summary">
          <div className="ready-visual">
            <img src={LOGO_FACE} alt="" />
            <BookOpen size={19} />
            <Headphones size={19} />
          </div>
          <h1>Votre espace est prêt</h1>
          <p>Nous avons préparé des histoires adaptées à votre famille.</p>
          <div className="preference-summary">
            <SummaryRow icon={<HandHeart size={19} />} label="Écoute" value={selectedLabel(contextOptions, usageContext)} />
            <SummaryRow icon={<Gift size={19} />} label="Âge" value={selectedLabel(ageOptions, listenerAgeGroup)} />
            <SummaryRow icon={<Clock3 size={19} />} label="Moment" value={selectedLabel(momentOptions, listeningMoment)} />
            <SummaryRow icon={<Bell size={19} />} label="Rappels" value={notificationGranted ? 'Activées' : 'À activer plus tard'} />
          </div>
        </section>
      )}

      <div className="onboarding-action">
        <button className="primary-action full" type="button" onClick={goNext} disabled={busy || notificationBusy || !canContinue}>
          {busy ? <Loader2 size={18} /> : isFinalStep ? <Headphones size={18} /> : <ChevronRight size={18} />}
          {ctaLabel}
        </button>
        {microcopy && <small>{microcopy}</small>}
      </div>
    </div>
  )
}

function OnboardingChoiceStep({
  eyebrow,
  title,
  subtitle,
  visualIcon,
  options,
  selected,
  optional = false,
  onSelect,
}: {
  eyebrow: string
  title: string
  subtitle: string
  visualIcon: ReactNode
  options: OnboardingOption[]
  selected: string
  optional?: boolean
  onSelect: (value: string) => void
}) {
  return (
    <section className="onboarding-panel">
      <div className="compact-listening-visual">
        <span>{visualIcon}</span>
        <strong>Un espace d’écoute qui s’adapte à votre foyer.</strong>
      </div>
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="onboarding-options">
        {options.map((option) => (
          <button className={selected === option.value ? 'selected' : ''} type="button" key={option.value} onClick={() => onSelect(option.value)}>
            <i>{option.icon}</i>
            <strong>{option.label}</strong>
            <small>{option.description}</small>
            {selected === option.value && <Check size={18} />}
          </button>
        ))}
      </div>
      {optional && <em>Optionnel : si vous ne choisissez rien, NEA KIDZ variera les moments.</em>}
    </section>
  )
}

function NotificationOnboardingStep({
  granted,
  busy,
  hint,
  onActivate,
}: {
  granted: boolean
  busy: boolean
  hint: string
  onActivate: () => void
}) {
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default'
  return (
    <section className="onboarding-panel notification-step">
      <div className={granted ? 'bell-visual active' : 'bell-visual'}>
        <Bell size={46} />
      </div>
      <span>4/4</span>
      <h1>Souhaitez-vous recevoir les rappels NEA KIDZ ?</h1>
      <p>Nous vous préviendrons pour les nouvelles histoires et les moments d’écoute choisis.</p>
      <button className={granted ? 'notification-card granted' : 'notification-card'} type="button" onClick={onActivate} disabled={busy || granted}>
        <i>{busy ? <Loader2 size={22} /> : granted ? <Check size={27} /> : <Bell size={27} />}</i>
        <span>
          <strong>{granted ? 'Notifications activées' : permission === 'denied' ? 'Ouvrir les réglages du navigateur' : 'Activer les notifications'}</strong>
          <small>
            {granted
              ? 'Votre téléphone recevra les rappels NEA KIDZ.'
              : permission === 'denied'
                ? 'Autorisez NEA KIDZ dans les réglages du navigateur.'
                : 'Une demande du navigateur va s’ouvrir sur cet appareil.'}
          </small>
        </span>
        {granted ? <CheckCircle2 size={26} /> : <ChevronRight size={26} />}
      </button>
      {hint && <em>{hint}</em>}
    </section>
  )
}

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="summary-row">
      <i>{icon}</i>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function SuccessView({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="screen">
      <section className="success-panel">
        <CheckCircle2 size={44} />
        <h1>Premium activé</h1>
        <p>Votre compte NEA KIDZ est synchronisé avec Stripe.</p>
        <button className="primary-action full" type="button" onClick={onContinue}>
          <Headphones size={18} />
          J’écoute
        </button>
      </section>
    </div>
  )
}

function EpisodeRow({
  episode,
  premium,
  onOpen,
  onPlay,
}: {
  episode: Episode
  premium: boolean
  onOpen: () => void
  onPlay: () => void
}) {
  const locked = !episode.isFree && !premium
  return (
    <article className="episode-row">
      <button className="row-cover" type="button" onClick={onOpen}>
        <img src={mediaUrl(episode.coverUrl || episode.heroImageUrl)} alt="" />
        {locked && <Lock size={14} />}
      </button>
      <button className="row-copy" type="button" onClick={onOpen}>
        <strong>{episode.title}</strong>
        <span>{episode.collectionName || durationLabel(episode.duration)}</span>
      </button>
      <button className="icon-button warm" type="button" onClick={onPlay} aria-label={`Écouter ${episode.title}`}>
        <Play size={18} />
      </button>
    </article>
  )
}

function SectionHeader({ title, label }: { title: string; label?: string }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {label && <span>{label}</span>}
    </div>
  )
}

function BottomNav({ active, onView }: { active: MainTab; onView: (view: MainTab) => void }) {
  const items: Array<{ view: MainTab; label: string; icon: ReactNode }> = [
    { view: 'home', label: 'Histoires', icon: <BookOpen size={20} /> },
    { view: 'duas', label: 'Invocations', icon: <HandHeart size={20} /> },
    { view: 'search', label: 'Recherche', icon: <Search size={20} /> },
  ]
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {items.map((item) => (
        <button className={active === item.view ? 'active' : ''} type="button" key={item.view} onClick={() => onView(item.view)}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function MiniPlayerTop({
  player,
  onToggle,
  onPrevious,
  onNext,
  onClose,
}: {
  player: PlayerState
  onToggle: () => void
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}) {
  const percent = player.duration ? Math.min(100, (player.progress / player.duration) * 100) : 0
  return (
    <aside className="mini-player-top">
      <div className="mini-progress">
        <i style={{ width: `${percent}%` }} />
      </div>
      <button className="mini-round" type="button" onClick={onToggle} aria-label={player.playing ? 'Pause' : 'Lecture'}>
        {player.playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <img src={mediaUrl(player.episode.coverUrl || player.episode.heroImageUrl)} alt="" />
      <button className="mini-icon" type="button" onClick={onPrevious} aria-label="Précédent">
        <SkipBack size={16} />
      </button>
      <div className="mini-copy">
        <strong>{player.episode.title}</strong>
        <span>{player.collection?.name || player.episode.collectionName || durationLabel(player.duration)}</span>
      </div>
      <button className="mini-icon" type="button" onClick={onNext} aria-label="Suivant">
        <SkipForward size={16} />
      </button>
      <button className="mini-icon" type="button" onClick={onClose} aria-label="Fermer">
        <X size={16} />
      </button>
    </aside>
  )
}

function LoadingState() {
  return (
    <div className="screen">
      <div className="loading-state">
        <Loader2 size={28} />
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="screen">
      <EmptyState icon={<WifiOff size={30} />} title="Connexion fragile" text={message} />
      <button className="primary-action full" type="button" onClick={onRetry}>
        <RefreshCcw size={18} />
        Réessayer
      </button>
    </div>
  )
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <section className="empty-state">
      {icon}
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  )
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3600)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <button className="toast" type="button" onClick={onClose}>
      {message}
    </button>
  )
}

export default App
