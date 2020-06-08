defmodule LimsClient do
  use Tesla

  @type manifest_map :: %{
          base_set: String.t(),
          cmo_patient_id: String.t(),
          cf_dna_2d_barcode: String.t(),
          cmo_sample_class: String.t(),
          cmo_sample_name: String.t(),
          collection_year: String.t(),
          igo_id: String.t(),
          investigator_sample_id: String.t(),
          libraries: String.t(),
          onco_tree_code: String.t(),
          preservation: String.t(),
          qc_reports: String.t(),
          sample_name: String.t(),
          sample_origin: String.t(),
          sex: String.t(),
          species: String.t(),
          speciman_type: String.t(),
          tissue_location: String.t(),
          tumor_or_normal: String.t()
        }

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

  @doc false
  #@spec fetch_samples_by_request(String.t()) :: any 
  def fetch_sample_ids_by_request(request_id) do
    {:ok, response} = get("/api/getRequestSamples?" <> "request=#{request_id}")
    
    Enum.map(response.body["samples"], &(&1["igoSampleId"]))
  end

  def build_csv_of_sample_metadata_from_request_id(request_id) do
    sample_groups = fetch_sample_ids_by_request(request_id) 
                    |> Enum.chunk_every(10)

    #{:ok, file} = File.open("/Users/fraihaa/Dev/seqosystem/sample_metadata", [:write])
    NimbleCSV.define(MyParser, separator: "\t", escape: "\"")

    Enum.each(sample_groups, fn samples ->
      case LimsClient.fetch_sample_manifests(samples) do
        {:ok, body} ->
          IO.inspect(body)
          values = Enum.map(body, &(&1 |> Map.drop(["libraries", "qc_reports"]) |> Map.values))
          MyParser.dump_to_stream(values)
          |> Stream.into(File.stream!("append.csv", [:append, :utf8]))
          |> Stream.run
        _ ->  IO.inspect("Error with #{samples}")
      end
    end)
  end

  """
  defp tocsv(map) do
    File.write!("test.csv", 
       map
       |> Enum.map(Enum.join(Tuple.to_list(&1), ?,))
       |> Enum.join("\n"))
  end
  """

  @doc """
  Fetch Samples

  ## Examples
      iex> LimsClient.fetch_sample_manifests(["123"])
      {:ok, [%{"bait_set" => "MSK-ACCESS-v1_0-probesAllwFP_hg37_sort-BAITS", "cf_dna_2d_barcode" => "803555551", "cmo_patient_id" => "C-69D8HW", "cmo_sample_class" => "Unknown Tumor", "cmo_sample_name" => "C-69555-L555-d", "collection_year" => "", "igo_id" => "06555_A_555", "investigator_sample_id" => "MSK-MB-0555-CF1-msk555555-p", "libraries" => [%{"barcodeId" => "IDTdual555", "barcodeIndex" => "CTTGTCGA-GAACATCG", "captureConcentrationNm" => "8.771929825", "captureInputNg" => "500.0000000250001", "captureName" => "Pool-55555_AG-D4_1", "dnaInputNg" => 18.25, "libraryConcentrationNgul" => 57, "libraryIgoId" => "06555_A_555_1_1", "libraryVolume" => 35, "runs" => [%{"fastqs" => ["/path/to/Sample_MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555/MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555_S39_R1_001.fastq.gz", "/path/to/Sample_MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555/MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555_S39_R2_001.fastq.gz"], "flowCellId" => "H73G55555", "flowCellLanes" => [1, 2, 3, 4], "readLength" => "101/8/8/101", "runDate" => "2020-02-20", "runId" => "DIANA_5555", "runMode" => "NovaSeq S4"}]}], "onco_tree_code" => "BREAST", "preservation" => "EDTA-Streck", "qc_reports" => [%{"IGORecommendation" => "Passed", "comments" => "", "investigatorDecision" => "Continue processing", "qcReportType" => "LIBRARY"}], "sample_name" => "MSK-MB-0555-CF1-msk555555-p", "sample_origin" => "Whole Blood", "sex" => "F", "species" => "Human", "speciman_type" => nil, "tissue_location" => "", "tumor_or_normal" => "Tumor"}]}
  """
  @spec fetch_sample_manifests(list) :: {:ok, manifest_map} | {:error, integer, String.t()}
  def fetch_sample_manifests(samples) do
    query =
      samples
      |> Enum.map(&"igoSampleId=#{&1}")
      |> Enum.join("&")

    get("/api/getSampleManifest?" <> query)
    |> process_response
  end

  @spec update_keys(nonempty_list(String.t())) :: nonempty_list(String.t())
  defp update_keys([head | tail]) do
    [update_keys(head) | update_keys(tail)]
  end

  @spec update_keys(list) :: list
  defp update_keys([]), do: []

  @spec update_keys(map) :: map
  defp update_keys(response_body) do
    for {orig_key, new_key} <- @json_key_map, into: %{}, do: {new_key, response_body[orig_key]}
  end

  @spec process_response({:ok, Tesla.Env.t()}) ::
          {:ok, manifest_map} | {:error, integer, String.t()}
  defp process_response({:ok, response}) do
    case response do
      %{status: 200} ->
        {:ok, response.body |> update_keys}

      %{status: 201} ->
        {:ok, response.body |> update_keys}

      _ ->
        {:error, response.status, response.body}
    end
  end

  @spec process_response({:error, Tesla.Env.t()}) :: {:error, String.t()}
  defp process_response({:error, message}) do
    {:error, message}
  end
end
