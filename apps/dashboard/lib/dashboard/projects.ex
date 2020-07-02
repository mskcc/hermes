defmodule Dashboard.Projects do
  @moduledoc """
  The Projects context.
  """

  require Logger
  import Ecto.Query, warn: false
  alias Dashboard.Repo

  use Oban.Worker,
    queue: :events,
    queue: :events,
    priority: 3,
    max_attempts: 3,
    tags: ["projects"],
    unique: [period: 30]

  alias Dashboard.Projects.Assay
  alias Dashboard.Projects.Workflow
  alias Dashboard.Projects.SampleMetadata

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
    Repo.all(from p in Assay, where: ilike(p.name, ^"%#{q}%"))
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

  alias Dashboard.Projects.Project

  @doc """
  Returns the list of projects

  ## Examples

      iex> list_projects(10, 20, sort_by, %{"name" => "fuzzy search"})
      [%Project{}, ...]

  """
  def list_projects(%{page: page, per_page: per_page, sort_by: sort_by, filters: filters}) do
    # invert
    sort_by = Keyword.new(sort_by, fn {key, val} -> {val, key} end)

    filters =
      if Map.has_key?(filters, :name) do
        dynamic([p], ilike(p.name, ^"%#{filters[:name]}%"))
      else
        []
      end

    count = Repo.one(from s in Project, select: count(s.id), where: ^filters)

    entries =
      Repo.all(
        from u in Project,
          offset: ^((page - 1) * per_page),
          limit: ^per_page,
          order_by: ^sort_by,
          where: ^filters,
          preload: [:samples]
      )

    %{entries: entries, count: count}
  end

  @doc """
  Returns the list of projects filtered based on the search term.

  ## Examples

      iex> filter_projects("Project #1")
      [%Project{}, ...]

  """
  def filter_projects(q) do
    Repo.all(from p in Project, where: ilike(p.name, ^"%#{q}%"))
  end

  @doc """
  Gets a single project.

  Raises `Ecto.NoResultsError` if the Project does not exist.

  ## Examples

      iex> get_project!(123)
      %Project{}

      iex> get_project!(456)
      ** (Ecto.NoResultsError)

  """
  def get_project!(id), do: Repo.get!(Project, id)

  @doc """
  Gets a single project by name.

  Raises `Ecto.NoResultsError` if the Project does not exist.

  ## Examples

      iex> get_project_by_name!("Access")
      %Project{}

      iex> get_project_by_name!("Non-existent")
      ** (Ecto.NoResultsError)

  """
  def get_project_by_name!(name), do: Repo.get_by!(Project, name: name)

  def find_or_create_project(project_params) do
    query =
      %Project{}
      |> Project.changeset(project_params)
      |> Repo.insert()

    case query do
      {:ok, project} -> project
      {:error, changeset} -> Repo.one(from u in Project, where: ^Enum.to_list(changeset.changes))
    end
  end

  @doc """
  Creates a project.

  ## Examples

      iex> create_project(%{field: value})
      {:ok, %Project{}}

      iex> create_project(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_project(attrs \\ %{}) do
    %Project{}
    |> Project.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a project.

  ## Examples

      iex> update_project(project, %{field: new_value})
      {:ok, %Project{}}

      iex> update_project(project, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_project(%Project{} = project, attrs) do
    project
    |> Project.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a project.

  ## Examples

      iex> delete_project(project)
      {:ok, %Project{}}

      iex> delete_project(project)
      {:error, %Ecto.Changeset{}}

  """
  def delete_project(%Project{} = project) do
    Repo.delete(project)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking project changes.

  ## Examples

      iex> change_project(project)
      %Ecto.Changeset{source: %Project{}}

  """
  def change_project(%Project{} = project) do
    Project.changeset(project, %{})
  end

  alias Dashboard.Projects.Sample

  @doc """
  Returns the list of samples.

  ## Examples

      iex> list_samples(10, 20, sort_by, %{"mrn" => "fuzzy search"})
      [%Sample{}, ...]

  """
  def list_samples(%{page: page, per_page: per_page, sort_by: sort_by, filters: filters}) do
    # invert
    sort_by = Keyword.new(sort_by, fn {key, val} -> {val, key} end)

    filters =
      Enum.reduce(filters, dynamic(true), fn
        {:request, value}, dynamic ->
          dynamic([request: p], ^dynamic and ilike(p.name, ^"%#{value}%"))

        {:status, value}, dynamic ->
          dynamic([p], ^dynamic and p.status == ^value)

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

    count =
      Sample
      |> join(:inner, [s], p in assoc(s, :request), as: :request)
      |> select([s], count(s.id))
      |> where(^filters)
      |> Repo.one()

    metadata_query = from m in SampleMetadata, order_by: [desc: m.inserted_at], limit: 1

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
    Repo.one!(
      from u in Sample,
        preload: [:metadata, jobs: :workflows],
        where: u.id == ^id
    )
  end

  def get_sample_by_igo_id!(id) do
    Repo.one!(
      from u in Sample,
        where: u.igo_sequencing_id == ^id
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

  def fetch_sample_metadata() do
    sample_groups =
      Repo.all(from u in Sample, select: [:igo_sequencing_id, :id], preload: :metadata)
      |> Enum.chunk_every(10)
      |> Enum.take(1)

    for samples <- sample_groups do
      sample_ids = Enum.map(samples, & &1.igo_sequencing_id)

      case LimsClient.fetch_sample_manifests(sample_ids) do
        {:error, _status, body} ->
          # TODO log/retry here
          IO.inspect(body)

        {:ok, body} ->
          for {sample, new_metadata} <- Enum.zip(samples, body) do
            # TODO Redo mechanism here on error
            case update_sample_metadata(sample, new_metadata) do
              {:ok, _} -> nil
              :noop -> nil
              {_, message} -> Logger.error(message, %{sample: sample, metadata: new_metadata})
            end
          end
      end
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
    Repo.history(sample.metadata)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking sample changes.

  ## Examples

      iex> fetch_samples()
      %Ecto.Changeset{source: %Sample{}}

  """
  def fetch_samples() do
    case AccessTrackerClient.fetch_samples() do
      {:error, _status, body} ->
        # TODO log/retry here
        IO.inspect(body)

      {:ok, body} ->
        assay = get_assay_by_name!("Access")
        project = find_or_create_project(%{"name" => "Access"})

        samples =
          body["data"]
          |> Enum.map(fn s ->
            status =
              if s["fieldData"]["Sample_Status"] == "",
                do: nil,
                else: s["fieldData"]["Sample_Status"]

            [
              mrn: s["fieldData"]["MRN"],
              igo_sequencing_id: s["fieldData"]["IGO_ID_Sequencing"],
              igo_extraction_id: s["fieldData"]["IGO_ID_Extraction"],
              status: status,
              tube_id: s["fieldData"]["TubeID"],
              assay_id: assay.id,
              # TODO add a cache for these
              request_id:
                find_or_create_request(%{
                  "name" => s["fieldData"]["Request_ID"],
                  "project_id" => project.id
                }).id,
              inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
              updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
              # metadata: []
            ]
          end)

        Dashboard.Repo.insert_all(
          Sample,
          samples,
          on_conflict: :replace_all,
          conflict_target: [:tube_id]
        )
    end
  end

  alias Dashboard.Projects.Job

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
          Map.merge(%{"parent_id" => parent.id, "group_id" => attrs["group_id"]}, child_attrs)

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
      workflows = Map.put(job_attrs["workflows"], "group_id", job.id)
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

  alias Dashboard.Projects.Workflow

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
  def get_workflow!(id), do: Repo.get!(Workflow, id)

  def get_workflow_by_group_and_name!(group, name),
    do: Repo.get_by!(Workflow, group_id: group, name: name)

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
  Deletes a workflow.

  ## Examples

      iex> delete_workflow(workflow)
      {:ok, %Workflow{}}

      iex> delete_workflow(workflow)
      {:error, %Ecto.Changeset{}}

  """
  def delete_workflow(%Workflow{} = workflow) do
    Repo.delete(workflow)
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

  alias Dashboard.Projects.SampleMetadata

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

  alias Dashboard.Projects.Request

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
        case Repo.one(from u in Request, where: ^Enum.to_list(changeset.changes)) do
          nil -> {:error, changeset}
          request -> {:ok, request}
        end
    end
  end
end
