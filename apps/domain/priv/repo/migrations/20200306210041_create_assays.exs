defmodule Domain.Repo.Migrations.CreateAssays do
  use Ecto.Migration

  def change do
    create table(:assays) do
      add :name, :string

      timestamps(type: :utc_datetime)
    end
    create unique_index(:assays, [:name])
  end
end
