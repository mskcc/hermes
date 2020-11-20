defmodule VoyagerWeb.LoginLive do
	use VoyagerWeb, :live_view
	alias Domain.Accounts
	alias Dashboard.UserAuth

	@impl true
	def mount(_params, _session, socket) do
		{:ok, assign(socket, login_error: nil)}
	end

	@impl true
	def handle_event("login", %{"username" => username, "password" => password}, socket) do
		case Accounts.get_user_by_email_and_password(username, password) do
			{:ok, data} -> UserAuth.log_in_user(conn, data.access_token)
			{:error, message} -> {:ok, assign(socket, login_error: message)}
		end
	end

end