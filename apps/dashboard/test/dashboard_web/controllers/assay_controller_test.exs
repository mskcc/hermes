defmodule DashboardWeb.AssayControllerTest do
  use DashboardWeb.ConnCase

  alias Dashboard.Project

  @create_attrs %{}
  @update_attrs %{}
  @invalid_attrs %{}

  def fixture(:assay) do
    {:ok, assay} = Project.create_assay(@create_attrs)
    assay
  end

  describe "index" do
    test "lists all assays", %{conn: conn} do
      conn = get(conn, Routes.assay_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Assays"
    end
  end

  describe "new assay" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.assay_path(conn, :new))
      assert html_response(conn, 200) =~ "New Assay"
    end
  end

  describe "create assay" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.assay_path(conn, :create), assay: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.assay_path(conn, :show, id)

      conn = get(conn, Routes.assay_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Assay"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.assay_path(conn, :create), assay: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Assay"
    end
  end

  describe "edit assay" do
    setup [:create_assay]

    test "renders form for editing chosen assay", %{conn: conn, assay: assay} do
      conn = get(conn, Routes.assay_path(conn, :edit, assay))
      assert html_response(conn, 200) =~ "Edit Assay"
    end
  end

  describe "update assay" do
    setup [:create_assay]

    test "redirects when data is valid", %{conn: conn, assay: assay} do
      conn = put(conn, Routes.assay_path(conn, :update, assay), assay: @update_attrs)
      assert redirected_to(conn) == Routes.assay_path(conn, :show, assay)

      conn = get(conn, Routes.assay_path(conn, :show, assay))
      assert html_response(conn, 200)
    end

    test "renders errors when data is invalid", %{conn: conn, assay: assay} do
      conn = put(conn, Routes.assay_path(conn, :update, assay), assay: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Assay"
    end
  end

  describe "delete assay" do
    setup [:create_assay]

    test "deletes chosen assay", %{conn: conn, assay: assay} do
      conn = delete(conn, Routes.assay_path(conn, :delete, assay))
      assert redirected_to(conn) == Routes.assay_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.assay_path(conn, :show, assay))
      end
    end
  end

  defp create_assay(_) do
    assay = fixture(:assay)
    {:ok, assay: assay}
  end
end
