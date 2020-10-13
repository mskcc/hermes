# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :dashboard,
  ecto_repos: [Domain.Repo],
  generators: [context_app: :dashboard, migration: false]

config :phoenix, :generators, model: false

# Configures the endpoint
config :dashboard, DashboardWeb.Endpoint,
  render_errors: [view: DashboardWeb.ErrorView, accepts: ~w(html json)],
  pubsub_server: Dashboard.PubSub

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix,
  json_library: Jason,
  template_engines: [leex: Phoenix.LiveView.Engine]

# config :dashboard, Oban,
#  repo: Dashboard.Repo,
#  queues: [default: 10, events: 50, media: 20]

# config :ex_state, repo: Dashboard.Repo

config :ex_audit,
  version_schema: Domain.Audit.Version,
  tracked_schemas: [
    Domain.Projects.SampleMetadata
  ]
