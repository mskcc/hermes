defmodule VoyagerWeb.MetadataLive do
	use VoyagerWeb, :live_view

	@impl true
	def mount(_params, _session, socket) do
		{:ok, assign(socket, user: "Nikhil")}
	end

	@impl true
	def handle_event("keydown", %{"key" => key}, socket) do
		IO.inspect key
		IO.puts "hello"
		{:noreply, assign(socket, user: key)}
	end
@impl true
def handle_event("inc_temperature", _value, socket) do
	IO.puts "hello2"
	{:noreply, assign(socket, user: "Hello")}
end

end