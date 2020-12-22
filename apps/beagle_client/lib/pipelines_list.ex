defmodule PipelinesList do
  @moduledoc """
  A struct representing parameters to list pipelines
  """
  use TypedStruct

  typedstruct do
  	@typedoc "parameters to list pipelines"

  	field :page, non_neg_integer(), default: 1
  	field :page_size, non_neg_integer(), default: 100

  end

end