defmodule DashboardWeb.Api.V1.JobController do
  use DashboardWeb, :controller

  alias Dashboard.Projects

  def create(conn, params) do
    sample = Projects.get_sample_by_igo_id!(params["sample_id"])
    params = Map.put(params, "sample_id", sample.id)

    api_response(conn, Projects.create_job_with_workflows(params))
  end

  def start(conn, %{
        "group_id" => group_id,
        "sample_id" => _sample_id,
        "workflow_name" => workflow_name
      }) do
    workflow = Projects.get_workflow_by_group_and_name!(group_id, workflow_name)

    workflow =
      workflow
      |> Gearbox.transition!(WorkflowState, :running)
      |> Projects.update_workflow()

    api_response(conn, workflow)
  end

  def complete(conn, %{
        "group_id" => group_id,
        "sample_id" => _sample_id,
        "workflow_name" => workflow_name
      }) do
    workflow = Projects.get_workflow_by_group_and_name!(group_id, workflow_name)

    workflow =
      workflow
      |> Gearbox.transition!(WorkflowState, :success)
      |> Projects.update_workflow()

    api_response(conn, workflow)
  end

  def fail(conn, %{
        "group_id" => group_id,
        "sample_id" => _sample_id,
        "workflow_name" => workflow_name
      }) do
    workflow = Projects.get_workflow_by_group_and_name!(group_id, workflow_name)

    workflow =
      workflow
      |> Gearbox.transition!(WorkflowState, :failure)
      |> Projects.update_workflow()

    api_response(conn, workflow)
  end

  defp api_response(conn, updates) do
    case updates do
      {:ok, _job} ->
        conn
        |> send_resp(201, "")

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(400)
        |> render(conn, "400.json", changeset: changeset)
    end
  end
end
