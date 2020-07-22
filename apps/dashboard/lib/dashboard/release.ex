defmodule Dashboard.Release do
  def migrate do
    {:ok, _} = Application.ensure_all_started(:dashboard)

    path = Application.app_dir(:dashboard, "priv/repo/migrations")

    Ecto.Migrator.run(Dashboard.Repo, path, :up, all: true)
  end
end
