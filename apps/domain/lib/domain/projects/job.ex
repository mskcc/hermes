defmodule Domain.Projects.Job do
  use Ecto.Schema
  import Ecto.Changeset
  alias Domain.Projects

  schema "jobs" do
    # Refers to Beagle's JobGroup, typically a UUID
    field(:group_id, :string)
    belongs_to(:sample, Projects.Sample)
    has_many(:workflows, Projects.Workflow)

    timestamps()
  end

  @doc false
  def changeset(job, attrs) do
    job
    |> cast(attrs, [:group_id, :sample_id])
    |> validate_required([:group_id, :sample_id])
  end
end
