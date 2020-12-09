defmodule BatchPatchFiles do
  @moduledoc """
  A struct representing parameters to batch patch files
  """
  use TypedStruct

  typedstruct do

  	field :patch_files, list(map())

  end



end