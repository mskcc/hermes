defmodule Mdb.Application do
  @moduledoc false

  use Application
  import Supervisor.Spec

  def start(_type, _args) do
    gnat_supervisor_settings = %{
      name: :gnat,
      connection_settings: Application.fetch_env!(:mdb, :nat_connections)
    }

    consumer_supervisor_settings = %{
      connection_name: :gnat,
      module: Mdb.Server,
      subscription_topics: [
        %{topic: "foo.*"},
      ],
    }

    children = [
      worker(Gnat.ConnectionSupervisor, [gnat_supervisor_settings, [name: :my_connection_supervisor]]),
      worker(Gnat.ConsumerSupervisor, [consumer_supervisor_settings, [name: :mdb_consumer]], shutdown: 30_000)
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: Mdb.Supervisor)
  end
end
