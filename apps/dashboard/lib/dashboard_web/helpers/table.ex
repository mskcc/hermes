defmodule DashboardWeb.Helpers.Table do
  import Phoenix.HTML
  import Phoenix.LiveView.Helpers
  alias DashboardWeb.Router.Helpers, as: Routes

  defp sort_by_params(params, sort_by, field) do
    sort_by_param =
      if Keyword.has_key?(sort_by, field) do
        Keyword.put(sort_by, field, if(sort_by[field] == :asc, do: :desc, else: :asc))
        |> Enum.map(fn {key, val} -> "#{key}|#{val}" end)
      else
        ["#{field}|asc"]
      end

    Map.put(params, "sort_by", sort_by_param)
    |> Map.delete("page")
  end

  def sortable_field(socket, route, field, label, params, sort_by) do
    class =
      "is-sortable " <>
        case sort_by[field] do
          :asc -> "is-ascending"
          :desc -> "is-descending"
          _ -> ""
        end

    ~E"""
    <%= live_patch label, to: Routes.live_path(socket, route, sort_by_params(params, sort_by, field)), class: class %>
    """
  end

  def update_params(params, field, value) do
    Map.put(params, field, value)
  end

  def toggle_field(socket, route, params, field, value, class, do: yield) do
    class = class <> if params[field] == value, do: " is-active", else: ""

    params =
      if params[field] != value,
        do: update_params(params, field, value),
        else: Map.delete(params, field)

    live_patch to: Routes.live_path(socket, route, params), class: class do
      yield
    end
  end

  defp render_workflow(workflow, column, row) do
    status = Atom.to_string(workflow.status)

    ~E"""
    <a class="is-<%=status%>" style="grid-column: <%=column%>; grid-row: <%=row%>" data-tooltip="<%=workflow.name%>"><i class="far fa-dot-circle"></i></a>
    """
  end

  defp render_workflow_tree(workflow, column \\ 1, current_row \\ 1) do
    [
      render_workflow(workflow, column, current_row)
      | workflow.children
        |> Enum.with_index()
        |> Enum.map(fn {workflow, row} ->
          render_workflow_tree(workflow, column + 1, row)
        end)
    ]
  end

  def workflow_statuses(job) do
    # Enum.filter(&(&1.parent_id != nil)) |> Enum.group_by(&(&1.parent_id)) 
    tree =
      job.workflows
      |> Enum.sort(&(&1.id >= &2.id))
      |> Enum.reduce(%{}, fn foo, map ->
        foo = Map.put(foo, :children, Map.get(map, foo.id, []))
        Map.update(map, foo.parent_id, [foo], fn foos -> [foo | foos] end)
      end)
      |> Map.get(nil)
      |> hd

    render_workflow_tree(tree)
  end

  def render_patched_content({:added, content}) do
    ~E"""
        <pre><code><%=Jason.encode!(content, pretty: true) %></code></pre>
    """
  end

  def render_patched_content({:changed, content}) do
    Enum.map(content, fn {field, update} ->
      html =
        case update do
          {:changed, updates} ->
            {_, old_value, new_value} = updates
            content = if old_value, do: old_value, else: "null"

            ~E"""
            <span class="tag"><strong><%=field%></strong></span><span class="tag is-light is-danger"><%=content %></span>&nbsp;<small class="fa fa-long-arrow-alt-right"></small>&nbsp;<span class="tag is-success"><%=new_value%></span>
            """

          {:changed_in_list, updates} ->
            {_, old_value, new_value} = updates

            ~E"""
            <span class="tag"><strong><%=field%></strong></span><span class="tag is-light is-danger"><%=old_value%></span>&nbsp;<small class="fa fa-long-arrow-alt-right"></small>&nbsp;<span class="tag is-success"><%=new_value%></span>
            """

          {:added, updates} ->
            {_, new_value} = updates

            ~E"""
            <span class="tag"><strong><%=field%></strong></span><small class="fa fa-long-arrow-alt-right"></small>&nbsp;<span class="tag is-success"><%=new_value%></span>
            """

          {:removed, updates} ->
            {_, old_value} = updates

            ~E"""
            <span class="tag"><strong><%=field%></strong></span><span class="tag is-light is-danger"><%=old_value%></span>
            """
        end

      String.trim(safe_to_string(html))
    end)
    |> Enum.join("<br/>")
    |> raw
  end

  def render_version(version) do
    render_patched_content(version.patch.content)
  end
end
