Rails.application.routes.draw do
  devise_for :users, :controllers => { :omniauth_callbacks => "callbacks" }

  resources :leagues


  resources :users do
    resources :leagues
  end

  resources :leagues, shallow: true do
    resources :teams
    resources :trades
  end

  resources :teams, shallow: true do
    resources :players

    member do
      post 'import'
    end
  end

  get 'home/index'
  root 'home#index'
end
