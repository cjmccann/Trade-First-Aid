class UsersController < ApplicationController
  def index
  end

  def user_params
    params.require(:user).permit(:username)
  end
end
