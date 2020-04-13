defmodule LimsClient do
  use Tesla

  @moduledoc """
  Documentation for `LimsClient`.
  """
  @url Application.fetch_env!(:lims_client, :url)

  plug Tesla.Middleware.BaseUrl, @url
  plug Tesla.Middleware.JSON

  plug Tesla.Middleware.BasicAuth, username: Application.fetch_env!(:lims_client, :username), password: Application.fetch_env!(:lims_client, :password)

  @doc """
  Fetch Samples

  ## Examples

      iex> result = LimsClient.fetch_sample_manifests([])
      ...> with {:ok, %{}} <- result, do: :passed

  """
  def fetch_sample_manifests(samples) do
    query = samples
      |> Enum.map(&("igoSampleId=#{&1}"))
      |> Enum.join("&")

    get("/api/getSampleManifest?" <> query)
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
end
