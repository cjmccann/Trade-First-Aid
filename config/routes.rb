Rails.application.routes.draw do
  devise_for :users, :controllers => { :omniauth_callbacks => "callbacks" }

  resources :leagues


  resources :users do
    resources :leagues
  end

  get 'trades/demo' => 'trades#demo'

  resources :leagues, shallow: true do
    resources :teams
    resources :trades

    member do
      post 'import'
    end
  end

  resources :teams, shallow: true do
    resources :players
  end

  #match 'trades/demo' => 'trades#demo', :via => :get

  get 'home/index'
  root 'home#index'
end
