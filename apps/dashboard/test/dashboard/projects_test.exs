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

  describe "jobs" do
    alias Dashboard.Projects.Job

    @valid_attrs %{job_id: "some job_id"}
    @update_attrs %{job_id: "some updated job_id"}
    @invalid_attrs %{job_id: nil}

    def job_fixture(attrs \\ %{}) do
      {:ok, job} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Projects.create_job()

      job
    end

    test "list_jobs/0 returns all jobs" do
      job = job_fixture()
      assert Projects.list_jobs() == [job]
    end

    test "get_job!/1 returns the job with given id" do
      job = job_fixture()
      assert Projects.get_job!(job.id) == job
    end

    test "create_job/1 with valid data creates a job" do
      assert {:ok, %Job{} = job} = Projects.create_job(@valid_attrs)
      assert job.job_id == "some job_id"
    end

    test "create_job/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_job(@invalid_attrs)
    end

    test "update_job/2 with valid data updates the job" do
      job = job_fixture()
      assert {:ok, %Job{} = job} = Projects.update_job(job, @update_attrs)
      assert job.job_id == "some updated job_id"
    end

    test "update_job/2 with invalid data returns error changeset" do
      job = job_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_job(job, @invalid_attrs)
      assert job == Projects.get_job!(job.id)
    end

    test "delete_job/1 deletes the job" do
      job = job_fixture()
      assert {:ok, %Job{}} = Projects.delete_job(job)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_job!(job.id) end
    end

    test "change_job/1 returns a job changeset" do
      job = job_fixture()
      assert %Ecto.Changeset{} = Projects.change_job(job)
    end
  end

  describe "workflows" do
    alias Dashboard.Projects.Workflow

    @valid_attrs %{name: "some name"}
    @update_attrs %{name: "some updated name"}
    @invalid_attrs %{name: nil}

    def workflow_fixture(attrs \\ %{}) do
      {:ok, workflow} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Projects.create_workflow()

      workflow
    end

    test "list_workflows/0 returns all workflows" do
      workflow = workflow_fixture()
      assert Projects.list_workflows() == [workflow]
    end

    test "get_workflow!/1 returns the workflow with given id" do
      workflow = workflow_fixture()
      assert Projects.get_workflow!(workflow.id) == workflow
    end

    test "create_workflow/1 with valid data creates a workflow" do
      assert {:ok, %Workflow{} = workflow} = Projects.create_workflow(@valid_attrs)
      assert workflow.name == "some name"
    end

    test "create_workflow/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_workflow(@invalid_attrs)
    end

    test "update_workflow/2 with valid data updates the workflow" do
      workflow = workflow_fixture()
      assert {:ok, %Workflow{} = workflow} = Projects.update_workflow(workflow, @update_attrs)
      assert workflow.name == "some updated name"
    end

    test "update_workflow/2 with invalid data returns error changeset" do
      workflow = workflow_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_workflow(workflow, @invalid_attrs)
      assert workflow == Projects.get_workflow!(workflow.id)
    end

    test "delete_workflow/1 deletes the workflow" do
      workflow = workflow_fixture()
      assert {:ok, %Workflow{}} = Projects.delete_workflow(workflow)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_workflow!(workflow.id) end
    end

    test "change_workflow/1 returns a workflow changeset" do
      workflow = workflow_fixture()
      assert %Ecto.Changeset{} = Projects.change_workflow(workflow)
    end
  end

  describe "sample_meta_data" do
    alias Dashboard.Projects.SampleMetaData

    @valid_attrs %{lims: %{}}
    @update_attrs %{lims: %{}}
    @invalid_attrs %{lims: nil}

    def sample_meta_data_fixture(attrs \\ %{}) do
      {:ok, sample_meta_data} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Projects.create_sample_meta_data()

      sample_meta_data
    end

    test "list_sample_meta_data/0 returns all sample_meta_data" do
      sample_meta_data = sample_meta_data_fixture()
      assert Projects.list_sample_meta_data() == [sample_meta_data]
    end

    test "get_sample_meta_data!/1 returns the sample_meta_data with given id" do
      sample_meta_data = sample_meta_data_fixture()
      assert Projects.get_sample_meta_data!(sample_meta_data.id) == sample_meta_data
    end

    test "create_sample_meta_data/1 with valid data creates a sample_meta_data" do
      assert {:ok, %SampleMetaData{} = sample_meta_data} =
               Projects.create_sample_meta_data(@valid_attrs)

      assert sample_meta_data.lims == %{}
    end

    test "create_sample_meta_data/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_sample_meta_data(@invalid_attrs)
    end

    test "update_sample_meta_data/2 with valid data updates the sample_meta_data" do
      sample_meta_data = sample_meta_data_fixture()

      assert {:ok, %SampleMetaData{} = sample_meta_data} =
               Projects.update_sample_meta_data(sample_meta_data, @update_attrs)

      assert sample_meta_data.lims == %{}
    end

    test "update_sample_meta_data/2 with invalid data returns error changeset" do
      sample_meta_data = sample_meta_data_fixture()

      assert {:error, %Ecto.Changeset{}} =
               Projects.update_sample_meta_data(sample_meta_data, @invalid_attrs)

      assert sample_meta_data == Projects.get_sample_meta_data!(sample_meta_data.id)
    end

    test "delete_sample_meta_data/1 deletes the sample_meta_data" do
      sample_meta_data = sample_meta_data_fixture()
      assert {:ok, %SampleMetaData{}} = Projects.delete_sample_meta_data(sample_meta_data)

      assert_raise Ecto.NoResultsError, fn ->
        Projects.get_sample_meta_data!(sample_meta_data.id)
      end
    end

    test "change_sample_meta_data/1 returns a sample_meta_data changeset" do
      sample_meta_data = sample_meta_data_fixture()
      assert %Ecto.Changeset{} = Projects.change_sample_meta_data(sample_meta_data)
    end
  end
end
