defmodule FileGroupsList do
  @moduledoc """
  A struct representing parameters to list file groups
  """
  use TypedStruct

  typedstruct do

  	field :page, non_neg_integer(), default: 1
  	field :page_size, non_neg_integer()

  end

end