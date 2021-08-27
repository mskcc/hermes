defmodule JiraClientTest do
  use ExUnit.Case
  doctest JiraClient

  test "search tickets " do
    response = JiraClient.search_tickets("08944_B", 50)
    IO.inspect response
  end

end
