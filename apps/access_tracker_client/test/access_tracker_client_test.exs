defmodule AccessTrackerClientTest do
  use ExUnit.Case
  doctest AccessTrackerClient

  test "greets the world" do
    assert AccessTrackerClient.hello() == :world
  end
end
