defmodule Dashboard.Repo.Migrations.CreateSampleMetadata do
  use Ecto.Migration

  def change do
    create table(:sample_metadata) do
      add :content, :jsonb
      add :sample_id, :id
      belongs_to :first_version, PaperTrail.Version
      belongs_to :current_version, PaperTrail.Version, on_replace: :update

      timestamps()
    end
  end
end
