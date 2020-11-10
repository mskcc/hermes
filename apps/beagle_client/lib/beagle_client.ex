defmodule BeagleClient do
  use Tesla

  plug(Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url))

  plug(Tesla.Middleware.BasicAuth,
    username: Application.fetch_env!(:beagle_client, :username),
    password: Application.fetch_env!(:beagle_client, :password)
  )

  plug(Tesla.Middleware.DecodeJson)

  @moduledoc """
  Documentation for `BeagleClient`.
  """

  @doc """
  Send notification

  ## Examples

      iex> result = BeagleClient.fetch_pipelines
      ...> with {_, %Tesla.Env{}} <- result, do: :passed
      iex> :passed
  """
  def fetch_pipelines() do
    request = get("/v0/run/pipelines/", query: [page: 1, per_page: 100])

    handle_response(request)
  end

  @doc false
  def fetch_auth_token(username, password) do
    request =
      post("/api-token-auth/", Jason.encode!(%{username: username, password: password}),
        headers: [{"content-type", "application/json"}]
      )

    handle_response(request)
  end

  @doc false
  def validate_auth_token(token) do
    request =
      post("/api-token-verify/", Jason.encode!(%{token: token}),
        headers: [{"content-type", "application/json"}]
      )

    handle_response(request)
  end

  @doc false
  def refresh_auth_token(token) do
    request =
      post("/api-token-refresh/", Jason.encode!(%{refresh: token}),
        headers: [{"content-type", "application/json"}]
      )

    handle_response(request)
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
