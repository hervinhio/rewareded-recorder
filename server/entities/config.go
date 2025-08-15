package entities

type Config struct {
	UseShortenedMonths     bool   `json:"useShortenedMonths" bson:"useShortenedMonths,omitempty"`
	Theme                  string `json:"theme" bson:"theme,omitempty"`
	UseServerXlsxGeneration bool   `json:"useServerXlsxGeneration" bson:"useServerXlsxGeneration,omitempty"`
	UserId                 string `json:"userId" bson:"userId,omitempty"`
	Realm                  string `json:"realmId" bson:"realmId,omitempty"`
}
