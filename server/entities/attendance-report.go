package entities

import "time"

type AttendanceRecord struct {
  Date             time.Time   `json:"date" bson:"date,omitempty"`
  Zoom             int         `json:"zoom" bson:"zoom,omitempty"`
  InPerson         int         `json:"inPerson" bson:"inPerson,omitempty"`
  MonthId          string      `json:"monthId" bson:"monthId,omitempty"`
  IsMidweekMeeting bool        `json:"isMidweekMeeting" bson:"isMidweekMeeting,omitempty"`
  Id               interface{} `json:"id" bson:"_id,omitempty"`
  RealmId          string      `json:"realmId" bson:"realmId,omitempty"`
}
