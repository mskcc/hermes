defmodule VoyagerWeb.FaqController do
  use VoyagerWeb, :controller

  alias Domain.Accounts
  alias Voyager.UserAuth

  def new(conn, _params) do
    render(conn, "faq.html")
  end
end
