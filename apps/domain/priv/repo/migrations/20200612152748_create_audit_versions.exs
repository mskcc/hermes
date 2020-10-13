defmodule Domain.Repo.Migrations.CreateAuditVersions do
  use Ecto.Migration

  def change do
    create table(:audit_versions) do
      add :patch, :binary

      # supports UUID and other types as well
      add :entity_id, :integer

      # name of the table the entity is in
      add :entity_schema, :string

      # type of the action that has happened to the entity (created, updated, deleted)
      add :action, :string

      # when has this happened
      add :recorded_at, :utc_datetime_usec

      # was this change part of a rollback?
      add :rollback, :boolean, default: false

      # optional fields that you can define yourself
      # for example, it's a good idea to track who did the change
      add :actor_id, references(:users, on_update: :update_all, on_delete: :nilify_all)
    end

    create index(:audit_versions, [:entity_schema, :entity_id])
  end
end
