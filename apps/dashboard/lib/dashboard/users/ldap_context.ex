defmodule Dashboard.Users.LDAPContext do
  use Pow.Ecto.Context,
    repo: Dashboard.Repo,
    user: Dashboard.Users.User

  def authenticate(params) do
    IO.inspect(params)
    # hmm = Paddle.get(filter: :eldap.substrings('sAMAccountName', initial: 'fraihaa@mskcc.org'))
    # IO.inspect(hmm)
    case Paddle.authenticate(params["email"], params["password"]) do
      {:ok} ->
        IO.inspect("We're good")

      {:error, message} ->
        IO.inspect("Wuh oh")
        IO.inspect(message)
        {:error}
    end
  end
end
