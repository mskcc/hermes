defmodule Dashboard.Projects.Workflow do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  @default_role WorkflowStatusEnum.__enum_map__()[:pending]

  schema "workflows" do
    field :name, :string
    belongs_to :job, Projects.Job
    field :status, WorkflowStatusEnum, default: @default_status

    # TODO link to Beagle

    timestamps()
  end

  @doc false
  def changeset(workflow, attrs) do
    workflow
    |> cast(attrs, [:name, :job_id, :status])
    |> validate_required([:name, :job_id])
  end
end
