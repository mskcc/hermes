defmodule Dashboard.Repo.Migrations.CreateAssays do
  use Ecto.Migration

  def change do
    create table(:assays) do
      add :name, :string

      timestamps(type: :utc_datetime)
    end
  end
end
