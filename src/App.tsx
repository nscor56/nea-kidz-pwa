import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Gift,
  HandHeart,
  Headphones,
  Heart,
  Info,
  KeyRound,
  ListMusic,
  Mail,
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
  RotateCcw,
  RotateCw,
  Search,
  Settings,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Timer,
  Type,
  UserCircle,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react'
import { type CSSProperties, type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const PUBLIC_API_BASE = 'https://api.neakidz.com'
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : PUBLIC_API_BASE)
const SESSION_KEY = 'neakidz.pwa2.session'
const FIRST_PLAY_KEY = 'neakidz.pwa2.firstPlayTracked'
const KNOWN_DUAS_KEY = 'neakidz.pwa2.duas.known'
const THEME_MODE_KEY = 'neakidz.pwa2.themeMode'
const TEXT_SCALE_KEY = 'neakidz.pwa2.textScale'
const LOGO_FACE = '/nea_kidz_face_light_gold_transparent.png'
const LOGIN_LOGO = '/nea_kidz_login_logo_gold_dark_trimmed.png'
const REMEMBERED_EMAIL_KEY = 'neakidz.pwa2.rememberedEmail'
const NOTIFICATION_PREFS_KEY = 'neakidz.pwa2.notificationPrefs'
const APP_VERSION_LABEL = 'pwa2-android-shell-0.4.1'
const AUDIO_UNLOCK_SRC =
  'data:audio/wav;base64,UklGRiQFAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
const PAYWALL_PREVIEW_ROWS = [
  [
    ['Adam', '/paywall_catalog/adam.webp'],
    ['Suleyman', '/paywall_catalog/suleyman.webp'],
    ['Maryam', '/paywall_catalog/maryam.webp'],
    ['Abu Bakr', '/paywall_catalog/abu_bakr.webp'],
    ['Douas', '/paywall_catalog/douas.webp'],
    ['Moussa', '/paywall_catalog/moussa.webp'],
    ['Muhammad', '/paywall_catalog/muhammad_enfance.webp'],
    ['Khadija', '/paywall_catalog/khadija.webp'],
    ['Youssouf', '/paywall_catalog/youssouf.webp'],
    ['Bilal', '/paywall_catalog/bilal.webp'],
    ['Hajar', '/paywall_catalog/hajar.webp'],
  ],
  [
    ['Ibrahim', '/paywall_catalog/ibrahim.webp'],
    ['Muhammad', '/paywall_catalog/muhammad_enfance.webp'],
    ['Khadija', '/paywall_catalog/khadija.webp'],
    ['Youssouf', '/paywall_catalog/youssouf.webp'],
    ['Omar', '/paywall_catalog/omar.webp'],
    ['Suleyman', '/paywall_catalog/suleyman.webp'],
    ['Maryam', '/paywall_catalog/maryam.webp'],
    ['Abu Bakr', '/paywall_catalog/abu_bakr.webp'],
    ['Douas', '/paywall_catalog/douas.webp'],
    ['Les anges', '/paywall_catalog/anges.webp'],
  ],
] as const

type View =
  | 'home'
  | 'duas'
  | 'search'
  | 'collection'
  | 'episode'
  | 'player'
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
type SettingsPanel = 'main' | 'display' | 'notifications'
type OnboardingValues = {
  usageContext: string
  listenerAgeGroup: string
  listeningMoment: string
}

type NotificationPrefs = {
  enabled: boolean
  newStoriesEnabled: boolean
  bedtimeEnabled: boolean
  bedtimeTime: string
}

