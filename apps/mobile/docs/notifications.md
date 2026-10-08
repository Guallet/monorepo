# Mobile notifications

The approved [Mobbin-informed design](../../../docs/mockups/mobile-notifications-design.md)
is implemented as an authenticated notification stack plus a dashboard bell
and preview. It uses the existing API client and shared React Query hooks.

## Behaviour

- Dashboard: count badge capped at 99+, up to three latest unread messages,
  individual mark-as-read controls and View all notifications. Loading and
  failed count queries do not imply zero unread messages.
- Inbox: newest-first history, All/Unread filter, mark-all-as-read, pull to
  refresh, loading placeholders, separate empty states and retry feedback.
  Cached messages stay visible after a failed refresh. Returning from a detail
  keeps the inbox instance, selected filter and scroll position.
- Detail: full message, type and exact local timestamp. Opening the detail
  attempts to mark it read once per visit; explicit Mark as unread is preserved.
  Dashboard data seeds the detail so a failed fetch still leaves a known message
  readable. A missing notification shows Notification unavailable.
- Actions: the shared Luna BottomSheet offers read/unread and delete. Delete
  opens a second confirmation state in the same sheet before sending the
  permanent delete request. Cancel and native dismissal do not change read
  state. Failed requests retain the message and offer another attempt.
- Feedback: successful and failed mutations use the existing Luna toast service,
  including its sheet handling. Controls expose labels, selected/disabled/busy
  states and minimum touch sizes. Cards and actions expand with system text.
- Refresh: the existing unread query polls every five minutes. The app already
  connects native foreground changes to TanStack Query’s focus manager, so
  stale notification queries refetch when the app returns to the foreground.

## Linked destinations

`notificationDestination.ts` explicitly maps supported web URLs to equivalent
mobile screens: dashboard, accounts, transactions, budgets, settings, categories
and saving goals. UUID detail links are supported for accounts, transactions,
budgets and saving goals. Query strings, fragments, external URLs and arbitrary
route strings are rejected.

The backend currently emits `/transactions/inbox`; mobile does not implement
that page. Its notification remains readable and manageable with “Page
unavailable in the app”. There is no View details action for an unsupported or
absent link. Do not map transaction inbox to the unfiltered transactions list.
The notification stack anchors its index so direct detail entry has an inbox
back destination.

## Cache consistency

Shared notification mutations retain the existing convenience callbacks and
also expose mutation objects for callers that need asynchronous results.
On success they cancel pending notification queries, update fetched full/unread
lists and the individual detail cache, then invalidate the lists. History queries
check their abort signal before priming detail caches, preventing a cancelled
request from overwriting a successful read-state update with stale data.

Read/unread and delete failures leave the cache intact. A bulk read operation
updates known unread IDs from the start of the request; newly arrived messages
are preserved until the server refresh confirms their state. A single detail
change never creates a partially known full or unread list. Bulk cache updates
are linear in the number of cached messages.

The shared sheet wrapper now calls onClose for native dismissal as well as its
close button, and deduplicates a matching optional onDismiss callback. It retains
the existing native content bridge and toast presence handling.

## Validation

Automated tests cover destination mapping and rejection, timestamps, all/read/
unread/detail cache consistency, cancellation races, failed mutations, bulk
snapshot behaviour, deletion confirmation and retry, inbox filtering, and
unsupported links. Native device validation is still needed for sheet gestures,
VoiceOver/TalkBack focus, larger text and navigation on iOS and Android; renderer
unit tests do not prove those behaviours.

This feature adds no push permissions, delivery preferences or device token
registration. It implements the existing web in-app notification capabilities.
