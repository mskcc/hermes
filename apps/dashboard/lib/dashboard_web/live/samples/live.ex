defmodule DashboardWeb.SamplesLive.List do
  use Phoenix.LiveView

  alias Dashboard.Projects
  alias Dashboard.Projects.Sample
  alias DashboardWeb.SampleView
  alias DashboardWeb.Router.Helpers, as: Routes

  @default_per_page 15
  def render(assigns), do: SampleView.render("list.html", assigns)

  def mount(params, session, socket) do
    {:ok, assign(socket, page: 1, per_page: @default_per_page)}
  end

  def handle_params(params, url, socket) do
    sort_by =
      (params["sortBy"] || [])
      |> Enum.map(&String.split(&1, "|"))
      |> Enum.map(fn [k, v] -> {String.to_atom(k), String.to_atom(v)} end)

    {page, _} = Integer.parse(Map.get(params, "page", "1"))
    {per_page, _} = Integer.parse(Map.get(params, "per_page", "#{@default_per_page}"))
    params = Map.put(params, "page", page)
    params = Map.put(params, "per_page", per_page)

    filters =
      Ecto.Changeset.cast(
        %Sample{},
        params,
        [:mrn]
      )

    {:noreply,
     socket |> assign(params: params, sort_by: sort_by, filter_changeset: filters) |> fetch()}
  end

  defp fetch(socket) do
    %{params: params, sort_by: sort_by} = socket.assigns

    filters =
      Ecto.Changeset.cast(
        %Sample{},
        params,
        [:mrn]
      )
      |> Map.fetch!(:changes)

    samples =
      Projects.list_samples(%{
        sort_by: sort_by,
        page: params["page"],
        per_page: params["per_page"],
        filters: filters
      })

    assign(socket, samples: samples, page_title: "Listing Samples – Page #{params["page"]}")
  end

  def handle_event("filter", params, socket) do
    IO.inspect(params)

    """
    changeset =
      socket.assigns.user
      |> Demo.Accounts.change_user(params)
      |> Map.put(:action, :update)

    """

    {:noreply, push_patch(socket, to: Routes.live_path(socket, __MODULE__, params["sample"]))}
  end

  def handle_info({Projects, [:samples | _], _}, socket) do
    {:noreply, fetch(socket)}
  end

  def handle_event("keydown", %{"code" => "ArrowLeft"}, socket) do
    {:noreply, go_page(socket, socket.assigns.page - 1)}
  end

  def handle_event("keydown", %{"code" => "ArrowRight"}, socket) do
    {:noreply, go_page(socket, socket.assigns.page + 1)}
  end

  def handle_event("keydown", _, socket), do: {:noreply, socket}

  defp go_page(socket, page) when page > 0 do
    push_patch(socket, to: Routes.live_path(socket, __MODULE__, page))
  end

  defp go_page(socket, _page), do: socket
end
