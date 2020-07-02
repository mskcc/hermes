defmodule AccessTrackerClientTest do
  use ExUnit.Case
  doctest AccessTrackerClient
  import Tesla.Mock

  setup do
    mock(fn
      %{method: :post} ->
        %Tesla.Env{
          status: 200,
          body: %{
            "response" => %{
              "token" => "42"
            },
            "messages" => [
              %{
                "code" => "0",
                "message" => "OK"
              }
            ]
          }
        }

      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body: %{
            "response" => %{
              "dataInfo" => %{
                "database" => "ACCESS_Tracker",
                "layout" => "samplesAPI",
                "table" => "Samples_Table",
                "totalRecordCount" => 811,
                "foundCount" => 811,
                "returnedCount" => 100
              },
              "data" => [
                %{
                  "fieldData" => %{
                    "TubeID" => "0736_P",
                    "MRN" => "non-MSK patient",
                    "Sample_Status" => "On hold",
                    "Study_Code" => "JRF-oicr",
                    "IGO_ID_Sequencing" => "10314_19",
                    "IGO_ID_Extraction" => "",
                    "Request_ID" => "10314",
                    "Project_ID" => "10314",
                    "UID" => "13HVXS40PIVV0M1PQL4KXZ0",
                    "recordID_Internal" => 3015
                  },
                  "portalData" => %{},
                  "recordId" => "3015",
                  "modId" => "22"
                },
                %{
                  "fieldData" => %{
                    "TubeID" => "0660_P",
                    "MRN" => "non-MSK patient",
                    "Sample_Status" => "On hold",
                    "Study_Code" => "JRF-oicr",
                    "IGO_ID_Sequencing" => "10314_16",
                    "IGO_ID_Extraction" => "",
                    "Request_ID" => "10314",
                    "Project_ID" => "10314",
                    "UID" => "13HVXS40PIVV0M1R0IXZZSS",
                    "recordID_Internal" => 3016
                  },
                  "portalData" => %{},
                  "recordId" => "3016",
                  "modId" => "15"
                },
                %{
                  "fieldData" => %{
                    "TubeID" => "0747_P",
                    "MRN" => "non-MSK patient",
                    "Sample_Status" => "On hold",
                    "Study_Code" => "JRF-oicr",
                    "IGO_ID_Sequencing" => "10314_7",
                    "IGO_ID_Extraction" => "",
                    "Request_ID" => "10314",
                    "Project_ID" => "10314",
                    "UID" => "13HVXS40PIVV0M1SAGRF1ML",
                    "recordID_Internal" => 3017
                  },
                  "portalData" => %{},
                  "recordId" => "3017",
                  "modId" => "15"
                }
              ]
            }
          }
        }
    end)

    :ok
  end
end
