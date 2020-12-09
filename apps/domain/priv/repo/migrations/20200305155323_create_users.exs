defmodule Domain.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :refresh_token, :text
      add :access_token, :text
      add :first_name, :string
      add :last_name, :string

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
  end
end
