defmodule DashboardWeb.AssaySearchComponent do
  use Phoenix.LiveComponent
  alias DashboardWeb.Router.Helpers, as: Routes

  def render(assigns) do
    {selected, _} = Integer.parse(Map.get(assigns.params, "assay", "-1"))
    assays = assigns[:assays]

    ~L"""
    <form phx-change="change" phx-throttle="500" class="dropdown" phx-target="<%= @myself %>">
    <div class="field">
      <label class="label">Assay</label>
      <div class="field">
        <div class="control">
          <span class="select">
            <select name="assay">
              <option value="-1" <%=if selected == -1 do %>selected<%end%>>--</option>
              <%= for {k, v} <- assays do %>
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
    assays =
      Domain.Projects.list_assays()
      |> Enum.map(&{&1.name, &1.id})

    {:ok, assign(socket, assays: assays)}
  end

  def update(assigns, socket) do
    {:ok,
     assign(socket,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def handle_event("change", %{"assay" => assay}, socket) do
    params =
      if assay == "-1" do
        Map.delete(socket.assigns[:params], "assay")
      else
        Map.put(socket.assigns[:params], "assay", assay)
      end

    {:noreply,
     push_patch(socket, to: Routes.live_path(socket, DashboardWeb.SamplesLive.List, params))}
  end
end
