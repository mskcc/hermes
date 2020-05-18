defmodule DashboardWeb.StatusSearchComponent do
  use Phoenix.LiveComponent
  alias DashboardWeb.Router.Helpers, as: Routes
  alias Dashboard.Projects

  def render(assigns) do
    {selected, _} = Integer.parse(Map.get(assigns.params, "status", "-1"))
    statuses = Enum.sort(SampleStatusEnum.__enum_map__())
    ~L"""
    <form phx-change="change" phx-throttle="500" class="dropdown" phx-target="<%= @myself %>">
    <div class="field">
      <label class="label">Status</label>
      <div class="field">
        <div class="control">
          <span class="select">
            <select name="status">
              <option value="-1">--</option>
              <%= for {k, v} <- statuses do %>
                <option <%=if selected == v do %>selected<%end%> value="<%=v%>"><%=k%></option>
              <% end %>
            </select>
          </span>
        </div>
      </div>
    </form>
    """
  end

  def update(assigns, socket) do
    {:ok,
     assign(socket,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def handle_event("change", %{"status" => status}, socket) do
    params = if status == "-1" do
      Map.delete(socket.assigns[:params], "status")
    else
      Map.put(socket.assigns[:params], "status", status)
    end

    {:noreply, push_patch(socket, to: Routes.live_path(socket, DashboardWeb.SamplesLive.List, params))}
  end
end
