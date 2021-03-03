defmodule Seqosystem.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),

      # Docs
      name: "Seqosystem",
      source_url: "https://github.com/mskcc/seqosystem"

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
      {:jason, "~> 1.2"},
      {:git_hooks, "~> 0.5.2", only: [:test, :dev], runtime: false},
      {:ex_doc, "~> 0.23", only: [:test, :dev], runtime: false},
      {:edeliver, "~> 1.8"},
      {:distillery, "~> 2.1", warn_missing: false}
    ]
  end
end
