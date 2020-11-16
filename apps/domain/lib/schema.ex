defmodule Domain.Schema do
  @moduledoc "Ecto Schema Helpers"

  defmacro __using__(_) do
    quote do
      import Ecto.Changeset
      use Ecto.Schema
      @primary_key {:id, :binary_id, autogenerate: true}
      @foreign_key_type :binary_id
    end
  end
end
