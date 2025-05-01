package entities

import "time"

type Notification struct {
	Id          interface{} `json:"id" bson:"_id,omitempty"`
	SubjectId   string      `json:"subjectId" bson:"subjectId,omitempty"`
	Subject     Publisher   `json:"subject" bson:"subject,omitempty"`
	SubjectType string      `json:"subjectType" bson:"subjectType,omitempty"`
	AuthorId    string      `json:"authorId" bson:"authorId,omitempty"`
	Author      User        `json:"author" bson:"author,omitempty"`
	Date        time.Time   `json:"date" bson:"date,omitempty"`
	Type        int         `json:"type" bson:"type,omitempty"`
	Unread      bool        `json:"unread" bson:"unread,omitempty"`
	RealmId     string      `json:"realmId" bson:"realmId,omitempty"`
}
