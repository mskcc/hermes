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

config :domain,
  ecto_repos: [Domain.Repo]

# Disabled as we now pull through Mdb
# config :metadata_etl,
#  ecto_repos: [Domain.Repo]


#config :metadata_etl, Oban,
#  repo: Domain.Repo,
#  plugins: [{Oban.Plugins.Pruner, max_age: 604_800}],
#  queues: [
#    lims_fetch_requests: 1,
#    lims_fetch_samples: 3,
#    lims_fetch_sample: 10
#  ],
#  crontab: [
#    {"15 * * * *", MetadataEtl.LimsFetchRequests}
#  ]

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

config :beagle_client,
  url: "",
  username: "",
  password: ""

config :jira_client,
  url: "",
  username: "",
  password: ""

if Mix.env() != :prod do
  case Code.ensure_compiled(:git_hooks) do
    {:module, :git_hooks} ->
      config :git_hooks,
        auto_install: true,
        verbose: true,
        hooks: [
          pre_commit: [
            tasks: [
              {:cmd, "mix format"}
            ]
          ],
          pre_push: [
            verbose: false,
            tasks: [
              #{:cmd, "mix dialyzer"},
              #{:cmd, "mix test"},
              {:cmd, "echo 'success!'"}
            ]
          ]
        ]
    {:error, :nofile} ->
      ""
  end
end

import_config "config.voyager.exs"

import_config "#{Mix.env()}.exs"
import_config "#{Mix.env()}.secret.exs"
