defmodule VoyagerWeb.Router do
  import Dashboard.UserAuth
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
    pipe_through [:browser, :redirect_if_user_is_authenticated, :auth]

    get "/login", VoyagerWeb.SessionController, :new
    post "/login", VoyagerWeb.SessionController, :create
  end

  scope "/", VoyagerWeb do
    pipe_through [:browser, :require_authenticated_user]
    get "/metadata/values", MetadataController, :list
    get "/", MetadataController, :new
    post "/metadataSubmit", MetadataController, :patch
    live "/metadata", MetadataLive, :index
    get "/logout", SessionController, :delete

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
