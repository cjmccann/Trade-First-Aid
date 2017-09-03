class PagesController < ApplicationController
  include HighVoltage::StaticPage

  skip_before_action :authenticate_user!
  layout :layout_for_page

  def about
    binding.pry
  end

  private
  
  def layout_for_page
    case params[:id]
    when 'home'
      'home'
    else
      'application'
    end
  end
end
