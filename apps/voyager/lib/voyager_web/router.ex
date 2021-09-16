defmodule VoyagerWeb.Router do
  import Voyager.UserAuth
  use VoyagerWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {VoyagerWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
    plug :put_layout, {VoyagerWeb.LayoutView, :auth}
  end

  scope "/" do
    pipe_through [:browser, :auth]

    get "/register", VoyagerWeb.RegisterController, :new
    post "/register", VoyagerWeb.RegisterController, :register
    get "/faq", VoyagerWeb.FaqController, :new
    get "/register-success", VoyagerWeb.RegisterController, :success
  end

  scope "/" do
    pipe_through [:browser, :redirect_if_user_is_authenticated, :auth]

    get "/login", VoyagerWeb.SessionController, :new
    post "/login", VoyagerWeb.SessionController, :create
  end

  scope "/", VoyagerWeb do
    pipe_through [:browser, :require_authenticated_user]
    get "/metadata", MetadataController, :new
    get "/metadata/values", MetadataController, :list
    get "/metadata/search", MetadataController, :search
    post "/metadataSubmit", MetadataController, :patch
    live "/metadataView", MetadataLive, :index
    live "/runs", RunLive, :index
    get "/runs/submit", RunController, :new
    get "/runs/success", RunController, :success
    get "/runs/list", RunController, :list
    post "/runs/submit", RunController, :submit
    get "/runs/runJobList", RunController, :checkRunJobs
    get "/logout", SessionController, :delete
    live "/projectStatus", ProjectStatusLive, :index
    live "/", DashboardLive, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", VoyagerWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: VoyagerWeb.Telemetry
    end
  end
end
