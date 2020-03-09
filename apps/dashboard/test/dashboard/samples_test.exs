defmodule Dashboard.SamplesTest do
  use Dashboard.DataCase

  alias Dashboard.Samples

  describe "assays" do
    alias Dashboard.Samples.Assay

    @valid_attrs %{name: "some name"}
    @update_attrs %{name: "some updated name"}
    @invalid_attrs %{name: nil}

    def assay_fixture(attrs \\ %{}) do
      {:ok, assay} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Samples.create_assay()

      assay
    end

    test "list_assays/0 returns all assays" do
      assay = assay_fixture()
      assert Samples.list_assays() == [assay]
    end

    test "get_assay!/1 returns the assay with given id" do
      assay = assay_fixture()
      assert Samples.get_assay!(assay.id) == assay
    end

    test "create_assay/1 with valid data creates a assay" do
      assert {:ok, %Assay{} = assay} = Samples.create_assay(@valid_attrs)
      assert assay.name == "some name"
    end

    test "create_assay/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Samples.create_assay(@invalid_attrs)
    end

    test "update_assay/2 with valid data updates the assay" do
      assay = assay_fixture()
      assert {:ok, %Assay{} = assay} = Samples.update_assay(assay, @update_attrs)
      assert assay.name == "some updated name"
    end

    test "update_assay/2 with invalid data returns error changeset" do
      assay = assay_fixture()
      assert {:error, %Ecto.Changeset{}} = Samples.update_assay(assay, @invalid_attrs)
      assert assay == Samples.get_assay!(assay.id)
    end

    test "delete_assay/1 deletes the assay" do
      assay = assay_fixture()
      assert {:ok, %Assay{}} = Samples.delete_assay(assay)
      assert_raise Ecto.NoResultsError, fn -> Samples.get_assay!(assay.id) end
    end

    test "change_assay/1 returns a assay changeset" do
      assay = assay_fixture()
      assert %Ecto.Changeset{} = Samples.change_assay(assay)
    end
  end
end
