defmodule VoyagerWeb.MetadataController do
  use VoyagerWeb, :controller

   import FilesQuery


  @metadata_key "metadata"
  @type_key "type"
  @id_keys [["sampleId","Sample"],["requestId","Request"]]
  @initial_id_type "requestId"

  def new(conn, _params) do
    render(conn, "input.html", form_key: @metadata_key, id_keys: @id_keys, initial_id_type: @initial_id_type, type_key: @type_key)
  end

  def list(conn, %{@type_key => metadata_type}) do
    user_token = conn.assigns.current_user.access_token
    response_obj = %FilesQuery{values_metadata: metadata_type, page_size: 5000}
      |> BeagleClient.list_all_query_files(user_token)
    case response_obj do
      {:ok, :ok, response} -> json(conn, response)
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

  def patch(conn, %{@metadata_key => metadata_params}) do
    %{"id" => id, "type" => type} = metadata_params
    url_params = %{type => id}
    conn
      |> redirect(to: Routes.metadata_path(conn, :index, url_params))


  end

end
