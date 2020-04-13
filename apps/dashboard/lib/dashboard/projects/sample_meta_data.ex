defmodule Dashboard.Projects.SampleMetaData do
  use Ecto.Schema
  import Ecto.Changeset

  schema "sample_meta_data" do
    field :lims, :map

    # embeds_one :price, Price, on_replace: :delete do
    #  field :amount, Drycargo.Finance.Types.Amount
    #  field :currency, :string, default: "USD"
    # end

    timestamps()
  end

  @doc false
  def changeset(sample_meta_data, attrs) do
    sample_meta_data
    |> cast(attrs, [:lims])
    |> validate_required([:lims])
  end
end
