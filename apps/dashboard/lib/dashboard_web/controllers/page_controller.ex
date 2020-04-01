defmodule DashboardWeb.PageController do
  use DashboardWeb, :controller
  alias Dashboard.Projects.Sample

  def index(conn, _params) do
    render(conn, "index.html", [
      # samples_running_count: samples_running_count,
      # samples_completed_count: samples_completed_count,
      # samples_failed_count: samples_failed_count,
    ])
  end
end
