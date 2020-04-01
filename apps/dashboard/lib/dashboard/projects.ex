defmodule Dashboard.Projects do
  @moduledoc """
  The Projects context.
  """

  import Ecto.Query, warn: false
  alias Dashboard.Repo

  alias Dashboard.Projects.Assay

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
  Returns the list of projects.

  ## Examples

      iex> list_projects()
      [%Project{}, ...]

  """
  def list_projects do
    Repo.all(Project)
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

      iex> list_samples()
      [%Sample{}, ...]

  """
  def list_samples do
    Repo.all(Sample)
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
  def get_sample!(id), do: Repo.get!(Sample, id)

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

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking sample changes.

  ## Examples

      iex> fetch_samples(sample)
      %Ecto.Changeset{source: %Sample{}}

  """
  def fetch_samples() do
    case AccessTrackerClient.fetch_samples() do
      {:ok, body} ->
        assay = get_assay_by_name!("Access")
        project = get_project_by_name!("Access")

        samples =
          body["data"]
          |> Enum.map(fn s ->
            status =
              if s["fieldData"]["Sample_Status"] == "",
                do: nil,
                else: s["fieldData"]["Sample_Status"]

            [
              mrn: s["fieldData"]["MRN"],
              status: status,
              tube_id: s["fieldData"]["TubeID"],
              assay_id: assay.id,
              project_id: project.id,
              inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
              updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
            ]
          end)

        Dashboard.Repo.insert_all(
          Sample,
          samples,
          on_conflict: :replace_all,
          conflict_target: [:tube_id]
        )

      {:error, _status, body} ->
        # TODO log/retry here
        IO.inspect(body)
    end
  end
end
