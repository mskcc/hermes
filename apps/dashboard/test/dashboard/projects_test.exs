defmodule Dashboard.ProjectsTest do
  use Dashboard.DataCase

  alias Dashboard.Projects

  describe "assays" do
    alias Dashboard.Projects.Assay

    @valid_attrs %{name: "some name"}
    @update_attrs %{name: "some updated name"}
    @invalid_attrs %{name: nil}

    def assay_fixture(attrs \\ %{}) do
      {:ok, assay} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Projects.create_assay()

      assay
    end

    test "list_assays/0 returns all assays" do
      assay = assay_fixture()
      assert Projects.list_assays() == [assay]
    end

    test "get_assay!/1 returns the assay with given id" do
      assay = assay_fixture()
      assert Projects.get_assay!(assay.id) == assay
    end

    test "create_assay/1 with valid data creates a assay" do
      assert {:ok, %Assay{} = assay} = Projects.create_assay(@valid_attrs)
      assert assay.name == "some name"
    end

    test "create_assay/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_assay(@invalid_attrs)
    end

    test "update_assay/2 with valid data updates the assay" do
      assay = assay_fixture()
      assert {:ok, %Assay{} = assay} = Projects.update_assay(assay, @update_attrs)
      assert assay.name == "some updated name"
    end

    test "update_assay/2 with invalid data returns error changeset" do
      assay = assay_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_assay(assay, @invalid_attrs)
      assert assay == Projects.get_assay!(assay.id)
    end

    test "delete_assay/1 deletes the assay" do
      assay = assay_fixture()
      assert {:ok, %Assay{}} = Projects.delete_assay(assay)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_assay!(assay.id) end
    end

    test "change_assay/1 returns a assay changeset" do
      assay = assay_fixture()
      assert %Ecto.Changeset{} = Projects.change_assay(assay)
    end
  end

  describe "projects" do
    alias Dashboard.Projects.Project

    @valid_attrs %{name: "some name"}
    @update_attrs %{name: "some updated name"}
    @invalid_attrs %{name: nil}

    def project_fixture(attrs \\ %{}) do
      {:ok, project} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Projects.create_project()

      project
    end

    test "list_projects/0 returns all projects" do
      project = project_fixture()
      assert Projects.list_projects() == [project]
    end

    test "get_project!/1 returns the project with given id" do
      project = project_fixture()
      assert Projects.get_project!(project.id) == project
    end

    test "create_project/1 with valid data creates a project" do
      assert {:ok, %Project{} = project} = Projects.create_project(@valid_attrs)
      assert project.name == "some name"
    end

    test "create_project/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_project(@invalid_attrs)
    end

    test "update_project/2 with valid data updates the project" do
      project = project_fixture()
      assert {:ok, %Project{} = project} = Projects.update_project(project, @update_attrs)
      assert project.name == "some updated name"
    end

    test "update_project/2 with invalid data returns error changeset" do
      project = project_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_project(project, @invalid_attrs)
      assert project == Projects.get_project!(project.id)
    end

    test "delete_project/1 deletes the project" do
      project = project_fixture()
      assert {:ok, %Project{}} = Projects.delete_project(project)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_project!(project.id) end
    end

    test "change_project/1 returns a project changeset" do
      project = project_fixture()
      assert %Ecto.Changeset{} = Projects.change_project(project)
    end
  end

  describe "samples" do
    alias Dashboard.Projects.Sample

    @valid_attrs %{mrn: "some mrn"}
    @update_attrs %{mrn: "some updated mrn"}
    @invalid_attrs %{mrn: nil}

    def sample_fixture(attrs \\ %{}) do
      {:ok, sample} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Projects.create_sample()

      sample
    end

    test "list_samples/0 returns all samples" do
      sample = sample_fixture()
      assert Projects.list_samples() == [sample]
    end

    test "get_sample!/1 returns the sample with given id" do
      sample = sample_fixture()
      assert Projects.get_sample!(sample.id) == sample
    end

    test "create_sample/1 with valid data creates a sample" do
      assert {:ok, %Sample{} = sample} = Projects.create_sample(@valid_attrs)
      assert sample.mrn == "some mrn"
    end

    test "create_sample/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_sample(@invalid_attrs)
    end

    test "update_sample/2 with valid data updates the sample" do
      sample = sample_fixture()
      assert {:ok, %Sample{} = sample} = Projects.update_sample(sample, @update_attrs)
      assert sample.mrn == "some updated mrn"
    end

    test "update_sample/2 with invalid data returns error changeset" do
      sample = sample_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_sample(sample, @invalid_attrs)
      assert sample == Projects.get_sample!(sample.id)
    end

    test "delete_sample/1 deletes the sample" do
      sample = sample_fixture()
      assert {:ok, %Sample{}} = Projects.delete_sample(sample)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_sample!(sample.id) end
    end

    test "change_sample/1 returns a sample changeset" do
      sample = sample_fixture()
      assert %Ecto.Changeset{} = Projects.change_sample(sample)
    end
  end
end
