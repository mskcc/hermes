use Mix.Config

config :mdb,
  nat_connections: [
    %{host: 'demo.nats.io', port: 4222}
  ]

# Configure your database
config :domain, Domain.Repo,
  username: "postgres",
  password: "postgres",
  database: "dashboard_dev",
  port: 5432,
  hostname: "localhost",
  show_sensitive_data_on_connection_error: true,
  pool_size: 10,
  migration_primary_key: [name: :id, type: :binary_id]

config :voyager, Voyager.Repo,
  username: "postgres",
  password: "postgres",
  database: "voyager_dev",
  hostname: "localhost",
  port: 5432,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with webpack to recompile .js and .css sources.
config :voyager, VoyagerWeb.Endpoint,
  signing_salt: "Ri/jdz3uB2awqvQct2IiHkRl+byAYdpW72nE+mLSCU/SVQWIq1kvSMgYEzjcvu3/",
  live_view: [signing_salt: "vb5uxCyB"],
  url: [host: "localhost"],
  secret_key_base: "/HiFGvgJ4lR86prPoc0NzTSAmEP1lA8QJWc8E8tp0ZDsbzlYBpSMF1zAz0dzwUS5",
  https: [
    port: 4000,
    cipher_suite: :strong,
    certfile: "priv/cert/selfsigned.pem",
    keyfile: "priv/cert/selfsigned_key.pem"  ],

  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    node: [
      "node_modules/webpack/bin/webpack.js",
      "--mode",
      "development",
      "--watch",
      "--watch-options-stdin",
      cd: Path.expand("../apps/voyager/assets", __DIR__)
    ]
  ]

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# Mix task:
#
#     mix phx.gen.cert
#
# Note that this task requires Erlang/OTP 20 or later.
# Run `mix help phx.gen.cert` for more information.
#
# The `http:` config above can be replaced with:
#
#     https: [
#       port: 4001,
#       cipher_suite: :strong,
#       keyfile: "priv/cert/selfsigned_key.pem",
#       certfile: "priv/cert/selfsigned.pem"
#     ],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :voyager, VoyagerWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/voyager_web/(live|views)/.*(ex)$",
      ~r"lib/voyager_web/templates/.*(eex)$"
    ]
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"
config :logger, truncate: :infinity

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime
