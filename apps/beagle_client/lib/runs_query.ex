defmodule RunsQuery do
  @moduledoc """
  A struct representing parameters to query runs
  """
  use TypedStruct

  typedstruct do
    field(:page, non_neg_integer(), default: 1)
    field(:page_size, non_neg_integer())
    field(:status, String.t())
    field(:job_groups, list(String.t()))
    field(:apps, list(String.t()))
    field(:ports, list(String.t()))
    field(:tags, list(String.t()))
    field(:request_ids, list(String.t()))
    field(:jira_ids, list(String.t()))
    field(:run_ids, list(String.t()))
    field(:values_run, list(String.t()))
    field(:run_distribution, String.t())
    field(:run, list(String.t()))
    field(:full, boolean())
    field(:count, boolean())
    field(:created_date_timedelta, non_neg_integer())
    field(:created_date_gt, String.t())
    field(:created_date_lt, String.t())
    field(:modified_date_timedelta, non_neg_integer())
    field(:modified_date_gt, String.t())
    field(:modified_date_lt, String.t())
  end
end
