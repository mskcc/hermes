defmodule DashboardWeb.WorkflowController do
  use DashboardWeb, :controller

  alias Dashboard.Projects
  alias Dashboard.Projects.Workflow

  def index(conn, _params) do
    workflows = Projects.list_workflows()
    render(conn, "index.html", workflows: workflows)
  end

  def new(conn, _params) do
    changeset = Projects.change_workflow(%Workflow{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"workflow" => workflow_params}) do
    case Projects.create_workflow(workflow_params) do
      {:ok, workflow} ->
        conn
        |> put_flash(:info, "Workflow created successfully.")
        |> redirect(to: Routes.workflow_path(conn, :show, workflow))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    workflow = Projects.get_workflow!(id)
    render(conn, "show.html", workflow: workflow)
  end

  def edit(conn, %{"id" => id}) do
    workflow = Projects.get_workflow!(id)
    changeset = Projects.change_workflow(workflow)
    render(conn, "edit.html", workflow: workflow, changeset: changeset)
  end

  def update(conn, %{"id" => id, "workflow" => workflow_params}) do
    workflow = Projects.get_workflow!(id)

    case Projects.update_workflow(workflow, workflow_params) do
      {:ok, workflow} ->
        conn
        |> put_flash(:info, "Workflow updated successfully.")
        |> redirect(to: Routes.workflow_path(conn, :show, workflow))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", workflow: workflow, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    workflow = Projects.get_workflow!(id)
    {:ok, _workflow} = Projects.delete_workflow(workflow)

    conn
    |> put_flash(:info, "Workflow deleted successfully.")
    |> redirect(to: Routes.workflow_path(conn, :index))
  end
end