type NotificationPrefsResponse = {
  preferences?: {
    enabled?: boolean
    master_enabled?: boolean
    new_stories_enabled?: boolean
    new_episodes_enabled?: boolean
    bedtime_enabled?: boolean
    reminders_enabled?: boolean
    bedtime_time?: string
    evening_reminder_time?: string
    permission_status?: string
  }
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
  premium_status?: string | null
  expiresAt?: number | string | null
  expires_at?: number | string | null
  premium_until?: number | string | null
  premiumUntil?: number | string | null
  subscriptionStatus?: string
  subscription_status?: string
  subscription?: {
    status?: string | null
    plan?: string | null
    provider?: string | null
    expires_at?: number | string | null
    expiresAt?: number | string | null
    will_renew?: boolean | number | string | null
    willRenew?: boolean | number | string | null
    auto_renewing?: boolean | number | string | null
    autoRenewing?: boolean | number | string | null
  } | null
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

type RawEpisode = Partial<Episode> & {
  slug?: string
  duration_seconds?: number | string
  size_mb?: number | string
  is_free?: boolean | number | string
  coverPath?: string | null
  cover_path?: string | null
  cover_url?: string | null
  hero_image_url?: string | null
  collection_id?: string
  collection_slug?: string
  collection_name?: string
  season_name?: string
}

type HomeStory = {
  episodeId?: string
  episode_id?: string
  collectionId?: string
  collection_id?: string
  title?: string
  subtitle?: string
  durationSeconds?: number | string
  duration_seconds?: number | string
  progressSeconds?: number | string
  progress_seconds?: number | string
  isFree?: boolean | number | string
  is_free?: boolean | number | string
  isLocked?: boolean | number | string
  is_locked?: boolean | number | string
  coverUrl?: string | null
  cover_url?: string | null
  heroImageUrl?: string | null
  hero_image_url?: string | null
  streamUrlEndpoint?: string
  stream_url_endpoint?: string
  episode?: RawEpisode
}

type HomeCollection = {
  collectionId?: string
  collection_id?: string
  title?: string
  subtitle?: string
  storyCount?: number | string
  story_count?: number | string
  coverUrl?: string | null
  cover_url?: string | null
  isPremiumOnly?: boolean | number | string
  is_premium_only?: boolean | number | string
}

type HomeTonight = {
  title?: string
  message?: string
  stories?: HomeStory[]
}

type HomeContent = {
  continueListening?: HomeStory
  collections?: HomeCollection[]
  newStories?: HomeStory[]
  topStories?: HomeStory[]
  topCollections?: HomeCollection[]
  tonight?: HomeTonight
  seasons?: Season[]
}

type HomeResponse = HomeContent & {
  home?: HomeContent
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

type FavoriteItem = {
  episodeId: string
  title: string
  collectionId?: string
  collectionName?: string
  addedAt?: string
}

type PlaylistItem = {
  id: string
  title: string
  description?: string
  episodes?: Episode[]
}

type PlaylistsResponse = {
  playlists?: PlaylistItem[]
}

type HistoryItem = {
  episodeId: string
  title: string
  collectionId: string
  collectionName: string
  progress: number
  duration: number
  completed: boolean
  updatedAt?: string
}

type ProfileStats = {
  listenedCount: number
  totalStories: number
  progressPercent: number
  completedCollections: number
  activeCollections: number
  hasListening: boolean
  collectionProgress: Array<{
    id: string
    name: string
    listened: number
    total: number
    percent: number
  }>
}

type PlayerState = {
  episode: Episode
  collection?: Collection
  src: string
  playing: boolean
  progress: number
  duration: number
}

type EpisodeStream = {
  src: string
  duration: number
}

type PlayEpisodeOptions = {
  toggleCurrent?: boolean
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
  if (url.startsWith('data:')) return url
  if (url.startsWith('http')) return url
  if (API_BASE === '/api') return `/api${url.startsWith('/') ? url : `/${url}`}`
  return `${PUBLIC_API_BASE}${url.startsWith('/') ? url : `/${url}`}`
}

async function primeAudioForGesture(audio: HTMLAudioElement) {
  if (!audio.paused || audio.currentSrc || audio.getAttribute('src')) return
  audio.muted = true
  audio.loop = true
  audio.src = AUDIO_UNLOCK_SRC
  try {
    await audio.play()
  } catch {
    // Some browsers still refuse the unlock; the visible play button remains usable.
  }
}

function stopAudioPrime(audio: HTMLAudioElement) {
  const isPrimeSource = audio.currentSrc === AUDIO_UNLOCK_SRC || audio.getAttribute('src') === AUDIO_UNLOCK_SRC
  if (isPrimeSource) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
  audio.muted = false
  audio.loop = false
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

function loadNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return {
      enabled: Boolean(parsed?.enabled),
      newStoriesEnabled: Boolean(parsed?.newStoriesEnabled),
      bedtimeEnabled: Boolean(parsed?.bedtimeEnabled),
      bedtimeTime: typeof parsed?.bedtimeTime === 'string' ? parsed.bedtimeTime : '20:30',
    }
  } catch {
    return { enabled: false, newStoriesEnabled: false, bedtimeEnabled: false, bedtimeTime: '20:30' }
  }
}

function notificationPrefsFromApi(payload: NotificationPrefsResponse): NotificationPrefs {
  const prefs = payload.preferences || {}
  return {
    enabled: Boolean(prefs.enabled ?? prefs.master_enabled),
    newStoriesEnabled: Boolean(prefs.new_stories_enabled ?? prefs.new_episodes_enabled),
    bedtimeEnabled: Boolean(prefs.bedtime_enabled ?? prefs.reminders_enabled),
    bedtimeTime: typeof prefs.bedtime_time === 'string'
      ? prefs.bedtime_time.slice(0, 5)
      : typeof prefs.evening_reminder_time === 'string'
        ? prefs.evening_reminder_time.slice(0, 5)
        : '20:30',
  }
}

function notificationPrefsToApi(prefs: NotificationPrefs) {
  return {
    enabled: prefs.enabled,
    master_enabled: prefs.enabled,
    new_stories_enabled: prefs.newStoriesEnabled,
    bedtime_enabled: prefs.bedtimeEnabled,
    bedtime_time: prefs.bedtimeTime,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
    locale: navigator.language || 'fr-FR',
    permission_status: 'Notification' in window ? Notification.permission : 'unsupported',
  }
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

type TitleStyle = CSSProperties & { '--story-title-size'?: string; '--top-story-title-size'?: string }

function featureStoryTitleStyle(title: string): TitleStyle {
  const length = title.trim().length
  const size = length > 34 ? 13.2 : length > 24 ? 15.6 : 17
  return { '--story-title-size': `${size}px` }
}

function topStoryTitleStyle(title: string): TitleStyle {
  const length = title.trim().length
  const size = length > 28 ? 14.5 : length > 20 ? 15.5 : 17
  return { '--top-story-title-size': `${size}px` }
}

function planLabel(plan?: string | null) {
  const normalized = String(plan || '').trim().toLowerCase()
  if (normalized.includes('year') || normalized.includes('annual') || normalized.includes('annuel')) return 'Annuel'
  if (normalized.includes('month') || normalized.includes('mens')) return 'Mensuel'
  return 'Premium'
}

function parseNullableBool(value: unknown) {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const normalized = String(value).trim().toLowerCase()
  if (!normalized) return null
  if (['true', '1', 'yes', 'oui', 'active', 'enabled', 'paid', 'premium'].includes(normalized)) return true
  if (['false', '0', 'no', 'non', 'cancelled', 'canceled', 'disabled', 'free', 'expired'].includes(normalized)) return false
  return null
}

function textValue(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text || fallback
}

function numberValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function boolValue(value: unknown, fallback = false) {
  return parseNullableBool(value) ?? fallback
}

function unwrapHomeContent(payload: HomeResponse): HomeContent {
  return payload.home || payload
}

function catalogFromHomeContent(homeContent: HomeContent): Catalog | null {
  const seasons = homeContent.seasons || []
  if (seasons.length === 0) return null
  return {
    totalSeasons: seasons.length,
    totalEpisodes: seasons.reduce(
      (count, season) => count + season.collections.reduce((seasonCount, collection) => seasonCount + collection.episodes.length, 0),
      0,
    ),
    seasons,
  }
}

function homeStoryEpisodeId(story: HomeStory) {
  return textValue(story.episodeId ?? story.episode_id ?? story.episode?.id ?? story.episode?.slug)
}

function homeStoryCollectionId(story: HomeStory) {
  return textValue(story.collectionId ?? story.collection_id ?? story.episode?.collectionId ?? story.episode?.collection_id ?? story.episode?.collection_slug)
}

function homeCollectionId(collection: HomeCollection) {
  return textValue(collection.collectionId ?? collection.collection_id)
}

function isFreeStoriesCollection(collection: Collection) {
  return collection.id === 'histoires_gratuites' || collection.seasonId === 'gratuit'
}

function findCollectionById(collectionId: string, collections: Collection[]) {
  if (!collectionId) return undefined
  return collections.find((collection) => collection.id === collectionId)
}

function findCollectionForHomeStory(story: HomeStory, collections: Collection[]) {
  const collectionId = homeStoryCollectionId(story)
  const direct = findCollectionById(collectionId, collections)
  if (direct) return direct

  const episodeId = homeStoryEpisodeId(story)
  if (!episodeId) return undefined
  return collections.find((collection) => collection.episodes.some((episode) => episode.id === episodeId))
}

function findEpisodeById(episodeId: string, collections: Collection[]) {
  if (!episodeId) return undefined
  for (const collection of collections) {
    const episode = collection.episodes.find((item) => item.id === episodeId)
    if (episode) {
      return {
        episode,
        collection,
      }
    }
  }
  return undefined
}

function normalizeHomeEpisode(
  raw: RawEpisode | undefined,
  fallback: Partial<Episode> & { episodeId?: string; durationSeconds?: number | string } = {},
): Episode | null {
  const id = textValue(raw?.id ?? raw?.slug ?? fallback.id ?? fallback.episodeId)
  const title = textValue(raw?.title ?? fallback.title)
  if (!id || !title) return null

  const collectionId = textValue(raw?.collectionId ?? raw?.collection_id ?? raw?.collection_slug ?? fallback.collectionId)
  const coverUrl = textValue(raw?.coverUrl ?? raw?.cover_url ?? raw?.coverPath ?? raw?.cover_path ?? fallback.coverUrl)
  const heroImageUrl = textValue(raw?.heroImageUrl ?? raw?.hero_image_url ?? fallback.heroImageUrl ?? coverUrl)

  return {
    id,
    title,
    number: numberValue(raw?.number ?? fallback.number, 0),
    duration: numberValue(raw?.duration ?? raw?.duration_seconds ?? fallback.duration ?? fallback.durationSeconds, 0),
    sizeMb: numberValue(raw?.sizeMb ?? raw?.size_mb ?? fallback.sizeMb, 0),
    isFree: boolValue(raw?.isFree ?? raw?.is_free ?? fallback.isFree, false),
    coverUrl,
    heroImageUrl,
    collectionId,
    collectionName: textValue(raw?.collectionName ?? raw?.collection_name ?? fallback.collectionName),
    seasonName: textValue(raw?.seasonName ?? raw?.season_name ?? fallback.seasonName),
  }
}

function episodeFromHomeStory(story: HomeStory, collections: Collection[]) {
  const episodeId = homeStoryEpisodeId(story)
  const collectionId = homeStoryCollectionId(story)
  const existing = findEpisodeById(episodeId, collections)
  const collection = existing?.collection || findCollectionById(collectionId, collections)
  const base = existing?.episode
  const coverUrl = textValue(story.coverUrl ?? story.cover_url ?? base?.coverUrl ?? collection?.coverUrl)
  const heroImageUrl = textValue(story.heroImageUrl ?? story.hero_image_url ?? base?.heroImageUrl ?? coverUrl)
  const fallback = {
    ...base,
    episodeId,
    id: episodeId || base?.id,
    title: textValue(story.title ?? base?.title),
    duration: numberValue(story.durationSeconds ?? story.duration_seconds ?? base?.duration, base?.duration || 0),
    isFree: boolValue(story.isFree ?? story.is_free ?? base?.isFree, base?.isFree || false),
    coverUrl,
    heroImageUrl,
    collectionId: collection?.id || collectionId || base?.collectionId,
    collectionName: collection?.name || base?.collectionName || story.subtitle,
    seasonName: collection?.seasonName || base?.seasonName,
  }
  return normalizeHomeEpisode(story.episode, fallback)
}

function collectionStoryEpisode(collection: Collection, rankedCollection?: HomeCollection) {
  const firstEpisode = collection.episodes[0]
  if (!firstEpisode) return null
  const coverUrl = textValue(rankedCollection?.coverUrl ?? rankedCollection?.cover_url ?? firstEpisode.coverUrl ?? collection.coverUrl)
  return {
    ...firstEpisode,
    title: textValue(rankedCollection?.title, collection.name),
    duration: firstEpisode.duration,
    isFree: firstEpisode.isFree,
    coverUrl,
    heroImageUrl: textValue(firstEpisode.heroImageUrl ?? coverUrl),
    collectionId: collection.id,
    collectionName: collection.name,
    seasonName: collection.seasonName,
  }
}

function topCollectionEpisodesFromHome(homeContent: HomeContent | null, collections: Collection[]) {
  const selected: Episode[] = []
  const selectedCollections = new Set<string>()

  const addCollection = (collection: Collection | undefined, rankedCollection?: HomeCollection) => {
    if (!collection || isFreeStoriesCollection(collection) || selectedCollections.has(collection.id)) return
    const episode = collectionStoryEpisode(collection, rankedCollection)
    if (!episode) return
    selected.push(episode)
    selectedCollections.add(collection.id)
  }

  for (const rankedCollection of homeContent?.topCollections || []) {
    addCollection(findCollectionById(homeCollectionId(rankedCollection), collections), rankedCollection)
  }

  for (const story of homeContent?.topStories || []) {
    addCollection(findCollectionForHomeStory(story, collections))
  }

  for (const collection of collections) {
    addCollection(collection)
    if (selected.length >= 7) break
  }

  return selected.slice(0, 7)
}

function continueEpisodeFromHome(homeContent: HomeContent | null, collections: Collection[]) {
  return homeContent?.continueListening ? episodeFromHomeStory(homeContent.continueListening, collections) : null
}

function parseEntitlementDate(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000
    return Number.isFinite(milliseconds) ? milliseconds : null
  }
  const text = String(value).trim()
  const numeric = Number(text)
  if (Number.isFinite(numeric)) {
    const milliseconds = numeric > 10_000_000_000 ? numeric : numeric * 1000
    return milliseconds
  }
  const parsed = Date.parse(text)
  return Number.isNaN(parsed) ? null : parsed
}

function isPremiumUser(user: User | null) {
  if (!user) return false
  const status = String(user.status || '').trim().toLowerCase()
  const premiumStatus = String(user.premium_status || '').trim().toLowerCase()
  const subscriptionStatus = String(user.subscriptionStatus || user.subscription_status || user.subscription?.status || '').trim().toLowerCase()
  const premiumFlag = parseNullableBool(user.is_premium) === true || parseNullableBool(user.isPremium) === true
  const hasPremiumSignal =
    premiumFlag ||
    status === 'paid' ||
    status === 'premium' ||
    premiumStatus === 'paid' ||
    premiumStatus === 'premium' ||
    ['active', 'trialing', 'past_due'].includes(subscriptionStatus)

  if (!hasPremiumSignal) return false

  const rawDate =
    user.expiresAt ??
    user.expires_at ??
    user.premium_until ??
    user.premiumUntil ??
    user.subscription?.expiresAt ??
    user.subscription?.expires_at
  const expiresMs = parseEntitlementDate(rawDate)
  return expiresMs === null || expiresMs > Date.now()
}

function profilePlanLabel(user: User | null, premium: boolean) {
  if (!premium) return 'Compte gratuit'
  const plan = user?.plan || user?.subscription?.plan || null
  return `Abonné premium ${planLabel(plan).toLowerCase()}`
}

function profileValidityLabel(user: User | null, premium: boolean) {
  if (!premium) return 'Débloquez toutes les histoires NEA KIDZ.'
  const expiry = parseEntitlementDate(user?.premium_until ?? user?.premiumUntil ?? user?.expires_at ?? user?.expiresAt ?? user?.subscription?.expiresAt ?? user?.subscription?.expires_at)
  if (!expiry) return 'Abonnement premium actif'
  const date = new Intl.DateTimeFormat('fr-FR').format(new Date(expiry))
  if (expiry < Date.now()) return `Abonnement expiré le ${date}`
  return `Votre abonnement expire le ${date}`
}

function buildProfileStats(history: HistoryItem[], collections: Collection[]): ProfileStats {
  const listenedIds = new Set(history.map((item) => item.episodeId).filter(Boolean))
  const totalStories = collections.reduce((count, collection) => count + collection.episodes.length, 0)
  const collectionProgress = collections
    .map((collection) => {
      const total = collection.episodes.length
      const listened = collection.episodes.filter((episode) => listenedIds.has(episode.id)).length
      return {
        id: collection.id,
        name: collection.name,
        listened,
        total,
        percent: total > 0 ? Math.round((listened / total) * 100) : 0,
      }
    })
    .filter((item) => item.listened > 0)
    .sort((a, b) => b.listened - a.listened || b.percent - a.percent || a.name.localeCompare(b.name, 'fr'))

  const completedCollections = collectionProgress.filter((item) => item.total > 0 && item.listened >= item.total).length
  const activeCollections = collectionProgress.filter((item) => item.listened > 0 && item.listened < item.total).length

  return {
    listenedCount: listenedIds.size,
    totalStories,
    progressPercent: totalStories > 0 ? Math.round((listenedIds.size / totalStories) * 100) : 0,
    completedCollections,
    activeCollections,
    hasListening: listenedIds.size > 0,
    collectionProgress,
  }
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

function activeTabFor(view: View): MainTab {
  if (view === 'duas') return 'duas'
  if (view === 'search') return 'search'
  return 'home'
}

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const duaAudioRef = useRef<HTMLAudioElement | null>(null)
  const streamCacheRef = useRef<Map<string, EpisodeStream>>(new Map())
  const streamRequestRef = useRef<Map<string, Promise<EpisodeStream>>>(new Map())
  const lastHistorySaveRef = useRef(0)
  const listened60Ref = useRef(false)
  const onboardingStartedRef = useRef(false)
  const [session, setSession] = useState<Session | null>(() => loadStoredSession())
  const [user, setUser] = useState<User | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null)
  const [profileHistory, setProfileHistory] = useState<HistoryItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [loadingProfileHistory, setLoadingProfileHistory] = useState(false)
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
  const [playerTargetEpisodeId, setPlayerTargetEpisodeId] = useState<string | null>(null)
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
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('main')
  const [notificationPrefs, setNotificationPrefsState] = useState<NotificationPrefs>(() => loadNotificationPrefs())

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

  const setNotificationPrefs = useCallback((prefs: NotificationPrefs) => {
    setNotificationPrefsState(prefs)
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs))
  }, [])

  const logout = useCallback(() => {
    const token = session?.token
    const refreshToken = session?.refreshToken
    if (token) {
      fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined)
    }
    saveSession(null)
    setUser(null)
    setCatalog(null)
    setHomeContent(null)
    setProfileHistory([])
    setFavorites([])
    setPlaylists([])
    setPlayer(null)
    setPlayerTargetEpisodeId(null)
    streamCacheRef.current.clear()
    streamRequestRef.current.clear()
    setDuaAudio(null)
    onboardingStartedRef.current = false
    audioRef.current?.pause()
    duaAudioRef.current?.pause()
    setSettingsPanel('main')
    setView('auth')
    setToast('Session fermée.')
  }, [saveSession, session?.refreshToken, session?.token])

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
      let payload: { message?: string; code?: string } | null
      try {
        payload = text ? JSON.parse(text) : null
      } catch {
        payload = text ? { message: text } : null
      }
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
                isPwa: window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches,
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                locale: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                appVersion: APP_VERSION_LABEL,
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
      try {
        const homePayload = await apiFetch<HomeResponse>('/user/home')
        const nextHomeContent = unwrapHomeContent(homePayload)
        setHomeContent(nextHomeContent)
        const homeCatalog = catalogFromHomeContent(nextHomeContent)
        if (homeCatalog) {
          setCatalog(hydrateCatalog(homeCatalog))
          return
        }
      } catch {
        setHomeContent(null)
      }

      try {
        const data = await apiFetch<Catalog>('/catalog/seasons')
        setCatalog(hydrateCatalog(data))
      } catch {
        setCatalogError('Catalogue indisponible. Réessayez dans un instant.')
      }
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

  const loadProfileHistory = useCallback(async () => {
    if (!session?.token) return
    setLoadingProfileHistory(true)
    try {
      const data = await apiFetch<HistoryItem[]>('/user/history?limit=200')
      setProfileHistory(data)
    } catch {
      setProfileHistory([])
    } finally {
      setLoadingProfileHistory(false)
    }
  }, [apiFetch, session?.token])

  const loadUserLibrary = useCallback(async () => {
    if (!session?.token) return
    try {
      const [favoriteItems, playlistPayload] = await Promise.all([
        apiFetch<FavoriteItem[]>('/user/favorites'),
        apiFetch<PlaylistsResponse>('/user/playlists'),
      ])
      setFavorites(Array.isArray(favoriteItems) ? favoriteItems : [])
      setPlaylists(Array.isArray(playlistPayload.playlists) ? playlistPayload.playlists : [])
    } catch {
      setFavorites([])
      setPlaylists([])
    }
  }, [apiFetch, session?.token])

  const loadRemoteNotificationPrefs = useCallback(async () => {
    if (!session?.token) return
    try {
      const payload = await apiFetch<NotificationPrefsResponse>('/me/notification-preferences')
      setNotificationPrefs(notificationPrefsFromApi(payload))
    } catch {
      // Cached preferences keep the settings screen usable offline.
    }
  }, [apiFetch, session?.token, setNotificationPrefs])

  const loadEpisodeStream = useCallback(
    async (episode: Episode): Promise<EpisodeStream> => {
      const cached = streamCacheRef.current.get(episode.id)
      if (cached) return cached

      const pending = streamRequestRef.current.get(episode.id)
      if (pending) return pending

      const request = apiFetch<{ url: string; duration?: number }>(`/stream/${episode.id}`)
        .then((stream) => {
          const next = {
            src: mediaUrl(stream.url),
            duration: stream.duration || episode.duration || 0,
          }
          streamCacheRef.current.set(episode.id, next)
          return next
        })
        .finally(() => {
          streamRequestRef.current.delete(episode.id)
        })

      streamRequestRef.current.set(episode.id, request)
      return request
    },
    [apiFetch],
  )

  useEffect(() => {
    if (!session?.token) {
      setHomeContent(null)
      setProfileHistory([])
      setFavorites([])
      setPlaylists([])
      setLoadingCatalog(false)
      setLoadingDuas(false)
      setLoadingProfileHistory(false)
      setCheckingAccount(false)
      return
    }
    loadCatalog()
    loadDuas()
    loadProfileHistory()
    loadUserLibrary()
    loadRemoteNotificationPrefs()
  }, [loadCatalog, loadDuas, loadProfileHistory, loadRemoteNotificationPrefs, loadUserLibrary, session?.token])

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
  const freeCollection = allCollections.find((collection) => collection.id === 'histoires_gratuites')
  const homeContinueEpisode = useMemo(() => continueEpisodeFromHome(homeContent, allCollections), [allCollections, homeContent])
  const featuredEpisode =
    player?.episode ||
    (premium ? homeContinueEpisode : homeContinueEpisode?.isFree ? homeContinueEpisode : freeCollection?.episodes[0]) ||
    allEpisodes.find((episode) => episode.isFree) ||
    allEpisodes[0]
  const profileStats = useMemo(() => buildProfileStats(profileHistory, allCollections), [allCollections, profileHistory])
  const fullPlayerEpisode = useMemo(
    () => player?.episode || allEpisodes.find((episode) => episode.id === playerTargetEpisodeId) || selectedEpisode || featuredEpisode || null,
    [allEpisodes, featuredEpisode, player?.episode, playerTargetEpisodeId, selectedEpisode],
  )
  const fullPlayerCollection = useMemo(() => {
    const collectionId = fullPlayerEpisode?.collectionId || player?.collection?.id || selectedCollectionId
    return player?.collection || allCollections.find((collection) => collection.id === collectionId) || selectedCollection
  }, [allCollections, fullPlayerEpisode?.collectionId, player?.collection, selectedCollection, selectedCollectionId])
  const lockedAuthView = view === 'auth' && !session?.token
  const standaloneView = view === 'auth' || view === 'onboarding' || view === 'paywall' || view === 'success' || view === 'player'
  const showBottomNav = Boolean(session?.token && !accountPending && !onboardingRequired && ['home', 'duas', 'search', 'collection', 'episode'].includes(view))
  const showTopMiniPlayer = Boolean(player && view !== 'home' && view !== 'player' && !standaloneView)

  useEffect(() => {
    if (!session?.token || accountPending || onboardingRequired) return
    const seen = new Set<string>()
    const candidates: Episode[] = []
    const add = (episode?: Episode | null) => {
      if (!episode || seen.has(episode.id)) return
      if (!premium && !episode.isFree) return
      seen.add(episode.id)
      candidates.push(episode)
    }

    add(featuredEpisode)
    freeCollection?.episodes.forEach(add)
    topCollectionEpisodesFromHome(homeContent, allCollections).forEach(add)
    if (view === 'collection') selectedCollection?.episodes.forEach(add)
    if (view === 'episode' || view === 'player') add(fullPlayerEpisode || selectedEpisode)

    candidates.slice(0, 12).forEach((episode) => {
      void loadEpisodeStream(episode).catch(() => undefined)
    })
  }, [
    accountPending,
    allCollections,
    featuredEpisode,
    freeCollection,
    fullPlayerEpisode,
    homeContent,
    loadEpisodeStream,
    onboardingRequired,
    premium,
    selectedCollection,
    selectedEpisode,
    session?.token,
    view,
  ])

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

  const openFullPlayer = async (episode: Episode, collection?: Collection) => {
    if (!episode.isFree && !premium) {
      await promptPaywall(episode)
      return
    }
    if (episode.collectionId) setSelectedCollectionId(episode.collectionId)
    setSelectedEpisodeId(episode.id)
    setPlayerTargetEpisodeId(episode.id)
    setView('player')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (player?.episode.id === episode.id) return
    void playEpisode(episode, collection, { toggleCurrent: false })
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

  const playEpisode = async (episode: Episode, collection?: Collection, options: PlayEpisodeOptions = {}) => {
    const toggleCurrent = options.toggleCurrent !== false
    if (!episode.isFree && !premium) {
      await promptPaywall(episode)
      return
    }

    const audio = audioRef.current
    const hasLoadedCurrentEpisode =
      player?.episode.id === episode.id &&
      audio?.currentSrc &&
      audio.currentSrc !== AUDIO_UNLOCK_SRC

    if (hasLoadedCurrentEpisode) {
      setPlayerTargetEpisodeId(episode.id)
      if (!toggleCurrent) return
      if (audio.paused) {
        audio
          .play()
          .then(() => setPlayer((current) => (current?.episode.id === episode.id ? { ...current, playing: true } : current)))
          .catch(() => setToast('Touchez à nouveau le bouton lecture.'))
      } else {
        audio.pause()
        setPlayer((current) => (current?.episode.id === episode.id ? { ...current, playing: false } : current))
      }
      return
    }

    duaAudioRef.current?.pause()
    setDuaAudio((current) => (current ? { ...current, playing: false } : null))
    const cachedStream = streamCacheRef.current.get(episode.id)
    const playStream = (stream: EpisodeStream) => {
      setPlayerTargetEpisodeId(episode.id)
      setPlayer({
        episode,
        collection,
        src: stream.src,
        playing: true,
        progress: 0,
        duration: stream.duration || episode.duration || 0,
      })
      listened60Ref.current = false
      lastHistorySaveRef.current = 0
      if (!audio) return
      audio.muted = false
      audio.loop = false
      if (audio.currentSrc !== stream.src && audio.getAttribute('src') !== stream.src) {
        audio.src = stream.src
        audio.load()
      }
      audio.currentTime = 0
      void audio.play().then(() => {
        setPlayer((current) => (current?.episode.id === episode.id ? { ...current, playing: true } : current))
      }).catch(() => {
        setPlayer((current) => (current?.episode.id === episode.id ? { ...current, playing: false } : current))
        setToast('Touchez à nouveau le bouton lecture.')
      })
    }

    if (cachedStream) {
      playStream(cachedStream)
      if (!localStorage.getItem(FIRST_PLAY_KEY)) {
        localStorage.setItem(FIRST_PLAY_KEY, '1')
        trackEvent('first_play', { episode_id: episode.id, collection_id: collection?.id || episode.collectionId })
      }
      trackEvent('audio_play_started', { episode_id: episode.id, collection_id: collection?.id || episode.collectionId })
      return
    }

    if (audio) await primeAudioForGesture(audio)
    setNetworkBusy(true)
    try {
      const stream = await loadEpisodeStream(episode)
      playStream(stream)
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
      if (audio) stopAudioPrime(audio)
    } finally {
      setNetworkBusy(false)
    }
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio || !player) return
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlayer({ ...player, playing: true }))
        .catch(() => {
          setPlayer({ ...player, playing: false })
          setToast('Touchez à nouveau le bouton lecture.')
        })
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
    const src = mediaUrl(dua.audio_url_ar || `/stream/duas/${dua.id}/ar`)
    const audio = duaAudioRef.current
    setDuaAudio({
      dua,
      src,
      playing: Boolean(audio),
      repeat,
      progress: 0,
      duration: 0,
    })
    if (!audio) {
      setToast('Audio indisponible pour le moment.')
      return
    }
    if (audio.currentSrc !== src && audio.getAttribute('src') !== src) {
      audio.src = src
      audio.load()
    }
    audio.loop = repeat
    audio.currentTime = 0
    void audio.play().then(() => {
      setDuaAudio((current) => (current?.dua.id === dua.id ? { ...current, playing: true, repeat } : current))
    }).catch(() => {
      setDuaAudio((current) => (current?.dua.id === dua.id ? { ...current, playing: false, repeat } : current))
      setToast('Audio invocation indisponible pour le moment.')
    })
  }

  const toggleDuaPlayback = (dua: Dua) => {
    const audio = duaAudioRef.current
    if (duaAudio?.dua.id !== dua.id || !audio) {
      startDua(dua, false)
      return
    }
    if (audio.paused) {
      audio
        .play()
        .then(() => setDuaAudio((current) => (current?.dua.id === dua.id ? { ...current, playing: true } : current)))
        .catch(() => {
          setDuaAudio((current) => (current?.dua.id === dua.id ? { ...current, playing: false } : current))
          setToast('Audio invocation indisponible pour le moment.')
        })
    } else {
      audio.pause()
      audio.currentTime = 0
      setDuaAudio({ ...duaAudio, playing: false, progress: 0 })
    }
  }

  const toggleDuaRepeat = (dua: Dua) => {
    const audio = duaAudioRef.current
    if (duaAudio?.dua.id !== dua.id || !audio) {
      startDua(dua, true)
      return
    }

    const repeat = !duaAudio.repeat
    audio.loop = repeat
    setDuaAudio({ ...duaAudio, repeat })
    if (repeat && audio.paused) {
      startDua(dua, true)
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

  useEffect(() => {
    if (!('mediaSession' in navigator) || !player) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: player.episode.title,
      artist: player.collection?.name || player.episode.collectionName || 'NEA KIDZ',
      album: 'NEA KIDZ',
      artwork: [
        {
          src: mediaUrl(player.episode.coverUrl || player.episode.heroImageUrl || player.collection?.coverUrl),
          sizes: '512x512',
          type: 'image/webp',
        },
      ],
    })
    navigator.mediaSession.playbackState = player.playing ? 'playing' : 'paused'
    navigator.mediaSession.setActionHandler('play', togglePlayback)
    navigator.mediaSession.setActionHandler('pause', togglePlayback)
    navigator.mediaSession.setActionHandler('previoustrack', () => playAdjacentEpisode(-1))
    navigator.mediaSession.setActionHandler('nexttrack', () => playAdjacentEpisode(1))
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      const audio = audioRef.current
      if (audio) audio.currentTime = Math.max(0, audio.currentTime - 15)
    })
    navigator.mediaSession.setActionHandler('seekforward', () => {
      const audio = audioRef.current
      if (audio) audio.currentTime = Math.min(audio.duration || audio.currentTime + 15, audio.currentTime + 15)
    })
    // MediaSession handlers intentionally read the latest player state on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])

  return (
    <main className={view === 'player' ? 'app-shell player-shell' : 'app-shell'}>
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

      {showTopMiniPlayer && player && (
        <MiniPlayerTop player={player} onToggle={togglePlayback} onPrevious={() => playAdjacentEpisode(-1)} onNext={() => playAdjacentEpisode(1)} onClose={closePlayer} />
      )}
      {!standaloneView && view !== 'settings' && (!showTopMiniPlayer || view === 'profile') ? (
        <AppHeader
          variant={view === 'home' || view === 'duas' || view === 'search' ? 'root' : 'detail'}
          showRight={view !== 'profile'}
          onBack={() => setView('home')}
          onHome={() => setView('home')}
          onProfile={() => {
            setView('profile')
          }}
          onSettings={() => {
            setSettingsPanel('main')
            setView('settings')
          }}
        />
      ) : null}

      <section className="content-zone">
        {accountPending && <LoadingState />}
        {!accountPending && view === 'home' && (
          <HomeView
            catalog={catalog}
            homeContent={homeContent}
            loading={loadingCatalog}
            error={catalogError}
            premium={premium}
            player={player}
            featuredEpisode={featuredEpisode}
            freeCollection={freeCollection}
            allCollections={allCollections}
            favorites={favorites}
            playlists={playlists}
            onRetry={loadCatalog}
            onOpenCollection={openCollection}
            onOpenEpisode={openEpisode}
            onPlay={playEpisode}
            onOpenPlayer={openFullPlayer}
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
            onRepeat={toggleDuaRepeat}
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
        {!accountPending && view === 'player' && fullPlayerEpisode && (
          <PlayerView
            episode={fullPlayerEpisode}
            collection={fullPlayerCollection}
            player={player}
            onClose={() => setView('home')}
            onToggle={togglePlayback}
            onPrevious={() => playAdjacentEpisode(-1)}
            onNext={() => playAdjacentEpisode(1)}
            onSeek={(seconds) => {
              const audio = audioRef.current
              if (!audio || !player) return
              const next = Math.max(0, Math.min(seconds, audio.duration || player.duration || seconds))
              audio.currentTime = next
              setPlayer({ ...player, progress: next })
            }}
            onSeekBy={(delta) => {
              const audio = audioRef.current
              if (!audio || !player) return
              const next = Math.max(0, Math.min(audio.currentTime + delta, audio.duration || player.duration || audio.currentTime + delta))
              audio.currentTime = next
              setPlayer({ ...player, progress: next })
            }}
          />
        )}
        {!accountPending && view === 'search' && (
          <SearchView
            query={query}
            searching={searching}
            result={searchResult}
            catalogEpisodes={allEpisodes}
            catalogCollections={allCollections}
            premium={premium}
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
            stats={profileStats}
            historyLoading={loadingProfileHistory}
            onLogin={() => {
              setAuthMode('login')
              setView('auth')
            }}
            onLogout={logout}
            onPortal={openPortal}
            onPaywall={() => promptPaywall()}
            onOpenCollection={openCollection}
            onRefresh={() => {
              refreshMe()
              loadProfileHistory()
              loadUserLibrary()
            }}
          />
        )}
        {!accountPending && view === 'settings' && (
          <SettingsView
            panel={settingsPanel}
            installable={Boolean(installPrompt)}
            busy={networkBusy}
            themeMode={themeMode}
            textScale={textScale}
            notificationPrefs={notificationPrefs}
            onPanel={setSettingsPanel}
            onBack={() => {
              if (settingsPanel === 'main') setView('home')
              else setSettingsPanel('main')
            }}
            onInstall={installPwa}
            onRefresh={() => {
              loadCatalog()
              loadDuas()
              loadProfileHistory()
              loadUserLibrary()
              loadRemoteNotificationPrefs()
              refreshMe()
            }}
            onDownloads={() => setToast('Le téléchargement hors-ligne reste natif Android. La PWA garde seulement le cache navigateur.')}
            onPlaylists={() => setToast(`${playlists.length} liste${playlists.length > 1 ? 's' : ''} synchronisée${playlists.length > 1 ? 's' : ''} depuis votre compte.`)}
            onContact={() => {
              window.location.href = 'mailto:contact@neakidz.com?subject=Contact%20NEA%20KIDZ'
            }}
            onPreferences={() => setView('onboarding')}
            onThemeMode={setThemeMode}
            onTextScale={setTextScale}
            onNotificationPrefs={async (next) => {
              if (next.enabled && 'Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission().catch(() => 'denied')
              }
              setNotificationPrefs(next)
              try {
                const payload = await apiFetch<NotificationPrefsResponse>('/me/notification-preferences', {
                  method: 'PUT',
                  body: JSON.stringify(notificationPrefsToApi(next)),
                })
                setNotificationPrefs(notificationPrefsFromApi(payload))
              } catch {
                setToast('Préférences enregistrées sur cet appareil. Synchronisation à réessayer.')
              }
            }}
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
            onRestore={openPortal}
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
            onForgotPassword={async (email) => {
              setNetworkBusy(true)
              try {
                await apiFetch('/auth/forgot-password', {
                  method: 'POST',
                  body: JSON.stringify({ email }),
                }, false)
                setToast('Email envoyé si le compte existe.')
              } catch (error) {
                const apiError = error as ApiError
                setToast(apiError.status === 429
                  ? 'Trop de tentatives. Réessayez dans 15 minutes.'
                  : "Impossible d’envoyer l’email de réinitialisation.")
              } finally {
                setNetworkBusy(false)
              }
            }}
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
  homeContent,
  loading,
  error,
  premium,
  player,
  featuredEpisode,
  freeCollection,
  allCollections,
  favorites,
  playlists,
  onRetry,
  onOpenCollection,
  onOpenEpisode,
  onPlay,
  onOpenPlayer,
  onPaywall,
  onTogglePlayer,
  onPrevious,
  onNext,
}: {
  catalog: Catalog | null
  homeContent: HomeContent | null
  loading: boolean
  error: string
  premium: boolean
  player: PlayerState | null
  featuredEpisode?: Episode
  freeCollection?: Collection
  allCollections: Collection[]
  favorites: FavoriteItem[]
  playlists: PlaylistItem[]
  onRetry: () => void
  onOpenCollection: (id: string) => void
  onOpenEpisode: (id: string) => void
  onPlay: (episode: Episode, collection?: Collection) => void
  onOpenPlayer: (episode: Episode, collection?: Collection) => void
  onPaywall: () => void
  onTogglePlayer: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (!catalog) return null

  const seasons = catalog.seasons.filter((season) => season.collections.length > 0)
  const topStories = topCollectionEpisodesFromHome(homeContent, allCollections)
  const featuredCollection = allCollections.find((collection) => collection.id === featuredEpisode?.collectionId) || freeCollection

  return (
    <div className="screen home-screen">
      {featuredEpisode && (
        <AudioHeroCard
          episode={featuredEpisode}
          collection={featuredCollection}
          player={player}
          onPlay={() => (player?.episode.id === featuredEpisode.id ? onTogglePlayer() : onPlay(featuredEpisode, featuredCollection))}
          onOpenPlayer={() => onOpenPlayer(featuredEpisode, featuredCollection)}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      )}

      <section className="playlist-section">
        <SectionHeader title="Listes de lecture" />
        <div className="playlist-strip">
          <button className="playlist-shortcut" type="button" onClick={() => favorites[0] && onOpenEpisode(favorites[0].episodeId)}>
            <span className="playlist-icon">
              <Heart size={21} />
            </span>
            <span>
              <strong>Favoris</strong>
              <small>{favorites.length} {favorites.length > 1 ? 'histoires' : 'histoire'}</small>
            </span>
          </button>
          {playlists.slice(0, 2).map((playlist) => (
            <button
              className="playlist-shortcut"
              type="button"
              key={playlist.id}
              onClick={() => playlist.episodes?.[0] && onOpenEpisode(playlist.episodes[0].id)}
            >
              <span className="playlist-icon">
                <ListMusic size={21} />
              </span>
              <span>
                <strong>{playlist.title}</strong>
                <small>{playlist.episodes?.length || 0} {(playlist.episodes?.length || 0) > 1 ? 'histoires' : 'histoire'}</small>
              </span>
            </button>
          ))}
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
  onOpenPlayer,
  onPrevious,
  onNext,
}: {
  episode: Episode
  collection?: Collection
  player: PlayerState | null
  onPlay: () => void
  onOpenPlayer: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const isCurrent = player?.episode.id === episode.id
  const percent = isCurrent && player?.duration ? Math.min(100, (player.progress / player.duration) * 100) : 0

  return (
    <section
      className="audio-hero"
      role="button"
      tabIndex={0}
      onClick={onOpenPlayer}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenPlayer()
        }
      }}
      aria-label={`Ouvrir le lecteur pour ${episode.title}`}
    >
      <img src={mediaUrl(episode.heroImageUrl || episode.coverUrl || collection?.coverUrl)} alt="" />
      <div className="audio-hero-overlay">
        <div>
          <h1>{episode.title}</h1>
          <span>{collection?.name || episode.collectionName || 'Histoires'}</span>
        </div>
        <div className="audio-controls" onClick={(event) => event.stopPropagation()}>
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
              <span style={featureStoryTitleStyle(episode.title)}>{episode.title}</span>
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
                  <span style={topStoryTitleStyle(episode.title)}>{episode.title}</span>
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
  onRepeat,
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
  onPlay: (dua: Dua) => void
  onRepeat: (dua: Dua) => void
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
            onRepeat={() => onRepeat(dua)}
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

function PlayerView({
  episode,
  collection,
  player,
  onClose,
  onToggle,
  onPrevious,
  onNext,
  onSeek,
  onSeekBy,
}: {
  episode: Episode
  collection?: Collection
  player: PlayerState | null
  onClose: () => void
  onToggle: () => void
  onPrevious: () => void
  onNext: () => void
  onSeek: (seconds: number) => void
  onSeekBy: (seconds: number) => void
}) {
  const isCurrent = player?.episode.id === episode.id
  const progress = isCurrent ? player.progress : 0
  const duration = (isCurrent ? player.duration : episode.duration) || episode.duration || 0
  const trackIndex = collection?.episodes.findIndex((item) => item.id === episode.id) ?? -1
  const trackLabel = collection?.episodes.length ? `Piste ${trackIndex >= 0 ? trackIndex + 1 : 1}/${collection.episodes.length}` : 'Piste 1/1'
  const cover = mediaUrl(episode.heroImageUrl || episode.coverUrl || collection?.coverUrl)

  return (
    <div className="player-screen">
      <img className="player-cover-bg" src={cover} alt="" />
      <div className="player-gradient" />
      <button className="player-collapse" type="button" onClick={onClose} aria-label="Rabattre le lecteur">
        <ChevronDown size={34} />
      </button>

      <section className="player-panel" aria-label="Lecteur audio">
        <div className="player-title-block">
          <h1>{episode.title}</h1>
          <p className="player-meta">{collection?.name || episode.collectionName || 'Histoires NEA KIDZ'}</p>
          <p className="player-track">
            {trackLabel} • {durationLabel(progress)} / {durationLabel(duration)}
          </p>
        </div>

        <div className="player-progress-control">
          <input
            type="range"
            min="0"
            max={Math.max(1, duration)}
            value={Math.min(progress, Math.max(1, duration))}
            onChange={(event) => onSeek(Number(event.target.value))}
            aria-label="Progression"
          />
          <div>
            <span>{durationLabel(progress)}</span>
            <span>{durationLabel(duration)}</span>
          </div>
        </div>

        <div className="player-main-controls">
          <button type="button" onClick={onPrevious} aria-label="Épisode précédent">
            <SkipBack size={31} />
          </button>
          <button className="player-round-secondary" type="button" onClick={() => onSeekBy(-15)} aria-label="Reculer de 15 secondes">
            <RotateCcw size={28} />
            <span>15</span>
          </button>
          <button className="player-round-main" type="button" onClick={onToggle} aria-label={isCurrent && player?.playing ? 'Pause' : 'Lecture'}>
            {isCurrent && player?.playing ? <Pause size={34} /> : <Play size={34} />}
          </button>
          <button className="player-round-secondary" type="button" onClick={() => onSeekBy(15)} aria-label="Avancer de 15 secondes">
            <RotateCw size={28} />
            <span>15</span>
          </button>
          <button type="button" onClick={onNext} aria-label="Épisode suivant">
            <SkipForward size={31} />
          </button>
        </div>

        <div className="player-secondary-actions">
          <button type="button">
            <ListMusic size={25} />
            <span>À suivre</span>
          </button>
          <button type="button">
            <Timer size={25} />
            <span>Minuteur</span>
          </button>
          <button type="button">
            <Plus size={25} />
            <span>Playlist</span>
          </button>
          <button type="button">
            <Info size={25} />
            <span>Détails</span>
          </button>
        </div>
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
  premium,
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
  premium: boolean
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
                premium={premium}
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
  stats,
  historyLoading,
  onLogin,
  onLogout,
  onPortal,
  onPaywall,
  onOpenCollection,
  onRefresh,
}: {
  user: User | null
  premium: boolean
  busy: boolean
  stats: ProfileStats
  historyLoading: boolean
  onLogin: () => void
  onLogout: () => void
  onPortal: () => void
  onPaywall: () => void
  onOpenCollection: (id: string) => void
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

  return (
    <div className="screen profile-screen">
      {premium ? (
        <button className="profile-subscription-card premium" type="button" onClick={onPortal} disabled={busy}>
          <BadgeCheck size={22} />
          <span>
            <strong>{profilePlanLabel(user, premium)}</strong>
            <small>{user.email}</small>
            <em>{profileValidityLabel(user, premium)}</em>
          </span>
          <ChevronRight size={18} />
        </button>
      ) : (
        <button className="profile-subscription-card upgrade" type="button" onClick={onPaywall}>
          <Gift size={30} />
          <span>
            <strong>Passez Premium</strong>
            <small>Toutes nos histoires et fonctionnalités sans publicité.</small>
            <em>7 jours d’essai offerts.</em>
          </span>
        </button>
      )}

      <ProfileStatsCard stats={stats} loading={historyLoading} onOpenCollection={onOpenCollection} onRefresh={onRefresh} />
      <SocialSupportCard />
      <button className="profile-logout" type="button" onClick={onLogout}>
        <LogOut size={18} />
        Déconnexion
      </button>
    </div>
  )
}

function ProfileStatsCard({
  stats,
  loading,
  onOpenCollection,
  onRefresh,
}: {
  stats: ProfileStats
  loading: boolean
  onOpenCollection: (id: string) => void
  onRefresh: () => void
}) {
  const collections = stats.collectionProgress.slice(0, 4)
  return (
    <section className="profile-stats-card">
      <header>
        <span className="profile-stats-icon">
          <UserRound size={24} />
        </span>
        <div>
          <h1>Mon parcours NEA</h1>
          <p>Collections et histoires explorées.</p>
        </div>
        {loading && <Loader2 size={16} />}
      </header>

      {stats.hasListening ? (
        <>
          <div className="profile-metrics">
            <ProfileMetric icon={<Play size={18} />} value={String(stats.listenedCount)} label={`histoire${stats.listenedCount > 1 ? 's' : ''} écoutée${stats.listenedCount > 1 ? 's' : ''}`} />
            <ProfileMetric icon={<Sparkles size={18} />} value={`${stats.progressPercent}%`} label="du catalogue exploré" />
            <ProfileMetric icon={<BadgeCheck size={18} />} value={String(stats.completedCollections || stats.activeCollections)} label={stats.completedCollections > 0 ? 'collections terminées' : 'collections en cours'} />
          </div>
          {collections.length > 0 && (
            <div className="profile-continue">
              <div className="profile-continue-heading">
                <span><RefreshCcw size={18} /></span>
                <div>
                  <strong>À continuer</strong>
                  <small>Reprenez votre exploration.</small>
                </div>
              </div>
              <div className="profile-progress-list">
                {collections.map((collection) => (
                  <button className="profile-progress-row" type="button" key={collection.id} onClick={() => onOpenCollection(collection.id)}>
                    <span className="profile-progress-icon"><Headphones size={18} /></span>
                    <span className="profile-progress-copy">
                      <strong>{collection.name}</strong>
                      <small>{collection.listened}/{collection.total} écoutées · {collection.percent}%</small>
                      <i aria-hidden="true"><b style={{ width: `${collection.percent}%` }} /></i>
                    </span>
                    <em>Continuer</em>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <button className="profile-journey-start" type="button" onClick={onRefresh}>
          <span><Play size={26} /></span>
          <div>
            <strong>Votre parcours commence ici</strong>
            <small>Lancez une première histoire et créez votre premier moment sans écran.</small>
          </div>
          <ChevronRight size={20} />
        </button>
      )}
    </section>
  )
}

function ProfileMetric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="profile-metric">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  )
}

function SocialSupportCard() {
  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
  return (
    <section className="social-support-card">
      <header>
        <span><UserRound size={22} /></span>
        <div>
          <h2>Rejoignez la famille NEA KIDZ</h2>
          <p>Nouveautés, coulisses et contenus pour parents musulmans.</p>
        </div>
      </header>
      <div className="social-tile-grid">
        <button type="button" className="instagram" onClick={() => open('https://www.instagram.com/neakidz_fr/')}>
          <CameraIcon />
          Instagram
          <ChevronRight size={14} />
        </button>
        <button type="button" className="tiktok" onClick={() => open('https://www.tiktok.com/@neakidz')}>
          <MusicIcon />
          TikTok
          <ChevronRight size={14} />
        </button>
        <button type="button" className="youtube" onClick={() => open('https://www.youtube.com/@NEAKIDZ/featured')}>
          <Play size={16} />
          YouTube
          <ChevronRight size={14} />
        </button>
        <button type="button" className="facebook" onClick={() => open('https://www.facebook.com/p/NEA-KIDZ-61587228125791/')}>
          <UserRound size={16} />
          Facebook
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  )
}

function CameraIcon() {
  return <span className="social-dot" aria-hidden="true">◎</span>
}

function MusicIcon() {
  return <span className="social-dot" aria-hidden="true">♪</span>
}

function SettingsView({
  panel,
  installable,
  busy,
  themeMode,
  textScale,
  notificationPrefs,
  onPanel,
  onBack,
  onInstall,
  onRefresh,
  onDownloads,
  onPlaylists,
  onContact,
  onPreferences,
  onThemeMode,
  onTextScale,
  onNotificationPrefs,
}: {
  panel: SettingsPanel
  installable: boolean
  busy: boolean
  themeMode: ThemeMode
  textScale: TextScale
  notificationPrefs: NotificationPrefs
  onPanel: (panel: SettingsPanel) => void
  onBack: () => void
  onInstall: () => void
  onRefresh: () => void
  onDownloads: () => void
  onPlaylists: () => void
  onContact: () => void
  onPreferences: () => void
  onThemeMode: (mode: ThemeMode) => void
  onTextScale: (scale: TextScale) => void
  onNotificationPrefs: (prefs: NotificationPrefs) => void | Promise<void>
}) {
  if (panel === 'display') {
    return (
      <div className="screen settings-screen">
        <SettingsTopBar title="Affichage" onBack={onBack} />
        <AppearanceAccessibilityCard
          themeMode={themeMode}
          textScale={textScale}
          onThemeMode={onThemeMode}
          onTextScale={onTextScale}
        />
      </div>
    )
  }

  if (panel === 'notifications') {
    return (
      <div className="screen settings-screen">
        <SettingsTopBar title="Notifications" onBack={onBack} />
        <NotificationSettingsPanel prefs={notificationPrefs} onPrefs={onNotificationPrefs} />
      </div>
    )
  }

  return (
    <div className="screen settings-screen">
      <SettingsTopBar title="Réglages" onBack={onBack} />
      <SettingsSection title="Écoute">
        <div className="settings-list">
          <button className="settings-row action-row" type="button" onClick={onDownloads}>
            <DownloadIcon />
            <div>
              <strong>Histoires hors-ligne</strong>
              <span>Gérer les histoires téléchargées</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="settings-row action-row" type="button" onClick={onPlaylists}>
            <BookOpen size={20} />
            <div>
              <strong>Playlists</strong>
              <span>Retrouver les sélections de la famille</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </SettingsSection>
      <SettingsSection title="Expérience">
        <div className="settings-list">
          <button className="settings-row action-row" type="button" onClick={() => onPanel('display')}>
            <Palette size={20} />
            <div>
              <strong>Affichage</strong>
              <span>Accessibilité et apparence</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="settings-row action-row" type="button" onClick={() => onPanel('notifications')}>
            <Bell size={20} />
            <div>
              <strong>Notifications</strong>
              <span>Rappels du soir et nouvelles histoires</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="settings-row action-row" type="button" onClick={onPreferences}>
            <Settings size={20} />
            <div>
              <strong>Préférences d’écoute</strong>
              <span>Adapter NEA KIDZ à votre famille</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </SettingsSection>
      <SettingsSection title="Assistance">
        <div className="settings-list">
          <button className="settings-row action-row" type="button" onClick={onContact}>
            <Mail size={20} />
            <div>
              <strong>Nous contacter</strong>
              <span>Une question, une remarque, une idée</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="settings-row action-row" type="button" onClick={onRefresh} disabled={busy}>
            <RefreshCcw size={20} />
            <div>
              <strong>Actualiser</strong>
              <span>Catalogue, compte et parcours</span>
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
      <p className="settings-version">Version {APP_VERSION_LABEL}</p>
    </div>
  )
}

function SettingsTopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="settings-topbar">
      <button type="button" onClick={onBack} aria-label="Retour">
        <ArrowLeft size={24} />
      </button>
      <h1>{title}</h1>
      <span />
    </div>
  )
}

function DownloadIcon() {
  return <Headphones size={20} />
}

function NotificationSettingsPanel({ prefs, onPrefs }: { prefs: NotificationPrefs; onPrefs: (prefs: NotificationPrefs) => void | Promise<void> }) {
  const update = (next: Partial<NotificationPrefs>) => onPrefs({ ...prefs, ...next })
  return (
    <section className="notification-panel">
      <SettingsSwitchRow
        icon={<Bell size={22} />}
        title="Notifications NEA KIDZ"
        subtitle="Activer les rappels doux sur cet appareil"
        checked={prefs.enabled}
        onChange={(enabled) => update({
          enabled,
          newStoriesEnabled: enabled,
          bedtimeEnabled: enabled ? prefs.bedtimeEnabled : false,
        })}
      />
      <SettingsSwitchRow
        icon={<Sparkles size={22} />}
        title="Nouvelles histoires"
        subtitle="Être prévenu quand une histoire arrive"
        checked={prefs.enabled && prefs.newStoriesEnabled}
        onChange={(newStoriesEnabled) => update({ enabled: newStoriesEnabled || prefs.enabled, newStoriesEnabled })}
      />
      <SettingsSwitchRow
        icon={<Moon size={22} />}
        title="Rappel du soir"
        subtitle="Une invitation douce à lancer une histoire"
        checked={prefs.enabled && prefs.bedtimeEnabled}
        trailing={<button className="time-chip" type="button" onClick={() => update({ bedtimeTime: prefs.bedtimeTime === '20:30' ? '21:00' : '20:30' })}>{prefs.bedtimeTime}</button>}
        onChange={(bedtimeEnabled) => update({ enabled: bedtimeEnabled || prefs.enabled, bedtimeEnabled })}
      />
    </section>
  )
}

function SettingsSwitchRow({
  icon,
  title,
  subtitle,
  checked,
  trailing,
  onChange,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  checked: boolean
  trailing?: ReactNode
  onChange: (checked: boolean) => void
}) {
  return (
    <div className={checked ? 'settings-switch-row active' : 'settings-switch-row'}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      {trailing}
      <button className={checked ? 'switch-control active' : 'switch-control'} type="button" onClick={() => onChange(!checked)} aria-label={checked ? `Désactiver ${title}` : `Activer ${title}`}>
        <i />
      </button>
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
  onRestore,
  onBack,
  onAuth,
}: {
  episode: Episode | null
  selectedPlan: Plan
  busy: boolean
  authenticated: boolean
  onSelectPlan: (plan: Plan) => void
  onCheckout: (plan: Plan) => void
  onRestore: () => void
  onBack: () => void
  onAuth: () => void
}) {
  const cta = selectedPlan === 'yearly' ? 'Essayer gratuitement 7 jours*' : 'Commencez pour 7,99 €/mois'
  return (
    <div className="screen paywall-screen">
      <div className="paywall-topbar">
        <button className="circle-back" type="button" onClick={onBack} aria-label="Retour">
          <ArrowLeft size={21} />
        </button>
        <button className="restore-link" type="button" onClick={authenticated ? onRestore : onAuth}>
          Restaurer
        </button>
      </div>
      <section className="paywall" aria-label={episode ? `Abonnement premium pour ${episode.title}` : 'Abonnement premium NEA KIDZ'}>
        <h1>Toutes nos histoires pour toute la famille</h1>
        <p>200+ récits à écouter, aimer et transmettre.</p>

        <div className="paywall-preview-showcase" aria-hidden="true">
          {PAYWALL_PREVIEW_ROWS.map((row, rowIndex) => (
            <div className={rowIndex === 0 ? 'paywall-preview-rail' : 'paywall-preview-rail reverse'} key={rowIndex}>
              {[0, 1].map((repeat) =>
                row.map(([title, src]) => (
                  <div className="paywall-preview-card" key={`${rowIndex}-${repeat}-${title}`}>
                    <img src={src} alt="" />
                    <span>{title}</span>
                  </div>
                )),
              )}
            </div>
          ))}
        </div>

        <div className="plan-stack">
          <button className={selectedPlan === 'yearly' ? 'plan selected' : 'plan'} type="button" onClick={() => onSelectPlan('yearly')}>
            <em>-48%</em>
            <span>Annuel</span>
            <strong>49,99 €<small>/an</small></strong>
            <small>Économisez 46 €/an<br />7 jours offerts*</small>
            <i aria-hidden="true">{selectedPlan === 'yearly' ? <CheckCircle2 size={23} /> : <span />}</i>
          </button>
          <button className={selectedPlan === 'monthly' ? 'plan selected' : 'plan'} type="button" onClick={() => onSelectPlan('monthly')}>
            <span>Mensuel</span>
            <strong>7,99 €<small>/mois</small></strong>
            <small>Sans engagement</small>
            <i aria-hidden="true">{selectedPlan === 'monthly' ? <CheckCircle2 size={23} /> : <span />}</i>
          </button>
        </div>

        <div className="paywall-review">
          <div aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star size={15} fill="currentColor" key={index} />
            ))}
          </div>
          <strong>Mon fils me demande encore une histoire avant de dormir.</strong>
          <small>Parent NEA KIDZ</small>
        </div>

        <div className="paywall-reassurance">
          <ShieldCheck size={17} />
          <span>Aucun paiement aujourd’hui<br />Payez après la période d’essai</span>
        </div>

        <button className="primary-action full" type="button" onClick={() => (authenticated ? onCheckout(selectedPlan) : onAuth())} disabled={busy}>
          {busy ? <Loader2 size={18} /> : <CreditCard size={18} />}
          {cta}
        </button>
        <p className="legal-copy">
          {selectedPlan === 'yearly'
            ? '*: 7 jours offerts, puis 49.99€/an.\nPayez après la période d’essai.'
            : '7,99 €/mois, renouvellement automatique.\nAnnulable à tout moment.'}
        </p>
        <div className="legal-links">
          <a href="https://neakidz.com/cgv/" target="_blank" rel="noreferrer">Conditions</a>
          <a href="https://neakidz.com/politique-de-confidentialite/" target="_blank" rel="noreferrer">Confidentialité</a>
        </div>
        {!authenticated && <p className="activation-note">Connexion demandée au moment de l’activation.</p>}
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
  onForgotPassword,
  onSubmit,
}: {
  mode: AuthMode
  busy: boolean
  locked: boolean
  onMode: (mode: AuthMode) => void
  onBack: () => void
  onForgotPassword: (email: string) => Promise<void>
  onSubmit: (mode: AuthMode, values: Record<string, string>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) || '')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) || '')
  const isRegister = mode === 'register'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!isRegister) {
      if (rememberMe) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }
    void onSubmit(mode, isRegister ? { name, email, password } : { email, password })
  }

  const openForgot = () => {
    setForgotEmail(email.trim())
    setForgotOpen(true)
  }

  const submitForgot = async (event: FormEvent) => {
    event.preventDefault()
    await onForgotPassword(forgotEmail.trim())
    setForgotOpen(false)
  }

  return (
    <div className="screen auth-screen">
      {!locked && (
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          Accueil
        </button>
      )}
      <div className="auth-brand">
        <img src={LOGIN_LOGO} alt="" />
        <strong>NEA KIDZ</strong>
        <span>Chaque histoire est une graine</span>
      </div>
      <section className="auth-panel">
        <div className="auth-intro">
          <h1>{isRegister ? 'Créer un compte' : 'Connexion'}</h1>
          {isRegister && <p>Rejoignez NEA KIDZ en quelques secondes.</p>}
        </div>
        <form onSubmit={submit}>
          {isRegister && (
            <label className="auth-field">
              <UserRound size={19} />
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Prénom" autoComplete="name" required />
            </label>
          )}
          <label className="auth-field">
            <Mail size={19} />
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" required />
          </label>
          <label className="auth-field">
            <KeyRound size={19} />
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" type={passwordVisible ? 'text' : 'password'} minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} required />
            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              {passwordVisible ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </label>
          {!isRegister && (
            <label className="remember-row">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
              <i aria-hidden="true" />
              <span>Se souvenir de moi</span>
            </label>
          )}
          <button className="primary-action full" type="submit" disabled={busy}>
            {busy ? <Loader2 size={18} /> : <LogIn size={18} />}
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </button>
          {isRegister ? (
            <button className="auth-text-link" type="button" onClick={() => onMode('login')}>
              Déjà un compte ? Se connecter
            </button>
          ) : (
            <>
              <button className="auth-text-link muted" type="button" onClick={openForgot}>
                Mot de passe oublié ?
              </button>
              <button className="auth-text-link" type="button" onClick={() => onMode('register')}>
                S’inscrire
              </button>
              <small>Un compte est nécessaire pour accéder aux histoires.</small>
            </>
          )}
        </form>
      </section>
      {forgotOpen && (
        <div className="auth-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
          <form className="auth-dialog" onSubmit={submitForgot}>
            <h2 id="forgot-title">Mot de passe oublié</h2>
            <p>Saisis ton email pour recevoir un lien de réinitialisation.</p>
            <label className="auth-field">
              <Mail size={19} />
              <input value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" required />
            </label>
            <div className="auth-dialog-actions">
              <button className="ghost-action" type="button" onClick={() => setForgotOpen(false)} disabled={busy}>Annuler</button>
              <button className="primary-action" type="submit" disabled={busy}>
                {busy ? <Loader2 size={17} /> : null}
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}
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
