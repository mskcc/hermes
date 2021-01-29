defmodule Domain.Repo.Migrations.CreateRequests do
  use Ecto.Migration

  def change do
    create table(:requests) do
      add :name, :string
      add :assay_id, references(:assays, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:requests, [:assay_id])
    create unique_index(:requests, [:name])
  end
end
