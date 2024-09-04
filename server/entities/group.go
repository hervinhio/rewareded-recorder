package entities

type Group struct {
  Name       string      `json:"name" bson:"name"`
  RealmId    string      `json:"realmId" bson:"realmId,omitempty"`
  Publishers []Publisher `json:"publishers" bson:"publishers,omitempty"`
}
