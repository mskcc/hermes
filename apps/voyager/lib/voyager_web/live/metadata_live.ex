defmodule VoyagerWeb.MetadataLive do
  use VoyagerWeb, :live_view
  import FilesQuery
  import BatchPatchFiles
  alias Domain.Accounts

  @request_metadata_keys [
    "dataAccessEmails",
    "dataAnalystEmail",
    "dataAnalystName",
    "investigatorEmail",
    "investigatorName",
    "labHeadEmail",
    "labHeadName",
    "libraryType",
    "otherContactEmails",
    "piEmail",
    "projectManagerName",
    "qcAccessEmails",
    "genePanel",
    "igoProjectId",
    "igoRequestId"
  ]

  @sample_verification_keys [
    "sampleId"
  ]

  @metadata_validation %{
    dataAccessEmails: "emailList",
    dataAnalystEmail: "emailList",
    investigatorEmail: "emailList",
    labHeadEmail: "emailList",
    piEmail: "emailList",
    captureConcentrationNm: "number",
    captureInputNg: "number",
    collectionYear: "year",
    flowCellLanes: "numberList",
    igocomplete: "bool",
    libraryConcentrationNgul: "number",
    libraryVolume: "number",
    otherContactEmails: "emailList",
    qcAccessEmails: "emailList",
    runDate: "date"
  }

  @qc_report_field "qcReports"
  @request_id_field "igoRequestId"

  @sample_name_field "cmoSampleName"
  @sample_id_field "primaryId"

  @sample_label_keys [
    [@sample_name_field, "name"],
    [@sample_id_field, "id"]
  ]

  @impl true
  def mount(params, %{"user_token" => user_token}, socket) do
    {:ok, user} = Accounts.get_user_by_access_token(user_token)

    {:ok,
     socket
     |> assign(
       user: user.email,
       user_token: user_token,
       metadataList: [],
       requestKeyList: @request_metadata_keys,
       selectedSample: nil,
       defaultSampleIdType: @sample_name_field,
       metadata_validation: @metadata_validation,
       noMetadataChangesMessage: UserMessages.const_no_metadata_changes_ready(),
       noQcReportDataMessage: UserMessages.const_no_qc_report_data(),
       qcReportField: @qc_report_field,
       sampleVerificationKeys: @sample_verification_keys,
       requestField: @request_id_field,
       sampleLabelKeys: @sample_label_keys,
       params: params
     )}
  end

  defp get_metadata_query(%{"igoRequestId" => requestId}, _user_token) do
    {:ok, %FilesQuery{metadata: "igoRequestId:" <> requestId, page_size: 100}, nil,
     @sample_name_field}
  end

  defp get_metadata_query(%{"sampleId" => sampleId}, user_token) do
    %FilesQuery{metadata: "sampleId:" <> sampleId, page_size: 100}
    |> BeagleClient.list_all_query_files(user_token)
    |> case do
      {:ok, :ok, []} ->
        message = UserMessages.resourceNotFound(%{sampleId: sampleId}, "metadata")
        {:error, message}

      {:ok, :ok, response} ->
        case Enum.at(response, 0) do
          %{"metadata" => %{"igoRequestId" => requestId}, "id" => id} ->
            {:ok, request_query, _, _} =
              get_metadata_query(%{"igoRequestId" => requestId}, user_token)

            {:ok, request_query, id, @sample_id_field}
        end
    end
  end

  defp get_metadata_query(%{"sampleName" => sampleName}, user_token) do
    %FilesQuery{metadata: "sampleName:" <> sampleName, page_size: 100}
    |> BeagleClient.list_all_query_files(user_token)
    |> case do
      {:ok, :ok, []} ->
        message = UserMessages.resourceNotFound(%{sampleName: sampleName}, "metadata")
        {:error, message}

      {:ok, :ok, response} ->
        case Enum.at(response, 0) do
          %{"metadata" => %{"igoRequestId" => requestId}, "id" => id} ->
            {:ok, request_query, _, _} =
              get_metadata_query(%{"igoRequestId" => requestId}, user_token)

            {:ok, request_query, id, @sample_name_field}
        end
    end
  end

  defp get_metadata_query(params, _user_token) do
    error_message =
      params
      |> Map.keys()
      |> UserMessages.queryNotRecognized()

    {:error, error_message}
  end

  @impl true
  def handle_event("fetch", params, socket) do
    user_token = socket.assigns.user_token

    case get_metadata_query(params, user_token) do
      {:ok, query, selectedSample, defaultSampleIdType} ->
        {:noreply,
         query
         |> BeagleClient.list_all_query_files(user_token)
         |> case do
           {:ok, :ok, []} ->
             message = UserMessages.resourceNotFound(params, "metadata")

             socket
             |> redirect(to: Routes.metadata_path(socket, :new))
             |> put_flash(:error, message)

           {:ok, :ok, response} ->
             socket
             |> assign(
               metadataList: response,
               selectedSample: selectedSample,
               defaultSampleIdType: defaultSampleIdType
             )

           {:error, :user_error, message} ->
             socket
             |> redirect(to: Routes.metadata_path(socket, :new))
             |> put_flash(:error, message)

           {:error, _, message} ->
             socket
             |> redirect(to: Routes.metadata_path(socket, :new))
             |> put_flash(:error, message)
         end}

      {:error, error_message} ->
        {:noreply,
         socket
         |> redirect(to: Routes.metadata_path(socket, :new))
         |> put_flash(:error, error_message)}
    end
  end

  @impl true
  def handle_event("patch", %{"patch_files" => patch_files}, socket) do
    user_token = socket.assigns.user_token

    case BeagleClient.batch_patch_files(%BatchPatchFiles{patch_files: patch_files}, user_token) do
      {:ok, :ok, response} ->
        {:noreply,
         socket
         |> redirect(to: Routes.metadata_path(socket, :new))
         |> put_flash(:success, response)}

      {:error, :user_error, message} ->
        {:noreply,
         socket
         |> put_flash(:error, message)}

      {:error, _, message} ->
        {:noreply,
         socket
         |> put_flash(:error, message)}
    end
  end
end
