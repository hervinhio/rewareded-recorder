package entities

type Stats struct {
	Gone              int    `json:"gone" bson:"gone,omitempty"`
	NewComers         int    `json:"new_comers" bson:"new_comers,omitempty"`
	Disfellowshiped   int    `json:"disfellowshiped" bson:"disfellowshiped,omitempty"`
	NewPublishers     int    `json:"newPublishers" bson:"newPublishers,omitempty"`
	UnderRestrictions int    `json:"underRestrictions" bson:"underRestrictions,omitempty"`
	Baptized          int    `json:"baptized" bson:"baptized,omitempty"`
	Blamed            int    `json:"blamed" bson:"blamed,omitempty"`
	Families          int    `json:"families" bson:"families,omitempty"`
	RealmId           string `json:"realmId" bson:"realmId,omitempty"`
}
