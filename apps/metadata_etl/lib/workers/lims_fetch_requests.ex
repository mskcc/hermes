defmodule MetadataEtl.LimsFetchRequests do
  @queue :lims_fetch_requests

  use Oban.Worker,
    queue: @queue,
    priority: 3,
    max_attempts: 3,
    tags: [],
    unique: [period: 3600]

  @three_days_in_seconds 60 * 60 * 24 * 3

  @impl Oban.Worker
  def perform(_job) do
    job = Domain.Queue.get_latest_completed_job_by_queue(@queue |> to_string)

    timestamp = case job do
      nil -> DateTime.utc_now()  |> DateTime.add(-@three_days_in_seconds, :second)
      job -> job.completed_at
    end
    |> DateTime.to_unix(:milliseconds)

    process_requests(LimsClient.fetch_new_requests_since(timestamp))
    # TODO perform redelivery event
  end

  defp process_requests({:ok, requests}) do
    requests
    |> Enum.map(fn %{"request" => request} ->
      %{request: request}
      |> MetadataEtl.LimsFetchSamples.new()
      |> Oban.insert()
    end)

    :ok
  end

  defp process_requests({:error, message}) do
    {:error, message}
  end
end
