defmodule DashboardWeb.Router do
  use DashboardWeb, :router
  use Pow.Phoenix.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :account do
    plug :put_layout, {DashboardWeb.LayoutView, :account}
  end

  scope "/api/v1" do
    pipe_through [:api]
    # pipe_through [:api, :account]
    get "/projects", DashboardWeb.Api.V1.ProjectController, :index
    get "/assays", DashboardWeb.Api.V1.AssayController, :index
  end

  scope "/" do
    pipe_through :browser
    pow_routes()
  end

  scope "/", DashboardWeb do
    pipe_through [:browser, :account]

    get "/", PageController, :index
    resources "/samples", SampleController
    post "/assays", AssayController, :create
  end

  # Other scopes may use custom stacks.
  # scope "/api", DashboardWeb do
  #   pipe_through :api
  # end
end
