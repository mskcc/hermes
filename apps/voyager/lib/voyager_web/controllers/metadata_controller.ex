defmodule VoyagerWeb.MetadataController do
  use VoyagerWeb, :controller

  import FilesQuery
  import SampleSearch
  import RequestSearch

  @metadata_key "metadata"
  @type_key "type"
  @search_key "search"
  @id_keys [
    ["primaryId", "Primary ID"],
    ["cmoSampleName", "CMO Sample Name"],
    ["igoRequestId", "Igo Request"]
  ]
  @initial_id_type "igoRequestId"

  def new(conn, _params) do
    render(conn, "input.html",
      form_key: @metadata_key,
      search_key: @search_key
    )
  end

  def list(conn, %{@type_key => metadata_type}) do
    user_token = conn.assigns.current_user.access_token

    response_obj =
      %FilesQuery{values_metadata: metadata_type, page_size: 100_000}
      |> BeagleClient.list_all_query_files(user_token)

    case response_obj do
      {:ok, :ok, response} ->
        json(conn, response)

      {:error, :user_error, message} ->
        conn
        |> put_status(400)
        |> json(message)

      {:error, _, message} ->
        conn
        |> put_status(500)
        |> json(message)
    end
  end

  def search(conn, %{@search_key => searchQuery}) do
    user_token = conn.assigns.current_user.access_token

    sample_search_list_obj =
      %SampleSearch{search: searchQuery, page_size: 200}
      |> BeagleClient.search_samples(user_token)
      |> case do
        {:ok, :ok, %{"results" => result_list}} -> %{data: result_list, loaded: true}
        {_, _, _} -> %{data: [], loaded: false}
      end

    request_search_list_obj =
      %RequestSearch{search: searchQuery, page_size: 200}
      |> BeagleClient.search_requests(user_token)
      |> case do
        {:ok, :ok, %{"results" => result_list}} -> %{data: result_list, loaded: true}
        {_, _, _} -> %{data: [], loaded: false}
      end

    error_message =
      cond do
        sample_search_list_obj[:loaded] == false && request_search_list_obj[:loaded] == false ->
          UserMessages.const_server_down()

        sample_search_list_obj[:loaded] == false ->
          UserMessages.const_resource_not_loaded("Sample")

        request_search_list_obj[:loaded] == false ->
          UserMessages.const_resource_not_loaded("Request")

        true ->
          nil
      end

    combined_search_list = sample_search_list_obj[:data] ++ request_search_list_obj[:data]

    search_data =
      combined_search_list
      |> Enum.map(fn single_search_obj ->
        Enum.map(single_search_obj, fn {key, value} ->
          case key do
            "request_id" when value != nil ->
              %{:title => value, :type => "Request", :field => "igoRequestId"}

            "sample_id" when value != nil ->
              %{:title => value, :type => "Sample Id", :field => "primaryId"}

            "sample_name" when value != nil ->
              %{:title => value, :type => "Sample Name", :field => "cmoSampleName"}

            _ ->
              nil
          end
        end)
      end)
      |> Enum.reduce([], fn single_suggestion_obj, acc -> single_suggestion_obj ++ acc end)
      |> Enum.reject(&is_nil/1)
      |> Enum.filter(fn %{:title => option_title} ->
        String.starts_with?(option_title, searchQuery)
      end)
      |> Enum.uniq()
      |> Enum.sort(fn %{:type => first_type}, %{:type => second_type} ->
        first_type < second_type
      end)

    json(conn, %{search: search_data, message: error_message})
  end

  def patch(conn, %{@metadata_key => metadata_params}) do
    %{"id" => id, "type" => type} = metadata_params
    url_params = %{type => id}

    conn
    |> redirect(to: Routes.metadata_path(conn, :index, url_params))
  end
end
