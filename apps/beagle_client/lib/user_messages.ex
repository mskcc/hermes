defmodule UserMessages do
  @moduledoc """
  Module to handle messages returned to the user
  """
  	@doc """
  	Error message when the server is down
  	"""
	def const_server_down, do: "Oops! It looks like our servers are down. We are working on bringing them back up as soon as possible."

	@doc """
	Error message when a resource query returns no results
	"""
	def resourceNotFound(params, type) do
		key_error_message = params
			|> Enum.map_join(", ", fn {key, val} -> "#{key}: #{val}" end)
		"Oh no! We could not find any " <> type <> " associated with: " <> key_error_message
	end

	@doc """
	Error message when a resource query is not recognized/supported
	"""
	def queryNotRecognized(key_list) do

		message_start = "Sorry! We do not recognize the "
		case key_list do
			key_list when length(key_list) == 1 ->
				message_start <> "option: " <> Enum.at(key_list,0)
			key_list ->
				message_start <> "options: " <> Enum.join(key_list,", ")
		end
	end

	@doc """
	Response after successfully sending in a register request
	"""
	def const_register_success_response, do: "Nice! We received your registration request. You should receive an email once its approved by one of our admins."

	@doc """
	Log out message
	"""
	def const_log_out_message, do: "Logged out successfully."


end