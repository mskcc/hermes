defmodule DashboardWeb.JobControllerTest do
  use DashboardWeb.ConnCase

  alias Dashboard.Projects

  @create_attrs %{job_id: "some job_id"}
  @update_attrs %{job_id: "some updated job_id"}
  @invalid_attrs %{job_id: nil}

  def fixture(:job) do
    {:ok, job} = Projects.create_job(@create_attrs)
    job
  end

  describe "index" do
    test "lists all jobs", %{conn: conn} do
      conn = get(conn, Routes.job_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Jobs"
    end
  end

  describe "new job" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.job_path(conn, :new))
      assert html_response(conn, 200) =~ "New Job"
    end
  end

  describe "create job" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.job_path(conn, :create), job: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.job_path(conn, :show, id)

      conn = get(conn, Routes.job_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Job"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.job_path(conn, :create), job: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Job"
    end
  end

  describe "edit job" do
    setup [:create_job]

    test "renders form for editing chosen job", %{conn: conn, job: job} do
      conn = get(conn, Routes.job_path(conn, :edit, job))
      assert html_response(conn, 200) =~ "Edit Job"
    end
  end

  describe "update job" do
    setup [:create_job]

    test "redirects when data is valid", %{conn: conn, job: job} do
      conn = put(conn, Routes.job_path(conn, :update, job), job: @update_attrs)
      assert redirected_to(conn) == Routes.job_path(conn, :show, job)

      conn = get(conn, Routes.job_path(conn, :show, job))
      assert html_response(conn, 200) =~ "some updated job_id"
    end

    test "renders errors when data is invalid", %{conn: conn, job: job} do
      conn = put(conn, Routes.job_path(conn, :update, job), job: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Job"
    end
  end

  describe "delete job" do
    setup [:create_job]

    test "deletes chosen job", %{conn: conn, job: job} do
      conn = delete(conn, Routes.job_path(conn, :delete, job))
      assert redirected_to(conn) == Routes.job_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.job_path(conn, :show, job))
      end
    end
  end

  defp create_job(_) do
    job = fixture(:job)
    {:ok, job: job}
  end
end
