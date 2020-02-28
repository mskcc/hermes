defmodule BeagleClientTest do
  use ExUnit.Case
  doctest BeagleClient

  test "greets the world" do
    assert BeagleClient.hello() == :world
  end
end
