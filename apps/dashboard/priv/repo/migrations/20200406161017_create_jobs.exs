defmodule Dashboard.Repo.Migrations.CreateJobs do
  use Ecto.Migration

  def change do
    create table(:jobs) do
      add :group_id, :string
      add :sample_id, references(:samples, on_delete: :nothing)

      timestamps()
    end

    create index(:jobs, [:sample_id])
  end
end
