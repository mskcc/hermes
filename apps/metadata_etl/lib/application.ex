defmodule MetadataEtl.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      {Oban, oban_config()}
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: MetadataEtl.Supervisor)
  end

  defp oban_config do
    opts = Application.get_env(:metadata_etl, Oban)

    # Prevent running queues or scheduling jobs from an iex console.
    if Code.ensure_loaded?(IEx) and IEx.started?() do
      opts
      |> Keyword.put(:crontab, false)
      |> Keyword.put(:queues, false)
    else
      opts
    end
  end
end
