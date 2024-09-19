package persistence

import (
	"testing"
)

type BasicStruct struct {
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	MiddleName string `json:"middleName"`
	Age        int    `json:"age"`
	IsStudent  bool   `json:"isStudent"`
}

type MaritalStatus struct {
	IsMarried        bool `json:"isMarried"`
	NumberOfChildren int  `json:"numberOfChildren"`
}

type Job struct {
	Position string
	Salary   int
}

type CoumpoundStruct struct {
	BasicStruct
	MaritalStatus MaritalStatus `json:"maritalStatus"`
	PreviousJobs  map[string]Job
}

func TestInterfaceToModel(t *testing.T) {

	t.Run("should convert to a basic struct", func(t *testing.T) {
		input := map[string]interface{}{
			"firstName":  "Alex",
			"lastName":   "Mwamba",
			"middleName": "Mutombo",
			"age":        32,
			"isStudent":  false,
		}
		output := InterfaceToModel[BasicStruct](input)

		if output.FirstName != input["firstName"] ||
			output.LastName != input["lastName"] ||
			output.MiddleName != input["middleName"] ||
			output.Age != input["age"] ||
			output.IsStudent != input["isStudent"] {

			t.Fail()
		}
	})

	t.Run("should convert to a compound struct", func(t *testing.T) {
		input := map[string]interface{}{
			"firstName":  "Alex",
			"lastName":   "Mwamba",
			"middleName": "Mutombo",
			"age":        32,
			"isStudent":  false,
			"maritalStatus": map[string]interface{}{
				"isMarried":        true,
				"numberOfChildren": 3,
			},
			"previousJobs": map[string]interface{}{
				"Accountant": map[string]interface{}{
					"salary":   2000,
					"position": "Senior accountant",
				},
				"Teacher": map[string]interface{}{
					"salary":   1500,
					"position": "Replacement teacher",
				},
			},
		}

		output := InterfaceToModel[CoumpoundStruct](input)
		accountantJob := output.PreviousJobs["Accountant"]

		if output.FirstName != input["firstName"] ||
			output.LastName != input["lastName"] ||
			output.MiddleName != input["middleName"] ||
			output.Age != input["age"] ||
			output.IsStudent != input["isStudent"] ||
			!output.MaritalStatus.IsMarried ||
			output.MaritalStatus.NumberOfChildren != 3 ||
			accountantJob.Position != "Senior accountant" ||
			accountantJob.Salary != 2000 {

			t.Fail()
		}
	})

	t.Run("should return zero value of invalid fields", func(t *testing.T) {
		input := map[string]interface{}{
			"firstName": "Alex",
			"lastName":  "Mwamba",
			"age":       "32",
		}

		output := InterfaceToModel[BasicStruct](input)

		if output != (BasicStruct{
			FirstName: "Alex",
			LastName:  "Mwamba",
			Age:       0,
		}) {
			t.Fail()
		}
	})

	t.Run("should return zero value if input is an empty map", func(t *testing.T) {
		invalidInput := map[string]interface{}{}

		output := InterfaceToModel[BasicStruct](invalidInput)

		if output != (BasicStruct{}) {
			t.Fail()
		}
	})
}
