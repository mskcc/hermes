defmodule Voyager.MixProject do
  use Mix.Project

  def project do
    [
      app: :voyager,
      version: append_revision("0.2.0"),
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.7",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  def append_revision(version) do
    revision_str = revision()
    "#{version}+#{revision_str}"
  end

  defp revision() do
    System.cmd("git", ["rev-parse", "--short", "HEAD"])
    |> elem(0)
    |> String.trim_trailing()
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Voyager.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.5.7"},
      {:phoenix_ecto, "~> 4.2"},
      {:ecto_sql, "~> 3.5"},
      {:postgrex, ">= 0.15.8"},
      {:phoenix_live_view, "== 0.15.1"},
      {:react_phoenix, "~> 1.3.0-rc.1"},
      {:floki, ">= 0.29.0", only: :test},
      {:phoenix_html, "~> 2.14"},
      {:phoenix_live_reload, "~> 1.3", only: :dev},
      {:phoenix_live_dashboard, "~> 0.3"},
      {:telemetry_metrics, "~>  0.6.0"},
      {:telemetry_poller, "~> 0.5.1"},
      {:gettext, "~> 0.18.2"},
      {:jason, "~> 1.2"},
      {:plug_cowboy, "~> 2.4"},
      {:domain, in_umbrella: true},
      {:beagle_client, in_umbrella: true}

    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "cmd npm install --prefix assets"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
