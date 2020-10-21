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
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger, :paddle],
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
      {:paddle, git: "git@github.com:aef-/paddle.git"}
    ]
  end
end
