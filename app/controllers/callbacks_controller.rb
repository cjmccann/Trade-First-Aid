class CallbacksController < Devise::OmniauthCallbacksController
  def yahoo
    @user = User.from_omniauth(request.env["omniauth.auth"])
    @user.initialize_leagues

    sign_in_and_redirect @user
    set_flash_message(:notice, :success, :kind => "Yahoo") if is_navigational_format?
  end
end
