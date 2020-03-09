defmodule Dashboard.Projects.Sample do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  schema "samples" do
    field :mrn, :string
    belongs_to :project, Projects.Project
    belongs_to :assay, Projects.Assay

    timestamps()
  end

  @doc false
  def changeset(sample, attrs) do
    sample
    |> cast(attrs, [:mrn, :project_id, :assay_id])
    |> validate_required([:mrn, :project_id, :assay_id])
  end
end
