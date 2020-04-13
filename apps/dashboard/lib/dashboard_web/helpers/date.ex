defmodule DashboardWeb.Helpers.Date do
  def relative_to_now(date) do
    case Timex.format(date, "{relative}", :relative) do
      {:ok, prettied} -> prettied
      _ -> date
    end
  end
end
