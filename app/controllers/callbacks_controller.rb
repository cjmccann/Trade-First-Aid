class CallbacksController < Devise::OmniauthCallbacksController
  def yahoo
    @user = User.from_omniauth(request.env["omniauth.auth"])

    sign_in @user
    set_flash_message(:notice, :success, :kind => "Yahoo") if is_navigational_format?

    @after_sign_in_url = after_sign_in_path_for(@user)
    render 'callbacks/yahoo', :layout => false
  end
end
