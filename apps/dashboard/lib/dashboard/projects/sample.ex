defmodule Dashboard.Projects.Sample do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  @default_role SampleStatusEnum.__enum_map__()[:New]

  schema "samples" do
    field :mrn, :string
    field :tube_id, :string
    field :status, SampleStatusEnum, default: @default_status
    has_many :jobs, Projects.Job
    has_one :job, Projects.Job
    belongs_to :project, Projects.Project
    belongs_to :assay, Projects.Assay

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(sample, attrs) do
    sample
    |> cast(attrs, [:mrn, :project_id, :assay_id, :tube_id])
    |> validate_required([:project_id, :assay_id, :tube_id])
    |> unique_constraint([:tube_id])
  end
end
