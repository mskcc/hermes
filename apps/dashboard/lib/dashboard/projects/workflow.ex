defmodule Dashboard.Projects.Workflow do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  schema "workflows" do
    field :name, :string
    belongs_to :job, Projects.Job
    belongs_to :parent, Projects.Workflow
    field :status, WorkflowStatusEnum, default: :pending

    # TODO maybe we want pipeline information here?

    timestamps()
  end

  @doc false
  def changeset(workflow, attrs) do
    workflow
    |> cast(attrs, [:name, :group_id, :parent_id, :status])
    |> validate_required([:name])
  end
end

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

# https://hexdocs.pm/ecto/constraints-and-upserts.html
