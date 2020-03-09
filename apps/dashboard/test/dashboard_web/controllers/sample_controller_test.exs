defmodule DashboardWeb.SampleControllerTest do
  use DashboardWeb.ConnCase

  alias Dashboard.Projects

  @create_attrs %{mrn: "some mrn"}
  @update_attrs %{mrn: "some updated mrn"}
  @invalid_attrs %{mrn: nil}

  def fixture(:sample) do
    {:ok, sample} = Projects.create_sample(@create_attrs)
    sample
  end

  describe "index" do
    test "lists all samples", %{conn: conn} do
      conn = get(conn, Routes.sample_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Samples"
    end
  end

  describe "new sample" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.sample_path(conn, :new))
      assert html_response(conn, 200) =~ "New Sample"
    end
  end

  describe "create sample" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.sample_path(conn, :create), sample: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.sample_path(conn, :show, id)

      conn = get(conn, Routes.sample_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Sample"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.sample_path(conn, :create), sample: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Sample"
    end
  end

  describe "edit sample" do
    setup [:create_sample]

    test "renders form for editing chosen sample", %{conn: conn, sample: sample} do
      conn = get(conn, Routes.sample_path(conn, :edit, sample))
      assert html_response(conn, 200) =~ "Edit Sample"
    end
  end

  describe "update sample" do
    setup [:create_sample]

    test "redirects when data is valid", %{conn: conn, sample: sample} do
      conn = put(conn, Routes.sample_path(conn, :update, sample), sample: @update_attrs)
      assert redirected_to(conn) == Routes.sample_path(conn, :show, sample)

      conn = get(conn, Routes.sample_path(conn, :show, sample))
      assert html_response(conn, 200) =~ "some updated mrn"
    end

    test "renders errors when data is invalid", %{conn: conn, sample: sample} do
      conn = put(conn, Routes.sample_path(conn, :update, sample), sample: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Sample"
    end
  end

  describe "delete sample" do
    setup [:create_sample]

    test "deletes chosen sample", %{conn: conn, sample: sample} do
      conn = delete(conn, Routes.sample_path(conn, :delete, sample))
      assert redirected_to(conn) == Routes.sample_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.sample_path(conn, :show, sample))
      end
    end
  end

  defp create_sample(_) do
    sample = fixture(:sample)
    {:ok, sample: sample}
  end
end
