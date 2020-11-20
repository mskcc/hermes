use Mix.Config

# Configure your database
config :dashboard, Dashboard.Repo,
  username: "postgres",
  password: "postgres",
  database: "dashboard_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :voyager, Voyager.Repo,
  username: "postgres",
  password: "postgres",
  database: "voyager_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :dashboard, DashboardWeb.Endpoint,
  http: [port: 4002],
  server: false

config :voyager, VoyagerWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

config :tesla, adapter: Tesla.Mock

config :dashboard, Oban, crontab: false, queues: false

config :access_tracker_client,
  url: "",
  username: "",
  password: ""
