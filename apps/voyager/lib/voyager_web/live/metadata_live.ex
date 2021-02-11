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
    "recipe",
    "requestId",
    "strand",
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
		runDate: "date",
	}


	@email_keys [
	"dataAccessEmails",
	"investigatorEmail",
	"labHeadEmail",
	"piEmail"
	]

	@qc_report_field "qcReports"

	@impl true
	def mount(params, %{"user_token" => user_token}, socket) do
		{:ok, user} = Accounts.get_user_by_access_token(user_token)
		{:ok, socket
			|> assign(user: user.email, user_token: user_token,
					  metadataList: [], requestKeyList: @request_metadata_keys,
					  metadata_validation: @metadata_validation, noMetadataChangesMessage: UserMessages.const_no_metadata_changes_ready(),
					  noQcReportDataMessage: UserMessages.const_no_qc_report_data(),
					  qcReportField: @qc_report_field, sampleVerificationKeys: @sample_verification_keys,  params: params)
		}

	end

	defp get_metadata_query(%{"requestId" => requestId, "sampleId" => _sampleId}) do
		get_metadata_query(%{"requestId" => requestId})
	end

	defp get_metadata_query(%{"requestId" => requestId}) do
		{:ok, %FilesQuery{metadata: "requestId:" <> requestId, page_size: 100}}
	end

	defp get_metadata_query(%{"sampleId" => sampleId}) do
		{:ok, %FilesQuery{metadata: "sampleId:" <> sampleId, page_size: 100}}
	end

	defp get_metadata_query(params) do
		error_message = params
			|> Map.keys
			|> UserMessages.queryNotRecognized
		{:error, error_message}
	end

	@impl true
	def handle_event("fetch", params, socket) do
		user_token = socket.assigns.user_token

		case get_metadata_query(params) do
			{:ok, query} ->
    			{:noreply, query
      				|> BeagleClient.list_all_query_files(user_token)
      				|> case do
      					{:ok, :ok, []} ->
      						message = UserMessages.resourceNotFound(params,"metadata")
      						socket
      							|> redirect(to: Routes.metadata_path(socket, :new))
      							|> put_flash(:error,message)
      					{:ok, :ok, response} ->
      						socket
      							|> assign(metadataList: response, requestKeyList: @request_metadata_keys, emailKeyList: @email_keys)
				      	{:error, :user_error, message} ->
				        	socket
				          		|> redirect(to: Routes.metadata_path(socket, :new))
				          		|> put_flash(:error,message)
				      	{:error, _, message} ->
				        	socket
				          		|> redirect(to: Routes.metadata_path(socket, :new))
				          		|> put_flash(:error,message)
				    	end
				}

			{:error, error_message} ->
				{:noreply, socket
					|> redirect(to: Routes.metadata_path(socket, :new))
					|> put_flash(:error,error_message)
				}
		end

	end

	@impl true
	def handle_event("patch", %{"patch_files" => patch_files}, socket) do
			user_token = socket.assigns.user_token

			case BeagleClient.batch_patch_files(%BatchPatchFiles{patch_files: patch_files}, user_token) do
				{:ok, :ok, response} ->
					{:noreply, socket
						|> redirect(to: Routes.metadata_path(socket, :new))
						|> put_flash(:success, response)
					}
		      	{:error, :user_error, message} ->
		        	{:noreply, socket
		          		|> put_flash(:error,message)
		          	}
		      	{:error, _, message} ->
		        	{:noreply, socket
		          		|> put_flash(:error,message)
		          	}
			end

		end



end