defmodule JiraClient do
  use Tesla

  @moduledoc """
  Documentation for `JiraClient`.
  """
  @url Application.fetch_env!(:jira_client, :url)

  plug(Tesla.Middleware.BaseUrl, @url)
  plug(Tesla.Middleware.JSON)

  plug(Tesla.Middleware.BasicAuth,
    username: Application.fetch_env!(:jira_client, :username),
    password: Application.fetch_env!(:jira_client, :password)
  )

  @doc false
  def search_tickets(project_id, startAt \\ 0, maxResult \\ 50) do
    params = [
      jql: "project=VADEV AND summary~\"#{project_id}\"",
      maxResult: maxResult,
      startAt: startAt
    ]
    request = get("/rest/api/2/search", query: params)
    response =
      case request do
        {:ok, response} -> response
        response -> response
      end
    case response do
      %{status: n} when n in [200] ->
        {:ok,
          %{
            "startAt" => response.body["startAt"],
            "maxResults" => response.body["maxResults"],
            "total" => response.body["total"],
            "issues" => Enum.map(response.body["issues"], & %{
                "key" => &1["key"],
                "status" => &1["fields"]["status"]["name"],
                "pipeline" => &1["fields"]["customfield_10901"],
                "updated" => &1["fields"]["updated"]
              }
            )
          }
        }

        {:error, error} ->
          {:error, error}

        _ ->
          {:error, {response.status, response.body}}
      end
  end

end
