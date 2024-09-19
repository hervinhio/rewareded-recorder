package persistence

import (
	"encoding/json"
)

// InterfaceToModel takes in a map[string]interface{} value and returns a value of type T.
// It converts the input map to a JSON string, then unmarshal it into the value of type T.
// If there is an error during the conversion, it returns the zero value of type T.
func InterfaceToModel[T any](value map[string]interface{}) T {
	var t T
	b, err := json.Marshal(value)
	if err != nil {
		return t
	}

	if json.Unmarshal(b, &t) != nil {
		return t
	}

	return t
}
