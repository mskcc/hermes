defmodule LimsClient.Ecto.MetaData do
  use Ecto.Schema

  @fields [
    :bait_set,
    :cf_dna_2d_barcode,
    :cmo_patient_id,
    :cmo_sample_class,
    :cmo_sample_name,
    :collection_year,
    :igo_id,
    :investigator_sample_id,
    :onco_tree_code,
    :preservation,
    :sample_name,
    :sample_origin,
    :sex,
    :species,
    :specimen_type,
    :tissue_location,
    :tumor_or_normal
  ]
  def fields, do: @fields

  @primary_key false
  @derive {Jason.Encoder, only: @fields}
  embedded_schema do
    field(:bait_set, :string)
    field(:cf_dna_2d_barcode, :string)
    field(:cmo_patient_id, :string)
    field(:cmo_sample_class, :string)
    field(:cmo_sample_name, :string)
    field(:collection_year, :string)
    field(:igo_id, :string)
    field(:investigator_sample_id, :string)
    # field :libraries, :array
    field(:onco_tree_code, :string)
    field(:preservation, :string)
    # field :qc_reports, :array
    field(:sample_name, :string)
    field(:sample_origin, :string)
    field(:sex, :string)
    field(:species, :string)
    field(:specimen_type, :string)
    field(:tissue_location, :string)
    field(:tumor_or_normal, :string)
  end
end
