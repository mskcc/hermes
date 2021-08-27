defmodule JiraClientTest do
  use ExUnit.Case
  doctest JiraClient
  import Tesla.Mock

  setup do
    mock(fn
      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body:
            %{
              "expand" => "schema,names",
              "startAt" => 0,
              "maxResults" => 250,
              "total" => 1,
              "issues" => [
                %{
                  "expand" => "operations,versionedRepresentations,editmeta,changelog,renderedFields",
                  "id" => "48846",
                  "self" => "http://jira.mskcc.org:8090/rest/api/2/issue/48846",
                  "key" => "VA-686",
                  "fields" => %{
                    "issuetype" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/issuetype/3",
                      "id" => "3",
                      "description" => "A task that needs to be done.",
                      "iconUrl" => "http://jira.mskcc.org:8090/secure/viewavatar?size=xsmall&avatarId=10518&avatarType=issuetype",
                      "name" => "Task",
                      "subtask" => false,
                      "avatarId"=> 10518
                    },
                    "components" => [],
                    "timespent" => nil,
                    "timeoriginalestimate" => nil,
                    "description" => "Description",
                    "project" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/project/11212",
                      "id" => "11212",
                      "key" => "VA",
                      "name" => "Voyager Argos",
                      "avatarUrls" => %{}
                    },
                    "fixVersions" => [],
                    "aggregatetimespent" => nil,
                    "resolution" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/resolution/10100",
                      "id" => "10100",
                      "description" => "This issue won't be actioned.",
                      "name" => "Won't Do"
                    },
                    "customfield_10500" => nil,
                    "customfield_10501" => nil,
                    "customfield_10700" => nil,
                    "customfield_10800" => nil,
                    "customfield_10504" => nil,
                    "customfield_10900" => "Waiting for QC",
                    "aggregatetimeestimate" => nil,
                    "customfield_10901" => "argos_v1.1.2",
                    "customfield_10506" => nil,
                    "resolutiondate" => "2020-12-10T17:09:22.000-0500",
                    "customfield_10509" => "0|i06agj:",
                    "workratio" => -1,
                    "summary" => "08944_B",
                    "lastViewed" => nil,
                    "watches" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/issue/VA-686/watchers",
                      "watchCount" => 1,
                      "isWatching" => true
                    },
                    "creator" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/user?username=s",
                      "name" => "s",
                      "key" => "s",
                      "emailAddress" => "email@gmail.com",
                      "avatarUrls" => %{},
                      "displayName" => "Scruffy Scruffington",
                      "active" => true,
                      "timeZone" => "America/New_York"
                    },
                    "subtasks" => [],
                    "created" => "2020-12-09T15:19:13.000-0500",
                    "reporter" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/user?username=s",
                      "name" => "s",
                      "key" => "s",
                      "emailAddress" => "email@gmail.com",
                      "avatarUrls" => %{
                      },
                      "displayName" => "Scruffy Scruffington",
                      "active" => true,
                      "timeZone" => "America/New_York"
                    },
                    "aggregateprogress" => %{
                      "progress" => 0,
                      "total" => 0
                    },
                    "priority" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/priority/3",
                      "iconUrl" => "http://jira.mskcc.org:8090/images/icons/priorities/major.svg",
                      "name" => "Major",
                      "id" => "3"
                    },
                    "labels" => [
                      "IMPACT468"
                    ],
                    "environment" => nil,
                    "timeestimate" => nil,
                    "aggregatetimeoriginalestimate" => nil,
                    "versions" => [],
                    "duedate" => nil,
                    "progress" => %{
                      "progress" => 0,
                      "total" => 0
                    },
                    "issuelinks" => [],
                    "votes" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/issue/VA-686/votes",
                      "votes" => 0,
                      "hasVoted" => false
                    },
                    "assignee" => nil,
                    "updated" => "2020-12-10T17:09:22.000-0500",
                    "status" => %{
                      "self" => "http://jira.mskcc.org:8090/rest/api/2/status/10617",
                      "description" => "Not for CI",
                      "iconUrl" => "http://jira.mskcc.org:8090/images/icons/statuses/generic.png",
                      "name" => "Not for CI",
                      "id" => "10617",
                      "statusCategory" => %{
                        "self" => "http://jira.mskcc.org:8090/rest/api/2/statuscategory/3",
                        "id" => 3,
                        "key" => "done",
                        "colorName" => "green",
                        "name" => "Done"
                      }
                    }
                  }
                }
              ]
            }
          # ]
        }
    end)
    :ok
  end

  test "search tickets " do
    response = JiraClient.search_tickets("VA", "08944_B")
    assert elem(response, 0) == :ok
    assert length(elem(response, 1)["issues"]) == 1
    assert Enum.at(elem(response, 1)["issues"], 0)["key"] == "VA-686"
    assert Enum.at(elem(response, 1)["issues"], 0)["pipeline"] == "argos_v1.1.2"
    assert Enum.at(elem(response, 1)["issues"], 0)["status"] == "Not for CI"
    assert Enum.at(elem(response, 1)["issues"], 0)["summary"] == "08944_B"
    assert Enum.at(elem(response, 1)["issues"], 0)["updated"] == "2020-12-10T17:09:22.000-0500"
    assert elem(response, 1)["maxResults"] == 250
    assert elem(response, 1)["startAt"] == 0
    assert elem(response, 1)["total"] == 1
  end

end
