package entities

import "time"

type Report struct {
  id            string
  publisherId   string
  monthId       string
  publications  int
  active        bool /**Use if the publisher has preached during the month. @since November 1st, 2023 */
  videos        int
  hours         int
  visits        int
  courses       int
  comment       string
  date          time.Time
  submitted     bool
  isFirstReport bool
  isAPReport    bool
}

type Publisher struct {
  Id                   string   `json:"id" bson:"_id,omitempty"`
  Name                 string   `json:"name" bson:"name,omitempty"`
  FirstName            string   `json:"firstName" bson:"firstName,omitempty"`
  LastName             string   `json:"lastName" bson:"lastName,omitempty"`
  GroupId              string   `json:"groupId" bson:"groupId,omitempty"`
  Address              string   `json:"address" bson:"address,omitempty"`
  Telephone            string   `json:"telephone" bson:"telephone,omitempty"`
  EmergencyPhone       string   `json:"emergencyPhone" bson:"emergencyPhone,omitempty"`
  EmailAddress         string   `json:"emailAddress" bson:"emailAddress,omitempty"`
  IsElder              bool     `json:"isElder" bson:"isElder,omitempty"`
  IsMinisterialServant bool     `json:"isMinisterialServant" bson:"isMinisterialServant,omitempty"`
  IsSpecialServant     bool     `json:"isSpecialServant" bson:"isSpecialServant,omitempty"`
  IsRegularPioneer     bool     `json:"isRegularPioneer" bson:"isRegularPioneer,omitempty"`
  ApMonths             []string `json:"apMonths" bson:"apMonths,omitempty"`
  IsPermanentAP        bool     `json:"isPermanentAP" bson:"isPermanentAP,omitempty"`
  ActivityStatus       int      `json:"activityStatus" bson:"activityStatus,omitempty"`
  Reports              []Report `json:"reports" bson:"reports,omitempty"`
  RealmId              string   `json:"realmId" bson:"realmId,omitempty"`
}
