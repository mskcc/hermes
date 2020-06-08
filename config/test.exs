use Mix.Config

# Configure your database
config :dashboard, Dashboard.Repo,
  username: "postgres",
  password: "postgres",
  database: "dashboard_test",
  hostname: "db",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :dashboard, DashboardWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

config :tesla, adapter: Tesla.Mock

config :dashboard, Oban, crontab: false, queues: false, plugins: false
