Rails.application.routes.draw do
  root "compiler#index"
  post "compile", to: "compiler#compile"
  post "share", to: "compiler#share"
  get "s/:slug", to: "compiler#shared"
  get "hello_world", to: "compiler#hello_world"
end
