defmodule DashboardWeb.Api.V1.ProjectView do
  use DashboardWeb, :view

  def render("index.json", %{projects: projects}) do
    %{data: render_many(projects, DashboardWeb.Api.V1.ProjectView, "project.json")}
  end

  def render("project.json", %{project: project}) do
    %{id: project.id, name: project.name}
  end
end
