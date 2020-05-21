defmodule Dashboard.Projects.Request do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  schema "requests" do
    field :name, :string
    has_many :samples, Projects.Sample
    belongs_to :project, Projects.Project

    timestamps()
  end

  @doc false
  def changeset(request, attrs) do
    request
    |> cast(attrs, [:name, :project_id])
    |> validate_required([:name, :project_id])
    |> unique_constraint(:name)
  end
end
