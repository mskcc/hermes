defmodule Domain.Projects.Workflow do
  use Ecto.Schema
  import Ecto.Changeset
  alias Domain.Projects

  schema "workflows" do
    field(:name, :string)
    belongs_to(:job, Projects.Job)
    belongs_to(:parent, Projects.Workflow)
    has_many(:children, Projects.Workflow, foreign_key: :parent_id)
    field(:status, WorkflowStatusEnum, default: :pending)
    field(:error_type, WorkflowErrorTypeEnum)
    field(:output, :string)

    timestamps()
  end

  @doc false
  def changeset(workflow, attrs) do
    workflow
    |> cast(attrs, [:name, :job_id, :parent_id, :status, :error_type, :output])
    |> validate_required([:name])
  end
end

"""
defmodule WorkflowState do
  use Gearbox,
    field: :status,
    states: Keyword.keys(WorkflowStatusEnum.__enum_map__()),
    initial: :pending,
    transitions: %{
      :pending => [:running],
      :running => [:success, :falure]
    }
end
"""

# https://hexdocs.pm/ecto/constraints-and-upserts.html
