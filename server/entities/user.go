package entities

type User struct {
	Id          string `json:"id" bson:"_id,omitempty"`
	DisplayName string `json:"displayName" bson:"displayName,omitempty"`
	Email       string `json:"email" bson:"email,omitempty"`
	PublisherId string `json:"publisherId" bson:"publisherId,omitempty"`
	Admin       bool   `json:"admin" bson:"admin,omitempty"`
	Validated   bool   `json:"validated" bson:"validated,omitempty"`
	GroupId     string `json:"groupId" bson:"groupId,omitempty"`
	PhotoURL    string `json:"photoUrl" bson:"photoUrl,omitempty"`
	PhoneNumber string `json:"phoneNumber" bson:"phoneNumber,omitempty"`
	RealmId     string `json:"realmId" bson:"realmId,omitempty"`
	IsSuperUser bool   `json:"isSuperUser" bson:"isSuperUser,omitempty"`
}
