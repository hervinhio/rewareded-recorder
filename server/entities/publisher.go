package entities

import "time"

type Report struct {
	Id            interface{} `json:"id" bson:"_id,omitempty"`
	MonthId       string      `json:"monthId" bson:"monthId,omitempty"`
	Publications  int         `json:"publications" bson:"publications,omitempty"`
	Active        bool        `json:"active" bson:"active,omitempty"` /**Use if the publisher has preached during the month. @since November 1st, 2023 */
	Videos        int         `json:"videos" bson:"videos,omitempty"`
	Hours         int         `json:"hours" bson:"hours,omitempty"`
	Visits        int         `json:"visits" bson:"visits,omitempty"`
	Courses       int         `json:"courses" bson:"courses,omitempty"`
	Comment       string      `json:"comment" bson:"comment,omitempty"`
	Date          time.Time   `json:"date" bson:"date,omitempty"`
	Submitted     bool        `json:"submitted" bson:"submitted,omitempty"`
	IsFirstReport bool        `json:"isFirstReport" bson:"isFirstReport,omitempty"`
	IsAPReport    bool        `json:"isAPReport" bson:"isAPReport,omitempty"`
}

type Publisher struct {
	Id                   interface{} `json:"id" bson:"id,omitempty"`
	Name                 string      `json:"name" bson:"name,omitempty"`
	FirstName            string      `json:"firstName" bson:"firstName,omitempty"`
	LastName             string      `json:"lastName" bson:"lastName,omitempty"`
	GroupId              string      `json:"groupId" bson:"groupId,omitempty"`
	Address              string      `json:"address" bson:"address,omitempty"`
	Telephone            string      `json:"telephone" bson:"telephone,omitempty"`
	EmergencyPhone       string      `json:"emergencyPhone" bson:"emergencyPhone,omitempty"`
	EmailAddress         string      `json:"emailAddress" bson:"emailAddress,omitempty"`
	IsElder              bool        `json:"isElder" bson:"isElder,omitempty"`
	IsMinisterialServant bool        `json:"isMinisterialServant" bson:"isMinisterialServant,omitempty"`
	IsSpecialServant     bool        `json:"isSpecialServant" bson:"isSpecialServant,omitempty"`
	IsRegularPioneer     bool        `json:"isRegularPioneer" bson:"isRegularPioneer,omitempty"`
	ApMonths             []string    `json:"apMonths" bson:"apMonths,omitempty"`
	IsPermanentAP        bool        `json:"isPermanentAP" bson:"isPermanentAP,omitempty"`
	ActivityStatus       int         `json:"activityStatus" bson:"activityStatus,omitempty"`
	Reports              []Report    `json:"reports" bson:"reports,omitempty"`
	RealmId              string      `json:"realmId" bson:"realmId,omitempty"`
}
