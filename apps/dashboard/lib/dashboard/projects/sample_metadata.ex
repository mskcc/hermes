defmodule Dashboard.Projects.SampleMetadatum do
  use Ecto.Schema
  import Ecto.Changeset
  alias Dashboard.Projects

  schema "sample_metadata" do
    belongs_to :sample, Projects.Sample

    embeds_one :content, LimsClient.Ecto.MetaData
    timestamps()
  end

  @doc false
  def changeset(sample_metadatum, attrs) do
    sample_metadatum
    |> cast(attrs, [:sample_id])
    |> validate_required([:sample_id])
    |> cast_embed(:content, with: &content_changeset/2)
  end

  defp content_changeset(schema, params) do
    schema
    |> cast(params, LimsClient.Ecto.MetaData.fields())
  end
end
