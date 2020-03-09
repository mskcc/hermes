defmodule Dashboard.Repo.Migrations.CreateSamples do
  use Ecto.Migration

  def change do
    create table(:samples) do
      add :mrn, :string
      add :project_id, references(:projects, on_delete: :nothing)
      add :assay_id, references(:assays, on_delete: :nothing)

      timestamps()
    end

    create index(:samples, [:project_id])
    create index(:samples, [:assay_id])
  end
end
