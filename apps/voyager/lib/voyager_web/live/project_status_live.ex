defmodule VoyagerWeb.ProjectStatusLive do
  use VoyagerWeb, :live_view
  alias Domain.Accounts
  import ProjectStatusSearch

  @doc """
  @mockup_samples [
    %{
      sampleId: "sample1",
      cmoSampleName: "c_sample1",
      investigatorSampleId: "i_sample1",
      externalSampleId: "e_sample1",
      project_status: "Completed",
      runs: [
        %{id: 1, app: "argos", version: "1.0", status: "completed"},
        %{id: 2, app: "argos", version: "1.0", status: "completed"},
        %{id: 3, app: "argos", version: "1.0", status: "completed"}
      ],
      assay: "assay1",
      recipe: "recipe1",
      tumorOrNormal: "Normal",
      deliveryDate: 3_091_890_131,
      patient__cmo: "patient1",
      oncoTreeCode: "onc1"
    },
    %{
      sampleId: "sample2",
      cmoSampleName: "c_sample2",
      investigatorSampleId: "i_sample2",
      externalSampleId: "e_sample2",
      project_status: "Completed",
      runs: [
        %{id: 1, app: "argos", version: "1.0", status: "completed"},
        %{id: 2, app: "argos", version: "1.0", status: "completed"},
        %{id: 3, app: "argos", version: "1.0", status: "completed"}
      ],
      assay: "assay1",
      recipe: "recipe1",
      tumorOrNormal: "Tumor",
      deliveryDate: 3_091_890_131,
      patient__cmo: "patient1",
      oncoTreeCode: "onc1"
    },
    %{
      sampleId: "sample3",
      cmoSampleName: "c_sample3",
      investigatorSampleId: "i_sample3",
      externalSampleId: "e_sample3",
      project_status: "Running",
      runs: [
        %{id: 1, app: "argos", version: "1.0", status: "completed"},
        %{id: 2, app: "argos", version: "1.0", status: "completed"},
        %{id: 3, app: "argos", version: "1.0", status: "completed"}
      ],
      assay: "assay2",
      recipe: "recipe1",
      tumorOrNormal: "Normal",
      deliveryDate: 3_091_890_131,
      patient__cmo: "patient1",
      oncoTreeCode: "onc1"
    },
    %{
      sampleId: "sample4",
      cmoSampleName: "c_sample4",
      investigatorSampleId: "i_sample4",
      externalSampleId: "e_sample4",
      project_status: "Failed",
      runs: [
        %{id: 1, app: "argos", version: "1.0", status: "completed"},
        %{id: 2, app: "argos", version: "1.0", status: "completed"},
        %{id: 3, app: "Helix_filters", version: "1.0", status: "failed"}
      ],
      assay: "assay2",
      recipe: "recipe1",
      tumorOrNormal: "Tumor",
      deliveryDate: 3_091_890_131,
      patient__cmo: "patient1",
      oncoTreeCode: "onc1"
    }
  ]
  """

  @mockup_projects [
    %{
      project: "12345",
      investigator: "Webbera, A",
      PI: "Socci, N",
      assay: "IMPACT",
      status: "In Voyager"
    },
    %{
      project: "12345_B",
      investigator: "Webbera, A",
      PI: "Socci, N",
      assay: "IMPACT",
      status: "On Hold"
    },
    %{
      project: "1234y",
      investigator: "Kumar, N",
      PI: "Bolipata, C",
      assay: "IMPACT",
      status: "In Voyager"
    },
    %{
      project: "12345",
      investigator: "Vural, S",
      PI: "Song, T",
      assay: "IMPACT",
      status: "Delivered"
    }
  ]

  @impl true
  def mount(_params, %{"user_token" => user_token}, socket) do
    {:ok, user} = Accounts.get_user_by_access_token(user_token)

    {:ok,
     socket
     |> assign(
       user: user.email,
       user_token: user_token,
       project_data: [],
       project_search: ""
     )}
  end

  @impl true
  def handle_event("fetch", %{"search" => searchQuery}, socket) do
    user_token = socket.assigns.user_token

    {:noreply,
     %ProjectStatusSearch{search: searchQuery, page_size: 1000}
     |> BeagleClient.list_all_project_statuses(user_token)
     |> case do
       {:ok, :ok, result_list} ->
         IO.inspect(result_list)

         socket
         |> assign(project_data: result_list, project_search: searchQuery)

       {_, _, _} ->
         socket
         |> put_flash(:error, UserMessages.const_server_down())
     end}
  end
end
