# Audit alignement PWA app2 vs Android NEA KIDZ — 2026-06-18

Source de vérité: application Android exécutée dans l'émulateur `emulator-5554`, package `com.neakidz.app`, compte premium QA.
Périmètre: `app2.neakidz.com` uniquement. `app.neakidz.com` non modifié.

## Captures produites

- Android référence: `D:\Neabusiness\neakidz.com\pwa2_audit_captures\android_ref\`
- PWA avant correction: `D:\Neabusiness\neakidz.com\pwa2_audit_captures\pwa_before\`
- PWA après correction: `D:\Neabusiness\neakidz.com\pwa2_audit_captures\pwa_after\`

## Tableau écrans Android

| Écran Android | Route Flutter | Statut référence |
|---|---|---|
| Auth | `/auth` | OK code + rendu déjà connus |
| Onboarding préférences | `/preferences-onboarding` | OK code, non recapturé pendant cette passe |
| Home Histoires | `/home` | Capturé: hero audio, listes de lecture, favoris, rails, bottom nav |
| Invocations | `/library/duas` | Capturé: recherche, catégories, filtre mémoire, tab 99 noms |
| Recherche | `/search` | Capturé: champ recherche + suggestions |
| Profil | `/profile` | Capturé: abonnement, parcours, stats, à continuer |
| Réglages | `/settings` | Capturé: Écoute, Expérience, Assistance, version |
| Player | `/player` | Audité code: contrôles natifs + queue/minuteur/playlist/détails |
| Collections/détails épisode | `/collection/:slug`, `/episode/:id` | Audité code; rendu home/rails vérifié |
| Downloads/Playlists/Favoris | `/downloads`, `/playlists`, `/library/favorites` | Audité code Android: backend/cache natif; PWA ne peut pas reproduire l'offline natif fidèlement |

## Tableau PWA avant correction

| Vue PWA | Équivalent Android | Statut avant | Écart principal |
|---|---|---|---|
| `home` | Home | partiel | Favoris hardcodé `0 histoire`; playlists backend non affichées |
| `duas` | Invocations | partiel | Tab 99 noms présent mais non implémenté en vue complète |
| `search` | Recherche | bug mineur | Les résultats épisodes forçaient `premium=true`, donc cadenas/free mal alignés |
| `profile` | Profil | partiel | Stats OK mais favoris/playlists non raccordés côté home |
| `settings` | Réglages | partiel | Playlists/downloads affichaient des toasts “bientôt” non raccordés |
| `player` | Player | partiel | Pas de MediaSession navigateur; sous-actions encore simplifiées vs Android |
| `auth`/`onboarding`/`paywall` | Auth/onboarding/paywall | OK | Stripe est une différence légitime PWA |

## Divergences UI/UX confirmées

1. Home PWA affichait `Favoris 0 histoire` alors qu'Android lit le compteur réel.
2. Playlists Android visibles (`coucher`, etc.) absentes du rail PWA malgré endpoint backend.
3. Recherche PWA masquait les états verrouillés/free en forçant `premium`.
4. Réglages PWA disait “Playlists bientôt disponibles” alors que `/user/playlists` existe.
5. Player PWA n'exposait pas MediaSession API pour casque/lockscreen navigateur.
6. Downloads offline restent une différence légitime: Android a fichiers natifs, la PWA ne doit pas promettre un téléchargement natif équivalent sans IndexedDB/quotas/background sync.
7. 99 noms d'Allah reste non aligné: Android a une vue complète; PWA garde un onglet décoratif.

## Divergences backend/API confirmées

| Donnée/fonction | Android | PWA avant | Correction/position |
|---|---|---|---|
| Premium | Backend `/auth/me` + Play verify | Backend `/auth/me` + Stripe | OK, différence légitime canal paiement |
| Historique/progression | `/user/history` | `/user/history` | OK |
| Favoris | `/user/favorites` | non appelé | Corrigé: GET utilisé pour compteur + premier favori ouvrable |
| Playlists | `/user/playlists` | non appelé | Corrigé: GET utilisé pour afficher les listes existantes |
| Notifications prefs | `/me/notification-preferences` | appelé | OK prefs; Web Push token reste absent |
| Invocations mémorisées | `/user/duas/memorized` | appelé + cache local | OK cache display-only |
| Logout | `/auth/logout` disponible | non appelé | Corrigé: POST best-effort avant purge session locale |
| Analytics version | `/analytics/events` | version hardcodée obsolète | Corrigé: utilise `APP_VERSION_LABEL` |

## Données locales à surveiller

- `neakidz.pwa2.session`: localStorage web, acceptable techniquement PWA mais moins sûr qu'Android SecureStorage.
- `neakidz.pwa2.duas.known`: cache uniquement; backend `/user/duas/memorized` reste source.
- `neakidz.pwa2.notificationPrefs`: cache uniquement; backend `/me/notification-preferences` reste source.
- URLs stream signées: restent en mémoire seulement, pas en localStorage.

## Restes non alignés documentés

- 99 noms d'Allah PWA corrigé le 2026-06-18 : vue complète 99 noms, groupes 1-33/34-66/67-99, recherche et audio `/stream/allah-names/:number`.
- Web Push réel non implémenté (`PushManager.subscribe` + `/me/push-tokens`).
- Downloads offline natifs Android non transposés; nécessiterait design IndexedDB/cache quota et UX spécifique web.
- Sous-actions player `À suivre`, `Minuteur`, `Playlist`, `Détails` restent visuellement présentes mais pas au niveau Android complet.
