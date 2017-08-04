class HomeController < ApplicationController
  def index
    binding.pry
    @leagues = current_user.leagues
  end
end
