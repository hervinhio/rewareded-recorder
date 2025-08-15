# Auxiliary Pioneer Tracking Implementation

## Overview
This implementation adds auxiliary pioneer count tracking to the Stats collection, storing a counter for every unique auxiliary pioneer that has met a monthly goal at least once.

## Features Added

### Backend (Go)
- Added `AuxiliaryPioneersCount` (int) field to track count of unique auxiliary pioneers
- Added `AuxiliaryPioneersIds` ([]string) field to store IDs of publishers who met goals
- Existing API endpoints automatically support the new fields via JSON serialization

### Frontend (TypeScript)
- Added corresponding fields to TypeScript `Stats` interface
- Implemented `addAuxiliaryPioneerAchievement()` method in `StatsUtils`
- Integrated tracking logic into existing `checkAuxiliaryPioneerGoal()` method
- Added UI display in stats page under "Serviteurs nommés" section

## How It Works

1. **Automatic Tracking**: When a report is created or updated, the system checks if the publisher is an auxiliary pioneer and if they met their goal
2. **Goal Validation**: Uses existing `hasMetAuxiliaryPioneerGoal()` logic (15 hours for special months, 30 for normal months)
3. **Unique Counting**: Publishers are only counted once, even if they meet goals multiple times
4. **Error Handling**: Stats tracking failures don't break report processing
5. **UI Display**: Count is shown alongside other appointment statistics

## Files Modified

### Core Implementation
- `server/entities/stats.go` - Added new fields to Stats entity
- `apps/rewarded-keeper/src/app/data/stats.ts` - Added fields and tracking method
- `apps/rewarded-keeper/src/app/data/reports.ts` - Integrated tracking into report processing

### UI Updates
- `apps/rewarded-keeper/src/app/admin/stats-page.tsx` - Added auxiliary pioneer count display

### Tests
- `apps/rewarded-keeper/src/app/data/stats.test.ts` - Unit tests for StatsUtils
- `apps/rewarded-keeper/src/app/data/reports.test.ts` - Updated with tracking tests
- `apps/rewarded-keeper/src/app/data/auxiliary-pioneer-tracking.integration.test.ts` - Integration tests

## Usage

The functionality is completely automatic - no manual intervention required. When auxiliary pioneers submit reports that meet their goals:

1. The system validates the goal achievement
2. Adds the publisher ID to the `auxiliaryPioneersIds` array (if not already present)
3. Updates the `auxiliaryPioneersCount` to reflect the array length
4. Displays the count in the admin stats page

## Reset Functionality

The stats can be reset through the existing admin interface, which will clear both the count and the IDs array.

## Compatibility

- Backward compatible - existing stats without the new fields will initialize them as 0 and empty array
- Existing API endpoints work unchanged
- No breaking changes to existing functionality