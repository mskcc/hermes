defmodule DashboardWeb.Helpers.Input do
  import Phoenix.HTML

  def label(form, field, opts \\ []) do
    Phoenix.HTML.Tag.content_tag :div, class: "label" do
      Phoenix.HTML.Form.label(form, field, opts)
    end
  end

  def input(form, field, opts \\ []) do
    type = opts[:using] || Phoenix.HTML.Form.input_type(form, field)
    class = opts[:class] || ""
    class = class <> if form.errors[field], do: " is-danger input", else: " input"
    input_opts = Keyword.put(opts, :class, class)

    Phoenix.HTML.Tag.content_tag :div, class: "field" do
      label = if opts[:hide_label], do: "", else: label(form, field)
      input = input(type, form, field, input_opts)
      error = DashboardWeb.ErrorHelpers.error_tag(form, field)
      [label, input, error || ""]
    end
  end

  def checkbox(form, field, opts \\ []) do
    class = opts[:class] || ""
    class = class <> " switch"
    input_opts = Keyword.put(opts, :class, class)

    label = Phoenix.HTML.Form.label(form, field, opts[:label])

    Phoenix.HTML.Tag.content_tag :div, class: "field" do
      Phoenix.HTML.Tag.content_tag :div, class: "control" do
        [Phoenix.HTML.Form.checkbox(form, field, input_opts), label]
      end
    end
  end

  def textarea(form, field, opts \\ []) do
    class = opts[:class] || ""
    class = class <> if form.errors[field], do: " is-danger textarea", else: " textarea"
    input_opts = Keyword.put(opts, :class, class)

    Phoenix.HTML.Tag.content_tag :div, class: "field" do
      label = label(form, field)
      error = DashboardWeb.ErrorHelpers.error_tag(form, field)
      [label, Phoenix.HTML.Form.textarea(form, field, input_opts), error || ""]
    end
  end

  def select(form, field, options \\ [], opts \\ []) do
    {can_add, opts} = Keyword.pop(opts, :add)

    IO.inspect(field)
    Phoenix.HTML.Tag.content_tag :div, class: "field" do
      error = DashboardWeb.ErrorHelpers.error_tag(form, field)
      control_class = if form.errors[field], do: "control is-danger", else: "control"
      modal = ""
        
      field_class = "field" <> if can_add, do: " has-addons", else: ""
      [
        label(form, field),
        Phoenix.HTML.Tag.content_tag :div, class: field_class do
          [
            Phoenix.HTML.Tag.content_tag :div, class: control_class do
              Phoenix.HTML.Tag.content_tag :div, Phoenix.HTML.Form.select(form, field, options, opts), class: "select"
            end,
            (if can_add, do: addon_button([data_modal_id: Atom.to_string(field) <> "-modal"]), else: ""),
            (if can_add, do: modal, else: ""),
          ]
        end,
        error || "",
      ]
    end
  end

  defp addon_button(opts \\ []) do
    opts = Keyword.put(opts, :class, "control")
    Phoenix.HTML.Tag.content_tag :div, opts do
      Phoenix.HTML.Tag.content_tag :div, class: "button is-info" do
        icon("fa-plus")
      end
    end
  end

  def submit(block_option) do
    input_opts = [class: "button is-primary"]
    Phoenix.HTML.Form.submit(block_option, input_opts)
  end

  defp icon(icon_class), do: Phoenix.HTML.Tag.content_tag :i, "", class: "fas " <> icon_class

  defp input_icon(icon_class) do
    Phoenix.HTML.Tag.content_tag :span, icon(icon_class), class: "icon is-small is-left"
  end

  defp input(type, form, field, input_opts) do
    {icon_class, input_opts} = Keyword.pop(input_opts, :icon)
    if icon_class do
      Phoenix.HTML.Tag.content_tag :p, class: "control has-icons-left" do
        [apply(Phoenix.HTML.Form, type, [form, field, input_opts]), input_icon(icon_class)]
      end
    else
      apply(Phoenix.HTML.Form, type, [form, field, input_opts])
    end
  end
end
