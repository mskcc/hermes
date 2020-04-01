defmodule Dashboard.Users.User do
  use Ecto.Schema
  use Pow.Ecto.Schema

  @default_role RoleEnum.__enum_map__()[:regular]

  schema "users" do
    pow_user_fields()
    field :role, RoleEnum, default: @default_role

    timestamps(type: :utc_datetime)
  end

  @spec changeset_role(Ecto.Schema.t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
  def changeset_role(user_or_changeset, attrs) do
    user_or_changeset
    |> Ecto.Changeset.cast(attrs, [:role])
    |> Ecto.Changeset.validate_inclusion(:role, RoleEnum.__valid_values__())
  end
end
