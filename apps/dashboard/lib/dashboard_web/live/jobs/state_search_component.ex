defmodule DashboardWeb.StateSearchComponent do
  use Phoenix.LiveComponent
  alias DashboardWeb.Router.Helpers, as: Routes

  def render(assigns) do
    selected = Map.get(assigns.params, "state", "-1")
    states = assigns[:states]

    ~L"""
    <form phx-change="change" phx-throttle="500" class="dropdown" phx-target="<%= @myself %>">
    <div class="field">
      <label class="label">State</label>
      <div class="field">
        <div class="control">
          <span class="select">
            <select name="state">
              <option value="-1" <%=if selected == -1 do %>selected<%end%>>--</option>
              <%= for {k, v} <- states do %>
                <option <%=if selected == v do %>selected<%end%> value="<%=v%>"><%=k%></option>
              <% end %>
            </select>
          </span>
        </div>
      </div>
    </div>
    </form>
    """
  end

  def mount(socket) do
    states =
      Domain.Queue.list_states()
      |> Enum.map(&{String.capitalize(&1), &1})

    {:ok, assign(socket, states: states)}
  end

  def update(assigns, socket) do
    {:ok,
     assign(socket,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def handle_event("change", %{"state" => state}, socket) do
    params =
      if state == "-1" do
        Map.delete(socket.assigns[:params], "state")
      else
        Map.put(socket.assigns[:params], "state", state)
      end

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.JobsLive.List, params))}
  end
end
