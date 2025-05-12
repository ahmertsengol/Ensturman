# Mobile App Migration Notes

## Known Issues and Fixes

### 1. Storage Directory Issue

**Problem:**  
Error messages in the form of `Failed to load user [Error: Failed to create storage directory...]` were occurring when the app tried to access the storage directory for anonymous users.

**Fix:**  
- Added logic in `AuthContext.tsx` to create the necessary directory structure before attempting to access it
- Added iOS bundle identifier in `app.json` to ensure proper app identification
- Added `requiredFullAccessPrivileges` to iOS configuration in `app.json`

### 2. expo-av Deprecation

**Problem:**  
The `expo-av` package is deprecated and will be removed in SDK 54 according to warning messages.

**Migration Plan:**  
- Switch to `expo-audio` and `expo-video` packages before upgrading to SDK 54
- Current audio components to migrate:
  - `components/audio/AudioRecorder.tsx`
  - `utils/AudioRecorder.ts`
  - `app/(tabs)/recordings.tsx`

**Migration Steps:**
1. Research the APIs for `expo-audio` and `expo-video` (currently these packages have minimal documentation)
2. Map the current `Audio` class usage from `expo-av` to the equivalent in `expo-audio`
3. Test thoroughly on both iOS and Android
4. Remove `expo-av` dependency after successful migration

## Timeline

- **Current State**: Fixes applied for storage directory issue
- **Before SDK 54**: Complete migration from `expo-av` to `expo-audio`/`expo-video` 