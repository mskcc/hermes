defmodule DashboardWeb.Router do
  use DashboardWeb, :router
  use Pow.Phoenix.Router
  import Phoenix.LiveView.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :protected do
    plug Pow.Plug.RequireAuthenticated,
      error_handler: Pow.Phoenix.PlugErrorHandler
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :account do
    plug :put_root_layout, {DashboardWeb.LayoutView, :account}
  end

  pipeline :auth do
    plug :put_layout, {DashboardWeb.LayoutView, :auth}
  end

  scope "/api/v1" do
    pipe_through [:api]
    post "/jobs", DashboardWeb.Api.V1.JobController, :create
    post "/jobs/complete", DashboardWeb.Api.V1.JobController, :complete
    post "/jobs/fail", DashboardWeb.Api.V1.JobController, :fail
    post "/jobs/start", DashboardWeb.Api.V1.JobController, :start
  end

  scope "/" do
    pipe_through [:browser, :auth]
    # Log-in/log-out routes
    pow_session_routes()
  end

  # Disable user registration
  scope "/", Pow.Phoenix, as: "pow" do
    pipe_through [:browser, :protected]

    resources "/registration", RegistrationController,
      singleton: true,
      only: [:edit, :update, :delete]
  end

  scope "/", DashboardWeb do
    pipe_through [:browser, :protected, :account]

    get "/", PageController, :index
    resources "/samples", SampleController, except: [:index]
  end

  scope "/", DashboardWeb do
    pipe_through [:browser, :protected, :account]
    live "/samples", SamplesLive.List
    live "/projects", ProjectsLive.List
  end
end
