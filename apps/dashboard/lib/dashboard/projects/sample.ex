defmodule Dashboard.Projects.Sample do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  @default_status SampleStatusEnum.__enum_map__()[:New]

  schema "samples" do
    field :mrn, :string
    field :igo_sequencing_id, :string
    field :igo_extraction_id, :string
    field :tube_id, :string
    field :status, SampleStatusEnum, default: @default_status
    has_many :jobs, Projects.Job
    has_one :job, Projects.Job
    belongs_to :assay, Projects.Assay
    belongs_to :request, Projects.Request
    has_many :metadata, Projects.SampleMetadata
    has_one :latest_metadata, Projects.SampleMetadata

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(sample, attrs) do
    sample
    |> cast(attrs, [:mrn, :assay_id, :tube_id, :request_id])
    |> validate_required([:assay_id, :tube_id, :request_id])
    |> unique_constraint([:tube_id])
  end

  def filter_changeset(params) do
    data = %{}
    filter_types = %{request: :string, status: :integer, id: :string}

    {data, filter_types}
    |> cast(params, Map.keys(filter_types))
  end
end
