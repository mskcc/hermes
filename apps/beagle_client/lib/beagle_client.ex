defmodule BeagleClient do
  use Tesla
  import BeagleEndpoint
  import FilesQuery
  import FileGroupsList
  import BatchPatchFiles

  plug(Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url))

  plug(Tesla.Middleware.BasicAuth,
    username: Application.fetch_env!(:beagle_client, :username),
    password: Application.fetch_env!(:beagle_client, :password)
  )

  plug(Tesla.Middleware.DecodeJson)

  @moduledoc """
  Documentation for `BeagleClient`.
  """

  @doc """
  Send notification

  ## Examples

      iex> result = BeagleClient.fetch_pipelines(client)
      ...> with {_, %Tesla.Env{}} <- result, do: :passed
      iex> :passed
  """

  def list_all_file_groups() do
    list_all(BeagleEndpoint.const_file_groups, query: [])
  end

  def batch_patch_files(%BatchPatchFiles{} = batch_patch_struct) do
    batch_patch_payload = Map.from_struct(batch_patch_struct)
    post(BeagleEndpoint.const_batch_patch_files, batch_patch_payload)

  end

  def list_file_groups(%FileGroupsList{} = file_group_list) do
    query_key_list = process_query_struct(file_group_list)
    get(BeagleEndpoint.const_file_groups, query: query_key_list)
  end

  def query_files(%FilesQuery{} = file_query_struct) do
    query_key_list = process_query_struct(file_query_struct)
    get(BeagleEndpoint.const_file_query, query: query_key_list)
  end

  defp list_all(endpoint, query) do
    {:ok, response} = get(endpoint, query: query )
    if not is_nil(response.body.next) do
      {_, next_query} = Keyword.get_and_update(query, :page, &({&1, &1 +1}))
      response.body.results ++ list_all(endpoint, next_query)
    end
  end

  defp process_query_struct(query_struct) do
    query_struct
        |> remove_nil_values
        |> convert_to_klist
  end

  defp remove_nil_values(query_struct) do
    query_struct
      |> Map.from_struct
      |> Enum.reject(fn {_, v} -> is_nil(v) end)
      |> Map.new
  end

  defp convert_to_klist(map) do
    Enum.map(map, fn({key, value}) -> {String.to_existing_atom(key), value} end)
  end

  def get_sample_manifest(sample_id) when is_binary(sample_id),
    do: get_sample_manifest([sample_id])

  def fetch_pipelines(client) do
    request = client |> Tesla.get("/v0/run/pipelines/", query: [page: 1, per_page: 100])

    handle_response(request)
  end

  @doc false
  def fetch_auth_token(username, password), do: fetch_auth_token(client(), username, password)

  def fetch_auth_token(client, username, password) do
    request =
      client
      |> Tesla.post("/api-token-auth/", Jason.encode!(%{username: username, password: password}))

    handle_response(request)
  end

  @doc false
  def validate_auth_token(token), do: validate_auth_token(client(), token)

  def validate_auth_token(client, token) do
    request =
      client
      |> Tesla.post("/api-token-verify/", Jason.encode!(%{token: token}))

    handle_response(request)
  end

  @doc false
  def refresh_auth_token(token), do: refresh_auth_token(client(), token)

  def refresh_auth_token(client, token) do
    request =
      client
      |> Tesla.post("/api-token-refresh/", Jason.encode!(%{refresh: token}))

    handle_response(request)
  end

  def client(token) when is_binary(token) do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers,
       [{"authorization", "Bearer: " <> token}, {"content-type", "application/json"}]}
    ]

    Tesla.client(middleware)
  end

  def client do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers, [{"content-type", "application/json"}]}
    ]

    Tesla.client(middleware)
  end

  defp handle_response(request) do
    response =
      case request do
        {:ok, response} -> response
        response -> response
      end

    case response do
      %{status: n} when n in [200, 201] ->
        {:ok, response.body}

      {:error, error} ->
        {:error, error}

      _ ->
        {:error, {response.status, response.body}}
    end
  end
end
