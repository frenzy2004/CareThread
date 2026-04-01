

# Landing + Auth Layer — Final Plan

## Configuration

- **Supabase URL**: `https://sipldhvknkwpzhcvquhd.supabase.co`
- **Anon Key**: `sb_publishable_NgnOSdabUdqncZ8OjNXOqQ_tIenPliy` (publishable — safe to store in code)

## Files to Create

### 1. `src/integrations/supabase/client.ts`
Supabase client initialized with the URL and anon key above.

### 2. `src/components/ui/animated-shader-hero.tsx`
WebGL2 fractal clouds shader background component. Accepts `children` prop so auth form overlays on top. The pasted code had stripped JSX — I'll reconstruct it with proper markup: full-viewport canvas, pointer interaction, CSS keyframe animations for content fade-in.

### 3. `src/pages/Landing.tsx`
Single page: shader background + centered auth card.
- Toggle between Sign In / Sign Up
- Email + password fields
- Sign-up copy: *"Your health data stays private on your device. Create an account to access CareThread."*
- Calls `supabase.auth.signInWithPassword` / `signUp`
- Error feedback via toast
- If already authenticated → redirect to `/dashboard`

### 4. `src/contexts/AuthContext.tsx`
- `onAuthStateChange` listener set up before `getSession()`
- Exposes `user`, `session`, `loading`, `signOut`
- `loading` starts `true`, blocks rendering until session resolves

### 5. `src/components/ProtectedRoute.tsx`
- If `loading` → warm-themed spinner (no flicker)
- If no session → redirect to `/`
- If session → render children

## Files to Modify

### 6. `src/App.tsx`
- Wrap with `AuthProvider` (outside `HealthDataProvider`)
- `/` → `Landing.tsx` (public)
- `/dashboard`, `/symptoms`, `/medications`, `/timeline`, `/settings` → wrapped in `ProtectedRoute`
- SideNav/BottomNav render inside protected area only

### 7. `src/pages/Settings.tsx`
- Add "Sign Out" button at the bottom
- Calls `signOut()` from AuthContext, navigates to `/`

## Not Touched
Dashboard, Symptoms, Medications, Timeline, HealthDataContext, BottomNav, SideNav — zero changes to existing core functionality.

