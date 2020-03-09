defmodule DashboardWeb.Api.V1.AssayController do
  use DashboardWeb, :controller
  alias Dashboard.Projects

  def index(conn, %{"q" => q}) do
    assays = Projects.filter_assays(q)

    render(conn, "index.json", assays: assays)
  end
end
