defmodule Domain.Queue do
  @moduledoc """
  The Queue context.
  """

  alias Domain.Repo
  import Ecto.Query, warn: false
  alias Oban.Job

  @doc """
  Returns the list of audit_versions.

  ## Examples

      iex> list_jobs()
      [%Job{}, ...]

  """
  def list_jobs(%{page: page, per_page: per_page, sort_by: sort_by, filters: filters}) do
    sort_by = Keyword.new(sort_by, fn {key, val} -> {val, key} end)
    filters = Enum.map(filters, fn {key, value} -> {key, value} end)
    #count =
    #  Job
    #  |> select([s], count(s.id))
    #  |> where(^filters)
    #  |> Repo.one()

    query =
      Job
      |> offset(^((page - 1) * per_page))
      |> limit(^per_page)
      |> order_by(^sort_by)

    empty_map = %{}
    query = filters
            |> case do
              ^empty_map -> query
              _ -> query |> where(^filters)
            end

    entries = Repo.all(query)
    %{entries: entries, count: 0}
  end

  def get_latest_completed_job_by_queue(queue) do
    Repo.one(from j in Job, 
      where: not is_nil(j.completed_at) and j.queue == ^queue,
      order_by: [desc: :completed_at],
      limit: 1
    )
  end

  def list_states do
    Job
    |> select([j], j.state) 
    |> group_by(:state)
    |> Repo.all
  end
end
