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
    pipe_through [:api, :protected]
    # pipe_through [:api, :account]
    get "/projects", DashboardWeb.Api.V1.ProjectController, :index
    get "/assays", DashboardWeb.Api.V1.AssayController, :index
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
    post "/assays", AssayController, :create
  end

  scope "/", DashboardWeb do
    pipe_through [:browser, :protected, :account]
    live "/samples", SamplesLive.List
    live "/projects", ProjectsLive.List
  end

  # Other scopes may use custom stacks.
  # scope "/api", DashboardWeb do
  #   pipe_through :api
  # end
end
