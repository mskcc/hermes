defmodule DashboardWeb.PageController do
  use DashboardWeb, :controller
  alias Dashboard.Projects.Sample
  alias Dashboard.Projects

  def index(conn, _params) do

    recently_added_samples = Projects.list_samples(%{page: 1, per_page: 20, sort_by: [inserted_at: :asc], filters: %{}})

    render(conn, "index.html", [
      recently_added_samples: recently_added_samples
      # samples_running_count: samples_running_count,
      # samples_completed_count: samples_completed_count,
      # samples_failed_count: samples_failed_count,
    ])
  end
end
