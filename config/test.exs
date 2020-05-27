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

config :paddle, Paddle,
  # host: "vsskiplappfm1.mskcc.root.mskcc.org",
  host: "LDAPGLB.MSKCC.ORG",
  base: "DC=MSKCC,DC=ROOT,DC=MSKCC,DC=ORG",
  ssl: true,
  port: 636,
  account_subdn: "OU=Sloan Kettering Institute,OU=SKI",
  account_identifier: "CN"
