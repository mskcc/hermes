defmodule Voyager.Repo do
  use Ecto.Repo,
    otp_app: :voyager,
    adapter: Ecto.Adapters.Postgres
end
