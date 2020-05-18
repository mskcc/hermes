defmodule DashboardWeb.IgoSearchComponent do
  use Phoenix.LiveComponent
  alias DashboardWeb.Router.Helpers, as: Routes
  alias Dashboard.Projects

  def render(assigns) do
    ~L"""
    <form phx-change="suggest" phx-submit="search" phx-target="<%= @myself %>">
    <div class="field">
    <label class="label">
    ID
    <span class="is-tooltip" data-tooltip="IGO Sequencing ID / IGO Extraction / Tube ID"><i class="fas fa-info-circle"></i></span> </th>
    </label>
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
       query: Map.get(assigns.params, "id", ""),
       result: nil,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def handle_event("suggest", %{"q" => query}, socket) do
    params = Map.put(socket.assigns[:params], :id, query)

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.SamplesLive.List, params))}
  end

  def handle_event("search", %{"q" => query}, socket) do
    params = Map.put(socket.assigns[:params], :id, query)

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.SamplesLive.List, params))}
  end
end
