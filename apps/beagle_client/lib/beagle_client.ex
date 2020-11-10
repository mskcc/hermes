defmodule BeagleClient do
  use Tesla, only: ~w(get)a
  import BeagleEndpoint
  import FilesQuery
  import FileGroupsList

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
  Get Sample Manifest

  ## Examples

      iex> result = BeagleClient.get_sample_manifest("1000")
      ...> with {_, %Tesla.Env{}} <- result, do: :passed
      iex> :passed
  """

  def list_all_file_groups() do
    list_all(BeagleEndpoint.const_file_groups, query: [])
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

  def get_sample_manifest(sample_id) when is_list(sample_id) do
    get("/api/getSampleManifest")
  end
end
