defmodule DashboardWeb.SampleLive.New do
  use Phoenix.LiveView

  alias Dashboard.Projects
  alias Dashboard.Projects.Sample
  alias DashboardWeb.SampleView
  alias ModalWeb.Router.Helpers, as: Routes

  def mount(_session, socket) do
    {:ok, assign(socket, changeset: Projects.change_sample(%Sample{}))}
  end

  def render(assigns) do
    Phoenix.View.render(SampleView, "new.html", assigns)
  end

  """
  def handle_event("validate", %{"sample" => params}, socket) do
    IO.inspect(params)
    changeset =
      %Sample{}
      |> Projects.change_sample()
      |> Map.put(:action, :insert)

    {:noreply, assign(socket, changeset: changeset)}
  end
  """

  def handle_event("save", %{"sample" => sample_params}, socket) do
    case Projects.create_sample(sample_params) do
      {:ok, _user} ->
        {:stop, ""}

      # {:stop, redirect(socket, to: Routes.live_path(socket, ModalWeb.UserLive.Index))}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign(socket, changeset: changeset)}
    end
  end
end
