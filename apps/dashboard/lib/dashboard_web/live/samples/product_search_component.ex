defmodule DashboardWeb.RequestSearchComponent do
  use Phoenix.LiveComponent
  alias DashboardWeb.Router.Helpers, as: Routes
  alias Dashboard.Projects

  def render(assigns) do
    ~L"""
    <form phx-change="suggest" class="dropdown" phx-submit="search" phx-target="<%= @myself %>">
    <div class="field">
      <label class="label">Request</label>
      <div class="field">
      <div class="control">
        <input type="text" class="input" phx-debounce="500" name="q" autocomplete="off" value="<%= @query %>" placeholder="Search..."/>

        </div>
      </div>
    </div>
    </form>
    """
  end

  def update(assigns, socket) do
    {:ok,
     assign(socket,
       query: Map.get(assigns.params, "request", ""),
       result: nil,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def handle_event("suggest", %{"q" => query}, socket) do
    params = Map.put(socket.assigns[:params], :request, query)

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.SamplesLive.List, params))}
  end

  def handle_event("search", %{"q" => query}, socket) do
    params = Map.put(socket.assigns[:params], :request, query)

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.SamplesLive.List, params))}
  end
end
