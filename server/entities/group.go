package entities

type Group struct {
  Name       string      `json:"name" bson:"name"`
  GroupId    string      `json:"groupId" bson:"groupId,omitempty"`
  RealmId    string      `json:"realmId" bson:"realmId,omitempty"`
  Publishers []Publisher `json:"publishers" bson:"publishers,omitempty"`
  OverseerId string      `json:"overseerId" bson:"overseerId,omitempty"`
}
