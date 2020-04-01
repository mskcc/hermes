# This file is responsible for configuring your umbrella
# and **all applications** and their dependencies with the
# help of the Config module.
#
# Note that all applications in your umbrella share the
# same configuration and dependencies, which is why they
# all use the same configuration file. If you want different
# configurations or dependencies per app, it is best to
# move said applications out of the umbrella.
import Config

# Sample configuration:
#
#     config :logger, :console,
#       level: :info,
#       format: "$date $time [$level] $metadata$message\n",
#       metadata: [:user_id]
#
# Configure this in "dev.secret.exs"
config :lims_client,
  url: "",
  username: "",
  password: ""

import_config "config.dashboard.exs"

config :pow,
  user: Dashboard.Users.User,
  users_context: Dashboard.Users.LDAPContext,
  web_module: DashboardWeb

import_config "#{Mix.env()}.exs"
import_config "#{Mix.env()}.secret.exs"
