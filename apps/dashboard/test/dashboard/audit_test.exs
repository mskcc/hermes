defmodule Dashboard.AuditTest do
  use Dashboard.DataCase

  alias Dashboard.Audit

  describe "audit_versions" do
    alias Dashboard.Audit.Version

    @valid_attrs %{}
    @update_attrs %{}
    @invalid_attrs %{}

    def version_fixture(attrs \\ %{}) do
      {:ok, version} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Audit.create_version()

      version
    end

    test "list_audit_versions/0 returns all audit_versions" do
      version = version_fixture()
      assert Audit.list_audit_versions() == [version]
    end

    test "get_version!/1 returns the version with given id" do
      version = version_fixture()
      assert Audit.get_version!(version.id) == version
    end

    test "create_version/1 with valid data creates a version" do
      assert {:ok, %Version{} = version} = Audit.create_version(@valid_attrs)
    end

    test "create_version/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Audit.create_version(@invalid_attrs)
    end

    test "update_version/2 with valid data updates the version" do
      version = version_fixture()
      assert {:ok, %Version{} = version} = Audit.update_version(version, @update_attrs)
    end

    test "update_version/2 with invalid data returns error changeset" do
      version = version_fixture()
      assert {:error, %Ecto.Changeset{}} = Audit.update_version(version, @invalid_attrs)
      assert version == Audit.get_version!(version.id)
    end

    test "delete_version/1 deletes the version" do
      version = version_fixture()
      assert {:ok, %Version{}} = Audit.delete_version(version)
      assert_raise Ecto.NoResultsError, fn -> Audit.get_version!(version.id) end
    end

    test "change_version/1 returns a version changeset" do
      version = version_fixture()
      assert %Ecto.Changeset{} = Audit.change_version(version)
    end
  end
end
