# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :dashboard,
  ecto_repos: [Dashboard.Repo],
  generators: [context_app: :dashboard]

# Configures the endpoint
config :dashboard, DashboardWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "UaLWCWni+61uYpy7J+z6g2c1jw9MOY4FPW+8tM1ZWK6GP3rkR1CQs7AjWjv2m6yt",
  render_errors: [view: DashboardWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Dashboard.PubSub, adapter: Phoenix.PubSub.PG2],
  signing_salt: "nqwpPBDBb2YSoPct1bYHSy0xvfr9M5xBgnXdduyz4r2B7qOPzgaUwFIzbx0fB8H0",
  live_view: [signing_salt: "H88ziZ8BtRa35bZpaNoWVhDOFJMivKiI"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix,
  json_library: Jason,
  template_engines: [leex: Phoenix.LiveView.Engine]

config :dashboard, Oban,
  repo: Dashboard.Repo,
  queues: [default: 10, events: 50, media: 20]

config :ex_state, repo: Dashboard.Repo

config :ex_audit,
  version_schema: Dashboard.Audit.Version,
  tracked_schemas: [
    Dashboard.Projects.SampleMetadata
  ]
