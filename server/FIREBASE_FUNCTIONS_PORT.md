# Firebase Functions Ported to Go

This document describes the Firebase functions that have been successfully ported to Go endpoints.

## Port Status

All Firebase functions have been ported to equivalent Go functions and are accessible via HTTP endpoints.

### Trigger Functions
These functions handle database change events (equivalent to Firestore triggers):

- **Report Created**: `POST /api/functions/triggers/reports/created`
  - Handles report creation events
  - Generates notifications
  - Updates publisher active state
  - Updates auxiliary pioneer status

- **Report Updated**: `POST /api/functions/triggers/reports/updated`
  - Handles report update events
  - Same functionality as report created

- **Report Deleted**: `POST /api/functions/triggers/reports/deleted`
  - Handles report deletion events
  - Same functionality as report created

### Cron Functions
These functions handle scheduled maintenance tasks:

- **Cleanup Notifications**: `POST /api/functions/cron/cleanup-notifications`
  - Deletes notifications older than 30 days that are not unread
  - Equivalent to Firebase `deleteNotificationsCron`

- **Cleanup Old Reports**: `POST /api/functions/cron/cleanup-old-reports`
  - Deletes reports older than 2 years
  - Equivalent to Firebase `deleteOldReportsCron`

### HTTP Functions
These functions handle callable operations:

- **Recalculate Publishers Status**: `POST /api/functions/http/recalculate-publishers-status`
  - Recalculates active status for all publishers in a realm
  - Equivalent to Firebase `recalculatePublishersActiveStatus`

## Authentication & Permissions

All endpoints are protected with appropriate permissions:
- Trigger functions require `PermissionReportManage`
- Cron functions require `PermissionUserAdmin`
- HTTP functions require `PermissionPublisherManage`

## Data Structures

### ReportTriggerData
```go
type ReportTriggerData struct {
    PublisherID string          `json:"publisherId"`
    AuthorID    string          `json:"authorId"`
    Report      entities.Report `json:"report"`
    Type        NotificationType `json:"type"`
}
```

### NotificationType
```go
const (
    ReportCreated NotificationType = iota
    ReportUpdated
    ReportDeleted
    ReportsSubmitted
)
```

## Usage Examples

### Trigger Report Creation
```bash
curl -X POST http://localhost:8080/api/functions/triggers/reports/created \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "publisherId": "publisher-id",
    "authorId": "author-id",
    "report": {
      "monthId": "2024#5",
      "active": true,
      "hours": 10,
      "courses": 2
    }
  }'
```

### Run Notification Cleanup
```bash
curl -X POST http://localhost:8080/api/functions/cron/cleanup-notifications \
  -H "Authorization: Bearer <admin-token>"
```

### Recalculate Publisher Status
```bash
curl -X POST http://localhost:8080/api/functions/http/recalculate-publishers-status \
  -H "Authorization: Bearer <token>"
```

## Implementation Notes

- All functions use the existing persistence layer and manager interfaces
- Month calculations use the same logic as Firebase functions
- Notification generation matches Firebase behavior
- Publisher activity status calculation follows the same rules
- All functions include proper error handling and logging