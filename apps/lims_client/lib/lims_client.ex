defmodule LimsClient do
  use Tesla, only: ~w(get)a

  plug(Tesla.Middleware.BaseUrl, Application.fetch_env!(:lims_client, :url))

  plug(Tesla.Middleware.BasicAuth,
    username: Application.fetch_env!(:lims_client, :username),
    password: Application.fetch_env!(:lims_client, :password)
  )

  plug(Tesla.Middleware.DecodeJson)

  @moduledoc """
  Documentation for `LimsClient`.
  """

  @doc """
  Get Sample Manifest

  ## Examples

      iex> result = LimsClient.get_sample_manifest("1000")
      ...> with {:ok, %Tesla.Env{}} <- result, do: :passed

  """
  def get_sample_manifest(sample_id) when is_binary(sample_id),
    do: get_sample_manifest([sample_id])

  def get_sample_manifest(sample_id) when is_list(sample_id) do
    get("/api/getSampleManifest")
  end
end
