defmodule DashboardWeb.Api.V1.JobView do
  use DashboardWeb, :view
  alias Ecto.Changeset

  def render("400.json", %{changeset: changeset}) do
    %{errors: Changeset.traverse_errors(changeset, &translate_error/1)}
  end
end
