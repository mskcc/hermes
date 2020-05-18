defmodule Dashboard.Projects.Workflow do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  @default_status WorkflowStatusEnum.__enum_map__()[:pending]

  schema "workflows" do
    field :name, :string
    belongs_to :job, Projects.Job
    belongs_to :parent, Projects.Workflow
    field :status, WorkflowStatusEnum, default: @default_status

    # TODO maybe we want pipeline information here?

    timestamps()
  end

  @doc false
  def changeset(workflow, attrs) do
    workflow
    |> cast(attrs, [:name, :job_id, :parent_id, :status])
    |> validate_required([:name])
  end
end
