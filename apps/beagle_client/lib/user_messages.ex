defmodule UserMessages do
  @moduledoc """
  Module to handle messages returned to the user
  """
  import BeagleClient.Gettext

  @doc """
  Error message when the server is down
  """
  def const_server_down,
    do:
      gettext(
        "Oops! It looks like our servers are down. We are working on bringing them back up as soon as possible."
      )

  @doc """
  Error message when a resource unexpectedly does not load
  """
  def const_resource_not_loaded(type) do
    gettext("Sorry! We were unable to load ") <> type <> gettext(" data.")
  end

  @doc """
  Error message when a resource query returns no results
  """
  def resourceNotFound(params, type) do
    key_error_message =
      params
      |> Enum.map_join(", ", fn {key, val} -> "#{key}: #{val}" end)

    gettext("Oh no! We could not find any ") <>
      type <> gettext(" associated with: ") <> key_error_message
  end

  @doc """
  Error message when a resource query is not recognized/supported
  """
  def queryNotRecognized(key_list) do
    gettext("Sorry! We do not recognize the ") <>
      ngettext("option: ", "options: ", length(key_list)) <>
      Enum.join(key_list, ", ")
  end

  @doc """
  Response after successfully sending in a register request
  """
  def const_register_success_response,
    do:
      gettext(
        "Nice! We received your registration request. You should receive an email once its approved by one of our admins."
      )

  @doc """
  Log out message
  """
  def const_log_out_message, do: gettext("Logged out successfully.")

  @doc """
  Run successfully submitted message
  """
  def const_run_submmitted_message,
    do: gettext("Awesome! Your run has been successfully submitted")

  @doc """
  No metadata changes ready to publish
  """
  def const_no_metadata_changes_ready,
    do: gettext("Hmmm, it looks like there are no changes ready to publish")

  @doc """
  No QC report data to show
  """
  def const_no_qc_report_data,
    do: gettext("Hmmm, there is no qc report data to show for this sample")
end
