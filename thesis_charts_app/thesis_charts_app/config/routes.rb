Rails.application.routes.draw do

  root 'application#index'

  get 'barchart' => 'application#barchart'
  get 'boxchart' => 'application#boxchart'
  get 'improvedboxchart' => 'application#improvedboxchart'
  get 'eidchart' => 'application#eidchart'

  post 'answers' => 'answers#record'

end
