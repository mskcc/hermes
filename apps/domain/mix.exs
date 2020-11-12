defmodule Domain.MixProject do
  use Mix.Project

  def project do
    [
      app: :domain,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "./deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.10",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {Domain.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:ecto, "~> 3.4.4"},
      {:ecto_sql, "~> 3.1"},
      {:ecto_enum, "~> 1.4"},
      {:ex_audit, git: "git@github.com:ZennerIoT/ex_audit.git"},
      {:postgrex, ">= 0.0.0"},
      {:beagle_client, in_umbrella: true},
      {:phx_gen_auth, "~> 0.5", runtime: false},
      # Required for migrations
      {:oban, "~> 2.2"}
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
