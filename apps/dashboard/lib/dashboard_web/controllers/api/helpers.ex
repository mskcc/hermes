defmodule Dashboard.Controllers.Api.Helpers do
  import Plug.Conn
  import Phoenix.Controller

  def api_response(conn, updates) do
    case updates do
      {:ok, _job} ->
        conn
        |> send_resp(201, "")

      :noop ->
        conn
        |> send_resp(201, "")

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(400)
        |> render(conn, "400.json", changeset: changeset)
    end
  end
end
