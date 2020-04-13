defmodule Dashboard.Repo.Migrations.CreateSampleMetaData do
  use Ecto.Migration

  def change do
    create table(:sample_meta_data) do
      add :lims, :jsonb

      timestamps()
    end
  end
end
