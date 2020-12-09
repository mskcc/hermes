defmodule Domain.Projects.Request do
  use Domain.Schema
  import Ecto.Changeset
  alias Domain.Projects

  schema "requests" do
    field(:name, :string)
    has_many(:samples, Projects.Sample)
    belongs_to(:assay, Projects.Assay)

    timestamps()
  end

  @doc false
  def changeset(request, attrs) do
    request
    |> cast(attrs, [:name, :assay_id])
    |> validate_required([:name, :assay_id])
    |> unique_constraint(:name)
  end
end
