defmodule DashboardWeb.WorkflowControllerTest do
  use DashboardWeb.ConnCase

  alias Dashboard.Projects

  @create_attrs %{name: "some name"}
  @update_attrs %{name: "some updated name"}
  @invalid_attrs %{name: nil}

  def fixture(:workflow) do
    {:ok, workflow} = Projects.create_workflow(@create_attrs)
    workflow
  end

  describe "index" do
    test "lists all workflows", %{conn: conn} do
      conn = get(conn, Routes.workflow_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Workflows"
    end
  end

  describe "new workflow" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.workflow_path(conn, :new))
      assert html_response(conn, 200) =~ "New Workflow"
    end
  end

  describe "create workflow" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.workflow_path(conn, :create), workflow: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.workflow_path(conn, :show, id)

      conn = get(conn, Routes.workflow_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Workflow"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.workflow_path(conn, :create), workflow: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Workflow"
    end
  end

  describe "edit workflow" do
    setup [:create_workflow]

    test "renders form for editing chosen workflow", %{conn: conn, workflow: workflow} do
      conn = get(conn, Routes.workflow_path(conn, :edit, workflow))
      assert html_response(conn, 200) =~ "Edit Workflow"
    end
  end

  describe "update workflow" do
    setup [:create_workflow]

    test "redirects when data is valid", %{conn: conn, workflow: workflow} do
      conn = put(conn, Routes.workflow_path(conn, :update, workflow), workflow: @update_attrs)
      assert redirected_to(conn) == Routes.workflow_path(conn, :show, workflow)

      conn = get(conn, Routes.workflow_path(conn, :show, workflow))
      assert html_response(conn, 200) =~ "some updated name"
    end

    test "renders errors when data is invalid", %{conn: conn, workflow: workflow} do
      conn = put(conn, Routes.workflow_path(conn, :update, workflow), workflow: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Workflow"
    end
  end

  describe "delete workflow" do
    setup [:create_workflow]

    test "deletes chosen workflow", %{conn: conn, workflow: workflow} do
      conn = delete(conn, Routes.workflow_path(conn, :delete, workflow))
      assert redirected_to(conn) == Routes.workflow_path(conn, :index)
      assert_error_sent 404, fn ->
        get(conn, Routes.workflow_path(conn, :show, workflow))
      end
    end
  end

  defp create_workflow(_) do
    workflow = fixture(:workflow)
    {:ok, workflow: workflow}
  end
end
