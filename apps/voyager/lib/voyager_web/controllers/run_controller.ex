defmodule VoyagerWeb.RunController do
  use VoyagerWeb, :controller

   import FilesQuery
   import Pipelines
   import SubmitRun


  @run_key "run"
  @type_key "type"

  def new(conn, _params) do
    render(conn, "input.html", form_key: @run_key, type_key: @type_key)
  end

  def list(conn, %{@type_key => option_type}) do
    user_token = conn.assigns.current_user.access_token
    case option_type do
      "requestId" ->
        response_obj = %FilesQuery{values_metadata: "requestId", page_size: 100000}
          |> BeagleClient.list_all_query_files(user_token)
        handle_response(conn, response_obj)
      "pipeline" ->
        response_obj = %Pipelines{page_size: 100000}
          |> BeagleClient.list_all_pipelines(user_token)
        handle_response(conn, response_obj)
      unsupported_type ->
        conn
          |> put_status(400)
          |> json("Sorry! We do not support the option type: " <> unsupported_type)
    end
  end

  def handle_response(conn, response_obj) do
    case response_obj do
      {:ok, :ok, response} -> json(conn, response)
      {:error, :user_error, message} ->
        conn
          |> put_status(400)
          |> json(message)
      {:error, _, message} ->
        conn
          |> put_status(500)
          |> json(message)
    end

  end

  def submit(conn, %{@run_key => run_params}) do
    user_token = conn.assigns.current_user.access_token
    %{"request" => request, "pipeline" => pipeline} = run_params
      case BeagleClient.submit_run(%SubmitRun{pipeline: pipeline, request_ids: [request]}, user_token) do
        {:ok, :ok, _} ->
          conn
            |> put_status(200)
            |> json("")
        {:error, :user_error, message} ->
          conn
            |> put_flash(:error,message)
        {:error, _, message} ->
          conn
            |> put_flash(:error,message)
      end
  end

  def checkRunJobs(conn, %{"runId" => runId}) do
    user_token = conn.assigns.current_user.access_token
    response_obj = BeagleClient.list_all_query_runs(%RunsQuery{values_run: ["job_statuses"], run_ids: [runId]}, user_token)
    handle_response(conn, response_obj)
  end

  def success(conn, _params) do
    conn
      |> put_flash(:success, UserMessages.const_run_submmitted_message)
      |> redirect(to: Routes.run_path(conn, :index))
  end

end
