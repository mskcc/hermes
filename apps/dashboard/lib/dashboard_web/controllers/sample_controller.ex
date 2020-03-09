defmodule DashboardWeb.SampleController do
  use DashboardWeb, :controller

  alias Dashboard.Projects
  alias Dashboard.Projects.Sample

  def index(conn, _params) do
    samples = Projects.list_samples()
    render(conn, "index.html", samples: samples)
  end

  def new(conn, _params) do
    changeset = Projects.change_sample(%Sample{})
    render(conn, "new.html", changeset: changeset, projects: [], assays: [])
  end

  def create(conn, %{"sample" => sample_params}) do
    case Projects.create_sample(sample_params) do
      {:ok, sample} ->
        conn
        |> put_flash(:info, "Sample created successfully.")
        |> redirect(to: Routes.sample_path(conn, :show, sample))

      {:error, %Ecto.Changeset{} = changeset} ->
        projects =
          if sample_params["project_id"],
            do: [Projects.get_project!(sample_params["project_id"])],
            else: []

        assays =
          if sample_params["assay_id"],
            do: [Projects.get_assay!(sample_params["assay_id"])],
            else: []

        render(conn, "new.html", changeset: changeset, projects: projects, assays: assays)
    end
  end

  def show(conn, %{"id" => id}) do
    sample = Projects.get_sample!(id)
    render(conn, "show.html", sample: sample)
  end

  def edit(conn, %{"id" => id}) do
    sample = Projects.get_sample!(id)
    changeset = Projects.change_sample(sample)
    render(conn, "edit.html", sample: sample, changeset: changeset)
  end

  def update(conn, %{"id" => id, "sample" => sample_params}) do
    sample = Projects.get_sample!(id)

    case Projects.update_sample(sample, sample_params) do
      {:ok, sample} ->
        conn
        |> put_flash(:info, "Sample updated successfully.")
        |> redirect(to: Routes.sample_path(conn, :show, sample))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", sample: sample, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    sample = Projects.get_sample!(id)
    {:ok, _sample} = Projects.delete_sample(sample)

    conn
    |> put_flash(:info, "Sample deleted successfully.")
    |> redirect(to: Routes.sample_path(conn, :index))
  end
end
