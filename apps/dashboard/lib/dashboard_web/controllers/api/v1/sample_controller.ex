defmodule DashboardWeb.Api.V1.SampleController do
  use DashboardWeb, :controller

  alias Domain.Projects

  def update_metadata(conn, params) do
    sample = Projects.get_sample!(params["id"])

    api_response(conn, Projects.update_sample_metadata(sample, params))
  end
end
