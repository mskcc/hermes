defmodule DashboardWeb.Helpers.Table do
  import Phoenix.HTML
  import Phoenix.LiveView.Helpers
  alias DashboardWeb.Router.Helpers, as: Routes

  defp is_ascending?(sort_by, field) do
    (sort_by[field] || :asc) == :asc
  end

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

  defp render_workflow(workflow, column, row) do
    status = Atom.to_string(workflow.status)
    ~E"""
    <a class="is-<%=workflow.status%>" style="grid-column: <%=column%>; grid-row: <%=row%>" data-tooltip="<%=workflow.name%>"><i class="far fa-dot-circle"></i></a>
    """
  end

  defp render_workflow_tree(workflow, column \\ 1, current_row \\ 1) do
    workflow.children
    |> Enum.with_index
    |> Enum.map(fn {workflow, row} ->
      [render_workflow(workflow, column, current_row + row) | render_workflow_tree(workflow, column + 1, row)]
    end)
  end

  def workflow_statuses(jobs) do
    tree =
      List.last(jobs).workflows
      |> Enum.reverse
      |> Enum.reduce(%{}, fn foo, map ->
        foo = Map.put(foo, :children, Map.get(map, foo.id, []))
        Map.update(map, foo.parent_id, [foo], fn foos -> [foo | foos] end)
      end)
      |> Map.get(nil)
      |> hd

    render_workflow_tree(tree)
  end
end
