defmodule VoyagerWeb.RunLive do
	use VoyagerWeb, :live_view
	import RunsQuery
	import Pipelines
	alias Domain.Accounts

	@run_metadata_keys [
	"app",
	"created_date",
	"finished_date",
	"id",
	"job_group",
	"name",
	"started",
	"status",
	"submitted",
	"tags"
	]
	@app_index 0
	@status_index 7

	@beagle_status %{
		0 => "Created",
		1 => "Pending",
		2 => "Running",
		3 => "Failed",
		4 => "Completed",
		5 => "Stopped"
	}

	@impl true
	def mount(_params, %{"user_token" => user_token}, socket) do
		{:ok, user} = Accounts.get_user_by_access_token(user_token)
		{:ok, socket
			|> assign(user: user.email, user_token: user_token, runList: [], runJobs: [])
		}

	end

	def process_run(run_data, pipeline_dict) do
		app_id = Enum.at(run_data,@app_index)
		status_id = Enum.at(run_data,@status_index)
		%{"name" => app_name} = pipeline_dict
			|> Map.get(app_id, %{ "name" => app_id })
		status_name = Map.get(@beagle_status,status_id, status_id)
		annotate_run_data = run_data
			|> List.replace_at(@app_index,app_name)
			|> List.replace_at(@status_index,status_name)
		Enum.zip(@run_metadata_keys,annotate_run_data)
			|> Enum.into(%{})
	end

	@impl true
	def handle_event("fetch", _params, socket) do
		user_token = socket.assigns.user_token

		case BeagleClient.list_all_pipelines(%Pipelines{page_size: 100},user_token) do
			{:ok, :ok, response_pipeline} ->
				pipeline_dict = response_pipeline
					|> Enum.reduce(%{}, fn x, acc ->
						{pipeline_id, trimmed_dict} = Map.pop(x,"id")
						Map.put(acc, pipeline_id, trimmed_dict)
						end)
				case BeagleClient.list_all_query_runs(%RunsQuery{values_run: @run_metadata_keys, page_size: 10000}, user_token) do
					{:ok, :ok, response} ->
						run_data = response
							|> Enum.map(fn x -> process_run(x,pipeline_dict) end)
						{:noreply, socket
							|> assign(runList: run_data)
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