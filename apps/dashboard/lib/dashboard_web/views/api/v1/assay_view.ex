defmodule DashboardWeb.Api.V1.AssayView do
  use DashboardWeb, :view

  def render("index.json", %{assays: assays}) do
    %{data: render_many(assays, DashboardWeb.Api.V1.AssayView, "assay.json")}
  end

  def render("assay.json", %{assay: assay}) do
    %{id: assay.id, name: assay.name}
  end
end
