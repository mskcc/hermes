defmodule DashboardWeb.AssayController do
  use DashboardWeb, :controller
  alias Dashboard.Projects
  alias Dashboard.Projects.Assay

  def create(conn, %{"assay" => assay_params, "layout" => layout}) do
    changeset = Projects.change_assay(%Assay{})

    conn = if layout == "false", do: put_layout(conn, false), else: conn

    case Projects.create_assay(assay_params) do
      {:ok, assay} ->
        conn
        |> put_flash(:info, "Assay #{assay.name} created successfully.")
        |> render("new.html", changeset: changeset, layout: false)

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> render("new.html",
          changeset: changeset,
          layout: false
        )
    end
  end
end
