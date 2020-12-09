defmodule DashboardWeb.SampleController do
  use DashboardWeb, :controller

  alias Domain.Projects
  alias Domain.Projects.Sample
  alias Domain.Projects.Assay

  def show(conn, %{"id" => id}) do
    sample = Projects.get_sample!(id)
    metadata_history = Projects.get_sample_metadata_history(sample)
    render(conn, "show.html", sample: sample, metadata_history: metadata_history)
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
