defmodule DashboardWeb.PageController do
  use DashboardWeb, :controller
  alias Domain.Projects


  def index(conn, _params) do
    recently_added_samples =
      Projects.list_samples(%{page: 1, per_page: 20, sort_by: [inserted_at: :desc], filters: %{}})

    recently_updated_samples =
      Projects.list_samples(%{page: 1, per_page: 20, sort_by: [updated_at: :desc], filters: %{}})

    sample_count = %{
      "completed" => Projects.get_samples_completed_count(%{}),
      "failed" => Projects.get_samples_failed_count(%{}),
      "running" => Projects.get_samples_running_count(%{})
    }

    render(conn, "index.html",
      recently_added_samples: recently_added_samples,
      recently_updated_samples: recently_updated_samples,
      sample_count: sample_count
    )
  end
end
