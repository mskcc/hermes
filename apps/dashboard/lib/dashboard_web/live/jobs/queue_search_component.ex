defmodule DashboardWeb.QueueSearchComponent do
  use Phoenix.LiveComponent
  alias DashboardWeb.Router.Helpers, as: Routes

  def render(assigns) do
    selected = Map.get(assigns.params, "queue", "-1")
    queues = assigns[:queues]

    ~L"""
    <form phx-change="change" phx-throttle="500" class="dropdown" phx-target="<%= @myself %>">
    <div class="field">
      <label class="label">Queue</label>
      <div class="field">
        <div class="control">
          <span class="select">
            <select name="queue">
              <option value="-1" <%=if selected == -1 do %>selected<%end%>>--</option>
              <%= for {k, v} <- queues do %>
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
    queues =
      Domain.Queue.list_queues()
      |> Enum.map(&{String.capitalize(&1), &1})

    {:ok, assign(socket, queues: queues)}
  end

  def update(assigns, socket) do
    {:ok,
     assign(socket,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def handle_event("change", %{"queue" => queue}, socket) do
    params =
      if queue == "-1" do
        Map.delete(socket.assigns[:params], "queue")
      else
        Map.put(socket.assigns[:params], "queue", queue)
      end

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.JobsLive.List, params))}
  end
end
