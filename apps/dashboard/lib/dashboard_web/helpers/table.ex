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
end
