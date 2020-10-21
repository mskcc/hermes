defmodule Domain.Queue.Job do
  import Ecto.Changeset
  def filter_changeset(params) do
    data = %{}

    filter_types = %{
      state: :string,
      queue: :string
    }

    {data, filter_types}
    |> cast(params, Map.keys(filter_types))
  end
end
