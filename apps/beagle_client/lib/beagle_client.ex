defmodule BeagleClient do
  @moduledoc """
  Documentation for `BeagleClient`.
  """

  @doc """
  Send notification

  ## Examples

      iex> result = BeagleClient.fetch_pipelines(client)
      ...> with {_, %Tesla.Env{}} <- result, do: :passed
      iex> :passed
  """
  def fetch_pipelines(client) do
    request = client |> Tesla.get("/v0/run/pipelines/", query: [page: 1, per_page: 100])

    handle_response(request)
  end

  @doc false
  def fetch_auth_token(username, password), do: fetch_auth_token(client(), username, password)

  def fetch_auth_token(client, username, password) do
    request =
      client
      |> Tesla.post("/api-token-auth/", Jason.encode!(%{username: username, password: password}))

    handle_response(request)
  end

  @doc false
  def validate_auth_token(token), do: validate_auth_token(client(), token)

  def validate_auth_token(client, token) do
    request =
      client
      |> Tesla.post("/api-token-verify/", Jason.encode!(%{token: token}))

    handle_response(request)
  end

  @doc false
  def refresh_auth_token(token), do: refresh_auth_token(client(), token)

  def refresh_auth_token(client, token) do
    request =
      client
      |> Tesla.post("/api-token-refresh/", Jason.encode!(%{refresh: token}))

    handle_response(request)
  end

  def client(token) when is_binary(token) do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers,
       [{"authorization", "Bearer: " <> token}, {"content-type", "application/json"}]}
    ]

    Tesla.client(middleware)
  end

  def client do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers, [{"content-type", "application/json"}]}
    ]

    Tesla.client(middleware)
  end

  defp handle_response(request) do
    response =
      case request do
        {:ok, response} -> response
        response -> response
      end

    case response do
      %{status: n} when n in [200, 201] ->
        {:ok, response.body}

      {:error, error} ->
        {:error, error}

      _ ->
        {:error, {response.status, response.body}}
    end
  end
end
