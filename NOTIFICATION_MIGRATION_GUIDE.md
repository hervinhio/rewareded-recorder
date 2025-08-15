# Notification System Migration Guide

## Overview
This document outlines the migration from a separate `notifications` collection to user-embedded notifications in the `users` collection.

## Changes Made

### Backend (Go)
1. **Fixed bug in `UserPersistenceManager.InsertOneNotification()`**: Added proper field name in `$push` operation
2. **Added `MarkNotificationAsRead()` method**: Allows marking specific notifications as read
3. **User entity**: Already had `Notifications []Notification` field

### Frontend (TypeScript/React)
1. **Updated `User` interface**: Added optional `notifications?: Notification[]` field
2. **Updated `Notifications` service**: Now works with user-embedded notifications
3. **Updated UI components**: Display notifications from user documents
4. **Enhanced date handling**: Supports both Firebase Timestamp and Date objects

### Firebase Functions
1. **Updated notification creation**: Now adds notifications to user documents using `arrayUnion`
2. **Maintained backward compatibility**: `saveSubmission` still uses old collection

## Migration Steps

### For New Installations
No additional steps needed - the system will work with user-embedded notifications from the start.

### For Existing Installations

#### Option 1: Clean Migration (Recommended for dev/test)
1. Clear existing notifications collection
2. New notifications will be created in user documents

#### Option 2: Data Migration (For production with existing notifications)
If you need to preserve existing notifications, run this MongoDB script:

```javascript
// Connect to your MongoDB database
use your_database_name;

// Get all existing notifications
const notifications = db.notifications.find({}).toArray();

// Group notifications by user (assuming notifications have author.id or similar)
const notificationsByUser = {};
notifications.forEach(notif => {
    // Adjust this logic based on how you determine which user should receive the notification
    // This example assumes all users except the author should receive the notification
    const authorId = notif.author?.id;
    
    db.users.find({"_id": {"$ne": ObjectId(authorId)}}).forEach(user => {
        if (!notificationsByUser[user._id]) {
            notificationsByUser[user._id] = [];
        }
        notificationsByUser[user._id].push({
            id: notif._id.toString(),
            publisher: notif.publisher,
            author: notif.author,
            date: notif.date,
            type: notif.type,
            unread: notif.unread
        });
    });
});

// Update each user with their notifications
Object.keys(notificationsByUser).forEach(userId => {
    db.users.updateOne(
        {"_id": ObjectId(userId)},
        {"$set": {"notifications": notificationsByUser[userId]}}
    );
});

// Optionally, rename the old notifications collection as backup
db.notifications.renameCollection("notifications_backup");
```

#### Option 3: Gradual Migration
1. Keep both systems running
2. New notifications go to user documents
3. UI shows notifications from both sources
4. Gradually phase out old collection

## Testing

Run the provided integration tests to verify the migration:

```bash
node /tmp/test-integration.js
```

All tests should pass:
- Display logic
- Date handling  
- User creation
- Notification addition

## Rollback Plan

If issues occur:

1. **Frontend**: Revert `notifications.ts` to use separate collection
2. **Backend**: Continue using existing methods
3. **Database**: Restore from `notifications_backup` if created

## Benefits of Migration

1. **Performance**: Fewer database queries (notifications come with user data)
2. **Simplicity**: No need to manage separate collection
3. **Consistency**: Notifications are part of user data model
4. **Scalability**: Better for large numbers of users

## Monitoring

After migration, monitor:
1. User login/data loading performance
2. Notification creation/reading functionality
3. UI responsiveness with notifications
4. Database storage usage

## Notes

- New user creation automatically includes empty notifications array
- Existing UI components continue to work unchanged
- Date handling supports both Timestamp and Date objects
- Backend API maintains same interface for notification operations