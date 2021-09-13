defmodule BeagleClient do
  import FilesQuery
  import FileGroupsList
  import Register
  import PipelinesList
  import SubmitRun
  import Pipelines
  import BatchPatchFiles
  import RunsQuery
  import SampleSearch
  import RequestSearch

  @moduledoc """
  Module to interact with Beagle
  ### API response
  API calls return a type BeagleResponse
  {status, status_detail, response}
  #### status possiple values:
   - :ok
   - :error

  #### status_detail possiple values:
   - :ok
   - :user_error
   - :unexpected_error
   - :server_error

  #### response possible values:
   - response data (obj)
   - error message (string)
   - error tuple (http status (int), error body (string))
  """

  @doc """
  List all beagle file groups

  ## Parameters

    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def list_all_file_groups(token) do
    list_all(BeagleEndpoint.const_file_groups(), [], token)
  end

  @doc """
  List all beagle files from a file query

  ## Parameters

    - file_query_struct(FilesQuery): FileQuery struct
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse


  """
  def list_all_query_files(%FilesQuery{} = file_query_struct, token) do
    query_key_list = process_query_struct(file_query_struct)
    list_all(BeagleEndpoint.const_file_query(), query_key_list, token)
  end

  @doc """
  List all beagle runs from a run query

  ## Parameters

    - run_query_struct(RunsQuery): RunsQuery object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def list_all_query_runs(%RunsQuery{} = runs_query_struct, token) do
    query_key_list = process_query_struct(runs_query_struct)
    list_all(BeagleEndpoint.const_run_query(), query_key_list, token)
  end

  @doc """
  List all beagle pipelines from a pipeline query

  ## Parameters

    - pipeline_query_struct(Pipelines): Pipelines object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def list_all_pipelines(%Pipelines{} = pipeline_query_struct, token) do
    query_key_list = process_query_struct(pipeline_query_struct)
    list_all(BeagleEndpoint.const_pipeline(), query_key_list, token)
  end

  @doc """
  Batch patch files

  ## Parameters

    - batch_patch_struct(BatchPatchFiles): BatchPatchFiles struct
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def batch_patch_files(%BatchPatchFiles{} = batch_patch_struct, token) do
    batch_patch_payload = Map.from_struct(batch_patch_struct)

    client(token)
    |> Tesla.post(BeagleEndpoint.const_batch_patch_files(), batch_patch_payload)
    |> handle_response
  end

  @doc """
  Query File groups

  ## Parameters

    - file_group_list(FileGroupsList): FileGroupsList struct
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def file_groups(%FileGroupsList{} = file_group_list, token) do
    query_key_list = process_query_struct(file_group_list)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_file_groups(), query: query_key_list)
    |> handle_response
  end

  @doc """
  Query Pipelines

  ## Parameters

    - pipeline_query_struct(Pipelines): Pipelines object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def pipelines(%Pipelines{} = pipeline_query_struct, token) do
    query_key_list = process_query_struct(pipeline_query_struct)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_file_query(), query: query_key_list)
    |> handle_response
  end

  @doc """
  Submit a run

  ## Parameters

    - run_struct(Runs): Runs object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def submit_run(%SubmitRun{} = run_struct, token) do
    run_payload = Map.from_struct(run_struct)

    client(token)
    |> Tesla.post(BeagleEndpoint.const_submit_run(), run_payload)
    |> handle_response
  end

  @doc """
  Query Files

  ## Parameters

    - file_query_struct(FilesQuery): FilesQuery object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def query_files(%FilesQuery{} = file_query_struct, token) do
    query_key_list = process_query_struct(file_query_struct)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_file_query(), query: query_key_list)
    |> handle_response
  end

  @doc """
  Search Samples

  ## Parameters

    - sample_search_struct(SampleSearch): SampleSearch object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def search_samples(%SampleSearch{} = sample_search_struct, token) do
    query_key_list = process_query_struct(sample_search_struct)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_sample_search(), query: query_key_list)
    |> handle_response
  end

  @doc """
  Search Requests

  ## Parameters

    - request_search_struct(RequestSearch): SampleSearch object
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def search_requests(%RequestSearch{} = request_search_struct, token) do
    query_key_list = process_query_struct(request_search_struct)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_request_search(), query: query_key_list)
    |> handle_response
  end

  @doc """
  Register a user

  ## Parameters

    - register_struct(Register): Register struct

  ## Returns

    - BeagleResponse

  """
  def register_user(%Register{} = register_struct) do
    register_payload = Map.from_struct(register_struct)

    client()
    |> Tesla.post(BeagleEndpoint.const_register(), register_payload)
    |> handle_response
  end

  @doc """
  Query Runs

  ## Parameters

    - run_query_struct(RunsQuery): RunsQuery object
    - token(string): Beagle authentication token

  """
  def query_runs(%RunsQuery{} = run_query_struct, token) do
    query_key_list = process_query_struct(run_query_struct)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_run_query(), query: query_key_list)
    |> handle_response
  end

  defp list_all(endpoint, query, token) do
    response_obj =
      client(token)
      |> Tesla.get(endpoint, query: query)
      |> handle_response

    case response_obj do
      {:ok, :ok, %{"results" => results, "next" => next}} when not is_nil(next) ->
        {_, next_query} = Keyword.get_and_update(query, :page, &{&1, &1 + 1})

        case list_all(endpoint, next_query, token) do
          {:ok, :ok, next_results} ->
            results =
              results
              |> Enum.reject(&is_nil/1)

            combined_results = results ++ next_results
            {:ok, :ok, combined_results}

          {:error, error_type, error_message} ->
            {:error, error_type, error_message}
        end

      {:ok, :ok, %{"results" => results, "next" => next}} when is_nil(next) ->
        results =
          results
          |> Enum.reject(&is_nil/1)

        {:ok, :ok, results}

      {:error, error_type, error_message} ->
        {:error, error_type, error_message}
    end
  end

  defp process_query_struct(query_struct) do
    query_struct
    |> remove_nil_values
    |> convert_to_klist
  end

  defp remove_nil_values(query_struct) do
    query_struct
    |> Map.from_struct()
    |> Enum.reject(fn {_, v} -> is_nil(v) end)
    |> Map.new()
  end

  defp convert_to_klist(map) do
    Enum.map(map, fn {key, value} -> {key, value} end)
  end

  @doc """
  Query Pipelines

  ## Parameters

    - pipelines_query_struct(PipelinesList): PipelinesList struct
    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def fetch_pipelines(%PipelinesList{} = pipelines_query_struct, token) do
    query_key_list = process_query_struct(pipelines_query_struct)

    client(token)
    |> Tesla.get(BeagleEndpoint.const_fetch_pipelines(), query: query_key_list)
    |> handle_response
  end

  @doc """
  Fetch auth token

  ## Parameters

    - username(string): login username
    - password(string): login password

  ## Returns

    - BeagleResponse

  """
  def fetch_auth_token(username, password), do: fetch_auth_token(client(), username, password)

  defp fetch_auth_token(client, username, password) do
    client
    |> Tesla.post(
      BeagleEndpoint.const_fetch_auth_token(),
      Jason.encode!(%{username: username, password: password})
    )
    |> handle_response
  end

  @doc """
  Validate auth token

  ## Parameters

    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def validate_auth_token(token), do: validate_auth_token(client(), token)

  defp validate_auth_token(client, token) do
    client
    |> Tesla.post(BeagleEndpoint.const_validate_auth_token(), Jason.encode!(%{token: token}))
    |> handle_response
  end

  @doc """
  Refresh auth token

  ## Parameters

    - token(string): Beagle authentication token

  ## Returns

    - BeagleResponse

  """
  def refresh_auth_token(token), do: refresh_auth_token(client(), token)

  defp refresh_auth_token(client, token) do
    client
    |> Tesla.post(BeagleEndpoint.const_refresh_auth_token(), Jason.encode!(%{refresh: token}))
    |> handle_response
  end

  defp client(token) when is_binary(token) do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers, [{"Authorization", "Bearer " <> token}]}
    ]

    Tesla.client(middleware)
  end

  defp client do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers, [{"content-type", "application/json"}]}
    ]

    Tesla.client(middleware)
  end

  defp handle_response(request) do
    IO.inspect(request)

    response =
      case request do
        {:ok, response} -> response
        response -> response
      end

    case response do
      %{status: n} when n in 200..299 ->
        {:ok, :ok, response.body}

      %{status: n} when n in [404] ->
        if String.contains?(response.body, "Phoenix.Router.NoRouteError") do
          {:error, :server_error, UserMessages.const_server_down()}
        else
          {:error, :user_error, "Resource not found"}
        end

      %{status: n, body: body} when is_map_key(body, "detail") ->
        message = Map.get(body, "detail")

        case n do
          status_code when status_code in 400..499 ->
            {:error, :user_error, message}

          status_code when status_code in 500..599 ->
            {:error, :server_error, message}

          _ ->
            {:error, :unexpected_error, message}
        end

      %{status: n} when n in 400..499 ->
        {:error, :user_error, response.body}

      {:error, error} ->
        case error do
          :econnrefused ->
            {:error, :server_error, UserMessages.const_server_down()}

          _ ->
            IO.inspect(error)
            {:error, :unexpected_error, error}
        end

      _ ->
        IO.inspect({:error, :unexpected_error, {response.status, response.body}})
        {:error, :unexpected_error, {response.status, response.body}}
    end
  end
end
