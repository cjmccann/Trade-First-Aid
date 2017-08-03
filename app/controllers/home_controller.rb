class HomeController < ApplicationController
  def index
    @leagues = current_user.leagues
  end
end
