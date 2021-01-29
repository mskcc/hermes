defmodule Mdb.Server do
  use Gnat.Server

  def request(%{body: _body}) do
    IO.inspect("Test")
    {:reply, "hi"}
  end

  def error(%{gnat: gnat, reply_to: reply_to}, _error) do
    IO.inspect("Error")
    Gnat.pub(gnat, reply_to, "Something went wrong and I can't handle your request")
  end
end
