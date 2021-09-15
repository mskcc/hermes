defmodule VoyagerWeb.DashboardLive do
  use VoyagerWeb, :live_view
  alias Domain.Accounts

  @samples_completed 40
  @samples_completed_assay_breakdown %{
    impact: 20,
    hemepact: 10,
    customcapture: 10
  }
  @samples_completed_t_or_n_breakdown %{
    normal: 25,
    tumor: 15
  }
  @samples_connected_to_clinical 30
  @samples_in_process 20
  @samples_process_assay_breakdown %{
    impact: 20,
    hemepact: 10,
    customcapture: 10
  }

  @impl true
  def mount(_params, %{"user_token" => user_token}, socket) do
    {:ok, user} = Accounts.get_user_by_access_token(user_token)

    {:ok,
     socket
     |> assign(
       user: user.email,
       user_token: user_token,
       samples_completed: @samples_completed,
       samples_completed_assay_breakdown: @samples_completed_assay_breakdown,
       samples_completed_t_or_n_breakdown: @samples_completed_t_or_n_breakdown,
       samples_connected_to_clinical: @samples_connected_to_clinical,
       samples_in_process: @samples_in_process,
       samples_process_assay_breakdown: @samples_process_assay_breakdown
     )}
  end
end
