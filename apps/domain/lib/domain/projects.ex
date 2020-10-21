defmodule Domain.Projects do
  @moduledoc """
  The Projects context.
  """

  require Logger
  import Ecto.Query, warn: false
  alias Domain.Repo
  alias Domain.Projects.Assay
  alias Domain.Projects.Job
  alias Domain.Projects.Workflow
  alias Domain.Projects.SampleMetadata

  @doc """
  Returns the list of assays.

  ## Examples

      iex> list_assays()
      [%Assay{}, ...]

  """
  def list_assays do
    Repo.all(Assay)
  end

  @doc """
  Returns the list of assaysfiltered based on the search term.

  ## Examples

      iex> filter_assays("Assay #1")
      [%Assay{}, ...]

  """
  def filter_assays(q) do
    Repo.all(from(p in Assay, where: ilike(p.name, ^"%#{q}%")))
  end

  @doc """
  Gets a single assay by name.

  Raises `Ecto.NoResultsError` if the Assay does not exist.

  ## Examples

      iex> get_assay_by_name("Access")
      %Assay{}

      iex> get_assay_by_name("Non-existent")
      ** (Ecto.NoResultsError)

  """
  def get_assay_by_name!(name), do: Repo.get_by!(Assay, name: name)

  @doc """
  Gets a single assay.

  Raises `Ecto.NoResultsError` if the Assay does not exist.

  ## Examples

      iex> get_assay!(123)
      %Assay{}

      iex> get_assay!(456)
      ** (Ecto.NoResultsError)

  """
  def get_assay!(id), do: Repo.get!(Assay, id)

  @doc """
  Creates a assay.

  ## Examples

      iex> create_assay(%{field: value})
      {:ok, %Assay{}}

      iex> create_assay(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_assay(attrs \\ %{}) do
    %Assay{}
    |> Assay.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a assay.

  ## Examples

      iex> update_assay(assay, %{field: new_value})
      {:ok, %Assay{}}

      iex> update_assay(assay, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_assay(%Assay{} = assay, attrs) do
    assay
    |> Assay.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a assay.

  ## Examples

      iex> delete_assay(assay)
      {:ok, %Assay{}}

      iex> delete_assay(assay)
      {:error, %Ecto.Changeset{}}

  """
  def delete_assay(%Assay{} = assay) do
    Repo.delete(assay)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking assay changes.

  ## Examples

      iex> change_assay(assay)
      %Ecto.Changeset{source: %Assay{}}

  """
  def change_assay(%Assay{} = assay) do
    Assay.changeset(assay, %{})
  end

  def find_or_create_assay(assay_params) do
    query =
      %Assay{}
      |> Assay.changeset(assay_params)
      |> Repo.insert()

    case query do
      {:ok, assay} ->
        {:ok, assay}

      {:error, changeset} ->
        case Repo.one(from(u in Assay, where: ^Enum.to_list(changeset.changes))) do
          nil -> {:error, changeset}
          assay -> {:ok, assay}
        end
    end
  end

  alias Domain.Projects.Sample

  def get_workflow_status_for_samples(sample_ids) do
    Repo.all(
      from(j in Job,
        where: j.sample_id in ^sample_ids
      )
    )
  end

  @doc """
  Returns the list of samples.

  ## Examples

      iex> list_samples(10, 20, sort_by, %{"mrn" => "fuzzy search"})
      [%Sample{}, ...]

  """
  def list_samples(%{page: page, per_page: per_page, sort_by: sort_by, filters: filters}) do
    # invert
    sort_by = Keyword.new(sort_by, fn {key, val} -> {val, key} end)

    filters = build_filter_query(filters)

    count =
      Sample
      |> join(:inner, [s], p in assoc(s, :request), as: :request)
      |> select([s], count(s.id))
      |> where(^filters)
      |> Repo.one()

    metadata_query = from(m in SampleMetadata, order_by: [desc: m.inserted_at], limit: 1)

    entries =
      Sample
      |> join(:inner, [s], p in assoc(s, :request), as: :request)
      |> offset(^((page - 1) * per_page))
      |> limit(^per_page)
      |> order_by(^sort_by)
      |> where(^filters)
      |> preload([:request, jobs: :workflows, metadata: ^metadata_query])
      |> Repo.all()

    %{entries: entries, count: count}
  end

  defp build_filter_query(filters) do
    Enum.reduce(filters, dynamic(true), fn
      {:request, value}, dynamic ->
        dynamic([request: p], ^dynamic and ilike(p.name, ^"%#{value}%"))

      {:assay, value}, dynamic ->
        dynamic([request: p], ^dynamic and p.assay_id == ^value)

      {:status, value}, dynamic ->
        dynamic([p], ^dynamic and p.status == ^value)

      {:job_status, 20}, dynamic ->
        # TODO There's a better way to do this and perhaps we just save the status in
        # the job.
        q =
          Job
          |> join(:inner, [j], w in Workflow, on: w.job_id == j.id and w.status != 20)
          |> select([j, _], j.sample_id)
          |> group_by([j, _], j.sample_id)
          |> Repo.all()

        q1 =
          Job
          |> join(:inner, [j], w in Workflow, on: w.job_id == j.id and w.status == 20)
          |> select([j, _], j.sample_id)
          |> group_by([j, _], j.sample_id)
          |> Repo.all()

        dynamic([p], ^dynamic and p.id not in ^q and p.id in ^q1)

      {:job_status, value}, dynamic ->
        q =
          Job
          |> join(:inner, [j], w in Workflow, on: w.job_id == j.id and w.status == ^value)
          |> select([j, _], j.sample_id)
          |> group_by([j, _], j.sample_id)
          |> Repo.all()

        dynamic([p], ^dynamic and p.id in ^q)

      {:id, value}, dynamic ->
        dynamic(
          [p],
          ^dynamic and
            (ilike(p.igo_sequencing_id, ^"#{value}%") or
               ilike(p.igo_extraction_id, ^"#{value}%") or
               ilike(p.tube_id, ^"#{value}%"))
        )

      {_, _}, dynamic ->
        dynamic
    end)
  end

  @doc """
  Gets a single sample.

  Raises `Ecto.NoResultsError` if the Sample does not exist.

  ## Examples

      iex> get_sample!(123)
      %Sample{}

      iex> get_sample!(456)
      ** (Ecto.NoResultsError)

  """
  def get_sample!(id) do
    jobs =
      from(
        a in Job,
        order_by: [desc: a.inserted_at],
        preload: :workflows
      )

    Repo.one!(
      from(u in Sample,
        preload: [:metadata, jobs: ^jobs],
        where: u.id == ^id
      )
    )
  end

  def get_sample_by_igo_id!(id) do
    Repo.one!(
      from(u in Sample,
        where: u.igo_sequencing_id == ^id
      )
    )
  end

  @doc """
  Creates a sample.

  ## Examples

      iex> create_sample(%{field: value})
      {:ok, %Sample{}}

      iex> create_sample(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_sample(attrs \\ %{}) do
    %Sample{}
    |> Sample.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a sample.

  ## Examples

      iex> update_sample(sample, %{field: new_value})
      {:ok, %Sample{}}

      iex> update_sample(sample, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_sample(%Sample{} = sample, attrs) do
    sample
    |> Sample.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a sample.

  ## Examples

      iex> delete_sample(sample)
      {:ok, %Sample{}}

      iex> delete_sample(sample)
      {:error, %Ecto.Changeset{}}

  """
  def delete_sample(%Sample{} = sample) do
    Repo.delete(sample)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking sample changes.

  ## Examples

      iex> change_sample(sample)
      %Ecto.Changeset{source: %Sample{}}

  """
  def change_sample(%Sample{} = sample) do
    Sample.changeset(sample, %{})
  end

  def create_or_update_sample_by_igo_id(igo_id, metadata, request_id \\ nil) do
    sample =
      Repo.one(
        from(u in Sample,
          where: u.igo_sequencing_id == ^igo_id,
          preload: [:metadata]
        )
      )

    case sample do
      nil ->
        case create_sample(%{
               "igo_sequencing_id" => igo_id,
               "request_id" => request_id,
               "tube_id" => metadata["investigator_sample_id"]
             }) do
          {:ok, sample} ->
            create_sample_metadata(%{
              content: metadata,
              sample_id: sample.id
            })

          {:error, error} ->
            {:error, error}
        end

      sample ->
        update_sample_metadata(sample, metadata)
    end
  end

  def update_sample_metadata(sample, new_metadata) do
    current_metadata = sample.metadata

    case current_metadata do
      nil ->
        create_sample_metadata(%{
          content: new_metadata,
          sample_id: sample.id
        })

      _ ->
        changeset =
          SampleMetadata.changeset(current_metadata, %{
            content: new_metadata
          })

        case changeset.changes do
          %{content: _content} ->
            Repo.update(changeset)

          _ ->
            :noop
        end
    end
  end

  def get_sample_metadata_history(sample) do
    if sample.metadata do
      Repo.history(sample.metadata)
    else
      []
    end
  end

  def get_samples_completed_count(filters) do
    filters = Map.put(filters, :job_status, 20)
    filters = build_filter_query(filters)

    Repo.one(
      from(s in Sample,
        join: p in assoc(s, :request),
        as: :request,
        select: count(s.id),
        where: ^filters
      )
    )
  end

  def get_samples_failed_count(filters) do
    filters = Map.put(filters, :job_status, 30)
    filters = build_filter_query(filters)

    Repo.one(
      from(s in Sample,
        join: p in assoc(s, :request),
        as: :request,
        select: count(s.id),
        where: ^filters
      )
    )
  end

  def get_samples_running_count(filters) do
    filters = Map.put(filters, :job_status, 10)
    filters = build_filter_query(filters)

    Repo.one(
      from(s in Sample,
        join: p in assoc(s, :request),
        as: :request,
        select: count(s.id),
        where: ^filters
      )
    )
  end

  alias Domain.Projects.Job

  @doc """
  Returns the list of jobs.

  ## Examples

      iex> list_jobs()
      [%Job{}, ...]

  """
  def list_jobs do
    Repo.all(Job)
  end

  @doc """
  Gets a single job.

  Raises `Ecto.NoResultsError` if the Job does not exist.

  ## Examples

      iex> get_job!(123)
      %Job{}

      iex> get_job!(456)
      ** (Ecto.NoResultsError)

  """
  def get_job!(id), do: Repo.get!(Job, id)

  @doc """
  Creates a job.

  ## Examples

      iex> create_job(%{field: value})
      {:ok, %Job{}}

      iex> create_job(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_job(attrs \\ %{}) do
    %Job{}
    |> Job.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  This method recursively builds the inserts for the workflows.
  """
  def build_workflow_inserts(attrs) do
    {children, attrs} = Map.pop(attrs, "children")
    parent_atom = Enum.take_random(0..9, 9) |> Enum.join("") |> String.to_atom()

    Ecto.Multi.new()
    |> Ecto.Multi.insert(parent_atom, Workflow.changeset(%Workflow{}, attrs))
    |> Ecto.Multi.merge(fn results ->
      parent = results[parent_atom]

      Enum.reduce(children, Ecto.Multi.new(), fn child_attrs, acc ->
        child_attrs =
          Map.merge(%{"parent_id" => parent.id, "job_id" => attrs["job_id"]}, child_attrs)

        Ecto.Multi.merge(acc, fn _ ->
          build_workflow_inserts(child_attrs)
        end)
      end)
    end)
  end

  def create_job_with_workflows(job_attrs \\ %{}) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(:job, Job.changeset(%Job{}, job_attrs))
    |> Ecto.Multi.merge(fn %{job: job} ->
      workflows = Map.put(job_attrs["workflows"], "job_id", job.id)
      build_workflow_inserts(workflows)
    end)
    |> Repo.transaction()
  end

  @doc """
  Updates a job.

  ## Examples

      iex> update_job(job, %{field: new_value})
      {:ok, %Job{}}

      iex> update_job(job, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_job(%Job{} = job, attrs) do
    job
    |> Job.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a job.

  ## Examples

      iex> delete_job(job)
      {:ok, %Job{}}

      iex> delete_job(job)
      {:error, %Ecto.Changeset{}}

  """
  def delete_job(%Job{} = job) do
    Repo.delete(job)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking job changes.

  ## Examples

      iex> change_job(job)
      %Ecto.Changeset{source: %Job{}}

  """
  def change_job(%Job{} = job) do
    Job.changeset(job, %{})
  end

  alias Domain.Projects.Workflow

  @doc """
  Returns the list of workflows.

  ## Examples

      iex> list_workflows()
      [%Workflow{}, ...]

  """
  def list_workflows do
    Repo.all(Workflow)
  end

  @doc """
  Gets a single workflow.

  Raises `Ecto.NoResultsError` if the Workflow does not exist.

  ## Examples

      iex> get_workflow!(123)
      %Workflow{}

      iex> get_workflow!(456)
      ** (Ecto.NoResultsError)

  """
  def get_workflow_by_name_and_group_id!(name, group_id) do
    Repo.one!(
      from(w in Workflow,
        join: j in assoc(w, :job),
        where: w.name == ^name and j.group_id == ^group_id
      )
    )
  end

  @doc """
  Creates a workflow.

  ## Examples

      iex> create_workflow(%{field: value})
      {:ok, %Workflow{}}

      iex> create_workflow(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_workflow(attrs \\ %{}) do
    %Workflow{}
    |> Workflow.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a workflow.

  ## Examples

      iex> update_workflow(workflow, %{field: new_value})
      {:ok, %Workflow{}}

      iex> update_workflow(workflow, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_workflow(%Workflow{} = workflow, attrs) do
    workflow
    |> Workflow.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking workflow changes.

  ## Examples

      iex> change_workflow(workflow)
      %Ecto.Changeset{source: %Workflow{}}

  """
  def change_workflow(%Workflow{} = workflow) do
    Workflow.changeset(workflow, %{})
  end

  alias Domain.Projects.SampleMetadata

  @doc """
  Creates a sample_metadata.

  ## Examples

      iex> create_sample_metadata(%{field: value})
      {:ok, %SampleMetadata{}}

      iex> create_sample_metadata(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_sample_metadata(attrs \\ %{}) do
    %SampleMetadata{}
    |> SampleMetadata.changeset(attrs)
    |> Repo.insert()
  end

  alias Domain.Projects.Request

  @doc """
  Returns the list of requests.

  ## Examples

      iex> list_requests()
      [%Request{}, ...]

  """
  def list_requests do
    Repo.all(Request)
  end

  @doc """
  Gets a single request.

  Raises `Ecto.NoResultsError` if the Request does not exist.

  ## Examples

      iex> get_request!(123)
      %Request{}

      iex> get_request!(456)
      ** (Ecto.NoResultsError)

  """
  def get_request!(id), do: Repo.get!(Request, id)

  @doc """
  Creates a request.

  ## Examples

      iex> find_or_create_request(%{name: "test request"})
      {:ok, %Request{}}
  """
  def find_or_create_request(request_params) do
    query =
      %Request{}
      |> Request.changeset(request_params)
      |> Repo.insert()

    case query do
      {:ok, request} ->
        {:ok, request}

      {:error, changeset} ->
        case Repo.one(from(u in Request, where: ^Enum.to_list(changeset.changes))) do
          nil -> {:error, changeset}
          request -> {:ok, request}
        end
    end
  end

  def children() do
    workflow_tree_initial_query =
      Workflow
      |> where([c], is_nil(c.parent_id))

    workflow_tree_recursion_query =
      Workflow
      |> join(:inner, [c], ct in "workflow_tree", on: c.parent_id == ct.id)

    workflow_tree_query =
      workflow_tree_initial_query
      |> union_all(^workflow_tree_recursion_query)

    Job
    |> recursive_ctes(true)
    |> with_cte("workflow_tree", as: ^workflow_tree_query)
    |> join(:left, [p], c in "workflow_tree", on: c.job_id == p.id)
    |> group_by([p], p.id)
    |> select([p, c], %{p | workflows: fragment("ARRAY_AGG(?)", c.name)})
  end
end
