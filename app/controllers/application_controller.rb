class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :authenticate_user!

  before_action -> { flash.now[:warning] = flash[:warning].html_safe if flash[:html_safe] && flash[:warning] }
end
