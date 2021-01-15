defmodule SubmitRun do
  @moduledoc """
  A struct representing parameters to submit a run
  """
  use TypedStruct

  typedstruct do

  	field :pipeline_id, String.t()
  	field :request_id, String.t()

  end



end