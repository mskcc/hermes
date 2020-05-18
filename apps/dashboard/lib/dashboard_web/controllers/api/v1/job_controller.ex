defmodule DashboardWeb.Api.V1.JobController do
  use DashboardWeb, :controller

  alias Dashboard.Projects
  alias Dashboard.Projects.Job

  def create(conn, params) do
    case Projects.create_job(params) do
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
