package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hervinhio/rewarded-recorder/entities"
	"github.com/hervinhio/rewarded-recorder/persistence"
	"github.com/hervinhio/rewarded-recorder/persistence/pagination"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
)

type mockPersistenceManager struct {
	record entities.AttendanceRecord
	err    error
}

func (m mockPersistenceManager) InsertOne(record entities.AttendanceRecord) (entities.AttendanceRecord, error) {
	return m.record, m.err
}

func (m mockPersistenceManager) UpdateOne(criteria entities.AttendanceRecord, update entities.AttendanceRecord) (entities.AttendanceRecord, error) {
	return entities.AttendanceRecord{}, fmt.Errorf("not implemented")
}

func (m mockPersistenceManager) DeleteOne(criteria entities.AttendanceRecord) (int64, error) {
	return 0, fmt.Errorf("not implemented")
}

func (m mockPersistenceManager) FindOne(criteria entities.AttendanceRecord) (entities.AttendanceRecord, error) {
	return entities.AttendanceRecord{}, fmt.Errorf("not implemented")
}

func (m mockPersistenceManager) FindMany(criteria entities.AttendanceRecord, pagination pagination.Pagination) ([]entities.AttendanceRecord, error) {
	return nil, fmt.Errorf("not implemented")
}

var manager mockPersistenceManager

func setup() {
	persistence.AllManagers.Attendance = &manager
}

func TestAttendanceAPI(t *testing.T) {
	t.Run("TestHandleCreateAttendanceRecord", func(t *testing.T) {
		setup()
		testCases := []struct {
			name         string
			data         string
			mockResponse interface{}
			mockError    error
			expectStatus int
			expectBody   string
		}{
			{
				name: "SuccessCase",
				data: `{}`,
				mockResponse: entities.AttendanceRecord{
					Id: "1",
				},
				mockError:    nil,
				expectStatus: http.StatusOK,
				expectBody:   "{\"id\":\"1\"}",
			},
			{
				name: "UnmarshalErrorCase",
				data: `invalid_json`,
				mockResponse: entities.AttendanceRecord{
					Id: "",
				},
				mockError:    nil,
				expectStatus: http.StatusBadRequest,
				expectBody:   "{ \"error\" : \"\"}",
			},
			{
				name: "InsertionError",
				data: `{}`,
				mockResponse: entities.AttendanceRecord{
					Id: "1",
				},
				mockError:    errors.New("Insertion error"),
				expectStatus: http.StatusInternalServerError,
				expectBody:   "{ \"error\" : \"Insertion error\"}",
			},
		}

		for _, tc := range testCases {
			manager.record = tc.mockResponse.(entities.AttendanceRecord)
			manager.err = tc.mockError

			t.Run(tc.name, func(t *testing.T) {
				req, _ := http.NewRequest("POST", "/testURL", bytes.NewBuffer([]byte(tc.data)))
				req = req.WithContext(context.WithValue(req.Context(), "realmId", "1"))
				rr := httptest.NewRecorder()
				handler := http.HandlerFunc(HandleCreateAttendanceRecord)
				handler.ServeHTTP(rr, req)
				status := rr.Code

				assert.Equal(t, tc.expectStatus, status)

				var expectedObj map[string]interface{}
				var actualObj map[string]interface{}
				err := json.Unmarshal([]byte(tc.expectBody), &expectedObj)
				if err != nil {
					t.Errorf("Error unmarshaling expected body: %v", err)
				}
				err = json.Unmarshal([]byte(rr.Body.String()), &actualObj)
				if err != nil {
					t.Errorf("Error unmarshaling actual body: %v", err)
				}

				assert.Equal(t, expectedObj["id"], actualObj["id"])
			})
		}
	})

	t.Run("TestHandleGetAttendanceRecords", func(t *testing.T) {
		setup()
		testCases := []struct {
			name         string
			data         string
			mockResponse interface{}
			mockError    error
			expectStatus int
			expectBody   string
		}{
			{
				name: "SuccessCase",
				data: `{}`,
				mockResponse: []entities.AttendanceRecord{
					{
						Id:      "1",
						RealmId: "John Doe",
					},
					{
						Id:      "2",
						RealmId: "Jane Doe",
					},
				},
				mockError:    nil,
				expectStatus: http.StatusOK,
				expectBody:   `[{"id":"1","name":"John Doe"},{"id":"2","name":"Jane Doe"}]`,
			},
			{
				name:         "EmptyRecords",
				data:         `{}`,
				mockResponse: []entities.AttendanceRecord{},
				mockError:    nil,
				expectStatus: http.StatusOK,
				expectBody:   `[]`,
			},
			{
				name:         "ErrorCase",
				data:         `{}`,
				mockResponse: []entities.AttendanceRecord{},
				mockError:    errors.New("Retrieval error"),
				expectStatus: http.StatusInternalServerError,
				expectBody:   "{ \"error\" : \"Retrieval error\"}",
			},
		}

		for _, tc := range testCases {
			manager.record = tc.mockResponse.([]entities.AttendanceRecord)
			manager.err = tc.mockError

			t.Run(tc.name, func(t *testing.T) {
				req, _ := http.NewRequest("GET", "/testURL", bytes.NewBuffer([]byte(tc.data)))
				req = req.WithContext(context.WithValue(req.Context(), "realmId", "1"))
				rr := httptest.NewRecorder()
				handler := http.HandlerFunc(HandleGetAttendanceRecords)
				handler.ServeHTTP(rr, req)
				status := rr.Code

				assert.Equal(t, tc.expectStatus, status)

				var expectedObj []map[string]interface{}
				var actualObj []map[string]interface{}
				err := json.Unmarshal([]byte(tc.expectBody), &expectedObj)
				if err != nil {
					t.Errorf("Error unmarshaling expected body: %v", err)
				}
				err = json.Unmarshal([]byte(rr.Body.String()), &actualObj)
				if err != nil {
					t.Errorf("Error unmarshaling actual body: %v", err)
				}

				assert.Equal(t, len(expectedObj), len(actualObj))

				for index := range expectedObj {
					assert.Equal(t, expectedObj[index]["id"], actualObj[index]["id"])
				}
			})
		}
	})
}
