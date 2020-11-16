defmodule DashboardWeb.Router do
  import Dashboard.UserAuth
  use DashboardWeb, :router
  import Phoenix.LiveView.Router
  import Phoenix.LiveDashboard.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
  end

  pipeline :protected do
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
    post "/samples/:id/metadata", DashboardWeb.Api.V1.SampleController, :update_metadata
  end

  scope "/" do
    pipe_through [:browser, :auth, :redirect_if_user_is_authenticated]

    get "/login", DashboardWeb.SessionController, :new
    post "/login", DashboardWeb.SessionController, :create
  end

  scope "/", DashboardWeb do
    pipe_through [:browser, :require_authenticated_user]
    live_dashboard "/dashboard"
  end

  scope "/", DashboardWeb do
    pipe_through [:browser, :account, :require_authenticated_user]

    get "/pointer", PageController, :pointer
    get "/", PageController, :index
    resources "/samples", SampleController, except: [:index]
    delete "/logout", SessionController, :delete
    live "/samples", SamplesLive.List
    live "/jobs", JobsLive.List
  end
end
