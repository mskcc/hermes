defmodule Dashboard.Users.LDAPContext do
  use Pow.Ecto.Context,
    repo: Dashboard.Repo,
    user: Dashboard.Users.User

  def authenticate(params) do
    [username, _] = String.split(params["email"], "@")

    case Paddle.authenticate(username, params["password"]) do
      :ok ->
        {:ok, user} = get_or_create(params)
        user

      {:error, message} ->
        nil
    end
  end

  defp get_or_create(params) do
    keyword = [email: params["email"]]

    case get_by(keyword) do
      nil ->
        password = generate_fake_password()

        create(%{
          email: params["email"],
          password_confirmation: password,
          password: password
        })

      user ->
        {:ok, user}
    end
  end

  defp generate_fake_password() do
    length = 64
    :crypto.strong_rand_bytes(length) |> Base.encode64() |> binary_part(0, length)
  end
end
