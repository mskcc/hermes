defmodule VoyagerWeb.RegisterController do
  use VoyagerWeb, :controller
  import Register
  import UserMessages

  @new_user_key "new_user"

  def new(conn, _params) do
    render(conn,"input.html", form_key: @new_user_key )
  end

  def register(conn, %{@new_user_key => new_user_params}) do
    %{"username" => username, "first_name" => first_name, "last_name" => last_name} = new_user_params
    %Register{username: username, first_name: first_name, last_name: last_name}
      |> BeagleClient.register_user
      |> case do
        {:ok, :ok, _response} ->
          conn
            |> put_status(200)
            |> json("")
        {:error, :user_error, message} ->
          updated_message = Enum.reduce message, %{}, fn {key, value}, acc ->
            case value do
              value when is_list(value) ->
                value_str = Enum.join(value, " ")
                Map.put(acc, key, value_str)
              value ->
                Map.put(acc, key, value)
            end
          end
          conn
            |> put_status(400)
            |> json(updated_message)
        {:error, _, message} ->
          conn
            |> put_status(500)
            |> json(message)
      end

  end

  def success(conn, _params) do
    conn
      |> put_flash(:success, UserMessages.const_register_success_response)
      |> redirect(to: Routes.session_path(conn, :new))
  end

end
