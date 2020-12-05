defmodule BeagleClient do
  import FilesQuery
  import FileGroupsList
  import BatchPatchFiles


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


  def list_all_file_groups(token) do
    list_all(BeagleEndpoint.const_file_groups, [], token)
  end

  def list_all_query_files(%FilesQuery{} = file_query_struct, token) do
    query_key_list = process_query_struct(file_query_struct)
    list_all(BeagleEndpoint.const_file_query, query_key_list, token)
  end

  def batch_patch_files(%BatchPatchFiles{} = batch_patch_struct, token) do
    batch_patch_payload = Map.from_struct(batch_patch_struct)
    client(token)
      |> Tesla.post(BeagleEndpoint.const_batch_patch_files, batch_patch_payload)
      |> handle_response

  end

  def file_groups(%FileGroupsList{} = file_group_list, token) do
    query_key_list = process_query_struct(file_group_list)
    client(token)
      |> Tesla.get(BeagleEndpoint.const_file_groups, query: query_key_list)
      |> handle_response
  end

  def query_files(%FilesQuery{} = file_query_struct, token) do
    query_key_list = process_query_struct(file_query_struct)
    client(token)
      |> Tesla.get(BeagleEndpoint.const_file_query, query: query_key_list)
      |> handle_response
  end

  defp list_all(endpoint, query, token) do
    response_obj = client(token)
      |> Tesla.get(endpoint, query: query )
      |> handle_response
    case response_obj do
      {:ok, :ok, %{"results" => results, "next" => next}} when not is_nil(next) ->
          {_, next_query} = Keyword.get_and_update(query, :page, &({&1, &1 +1}))
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
      {:error, error_type, error_message} -> {:error, error_type, error_message}
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
    Enum.map(map, fn({key, value}) -> {key, value} end)
  end

  def fetch_pipelines(client) do
    client
      |> Tesla.get("/v0/run/pipelines/", query: [page: 1, per_page: 100])
      |> handle_response
  end

  @doc false
  def fetch_auth_token(username, password), do: fetch_auth_token(client(), username, password)

  def fetch_auth_token(client, username, password) do
      client
      |> Tesla.post("/api-token-auth/", Jason.encode!(%{username: username, password: password}))
      |> handle_response
  end

  @doc false
  def validate_auth_token(token), do: validate_auth_token(client(), token)

  def validate_auth_token(client, token) do
      client
      |> Tesla.post("/api-token-verify/", Jason.encode!(%{token: token}))
      |> handle_response
  end

  @doc false
  def refresh_auth_token(token), do: refresh_auth_token(client(), token)

  def refresh_auth_token(client, token) do
      client
      |> Tesla.post("/api-token-refresh/", Jason.encode!(%{refresh: token}))
      |> handle_response
  end

  def client(token) when is_binary(token) do
    middleware = [
      {Tesla.Middleware.BaseUrl, Application.fetch_env!(:beagle_client, :url)},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Headers,
       [{"Authorization", "Bearer " <> token}]}
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
      %{status: n} when n in 200..299 ->
        {:ok, :ok, response.body}

      %{status: n} when n in [404] ->
        if String.contains?(response.body,"Phoenix.Router.NoRouteError") do
          {:error, :server_error, UserMessages.const_server_down }
        else
          {:error, :user_error, "Resource not found"}
        end

      %{status: n, body: body} when is_map_key(body, "detail") ->
        message = Map.get(body, "detail")
        case n do
          status_code when status_code in 400..499 ->
            {:error, :user_error, message }
          status_code when status_code in 500..599 ->
            {:error, :server_error, message }
          _ ->
            {:error, :unexpected_error, message }
        end


      %{status: n} when n in 400..499 ->
        {:ok, :user_error, response.body}




      {:error, error} ->
        IO.inspect error
        {:error, :unexpected_error, error}

      _ ->
        IO.inspect {:error, :unexpected_error, {response.status, response.body}}
        {:error, :unexpected_error, {response.status, response.body}}
    end
  end
end
