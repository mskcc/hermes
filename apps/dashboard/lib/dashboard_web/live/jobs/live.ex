defmodule DashboardWeb.JobsLive.List do
  use Phoenix.LiveView

  alias Domain.Queue
  alias Domain.Queue.Job
  alias DashboardWeb.JobView
  alias DashboardWeb.Router.Helpers, as: Routes

  @default_per_page 30
  def render(assigns), do: JobView.render("list.html", assigns)

  def mount(_params, _session, socket) do
    {:ok,
     assign(socket,
       page: 1,
       per_page: @default_per_page,
       loading: false
     )}
  end

  def handle_params(params, _url, socket) do
    sort_by =
      (params["sort_by"] || [])
      |> Enum.map(&String.split(&1, "|"))
      |> Enum.map(fn [k, v] -> {String.to_atom(k), String.to_atom(v)} end)

    {page, _} = Integer.parse(Map.get(params, "page", "1"))
    {per_page, _} = Integer.parse(Map.get(params, "per_page", "#{@default_per_page}"))
    params = Map.put(params, "page", page)
    params = Map.put(params, "per_page", per_page)

    filters = Job.filter_changeset(params)

    {:noreply,
     socket |> assign(params: params, sort_by: sort_by, filter_changeset: filters) |> fetch()}
  end

  defp fetch(socket) do
    %{params: params, sort_by: sort_by} = socket.assigns

    filters =
      Job.filter_changeset(params)
      |> Map.fetch!(:changes)

    jobs =
      Queue.list_jobs(%{
        sort_by: sort_by,
        page: params["page"],
        per_page: params["per_page"],
        filters: filters
      })

    assign(socket,
      jobs: jobs,
      page_title: "Listing Jobs – Page #{params["page"]}"
    )
  end

  
  #def handle_info({Projects, [:samples | _], _}, socket) do
  #  {:noreply, fetch(socket)}
  #end

  def handle_event("keydown", %{"code" => "ArrowLeft"}, socket) do
    {:noreply, go_page(socket, socket.assigns.page - 1)}
  end

  def handle_event("keydown", %{"code" => "ArrowRight"}, socket) do
    {:noreply, go_page(socket, socket.assigns.page + 1)}
  end

  def handle_event("retry_job", %{"id" => id}, socket) do
    {id, _} = Integer.parse(id)
    Queue.retry_job(id)
    {:noreply, socket}
  end

  def handle_event("keydown", _, socket), do: {:noreply, socket}

  defp go_page(socket, page) when page > 0 do
    push_patch(socket, to: Routes.live_path(socket, __MODULE__, page))
  end

  defp go_page(socket, _page), do: socket
end
