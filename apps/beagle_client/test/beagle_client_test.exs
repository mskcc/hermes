defmodule BeagleClientTest do
  use ExUnit.Case
  doctest BeagleClient
  import Tesla.Mock
  setup do
    mock(fn
      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body: []
        }
    end)
  end
end
