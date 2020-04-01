defmodule AccessTrackerClient do
  @moduledoc """
  Documentation for `AccessTrackerClient`.
  """
  @url Application.fetch_env!(:access_tracker_client, :url)

  @doc """
  Fetch Samples

  ## Examples

      iex> result = AccessTrackerClient.fetch_samples()
      ...> with {:ok, %{}} <- result, do: :passed

  """
  def fetch_samples do
    Tesla.get(client, "/fmi/data/v1/databases/ACCESS_Tracker/layouts/samplesAPI/records")
    |> process_response
  end

  @doc false
  defp process_response(env) do
    {:ok, response} = env

    case response do
      %{status: 200} ->
        {:ok, response.body["response"]}

      %{status: 201} ->
        {:ok, response.body["response"]}

      _ ->
        {:error, response.status, response.body}
    end
  end

  defp get_auth_token do
    username = Application.fetch_env!(:access_tracker_client, :username)
    password = Application.fetch_env!(:access_tracker_client, :password)

    auth_client =
      Tesla.client([
        {Tesla.Middleware.BaseUrl, @url},
        {Tesla.Middleware.Headers, [{"content-type", "application/json"}]},
        Tesla.Middleware.JSON,
        {Tesla.Middleware.BasicAuth, username: username, password: password}
      ])

    {:ok, env} = Tesla.post(auth_client, "/fmi/data/v1/databases/ACCESS_Tracker/sessions", "")
    env.body["response"]["token"]
  end

  defp client do
    token = get_auth_token

    middleware = [
      {Tesla.Middleware.BaseUrl, @url},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers, [{"Authorization", "Bearer " <> token}]}
    ]

    Tesla.client(middleware)
  end
end
