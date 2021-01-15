defmodule BeagleEndpoint do
	@moduledoc """
	Contains the endpoint routes used in Beagle
	"""
	@doc """
	File query route
	"""
	def const_file_query, do: "/v0/fs/files/"
	@doc """
	File groups route
	"""
	def const_file_groups, do: "/v0/fs/file-groups/"
	@doc """
	Assay route
	"""
	def const_assay, do: "/v0/etl/assay"
	@doc """
	Batch patch files route
	"""
	def const_batch_patch_files, do: "/v0/fs/batch-patch-files"
	@doc """
	Pipelines route
	"""
	def const_fetch_pipelines, do: "/v0/run/pipelines/"
	@doc """
	Route to fetch auth token
	"""
	def const_fetch_auth_token, do: "/api-token-auth/"
	@doc """
	Route to verify token
	"""
	def const_validate_auth_token, do: "/api-token-verify/"
	@doc """
	Route to refresh token
	"""
	def const_refresh_auth_token, do: "/api-token-refresh/"
	@doc """
	Route to register a user
	"""
	def const_register, do: "/register/"
	@doc """
	Route to submit a run
	"""
	def const_submit_run, do: "/v0/run/runs/"
	@doc """
	Route to fetch pipelines
	"""
	def const_pipeline, do: "/v0/run/pipelines/"
	@doc """
	Route to fetch runs
	"""
	def const_run_query, do: "/v0/run/api/"

end