defmodule FilesQuery do
  @moduledoc """
  A struct representing parameters to query files
  """
  use TypedStruct

  typedstruct do

  	field :page, non_neg_integer()
  	field :page_size, non_neg_integer()
  	field :file_group, list(String.t())
  	field :path, list(String.t())
  	field :metadata, list(String.t())
  	field :metadata_regex, list(String.t())
  	field :path_regex, String.t()
  	field :filename, list(String.t())
  	field :filename_regex, String.t()
  	field :file_type, list(String.t())
  	field :values_metadata, list(String.t())
  	field :metadata_distribution, String.t()
  	field :count, non_neg_integer()
  	field :created_date_timedelta, non_neg_integer()
  	field :created_date_gt, non_neg_integer()
  	field :modified_date_timedelta, non_neg_integer()
  	field :modified_date_gt, non_neg_integer()
  	field :modified_date_lt, non_neg_integer()

  end



end