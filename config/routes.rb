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
      get 'sync'
    end
  end

  resources :teams, shallow: true do
    resources :players
  end

  #match 'trades/demo' => 'trades#demo', :via => :get

  get 'home/index'
  root 'home#index'

  get "/pages/*id" => 'pages#show', as: :page, format: false

  # if routing the root path, update for your controller
  root to: 'pages#show', id: 'home'
end
