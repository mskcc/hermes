defmodule Dashboard.Projects.Job do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  schema "jobs" do
    field :job_id, :string
    belongs_to :sample, Projects.Sample
    has_many :workflows, Projects.Workflow

    timestamps()
  end

  @doc false
  def changeset(job, attrs) do
    job
    |> cast(attrs, [:job_id, :sample_id])
    |> validate_required([:job_id, :sample_id])
  end
end
