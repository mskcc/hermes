defmodule BatchPatchFiles do
  @moduledoc """
  A struct representing parameters to batch patch files
  """
  use TypedStruct

  typedstruct do
  	@typedoc "parameters to batch patch files"

  	field :patch_files, list(map())

  end



end