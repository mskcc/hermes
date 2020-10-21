defmodule Domain.Repo do
  use Ecto.Repo,
    otp_app: :domain,
    adapter: Ecto.Adapters.Postgres

  use ExAudit.Repo
end
