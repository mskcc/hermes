defmodule Dashboard.Projects.Job do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  schema "jobs" do
    field :group_id, :string # Refers to Beagle's JobGroup, typically a UUID
    belongs_to :sample, Projects.Sample
    has_many :workflows, Projects.Workflow

    timestamps()
  end

  @doc false
  def changeset(job, attrs) do
    job
    |> cast(attrs, [:group_id, :sample_id])
    |> validate_required([:group_id, :sample_id])
  end
end