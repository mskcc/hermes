defmodule Mdb.Application do
  @moduledoc false

  use Application
  use Supervisor

  def start_link() do
    Supervisor.start_link(__MODULE__,[], name: Mdb.Supervisor)
  end

  @impl true
  def init(_) do
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
      Supervisor.child_spec({Gnat.ConnectionSupervisor, gnat_supervisor_settings}, id: :my_connection_supervisor),
      Supervisor.child_spec({Gnat.ConsumerSupervisor, consumer_supervisor_settings}, id: :mdb_consumer, shutdown: 30_000)
    ]
    Supervisor.init(children, strategy: :one_for_one)
  end

  @impl true
  def start(_type, _args) do
    Mdb.Application.start_link()
  end
end
