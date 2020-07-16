defmodule Seqosystem.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Dependencies listed here are available only for this
  # project and cannot be accessed from applications inside
  # the apps folder.
  #
  # Run "mix help deps" for examples and options.
  defp deps do
    [
      {:dialyxir, "~> 1.0", only: [:dev]},
      {:jason, ">= 1.0.0"},
      {:git_hooks, "~> 0.4.1", only: [:test, :dev], runtime: false},
    ]
  end
end
