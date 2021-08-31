defmodule JiraClient.MixProject do
  use Mix.Project

  def project do
    [
      app: :jira_client,
      version: append_revision("0.1.0"),
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.10",
      start_permanent: Mix.env() == :prod,
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

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:tesla, "~> 1.4"},
      {:jason, ">= 1.0.0"},
      {:mint, "~> 1.0"},
      {:ecto, "~> 3.5"},
      {:dialyxir, "~> 1.0", only: [:dev], runtime: false},
      {:nimble_csv, "~> 0.7"}
    ]
  end
end
