defmodule LimsClientTest do
  use ExUnit.Case
  doctest LimsClient

  test "greets the world" do
    assert LimsClient.hello() == :world
  end
end
