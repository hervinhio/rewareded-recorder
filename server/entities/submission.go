package entities

import "time"

type SubmissionData struct {
  Sheets  int `json:"sheets" bson:"sheets,omitempty"`
  Hours   int `json:"hours" bson:"hours,omitempty"`
  Studies int `json:"studies" bson:"studies,omitempty"`
}

type Submission struct {
  Date              time.Time      `bson:"date" bson:",omitempty"`
  All               SubmissionData `bson:"all" bson:"all,omitempty"`
  publishers        SubmissionData `bson:"publishers" bson:"publishers,omitempty"`
  AuxiliaryPioneers SubmissionData `json:"auxiliaryPioneers" bson:"auxiliaryPioneers,omitempty"`
  RegularPioneers   SubmissionData `json:"regularPioneers" bson:"regularPioneers,omitempty"`
  RealmId           string         `json:"realmId" bson:"realmId,omitempty"`
}
