defmodule Register do
  @moduledoc """
  A struct representing parameters to register a user
  """
  use TypedStruct

  typedstruct do
  	@typedoc "parameters to register a user"

  	field :username, String.t()
  	field :first_name, String.t()
  	field :last_name, String.t()

  end



end