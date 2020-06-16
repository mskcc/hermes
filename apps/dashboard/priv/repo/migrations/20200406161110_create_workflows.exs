defmodule Dashboard.Repo.Migrations.CreateWorkflows do
  use Ecto.Migration

  def change do
    create table(:workflows) do
      add :name, :string
      add :group_id, references(:jobs, on_delete: :nothing)
      add :parent_id, :id
      add :status, WorkflowStatusEnum.type()
      add :error_type, WorkflowErrorTypeEnum.type()
      add :output, :text


      timestamps()
    end

    create index(:workflows, [:group_id])
  end
end
