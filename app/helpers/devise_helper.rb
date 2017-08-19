module DeviseHelper
  def devise_error_messages!
    return '' if resource.errors.empty?

    messages = resource.errors.full_messages.map { |msg| content_tag(:li, msg) }.join
    sentence = I18n.t('error.messages.not_saved',
                      count: resource.errors.count,
                      resource: resource.class.model_name.human.downcase)

    html = <<-HTML
    <div class="alert alert-error alert-block">
      <button type="button" class="cllose" data-dismiss="alert">X</button>
      <h4>#{sentence}</h4>
      #{messages}
    </div>
    HTML

    html.html_safe
  end
end
