defmodule SampleSearch do
  @moduledoc """
  A struct representing parameters to search for samples
  """
  use TypedStruct

  typedstruct do
    @typedoc "parameters to search for samples"

    field(:page, non_neg_integer(), default: 1)
    field(:page_size, non_neg_integer())
    field(:search, String.t())
  end
end
