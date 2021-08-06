defmodule SubmitRun do
  @moduledoc """
  A struct representing parameters to submit a run
  """
  use TypedStruct

  typedstruct do
    field(:pipeline, String.t())
    field(:request_ids, String.t())
  end
end
