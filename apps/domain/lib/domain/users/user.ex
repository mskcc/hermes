defmodule Domain.Accounts.User do
  @moduledoc false
  use Domain.Schema

  schema "users" do
    field(:access_token, :string)
    field(:refresh_token, :string)
    field(:email, :string)
    field(:first_name, :string)
    field(:last_name, :string)

    timestamps(type: :utc_datetime)
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :access_token, :refresh_token, :first_name, :last_name])
    |> validate_required([:email])
  end
end
