defmodule MdbTest do
  use ExUnit.Case
  doctest Mdb

  test "greets the world" do
    assert Mdb.hello() == :world
  end
end
