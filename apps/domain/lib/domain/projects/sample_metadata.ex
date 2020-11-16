defmodule Domain.Projects.SampleMetadata do
  use Domain.Schema
  import Ecto.Changeset
  alias Domain.Projects

  schema "sample_metadata" do
    belongs_to(:sample, Projects.Sample)

    embeds_one(:content, LimsClient.Ecto.Metadata, on_replace: :update)

    timestamps()
  end

  @doc false
  def changeset(sample_metadata, attrs) do
    sample_metadata
    |> cast(attrs, [:sample_id])
    |> validate_required([:sample_id])
    |> cast_embed(:content, with: &content_changeset/2)
  end

  defp content_changeset(schema, params) do
    schema
    |> cast(params, LimsClient.Ecto.Metadata.fields())
  end
end
