defmodule MetadataEtl.LimsFetchSamples do
  use Oban.Worker,
    queue: :lims_fetch_samples,
    priority: 3,
    max_attempts: 3,
    tags: [],
    unique: [period: 3600]

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"request" => request_name}}) do
    process_requests(request_name, LimsClient.fetch_samples_by_request(request_name))
  end

  defp process_requests(request_name, {:ok, %{"sample_ids" => sample_ids, "recipe" => recipe}}) do
    {:ok, assay} =
      Domain.Projects.find_or_create_assay(%{
        "name" => recipe
      })

    {:ok, request} =
      Domain.Projects.find_or_create_request(%{
        "name" => request_name,
        "assay_id" => assay.id
      })

    sample_ids
    |> Enum.map(fn sample ->
      %{sample: sample, request_id: request.id}
      |> MetadataEtl.LimsFetchSample.new()
      |> Oban.insert()
    end)

    :ok
  end

  defp process_requests(_request_name, {:error, message}) do
    {:error, message}
  end
end
