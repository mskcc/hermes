defmodule Domain.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :password_hash, :string
      add :role, RoleEnum.type()

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
  end
end
