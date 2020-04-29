defmodule Dashboard.Repo.Migrations.CreateSampleMetadatum do
  use Ecto.Migration

  def change do
    create table(:sample_metadata) do
      add :content, :jsonb
      add :sample_id, :id

      timestamps()
    end
  end
end
