defmodule MetadataEtl.LimsFetchSample do
  use Oban.Worker,
    queue: :lims_fetch_sample,
    priority: 3,
    max_attempts: 3,
    tags: [],
    unique: [period: 3600]

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"sample" => sample, "request_id" => request_id}}) do
    process_requests(request_id, LimsClient.fetch_sample_manifests([sample]))
  end

  defp process_requests(request_id, {:ok, samples}) do
    # We're only processing a single sample at a time 
    sample = List.first(samples)

    case Domain.Projects.create_or_update_sample_by_igo_id(sample["igo_id"], sample, request_id) do
      {:error, message} -> {:error, message}
      _ -> :ok
    end
  end

  defp process_requests(_request_id, {:error, message}) do
    {:error, message}
  end
end
