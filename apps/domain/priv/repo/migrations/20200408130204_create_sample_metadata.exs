defmodule Domain.Repo.Migrations.CreateSampleMetadata do
  use Ecto.Migration

  def change do
    create table(:sample_metadata) do
      add :content, :jsonb
      add :sample_id, references(:samples, on_delete: :nothing)

      timestamps()
    end
  end
end
