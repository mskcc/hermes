defmodule VoyagerWeb.SessionController do
  use VoyagerWeb, :controller

  alias Domain.Accounts
  alias Dashboard.UserAuth

  import UserMessages

  @user_key "user"

  def new(conn, _params) do
    render(conn,"login.html", form_key: @user_key)
  end

  def create(conn, %{@user_key => user_params}) do
    %{"username" => username, "password" => password} = user_params

    case Accounts.get_user_by_email_and_password_verbose(username, password) do
      {:ok, data} ->
        UserAuth.log_in_user(conn, data.access_token, user_params)
      {:error,type, message} ->
        case type do
          :user_error ->
            conn
            |> put_status(400)
            |> json(message)
          _ ->
            conn
            |> put_status(500)
            |> json(message)
        end
    end
  end

  def delete(conn, _params) do
    conn
    |> put_flash(:success, UserMessages.const_log_out_message)
    |> UserAuth.log_out_user()
  end
end
