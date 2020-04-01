defmodule Dashboard.Repo.Migrations.CreateSamples do
  use Ecto.Migration

  def change do
    create table(:samples) do
      add :mrn, :string
      add :project_id, references(:projects, on_delete: :nothing)
      add :assay_id, references(:assays, on_delete: :nothing)
      add :tube_id, :string
      add :status, SampleStatusEnum.type()

      timestamps(type: :utc_datetime)
    end

    create unique_index(:samples, [:tube_id])
    create index(:samples, [:status])
    create index(:samples, [:mrn])
    create index(:samples, [:project_id])
    create index(:samples, [:assay_id])
  end
end
