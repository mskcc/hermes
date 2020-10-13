defmodule MetadataEtl.LimsFetchRequests do
  use Oban.Worker,
    queue: :lims_fetch_requests,
    priority: 3,
    max_attempts: 3,
    tags: [],
    unique: [period: 3600]

  @impl Oban.Worker
  def perform(_job) do
    process_requests(LimsClient.fetch_new_requests_since(1_602_280_411_000))
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
