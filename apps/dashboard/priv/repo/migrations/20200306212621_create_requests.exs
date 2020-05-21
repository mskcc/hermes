defmodule Dashboard.Repo.Migrations.CreateRequests do
  use Ecto.Migration

  def change do
    create table(:requests) do
      add :name, :string
      add :project_id, references(:projects, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end
    create index(:requests, [:project_id])
    create unique_index(:requests, [:name])
  end
end
