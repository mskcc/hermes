defmodule DashboardWeb.Api.V1.JobController do
  use DashboardWeb, :controller

  alias Dashboard.Projects
  alias Dashboard.Projects.Job

  def create(conn, params) do
    sample = Projects.get_sample_by_igo_id!(params["sample_id"])
    params = Map.put(params, "sample_id", sample.id)

    case Projects.create_job_with_workflows(params) do
      {:ok, job} ->
        conn
        |> send_resp(201, "")

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(400)
        |> render(conn, "400.json", changeset: changeset)
    end
  end
end
