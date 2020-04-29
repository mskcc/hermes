defmodule LimsClient do
  use Tesla

  @json_key_map %{
    "baitSet" => "bait_set",
    "cmoPatientId" => "cmo_patient_id",
    "cfDNA2dBarcode" => "cf_dna_2d_barcode",
    "cmoSampleClass" => "cmo_sample_class",
    "cmoSampleName" => "cmo_sample_name",
    "collectionYear" => "collection_year",
    "igoId" => "igo_id",
    "investigatorSampleId" => "investigator_sample_id",
    "libraries" => "libraries",
    "oncoTreeCode" => "onco_tree_code",
    "preservation" => "preservation",
    "qcReports" => "qc_reports",
    "sampleName" => "sample_name",
    "sampleOrigin" => "sample_origin",
    "sex" => "sex",
    "species" => "species",
    "specimentType" => "speciman_type",
    "tissueLocation" => "tissue_location",
    "tumorOrNormal" => "tumor_or_normal"
  }

  @moduledoc """
  Documentation for `LimsClient`.
  """
  @url Application.fetch_env!(:lims_client, :url)

  plug(Tesla.Middleware.BaseUrl, @url)
  plug(Tesla.Middleware.JSON)

  plug(Tesla.Middleware.BasicAuth,
    username: Application.fetch_env!(:lims_client, :username),
    password: Application.fetch_env!(:lims_client, :password)
  )

  @doc """
  Fetch Samples

  ## Examples

      iex> result = LimsClient.fetch_sample_manifests([])
      ...> with {:ok, %{}} <- result, do: :passed

  """
  def fetch_sample_manifests(samples) do
    query =
      samples
      |> Enum.map(&"igoSampleId=#{&1}")
      |> Enum.join("&")

    get("/api/getSampleManifest?" <> query)
    |> process_response
  end

  defp update_keys([head | tail]) do
    [update_keys(head) | update_keys(tail)]
  end

  defp update_keys([]), do: []

  defp update_keys(map) do
    for {orig_key, new_key} <- @json_key_map, into: %{}, do: {new_key, map[orig_key]}
  end

  @doc false
  defp process_response(env) do
    {:ok, response} = env

    case response do
      %{status: 200} ->
        {:ok, response.body |> update_keys}

      %{status: 201} ->
        {:ok, response.body |> update_keys}

      _ ->
        {:error, response.status, response.body}
    end
  end
end
