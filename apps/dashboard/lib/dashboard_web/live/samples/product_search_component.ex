defmodule DashboardWeb.ProjectSearchComponent do
  use Phoenix.LiveComponent
  alias Dashboard.Projects

  def render(assigns) do
    ~L"""
    <form phx-change="suggest" phx-throttle="500" phx-submit="search" phx-target="<%= @myself %>">
      <input type="text" name="q" autocomplete="off" value="<%= @query %>" list="matches" placeholder="Search..."
             <%= if @loading, do: "readonly" %>/>
      <datalist id="matches">
        <%= for match <- @matches do %>
          <option value="<%= match.name %>"><%= match.name %></option>
        <% end %>
      </datalist>
      <%= if @result do %><pre><%= @result %></pre><% end %>
    </form>
    """
  end

  def update(assigns, socket) do
    {:ok,
     assign(socket,
       query: nil,
       result: nil,
       loading: false,
       matches: [],
       params: assigns[:params]
     )}
  end

  def mount(%{"params" => params}, _session, socket) do
    {:ok, assign(socket, query: nil, result: nil, loading: false, matches: [], params: params)}
  end

  def handle_event("suggest", %{"q" => query}, socket) do
    %{entries: entries} =
      Projects.list_projects(%{
        page: 1,
        per_page: 10,
        sort_by: [name: :asc],
        filters: %{name: query}
      })

    {:noreply, assign(socket, matches: entries)}
  end

  def handle_event("search", %{"q" => query}, socket) do
    params = Map.put(socket.assigns[:params], :project_id, query)
    IO.inspect("uhhhhhhh")
    IO.inspect(params)
    {:noreply, push_patch(socket, to: Routes.live_path(socket, __MODULE__, params))}
  end

  # def handle_info({:search, query}, socket) do
  # {result, _} = System.cmd("dict", ["#{query}"], stderr_to_stdout: true)
  # {:noreply, assign(socket, loading: false, result: result, matches: [])}
  # end
end
