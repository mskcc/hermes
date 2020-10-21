defmodule DashboardWeb.Api.V1.ProjectController do
  use DashboardWeb, :controller
  alias Domain.Projects

  def index(conn, %{"q" => q}) do
    projects = Projects.filter_projects(q)

    render(conn, "index.json", projects: projects)
  end
end
